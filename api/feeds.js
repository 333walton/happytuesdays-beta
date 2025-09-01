// api/feeds.js - Production handler with progressive filter relaxation
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

// RSS feed URLs organized by category
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

// Configuration - ADJUSTED FOR BETTER RESULTS
const MAX_ITEMS = 10;
const MIN_ITEMS_REQUIRED = 5; // Minimum items we must return
const MAX_ITEMS_PER_FEED = 20; // Process more items per feed
const TARGET_BUFFER = 25; // Larger buffer to ensure we get enough
const MAX_FEEDS_TO_PROCESS = 10; // Process more feeds (still safe for Vercel)
const TIMEOUT_MS = 8500; // 8.5 seconds timeout

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

// Validation functions with RELAXATION LEVELS
const containsCodeOrTechnical = (text, relaxed = false) => {
  if (!text) return false;
  if (relaxed) return false; // Skip this check when relaxed

  const codePatterns = [
    /function\s*\(/,
    /\=\>/,
    /\{\s*\}/,
    /\[\s*\]/,
    /console\./,
    /import\s+.*from/,
    /export\s+(default|const)/,
  ];
  return codePatterns.some((pattern) => pattern.test(text));
};

const isLikelyEnglish = (text, relaxed = false) => {
  if (!text) return true;
  if (relaxed) return true; // Skip language check when relaxed

  const nonLatinPattern = /[^\u0000-\u007F\u0080-\u00FF]/g;
  const matches = text.match(nonLatinPattern) || [];
  const nonLatinRatio = matches.length / text.length;
  return nonLatinRatio <= 0.3;
};

const isSpamTitle = (title, relaxed = false) => {
  if (!title) return true;
  if (relaxed) return false; // Be more lenient when relaxed

  const specialChars = title.match(/[^\w\s\-.,!?'"]/g) || [];
  const specialRatio = specialChars.length / title.length;
  if (specialRatio > 0.3) return true; // Increased threshold when not relaxed

  const spamPatterns = [
    /\bclick\s*here\b/i,
    /\bfree\s*download\b/i,
    /\byou\s*won't\s*believe\b/i,
  ];
  return spamPatterns.some((pattern) => pattern.test(title));
};

// Validation with relaxation
const isValidDescription = (
  description,
  title,
  category,
  subcategory,
  relaxed = false
) => {
  if (!description) return false;

  const config = getFilterConfig(category, subcategory);

  // Relax minimum length requirement when needed
  const minLength = relaxed
    ? Math.floor(config.CONTENT_RULES.MIN_DESCRIPTION_LENGTH * 0.5)
    : config.CONTENT_RULES.MIN_DESCRIPTION_LENGTH;

  if (description.length < minLength) {
    return false;
  }

  // Skip strict checks when relaxed
  if (relaxed) return true;

  if (config.CONTENT_RULES.NO_LOWERCASE_START && /^[a-z]/.test(description)) {
    return false;
  }

  if (
    config.CONTENT_RULES.NO_SPECIAL_CHAR_START &&
    /^[^A-Za-z0-9"']/.test(description)
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

  if (cleaned.length > 250) {
    cleaned = cleaned.substring(0, 247) + "...";
  }

  return cleaned;
};

// Quality scoring function
const scoreArticleQuality = (item, category, subcategory) => {
  let score = 0;

  if (item.thumbnail) score += 20;
  if (item.description && item.description.length > 50) score += 10;
  if (item.title && item.title.length > 20) score += 5;

  const hoursSincePublished =
    (Date.now() - new Date(item.pubDate)) / (1000 * 60 * 60);
  if (hoursSincePublished < 24) score += 10;
  else if (hoursSincePublished < 72) score += 5;
  else if (hoursSincePublished < 168) score += 2;

  return score;
};

// Parse feed item with RELAXATION PARAMETER
const parseFeedItem = (
  item,
  source,
  category,
  subcategory,
  relaxFilters = false
) => {
  const config = getFilterConfig(category, subcategory);

  const title = item.title || "Untitled";

  // Relax title length requirements when needed
  const minTitleLength = relaxFilters
    ? Math.max(5, Math.floor(config.TITLE_RULES.MIN_LENGTH * 0.5))
    : config.TITLE_RULES.MIN_LENGTH;

  const maxTitleLength = relaxFilters
    ? config.TITLE_RULES.MAX_LENGTH * 2
    : config.TITLE_RULES.MAX_LENGTH;

  if (title.length < minTitleLength) return null;
  if (title.length > maxTitleLength) return null;

  // Skip strict checks when filters are relaxed
  if (!relaxFilters) {
    if (
      config.TITLE_RULES.NO_ALL_CAPS &&
      title === title.toUpperCase() &&
      title.length > 10
    ) {
      return null;
    }

    if (
      config.TITLE_RULES.NO_SPAM_PATTERNS &&
      isSpamTitle(title, relaxFilters)
    ) {
      return null;
    }

    if (
      config.TITLE_RULES.ENGLISH_ONLY &&
      !isLikelyEnglish(title, relaxFilters)
    ) {
      return null;
    }
  }

  // Age validation - relax when needed
  const pubDate =
    item.pubDate || item.isoDate || item.published || new Date().toISOString();
  const articleAge = Date.now() - new Date(pubDate);
  const maxAgeDays = relaxFilters
    ? config.AGE_RULES.MAX_AGE_DAYS * 2
    : config.AGE_RULES.MAX_AGE_DAYS;
  const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;

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

  // Extract and validate description with relaxation
  let description =
    item.contentSnippet || item.description || item.summary || "";
  description = cleanDescription(description, title, category, subcategory);

  // Validate description with relaxation parameter
  if (
    !isValidDescription(description, title, category, subcategory, relaxFilters)
  ) {
    // If relaxed and still no description, create a minimal one
    if (relaxFilters && !description) {
      description = title; // Use title as description as last resort
    } else if (!relaxFilters) {
      return null;
    }
  }

  // Quality scoring
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

  // Relax thumbnail requirements when needed
  let allowDefaultIcon = false;
  if (!thumbnail) {
    if (relaxFilters) {
      allowDefaultIcon = true; // Always allow default icon when relaxed
    } else if (config.THUMBNAIL_RULES.REQUIRED) {
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
  }

  // Skip promotional keyword check when relaxed
  if (!relaxFilters) {
    const promotionalKeywords = config.PROMOTIONAL_KEYWORDS || [];
    const titleLower = title.toLowerCase();

    for (const keyword of promotionalKeywords) {
      if (titleLower.includes(keyword.toLowerCase())) {
        return null;
      }
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

// PROGRESSIVE FETCH WITH FILTER RELAXATION
async function fetchFeedsWithProgressiveRelaxation(
  feedUrls,
  category,
  subcategory
) {
  const qualifiedItems = [];
  const seen = new Set();
  const sourceCounts = new Map();
  let totalProcessed = 0;
  const startTime = Date.now();
  let relaxFilters = false;
  let feedsProcessed = 0;

  console.log(`Starting progressive fetch for ${feedUrls.length} feeds`);
  console.log(`Category: ${category}, Subcategory: ${subcategory || "none"}`);

  const config = getFilterConfig(category, subcategory);

  // Process feeds with progressive relaxation
  for (let i = 0; i < Math.min(feedUrls.length, MAX_FEEDS_TO_PROCESS); i++) {
    const feedUrl = feedUrls[i];

    // Check timeout
    if (Date.now() - startTime > TIMEOUT_MS) {
      console.log(`TIMEOUT: Stopping after ${i} feeds`);
      break;
    }

    // Check if we have enough items
    if (qualifiedItems.length >= TARGET_BUFFER) {
      console.log(`SUCCESS: ${qualifiedItems.length} items collected`);
      break;
    }

    // PROGRESSIVE RELAXATION: If we've processed 3+ feeds with few results, relax filters
    if (feedsProcessed >= 3 && qualifiedItems.length < MIN_ITEMS_REQUIRED) {
      if (!relaxFilters) {
        console.log(
          `RELAXING FILTERS: Only ${qualifiedItems.length} items after ${feedsProcessed} feeds`
        );
        relaxFilters = true;

        // Reset source counts to allow more items per source
        sourceCounts.clear();
      }
    }

    try {
      const feed = await parser.parseURL(feedUrl);
      feedsProcessed++;

      // Process more items when we need them
      const itemsNeeded = TARGET_BUFFER - qualifiedItems.length;
      const itemsToProcess = relaxFilters
        ? feed.items.slice(0, Math.max(MAX_ITEMS_PER_FEED, itemsNeeded))
        : feed.items.slice(0, MAX_ITEMS_PER_FEED);

      console.log(
        `Processing ${itemsToProcess.length} items from ${getFeedDisplayName(
          feedUrl
        )}, relaxed: ${relaxFilters}`
      );

      for (const item of itemsToProcess) {
        totalProcessed++;

        if (qualifiedItems.length >= TARGET_BUFFER) break;

        // Parse with relaxation flag
        const parsed = parseFeedItem(
          item,
          feedUrl,
          category,
          subcategory,
          relaxFilters
        );

        if (!parsed) continue;

        // Deduplication
        const key = parsed.guid || parsed.link;
        if (seen.has(key)) continue;

        // Source limit - relax when needed
        const maxPerSource = relaxFilters
          ? config.SOURCE_RULES.MAX_PER_DOMAIN * 2
          : config.SOURCE_RULES.MAX_PER_DOMAIN;

        const sourceCount = sourceCounts.get(parsed.source) || 0;
        if (sourceCount >= maxPerSource) continue;

        // Item qualified!
        seen.add(key);
        sourceCounts.set(parsed.source, sourceCount + 1);
        qualifiedItems.push(parsed);
      }
    } catch (error) {
      console.error(`Error fetching ${feedUrl}:`, error.message);
    }
  }

  console.log(
    `Processed ${totalProcessed} items, qualified ${qualifiedItems.length}`
  );

  // If still not enough items, try one more pass with maximum relaxation
  if (
    qualifiedItems.length < MIN_ITEMS_REQUIRED &&
    feedsProcessed < feedUrls.length
  ) {
    console.log(
      `EMERGENCY MODE: Only ${qualifiedItems.length} items, trying emergency fetch`
    );

    for (
      let i = feedsProcessed;
      i < Math.min(feedUrls.length, feedsProcessed + 3);
      i++
    ) {
      if (Date.now() - startTime > TIMEOUT_MS) break;

      try {
        const feed = await parser.parseURL(feedUrls[i]);
        const emergencyItems = feed.items.slice(0, 30); // Process many items

        for (const item of emergencyItems) {
          if (qualifiedItems.length >= MIN_ITEMS_REQUIRED) break;

          // Ultra-relaxed parsing - just need title and link
          if (item.title && item.link) {
            const key = item.guid || item.link;
            if (!seen.has(key)) {
              seen.add(key);
              qualifiedItems.push({
                title: item.title.substring(0, 200),
                link: item.link,
                description: item.description?.substring(0, 200) || item.title,
                thumbnail: null,
                allowDefaultIcon: true,
                qualityScore: 0,
                source: getFeedDisplayName(feedUrls[i]),
                sourceUrl: feedUrls[i],
                creator:
                  item.creator ||
                  item.author ||
                  getFeedDisplayName(feedUrls[i]),
                guid: key,
                pubDate: item.pubDate || new Date().toISOString(),
                time: new Date(item.pubDate || Date.now()).toLocaleString(),
              });
            }
          }
        }
      } catch (error) {
        console.error(`Emergency fetch error:`, error.message);
      }
    }
  }

  // Sort by date
  qualifiedItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Final deduplication
  let finalItems = [];
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

    // Skip uncommon word dedup if we don't have enough items
    if (finalItems.length < MIN_ITEMS_REQUIRED) {
      finalItems.push(item);
      continue;
    }

    const titleWords = item.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 4 && !commonWords.has(word));

    const hasDuplicate = titleWords.some((word) => usedUncommonWords.has(word));

    if (!hasDuplicate) {
      finalItems.push(item);
      titleWords.forEach((word) => usedUncommonWords.add(word));
    }
  }

  console.log(
    `Returning ${finalItems.length} items (min required: ${MIN_ITEMS_REQUIRED})`
  );
  return finalItems;
}

// Main handler
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
    const config = getFilterConfig(category, subcategory);

    console.log(`Filter config for ${category}/${subcategory || "none"}:`, {
      maxAgeDays: config.AGE_RULES.MAX_AGE_DAYS,
      minDescLength: config.CONTENT_RULES.MIN_DESCRIPTION_LENGTH,
    });

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

    // Use progressive relaxation fetch
    const finalItems = await fetchFeedsWithProgressiveRelaxation(
      feedUrls,
      category,
      subcategory
    );

    // Log warning if minimum not met
    if (finalItems.length < MIN_ITEMS_REQUIRED) {
      console.error(
        `WARNING: Only ${finalItems.length} items for ${category}/${subcategory}`
      );
    }

    return res.status(200).json({
      items: finalItems,
      count: finalItems.length,
      category,
      subcategory,
      timestamp: new Date().toISOString(),
      success: true,
      minimumMet: finalItems.length >= MIN_ITEMS_REQUIRED,
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
