import { NextResponse } from "next/server";
import { verifyAdmin } from "@/libs/firebaseAdmin";
import connectMongo from "@/libs/mongoose";
import Episode from "@/models/Episode";

const RSS_URL = "https://api.riverside.fm/hosting/7vRUVyi8.rss";

// POST: Seed episodes from RSS feed — marks all as published
export async function POST(req) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const res = await fetch(RSS_URL);
    const xml = await res.text();

    // Parse episodes from RSS
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const episodes = [];
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];

      const titleMatch = itemXml.match(
        /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i
      );
      const title = titleMatch ? titleMatch[1].trim() : "Untitled";

      const pubDateMatch = itemXml.match(/<pubDate>([^<]+)<\/pubDate>/i);
      const pubDate = pubDateMatch ? new Date(pubDateMatch[1].trim()) : null;

      // Extract guest name from title (format: "FutureCast XXXX - Name: ...")
      let guestName = title;
      const nameMatch = title.match(
        /(?:FutureCast \d+\s*[-—]\s*)?([^:]+?)(?:\s*:\s*|$)/
      );
      if (nameMatch) {
        guestName = nameMatch[1].trim();
        // Remove "FutureCast XXXX - " prefix if still there
        guestName = guestName.replace(/^(?:FutureCast \d+\s*[-—]\s*)/i, "");
      }

      episodes.push({ title, guestName, pubDate });
    }

    await connectMongo();

    let created = 0;
    let skipped = 0;

    for (const ep of episodes) {
      // Skip if already exists by title
      const existing = await Episode.findOne({ title: ep.title });
      if (existing) {
        skipped++;
        continue;
      }

      await Episode.create({
        guestName: ep.guestName,
        title: ep.title,
        status: "published",
        publishedDate: ep.pubDate,
        recordingDate: ep.pubDate,
      });
      created++;
    }

    return NextResponse.json({
      success: true,
      total: episodes.length,
      created,
      skipped,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed episodes: " + error.message },
      { status: 500 }
    );
  }
}
