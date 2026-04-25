import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Clip from "@/models/Clip";

export const maxDuration = 30;

const BUFFER_API = "https://api.buffer.com";
const BUFFER_LINKEDIN_CHANNEL_ID = "6554b4887a6cf4d23fe74b91";
const BUFFER_INSTAGRAM_CHANNEL_ID = "69c481d3af47dacb69562a82";

const CREATE_POST_MUTATION = `
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    __typename
    ... on PostActionSuccess {
      post { id dueAt status }
    }
    ... on MutationError { message }
    ... on LimitReachedError { message }
  }
}`;

function renderPostText(clip) {
  const episode = clip.episodeNumber.replace(/^0+/, "") || "0";
  return `${clip.topic}\n\nFutureCast FM — Episode ${episode}. Conversations about the futures we're building.\n\nListen: https://futurecast.fm`;
}

async function createBufferPost(token, variables) {
  const res = await fetch(BUFFER_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: CREATE_POST_MUTATION, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Buffer HTTP ${res.status}: ${text}`);
  }

  const body = await res.json();
  if (body.errors) {
    throw new Error(`Buffer GraphQL errors: ${JSON.stringify(body.errors)}`);
  }

  const result = body.data.createPost;
  if (result.__typename === "LimitReachedError") {
    const err = new Error(result.message);
    err.code = "LIMIT_REACHED";
    throw err;
  }
  if (result.__typename === "MutationError") {
    throw new Error(`Buffer mutation error: ${result.message}`);
  }
  return result.post;
}

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BUFFER_API_TOKEN) {
    return NextResponse.json(
      { error: "BUFFER_API_TOKEN not configured" },
      { status: 500 }
    );
  }

  try {
    await connectMongo();

    const pending = await Clip.countDocuments({ status: "pending" });
    const queued = await Clip.countDocuments({ status: "queued" });
    const posted = await Clip.countDocuments({ status: "posted" });

    const clip = await Clip.findOne({ status: "pending" }).sort({
      createdAt: 1,
    });

    if (!clip) {
      return NextResponse.json({
        success: true,
        action: "skip",
        reason: "No pending clips",
        counts: { pending, queued, posted },
      });
    }

    const token = process.env.BUFFER_API_TOKEN;
    const text = renderPostText(clip);
    const videoAssets = {
      videos: [{ url: clip.publicUrl, metadata: { title: clip.topic } }],
    };

    let linkedinPost;
    try {
      linkedinPost = await createBufferPost(token, {
        input: {
          channelId: BUFFER_LINKEDIN_CHANNEL_ID,
          schedulingType: "automatic",
          mode: "addToQueue",
          text,
          assets: videoAssets,
        },
      });
    } catch (err) {
      if (err.code === "LIMIT_REACHED") {
        return NextResponse.json({
          success: true,
          action: "skip",
          reason: err.message,
          counts: { pending, queued, posted },
        });
      }
      await Clip.updateOne(
        { _id: clip._id },
        {
          $set: {
            status: "failed",
            errorMessage: `LinkedIn: ${err.message}`,
            updatedAt: new Date(),
          },
        }
      );
      return NextResponse.json(
        { error: `LinkedIn failed: ${err.message}` },
        { status: 502 }
      );
    }

    let instagramPost = null;
    let instagramError = null;
    try {
      instagramPost = await createBufferPost(token, {
        input: {
          channelId: BUFFER_INSTAGRAM_CHANNEL_ID,
          schedulingType: "automatic",
          mode: "addToQueue",
          text,
          metadata: {
            instagram: {
              type: "reel",
              shouldShareToFeed: true,
            },
          },
          assets: videoAssets,
        },
      });
    } catch (err) {
      instagramError = err.message;
      console.error(
        `Instagram queue failed for ${clip.r2Key} (LinkedIn already queued): ${err.message}`
      );
    }

    const update = {
      status: "queued",
      bufferPostId: linkedinPost.id,
      scheduledAt: linkedinPost.dueAt,
      updatedAt: new Date(),
    };
    if (instagramPost) {
      update.instagramBufferPostId = instagramPost.id;
      update.instagramScheduledAt = instagramPost.dueAt;
      update.instagramError = null;
    }
    if (instagramError) {
      update.instagramError = instagramError;
    }

    await Clip.updateOne({ _id: clip._id }, { $set: update });

    return NextResponse.json({
      success: true,
      action: "queued",
      clip: clip.r2Key,
      linkedin: { bufferPostId: linkedinPost.id, dueAt: linkedinPost.dueAt },
      instagram: instagramPost
        ? { bufferPostId: instagramPost.id, dueAt: instagramPost.dueAt }
        : { error: instagramError },
      counts: { pending: pending - 1, queued: queued + 1, posted },
    });
  } catch (error) {
    console.error("Queue clip cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
