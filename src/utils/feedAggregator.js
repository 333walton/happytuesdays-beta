// src/utils/feedAggregator.js
import axios from "axios";

// Cache configuration
const CACHE_DURATION =
  parseInt(process.env.REACT_APP_RSS_CACHE_DURATION) || 900000; // 15 minutes
const MAX_ITEMS = parseInt(process.env.REACT_APP_MAX_FEED_ITEMS) || 20;
const ENABLE_FALLBACK = process.env.REACT_APP_ENABLE_FALLBACK_DATA === "true";

// In-memory cache as primary, localStorage as backup
const memoryCache = new Map();

// Helper to get cached data
const getCachedFeed = (cacheKey) => {
  // Check memory cache first
  const memoryCached = memoryCache.get(cacheKey);
  if (memoryCached && Date.now() - memoryCached.timestamp < CACHE_DURATION) {
    return memoryCached.data;
  }

  // In feedAggregator.js, make sure this change is saved:
  const getApiEndpoint = () => {
    if (process.env.NODE_ENV === "development") {
      return "http://localhost:3001/api/feeds"; // Direct URL
    }
    return "/api/feeds";
  };

  // Check localStorage as fallback
  try {
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        // Restore to memory cache
        memoryCache.set(cacheKey, parsed);
        return parsed.data;
      }
    }
  } catch (e) {
    console.warn("Error reading from localStorage:", e);
  }

  return null;
};

// Helper to store cached data
const storeInCache = (cacheKey, data) => {
  const cacheData = {
    timestamp: Date.now(),
    data: data,
  };

  // Store in memory
  memoryCache.set(cacheKey, cacheData);

  // Store in localStorage as backup
  try {
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (e) {
    console.warn("Error writing to localStorage:", e);
    // Clean up old cache entries if storage is full
    cleanupCache();
  }
};

// Clean up old cache entries
const cleanupCache = () => {
  try {
    const keys = Object.keys(localStorage);
    const feedKeys = keys.filter((k) => k.startsWith("feed_"));

    // Remove oldest entries
    const entries = feedKeys.map((key) => ({
      key,
      timestamp: JSON.parse(localStorage.getItem(key)).timestamp,
    }));

    entries.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest 25%
    const toRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(entries[i].key);
    }
  } catch (e) {
    console.warn("Error cleaning cache:", e);
  }
};

// NewsAPI fallback
const fetchFromNewsAPI = async (query) => {
  const apiKey = process.env.REACT_APP_NEWS_API_KEY;
  if (!apiKey || !ENABLE_FALLBACK) return [];

  try {
    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: query,
        apiKey: apiKey,
        language: "en",
        sortBy: "publishedAt",
        pageSize: 10,
      },
    });

    return response.data.articles.map((article) => ({
      title: article.title,
      link: article.url,
      description: article.description || article.content || "",
      thumbnail: article.urlToImage,
      source: article.source.name,
      sourceUrl: article.url,
      creator: article.author || article.source.name,
      guid: article.url,
      pubDate: article.publishedAt,
      time: `${new Date(
        article.publishedAt
      ).toLocaleDateString()} at ${new Date(
        article.publishedAt
      ).toLocaleTimeString()}`,
    }));
  } catch (error) {
    console.error("NewsAPI fallback failed:", error);
    return [];
  }
};

// Main function to fetch and aggregate feeds
export async function fetchAndCacheFeed(category, subcategory = null) {
  // Generate cache key
  const cacheKey = `feed_${category}${subcategory ? `_${subcategory}` : ""}`;

  // Check cache first
  const cached = getCachedFeed(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Call the backend API
    const response = await axios.post(
      "/api/feeds",
      {
        category,
        subcategory,
      },
      {
        timeout: 10000, // 10 second timeout
      }
    );

    const { items } = response.data;

    // If we have too few items and NewsAPI is available, fetch additional content
    if (items.length < 5 && ENABLE_FALLBACK) {
      const query = subcategory ? subcategory.replace(/-/g, " ") : category;
      const newsApiItems = await fetchFromNewsAPI(query);

      // Combine and deduplicate
      const combined = [...items, ...newsApiItems];
      const seen = new Set();
      const uniqueItems = combined.filter((item) => {
        const key = item.guid || item.link;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Sort by date and limit
      const sortedItems = uniqueItems
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
        .slice(0, MAX_ITEMS);

      storeInCache(cacheKey, sortedItems);
      return sortedItems;
    }

    // Cache and return the results
    storeInCache(cacheKey, items);
    return items;
  } catch (error) {
    console.error(
      `Error fetching feeds for ${category}/${subcategory}:`,
      error
    );

    // Try NewsAPI as complete fallback
    if (ENABLE_FALLBACK) {
      const query = subcategory ? subcategory.replace(/-/g, " ") : category;
      const fallbackItems = await fetchFromNewsAPI(query);
      if (fallbackItems.length > 0) {
        storeInCache(cacheKey, fallbackItems);
        return fallbackItems;
      }
    }

    // Return cached data even if expired
    const expiredCache = localStorage.getItem(cacheKey);
    if (expiredCache) {
      try {
        return JSON.parse(expiredCache).data;
      } catch (e) {
        return [];
      }
    }

    return [];
  }
}

// Prefetch feeds for better UX (simplified for API approach)
export async function prefetchFeeds(category) {
  // Just trigger a cache fill, don't block
  fetchAndCacheFeed(category).catch(() => {
    // Silently fail prefetch
  });
}

// Clear cache for a specific category
export function clearCategoryCache(category) {
  const keys = [];

  // Find all relevant keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`feed_${category}`)) {
      keys.push(key);
    }
  }

  // Remove from both caches
  keys.forEach((key) => {
    memoryCache.delete(key);
    localStorage.removeItem(key);
  });
}

// Clear all feed cache
export function clearAllCache() {
  memoryCache.clear();

  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("feed_")) {
      keys.push(key);
    }
  }

  keys.forEach((key) => localStorage.removeItem(key));
}
