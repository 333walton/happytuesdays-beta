// server.js - Enhanced version with filter tracking and mobile optimizations
const express = require("express");
const Parser = require("rss-parser");
const cors = require("cors");
const { formatDistanceToNow } = require("date-fns");

const app = express();
const port = process.env.PORT || 3001;

// Environment check for logging
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const DEBUG_MODE = process.env.DEBUG_FILTERS === "true";

// Conditional logging to prevent mobile performance issues
const debugLog = (...args) => {
  if (!IS_PRODUCTION && DEBUG_MODE) {
    console.log(...args);
  }
};

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

// FILTER RULES DOCUMENTATION AND TRACKING
const FILTER_RULES = {
  TITLE_RULES: {
    MIN_LENGTH: {
      value: 10,
      description: "Title must be at least 10 characters",
    },
    MAX_LENGTH: {
      value: 110,
      description: "Title must be no more than 110 characters",
    },
    NO_ALL_CAPS: {
      value: true,
      description: "Reject all-caps titles over 10 chars",
    },
    NO_ALL_LOWERCASE: {
      value: true,
      description: "Reject all-lowercase titles over 20 chars",
    },
    NO_SPAM_PATTERNS: {
      value: true,
      description: "Reject titles with spam patterns",
    },
    ENGLISH_ONLY: {
      value: true,
      description: "Accept only English titles",
    },
    MIN_VOWELS: {
      value: 2,
      description: "Title must have at least 2 vowels",
    },
    MAX_NONALPHA: {
      value: 7,
      description: "Reject titles with >7 consecutive non-alphanumeric chars",
    },
    KEYWORD_BLACKLIST: {
      value: true,
      description:
        "Reject titles with blacklisted keywords (see promotionalKeywords)",
    },
  },
  CONTENT_RULES: {
    MIN_DESCRIPTION_LENGTH: {
      value: 50, // lower for some valid entries
      description: "Description must be at least 50 characters",
    },
    NO_LOWERCASE_START: {
      value: true,
      description: "Description cannot start with lowercase letter",
    },
    NO_SPECIAL_CHAR_START: {
      value: true,
      description: "Description cannot start with special character",
    },
    NO_URLS_IN_DESCRIPTION: {
      value: true,
      description: "No URLs allowed in description",
    },
    NO_CODE_CONTENT: {
      value: false,
      description:
        "No code snippets in description (Allowed for tech categories)",
    },
    QUALITY_CHECK: {
      value: true,
      description: "Must pass quality checks",
    },
    MAX_EMOJI_SYMBOLS: {
      value: 3,
      description: "Reject description with >3 non-alphanumeric/emoji",
    },
    KEYWORD_BLACKLIST: {
      value: true,
      description: "Reject descriptions with blacklisted spam/ads keywords",
    },
    MAX_LINKS: {
      value: 3,
      description: "Reject content with more than 3 hyperlinks (anti-spam)",
    },
    MAX_LINK_PERCENT: {
      value: 0.5,
      description: "Reject if links make up more than 50% of content",
    },
    ENGLISH_ONLY: {
      value: true,
      description: "Accept only English content",
    },
  },
  SOURCE_RULES: {
    MAX_PER_DOMAIN: {
      value: 2,
      description: "Maximum 2 articles per base domain",
    },
    BLOCKED_DOMAINS: {
      value: true,
      description: "Block specific domains (see blocklist)",
    },
    SOURCE_DIVERSITY: {
      value: 3,
      description: "Max 3 articles per RSS source",
    },
    BLOCKLIST_BY_FAILURE: {
      value: { maxFailures: 3, resetInHours: 48 },
      description: "Auto-block sources failing filter more than 3x in 48h",
    },
  },
  AGE_RULES: {
    MAX_AGE_DAYS: {
      value: 7,
      description: "Articles must be less than 7 days old",
    },
  },
  THUMBNAIL_RULES: {
    REQUIRED: { value: true, description: "Valid thumbnail required" },
    MIN_WIDTH: { value: 400, description: "Thumbnail minimum width 400px" },
    MIN_HEIGHT: { value: 300, description: "Thumbnail minimum height 300px" },
    ASPECT_RATIO: {
      value: [1.33, 2.5],
      description:
        "Thumbnail aspect ratio must be between 4:3 (1.33) and 2.5:1",
    },
  },
  DEDUPLICATION: {
    CROSS_FEED: {
      value: true,
      description: "Remove duplicates across feeds",
    },
    UNCOMMON_WORDS: {
      value: true,
      description: "Filter duplicate uncommon words in titles",
    },
    URL_STRIP_PARAMS: {
      value: true,
      description:
        "Treat URLs as duplicate if only differing by tracking params",
    },
  },
  LIMITS: {
    MAX_QUESTIONS: {
      value: 3,
      description: "Maximum 3 question titles per batch",
    },
    HOUR_DISTRIBUTION: {
      value: 2,
      description: "Max 2 articles per hour timestamp",
    },
    MAX_PER_SOURCE_PER_DAY: {
      value: 10,
      description: "Max 10 articles per source per 24h",
    },
  },
  HTML_SANITIZATION: {
    STRIP_JS: {
      value: true,
      description:
        "Remove <script>, <iframe>, and unwanted tags from description",
    },
  },
};

// Filter statistics tracker
const filterStats = {
  totalProcessed: 0,
  filtered: {}, // {reason: count}
  filteredSamples: {}, // {reason: [title1, title2, ...]}
  passed: 0,

  reset() {
    this.totalProcessed = 0;
    this.filtered = {};
    this.filteredSamples = {};
    this.passed = 0;
  },

  /**
   * Records a reason for filtering an item, and keeps up to 5 sample titles/articles per reason.
   * @param {string} reason - The filter reason label.
   * @param {string} [title=""] - (Optional) The article title or description.
   */
  recordFiltered(reason, title = "") {
    this.filtered[reason] = (this.filtered[reason] || 0) + 1;

    // Track up to 5 samples per reason for debugging
    if (!this.filteredSamples[reason]) this.filteredSamples[reason] = [];
    if (title && this.filteredSamples[reason].length < 5) {
      this.filteredSamples[reason].push(title.substring(0, 120)); // Make sample not too long
    }
    debugLog(`⚠️ Filtered [${reason}]: "${title.substring(0, 50)}..."`);
  },

  getReport() {
    return {
      totalProcessed: this.totalProcessed,
      passed: this.passed,
      filtered: this.filtered,
      // Include sample articles for each filter reason
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

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? "*" : "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Global fingerprint tracking for cross-feed deduplication
const recentFingerprints = new Set();

// Domain tracker for the new rule
const domainCounter = new Map();

// Create content fingerprint for deduplication
const createFingerprint = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 30);
};

// Extract base domain from URL
const getBaseDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

// Blocked domains list
const blockedDomains = [
  "medium.com",
  "forbes.com",
  "businessinsider.com",
  "buzzfeed.com",
  "huffpost.com",
  "vice.com",
  "qz.com",
];

// Updated RSS Feed catalog (same as before)
const RSS_FEEDS = {
  tech: {
    "ai-machine-learning": [
      "https://openai.com/news/rss/", // Official OpenAI news, product launches, and research
      "https://cloud.google.com/blog/products/ai-machine-learning/rss/", // Google Cloud AI and ML updates, case studies, new tools
      "https://news.mit.edu/topic/artificial-intelligence2/rss.xml", // MIT research news on artificial intelligence and machine learning
      "https://machinelearningmastery.com/feed/", // Beginner to advanced ML tutorials and tips
      "https://www.marktechpost.com/feed/", // Practical AI insights, tool announcements, use cases
      "https://hnrss.org/newest?q=AI+OR+machine+learning", // Latest AI and ML news and projects from Hacker News
      "https://blog.google/technology/ai/rss/", // Google company-wide AI news, advancements, and applications
      "https://huggingface.co/blog/feed.xml", // NLP and ML advances, transformer model news, Hugging Face community updates
      "https://www.deeplearning.ai/blog/feed/", // Applied AI topics, learning resources, industry interviews
      "https://hai.stanford.edu/news/rss.xml", // Stanford AI Institute: research, events, and interviews
      "https://allenai.org/rss.xml", // AI2 research, open tools, datasets, and breakthroughs
      "https://venturebeat.com/category/ai/feed/", // Industry AI news, startup funding, tech trends
      "https://arxiv-sanity-lite.com/feed/?query=cs.AI", // Latest arXiv preprints in computer science (AI)
      "https://www.aitrends.com/feed/", // Business-focused AI trends and enterprise adoption, beginner-friendly
      "https://blogs.microsoft.com/ai/feed/", // Frequent updates on practical business applications and AI research
    ],

    "martech-adtech": [
      "https://martech.org/feed/", // Broad marketing technology news, tool reviews, industry coverage
      "https://adexchanger.com/feed/", // Digital ad tech, programmatic marketing, data-driven campaign news
      "https://marketingland.com/feed/", // Marketing strategy, social media, analytics best practices
      "https://chiefmartec.com/feed/", // Martech landscape, software analysis, marketing operations
      "https://www.marketingtechnews.net/rss.xml", // Marketing, ad tech, and digital transformation trends
      "https://digiday.com/feed/", // Media, marketing, digital ad industry news and policy
      "https://www.marketingprofs.com/rss/all", // Marketing education, tips, and how-to articles
      "https://adtechdaily.com/feed", // Ad ops news and actionable campaign strategies
      "https://verve.com/feed", // Omnichannel ad platform updates and privacy-first marketing tech
      "https://adpushup.com/blog/feed", // Ad revenue optimization and technology-driven marketing insights
    ],

    "web-dev-devops": [
      "https://css-tricks.com/feed/", // Practical front-end development tips, CSS & JS techniques
      "https://www.smashingmagazine.com/feed/", // Web design, UX, front-end tools, industry analysis
      "https://web.dev/feed.xml", // Modern web standards, performance, best practices from Google
      "https://blog.logrocket.com/feed/", // In-depth web dev tutorials, tools, debugging guides
      "https://www.joshwcomeau.com/rss.xml", // Front-end tutorials, React and CSS deep dives
      "https://kentcdodds.com/blog/rss.xml", // Javascript, React, testing, and developer workflow tips
      "https://dev.to/feed/tag/webdev", // Dev community discussions, webdev projects, tutorials
      "https://blog.cloudflare.com/rss/", // Security, performance, web infrastructure innovation
      "https://github.blog/category/development/feed/", // GitHub platform news and developer topics
      "https://devops.com/feed", // Extensive DevOps guides, workflows, and original industry content
      "https://atlassian.com/blog/devops/feed", // Actionable DevOps tips focused on team collaboration
    ],

    "cybersecurity-privacy": [
      "https://krebsonsecurity.com/feed/", // Security threats, breaches, and investigative reporting
      "https://feeds.feedburner.com/TheHackersNews", // Daily security news, hacks, vulnerabilities
      "https://www.darkreading.com/rss.xml", // Enterprise security news, threat analysis
      "https://www.schneier.com/feed/atom/", // Security commentary, cryptography, privacy issues
      "https://www.bleepingcomputer.com/feed/", // Security research, malware news, software exploits
      "https://threatpost.com/feed/", // Threat landscape, vulnerabilities, cybersecurity trends
      "https://blog.talosintelligence.com/feeds/posts/default", // Cisco Talos updates, threat intelligence
      "https://www.microsoft.com/security/blog/feed/", // Security best practices, product and threat updates
    ],

    "blockchain-web3": [
      "https://www.coindesk.com/arc/outboundfeeds/rss/", // Crypto industry news, blockchain developments, finance
      "https://decrypt.co/feed", // Blockchain, crypto, DeFi, and NFT news
      "https://cointelegraph.com/rss", // Global crypto news, industry features, price analysis
      "https://ethereum.org/en/blog/feed.xml", // Official Ethereum ecosystem updates, dev news
      "https://blog.chain.link/rss/", // Smart contracts, Chainlink product updates, blockchain tutorials
      "https://messari.io/rss", // Research reports, data analysis, crypto market deep dives
      "https://bankless.substack.com/feed", // DeFi strategies, Ethereum, and Web3 trends
      "https://vitalik.eth.limo/feed.xml", // Posts by Vitalik Buterin, Ethereum and crypto commentary
    ],
  },

  builder: {
    "startup-stories": [
      "https://review.firstround.com/rss/", // Founder interviews, startup lessons from First Round Capital
      "https://blog.ycombinator.com/feed/", // Startup announcements, founder advice from Y Combinator
      "https://techcrunch.com/category/startups/feed/", // Startup industry news, venture rounds, launches
      "https://www.indiehackers.com/feed.xml", // Independent founder stories, bootstrapping insights
      "https://sifted.eu/feed/", // European tech startups, funding, industry analysis
      "https://venturebeat.com/category/entrepreneur/feed/", // Entrepreneurship coverage, startup news
      "https://bothsidesofthetable.com/feed", // VC and founder perspectives, investment insights
      "https://www.startupgrind.com/feed.xml", // Founder stories, startup lessons, and event highlights
    ],

    "productivity-hacks": [
      "https://zenhabits.net/feed/", // Mindfulness, minimalism, and productivity habits
      "https://jamesclear.com/feed", // Atomic habits, behavioral science-backed productivity
      "https://gettingthingsdone.com/feed/", // GTD methodology, practical organization advice
      "https://aliabdaal.com/rss/", // Productivity, study tips, tools and routines
      "https://tim.blog/feed/", // Tim Ferriss: productivity tactics, interviews, life hacks
      "https://calnewport.com/blog/feed/", // Deep work, focus, and work philosophy
      "https://www.asianefficiency.com/feed/", // Practical productivity techniques and workflow tips
    ],

    "automation-no-code": [
      "https://zapier.com/blog/feeds/latest/", // Automation tutorials, use cases, app integrations
      "https://bubble.io/blog/rss", // No-code app building guides, platform updates
      "https://www.nocode.tech/feed", // No-code tools, trends, comparison reviews
      "https://blog.airtable.com/rss/", // Airtable product updates, automation use cases
      "https://webflow.com/blog/feed.rss", // Visual web development, design workflows
      "https://blog.n8n.io/rss/", // Open-source automation, integration tutorials
      "https://makerpad.co/posts.atom", // No-code project ideas, community stories
      "https://www.producthunt.com/feed/no-code", // Latest no-code products, launches
    ],

    "project-management": [
      "https://blog.asana.com/feed/", // Asana platform tips, PM best practices
      "https://blog.trello.com/rss", // Visual PM, workflow tips, Trello updates
      "https://monday.com/blog/feed/", // Monday.com use cases and team management stories
      "https://www.projectmanager.com/blog/feed", // PM methodologies, software guides
      "https://blog.clickup.com/feed/", // Productivity boosts, ClickUp tips for teams
      "https://www.atlassian.com/blog/feed", // PM thought leadership, tools news
      "https://www.wrike.com/blog/feed/", // Collaboration, workflow optimization, Wrike updates
      "https://www.pmi.org/rss.xml", // Deep best practices in project management for teams
    ],

    "momentum-mindset": [
      "https://fs.blog/feed/", // Farnam Street: mental models, personal development
      "https://ryanholiday.net/feed/", // Stoicism, philosophy, resilience
      "https://markmanson.net/feed", // Practical self-help, emotional intelligence
      "https://sethgodin.typepad.com/seths_blog/atom.xml", // Marketing and life wisdom, idea generation
      "https://dailystoic.com/feed/", // Daily stoic practices, ancient philosophy
      "https://tim.blog/feed/", // Life lessons, mindset hacks, interviews
      "https://jamesclear.com/feed", // Atomic habits, science-backed focus
      "https://waitbutwhy.com/feed", // Deep-dive essays on life and psychology
      "https://feeds.feedburner.com/brainpickings/rss", // The Marginalian: literature, philosophy, human flourishing
      "https://www.mindful.org/feed", // Habits, resilience, and science-backed mental wellness
    ],
  },

  art: {
    "generative-ai-art": [
      "https://aiartists.org/feed", // AI art showcases, artist interviews, creative techniques
      "https://www.creativebloq.com/feeds/tag/ai-art", // AI art trends, digital exhibitions, visual inspiration
      "https://ml.berkeley.edu/blog/feed.xml", // Machine learning research and creative applications from Berkeley
      "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", // News and features on AI art, technology, ethics
      "https://runwayml.com/blog/rss/", // Generative AI art tools, tutorials, use cases
    ],

    "ui-ux-trends": [
      "https://www.smashingmagazine.com/feed/", // Design trends, UX best practices, workflow guides
      "https://uxplanet.org/feed", // Practical UX guides, theory, case studies
      "https://alistapart.com/main/feed", // Web standards, design innovation, accessibility
      "https://uxdesign.cc/feed", // UX trends, research, and comprehensive design critiques
      "https://www.nngroup.com/feed/rss/", // Usability research, principles, and findings from NNGroup
      "https://www.invisionapp.com/inside-design/feed/", // UI inspiration, tool tips, UX process guides
      "https://www.uxmatters.com/feed.php", // UX issues, solutions, and interviews
      "https://sidebar.io/feed.xml", // Daily curated design links from the web
    ],

    "color-typography": [
      "https://fontsinuse.com/feed", // Typography in use, case studies, design examples
      "https://blog.adobe.com/en/publish/creative-cloud.xml", // Adobe product updates, creative resources
      "https://typographica.org/feed/", // Typeface reviews, typographic innovations
      "https://ilovetypography.com/feed/", // Font releases, typography philosophy, design news
      "https://fonts.googleblog.com/feeds/posts/default", // Google Fonts announcements, type releases
    ],

    "animation-motion": [
      "https://motionographer.com/feed/", // Animation industry news, inspiration, interviews
      "https://greensock.com/blog/feed", // Web animation techniques, GSAP tutorials
      "https://www.animatedreview.com/feed/", // Animation show reviews, artist interviews
      "https://lottiefiles.com/blog/feed", // Motion design inspiration, Lottie animations, resources
      "https://www.schoolofmotion.com/blog/rss", // Motion design inspiration, tutorials, and workflow tips
    ],

    "tutorials-walkthroughs": [
      "https://tympanus.net/codrops/feed/", // Creative front-end tutorials, code experiments
      "https://webdesign.tutsplus.com/posts.atom", // Design and UX tutorials for creatives
      "https://designmodo.com/feed/", // Web design walkthroughs, resources, guides
      "https://www.sitepoint.com/design-ux/feed/", // UI/UX tutorials, web technology news
      "https://tutsplus.com/feed/", // Multi-disciplinary creative tutorials, beginner to advanced
      "https://www.freecodecamp.org/news/rss/", // Programming, web dev tutorials, community stories
    ],
  },

  gaming: {
    "daily-roundup": [
      "https://www.polygon.com/rss/index.xml", // Gaming news, reviews, and feature articles
      "https://www.gamespot.com/feeds/news/", // Latest gaming news, reviews, previews
      "https://www.rockpapershotgun.com/feed", // PC game news, indie spotlights, reviews
      "https://www.gamesradar.com/rss/", // Gaming news, guides, hardware, reviews
      "https://www.eurogamer.net/feed", // Video game news, reviews, guides
      "https://kotaku.com/rss", // Gaming culture, news, essays, and features
      "https://www.destructoid.com/feed/", // Game reviews, quirky news, culture columns
      "https://www.ign.com/rss", // Daily gaming news, releases, and industry highlights
    ],

    "pro-guides-tips": [
      "https://www.gamepur.com/feed", // Game guides, walkthroughs, latest releases
      "https://www.thegamer.com/feed/", // Guides, tips, and news for major gaming platforms
      "https://dotesports.com/feed", // Esports news, pro player strategies, team updates
      "https://www.pcgamer.com/rss/", // Game reviews, news, and pro-level PC gaming tips
    ],

    "retro-gaming": [
      "https://www.timeextension.com/feed/", // Retro game reviews, industry retrospectives
      "https://indieretronews.com/feeds/posts/default?alt=rss", // Retro game news, indie scene
      "https://retrododo.com/feed/", // Retro game hardware, collectibles, news
      "https://www.retrogamer.net/feed/", // Magazine articles, history flashbacks, retro gaming news
      "https://www.hardcoregaming101.net/feed/", // In-depth game histories, preservation guides
      "https://retroblast.com/feed/", // Retro gaming news and hardware preservation updates
    ],

    "indie-spotlights": [
      "https://indiegames.com/feed/", // Indie game news, reviews, and updates
      "https://www.indiedb.com/rss/games/", // Indie game database updates, project launches
      "https://www.gamedeveloper.com/rss.xml", // Game development insights, indie and AAA coverage
      "https://warpdoor.com/feed/", // Unique indie games, weird and innovative project news
      "https://alphabetagamer.com/feed/", // New indie game demos, releases, beta invites
      "https://indiegamesplus.com/feed/", // In-depth indie game reviews, news, and community spotlights
    ],

    "collectors-hub": [
      "https://www.racketboy.com/feed/", // Collector’s guides, retro hardware coverage
      "https://videogamekrieg.com/feed", // Retro and collectible games news, interviews
      "https://www.pricecharting.com/blog/feed", // Pricing reports, rare item tracking, collecting tips
      "https://www.retrorgb.com/feed/", // Hardware preservation, RGB mods, technical guides
      "https://www.gamingalexandria.com/wp/feed/", // Preservation, scans, archival gaming news
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

// NEW: Enhanced description validation
const isValidDescription = (description, title = "") => {
  if (!description) {
    filterStats.recordFiltered("NO_DESCRIPTION", title);
    return false;
  }

  // NEW RULE: Minimum 75 characters
  if (
    description.length < FILTER_RULES.CONTENT_RULES.MIN_DESCRIPTION_LENGTH.value
  ) {
    filterStats.recordFiltered("DESCRIPTION_TOO_SHORT", title);
    return false;
  }

  // NEW RULE: Cannot start with lowercase letter
  if (
    FILTER_RULES.CONTENT_RULES.NO_LOWERCASE_START.value &&
    /^[a-z]/.test(description)
  ) {
    filterStats.recordFiltered("LOWERCASE_START", title);
    return false;
  }

  // NEW RULE: Cannot start with special character (except quotes)
  if (
    FILTER_RULES.CONTENT_RULES.NO_SPECIAL_CHAR_START.value &&
    /^[^A-Za-z0-9"']/.test(description)
  ) {
    filterStats.recordFiltered("SPECIAL_CHAR_START", title);
    return false;
  }

  // NEW RULE: No URLs in description
  if (FILTER_RULES.CONTENT_RULES.NO_URLS_IN_DESCRIPTION.value) {
    const urlPattern =
      /https?:\/\/[^\s]+|www\.[^\s]+|\w+\.(com|org|net|io|dev|edu|gov|uk|ca|au|de|fr|jp|cn|in|br|mx|ru|it|es|nl|se|no|dk|fi|pl|gr|pt|cz|hu|ro|bg|hr|si|sk|lt|lv|ee)\b/gi;
    if (urlPattern.test(description)) {
      filterStats.recordFiltered("URL_IN_DESCRIPTION", title);
      return false;
    }
  }

  return true;
};

// Strict thumbnail validation
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

  // Check for minimum dimensions
  const minWidth = FILTER_RULES.THUMBNAIL_RULES.MIN_WIDTH.value;
  const minHeight = FILTER_RULES.THUMBNAIL_RULES.MIN_HEIGHT.value;

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
    if (width < minWidth || height < minHeight) return false;
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

  // Remove URLs
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

  // Apply NEW validation rules
  if (!isValidDescription(description, title)) {
    return "";
  }

  if (!isHighQualityDescription(description, title)) {
    return "";
  }

  description = description.replace(/\s+/g, " ").trim();

  if (description && !description.match(/[.!?]$/)) {
    description += ".";
  }

  // Ensure max length
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
      if (
        cleaned &&
        cleaned.length >=
          FILTER_RULES.CONTENT_RULES.MIN_DESCRIPTION_LENGTH.value
      ) {
        return cleaned;
      }
    }
  }

  return null;
};

// Enhanced parse feed item with all rules
const parseFeedItem = async (item, source) => {
  filterStats.totalProcessed++;

  const title = item.title || "";

  // Check title rules
  if (title.length < FILTER_RULES.TITLE_RULES.MIN_LENGTH.value) {
    filterStats.recordFiltered("TITLE_TOO_SHORT", title);
    return null;
  }

  if (
    FILTER_RULES.TITLE_RULES.NO_ALL_CAPS.value &&
    title === title.toUpperCase() &&
    title.length > 10
  ) {
    filterStats.recordFiltered("ALL_CAPS_TITLE", title);
    return null;
  }

  if (
    FILTER_RULES.TITLE_RULES.NO_ALL_LOWERCASE.value &&
    title === title.toLowerCase() &&
    title.length > 20
  ) {
    filterStats.recordFiltered("ALL_LOWERCASE_TITLE", title);
    return null;
  }

  if (FILTER_RULES.TITLE_RULES.NO_SPAM_PATTERNS.value && isSpamTitle(title)) {
    filterStats.recordFiltered("SPAM_TITLE", title);
    return null;
  }

  if (FILTER_RULES.TITLE_RULES.ENGLISH_ONLY.value && !isLikelyEnglish(title)) {
    filterStats.recordFiltered("NON_ENGLISH", title);
    return null;
  }

  // Age filter
  const pubDate =
    item.pubDate || item.isoDate || item.published || new Date().toISOString();
  const articleAge = Date.now() - new Date(pubDate);
  const maxAge =
    FILTER_RULES.AGE_RULES.MAX_AGE_DAYS.value * 24 * 60 * 60 * 1000;

  if (articleAge > maxAge) {
    filterStats.recordFiltered("TOO_OLD", title);
    return null;
  }

  // Check for promotional content
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
    "casino",
    "betting",
    "buy now",
    "loan",
    "sponsored",
    "crowdfunding",
    "press release",
    "partner announcement",
    "advertorial",
    "guest post",
    "price prediction", // for blockchain/web3
    "easy loan",
    "investment scheme",
    "binary option",
  ];

  for (const keyword of promotionalKeywords) {
    if (titleLower.includes(keyword)) {
      filterStats.recordFiltered("PROMOTIONAL", title);
      return null;
    }
  }

  // Thumbnail validation
  const thumbnail = await extractBestThumbnail(item, source);

  if (
    FILTER_RULES.THUMBNAIL_RULES.REQUIRED.value &&
    (!thumbnail || !(await isRealArticleThumbnail(thumbnail, item)))
  ) {
    filterStats.recordFiltered("NO_VALID_THUMBNAIL", title);
    return null;
  }

  // Extract and validate description
  let description = extractArticleContent(item);

  if (!description) {
    filterStats.recordFiltered("NO_DESCRIPTION", title);
    return null;
  }

  if (containsCodeOrTechnical(description)) {
    filterStats.recordFiltered("TECHNICAL_CONTENT", title);
    return null;
  }

  // Apply new validation rules
  if (!isValidDescription(description, title)) {
    return null; // Already recorded in isValidDescription
  }

  if (!isHighQualityDescription(description, title)) {
    filterStats.recordFiltered("LOW_QUALITY_DESCRIPTION", title);
    return null;
  }

  // Check for spam topics
  if (isSpamTopic(title, description)) {
    filterStats.recordFiltered("SPAM_TOPIC", title);
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
    filterStats.recordFiltered("SUSPICIOUS_AUTHOR", title);
    return null;
  }

  // Cross-feed deduplication
  if (FILTER_RULES.DEDUPLICATION.CROSS_FEED.value) {
    const fingerprint = createFingerprint(title);
    if (recentFingerprints.has(fingerprint)) {
      filterStats.recordFiltered("DUPLICATE", title);
      return null;
    }
    recentFingerprints.add(fingerprint);
  }

  // Clear fingerprints periodically
  if (recentFingerprints.size > 100) {
    recentFingerprints.clear();
  }

  // Check if description is too similar to title
  const descLower = description.toLowerCase();
  const titleWords = titleLower.split(/\s+/);
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

  // Final length checks
  if (
    description.length < FILTER_RULES.CONTENT_RULES.MIN_DESCRIPTION_LENGTH.value
  ) {
    filterStats.recordFiltered("FINAL_LENGTH_CHECK", title);
    return null;
  }

  // Truncate if needed
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
    thumbnail,
    source: getFeedDisplayName(source),
    sourceUrl: source,
    creator: item.creator || item.author || getFeedDisplayName(source),
    guid: item.guid || item.link || `${source}-${pubDate}`,
    pubDate,
    time: formatDistanceToNow(new Date(pubDate), { addSuffix: true }),
  };
};

// Fetch single RSS feed with less aggressive timeout
const fetchSingleFeed = async (url, timeout = 8000) => {
  const problematicSources = [
    "lifehacker.com",
    "gizmodo.com",
    "kotaku.com",
    "deadspin.com",
  ];

  if (blockedDomains.some((domain) => url.includes(domain))) {
    debugLog(`Blocked domain: ${url}`);
    return [];
  }

  if (problematicSources.some((source) => url.includes(source))) {
    debugLog(`Skipping problematic source: ${url}`);
    return [];
  }

  return new Promise(async (resolve) => {
    const timer = setTimeout(() => resolve([]), timeout);

    try {
      const feed = await parser.parseURL(url);
      clearTimeout(timer);

      // LIMIT: Process maximum 15 items per feed
      const itemsToProcess = feed.items.slice(0, 15);

      const parsedItems = await Promise.all(
        itemsToProcess.map((item) => parseFeedItem(item, url))
      );

      const validItems = parsedItems.filter((item) => item !== null);
      resolve(validItems);
    } catch (error) {
      clearTimeout(timer);
      debugLog(`Error fetching feed ${url}:`, error.message);
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
  debugLog("📨 Received feed request:", req.body);
  const { category, subcategory } = req.body;

  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }

  // Configuration
  const MAX_ITEMS = 10; // Final number of items to return
  const MAX_ITEMS_PER_FEED = 15; // Max items to process per feed
  const TARGET_BUFFER = 20; // Stop when we have this many qualified items

  // Reset stats for this request
  filterStats.reset();
  domainCounter.clear();

  try {
    const feedUrls = subcategory
      ? getFeedsForSubcategory(category, subcategory)
      : getFeedsForCategory(category);

    if (!feedUrls || feedUrls.length === 0) {
      return res.json({
        items: [],
        message: "No feeds found for this category",
        stats: filterStats.getReport(),
      });
    }

    // EARLY EXIT IMPLEMENTATION
    const qualifiedItems = [];
    const seen = new Set();
    const sourceCounts = new Map();
    let totalProcessed = 0;

    debugLog(`🎯 Starting early-exit processing for ${feedUrls.length} feeds`);

    // Process feeds SEQUENTIALLY (not in parallel) to allow early exit
    for (let feedIndex = 0; feedIndex < feedUrls.length; feedIndex++) {
      const feedUrl = feedUrls[feedIndex];

      // CHECK 1: Do we have enough qualified items?
      if (qualifiedItems.length >= TARGET_BUFFER) {
        debugLog(
          `✅ Early exit: Have ${qualifiedItems.length} qualified items after ${feedIndex} feeds`
        );
        break;
      }

      try {
        debugLog(
          `📡 Fetching feed ${feedIndex + 1}/${
            feedUrls.length
          }: ${getFeedDisplayName(feedUrl)}`
        );

        // Fetch ONE feed at a time
        const feed = await parser.parseURL(feedUrl);

        // LIMIT items per feed to avoid over-processing
        const itemsToProcess = feed.items.slice(0, MAX_ITEMS_PER_FEED);
        debugLog(
          `  Found ${feed.items.length} items, processing up to ${itemsToProcess.length}`
        );

        // Process items from this feed
        for (
          let itemIndex = 0;
          itemIndex < itemsToProcess.length;
          itemIndex++
        ) {
          const item = itemsToProcess[itemIndex];
          totalProcessed++;

          // CHECK 2: Do we have enough during item processing?
          if (qualifiedItems.length >= TARGET_BUFFER) {
            debugLog(
              `  ⏹️ Stopping item processing at ${itemIndex}/${itemsToProcess.length}`
            );
            break;
          }

          // Parse and validate the item
          const parsedItem = await parseFeedItem(item, feedUrl);

          if (!parsedItem) {
            continue; // Item was filtered out
          }

          // Deduplication check
          const key = parsedItem.guid || parsedItem.link;
          if (seen.has(key)) {
            filterStats.recordFiltered("DUPLICATE", parsedItem.title);
            continue;
          }

          // Domain limit check
          const baseDomain = getBaseDomain(parsedItem.link);
          if (baseDomain) {
            const domainCount = domainCounter.get(baseDomain) || 0;
            if (domainCount >= FILTER_RULES.SOURCE_RULES.MAX_PER_DOMAIN.value) {
              filterStats.recordFiltered("DOMAIN_LIMIT", parsedItem.title);
              continue;
            }
            domainCounter.set(baseDomain, domainCount + 1);
          }

          // Source diversity check
          const sourceCount = sourceCounts.get(parsedItem.source) || 0;
          if (sourceCount >= FILTER_RULES.SOURCE_RULES.SOURCE_DIVERSITY.value) {
            filterStats.recordFiltered("SOURCE_LIMIT", parsedItem.title);
            continue;
          }

          // ✅ Item passed all checks!
          seen.add(key);
          sourceCounts.set(parsedItem.source, sourceCount + 1);
          qualifiedItems.push(parsedItem);

          debugLog(
            `  ✅ Qualified #${
              qualifiedItems.length
            }: "${parsedItem.title.substring(0, 50)}..."`
          );
        }

        debugLog(
          `  Feed complete: ${qualifiedItems.length} total qualified items`
        );
      } catch (error) {
        debugLog(`  ❌ Error fetching feed: ${error.message}`);
        // Continue to next feed on error
      }
    }

    debugLog(
      `📊 Processing complete: ${totalProcessed} items processed, ${qualifiedItems.length} qualified`
    );

    // Sort by quality score and date
    qualifiedItems.sort((a, b) => {
      const scoreA = scoreArticleQuality(a);
      const scoreB = scoreArticleQuality(b);

      if (Math.abs(scoreA - scoreB) > 2) {
        return scoreB - scoreA;
      }

      return new Date(b.pubDate) - new Date(a.pubDate);
    });

    // Additional filtering for uncommon words and other limits
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

    for (const item of qualifiedItems) {
      // Stop when we have enough final items
      if (filteredItems.length >= MAX_ITEMS) {
        break;
      }

      // Check question title limit
      if (item.title.includes("?")) {
        if (questionTitlesCount >= FILTER_RULES.LIMITS.MAX_QUESTIONS.value) {
          filterStats.recordFiltered("QUESTION_LIMIT", item.title);
          continue;
        }
        questionTitlesCount++;
      }

      // Check hour distribution
      const hour = new Date(item.pubDate).getHours();
      const hourCount = hourBuckets.get(hour) || 0;
      if (hourCount >= FILTER_RULES.LIMITS.HOUR_DISTRIBUTION.value) {
        filterStats.recordFiltered("HOUR_DISTRIBUTION", item.title);
        continue;
      }

      // Check for duplicate uncommon words
      if (FILTER_RULES.DEDUPLICATION.UNCOMMON_WORDS.value) {
        const titleWords = item.title
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((word) => word.length > 4 && !commonWords.has(word));

        let hasDuplicate = false;
        for (const word of titleWords) {
          if (usedUncommonWords.has(word)) {
            filterStats.recordFiltered("DUPLICATE_WORD", item.title);
            hasDuplicate = true;
            break;
          }
        }

        if (!hasDuplicate) {
          filteredItems.push(item);
          titleWords.forEach((word) => usedUncommonWords.add(word));
          hourBuckets.set(hour, hourCount + 1);
        }
      } else {
        filteredItems.push(item);
        hourBuckets.set(hour, hourCount + 1);
      }
    }

    const finalItems = filteredItems.slice(0, MAX_ITEMS);

    // Include filter stats in response
    const stats = filterStats.getReport();

    debugLog(`✅ Returning ${finalItems.length} items to client`);

    res.json({
      items: finalItems,
      count: finalItems.length,
      category,
      subcategory,
      stats: DEBUG_MODE ? stats : undefined,
      filterRules: DEBUG_MODE ? FILTER_RULES : undefined,
    });
  } catch (error) {
    console.error("Feed fetching error:", error);
    res.status(500).json({
      error: "Failed to fetch feeds",
      message: error.message,
      stats: filterStats.getReport(),
    });
  }
});

// New endpoint to get filter rules documentation
app.get("/api/filter-rules", (req, res) => {
  const rules = {};

  for (const [category, categoryRules] of Object.entries(FILTER_RULES)) {
    rules[category] = {};
    for (const [ruleName, ruleConfig] of Object.entries(categoryRules)) {
      rules[category][ruleName] = {
        enabled: ruleConfig.value !== false,
        value: ruleConfig.value,
        description: ruleConfig.description,
      };
    }
  }

  res.json({
    rules,
    stats: filterStats.getReport(),
    message:
      "These are the active filter rules being applied to all feed items",
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: IS_PRODUCTION ? "production" : "development",
    debugMode: DEBUG_MODE,
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 RSS Feed Server running at http://localhost:${port}`);
  console.log(
    `📊 Filter rules endpoint: http://localhost:${port}/api/filter-rules`
  );
  console.log(`❤️ Health check: http://localhost:${port}/api/health`);
  console.log(`🔍 Debug mode: ${DEBUG_MODE ? "ON" : "OFF"}`);
  console.log(
    `🌍 Environment: ${IS_PRODUCTION ? "PRODUCTION" : "DEVELOPMENT"}`
  );
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
