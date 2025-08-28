// server.js - Complete updated version with all enhanced filtering
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

// Global fingerprint tracking for cross-feed deduplication
const recentFingerprints = new Set();

// Create content fingerprint for deduplication
const createFingerprint = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 30);
};

// Blocked domains list
const blockedDomains = [
  "medium.com",
  "forbes.com/sites",
  "businessinsider.com",
  "buzzfeed.com",
  "huffpost.com",
  "vice.com",
  "qz.com",
];

// Updated RSS Feed catalog aligned with new categories
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
    ],

    "martech-adtech": [
      "https://martech.org/feed/",
      "https://adexchanger.com/feed/",
      "https://marketingland.com/feed/",
      "https://chiefmartec.com/feed/",
      "https://www.marketingtechnews.net/rss.xml",
    ],

    "web-dev-devops": [
      "https://css-tricks.com/feed/",
      "https://www.smashingmagazine.com/feed/",
      "https://dev.to/feed",
      "https://web.dev/feed.xml",
      "https://blog.logrocket.com/feed/",
      "https://www.joshwcomeau.com/rss.xml",
      "https://kentcdodds.com/blog/rss.xml",
    ],

    "cybersecurity-privacy": [
      "https://krebsonsecurity.com/feed/",
      "https://feeds.feedburner.com/TheHackersNews",
      "https://www.darkreading.com/rss.xml",
      "https://www.schneier.com/feed/atom/",
      "https://www.bleepingcomputer.com/feed/",
      "https://threatpost.com/feed/",
    ],

    "blockchain-web3": [
      "https://www.coindesk.com/arc/outboundfeeds/rss/",
      "https://decrypt.co/feed",
      "https://cointelegraph.com/rss",
      "https://ethereum.org/en/blog/feed.xml",
      "https://blog.chain.link/rss/",
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
    ],

    "productivity-hacks": [
      "https://zenhabits.net/feed/",
      "https://jamesclear.com/feed",
      "https://gettingthingsdone.com/feed/",
      "https://aliabdaal.com/rss/",
      "https://tim.blog/feed/",
      "https://calnewport.com/blog/feed/",
    ],

    "automation-no-code": [
      "https://zapier.com/blog/feeds/latest/",
      "https://bubble.io/blog/rss",
      "https://www.nocode.tech/feed",
      "https://blog.airtable.com/rss/",
      "https://webflow.com/blog/feed.rss",
      "https://blog.n8n.io/rss/",
    ],

    "project-management": [
      "https://blog.asana.com/feed/",
      "https://blog.trello.com/rss",
      "https://monday.com/blog/feed/",
      "https://www.projectmanager.com/blog/feed",
      "https://blog.clickup.com/feed/",
    ],

    "momentum-mindset": [
      "https://fs.blog/feed/",
      "https://ryanholiday.net/feed/",
      "https://markmanson.net/feed",
      "https://sethgodin.typepad.com/seths_blog/atom.xml",
      "https://dailystoic.com/feed/",
      "https://tim.blog/feed/",
      "https://jamesclear.com/feed",
    ],
  },

  art: {
    "generative-ai-art": [
      "https://aiartists.org/feed",
      "https://www.creativebloq.com/feeds/tag/ai-art",
      "https://ml.berkeley.edu/blog/feed.xml",
      "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    ],

    "ui-ux-trends": [
      "https://www.smashingmagazine.com/feed/",
      "https://uxplanet.org/feed",
      "https://alistapart.com/main/feed",
      "https://uxdesign.cc/feed",
      "https://www.nngroup.com/feed/rss/",
      "https://www.invisionapp.com/inside-design/feed/",
    ],

    "color-typography": [
      "https://www.typewolf.com/feed/",
      "https://fontsinuse.com/feed",
      "https://blog.adobe.com/en/publish/creative-cloud.xml",
      "https://typographica.org/feed/",
      "https://ilovetypography.com/feed/",
    ],

    "animation-motion": [
      "https://motionographer.com/feed/",
      "https://greensock.com/blog/feed",
      "https://www.animatedreview.com/feed/",
      "https://lottiefiles.com/blog/feed",
    ],

    "tutorials-walkthroughs": [
      "https://tympanus.net/codrops/feed/",
      "https://webdesign.tutsplus.com/posts.atom",
      "https://designmodo.com/feed/",
      "https://www.sitepoint.com/design-ux/feed/",
    ],
  },

  gaming: {
    "daily-roundup": [
      "https://www.polygon.com/rss/index.xml",
      "https://www.gamespot.com/feeds/news/",
      "https://www.rockpapershotgun.com/feed",
      "https://www.gamesradar.com/rss/",
      "https://www.eurogamer.net/feed",
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
    ],

    "indie-spotlights": [
      "https://indiegames.com/feed/",
      "https://www.indiedb.com/rss/games/",
      "https://www.gamedeveloper.com/rss.xml",
      "https://warpdoor.com/feed/",
      "https://alphabetagamer.com/feed/",
    ],

    "collectors-hub": [
      "https://www.racketboy.com/feed/",
      "https://videogamekrieg.com/feed",
      "https://www.pricecharting.com/blog/feed",
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
    "https://zapier.com/blog/feeds/latest/": "Zapier Blog",
    "https://www.smashingmagazine.com/feed/": "Smashing Magazine",
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

// Enhanced validation functions
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
    /\$\(.*\)/,
    /document\./,
    /window\./,
    /getElementById/,
    /querySelector/,
    /addEventListener/,
    /<[a-z][\s\S]*>/i,
    /\{margin.*\}/,
    /\{padding.*\}/,
    /\.css\s*\{/,
    /#[a-z]+\s*\{/i,
    /^https?:\/\/[^\s]+$/,
    /^www\.[^\s]+$/,
    /\/\w+\/\w+\.\w{2,4}/,
    /C:\\.*\\/,
    /npm\s+install/,
    /yarn\s+add/,
    /pip\s+install/,
    /\/\/.{0,100}$/,
    /\/\*.*\*\//,
    /<!--.*-->/,
    /at\s+\w+\s*\(.*:\d+:\d+\)/,
    /Error:.*at/,
    /Exception.*at/,
    /undefined.*is not/,
    /^\s*\{.*".*":.*\}\s*$/,
    /^\s*\[.*\]\s*$/,
  ];

  return codePatterns.some((pattern) => pattern.test(text));
};

// Helper function to detect non-English text
const isLikelyEnglish = (text) => {
  if (!text) return true;

  const nonLatinPattern = /[^\u0000-\u007F\u0080-\u00FF]/g;
  const matches = text.match(nonLatinPattern) || [];
  const nonLatinRatio = matches.length / text.length;
  if (nonLatinRatio > 0.3) return false;

  const nonEnglishScripts = [
    /[\u0600-\u06FF]/,
    /[\u4E00-\u9FFF]/,
    /[\u3040-\u309F\u30A0-\u30FF]/,
    /[\uAC00-\uD7AF]/,
    /[\u0E00-\u0E7F]/,
    /[\u0400-\u04FF]/,
    /[\u0900-\u097F]/,
    /[\u0B80-\u0BFF]/,
  ];

  return !nonEnglishScripts.some((pattern) => pattern.test(text));
};

// Detect spam-like titles
const isSpamTitle = (title) => {
  if (!title) return true;

  const specialChars = title.match(/[^\w\s\-.,!?'"]/g) || [];
  const specialRatio = specialChars.length / title.length;
  if (specialRatio > 0.2) return true;

  const spamPatterns = [
    /\(╯.*╰\)/,
    /[\u2500-\u257F]/,
    /[\u2580-\u259F]/,
    /\[.*\].*\[.*\].*\[.*\]/,
    /【.*】/,
    /\uD83D[\uDC00-\uDFFF]/,
    /(.)\1{4,}/,
    /^[A-Z\s]{15,}$/,
    /\bclick\s*here\b/i,
    /\bfree\s*download\b/i,
    /\bmust\s*see\b/i,
    /\bshocking\b/i,
    /\byou\s*won't\s*believe\b/i,
  ];

  return spamPatterns.some((pattern) => pattern.test(title));
};

// Check for AI/crypto spam topics
const isSpamTopic = (title, description) => {
  const spamTopics = [
    /\$\d+[KMB]?\s*(profit|earned|made)/i,
    /crypto\s*(millionaire|fortune|rich)/i,
    /AI\s*(will|might|could)\s*(replace|destroy|eliminate)/i,
    /ChatGPT\s*(hack|trick|secret)/i,
    /NFT\s*(boom|crash|dead)/i,
    /passive\s*income/i,
    /get\s*rich\s*quick/i,
  ];

  return spamTopics.some(
    (pattern) =>
      (title && pattern.test(title)) ||
      (description && pattern.test(description))
  );
};

// Strict thumbnail validation - ENHANCED with size checking
const isRealArticleThumbnail = async (thumbnailUrl, item = {}) => {
  if (!thumbnailUrl) return false;

  // Reject emoji and unicode images
  if (
    thumbnailUrl.includes("emoji") ||
    thumbnailUrl.includes("emoticon") ||
    thumbnailUrl.includes("twemoji") ||
    thumbnailUrl.includes("unicode") ||
    /[\u{1F300}-\u{1F9FF}]/u.test(thumbnailUrl)
  ) {
    return false;
  }

  const imageExtensions = /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i;
  const hasImageExtension = imageExtensions.test(thumbnailUrl);
  const hasImagePath =
    /\/(images?|img|media|content|uploads|photos?|pictures?|graphics?|articles?|posts?|blog|news|wp-content)\//i.test(
      thumbnailUrl
    );

  if (!hasImageExtension && !hasImagePath) return false;

  // Check for minimum dimensions in URL
  const minWidth = 600;
  const minHeight = 400;

  if (thumbnailUrl.includes("resize=") || thumbnailUrl.includes("w=")) {
    const widthMatch = thumbnailUrl.match(/[?&]w=(\d+)/);
    const heightMatch = thumbnailUrl.match(/[?&]h=(\d+)/);
    if (widthMatch && parseInt(widthMatch[1]) < minWidth) return false;
    if (heightMatch && parseInt(heightMatch[1]) < minHeight) return false;
  }

  const genericPatterns = [
    /favicon/i,
    /\.ico($|\?)/i,
    /\/ico\//i,
    /apple-touch-icon/i,
    /touch[-_]?icon/i,
    /site[-_]?icon/i,
    /app[-_]?icon/i,
    /logo/i,
    /brand/i,
    /masthead/i,
    /header[-_]?image/i,
    /avatar/i,
    /profile[-_]?(pic|photo|image)/i,
    /user[-_]?(pic|photo|image)/i,
    /author[-_]?(pic|photo|image)/i,
    /\/authors?\//i,
    /gravatar/i,
    /default/i,
    /placeholder/i,
    /no[-_]?image/i,
    /no[-_]?photo/i,
    /empty[-_]?image/i,
    /blank[-_]?image/i,
    /missing[-_]?image/i,
    /fallback/i,
    /og[-_]?image[-_]?default/i,
    /twitter[-_]?card[-_]?default/i,
    /feed[-_]?icon/i,
    /rss[-_]?icon/i,
    /16x16|24x24|32x32|48x48|64x64|72x72|96x96|120x120|128x128|144x144|152x152|180x180|192x192|256x256/i,
    /\/icons?\//i,
    /\/emoji\//i,
    /\/wp-includes\//i,
    /\/wp-admin\//i,
    /1x1\.gif/i,
    /spacer\.gif/i,
    /clear\.gif/i,
    /share[-_]?button/i,
    /social[-_]?button/i,
  ];

  if (genericPatterns.some((pattern) => pattern.test(thumbnailUrl))) {
    return false;
  }

  const sizePattern = /[-_](\d{3,4})x(\d{3,4})[.-]/;
  const sizeMatch = thumbnailUrl.match(sizePattern);
  if (sizeMatch) {
    const width = parseInt(sizeMatch[1]);
    const height = parseInt(sizeMatch[2]);
    if (width < 400 || height < 300) return false;
  }

  return true;
};

// Enhanced description quality check
const isHighQualityDescription = (description, title = "") => {
  if (!description || description.length < 30) return false;

  const lower = description.toLowerCase();
  const titleLower = title.toLowerCase();

  if (title && lower === titleLower) return false;

  if (containsCodeOrTechnical(description)) return false;

  // Check description/title length ratio
  const titleLength = title.length;
  const descLength = description.length;
  const ratio = descLength / titleLength;

  if (ratio < 1.5) {
    return false;
  }

  const urlPattern = /https?:\/\/[^\s]+/g;
  const urls = description.match(urlPattern) || [];
  const urlCharCount = urls.join("").length;
  if (urlCharCount > description.length * 0.3) return false;

  const genericPatterns = [
    /^read the full article/i,
    /^click here to/i,
    /^learn more about/i,
    /^discover how/i,
    /^find out why/i,
    /^the post .* appeared first on/i,
    /^continue reading/i,
    /^read more at/i,
    /^source:/i,
    /^article url:/i,
    /^link:/i,
    /^url:/i,
    /^posted by/i,
    /^submitted by/i,
    /^comments:/i,
    /^share this/i,
    /^related articles/i,
    /^tags:/i,
    /^category:/i,
    /^filed under:/i,
    /^this entry was posted/i,
  ];

  if (genericPatterns.some((pattern) => pattern.test(lower))) {
    return false;
  }

  const words = lower.split(/\s+/).filter((w) => w.length > 2);
  const uniqueWords = new Set(words);
  const uniqueRatio = uniqueWords.size / words.length;
  if (uniqueRatio < 0.5) return false;

  const naturalLanguageWords = [
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "as",
    "is",
    "was",
    "are",
    "were",
  ];
  const hasNaturalFlow = naturalLanguageWords.some(
    (word) => lower.includes(` ${word} `) || lower.startsWith(`${word} `)
  );

  if (!hasNaturalFlow && description.length > 50) return false;

  const sentences = description
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 10);
  if (sentences.length === 0) return false;

  const specialChars = description.match(/[^\w\s\-.,!?'"]/g) || [];
  const specialRatio = specialChars.length / description.length;
  if (specialRatio > 0.1) return false;

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
      if (!imgUrl.includes("emoji") && !imgUrl.includes("smilie")) {
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

// Enhanced clean description function
const cleanDescription = (rawDescription, title = "") => {
  if (!rawDescription) return "";

  if (containsCodeOrTechnical(rawDescription)) {
    return "";
  }

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

  const metaPatterns = [
    /^article url:/i,
    /^link:/i,
    /^url:/i,
    /^https?:\/\//i,
    /^www\./i,
    /^read the full/i,
    /^click here/i,
    /^source:/i,
    /^originally published/i,
    /^the post .* appeared/i,
  ];

  if (metaPatterns.some((pattern) => pattern.test(cleaned.trim()))) {
    return "";
  }

  const sentences = cleaned.split(/[.!?]+/).filter((sentence) => {
    const lower = sentence.toLowerCase().trim();

    if (lower.length < 20) return false;

    if (containsCodeOrTechnical(sentence)) return false;

    const skipPatterns = [
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
      /limited time/i,
      /act now/i,
      /don't miss/i,
      /expires/i,
      /free shipping/i,
      /special offer/i,
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
      /^today only/i,
      /^this week/i,
      /^last chance/i,
      /ends soon/i,
    ];

    return !skipPatterns.some((pattern) => pattern.test(lower));
  });

  let description = sentences.slice(0, 3).join(". ").trim();

  if (!isHighQualityDescription(description, title)) {
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

// Enhanced parse feed item with strict validation
const parseFeedItem = async (item, source) => {
  const title = item.title || "";

  // Check title capitalization quality
  if (title === title.toUpperCase() && title.length > 10) {
    console.log(`Filtered ALL CAPS title: "${title}"`);
    return null;
  }

  if (title === title.toLowerCase() && title.length > 20) {
    console.log(`Filtered all lowercase title: "${title}"`);
    return null;
  }

  if (isSpamTitle(title)) {
    console.log(`Filtered spam title: "${title}"`);
    return null;
  }

  if (!isLikelyEnglish(title)) {
    return null;
  }

  // Age filter - reject articles older than 7 days
  const pubDate =
    item.pubDate || item.isoDate || item.published || new Date().toISOString();
  const articleAge = Date.now() - new Date(pubDate);
  const maxAge = 7 * 24 * 60 * 60 * 1000;

  if (articleAge > maxAge) {
    console.log(
      `Filtered: Article too old (${Math.floor(
        articleAge / (24 * 60 * 60 * 1000)
      )} days): "${title}"`
    );
    return null;
  }

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
    "coupon",
    "promo code",
    "free shipping",
    "limited time",
  ];

  for (const keyword of promotionalKeywords) {
    if (titleLower.includes(keyword)) {
      console.log(`Filtered promotional: "${title}"`);
      return null;
    }
  }

  const thumbnail = await extractBestThumbnail(item, source);

  if (!thumbnail || !(await isRealArticleThumbnail(thumbnail, item))) {
    console.log(`Filtered: No valid thumbnail for "${title}"`);
    return null;
  }

  let description = extractArticleContent(item);

  if (description && containsCodeOrTechnical(description)) {
    console.log(`Filtered: Code/technical content in "${title}"`);
    return null;
  }

  if (!description || !isHighQualityDescription(description, title)) {
    console.log(`Filtered: Low quality description for "${title}"`);
    return null;
  }

  // Check for spam topics
  if (isSpamTopic(title, description)) {
    console.log(`Filtered spam topic: "${title}"`);
    return null;
  }

  // Check for suspicious authors
  const suspiciousAuthors = [
    /^admin$/i,
    /^user\d+$/i,
    /^guest$/i,
    /^contributor$/i,
    /^staff$/i,
    /^editor$/i,
    /^news\s*desk$/i,
    /^press\s*release$/i,
  ];

  if (
    item.creator &&
    suspiciousAuthors.some((pattern) => pattern.test(item.creator))
  ) {
    console.log(`Filtered suspicious author "${item.creator}": "${title}"`);
    return null;
  }

  // Cross-feed deduplication
  const fingerprint = createFingerprint(title);
  if (recentFingerprints.has(fingerprint)) {
    console.log(`Filtered duplicate story: "${title}"`);
    return null;
  }
  recentFingerprints.add(fingerprint);

  // Clear fingerprints periodically
  if (recentFingerprints.size > 100) {
    recentFingerprints.clear();
  }

  const descLower = description.toLowerCase();
  const titleWords = titleLower.split(/\s+/);
  const titleWordsInDesc = titleWords.filter(
    (word) => word.length > 3 && descLower.includes(word)
  );

  if (
    titleWords.length > 0 &&
    titleWordsInDesc.length / titleWords.length > 0.7
  ) {
    console.log(`Filtered: Description too similar to title for "${title}"`);
    return null;
  }

  if (description.length < 50 || title.length < 10) {
    return null;
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
  }

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

// Fetch single RSS feed with enhanced filtering
const fetchSingleFeed = async (url, timeout = 5000) => {
  const problematicSources = [
    "lifehacker.com",
    "gizmodo.com",
    "kotaku.com",
    "deadspin.com",
  ];

  // Check if URL contains blocked domain
  if (blockedDomains.some((domain) => url.includes(domain))) {
    console.log(`Blocked domain: ${url}`);
    return [];
  }

  if (problematicSources.some((source) => url.includes(source))) {
    console.log(`Skipping problematic source: ${url}`);
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
            item.thumbnail &&
            !containsCodeOrTechnical(item.description) &&
            isHighQualityDescription(item.description, item.title)
          );
        });

      resolve(validItems);
    } catch (error) {
      clearTimeout(timer);
      console.error(`Error fetching feed ${url}:`, error.message);
      resolve([]);
    }
  });
};

// Enhanced quality scoring
const scoreArticleQuality = (item) => {
  let score = 0;

  if (item.thumbnail) score += 20;

  if (!containsCodeOrTechnical(item.description)) score += 10;
  if (isHighQualityDescription(item.description, item.title)) score += 10;

  const specialCount = (item.title.match(/[^\w\s\-.,!?'"]/g) || []).length;
  if (specialCount === 0) score += 5;

  if (item.title && item.title.length > 30) score += 2;
  if (item.title && !item.title.includes("|")) score += 1;

  if (item.description && item.description.length > 100) score += 3;
  if (item.description && item.description.length > 150) score += 2;
  if (item.description && !item.description.includes("Read more")) score += 1;

  const hoursSincePublished =
    (Date.now() - new Date(item.pubDate)) / (1000 * 60 * 60);
  if (hoursSincePublished < 24) score += 5;
  else if (hoursSincePublished < 72) score += 3;
  else if (hoursSincePublished < 168) score += 1;

  return score;
};

// API endpoint to fetch feeds with all filters
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

    allItems.sort((a, b) => {
      const scoreA = scoreArticleQuality(a);
      const scoreB = scoreArticleQuality(b);

      if (Math.abs(scoreA - scoreB) > 2) {
        return scoreB - scoreA;
      }

      return new Date(b.pubDate) - new Date(a.pubDate);
    });

    // Apply source diversity limit (max 3 per source)
    const sourceCounts = new Map();
    const diverseItems = [];

    for (const item of allItems) {
      const count = sourceCounts.get(item.source) || 0;
      if (count < 3) {
        diverseItems.push(item);
        sourceCounts.set(item.source, count + 1);
        if (diverseItems.length >= 25) break; // Get more for further filtering
      }
    }

    // Filter out articles with duplicate uncommon words in titles
    const filteredItems = [];
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
      "into",
      "through",
      "during",
      "than",
      "under",
      "over",
      "between",
      "among",
      "within",
      "without",
      "upon",
      "toward",
      "against",
      "across",
      "behind",
      "beyond",
      "inside",
      "outside",
      "your",
      "their",
      "them",
      "they",
      "these",
      "those",
      "such",
      "some",
      "most",
      "more",
      "less",
      "very",
      "just",
      "only",
      "also",
      "will",
      "would",
      "could",
      "should",
      "have",
      "been",
      "being",
      "does",
      "doing",
      "done",
      "make",
      "made",
      "take",
      "took",
      "come",
      "came",
      "know",
      "knew",
      "think",
      "thought",
      "look",
      "want",
      "need",
      "like",
      "love",
      "hate",
      "good",
      "best",
      "well",
      "much",
      "many",
      "each",
      "every",
      "other",
      "another",
      "there",
      "here",
      "where",
    ]);

    // Track question titles count
    let questionTitlesCount = 0;

    // Track hour distribution
    const hourBuckets = new Map();

    for (const item of diverseItems) {
      // Check question title limit
      if (item.title.includes("?")) {
        if (questionTitlesCount >= 3) {
          console.log(`Filtered excess question title: "${item.title}"`);
          continue;
        }
        questionTitlesCount++;
      }

      // Check hour distribution (max 2 per hour)
      const hour = new Date(item.pubDate).getHours();
      const hourCount = hourBuckets.get(hour) || 0;
      if (hourCount >= 2) {
        console.log(
          `Filtered for time distribution (hour ${hour}): "${item.title}"`
        );
        continue;
      }

      // Check for duplicate uncommon words
      const titleWords = item.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 4 && !commonWords.has(word));

      let hasDuplicate = false;
      for (const word of titleWords) {
        if (usedUncommonWords.has(word)) {
          console.log(`Filtered duplicate word "${word}" in: "${item.title}"`);
          hasDuplicate = true;
          break;
        }
      }

      if (!hasDuplicate) {
        filteredItems.push(item);
        titleWords.forEach((word) => usedUncommonWords.add(word));
        hourBuckets.set(hour, hourCount + 1);

        if (filteredItems.length >= 10) break;
      }
    }

    const finalItems = filteredItems.slice(0, 10);

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

    allItems.sort((a, b) => {
      const scoreA = scoreArticleQuality(a);
      const scoreB = scoreArticleQuality(b);

      if (Math.abs(scoreA - scoreB) > 2) {
        return scoreB - scoreA;
      }

      return new Date(b.pubDate) - new Date(a.pubDate);
    });

    // Apply source diversity limit
    const sourceCounts = new Map();
    const diverseItems = [];

    for (const item of allItems) {
      const count = sourceCounts.get(item.source) || 0;
      if (count < 3) {
        diverseItems.push(item);
        sourceCounts.set(item.source, count + 1);
        if (diverseItems.length >= 25) break;
      }
    }

    // Filter duplicate uncommon words and apply other limits
    const filteredItems = [];
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
      "into",
      "through",
      "during",
      "than",
      "under",
      "over",
      "between",
      "among",
      "within",
      "without",
      "upon",
      "toward",
      "against",
      "across",
      "behind",
      "beyond",
      "inside",
      "outside",
      "your",
      "their",
      "them",
      "they",
      "these",
      "those",
      "such",
      "some",
      "most",
      "more",
      "less",
      "very",
      "just",
      "only",
      "also",
      "will",
      "would",
      "could",
      "should",
      "have",
      "been",
      "being",
      "does",
      "doing",
      "done",
      "make",
      "made",
      "take",
      "took",
      "come",
      "came",
      "know",
      "knew",
      "think",
      "thought",
      "look",
      "want",
      "need",
      "like",
      "love",
      "hate",
      "good",
      "best",
      "well",
      "much",
      "many",
      "each",
      "every",
      "other",
      "another",
      "there",
      "here",
      "where",
    ]);

    let questionTitlesCount = 0;
    const hourBuckets = new Map();

    for (const item of diverseItems) {
      if (item.title.includes("?")) {
        if (questionTitlesCount >= 3) continue;
        questionTitlesCount++;
      }

      const hour = new Date(item.pubDate).getHours();
      const hourCount = hourBuckets.get(hour) || 0;
      if (hourCount >= 2) continue;

      const titleWords = item.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 4 && !commonWords.has(word));

      let hasDuplicate = false;
      for (const word of titleWords) {
        if (usedUncommonWords.has(word)) {
          hasDuplicate = true;
          break;
        }
      }

      if (!hasDuplicate) {
        filteredItems.push(item);
        titleWords.forEach((word) => usedUncommonWords.add(word));
        hourBuckets.set(hour, hourCount + 1);

        if (filteredItems.length >= 10) break;
      }
    }

    const finalItems = filteredItems.slice(0, 10);

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
