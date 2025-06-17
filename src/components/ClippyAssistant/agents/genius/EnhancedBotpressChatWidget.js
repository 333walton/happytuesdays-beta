import React, { useState, useEffect, useRef, useCallback } from "react";
import { Webchat, getClient } from "@botpress/webchat";
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
 * Enhanced Botpress v2 Chat Widget with Windows 98 styling and martech expertise
 * Combines real Botpress v2 integration with intelligent fallback system
 * Includes advanced positioning, mobile support, and comprehensive martech knowledge
 */
const EnhancedBotpressChatWidget = ({
  onClose,
  agentConfig = {
    displayName: "Genius",
    personality: "professional_marketing_expert",
  },
  conversationStarter = "Hello! I'm Genius, your marketing technology expert. I can help with UTM tracking, analytics setup, campaign optimization, and troubleshooting martech issues. What can I help you with today?",
}) => {
  // Add this at the top of your component, inside the function
  console.log("🔍 Environment Variables Check:", {
    botId: process.env.REACT_APP_BOTPRESS_BOT_ID,
    clientId: process.env.REACT_APP_BOTPRESS_CLIENT_ID,
    hostUrl: process.env.REACT_APP_BOTPRESS_HOST_URL,
    messagingUrl: process.env.REACT_APP_BOTPRESS_MESSAGING_URL,
  });

  // State management
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  // REMOVED: const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [quickReplies, setQuickReplies] = useState([
    "UTM tracking help",
    "Analytics setup",
    "Campaign optimization",
    "Pixel troubleshooting",
  ]);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Refs
  const messagesContainerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Check if we have valid Botpress credentials
  const hasValidClientId =
    process.env.REACT_APP_BOTPRESS_CLIENT_ID &&
    process.env.REACT_APP_BOTPRESS_CLIENT_ID !== "YOUR_CLIENT_ID_HERE";

  // Botpress v2 client setup
  const client = hasValidClientId
    ? getClient({
        clientId: process.env.REACT_APP_BOTPRESS_CLIENT_ID,
      })
    : null;

  // Windows 98 theme configuration for Botpress v2
  const { style, theme } = buildTheme({
    themeName: "prism",
    themeColor: "#008080", // Windows 98 teal
  });

  // Device detection
  const isMobile =
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

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

  // Position calculation with improved desktop viewport detection
  const calculateChatPosition = useCallback(() => {
    // Check if we're within the monitor/desktop viewport
    const monitorScreen = document.querySelector(".monitor-screen");
    const isInMonitorMode = !!monitorScreen;

    // Check if we're rendered inside the portal (absolute positioning)
    const portalContainer = document.querySelector("#genius-chat-portal");
    const isInPortal = !!portalContainer;

    // Adjust chat dimensions based on viewport constraints
    let chatWidth, chatHeight;

    if (isMobile) {
      chatWidth = Math.min(330, window.innerWidth - 16);
      chatHeight = Math.min(280, window.innerHeight - 150);
    } else if (isInMonitorMode) {
      // Smaller chat when in monitor mode to fit within desktop
      chatWidth = 320;
      chatHeight = 240;
    } else {
      // Normal desktop size
      chatWidth = 400;
      chatHeight = 600;
    }

    console.log("🔍 Calculating chat position:", {
      isMobile,
      isInMonitorMode,
      isInPortal,
      chatWidth,
      chatHeight,
    });

    // If we're in portal (desktop viewport), use absolute positioning
    if (isInPortal && !isMobile) {
      const clippyEl = document.querySelector(".clippy");
      const overlayEl = document.getElementById("clippy-clickable-overlay");
      const portalRect = portalContainer.getBoundingClientRect();

      if (clippyEl) {
        const clippyRect = clippyEl.getBoundingClientRect();

        // Calculate relative to portal container
        let left =
          clippyRect.left -
          portalRect.left +
          clippyRect.width / 2 -
          chatWidth / 2;
        let top = clippyRect.top - portalRect.top - chatHeight - 10;

        // Constrain within portal bounds
        const margin = 10;
        const maxLeft = portalRect.width - chatWidth - margin;
        const maxTop = portalRect.height - chatHeight - margin;

        left = Math.max(margin, Math.min(left, maxLeft));

        // If not enough space above, position to the side
        if (top < margin) {
          top = clippyRect.top - portalRect.top;
          // Try left side first
          if (clippyRect.left - portalRect.left - chatWidth - 10 > margin) {
            left = clippyRect.left - portalRect.left - chatWidth - 10;
          } else {
            // Use right side
            left = clippyRect.right - portalRect.left + 10;
            left = Math.min(left, maxLeft);
          }
        }

        top = Math.max(margin, Math.min(top, maxTop));

        return {
          left,
          top,
          width: chatWidth,
          height: chatHeight,
          position: "absolute", // Use absolute positioning inside portal
        };
      }

      // Fallback center position in portal
      return {
        left: Math.max(10, (portalRect.width - chatWidth) / 2),
        top: Math.max(10, (portalRect.height - chatHeight) / 2),
        width: chatWidth,
        height: chatHeight,
        position: "absolute",
      };
    }

    // Original fixed positioning logic for mobile and non-portal desktop
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
        document.querySelector(".w98");

      if (desktop && isInMonitorMode) {
        // We're in monitor mode, use the monitor screen bounds
        const monitorScreenRect = monitorScreen.getBoundingClientRect();
        viewportWidth = monitorScreenRect.width;
        viewportHeight = monitorScreenRect.height;
        viewportLeft = monitorScreenRect.left;
        viewportTop = monitorScreenRect.top;
        console.log("📺 Using monitor screen bounds:", {
          viewportWidth,
          viewportHeight,
          viewportLeft,
          viewportTop,
        });
      } else if (desktop) {
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

      // Position chat above Clippy
      let left = clippyRect.left + clippyRect.width / 2 - chatWidth / 2;
      let top = overlayRect.top - chatHeight - 10;

      // Constrain to viewport with margins
      const horizontalMargin = isInMonitorMode ? 10 : 40;
      const verticalMargin = isInMonitorMode ? 10 : 30;

      const minLeft = viewportLeft + horizontalMargin;
      const maxLeft =
        viewportLeft + viewportWidth - chatWidth - horizontalMargin;
      left = Math.max(minLeft, Math.min(left, maxLeft));

      const minTop = viewportTop + verticalMargin;
      const maxTop = viewportTop + viewportHeight - chatHeight - verticalMargin;

      // If chat would appear above the viewport, position it to the side of Clippy
      if (top < minTop) {
        top = clippyRect.top;
        // Try to position to the left of Clippy
        if (clippyRect.left - chatWidth - 10 > minLeft) {
          left = clippyRect.left - chatWidth - 10;
        } else {
          // Position to the right if no space on left
          left = clippyRect.right + 10;
          left = Math.min(left, maxLeft);
        }
      }

      top = Math.max(minTop, Math.min(top, maxTop));

      return {
        left,
        top,
        width: chatWidth,
        height: chatHeight,
        position: "fixed",
      };
    }

    // Fallback position - center in viewport
    const fallbackHorizontalMargin = isInMonitorMode ? 10 : 40;
    const fallbackVerticalMargin = isInMonitorMode ? 10 : 30;

    const fallbackLeft = isMobile
      ? 14
      : viewportLeft +
        Math.max(fallbackHorizontalMargin, (viewportWidth - chatWidth) / 2);
    const fallbackTop = isMobile
      ? 100
      : viewportTop +
        Math.max(fallbackVerticalMargin, (viewportHeight - chatHeight) / 2);

    return {
      left: fallbackLeft,
      top: fallbackTop,
      width: chatWidth,
      height: chatHeight,
      position: "fixed",
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

  // Add message to chat (for fallback mode)
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

  // FIXED: Handle sending messages - use ref only, no state
  const handleSendMessage = useCallback(
    async (messageText) => {
      // Get value from ref or parameter - NO STATE DEPENDENCY
      const textToSend = messageText || (inputRef.current?.value || "").trim();

      if (!textToSend) {
        console.log("❌ No message text provided");
        return;
      }

      // Add user message immediately
      addMessage(textToSend, "user");

      // Clear ONLY the ref, no state
      if (inputRef.current) {
        inputRef.current.value = "";
      }

      setIsTyping(true);

      try {
        const response = getKnowledgeResponse(
          textToSend,
          agentConfig.personality,
          agentConfig
        );

        console.log("💬 Generated response:", response);

        setTimeout(() => {
          addMessage(response.text, "bot");

          if (response.quickReplies && response.quickReplies.length > 0) {
            console.log("🔄 Updating quick replies:", response.quickReplies);
            setQuickReplies(response.quickReplies);
          }

          setIsTyping(false);
          console.log("✅ Response complete");
        }, 500);
      } catch (error) {
        console.error("❌ Error in knowledge response:", error);
        addMessage("Sorry, something went wrong. Please try again.", "bot");
        setIsTyping(false);
      }
    },
    [addMessage, agentConfig, getKnowledgeResponse] // NO inputValue dependency
  );

  // Handle quick reply clicks
  const handleQuickReply = useCallback(
    (replyText) => {
      console.log("Quick reply clicked:", replyText);
      handleSendMessage(replyText);
    },
    [handleSendMessage]
  );

  // Handle input key press
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Initialize chat
  useEffect(() => {
    console.log("🚀 Initializing Enhanced Botpress v2 Chat Widget");

    // Show intro message immediately
    if (useFallback || !hasValidClientId) {
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

    // Determine if we should use fallback
    if (!hasValidClientId) {
      console.warn("⚠️ No valid Botpress Client ID found, using fallback chat");
      setUseFallback(true);
    }
  }, [conversationStarter, hasValidClientId, useFallback]);

  // Windows 98 styles
  const windows98Styles = `
    ${style}
    
    /* Windows 98 Chat Overrides for Botpress v2 */
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
      min-height: 20px;
    }
    
    .fallback-messages {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      background: white;
      min-height: 120px;
      max-height: 400px;
    }
    
    .fallback-message {
      margin-bottom: 8px;
      font-size: 11px;
      line-height: 1.4;
      color: #000;
    }
    
    .fallback-input-area {
      background-color: #f0f0f0;
      border-top: 1px solid #808080;
      padding: 4px 8px;
      display: flex;
      gap: 4px;
      align-items: center;
    }
    
    .fallback-input {
      flex: 1;
      font-family: 'MS Sans Serif', sans-serif;
      font-size: 11px;
      padding: 4px 6px;
      border: 1px inset #999;
      background: white;
      color: #000;
      outline: none;
    }
    
    .fallback-button {
      font-family: 'MS Sans Serif', sans-serif;
      font-size: 11px;
      padding: 4px 12px;
      border: 1px outset #c0c0c0;
      background: #c0c0c0;
      color: #000;
      cursor: pointer;
      min-height: 24px;
    }
    
    .fallback-button:hover {
      background: #d0d0d0;
    }
    
    .fallback-button:active {
      border: 1px inset #c0c0c0;
    }
    
    .quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 8px;
      padding: 4px 8px;
      background: #f0f0f0;
      border-bottom: 1px solid #808080;
    }
    
    .quick-reply-btn {
      font-family: 'MS Sans Serif', sans-serif;
      font-size: 10px;
      padding: 2px 6px;
      border: 1px outset #e0e0e0;
      background: #e0e0e0;
      color: #000;
      cursor: pointer;
      white-space: nowrap;
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .quick-reply-btn:hover {
      background: #f0f0f0;
    }
    
    .quick-reply-btn:active {
      border: 1px inset #e0e0e0;
    }
    
    /* Mobile optimizations */
    @media (max-width: 768px) {
      .fallback-chat {
        transition: all 0.3s ease-in-out;
      }
      
      .fallback-input-area {
        min-height: 48px;
        padding: 8px;
      }
      
      .fallback-input {
        min-height: 32px;
        padding: 6px 8px;
        font-size: 12px;
      }
      
      .fallback-button {
        min-height: 32px;
        font-size: 12px;
      }
      
      .quick-reply-btn {
        min-height: 32px;
        font-size: 11px;
        padding: 4px 8px;
      }
    }
  `;

  // Fallback chat component with detailed Windows 98 styling
  const FallbackChat = () => {
    return (
      <div
        ref={chatContainerRef}
        className="enhanced-botpress-chat-widget"
        style={{
          position: chatPosition.position || "fixed",
          left: `${chatPosition.left}px`,
          top: `${chatPosition.top}px`,
          width: `${chatPosition.width}px`,
          height: `${chatPosition.height}px`,
          zIndex: chatPosition.position === "absolute" ? 10 : 2500, // Lower z-index when absolute

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
                title={reply}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Input Area - FIXED: Use ref only, no value prop */}
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
            ref={inputRef}
            id="chat-message-input"
            name="chatMessage"
            type="text"
            onKeyDown={handleKeyPress}
            placeholder="Ask about martech, UTM tracking, or campaigns..."
            autoComplete="off"
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
            type="button"
            onClick={() => handleSendMessage()}
            style={{
              padding: "4px 12px",
              backgroundColor: "#c0c0c0",
              border: "1px outset #c0c0c0",
              fontSize: "11px",
              cursor: "pointer",
              color: "#000",
              fontFamily: "'MS Sans Serif', sans-serif",
              minHeight: "28px",
              minWidth: "50px",
              WebkitAppearance: "none",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#d0d0d0";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#c0c0c0";
            }}
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </div>
    );
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
          zIndex: 2500,
        }}
      >
        Loading chat...
      </div>
    );
  }

  // Use fallback mode if no valid client ID or forced fallback
  if (useFallback || !hasValidClientId) {
    return (
      <>
        <style>{windows98Styles}</style>
        <FallbackChat />
      </>
    );
  }

  // Use real Botpress v2 when client ID is available
  return (
    <>
      <style>{windows98Styles}</style>
      <Webchat
        client={client}
        theme={theme}
        style={{
          ...chatPosition,
          display: isOpen ? "flex" : "none",
          zIndex: 2500,
        }}
      />

      {/* Custom close button overlay for Botpress v2 */}
      {isOpen && (
        <button
          onClick={() => {
            setIsOpen(false);
            if (onClose) onClose();
          }}
          style={{
            position: "fixed",
            top: `${chatPosition.top + 2}px`,
            right: `${
              window.innerWidth - chatPosition.left - chatPosition.width + 8
            }px`,
            zIndex: 2600,
            background: "#c0c0c0",
            border: "1px outset #c0c0c0",
            padding: "0 4px",
            fontSize: "10px",
            fontFamily: "MS Sans Serif, sans-serif",
            cursor: "pointer",
            minHeight: "16px",
            minWidth: "16px",
          }}
          aria-label="Close chat"
        >
          ✕
        </button>
      )}
    </>
  );
};

export default EnhancedBotpressChatWidget;
