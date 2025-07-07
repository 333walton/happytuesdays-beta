import React, { useEffect, useRef, useState } from "react";
import NeoVis from "neovis.js";
import { Hydra98Database } from "../../neo4j/config";
import "./GraphVisualizer.css";

const GraphVisualizer = ({ windowProps = {} }) => {
  const visRef = useRef(null);
  const [viz, setViz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("components"); // 'components', 'files', 'apps', 'all'
  const db = useRef(new Hydra98Database());

  useEffect(() => {
    if (visRef.current) {
      initializeVisualization();
    }

    return () => {
      if (viz) {
        viz.clearNetwork();
      }
    };
  }, [viewMode]);

  const initializeVisualization = async () => {
    try {
      setLoading(true);
      setError(null);

      // Windows 98 themed configuration
      const config = {
        containerId: visRef.current.id,
        neo4j: {
          serverUrl: process.env.REACT_APP_NEO4J_URI || "bolt://localhost:7687",
          serverUser: process.env.REACT_APP_NEO4J_USERNAME || "neo4j",
          serverPassword: process.env.REACT_APP_NEO4J_PASSWORD || "password",
        },
        visConfig: {
          nodes: {
            borderWidth: 2,
            font: {
              face: "MS Sans Serif",
              size: 12,
              color: "#000000",
            },
          },
          edges: {
            arrows: {
              to: { enabled: true, scaleFactor: 1 },
            },
            color: "#848484",
            width: 2,
          },
          physics: {
            enabled: true,
            stabilization: { iterations: 100 },
          },
        },
        labels: getLabelsConfig(),
        relationships: getRelationshipsConfig(),
        initialCypher: getCypherQuery(),
      };

      const visualization = new NeoVis(config);
      visualization.render();
      setViz(visualization);
      setLoading(false);
    } catch (err) {
      setError(`Failed to load graph: ${err.message}`);
      setLoading(false);
    }
  };

  const getLabelsConfig = () => {
    const commonStyle = {
      font: { face: "MS Sans Serif", size: 12 },
      borderWidth: 2,
    };

    switch (viewMode) {
      case "components":
        return {
          Component: {
            ...commonStyle,
            color: "#008080", // Teal - like Windows 98 title bars
            caption: "name",
            size: "pagerank", // This will size nodes by importance
            // Remove community for now since it doesn't exist
          },
          File: {
            ...commonStyle,
            color: "#c0c0c0", // Silver
            caption: "name",
            size: 15,
          },
        };

      case "files":
        return {
          File: {
            ...commonStyle,
            color: "#ffff00", // Yellow - like folder icons
            caption: "name",
            size: 25,
          },
          Component: {
            ...commonStyle,
            color: "#008080",
            caption: "name",
            size: "pagerank", // This will size nodes by importance
          },
        };

      case "apps":
        return {
          Component: {
            ...commonStyle,
            color: function (node) {
              // Color code different types of Happy Tuesdays apps
              const name = node.properties.name;
              if (name.includes("Notepad")) return "#ffffff";
              if (name.includes("Paint")) return "#ff0000";
              if (name.includes("Doom") || name.includes("Game"))
                return "#800080";
              if (name.includes("Calculator")) return "#008000";
              if (name.includes("Desktop") || name.includes("Taskbar"))
                return "#000080";
              // Add colors for other game/app components
              if (name.includes("Minesweeper")) return "#808080";
              if (name.includes("Glider")) return "#00ffff";
              if (name.includes("StarWars")) return "#ffff00";
              if (name.includes("ASCIIMaze")) return "#ff00ff";
              return "#008080";
            },
            caption: "name",
            size: "pagerank", // This will size nodes by importance
          },
        };

      case "smart":
        return {
          Component: {
            ...commonStyle,
            color: function (node) {
              const colors = {
                page: "#1e90ff",
                app: "#ff6347",
                common: "#32cd32",
                hook: "#ffd700",
                context: "#9370db",
                component: "#20b2aa",
              };
              return colors[node.properties.componentType] || "#008080";
            },
            caption: "name",
            size: function (node) {
              // Size by complexity or connections
              const base = 20;
              const complexity = node.properties.complexity || 1;
              return Math.min(base + complexity * 2, 50);
            },
          },
          Hook: {
            ...commonStyle,
            color: "#ffd700",
            caption: "name",
            size: 15,
          },
        };

      case "all":
        return {
          Component: {
            ...commonStyle,
            color: "#008080",
            caption: "name",
            size: 15,
          },
          File: {
            ...commonStyle,
            color: "#c0c0c0",
            caption: "name",
            size: 10,
          },
          Function: {
            ...commonStyle,
            color: "#800080",
            caption: "name",
            size: 10,
          },
        };

      default:
        return {};
    }
  };

  const getRelationshipsConfig = () => {
    return {
      USES: {
        color: "#0000ff",
        caption: false,
        thickness: 3,
      },
      CONTAINS: {
        color: "#008000",
        caption: false,
        thickness: 2,
      },
      DEPENDS_ON: {
        color: "#ff0000",
        caption: false,
        thickness: 2,
      },
    };
  };

  const getCypherQuery = () => {
    switch (viewMode) {
      case "components":
        // Show ALL components with their relationships (increased limit)
        return "MATCH (c:Component)-[r]-(n) RETURN c, r, n LIMIT 100";
      case "files":
        return "MATCH (f:File)-[r:CONTAINS]->(c:Component) RETURN f, r, c";
      case "apps":
        // Show only main application components (windows that users interact with)
        return `MATCH (c:Component) 
                WHERE c.name IN ['Desktop', 'Taskbar', 'Notepad', 'Paint', 'Calculator', 
                                 'Doom', 'FileExplorer', 'Minesweeper', 'Glider', 
                                 'StarWars', 'ASCIIMaze', 'Terminal', 'MediaPlayer',
                                 'InternetExplorer', 'RecycleBin', 'ControlPanel',
                                 'ClippyAssistant', 'GraphVisualizer']
                OPTIONAL MATCH (c)-[r]-(related:Component)
                RETURN c, r, related`;
      case "smart":
        return `
          MATCH (c:Component)
          WHERE c.componentType IN ['page', 'app'] 
          OPTIONAL MATCH (c)-[r]-(related:Component)
          RETURN c, r, related
          UNION
          MATCH (c:Component)-[r:USES_HOOK]->(h:Hook)
          RETURN c, r, h
          LIMIT 150
        `;
      case "all":
        // Show EVERYTHING in the knowledge graph
        return "MATCH (n) OPTIONAL MATCH (n)-[r]-(m) RETURN n, r, m";
      default:
        return "MATCH (n)-[r]-(m) RETURN n, r, m LIMIT 25";
    }
  };

  const handleRefresh = () => {
    if (viz) {
      viz.reload();
    } else {
      initializeVisualization();
    }
  };

  const handleExportData = async () => {
    try {
      const data = await db.current.getComponentGraph();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hydra98-knowledge-graph.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to export data");
    }
  };

  return (
    <div className="graph-visualizer-container" style={windowProps.style}>
      {/* Windows 98 style header */}
      <div className="win98-header">
        <div className="win98-title">
          📊 Happy Tuesdays Knowledge Graph -{" "}
          {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
        </div>
        <div className="win98-controls">
          <button className="win98-button" onClick={handleRefresh}>
            🔄 Refresh
          </button>
          <button className="win98-button" onClick={handleExportData}>
            💾 Export
          </button>
        </div>
      </div>

      {/* View mode selector */}
      <div className="view-mode-selector">
        <div className="win98-radio-group">
          {["components", "files", "apps", "smart", "all"].map((mode) => (
            <label key={mode} className="win98-radio-label">
              <input
                type="radio"
                name="viewMode"
                value={mode}
                checked={viewMode === mode}
                onChange={(e) => setViewMode(e.target.value)}
                className="win98-radio"
              />
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Error display */}
      {error && <div className="win98-error">⚠️ {error}</div>}

      {/* Loading indicator */}
      {loading && (
        <div className="win98-loading">
          ⏳ Loading Happy Tuesdays knowledge graph...
        </div>
      )}

      {/* Main visualization area */}
      <div
        ref={visRef}
        id="hydra98-graph-viz"
        className="graph-visualization"
        style={{
          width: "100%",
          height: "calc(100% - 120px)",
          border: "2px inset #c0c0c0",
          backgroundColor: "#ffffff",
        }}
      />

      {/* Status bar */}
      <div className="win98-status-bar">
        <div className="status-section">Mode: {viewMode} | Ready</div>
        <div className="status-section">Neo4j Connected</div>
      </div>
    </div>
  );
};

export default GraphVisualizer;
// Note: This component is specifically for visualizing the Happy Tuesdays knowledge graph
// using NeoVis.js with a Windows 98 theme. It allows users to switch between different view modes (components, files, apps, all) and interact with the graph.
