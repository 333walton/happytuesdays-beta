// src/utils/feedAggregator.js - Mobile-optimized version
import axios from "axios";

// Cache configuration
const CACHE_DURATION =
  parseInt(process.env.REACT_APP_RSS_CACHE_DURATION) || 900000; // 15 minutes
const MAX_ITEMS = 10; // Fixed limit
const ENABLE_FALLBACK = process.env.REACT_APP_ENABLE_FALLBACK_DATA === "true";

// Mobile detection
const isMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

// Determine API endpoint based on environment
const getApiEndpoint = () => {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3001/api/feeds";
  }
  return "/api/feeds";
};

const API_ENDPOINT = getApiEndpoint();

// In-memory cache as primary, localStorage as backup
const memoryCache = new Map();

// Prevent console spam on mobile
const safeLog = (...args) => {
  if (!isMobile() && process.env.NODE_ENV !== "production") {
    console.log(...args);
  }
};

const safeWarn = (...args) => {
  if (!isMobile() && process.env.NODE_ENV !== "production") {
    console.warn(...args);
  }
};

// Helper to get cached data
const getCachedFeed = (cacheKey) => {
  // Check memory cache first
  const memoryCached = memoryCache.get(cacheKey);
  if (memoryCached && Date.now() - memoryCached.timestamp < CACHE_DURATION) {
    safeLog(`✅ Cache hit for ${cacheKey}`);
    return memoryCached.data;
  }

  // Check localStorage as fallback (with error handling for mobile)
  try {
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        // Restore to memory cache
        memoryCache.set(cacheKey, parsed);
        safeLog(`✅ LocalStorage cache hit for ${cacheKey}`);
        return parsed.data;
      }
    }
  } catch (e) {
    // Don't log on mobile to prevent console spam
    if (!isMobile()) {
      safeWarn("Error reading from localStorage:", e);
    }
  }

  return null;
};

// Helper to store cached data with mobile optimization
const storeInCache = (cacheKey, data) => {
  const cacheData = {
    timestamp: Date.now(),
    data: data,
  };

  // Store in memory
  memoryCache.set(cacheKey, cacheData);

  // Store in localStorage with error handling
  try {
    // On mobile, be more conservative with storage
    if (isMobile()) {
      // Only store if we have less than 10 cached items
      const cachedKeys = Object.keys(localStorage).filter((k) =>
        k.startsWith("feed_")
      );
      if (cachedKeys.length >= 10) {
        cleanupCache();
      }
    }

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (e) {
    // Silently handle storage errors on mobile
    if (!isMobile()) {
      safeWarn("Error writing to localStorage:", e);
    }
    // Try to clean up and retry once
    try {
      cleanupCache();
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (retryError) {
      // Give up silently
    }
  }
};

// Clean up old cache entries with mobile optimization
const cleanupCache = () => {
  try {
    const keys = Object.keys(localStorage);
    const feedKeys = keys.filter((k) => k.startsWith("feed_"));

    // On mobile, be more aggressive with cleanup
    const removeRatio = isMobile() ? 0.5 : 0.25;

    // Remove oldest entries
    const entries = feedKeys.map((key) => {
      try {
        return {
          key,
          timestamp: JSON.parse(localStorage.getItem(key)).timestamp || 0,
        };
      } catch {
        return { key, timestamp: 0 };
      }
    });

    entries.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest entries
    const toRemove = Math.floor(entries.length * removeRatio);
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(entries[i].key);
    }

    safeLog(`🧹 Cleaned up ${toRemove} old cache entries`);
  } catch (e) {
    // Silently handle cleanup errors
    if (!isMobile()) {
      safeWarn("Error cleaning cache:", e);
    }
  }
};

// NewsAPI fallback with mobile optimization
const fetchFromNewsAPI = async (query) => {
  const apiKey = process.env.REACT_APP_NEWS_API_KEY;
  if (!apiKey || !ENABLE_FALLBACK) return [];

  // Skip NewsAPI on mobile to reduce load
  if (isMobile()) {
    safeLog("Skipping NewsAPI fallback on mobile");
    return [];
  }

  try {
    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: query,
        apiKey: apiKey,
        language: "en",
        sortBy: "publishedAt",
        pageSize: 10,
      },
      timeout: 5000, // Shorter timeout
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
    safeLog("NewsAPI fallback failed:", error.message);
    return [];
  }
};

// Main function to fetch and aggregate feeds with mobile optimization
export async function fetchAndCacheFeed(category, subcategory = null) {
  // Generate cache key
  const cacheKey = `feed_${category}${subcategory ? `_${subcategory}` : ""}`;

  // Check cache first
  const cached = getCachedFeed(cacheKey);
  if (cached) {
    return cached.slice(0, MAX_ITEMS);
  }

  // Show we're loading
  safeLog(`🔄 Fetching fresh data for ${category}/${subcategory || "all"}`);

  try {
    // Make API call with appropriate timeout for mobile
    const timeout = isMobile() ? 8000 : 10000;

    const response = await axios.post(
      API_ENDPOINT,
      { category, subcategory },
      {
        timeout,
        headers: { "Content-Type": "application/json" },
        signal: isMobile() ? AbortSignal.timeout(timeout) : undefined,
      }
    );
    console.log("RAW API response to", cacheKey, ":", response.data);
    // Log structure before you destructure for items

    let { items, stats, filterRules } = response.data;
    console.log("items before slicing/filter:", items);

    // Log stats if available (not on mobile)
    if (stats && !isMobile() && process.env.NODE_ENV !== "production") {
      console.log(`📊 Filter Stats for ${category}/${subcategory}:`, stats);
    }

    // LIMIT ITEMS
    items = items.slice(0, MAX_ITEMS);

    // Only try NewsAPI fallback on desktop
    if (items.length < 5 && ENABLE_FALLBACK && !isMobile()) {
      const query = subcategory ? subcategory.replace(/-/g, " ") : category;
      const newsApiItems = await fetchFromNewsAPI(query);

      if (newsApiItems.length > 0) {
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
        // Right before return
        console.log("Returning items for render:", items);

        return sortedItems;
      }
    }

    // Cache and return the results
    if (items.length > 0) {
      storeInCache(cacheKey, items);
      safeLog(`✅ Cached ${items.length} items for ${cacheKey}`);
    }

    return items;
  } catch (error) {
    // More graceful error handling for mobile
    if (axios.isCancel(error)) {
      safeLog("Request was cancelled (timeout)");
    } else {
      safeLog(
        `Error fetching feeds for ${category}/${subcategory}:`,
        error.message
      );
    }

    // Try NewsAPI as fallback (desktop only)
    if (ENABLE_FALLBACK && !isMobile()) {
      const query = subcategory ? subcategory.replace(/-/g, " ") : category;
      const fallbackItems = await fetchFromNewsAPI(query);
      if (fallbackItems.length > 0) {
        const limitedFallback = fallbackItems.slice(0, MAX_ITEMS);
        storeInCache(cacheKey, limitedFallback);
        return limitedFallback;
      }
    }

    // Return cached data even if expired
    const expiredCache = localStorage.getItem(cacheKey);
    if (expiredCache) {
      try {
        const expiredData = JSON.parse(expiredCache).data;
        safeLog(`⚠️ Returning expired cache for ${cacheKey}`);
        return expiredData.slice(0, MAX_ITEMS);
      } catch (e) {
        // Silently fail
      }
    }

    // Return empty array as last resort
    return [];
  }
}

// Prefetch feeds for better UX (skip on mobile)
export async function prefetchFeeds(category) {
  // Skip prefetching on mobile to save resources
  if (isMobile()) {
    return;
  }

  // Just trigger a cache fill, don't block
  fetchAndCacheFeed(category).catch(() => {
    // Silently fail prefetch
  });
}

// Clear cache for a specific category
export function clearCategoryCache(category) {
  const keys = [];

  // Clear from memory cache
  for (const [key] of memoryCache) {
    if (key.startsWith(`feed_${category}`)) {
      memoryCache.delete(key);
      keys.push(key);
    }
  }

  // Clear from localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`feed_${category}`)) {
        keys.push(key);
      }
    }

    keys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Silently fail
      }
    });

    safeLog(`🗑️ Cleared ${keys.length} cache entries for ${category}`);
  } catch (e) {
    if (!isMobile()) {
      safeWarn("Error clearing category cache:", e);
    }
  }
}

// Clear all feed cache
export function clearAllCache() {
  memoryCache.clear();

  const keys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("feed_")) {
        keys.push(key);
      }
    }

    keys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Silently fail
      }
    });

    safeLog(`🗑️ Cleared all ${keys.length} feed cache entries`);
  } catch (e) {
    if (!isMobile()) {
      safeWarn("Error clearing all cache:", e);
    }
  }
}

// Export for debugging (only in development)
if (process.env.NODE_ENV !== "production") {
  window.debugFeedCache = {
    memoryCache,
    clearAll: clearAllCache,
    clearCategory: clearCategoryCache,
    getCacheKeys: () => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("feed_")) {
          keys.push(key);
        }
      }
      return keys;
    },
    getCacheSize: () => {
      try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("feed_")) {
            keys.push(key);
          }
        }
        const size = keys.reduce((acc, key) => {
          return acc + (localStorage.getItem(key) || "").length;
        }, 0);
        return `${(size / 1024).toFixed(2)} KB`;
      } catch {
        return "Unknown";
      }
    },
    isMobile: isMobile(),
  };
}
