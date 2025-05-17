import React, { useState, useEffect } from "react";
import CustomWindow from "../CustomWindow";
import "./_styles.scss";

/**
 * ClippyAssistant with GIF animation and reduced height
 */
const ClippyAssistant = (props) => {
  const { id, zIndex, isActive, moveToTop, onClose, onMinimize, minimized } =
    props;

  // Keep track of essential state
  const [message, setMessage] = useState("");
  const [agentName, setAgentName] = useState("Clippy");
  const [showingAssistant, setShowingAssistant] = useState(false);
  const [bubbleText, setBubbleText] = useState(
    "Hello! I'm your Office Assistant. How can I help you with Windows 98?"
  );
  const [animationClass, setAnimationClass] = useState("");
  const [imageError, setImageError] = useState(false);

  // Use GIFs for the main images and emojis as fallbacks
  const assistantImages = {
    Clippy: {
      main: "https://media.tenor.com/uRRzZTvQTHgAAAAC/clippy-clip.gif", // Animated GIF
      fallback:
        "https://i.gifer.com/origin/8f/8fd3f22113b602d7a60263c4c5d950ff_w200.gif", // Alternative GIF
      emoji: "📎",
    },
    Merlin: {
      main: "https://media.tenor.com/oyCH_3SlJN0AAAAC/microsoft-agent-merlin.gif",
      fallback:
        "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWJ6emRtNnBxeXR1dWdrZG04bm5nZWd5c2F2dGRzOGVuYmVwMzkwcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nxM1YSgYzXALvFD2Pt/giphy.gif",
      emoji: "🧙‍♂️",
    },
    Rover: {
      main: "https://media.tenor.com/AH8YsuB-4cQAAAAd/microsoft-agent-rover.gif",
      fallback:
        "https://media1.tenor.com/m/O9rOKPuZtTIAAAAC/microsoft-agent-rover.gif",
      emoji: "🐶",
    },
    Links: {
      main: "https://i.imgur.com/UdoGF7y.gif",
      fallback:
        "https://media.tenor.com/ZNXMpQ0lPqwAAAAC/microsoft-agent-links.gif",
      emoji: "⛓️",
    },
  };

  // Get current image with fallbacks
  const getCurrentImage = () => {
    if (!assistantImages[agentName]) return assistantImages["Clippy"].main;

    if (imageError) {
      // Try fallback GIF
      return assistantImages[agentName].fallback;
    }

    return assistantImages[agentName].main;
  };

  // Function to handle image load errors
  const handleImageError = () => {
    console.log("Image failed to load, using fallback");
    setImageError(true);
  };

  // Handle second image error - move to emoji
  const handleFallbackError = () => {
    console.log("Fallback image failed too, using emoji");
    // We'll render emoji instead
    return true;
  };

  // Function to show the assistant
  const showAssistant = () => {
    setShowingAssistant(true);
    setAnimationClass("assistant-enter");
    setTimeout(() => {
      setAnimationClass("");
    }, 1000);

    setBubbleText(
      "Hello! I'm your Office Assistant. How can I help you with Windows 98?"
    );
  };

  // Function to make the assistant speak
  const speakMessage = (text) => {
    setBubbleText(text);

    // Reset bubble after 8 seconds
    setTimeout(() => {
      setBubbleText("");
    }, 8000);
  };

  // Function to animate the assistant
  const animateAssistant = (action) => {
    if (!showingAssistant) {
      showAssistant();
      setTimeout(() => animateAssistant(action), 500);
      return;
    }

    switch (action) {
      case "wave":
        setAnimationClass("assistant-wave");
        speakMessage("Hello there! Nice to meet you!");
        break;
      case "search":
        setAnimationClass("assistant-search");
        speakMessage(
          "I'm searching for information. What would you like to know about Windows 98?"
        );
        break;
      case "write":
        setAnimationClass("assistant-write");
        speakMessage(
          "Let me write that down for you... I'll make sure to remember it!"
        );
        break;
      case "explain":
        setAnimationClass("assistant-explain");
        speakMessage(
          "Windows 98 was released on June 25, 1998. It featured the Active Desktop, Internet Explorer 4.0 integration, and better USB support."
        );
        break;
      default:
        setAnimationClass("assistant-bounce");
    }

    // Reset animation class after a short delay
    setTimeout(() => {
      setAnimationClass("");
    }, 1000);
  };

  // Handle message sending
  const handleSendMessage = () => {
    if (message.trim() !== "") {
      if (!showingAssistant) {
        showAssistant();
        setTimeout(
          () =>
            speakMessage(`I heard you say: "${message}". That's interesting!`),
          500
        );
      } else {
        speakMessage(`I heard you say: "${message}". That's interesting!`);
      }
      setMessage("");
    }
  };

  // Reset image error when changing agent
  useEffect(() => {
    setImageError(false);

    // If assistant is showing, introduce the new character
    if (showingAssistant) {
      setTimeout(() => {
        speakMessage(
          `Hi! I'm ${agentName} now. How can I help you with Windows 98?`
        );
        setAnimationClass("assistant-wave");
        setTimeout(() => setAnimationClass(""), 1000);
      }, 100);
    }
  }, [agentName]);

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
      initialWidth={400}
      initialHeight={420} // Reduced height
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
              onChange={(e) => setAgentName(e.target.value)}
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
              Show Assistant
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
            <strong>Status:</strong> Using simulated assistant
          </p>

          <p className="clippy-tip">
            <strong>Note:</strong> Click "Show Assistant" to display the Office
            Assistant.
          </p>
        </div>

        {/* Embedded Assistant Display - reduced height by 25% */}
        {showingAssistant && (
          <div className="embedded-assistant-container">
            <div className={`embedded-assistant ${animationClass}`}>
              {/* Try main GIF, then fallback GIF, then emoji */}
              {imageError && assistantImages[agentName]?.fallback ? (
                <img
                  src={assistantImages[agentName].fallback}
                  alt={agentName}
                  className="assistant-image"
                  onError={handleFallbackError}
                />
              ) : (
                <img
                  src={getCurrentImage()}
                  alt={agentName}
                  className="assistant-image"
                  onError={handleImageError}
                />
              )}

              {bubbleText && (
                <div className="assistant-bubble">{bubbleText}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add inline styles for animations and components */}
      <style>
        {`
          .embedded-assistant-container {
            margin-top: 10px;
            height: 90px; /* 25% shorter than the original 120px */
            position: relative;
            border: 1px solid #808080;
            border-top-color: #fff;
            border-left-color: #fff;
            background: #c0c0c0;
            overflow: hidden;
            padding: 8px;
          }
          
          .embedded-assistant {
            position: absolute;
            bottom: 10px;
            left: 15px;
            display: flex;
            align-items: flex-start;
            transition: all 0.3s ease;
          }
          
          .assistant-image {
            width: 60px;
            height: 60px;
            object-fit: contain;
          }
          
          .fallback-assistant {
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #c0c0c0;
            border: 1px solid #808080;
            border-radius: 5px;
            font-size: 40px;
          }
          
          .assistant-bubble {
            position: relative;
            margin-left: 15px;
            padding: 8px 12px;
            background: #ffffc0;
            border: 2px solid #000;
            border-radius: 10px;
            max-width: 240px;
            font-family: "MS Sans Serif", Arial, sans-serif;
            font-size: 11px;
            box-shadow: 3px 3px 0 rgba(0,0,0,0.2);
          }
          
          .assistant-bubble:after {
            content: '';
            position: absolute;
            left: -12px;
            top: 15px;
            width: 0;
            height: 0;
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
            border-right: 12px solid #ffffc0;
            z-index: 1;
          }
          
          .assistant-bubble:before {
            content: '';
            position: absolute;
            left: -15px;
            top: 14px;
            width: 0;
            height: 0;
            border-top: 9px solid transparent;
            border-bottom: 9px solid transparent;
            border-right: 13px solid #000;
            z-index: 0;
          }
          
          /* Animations */
          .assistant-enter {
            animation: slide-in 0.5s ease;
          }
          
          .assistant-wave {
            animation: wave 0.5s ease;
          }
          
          .assistant-search {
            animation: search 0.6s ease;
          }
          
          .assistant-write {
            animation: write 0.5s ease;
          }
          
          .assistant-explain {
            animation: explain 0.8s ease;
          }
          
          .assistant-bounce {
            animation: bounce 0.5s ease;
          }
          
          @keyframes slide-in {
            0% { transform: translateX(-100px); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          
          @keyframes wave {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(15deg); }
            50% { transform: rotate(-15deg); }
            75% { transform: rotate(10deg); }
            100% { transform: rotate(0deg); }
          }
          
          @keyframes search {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px) scale(1.1); }
            100% { transform: translateY(0); }
          }
          
          @keyframes write {
            0% { transform: scale(1); }
            50% { transform: scale(0.9); }
            100% { transform: scale(1); }
          }
          
          @keyframes explain {
            0% { transform: scale(1); }
            15% { transform: scale(1.2); }
            30% { transform: scale(1); }
            45% { transform: scale(1.1); }
            60% { transform: scale(1); }
            100% { transform: scale(1); }
          }
          
          @keyframes bounce {
            0% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0); }
          }
          
          /* Windows 98 styles for the controls */
          .clippy-container {
            font-family: "MS Sans Serif", Arial, sans-serif;
            font-size: 11px;
            color: #000;
          }
          
          .clippy-controls button {
            border: 2px solid;
            border-color: #dfdfdf #808080 #808080 #dfdfdf;
            background: #c0c0c0;
            padding: 4px 8px;
            font-family: "MS Sans Serif", Arial, sans-serif;
            font-size: 11px;
            box-shadow: inset 1px 1px 0 #ffffff, inset -1px -1px 0 #0a0a0a;
          }
          
          .clippy-controls button:active {
            border-color: #808080 #dfdfdf #dfdfdf #808080;
            box-shadow: inset 1px 1px 0 #0a0a0a, inset -1px -1px 0 #ffffff;
            padding-top: 5px;
            padding-left: 9px;
          }
          
          .clippy-controls select {
            border: 2px solid;
            border-color: #808080 #dfdfdf #dfdfdf #808080;
            background-color: #fff;
            padding: 2px;
            font-family: "MS Sans Serif", Arial, sans-serif;
            font-size: 11px;
          }
          
          .clippy-controls input {
            border: 2px solid;
            border-color: #808080 #dfdfdf #dfdfdf #808080;
            background-color: #fff;
            padding: 3px 5px;
            font-family: "MS Sans Serif", Arial, sans-serif;
            font-size: 11px;
          }
        `}
      </style>
    </CustomWindow>
  );
};

export default ClippyAssistant;
