// filterConfig.js - Single Source of Truth for All Filter Configurations
// This allows you to configure specific filter rules for each category and subcategory
// view all settings easily by entering http://localhost:3001/api/filter-configs into the browser (select 'pretty-print')

const CATEGORY_FILTER_CONFIG = {
  // Global defaults (applied unless overridden)
  DEFAULT: {
    TITLE_RULES: {
      MIN_LENGTH: 10, // Minimum title length of ${value} characters
      MAX_LENGTH: 110, // Maximum title length of ${value} characters
      NO_ALL_CAPS: true, // Reject if title is all uppercase
      NO_ALL_LOWERCASE: true, // Reject if title is all lowercase
      NO_SPAM_PATTERNS: true, // Reject titles with common spam patterns
      ENGLISH_ONLY: true, // Accept only English titles
      NO_PROMOTIONAL_KEYWORDS: true, // Reject titles with promotional keywords
    },
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 30, // Minimum description length of ${value} characters
      NO_LOWERCASE_START: true, // Reject if description starts with a lowercase letter
      NO_SPECIAL_CHAR_START: true, // Reject if description starts with special character
      NO_URLS_IN_DESCRIPTION: true, // Block descriptions containing URLs
      NO_CODE_CONTENT: true, // Block articles with code snippets
      QUALITY_CHECK: true, // Enable quality checks (spam, gibberish, etc.)
      MAX_EMOJI_SYMBOLS: 3, // Maximum of ${value} emoji/symbols allowed in description
    },
    SOURCE_RULES: {
      MAX_PER_DOMAIN: 3, //Maximum ${value} articles per domain
      //SOURCE_DIVERSITY: 3,
    },
    AGE_RULES: {
      MAX_AGE_DAYS: 90, // Default to 14 days
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      VALIDATE_REAL_IMAGE: true,
      //MIN_WIDTH: 100,
      //MIN_HEIGHT: 100,
      //USE_DEFAULT_ON_HIGH_QUALITY: true,
      //MIN_QUALITY_SCORE_FOR_DEFAULT: 35,
    },
    DEDUPLICATION: {
      CROSS_FEED: false,
      UNCOMMON_WORDS: true,
    },
    LIMITS: {
      MAX_QUESTIONS: 10,
      HOUR_DISTRIBUTION: 10,
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
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 30, /// CHANGED (was 50) - Lower to allow shorter summaries
      NO_CODE_CONTENT: false,
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      VALIDATE_REAL_IMAGE: true,
    },
    // Subcategory-specific overrides within tech
    subcategories: {
      "ai-machine-learning": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 20, /// CHANGED (was 40) - Lower for higher inclusion
          NO_CODE_CONTENT: false,
        },
        LIMITS: {
          MAX_QUESTIONS: 10, /// CHANGED (was 5) - Allow more questions per feed
        },
      },
      "martech-adtech": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 20, /// CHANGED (was 30) - Lower to match broader filter
        },
        AGE_RULES: {
          MAX_AGE_DAYS: 30, /// CHANGED (was 14) - Much older articles are now included
        },
      },
      "web-dev-devops": {
        CONTENT_RULES: {
          NO_CODE_CONTENT: false,
        },
      },
      "cybersecurity-privacy": {
        AGE_RULES: {
          MAX_AGE_DAYS: 30, /// CHANGED (was 7) - Allow older articles for longer relevance
        },
      },
      "blockchain-web3": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 20, /// CHANGED (was 40)
        },
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
      MIN_LENGTH: 8, /// CHANGED (was 10) - Allow shorter titles
      NO_ALL_CAPS: true,
      NO_ALL_LOWERCASE: true,
    },
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 20, /// CHANGED (was 30)
      NO_SPECIAL_CHAR_START: true,
      NO_URLS_IN_DESCRIPTION: true,
      NO_CODE_CONTENT: true,
      QUALITY_CHECK: true,
      MAX_EMOJI_SYMBOLS: 2,
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      VALIDATE_REAL_IMAGE: true,
    },
    AGE_RULES: {
      MAX_AGE_DAYS: 40, /// CHANGED (was 14)
    },
    DEDUPLICATION: {
      UNCOMMON_WORDS: true,
    },
    subcategories: {
      "startup-stories": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 20, /// CHANGED (was 40)
        },
      },
      "productivity-hacks": {
        AGE_RULES: {
          MAX_AGE_DAYS: 90, /// CHANGED (was 30)
        },
      },
      "automation-no-code": {
        CONTENT_RULES: {
          NO_CODE_CONTENT: false,
        },
      },
      "project-management": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 20, /// CHANGED (was 40)
        },
      },
      "momentum-mindset": {
        AGE_RULES: {
          MAX_AGE_DAYS: 90, /// CHANGED (was 60)
        },
        CONTENT_RULES: {
          QUALITY_CHECK: false,
        },
      },
    },
  },

  art: {
    TITLE_RULES: {
      MIN_LENGTH: 8,
    },
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 20, /// CHANGED (was 40)
      NO_CODE_CONTENT: true,
      QUALITY_CHECK: true,
      MAX_EMOJI_SYMBOLS: 3,
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      VALIDATE_REAL_IMAGE: true,
    },
    DEDUPLICATION: {
      UNCOMMON_WORDS: true,
    },
    AGE_RULES: {
      MAX_AGE_DAYS: 90, /// CHANGED (was 30)
    },
    subcategories: {
      "generative-ai-art": {
        CONTENT_RULES: {
          NO_CODE_CONTENT: false,
        },
      },
      "ui-ux-trends": {
        THUMBNAIL_RULES: {
          REQUIRED: true,
          VALIDATE_REAL_IMAGE: true,
        },
      },
      "color-typography": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 10, /// CHANGED (was 30)
        },
        AGE_RULES: {
          MAX_AGE_DAYS: 90, /// CHANGED (was 40)
        },
      },
      "animation-motion": {
        THUMBNAIL_RULES: {
          REQUIRED: true,
          VALIDATE_REAL_IMAGE: true,
        },
      },
      "tutorials-walkthroughs": {
        CONTENT_RULES: {
          NO_URLS_IN_DESCRIPTION: true,
        },
        AGE_RULES: {
          MAX_AGE_DAYS: 90,
        },
      },
    },
  },

  gaming: {
    TITLE_RULES: {
      MIN_LENGTH: 8, /// CHANGED (was 8)
      NO_ALL_CAPS: true,
    },
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 20, /// CHANGED (was 40)
      MAX_EMOJI_SYMBOLS: 4, /// CHANGED (was 5)
      QUALITY_CHECK: false,
    },
    AGE_RULES: {
      MAX_AGE_DAYS: 90, /// CHANGED (was 14)
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      VALIDATE_REAL_IMAGE: true,
    },
    subcategories: {
      "daily-roundup": {
        AGE_RULES: {
          MAX_AGE_DAYS: 6, /// CHANGED (was 3)
        },
        CONTENT_RULES: {
          QUALITY_CHECK: true,
        },
      },
      "pro-guides-tips": {
        AGE_RULES: {
          MAX_AGE_DAYS: 90,
        },
      },
      "retro-gaming": {
        AGE_RULES: {
          MAX_AGE_DAYS: 90,
        },
        THUMBNAIL_RULES: {
          REQUIRED: true,
          VALIDATE_REAL_IMAGE: true,
        },
      },
      "indie-spotlights": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 10, /// CHANGED (was 30)
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

// Deep merge function
function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        if (
          target[key] &&
          typeof target[key] === "object" &&
          !Array.isArray(target[key])
        ) {
          result[key] = deepMerge(target[key], source[key]);
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

// Function to get filter configuration for a specific category/subcategory
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

    // Deep merge subcategory config
    config = deepMerge(config, subcategoryConfig);
  }

  // Add debug info
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

// Universal export that works in both Node.js and ES6 environments
if (typeof module !== "undefined" && module.exports) {
  // Node.js / CommonJS export
  module.exports = {
    CATEGORY_FILTER_CONFIG,
    getFilterConfig,
    qualifiesForDefaultIcon,
    deepMerge,
  };
}

if (typeof exports !== "undefined") {
  // Additional CommonJS support
  exports.CATEGORY_FILTER_CONFIG = CATEGORY_FILTER_CONFIG;
  exports.getFilterConfig = getFilterConfig;
  exports.qualifiesForDefaultIcon = qualifiesForDefaultIcon;
  exports.deepMerge = deepMerge;
}

// ES6 export for Vercel
export {
  CATEGORY_FILTER_CONFIG,
  getFilterConfig,
  qualifiesForDefaultIcon,
  deepMerge,
};
