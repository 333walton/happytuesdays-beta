import React, { useState, useRef } from "react";
import GraphVisualizer from "../../GraphVisualizer/GraphVisualizer";
import { Hydra98Database } from "../../../neo4j/config";
import "./GraphExplorer.css";

const GraphExplorer = ({
  windowTitle = "Knowledge Graph Explorer",
  onClose,
  onMinimize,
  isMinimized = false,
  zIndex = 1000,
}) => {
  const [activeTab, setActiveTab] = useState("visualizer");
  const [queryResults, setQueryResults] = useState([]);
  const [customQuery, setCustomQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const db = useRef(new Hydra98Database());

  // Predefined queries for quick access
  const predefinedQueries = {
    "Desktop Apps": `
      MATCH (app:Component)
      WHERE app.name IN ['Desktop', 'Taskbar', 'Notepad', 'Paint', 'Calculator', 'DOOM']
      RETURN app.name, app.file, app.props
    `,
    "Component Dependencies": `
      MATCH (c1:Component)-[r:USES]->(c2:Component)
      RETURN c1.name as from, c2.name as to, type(r) as relationship
      LIMIT 20
    `,
    "File Structure": `
      MATCH (f:File)-[:CONTAINS]->(c:Component)
      RETURN f.path, collect(c.name) as components
      ORDER BY f.path
    `,
    "Hook Usage": `
      MATCH (c:Component)
      WHERE size(c.hooks) > 0
      RETURN c.name, c.hooks, c.file
      ORDER BY size(c.hooks) DESC
    `,
  };

  const executeQuery = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const results = await db.current.runQuery(query);
      setQueryResults(results);
      setActiveTab("results");
    } catch (err) {
      setError(`Query failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomQuery = async () => {
    if (!customQuery.trim()) return;
    await executeQuery(customQuery);
  };

  const exportResults = () => {
    if (queryResults.length === 0) return;

    const blob = new Blob([JSON.stringify(queryResults, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hydra98-query-results.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isMinimized) {
    return null; // Window is minimized, don't render content
  }

  return (
    <div className="graph-explorer-window" style={{ zIndex }}>
      {/* Window Title Bar */}
      <div className="win98-titlebar">
        <div className="titlebar-text">📊 {windowTitle}</div>
        <div className="titlebar-controls">
          <button className="win98-button titlebar-btn" onClick={onMinimize}>
            _
          </button>
          <button className="win98-button titlebar-btn" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        {["visualizer", "queries", "results", "help"].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "visualizer" && (
          <div className="visualizer-tab">
            <GraphVisualizer windowProps={{ style: { height: "100%" } }} />
          </div>
        )}

        {activeTab === "queries" && (
          <div className="queries-tab">
            <div className="queries-section">
              <h3>Predefined Queries</h3>
              <div className="predefined-queries">
                {Object.entries(predefinedQueries).map(([name, query]) => (
                  <div key={name} className="query-item">
                    <button
                      className="win98-button query-btn"
                      onClick={() => executeQuery(query)}
                      disabled={loading}
                    >
                      {name}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="custom-query-section">
              <h3>Custom Query</h3>
              <textarea
                className="query-textarea"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Enter your Cypher query here..."
                rows={6}
              />
              <div className="query-controls">
                <button
                  className="win98-button"
                  onClick={handleCustomQuery}
                  disabled={loading || !customQuery.trim()}
                >
                  {loading ? "⏳ Running..." : "▶️ Execute"}
                </button>
                <button
                  className="win98-button"
                  onClick={() => setCustomQuery("")}
                >
                  🗑️ Clear
                </button>
              </div>
            </div>

            {error && <div className="error-message">⚠️ {error}</div>}
          </div>
        )}

        {activeTab === "results" && (
          <div className="results-tab">
            <div className="results-header">
              <h3>Query Results ({queryResults.length} records)</h3>
              <button
                className="win98-button"
                onClick={exportResults}
                disabled={queryResults.length === 0}
              >
                💾 Export JSON
              </button>
            </div>

            <div className="results-container">
              {queryResults.length === 0 ? (
                <div className="no-results">
                  No results. Run a query from the Queries tab.
                </div>
              ) : (
                <div className="results-table">
                  <table className="win98-table">
                    <thead>
                      <tr>
                        {Object.keys(queryResults[0] || {}).map((key) => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResults.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, i) => (
                            <td key={i}>
                              {Array.isArray(value)
                                ? value.join(", ")
                                : typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "help" && (
          <div className="help-tab">
            <div className="help-content">
              <h3>🎯 Purpose</h3>
              <p>
                This Knowledge Graph Explorer helps analyze the Hydra98 codebase
                structure, component relationships, and dependencies. It's
                designed to assist with code understanding and refactoring
                decisions.
              </p>

              <h3>🔍 How to Use</h3>
              <ul>
                <li>
                  <strong>Visualizer:</strong> Interactive graph of your
                  codebase
                </li>
                <li>
                  <strong>Queries:</strong> Run predefined or custom Cypher
                  queries
                </li>
                <li>
                  <strong>Results:</strong> View and export query results as
                  JSON
                </li>
                <li>
                  <strong>Help:</strong> This documentation
                </li>
              </ul>

              <h3>📊 Graph Legend</h3>
              <div className="legend">
                <div className="legend-item">
                  <span className="legend-color component"></span>
                  <span>React Components</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color file"></span>
                  <span>Source Files</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color function"></span>
                  <span>Functions</span>
                </div>
              </div>

              <h3>🔗 Relationships</h3>
              <ul>
                <li>
                  <strong>USES:</strong> Component dependencies
                </li>
                <li>
                  <strong>CONTAINS:</strong> File contains component/function
                </li>
                <li>
                  <strong>DEPENDS_ON:</strong> Import dependencies
                </li>
              </ul>

              <h3>⚡ Quick Tips</h3>
              <ul>
                <li>
                  Use the predefined queries to quickly explore common patterns
                </li>
                <li>Export results to share findings with your team</li>
                <li>
                  Refresh the graph after code changes with "npm run
                  build-graph"
                </li>
                <li>
                  Use the visualizer's filter options to focus on specific areas
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphExplorer;
