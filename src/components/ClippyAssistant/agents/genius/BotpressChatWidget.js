/**
 * BotpressChatWidget - Core Botpress Webchat integration with Windows 98 styling
 *
 * This component wraps the Botpress Webchat widget and applies retro Windows 98
 * styling while maintaining mobile-first responsiveness and accessibility.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  MARTECH_KNOWLEDGE,
  getTroubleshootingSteps,
} from "../data/KnowledgeBase";

const BotpressChatWidget = ({
  agentConfig,
  conversationStarter,
  quickReplies = [],
  position,
  onClose,
  ...props
}) => {
  const chatContainerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Check if mobile device
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;

  // Initialize chat on mount
  useEffect(() => {
    if (conversationStarter) {
      setMessages([
        {
          id: Date.now(),
          text: conversationStarter,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
    setIsLoaded(true);
  }, [conversationStarter]);

  // Calculate position for chat widget
  const calculatePosition = () => {
    console.log("🔍 BotpressChatWidget calculatePosition called");

    if (position) {
      console.log("🔍 Using provided position:", position);
      return position;
    }

    // Use similar positioning logic as existing ChatBalloon
    const clippyEl = document.querySelector(".clippy");
    const overlayEl = document.getElementById("clippy-clickable-overlay");

    console.log("🔍 Elements found:", {
      clippyEl: !!clippyEl,
      overlayEl: !!overlayEl,
      isMobile,
    });

    if (clippyEl) {
      const clippyRect = clippyEl.getBoundingClientRect();
      const overlayRect = overlayEl
        ? overlayEl.getBoundingClientRect()
        : clippyRect;

      const chatWidth = isMobile ? Math.min(330, window.innerWidth - 16) : 330;
      const chatHeight = isMobile
        ? Math.min(200, window.innerHeight - 100)
        : 200;

      let calculatedPosition;
      if (isMobile) {
        calculatedPosition = {
          left: window.innerWidth - chatWidth - 14,
          top: overlayRect.top - chatHeight - 1,
          width: chatWidth,
          height: chatHeight,
        };
      } else {
        // FIXED: Desktop positioning with viewport constraints
        const desktop =
          document.querySelector(".desktop.screen") ||
          document.querySelector(".desktop") ||
          document.querySelector(".w98");

        let viewportWidth,
          viewportHeight,
          viewportLeft = 0,
          viewportTop = 0;

        if (desktop) {
          const desktopRect = desktop.getBoundingClientRect();
          viewportWidth = desktopRect.width;
          viewportHeight = desktopRect.height;
          viewportLeft = desktopRect.left;
          viewportTop = desktopRect.top;
          console.log("🔍 Desktop viewport found:", desktopRect);
        } else {
          viewportWidth = window.innerWidth;
          viewportHeight = window.innerHeight;
          console.log("🔍 Using window viewport:", {
            viewportWidth,
            viewportHeight,
          });
        }

        // UNIVERSAL: Apply universal chat positioning rule with desktop adjustment
        const safeMargin = -300; // Keep user's working horizontal fix
        let left = viewportLeft + safeMargin; // Keep existing horizontal positioning
        let top = overlayRect.top - chatHeight - 250; // Adjusted: higher positioning for desktop (was -1, now -250)

        // Ensure the chat doesn't extend beyond the desktop right edge (horizontal only)
        const maxLeft =
          viewportLeft + viewportWidth - chatWidth - Math.abs(safeMargin);
        if (left > maxLeft) {
          left = maxLeft;
        }

        console.log(
          "🔍 UNIVERSAL positioning - following standard chat balloon rule:",
          {
            viewportLeft,
            viewportWidth,
            safeMargin,
            horizontalLeft: left,
            verticalTop: top,
            overlayTop: overlayRect.top,
            chatWidth,
            chatHeight,
            rule: "overlayRect.top - chatHeight - 1",
            desktopRightEdge: viewportLeft + viewportWidth,
            chatRightEdge: left + chatWidth,
            marginFromRightEdge:
              viewportLeft + viewportWidth - (left + chatWidth),
          }
        );

        calculatedPosition = {
          left,
          top,
          width: chatWidth,
          height: chatHeight,
        };
      }

      console.log("🔍 Calculated position:", calculatedPosition);
      return calculatedPosition;
    }

    // Fallback position
    const fallbackPosition = {
      left: isMobile ? 14 : 100,
      top: isMobile ? 100 : 100,
      width: isMobile ? Math.min(330, window.innerWidth - 28) : 330,
      height: 200,
    };

    console.log("🔍 Using fallback position:", fallbackPosition);
    return fallbackPosition;
  };

  // Handle sending messages
  const handleSendMessage = async (messageText = inputValue) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate Genius agent response with martech knowledge
    setTimeout(() => {
      const botResponse = generateGeniusResponse(messageText);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  };

  // Generate intelligent Genius responses using knowledge base
  const generateGeniusResponse = (userInput) => {
    const input = userInput.toLowerCase();

    // Check for martech troubleshooting keywords
    const troubleshootingSteps = getTroubleshootingSteps(input);
    if (troubleshootingSteps.length > 0) {
      return `Here's what I'd check for that issue:\n\n${troubleshootingSteps
        .slice(0, 3)
        .map((step, i) => `${i + 1}. ${step}`)
        .join("\n")}`;
    }

    // UTM parameter help
    if (input.includes("utm")) {
      const utmInfo = MARTECH_KNOWLEDGE.utm_parameters;
      if (input.includes("setup") || input.includes("how")) {
        return `Here's a quick UTM setup guide:\n\n${utmInfo.setup_guide
          .slice(0, 3)
          .join("\n")}`;
      }
      return "UTM parameters are crucial for tracking! What specific UTM issue are you facing - setup, tracking, or troubleshooting?";
    }

    // Google Analytics help
    if (input.includes("analytics") || input.includes("ga4")) {
      return "Google Analytics can be tricky! Are you having issues with tracking setup, e-commerce data, or cross-domain tracking? I can help troubleshoot specific problems.";
    }

    // Facebook/Meta pixel help
    if (
      input.includes("pixel") ||
      input.includes("facebook") ||
      input.includes("meta")
    ) {
      return "Pixel tracking issues are common! The most frequent problems are: pixel not firing, duplicate installations, or iOS 14.5+ privacy changes. What specifically are you seeing?";
    }

    // Google Ads help
    if (
      input.includes("google ads") ||
      input.includes("adwords") ||
      input.includes("ppc")
    ) {
      return "Google Ads optimization is my specialty! Are you looking to improve Quality Score, reduce CPA, increase ROAS, or debug conversion tracking?";
    }

    // Attribution modeling
    if (input.includes("attribution")) {
      return "Attribution modeling can make or break your marketing analysis! Are you working with first-touch, last-touch, or trying to implement data-driven attribution?";
    }

    // Campaign optimization
    if (input.includes("campaign") || input.includes("optimize")) {
      return "Let's optimize those campaigns! I'd recommend checking: CTR trends, Quality Score, landing page experience, and conversion data. What metrics are you most concerned about?";
    }

    // General greetings
    if (
      input.includes("hello") ||
      input.includes("hi") ||
      input.includes("hey")
    ) {
      return "Hello! I'm Genius, your martech specialist. I can help with Google Ads, Facebook pixels, UTM tracking, analytics setup, and campaign optimization. What's challenging you today?";
    }

    // Default helpful response
    const responses = [
      "That's an interesting challenge! In martech, I usually start by checking the data flow - from tracking pixels to analytics platforms. What specific metrics are you seeing?",
      "Good question! For most marketing tech issues, I recommend the diagnostic approach: check tracking first, then attribution, then optimization. What's your primary concern?",
      "I see! Marketing technology can be complex. Are you dealing with tracking setup, data accuracy, campaign performance, or integration issues?",
      "Let me help you troubleshoot that! In my experience, most martech problems fall into these categories: tracking pixels, UTM parameters, analytics configuration, or attribution modeling. Which area?",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Handle quick reply clicks
  const handleQuickReply = (replyText) => {
    handleSendMessage(replyText);
  };

  const chatPosition = calculatePosition();

  if (!isLoaded) {
    console.log("🔍 BotpressChatWidget not loaded yet");
    return null;
  }

  console.log("🔍 BotpressChatWidget rendering with position:", chatPosition);

  return (
    <div
      ref={chatContainerRef}
      className="botpress-chat-widget"
      style={{
        position: "fixed",
        left: `${chatPosition.left}px`,
        top: `${chatPosition.top}px`,
        width: `${chatPosition.width}px`,
        height: `${chatPosition.height}px`,
        zIndex: 9999,
        fontFamily: "'MS Sans Serif', 'Tahoma', sans-serif",
        fontSize: "11px",
        backgroundColor: "#c0c0c0",
        border: "2px outset #c0c0c0",
        borderRadius: "0",
        boxShadow: "2px 2px 4px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Chat Header */}
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
            padding: "2px 6px",
            borderRadius: "2px",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#ff0000")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
        >
          ✕
        </button>
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          padding: "8px",
          backgroundColor: "white",
          overflowY: "auto",
          borderBottom: "1px solid #808080",
          minHeight: "120px",
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: "8px",
              textAlign: message.sender === "user" ? "right" : "left",
            }}
          >
            <div
              style={{
                display: "inline-block",
                maxWidth: "80%",
                padding: "4px 8px",
                backgroundColor:
                  message.sender === "user" ? "#e3f2fd" : "#f5f5f5",
                border: "1px solid #999",
                borderRadius: "3px",
                fontSize: "11px",
                lineHeight: "1.3",
                whiteSpace: "pre-line",
              }}
            >
              <strong>
                {message.sender === "user"
                  ? "You"
                  : agentConfig.emoji + " Genius"}
                :
              </strong>{" "}
              {message.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div
            style={{ textAlign: "left", fontStyle: "italic", color: "#666" }}
          >
            🏎️ Genius is analyzing...
          </div>
        )}
      </div>

      {/* Quick Replies */}
      {quickReplies.length > 0 && (
        <div
          style={{
            padding: "4px 8px",
            backgroundColor: "#f0f0f0",
            borderBottom: "1px solid #808080",
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
          }}
        >
          {quickReplies.slice(0, 3).map((reply, index) => (
            <button
              key={index}
              onClick={() => handleQuickReply(reply)}
              style={{
                fontSize: "10px",
                padding: "2px 6px",
                backgroundColor: "#e0e0e0",
                border: "1px outset #e0e0e0",
                cursor: "pointer",
                borderRadius: "0",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#d0d0d0")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#e0e0e0")}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div
        style={{
          padding: "6px 8px",
          backgroundColor: "#f0f0f0",
          display: "flex",
          gap: "6px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask about martech, UTM tracking, or campaigns..."
          style={{
            flex: 1,
            padding: "4px 6px",
            border: "1px inset #999",
            fontSize: "11px",
            fontFamily: "'MS Sans Serif', sans-serif",
            backgroundColor: "#fff",
            outline: "none",
            borderRadius: "0",
          }}
        />
        <button
          onClick={() => handleSendMessage()}
          style={{
            padding: "4px 12px",
            backgroundColor: "#c0c0c0",
            border: "1px outset #c0c0c0",
            fontSize: "11px",
            cursor: "pointer",
            fontFamily: "'MS Sans Serif', sans-serif",
            borderRadius: "0",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#d0d0d0")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#c0c0c0")}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default BotpressChatWidget;
