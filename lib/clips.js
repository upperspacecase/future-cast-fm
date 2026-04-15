import connectMongo from "@/libs/mongoose";
import Clip from "@/models/Clip";

function normalizeEpisodeNumber(n) {
  if (n === null || n === undefined) return null;
  return String(n).padStart(4, "0");
}

export async function getClipsGroupedByEpisode() {
  try {
    await connectMongo();
    const clips = await Clip.find().sort({ episodeNumber: 1, createdAt: 1 }).lean();
    const byEpisode = {};
    for (const clip of clips) {
      const key = normalizeEpisodeNumber(clip.episodeNumber);
      if (!byEpisode[key]) byEpisode[key] = [];
      byEpisode[key].push({
        id: String(clip._id),
        topic: clip.topic,
        url: clip.publicUrl,
      });
    }
    return byEpisode;
  } catch (error) {
    console.error("Error fetching clips:", error);
    return {};
  }
}

export { normalizeEpisodeNumber };
