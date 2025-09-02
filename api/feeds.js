// api/feeds.js - BALANCED handler with quality controls and practical limits
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

// Common words for uniqueness filtering
const commonWords = new Set([
  "the",
  "be",
  "to",
  "of",
  "and",
  "a",
  "in",
  "that",
  "have",
  "i",
  "it",
  "for",
  "not",
  "on",
  "with",
  "he",
  "as",
  "you",
  "do",
  "at",
  "this",
  "but",
  "his",
  "by",
  "from",
  "they",
  "we",
  "say",
  "her",
  "she",
  "or",
  "an",
  "will",
  "my",
  "one",
  "all",
  "would",
  "there",
  "their",
  "what",
  "so",
  "up",
  "out",
  "if",
  "about",
  "who",
  "get",
  "which",
  "go",
  "me",
  "when",
  "make",
  "can",
  "like",
  "time",
  "no",
  "just",
  "him",
  "know",
  "take",
  "people",
  "into",
  "year",
  "your",
  "good",
  "some",
  "could",
  "them",
  "see",
  "other",
  "than",
  "then",
  "now",
  "look",
  "only",
  "come",
  "its",
  "over",
  "think",
  "also",
  "back",
  "after",
  "use",
  "two",
  "how",
  "our",
  "work",
  "first",
  "well",
  "way",
  "even",
  "new",
  "want",
  "because",
  "any",
  "these",
  "give",
  "day",
  "most",
  "us",
  "is",
  "was",
  "are",
  "been",
  "has",
  "had",
  "were",
  "said",
  "did",
  "been",
  "have",
  "has",
  "had",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "can",
  "shall",
  "more",
  "very",
]);

// Track used uncommon words per session
const usedUncommonWords = new Set();

// RSS feed URLs (keeping existing structure)
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
      "https://arxiv-sanity-lite.com/feed/?query=cs.AI",
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

// BALANCED Configuration
const MAX_ITEMS = 10;
const MIN_ITEMS_REQUIRED = 5;
const MAX_ITEMS_PER_FEED = 10; // Reduced to prevent timeout
const TARGET_BUFFER = 20; // Reduced buffer
const MAX_FEEDS_TO_PROCESS = 30; // Reduced to prevent timeout
const TIMEOUT_MS = 7500; // Shorter timeout to prevent 504
const MIN_FEEDS_BEFORE_RELAX = 20; // Relax sooner if needed

// Helper functions
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

// Shuffle array for randomization
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Extract uncommon words from text
const extractUncommonWords = (text) => {
  if (!text) return new Set();

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.has(word));

  return new Set(words);
};

// Check if article has unique content (BALANCED)
const hasUniqueContent = (title, description, relaxed = false) => {
  if (relaxed) return true; // Skip when relaxed

  const titleWords = extractUncommonWords(title);
  const descWords = extractUncommonWords(description);
  const allWords = new Set([...titleWords, ...descWords]);

  // Check for minimum unique uncommon words
  let uniqueCount = 0;
  for (const word of allWords) {
    if (!usedUncommonWords.has(word)) {
      uniqueCount++;
      if (uniqueCount >= 2) break; // Only need 2 unique words
    }
  }

  if (uniqueCount < 2) {
    return false;
  }

  // Add words to used set
  for (const word of allWords) {
    usedUncommonWords.add(word);
  }

  return true;
};

// Validation functions (BALANCED)
const containsCodeOrTechnical = (text, relaxed = false) => {
  if (!text) return false;
  if (relaxed) return false; // Skip when relaxed

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
  if (relaxed) return true; // Skip when relaxed

  const nonLatinPattern = /[^\u0000-\u007F\u0080-\u00FF]/g;
  const matches = text.match(nonLatinPattern) || [];
  const nonLatinRatio = matches.length / text.length;
  return nonLatinRatio <= 0.3;
};

const isSpamTitle = (title, relaxed = false) => {
  if (!title) return true;
  if (relaxed) return false; // More lenient when relaxed

  const specialChars = title.match(/[^\w\s\-.,!?'"]/g) || [];
  const specialRatio = specialChars.length / title.length;
  if (specialRatio > 0.25) return true;

  const spamPatterns = [
    /\bclick\s*here\b/i,
    /\bfree\s*download\b/i,
    /\byou\s*won't\s*believe\b/i,
  ];
  return spamPatterns.some((pattern) => pattern.test(title));
};

// Validate thumbnail URL
const validateThumbnail = (imgUrl) => {
  if (!imgUrl || typeof imgUrl !== "string") return false;

  // Block generic/icon images
  const invalidPatterns = [
    /favicon/i,
    /\.ico$/i,
    /logo/i,
    /avatar/i,
    /icon[-_]?\d+x\d+/i,
    /16x16|32x32|48x48|64x64|128x128/i,
    /\/icons?\//i,
    /placeholder/i,
    /default[-_]?image/i,
    /no[-_]?image/i,
  ];

  if (invalidPatterns.some((p) => p.test(imgUrl))) {
    return false;
  }

  // Check for valid image extension or path
  const validImagePattern = /\.(jpg|jpeg|png|webp|gif)($|\?)|\/images?\//i;
  return validImagePattern.test(imgUrl);
};

const isValidDescription = (
  description,
  title,
  category,
  subcategory,
  relaxed = false
) => {
  if (!description) return false;

  const config = getFilterConfig(category, subcategory);

  // Moderate relaxation
  const minLength = relaxed
    ? Math.floor(config.CONTENT_RULES.MIN_DESCRIPTION_LENGTH * 0.6)
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

// BALANCED quality scoring
const scoreArticleQuality = (item, category, subcategory) => {
  let score = 0;

  // Thumbnail worth significant points
  if (item.thumbnail && validateThumbnail(item.thumbnail)) {
    score += 0.35;
  }

  // Description quality
  if (item.description) {
    if (item.description.length > 150) score += 0.2;
    else if (item.description.length > 100) score += 0.15;
    else if (item.description.length > 50) score += 0.1;
  }

  // Title quality
  if (item.title) {
    if (item.title.length > 30 && item.title.length < 100) score += 0.1;
    else if (item.title.length > 15) score += 0.05;
  }

  // Recency bonus
  const hoursSincePublished =
    (Date.now() - new Date(item.pubDate)) / (1000 * 60 * 60);
  if (hoursSincePublished < 24) score += 0.2;
  else if (hoursSincePublished < 72) score += 0.15;
  else if (hoursSincePublished < 168) score += 0.05;

  // Category bonuses
  if (category === "tech" && item.description?.length > 100) score += 0.05;
  if (category === "builder" && /how|guide|tutorial/i.test(item.title))
    score += 0.05;
  if (category === "art" && item.thumbnail) score += 0.05;

  return Math.min(1, score);
};

// Domain extraction
function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return null;
  }
}

// Weighted shuffle
function weightedShuffle(articles) {
  return articles
    .map((a) => ({
      ...a,
      weight: Math.pow(a.qualityScore || 0.5, 2) + Math.random() * 0.1,
    }))
    .sort((a, b) => b.weight - a.weight);
}

// Parse feed item (BALANCED)
const parseFeedItem = (
  item,
  source,
  category,
  subcategory,
  relaxFilters = false
) => {
  const config = getFilterConfig(category, subcategory);
  const title = item.title || "Untitled";

  // Title validation (balanced)
  const minTitleLength = relaxFilters
    ? Math.max(5, Math.floor(config.TITLE_RULES.MIN_LENGTH * 0.6))
    : config.TITLE_RULES.MIN_LENGTH;

  const maxTitleLength = relaxFilters
    ? config.TITLE_RULES.MAX_LENGTH * 1.5
    : config.TITLE_RULES.MAX_LENGTH;

  if (title.length < minTitleLength || title.length > maxTitleLength) {
    return null;
  }

  // Skip strict checks when relaxed
  if (!relaxFilters) {
    if (
      config.TITLE_RULES.NO_ALL_CAPS &&
      title === title.toUpperCase() &&
      title.length > 10
    ) {
      return null;
    }

    if (isSpamTitle(title, relaxFilters)) {
      return null;
    }

    if (!isLikelyEnglish(title, relaxFilters)) {
      return null;
    }
  }

  // Age validation
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
  let thumbnailCandidates = [];

  if (item["media:thumbnail"]) {
    const url = item["media:thumbnail"].$
      ? item["media:thumbnail"].$.url
      : item["media:thumbnail"];
    if (url) thumbnailCandidates.push(url);
  }

  if (item["media:content"] && Array.isArray(item["media:content"])) {
    item["media:content"].forEach((media) => {
      if (media.$ && media.$.medium === "image" && media.$.url) {
        thumbnailCandidates.push(media.$.url);
      }
    });
  }

  // Find first valid thumbnail
  for (const candidate of thumbnailCandidates) {
    if (validateThumbnail(candidate)) {
      thumbnail = candidate;
      break;
    }
  }

  // Extract and clean description
  let description =
    item.contentSnippet || item.description || item.summary || "";
  description = cleanDescription(description, title, category, subcategory);

  if (
    !isValidDescription(description, title, category, subcategory, relaxFilters)
  ) {
    if (relaxFilters && !description) {
      description = title;
    } else if (!relaxFilters) {
      return null;
    }
  }

  // Check unique content (skip when relaxed)
  if (!relaxFilters && !hasUniqueContent(title, description, relaxFilters)) {
    return null;
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

  // BALANCED thumbnail requirements
  let allowDefaultIcon = false;
  if (!thumbnail || !validateThumbnail(thumbnail)) {
    // High quality threshold for no thumbnail, but not impossible
    const threshold = relaxFilters ? 0.6 : 0.75;

    if (qualityScore >= threshold) {
      allowDefaultIcon = true;
    } else {
      return null; // Reject low quality without thumbnail
    }
  }

  // Promotional content check (skip when very relaxed)
  if (!relaxFilters) {
    const promotionalKeywords = config.PROMOTIONAL_KEYWORDS || [];
    const titleLower = title.toLowerCase();

    for (const keyword of promotionalKeywords) {
      if (
        typeof keyword === "string" &&
        titleLower.includes(keyword.toLowerCase())
      ) {
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

// PROGRESSIVE FETCH WITH BALANCED RELAXATION
async function fetchFeedsWithProgressiveRelaxation(
  feedUrls,
  category,
  subcategory
) {
  const qualifiedItems = [];
  const seen = new Set();
  const domainCounts = new Map();
  let totalProcessed = 0;
  const startTime = Date.now();
  let relaxFilters = false;
  let feedsProcessed = 0;

  // Clear uncommon words tracker
  usedUncommonWords.clear();

  // Randomize feed order
  const shuffledFeeds = shuffleArray(feedUrls);

  console.log(`Starting progressive fetch for ${shuffledFeeds.length} feeds`);
  console.log(`Category: ${category}, Subcategory: ${subcategory || "none"}`);

  const config = getFilterConfig(category, subcategory);

  // Process feeds with progressive relaxation
  for (
    let i = 0;
    i < Math.min(shuffledFeeds.length, MAX_FEEDS_TO_PROCESS);
    i++
  ) {
    const feedUrl = shuffledFeeds[i];

    // Timeout check
    if (Date.now() - startTime > TIMEOUT_MS) {
      console.log(
        `TIMEOUT: Stopping after ${i} feeds (${Date.now() - startTime}ms)`
      );
      break;
    }

    // Check if we have enough items
    if (qualifiedItems.length >= TARGET_BUFFER) {
      console.log(`SUCCESS: ${qualifiedItems.length} items collected`);
      break;
    }

    // Progressive relaxation based on results
    if (
      feedsProcessed >= MIN_FEEDS_BEFORE_RELAX &&
      qualifiedItems.length < MIN_ITEMS_REQUIRED
    ) {
      if (!relaxFilters) {
        console.log(
          `RELAXING FILTERS: Only ${qualifiedItems.length} items after ${feedsProcessed} feeds`
        );
        relaxFilters = true;
      }
    }

    try {
      const feedStartTime = Date.now();
      const feed = await parser.parseURL(feedUrl);
      const feedParseTime = Date.now() - feedStartTime;

      console.log(
        `Feed ${getFeedDisplayName(feedUrl)} parsed in ${feedParseTime}ms`
      );

      feedsProcessed++;

      const itemsToProcess = feed.items.slice(0, MAX_ITEMS_PER_FEED);

      for (const item of itemsToProcess) {
        totalProcessed++;

        if (qualifiedItems.length >= TARGET_BUFFER) break;

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

        // Domain limiting (balanced)
        const domain = extractDomain(parsed.link || feedUrl);
        const currentDomainCount = domainCounts.get(domain) || 0;

        // Progressive domain limits
        let maxPerDomain = 2; // Start with 2
        if (qualifiedItems.length < MIN_ITEMS_REQUIRED && feedsProcessed > 3) {
          maxPerDomain = 3; // Allow 3 if struggling
        }
        if (relaxFilters) {
          maxPerDomain = 4; // Allow 4 when relaxed
        }

        if (currentDomainCount >= maxPerDomain) {
          continue;
        }

        seen.add(key);
        domainCounts.set(domain, currentDomainCount + 1);
        qualifiedItems.push(parsed);
      }
    } catch (error) {
      console.error(`Error fetching ${feedUrl}:`, error.message);
    }
  }

  console.log(
    `Processed ${totalProcessed} items, qualified ${qualifiedItems.length}`
  );

  // If still very few items, try emergency relaxation
  if (
    qualifiedItems.length < MIN_ITEMS_REQUIRED &&
    feedsProcessed < feedUrls.length
  ) {
    console.log(
      `EMERGENCY: Only ${qualifiedItems.length} items, trying emergency fetch`
    );

    for (
      let i = feedsProcessed;
      i < Math.min(feedUrls.length, feedsProcessed + 2);
      i++
    ) {
      if (Date.now() - startTime > TIMEOUT_MS) break;

      try {
        const feed = await parser.parseURL(shuffledFeeds[i]);
        const emergencyItems = feed.items.slice(0, 10);

        for (const item of emergencyItems) {
          if (qualifiedItems.length >= MIN_ITEMS_REQUIRED) break;

          // Very relaxed parsing
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
                qualityScore: 0.3,
                source: getFeedDisplayName(shuffledFeeds[i]),
                sourceUrl: shuffledFeeds[i],
                creator:
                  item.creator ||
                  item.author ||
                  getFeedDisplayName(shuffledFeeds[i]),
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

  // Apply balanced diversity filters
  const diversityFiltered = applyDiversityFilters(
    qualifiedItems,
    category,
    subcategory,
    MIN_ITEMS_REQUIRED
  );

  // Take only required number
  const finalItems = diversityFiltered.slice(0, MAX_ITEMS);

  console.log(
    `Final output: ${finalItems.length} items (min required: ${MIN_ITEMS_REQUIRED})`
  );
  return finalItems;
}

// Apply diversity filters (BALANCED)
function applyDiversityFilters(
  articles,
  category,
  subcategory,
  minRequired = 5
) {
  const config = getFilterConfig(category, subcategory);

  console.log(`Applying diversity filters to ${articles.length} articles`);

  // Step 1: Quality filtering (balanced)
  let filtered = articles.filter((a) => {
    const hasValidThumbnail = a.thumbnail && validateThumbnail(a.thumbnail);

    // Balanced thresholds
    const qualityThreshold = hasValidThumbnail ? 0.35 : 0.7;
    return (a.qualityScore || 0) >= qualityThreshold;
  });

  console.log(`After quality filter: ${filtered.length} articles`);

  // Relax if needed
  if (filtered.length < minRequired) {
    console.log(`Relaxing quality threshold for minimum items`);
    filtered = articles.filter((a) => (a.qualityScore || 0) >= 0.25);
  }

  // Step 2: Weighted shuffle
  let shuffled = weightedShuffle(filtered);

  // Step 3: Domain caps (balanced)
  const domainCounts = {};
  const domainDates = {};
  const capped = [];

  for (let article of shuffled) {
    const domain = extractDomain(article.link || article.sourceUrl);
    const pubDate = formatDate(article.pubDate);

    domainCounts[domain] = domainCounts[domain] || 0;
    domainDates[domain] = domainDates[domain] || new Set();

    // Balanced domain limits
    let maxPerDomain = 2;
    if (capped.length < minRequired) {
      maxPerDomain = 3; // Allow more if needed
    }

    if (domainCounts[domain] >= maxPerDomain) continue;

    // Check unique date per domain
    if (
      pubDate &&
      domainDates[domain].has(pubDate) &&
      capped.length >= minRequired
    ) {
      continue;
    }

    capped.push(article);
    domainCounts[domain]++;
    if (pubDate) domainDates[domain].add(pubDate);
  }

  // Step 4: Space out same domains
  const spaced = [];
  const deferred = [];

  capped.forEach((article) => {
    const domain = extractDomain(article.link || article.sourceUrl);
    const lastArticle = spaced[spaced.length - 1];
    const lastDomain = lastArticle
      ? extractDomain(lastArticle.link || lastArticle.sourceUrl)
      : null;

    if (!lastDomain || lastDomain !== domain) {
      spaced.push(article);
    } else {
      deferred.push(article);
    }
  });

  // Insert deferred articles
  deferred.forEach((article) => {
    if (spaced.length < MAX_ITEMS) {
      spaced.push(article);
    }
  });

  console.log(`After diversity: ${spaced.length} articles`);
  return spaced;
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

    // Use balanced progressive fetch
    const finalItems = await fetchFeedsWithProgressiveRelaxation(
      feedUrls,
      category,
      subcategory
    );

    // Ensure minimum items
    if (finalItems.length < MIN_ITEMS_REQUIRED) {
      console.warn(
        `WARNING: Only ${finalItems.length} items for ${category}/${subcategory}`
      );
    }

    // Calculate metrics
    const domainCounts = {};
    finalItems.forEach((item) => {
      const domain = extractDomain(item.link || item.sourceUrl);
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    });

    return res.status(200).json({
      items: finalItems,
      count: finalItems.length,
      category,
      subcategory,
      timestamp: new Date().toISOString(),
      success: true,
      minimumMet: finalItems.length >= MIN_ITEMS_REQUIRED,
      diversity: {
        uniqueDomains: Object.keys(domainCounts).length,
        avgQualityScore:
          finalItems.reduce((sum, item) => sum + (item.qualityScore || 0), 0) /
          (finalItems.length || 1),
        withThumbnails: finalItems.filter((item) => item.thumbnail).length,
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
