// src/utils/rssCatalog.js
export const RSS_FEEDS = {
  tech: {
    "ai-machine-learning": [
      "https://openai.com/news/rss/",
      "https://cloud.google.com/blog/products/ai-machine-learning/rss/",
      "https://news.mit.edu/topic/artificial-intelligence2/rss.xml",
      "https://machinelearningmastery.com/feed/",
      "https://www.marktechpost.com/feed/",
      "https://hnrss.org/newest?q=AI+OR+machine+learning",
    ],
    "martech-adtech": [
      "https://martech.org/feed/",
      "https://adexchanger.com/feed/",
      "https://adtechdaily.com/feed/",
      "https://marketingland.com/feed/",
    ],
    "web-dev-devops": [
      "https://css-tricks.com/feed/",
      "https://www.smashingmagazine.com/feed/",
      "https://dev.to/feed",
      "https://scotch.io/feed",
      "https://web.dev/feed.xml",
    ],
    "cybersecurity-privacy": [
      "https://krebsonsecurity.com/feed/",
      "https://feeds.feedburner.com/TheHackersNews",
      "https://www.darkreading.com/rss.xml",
      "https://www.schneier.com/feed/atom/",
      "https://www.wired.com/feed/category/security/latest/rss",
    ],
    "blockchain-web3": [
      "https://www.coindesk.com/arc/outboundfeeds/rss/",
      "https://decrypt.co/feed",
      "https://www.theblock.co/rss/",
      "https://api.theblockbeats.news/v2/rss/all",
    ],
    "vintage-tech-spotlights": [
      "https://tedium.co/feed/",
      "https://paleotronic.com/feed/",
      "https://www.theregister.com/headlines.atom",
    ],
  },
  builder: {
    "founder-stories": [
      "https://review.firstround.com/rss/",
      "https://blog.ycombinator.com/feed/",
      "https://steveblank.com/feed/",
      "https://techcrunch.com/category/startups/feed/",
      "https://www.indiehackers.com/feed.xml",
    ],
    "productivity-hacks": [
      "https://lifehacker.com/rss",
      "https://gettingthingsdone.com/feed/",
      "https://zenhabits.net/feed/",
      "https://jamesclear.com/feed",
    ],
    "automation-no-code": [
      "https://zapier.com/blog/feeds/latest/",
      "https://nocodedevs.com/feed/",
      "https://bubble.io/blog/rss",
      "https://www.makerpad.co/feed",
    ],
    "funding-monetization": [
      "https://bothsidesofthetable.com/feed",
      "https://feld.com/feed",
      "https://avc.com/feed/",
      "https://saastr.com/feed/",
    ],
    "project-management": [
      "https://blog.asana.com/feed/",
      "https://blog.trello.com/rss",
      "https://monday.com/blog/feed/",
    ],
    "stoic-mindset": [
      "https://dailystoic.com/feed/",
      "https://modernstoicism.com/feed/",
      "https://www.artofmanliness.com/feed/",
    ],
  },
  art: {
    "generative-ai-art": [
      "https://ml-art.co/feed",
      "https://aiartists.org/feed",
      "https://www.creativebloq.com/feeds/tag/ai-art",
    ],
    "pixel-retro-art": [
      "https://retronator.com/feed/",
      "https://indieretronews.com/feeds/posts/default?alt=rss",
      "https://pixelartacademy.com/feed/",
    ],
    "ui-ux-trends": [
      "https://www.smashingmagazine.com/feed/",
      "https://uxplanet.org/feed",
      "https://alistapart.com/main/feed",
      "https://uxbooth.com/feed/",
    ],
    "color-typography": [
      "https://www.typewolf.com/feed/",
      "https://colorhunt.co/feed/",
      "https://blog.adobe.com/en/publish/creative-cloud.xml",
    ],
    "animation-motion": [
      "https://motionographer.com/feed/",
      "https://www.animatedreview.com/feed/",
      "https://greensock.com/blog/feed",
    ],
    "tutorials-walkthroughs": [
      "https://tympanus.net/codrops/feed/",
      "https://webdesign.tutsplus.com/posts.atom",
      "https://designmodo.com/feed/",
    ],
  },
  gaming: {
    "retro-game-news": [
      "https://www.timeextension.com/feed/",
      "https://indieretronews.com/feeds/posts/default?alt=rss",
      "https://retrododo.com/feed/",
      "https://www.retrogamer.net/feed/",
    ],
    "emulation-modding": [
      "https://retropie.org.uk/feed/",
      "https://www.youtube.com/feeds/videos.xml?channel_id=UC_0CVCfC_3iuHqmyClu59Uw",
      "https://emulation.gametechwiki.com/index.php?title=Special:RecentChanges&feed=rss",
    ],
    "collecting-hardware": [
      "https://www.racketboy.com/feed/",
      "https://consolevariations.com/feed/",
      "https://retrogamecollecting.com/feed/",
    ],
    "speedruns-events": [
      "https://www.speedrun.com/api/v1/posts.rss",
      "https://gamesdonequick.com/feeds/blog",
      "https://tasvideos.org/feed/publications",
    ],
    "indie-retro-releases": [
      "https://itch.io/games/tag-retro.xml",
      "https://indieretronews.com/feeds/posts/default?alt=rss",
      "https://warpdoor.com/feed/",
    ],
    "dos-game-deep-dives": [
      "https://dos.itch.io/feed/new.xml",
      "https://dosgamer.com/feed/",
      "https://www.dosgamesarchive.com/feed/",
    ],
  },
};

// Helper function to get all feeds for a category
export const getFeedsForCategory = (category) => {
  const categoryFeeds = RSS_FEEDS[category];
  if (!categoryFeeds) return [];

  // Flatten all subcategory feeds into one array
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
    "https://lifehacker.com/rss": "Lifehacker",
    "https://zapier.com/blog/feeds/latest/": "Zapier Blog",
    "https://www.smashingmagazine.com/feed/": "Smashing Magazine",
    "https://retronator.com/feed/": "Retronator",
    "https://www.timeextension.com/feed/": "Time Extension",
    "https://indieretronews.com/feeds/posts/default?alt=rss":
      "Indie Retro News",
    // Add more mappings as needed
  };

  return feedNames[url] || new URL(url).hostname.replace("www.", "");
};
