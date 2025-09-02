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

// filterConfig.js - STRICTER Filter Configurations for Higher Quality
// This configuration enforces higher quality standards across all categories

const CATEGORY_FILTER_CONFIG = {
  // Global defaults with STRICTER requirements
  DEFAULT: {
    TITLE_RULES: {
      MIN_LENGTH: 15, // Increased from 10
      MAX_LENGTH: 100, // Reduced from 110
      NO_ALL_CAPS: true,
      NO_ALL_LOWERCASE: true,
      NO_SPAM_PATTERNS: true,
      ENGLISH_ONLY: true,
      NO_PROMOTIONAL_KEYWORDS: true,
    },
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 50, // Increased from 30
      NO_LOWERCASE_START: true,
      NO_SPECIAL_CHAR_START: true,
      NO_URLS_IN_DESCRIPTION: true,
      NO_CODE_CONTENT: true,
      QUALITY_CHECK: true,
      MAX_EMOJI_SYMBOLS: 2, // Reduced from 3
      // STRICTER quality thresholds
      QUALITY_SCORE_THRESHOLD: 0.4, // Increased from 0.3
      QUALITY_SCORE_NO_THUMBNAIL: 0.9, // Increased from 1.0 to 0.9 (nearly perfect)
      REQUIRE_UNCOMMON_WORDS: true, // NEW: Require unique content
      MIN_UNCOMMON_WORDS: 3, // NEW: Minimum unique words required
    },
    SOURCE_RULES: {
      MAX_PER_DOMAIN: 2, // Reduced from 3 for more diversity
    },
    AGE_RULES: {
      MAX_AGE_DAYS: 60, // Reduced from 90 for fresher content
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      VALIDATE_REAL_IMAGE: true,
      USE_DEFAULT_ON_HIGH_QUALITY: true,
      MIN_QUALITY_SCORE_FOR_DEFAULT: 0.9, // Nearly perfect score required
    },
    DEDUPLICATION: {
      CROSS_FEED: true, // Changed to true
      UNCOMMON_WORDS: true,
      FINGERPRINT_LENGTH: 30,
    },
    // STRICTER diversity rules
    DIVERSITY_RULES: {
      MAX_PER_DOMAIN: 2, // Reduced from 3
      UNIQUE_DATE_PER_DOMAIN: true,
      NO_CONSECUTIVE_SAME_DOMAIN: true,
      WEIGHTED_SHUFFLE: true,
      QUALITY_SCORE_THRESHOLD: 0.4, // Increased from 0.3
      QUALITY_SCORE_NO_THUMBNAIL: 0.9, // Nearly perfect required
    },
    LIMITS: {
      MAX_ITEMS: 10,
      MAX_ITEMS_PER_FEED: 20,
      TARGET_BUFFER: 25,
      MIN_ITEMS_REQUIRED: 5,
      MIN_FEEDS_BEFORE_RELAX: 6, // NEW: Don't relax too early
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
      "click here",
      "read more",
      "continue reading",
    ],
  },

  // Tech category - High standards for quality
  tech: {
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 60, // Increased from 30
      NO_CODE_CONTENT: false,
      QUALITY_SCORE_THRESHOLD: 0.45, // Higher for tech
      QUALITY_SCORE_NO_THUMBNAIL: 0.95, // Very high for no thumbnail
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      VALIDATE_REAL_IMAGE: true,
      MIN_QUALITY_SCORE_FOR_DEFAULT: 0.95,
    },
    DIVERSITY_RULES: {
      MAX_PER_DOMAIN: 2, // Strict diversity
      UNIQUE_DATE_PER_DOMAIN: true,
      NO_CONSECUTIVE_SAME_DOMAIN: true,
      QUALITY_SCORE_THRESHOLD: 0.45,
      QUALITY_SCORE_NO_THUMBNAIL: 0.95,
    },
    AGE_RULES: {
      MAX_AGE_DAYS: 30, // Tech news should be fresh
    },
    subcategories: {
      "ai-machine-learning": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 50,
          NO_CODE_CONTENT: false,
          QUALITY_SCORE_THRESHOLD: 0.5, // Higher for AI content
        },
        AGE_RULES: {
          MAX_AGE_DAYS: 14, // AI moves fast
        },
      },
      "martech-adtech": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 40,
          QUALITY_SCORE_THRESHOLD: 0.4,
        },
        AGE_RULES: {
          MAX_AGE_DAYS: 30,
        },
      },
      "web-dev-devops": {
        CONTENT_RULES: {
          NO_CODE_CONTENT: false,
          MIN_DESCRIPTION_LENGTH: 50,
        },
        DIVERSITY_RULES: {
          MAX_PER_DOMAIN: 2, // Keep strict even for tutorials
        },
      },
      "cybersecurity-privacy": {
        AGE_RULES: {
          MAX_AGE_DAYS: 14, // Security news needs to be very fresh
        },
        CONTENT_RULES: {
          QUALITY_SCORE_THRESHOLD: 0.5,
        },
      },
      "blockchain-web3": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 40,
          QUALITY_SCORE_THRESHOLD: 0.45,
        },
        DIVERSITY_RULES: {
          UNIQUE_DATE_PER_DOMAIN: true, // Keep strict
          MAX_PER_DOMAIN: 2,
        },
        PROMOTIONAL_KEYWORDS: [
          "price prediction",
          "moon",
          "lambo",
          "100x",
          "gem",
          "pump",
          "to the moon",
          "hodl",
          "diamond hands",
        ],
      },
    },
  },

  // Builder category - Quality content focus
  builder: {
    TITLE_RULES: {
      MIN_LENGTH: 12, // Slightly more lenient
      NO_ALL_CAPS: true,
      NO_ALL_LOWERCASE: true,
    },
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 40, // Increased from 20
      NO_SPECIAL_CHAR_START: true,
      NO_URLS_IN_DESCRIPTION: true,
      NO_CODE_CONTENT: true,
      QUALITY_CHECK: true,
      MAX_EMOJI_SYMBOLS: 2,
      QUALITY_SCORE_THRESHOLD: 0.4,
      QUALITY_SCORE_NO_THUMBNAIL: 0.9,
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      VALIDATE_REAL_IMAGE: true,
      MIN_QUALITY_SCORE_FOR_DEFAULT: 0.9,
    },
    AGE_RULES: {
      MAX_AGE_DAYS: 30, // Reduced from 40
    },
    DIVERSITY_RULES: {
      MAX_PER_DOMAIN: 2, // Reduced from 3
      WEIGHTED_SHUFFLE: true,
      QUALITY_SCORE_THRESHOLD: 0.4,
    },
    subcategories: {
      "startup-stories": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 50,
          QUALITY_SCORE_THRESHOLD: 0.45,
        },
      },
      "productivity-hacks": {
        AGE_RULES: {
          MAX_AGE_DAYS: 60, // Can be older
        },
        DIVERSITY_RULES: {
          MAX_PER_DOMAIN: 3, // Allow slightly more
        },
      },
      "automation-no-code": {
        CONTENT_RULES: {
          NO_CODE_CONTENT: false,
          MIN_DESCRIPTION_LENGTH: 40,
        },
      },
      "project-management": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 40,
          QUALITY_SCORE_THRESHOLD: 0.4,
        },
      },
      "momentum-mindset": {
        AGE_RULES: {
          MAX_AGE_DAYS: 60,
        },
        CONTENT_RULES: {
          QUALITY_CHECK: true, // Changed from false
          QUALITY_SCORE_THRESHOLD: 0.35,
        },
        DIVERSITY_RULES: {
          MAX_PER_DOMAIN: 3,
          UNIQUE_DATE_PER_DOMAIN: true, // Changed to true
        },
      },
    },
  },

  // Art category - Visual content priority
  art: {
    TITLE_RULES: {
      MIN_LENGTH: 10,
    },
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 30,
      NO_CODE_CONTENT: true,
      QUALITY_CHECK: true,
      MAX_EMOJI_SYMBOLS: 2,
      QUALITY_SCORE_THRESHOLD: 0.35, // Increased from 0.25
      QUALITY_SCORE_NO_THUMBNAIL: 0.95, // Art needs images
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      VALIDATE_REAL_IMAGE: true,
      MIN_QUALITY_SCORE_FOR_DEFAULT: 0.95, // Very high for art
    },
    DEDUPLICATION: {
      UNCOMMON_WORDS: true,
    },
    AGE_RULES: {
      MAX_AGE_DAYS: 60, // Reduced from 90
    },
    DIVERSITY_RULES: {
      MAX_PER_DOMAIN: 2, // Reduced from 3
      WEIGHTED_SHUFFLE: true,
      QUALITY_SCORE_THRESHOLD: 0.35,
      QUALITY_SCORE_NO_THUMBNAIL: 0.95,
    },
    subcategories: {
      "generative-ai-art": {
        CONTENT_RULES: {
          NO_CODE_CONTENT: false,
          QUALITY_SCORE_THRESHOLD: 0.4,
        },
      },
      "ui-ux-trends": {
        THUMBNAIL_RULES: {
          REQUIRED: true,
          VALIDATE_REAL_IMAGE: true,
        },
        DIVERSITY_RULES: {
          MAX_PER_DOMAIN: 2,
        },
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 40,
          QUALITY_SCORE_THRESHOLD: 0.45,
        },
      },
      "color-typography": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 30,
        },
        AGE_RULES: {
          MAX_AGE_DAYS: 60,
        },
      },
      "animation-motion": {
        THUMBNAIL_RULES: {
          REQUIRED: true,
          VALIDATE_REAL_IMAGE: true,
          MIN_QUALITY_SCORE_FOR_DEFAULT: 0.95,
        },
      },
      "tutorials-walkthroughs": {
        CONTENT_RULES: {
          NO_URLS_IN_DESCRIPTION: true,
          MIN_DESCRIPTION_LENGTH: 50,
        },
        AGE_RULES: {
          MAX_AGE_DAYS: 60,
        },
        DIVERSITY_RULES: {
          MAX_PER_DOMAIN: 3,
          NO_CONSECUTIVE_SAME_DOMAIN: true, // Changed to true
        },
      },
    },
  },

  // Gaming category - Fresh content focus
  gaming: {
    TITLE_RULES: {
      MIN_LENGTH: 10,
      NO_ALL_CAPS: true,
    },
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 30,
      MAX_EMOJI_SYMBOLS: 3,
      QUALITY_CHECK: true, // Changed from false
      QUALITY_SCORE_THRESHOLD: 0.35, // Increased from 0.25
      QUALITY_SCORE_NO_THUMBNAIL: 0.9,
    },
    AGE_RULES: {
      MAX_AGE_DAYS: 60, // Reduced from 90
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      VALIDATE_REAL_IMAGE: true,
      MIN_QUALITY_SCORE_FOR_DEFAULT: 0.9,
    },
    DIVERSITY_RULES: {
      MAX_PER_DOMAIN: 3, // Reduced from 4
      UNIQUE_DATE_PER_DOMAIN: true, // Changed to true
      WEIGHTED_SHUFFLE: true,
      QUALITY_SCORE_THRESHOLD: 0.35,
    },
    subcategories: {
      "daily-roundup": {
        AGE_RULES: {
          MAX_AGE_DAYS: 3, // Very fresh for daily
        },
        CONTENT_RULES: {
          QUALITY_CHECK: true,
          QUALITY_SCORE_THRESHOLD: 0.4,
        },
        DIVERSITY_RULES: {
          MAX_PER_DOMAIN: 2,
        },
      },
      "pro-guides-tips": {
        AGE_RULES: {
          MAX_AGE_DAYS: 60,
        },
        DIVERSITY_RULES: {
          MAX_PER_DOMAIN: 3, // Reduced from 5
          NO_CONSECUTIVE_SAME_DOMAIN: true, // Changed to true
        },
      },
      "retro-gaming": {
        AGE_RULES: {
          MAX_AGE_DAYS: 60,
        },
        THUMBNAIL_RULES: {
          REQUIRED: true,
          VALIDATE_REAL_IMAGE: true,
        },
        CONTENT_RULES: {
          QUALITY_SCORE_THRESHOLD: 0.35,
        },
      },
      "indie-spotlights": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 30,
          QUALITY_SCORE_THRESHOLD: 0.4,
        },
        DIVERSITY_RULES: {
          MAX_PER_DOMAIN: 2, // Reduced from 3
        },
      },
      "collectors-hub": {
        AGE_RULES: {
          MAX_AGE_DAYS: 60,
        },
        DIVERSITY_RULES: {
          UNIQUE_DATE_PER_DOMAIN: true,
        },
        CONTENT_RULES: {
          QUALITY_SCORE_THRESHOLD: 0.35,
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
// STRICTER: Only nearly perfect articles can use default icons
function qualifiesForDefaultIcon(item, qualityScore, category, subcategory) {
  const config = getFilterConfig(category, subcategory);

  if (!config.THUMBNAIL_RULES.USE_DEFAULT_ON_HIGH_QUALITY) {
    return false;
  }

  // Use stricter threshold - nearly perfect quality required
  const minScore = config.THUMBNAIL_RULES.MIN_QUALITY_SCORE_FOR_DEFAULT || 0.9;

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
