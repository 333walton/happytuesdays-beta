import React, { Component } from "react";
import Window from "../../tools/Window";
import GraphVisualizer from "../../GraphVisualizer/GraphVisualizer";
import { Hydra98Database } from "../../../neo4j/config";
import { folderProgram16 } from "../../../icons";
import { WindowProgram } from "packard-belle";
import "./GraphExplorer.css";

class GraphExplorer extends Component {
  static defaultProps = {
    data: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      activeTab: "visualizer",
      queryResults: [],
      customQuery: "",
      loading: false,
      error: null,
    };
    this.db = new Hydra98Database();
  }

  // Predefined queries for quick access
  predefinedQueries = {
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

  setActiveTab = (tab) => {
    this.setState({ activeTab: tab });
  };

  executeQuery = async (query) => {
    this.setState({ loading: true, error: null });
    try {
      const results = await this.db.runQuery(query);
      this.setState({
        queryResults: results,
        activeTab: "results",
        loading: false,
      });
    } catch (err) {
      this.setState({
        error: `Query failed: ${err.message}`,
        loading: false,
      });
    }
  };

  handleCustomQuery = async () => {
    if (!this.state.customQuery.trim()) return;
    await this.executeQuery(this.state.customQuery);
  };

  exportResults = () => {
    if (this.state.queryResults.length === 0) return;

    const blob = new Blob([JSON.stringify(this.state.queryResults, null, 2)], {
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

  render() {
    if (process.env.NODE_ENV === "production") {
      return null; // Don't render anything in production
    }
    const { activeTab, queryResults, customQuery, loading, error } = this.state;

    console.log("GraphExplorer rendering...", { activeTab, loading });

    return (
      <Window
        {...this.props}
        icon={folderProgram16}
        title="Knowledge Graph Explorer"
        className="GraphExplorer"
        resizable={true}
        minHeight={300}
        minWidth={300}
        maxHeight={window.innerHeight - 50}
        maxWidth={window.innerWidth - 50}
        maximizeOnOpen
        Component={WindowProgram}
      >
        <div className="graph-explorer-content">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            {["visualizer", "queries", "results", "help"].map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? "active" : ""}`}
                onClick={() => this.setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "visualizer" && (
              <div className="visualizer-tab">
                <GraphVisualizer
                  windowProps={{
                    style: {
                      height: "100%",
                      width: "100%",
                      maxHeight: "100%",
                      maxWidth: "100%",
                      overflow: "hidden",
                    },
                  }}
                />
              </div>
            )}

            {activeTab === "queries" && (
              <div className="queries-tab">
                <div className="queries-section">
                  <h3>Predefined Queries</h3>
                  <div className="predefined-queries">
                    {Object.entries(this.predefinedQueries).map(
                      ([name, query]) => (
                        <div key={name} className="query-item">
                          <button
                            className="win98-button query-btn"
                            onClick={() => this.executeQuery(query)}
                            disabled={loading}
                          >
                            {name}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="custom-query-section">
                  <h3>Custom Query</h3>
                  <textarea
                    className="query-textarea"
                    value={customQuery}
                    onChange={(e) =>
                      this.setState({ customQuery: e.target.value })
                    }
                    placeholder="Enter your Cypher query here..."
                    rows={6}
                  />
                  <div className="query-controls">
                    <button
                      className="win98-button"
                      onClick={this.handleCustomQuery}
                      disabled={loading || !customQuery.trim()}
                    >
                      {loading ? "⏳ Running..." : "▶️ Execute"}
                    </button>
                    <button
                      className="win98-button"
                      onClick={() => this.setState({ customQuery: "" })}
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
                    onClick={this.exportResults}
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
                    This Knowledge Graph Explorer helps analyze the Happy
                    Tuesdays codebase structure, component relationships, and
                    dependencies.
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
                  </div>

                  <h3>⚡ Quick Tips</h3>
                  <ul>
                    <li>Use predefined queries to explore common patterns</li>
                    <li>Export results to share findings with your team</li>
                    <li>Refresh the graph with "npm run build-graph"</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </Window>
    );
  }
}

export default GraphExplorer;
