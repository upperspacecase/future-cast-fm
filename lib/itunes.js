const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";

/**
 * Search Apple Podcasts via iTunes Search API
 * @param {string} query - Search term
 * @param {Object} options - Search options
 * @param {number} options.limit - Max results (default 50, max 200)
 * @param {string} options.genreId - Filter by genre ID
 * @returns {Promise<Array>} Array of podcast results
 */
export async function searchPodcasts(query, { limit = 50, genreId } = {}) {
  const params = new URLSearchParams({
    term: query,
    media: "podcast",
    limit: String(Math.min(limit, 200)),
  });

  if (genreId) {
    params.set("genreId", genreId);
  }

  const response = await fetch(`${ITUNES_SEARCH_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`iTunes API error: ${response.status}`);
  }

  const data = await response.json();

  return data.results.map((result) => ({
    itunesId: result.collectionId || result.trackId,
    name: result.artistName,
    podcastName: result.collectionName || result.trackName,
    feedUrl: result.feedUrl,
    podcastUrl: result.collectionViewUrl,
    artworkUrl: result.artworkUrl600 || result.artworkUrl100,
    genres: result.genres || [],
    episodeCount: result.trackCount,
    releaseDate: result.releaseDate,
  }));
}

/**
 * Fetch an RSS feed and extract host email + podcast metadata
 * @param {string} feedUrl - The RSS feed URL
 * @returns {Promise<Object|null>} Parsed data or null if no email found
 */
export async function fetchAndParseRSS(feedUrl) {
  const response = await fetch(feedUrl, {
    headers: { "User-Agent": "FutureCastFM/1.0" },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    return null;
  }

  const xml = await response.text();

  // Extract email from itunes:owner block
  const ownerBlock = xml.match(
    /<itunes:owner>([\s\S]*?)<\/itunes:owner>/i
  );
  let email = null;
  if (ownerBlock) {
    const emailMatch = ownerBlock[1].match(
      /<itunes:email>([^<]+)<\/itunes:email>/i
    );
    if (emailMatch) {
      email = emailMatch[1].trim().toLowerCase();
    }
  }

  // Fallback to managingEditor
  if (!email) {
    const editorMatch = xml.match(
      /<managingEditor>([^<]+)<\/managingEditor>/i
    );
    if (editorMatch) {
      // managingEditor can be "email@example.com (Name)" or just "email@example.com"
      const raw = editorMatch[1].trim();
      const emailOnly = raw.match(/([^\s(]+@[^\s)]+)/);
      if (emailOnly) {
        email = emailOnly[1].toLowerCase();
      }
    }
  }

  // Skip if no email or if it's a noreply/generic address
  if (!email || isGenericEmail(email)) {
    return null;
  }

  // Extract description
  const description = extractTag(xml, "description") || "";
  const cleanDescription = description.replace(/<[^>]*>/g, "").trim();

  // Extract author name
  const author =
    extractTag(xml, "itunes:author") || extractTag(xml, "author") || "";

  return {
    email,
    description: cleanDescription,
    author: author.trim(),
  };
}

function isGenericEmail(email) {
  const genericPatterns = [
    "noreply",
    "no-reply",
    "donotreply",
    "do-not-reply",
    "support@",
    "info@",
    "hello@",
    "contact@",
    "admin@",
    "help@",
    "feedback@",
  ];
  return genericPatterns.some((pattern) => email.includes(pattern));
}

function extractTag(xml, tagName) {
  // Handle CDATA
  const cdataRegex = new RegExp(
    `<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`,
    "i"
  );
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  // Handle regular content
  const regex = new RegExp(
    `<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`,
    "i"
  );
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

// Common genre IDs for reference
export const GENRE_IDS = {
  technology: "1318",
  business: "1321",
  science: "1533",
  news: "1311",
  education: "1304",
  societyCulture: "1324",
  healthFitness: "1512",
  artsEntertainment: "1301",
};
