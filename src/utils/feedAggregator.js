// src/utils/feedAggregator.js - SIMPLIFIED WORKING VERSION

// Cache configuration
const CACHE_DURATION =
  parseInt(process.env.REACT_APP_RSS_CACHE_DURATION) || 900000;
const MAX_ITEMS = 10;

// Mobile detection
const isMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

// Get API endpoint
const API_ENDPOINT =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001/api/feeds"
    : "/api/feeds";

console.log("Feed Aggregator initialized with endpoint:", API_ENDPOINT);

// In-memory cache
const memoryCache = new Map();

// Helper to get cached data
const getCachedFeed = (cacheKey) => {
  // Check memory cache first
  const memoryCached = memoryCache.get(cacheKey);
  if (memoryCached && Date.now() - memoryCached.timestamp < CACHE_DURATION) {
    console.log(`✅ Cache hit for ${cacheKey}`);
    return memoryCached.data;
  }

  // Check localStorage
  try {
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        memoryCache.set(cacheKey, parsed);
        console.log(`✅ LocalStorage cache hit for ${cacheKey}`);
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

  // Store in localStorage
  try {
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (e) {
    console.warn("Error writing to localStorage:", e);
  }
};

// Main fetch function - SIMPLIFIED VERSION
export async function fetchAndCacheFeed(category, subcategory = null) {
  const cacheKey = `feed_${category}${subcategory ? `_${subcategory}` : ""}`;

  console.log("📋 fetchAndCacheFeed called:", {
    category,
    subcategory,
    cacheKey,
  });

  // Check cache first
  const cached = getCachedFeed(cacheKey);
  if (cached && cached.length > 0) {
    console.log(`✅ Returning ${cached.length} cached items for ${cacheKey}`);
    return cached.slice(0, MAX_ITEMS);
  }

  console.log(`🔄 Fetching fresh data for ${category}/${subcategory || "all"}`);

  try {
    // Build request body - IMPORTANT: Don't send subcategory if it's null
    const requestBody = { category };
    if (subcategory) {
      requestBody.subcategory = subcategory;
    }

    console.log("📡 Sending request to:", API_ENDPOINT);
    console.log("📦 Request body:", requestBody);

    // Simple fetch without AbortController for now
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📨 Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log("✅ API Response received:", {
      itemCount: data?.items?.length || 0,
      hasError: !!data?.error,
      sampleItem: data?.items?.[0]?.title,
    });

    // Check for error in response
    if (data?.error) {
      console.error("❌ API returned error:", data.error);
      return [];
    }

    // Extract items from response
    let items = data?.items || [];

    if (items.length === 0) {
      console.warn("⚠️ API returned 0 items for", cacheKey);

      // Try to return expired cache if available
      try {
        const expiredCache = localStorage.getItem(cacheKey);
        if (expiredCache) {
          const expiredData = JSON.parse(expiredCache).data;
          console.log(
            "📦 Returning expired cache with",
            expiredData.length,
            "items"
          );
          return expiredData.slice(0, MAX_ITEMS);
        }
      } catch (e) {
        console.log("No expired cache available");
      }

      return [];
    }

    // Limit and cache successful results
    items = items.slice(0, MAX_ITEMS);
    storeInCache(cacheKey, items);
    console.log(`✅ Successfully cached ${items.length} items for ${cacheKey}`);

    return items;
  } catch (error) {
    console.error("❌ Feed fetch error:", {
      message: error.message,
      endpoint: API_ENDPOINT,
      category,
      subcategory,
    });

    // Try returning cached data even if expired
    try {
      const expiredCache = localStorage.getItem(cacheKey);
      if (expiredCache) {
        const expiredData = JSON.parse(expiredCache).data;
        console.log("📦 Returning expired cache after error");
        return expiredData.slice(0, MAX_ITEMS);
      }
    } catch (e) {
      console.log("No cache available");
    }

    return [];
  }
}

// Prefetch feeds for better UX
export async function prefetchFeeds(category) {
  if (isMobile()) {
    console.log("📱 Skipping prefetch on mobile");
    return;
  }

  console.log("🔮 Prefetching feeds for", category);
  fetchAndCacheFeed(category).catch((err) => {
    console.error("Prefetch failed:", err.message);
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
        localStorage.removeItem(key);
        keys.push(key);
      }
    }
    console.log(`🗑️ Cleared ${keys.length} cache entries for ${category}`);
  } catch (e) {
    console.warn("Error clearing category cache:", e);
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
      localStorage.removeItem(key);
    });

    console.log(`🗑️ Cleared all ${keys.length} feed cache entries`);
  } catch (e) {
    console.warn("Error clearing all cache:", e);
  }
}

// Debug utilities
window.testFeedFetch = async () => {
  console.log("Testing direct fetch to:", API_ENDPOINT);
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: "tech" }),
    });
    const data = await response.json();
    console.log("Direct fetch result:", data);
    return data;
  } catch (e) {
    console.error("Direct fetch failed:", e);
  }
};

window.debugFeedCache = {
  memoryCache,
  clearAll: clearAllCache,
  clearCategory: clearCategoryCache,
  testFetch: () => window.testFeedFetch(),
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
};
