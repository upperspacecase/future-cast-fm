// Fetch and parse podcast RSS feed
export async function getEpisodes() {
    const RSS_URL = "https://api.riverside.fm/hosting/7vRUVyi8.rss";

    try {
        const response = await fetch(RSS_URL, {
            next: { revalidate: 300 } // Revalidate every 5 minutes
        });

        const xml = await response.text();

        // Parse XML to extract episodes
        const episodes = parseRSSFeed(xml);

        return episodes;
    } catch (error) {
        console.error("Error fetching RSS feed:", error);
        return [];
    }
}

function parseRSSFeed(xml) {
    const episodes = [];

    // Match all <item> elements
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];

        const title = extractTag(itemXml, "title");
        const description = extractTag(itemXml, "description") || extractTag(itemXml, "itunes:summary");
        const pubDate = extractTag(itemXml, "pubDate");
        const duration = extractTag(itemXml, "itunes:duration");
        const image = extractAttribute(itemXml, "itunes:image", "href") ||
            extractAttribute(itemXml, "media:content", "url");
        const audioUrl = extractAttribute(itemXml, "enclosure", "url");
        const episodeNumber = extractTag(itemXml, "itunes:episode");

        // Clean description - remove HTML tags
        const cleanDescription = description
            ? description.replace(/<[^>]*>/g, "").trim()
            : "";

        episodes.push({
            title: title || "Untitled Episode",
            description: cleanDescription,
            pubDate: pubDate ? new Date(pubDate) : new Date(),
            duration: duration || "",
            image: image || "/podcast-placeholder.jpg",
            audioUrl: audioUrl || "",
            episodeNumber: episodeNumber || null,
        });
    }

    // Sort by date (newest first)
    episodes.sort((a, b) => b.pubDate - a.pubDate);

    return episodes;
}

function extractTag(xml, tagName) {
    // Handle CDATA
    const cdataRegex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`, "i");
    const cdataMatch = xml.match(cdataRegex);
    if (cdataMatch) return cdataMatch[1].trim();

    // Handle regular content
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
}

function extractAttribute(xml, tagName, attrName) {
    const regex = new RegExp(`<${tagName}[^>]*${attrName}=["']([^"']+)["']`, "i");
    const match = xml.match(regex);
    return match ? match[1] : null;
}

// Get podcast metadata
export async function getPodcastInfo() {
    const RSS_URL = "https://api.riverside.fm/hosting/7vRUVyi8.rss";

    try {
        const response = await fetch(RSS_URL, {
            next: { revalidate: 300 }
        });

        const xml = await response.text();

        const title = extractTag(xml, "title");
        const description = extractTag(xml, "description");
        const author = extractTag(xml, "itunes:author");
        const image = extractAttribute(xml, "itunes:image", "href");

        return {
            title: title || "Future Cast FM",
            description: description?.replace(/<[^>]*>/g, "").trim() || "",
            author: author || "",
            image: image || "/podcast-cover.jpg",
        };
    } catch (error) {
        console.error("Error fetching podcast info:", error);
        return {
            title: "Future Cast FM",
            description: "Conversations about an optimistic future.",
            author: "Tay Pattison",
            image: "/podcast-cover.jpg",
        };
    }
}
