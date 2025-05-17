import React, { useState, useEffect, useContext } from "react";
import { SettingsContext } from "../../contexts";
import CustomWindow from "../CustomWindow";
import "./_styles.scss";

const ClippyAssistant = (props) => {
  const { id, zIndex, isActive, moveToTop, onClose, onMinimize, minimized } =
    props;

  const settingsContext = useContext(SettingsContext);
  const [clippyLoaded, setClippyLoaded] = useState(false);
  const [agent, setAgent] = useState(null);
  const [agentName, setAgentName] = useState("Clippy");
  const [message, setMessage] = useState("");
  const [loadingError, setLoadingError] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState("Starting");

  // Use the complete CDN paths for all resources
  const CLIPPY_JS_URL =
    "https://cdn.jsdelivr.net/gh/clippyjs/clippy.js@master/build/clippy.min.js";
  const CLIPPY_CSS_URL =
    "https://cdn.jsdelivr.net/gh/clippyjs/clippy.js@master/build/clippy.css";
  const JQUERY_URL = "https://code.jquery.com/jquery-3.6.0.min.js";

  // Add mapping for agent data URLs
  const AGENT_PATH =
    "https://cdn.jsdelivr.net/gh/clippyjs/clippy.js@master/agents/";

  // Load Clippy.js scripts and CSS with enhanced error handling
  useEffect(() => {
    setLoadingStatus("Initializing");

    // Only load if not already loaded
    if (!window.clippy && !document.getElementById("clippy-css")) {
      console.log("Starting to load Clippy resources...");
      setLoadingStatus("Loading CSS");

      // Load CSS
      const link = document.createElement("link");
      link.id = "clippy-css";
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = CLIPPY_CSS_URL;
      document.head.appendChild(link);
      console.log("Clippy CSS added to head");

      // Override the agent path to use our CDN path
      // This is a crucial step to make sure Clippy.js finds the agent resources
      const overrideAgentPath = () => {
        if (window.clippy) {
          console.log("Setting custom agent path:", AGENT_PATH);
          window.clippy.BASE_PATH = AGENT_PATH;
          setLoadingStatus("Agent path set");
        }
      };

      // Load jQuery if not present (Clippy.js requires it)
      const loadClippyJS = () => {
        console.log("Loading Clippy.js...");
        setLoadingStatus("Loading Clippy.js");
        const script = document.createElement("script");
        script.id = "clippy-js";
        script.src = CLIPPY_JS_URL;
        script.onload = () => {
          console.log("Clippy.js loaded successfully");
          setLoadingStatus("Clippy.js loaded");
          overrideAgentPath();
          setClippyLoaded(true);
        };
        script.onerror = (err) => {
          console.error("Error loading Clippy.js:", err);
          setLoadingStatus("Error loading Clippy.js");
          setLoadingError("Failed to load Clippy.js script");
        };
        document.body.appendChild(script);
      };

      if (!window.jQuery) {
        console.log("jQuery not found, loading it first...");
        setLoadingStatus("Loading jQuery");
        const jqueryScript = document.createElement("script");
        jqueryScript.id = "jquery-js";
        jqueryScript.src = JQUERY_URL;
        jqueryScript.onload = () => {
          console.log("jQuery loaded successfully");
          setLoadingStatus("jQuery loaded");
          loadClippyJS();
        };
        jqueryScript.onerror = (err) => {
          console.error("Error loading jQuery:", err);
          setLoadingStatus("Error loading jQuery");
          setLoadingError("Failed to load jQuery");
        };
        document.body.appendChild(jqueryScript);
      } else {
        console.log("jQuery already loaded, proceeding with Clippy.js");
        setLoadingStatus("jQuery already loaded");
        loadClippyJS();
      }
    } else if (window.clippy) {
      console.log("Clippy already available in window");
      setLoadingStatus("Clippy already available");
      setClippyLoaded(true);
    }

    return () => {
      // Cleanup function
      if (agent) {
        console.log("Cleaning up Clippy agent");
        agent.hide(true);
      }
    };
  }, []);

  // Initialize Clippy agent once scripts are loaded with better debugging
  useEffect(() => {
    if (clippyLoaded && window.clippy && !agent) {
      console.log(`Attempting to load agent: ${agentName.toLowerCase()}`);
      setLoadingStatus(`Loading ${agentName} agent`);

      // Log what agents are available
      if (window.clippy.agents) {
        console.log("Available agents:", window.clippy.agents);
      }

      try {
        window.clippy.load(
          agentName.toLowerCase(),
          (loadedAgent) => {
            console.log("Agent loaded successfully:", loadedAgent);
            setLoadingStatus(`${agentName} loaded successfully`);
            setAgent(loadedAgent);

            // Make sure agent is visible
            loadedAgent.show();

            // Position agent in a visible area of screen
            console.log("Positioning agent");
            loadedAgent.moveTo(300, 300);

            // Show initial greeting
            console.log("Making agent speak");
            loadedAgent.speak(
              "Hello! I'm " + agentName + ". Need help with Windows 98?"
            );

            // Perform animation
            console.log("Animating agent");
            loadedAgent.animate();
          },
          (error) => {
            // This is the error callback for clippy.load
            console.error("Error loading Clippy agent:", error);
            setLoadingStatus(`Error loading ${agentName}`);
            setLoadingError(`Failed to load ${agentName} agent: ${error}`);
          }
        );
      } catch (err) {
        console.error("Exception trying to load Clippy agent:", err);
        setLoadingStatus(`Exception loading ${agentName}`);
        setLoadingError(`Exception: ${err.message}`);
      }
    }
  }, [clippyLoaded, agentName, agent]);

  // Handle message sending
  const handleSendMessage = () => {
    if (agent && message.trim() !== "") {
      agent.speak(message);
      setMessage("");
    }
  };

  // Change agent
  const changeAgent = (name) => {
    if (agent) {
      agent.hide(true);
      setAgent(null); // Reset agent so we create a new one
    }
    setAgentName(name);
  };

  // Handle predefined actions
  const performAction = (action) => {
    if (!agent) {
      console.log("No agent available for action:", action);
      return;
    }

    console.log("Performing action:", action);
    switch (action) {
      case "wave":
        agent.animate();
        agent.speak("Hello there!");
        break;
      case "search":
        agent.play("Searching");
        agent.speak("What would you like to search for?");
        break;
      case "write":
        agent.play("Writing");
        agent.speak("Let me write that down for you...");
        break;
      case "explain":
        agent.play("GetAttention");
        agent.speak(
          "Windows 98 was released on June 25, 1998. It featured the Active Desktop and better system performance."
        );
        break;
      default:
        agent.animate();
    }
  };

  // Help button handler for CustomWindow
  const handleHelp = () => {
    if (agent) {
      agent.play("GetAttention");
      agent.speak(
        "Need some help with this window? Click one of the action buttons below!"
      );
    }
  };

  // Force agent to show - try to fix visibility issues
  const forceShowAgent = () => {
    if (agent) {
      console.log("Forcing agent to show");
      agent.show();
      agent.moveTo(300, 300);
      agent.speak("Can you see me now?");
      agent.animate();
    } else {
      console.log("No agent available to show");
      setLoadingStatus("Attempting to reload agent");
      if (clippyLoaded && window.clippy) {
        console.log("Attempting to reload agent");
        window.clippy.load(agentName.toLowerCase(), (loadedAgent) => {
          setAgent(loadedAgent);
          loadedAgent.show();
          loadedAgent.moveTo(300, 300);
          loadedAgent.speak("How about now?");
        });
      }
    }
  };

  return (
    <CustomWindow
      title="Office Assistant"
      onClose={onClose}
      id={id}
      zIndex={zIndex}
      isActive={isActive}
      moveToTop={moveToTop}
      onMinimize={onMinimize}
      minimized={minimized}
      initialWidth={300}
      initialHeight={400}
      icon={props.icon}
      onHelp={handleHelp}
      showHelpButton={true}
    >
      <div className="clippy-container">
        <div className="clippy-controls">
          <div className="agent-selector">
            <label>Select Assistant:</label>
            <select
              value={agentName}
              onChange={(e) => changeAgent(e.target.value)}
            >
              <option value="Clippy">Clippy</option>
              <option value="Merlin">Merlin</option>
              <option value="Rover">Rover</option>
              <option value="Links">Links</option>
            </select>
          </div>

          <div className="action-buttons">
            <button onClick={() => performAction("wave")}>Wave</button>
            <button onClick={() => performAction("search")}>Search</button>
            <button onClick={() => performAction("write")}>Write</button>
            <button onClick={() => performAction("explain")}>
              Explain Win98
            </button>
          </div>

          <div className="action-buttons">
            <button
              onClick={forceShowAgent}
              style={{ gridColumn: "span 2", fontWeight: "bold" }}
            >
              Make Assistant Visible
            </button>
          </div>

          <div className="message-input">
            <input
              type="text"
              placeholder="Type a message for the assistant..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>

        <div className="clippy-info">
          <p>Office Assistant is ready to help you with Windows 98.</p>

          <p className="clippy-status">
            <strong>Loading Status:</strong> {loadingStatus}
          </p>

          {loadingError && (
            <p className="clippy-error">
              <strong>Error:</strong> {loadingError}
            </p>
          )}

          <p className="clippy-status">
            <strong>Status:</strong>{" "}
            {clippyLoaded ? "Scripts loaded" : "Loading scripts..."}
            {agent ? ", Assistant ready" : ", Assistant not initialized"}
          </p>

          <p className="clippy-tip">
            <strong>Tip:</strong> If you don't see the assistant, try clicking
            "Make Assistant Visible" button.
          </p>

          <p className="clippy-tip">
            <strong>Note:</strong> The assistant might appear elsewhere on your
            screen. Look around!
          </p>
        </div>
      </div>
    </CustomWindow>
  );
};

export default ClippyAssistant;
