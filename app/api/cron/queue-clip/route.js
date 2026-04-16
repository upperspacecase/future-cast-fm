import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Clip from "@/models/Clip";

export const maxDuration = 30;

const BUFFER_API = "https://api.buffer.com";
const BUFFER_CHANNEL_ID = "6554b4887a6cf4d23fe74b91";

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

    const variables = {
      input: {
        channelId: BUFFER_CHANNEL_ID,
        schedulingType: "automatic",
        mode: "addToQueue",
        text: renderPostText(clip),
        assets: {
          videos: [
            {
              url: clip.publicUrl,
              metadata: { title: clip.topic },
            },
          ],
        },
      },
    };

    const bufferRes = await fetch(BUFFER_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BUFFER_API_TOKEN}`,
      },
      body: JSON.stringify({
        query: CREATE_POST_MUTATION,
        variables,
      }),
    });

    if (!bufferRes.ok) {
      const text = await bufferRes.text();
      return NextResponse.json(
        { error: `Buffer HTTP ${bufferRes.status}`, body: text },
        { status: 502 }
      );
    }

    const body = await bufferRes.json();

    if (body.errors) {
      return NextResponse.json(
        { error: "Buffer GraphQL errors", details: body.errors },
        { status: 502 }
      );
    }

    const result = body.data.createPost;

    if (result.__typename === "LimitReachedError") {
      return NextResponse.json({
        success: true,
        action: "skip",
        reason: result.message,
        counts: { pending, queued, posted },
      });
    }

    if (result.__typename === "MutationError") {
      return NextResponse.json(
        { error: `Buffer mutation error: ${result.message}` },
        { status: 502 }
      );
    }

    const post = result.post;

    await Clip.updateOne(
      { _id: clip._id },
      {
        $set: {
          status: "queued",
          bufferPostId: post.id,
          scheduledAt: post.dueAt,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      action: "queued",
      clip: clip.r2Key,
      bufferPostId: post.id,
      dueAt: post.dueAt,
      counts: { pending: pending - 1, queued: queued + 1, posted },
    });
  } catch (error) {
    console.error("Queue clip cron error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
