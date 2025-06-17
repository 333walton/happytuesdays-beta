import React, { useState, useEffect, useRef, useCallback } from "react";
import { Webchat, WebchatProvider, getClient } from "@botpress/webchat";
import { buildTheme } from "@botpress/webchat-generator";
import {
  searchKnowledge,
  getAgentKnowledge,
  getTroubleshootingSteps,
  MARTECH_KNOWLEDGE,
} from "../data/KnowledgeBase";
import {
  getQuickReplies,
  getConversationStarter,
  getFallbackMessage,
  getErrorMessage,
} from "../data/AgentResponses";

/**
 * Botpress Webchat v2 Component with Windows 98 styling and martech expertise
 * Uses the new @botpress/webchat React library for better integration
 */
const BotpressV2ChatWidget = ({
  onClose,
  agentConfig = {
    displayName: "Genius",
    personality: "professional_marketing_expert",
  },
  conversationStarter = "Hello! I'm Genius, your marketing technology expert. I can help with UTM tracking, analytics setup, campaign optimization, and troubleshooting martech issues. What can I help you with today?",
}) => {
  // State management
  const [isOpen, setIsOpen] = useState(true);
  const [fallbackMessages, setFallbackMessages] = useState([]);
  const [quickReplies] = useState([
    "UTM tracking help",
    "Analytics setup",
    "Campaign optimization",
    "Pixel troubleshooting",
  ]);

  // Client setup - you'll need to replace with your actual client ID
  const client = getClient({
    clientId: process.env.REACT_APP_BOTPRESS_CLIENT_ID || "YOUR_CLIENT_ID_HERE",
  });

  // Windows 98 theme configuration
  const { style, theme } = buildTheme({
    themeName: "prism", // Base theme
    themeColor: "#008080", // Windows 98 teal
  });

  // Enhanced knowledge response using rich prewritten content
  const getKnowledgeResponse = useCallback(
    (messageText, personality, agentConfigData) => {
      const agent =
        agentConfigData?.name === "Genius" ||
        agentConfigData?.displayName?.includes("Genius") ||
        agentConfigData?.role?.includes("Martech") ||
        personality === "professional_marketing_expert"
          ? "genius"
          : "clippy";

      const lowerMessage = messageText.toLowerCase();

      console.log(
        "🧠 Processing message:",
        messageText,
        "for agent:",
        agent,
        "| Config:",
        agentConfigData?.name
      );

      // Quick reply specific responses
      if (
        lowerMessage.includes("fix tracking") ||
        messageText === "Fix tracking pixels"
      ) {
        return {
          text: `🔧 Pixel Troubleshooting Checklist:\n\n1. Check if pixel fires in browser dev tools\n2. Verify pixel helper shows 'active'\n3. Test conversion events in test mode\n4. Check for duplicate installations\n5. Validate event parameters match requirements\n\nNeed help with a specific platform? Let me know!`,
          quickReplies: [
            "Facebook Pixel",
            "Google Analytics",
            "TikTok Pixel",
            "More details",
          ],
        };
      }

      if (lowerMessage.includes("utm") || lowerMessage.includes("tracking")) {
        return {
          text: `📊 UTM Parameter Guide:\n\n• utm_source: Where traffic comes from (google, facebook, email)\n• utm_medium: Marketing medium (cpc, social, email)\n• utm_campaign: Specific campaign name\n• utm_term: Paid keywords (optional)\n• utm_content: Ad variation (optional)\n\nExample: yoursite.com?utm_source=google&utm_medium=cpc&utm_campaign=black-friday\n\nWant me to help build UTM codes for your campaign?`,
          quickReplies: [
            "Build UTM codes",
            "UTM best practices",
            "Attribution models",
          ],
        };
      }

      if (
        lowerMessage.includes("analytics") ||
        lowerMessage.includes("setup")
      ) {
        return {
          text: `📈 Analytics Setup Checklist:\n\n✅ Install tracking code properly\n✅ Set up goals and conversions\n✅ Configure ecommerce tracking\n✅ Enable demographics & interests\n✅ Link Google Ads accounts\n✅ Set up custom dimensions\n✅ Configure cross-domain tracking\n\nWhich platform needs setup help?`,
          quickReplies: [
            "Google Analytics 4",
            "Google Ads",
            "Facebook Analytics",
            "Attribution setup",
          ],
        };
      }

      if (
        lowerMessage.includes("campaign") ||
        lowerMessage.includes("optimization")
      ) {
        return {
          text: `🚀 Campaign Optimization Strategy:\n\n1. **Audience Analysis**: Review performing segments\n2. **Bid Strategy**: Optimize for your KPIs\n3. **Ad Creative**: Test different formats & messages\n4. **Landing Pages**: Ensure message match\n5. **Attribution**: Check multi-touch paths\n\nCurrent challenge you're facing?`,
          quickReplies: [
            "Low conversion rate",
            "High CPA",
            "Poor ROAS",
            "Attribution issues",
          ],
        };
      }

      // Fallback with helpful suggestions
      return {
        text: `I'm here to help with marketing technology challenges! I specialize in:\n\n• UTM tracking & attribution\n• Analytics setup & troubleshooting\n• Campaign optimization\n• Pixel implementation\n• Marketing automation\n\nWhat specific martech challenge can I help you solve?`,
        quickReplies: quickReplies,
      };
    },
    [quickReplies]
  );

  // Handle fallback when Botpress is unavailable
  const handleFallbackMessage = useCallback(
    (messageText) => {
      const response = getKnowledgeResponse(
        messageText,
        agentConfig.personality,
        agentConfig
      );

      const newMessage = {
        id: Date.now(),
        text: response.text,
        sender: "bot",
        timestamp: new Date(),
        quickReplies: response.quickReplies || quickReplies,
      };

      setFallbackMessages((prev) => [
        ...prev,
        {
          id: Date.now() - 1,
          text: messageText,
          sender: "user",
          timestamp: new Date(),
        },
        newMessage,
      ]);
    },
    [agentConfig, getKnowledgeResponse, quickReplies]
  );

  // Calculate position for chat widget (similar to your existing logic)
  const calculatePosition = () => {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      return {
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
      };
    }

    // Desktop positioning logic
    const clippyEl = document.querySelector(".clippy");
    const overlayEl = document.getElementById("clippy-clickable-overlay");

    if (clippyEl) {
      const clippyRect = clippyEl.getBoundingClientRect();
      const overlayRect = overlayEl
        ? overlayEl.getBoundingClientRect()
        : clippyRect;

      return {
        width: "400px",
        height: "600px",
        position: "fixed",
        bottom: "90px",
        right: "20px",
      };
    }

    return {
      width: "400px",
      height: "600px",
      position: "fixed",
      bottom: "90px",
      right: "20px",
    };
  };

  const chatPosition = calculatePosition();

  // Custom Windows 98 styles
  const windows98Styles = `
    ${style}
    
    /* Windows 98 Chat Overrides */
    .bp-webchat {
      font-family: 'MS Sans Serif', 'Tahoma', sans-serif !important;
      font-size: 11px !important;
      background-color: #c0c0c0 !important;
      border: 2px outset #c0c0c0 !important;
      border-radius: 0 !important;
      box-shadow: 2px 2px 4px rgba(0,0,0,0.3) !important;
    }
    
    .bp-webchat-header {
      background: linear-gradient(90deg, #0080c0 0%, #0080c0 100%) !important;
      color: white !important;
      font-weight: bold !important;
      padding: 2px 4px !important;
      font-size: 11px !important;
    }
    
    .bp-webchat-message {
      font-family: 'MS Sans Serif', sans-serif !important;
      font-size: 11px !important;
    }
    
    .bp-webchat-composer {
      background-color: #c0c0c0 !important;
      border-top: 1px inset #c0c0c0 !important;
    }
    
    .bp-webchat-composer-input {
      font-family: 'MS Sans Serif', sans-serif !important;
      font-size: 11px !important;
      background-color: white !important;
      border: 1px inset #c0c0c0 !important;
    }
    
    /* Fallback chat styles */
    .fallback-chat {
      font-family: 'MS Sans Serif', 'Tahoma', sans-serif;
      font-size: 11px;
      background-color: #c0c0c0;
      border: 2px outset #c0c0c0;
      border-radius: 0;
      box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .fallback-header {
      background: linear-gradient(90deg, #0080c0 0%, #0080c0 100%);
      color: white;
      font-weight: bold;
      padding: 4px 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .fallback-messages {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      background: white;
    }
    
    .fallback-message {
      margin-bottom: 8px;
      padding: 4px 8px;
      border: 1px inset #c0c0c0;
      background: ${agentConfig.name === "Genius" ? "#f0f8f0" : "#f0f0f0"};
    }
    
    .fallback-input-area {
      background-color: #c0c0c0;
      border-top: 1px inset #c0c0c0;
      padding: 4px;
      display: flex;
      gap: 4px;
    }
    
    .fallback-input {
      flex: 1;
      font-family: 'MS Sans Serif', sans-serif;
      font-size: 11px;
      padding: 2px 4px;
      border: 1px inset #c0c0c0;
    }
    
    .fallback-button {
      font-family: 'MS Sans Serif', sans-serif;
      font-size: 11px;
      padding: 2px 8px;
      border: 1px outset #c0c0c0;
      background: #c0c0c0;
      cursor: pointer;
    }
    
    .fallback-button:active {
      border: 1px inset #c0c0c0;
    }
    
    .quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 8px;
    }
    
    .quick-reply-btn {
      font-family: 'MS Sans Serif', sans-serif;
      font-size: 10px;
      padding: 2px 6px;
      border: 1px outset #c0c0c0;
      background: #e0e0e0;
      cursor: pointer;
      white-space: nowrap;
    }
    
    .quick-reply-btn:hover {
      background: #f0f0f0;
    }
    
    .quick-reply-btn:active {
      border: 1px inset #c0c0c0;
    }
  `;

  // Fallback chat component
  const FallbackChat = () => {
    const [inputValue, setInputValue] = useState("");

    const handleSend = () => {
      if (inputValue.trim()) {
        handleFallbackMessage(inputValue.trim());
        setInputValue("");
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
        handleSend();
      }
    };

    return (
      <div className="fallback-chat" style={chatPosition}>
        <div className="fallback-header">
          <span>💡 {agentConfig.displayName} (Knowledge Mode)</span>
          <button
            className="fallback-button"
            onClick={onClose}
            style={{ padding: "0 4px", fontSize: "10px" }}
          >
            ✕
          </button>
        </div>

        <div className="fallback-messages">
          {/* Initial message */}
          <div className="fallback-message">
            <strong>Bot:</strong> {conversationStarter}
            <div className="quick-replies">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  className="quick-reply-btn"
                  onClick={() => handleFallbackMessage(reply)}
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation messages */}
          {fallbackMessages.map((msg) => (
            <div key={msg.id} className="fallback-message">
              <strong>{msg.sender === "user" ? "You" : "Bot"}:</strong>{" "}
              {msg.text}
              {msg.quickReplies && (
                <div className="quick-replies">
                  {msg.quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      className="quick-reply-btn"
                      onClick={() => handleFallbackMessage(reply)}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="fallback-input-area">
          <input
            className="fallback-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
          />
          <button className="fallback-button" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    );
  };

  // Check if we have a valid client ID
  const hasValidClientId =
    process.env.REACT_APP_BOTPRESS_CLIENT_ID &&
    process.env.REACT_APP_BOTPRESS_CLIENT_ID !== "YOUR_CLIENT_ID_HERE";

  if (!hasValidClientId) {
    console.warn("⚠️ No valid Botpress Client ID found, using fallback chat");
    return (
      <>
        <style>{windows98Styles}</style>
        <FallbackChat />
      </>
    );
  }

  return (
    <WebchatProvider client={client} theme={theme}>
      <style>{windows98Styles}</style>
      <Webchat
        style={{
          ...chatPosition,
          display: isOpen ? "flex" : "none",
        }}
      />

      {/* Custom close button overlay */}
      {isOpen && (
        <button
          onClick={() => {
            setIsOpen(false);
            if (onClose) onClose();
          }}
          style={{
            position: "fixed",
            top: chatPosition.top || "calc(100vh - 600px - 90px + 2px)",
            right: chatPosition.right || "22px",
            zIndex: 10000,
            background: "#c0c0c0",
            border: "1px outset #c0c0c0",
            padding: "0 4px",
            fontSize: "10px",
            fontFamily: "MS Sans Serif, sans-serif",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      )}
    </WebchatProvider>
  );
};

export default BotpressV2ChatWidget;
