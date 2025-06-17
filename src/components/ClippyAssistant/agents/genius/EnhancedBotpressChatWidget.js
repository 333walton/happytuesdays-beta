import React, { useState, useEffect, useRef, useCallback } from "react";
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
 * Enhanced Botpress Chat Widget with Windows 98 styling and martech expertise
 * Integrates real Botpress API with intelligent fallback to knowledge base
 */
const EnhancedBotpressChatWidget = ({
  onClose,
  agentConfig = {
    displayName: "Genius",
    personality: "professional_marketing_expert",
  },
  conversationStarter = "Hello! I'm Genius, your marketing technology expert. I can help with UTM tracking, analytics setup, campaign optimization, and troubleshooting martech issues. What can I help you with today?",
}) => {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [quickReplies, setQuickReplies] = useState([
    "UTM tracking help",
    "Analytics setup",
    "Campaign optimization",
    "Pixel troubleshooting",
  ]);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Refs
  const botpressWebchatRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Enhanced knowledge response using rich prewritten content
  const getKnowledgeResponse = useCallback(
    (messageText, personality, agentConfigData) => {
      // Fix: Properly detect Genius agent based on name/role, not just personality
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

      // FIXED: Specific matches first, then general ones

      // Quick reply specific responses - MUST BE FIRST
      if (
        lowerMessage.includes("fix tracking") ||
        messageText === "Fix tracking pixels"
      ) {
        return {
          text: `🔧 Pixel Troubleshooting Checklist:\n\n1. Check if pixel fires in browser dev tools\n2. Verify pixel helper shows 'active'\n3. Test conversion events in test mode\n4. Check for duplicate installations\n5. Review iOS 14.5+ privacy settings\n\nWhich step needs more detail?`,
          quickReplies: [
            "Dev tools help",
            "iOS issues",
            "Conversion events",
            "More steps",
          ],
        };
      }

      if (messageText === "More help" || lowerMessage.includes("more help")) {
        return {
          text: `🛠️ I can help with many martech topics:\n\n• UTM parameter setup and troubleshooting\n• Facebook Pixel and Google Ads tracking\n• Google Analytics configuration\n• Campaign performance optimization\n• Attribution modeling issues\n\nWhat specific area interests you?`,
          quickReplies: [
            "UTM tracking help",
            "Analytics setup",
            "Campaign optimization",
            "Pixel troubleshooting",
          ],
        };
      }

      if (
        lowerMessage.includes("google ads") ||
        messageText === "Google Ads help"
      ) {
        return {
          text: `🎯 Google Ads Optimization:\n\n📊 Performance Analysis:\n• Check Quality Score (aim for 7+)\n• Review search terms report\n• Analyze device/location performance\n\n⚡ Quick Wins:\n• Add negative keywords\n• Test ad copy variations\n• Optimize landing page speed\n\nWhat specific area needs attention?`,
          quickReplies: [
            "Quality Score",
            "Negative keywords",
            "Ad copy",
            "Landing pages",
          ],
        };
      }

      // Replace hardcoded responses with dynamic generation from MARTECH_KNOWLEDGE
      if (messageText === "UTM setup") {
        const utmKnowledge = MARTECH_KNOWLEDGE.utm_parameters;
        return {
          text: `🏷️ UTM Parameter Setup Guide:\n\n✅ Required Parameters:\n• ${utmKnowledge.setup_guide
            .slice(0, 3)
            .join(
              "\n• "
            )}\n\n💡 Need help with common issues or best practices?`,
          quickReplies: [
            "Common issues",
            "Best practices",
            "Examples",
            "More help",
          ],
        };
      }

      // General topic responses - AFTER specific matches
      if (
        lowerMessage.includes("utm") ||
        (lowerMessage.includes("tracking") && !lowerMessage.includes("fix"))
      ) {
        const utmKnowledge = MARTECH_KNOWLEDGE.utm_parameters;
        return {
          text: `🎯 UTM Parameter Expert Advice:\n\n${utmKnowledge.setup_guide
            .slice(0, 3)
            .join("\n• ")}\n\n💡 Common Issues:\n• ${utmKnowledge.common_issues
            .slice(0, 2)
            .join("\n• ")}\n\nNeed help with a specific UTM issue?`,
          quickReplies: getQuickReplies(agent).slice(0, 4),
        };
      }

      if (
        lowerMessage.includes("pixel") ||
        lowerMessage.includes("facebook") ||
        lowerMessage.includes("google ads")
      ) {
        const pixelKnowledge = MARTECH_KNOWLEDGE.tracking_pixels;
        return {
          text: `🔍 Tracking Pixel Troubleshooting:\n\n📘 Facebook Pixel Setup:\n• ${pixelKnowledge.facebook_pixel
            .slice(0, 2)
            .join(
              "\n• "
            )}\n\n🎯 Google Ads Tracking:\n• ${pixelKnowledge.google_ads_pixel
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

      if (
        lowerMessage.includes("analytics") ||
        lowerMessage.includes("ga4") ||
        lowerMessage.includes("google analytics")
      ) {
        const analyticsKnowledge = MARTECH_KNOWLEDGE.google_analytics;
        return {
          text: `📊 Google Analytics Expert Help:\n\n🔧 Setup Priorities:\n• ${analyticsKnowledge.setup_priorities
            .slice(0, 3)
            .join(
              "\n• "
            )}\n\n🚨 Common Issues:\n• ${analyticsKnowledge.common_issues
            .slice(0, 2)
            .join("\n• ")}\n\nWhich analytics challenge can I help solve?`,
          quickReplies: [
            "GA4 setup",
            "E-commerce tracking",
            "Attribution",
            "More help",
          ],
        };
      }

      if (
        lowerMessage.includes("campaign") ||
        lowerMessage.includes("optimization") ||
        lowerMessage.includes("performance")
      ) {
        const campaignKnowledge = MARTECH_KNOWLEDGE.campaign_analysis;
        return {
          text: `🚀 Campaign Optimization Guide:\n\n📈 Key Metrics to Watch:\n• ${campaignKnowledge.key_metrics
            .slice(0, 3)
            .join("\n• ")}\n\n⚠️ Red Flags:\n• ${campaignKnowledge.red_flags
            .slice(0, 2)
            .join("\n• ")}\n\nWhat aspect of your campaign needs optimization?`,
          quickReplies: [
            "CTR issues",
            "CPA optimization",
            "Quality Score",
            "More tips",
          ],
        };
      }

      if (
        lowerMessage.includes("attribution") ||
        lowerMessage.includes("model")
      ) {
        const attributionKnowledge = MARTECH_KNOWLEDGE.attribution_modeling;
        return {
          text: `🎯 Attribution Modeling Explained:\n\n🔍 Attribution Models:\n• ${attributionKnowledge.models_explained
            .slice(0, 3)
            .join(
              "\n• "
            )}\n\n🛠️ Debugging Tips:\n• ${attributionKnowledge.debugging_attribution
            .slice(0, 2)
            .join("\n• ")}\n\nWhich attribution challenge are you facing?`,
          quickReplies: [
            "Model selection",
            "Debug attribution",
            "Cross-device",
            "More help",
          ],
        };
      }

      // Try general knowledge search
      const searchResults = searchKnowledge(agent, messageText);
      console.log("🔍 Knowledge search results:", searchResults);

      if (searchResults.length > 0) {
        const result = searchResults[0];
        return {
          text: `📚 From my knowledge base:\n\n${
            Array.isArray(result.content)
              ? result.content.slice(0, 3).join("\n• ")
              : result.content
          }`,
          quickReplies: getQuickReplies(agent).slice(0, 4),
        };
      }

      // Fallback to agent-specific response
      return {
        text:
          getFallbackMessage(agent) ||
          "I'm here to help with marketing technology questions! I specialize in UTM tracking, analytics setup, campaign optimization, and troubleshooting martech issues. What specific area can I assist you with?",
        quickReplies: getQuickReplies(agent),
      };
    },
    []
  );

  // Device detection
  const isMobile =
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Position calculation with improved desktop viewport detection
  const calculateChatPosition = useCallback(() => {
    const chatWidth = isMobile ? Math.min(330, window.innerWidth - 16) : 330;
    const chatHeight = isMobile ? Math.min(280, window.innerHeight - 150) : 230;

    console.log("🔍 Calculating chat position:", {
      isMobile,
      chatWidth,
      chatHeight,
    });

    let viewportWidth,
      viewportHeight,
      viewportLeft = 0,
      viewportTop = 0;

    if (isMobile) {
      viewportWidth = window.visualViewport?.width || window.innerWidth;
      viewportHeight = window.visualViewport?.height || window.innerHeight;
      viewportLeft = window.visualViewport?.offsetLeft || 0;
      viewportTop = window.visualViewport?.offsetTop || 0;
    } else {
      // Enhanced desktop viewport detection
      const desktop =
        document.querySelector(".desktop.screen") ||
        document.querySelector(".desktop") ||
        document.querySelector(".w98") ||
        document.querySelector("body");

      if (desktop && desktop !== document.querySelector("body")) {
        const desktopRect = desktop.getBoundingClientRect();
        viewportWidth = desktopRect.width;
        viewportHeight = desktopRect.height;
        viewportLeft = desktopRect.left;
        viewportTop = desktopRect.top;
        console.log("📺 Using desktop container:", {
          viewportWidth,
          viewportHeight,
          viewportLeft,
          viewportTop,
        });
      } else {
        // Fallback to window dimensions
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
        viewportLeft = 0;
        viewportTop = 0;
        console.log("📺 Using window viewport:", {
          viewportWidth,
          viewportHeight,
        });
      }
    }

    const clippyEl = document.querySelector(".clippy");
    const overlayEl = document.getElementById("clippy-clickable-overlay");

    console.log("🧙‍♂️ Clippy elements found:", {
      clippyEl: !!clippyEl,
      overlayEl: !!overlayEl,
    });

    if (clippyEl) {
      const clippyRect = clippyEl.getBoundingClientRect();
      const overlayRect = overlayEl
        ? overlayEl.getBoundingClientRect()
        : clippyRect;

      console.log("📍 Clippy position:", {
        clippyRect: {
          left: clippyRect.left,
          top: clippyRect.top,
          width: clippyRect.width,
          height: clippyRect.height,
        },
        overlayRect: {
          left: overlayRect.left,
          top: overlayRect.top,
          width: overlayRect.width,
          height: overlayRect.height,
        },
      });

      let left = clippyRect.left + clippyRect.width / 2 - chatWidth / 2;
      let top = overlayRect.top - chatHeight - 1;

      console.log("💭 Initial calculated position:", { left, top });

      // Constrain to viewport horizontally with more conservative margins
      const horizontalMargin = 40; // Increased margin for better visibility
      const verticalMargin = 30; // Increased margin for better visibility

      const minLeft = viewportLeft + horizontalMargin;
      const maxLeft =
        viewportLeft + viewportWidth - chatWidth - horizontalMargin;
      left = Math.max(minLeft, Math.min(left, maxLeft));

      // Constrain to viewport vertically
      const minTop = viewportTop + verticalMargin;
      const maxTop = viewportTop + viewportHeight - chatHeight - verticalMargin;
      top = Math.max(minTop, Math.min(top, maxTop));

      console.log("✅ Final constrained position:", {
        left,
        top,
        constraints: { minLeft, maxLeft, minTop, maxTop },
      });

      return { left, top, width: chatWidth, height: chatHeight };
    }

    // Enhanced fallback position for desktop
    const fallbackLeft = isMobile
      ? 14
      : Math.max(50, (viewportWidth - chatWidth) / 2);
    const fallbackTop = isMobile
      ? 100
      : Math.max(50, (viewportHeight - chatHeight) / 2);

    console.log("⚠️ Using fallback position:", { fallbackLeft, fallbackTop });

    return {
      left: fallbackLeft,
      top: fallbackTop,
      width: chatWidth,
      height: chatHeight,
    };
  }, [isMobile]);

  const [chatPosition, setChatPosition] = useState(calculateChatPosition);

  // Handle keyboard visibility for mobile
  useEffect(() => {
    if (isMobile && window.visualViewport) {
      const handleViewportChange = () => {
        const currentHeight = window.visualViewport.height;
        const isKeyboardVisible = currentHeight < window.innerHeight * 0.8;
        setIsKeyboardOpen(isKeyboardVisible);

        // Recalculate position when keyboard state changes
        setChatPosition(calculateChatPosition());
      };

      window.visualViewport.addEventListener("resize", handleViewportChange);
      return () =>
        window.visualViewport.removeEventListener(
          "resize",
          handleViewportChange
        );
    }
  }, [isMobile, calculateChatPosition]);

  // Add message to chat
  const addMessage = useCallback((text, sender) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);

    // Auto-scroll to bottom
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }, 100);
  }, []);

  // Handle sending messages with enhanced debugging
  const handleSendMessage = useCallback(
    async (messageText = inputValue.trim()) => {
      if (!messageText) {
        console.log("❌ No message text provided");
        return;
      }

      // Add user message immediately
      addMessage(messageText, "user");
      setInputValue("");
      setIsTyping(true);

      // Always use knowledge base (skip Botpress for now to debug)
      console.log("🧠 Using knowledge base fallback");

      try {
        const response = getKnowledgeResponse(
          messageText,
          agentConfig.personality,
          agentConfig
        );

        // Add a dynamic fallback for unmatched inputs
        if (!response) {
          return {
            text: "I'm not sure how to respond to that. Here are some things I can help with:",
            quickReplies: [
              "UTM tracking help",
              "Analytics setup",
              "Campaign optimization",
              "Pixel troubleshooting",
            ],
          };
        }

        console.log("💬 Generated response:", response);

        setTimeout(() => {
          addMessage(response.text, "bot");

          // Update quick replies based on response
          if (response.quickReplies && response.quickReplies.length > 0) {
            console.log("🔄 Updating quick replies:", response.quickReplies);
            setQuickReplies(response.quickReplies);
          }

          setIsTyping(false);
          console.log("✅ Response complete");
        }, 500); // Reduced delay for faster response
      } catch (error) {
        // Error handling for the typing indicator
        console.error("❌ Error in knowledge response:", error);
        setMessages((prev) => [
          ...prev,
          { text: "Sorry, something went wrong. Please try again." },
        ]);
        setIsTyping(false);
      }
    },
    [inputValue, addMessage, agentConfig.personality, getKnowledgeResponse]
  );

  // Handle quick reply clicks
  const handleQuickReply = useCallback(
    (replyText) => {
      console.log("Quick reply clicked:", replyText);
      handleSendMessage(replyText);
    },
    [handleSendMessage]
  );

  // Handle Botpress events
  const handleBotpressEvent = (event, data) => {
    switch (event) {
      case "MESSAGE.RECEIVED":
        addMessage(data.text, "bot");
        setIsTyping(false);
        break;
      case "MESSAGE.SENT":
        setIsTyping(true);
        break;
      case "TYPING.ON":
        setIsTyping(true);
        break;
      case "TYPING.OFF":
        setIsTyping(false);
        break;
      case "WEBCHAT.READY":
        console.log("Botpress webchat is ready");
        break;
      case "CONVERSATION.STARTED":
        console.log("Botpress conversation started");
        break;
      default:
        console.log("Unhandled Botpress event:", event, data);
        break;
    }
  };

  // Initialize chat with intro message and Botpress
  useEffect(() => {
    console.log("🚀 Initializing Enhanced Botpress Chat Widget");

    // Show intro message immediately
    const initialMessage = conversationStarter;
    setMessages([
      {
        id: Date.now(),
        text: initialMessage,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
    setIsLoaded(true);

    // Try to load Botpress in background
    const initializeBotpress = async () => {
      try {
        if (!window.botpressWebChat) {
          const script = document.createElement("script");
          script.src = "https://cdn.botpress.cloud/webchat/v1/inject.js";
          script.async = true;

          script.onload = () => {
            if (window.botpressWebChat) {
              configureBotpress();
            }
          };

          script.onerror = () => {
            console.log(
              "Botpress failed to load, continuing with simulation mode"
            );
          };

          document.head.appendChild(script);
        } else {
          configureBotpress();
        }
      } catch (error) {
        console.error("Failed to initialize Botpress:", error);
      }
    };

    const configureBotpress = () => {
      try {
        if (!window.botpressWebChat) return;

        window.botpressWebChat.init({
          botId: process.env.REACT_APP_BOTPRESS_BOT_ID || "demo-bot",
          hostUrl:
            process.env.REACT_APP_BOTPRESS_HOST_URL ||
            "https://cdn.botpress.cloud/webchat/v1",
          messagingUrl:
            process.env.REACT_APP_BOTPRESS_MESSAGING_URL ||
            "https://messaging.botpress.cloud",
          clientId: process.env.REACT_APP_BOTPRESS_CLIENT_ID || "demo-client",
          hideWidget: true,
          disableAnimations: false,
          showConversationButton: false,
          enableTranscriptDownload: false,
          enableArrowNavigation: true,
          stylesheet:
            "data:text/css;base64;" +
            btoa(`
            .bpw-layout { display: none !important; }
            .bpw-widget-btn { display: none !important; }
          `),
          onEvent: (event, data) => {
            handleBotpressEvent(event, data);
          },
        });

        botpressWebchatRef.current = window.botpressWebChat;
        console.log("✅ Botpress configured successfully");
      } catch (error) {
        console.error("Error configuring Botpress:", error);
      }
    };

    initializeBotpress();
  }, [conversationStarter, addMessage]);

  // Handle input key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isLoaded) {
    return (
      <div
        style={{
          position: "fixed",
          left: `${chatPosition.left}px`,
          top: `${chatPosition.top}px`,
          width: `${chatPosition.width}px`,
          height: "60px",
          backgroundColor: "#c0c0c0",
          border: "2px outset #c0c0c0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'MS Sans Serif', sans-serif",
          fontSize: "11px",
          zIndex: 9999,
        }}
      >
        Loading chat...
      </div>
    );
  }

  return (
    <>
      {/* Main Chat Container */}
      <div
        ref={chatContainerRef}
        className="enhanced-botpress-chat-widget"
        style={{
          position: "fixed",
          left: `${chatPosition.left}px`,
          top: `${chatPosition.top}px`,
          width: `${chatPosition.width}px`,
          height: `${chatPosition.height}px`,
          zIndex: 9999,

          // Windows 98 styling
          fontFamily: "'MS Sans Serif', 'Tahoma', sans-serif",
          fontSize: "11px",
          backgroundColor: "#c0c0c0",
          border: "2px outset #c0c0c0",
          borderRadius: "0",
          boxShadow: "2px 2px 4px rgba(0,0,0,0.3)",

          display: "flex",
          flexDirection: "column",
          overflow: "hidden",

          // Mobile optimizations
          ...(isMobile && {
            transition: "all 0.3s ease-in-out",
            maxHeight: isKeyboardOpen
              ? `${window.visualViewport?.height - 100}px`
              : `${chatPosition.height}px`,
          }),
        }}
        role="dialog"
        aria-label={`Chat with ${agentConfig.displayName}`}
        aria-live="polite"
      >
        {/* Chat Header - Blue Windows Title Bar */}
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
            minHeight: "20px",
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
              minHeight: "20px",
              minWidth: "20px",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#ff0000")}
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        {/* Messages Area - Expanded to use full space */}
        <div
          ref={messagesContainerRef}
          style={{
            flex: 1,
            overflow: "auto",
            overflowY: "auto",
            border: "1px inset #999",
            background: "white",
            padding: "8px",
            marginBottom: "4px",
            color: "#000",
            minHeight: "120px",
            maxHeight: "160px",
            fontFamily: "'Tahoma', sans-serif",
            fontSize: "11px",
            lineHeight: "1.3",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            WebkitFontSmoothing: "antialiased",
          }}
          role="log"
          aria-label="Chat messages"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                marginBottom: "8px",
                textAlign: message.sender === "user" ? "right" : "left",
                color: message.sender === "user" ? "#000080" : "#000",
                fontSize: "11px",
                lineHeight: "1.4",
              }}
            >
              <strong>
                {message.sender === "user" ? "You" : agentConfig.displayName}:
              </strong>{" "}
              {message.text}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div
              style={{
                color: "#666",
                fontStyle: "italic",
                fontSize: "10px",
                marginTop: "4px",
              }}
            >
              {agentConfig.displayName} is typing...
            </div>
          )}
        </div>

        {/* Quick Replies - Smaller, more reasonable size */}
        {quickReplies.length > 0 && (
          <div
            style={{
              padding: "2px 6px",
              backgroundColor: "#f0f0f0",
              borderBottom: "1px solid #808080",
              display: "flex",
              flexWrap: "wrap",
              gap: "3px",
              maxHeight: "40px",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {quickReplies.slice(0, 4).map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                style={{
                  fontSize: "9px",
                  padding: "1px 4px",
                  backgroundColor: "#e0e0e0",
                  border: "1px outset #e0e0e0",
                  cursor: "pointer",
                  borderRadius: "0",
                  minHeight: isMobile ? "20px" : "18px",
                  maxWidth: "70px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: "'MS Sans Serif', sans-serif",
                  WebkitAppearance: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#d0d0d0")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#e0e0e0")
                }
                aria-label={`Quick reply: ${reply}`}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            padding: "4px 8px",
            backgroundColor: "#f0f0f0",
            borderTop: "1px solid #808080",
            alignItems: "stretch",
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: "4px 6px",
              border: "1px inset #999",
              fontSize: "11px",
              color: "#000",
              fontFamily: "'MS Sans Serif', sans-serif",
              backgroundColor: "#fff",
              outline: "none",
              minHeight: "20px",
              WebkitAppearance: "none",
            }}
            aria-label="Type your message"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim()}
            style={{
              padding: "4px 12px",
              backgroundColor: inputValue.trim() ? "#c0c0c0" : "#e0e0e0",
              border: "1px outset #c0c0c0",
              fontSize: "11px",
              cursor: inputValue.trim() ? "pointer" : "not-allowed",
              color: "#000",
              fontFamily: "'MS Sans Serif', sans-serif",
              minHeight: "28px",
              minWidth: "50px",
              WebkitAppearance: "none",
            }}
            onMouseEnter={(e) => {
              if (inputValue.trim()) {
                e.target.style.backgroundColor = "#d0d0d0";
              }
            }}
            onMouseLeave={(e) => {
              if (inputValue.trim()) {
                e.target.style.backgroundColor = "#c0c0c0";
              }
            }}
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};

export default EnhancedBotpressChatWidget;
