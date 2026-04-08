import getClient from "@/libs/anthropic";

/**
 * Score a podcast for FutureCast guest fit using Claude
 * @param {Object} podcast - Podcast data
 * @param {string} podcast.name - Host/artist name
 * @param {string} podcast.podcastName - Podcast title
 * @param {string} podcast.description - Podcast description
 * @param {string[]} podcast.genres - Genre list
 * @returns {Promise<{ score: number, reason: string }>}
 */
export async function scorePodcast({ name, podcastName, description, genres }) {
  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `You are scoring podcast hosts as potential guests for FutureCast.fm — a podcast about long conversations on how we navigate being human in a world that's accelerating. We want guests who are optimistic, liberal-leaning, future-focused, and talk about interesting/unconventional topics.

Score this podcast host from 0-100 based on how interesting a conversation they'd bring to FutureCast:

Host: ${name}
Podcast: ${podcastName}
Genres: ${genres.join(", ")}
Description: ${description?.slice(0, 1000) || "No description available"}

Respond in exactly this JSON format, nothing else:
{"score": <number 0-100>, "reason": "<one sentence explaining the score>"}`,
      },
    ],
  });

  const text = message.content[0].text.trim();

  try {
    const parsed = JSON.parse(text);
    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      reason: parsed.reason || "",
    };
  } catch {
    return { score: 0, reason: "Failed to parse AI response" };
  }
}
