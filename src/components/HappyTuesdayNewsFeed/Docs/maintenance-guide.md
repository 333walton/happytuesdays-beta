# News Feed Maintenance Guide

## Regular Maintenance Tasks

### Weekly Tasks
- [ ] Check all feed sources for availability
- [ ] Monitor error logs for failing feeds
- [ ] Review feed content quality and relevance
- [ ] Update any broken RSS URLs
- [ ] Check NewsAPI usage (if using fallback)

### Monthly Tasks
- [ ] Audit feed sources for brand alignment
- [ ] Add new high-quality sources
- [ ] Remove inactive or low-quality feeds
- [ ] Review performance metrics
- [ ] Update category icons if needed

### Quarterly Tasks
- [ ] Comprehensive feed source review
- [ ] User feedback integration
- [ ] Performance optimization review
- [ ] Security audit of external sources

## Adding New RSS Feeds

1. **Validate the Feed**:
   ```javascript
   // Test in browser console
   const testFeed = async (url) => {
     try {
       const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
       const data = await response.json();
       console.log('Feed valid:', data.status === 'ok');
       console.log('Items:', data.items.length);
       return data;
     } catch (e) {
       console.error('Invalid feed:', e);
     }
   };
   
   testFeed('https://example.com/feed');
   ```

2. **Add to RSS Catalog**:
   ```javascript
   // In rssCatalog.js
   "subcategory-name": [
     // ... existing feeds
     "https://newsite.com/feed/", // ← Add here
   ]
   ```

3. **Test Integration**:
   - Clear cache for the category
   - Load the subcategory
   - Verify feed items appear correctly

## Troubleshooting Common Issues

### Feed Not Loading
1. Check browser console for CORS errors
2. Verify RSS URL is still valid
3. Test feed in RSS validator
4. Check if feed requires authentication

### Slow Performance
1. Check cache hit rate
2. Monitor parallel feed loading
3. Review number of items per feed
4. Consider implementing pagination

### Content Issues
1. HTML in descriptions: Update parser sanitization
2. Missing thumbnails: Check media:thumbnail parsing
3. Wrong dates: Verify timezone handling
4. Duplicate items: Check GUID uniqueness

## Feed Quality Guidelines

### High-Quality Feed Criteria
- ✅ Regular updates (daily/weekly)
- ✅ Full content in description
- ✅ Proper timestamps
- ✅ Unique GUIDs
- ✅ Media thumbnails included
- ✅ Clean, well-formatted content

### Red Flags to Avoid
- ❌ Infrequent updates (monthly+)
- ❌ Truncated content
- ❌ No timestamps
- ❌ Duplicate content
- ❌ Excessive ads/sponsored content
- ❌ Unreliable uptime

## RSS Feed Health Monitor

Create this utility to monitor feed health:

```javascript
// utils/feedHealthCheck.js
import { RSS_FEEDS } from './rssCatalog';
import Parser from 'rss-parser';

const parser = new Parser();

export async function checkFeedHealth() {
  const results = {};
  
  for (const [category, subcategories] of Object.entries(RSS_FEEDS)) {
    results[category] = {};
    
    for (const [subcategory, feeds] of Object.entries(subcategories)) {
      results[category][subcategory] = [];
      
      for (const feedUrl of feeds) {
        try {
          const startTime = Date.now();
          const feed = await parser.parseURL(feedUrl);
          const loadTime = Date.now() - startTime;
          
          results[category][subcategory].push({
            url: feedUrl,
            status: 'active',
            itemCount: feed.items.length,
            lastUpdate: feed.items[0]?.pubDate || 'unknown',
            loadTime: `${loadTime}ms`,
          });
        } catch (error) {
          results[category][subcategory].push({
            url: feedUrl,
            status: 'error',
            error: error.message,
          });
        }
      }
    }
  }
  
  return results;
}

// Run health check
checkFeedHealth().then(results => {
  console.log('Feed Health Report:', results);
  
  // Find problematic feeds
  const errors = [];
  Object.entries(results).forEach(([cat, subcats]) => {
    Object.entries(subcats).forEach(([subcat, feeds]) => {
      feeds.forEach(feed => {
        if (feed.status === 'error') {
          errors.push(`${cat}/${subcat}: ${feed.url} - ${feed.error}`);
        }
      });
    });
  });
  
  if (errors.length > 0) {
    console.error('Failed feeds:', errors);
  }
});
```

## Emergency Procedures

### All Feeds Down
1. Check internet connectivity
2. Verify CORS proxy (if used)
3. Enable NewsAPI fallback
4. Display cached content
5. Show maintenance message

### Mass Feed Failure
1. Check for RSS standard changes
2. Verify parser library updates
3. Test with different parser
4. Implement temporary static content

### Performance Crisis
1. Disable parallel loading temporarily
2. Increase cache duration
3. Reduce max items per feed
4. Implement request queuing

## Feed Source Recommendations

### Finding New Sources
1. **FeedSpot**: Directory of top blogs by category
2. **Alltop**: Aggregates top sites by topic
3. **Feedly**: Discover popular RSS feeds
4. **Reddit**: Check relevant subreddit sidebars
5. **GitHub Awesome Lists**: Curated feed collections

### Vetting Process
1. Subscribe to feed for 1 week
2. Monitor post frequency
3. Assess content quality
4. Check community engagement
5. Verify technical reliability

## Backup & Recovery

### Regular Backups
```javascript
// Backup current feed configuration
const backup = {
  date: new Date().toISOString(),
  version: '1.0',
  feeds: RSS_FEEDS,
  settings: {
    cacheTime: process.env.REACT_APP_RSS_CACHE_DURATION,
    maxItems: process.env.REACT_APP_MAX_FEED_ITEMS,
  }
};

// Save to backup file
console.log(JSON.stringify(backup, null, 2));
```

### Recovery Process
1. Restore rssCatalog.js from backup
2. Clear all cached feeds
3. Test each category
4. Monitor for errors
5. Notify users if needed