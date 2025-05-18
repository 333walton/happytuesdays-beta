import React, { useState, useEffect } from "react";
import { AGENTS } from "@react95/clippy";
import { useClippy } from "@react95/clippy";
import { useClippyContext } from "./ClippyProvider";
import CustomWindow from "../CustomWindow";
import * as icons from "../../icons";

/**
 * Office Assistant (Clippy) settings and control panel
 */
const ClippyAssistant = (props) => {
  const { id, zIndex, isActive, moveToTop, onClose, onMinimize, minimized } =
    props;

  // Get the clippy API directly
  const clippyHook = useClippy();

  // Get clippy context for visibility and agent control
  const {
    assistantVisible,
    setAssistantVisible,
    currentAgent,
    setCurrentAgent,
    position,
    setPosition,
  } = useClippyContext() || {};

  // Local state for the input field
  const [message, setMessage] = useState("");
  const [selectedAnimation, setSelectedAnimation] = useState("Greeting");
  const [xPosition, setXPosition] = useState(position?.x || 400);
  const [yPosition, setYPosition] = useState(position?.y || 300);

  // List of available assistants and hardcoded animations
  const agents = Object.keys(AGENTS || {});
  const animations = [
    "Greeting",
    "Wave",
    "Congratulate",
    "GetAttention",
    "Thinking",
    "Writing",
    "GoodBye",
    "Processing",
    "Alert",
    "GetArtsy",
    "Searching",
    "Explain",
    "Confused",
    "Hide",
    "Show",
    "Idle",
  ];

  // When component mounts, make sure Clippy is visible
  useEffect(() => {
    if (!minimized && setAssistantVisible) {
      setAssistantVisible(true);
    }
  }, [minimized, setAssistantVisible]);

  // Function to safely access the clippy object
  const getClippy = () => {
    // Check all possible sources for clippy
    if (clippyHook && clippyHook.clippy) {
      return clippyHook.clippy;
    }
    if (window.clippy) {
      return window.clippy;
    }
    return null;
  };

  // Function to play a selected animation
  const handlePlayAnimation = () => {
    const clippy = getClippy();
    if (clippy && clippy.play) {
      try {
        console.log("Playing animation:", selectedAnimation);
        clippy.play(selectedAnimation);
      } catch (e) {
        console.error(`Error playing animation "${selectedAnimation}":`, e);
      }
    } else {
      console.warn("Could not find Clippy instance to play animation");
    }
  };

  // Function to send a message to Clippy
  const handleSendMessage = () => {
    const clippy = getClippy();
    if (message.trim() && clippy && clippy.speak) {
      try {
        console.log("Making Clippy speak:", message);
        clippy.speak(message);
        setMessage("");
      } catch (e) {
        console.error("Error having Clippy speak:", e);
      }
    } else {
      console.warn("Could not find Clippy instance to speak");
    }
  };

  // Toggle visibility
  const toggleAssistant = () => {
    if (setAssistantVisible) {
      const newVisibility = !assistantVisible;
      console.log("Setting assistant visibility to:", newVisibility);
      setAssistantVisible(newVisibility);

      // If showing, give feedback
      if (newVisibility) {
        const clippy = getClippy();
        if (clippy) {
          setTimeout(() => {
            if (clippy.speak) {
              clippy.speak("I'm back! How can I help you?");
            }
            if (clippy.play) {
              clippy.play("Greeting");
            }
          }, 300);
        }
      }
    }
  };

  // Handle agent change
  const handleAgentChange = (e) => {
    const newAgent = e.target.value;
    if (setCurrentAgent) {
      console.log("Changing agent to:", newAgent);
      setCurrentAgent(newAgent);

      // Welcome message for new agent
      setTimeout(() => {
        const clippy = getClippy();
        if (clippy) {
          if (clippy.speak) {
            clippy.speak(`Hi! I'm ${newAgent} now. How can I help you?`);
          }
          if (clippy.play) {
            clippy.play("Wave");
          }
        }
      }, 500);
    }
  };

  // Update position
  const updatePosition = () => {
    if (setPosition) {
      const newPosition = { x: Number(xPosition), y: Number(yPosition) };
      console.log("Setting position to:", newPosition);
      setPosition(newPosition);

      // Also try direct DOM manipulation for immediate feedback
      try {
        const agentElements = document.querySelectorAll(".clippy");
        if (agentElements.length > 0) {
          const agentElement = agentElements[0];

          // Position using absolute positioning
          agentElement.style.position = "absolute";
          agentElement.style.left = `${xPosition}px`;
          agentElement.style.top = `${yPosition}px`;
          agentElement.style.right = "auto";
          agentElement.style.bottom = "auto";
        }
      } catch (e) {
        console.error("Error directly positioning clippy:", e);
      }

      // Give feedback
      const clippy = getClippy();
      if (clippy) {
        if (clippy.speak) {
          clippy.speak("I've moved to my new position!");
        }
        if (clippy.play) {
          clippy.play("GetAttention");
        }
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
      disableMaximize={true}
      onMaximize={null}
      showMaximize={false}
      disableRestore={true}
      onRestore={null}
      showRestore={false}
      restored={null}
      initialWidth={400}
      initialHeight={440}
      initialX={1}
      initialY={1}
      icon={icons.textchat32}
      showHelpButton={true}
      onHelp={() => {
        const clippy = getClippy();
        if (clippy) {
          if (clippy.speak) {
            clippy.speak(
              "Need help with the Office Assistant? Just select an animation or type a message!"
            );
          }
          if (clippy.play) {
            clippy.play("Explain");
          }
        }
      }}
    >
      <div className="office-assistant-container">
        <div className="clippy-controls">
          <div className="agent-selector">
            <label htmlFor="agent-select">Select Assistant:</label>
            <select
              id="agent-select"
              value={currentAgent || "Clippy"}
              onChange={handleAgentChange}
            >
              {agents.map((agent) => (
                <option key={agent} value={agent}>
                  {agent}
                </option>
              ))}
            </select>
          </div>

          <div className="animation-controls">
            <select
              value={selectedAnimation}
              onChange={(e) => setSelectedAnimation(e.target.value)}
            >
              {animations.map((anim) => (
                <option key={anim} value={anim}>
                  {anim}
                </option>
              ))}
            </select>
            <button onClick={handlePlayAnimation}>Play Animation</button>
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

          <div className="position-controls">
            <div className="position-inputs">
              <label>
                X Position:
                <input
                  type="number"
                  value={xPosition}
                  onChange={(e) => setXPosition(e.target.value)}
                  min="0"
                  max="800"
                />
                px
              </label>
              <label>
                Y Position:
                <input
                  type="number"
                  value={yPosition}
                  onChange={(e) => setYPosition(e.target.value)}
                  min="0"
                  max="600"
                />
                px
              </label>
              <button onClick={updatePosition}>Update Position</button>
            </div>
          </div>

          <div className="visibility-toggle">
            <button
              onClick={toggleAssistant}
              style={{ width: "100%", fontWeight: "bold" }}
            >
              {assistantVisible ? "Hide Assistant" : "Show Assistant"}
            </button>
          </div>
        </div>

        <div className="clippy-info">
          <h3>Office Assistant Help</h3>

          <p>
            The Office Assistant can help you with various tasks in Windows 98:
          </p>

          <ul>
            <li>Get help with specific applications</li>
            <li>Learn Windows 98 tips and tricks</li>
            <li>Entertain you with animations</li>
          </ul>

          {/*
  <div className="clippy-tip">
    <strong>Tip:</strong> Click the ? button in any window title bar to
    get contextual help from the Office Assistant.
  </div>
*/}

          <div className="animation-list">
            <h4>Popular Animations:</h4>
            <div className="quick-animations">
              <button
                onClick={() => {
                  const clippy = getClippy();
                  if (clippy && clippy.play) clippy.play("Wave");
                }}
              >
                Wave
              </button>
              <button
                onClick={() => {
                  const clippy = getClippy();
                  if (clippy && clippy.play) clippy.play("Congratulate");
                }}
              >
                Congratulate
              </button>
              <button
                onClick={() => {
                  const clippy = getClippy();
                  if (clippy && clippy.play) clippy.play("GetAttention");
                }}
              >
                Attention
              </button>
              <button
                onClick={() => {
                  const clippy = getClippy();
                  if (clippy && clippy.play) clippy.play("Thinking");
                }}
              >
                Think
              </button>
              <button
                onClick={() => {
                  const clippy = getClippy();
                  if (clippy && clippy.play) clippy.play("Writing");
                }}
              >
                Write
              </button>
              <button
                onClick={() => {
                  const clippy = getClippy();
                  if (clippy && clippy.play) clippy.play("GoodBye");
                }}
              >
                Goodbye
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .office-assistant-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 10px;
          font-family: "MS Sans Serif", Arial, sans-serif;
          font-size: 11px;
          overflow: hidden;
        }

        .clippy-controls {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 15px;
        }

        .agent-selector,
        .animation-controls {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .agent-selector label {
          font-weight: bold;
          min-width: 120px;
        }

        .agent-selector select,
        .animation-controls select {
          flex: 1;
          border: 2px solid;
          border-color: #808080 #fff #fff #808080;
          background-color: #fff;
          padding: 2px;
          font-family: "MS Sans Serif", Arial, sans-serif;
          font-size: 11px;
        }

        .position-controls {
          border: 2px solid;
          border-color: #808080 #fff #fff #808080;
          background-color: #f0f0f0;
          padding: 8px;
        }

        .position-inputs {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .position-inputs label {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .position-inputs input {
          width: 50px;
          border: 2px solid;
          border-color: #808080 #fff #fff #808080;
          background-color: #fff;
          padding: 2px 5px;
          font-family: "MS Sans Serif", Arial, sans-serif;
          font-size: 11px;
        }

        .clippy-info {
          border: 2px solid;
          border-color: #808080 #fff #fff #808080;
          background-color: #fff;
          padding: 10px;
          flex: 1;
          overflow-y: auto;
        }

        .clippy-info h3 {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 12px;
        }

        .clippy-info h4 {
          margin-top: 15px;
          margin-bottom: 5px;
          font-size: 11px;
        }

        .clippy-info ul {
          margin-top: 5px;
          padding-left: 20px;
        }

        .clippy-tip {
          background-color: #ffffc0;
          padding: 5px;
          border: 1px solid #808080;
          margin-top: 15px;
          margin-bottom: 15px;
        }

        .quick-animations {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 5px;
          margin-top: 5px;
        }

        .visibility-toggle {
          margin-top: 5px;
        }

        /* Add button styles inside the component to avoid global style conflicts */
        .office-assistant-container button {
          border: 2px solid;
          border-color: #fff #808080 #808080 #fff;
          background-color: #c0c0c0;
          padding: 4px 8px;
          font-family: "MS Sans Serif", Arial, sans-serif;
          font-size: 11px;
          box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080;
          //cursor: none;
        }

        .office-assistant-container button:active {
          border-color: #808080 #fff #fff #808080;
          box-shadow: inset 1px 1px 0 #808080, inset -1px -1px 0 #dfdfdf;
          padding-top: 5px;
          padding-left: 9px;
        }

        .message-input {
          display: flex;
          gap: 5px;
        }

        .message-input input {
          flex: 1;
          border: 2px solid;
          border-color: #808080 #fff #fff #808080;
          background-color: #fff;
          padding: 3px 5px;
          font-family: "MS Sans Serif", Arial, sans-serif;
          font-size: 11px;
        }
      `}</style>
    </CustomWindow>
  );
};

export default ClippyAssistant;
