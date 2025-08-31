// api/feeds.js - Vercel Serverless Function with Shared Filter Config
import Parser from "rss-parser";

// Import the filter configuration system
const { getFilterConfig, qualifiesForDefaultIcon } = await import(
  "./filterConfig.js"
);

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

// RSS feed URLs (keeping your existing structure)
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

// Filter statistics tracker
const filterStats = {
  totalProcessed: 0,
  filtered: {},
  filteredSamples: {},
  passed: 0,

  reset() {
    this.totalProcessed = 0;
    this.filtered = {};
    this.filteredSamples = {};
    this.passed = 0;
  },

  recordFiltered(reason, title = "") {
    this.filtered[reason] = (this.filtered[reason] || 0) + 1;
    if (!this.filteredSamples[reason]) this.filteredSamples[reason] = [];
    if (title && this.filteredSamples[reason].length < 5) {
      this.filteredSamples[reason].push(title.substring(0, 120));
    }
    console.log(`⚠️ Filtered [${reason}]: "${title.substring(0, 50)}..."`);
  },

  getReport() {
    return {
      totalProcessed: this.totalProcessed,
      passed: this.passed,
      filtered: this.filtered,
      filteredSamples: this.filteredSamples,
      filterRate:
        this.totalProcessed > 0
          ? (
              ((this.totalProcessed - this.passed) / this.totalProcessed) *
              100
            ).toFixed(1) + "%"
          : "0%",
    };
  },
};

// Global tracking for deduplication
const recentFingerprints = new Set();
const domainCounter = new Map();

// Validation functions (ported from server.js)
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

const isRealArticleThumbnail = async (thumbnailUrl, item = {}) => {
  if (!thumbnailUrl) return false;

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

  return true;
};

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

const isValidDescription = (
  description,
  title = "",
  category = null,
  subcategory = null
) => {
  if (!description) {
    filterStats.recordFiltered("NO_DESCRIPTION", title);
    return false;
  }

  const config = getFilterConfig(category, subcategory);

  if (description.length < config.CONTENT_RULES.MIN_DESCRIPTION_LENGTH) {
    filterStats.recordFiltered("DESCRIPTION_TOO_SHORT", title);
    return false;
  }

  if (category === "builder" || category === "art") {
    return true;
  }

  if (config.CONTENT_RULES.NO_LOWERCASE_START && /^[a-z]/.test(description)) {
    filterStats.recordFiltered("LOWERCASE_START", title);
    return false;
  }

  if (
    config.CONTENT_RULES.NO_SPECIAL_CHAR_START &&
    /^[^A-Za-z0-9"']/.test(description)
  ) {
    filterStats.recordFiltered("SPECIAL_CHAR_START", title);
    return false;
  }

  if (config.CONTENT_RULES.NO_URLS_IN_DESCRIPTION) {
    const urlPattern =
      /https?:\/\/[^\s]+|www\.[^\s]+|\w+\.(com|org|net|io|dev|edu|gov|uk|ca|au|de|fr|jp|cn|in|br|mx|ru|it|es|nl|se|no|dk|fi|pl|gr|pt|cz|hu|ro|bg|hr|si|sk|lt|lv|ee)\b/gi;
    if (urlPattern.test(description)) {
      filterStats.recordFiltered("URL_IN_DESCRIPTION", title);
      return false;
    }
  }

  return true;
};

const isHighQualityDescription = (
  description,
  title = "",
  category = null,
  subcategory = null
) => {
  const config = getFilterConfig(category, subcategory);

  if (config.CONTENT_RULES.QUALITY_CHECK === false) {
    return true;
  }

  if (!description || description.length < 30) return false;

  const lower = description.toLowerCase();
  const titleLower = title.toLowerCase();

  if (title && lower === titleLower) return false;

  if (
    containsCodeOrTechnical(description) &&
    config.CONTENT_RULES.NO_CODE_CONTENT
  ) {
    return false;
  }

  const titleLength = title.length;
  const descLength = description.length;
  const ratio = descLength / titleLength;

  if (ratio < 1.5) return false;

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

const cleanDescription = (
  rawDescription,
  title = "",
  category = null,
  subcategory = null
) => {
  if (!rawDescription) return "";

  const config = getFilterConfig(category, subcategory);

  if (
    containsCodeOrTechnical(rawDescription) &&
    config.CONTENT_RULES.NO_CODE_CONTENT
  ) {
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
  cleaned = cleaned.replace(/www\.[^\s]+/g, "");
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
    if (
      containsCodeOrTechnical(sentence) &&
      config.CONTENT_RULES.NO_CODE_CONTENT
    )
      return false;

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
      /article url/i,
      /article/i,
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

  if (!isValidDescription(description, title, category, subcategory)) {
    return "";
  }

  if (!isHighQualityDescription(description, title, category, subcategory)) {
    return "";
  }

  description = description.replace(/\s+/g, " ").trim();

  if (description && !description.match(/[.!?]$/)) {
    description += ".";
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

  return description;
};

const extractArticleContent = (item, category = null, subcategory = null) => {
  const contentSources = [
    item.contentSnippet,
    item.description,
    item.summary,
    item["content:encoded"],
    item.content,
  ];

  const config = getFilterConfig(category, subcategory);
  const minLength = config.CONTENT_RULES.MIN_DESCRIPTION_LENGTH;

  for (const source of contentSources) {
    if (source && source.length > minLength) {
      const cleaned = cleanDescription(
        source,
        item.title,
        category,
        subcategory
      );
      if (cleaned && cleaned.length >= minLength) {
        return cleaned;
      }
    }
  }

  return null;
};

const scoreArticleQuality = (item, category = null, subcategory = null) => {
  let score = 0;

  if (item.thumbnail) score += 20;
  if (!containsCodeOrTechnical(item.description)) score += 10;
  if (
    isHighQualityDescription(
      item.description,
      item.title,
      category,
      subcategory
    )
  )
    score += 10;

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

  if (
    category === "tech" &&
    item.description &&
    item.description.length > 200
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

  return score;
};

const createFingerprint = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 30);
};

const getBaseDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
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

// Enhanced parseFeedItem with full filtering logic from server.js
const parseFeedItem = async (
  item,
  source,
  category = null,
  subcategory = null
) => {
  filterStats.totalProcessed++;

  const config = getFilterConfig(category, subcategory);
  const title = item.title || "";

  // Title validation using config
  if (title.length < config.TITLE_RULES.MIN_LENGTH) {
    filterStats.recordFiltered("TITLE_TOO_SHORT", title);
    return null;
  }

  if (title.length > config.TITLE_RULES.MAX_LENGTH) {
    filterStats.recordFiltered("TITLE_TOO_LONG", title);
    return null;
  }

  if (
    config.TITLE_RULES.NO_ALL_CAPS &&
    title === title.toUpperCase() &&
    title.length > 10
  ) {
    filterStats.recordFiltered("ALL_CAPS_TITLE", title);
    return null;
  }

  if (
    config.TITLE_RULES.NO_ALL_LOWERCASE &&
    title === title.toLowerCase() &&
    title.length > 20
  ) {
    filterStats.recordFiltered("ALL_LOWERCASE_TITLE", title);
    return null;
  }

  if (config.TITLE_RULES.NO_SPAM_PATTERNS && isSpamTitle(title)) {
    filterStats.recordFiltered("SPAM_TITLE", title);
    return null;
  }

  if (config.TITLE_RULES.ENGLISH_ONLY && !isLikelyEnglish(title)) {
    filterStats.recordFiltered("NON_ENGLISH", title);
    return null;
  }

  // Age check using config
  const pubDate =
    item.pubDate || item.isoDate || item.published || new Date().toISOString();
  const articleAge = Date.now() - new Date(pubDate);
  const maxAge = config.AGE_RULES.MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  if (articleAge > maxAge) {
    filterStats.recordFiltered("TOO_OLD", title);
    return null;
  }

  // Check for promotional content
  const titleLower = title.toLowerCase();
  const promotionalKeywords = config.PROMOTIONAL_KEYWORDS || [];

  for (const keyword of promotionalKeywords) {
    if (titleLower.includes(keyword.toLowerCase())) {
      filterStats.recordFiltered("PROMOTIONAL", title);
      return null;
    }
  }

  // Extract and validate description with category context
  let description = extractArticleContent(item, category, subcategory);

  if (
    !description ||
    description.length < config.CONTENT_RULES.MIN_DESCRIPTION_LENGTH
  ) {
    filterStats.recordFiltered("DESCRIPTION_TOO_SHORT", title);
    return null;
  }

  if (!isValidDescription(description, title, category, subcategory)) {
    return null;
  }

  if (!isHighQualityDescription(description, title, category, subcategory)) {
    filterStats.recordFiltered("LOW_QUALITY_DESCRIPTION", title);
    return null;
  }

  if (isSpamTopic(title, description)) {
    filterStats.recordFiltered("SPAM_TOPIC", title);
    return null;
  }

  // Create temporary item for quality scoring
  const tempItem = { title, description, pubDate, thumbnail: null };
  const qualityScore = scoreArticleQuality(tempItem, category, subcategory);

  // Thumbnail validation with quality-based fallback
  const thumbnail = await extractBestThumbnail(item, source);
  let allowDefaultIcon = false;

  if (!thumbnail && config.THUMBNAIL_RULES.REQUIRED) {
    if (
      qualifiesForDefaultIcon(tempItem, qualityScore, category, subcategory)
    ) {
      allowDefaultIcon = true;
      console.log(
        `High-quality article (score: ${qualityScore}) allowed without thumbnail: ${title}`
      );
    } else {
      filterStats.recordFiltered("NO_VALID_THUMBNAIL", title);
      return null;
    }
  }

  // Cross-feed deduplication
  if (config.DEDUPLICATION.CROSS_FEED) {
    const fingerprint = createFingerprint(title);
    if (recentFingerprints.has(fingerprint)) {
      filterStats.recordFiltered("DUPLICATE", title);
      return null;
    }
    recentFingerprints.add(fingerprint);
  }

  if (recentFingerprints.size > 100) {
    recentFingerprints.clear();
  }

  // Check if description is too similar to title
  const descLower = description.toLowerCase();
  const titleWords = title.toLowerCase().split(/\s+/);
  const titleWordsInDesc = titleWords.filter(
    (word) => word.length > 3 && descLower.includes(word)
  );

  if (
    titleWords.length > 0 &&
    titleWordsInDesc.length / titleWords.length > 0.7
  ) {
    filterStats.recordFiltered("DESCRIPTION_TOO_SIMILAR", title);
    return null;
  }

  // Final description truncation
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

  filterStats.passed++;

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

// OPTIMIZED fetch function with early exit (matching server.js logic)
async function fetchFeedsWithEarlyExit(feedUrls, category, subcategory) {
  const qualifiedItems = [];
  const seen = new Set();
  const sourceCounts = new Map();
  let totalProcessed = 0;

  const config = getFilterConfig(category, subcategory);
  const MAX_ITEMS_PER_FEED = 15;
  const TARGET_BUFFER = 20;

  console.log(`Starting early-exit processing for ${feedUrls.length} feeds`);
  console.log(
    `Target: ${TARGET_BUFFER} items, will process max ${MAX_ITEMS_PER_FEED} per feed`
  );

  // Process feeds SEQUENTIALLY for early exit
  for (let i = 0; i < feedUrls.length; i++) {
    const feedUrl = feedUrls[i];

    // CHECK: Do we have enough items?
    if (qualifiedItems.length >= TARGET_BUFFER) {
      console.log(
        `EARLY EXIT: ${qualifiedItems.length} items after ${i} feeds, processed ${totalProcessed} total`
      );
      break;
    }

    try {
      const feed = await parser.parseURL(feedUrl);
      const itemsToProcess = feed.items.slice(0, MAX_ITEMS_PER_FEED);

      for (const item of itemsToProcess) {
        totalProcessed++;

        // CHECK during processing
        if (qualifiedItems.length >= TARGET_BUFFER) break;

        // Parse with category-specific rules
        const parsed = await parseFeedItem(
          item,
          feedUrl,
          category,
          subcategory
        );

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
      // Continue to next feed
    }
  }

  console.log(
    `Processed ${totalProcessed} items, qualified ${qualifiedItems.length}`
  );

  // Sort by date
  qualifiedItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  return qualifiedItems.slice(0, 10); // Final limit
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

  // Reset tracking for each request
  filterStats.reset();
  domainCounter.clear();

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

    console.log(`Processing request for ${category}/${subcategory}`);

    // Get config for logging
    const config = getFilterConfig(category, subcategory);
    console.log(
      `Using config - MAX_AGE_DAYS: ${config.AGE_RULES.MAX_AGE_DAYS}, MIN_DESC: ${config.CONTENT_RULES.MIN_DESCRIPTION_LENGTH}`
    );

    // Use optimized fetch with early exit and category-specific filtering
    const qualifiedItems = await fetchFeedsWithEarlyExit(
      feedUrls,
      category,
      subcategory
    );

    // Apply final deduplication logic based on config
    let finalItems = [];

    if (config.DEDUPLICATION.UNCOMMON_WORDS === false) {
      // No uncommon word filtering
      finalItems = qualifiedItems;
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
        if (finalItems.length >= 10) break;

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

    return res.status(200).json({
      items: finalItems,
      count: finalItems.length,
      category,
      subcategory,
      timestamp: new Date().toISOString(),
      success: true,
      stats: filterStats.getReport(),
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
