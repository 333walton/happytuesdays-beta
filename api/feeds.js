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
      "https://openai.com/news/rss/", // OpenAI news, research
      "https://cloud.google.com/blog/products/ai-machine-learning/rss/", // Google Cloud AI, ML tools
      "https://news.mit.edu/topic/artificial-intelligence2/rss.xml", // MIT AI research
      "https://machinelearningmastery.com/feed/", // ML tutorials, guides
      "https://www.marktechpost.com/feed/", // AI tools, use cases
      "https://hnrss.org/newest?q=AI+OR+machine+learning", // Hacker News AI/ML
      "https://blog.google/technology/ai/rss/", // Google AI updates
      "https://huggingface.co/blog/feed.xml", // Hugging Face, NLP, transformers
      "https://www.deeplearning.ai/blog/feed/", // Applied AI, learning
      "https://hai.stanford.edu/news/rss.xml", // Stanford AI research
      "https://allenai.org/rss.xml", // AI2 research, datasets
      "https://venturebeat.com/category/ai/feed/", // AI industry, funding
      "https://arxiv-sanity-lite.com/feed/?query=cs.AI", // arXiv AI papers
      "https://www.aitrends.com/feed/", // AI business, adoption
      "https://blogs.microsoft.com/ai/feed/", // Microsoft AI news
    ],

    "martech-adtech": [
      "https://martech.org/feed/", // Martech news, tools
      "https://adexchanger.com/feed/", // Ad tech, programmatic
      "https://marketingland.com/feed/", // Marketing, analytics
      "https://chiefmartec.com/feed/", // Martech landscape, ops
      "https://www.marketingtechnews.net/rss.xml", // Martech, digital trends
      "https://digiday.com/feed/", // Media, marketing policy
      "https://www.marketingprofs.com/rss/all", // Marketing tips, how-to
      "https://adtechdaily.com/feed", // Ad ops, campaign strategy
      "https://verve.com/feed", // Omnichannel ads, privacy
      "https://adpushup.com/blog/feed", // Ad revenue, optimization
    ],

    "web-dev-devops": [
      "https://css-tricks.com/feed/", // CSS, JS tips
      "https://www.smashingmagazine.com/feed/", // UX, front-end tools
      "https://web.dev/feed.xml", // Web standards, performance
      "https://blog.logrocket.com/feed/", // Web dev tutorials
      "https://www.joshwcomeau.com/rss.xml", // React, CSS deep dives
      "https://kentcdodds.com/blog/rss.xml", // JS, React, testing
      "https://dev.to/feed/tag/webdev", // Webdev community
      "https://blog.cloudflare.com/rss/", // Security, performance
      "https://github.blog/category/development/feed/", // GitHub dev news
      "https://devops.com/feed", // DevOps workflows
      "https://atlassian.com/blog/devops/feed", // DevOps collaboration
    ],

    "cybersecurity-privacy": [
      "https://krebsonsecurity.com/feed/", // Security breaches, threats
      "https://feeds.feedburner.com/TheHackersNews", // Hacks, vulnerabilities
      "https://www.darkreading.com/rss.xml", // Enterprise security, threats
      "https://www.schneier.com/feed/atom/", // Cryptography, privacy
      "https://www.bleepingcomputer.com/feed/", // Malware, exploits
      "https://threatpost.com/feed/", // Threat landscape, trends
      "https://blog.talosintelligence.com/feeds/posts/default", // Cisco threat intel
      "https://www.microsoft.com/security/blog/feed/", // Microsoft security
    ],

    "blockchain-web3": [
      "https://www.coindesk.com/arc/outboundfeeds/rss/", // Crypto news, blockchain
      "https://decrypt.co/feed", // DeFi, NFTs, crypto
      "https://cointelegraph.com/rss", // Global crypto news
      "https://ethereum.org/en/blog/feed.xml", // Ethereum updates
      "https://blog.chain.link/rss/", // Smart contracts, Chainlink
      "https://messari.io/rss", // Crypto research, analysis
      "https://bankless.substack.com/feed", // DeFi, Web3 trends
      "https://vitalik.eth.limo/feed.xml", // Vitalik blog
    ],
  },

  builder: {
    "startup-stories": [
      "https://review.firstround.com/rss/", // Founder stories
      "https://blog.ycombinator.com/feed/", // YC startups
      "https://techcrunch.com/category/startups/feed/", // Startup news
      "https://www.indiehackers.com/feed.xml", // Indie founders
      "https://sifted.eu/feed/", // European startups
      "https://venturebeat.com/category/entrepreneur/feed/", // Entrepreneurship
      "https://bothsidesofthetable.com/feed", // VC insights
      "https://www.startupgrind.com/feed.xml", // Startup events
    ],

    "productivity-hacks": [
      "https://zenhabits.net/feed/", // Minimalism, habits
      "https://jamesclear.com/feed", // Atomic habits
      "https://gettingthingsdone.com/feed/", // GTD method
      "https://aliabdaal.com/rss/", // Productivity tips
      "https://tim.blog/feed/", // Tim Ferriss hacks
      "https://calnewport.com/blog/feed/", // Deep work, focus
      "https://www.asianefficiency.com/feed/", // Workflow tips
    ],

    "automation-no-code": [
      "https://zapier.com/blog/feeds/latest/", // Automation, integrations
      "https://bubble.io/blog/rss", // No-code apps
      "https://www.nocode.tech/feed", // No-code tools
      "https://blog.airtable.com/rss/", // Airtable automation
      "https://webflow.com/blog/feed.rss", // Webflow design
      "https://blog.n8n.io/rss/", // Open-source automation
      "https://makerpad.co/posts.atom", // No-code projects
      "https://www.producthunt.com/feed/no-code", // No-code launches
    ],

    "project-management": [
      "https://blog.asana.com/feed/", // Asana tips
      "https://blog.trello.com/rss", // Trello updates
      "https://monday.com/blog/feed/", // Monday.com stories
      "https://www.projectmanager.com/blog/feed", // PM guides
      "https://blog.clickup.com/feed/", // ClickUp tips
      "https://www.atlassian.com/blog/feed", // PM tools, news
      "https://www.wrike.com/blog/feed/", // Wrike updates
      "https://www.pmi.org/rss.xml", // PM best practices
    ],

    "momentum-mindset": [
      "https://fs.blog/feed/", // Mental models
      "https://ryanholiday.net/feed/", // Stoicism
      "https://markmanson.net/feed", // Self-help, EQ
      "https://sethgodin.typepad.com/seths_blog/atom.xml", // Seth Godin ideas
      "https://dailystoic.com/feed/", // Stoic practices
      "https://tim.blog/feed/", // Life hacks
      "https://jamesclear.com/feed", // Habits, focus
      "https://waitbutwhy.com/feed", // Life essays
      "https://feeds.feedburner.com/brainpickings/rss", // Philosophy, literature
      "https://www.mindful.org/feed", // Mindfulness, wellness
    ],
  },

  art: {
    "generative-ai-art": [
      "https://aiartists.org/feed", // AI art showcase
      "https://www.creativebloq.com/feeds/tag/ai-art", // AI art trends
      "https://ml.berkeley.edu/blog/feed.xml", // ML + creativity
      "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", // AI art news
      "https://runwayml.com/blog/rss/", // Generative AI tools
    ],

    "ui-ux-trends": [
      "https://www.smashingmagazine.com/feed/", // UX, design trends
      "https://uxplanet.org/feed", // UX guides
      "https://alistapart.com/main/feed", // Web standards, design
      "https://uxdesign.cc/feed", // UX research, critiques
      "https://www.nngroup.com/feed/rss/", // Usability research
      "https://www.invisionapp.com/inside-design/feed/", // UI, UX process
      "https://www.uxmatters.com/feed.php", // UX issues, solutions
      "https://sidebar.io/feed.xml", // Curated design links
    ],

    "color-typography": [
      "https://fontsinuse.com/feed", // Fonts in use
      "https://blog.adobe.com/en/publish/creative-cloud.xml", // Adobe creative
      "https://typographica.org/feed/", // Typeface reviews
      "https://ilovetypography.com/feed/", // Fonts, typography news
      "https://fonts.googleblog.com/feeds/posts/default", // Google Fonts
    ],

    "animation-motion": [
      "https://motionographer.com/feed/", // Animation news
      "https://greensock.com/blog/feed", // GSAP tutorials
      "https://www.animatedreview.com/feed/", // Animation reviews
      "https://lottiefiles.com/blog/feed", // Lottie animations
      "https://www.schoolofmotion.com/blog/rss", // Motion design tips
    ],

    "tutorials-walkthroughs": [
      "https://tympanus.net/codrops/feed/", // Creative tutorials
      "https://webdesign.tutsplus.com/posts.atom", // Design tutorials
      "https://designmodo.com/feed/", // Design guides
      "https://www.sitepoint.com/design-ux/feed/", // UI/UX tutorials
      "https://tutsplus.com/feed/", // Creative tutorials
      "https://www.freecodecamp.org/news/rss/", // Dev tutorials
    ],
  },

  gaming: {
    "daily-roundup": [
      "https://www.polygon.com/rss/index.xml", // Gaming news
      "https://www.gamespot.com/feeds/news/", // Game reviews
      "https://www.rockpapershotgun.com/feed", // PC games, indies
      "https://www.gamesradar.com/rss/", // Gaming guides
      "https://www.eurogamer.net/feed", // Game news, reviews
      "https://kotaku.com/rss", // Gaming culture
      "https://www.destructoid.com/feed/", // Game news, features
      "https://www.ign.com/rss", // Gaming releases
    ],

    "pro-guides-tips": [
      "https://www.gamepur.com/feed", // Game guides
      "https://www.thegamer.com/feed/", // Tips, guides
      "https://dotesports.com/feed", // Esports news
      "https://www.pcgamer.com/rss/", // PC gaming tips
    ],

    "retro-gaming": [
      "https://www.timeextension.com/feed/", // Retro reviews
      "https://indieretronews.com/feeds/posts/default?alt=rss", // Retro news
      "https://retrododo.com/feed/", // Retro hardware
      "https://www.retrogamer.net/feed/", // Retro magazine
      "https://www.hardcoregaming101.net/feed/", // Game histories
      "https://retroblast.com/feed/", // Retro preservation
    ],

    "indie-spotlights": [
      "https://indiegames.com/feed/", // Indie news
      "https://www.indiedb.com/rss/games/", // Indie launches
      "https://www.gamedeveloper.com/rss.xml", // Dev insights
      "https://warpdoor.com/feed/", // Indie projects
      "https://alphabetagamer.com/feed/", // Indie demos
      "https://indiegamesplus.com/feed/", // Indie reviews
    ],

    "collectors-hub": [
      "https://www.racketboy.com/feed/", // Collector guides
      "https://videogamekrieg.com/feed", // Collectible news
      "https://www.pricecharting.com/blog/feed", // Game pricing
      "https://www.retrorgb.com/feed/", // Retro hardware mods
      "https://www.gamingalexandria.com/wp/feed/", // Game preservation
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

// Quality scoring function - Enhanced for diversity rules
const scoreArticleQuality = (item, category, subcategory) => {
  let score = 0;

  // Thumbnail is now worth more (for diversity rules)
  if (item.thumbnail) score += 0.3;

  // Description quality
  if (item.description) {
    if (item.description.length > 150) score += 0.2;
    else if (item.description.length > 100) score += 0.15;
    else if (item.description.length > 50) score += 0.1;
  }

  // Title quality
  if (item.title) {
    if (item.title.length > 40) score += 0.1;
    else if (item.title.length > 20) score += 0.05;
  }

  // Recency bonus
  const hoursSincePublished =
    (Date.now() - new Date(item.pubDate)) / (1000 * 60 * 60);
  if (hoursSincePublished < 24) score += 0.25;
  else if (hoursSincePublished < 72) score += 0.15;
  else if (hoursSincePublished < 168) score += 0.05;

  // Category-specific bonuses
  if (category === "tech" && item.description?.length > 150) score += 0.05;
  if (category === "builder" && /how|guide|tutorial|tips/i.test(item.title))
    score += 0.05;
  if (category === "art" && item.thumbnail) score += 0.05;

  // Normalize to 0-1 range
  return Math.min(1, score);
};

// =====================================================
// DIVERSITY ENFORCEMENT HELPERS
// =====================================================
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

  // Check for common non-article image patterns
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
    return new Date(dateStr).toISOString().split("T")[0]; // YYYY-MM-DD
  } catch {
    return null;
  }
}

// Weighted random shuffle by quality
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

  // Extract diversity rules from config
  return {
    QUALITY_SCORE_THRESHOLD:
      config.DIVERSITY_RULES?.QUALITY_SCORE_THRESHOLD ||
      config.CONTENT_RULES?.QUALITY_SCORE_THRESHOLD ||
      0.3,
    QUALITY_SCORE_NO_THUMBNAIL:
      config.DIVERSITY_RULES?.QUALITY_SCORE_NO_THUMBNAIL ||
      config.CONTENT_RULES?.QUALITY_SCORE_NO_THUMBNAIL ||
      0.5,
    MAX_PER_DOMAIN:
      config.DIVERSITY_RULES?.MAX_PER_DOMAIN ||
      config.SOURCE_RULES?.MAX_PER_DOMAIN ||
      3,
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

// Apply diversity filters to collected articles
function applyDiversityFilters(
  articles,
  category,
  subcategory,
  minRequired = 5
) {
  const rules = getDiversityRules(category, subcategory);

  console.log(`Applying diversity filters to ${articles.length} articles`);
  console.log(`Rules:`, rules);

  // Step 1: Quality + Thumbnail enforcement
  let filtered = articles.filter((a) => {
    const hasValidThumbnail = a.thumbnail && validateImage(a.thumbnail);
    const qualityThreshold = hasValidThumbnail
      ? rules.QUALITY_SCORE_THRESHOLD
      : rules.QUALITY_SCORE_NO_THUMBNAIL;

    return (a.qualityScore || 0) >= qualityThreshold;
  });

  console.log(`After quality filter: ${filtered.length} articles`);

  // If we don't have enough articles, be more lenient
  if (filtered.length < minRequired) {
    console.log(
      `Not enough articles (${filtered.length} < ${minRequired}), relaxing quality threshold`
    );
    filtered = articles.filter(
      (a) => (a.qualityScore || 0) >= rules.QUALITY_SCORE_THRESHOLD * 0.5
    );
  }

  // Step 2: Shuffle weighted by quality
  let shuffled = weightedShuffle(filtered);

  // Step 3: Enforce domain caps + unique-date-per-domain
  const domainCounts = {};
  const domainDates = {};
  const capped = [];

  for (let article of shuffled) {
    const domain = extractDomain(article.link || article.sourceUrl);
    const pubDate = formatDate(article.pubDate);

    domainCounts[domain] = domainCounts[domain] || 0;
    domainDates[domain] = domainDates[domain] || new Set();

    // Enforce max-per-domain cap (relax if we need minimum articles)
    const effectiveMaxPerDomain =
      capped.length < minRequired
        ? rules.MAX_PER_DOMAIN * 2
        : rules.MAX_PER_DOMAIN;

    if (domainCounts[domain] >= effectiveMaxPerDomain) continue;

    // Enforce unique-date-per-domain rule (skip if we need minimum)
    if (
      rules.UNIQUE_DATE_PER_DOMAIN &&
      capped.length >= minRequired &&
      pubDate &&
      domainDates[domain].has(pubDate)
    ) {
      continue;
    }

    capped.push(article);
    domainCounts[domain]++;
    if (pubDate) domainDates[domain].add(pubDate);
  }

  console.log(`After domain diversity: ${capped.length} articles`);

  // Step 4: Enforce "no consecutive same-domain" (only if we have enough articles)
  if (rules.NO_CONSECUTIVE_SAME_DOMAIN && capped.length >= minRequired) {
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

    // Add deferred articles at the end
    deferred.forEach((article) => {
      const domain = extractDomain(article.link || article.sourceUrl);
      let inserted = false;

      // Try to insert between different domains
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

      if (!inserted) {
        spaced.push(article);
      }
    });

    console.log(`After spacing: ${spaced.length} articles`);
    return spaced;
  }

  return capped;
}

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

  // Quality scoring (normalized 0-1 for diversity rules)
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
              const emergencyItem = {
                title: item.title.substring(0, 200),
                link: item.link,
                description: item.description?.substring(0, 200) || item.title,
                thumbnail: null,
                allowDefaultIcon: true,
                qualityScore: 0.2, // Low but non-zero for diversity rules
                source: getFeedDisplayName(feedUrls[i]),
                sourceUrl: feedUrls[i],
                creator:
                  item.creator ||
                  item.author ||
                  getFeedDisplayName(feedUrls[i]),
                guid: key,
                pubDate: item.pubDate || new Date().toISOString(),
                time: new Date(item.pubDate || Date.now()).toLocaleString(),
              };
              // Calculate basic quality score even for emergency items
              emergencyItem.qualityScore = scoreArticleQuality(
                emergencyItem,
                category,
                subcategory
              );
              qualifiedItems.push(emergencyItem);
            }
          }
        }
      } catch (error) {
        console.error(`Emergency fetch error:`, error.message);
      }
    }
  }

  // Sort by date first
  qualifiedItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Apply diversity filters BEFORE final deduplication
  const diversityFiltered = applyDiversityFilters(
    qualifiedItems,
    category,
    subcategory,
    MIN_ITEMS_REQUIRED
  );

  // Take only the required number of items
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

    // Calculate domain diversity metrics for logging
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
