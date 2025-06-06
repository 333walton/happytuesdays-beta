import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { AGENTS } from "@react95/clippy";
import { useClippy } from "@react95/clippy";
import { useClippyContext } from "./ClippyProvider";
import CustomWindow from "../CustomWindow";
import * as icons from "../../icons";
import ClippyPositioning from "./ClippyPositioning";

/**
 * Office Assistant (Clippy) settings and control panel
 * Optimized for mobile performance
 */
const ClippyAssistant = memo((props) => {
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

  // Check if we're on a mobile device - memoized to avoid recalculating
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }, []);

  // List of available assistants - memoized to prevent recreation on each render
  const agents = useMemo(() => Object.keys(AGENTS || {}), []);

  // Animations list - memoized to prevent recreation on each render
  const animations = useMemo(
    () => [
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
    ],
    []
  );

  // When component mounts, make sure Clippy is visible
  useEffect(() => {
    if (!minimized && setAssistantVisible) {
      setAssistantVisible(true);
    }
  }, [minimized, setAssistantVisible]);

  // Function to safely access the clippy object
  const getClippy = useCallback(() => {
    // Check all possible sources for clippy
    if (clippyHook && clippyHook.clippy) {
      return clippyHook.clippy;
    }
    if (window.clippy) {
      return window.clippy;
    }
    return null;
  }, [clippyHook]);

  // Function to play a selected animation - memoized to prevent recreation
  const handlePlayAnimation = useCallback(() => {
    const clippy = getClippy();
    if (clippy && clippy.play) {
      try {
        clippy.play(selectedAnimation);
      } catch (e) {
        // Animation error handled internally
      }
    }
  }, [getClippy, selectedAnimation]);

  // Function to send a message to Clippy - memoized for performance
  const handleSendMessage = useCallback(() => {
    const clippy = getClippy();
    if (message.trim() && clippy && clippy.speak) {
      try {
        clippy.speak(message);
        setMessage("");
      } catch (e) {
        // Speech error handled internally
      }
    }
  }, [getClippy, message, setMessage]);

  // Toggle visibility - memoized to prevent recreation
  const toggleAssistant = useCallback(() => {
    if (setAssistantVisible) {
      const newVisibility = !assistantVisible;
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
  }, [assistantVisible, getClippy, setAssistantVisible]);

  // Handle agent change - memoized for performance
  const handleAgentChange = useCallback(
    (e) => {
      const newAgent = e.target.value;
      if (setCurrentAgent) {
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
    },
    [getClippy, setCurrentAgent]
  );

  // Update position - optimized for performance and memoized
  const updatePosition = useCallback(() => {
    if (setPosition) {
      const newPosition = { x: Number(xPosition), y: Number(yPosition) };
      setPosition(newPosition);

      const clippyElement = document.querySelector(".clippy");
      const overlayEl = document.getElementById("clippy-clickable-overlay");

      if (clippyElement) {
        if (!ClippyPositioning.isMobile) {
          // Desktop: Apply hardware-accelerated positioning
          clippyElement.style.position = "absolute";
          clippyElement.style.left = `${xPosition}px`;
          clippyElement.style.top = `${yPosition}px`;
          clippyElement.style.right = "auto";
          clippyElement.style.bottom = "auto";
          clippyElement.style.willChange = "transform"; // Optimize for animations

          // Reset willChange after animation would be complete
          setTimeout(() => {
            if (clippyElement) {
              clippyElement.style.willChange = "auto";
            }
          }, 500);

          // Position overlay on desktop
          if (overlayEl) {
             ClippyPositioning.positionOverlay(overlayEl, clippyElement);
          }

        } else {
          // Mobile: Ensure positioning is handled by ClippyPositioning method
          if (ClippyPositioning.positionClippyAndOverlay) {
            // Pass the calculated mobile position or null to let the method recalculate
            ClippyPositioning.positionClippyAndOverlay(clippyElement, overlayEl, null);
          }
        }
      }

      // Give feedback (only if positions were successfully applied?)
      // For now, keep the feedback logic simple
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
  }, [getClippy, setPosition, xPosition, yPosition]);

  // Help handler function - memoized
  const handleHelp = useCallback(() => {
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
  }, [getClippy]);

  // Quick animation handler - memoized
  const playQuickAnimation = useCallback(
    (animation) => {
      const clippy = getClippy();
      if (clippy && clippy.play) {
        clippy.play(animation);
      }
    },
    [getClippy]
  );

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
      onHelp={handleHelp}
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
              <button onClick={() => playQuickAnimation("Wave")}>Wave</button>
              <button onClick={() => playQuickAnimation("Congratulate")}>
                Congratulate
              </button>
              <button onClick={() => playQuickAnimation("GetAttention")}>
                Attention
              </button>
              <button onClick={() => playQuickAnimation("Thinking")}>
                Think
              </button>
              <button onClick={() => playQuickAnimation("Writing")}>
                Write
              </button>
              <button onClick={() => playQuickAnimation("GoodBye")}>
                Goodbye
              </button>
            </div>
          </div>
        </div>

        {/* Debug section removed for mobile optimization */}
      </div>

      <style jsx>{`
        .office-assistant-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: ${isMobile ? "15px" : "10px"};
          font-family: "MS Sans Serif", Arial, sans-serif;
          font-size: ${isMobile ? "14px" : "11px"};
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
          width: ${isMobile ? "70px" : "50px"};
          border: 2px solid;
          border-color: #808080 #fff #fff #808080;
          background-color: #fff;
          padding: ${isMobile ? "6px 5px" : "2px 5px"};
          font-family: "MS Sans Serif", Arial, sans-serif;
          font-size: ${isMobile ? "14px" : "11px"};
          min-height: ${isMobile ? "36px" : "auto"};
          touch-action: manipulation;
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
          padding: ${isMobile ? "8px 12px" : "4px 8px"};
          font-family: "MS Sans Serif", Arial, sans-serif;
          font-size: ${isMobile ? "14px" : "11px"};
          box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080;
          min-height: ${isMobile ? "36px" : "auto"}; /* Larger touch targets */
          touch-action: manipulation; /* Improves touch response */
        }

        .office-assistant-container button:active {
          border-color: #808080 #fff #fff #808080;
          box-shadow: inset 1px 1px 0 #808080, inset -1px -1px 0 #dfdfdf;
          padding-top: ${isMobile ? "9px" : "5px"};
          padding-left: ${isMobile ? "13px" : "9px"};
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
          padding: ${isMobile ? "6px 8px" : "3px 5px"};
          font-family: "MS Sans Serif", Arial, sans-serif;
          font-size: ${isMobile ? "14px" : "11px"};
          min-height: ${isMobile
            ? "36px"
            : "auto"}; /* Taller input on mobile */
        }

        /* Larger, more touch-friendly selects on mobile */
        .agent-selector select,
        .animation-controls select {
          padding: ${isMobile ? "6px 4px" : "2px"};
          font-size: ${isMobile ? "14px" : "11px"};
          min-height: ${isMobile ? "36px" : "auto"};
        }
      `}</style>
    </CustomWindow>
  );
});

export default ClippyAssistant;
