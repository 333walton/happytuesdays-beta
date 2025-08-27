// Updated RSS catalog aligned with PDF category descriptions
// Replace your existing rssCatalog.js with this version

export const RSS_FEEDS = {
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
      "https://distill.pub/rss.xml",
    ],

    "martech-adtech": [
      "https://martech.org/feed/",
      "https://adexchanger.com/feed/",
      "https://marketingland.com/feed/",
      "https://chiefmartec.com/feed/",
      "https://www.marketingtechnews.net/rss.xml",
      "https://digiday.com/topic/marketing-technology/feed/",
    ],

    "web-dev-devops": [
      "https://css-tricks.com/feed/",
      "https://www.smashingmagazine.com/feed/",
      "https://dev.to/feed",
      "https://web.dev/feed.xml",
      "https://blog.logrocket.com/feed/",
      "https://www.joshwcomeau.com/rss.xml",
      "https://kentcdodds.com/blog/rss.xml",
      "https://blog.containerize.com/feed/",
    ],

    "cybersecurity-privacy": [
      "https://krebsonsecurity.com/feed/",
      "https://feeds.feedburner.com/TheHackersNews",
      "https://www.darkreading.com/rss.xml",
      "https://www.schneier.com/feed/atom/",
      "https://www.bleepingcomputer.com/feed/",
      "https://threatpost.com/feed/",
      "https://www.csoonline.com/index.rss",
    ],

    "blockchain-web3": [
      "https://www.coindesk.com/arc/outboundfeeds/rss/",
      "https://decrypt.co/feed",
      "https://cointelegraph.com/rss",
      "https://ethereum.org/en/blog/feed.xml",
      "https://blog.chain.link/rss/",
      "https://www.theblockcrypto.com/rss.xml",
    ],
  },

  builder: {
    "startup-stories": [
      // Changed from founder-stories
      "https://review.firstround.com/rss/",
      "https://blog.ycombinator.com/feed/",
      "https://techcrunch.com/category/startups/feed/",
      "https://www.indiehackers.com/feed.xml",
      "https://sifted.eu/feed/",
      "https://venturebeat.com/category/entrepreneur/feed/",
      "https://www.startupgrind.com/blog/feed/",
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
      "https://www.pmi.org/learning/library.rss",
    ],

    "momentum-mindset": [
      // Changed from stoic-mindset
      "https://fs.blog/feed/",
      "https://ryanholiday.net/feed/",
      "https://markmanson.net/feed",
      "https://www.artofmanliness.com/feed/",
      "https://www.scottadamssays.com/feed/",
      "https://sethgodin.typepad.com/seths_blog/atom.xml",
    ],
  },

  art: {
    "generative-ai-art": [
      "https://aiartists.org/feed",
      "https://www.creativebloq.com/feeds/tag/ai-art",
      "https://ml.berkeley.edu/blog/feed.xml",
      "https://www.vice.com/en/rss/section/tech",
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
      "https://www.schoolofmotion.com/blog/feed",
    ],

    "tutorials-walkthroughs": [
      "https://tympanus.net/codrops/feed/",
      "https://webdesign.tutsplus.com/posts.atom",
      "https://designmodo.com/feed/",
      "https://www.sitepoint.com/design-ux/feed/",
      "https://blog.designcrowd.com/feed",
    ],
  },

  gaming: {
    "daily-roundup": [
      // Changed from daily-roundup (speedruns)
      "https://www.polygon.com/rss/index.xml",
      "https://www.gamespot.com/feeds/news/",
      "https://www.ign.com/rss/articles/feeds/all",
      "https://www.rockpapershotgun.com/feed",
      "https://www.gamesradar.com/rss/",
      "https://www.eurogamer.net/feed",
    ],

    "pro-guides-tips": [
      // Changed from guides-tips (emulation)
      "https://www.gamepur.com/feed",
      "https://www.gamerguides.com/feed",
      "https://www.thegamer.com/feed/",
      "https://dotesports.com/feed",
      "https://www.pcgamer.com/rss/",
    ],

    "retro-gaming": [
      "https://www.timeextension.com/feed/",
      "https://indieretronews.com/feeds/posts/default?alt=rss",
      "https://retrododo.com/feed/",
      "https://www.retrogamer.net/feed/",
      "https://www.vintageisthenewold.com/feed/",
    ],

    "indie-spotlights": [
      // Changed from indie-spotlights (retro releases)
      "https://indiegames.com/feed/",
      "https://www.indiedb.com/rss/games/",
      "https://www.gamedeveloper.com/rss.xml",
      "https://www.tigsource.com/feed/",
      "https://warpdoor.com/feed/",
      "https://alphabetagamer.com/feed/",
    ],

    "collectors-hub": [
      // Changed from game-collecting
      "https://www.racketboy.com/feed/",
      "https://videogamekrieg.com/feed",
      "https://www.pricecharting.com/blog/feed",
      "https://nintendoage.com/forum/messageview.cfm?catid=5&threadid=feed",
    ],
  },
};

// Helper function to get all feeds for a category
export const getFeedsForCategory = (category) => {
  const categoryFeeds = RSS_FEEDS[category];
  if (!categoryFeeds) return [];
  return Object.values(categoryFeeds).flat();
};

// Helper function to get feeds for a specific subcategory
export const getFeedsForSubcategory = (category, subcategory) => {
  const categoryFeeds = RSS_FEEDS[category];
  if (!categoryFeeds) return [];
  const subcategoryFeeds = categoryFeeds[subcategory];
  return subcategoryFeeds || [];
};

// Get a display name for a feed URL
export const getFeedDisplayName = (url) => {
  const feedNames = {
    // Tech
    "https://openai.com/news/rss/": "OpenAI News",
    "https://cloud.google.com/blog/products/ai-machine-learning/rss/":
      "Google AI Blog",
    "https://news.mit.edu/topic/artificial-intelligence2/rss.xml":
      "MIT AI News",
    "https://machinelearningmastery.com/feed/": "Machine Learning Mastery",
    "https://www.marktechpost.com/feed/": "MarkTechPost",
    "https://hnrss.org/newest?q=AI+OR+machine+learning": "Hacker News AI",
    "https://blog.google/technology/ai/rss/": "Google AI",
    "https://huggingface.co/blog/feed.xml": "Hugging Face",
    "https://www.deeplearning.ai/blog/feed/": "DeepLearning.AI",

    // Marketing
    "https://martech.org/feed/": "MarTech",
    "https://adexchanger.com/feed/": "AdExchanger",
    "https://marketingland.com/feed/": "Marketing Land",
    "https://chiefmartec.com/feed/": "ChiefMartec",

    // Security
    "https://krebsonsecurity.com/feed/": "Krebs on Security",
    "https://feeds.feedburner.com/TheHackersNews": "The Hacker News",
    "https://www.schneier.com/feed/atom/": "Schneier on Security",
    "https://www.bleepingcomputer.com/feed/": "Bleeping Computer",

    // Crypto
    "https://www.coindesk.com/arc/outboundfeeds/rss/": "CoinDesk",
    "https://decrypt.co/feed": "Decrypt",
    "https://cointelegraph.com/rss": "Cointelegraph",

    // Startup
    "https://review.firstround.com/rss/": "First Round Review",
    "https://blog.ycombinator.com/feed/": "Y Combinator",
    "https://techcrunch.com/category/startups/feed/": "TechCrunch Startups",
    "https://www.indiehackers.com/feed.xml": "Indie Hackers",

    // Productivity
    "https://zenhabits.net/feed/": "Zen Habits",
    "https://jamesclear.com/feed": "James Clear",
    "https://tim.blog/feed/": "Tim Ferriss",
    "https://calnewport.com/blog/feed/": "Cal Newport",

    // Design
    "https://www.smashingmagazine.com/feed/": "Smashing Magazine",
    "https://uxplanet.org/feed": "UX Planet",
    "https://alistapart.com/main/feed": "A List Apart",
    "https://uxdesign.cc/feed": "UX Collective",

    // Gaming
    "https://www.polygon.com/rss/index.xml": "Polygon",
    "https://www.gamespot.com/feeds/news/": "GameSpot",
    "https://www.ign.com/rss/articles/feeds/all": "IGN",
    "https://www.rockpapershotgun.com/feed": "Rock Paper Shotgun",
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
