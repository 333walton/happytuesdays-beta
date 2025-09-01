// Updated RSS catalog aligned with PDF category descriptions
// Replace your existing rssCatalog.js with this version

export const RSS_FEEDS = {
  tech: {
    "ai-machine-learning": [
      "https://openai.com/news/rss/", // OpenAI news, research
      "https://cloud.google.com/blog/products/ai-machine-learning/rss/", // Google Cloud AI, ML tools
      "https://news.mit.edu/topic/artificial-intelligence2/rss.xml", // MIT AI research
      "https://machinelearningmastery.com/feed/", // ML tutorials, guides
      "https://www.marktechpost.com/feed/", // AI tools, use cases
      "https://hnrss.org/newest?q=AI+OR+machine+learning", // Hacker News AI/ML
      "https://blog.google/technology/ai/rss/", // Google AI updates
      "https://huggingface.co/blog/feed.xml", // Hugging Face, NLP, transformers
      "https://www.deeplearning.ai/blog/feed/", // Applied AI, learning
      "https://hai.stanford.edu/news/rss.xml", // Stanford AI research
      "https://allenai.org/rss.xml", // AI2 research, datasets
      "https://venturebeat.com/category/ai/feed/", // AI industry, funding
      "https://arxiv-sanity-lite.com/feed/?query=cs.AI", // arXiv AI papers
      "https://www.aitrends.com/feed/", // AI business, adoption
      "https://blogs.microsoft.com/ai/feed/", // Microsoft AI news
    ],

    "martech-adtech": [
      "https://martech.org/feed/", // Martech news, tools
      "https://adexchanger.com/feed/", // Ad tech, programmatic
      "https://marketingland.com/feed/", // Marketing, analytics
      "https://chiefmartec.com/feed/", // Martech landscape, ops
      "https://www.marketingtechnews.net/rss.xml", // Martech, digital trends
      "https://digiday.com/feed/", // Media, marketing policy
      "https://www.marketingprofs.com/rss/all", // Marketing tips, how-to
      "https://adtechdaily.com/feed", // Ad ops, campaign strategy
      "https://verve.com/feed", // Omnichannel ads, privacy
      "https://adpushup.com/blog/feed", // Ad revenue, optimization
    ],

    "web-dev-devops": [
      "https://css-tricks.com/feed/", // CSS, JS tips
      "https://www.smashingmagazine.com/feed/", // UX, front-end tools
      "https://web.dev/feed.xml", // Web standards, performance
      "https://blog.logrocket.com/feed/", // Web dev tutorials
      "https://www.joshwcomeau.com/rss.xml", // React, CSS deep dives
      "https://kentcdodds.com/blog/rss.xml", // JS, React, testing
      "https://dev.to/feed/tag/webdev", // Webdev community
      "https://blog.cloudflare.com/rss/", // Security, performance
      "https://github.blog/category/development/feed/", // GitHub dev news
      "https://devops.com/feed", // DevOps workflows
      "https://atlassian.com/blog/devops/feed", // DevOps collaboration
    ],

    "cybersecurity-privacy": [
      "https://krebsonsecurity.com/feed/", // Security breaches, threats
      "https://feeds.feedburner.com/TheHackersNews", // Hacks, vulnerabilities
      "https://www.darkreading.com/rss.xml", // Enterprise security, threats
      "https://www.schneier.com/feed/atom/", // Cryptography, privacy
      "https://www.bleepingcomputer.com/feed/", // Malware, exploits
      "https://threatpost.com/feed/", // Threat landscape, trends
      "https://blog.talosintelligence.com/feeds/posts/default", // Cisco threat intel
      "https://www.microsoft.com/security/blog/feed/", // Microsoft security
    ],

    "blockchain-web3": [
      "https://www.coindesk.com/arc/outboundfeeds/rss/", // Crypto news, blockchain
      "https://decrypt.co/feed", // DeFi, NFTs, crypto
      "https://cointelegraph.com/rss", // Global crypto news
      "https://ethereum.org/en/blog/feed.xml", // Ethereum updates
      "https://blog.chain.link/rss/", // Smart contracts, Chainlink
      "https://messari.io/rss", // Crypto research, analysis
      "https://bankless.substack.com/feed", // DeFi, Web3 trends
      "https://vitalik.eth.limo/feed.xml", // Vitalik blog
    ],
  },

  builder: {
    "startup-stories": [
      "https://review.firstround.com/rss/", // Founder stories
      "https://blog.ycombinator.com/feed/", // YC startups
      "https://techcrunch.com/category/startups/feed/", // Startup news
      "https://www.indiehackers.com/feed.xml", // Indie founders
      "https://sifted.eu/feed/", // European startups
      "https://venturebeat.com/category/entrepreneur/feed/", // Entrepreneurship
      "https://bothsidesofthetable.com/feed", // VC insights
      "https://www.startupgrind.com/feed.xml", // Startup events
    ],

    "productivity-hacks": [
      "https://zenhabits.net/feed/", // Minimalism, habits
      "https://jamesclear.com/feed", // Atomic habits
      "https://gettingthingsdone.com/feed/", // GTD method
      "https://aliabdaal.com/rss/", // Productivity tips
      "https://tim.blog/feed/", // Tim Ferriss hacks
      "https://calnewport.com/blog/feed/", // Deep work, focus
      "https://www.asianefficiency.com/feed/", // Workflow tips
    ],

    "automation-no-code": [
      "https://zapier.com/blog/feeds/latest/", // Automation, integrations
      "https://bubble.io/blog/rss", // No-code apps
      "https://www.nocode.tech/feed", // No-code tools
      "https://blog.airtable.com/rss/", // Airtable automation
      "https://webflow.com/blog/feed.rss", // Webflow design
      "https://blog.n8n.io/rss/", // Open-source automation
      "https://makerpad.co/posts.atom", // No-code projects
      "https://www.producthunt.com/feed/no-code", // No-code launches
    ],

    "project-management": [
      "https://blog.asana.com/feed/", // Asana tips
      "https://blog.trello.com/rss", // Trello updates
      "https://monday.com/blog/feed/", // Monday.com stories
      "https://www.projectmanager.com/blog/feed", // PM guides
      "https://blog.clickup.com/feed/", // ClickUp tips
      "https://www.atlassian.com/blog/feed", // PM tools, news
      "https://www.wrike.com/blog/feed/", // Wrike updates
      "https://www.pmi.org/rss.xml", // PM best practices
    ],

    "momentum-mindset": [
      "https://fs.blog/feed/", // Mental models
      "https://ryanholiday.net/feed/", // Stoicism
      "https://markmanson.net/feed", // Self-help, EQ
      "https://sethgodin.typepad.com/seths_blog/atom.xml", // Seth Godin ideas
      "https://dailystoic.com/feed/", // Stoic practices
      "https://tim.blog/feed/", // Life hacks
      "https://jamesclear.com/feed", // Habits, focus
      "https://waitbutwhy.com/feed", // Life essays
      "https://feeds.feedburner.com/brainpickings/rss", // Philosophy, literature
      "https://www.mindful.org/feed", // Mindfulness, wellness
    ],
  },

  art: {
    "generative-ai-art": [
      "https://aiartists.org/feed", // AI art showcase
      "https://www.creativebloq.com/feeds/tag/ai-art", // AI art trends
      "https://ml.berkeley.edu/blog/feed.xml", // ML + creativity
      "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", // AI art news
      "https://runwayml.com/blog/rss/", // Generative AI tools
    ],

    "ui-ux-trends": [
      "https://www.smashingmagazine.com/feed/", // UX, design trends
      "https://uxplanet.org/feed", // UX guides
      "https://alistapart.com/main/feed", // Web standards, design
      "https://uxdesign.cc/feed", // UX research, critiques
      "https://www.nngroup.com/feed/rss/", // Usability research
      "https://www.invisionapp.com/inside-design/feed/", // UI, UX process
      "https://www.uxmatters.com/feed.php", // UX issues, solutions
      "https://sidebar.io/feed.xml", // Curated design links
    ],

    "color-typography": [
      "https://fontsinuse.com/feed", // Fonts in use
      "https://blog.adobe.com/en/publish/creative-cloud.xml", // Adobe creative
      "https://typographica.org/feed/", // Typeface reviews
      "https://ilovetypography.com/feed/", // Fonts, typography news
      "https://fonts.googleblog.com/feeds/posts/default", // Google Fonts
    ],

    "animation-motion": [
      "https://motionographer.com/feed/", // Animation news
      "https://greensock.com/blog/feed", // GSAP tutorials
      "https://www.animatedreview.com/feed/", // Animation reviews
      "https://lottiefiles.com/blog/feed", // Lottie animations
      "https://www.schoolofmotion.com/blog/rss", // Motion design tips
    ],

    "tutorials-walkthroughs": [
      "https://tympanus.net/codrops/feed/", // Creative tutorials
      "https://webdesign.tutsplus.com/posts.atom", // Design tutorials
      "https://designmodo.com/feed/", // Design guides
      "https://www.sitepoint.com/design-ux/feed/", // UI/UX tutorials
      "https://tutsplus.com/feed/", // Creative tutorials
      "https://www.freecodecamp.org/news/rss/", // Dev tutorials
    ],
  },

  gaming: {
    "daily-roundup": [
      "https://www.polygon.com/rss/index.xml", // Gaming news
      "https://www.gamespot.com/feeds/news/", // Game reviews
      "https://www.rockpapershotgun.com/feed", // PC games, indies
      "https://www.gamesradar.com/rss/", // Gaming guides
      "https://www.eurogamer.net/feed", // Game news, reviews
      "https://kotaku.com/rss", // Gaming culture
      "https://www.destructoid.com/feed/", // Game news, features
      "https://www.ign.com/rss", // Gaming releases
    ],

    "pro-guides-tips": [
      "https://www.gamepur.com/feed", // Game guides
      "https://www.thegamer.com/feed/", // Tips, guides
      "https://dotesports.com/feed", // Esports news
      "https://www.pcgamer.com/rss/", // PC gaming tips
    ],

    "retro-gaming": [
      "https://www.timeextension.com/feed/", // Retro reviews
      "https://indieretronews.com/feeds/posts/default?alt=rss", // Retro news
      "https://retrododo.com/feed/", // Retro hardware
      "https://www.retrogamer.net/feed/", // Retro magazine
      "https://www.hardcoregaming101.net/feed/", // Game histories
      "https://retroblast.com/feed/", // Retro preservation
    ],

    "indie-spotlights": [
      "https://indiegames.com/feed/", // Indie news
      "https://www.indiedb.com/rss/games/", // Indie launches
      "https://www.gamedeveloper.com/rss.xml", // Dev insights
      "https://warpdoor.com/feed/", // Indie projects
      "https://alphabetagamer.com/feed/", // Indie demos
      "https://indiegamesplus.com/feed/", // Indie reviews
    ],

    "collectors-hub": [
      "https://www.racketboy.com/feed/", // Collector guides
      "https://videogamekrieg.com/feed", // Collectible news
      "https://www.pricecharting.com/blog/feed", // Game pricing
      "https://www.retrorgb.com/feed/", // Retro hardware mods
      "https://www.gamingalexandria.com/wp/feed/", // Game preservation
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
    // --- AI / Machine Learning ---
    "https://openai.com/news/rss/": "OpenAI News",
    "https://cloud.google.com/blog/products/ai-machine-learning/rss/":
      "Google AI Blog",
    "https://news.mit.edu/topic/artificial-intelligence2/rss.xml":
      "MIT AI News",
    "https://machinelearningmastery.com/feed/": "Machine Learning Mastery",
    "https://www.marktechpost.com/feed/": "MarkTechPost",
    "https://hnrss.org/newest?q=AI+OR+machine+learning": "Hacker News AI",
    "https://blog.google/technology/ai/rss/": "Google AI Blog (Company-wide)",
    "https://huggingface.co/blog/feed.xml": "Hugging Face Blog",
    "https://www.deeplearning.ai/blog/feed/": "DeepLearning.AI Blog",
    "https://hai.stanford.edu/news/rss.xml": "Stanford HAI News",
    "https://allenai.org/rss.xml": "Allen Institute for AI",
    "https://venturebeat.com/category/ai/feed/": "VentureBeat AI",
    "https://arxiv-sanity-lite.com/feed/?query=cs.AI": "arXiv AI Papers",
    "https://www.aitrends.com/feed/": "AI Trends",
    "https://blogs.microsoft.com/ai/feed/": "Microsoft AI Blog",

    // --- Martech / Adtech ---
    "https://martech.org/feed/": "MarTech",
    "https://adexchanger.com/feed/": "AdExchanger",
    "https://marketingland.com/feed/": "Marketing Land",
    "https://chiefmartec.com/feed/": "Chief Martec",
    "https://www.marketingtechnews.net/rss.xml": "MarketingTech News",
    "https://digiday.com/feed/": "Digiday",
    "https://www.marketingprofs.com/rss/all": "MarketingProfs",
    "https://adtechdaily.com/feed": "AdTech Daily",
    "https://verve.com/feed": "Verve",
    "https://adpushup.com/blog/feed": "AdPushup",

    // --- Web Dev / DevOps ---
    "https://css-tricks.com/feed/": "CSS-Tricks",
    "https://www.smashingmagazine.com/feed/": "Smashing Magazine",
    "https://web.dev/feed.xml": "web.dev",
    "https://blog.logrocket.com/feed/": "LogRocket Blog",
    "https://www.joshwcomeau.com/rss.xml": "Josh W. Comeau Blog",
    "https://kentcdodds.com/blog/rss.xml": "Kent C. Dodds Blog",
    "https://dev.to/feed/tag/webdev": "Dev.to (WebDev)",
    "https://blog.cloudflare.com/rss/": "Cloudflare Blog",
    "https://github.blog/category/development/feed/": "GitHub Blog (Dev)",
    "https://devops.com/feed": "DevOps.com",
    "https://atlassian.com/blog/devops/feed": "Atlassian DevOps Blog",

    // --- Cybersecurity ---
    "https://krebsonsecurity.com/feed/": "Krebs on Security",
    "https://feeds.feedburner.com/TheHackersNews": "The Hacker News",
    "https://www.darkreading.com/rss.xml": "Dark Reading",
    "https://www.schneier.com/feed/atom/": "Schneier on Security",
    "https://www.bleepingcomputer.com/feed/": "Bleeping Computer",
    "https://threatpost.com/feed/": "Threatpost",
    "https://blog.talosintelligence.com/feeds/posts/default":
      "Cisco Talos Blog",
    "https://www.microsoft.com/security/blog/feed/": "Microsoft Security Blog",

    // --- Blockchain / Web3 ---
    "https://www.coindesk.com/arc/outboundfeeds/rss/": "CoinDesk",
    "https://decrypt.co/feed": "Decrypt",
    "https://cointelegraph.com/rss": "CoinTelegraph",
    "https://ethereum.org/en/blog/feed.xml": "Ethereum Blog",
    "https://blog.chain.link/rss/": "Chainlink Blog",
    "https://messari.io/rss": "Messari",
    "https://bankless.substack.com/feed": "Bankless",
    "https://vitalik.eth.limo/feed.xml": "Vitalik Buterin Blog",

    // --- Startup / Builder ---
    "https://review.firstround.com/rss/": "First Round Review",
    "https://blog.ycombinator.com/feed/": "Y Combinator Blog",
    "https://techcrunch.com/category/startups/feed/": "TechCrunch Startups",
    "https://www.indiehackers.com/feed.xml": "Indie Hackers",
    "https://sifted.eu/feed/": "Sifted",
    "https://venturebeat.com/category/entrepreneur/feed/":
      "VentureBeat Entrepreneur",
    "https://bothsidesofthetable.com/feed": "Both Sides of the Table",
    "https://www.startupgrind.com/feed.xml": "Startup Grind",

    // --- Productivity ---
    "https://zenhabits.net/feed/": "Zen Habits",
    "https://jamesclear.com/feed": "James Clear",
    "https://gettingthingsdone.com/feed/": "Getting Things Done",
    "https://aliabdaal.com/rss/": "Ali Abdaal",
    "https://tim.blog/feed/": "Tim Ferriss Blog",
    "https://calnewport.com/blog/feed/": "Cal Newport Blog",
    "https://www.asianefficiency.com/feed/": "Asian Efficiency",

    // --- Automation / No-code ---
    "https://zapier.com/blog/feeds/latest/": "Zapier Blog",
    "https://bubble.io/blog/rss": "Bubble Blog",
    "https://www.nocode.tech/feed": "NoCode.Tech",
    "https://blog.airtable.com/rss/": "Airtable Blog",
    "https://webflow.com/blog/feed.rss": "Webflow Blog",
    "https://blog.n8n.io/rss/": "n8n Blog",
    "https://makerpad.co/posts.atom": "Makerpad",
    "https://www.producthunt.com/feed/no-code": "Product Hunt (No-code)",

    // --- Project Management ---
    "https://blog.asana.com/feed/": "Asana Blog",
    "https://blog.trello.com/rss": "Trello Blog",
    "https://monday.com/blog/feed/": "Monday.com Blog",
    "https://www.projectmanager.com/blog/feed": "ProjectManager Blog",
    "https://blog.clickup.com/feed/": "ClickUp Blog",
    "https://www.atlassian.com/blog/feed": "Atlassian Blog",
    "https://www.wrike.com/blog/feed/": "Wrike Blog",
    "https://www.pmi.org/rss.xml": "PMI Blog",

    // --- Mindset ---
    "https://fs.blog/feed/": "Farnam Street",
    "https://ryanholiday.net/feed/": "Ryan Holiday",
    "https://markmanson.net/feed": "Mark Manson",
    "https://sethgodin.typepad.com/seths_blog/atom.xml": "Seth Godin Blog",
    "https://dailystoic.com/feed/": "Daily Stoic",
    "https://waitbutwhy.com/feed": "Wait But Why",
    "https://feeds.feedburner.com/brainpickings/rss": "The Marginalian",
    "https://www.mindful.org/feed": "Mindful.org",

    // --- Art / Design ---
    "https://aiartists.org/feed": "AI Artists",
    "https://www.creativebloq.com/feeds/tag/ai-art": "CreativeBloq (AI Art)",
    "https://ml.berkeley.edu/blog/feed.xml": "Berkeley ML Blog",
    "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml":
      "The Verge AI Art",
    "https://runwayml.com/blog/rss/": "RunwayML Blog",

    "https://uxplanet.org/feed": "UX Planet",
    "https://alistapart.com/main/feed": "A List Apart",
    "https://uxdesign.cc/feed": "UX Collective",
    "https://www.nngroup.com/feed/rss/": "Nielsen Norman Group",
    "https://www.invisionapp.com/inside-design/feed/": "InVision Blog",
    "https://www.uxmatters.com/feed.php": "UX Matters",
    "https://sidebar.io/feed.xml": "Sidebar.io",

    "https://fontsinuse.com/feed": "Fonts In Use",
    "https://blog.adobe.com/en/publish/creative-cloud.xml":
      "Adobe Creative Cloud Blog",
    "https://typographica.org/feed/": "Typographica",
    "https://ilovetypography.com/feed/": "I Love Typography",
    "https://fonts.googleblog.com/feeds/posts/default": "Google Fonts Blog",

    "https://motionographer.com/feed/": "Motionographer",
    "https://greensock.com/blog/feed": "GreenSock Blog",
    "https://www.animatedreview.com/feed/": "Animated Review",
    "https://lottiefiles.com/blog/feed": "LottieFiles Blog",
    "https://www.schoolofmotion.com/blog/rss": "School of Motion",

    "https://tympanus.net/codrops/feed/": "Codrops",
    "https://webdesign.tutsplus.com/posts.atom": "Envato Tuts+ (Web Design)",
    "https://designmodo.com/feed/": "Designmodo",
    "https://www.sitepoint.com/design-ux/feed/": "SitePoint (Design & UX)",
    "https://tutsplus.com/feed/": "Envato Tuts+",
    "https://www.freecodecamp.org/news/rss/": "freeCodeCamp News",

    // --- Gaming ---
    "https://www.polygon.com/rss/index.xml": "Polygon",
    "https://www.gamespot.com/feeds/news/": "GameSpot",
    "https://www.rockpapershotgun.com/feed": "Rock Paper Shotgun",
    "https://www.gamesradar.com/rss/": "GamesRadar",
    "https://www.eurogamer.net/feed": "Eurogamer",
    "https://kotaku.com/rss": "Kotaku",
    "https://www.destructoid.com/feed/": "Destructoid",
    "https://www.ign.com/rss": "IGN",

    "https://www.gamepur.com/feed": "Gamepur",
    "https://www.thegamer.com/feed/": "TheGamer",
    "https://dotesports.com/feed": "Dot Esports",
    "https://www.pcgamer.com/rss/": "PC Gamer",

    "https://www.timeextension.com/feed/": "Time Extension",
    "https://indieretronews.com/feeds/posts/default?alt=rss":
      "Indie Retro News",
    "https://retrododo.com/feed/": "RetroDodo",
    "https://www.retrogamer.net/feed/": "Retro Gamer",
    "https://www.hardcoregaming101.net/feed/": "Hardcore Gaming 101",
    "https://retroblast.com/feed/": "RetroBlast",

    "https://indiegames.com/feed/": "IndieGames.com",
    "https://www.indiedb.com/rss/games/": "IndieDB",
    "https://www.gamedeveloper.com/rss.xml": "Game Developer",
    "https://warpdoor.com/feed/": "Warp Door",
    "https://alphabetagamer.com/feed/": "Alpha Beta Gamer",
    "https://indiegamesplus.com/feed/": "Indie Games Plus",

    "https://www.racketboy.com/feed/": "Racketboy",
    "https://videogamekrieg.com/feed": "VideoGameKrieg",
    "https://www.pricecharting.com/blog/feed": "PriceCharting",
    "https://www.retrorgb.com/feed/": "RetroRGB",
    "https://www.gamingalexandria.com/wp/feed/": "Gaming Alexandria",
  };

  try {
    return feedNames[url] || new URL(url).hostname.replace("www.", "");
  } catch {
    return "Unknown Source";
  }
};
