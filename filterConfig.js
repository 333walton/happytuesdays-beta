// filterConfig.js - Single Source of Truth for All Filter Configurations
// This allows you to configure specific filter rules for each category and subcategory
// view all settings easily by entering http://localhost:3001/api/filter-configs into the browser (select 'pretty-print')

/*
  NEWSFEED FILTER REFERENCE

  TITLE_RULES:
    MIN_LENGTH         - Minimum title length (characters)
    MAX_LENGTH         - Maximum title length (characters)
    NO_ALL_CAPS        - Reject titles in all capitals
    NO_ALL_LOWERCASE   - Reject titles in all lowercase
    NO_SPAM_PATTERNS   - Block spam-like title patterns
    ENGLISH_ONLY       - Accept only English language titles

  CONTENT_RULES:
    MIN_DESCRIPTION_LENGTH   - Minimum description length (characters)
    NO_CODE_CONTENT          - Block articles containing code snippets
    NO_LOWERCASE_START       - Reject descriptions starting with lowercase
    NO_SPECIAL_CHAR_START    - Reject descriptions starting with special chars
    NO_URLS_IN_DESCRIPTION   - Block descriptions with URLs
    QUALITY_CHECK            - Enable quality validation (spam/gibberish/etc.)
    QUALITY_SCORE_THRESHOLD  - Minimum quality score (0-1) for articles with thumbnails
    QUALITY_SCORE_NO_THUMBNAIL - Minimum quality score (0-1) for articles without thumbnails

  SOURCE_RULES:
    MAX_PER_SOURCE    - Maximum articles per unique source (deprecated - use MAX_PER_DOMAIN)
    MAX_PER_DOMAIN    - Maximum articles per domain

  AGE_RULES:
    MAX_AGE_DAYS      - Max article age in days allowed
    MAX_AGE_HOURS     - Max article age in hours allowed
    PREFER_RECENT     - Prefer more recent articles in sorting

  THUMBNAIL_RULES:
    REQUIRED                  - Thumbnail required (true/false)
    USE_DEFAULT_ON_HIGH_QUALITY - Allow default icon if high quality (true/false)
    MIN_QUALITY_SCORE_FOR_DEFAULT - Minimum score needed for default thumbnail
    VALIDATE_REAL_IMAGE       - Validate thumbnail is an actual article image

  DEDUPLICATION:
    CROSS_FEED       - Remove duplicates across feeds (true/false)
    UNCOMMON_WORDS   - Require article word uniqueness (true/false)
    FINGERPRINT_LENGTH - Character length used for deduplication hashing

  DIVERSITY_RULES (NEW):
    MAX_PER_DOMAIN           - Maximum articles from same domain (overrides SOURCE_RULES.MAX_PER_DOMAIN)
    UNIQUE_DATE_PER_DOMAIN   - No multiple same-day articles from same source (true/false)
    NO_CONSECUTIVE_SAME_DOMAIN - Prevent back-to-back articles from same source (true/false)
    WEIGHTED_SHUFFLE         - Apply quality-weighted randomization (true/false)
    QUALITY_SCORE_THRESHOLD  - Minimum quality score (0-1) for inclusion
    QUALITY_SCORE_NO_THUMBNAIL - Higher threshold for articles without images (0-1)

  LIMITS:
    MAX_ITEMS            - Maximum items returned per request
    MAX_ITEMS_PER_FEED   - Maximum items processed per feed
    TARGET_BUFFER        - Buffer size built before filtering
    MIN_ITEMS_REQUIRED   - Minimum items that must be returned

  PROMOTIONAL_KEYWORDS:
    Blocks articles containing specified promotional terms
*/

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
      NO_PROMOTIONAL_KEYWORDS: true,
    },
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 30,
      NO_LOWERCASE_START: true,
      NO_SPECIAL_CHAR_START: true,
      NO_URLS_IN_DESCRIPTION: true,
      NO_CODE_CONTENT: true,
      QUALITY_CHECK: true,
      MAX_EMOJI_SYMBOLS: 3,
      // NEW: Quality thresholds for diversity rules
      QUALITY_SCORE_THRESHOLD: 0.3,
      QUALITY_SCORE_NO_THUMBNAIL: 0.5,
    },
    SOURCE_RULES: {
      MAX_PER_DOMAIN: 3, // Used by diversity rules
    },
    AGE_RULES: {
      MAX_AGE_DAYS: 90,
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      VALIDATE_REAL_IMAGE: true,
    },
    DEDUPLICATION: {
      CROSS_FEED: false,
      UNCOMMON_WORDS: true,
    },
    // NEW: Diversity rules section
    DIVERSITY_RULES: {
      MAX_PER_DOMAIN: 3,
      UNIQUE_DATE_PER_DOMAIN: true,
      NO_CONSECUTIVE_SAME_DOMAIN: true,
      WEIGHTED_SHUFFLE: true,
      QUALITY_SCORE_THRESHOLD: 0.3,
      QUALITY_SCORE_NO_THUMBNAIL: 0.5,
    },
    LIMITS: {
      MAX_ITEMS: 10,
      MAX_ITEMS_PER_FEED: 20,
      TARGET_BUFFER: 25,
      MIN_ITEMS_REQUIRED: 5,
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
      MIN_DESCRIPTION_LENGTH: 30,
      NO_CODE_CONTENT: false,
      QUALITY_SCORE_THRESHOLD: 0.35, // Slightly higher for tech
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      VALIDATE_REAL_IMAGE: true,
    },
    DIVERSITY_RULES: {
      MAX_PER_DOMAIN: 2, // More diversity for tech
      UNIQUE_DATE_PER_DOMAIN: true,
      NO_CONSECUTIVE_SAME_DOMAIN: true,
    },
    // Subcategory-specific overrides within tech
    subcategories: {
      "ai-machine-learning": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 20,
          NO_CODE_CONTENT: false,
        },
        LIMITS: {
          MAX_QUESTIONS: 10,
        },
      },
      "martech-adtech": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 20,
        },
        AGE_RULES: {
          MAX_AGE_DAYS: 30,
        },
      },
      "web-dev-devops": {
        CONTENT_RULES: {
          NO_CODE_CONTENT: false,
        },
        DIVERSITY_RULES: {
          MAX_PER_DOMAIN: 3, // Allow more from same source for tutorials
        },
      },
      "cybersecurity-privacy": {
        AGE_RULES: {
          MAX_AGE_DAYS: 30,
        },
      },
      "blockchain-web3": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 20,
        },
        DIVERSITY_RULES: {
          UNIQUE_DATE_PER_DOMAIN: false, // Crypto sites post multiple updates daily
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
      MIN_LENGTH: 8,
      NO_ALL_CAPS: true,
      NO_ALL_LOWERCASE: true,
    },
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 20,
      NO_SPECIAL_CHAR_START: true,
      NO_URLS_IN_DESCRIPTION: true,
      NO_CODE_CONTENT: true,
      QUALITY_CHECK: true,
      MAX_EMOJI_SYMBOLS: 2,
      QUALITY_SCORE_THRESHOLD: 0.3,
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      VALIDATE_REAL_IMAGE: true,
    },
    AGE_RULES: {
      MAX_AGE_DAYS: 40,
    },
    DEDUPLICATION: {
      UNCOMMON_WORDS: true,
    },
    DIVERSITY_RULES: {
      MAX_PER_DOMAIN: 3,
      WEIGHTED_SHUFFLE: true,
    },
    subcategories: {
      "startup-stories": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 20,
        },
      },
      "productivity-hacks": {
        AGE_RULES: {
          MAX_AGE_DAYS: 90,
        },
        DIVERSITY_RULES: {
          MAX_PER_DOMAIN: 4, // Allow more from productivity gurus
        },
      },
      "automation-no-code": {
        CONTENT_RULES: {
          NO_CODE_CONTENT: false,
        },
      },
      "project-management": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 20,
        },
      },
      "momentum-mindset": {
        AGE_RULES: {
          MAX_AGE_DAYS: 90,
        },
        CONTENT_RULES: {
          QUALITY_CHECK: false,
        },
        DIVERSITY_RULES: {
          MAX_PER_DOMAIN: 4, // Allow more from same philosophical sources
          UNIQUE_DATE_PER_DOMAIN: false,
        },
      },
    },
  },

  art: {
    TITLE_RULES: {
      MIN_LENGTH: 8,
    },
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 20,
      NO_CODE_CONTENT: true,
      QUALITY_CHECK: true,
      MAX_EMOJI_SYMBOLS: 3,
      QUALITY_SCORE_THRESHOLD: 0.25, // Lower for art feeds
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      VALIDATE_REAL_IMAGE: true,
    },
    DEDUPLICATION: {
      UNCOMMON_WORDS: true,
    },
    AGE_RULES: {
      MAX_AGE_DAYS: 90,
    },
    DIVERSITY_RULES: {
      MAX_PER_DOMAIN: 3,
      WEIGHTED_SHUFFLE: true,
      QUALITY_SCORE_THRESHOLD: 0.25,
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
        DIVERSITY_RULES: {
          MAX_PER_DOMAIN: 2, // More diversity for design trends
        },
      },
      "color-typography": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 10,
        },
        AGE_RULES: {
          MAX_AGE_DAYS: 90,
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
        DIVERSITY_RULES: {
          MAX_PER_DOMAIN: 4, // Allow more tutorials from same source
          NO_CONSECUTIVE_SAME_DOMAIN: false,
        },
      },
    },
  },

  gaming: {
    TITLE_RULES: {
      MIN_LENGTH: 8,
      NO_ALL_CAPS: true,
    },
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 20,
      MAX_EMOJI_SYMBOLS: 4,
      QUALITY_CHECK: false,
      QUALITY_SCORE_THRESHOLD: 0.25,
    },
    AGE_RULES: {
      MAX_AGE_DAYS: 90,
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      VALIDATE_REAL_IMAGE: true,
    },
    DIVERSITY_RULES: {
      MAX_PER_DOMAIN: 4,
      UNIQUE_DATE_PER_DOMAIN: false, // Gaming sites post multiple reviews/news daily
      WEIGHTED_SHUFFLE: true,
    },
    subcategories: {
      "daily-roundup": {
        AGE_RULES: {
          MAX_AGE_DAYS: 6,
        },
        CONTENT_RULES: {
          QUALITY_CHECK: true,
        },
        DIVERSITY_RULES: {
          MAX_PER_DOMAIN: 2, // More diversity for daily news
        },
      },
      "pro-guides-tips": {
        AGE_RULES: {
          MAX_AGE_DAYS: 90,
        },
        DIVERSITY_RULES: {
          MAX_PER_DOMAIN: 5, // Allow more guides from same source
          NO_CONSECUTIVE_SAME_DOMAIN: false,
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
          MIN_DESCRIPTION_LENGTH: 10,
        },
        DIVERSITY_RULES: {
          MAX_PER_DOMAIN: 3,
        },
      },
      "collectors-hub": {
        AGE_RULES: {
          MAX_AGE_DAYS: 90,
        },
        DIVERSITY_RULES: {
          UNIQUE_DATE_PER_DOMAIN: true,
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

  // Use diversity quality threshold if available
  const minScore =
    config.DIVERSITY_RULES?.QUALITY_SCORE_NO_THUMBNAIL ||
    config.THUMBNAIL_RULES.MIN_QUALITY_SCORE_FOR_DEFAULT ||
    0.5;

  return qualityScore >= minScore;
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
