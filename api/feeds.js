// api/feeds.js - Vercel Serverless Function
import axios from "axios";

// RSS feed URLs organized by category (expanded based on your app's needs)
const RSS_FEEDS = {
  technology: [
    "https://feeds.feedburner.com/TechCrunch",
    "https://www.wired.com/feed/rss",
    "https://feeds.arstechnica.com/arstechnica/index",
    "https://rss.cnn.com/rss/edition.rss",
  ],
  business: [
    "https://feeds.bloomberg.com/politics/news.rss",
    "https://feeds.reuters.com/reuters/businessNews",
    "https://feeds.bloomberg.com/markets/news.rss",
  ],
  science: [
    "https://feeds.nature.com/nature/rss/current",
    "https://www.sciencedaily.com/rss/all.xml",
    "https://feeds.feedburner.com/oreilly/radar",
  ],
  politics: [
    "https://feeds.reuters.com/Reuters/PoliticsNews",
    "https://rss.politico.com/politics-news.xml",
  ],
  health: [
    "https://rss.cnn.com/rss/edition_health.rss",
    "https://feeds.reuters.com/reuters/health",
  ],
};

// Helper to parse RSS XML and format to match feedAggregator expectations
const parseRSSItem = (item, feedSource = "RSS Feed") => {
  const pubDate =
    item.pubDate?.[0] || item.published?.[0] || new Date().toISOString();
  const parsedDate = new Date(pubDate);

  return {
    title: item.title?.[0] || "",
    link: item.link?.[0] || item.guid?.[0]?._ || "",
    description: item.description?.[0] || item.summary?.[0] || "",
    thumbnail:
      item["media:thumbnail"]?.[0]?.$.url || item.enclosure?.[0]?.$.url || null,
    source: feedSource,
    sourceUrl: item.link?.[0] || "",
    creator: item["dc:creator"]?.[0] || item.author?.[0] || feedSource,
    guid: item.guid?.[0]?._ || item.link?.[0] || Math.random().toString(36),
    pubDate: pubDate,
    time: `${parsedDate.toLocaleDateString()} at ${parsedDate.toLocaleTimeString()}`,
  };
};

// Fetch and parse RSS feed with better error handling
const fetchRSSFeed = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        "User-Agent": "RSS-Aggregator/1.0",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    const xml = response.data;
    const items = [];

    // Extract feed title for source attribution
    const feedTitleMatch = xml.match(
      /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i
    );
    const feedTitle = feedTitleMatch
      ? feedTitleMatch[1] || feedTitleMatch[2]
      : "RSS Feed";

    // Parse RSS items
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 15) {
      const itemXml = match[1];
      const item = {};

      // Extract fields with better regex patterns
      const titleMatch = itemXml.match(
        /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/is
      );
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/i);
      const descMatch = itemXml.match(
        /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/is
      );
      const dateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i);
      const authorMatch = itemXml.match(
        /<dc:creator><!\[CDATA\[(.*?)\]\]><\/dc:creator>|<dc:creator>(.*?)<\/dc:creator>|<author>(.*?)<\/author>/i
      );
      const guidMatch = itemXml.match(/<guid[^>]*>(.*?)<\/guid>/i);
      const thumbnailMatch =
        itemXml.match(/<media:thumbnail[^>]+url="([^"]+)"/i) ||
        itemXml.match(/<enclosure[^>]+url="([^"]+)"/i);

      if (titleMatch) item.title = [titleMatch[1] || titleMatch[2]];
      if (linkMatch) item.link = [linkMatch[1].trim()];
      if (descMatch) item.description = [descMatch[1] || descMatch[2]];
      if (dateMatch) item.pubDate = [dateMatch[1]];
      if (authorMatch)
        item["dc:creator"] = [
          authorMatch[1] || authorMatch[2] || authorMatch[3],
        ];
      if (guidMatch) item.guid = [{ _: guidMatch[1] }];
      if (thumbnailMatch)
        item["media:thumbnail"] = [{ $: { url: thumbnailMatch[1] } }];

      items.push(parseRSSItem(item, feedTitle));
    }

    return items;
  } catch (error) {
    console.error(`Error fetching RSS feed ${url}:`, error.message);
    return [];
  }
};

// Main handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { category, subcategory } = req.body;

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    // Get feeds for the category, with fallback to technology
    const feedUrls = RSS_FEEDS[category.toLowerCase()] || RSS_FEEDS.technology;

    // Fetch all feeds concurrently with a reasonable timeout
    const feedPromises = feedUrls.map((url) => fetchRSSFeed(url));
    const feedResults = await Promise.allSettled(feedPromises);

    // Combine all successful results
    const allItems = [];
    feedResults.forEach((result) => {
      if (result.status === "fulfilled" && result.value.length > 0) {
        allItems.push(...result.value);
      }
    });

    // Sort by date and remove duplicates
    const uniqueItems = [];
    const seen = new Set();

    allItems
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .forEach((item) => {
        const key = item.guid || item.link;
        if (!seen.has(key) && item.title && item.link) {
          seen.add(key);
          uniqueItems.push(item);
        }
      });

    // Limit results to match MAX_ITEMS from feedAggregator
    const limitedItems = uniqueItems.slice(0, 20);

    // Return in the format expected by feedAggregator.js
    return res.status(200).json({
      success: true,
      items: limitedItems,
      category,
      subcategory: subcategory || null,
      timestamp: new Date().toISOString(),
      count: limitedItems.length,
    });
  } catch (error) {
    console.error("Error in feeds API:", error);
    return res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch feeds",
    });
  }
}
