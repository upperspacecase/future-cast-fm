import { NextResponse } from "next/server";
import { verifyAdmin } from "@/libs/firebaseAdmin";
import connectMongo from "@/libs/mongoose";
import Episode from "@/models/Episode";

// GET: Fetch all episodes
export async function GET(req) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectMongo();

    const episodes = await Episode.find().sort({ createdAt: -1 });

    const counts = {
      planned: 0,
      scheduled: 0,
      recorded: 0,
      edited: 0,
      published: 0,
    };
    for (const ep of episodes) {
      counts[ep.status]++;
    }

    return NextResponse.json({
      episodes,
      counts,
      total: episodes.length,
    });
  } catch (error) {
    console.error("Episodes fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch episodes" },
      { status: 500 }
    );
  }
}

// POST: Create episode
export async function POST(req) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.guestName) {
      return NextResponse.json(
        { error: "Guest name is required" },
        { status: 400 }
      );
    }

    await connectMongo();

    const episode = await Episode.create(body);

    return NextResponse.json({ success: true, episode });
  } catch (error) {
    console.error("Episode create error:", error);
    return NextResponse.json(
      { error: "Failed to create episode" },
      { status: 500 }
    );
  }
}

// PATCH: Update episode status
export async function PATCH(req) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { episodeId, status, title, notes } = await req.json();

    if (!episodeId) {
      return NextResponse.json(
        { error: "Episode ID required" },
        { status: 400 }
      );
    }

    await connectMongo();

    const update = {};
    if (status) update.status = status;
    if (title !== undefined) update.title = title;
    if (notes !== undefined) update.notes = notes;
    if (status === "published") update.publishedDate = new Date();

    const episode = await Episode.findByIdAndUpdate(episodeId, update, {
      new: true,
    });

    if (!episode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, episode });
  } catch (error) {
    console.error("Episode update error:", error);
    return NextResponse.json(
      { error: "Failed to update episode" },
      { status: 500 }
    );
  }
}
