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

// DEBUG: Log the environment and endpoint
const getApiEndpoint = () => {
  const isDev = process.env.NODE_ENV === "development";
  const endpoint = isDev ? "http://localhost:3001/api/feeds" : "/api/feeds";

  console.log("🔍 DEBUG - Environment:", process.env.NODE_ENV);
  console.log("🔍 DEBUG - Using endpoint:", endpoint);
  console.log("🔍 DEBUG - Is Development?", isDev);

  return endpoint;
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
    safeLog(`✅ Returning cached data for ${cacheKey}`);
    return cached.slice(0, MAX_ITEMS);
  }

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

    // Log the response for debugging
    safeLog("API response for", cacheKey, ":", {
      itemCount: response.data.items?.length || 0,
      hasStats: !!response.data.stats,
      category: response.data.category,
      subcategory: response.data.subcategory,
    });

    // Extract items from response
    let items = response.data.items || [];
    const stats = response.data.stats;

    // Log filter stats if available (development only)
    if (stats && !isMobile() && process.env.NODE_ENV === "development") {
      console.log(`📊 Filter Stats for ${category}/${subcategory}:`);
      console.log(`  Total processed: ${stats.totalProcessed || 0}`);
      console.log(`  Passed filters: ${stats.passed || 0}`);
      console.log(`  Filter rate: ${stats.filterRate || "0%"}`);

      // Log filter reasons if available
      if (stats.filtered && Object.keys(stats.filtered).length > 0) {
        console.log("  Filter reasons:");
        Object.entries(stats.filtered).forEach(([reason, count]) => {
          console.log(`    ${reason}: ${count}`);
        });
      }

      // Log sample filtered items if available
      if (
        stats.filteredSamples &&
        Object.keys(stats.filteredSamples).length > 0
      ) {
        console.log("  Sample filtered items:");
        Object.entries(stats.filteredSamples).forEach(([reason, samples]) => {
          console.log(`    ${reason}:`);
          samples.slice(0, 3).forEach((sample) => {
            console.log(`      - "${sample}"`);
          });
        });
      }
    }

    // Ensure we don't exceed MAX_ITEMS
    items = items.slice(0, MAX_ITEMS);

    // Cache the results if we have items
    if (items.length > 0) {
      // Only cache what we need (not raw response)
      storeInCache(cacheKey, items);
      safeLog(`✅ Cached ${items.length} items for ${cacheKey}`);
    } else {
      safeLog(`⚠️ No items returned for ${cacheKey}`);

      // Try to return expired cache if available
      const expiredCache = localStorage.getItem(cacheKey);
      if (expiredCache) {
        try {
          const expiredData = JSON.parse(expiredCache).data;
          safeLog(`⚠️ Returning expired cache for ${cacheKey}`);
          return expiredData.slice(0, MAX_ITEMS);
        } catch (e) {
          safeLog("Failed to parse expired cache");
        }
      }
    }

    safeLog(`Returning ${items.length} items for ${cacheKey}`);
    return items;
  } catch (error) {
    // Error handling
    if (axios.isCancel(error)) {
      safeLog("Request was cancelled (timeout)");
    } else {
      safeLog(
        `Error fetching feeds for ${category}/${subcategory}:`,
        error.message
      );
    }

    // Try to return cached data even if expired
    const expiredCache = localStorage.getItem(cacheKey);
    if (expiredCache) {
      try {
        const expiredData = JSON.parse(expiredCache).data;
        safeLog(`⚠️ Returning expired cache after error for ${cacheKey}`);
        return expiredData.slice(0, MAX_ITEMS);
      } catch (e) {
        safeLog("Failed to parse expired cache");
      }
    }

    // Return empty array as last resort
    return [];
  }
}

window.clearAllCachesCompletely = function () {
  // Clear memory cache
  memoryCache.clear();

  // Clear all feed-related localStorage
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("feed")) {
      keys.push(key);
    }
  }

  keys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Failed to remove:", key);
    }
  });

  console.log(`🗑️ Cleared ${keys.length} cache entries completely`);

  // Force recalculate cache if FilterRulesViewer is open
  const event = new CustomEvent("cacheCleared");
  window.dispatchEvent(event);
};

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
