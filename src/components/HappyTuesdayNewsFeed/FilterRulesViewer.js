import React, { useState, useEffect } from "react";

const TOTAL_CACHE_LIMIT = 5242880; // 5MB default

// Helper to recalculate the cache size in bytes
function recalculateCacheUsage() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      total += (localStorage.getItem(key).length + key.length) * 2; // 2 bytes/char
    }
  }
  return total;
}

const FilterRulesViewer = () => {
  const [rules, setRules] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [cacheInfo, setCacheInfo] = useState({
    used: recalculateCacheUsage(),
    total: TOTAL_CACHE_LIMIT,
  });

  // Always recalculate cache usage on expand and after clear
  useEffect(() => {
    setCacheInfo((old) => ({ ...old, used: recalculateCacheUsage() }));
  }, [isExpanded]);

  // Manual recalc button (optional for dev/debug)
  const handleRecalculate = () => {
    setCacheInfo((old) => ({ ...old, used: recalculateCacheUsage() }));
  };

  const fetchFilterRules = async () => {
    try {
      const endpoint =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3001/api/filter-rules"
          : "/api/filter-rules";
      const response = await fetch(endpoint);
      const data = await response.json();
      setRules(data.rules);
      setStats(data.stats);
      setLoading(false);
    } catch (err) {
      setError("Failed to load filter rules");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterRules();
  }, []);

  const handleClearFeedCache = () => {
    let keysRemoved = 0;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith("feed")) {
        localStorage.removeItem(key);
        keysRemoved++;
      }
    }
    setCacheInfo((old) => ({ ...old, used: recalculateCacheUsage() }));
    if (keysRemoved === 0) {
      alert("No feed cache keys found to clear!");
    }
  };

  const getRuleIcon = (enabled, value) => {
    if (!enabled || value === false) return "❌";
    if (value === true) return "✅";
    if (typeof value === "number") return "🔢";
    return "📝";
  };

  const getRuleColor = (category) => {
    const colors = {
      TITLE_RULES: "#3498db",
      CONTENT_RULES: "#2ecc71",
      SOURCE_RULES: "#e74c3c",
      AGE_RULES: "#f39c12",
      THUMBNAIL_RULES: "#9b59b6",
      DEDUPLICATION: "#1abc9c",
      LIMITS: "#34495e",
    };
    return colors[category] || "#95a5a6";
  };

  if (loading) {
    return (
      <div className="filter-rules-viewer" style={styles.container}>
        <div style={styles.loading}>Loading filter rules...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="filter-rules-viewer" style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className="filter-rules-viewer" style={styles.container}>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          ...styles.toggleButton,
          ...(isExpanded ? styles.toggleButtonExpanded : {}),
        }}
        title="View Active Filter Rules"
      >
        {isExpanded ? "✖️" : "🔍"} Filters
      </button>
      {/* Expandable Panel */}
      {isExpanded && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <h3 style={styles.title}>📋 Active Filter Rules</h3>
            <button
              onClick={() => setIsExpanded(false)}
              style={styles.closeButton}
            >
              ✖️
            </button>
          </div>

          {/* Cache usage meter */}
          <div style={styles.cacheSection}>
            <h4 style={styles.sectionTitle}>🗄️ Cache Usage</h4>
            <div style={styles.cacheInfoRow}>
              <span style={styles.cacheLabel}>
                {(cacheInfo.used / 1024).toFixed(1)} KB /{" "}
                {(cacheInfo.total / 1024 / 1024).toFixed(2)} MB &nbsp;(
                {Math.round((cacheInfo.used / cacheInfo.total) * 100)}%)
              </span>
              <button
                onClick={handleClearFeedCache}
                style={styles.clearCacheButton}
                type="button"
              >
                🧹 Clear Cache
              </button>
              <button
                onClick={handleRecalculate}
                style={{ ...styles.clearCacheButton, background: "#3498db" }}
                type="button"
              >
                🔄 Recalc
              </button>
            </div>
            <div style={styles.cacheBarContainer}>
              <div
                style={{
                  ...styles.cacheBar,
                  width: `${Math.min(
                    100,
                    (cacheInfo.used / cacheInfo.total) * 100
                  )}%`,
                  backgroundColor:
                    cacheInfo.used / cacheInfo.total > 0.8
                      ? "#e74c3c"
                      : cacheInfo.used / cacheInfo.total > 0.6
                      ? "#f39c12"
                      : "#2ecc71",
                }}
              />
            </div>
          </div>

          {/* Stats Summary */}
          {stats && (
            <div style={styles.statsSection}>
              <h4 style={styles.sectionTitle}>📊 Current Session Stats</h4>
              <div style={styles.statsGrid}>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Processed:</span>
                  <span style={styles.statValue}>
                    {stats.totalProcessed || 0}
                  </span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Passed:</span>
                  <span style={styles.statValue}>{stats.passed || 0}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Filter Rate:</span>
                  <span style={styles.statValue}>
                    {stats.filterRate || "0%"}
                  </span>
                </div>
              </div>

              {stats.filtered && Object.keys(stats.filtered).length > 0 && (
                <div style={styles.filterReasons}>
                  <h5 style={styles.subTitle}>Filter Reasons:</h5>
                  <div style={styles.reasonsList}>
                    {Object.entries(stats.filtered).map(([reason, count]) => (
                      <div key={reason} style={styles.reasonItem}>
                        <span style={styles.reasonName}>
                          {reason.replace(/_/g, " ")}:
                        </span>
                        <span style={styles.reasonCount}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.filteredSamples &&
                Object.keys(stats.filteredSamples).length > 0 && (
                  <div style={styles.filterSamples}>
                    <h5 style={styles.subTitle}>Filter Samples:</h5>
                    <div style={styles.samplesList}>
                      {Object.entries(stats.filteredSamples).map(
                        ([reason, samples]) => (
                          <div key={reason} style={styles.sampleReasonBlock}>
                            <div style={styles.reasonName}>
                              {reason.replace(/_/g, " ")}:
                            </div>
                            <ul style={styles.samplesUl}>
                              {samples.map((sample, idx) => (
                                <li key={idx} style={styles.sampleLi}>
                                  {sample}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Filter Rules */}
          <div style={styles.rulesSection}>
            <h4 style={styles.sectionTitle}>🛡️ Filter Rules</h4>
            {rules &&
              Object.entries(rules).map(([category, categoryRules]) => (
                <div key={category} style={styles.category}>
                  <h5
                    style={{
                      ...styles.categoryTitle,
                      color: getRuleColor(category),
                    }}
                  >
                    {category.replace(/_/g, " ")}
                  </h5>
                  <div style={styles.rulesList}>
                    {Object.entries(categoryRules).map(([ruleName, rule]) => (
                      <div key={ruleName} style={styles.ruleItem}>
                        <span style={styles.ruleIcon}>
                          {getRuleIcon(rule.enabled, rule.value)}
                        </span>
                        <div style={styles.ruleDetails}>
                          <div style={styles.ruleName}>
                            {ruleName.replace(/_/g, " ").toLowerCase()}
                          </div>
                          <div style={styles.ruleDescription}>
                            {rule.description}
                            {typeof rule.value === "number" && (
                              <span style={styles.ruleValue}>
                                {" "}
                                ({rule.value})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Legend */}
          <div style={styles.legend}>
            <div style={styles.legendTitle}>Legend:</div>
            <div style={styles.legendItems}>
              <span>✅ Active</span>
              <span>❌ Disabled</span>
              <span>🔢 Numeric Value</span>
              <span>📝 Text Rule</span>
            </div>
          </div>

          {/* Refresh Button */}
          <button onClick={fetchFilterRules} style={styles.refreshButton}>
            🔄 Refresh Stats
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 9999,
    fontFamily: '"Courier New", monospace',
  },
  toggleButton: {
    backgroundColor: "#2c2416",
    color: "#f5f2e8",
    border: "2px solid #e74c3c",
    borderRadius: "8px",
    padding: "10px 15px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "4px 4px 0 #2c2416",
    transition: "all 0.3s ease",
  },
  toggleButtonExpanded: {
    backgroundColor: "#e74c3c",
    color: "#fff",
  },
  panel: {
    position: "absolute",
    bottom: "60px",
    right: "0",
    width: "400px",
    maxHeight: "70vh",
    backgroundColor: "#f5f2e8",
    border: "3px solid #2c2416",
    borderRadius: "8px",
    boxShadow: "8px 8px 0 #2c2416",
    overflow: "auto",
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "2px dashed #2c2416",
    paddingBottom: "10px",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    color: "#2c2416",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    padding: "5px",
  },
  statsSection: {
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#fff",
    borderRadius: "6px",
    border: "2px solid #2c2416",
  },
  sectionTitle: {
    margin: "0 0 10px 0",
    fontSize: "14px",
    color: "#e74c3c",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginBottom: "15px",
  },
  statItem: {
    textAlign: "center",
    padding: "8px",
    backgroundColor: "#f5f2e8",
    borderRadius: "4px",
  },
  statLabel: {
    display: "block",
    fontSize: "11px",
    color: "#666",
    marginBottom: "2px",
  },
  statValue: {
    display: "block",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#2c2416",
  },
  filterReasons: {
    marginTop: "10px",
  },
  subTitle: {
    margin: "0 0 5px 0",
    fontSize: "12px",
    color: "#666",
  },
  reasonsList: {
    maxHeight: "100px",
    overflow: "auto",
    fontSize: "11px",
  },
  reasonItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "2px 5px",
    backgroundColor: "#f9f9f9",
    marginBottom: "2px",
    borderRadius: "2px",
  },
  reasonName: {
    color: "#666",
    fontSize: "10px",
  },
  reasonCount: {
    fontWeight: "bold",
    color: "#e74c3c",
  },
  rulesSection: {
    marginBottom: "20px",
  },
  category: {
    marginBottom: "15px",
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
  categoryTitle: {
    margin: "0 0 8px 0",
    fontSize: "13px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  rulesList: {
    fontSize: "12px",
  },
  ruleItem: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: "6px",
    padding: "4px",
    backgroundColor: "#f9f9f9",
    borderRadius: "4px",
  },
  ruleIcon: {
    marginRight: "8px",
    fontSize: "14px",
  },
  ruleDetails: {
    flex: 1,
  },
  ruleName: {
    fontWeight: "bold",
    textTransform: "capitalize",
    fontSize: "11px",
    color: "#2c2416",
  },
  ruleDescription: {
    fontSize: "10px",
    color: "#666",
    marginTop: "2px",
  },
  ruleValue: {
    fontWeight: "bold",
    color: "#e74c3c",
  },
  legend: {
    marginTop: "15px",
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    border: "1px dashed #ccc",
    fontSize: "11px",
  },
  legendTitle: {
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#666",
  },
  legendItems: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    color: "#666",
  },
  refreshButton: {
    width: "100%",
    marginTop: "15px",
    padding: "10px",
    backgroundColor: "#2c2416",
    color: "#f5f2e8",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  loading: {
    padding: "20px",
    backgroundColor: "#fff",
    border: "2px solid #2c2416",
    borderRadius: "8px",
    boxShadow: "4px 4px 0 #2c2416",
  },
  error: {
    padding: "20px",
    backgroundColor: "#fee",
    border: "2px solid #e74c3c",
    borderRadius: "8px",
    color: "#e74c3c",
    boxShadow: "4px 4px 0 #2c2416",
  },
  cacheSection: {
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#fff",
    borderRadius: "6px",
    border: "2px solid #2c2416",
  },
  cacheInfoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  cacheLabel: {
    fontSize: "13px",
    color: "#2c2416",
  },
  clearCacheButton: {
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    padding: "6px 10px",
    cursor: "pointer",
    marginLeft: "15px",
  },
  cacheBarContainer: {
    height: "12px",
    backgroundColor: "#eee",
    borderRadius: "6px",
    width: "100%",
    marginTop: "2px",
    overflow: "hidden",
  },
  cacheBar: {
    height: "100%",
    borderRadius: "6px",
    transition: "width 0.3s",
  },
};

// Mobile responsive adjustments
if (window.innerWidth < 768) {
  styles.panel.width = "90vw";
  styles.panel.right = "5vw";
  styles.panel.maxHeight = "60vh";
}

export default FilterRulesViewer;
