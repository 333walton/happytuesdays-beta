import React, { useState, useEffect, useRef } from "react";
import { Webchat, Container, useWebchat } from "@botpress/webchat";
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
 * React-based Botpress Chat Widget using v3.0.0 API
 */
const ReactBotpressChatWidget = ({
  onClose,
  agentConfig = {
    displayName: "Genius",
    personality: "professional_marketing_expert",
  },
  conversationStarter = "Hello! I'm Genius, your marketing technology expert. I can help with UTM tracking, analytics setup, campaign optimization, and troubleshooting martech issues. What can I help you with today?",
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const hasTouch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;
      const isMobileWidth = window.innerWidth <= 768;
      const isMobileUA =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(hasTouch && (isMobileWidth || isMobileUA));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Botpress configuration
  const botpressConfig = {
    botId: process.env.REACT_APP_BOTPRESS_BOT_ID || "",
    clientId: process.env.REACT_APP_BOTPRESS_CLIENT_ID || "",
    // Force v3 URLs regardless of env settings
    hostUrl: "https://cdn.botpress.cloud/webchat/v3.0",
    messagingUrl:
      process.env.REACT_APP_BOTPRESS_MESSAGING_URL ||
      "https://messaging.botpress.cloud/",
  };

  // Validate configuration before using
  const hasValidClientId =
    process.env.REACT_APP_BOTPRESS_CLIENT_ID &&
    process.env.REACT_APP_BOTPRESS_CLIENT_ID !== "YOUR_CLIENT_ID_HERE" &&
    process.env.REACT_APP_BOTPRESS_CLIENT_ID.length > 0;

  const hasValidBotId =
    process.env.REACT_APP_BOTPRESS_BOT_ID &&
    process.env.REACT_APP_BOTPRESS_BOT_ID !== "YOUR_BOT_ID_HERE" &&
    process.env.REACT_APP_BOTPRESS_BOT_ID.length > 0;

  const hasValidConfig = hasValidClientId && hasValidBotId;

  // Log configuration status for debugging
  useEffect(() => {
    console.log("Botpress Configuration Status:", {
      hasValidClientId,
      hasValidBotId,
      hasValidConfig,
      clientIdLength: process.env.REACT_APP_BOTPRESS_CLIENT_ID?.length || 0,
      botIdLength: process.env.REACT_APP_BOTPRESS_BOT_ID?.length || 0,
    });
  }, [hasValidClientId, hasValidBotId, hasValidConfig]);

  // Use the webchat connection state only if we have valid config
  const { client, clientState } = useWebchat({
    clientId: hasValidConfig ? botpressConfig.clientId : undefined,
  });

  // Custom styling (Windows 98/classic theme)
  const customStyle = `
    .bpw-floating-button,
    .bpw-widget-launcher,
    .bpw-bot-avatar,
    .bpw-header-icon,
    .bpw-header-title,
    .bpw-header-subtitle,
    .bpw-powered {
      display: none !important;
    }
    .bpw-layout {
      width: 100% !important;
      height: 100% !important;
      background-color: #c0c0c0 !important;
      border: none !important;
      border-radius: 0 !important;
      position: relative !important;
    }
    .bpw-header-container { display: none !important; }
    .bpw-chat-container {
      background: white !important;
      border: 1px inset #999 !important;
      margin: 4px !important;
      font-family: 'Tahoma', sans-serif !important;
      font-size: 11px !important;
      scrollbar-width: auto !important;
    }
    .bpw-from-bot .bpw-chat-bubble {
      background-color: #f0f0f0 !important;
      color: #000000 !important;
      border-radius: 0 !important;
      font-family: 'Tahoma', sans-serif !important;
      font-size: 11px !important;
    }
    .bpw-from-user .bpw-chat-bubble {
      background-color: #000080 !important;
      color: #ffffff !important;
      border-radius: 0 !important;
      font-family: 'Tahoma', sans-serif !important;
      font-size: 11px !important;
    }
    .bpw-composer {
      background-color: #f0f0f0 !important;
      border: none !important;
      border-top: 1px solid #808080 !important;
      padding: 4px 8px !important;
    }
    .bpw-composer-inner {
      background: transparent !important;
      border: none !important;
      padding: 0 !important;
    }
    .bpw-composer textarea {
      background: white !important;
      border: 1px inset #999 !important;
      border-radius: 0 !important;
      padding: 4px 6px !important;
      font-family: 'MS Sans Serif', sans-serif !important;
      font-size: 11px !important;
      resize: none !important;
      min-height: 24px !important;
    }
    .bpw-send-button {
      background-color: #c0c0c0 !important;
      border: 1px outset #c0c0c0 !important;
      border-radius: 0 !important;
      padding: 4px 12px !important;
      min-width: 50px !important;
      color: #000 !important;
    }
    .bpw-send-button:hover:enabled {
      background-color: #d0d0d0 !important;
    }
    .bpw-send-button:active:enabled {
      border: 1px inset #c0c0c0 !important;
    }
    .bpw-keyboard-single-choice {
      background-color: #e0e0e0 !important;
      border: 1px outset #e0e0e0 !important;
      border-radius: 0 !important;
      font-size: 9px !important;
      padding: 1px 4px !important;
      margin: 2px !important;
      font-family: 'MS Sans Serif', sans-serif !important;
    }
    .bpw-keyboard-single-choice:hover {
      background-color: #d0d0d0 !important;
    }
    .bpw-keyboard-single-choice:active {
      border: 1px inset #e0e0e0 !important;
    }
    .bpw-chat-container::-webkit-scrollbar {
      width: 16px !important;
    }
    .bpw-chat-container::-webkit-scrollbar-track {
      background: #c0c0c0 !important;
    }
    .bpw-chat-container::-webkit-scrollbar-thumb {
      background: #808080 !important;
      border: 1px outset #c0c0c0 !important;
    }
    @media (max-width: 768px) {
      .bpw-composer textarea {
        font-size: 16px !important;
        min-height: 44px !important;
        padding: 12px !important;
      }
      .bpw-send-button {
        min-width: 60px !important;
        min-height: 44px !important;
        padding: 12px 20px !important;
        font-size: 14px !important;
      }
      .bpw-keyboard-single-choice {
        font-size: 12px !important;
        padding: 8px 12px !important;
        min-height: 36px !important;
      }
      .bpw-chat-container {
        font-size: 14px !important;
      }
      .bpw-from-bot .bpw-chat-bubble,
      .bpw-from-user .bpw-chat-bubble {
        font-size: 14px !important;
      }
    }
  `;

  // Fallback timeout
  //useEffect(() => {
  //const timeout = setTimeout(() => {
  //if (!isLoaded && hasValidConfig) {
  //setShowFallback(true);
  //}
  //}, 5000);
  //return () => clearTimeout(timeout);
  //}, [isLoaded, hasValidConfig]);

  // Custom header component
  const CustomHeader = () => (
    <div
      style={{
        backgroundColor: "#000080",
        color: "white",
        padding: "4px 8px",
        fontSize: "11px",
        fontWeight: "bold",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #808080",
        minHeight: isMobile ? "44px" : "20px",
      }}
    >
      <span>💬 Chat with {agentConfig.displayName}</span>
      <button
        onClick={onClose}
        style={{
          backgroundColor: "transparent",
          border: "none",
          color: "white",
          fontSize: "12px",
          cursor: "pointer",
          padding: isMobile ? "8px 12px" : "2px 6px",
          minHeight: isMobile ? "32px" : "20px",
          minWidth: isMobile ? "44px" : "20px",
        }}
        onMouseEnter={(e) =>
          !isMobile && (e.target.style.backgroundColor = "#ff0000")
        }
        onMouseLeave={(e) =>
          !isMobile && (e.target.style.backgroundColor = "transparent")
        }
        aria-label="Close chat"
      >
        ✕
      </button>
    </div>
  );

  // Fallback chat UI
  const FallbackChat = () => {
    const [messages, setMessages] = useState([
      {
        id: Date.now(),
        text: conversationStarter,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
      if (!inputValue.trim()) return;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: inputValue,
          sender: "user",
          timestamp: new Date(),
        },
      ]);
      setInputValue("");
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: !hasValidConfig
              ? "Please configure Botpress with valid Bot ID and Client ID in your environment variables. Check the console for more details."
              : "I apologize, but I'm currently unable to connect to the main chat service. Please try again later or contact support if the issue persists.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 1000);
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          backgroundColor: "#c0c0c0",
          border: isMobile ? "none" : "2px outset #c0c0c0",
          fontFamily: "MS Sans Serif, Tahoma, sans-serif",
          fontSize: "11px",
        }}
      >
        <CustomHeader />
        <div
          style={{
            flex: 1,
            overflow: "auto",
            backgroundColor: "white",
            border: "1px inset #999",
            margin: "4px",
            padding: "8px",
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                marginBottom: "8px",
                textAlign: message.sender === "user" ? "right" : "left",
                color: message.sender === "user" ? "#000080" : "#000",
              }}
            >
              <strong>
                {message.sender === "user" ? "You" : agentConfig.displayName}:
              </strong>{" "}
              {message.text}
            </div>
          ))}
          {isTyping && (
            <div style={{ color: "#666", fontStyle: "italic" }}>
              {agentConfig.displayName} is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
          {!hasValidConfig && (
            <div
              style={{
                marginTop: "20px",
                padding: "10px",
                backgroundColor: "#ffffe0",
                border: "1px solid #808080",
                fontSize: "10px",
              }}
            >
              <strong>Setup Required:</strong>
              <br />
              1. Create a .env file in your project root
              <br />
              2. Add: REACT_APP_BOTPRESS_BOT_ID=your-bot-id
              <br />
              3. Add: REACT_APP_BOTPRESS_CLIENT_ID=your-client-id
              <br />
              4. Get these values from your Botpress Cloud dashboard
              <br />
              5. Restart your development server
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: "4px",
            padding: "4px 8px",
            backgroundColor: "#f0f0f0",
            borderTop: "1px solid #808080",
          }}
        >
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: isMobile ? "12px" : "4px 6px",
              border: "1px inset #999",
              fontSize: isMobile ? "16px" : "11px",
              fontFamily: "MS Sans Serif, sans-serif",
              backgroundColor: "#fff",
              outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            style={{
              padding: isMobile ? "12px 20px" : "4px 12px",
              backgroundColor: "#c0c0c0",
              border: "1px outset #c0c0c0",
              fontSize: isMobile ? "14px" : "11px",
              cursor: "pointer",
              fontFamily: "MS Sans Serif, sans-serif",
            }}
          >
            Send
          </button>
        </div>
      </div>
    );
  };

  // Show fallback if no valid configuration or loading failed
  if (!hasValidConfig || showFallback) {
    return <FallbackChat />;
  }

  // Main render with proper Webchat configuration
  return (
    <Container
      connected={clientState !== "disconnected"}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#c0c0c0",
        border: isMobile ? "none" : "2px outset #c0c0c0",
        boxShadow: isMobile ? "none" : "2px 2px 4px rgba(0,0,0,0.3)",
        overflow: "hidden",
      }}
    >
      <CustomHeader />
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <style>{customStyle}</style>
        <Webchat
          botId={botpressConfig.botId}
          config={{
            clientId: botpressConfig.clientId,
            hostUrl: botpressConfig.hostUrl,
            messagingUrl: botpressConfig.messagingUrl,
          }}
          onInit={() => {
            console.log("Botpress initialized successfully");
            setIsLoaded(true);
          }}
          onError={(error) => {
            console.error("Botpress initialization failed:", error);
            setShowFallback(true);
          }}
        />
      </div>
    </Container>
  );
};

export default ReactBotpressChatWidget;
