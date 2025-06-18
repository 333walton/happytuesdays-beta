import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from "react";
import { Fab, Webchat } from "@botpress/webchat";
import { useClippyContext } from "../../core/ClippyProvider";
import {
  getConversationStarter,
  getQuickReplies,
  getFallbackMessage,
} from "../data/AgentResponses";
import { searchKnowledge, MARTECH_KNOWLEDGE } from "../data/KnowledgeBase";
import "./GeniusWebchatIntegration.css";

/**
 * Error Boundary for Botpress failures
 */
class BotpressErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    console.error("Botpress Error:", error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Botpress Error Details:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

/**
 * Fallback Chat Component (Windows 98 style)
 */
const FallbackChat = ({ agentConfig, onClose, isMobile }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState(getQuickReplies("genius"));
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Initial message
    const starter = getConversationStarter("genius", false);
    setMessages([
      {
        id: Date.now(),
        text: starter,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getKnowledgeResponse = useCallback((messageText) => {
    const lowerMessage = messageText.toLowerCase();

    // Check for specific martech topics
    if (lowerMessage.includes("utm") || lowerMessage.includes("tracking")) {
      const utmKnowledge = MARTECH_KNOWLEDGE.utm_parameters;
      return {
        text: `🎯 UTM Parameter Expert Advice:\n\n${utmKnowledge.setup_guide
          .slice(0, 3)
          .join("\n• ")}\n\nNeed help with a specific UTM issue?`,
        quickReplies: [
          "UTM setup",
          "Common issues",
          "Best practices",
          "More help",
        ],
      };
    }

    if (
      lowerMessage.includes("pixel") ||
      lowerMessage.includes("facebook") ||
      lowerMessage.includes("google ads")
    ) {
      const pixelKnowledge = MARTECH_KNOWLEDGE.tracking_pixels;
      return {
        text: `🔍 Tracking Pixel Troubleshooting:\n\n📘 Facebook Pixel:\n• ${pixelKnowledge.facebook_pixel
          .slice(0, 2)
          .join("\n• ")}\n\nWhat specific pixel issue are you facing?`,
        quickReplies: [
          "Facebook Pixel",
          "Google Ads",
          "UTM setup",
          "More help",
        ],
      };
    }

    // Search knowledge base
    const searchResults = searchKnowledge("genius", messageText);
    if (searchResults.length > 0) {
      const result = searchResults[0];
      return {
        text: `📚 From my knowledge base:\n\n${
          Array.isArray(result.content)
            ? result.content.slice(0, 3).join("\n• ")
            : result.content
        }`,
        quickReplies: getQuickReplies("genius"),
      };
    }

    // Fallback response
    return {
      text:
        getFallbackMessage("genius") ||
        "I'm here to help with marketing technology questions!",
      quickReplies: getQuickReplies("genius"),
    };
  }, []);

  const handleSendMessage = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const response = getKnowledgeResponse(text);
      const botMessage = {
        id: Date.now() + 1,
        text: response.text,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

      if (response.quickReplies) {
        setQuickReplies(response.quickReplies);
      }

      setIsTyping(false);
    }, 500);
  }, [inputValue, getKnowledgeResponse]);

  const handleQuickReply = useCallback(
    (reply) => {
      setInputValue(reply);
      handleSendMessage();
    },
    [handleSendMessage]
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return (
    <div className={`fallback-chat ${isMobile ? "mobile" : "desktop"}`}>
      <div className="fallback-header">
        <span>💬 Chat with {agentConfig.displayName}</span>
        <button onClick={onClose} className="close-button">
          ✕
        </button>
      </div>

      <div className="fallback-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <strong>
              {message.sender === "user" ? "You" : agentConfig.displayName}:
            </strong>{" "}
            {message.text}
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">
            {agentConfig.displayName} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {quickReplies.length > 0 && (
        <div className="fallback-quick-replies">
          {quickReplies.slice(0, 4).map((reply, index) => (
            <button
              key={index}
              onClick={() => handleQuickReply(reply)}
              className="quick-reply-button"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      <div className="fallback-input-area">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask about martech, UTM tracking..."
          className="fallback-input"
        />
        <button onClick={handleSendMessage} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
};

/**
 * Main Genius Webchat Integration Component
 * FIXED: Improved FAB visibility and state management
 */
const GeniusWebchatIntegration = ({ agentConfig, onClose, isMobile }) => {
  const { activeAgent } = useClippyContext();
  const [isWebchatOpen, setIsWebchatOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [useFallback, setUseFallback] = useState(false);
  const [botpressError, setBotpressError] = useState(false);
  const [showFAB, setShowFAB] = useState(false);

  // FIXED: Always show FAB when component mounts, regardless of activeAgent initially
  useEffect(() => {
    console.log("🔍 GeniusWebchatIntegration mounted, showing FAB");
    setShowFAB(true);
  }, []);

  // FIXED: Better activeAgent handling
  useEffect(() => {
    console.log("🔍 Active agent changed:", activeAgent);

    if (activeAgent === "Genius") {
      setShowFAB(true);
    } else {
      // Hide chat when switching away from Genius
      setIsWebchatOpen(false);
      setShowFAB(false);
    }
  }, [activeAgent]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log("🌐 Network: Online");
      setIsOnline(true);
      setUseFallback(false);
    };

    const handleOffline = () => {
      console.log("🌐 Network: Offline");
      setIsOnline(false);
      setUseFallback(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Botpress configuration
  const botpressConfig = {
    clientId: process.env.REACT_APP_BOTPRESS_CLIENT_ID,
    hostUrl:
      process.env.REACT_APP_BOTPRESS_HOST_URL ||
      "https://cdn.botpress.cloud/webchat/v3.0",
    messagingUrl:
      process.env.REACT_APP_BOTPRESS_MESSAGING_URL ||
      "https://messaging.botpress.cloud",
    botId: process.env.REACT_APP_BOTPRESS_BOT_ID,
  };

  const handleToggleChat = useCallback(() => {
    console.log("🔍 Toggling chat:", { isWebchatOpen });
    setIsWebchatOpen((prev) => !prev);
  }, [isWebchatOpen]);

  const handleCloseChat = useCallback(() => {
    console.log("🔍 Closing chat");
    setIsWebchatOpen(false);
    if (onClose) onClose();
  }, [onClose]);

  // Check if we should use fallback
  const shouldUseFallback =
    useFallback ||
    !isOnline ||
    botpressError ||
    !botpressConfig.clientId ||
    botpressConfig.clientId === "YOUR_CLIENT_ID_HERE";

  console.log("🔍 GeniusWebchatIntegration render state:", {
    showFAB,
    isWebchatOpen,
    activeAgent,
    shouldUseFallback,
    isOnline,
    botpressError,
  });

  return (
    <>
      {/* Webchat Widget */}
      {isWebchatOpen && (
        <div
          className={`genius-chat-container ${isMobile ? "mobile" : "desktop"}`}
        >
          <BotpressErrorBoundary
            fallback={
              <FallbackChat
                agentConfig={agentConfig}
                onClose={handleCloseChat}
                isMobile={isMobile}
              />
            }
          >
            {shouldUseFallback ? (
              <FallbackChat
                agentConfig={agentConfig}
                onClose={handleCloseChat}
                isMobile={isMobile}
              />
            ) : (
              <Webchat
                clientId={botpressConfig.clientId}
                style={{
                  width: isMobile ? "100vw" : "400px",
                  height: isMobile ? "100vh" : "600px",
                  display: "flex",
                  position: "fixed",
                  bottom: isMobile ? "0" : "90px",
                  right: isMobile ? "0" : "20px",
                  zIndex: 2000, // Higher than .clippy's 1001
                }}
                onError={() => setBotpressError(true)}
              />
            )}
          </BotpressErrorBoundary>
        </div>
      )}

      {/* Floating Action Button - FIXED: Always visible when showFAB is true */}
      {showFAB && !isWebchatOpen && (
        <div
          className="genius-fab"
          onClick={handleToggleChat}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 2100, // Slightly higher than chat widget
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#007cff",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0, 124, 255, 0.4)",
            fontSize: "24px",
            userSelect: "none",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.1)";
            e.target.style.boxShadow = "0 6px 16px rgba(0, 124, 255, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 4px 12px rgba(0, 124, 255, 0.4)";
          }}
          role="button"
          aria-label="Open Genius Chat"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggleChat();
            }
          }}
        >
          💬
        </div>
      )}
    </>
  );
};

export default GeniusWebchatIntegration;
