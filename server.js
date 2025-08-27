// server.js
const express = require("express");
const Parser = require("rss-parser");
const cors = require("cors");
const { formatDistanceToNow } = require("date-fns");

const app = express();
const port = process.env.PORT || 3001;

// Initialize RSS parser with custom fields
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

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// RSS Feed catalog - Lifehacker removed from productivity-hacks
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
  },
  builder: {
    "startup-stories": [
      "https://review.firstround.com/rss/",
      "https://blog.ycombinator.com/feed/",
      "https://steveblank.com/feed/",
      "https://techcrunch.com/category/startups/feed/",
      "https://www.indiehackers.com/feed.xml",
    ],
    "productivity-hacks": [
      // "https://lifehacker.com/rss", // Removed - too many promotional articles
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
    "project-management": [
      "https://blog.asana.com/feed/",
      "https://blog.trello.com/rss",
      "https://monday.com/blog/feed/",
    ],
    "momentum-mindset": [
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
    "retro-gaming": [
      "https://www.timeextension.com/feed/",
      "https://indieretronews.com/feeds/posts/default?alt=rss",
      "https://retrododo.com/feed/",
      "https://www.retrogamer.net/feed/",
    ],
    "guides-tips": [
      "https://retropie.org.uk/feed/",
      "https://www.youtube.com/feeds/videos.xml?channel_id=UC_0CVCfC_3iuHqmyClu59Uw",
      "https://emulation.gametechwiki.com/index.php?title=Special:RecentChanges&feed=rss",
    ],
    "game-collecting": [
      "https://www.racketboy.com/feed/",
      "https://consolevariations.com/feed/",
      "https://retrogamecollecting.com/feed/",
    ],
    "daily-roundup": [
      "https://www.speedrun.com/api/v1/posts.rss",
      "https://gamesdonequick.com/feeds/blog",
      "https://tasvideos.org/feed/publications",
    ],
    "indie-spotlights": [
      "https://itch.io/games/tag-retro.xml",
      "https://indieretronews.com/feeds/posts/default?alt=rss",
      "https://warpdoor.com/feed/",
    ],
  },
};

// Helper functions
const getFeedsForCategory = (category) => {
  const categoryFeeds = RSS_FEEDS[category];
  if (!categoryFeeds) return [];
  return Object.values(categoryFeeds).flat();
};

const getFeedsForSubcategory = (category, subcategory) => {
  const categoryFeeds = RSS_FEEDS[category];
  if (!categoryFeeds) return [];
  const subcategoryFeeds = categoryFeeds[subcategory];
  return subcategoryFeeds || [];
};

const getFeedDisplayName = (url) => {
  const feedNames = {
    "https://openai.com/news/rss/": "OpenAI News",
    "https://cloud.google.com/blog/products/ai-machine-learning/rss/":
      "Google AI Blog",
    "https://news.mit.edu/topic/artificial-intelligence2/rss.xml":
      "MIT AI News",
    "https://machinelearningmastery.com/feed/": "Machine Learning Mastery",
    "https://www.marktechpost.com/feed/": "MarkTechPost",
    "https://hnrss.org/newest?q=AI+OR+machine+learning": "Hacker News AI",
    "https://martech.org/feed/": "MarTech",
    "https://adexchanger.com/feed/": "AdExchanger",
    "https://krebsonsecurity.com/feed/": "Krebs on Security",
    "https://www.coindesk.com/arc/outboundfeeds/rss/": "CoinDesk",
    "https://review.firstround.com/rss/": "First Round Review",
    "https://blog.ycombinator.com/feed/": "Y Combinator Blog",
    "https://lifehacker.com/rss": "Lifehacker",
    "https://zapier.com/blog/feeds/latest/": "Zapier Blog",
    "https://www.smashingmagazine.com/feed/": "Smashing Magazine",
    "https://retronator.com/feed/": "Retronator",
    "https://www.timeextension.com/feed/": "Time Extension",
    "https://indieretronews.com/feeds/posts/default?alt=rss":
      "Indie Retro News",
  };

  try {
    return feedNames[url] || new URL(url).hostname.replace("www.", "");
  } catch {
    return "Unknown Source";
  }
};

// Helper function to detect non-English text
const isLikelyEnglish = (text) => {
  if (!text) return true;

  const nonLatinPattern = /[^\u0000-\u007F\u0080-\u00FF]/g;
  const matches = text.match(nonLatinPattern) || [];

  const nonLatinRatio = matches.length / text.length;
  if (nonLatinRatio > 0.3) return false;

  const nonEnglishScripts = [
    /[\u0600-\u06FF]/, // Arabic
    /[\u4E00-\u9FFF]/, // Chinese
    /[\u3040-\u309F\u30A0-\u30FF]/, // Japanese
    /[\uAC00-\uD7AF]/, // Korean
    /[\u0E00-\u0E7F]/, // Thai
    /[\u0400-\u04FF]/, // Cyrillic
    /[\u0900-\u097F]/, // Devanagari (Hindi)
    /[\u0B80-\u0BFF]/, // Tamil
  ];

  return !nonEnglishScripts.some((pattern) => pattern.test(text));
};

// Detect spam-like titles
const isSpamTitle = (title) => {
  if (!title) return true;

  // Check for excessive special characters
  const specialChars = title.match(/[^\w\s\-.,!?'"]/g) || [];
  const specialRatio = specialChars.length / title.length;
  if (specialRatio > 0.2) return true;

  // Specific spam patterns
  const spamPatterns = [
    /\(╯.*╰\)/, // Emoticon patterns
    /[\u2500-\u257F]/, // Box drawing characters
    /[\u2580-\u259F]/, // Block elements
    /\[.*\].*\[.*\].*\[.*\]/, // Multiple brackets
    /【.*】/, // Asian brackets
    /\uD83D[\uDC00-\uDFFF]/, // Excessive emojis
    /(.)\1{4,}/, // Repeated characters
    /^[A-Z\s]{15,}$/, // ALL CAPS TITLES
    /\bclick\s*here\b/i,
    /\bfree\s*download\b/i,
    /\bmust\s*see\b/i,
    /\bshocking\b/i,
    /\byou\s*won't\s*believe\b/i,
  ];

  return spamPatterns.some((pattern) => pattern.test(title));
};

// Helper function to detect generic icons
const isGenericIcon = (url) => {
  if (!url) return true;

  const genericPatterns = [
    /favicon/i,
    /\.ico$/i,
    /\/ico\//i,
    /apple-touch-icon/i,
    /feed[-_]?icon/i,
    /rss[-_]?icon/i,
    /default[-_]?thumb/i,
    /default[-_]?image/i,
    /placeholder/i,
    /no[-_]?image/i,
    /avatar/i,
    /16x16|32x32|48x48|64x64|72x72|96x96|120x120|128x128|144x144|152x152/i,
    /\/icons?\//i,
    /\/assets\/icons?\//i,
    /\/images\/icons?\//i,
    /\/static\/icons?\//i,
    /logo/i,
    /brand/i,
    /\/site[-_]?assets\//i,
    /profile/i,
    /author[-_]?image/i,
    /og[-_]?image[-_]?default/i,
    /twitter[-_]?card[-_]?default/i,
    /\.gravatar\.com/i,
    /\.wp\.com\/.*\/favicon/i,
    /icon[-_]?\d{2,3}x\d{2,3}/i,
    /touch[-_]?icon/i,
    /ms[-_]?icon/i,
    /shortcut[-_]?icon/i,
  ];

  return genericPatterns.some((pattern) => pattern.test(url));
};

// Strict thumbnail validation - must be real article image
const isRealArticleThumbnail = async (thumbnailUrl, item = {}) => {
  if (!thumbnailUrl) return false;

  // Must be a proper image URL
  const imageExtensions = /\.(jpg|jpeg|png|webp)$/i;
  const hasImageExtension = imageExtensions.test(thumbnailUrl);

  // Check if URL contains image indicators
  const hasImagePath =
    /\/(images?|img|media|content|uploads|photos?|pictures?|graphics?)\//i.test(
      thumbnailUrl
    );

  // Must either have proper extension OR be in an images directory
  if (!hasImageExtension && !hasImagePath) return false;

  // Reject generic/icon images
  if (isGenericIcon(thumbnailUrl)) return false;

  // Reject CDN patterns that typically serve icons
  const iconCDNs = [
    /\.gravatar\.com/i,
    /\.wp\.com\/i\/blank\.jpg/i,
    /placeholder/i,
    /no-image/i,
    /default-thumb/i,
  ];

  if (iconCDNs.some((pattern) => pattern.test(thumbnailUrl))) return false;

  // Check minimum size requirements
  const sizePattern = /(\d{2,4})[x\-_](\d{2,4})/;
  const sizeMatch = thumbnailUrl.match(sizePattern);
  if (sizeMatch) {
    const width = parseInt(sizeMatch[1]);
    const height = parseInt(sizeMatch[2]);
    if (width < 300 || height < 200) return false;
  }

  return true;
};

// Function to extract best thumbnail
const extractBestThumbnail = async (item, source) => {
  let candidates = [];

  if (item["media:thumbnail"]) {
    const url = item["media:thumbnail"].$
      ? item["media:thumbnail"].$.url
      : item["media:thumbnail"];
    if (url) candidates.push(url);
  }

  if (item["media:content"] && Array.isArray(item["media:content"])) {
    item["media:content"].forEach((media) => {
      if (media.$ && media.$.medium === "image" && media.$.url) {
        candidates.push(media.$.url);
      }
    });
  }

  if (item.enclosure && item.enclosure.url && item.enclosure.type) {
    if (item.enclosure.type.startsWith("image/")) {
      candidates.push(item.enclosure.url);
    }
  }

  if (!candidates.length) {
    const content =
      item["content:encoded"] || item.content || item.description || "";
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(content)) !== null) {
      const imgUrl = imgMatch[1];
      if (
        !isGenericIcon(imgUrl) &&
        !imgUrl.includes("emoji") &&
        !imgUrl.includes("smilie")
      ) {
        candidates.push(imgUrl);
      }
    }
  }

  for (const url of candidates) {
    if (await isRealArticleThumbnail(url, item)) {
      return url;
    }
  }

  return null;
};

// Helper function to clean descriptions
const cleanDescription = (rawDescription, title = "") => {
  if (!rawDescription) return "";

  let cleaned = rawDescription.replace(/<[^>]*>/g, " ");

  cleaned = cleaned
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, " ");

  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, "");
  cleaned = cleaned.replace(/[\w.-]+@[\w.-]+\.\w+/g, "");
  cleaned = cleaned.replace(/@[\w]+/g, "");
  cleaned = cleaned.replace(/#[\w]+/g, "");

  const sentences = cleaned.split(/[.!?]+/).filter((sentence) => {
    const lower = sentence.toLowerCase().trim();

    if (lower.length < 20) return false;

    const skipPatterns = [
      // Promotional/Sales content
      /\$\d+/,
      /\d+\s*%\s*off/i,
      /sale/i,
      /deal/i,
      /discount/i,
      /coupon/i,
      /promo/i,
      /save\s+\$/i,
      /lowest price/i,
      /best price/i,
      /black friday/i,
      /cyber monday/i,
      /labor day/i,
      /holiday sale/i,
      /limited time/i,
      /act now/i,
      /don't miss/i,
      /expires/i,
      /free shipping/i,
      /special offer/i,

      // Meta content
      /^(the )?post .* appeared/i,
      /^read more/i,
      /^continue reading/i,
      /^click here/i,
      /^source:/i,
      /originally published/i,
      /subscribe/i,
      /newsletter/i,
      /sign up/i,
      /follow us/i,
      /share this/i,
      /comments? (on|off|closed)/i,

      // Time-sensitive
      /^today only/i,
      /^this week/i,
      /^last chance/i,
      /ends soon/i,
    ];

    return !skipPatterns.some((pattern) => pattern.test(lower));
  });

  let description = sentences.slice(0, 3).join(". ").trim();

  // Final check for promotional keywords
  const promotionalKeywords = [
    "sale",
    "deal",
    "discount",
    "off for",
    "save $",
    "only $",
    "just $",
  ];
  const descLower = description.toLowerCase();
  if (promotionalKeywords.some((keyword) => descLower.includes(keyword))) {
    return "";
  }

  description = description.replace(/\s+/g, " ").trim();

  if (description && !description.match(/[.!?]$/)) {
    description += ".";
  }

  return description;
};

// Helper function to extract article content
const extractArticleContent = (item) => {
  const contentSources = [
    item.contentSnippet,
    item.description,
    item.summary,
    item["content:encoded"],
    item.content,
  ];

  for (const source of contentSources) {
    if (source && source.length > 50) {
      const cleaned = cleanDescription(source, item.title);
      if (cleaned && cleaned.length > 30) {
        return cleaned;
      }
    }
  }

  return null;
};

// Helper function to check description quality
const isHighQualityDescription = (description, title = "") => {
  if (!description || description.length < 30) return false;

  const lower = description.toLowerCase();
  const titleLower = title.toLowerCase();

  if (title && lower === titleLower) return false;

  const hasGoodStructure =
    description.split(" ").length >= 8 &&
    description.length >= 80 &&
    /[A-Z]/.test(description[0]);

  const words = lower.split(/\s+/);
  const uniqueWords = new Set(words);
  const uniqueRatio = uniqueWords.size / words.length;
  if (uniqueRatio < 0.5) return false;

  const fillerPhrases = [
    "lorem ipsum",
    "test test",
    "undefined",
    "null",
    "none",
    "no description",
    "coming soon",
    "under construction",
    "...",
    "tbd",
    "n/a",
  ];

  if (fillerPhrases.some((phrase) => lower.includes(phrase))) {
    return false;
  }

  return hasGoodStructure;
};

// Parse and normalize feed items with STRICT requirements
const parseFeedItem = async (item, source) => {
  // Check title quality first
  const title = item.title || "";

  // Skip if title is spam-like
  if (isSpamTitle(title)) {
    console.log(`Filtered spam title: "${title}"`);
    return null;
  }

  // Skip if not English
  if (!isLikelyEnglish(title)) {
    return null;
  }

  // Skip promotional content
  const titleLower = title.toLowerCase();
  const promotionalKeywords = [
    "$",
    "% off",
    "sale",
    "deal",
    "discount",
    "save $",
    "only $",
    "labor day",
    "black friday",
    "cyber monday",
    "prime day",
  ];

  for (const keyword of promotionalKeywords) {
    if (titleLower.includes(keyword)) {
      console.log(`Filtered promotional: "${title}"`);
      return null;
    }
  }

  // STRICT thumbnail requirement
  const thumbnail = await extractBestThumbnail(item, source);

  // Skip articles without valid thumbnails
  if (!thumbnail || !(await isRealArticleThumbnail(thumbnail, item))) {
    console.log(`Filtered: No valid thumbnail for "${title}"`);
    return null;
  }

  // Get clean description
  let description = extractArticleContent(item);

  if (!description || !isHighQualityDescription(description, title)) {
    if (title.length > 60) {
      description = title
        .replace(/\|.*$/, "")
        .replace(/[-–—](?=[^-–—]*$).*$/, "")
        .trim();
    } else {
      return null;
    }
  }

  if (description.length > 250) {
    const sentences = description.match(/[^.!?]+[.!?]+/g) || [description];
    let truncated = "";
    for (const sentence of sentences) {
      if ((truncated + sentence).length <= 247) {
        truncated += sentence;
      } else {
        break;
      }
    }
    description = truncated || description.substring(0, 247) + "...";
  } else if (description.length < 50) {
    return null;
  }

  const pubDate =
    item.pubDate || item.isoDate || item.published || new Date().toISOString();

  return {
    title: title,
    link: item.link || item.guid || "#",
    description,
    thumbnail,
    source: getFeedDisplayName(source),
    sourceUrl: source,
    creator: item.creator || item.author || getFeedDisplayName(source),
    guid: item.guid || item.link || `${source}-${pubDate}`,
    pubDate,
    time: formatDistanceToNow(new Date(pubDate), { addSuffix: true }),
  };
};

// Fetch a single RSS feed with timeout
const fetchSingleFeed = async (url, timeout = 5000) => {
  // Skip known promotional sources
  if (url.includes("lifehacker.com")) {
    console.log("Skipping Lifehacker feed (too promotional)");
    return [];
  }

  return new Promise(async (resolve) => {
    const timer = setTimeout(() => resolve([]), timeout);

    try {
      const feed = await parser.parseURL(url);
      clearTimeout(timer);

      const parsedItems = await Promise.all(
        feed.items.map((item) => parseFeedItem(item, url))
      );

      const validItems = parsedItems
        .filter((item) => item !== null)
        .filter((item) => {
          return (
            item.description &&
            item.description.length >= 50 &&
            item.title &&
            item.title.length >= 10 &&
            item.thumbnail
          ); // Must have thumbnail
        });

      resolve(validItems);
    } catch (error) {
      clearTimeout(timer);
      console.error(`Error fetching feed ${url}:`, error.message);
      resolve([]);
    }
  });
};

// Quality scoring function
const scoreArticleQuality = (item) => {
  let score = 0;

  // Heavily prioritize articles WITH thumbnails
  if (item.thumbnail) score += 10;

  // Clean title (no special chars)
  const specialCount = (item.title.match(/[^\w\s\-.,!?'"]/g) || []).length;
  if (specialCount === 0) score += 5;

  if (item.title && item.title.length > 30) score += 2;
  if (item.title && !item.title.includes("|")) score += 1;

  if (item.description && item.description.length > 100) score += 3;
  if (item.description && item.description.length > 150) score += 2;
  if (item.description && !item.description.includes("Read more")) score += 1;

  const hoursSincePublished =
    (Date.now() - new Date(item.pubDate)) / (1000 * 60 * 60);
  if (hoursSincePublished < 24) score += 3;
  else if (hoursSincePublished < 72) score += 2;
  else if (hoursSincePublished < 168) score += 1;

  return score;
};

// API endpoint to fetch feeds
app.post("/api/feeds", async (req, res) => {
  console.log("📨 Received feed request:", req.body);
  const { category, subcategory } = req.body;

  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }

  try {
    const feedUrls = subcategory
      ? getFeedsForSubcategory(category, subcategory)
      : getFeedsForCategory(category);

    if (!feedUrls || feedUrls.length === 0) {
      return res.json({
        items: [],
        message: "No feeds found for this category",
      });
    }

    const feedPromises = feedUrls.map((url) => fetchSingleFeed(url));
    const feedResults = await Promise.all(feedPromises);

    let allItems = feedResults.flat();

    const seen = new Set();
    allItems = allItems.filter((item) => {
      const key = item.guid || item.link;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by quality score and date
    allItems.sort((a, b) => {
      const scoreA = scoreArticleQuality(a);
      const scoreB = scoreArticleQuality(b);

      if (Math.abs(scoreA - scoreB) > 2) {
        return scoreB - scoreA;
      }

      return new Date(b.pubDate) - new Date(a.pubDate);
    });

    // Fixed limit of 10 items
    const maxItems = 10;
    const finalItems = allItems.slice(0, maxItems);

    res.json({
      items: finalItems,
      count: finalItems.length,
      category,
      subcategory,
    });
  } catch (error) {
    console.error("Feed fetching error:", error);
    res.status(500).json({
      error: "Failed to fetch feeds",
      message: error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
const server = app.listen(port, () => {
  console.log(`RSS Feed Server running at http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});

// Keep the process alive
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});

// Handle errors
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use`);
    process.exit(1);
  } else {
    throw error;
  }
});

// Vercel Serverless Function Handler (for production deployment)
module.exports = async (req, res) => {
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

  try {
    const feedUrls = subcategory
      ? getFeedsForSubcategory(category, subcategory)
      : getFeedsForCategory(category);

    if (!feedUrls || feedUrls.length === 0) {
      return res
        .status(200)
        .json({ items: [], message: "No feeds found for this category" });
    }

    const feedPromises = feedUrls.map((url) => fetchSingleFeed(url));
    const feedResults = await Promise.all(feedPromises);

    let allItems = feedResults.flat();

    const seen = new Set();
    allItems = allItems.filter((item) => {
      const key = item.guid || item.link;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by quality score and date
    allItems.sort((a, b) => {
      const scoreA = scoreArticleQuality(a);
      const scoreB = scoreArticleQuality(b);

      if (Math.abs(scoreA - scoreB) > 2) {
        return scoreB - scoreA;
      }

      return new Date(b.pubDate) - new Date(a.pubDate);
    });

    // Fixed limit of 10 items
    const maxItems = 10;
    const finalItems = allItems.slice(0, maxItems);

    res.status(200).json({
      items: finalItems,
      count: finalItems.length,
      category,
      subcategory,
    });
  } catch (error) {
    console.error("Feed fetching error:", error);
    res.status(500).json({
      error: "Failed to fetch feeds",
      message: error.message,
    });
  }
};
