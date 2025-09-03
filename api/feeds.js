// api/feeds.js - BALANCED handler with quality controls and better error handling
import Parser from "rss-parser";
import { getFilterConfig, qualifiesForDefaultIcon } from "../filterConfig.js";

const parser = new Parser({
  timeout: 5000, // 5 second timeout per feed
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
const MAX_ITEMS_PER_FEED = 15; // Reduced to process faster
const TARGET_BUFFER = 20; // Reduced for faster processing
const MAX_FEEDS_TO_PROCESS = 8; // Process fewer feeds to avoid timeout
const TIMEOUT_MS = 7000; // 7 seconds to leave room for response
const MIN_FEEDS_BEFORE_RELAX = 4; // Relax sooner to ensure we get enough items

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

// Check if article has unique content
const hasUniqueContent = (title, description) => {
  const titleWords = extractUncommonWords(title);
  const descWords = extractUncommonWords(description);
  const allWords = new Set([...titleWords, ...descWords]);

  // Check for minimum unique uncommon words
  let uniqueCount = 0;
  for (const word of allWords) {
    if (!usedUncommonWords.has(word)) {
      uniqueCount++;
      if (uniqueCount >= 2) break; // Reduced from 3 to 2 for more articles
    }
  }

  if (uniqueCount < 2) return false;

  // Add words to used set
  for (const word of allWords) {
    usedUncommonWords.add(word);
  }

  return true;
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
    (validImagePattern.test(imgUrl) ||
      imgUrl.includes("/media/") ||
      imgUrl.includes("/uploads/"))
  );
};

// Extract best thumbnail from item
const extractThumbnail = (item) => {
  const candidates = [];

  // Check media:thumbnail
  if (item["media:thumbnail"]) {
    const url = item["media:thumbnail"].$
      ? item["media:thumbnail"].$.url
      : item["media:thumbnail"];
    if (url) candidates.push(url);
  }

  // Check media:content
  if (item["media:content"] && Array.isArray(item["media:content"])) {
    item["media:content"].forEach((media) => {
      if (media.$ && media.$.medium === "image" && media.$.url) {
        candidates.push(media.$.url);
      }
    });
  }

  // Check enclosure
  if (
    item.enclosure &&
    item.enclosure.url &&
    item.enclosure.type?.startsWith("image/")
  ) {
    candidates.push(item.enclosure.url);
  }

  // Return first valid thumbnail
  for (const candidate of candidates) {
    if (validateThumbnail(candidate)) {
      return candidate;
    }
  }

  return null;
};

// Validation functions
const isLikelyEnglish = (text) => {
  if (!text) return true;
  const nonLatinPattern = /[^\u0000-\u007F\u0080-\u00FF]/g;
  const matches = text.match(nonLatinPattern) || [];
  return matches.length / text.length <= 0.3;
};

const isSpamTitle = (title) => {
  if (!title) return true;

  const specialChars = title.match(/[^\w\s\-.,!?'"]/g) || [];
  if (specialChars.length / title.length > 0.3) return true;

  const spamPatterns = [
    /\bclick\s*here\b/i,
    /\bfree\s*download\b/i,
    /\byou\s*won't\s*believe\b/i,
  ];

  return spamPatterns.some((pattern) => pattern.test(title));
};

const cleanDescription = (rawDescription, title, category, subcategory) => {
  if (!rawDescription) return "";

  const config = getFilterConfig(category, subcategory);

  let cleaned = rawDescription.replace(/<[^>]*>/g, " ");
  cleaned = cleaned.replace(/&[a-z]+;/gi, " ");
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, "");
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Check for code content only in non-tech categories
  if (config.CONTENT_RULES.NO_CODE_CONTENT) {
    const codePatterns = [
      /function\s*\(/,
      /\=\>/,
      /console\./,
      /import\s+.*from/,
    ];
    if (codePatterns.some((p) => p.test(cleaned))) return "";
  }

  if (cleaned.length > 250) {
    cleaned = cleaned.substring(0, 247) + "...";
  }

  return cleaned;
};

// Quality scoring
const scoreArticleQuality = (item, category) => {
  let score = 0;

  // Thumbnail worth significant points
  if (item.thumbnail && validateThumbnail(item.thumbnail)) {
    score += 0.35;
  }

  // Description quality
  if (item.description) {
    if (item.description.length > 100) score += 0.2;
    else if (item.description.length > 50) score += 0.1;
  }

  // Title quality
  if (item.title && item.title.length > 20 && item.title.length < 100) {
    score += 0.1;
  }

  // Recency
  const hoursSincePublished =
    (Date.now() - new Date(item.pubDate)) / (1000 * 60 * 60);
  if (hoursSincePublished < 24) score += 0.2;
  else if (hoursSincePublished < 72) score += 0.1;
  else if (hoursSincePublished < 168) score += 0.05;

  // Category bonuses
  if (category === "tech" && item.description?.length > 100) score += 0.05;
  if (category === "art" && item.thumbnail) score += 0.05;

  return Math.min(1, score);
};

// Extract domain from URL
const extractDomain = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

// Parse feed item with balanced validation
const parseFeedItem = (
  item,
  source,
  category,
  subcategory,
  relaxFilters = false
) => {
  const config = getFilterConfig(category, subcategory);
  const title = item.title || "Untitled";

  // Title validation
  const minTitleLength = relaxFilters ? 8 : config.TITLE_RULES.MIN_LENGTH;
  const maxTitleLength = relaxFilters ? 120 : config.TITLE_RULES.MAX_LENGTH;

  if (title.length < minTitleLength || title.length > maxTitleLength) {
    return null;
  }

  if (!relaxFilters) {
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
  }

  // Age validation
  const pubDate =
    item.pubDate || item.isoDate || item.published || new Date().toISOString();
  const articleAge = Date.now() - new Date(pubDate);
  const maxAgeDays = relaxFilters
    ? config.AGE_RULES.MAX_AGE_DAYS * 2
    : config.AGE_RULES.MAX_AGE_DAYS;

  if (articleAge > maxAgeDays * 24 * 60 * 60 * 1000) {
    return null;
  }

  // Extract thumbnail
  const thumbnail = extractThumbnail(item);

  // Extract and clean description
  let description =
    item.contentSnippet || item.description || item.summary || "";
  description = cleanDescription(description, title, category, subcategory);

  const minDescLength = relaxFilters
    ? 20
    : config.CONTENT_RULES.MIN_DESCRIPTION_LENGTH;
  if (!description || description.length < minDescLength) {
    if (relaxFilters && title.length > 30) {
      description = title; // Use title as description when relaxed
    } else {
      return null;
    }
  }

  // Check unique content (less strict when relaxed)
  if (!relaxFilters && !hasUniqueContent(title, description)) {
    return null;
  }

  // Calculate quality score
  const qualityScore = scoreArticleQuality(
    {
      title,
      description,
      thumbnail,
      pubDate,
    },
    category
  );

  // Thumbnail requirements - BALANCED approach
  let allowDefaultIcon = false;
  if (!thumbnail) {
    // Allow high-quality articles without thumbnails more leniently
    const minQualityForNoThumb = relaxFilters ? 0.5 : 0.7;

    if (qualityScore >= minQualityForNoThumb) {
      allowDefaultIcon = true;
    } else {
      return null;
    }
  }

  // Check promotional keywords
  if (!relaxFilters && config.PROMOTIONAL_KEYWORDS) {
    const titleLower = title.toLowerCase();
    for (const keyword of config.PROMOTIONAL_KEYWORDS) {
      if (
        typeof keyword === "string" &&
        titleLower.includes(keyword.toLowerCase())
      ) {
        return null;
      }
    }
  }

  return {
    title,
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

// Apply diversity filters
const applyDiversityFilters = (
  articles,
  category,
  subcategory,
  minRequired = 5
) => {
  const config = getFilterConfig(category, subcategory);

  // Sort by quality score
  const sorted = articles.sort(
    (a, b) => (b.qualityScore || 0) - (a.qualityScore || 0)
  );

  // Apply domain limits
  const domainCounts = {};
  const filtered = [];
  const maxPerDomain = config.DIVERSITY_RULES?.MAX_PER_DOMAIN || 2;

  for (const article of sorted) {
    const domain = extractDomain(article.link || article.sourceUrl);
    domainCounts[domain] = domainCounts[domain] || 0;

    // Allow more from same domain if we need minimum items
    const effectiveMax =
      filtered.length < minRequired ? maxPerDomain + 1 : maxPerDomain;

    if (domainCounts[domain] < effectiveMax) {
      filtered.push(article);
      domainCounts[domain]++;
    }

    if (filtered.length >= MAX_ITEMS) break;
  }

  return filtered;
};

// Main fetch function with better error handling
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

  console.log(
    `Processing ${Math.min(
      shuffledFeeds.length,
      MAX_FEEDS_TO_PROCESS
    )} feeds for ${category}/${subcategory || "all"}`
  );

  // Process feeds
  for (
    let i = 0;
    i < Math.min(shuffledFeeds.length, MAX_FEEDS_TO_PROCESS);
    i++
  ) {
    const feedUrl = shuffledFeeds[i];

    // Check timeout with buffer
    if (Date.now() - startTime > TIMEOUT_MS) {
      console.log(
        `Approaching timeout, stopping after ${feedsProcessed} feeds`
      );
      break;
    }

    // Check if we have enough items
    if (qualifiedItems.length >= TARGET_BUFFER) {
      console.log(`Target buffer reached: ${qualifiedItems.length} items`);
      break;
    }

    // Progressive relaxation
    if (
      feedsProcessed >= MIN_FEEDS_BEFORE_RELAX &&
      qualifiedItems.length < MIN_ITEMS_REQUIRED / 2
    ) {
      if (!relaxFilters) {
        console.log(
          `Relaxing filters after ${feedsProcessed} feeds (only ${qualifiedItems.length} items)`
        );
        relaxFilters = true;
      }
    }

    try {
      // Add timeout to individual feed parsing
      const feedPromise = parser.parseURL(feedUrl);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Feed timeout")), 3000)
      );

      const feed = await Promise.race([feedPromise, timeoutPromise]);
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

        // Domain limiting (start lenient, get stricter)
        const domain = extractDomain(parsed.link || feedUrl);
        const currentDomainCount = domainCounts.get(domain) || 0;

        let maxPerDomain = 2;
        if (qualifiedItems.length < MIN_ITEMS_REQUIRED) {
          maxPerDomain = 3; // Allow more when we need items
        }

        if (currentDomainCount >= maxPerDomain) continue;

        seen.add(key);
        domainCounts.set(domain, currentDomainCount + 1);
        qualifiedItems.push(parsed);
      }
    } catch (error) {
      console.log(
        `Feed error (${getFeedDisplayName(feedUrl)}): ${error.message}`
      );
      // Continue to next feed instead of failing
    }
  }

  console.log(
    `Processed ${totalProcessed} items, qualified ${qualifiedItems.length}`
  );

  // If we have very few items, do one more relaxed pass
  if (
    qualifiedItems.length < MIN_ITEMS_REQUIRED &&
    feedsProcessed < shuffledFeeds.length
  ) {
    console.log(
      `Emergency pass: only ${qualifiedItems.length} items, trying more feeds with relaxed filters`
    );
    relaxFilters = true;

    for (
      let i = feedsProcessed;
      i < Math.min(shuffledFeeds.length, feedsProcessed + 3);
      i++
    ) {
      if (Date.now() - startTime > TIMEOUT_MS) break;

      try {
        const feedUrl = shuffledFeeds[i];
        const feed = await parser.parseURL(feedUrl);

        for (const item of feed.items.slice(0, 10)) {
          if (qualifiedItems.length >= MIN_ITEMS_REQUIRED) break;

          const parsed = parseFeedItem(
            item,
            feedUrl,
            category,
            subcategory,
            true
          );
          if (!parsed) continue;

          const key = parsed.guid || parsed.link;
          if (!seen.has(key)) {
            seen.add(key);
            qualifiedItems.push(parsed);
          }
        }
      } catch (error) {
        console.log(`Emergency pass error: ${error.message}`);
      }
    }
  }

  // Sort by date
  qualifiedItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Apply diversity filters
  const finalItems = applyDiversityFilters(
    qualifiedItems,
    category,
    subcategory,
    MIN_ITEMS_REQUIRED
  );

  console.log(`Final: ${finalItems.length} items returned`);
  return finalItems.slice(0, MAX_ITEMS);
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

    // Fetch with progressive relaxation
    const finalItems = await fetchFeedsWithProgressiveRelaxation(
      feedUrls,
      category,
      subcategory
    );

    // Calculate metrics
    const domainCounts = {};
    let thumbnailCount = 0;

    finalItems.forEach((item) => {
      const domain = extractDomain(item.link || item.sourceUrl);
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      if (item.thumbnail) thumbnailCount++;
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
          finalItems.length > 0
            ? (
                finalItems.reduce(
                  (sum, item) => sum + (item.qualityScore || 0),
                  0
                ) / finalItems.length
              ).toFixed(2)
            : 0,
        withThumbnails: thumbnailCount,
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
