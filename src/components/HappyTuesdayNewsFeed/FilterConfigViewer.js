import React, { useState, useEffect } from "react";

const FilterConfigViewer = () => {
  const [configs, setConfigs] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("tech");
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllConfigs();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchSpecificConfig(selectedCategory, selectedSubcategory);
    }
  }, [selectedCategory, selectedSubcategory]);

  const fetchAllConfigs = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/filter-configs");
      const data = await response.json();
      setConfigs(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch configs:", error);
      setLoading(false);
    }
  };

  const fetchSpecificConfig = async (category, subcategory) => {
    try {
      const url = subcategory
        ? `http://localhost:3001/api/filter-config/${category}/${subcategory}`
        : `http://localhost:3001/api/filter-config/${category}`;
      const response = await fetch(url);
      const data = await response.json();
      setCurrentConfig(data.config);
    } catch (error) {
      console.error("Failed to fetch specific config:", error);
    }
  };

  const categories = {
    tech: [
      "ai-machine-learning",
      "martech-adtech",
      "web-dev-devops",
      "cybersecurity-privacy",
      "blockchain-web3",
    ],
    builder: [
      "startup-stories",
      "productivity-hacks",
      "automation-no-code",
      "project-management",
      "momentum-mindset",
    ],
    art: [
      "generative-ai-art",
      "ui-ux-trends",
      "color-typography",
      "animation-motion",
      "tutorials-walkthroughs",
    ],
    gaming: [
      "daily-roundup",
      "pro-guides-tips",
      "retro-gaming",
      "indie-spotlights",
      "collectors-hub",
    ],
  };

  const getRuleColor = (value) => {
    if (value === false) return "#e74c3c";
    if (value === true) return "#27ae60";
    if (typeof value === "number") return "#3498db";
    return "#95a5a6";
  };

  if (loading) {
    return <div style={styles.container}>Loading filter configurations...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📋 Filter Configuration Viewer</h2>

      {/* Category Selector */}
      <div style={styles.selectorSection}>
        <div style={styles.categoryButtons}>
          {Object.keys(categories).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedSubcategory(null);
              }}
              style={{
                ...styles.categoryButton,
                ...(selectedCategory === cat ? styles.activeButton : {}),
              }}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Subcategory Selector */}
        {selectedCategory && (
          <div style={styles.subcategorySection}>
            <button
              onClick={() => setSelectedSubcategory(null)}
              style={{
                ...styles.subcategoryButton,
                ...(selectedSubcategory === null ? styles.activeSubButton : {}),
              }}
            >
              All {selectedCategory}
            </button>
            {categories[selectedCategory].map((subcat) => (
              <button
                key={subcat}
                onClick={() => setSelectedSubcategory(subcat)}
                style={{
                  ...styles.subcategoryButton,
                  ...(selectedSubcategory === subcat
                    ? styles.activeSubButton
                    : {}),
                }}
              >
                {subcat.replace(/-/g, " ")}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Configuration Display */}
      {currentConfig && (
        <div style={styles.configDisplay}>
          <h3 style={styles.configTitle}>
            Active Rules: {selectedCategory}
            {selectedSubcategory &&
              ` / ${selectedSubcategory.replace(/-/g, " ")}`}
          </h3>

          {Object.entries(currentConfig).map(([ruleGroup, rules]) => (
            <div key={ruleGroup} style={styles.ruleGroup}>
              <h4 style={styles.ruleGroupTitle}>
                {ruleGroup.replace(/_/g, " ")}
              </h4>
              <div style={styles.rulesList}>
                {Object.entries(rules).map(([ruleName, value]) => (
                  <div key={ruleName} style={styles.ruleItem}>
                    <span style={styles.ruleName}>
                      {ruleName.replace(/_/g, " ")}:
                    </span>
                    <span
                      style={{
                        ...styles.ruleValue,
                        color: getRuleColor(value),
                      }}
                    >
                      {typeof value === "boolean" ? (value ? "✓" : "✗") : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comparison Table */}
      <div style={styles.comparisonSection}>
        <h3 style={styles.sectionTitle}>Quick Comparison</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Rule</th>
              <th style={styles.th}>Tech</th>
              <th style={styles.th}>Builder</th>
              <th style={styles.th}>Art</th>
              <th style={styles.th}>Gaming</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>Min Title Length</td>
              <td style={styles.td}>10</td>
              <td style={{ ...styles.td, color: "#27ae60" }}>8</td>
              <td style={{ ...styles.td, color: "#27ae60" }}>8</td>
              <td style={{ ...styles.td, color: "#27ae60" }}>8</td>
            </tr>
            <tr>
              <td style={styles.td}>Min Description</td>
              <td style={styles.td}>50</td>
              <td style={{ ...styles.td, color: "#27ae60" }}>30</td>
              <td style={{ ...styles.td, color: "#3498db" }}>40</td>
              <td style={{ ...styles.td, color: "#3498db" }}>40</td>
            </tr>
            <tr>
              <td style={styles.td}>Thumbnail Required</td>
              <td style={styles.td}>✓</td>
              <td style={{ ...styles.td, color: "#e74c3c" }}>✗</td>
              <td style={styles.td}>✓</td>
              <td style={styles.td}>✓</td>
            </tr>
            <tr>
              <td style={styles.td}>Max Age (days)</td>
              <td style={styles.td}>7</td>
              <td style={{ ...styles.td, color: "#27ae60" }}>14</td>
              <td style={styles.td}>7</td>
              <td style={styles.td}>7</td>
            </tr>
            <tr>
              <td style={styles.td}>Quality Check</td>
              <td style={styles.td}>✓</td>
              <td style={{ ...styles.td, color: "#e74c3c" }}>✗</td>
              <td style={{ ...styles.td, color: "#e74c3c" }}>✗</td>
              <td style={{ ...styles.td, color: "#e74c3c" }}>✗</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "monospace",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
    color: "#2c3e50",
  },
  selectorSection: {
    marginBottom: "30px",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  categoryButtons: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },
  categoryButton: {
    padding: "10px 20px",
    border: "2px solid #3498db",
    backgroundColor: "white",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.3s",
  },
  activeButton: {
    backgroundColor: "#3498db",
    color: "white",
  },
  subcategorySection: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  subcategoryButton: {
    padding: "6px 12px",
    border: "1px solid #95a5a6",
    backgroundColor: "white",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    transition: "all 0.3s",
  },
  activeSubButton: {
    backgroundColor: "#34495e",
    color: "white",
    borderColor: "#34495e",
  },
  configDisplay: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  configTitle: {
    fontSize: "18px",
    marginBottom: "15px",
    color: "#2c3e50",
    borderBottom: "2px solid #ecf0f1",
    paddingBottom: "10px",
  },
  ruleGroup: {
    marginBottom: "20px",
  },
  ruleGroupTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: "10px",
    textTransform: "uppercase",
  },
  rulesList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "10px",
  },
  ruleItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    fontSize: "12px",
  },
  ruleName: {
    color: "#7f8c8d",
    textTransform: "capitalize",
  },
  ruleValue: {
    fontWeight: "bold",
  },
  comparisonSection: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: "18px",
    marginBottom: "15px",
    color: "#2c3e50",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "10px",
    backgroundColor: "#34495e",
    color: "white",
    textAlign: "left",
    fontSize: "12px",
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #ecf0f1",
    fontSize: "12px",
  },
};

export default FilterConfigViewer;
