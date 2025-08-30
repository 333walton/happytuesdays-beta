// Updated RSS catalog aligned with PDF category descriptions
// Replace your existing rssCatalog.js with this version

export const RSS_FEEDS = {
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
