// api/feeds.js - Vercel Serverless Function
import Parser from "rss-parser";

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
// RSS feed URLs organized by category (expanded based on your app's needs)
const RSS_FEEDS = {
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
      "https://hai.stanford.edu/news/rss.xml",
      "https://allenai.org/rss.xml",
      "https://venturebeat.com/category/ai/feed/",
      "https://arxiv-sanity-lite.com/feed/?query=cs.AI",
    ],

    "martech-adtech": [
      "https://martech.org/feed/",
      "https://adexchanger.com/feed/",
      "https://marketingland.com/feed/",
      "https://chiefmartec.com/feed/",
      "https://www.marketingtechnews.net/rss.xml",
      "https://digiday.com/feed/",
      "https://www.marketingprofs.com/rss/all",
    ],

    "web-dev-devops": [
      "https://css-tricks.com/feed/",
      "https://www.smashingmagazine.com/feed/",
      "https://web.dev/feed.xml",
      "https://blog.logrocket.com/feed/",
      "https://www.joshwcomeau.com/rss.xml",
      "https://kentcdodds.com/blog/rss.xml",
      "https://dev.to/feed/tag/webdev",
      "https://blog.cloudflare.com/rss/",
      "https://github.blog/category/development/feed/",
    ],

    "cybersecurity-privacy": [
      "https://krebsonsecurity.com/feed/",
      "https://feeds.feedburner.com/TheHackersNews",
      "https://www.darkreading.com/rss.xml",
      "https://www.schneier.com/feed/atom/",
      "https://www.bleepingcomputer.com/feed/",
      "https://threatpost.com/feed/",
      "https://blog.talosintelligence.com/feeds/posts/default",
      "https://www.microsoft.com/security/blog/feed/",
    ],

    "blockchain-web3": [
      "https://www.coindesk.com/arc/outboundfeeds/rss/",
      "https://decrypt.co/feed",
      "https://cointelegraph.com/rss",
      "https://ethereum.org/en/blog/feed.xml",
      "https://blog.chain.link/rss/",
      "https://messari.io/rss",
      "https://bankless.substack.com/feed",
      "https://vitalik.eth.limo/feed.xml",
    ],
  },

  builder: {
    "startup-stories": [
      "https://review.firstround.com/rss/",
      "https://blog.ycombinator.com/feed/",
      "https://techcrunch.com/category/startups/feed/",
      "https://www.indiehackers.com/feed.xml",
      "https://sifted.eu/feed/",
      "https://venturebeat.com/category/entrepreneur/feed/",
      "https://bothsidesofthetable.com/feed",
      "https://avc.com/feed/",
    ],

    "productivity-hacks": [
      "https://zenhabits.net/feed/",
      "https://jamesclear.com/feed",
      "https://gettingthingsdone.com/feed/",
      "https://aliabdaal.com/rss/",
      "https://tim.blog/feed/",
      "https://calnewport.com/blog/feed/",
      "https://www.asianefficiency.com/feed/",
    ],

    "automation-no-code": [
      "https://zapier.com/blog/feeds/latest/",
      "https://bubble.io/blog/rss",
      "https://www.nocode.tech/feed",
      "https://blog.airtable.com/rss/",
      "https://webflow.com/blog/feed.rss",
      "https://blog.n8n.io/rss/",
      "https://makerpad.co/posts.atom",
      "https://www.producthunt.com/feed/no-code",
    ],

    "project-management": [
      "https://blog.asana.com/feed/",
      "https://blog.trello.com/rss",
      "https://monday.com/blog/feed/",
      "https://www.projectmanager.com/blog/feed",
      "https://blog.clickup.com/feed/",
      "https://www.atlassian.com/blog/feed",
      "https://www.wrike.com/blog/feed/",
    ],

    "momentum-mindset": [
      "https://fs.blog/feed/",
      "https://ryanholiday.net/feed/",
      "https://markmanson.net/feed",
      "https://sethgodin.typepad.com/seths_blog/atom.xml",
      "https://dailystoic.com/feed/",
      "https://tim.blog/feed/",
      "https://jamesclear.com/feed",
      "https://waitbutwhy.com/feed",
      "https://feeds.feedburner.com/brainpickings/rss", // The Marginalian
    ],
  },

  art: {
    "generative-ai-art": [
      "https://aiartists.org/feed",
      "https://www.creativebloq.com/feeds/tag/ai-art",
      "https://ml.berkeley.edu/blog/feed.xml",
      "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
      "https://runwayml.com/blog/rss/",
    ],

    "ui-ux-trends": [
      "https://www.smashingmagazine.com/feed/",
      "https://uxplanet.org/feed",
      "https://alistapart.com/main/feed",
      "https://uxdesign.cc/feed",
      "https://www.nngroup.com/feed/rss/",
      "https://www.invisionapp.com/inside-design/feed/",
      "https://www.uxmatters.com/feed.php",
      "https://sidebar.io/feed.xml",
    ],

    "color-typography": [
      "https://fontsinuse.com/feed",
      "https://blog.adobe.com/en/publish/creative-cloud.xml",
      "https://typographica.org/feed/",
      "https://ilovetypography.com/feed/",
      "https://fonts.googleblog.com/feeds/posts/default",
    ],

    "animation-motion": [
      "https://motionographer.com/feed/",
      "https://greensock.com/blog/feed",
      "https://www.animatedreview.com/feed/",
      "https://lottiefiles.com/blog/feed",
      "https://www.schoolofmotion.com/blog/rss",
    ],

    "tutorials-walkthroughs": [
      "https://tympanus.net/codrops/feed/",
      "https://webdesign.tutsplus.com/posts.atom",
      "https://designmodo.com/feed/",
      "https://www.sitepoint.com/design-ux/feed/",
      "https://tutsplus.com/feed/",
      "https://www.freecodecamp.org/news/rss/",
    ],
  },

  gaming: {
    "daily-roundup": [
      "https://www.polygon.com/rss/index.xml",
      "https://www.gamespot.com/feeds/news/",
      "https://www.rockpapershotgun.com/feed",
      "https://www.gamesradar.com/rss/",
      "https://www.eurogamer.net/feed",
      "https://kotaku.com/rss",
      "https://www.destructoid.com/feed/",
    ],

    "pro-guides-tips": [
      "https://www.gamepur.com/feed",
      "https://www.thegamer.com/feed/",
      "https://dotesports.com/feed",
      "https://www.pcgamer.com/rss/",
    ],

    "retro-gaming": [
      "https://www.timeextension.com/feed/",
      "https://indieretronews.com/feeds/posts/default?alt=rss",
      "https://retrododo.com/feed/",
      "https://www.retrogamer.net/feed/",
      "https://www.hardcoregaming101.net/feed/",
    ],

    "indie-spotlights": [
      "https://indiegames.com/feed/",
      "https://www.indiedb.com/rss/games/",
      "https://www.gamedeveloper.com/rss.xml",
      "https://warpdoor.com/feed/",
      "https://alphabetagamer.com/feed/",
      "https://indiegameplus.com/feed/",
    ],

    "collectors-hub": [
      "https://www.racketboy.com/feed/",
      "https://videogamekrieg.com/feed",
      "https://www.pricecharting.com/blog/feed",
      "https://www.retrorgb.com/feed/",
      "https://www.gamingalexandria.com/wp/feed/",
    ],
  },
};

// Helpers for category/subcategory resolution

const getFeedsForCategory = (category) => {
  const categoryFeeds = RSS_FEEDS[category];
  if (!categoryFeeds) return [];
  return Object.values(categoryFeeds).flat();
};

const getFeedsForSubcategory = (category, subcategory) => {
  const categoryFeeds = RSS_FEEDS[category];
  if (!categoryFeeds) return [];
  return categoryFeeds[subcategory] || [];
};

const getFeedDisplayName = (url) => {
  // Optionally, use a map here for pretty source names
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "Unknown Source";
  }
};

const parseFeedItem = (item, source) => {
  let thumbnail = null;
  if (item["media:thumbnail"]) {
    thumbnail = item["media:thumbnail"].$
      ? item["media:thumbnail"].$.url
      : item["media:thumbnail"];
  }

  // clean description
  let description =
    item.contentSnippet || item.description || item.summary || "";
  description = description.replace(/<[^>]*>/g, "").trim();
  if (description.length > 200) {
    description = description.substring(0, 197) + "...";
  }

  const pubDate =
    item.pubDate || item.isoDate || item.published || new Date().toISOString();

  return {
    title: item.title || "Untitled",
    link: item.link || item.guid || "#",
    description,
    thumbnail,
    source: getFeedDisplayName(source),
    sourceUrl: source,
    creator: item.creator || item.author || getFeedDisplayName(source),
    guid: item.guid || item.link || `${source}-${pubDate}`,
    pubDate,
    time: new Date(pubDate).toLocaleString(),
  };
};

// Fetch a single RSS feed with timeout and error handling
const fetchSingleFeed = async (url, timeout = 8000) => {
  return new Promise(async (resolve) => {
    const timer = setTimeout(() => resolve([]), timeout);
    try {
      const feed = await parser.parseURL(url);
      clearTimeout(timer);
      resolve(feed.items.map((item) => parseFeedItem(item, url)));
    } catch (error) {
      clearTimeout(timer);
      console.error(`Error fetching feed ${url}:`, error.message);
      resolve([]);
    }
  });
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // OPTIONS for preflight
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

  // Get feeds for category and subcategory
  const feedUrls = subcategory
    ? getFeedsForSubcategory(category, subcategory)
    : getFeedsForCategory(category);

  if (!feedUrls || feedUrls.length === 0) {
    return res
      .status(200)
      .json({ items: [], message: "No feeds found for this category" });
  }

  // Fetch feeds in parallel
  const feedPromises = feedUrls.map((url) => fetchSingleFeed(url));
  const feedResults = await Promise.all(feedPromises);

  // Flatten and deduplicate
  let allItems = feedResults.flat();

  // Deduplicate by GUID/link
  const seen = new Set();
  allItems = allItems.filter((item) => {
    const key = item.guid || item.link;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by date (newest first)
  allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Limit to 10
  const finalItems = allItems.slice(0, 10);

  // Return in unified JSON
  return res.status(200).json({
    items: finalItems,
    count: finalItems.length,
    category,
    subcategory,
    timestamp: new Date().toISOString(),
    success: true,
  });
}
