import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Guest from "@/models/Guest";
import { searchPodcasts, fetchAndParseRSS } from "@/lib/itunes";
import { scorePodcast } from "@/lib/scorer";
import { sendEmail } from "@/libs/resend";
import { generateOutreachEmail } from "@/lib/emailTemplate";

// Predefined search queries that match FutureCast's vibe
const SEARCH_QUERIES = [
  "future technology optimism",
  "human potential future",
  "future of humanity",
  "optimistic futurism",
  "technology and society",
  "future thinking innovation",
  "building the future",
  "positive technology impact",
  "human flourishing technology",
  "future of work life",
];

const SCORE_THRESHOLD = 65;
const MAX_SENDS_PER_RUN = 7;
const MAX_DISCOVER_PER_QUERY = 20;

export async function GET(req) {
  // Verify cron secret to prevent unauthorized triggers
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const log = [];

  try {
    await connectMongo();

    // Phase 1: Discover new guests
    // Pick a random query each run to diversify results
    const query =
      SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
    log.push(`Searching: "${query}"`);

    let results;
    try {
      results = await searchPodcasts(query, { limit: MAX_DISCOVER_PER_QUERY });
    } catch (err) {
      log.push(`Search failed: ${err.message}`);
      results = [];
    }

    let discovered = 0;
    let skipped = 0;

    for (const podcast of results) {
      if (!podcast.feedUrl) {
        skipped++;
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
        skipped++;
        continue;
      }

      // Fetch RSS and extract email
      let rssData;
      try {
        rssData = await fetchAndParseRSS(podcast.feedUrl);
      } catch {
        skipped++;
        continue;
      }

      if (!rssData) {
        skipped++;
        continue;
      }

      // Score with Claude
      let scoreResult;
      try {
        scoreResult = await scorePodcast({
          name: rssData.author || podcast.name,
          podcastName: podcast.podcastName,
          description: rssData.description,
          genres: podcast.genres,
        });
      } catch (err) {
        log.push(`Scoring failed for ${podcast.podcastName}: ${err.message}`);
        skipped++;
        continue;
      }

      if (scoreResult.score < SCORE_THRESHOLD) {
        skipped++;
        continue;
      }

      try {
        await Guest.create({
          name: rssData.author || podcast.name,
          email: rssData.email,
          podcastName: podcast.podcastName,
          podcastDescription: rssData.description?.slice(0, 2000),
          podcastUrl: podcast.podcastUrl,
          feedUrl: podcast.feedUrl,
          artworkUrl: podcast.artworkUrl,
          genres: podcast.genres,
          aiScore: scoreResult.score,
          aiReason: scoreResult.reason,
          status: "discovered",
        });
        discovered++;
      } catch (err) {
        // Duplicate email likely
        skipped++;
      }
    }

    log.push(`Discovered: ${discovered}, Skipped: ${skipped}`);

    // Phase 2: Send emails to top unsent guests
    const unsent = await Guest.find({ status: "discovered" })
      .sort({ aiScore: -1 })
      .limit(MAX_SENDS_PER_RUN);

    let sent = 0;
    let sendErrors = 0;

    for (const guest of unsent) {
      try {
        const { html, text } = generateOutreachEmail(guest.id);

        const result = await sendEmail({
          to: guest.email,
          subject: "Want to come on the pod?",
          html,
          text,
          replyTo: "tay@futurecast.fm",
        });

        guest.status = "emailed";
        guest.resendMessageId = result.id;
        guest.emailSentAt = new Date();
        await guest.save();

        sent++;
        log.push(`Sent to: ${guest.name} (${guest.email}) - Score: ${guest.aiScore}`);

        // Small delay between sends to protect domain reputation
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (err) {
        sendErrors++;
        log.push(`Send failed for ${guest.email}: ${err.message}`);
      }
    }

    log.push(`Sent: ${sent}, Send errors: ${sendErrors}`);

    return NextResponse.json({
      success: true,
      query,
      discovered,
      skipped,
      sent,
      sendErrors,
      log,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.push(`Fatal error: ${error.message}`);
    return NextResponse.json(
      { success: false, error: error.message, log },
      { status: 500 }
    );
  }
}
