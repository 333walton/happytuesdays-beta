// Clear all feed cache

localStorage.clear();

// Check cache size

const cacheSize = new Blob(Object.values(localStorage)).size;
console.log(`Cache size: ${(cacheSize / 1024).toFixed(2)} KB`);

// Force refresh current feed

document.querySelector('.refresh-button')?.click();

// Log all cached feeds

Object.keys(localStorage).filter(k => k.startsWith('feed\_')).forEach(k => {
const data = JSON.parse(localStorage.getItem(k));
console.log(k, data.data.length + ' items', new Date(data.timestamp));
});
