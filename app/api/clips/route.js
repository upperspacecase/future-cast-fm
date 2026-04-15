import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Clip from "@/models/Clip";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongo();

    const clips = await Clip.find().sort({ episodeNumber: 1, createdAt: 1 });

    const byEpisode = {};
    for (const clip of clips) {
      if (!byEpisode[clip.episodeNumber]) {
        byEpisode[clip.episodeNumber] = [];
      }
      byEpisode[clip.episodeNumber].push({
        id: clip.id,
        topic: clip.topic,
        url: clip.publicUrl,
        status: clip.status,
      });
    }

    return NextResponse.json({ clips: byEpisode });
  } catch (error) {
    console.error("Clips fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch clips" },
      { status: 500 }
    );
  }
}
