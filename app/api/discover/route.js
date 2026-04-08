import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import Guest from "@/models/Guest";
import { searchPodcasts, fetchAndParseRSS } from "@/lib/itunes";
import { scorePodcast } from "@/lib/scorer";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { query, genreId, limit = 50, scoreThreshold = 60 } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Search iTunes
    const results = await searchPodcasts(query, { limit, genreId });

    await connectMongo();

    const discovered = [];
    const skipped = [];

    for (const podcast of results) {
      // Skip if no feed URL
      if (!podcast.feedUrl) {
        skipped.push({ name: podcast.podcastName, reason: "No RSS feed" });
        continue;
      }

      // Skip if already in DB
      const existing = await Guest.findOne({
        $or: [
          { feedUrl: podcast.feedUrl },
          { podcastName: podcast.podcastName },
        ],
      });
      if (existing) {
        skipped.push({ name: podcast.podcastName, reason: "Already in pipeline" });
        continue;
      }

      // Fetch RSS and extract email
      let rssData;
      try {
        rssData = await fetchAndParseRSS(podcast.feedUrl);
      } catch {
        skipped.push({ name: podcast.podcastName, reason: "RSS fetch failed" });
        continue;
      }

      // No email = skip entirely
      if (!rssData) {
        skipped.push({ name: podcast.podcastName, reason: "No email found" });
        continue;
      }

      // Score with Claude
      const { score, reason } = await scorePodcast({
        name: rssData.author || podcast.name,
        podcastName: podcast.podcastName,
        description: rssData.description,
        genres: podcast.genres,
      });

      // Skip low scores
      if (score < scoreThreshold) {
        skipped.push({
          name: podcast.podcastName,
          reason: `Score too low (${score})`,
        });
        continue;
      }

      // Save to DB
      const guest = await Guest.create({
        name: rssData.author || podcast.name,
        email: rssData.email,
        podcastName: podcast.podcastName,
        podcastDescription: rssData.description?.slice(0, 2000),
        podcastUrl: podcast.podcastUrl,
        feedUrl: podcast.feedUrl,
        artworkUrl: podcast.artworkUrl,
        genres: podcast.genres,
        aiScore: score,
        aiReason: reason,
        status: "discovered",
      });

      discovered.push(guest);
    }

    return NextResponse.json({
      discovered: discovered.length,
      skipped: skipped.length,
      guests: discovered,
      skippedDetails: skipped,
    });
  } catch (error) {
    console.error("Discovery error:", error);
    return NextResponse.json(
      { error: "Discovery failed: " + error.message },
      { status: 500 }
    );
  }
}
