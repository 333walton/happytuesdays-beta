// api/feeds.js - Vercel Serverless Function
import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "media:content", { keepArray: true }],
      ["media:thumbnail", "media:thumbnail"],
      ["dc:creator", "creator"],
      ["author", "author"],
      ["description", "description"],
      ["content:encoded", "content"],
    ],
  },
});
// RSS feed URLs organized by category (expanded based on your app's needs)
const RSS_FEEDS = {
  tech: {
    "ai-machine-learning": [
      "https://openai.com/news/rss/",
      "https://cloud.google.com/blog/products/ai-machine-learning/rss/",
      "https://news.mit.edu/topic/artificial-intelligence2/rss.xml",
      "https://machinelearningmastery.com/feed/",
      "https://www.marktechpost.com/feed/",
      "https://hnrss.org/newest?q=AI+OR+machine+learning",
    ],
    "martech-adtech": [
      "https://martech.org/feed/",
      "https://adexchanger.com/feed/",
      "https://adtechdaily.com/feed/",
      "https://marketingland.com/feed/",
    ],
    "web-dev-devops": [
      "https://css-tricks.com/feed/",
      "https://www.smashingmagazine.com/feed/",
      "https://dev.to/feed",
      "https://scotch.io/feed",
      "https://web.dev/feed.xml",
    ],
    "cybersecurity-privacy": [
      "https://krebsonsecurity.com/feed/",
      "https://feeds.feedburner.com/TheHackersNews",
      "https://www.darkreading.com/rss.xml",
      "https://www.schneier.com/feed/atom/",
      "https://www.wired.com/feed/category/security/latest/rss",
    ],
    "blockchain-web3": [
      "https://www.coindesk.com/arc/outboundfeeds/rss/",
      "https://decrypt.co/feed",
      "https://www.theblock.co/rss/",
      "https://api.theblockbeats.news/v2/rss/all",
    ],
    "vintage-tech-spotlights": [
      "https://tedium.co/feed/",
      "https://paleotronic.com/feed/",
      "https://www.theregister.com/headlines.atom",
    ],
  },
  builder: {
    "founder-stories": [
      "https://review.firstround.com/rss/",
      "https://blog.ycombinator.com/feed/",
      "https://steveblank.com/feed/",
      "https://techcrunch.com/category/startups/feed/",
      "https://www.indiehackers.com/feed.xml",
    ],
    "productivity-hacks": [
      "https://lifehacker.com/rss",
      "https://gettingthingsdone.com/feed/",
      "https://zenhabits.net/feed/",
      "https://jamesclear.com/feed",
    ],
    "automation-no-code": [
      "https://zapier.com/blog/feeds/latest/",
      "https://nocodedevs.com/feed/",
      "https://bubble.io/blog/rss",
      "https://www.makerpad.co/feed",
    ],
    "funding-monetization": [
      "https://bothsidesofthetable.com/feed",
      "https://feld.com/feed",
      "https://avc.com/feed/",
      "https://saastr.com/feed/",
    ],
    "project-management": [
      "https://blog.asana.com/feed/",
      "https://blog.trello.com/rss",
      "https://monday.com/blog/feed/",
    ],
    "stoic-mindset": [
      "https://dailystoic.com/feed/",
      "https://modernstoicism.com/feed/",
      "https://www.artofmanliness.com/feed/",
    ],
  },
  art: {
    "generative-ai-art": [
      "https://ml-art.co/feed",
      "https://aiartists.org/feed",
      "https://www.creativebloq.com/feeds/tag/ai-art",
    ],
    "pixel-retro-art": [
      "https://retronator.com/feed/",
      "https://indieretronews.com/feeds/posts/default?alt=rss",
      "https://pixelartacademy.com/feed/",
    ],
    "ui-ux-trends": [
      "https://www.smashingmagazine.com/feed/",
      "https://uxplanet.org/feed",
      "https://alistapart.com/main/feed",
      "https://uxbooth.com/feed/",
    ],
    "color-typography": [
      "https://www.typewolf.com/feed/",
      "https://colorhunt.co/feed/",
      "https://blog.adobe.com/en/publish/creative-cloud.xml",
    ],
    "animation-motion": [
      "https://motionographer.com/feed/",
      "https://www.animatedreview.com/feed/",
      "https://greensock.com/blog/feed",
    ],
    "tutorials-walkthroughs": [
      "https://tympanus.net/codrops/feed/",
      "https://webdesign.tutsplus.com/posts.atom",
      "https://designmodo.com/feed/",
    ],
  },
  gaming: {
    "retro-game-news": [
      "https://www.timeextension.com/feed/",
      "https://indieretronews.com/feeds/posts/default?alt=rss",
      "https://retrododo.com/feed/",
      "https://www.retrogamer.net/feed/",
    ],
    "emulation-modding": [
      "https://retropie.org.uk/feed/",
      "https://www.youtube.com/feeds/videos.xml?channel_id=UC_0CVCfC_3iuHqmyClu59Uw",
      "https://emulation.gametechwiki.com/index.php?title=Special:RecentChanges&feed=rss",
    ],
    "collecting-hardware": [
      "https://www.racketboy.com/feed/",
      "https://consolevariations.com/feed/",
      "https://retrogamecollecting.com/feed/",
    ],
    "speedruns-events": [
      "https://www.speedrun.com/api/v1/posts.rss",
      "https://gamesdonequick.com/feeds/blog",
      "https://tasvideos.org/feed/publications",
    ],
    "indie-retro-releases": [
      "https://itch.io/games/tag-retro.xml",
      "https://indieretronews.com/feeds/posts/default?alt=rss",
      "https://warpdoor.com/feed/",
    ],
    "dos-game-deep-dives": [
      "https://dos.itch.io/feed/new.xml",
      "https://dosgamer.com/feed/",
      "https://www.dosgamesarchive.com/feed/",
    ],
  },
};

// Helpers for category/subcategory resolution

const getFeedsForCategory = (category) => {
  const categoryFeeds = RSS_FEEDS[category];
  if (!categoryFeeds) return [];
  return Object.values(categoryFeeds).flat();
};

const getFeedsForSubcategory = (category, subcategory) => {
  const categoryFeeds = RSS_FEEDS[category];
  if (!categoryFeeds) return [];
  return categoryFeeds[subcategory] || [];
};

const getFeedDisplayName = (url) => {
  // Optionally, use a map here for pretty source names
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "Unknown Source";
  }
};

const parseFeedItem = (item, source) => {
  let thumbnail = null;
  if (item["media:thumbnail"]) {
    thumbnail = item["media:thumbnail"].$
      ? item["media:thumbnail"].$.url
      : item["media:thumbnail"];
  }

  // clean description
  let description =
    item.contentSnippet || item.description || item.summary || "";
  description = description.replace(/<[^>]*>/g, "").trim();
  if (description.length > 200) {
    description = description.substring(0, 197) + "...";
  }

  const pubDate =
    item.pubDate || item.isoDate || item.published || new Date().toISOString();

  return {
    title: item.title || "Untitled",
    link: item.link || item.guid || "#",
    description,
    thumbnail,
    source: getFeedDisplayName(source),
    sourceUrl: source,
    creator: item.creator || item.author || getFeedDisplayName(source),
    guid: item.guid || item.link || `${source}-${pubDate}`,
    pubDate,
    time: new Date(pubDate).toLocaleString(),
  };
};

// Fetch a single RSS feed with timeout and error handling
const fetchSingleFeed = async (url, timeout = 8000) => {
  return new Promise(async (resolve) => {
    const timer = setTimeout(() => resolve([]), timeout);
    try {
      const feed = await parser.parseURL(url);
      clearTimeout(timer);
      resolve(feed.items.map((item) => parseFeedItem(item, url)));
    } catch (error) {
      clearTimeout(timer);
      console.error(`Error fetching feed ${url}:`, error.message);
      resolve([]);
    }
  });
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // OPTIONS for preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { category, subcategory } = req.body;

  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }

  // Get feeds for category and subcategory
  const feedUrls = subcategory
    ? getFeedsForSubcategory(category, subcategory)
    : getFeedsForCategory(category);

  if (!feedUrls || feedUrls.length === 0) {
    return res
      .status(200)
      .json({ items: [], message: "No feeds found for this category" });
  }

  // Fetch feeds in parallel
  const feedPromises = feedUrls.map((url) => fetchSingleFeed(url));
  const feedResults = await Promise.all(feedPromises);

  // Flatten and deduplicate
  let allItems = feedResults.flat();

  // Deduplicate by GUID/link
  const seen = new Set();
  allItems = allItems.filter((item) => {
    const key = item.guid || item.link;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by date (newest first)
  allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Limit to 20
  const finalItems = allItems.slice(0, 20);

  // Return in unified JSON
  return res.status(200).json({
    items: finalItems,
    count: finalItems.length,
    category,
    subcategory,
    timestamp: new Date().toISOString(),
    success: true,
  });
}
