// filterConfig.js - Create this new file in your project root
// This allows you to configure specific filter rules for each category and subcategory

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
    AGE_RULES: {
      MAX_AGE_DAYS: 7,
    },
    THUMBNAIL_RULES: {
      REQUIRED: true,
      //MIN_WIDTH: 400,
      //MIN_HEIGHT: 300,
    },
    DEDUPLICATION: {
      CROSS_FEED: true,
      UNCOMMON_WORDS: true,
    },
    LIMITS: {
      MAX_QUESTIONS: 3,
      HOUR_DISTRIBUTION: 2,
    },
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
    },
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
      MIN_LENGTH: 8, // Shorter titles ok
      NO_ALL_CAPS: false, // Allow excitement
      NO_ALL_LOWERCASE: false,
    },
    CONTENT_RULES: {
      MIN_DESCRIPTION_LENGTH: 30, // Much shorter ok
      NO_LOWERCASE_START: false,
      NO_SPECIAL_CHAR_START: false,
      NO_URLS_IN_DESCRIPTION: false, // Links to tools ok
      NO_CODE_CONTENT: false,
      QUALITY_CHECK: false, // Less strict
      MAX_EMOJI_SYMBOLS: 5, // More emojis ok
    },
    THUMBNAIL_RULES: {
      REQUIRED: true, // Many builder feeds lack images
    },
    AGE_RULES: {
      MAX_AGE_DAYS: 14, // Evergreen content ok
    },
    DEDUPLICATION: {
      UNCOMMON_WORDS: false, // Allow similar topics
    },
    subcategories: {
      "startup-stories": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 40,
        },
      },
      "productivity-hacks": {
        AGE_RULES: {
          MAX_AGE_DAYS: 30, // Productivity tips are evergreen
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
      //MIN_WIDTH: 300,
      //MIN_HEIGHT: 200,
    },
    DEDUPLICATION: {
      UNCOMMON_WORDS: false,
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
        },
      },
      "color-typography": {
        CONTENT_RULES: {
          MIN_DESCRIPTION_LENGTH: 30,
        },
      },
      "animation-motion": {
        THUMBNAIL_RULES: {
          REQUIRED: false, // Some animation feeds lack stills
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
          REQUIRED: false, // Old games may lack images
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

// Function to get filter configuration for a specific category/subcategory
function getFilterConfig(category, subcategory = null) {
  // Start with defaults
  let config = { ...CATEGORY_FILTER_CONFIG.DEFAULT };

  // Apply category-level overrides
  if (CATEGORY_FILTER_CONFIG[category]) {
    const categoryConfig = { ...CATEGORY_FILTER_CONFIG[category] };
    delete categoryConfig.subcategories; // Remove subcategories from merge

    // Deep merge category config
    for (const [ruleGroup, rules] of Object.entries(categoryConfig)) {
      config[ruleGroup] = {
        ...(config[ruleGroup] || {}),
        ...rules,
      };
    }
  }

  // Apply subcategory-level overrides
  if (
    subcategory &&
    CATEGORY_FILTER_CONFIG[category]?.subcategories?.[subcategory]
  ) {
    const subcategoryConfig =
      CATEGORY_FILTER_CONFIG[category].subcategories[subcategory];

    // Deep merge subcategory config
    for (const [ruleGroup, rules] of Object.entries(subcategoryConfig)) {
      config[ruleGroup] = {
        ...(config[ruleGroup] || {}),
        ...rules,
      };
    }
  }

  return config;
}

// Export for use in server.js
module.exports = {
  CATEGORY_FILTER_CONFIG,
  getFilterConfig,
};

// Example usage:
// const config = getFilterConfig('builder', 'startup-stories');
// console.log(config.CONTENT_RULES.MIN_DESCRIPTION_LENGTH); // 40
