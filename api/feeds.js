// api/feeds.js - Unified production handler matching development server
import Parser from "rss-parser";
import { getFilterConfig, qualifiesForDefaultIcon } from "../filterConfig.js";

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

// RSS feed URLs organized by category (complete copy from server.js)
const RSS_FEEDS = {
  tech: {
    "ai-machine-learning": [
      "https://openai.com/news/rss/",
      "https://cloud.google.com/blog/products/ai-machine-learning/rss/",
      "https://news.mit.edu/topic/artificial-intelligence2/rss.xml",
      "https://machinelearningmastery.com/feed/",
      "https://www.marktechpost.com/feed/",
      "https://hnrss.org/newest?q=AI+OR+machine+learning",
      "https://blog.google/technology/ai/rss/",
      "https://huggingface.co/blog/feed.xml",
      "https://www.deeplearning.ai/blog/feed/",
      "https://hai.stanford.edu/news/rss.xml",
      "https://allenai.org/rss.xml",
      "https://venturebeat.com/category/ai/feed/",
      "https://www.aitrends.com/feed/",
      "https://blogs.microsoft.com/ai/feed/",
    ],

    "martech-adtech": [
      "https://martech.org/feed/",
      "https://adexchanger.com/feed/",
      "https://marketingland.com/feed/",
      "https://chiefmartec.com/feed/",
      "https://www.marketingtechnews.net/rss.xml",
      "https://digiday.com/feed/",
      "https://www.marketingprofs.com/rss/all",
      "https://adtechdaily.com/feed",
      "https://verve.com/feed",
      "https://adpushup.com/blog/feed",
    ],

    "web-dev-devops": [
      "https://css-tricks.com/feed/",
      "https://www.smashingmagazine.com/feed/",
      "https://web.dev/feed.xml",
      "https://blog.logrocket.com/feed/",
      "https://www.joshwcomeau.com/rss.xml",
      "https://kentcdodds.com/blog/rss.xml",
      "https://dev.to/feed/tag/webdev",
      "https://blog.cloudflare.com/rss/",
      "https://github.blog/category/development/feed/",
      "https://devops.com/feed",
      "https://atlassian.com/blog/devops/feed",
    ],

    "cybersecurity-privacy": [
      "https://krebsonsecurity.com/feed/",
      "https://feeds.feedburner.com/TheHackersNews",
      "https://www.darkreading.com/rss.xml",
      "https://www.schneier.com/feed/atom/",
      "https://www.bleepingcomputer.com/feed/",
      "https://threatpost.com/feed/",
      "https://blog.talosintelligence.com/feeds/posts/default",
      "https://www.microsoft.com/security/blog/feed/",
    ],

    "blockchain-web3": [
      "https://www.coindesk.com/arc/outboundfeeds/rss/",
      "https://decrypt.co/feed",
      "https://cointelegraph.com/rss",
      "https://ethereum.org/en/blog/feed.xml",
      "https://blog.chain.link/rss/",
      "https://messari.io/rss",
      "https://bankless.substack.com/feed",
      "https://vitalik.eth.limo/feed.xml",
    ],
  },

  builder: {
    "startup-stories": [
      "https://review.firstround.com/rss/",
      "https://blog.ycombinator.com/feed/",
      "https://techcrunch.com/category/startups/feed/",
      "https://www.indiehackers.com/feed.xml",
      "https://sifted.eu/feed/",
      "https://venturebeat.com/category/entrepreneur/feed/",
      "https://bothsidesofthetable.com/feed",
      "https://www.startupgrind.com/feed.xml",
    ],

    "productivity-hacks": [
      "https://zenhabits.net/feed/",
      "https://jamesclear.com/feed",
      "https://gettingthingsdone.com/feed/",
      "https://aliabdaal.com/rss/",
      "https://tim.blog/feed/",
      "https://calnewport.com/blog/feed/",
      "https://www.asianefficiency.com/feed/",
    ],

    "automation-no-code": [
      "https://zapier.com/blog/feeds/latest/",
      "https://bubble.io/blog/rss",
      "https://www.nocode.tech/feed",
      "https://blog.airtable.com/rss/",
      "https://webflow.com/blog/feed.rss",
      "https://blog.n8n.io/rss/",
      "https://makerpad.co/posts.atom",
      "https://www.producthunt.com/feed/no-code",
    ],

    "project-management": [
      "https://blog.asana.com/feed/",
      "https://blog.trello.com/rss",
      "https://monday.com/blog/feed/",
      "https://www.projectmanager.com/blog/feed",
      "https://blog.clickup.com/feed/",
      "https://www.atlassian.com/blog/feed",
      "https://www.wrike.com/blog/feed/",
      "https://www.pmi.org/rss.xml",
    ],

    "momentum-mindset": [
      "https://fs.blog/feed/",
      "https://ryanholiday.net/feed/",
      "https://markmanson.net/feed",
      "https://sethgodin.typepad.com/seths_blog/atom.xml",
      "https://dailystoic.com/feed/",
      "https://tim.blog/feed/",
      "https://jamesclear.com/feed",
      "https://waitbutwhy.com/feed",
      "https://feeds.feedburner.com/brainpickings/rss",
      "https://www.mindful.org/feed",
    ],
  },

  art: {
    "generative-ai-art": [
      "https://aiartists.org/feed",
      "https://www.creativebloq.com/feeds/tag/ai-art",
      "https://ml.berkeley.edu/blog/feed.xml",
      "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
      "https://runwayml.com/blog/rss/",
    ],

    "ui-ux-trends": [
      "https://www.smashingmagazine.com/feed/",
      "https://uxplanet.org/feed",
      "https://alistapart.com/main/feed",
      "https://uxdesign.cc/feed",
      "https://www.nngroup.com/feed/rss/",
      "https://www.invisionapp.com/inside-design/feed/",
      "https://www.uxmatters.com/feed.php",
      "https://sidebar.io/feed.xml",
    ],

    "color-typography": [
      "https://fontsinuse.com/feed",
      "https://blog.adobe.com/en/publish/creative-cloud.xml",
      "https://typographica.org/feed/",
      "https://ilovetypography.com/feed/",
      "https://fonts.googleblog.com/feeds/posts/default",
    ],

    "animation-motion": [
      "https://motionographer.com/feed/",
      "https://greensock.com/blog/feed",
      "https://www.animatedreview.com/feed/",
      "https://lottiefiles.com/blog/feed",
      "https://www.schoolofmotion.com/blog/rss",
    ],

    "tutorials-walkthroughs": [
      "https://tympanus.net/codrops/feed/",
      "https://webdesign.tutsplus.com/posts.atom",
      "https://designmodo.com/feed/",
      "https://www.sitepoint.com/design-ux/feed/",
      "https://tutsplus.com/feed/",
      "https://www.freecodecamp.org/news/rss/",
    ],
  },

  gaming: {
    "daily-roundup": [
      "https://www.polygon.com/rss/index.xml",
      "https://www.gamespot.com/feeds/news/",
      "https://www.rockpapershotgun.com/feed",
      "https://www.gamesradar.com/rss/",
      "https://www.eurogamer.net/feed",
      "https://kotaku.com/rss",
      "https://www.destructoid.com/feed/",
      "https://www.ign.com/rss",
    ],

    "pro-guides-tips": [
      "https://www.gamepur.com/feed",
      "https://www.thegamer.com/feed/",
      "https://dotesports.com/feed",
      "https://www.pcgamer.com/rss/",
    ],

    "retro-gaming": [
      "https://www.timeextension.com/feed/",
      "https://indieretronews.com/feeds/posts/default?alt=rss",
      "https://retrododo.com/feed/",
      "https://www.retrogamer.net/feed/",
      "https://www.hardcoregaming101.net/feed/",
      "https://retroblast.com/feed/",
    ],

    "indie-spotlights": [
      "https://indiegames.com/feed/",
      "https://www.indiedb.com/rss/games/",
      "https://www.gamedeveloper.com/rss.xml",
      "https://warpdoor.com/feed/",
      "https://alphabetagamer.com/feed/",
      "https://indiegamesplus.com/feed/",
    ],

    "collectors-hub": [
      "https://www.racketboy.com/feed/",
      "https://videogamekrieg.com/feed",
      "https://www.pricecharting.com/blog/feed",
      "https://www.retrorgb.com/feed/",
      "https://www.gamingalexandria.com/wp/feed/",
    ],
  },
};

// Configuration
const MAX_ITEMS = 10;
const MAX_ITEMS_PER_FEED = 15;
const TARGET_BUFFER = 20;
const MAX_FEEDS_TO_PROCESS = 5; // Limit for Vercel timeout
const TIMEOUT_MS = 8000; // 8 seconds total timeout

// Helper functions for category/subcategory resolution
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
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "Unknown Source";
  }
};

// Validation functions
const containsCodeOrTechnical = (text) => {
  if (!text) return false;
  const codePatterns = [
    /function\s*\(/,
    /\=\>/,
    /\{\s*\}/,
    /\[\s*\]/,
    /console\./,
    /import\s+.*from/,
    /export\s+(default|const)/,
    /class\s+\w+\s*{/,
    /const\s+\w+\s*=/,
    /let\s+\w+\s*=/,
    /var\s+\w+\s*=/,
  ];
  return codePatterns.some((pattern) => pattern.test(text));
};

const isLikelyEnglish = (text) => {
  if (!text) return true;
  const nonLatinPattern = /[^\u0000-\u007F\u0080-\u00FF]/g;
  const matches = text.match(nonLatinPattern) || [];
  const nonLatinRatio = matches.length / text.length;
  return nonLatinRatio <= 0.3;
};

const isSpamTitle = (title) => {
  if (!title) return true;
  const specialChars = title.match(/[^\w\s\-.,!?'"]/g) || [];
  const specialRatio = specialChars.length / title.length;
  if (specialRatio > 0.2) return true;

  const spamPatterns = [
    /\bclick\s*here\b/i,
    /\bfree\s*download\b/i,
    /\byou\s*won't\s*believe\b/i,
    /\bmust\s*see\b/i,
    /\bshocking\b/i,
  ];
  return spamPatterns.some((pattern) => pattern.test(title));
};

// Validation functions using filterConfig
const isValidDescription = (description, title, category, subcategory) => {
  if (!description) return false;

  const config = getFilterConfig(category, subcategory);

  if (description.length < config.CONTENT_RULES.MIN_DESCRIPTION_LENGTH) {
    return false;
  }

  // Skip certain checks for builder/art categories
  if (category === "builder" || category === "art") {
    return true;
  }

  if (config.CONTENT_RULES.NO_LOWERCASE_START && /^[a-z]/.test(description)) {
    return false;
  }

  if (
    config.CONTENT_RULES.NO_SPECIAL_CHAR_START &&
    /^[^A-Za-z0-9"']/.test(description)
  ) {
    return false;
  }

  if (
    config.CONTENT_RULES.NO_URLS_IN_DESCRIPTION &&
    /https?:\/\//.test(description)
  ) {
    return false;
  }

  return true;
};

const cleanDescription = (rawDescription, title, category, subcategory) => {
  if (!rawDescription) return "";

  const config = getFilterConfig(category, subcategory);

  let cleaned = rawDescription.replace(/<[^>]*>/g, " ");
  cleaned = cleaned.replace(/&[a-z]+;/gi, " ");
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, "");
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  if (
    containsCodeOrTechnical(cleaned) &&
    config.CONTENT_RULES.NO_CODE_CONTENT
  ) {
    return "";
  }

  // Remove promotional patterns
  const skipPatterns = [
    /^read the full article/i,
    /^click here to/i,
    /^learn more about/i,
    /^the post .* appeared first on/i,
    /^continue reading/i,
  ];

  if (skipPatterns.some((pattern) => pattern.test(cleaned))) {
    return "";
  }

  if (cleaned.length > 250) {
    cleaned = cleaned.substring(0, 247) + "...";
  }

  return cleaned;
};

// Quality scoring function
const scoreArticleQuality = (item, category, subcategory) => {
  let score = 0;

  // Base scoring
  if (item.thumbnail) score += 20;
  if (item.description && item.description.length > 100) score += 10;
  if (item.title && item.title.length > 30) score += 5;

  // Age bonus
  const hoursSincePublished =
    (Date.now() - new Date(item.pubDate)) / (1000 * 60 * 60);
  if (hoursSincePublished < 24) score += 10;
  else if (hoursSincePublished < 72) score += 5;

  // Category-specific bonuses
  if (
    category === "tech" &&
    item.description &&
    item.description.length > 150
  ) {
    score += 5;
  }
  if (
    category === "builder" &&
    item.title &&
    /how|guide|tutorial|tips/i.test(item.title)
  ) {
    score += 3;
  }
  if (category === "art" && item.thumbnail) {
    score += 5;
  }

  return score;
};

// Parse feed item with proper category/subcategory parameters
const parseFeedItem = (item, source, category, subcategory) => {
  // Get filter config for this specific category/subcategory
  const config = getFilterConfig(category, subcategory);

  // Title validation using config
  const title = item.title || "Untitled";
  if (title.length < config.TITLE_RULES.MIN_LENGTH) return null;
  if (title.length > config.TITLE_RULES.MAX_LENGTH) return null;

  if (
    config.TITLE_RULES.NO_ALL_CAPS &&
    title === title.toUpperCase() &&
    title.length > 10
  ) {
    return null;
  }

  if (config.TITLE_RULES.NO_SPAM_PATTERNS && isSpamTitle(title)) {
    return null;
  }

  if (config.TITLE_RULES.ENGLISH_ONLY && !isLikelyEnglish(title)) {
    return null;
  }

  // Age validation using config
  const pubDate =
    item.pubDate || item.isoDate || item.published || new Date().toISOString();
  const articleAge = Date.now() - new Date(pubDate);
  const maxAge = config.AGE_RULES.MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  if (articleAge > maxAge) {
    return null;
  }

  // Extract thumbnail
  let thumbnail = null;
  if (item["media:thumbnail"]) {
    thumbnail = item["media:thumbnail"].$
      ? item["media:thumbnail"].$.url
      : item["media:thumbnail"];
  }

  // Extract and validate description
  let description =
    item.contentSnippet || item.description || item.summary || "";
  description = cleanDescription(description, title, category, subcategory);

  // Validate description using config
  if (!isValidDescription(description, title, category, subcategory)) {
    return null;
  }

  // Quality scoring for potential default icon
  const qualityScore = scoreArticleQuality(
    {
      title,
      description,
      thumbnail,
      pubDate,
    },
    category,
    subcategory
  );

  // Check if thumbnail is required or if high-quality articles can use default icon
  let allowDefaultIcon = false;
  if (!thumbnail && config.THUMBNAIL_RULES.REQUIRED) {
    if (
      qualifiesForDefaultIcon(
        { title, description, thumbnail, pubDate },
        qualityScore,
        category,
        subcategory
      )
    ) {
      allowDefaultIcon = true;
    } else {
      return null;
    }
  }

  // Check for promotional content
  const promotionalKeywords = config.PROMOTIONAL_KEYWORDS || [];
  const titleLower = title.toLowerCase();

  for (const keyword of promotionalKeywords) {
    if (titleLower.includes(keyword.toLowerCase())) {
      return null;
    }
  }

  return {
    title: title,
    link: item.link || item.guid || "#",
    description,
    thumbnail: thumbnail || null,
    allowDefaultIcon,
    qualityScore,
    source: getFeedDisplayName(source),
    sourceUrl: source,
    creator: item.creator || item.author || getFeedDisplayName(source),
    guid: item.guid || item.link || `${source}-${pubDate}`,
    pubDate,
    time: new Date(pubDate).toLocaleString(),
  };
};

// Optimized fetch function with early exit and timeout protection
async function fetchFeedsWithEarlyExit(feedUrls, category, subcategory) {
  const qualifiedItems = [];
  const seen = new Set();
  const sourceCounts = new Map();
  let totalProcessed = 0;
  const startTime = Date.now();

  console.log(`Starting early-exit processing for ${feedUrls.length} feeds`);
  console.log(`Category: ${category}, Subcategory: ${subcategory || "none"}`);
  console.log(
    `Target: ${TARGET_BUFFER} items, max ${MAX_ITEMS_PER_FEED} per feed`
  );

  // Get config for this category/subcategory
  const config = getFilterConfig(category, subcategory);

  // Debug logging for production
  console.log(`Using config - MAX_AGE_DAYS: ${config.AGE_RULES.MAX_AGE_DAYS}`);
  console.log(
    `MIN_DESCRIPTION_LENGTH: ${config.CONTENT_RULES.MIN_DESCRIPTION_LENGTH}`
  );

  // Process feeds SEQUENTIALLY with timeout protection
  for (let i = 0; i < Math.min(feedUrls.length, MAX_FEEDS_TO_PROCESS); i++) {
    const feedUrl = feedUrls[i];

    // Check timeout
    if (Date.now() - startTime > TIMEOUT_MS) {
      console.log(`TIMEOUT: Stopping after ${i} feeds to avoid timeout`);
      break;
    }

    // Check if we have enough items
    if (qualifiedItems.length >= TARGET_BUFFER) {
      console.log(
        `EARLY EXIT: ${qualifiedItems.length} items after ${i} feeds`
      );
      break;
    }

    try {
      console.log(`Processing feed ${i + 1}: ${getFeedDisplayName(feedUrl)}`);
      const feed = await parser.parseURL(feedUrl);

      // Limit items per feed
      const itemsToProcess = feed.items.slice(0, MAX_ITEMS_PER_FEED);

      for (const item of itemsToProcess) {
        totalProcessed++;

        // Check during processing
        if (qualifiedItems.length >= TARGET_BUFFER) break;

        // Parse with category and subcategory
        const parsed = parseFeedItem(item, feedUrl, category, subcategory);

        if (!parsed) continue;

        // Deduplication
        const key = parsed.guid || parsed.link;
        if (seen.has(key)) continue;

        // Source limit using config
        const sourceCount = sourceCounts.get(parsed.source) || 0;
        if (sourceCount >= config.SOURCE_RULES.MAX_PER_DOMAIN) continue;

        // Item qualified!
        seen.add(key);
        sourceCounts.set(parsed.source, sourceCount + 1);
        qualifiedItems.push(parsed);
      }
    } catch (error) {
      console.error(`Error fetching ${feedUrl}:`, error.message);
      // Continue to next feed on error
    }
  }

  console.log(
    `Processed ${totalProcessed} items, qualified ${qualifiedItems.length}`
  );

  // Sort by date
  qualifiedItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Apply final deduplication based on config
  let finalItems = [];

  if (config.DEDUPLICATION && config.DEDUPLICATION.UNCOMMON_WORDS === false) {
    // No uncommon word filtering for this category
    finalItems = qualifiedItems.slice(0, MAX_ITEMS);
  } else {
    // Apply uncommon word deduplication
    const usedUncommonWords = new Set();
    const commonWords = new Set([
      "the",
      "and",
      "for",
      "with",
      "from",
      "that",
      "this",
      "what",
      "when",
      "where",
      "which",
      "while",
      "after",
      "before",
      "about",
    ]);

    for (const item of qualifiedItems) {
      if (finalItems.length >= MAX_ITEMS) break;

      const titleWords = item.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 4 && !commonWords.has(word));

      const hasDuplicate = titleWords.some((word) =>
        usedUncommonWords.has(word)
      );

      if (!hasDuplicate) {
        finalItems.push(item);
        titleWords.forEach((word) => usedUncommonWords.add(word));
      }
    }
  }

  return finalItems;
}

// Main handler - optimized for Vercel
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
    // Get configuration for this specific category/subcategory
    const config = getFilterConfig(category, subcategory);

    // Log the configuration being used for debugging
    console.log(
      `Using filter config for ${category}/${subcategory || "none"}:`,
      {
        maxAgeDays: config.AGE_RULES.MAX_AGE_DAYS,
        minDescLength: config.CONTENT_RULES.MIN_DESCRIPTION_LENGTH,
        thumbnailRequired: config.THUMBNAIL_RULES.REQUIRED,
        useDefaultOnHighQuality:
          config.THUMBNAIL_RULES.USE_DEFAULT_ON_HIGH_QUALITY,
        minQualityForDefault:
          config.THUMBNAIL_RULES.MIN_QUALITY_SCORE_FOR_DEFAULT,
      }
    );

    // Get feed URLs
    const feedUrls = subcategory
      ? getFeedsForSubcategory(category, subcategory)
      : getFeedsForCategory(category);

    if (!feedUrls || feedUrls.length === 0) {
      return res.status(200).json({
        items: [],
        message: "No feeds found for this category",
      });
    }

    // Use optimized fetch with early exit
    const finalItems = await fetchFeedsWithEarlyExit(
      feedUrls,
      category,
      subcategory
    );

    return res.status(200).json({
      items: finalItems,
      count: finalItems.length,
      category,
      subcategory,
      timestamp: new Date().toISOString(),
      success: true,
      configUsed: {
        maxAgeDays: config.AGE_RULES.MAX_AGE_DAYS,
        minDescLength: config.CONTENT_RULES.MIN_DESCRIPTION_LENGTH,
        thumbnailRequired: config.THUMBNAIL_RULES.REQUIRED,
        useDefaultOnHighQuality:
          config.THUMBNAIL_RULES.USE_DEFAULT_ON_HIGH_QUALITY,
        minQualityForDefault:
          config.THUMBNAIL_RULES.MIN_QUALITY_SCORE_FOR_DEFAULT,
        noCodeContent: config.CONTENT_RULES.NO_CODE_CONTENT,
        qualityCheck: config.CONTENT_RULES.QUALITY_CHECK,
      },
    });
  } catch (error) {
    console.error("Feed fetching error:", error);
    return res.status(500).json({
      error: "Failed to fetch feeds",
      message: error.message,
      items: [],
      count: 0,
    });
  }
}
