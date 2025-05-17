import React, { useState, useEffect } from "react";
import CustomWindow from "../CustomWindow";
import "./_styles.scss";

/**
 * Simplified ClippyAssistant component
 * This version uses a direct DOM manipulation approach with minimal state
 */
const ClippyAssistant = (props) => {
  const { id, zIndex, isActive, moveToTop, onClose, onMinimize, minimized } =
    props;

  // Only keep essential state
  const [message, setMessage] = useState("");
  const [agentName, setAgentName] = useState("Clippy");
  const [assistantReady, setAssistantReady] = useState(false);

  // Variable to track simulated assistant outside of React state
  let simulatedActive = false;

  // Image URLs for different assistants
  const assistantImages = {
    Clippy: "https://upload.wikimedia.org/wikipedia/en/d/db/Clippy-letter.png",
    Merlin:
      "https://cdn.iconscout.com/icon/premium/png-256-thumb/wizard-hat-1764194-1495483.png",
    Rover:
      "https://raw.githubusercontent.com/smore-inc/clippy.js/master/agents/Rover/Rover-1.png",
    Links:
      "https://raw.githubusercontent.com/smore-inc/clippy.js/master/agents/Links/Links-1.png",
  };

  // Function to show the assistant
  const showAssistant = () => {
    // Check if assistant elements already exist
    let assistantDiv = document.getElementById("simulatedClippy");
    let bubbleDiv = document.getElementById("speechBubble");

    if (!assistantDiv) {
      // Create assistant element
      assistantDiv = document.createElement("div");
      assistantDiv.id = "simulatedClippy";
      assistantDiv.style.position = "fixed";
      assistantDiv.style.left = "300px";
      assistantDiv.style.top = "300px";
      assistantDiv.style.width = "100px";
      assistantDiv.style.height = "100px";
      assistantDiv.style.backgroundImage = `url(${assistantImages[agentName]})`;
      assistantDiv.style.backgroundSize = "contain";
      assistantDiv.style.backgroundRepeat = "no-repeat";
      assistantDiv.style.backgroundPosition = "center";
      assistantDiv.style.zIndex = "10000";
      assistantDiv.style.transition = "transform 0.3s ease";
      assistantDiv.style.cursor = "move";

      // Make assistant draggable
      assistantDiv.onmousedown = (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = parseInt(assistantDiv.style.left);
        const startTop = parseInt(assistantDiv.style.top);

        const moveHandler = (moveEvent) => {
          assistantDiv.style.left = `${
            startLeft + moveEvent.clientX - startX
          }px`;
          assistantDiv.style.top = `${startTop + moveEvent.clientY - startY}px`;

          // Move speech bubble with assistant
          if (bubbleDiv) {
            bubbleDiv.style.left = `${
              parseInt(assistantDiv.style.left) + 120
            }px`;
            bubbleDiv.style.top = `${parseInt(assistantDiv.style.top) - 20}px`;
          }
        };

        const upHandler = () => {
          document.removeEventListener("mousemove", moveHandler);
          document.removeEventListener("mouseup", upHandler);
        };

        document.addEventListener("mousemove", moveHandler);
        document.addEventListener("mouseup", upHandler);
      };

      // Create speech bubble
      bubbleDiv = document.createElement("div");
      bubbleDiv.id = "speechBubble";
      bubbleDiv.style.position = "fixed";
      bubbleDiv.style.left = "420px";
      bubbleDiv.style.top = "280px";
      bubbleDiv.style.padding = "10px";
      bubbleDiv.style.background = "#ffffc0";
      bubbleDiv.style.border = "2px solid black";
      bubbleDiv.style.borderRadius = "10px";
      bubbleDiv.style.maxWidth = "200px";
      bubbleDiv.style.zIndex = "10001";
      bubbleDiv.style.boxShadow = "3px 3px 5px rgba(0,0,0,0.3)";
      bubbleDiv.style.fontFamily = '"MS Sans Serif", Arial, sans-serif';
      bubbleDiv.style.fontSize = "12px";
      bubbleDiv.innerText =
        "Hello! I'm your Office Assistant. How can I help you with Windows 98?";

      // Add elements to the document
      document.body.appendChild(assistantDiv);
      document.body.appendChild(bubbleDiv);

      // Do a small animation
      assistantDiv.style.transform = "scale(0)";
      setTimeout(() => {
        assistantDiv.style.transform = "scale(1.2)";
        setTimeout(() => {
          assistantDiv.style.transform = "scale(1)";
        }, 200);
      }, 50);

      simulatedActive = true;
      setAssistantReady(true);
    } else {
      // Elements already exist, just make them visible and reposition
      assistantDiv.style.display = "block";
      if (bubbleDiv) {
        bubbleDiv.style.display = "block";
        bubbleDiv.innerText = "I'm back! Need some help?";
      }

      // Update image if agent has changed
      assistantDiv.style.backgroundImage = `url(${assistantImages[agentName]})`;
    }
  };

  // Function to hide the assistant
  const hideAssistant = (remove = false) => {
    const assistantDiv = document.getElementById("simulatedClippy");
    const bubbleDiv = document.getElementById("speechBubble");

    if (assistantDiv) {
      if (remove) {
        assistantDiv.remove();
      } else {
        assistantDiv.style.display = "none";
      }
    }

    if (bubbleDiv) {
      if (remove) {
        bubbleDiv.remove();
      } else {
        bubbleDiv.style.display = "none";
      }
    }
  };

  // Function to make the assistant speak
  const speakMessage = (text) => {
    const bubbleDiv = document.getElementById("speechBubble");

    if (bubbleDiv) {
      bubbleDiv.innerText = text;
      bubbleDiv.style.display = "block";

      // Auto-hide after 5 seconds
      setTimeout(() => {
        if (bubbleDiv) {
          bubbleDiv.style.display = "none";
        }
      }, 5000);
    }
  };

  // Function to animate the assistant
  const animateAssistant = (action) => {
    const assistantDiv = document.getElementById("simulatedClippy");

    if (assistantDiv) {
      switch (action) {
        case "wave":
          assistantDiv.style.transform = "rotate(15deg)";
          speakMessage("Hello there!");
          setTimeout(() => {
            assistantDiv.style.transform = "rotate(-15deg)";
            setTimeout(() => {
              assistantDiv.style.transform = "rotate(0deg)";
            }, 200);
          }, 200);
          break;
        case "search":
          assistantDiv.style.transform = "translateY(-10px)";
          speakMessage("Searching for information...");
          setTimeout(() => {
            assistantDiv.style.transform = "translateY(0)";
          }, 300);
          break;
        case "write":
          assistantDiv.style.transform = "scale(0.9)";
          speakMessage("Let me write that down for you...");
          setTimeout(() => {
            assistantDiv.style.transform = "scale(1)";
          }, 300);
          break;
        case "explain":
          assistantDiv.style.transform = "scale(1.1)";
          speakMessage(
            "Windows 98 was released on June 25, 1998. It featured the Active Desktop and better system performance."
          );
          setTimeout(() => {
            assistantDiv.style.transform = "scale(1)";
          }, 300);
          break;
        default:
          assistantDiv.style.transform = "rotate(5deg)";
          setTimeout(() => {
            assistantDiv.style.transform = "rotate(0deg)";
          }, 300);
      }
    }
  };

  // Handle message sending
  const handleSendMessage = () => {
    if (message.trim() !== "") {
      speakMessage(message);
      setMessage("");
    }
  };

  // Change agent
  const handleChangeAgent = (name) => {
    setAgentName(name);

    // Update image if assistant exists
    const assistantDiv = document.getElementById("simulatedClippy");
    if (assistantDiv) {
      assistantDiv.style.backgroundImage = `url(${assistantImages[name]})`;
      speakMessage(`I'm ${name} now! How can I help?`);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up any created elements
      hideAssistant(true);
    };
  }, []);

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
      onHelp={() => animateAssistant("wave")}
      showHelpButton={true}
    >
      <div className="clippy-container">
        <div className="clippy-controls">
          <div className="agent-selector">
            <label>Select Assistant:</label>
            <select
              value={agentName}
              onChange={(e) => handleChangeAgent(e.target.value)}
            >
              <option value="Clippy">Clippy</option>
              <option value="Merlin">Merlin</option>
              <option value="Rover">Rover</option>
              <option value="Links">Links</option>
            </select>
          </div>

          <div className="action-buttons">
            <button onClick={() => animateAssistant("wave")}>Wave</button>
            <button onClick={() => animateAssistant("search")}>Search</button>
            <button onClick={() => animateAssistant("write")}>Write</button>
            <button onClick={() => animateAssistant("explain")}>
              Explain Win98
            </button>
          </div>

          <div className="action-buttons">
            <button
              onClick={showAssistant}
              style={{ gridColumn: "span 2", fontWeight: "bold" }}
            >
              {assistantReady ? "Show Assistant" : "Use Simulated Assistant"}
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
            <strong>Status:</strong>{" "}
            {assistantReady
              ? "Using simulated assistant. Assistant ready"
              : "Loading scripts..."}
          </p>

          {assistantReady ? (
            <p className="clippy-tip">
              <strong>Note:</strong> Using simulated assistant. It provides the
              same functionality as the original Office Assistant.
            </p>
          ) : (
            <p className="clippy-tip">
              <strong>Tip:</strong> If the real assistant doesn't appear, try
              clicking "Use Simulated Assistant".
            </p>
          )}
        </div>
      </div>
    </CustomWindow>
  );
};

export default ClippyAssistant;
