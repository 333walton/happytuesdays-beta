// api/feeds.js - Production handler with STRICTER quality controls
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

// Track used uncommon words globally to prevent duplicate content
const usedUncommonWords = new Set();

// RSS feed URLs organized by category (keeping existing structure)
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

// Configuration - EXTREMELY STRICT REQUIREMENTS
const MAX_ITEMS = 10;
const MIN_ITEMS_REQUIRED = 5;
const MAX_ITEMS_PER_FEED = 20;
const TARGET_BUFFER = 25;
const MAX_FEEDS_TO_PROCESS = 35; // Process more feeds before giving up
const TIMEOUT_MS = 8500;
const MIN_FEEDS_BEFORE_RELAX = 8; // Don't relax until at least 8 feeds processed
const MIN_QUALITY_FOR_NO_THUMBNAIL = 0.98; // Almost impossible to meet

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

// Shuffle array to randomize feed processing order
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

// Check if article has enough unique uncommon words
const hasUniqueContent = (title, description) => {
  const titleWords = extractUncommonWords(title);
  const descWords = extractUncommonWords(description);
  const allWords = new Set([...titleWords, ...descWords]);

  // Check if at least 3 uncommon words are truly unique (not used before)
  let uniqueCount = 0;
  for (const word of allWords) {
    if (!usedUncommonWords.has(word)) {
      uniqueCount++;
    }
  }

  // Article needs at least 3 unique uncommon words
  if (uniqueCount < 3) {
    return false;
  }

  // Add these words to the used set
  for (const word of allWords) {
    usedUncommonWords.add(word);
  }

  return true;
};

// Validation functions with STRICTER requirements
const containsCodeOrTechnical = (text, relaxed = false) => {
  if (!text) return false;
  // Never skip code check for non-tech categories

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

  const nonLatinPattern = /[^\u0000-\u007F\u0080-\u00FF]/g;
  const matches = text.match(nonLatinPattern) || [];
  const nonLatinRatio = matches.length / text.length;
  return nonLatinRatio <= 0.2; // Stricter than before
};

const isSpamTitle = (title, relaxed = false) => {
  if (!title) return true;

  const specialChars = title.match(/[^\w\s\-.,!?'"]/g) || [];
  const specialRatio = specialChars.length / title.length;
  if (specialRatio > 0.2) return true; // Stricter threshold

  const spamPatterns = [
    /\bclick\s*here\b/i,
    /\bfree\s*download\b/i,
    /\byou\s*won't\s*believe\b/i,
    /\bmust\s*see\b/i,
    /\bshocking\b/i,
  ];
  return spamPatterns.some((pattern) => pattern.test(title));
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

  // Less relaxation when in relaxed mode
  const minLength = relaxed
    ? Math.floor(config.CONTENT_RULES.MIN_DESCRIPTION_LENGTH * 0.75) // Only 25% reduction
    : config.CONTENT_RULES.MIN_DESCRIPTION_LENGTH;

  if (description.length < minLength) {
    return false;
  }

  // Keep most quality checks even when relaxed
  if (!relaxed) {
    if (config.CONTENT_RULES.NO_LOWERCASE_START && /^[a-z]/.test(description)) {
      return false;
    }

    if (
      config.CONTENT_RULES.NO_SPECIAL_CHAR_START &&
      /^[^A-Za-z0-9"']/.test(description)
    ) {
      return false;
    }
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

// Enhanced quality scoring with stricter requirements
const scoreArticleQuality = (item, category, subcategory) => {
  let score = 0;

  // Thumbnail is worth much more
  if (item.thumbnail) score += 0.4;

  // Description quality
  if (item.description) {
    if (item.description.length > 150) score += 0.25;
    else if (item.description.length > 100) score += 0.15;
    else if (item.description.length > 50) score += 0.05;
  }

  // Title quality
  if (item.title) {
    if (item.title.length > 40 && item.title.length < 100) score += 0.1;
    else if (item.title.length > 20) score += 0.05;
  }

  // Recency bonus
  const hoursSincePublished =
    (Date.now() - new Date(item.pubDate)) / (1000 * 60 * 60);
  if (hoursSincePublished < 24) score += 0.2;
  else if (hoursSincePublished < 72) score += 0.1;
  else if (hoursSincePublished < 168) score += 0.05;

  // Category-specific bonuses (reduced)
  if (category === "tech" && item.description?.length > 150) score += 0.03;
  if (category === "builder" && /how|guide|tutorial|tips/i.test(item.title))
    score += 0.03;
  if (category === "art" && item.thumbnail) score += 0.03;

  // Normalize to 0-1 range
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

function validateImage(imgUrl) {
  if (!imgUrl) return false;
  if (typeof imgUrl !== "string") return false;

  const invalidPatterns = [
    /favicon/i,
    /\.ico$/i,
    /logo/i,
    /avatar/i,
    /icon[-_]?\d+x\d+/i,
    /16x16|32x32|48x48|64x64/i,
  ];

  return (
    !invalidPatterns.some((pattern) => pattern.test(imgUrl)) &&
    imgUrl.length > 5
  );
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return null;
  }
}

// Weighted shuffle by quality
function weightedShuffle(articles) {
  return articles
    .map((a) => ({
      ...a,
      weight: Math.pow(a.qualityScore || 0.5, 2) + Math.random() * 0.1,
    }))
    .sort((a, b) => b.weight - a.weight);
}

// Get diversity rules from filterConfig
function getDiversityRules(category, subcategory) {
  const config = getFilterConfig(category, subcategory);

  return {
    QUALITY_SCORE_THRESHOLD:
      config.DIVERSITY_RULES?.QUALITY_SCORE_THRESHOLD || 0.4, // Raised threshold
    QUALITY_SCORE_NO_THUMBNAIL:
      config.DIVERSITY_RULES?.QUALITY_SCORE_NO_THUMBNAIL ||
      MIN_QUALITY_FOR_NO_THUMBNAIL,
    MAX_PER_DOMAIN: config.DIVERSITY_RULES?.MAX_PER_DOMAIN || 2, // Stricter limit
    UNIQUE_DATE_PER_DOMAIN:
      config.DIVERSITY_RULES?.UNIQUE_DATE_PER_DOMAIN !== undefined
        ? config.DIVERSITY_RULES.UNIQUE_DATE_PER_DOMAIN
        : true,
    NO_CONSECUTIVE_SAME_DOMAIN:
      config.DIVERSITY_RULES?.NO_CONSECUTIVE_SAME_DOMAIN !== undefined
        ? config.DIVERSITY_RULES.NO_CONSECUTIVE_SAME_DOMAIN
        : true,
    WEIGHTED_SHUFFLE:
      config.DIVERSITY_RULES?.WEIGHTED_SHUFFLE !== undefined
        ? config.DIVERSITY_RULES.WEIGHTED_SHUFFLE
        : true,
  };
}

// Apply VERY STRICT diversity filters
function applyDiversityFiltersStrict(
  articles,
  category,
  subcategory,
  minRequired = 5
) {
  const rules = getDiversityRules(category, subcategory);

  console.log(
    `Applying STRICT diversity filters to ${articles.length} articles`
  );

  // Step 1: VERY strict quality + thumbnail enforcement
  let filtered = articles.filter((a) => {
    // MUST have valid thumbnail unless nearly perfect
    const hasValidThumbnail = a.thumbnail && validateThumbnail(a.thumbnail);

    if (!hasValidThumbnail && a.qualityScore < 0.98) {
      return false; // Reject almost all articles without thumbnails
    }

    // Higher quality threshold overall
    const qualityThreshold = hasValidThumbnail ? 0.4 : 0.98;
    return (a.qualityScore || 0) >= qualityThreshold;
  });

  console.log(`After strict quality filter: ${filtered.length} articles`);

  // Only relax if absolutely necessary
  if (filtered.length < minRequired) {
    console.log(
      `Emergency: Only ${filtered.length} articles, slightly relaxing`
    );
    filtered = articles.filter((a) => {
      const hasValidThumbnail = a.thumbnail && validateThumbnail(a.thumbnail);
      const minScore = hasValidThumbnail ? 0.35 : 0.95;
      return (a.qualityScore || 0) >= minScore;
    });
  }

  // Step 2: Shuffle weighted by quality
  let shuffled = weightedShuffle(filtered);

  // Step 3: VERY strict domain caps - max 1-2 per domain
  const domainCounts = {};
  const domainDates = {};
  const capped = [];

  for (let article of shuffled) {
    const domain = extractDomain(article.link || article.sourceUrl);
    const pubDate = formatDate(article.pubDate);

    domainCounts[domain] = domainCounts[domain] || 0;
    domainDates[domain] = domainDates[domain] || new Set();

    // VERY strict domain limits
    let maxPerDomain = 1; // Start with just 1
    if (capped.length < minRequired && Object.keys(domainCounts).length > 3) {
      maxPerDomain = 2; // Allow 2 only if we have diverse sources already
    }

    if (domainCounts[domain] >= maxPerDomain) {
      console.log(
        `DOMAIN CAP: Rejecting article from ${domain} (already have ${domainCounts[domain]})`
      );
      continue;
    }

    // Enforce unique-date-per-domain
    if (pubDate && domainDates[domain].has(pubDate)) {
      console.log(`SAME DATE: Rejecting duplicate date article from ${domain}`);
      continue;
    }

    capped.push(article);
    domainCounts[domain]++;
    if (pubDate) domainDates[domain].add(pubDate);
  }

  console.log(`After strict domain diversity: ${capped.length} articles`);
  console.log(`Domain distribution:`, domainCounts);

  // Step 4: Enforce no consecutive same-domain
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

  // Add deferred articles between different domains
  deferred.forEach((article) => {
    const domain = extractDomain(article.link || article.sourceUrl);
    let inserted = false;

    for (let i = spaced.length - 1; i > 0; i--) {
      const prevDomain = extractDomain(
        spaced[i - 1].link || spaced[i - 1].sourceUrl
      );
      const nextDomain = extractDomain(spaced[i].link || spaced[i].sourceUrl);

      if (prevDomain !== domain && nextDomain !== domain) {
        spaced.splice(i, 0, article);
        inserted = true;
        break;
      }
    }

    if (!inserted && spaced.length < MAX_ITEMS) {
      spaced.push(article);
    }
  });

  console.log(`After spacing: ${spaced.length} articles`);
  return spaced;
}

// Apply diversity filters
function applyDiversityFilters(
  articles,
  category,
  subcategory,
  minRequired = 5
) {
  return applyDiversityFiltersStrict(
    articles,
    category,
    subcategory,
    minRequired
  );
}

// Validate if image URL is a real article image
const validateThumbnail = (imgUrl) => {
  if (!imgUrl || typeof imgUrl !== "string") return false;

  // Block all generic/icon images
  const invalidPatterns = [
    /favicon/i,
    /\.ico$/i,
    /logo/i,
    /avatar/i,
    /icon/i,
    /placeholder/i,
    /default/i,
    /fallback/i,
    /missing/i,
    /no-image/i,
    /emoji/i,
    /16x16|32x32|48x48|64x64|128x128/i,
    /\/icons?\//i,
    /feed.*icon/i,
    /rss.*icon/i,
  ];

  // Must have valid image extension or path
  const validImagePattern = /\.(jpg|jpeg|png|webp|gif)($|\?)|\/images?\//i;

  return (
    !invalidPatterns.some((p) => p.test(imgUrl)) &&
    validImagePattern.test(imgUrl)
  );
};

// Parse feed item with STRICTER validation
const parseFeedItem = (
  item,
  source,
  category,
  subcategory,
  relaxFilters = false
) => {
  const config = getFilterConfig(category, subcategory);

  const title = item.title || "Untitled";

  // Less aggressive relaxation
  const minTitleLength = relaxFilters
    ? Math.max(8, Math.floor(config.TITLE_RULES.MIN_LENGTH * 0.8))
    : config.TITLE_RULES.MIN_LENGTH;

  const maxTitleLength = relaxFilters
    ? config.TITLE_RULES.MAX_LENGTH * 1.5
    : config.TITLE_RULES.MAX_LENGTH;

  if (title.length < minTitleLength || title.length > maxTitleLength) {
    return null;
  }

  // Keep most checks even when relaxed
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

  // Age validation
  const pubDate =
    item.pubDate || item.isoDate || item.published || new Date().toISOString();
  const articleAge = Date.now() - new Date(pubDate);
  const maxAgeDays = relaxFilters
    ? config.AGE_RULES.MAX_AGE_DAYS * 1.5
    : config.AGE_RULES.MAX_AGE_DAYS;
  const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;

  if (articleAge > maxAge) {
    return null;
  }

  // Extract thumbnail with strict validation
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

  if (
    item.enclosure &&
    item.enclosure.url &&
    item.enclosure.type?.startsWith("image/")
  ) {
    thumbnailCandidates.push(item.enclosure.url);
  }

  // Find first valid thumbnail
  for (const candidate of thumbnailCandidates) {
    if (validateThumbnail(candidate)) {
      thumbnail = candidate;
      break;
    }
  }

  // Extract and validate description with relaxation parameter
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

  // Check for unique content using uncommon words
  if (!relaxFilters && !hasUniqueContent(title, description)) {
    return null; // Skip articles with too much duplicate content
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

  // EXTREMELY STRICT thumbnail requirements
  let allowDefaultIcon = false;
  if (!thumbnail || !validateThumbnail(thumbnail)) {
    // Almost never allow articles without real thumbnails
    if (qualityScore >= 0.98) {
      // Only for essentially perfect articles
      allowDefaultIcon = true;
      console.log(
        `RARE: Allowing no-thumbnail article with score ${qualityScore}: ${title}`
      );
    } else {
      console.log(
        `REJECTED: No valid thumbnail for ${title} (score: ${qualityScore})`
      );
      return null; // Reject ALL articles without real thumbnails
    }
  }

  // Skip promotional content
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

// MAIN FETCH WITH STRICTER CONTROLS AND BETTER RANDOMIZATION
async function fetchFeedsWithProgressiveRelaxation(
  feedUrls,
  category,
  subcategory
) {
  const qualifiedItems = [];
  const seen = new Set();
  const sourceCounts = new Map();
  const domainCounts = new Map();
  let totalProcessed = 0;
  const startTime = Date.now();
  let relaxFilters = false;
  let feedsProcessed = 0;

  // Clear uncommon words tracker for new fetch
  usedUncommonWords.clear();

  // RANDOMIZE feed order to avoid always starting with same sources
  const shuffledFeeds = shuffleArray(feedUrls);

  // Also randomize which feed to start with
  const startIndex = Math.floor(
    Math.random() * Math.min(3, shuffledFeeds.length)
  );
  const reorderedFeeds = [
    ...shuffledFeeds.slice(startIndex),
    ...shuffledFeeds.slice(0, startIndex),
  ];

  console.log(
    `Starting fetch for ${reorderedFeeds.length} feeds (randomized order)`
  );
  console.log(`Category: ${category}, Subcategory: ${subcategory || "none"}`);
  console.log(
    `First feeds:`,
    reorderedFeeds.slice(0, 3).map(getFeedDisplayName)
  );

  const config = getFilterConfig(category, subcategory);

  // Process feeds with less aggressive relaxation
  for (
    let i = 0;
    i < Math.min(reorderedFeeds.length, MAX_FEEDS_TO_PROCESS);
    i++
  ) {
    const feedUrl = reorderedFeeds[i];

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

    // VERY CONSERVATIVE RELAXATION: Only relax after many feeds processed
    if (feedsProcessed >= 8 && qualifiedItems.length < MIN_ITEMS_REQUIRED) {
      if (!relaxFilters) {
        console.log(
          `MILD RELAXATION: Only ${qualifiedItems.length} items after ${feedsProcessed} feeds`
        );
        relaxFilters = true;
      }
    }

    try {
      const feed = await parser.parseURL(feedUrl);
      feedsProcessed++;

      const itemsToProcess = feed.items.slice(0, MAX_ITEMS_PER_FEED);

      console.log(
        `Processing ${itemsToProcess.length} items from ${getFeedDisplayName(
          feedUrl
        )}, relaxed: ${relaxFilters}`
      );

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

        // VERY STRICT domain limits - max 1 per domain initially
        const domain = extractDomain(parsed.link || feedUrl);
        const currentDomainCount = domainCounts.get(domain) || 0;

        // Start with 1 per domain, only increase if we need more items
        let maxPerDomain = 1;
        if (qualifiedItems.length < MIN_ITEMS_REQUIRED && feedsProcessed > 4) {
          maxPerDomain = 2;
        }
        if (relaxFilters && qualifiedItems.length < 3) {
          maxPerDomain = 3;
        }

        if (currentDomainCount >= maxPerDomain) {
          console.log(
            `DOMAIN LIMIT: Skipping article from ${domain} (already have ${currentDomainCount})`
          );
          continue;
        }

        // Source limit
        const sourceCount = sourceCounts.get(parsed.source) || 0;
        if (sourceCount >= 2) continue;

        seen.add(key);
        sourceCounts.set(parsed.source, sourceCount + 1);
        domainCounts.set(domain, currentDomainCount + 1);
        qualifiedItems.push(parsed);

        console.log(
          `ACCEPTED: "${parsed.title.substring(
            0,
            50
          )}..." from ${domain} (domain count: ${currentDomainCount + 1})`
        );
      }
    } catch (error) {
      console.error(`Error fetching ${feedUrl}:`, error.message);
    }
  }

  console.log(
    `Processed ${totalProcessed} items, qualified ${qualifiedItems.length}`
  );
  console.log(`Domain distribution:`, Object.fromEntries(domainCounts));

  // NO EMERGENCY MODE - maintain quality standards

  // Sort by date
  qualifiedItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Apply strict diversity filters with even stricter domain limits
  const diversityFiltered = applyDiversityFiltersStrict(
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

    // Use progressive relaxation fetch with stricter requirements
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

    // Calculate domain diversity metrics
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
          finalItems.length,
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
