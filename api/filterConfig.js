const CATEGORY_FILTER_CONFIG = {
  // Global defaults (applied unless overridden)
  DEFAULT: {
    TITLE_RULES: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 110,
      NO_ALL_CAPS: true,
      NO_ALL_LOWERCASE: true,
      NO_SPAM_PATTERNS: true,
      ENGLISH_ONLY: true,
    },
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 50,
      NO_LOWERCASE_START: true,
      NO_SPECIAL_CHAR_START: true,
      NO_URLS_IN_DESCRIPTION: true,
      NO_CODE_CONTENT: false,
      QUALITY_CHECK: true,
      MAX_EMOJI_SYMBOLS: 3,
    },
    SOURCE_RULES: {
      MAX_PER_DOMAIN: 2,
      SOURCE_DIVERSITY: 3,
    },

    THUMBNAIL_RULES: {
      REQUIRED: true,
      USE_DEFAULT_ON_HIGH_QUALITY: true, // New flag for high-quality articles without thumbnails
      MIN_QUALITY_SCORE_FOR_DEFAULT: 35, // Minimum quality score to show default icon
    },
    DEDUPLICATION: {
      CROSS_FEED: true,
      UNCOMMON_WORDS: true,
    },
    LIMITS: {
      MAX_QUESTIONS: 3,
      HOUR_DISTRIBUTION: 2,
    },
    PROMOTIONAL_KEYWORDS: [
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
      "price prediction",
      "easy loan",
      "investment scheme",
      "binary option",
      "url:",
      "URL:",
      "Article URL:",
      "#",
      "%",
    ],
  },

  // Category-level overrides
  tech: {
    // Tech keeps strict defaults, but you can override specific rules
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 50,
      NO_CODE_CONTENT: false, // Allow code in tech content
      QUALITY_CHECK: true,
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      USE_DEFAULT_ON_HIGH_QUALITY: true,
      MIN_QUALITY_SCORE_FOR_DEFAULT: 35,
    },
    PROMOTIONAL_KEYWORDS: [
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
      "price prediction",
      "easy loan",
      "investment scheme",
      "binary option",
      "url:",
      "URL:",
      "Article URL:",
      "#",
      "%",
    ],
    // Subcategory-specific overrides within tech
    subcategories: {
      "ai-machine-learning": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 40, // AI articles often have shorter summaries
          NO_CODE_CONTENT: false,
        },
        LIMITS: {
          MAX_QUESTIONS: 5, // More Q&A style content in AI
        },
      },
      "martech-adtech": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 30, // Marketing content often brief
        },
        THUMBNAIL_RULES: {
          REQUIRED: true, // Many marketing feeds lack thumbnails
          USE_DEFAULT_ON_HIGH_QUALITY: true,
          MIN_QUALITY_SCORE_FOR_DEFAULT: 30, // Lower threshold for marketing
        },
        AGE_RULES: {
          MAX_AGE_DAYS: 14,
        },
      },
      "web-dev-devops": {
        CONTENT_RULES: {
          NO_CODE_CONTENT: false,
          NO_LOWERCASE_START: true,
        },
      },
      "cybersecurity-privacy": {
        AGE_RULES: {
          MAX_AGE_DAYS: 7, // Security news needs to be very fresh
        },
      },
      "blockchain-web3": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 40,
        },
        // Filter out price/trading spam
        PROMOTIONAL_KEYWORDS: [
          "price prediction",
          "moon",
          "lambo",
          "100x",
          "gem",
          "pump",
        ],
      },
    },
  },

  builder: {
    TITLE_RULES: {
      MIN_LENGTH: 10,
      NO_ALL_CAPS: false,
      NO_ALL_LOWERCASE: false,
    },
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 30, // Much shorter ok
      NO_LOWERCASE_START: false,
      NO_SPECIAL_CHAR_START: false,
      NO_URLS_IN_DESCRIPTION: false, // Links to tools ok
      NO_CODE_CONTENT: false,
      QUALITY_CHECK: true,
      MAX_EMOJI_SYMBOLS: 2, // More emojis ok
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      USE_DEFAULT_ON_HIGH_QUALITY: false,
      MIN_QUALITY_SCORE_FOR_DEFAULT: 25, // Lower threshold
    },
    AGE_RULES: {
      MAX_AGE_DAYS: 14, // Evergreen content ok
    },
    DEDUPLICATION: {
      UNCOMMON_WORDS: false, // Allow similar topics
    },
    PROMOTIONAL_KEYWORDS: [
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
      "price prediction",
      "easy loan",
      "investment scheme",
      "binary option",
      "url:",
      "URL:",
      "Article URL:",
      "#",
      "%",
    ],
    subcategories: {
      "startup-stories": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 40,
        },
      },
      "productivity-hacks": {
        AGE_RULES: {
          MAX_AGE_DAYS: 30, // Productivity tips are evergreen - THIS SHOULD OVERRIDE
        },
      },
      "automation-no-code": {
        CONTENT_RULES: {
          NO_CODE_CONTENT: false,
          NO_URLS_IN_DESCRIPTION: false,
        },
      },
      "project-management": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 40,
        },
      },
      "momentum-mindset": {
        AGE_RULES: {
          MAX_AGE_DAYS: 60, // Philosophy/mindset content is timeless
        },
        CONTENT_RULES: {
          QUALITY_CHECK: false, // Abstract content
        },
      },
    },
  },

  art: {
    TITLE_RULES: {
      MIN_LENGTH: 8,
      NO_ALL_CAPS: false,
    },
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 40,
      NO_CODE_CONTENT: false, // Tutorials have code
      QUALITY_CHECK: false,
      MAX_EMOJI_SYMBOLS: 8, // Art uses more symbols
    },
    THUMBNAIL_RULES: {
      REQUIRED: true, // Visual content needs images
      USE_DEFAULT_ON_HIGH_QUALITY: false, // Art content should have real images
      MIN_QUALITY_SCORE_FOR_DEFAULT: 40,
    },
    DEDUPLICATION: {
      UNCOMMON_WORDS: false,
    },
    AGE_RULES: {
      MAX_AGE_DAYS: 30, // Evergreen content ok
    },
    PROMOTIONAL_KEYWORDS: [
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
      "price prediction",
      "easy loan",
      "investment scheme",
      "binary option",
      "url:",
      "URL:",
      "Article URL:",
      "#",
      "%",
    ],
    subcategories: {
      "generative-ai-art": {
        CONTENT_RULES: {
          NO_CODE_CONTENT: false,
        },
      },
      "ui-ux-trends": {
        THUMBNAIL_RULES: {
          REQUIRED: true,
          USE_DEFAULT_ON_HIGH_QUALITY: false,
        },
      },
      "color-typography": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 30,
        },
        AGE_RULES: {
          MAX_AGE_DAYS: 40,
        },
      },
      "animation-motion": {
        THUMBNAIL_RULES: {
          REQUIRED: true,
          USE_DEFAULT_ON_HIGH_QUALITY: true,
          MIN_QUALITY_SCORE_FOR_DEFAULT: 30,
        },
      },
      "tutorials-walkthroughs": {
        CONTENT_RULES: {
          NO_CODE_CONTENT: false,
          NO_URLS_IN_DESCRIPTION: false,
        },
        AGE_RULES: {
          MAX_AGE_DAYS: 90, // Tutorials stay relevant
        },
      },
    },
  },

  gaming: {
    TITLE_RULES: {
      MIN_LENGTH: 8,
      NO_ALL_CAPS: false, // Gaming titles use caps
    },
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 40,
      MAX_EMOJI_SYMBOLS: 5,
      QUALITY_CHECK: false,
    },
    AGE_RULES: {
      MAX_AGE_DAYS: 14,
    },
    THUMBNAIL_RULES: {
      REQUIRED: true, // Gaming content varies
      USE_DEFAULT_ON_HIGH_QUALITY: true,
      MIN_QUALITY_SCORE_FOR_DEFAULT: 30,
    },
    PROMOTIONAL_KEYWORDS: [
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
      "price prediction",
      "easy loan",
      "investment scheme",
      "binary option",
      "url:",
      "URL:",
      "Article URL:",
      "#",
      "%",
    ],
    subcategories: {
      "daily-roundup": {
        AGE_RULES: {
          MAX_AGE_DAYS: 3, // Very fresh news only
        },
      },
      "pro-guides-tips": {
        AGE_RULES: {
          MAX_AGE_DAYS: 90, // Guides stay relevant
        },
      },
      "retro-gaming": {
        AGE_RULES: {
          MAX_AGE_DAYS: 90, // Retro content is timeless
        },
        THUMBNAIL_RULES: {
          REQUIRED: true, // Old games may lack images
          USE_DEFAULT_ON_HIGH_QUALITY: true,
          MIN_QUALITY_SCORE_FOR_DEFAULT: 25,
        },
      },
      "indie-spotlights": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 30,
        },
      },
      "collectors-hub": {
        AGE_RULES: {
          MAX_AGE_DAYS: 90,
        },
      },
    },
  },
};

// FIXED: Deep merge function that properly handles nested objects
function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        // If both target and source have this key as an object, deep merge
        if (
          target[key] &&
          typeof target[key] === "object" &&
          !Array.isArray(target[key])
        ) {
          result[key] = deepMerge(target[key], source[key]);
        } else {
          // Otherwise, just use the source value
          result[key] = source[key];
        }
      } else {
        // For non-objects (including arrays), override with source value
        result[key] = source[key];
      }
    }
  }

  return result;
}

// FIXED: Function to get filter configuration for a specific category/subcategory
function getFilterConfig(category, subcategory = null) {
  // Start with deep copy of defaults
  let config = JSON.parse(JSON.stringify(CATEGORY_FILTER_CONFIG.DEFAULT));

  // Apply category-level overrides if they exist
  if (category && CATEGORY_FILTER_CONFIG[category]) {
    const categoryConfig = { ...CATEGORY_FILTER_CONFIG[category] };

    // Remove subcategories from the category config before merging
    delete categoryConfig.subcategories;

    // Deep merge category config into defaults
    config = deepMerge(config, categoryConfig);
  }

  // Apply subcategory-level overrides if they exist
  if (
    category &&
    subcategory &&
    CATEGORY_FILTER_CONFIG[category]?.subcategories?.[subcategory]
  ) {
    const subcategoryConfig =
      CATEGORY_FILTER_CONFIG[category].subcategories[subcategory];

    // Deep merge subcategory config, which should override both defaults and category
    config = deepMerge(config, subcategoryConfig);
  }

  // Add debug info to help verify correct config is being used
  config._DEBUG_INFO = {
    category: category || "default",
    subcategory: subcategory || "none",
    timestamp: new Date().toISOString(),
  };

  return config;
}

// Function to verify if an item qualifies for default icon based on quality
function qualifiesForDefaultIcon(item, qualityScore, category, subcategory) {
  const config = getFilterConfig(category, subcategory);

  if (!config.THUMBNAIL_RULES.USE_DEFAULT_ON_HIGH_QUALITY) {
    return false;
  }

  return (
    qualityScore >= (config.THUMBNAIL_RULES.MIN_QUALITY_SCORE_FOR_DEFAULT || 35)
  );
}

// ES6 exports for Vercel
export {
  CATEGORY_FILTER_CONFIG,
  getFilterConfig,
  qualifiesForDefaultIcon,
  deepMerge,
};
