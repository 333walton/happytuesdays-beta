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
 * Enhanced Botpress v3 Chat Widget with Windows 98 styling and martech expertise
 * Updated with comprehensive mobile support, network resilience, and desktop viewport containment
 */
const EnhancedBotpressChatWidget = ({
  onClose,
  agentConfig = {
    displayName: "Genius",
    personality: "professional_marketing_expert",
  },
  conversationStarter = "Hello! I'm Genius, your marketing technology expert. I can help with UTM tracking, analytics setup, campaign optimization, and troubleshooting martech issues. What can I help you with today?",
}) => {
  console.log("🔍 Environment Variables Check:", {
    botId: process.env.REACT_APP_BOTPRESS_BOT_ID,
    clientId: process.env.REACT_APP_BOTPRESS_CLIENT_ID,
    hostUrl: process.env.REACT_APP_BOTPRESS_HOST_URL,
    messagingUrl: process.env.REACT_APP_BOTPRESS_MESSAGING_URL,
  });

  // State management
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([]);
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isMobile, setIsMobile] = useState(false);

  // Refs
  const messagesContainerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const botpressInitAttempts = useRef(0);
  const maxInitAttempts = 5;

  // Enhanced mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isTouch = "ontouchstart" in window;
      const isMobileWidth = window.innerWidth <= 768;
      const isMobileUA =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const mobile = isTouch || isMobileWidth || isMobileUA;
      setIsMobile(mobile);
      console.log("📱 Mobile detection:", {
        isTouch,
        isMobileWidth,
        isMobileUA,
        mobile,
      });
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    window.addEventListener("orientationchange", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", checkMobile);
    };
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log("🌐 Network: Online");
      setIsOnline(true);
      // Retry Botpress initialization if it failed due to network
      if (useFallback && botpressInitAttempts.current < maxInitAttempts) {
        setUseFallback(false);
      }
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
  }, [useFallback]);

  // Botpress configuration with mobile-specific env handling
  const hasValidClientId =
    process.env.REACT_APP_BOTPRESS_CLIENT_ID &&
    process.env.REACT_APP_BOTPRESS_CLIENT_ID !== "YOUR_CLIENT_ID_HERE";

  const forceUseFallback = false;

  const botpressConfig = {
    botId: process.env.REACT_APP_BOTPRESS_BOT_ID || "",
    clientId: process.env.REACT_APP_BOTPRESS_CLIENT_ID || "",
    hostUrl: process.env.REACT_APP_BOTPRESS_HOST_URL || "",
    messagingUrl: process.env.REACT_APP_BOTPRESS_MESSAGING_URL || "",
  };

  console.log("🔍 Botpress Config:", botpressConfig);

  const shouldUseBotpress =
    hasValidClientId &&
    !forceUseFallback &&
    botpressConfig.botId &&
    botpressConfig.clientId &&
    isOnline;

  // Enhanced knowledge response (keeping your existing implementation)
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

  // Enhanced position calculation for desktop viewport containment
  const calculateChatPosition = useCallback(() => {
    // For desktop viewport (monitor screen)
    const monitorScreen = document.querySelector(".monitor-screen");
    if (monitorScreen && !isMobile) {
      const monitorRect = monitorScreen.getBoundingClientRect();
      const clippyEl = monitorScreen.querySelector(".clippy");

      if (clippyEl) {
        // Position relative to Clippy within monitor bounds
        return {
          left: Math.max(10, clippyEl.offsetLeft - 150),
          top: Math.max(10, clippyEl.offsetTop - 250),
          width: Math.min(300, monitorRect.width - 20),
          height: Math.min(400, monitorRect.height - 20),
          position: "absolute",
        };
      }

      // Center in monitor if no Clippy
      return {
        left: (640 - 300) / 2,
        top: (480 - 400) / 2,
        width: 300,
        height: 400,
        position: "absolute",
      };
    }

    // Mobile positioning (full screen)
    if (isMobile) {
      const viewportHeight =
        window.visualViewport?.height || window.innerHeight;
      const viewportWidth = window.visualViewport?.width || window.innerWidth;

      return {
        left: 0,
        top: 0,
        width: viewportWidth,
        height: isKeyboardOpen
          ? Math.min(400, viewportHeight - 50)
          : viewportHeight,
        position: "fixed",
      };
    }

    // Check if we're within the monitor/desktop viewport
    const isInMonitorMode = !!monitorScreen;
    const portalContainer = document.querySelector("#genius-chat-portal");
    const isInPortal = !!portalContainer;

    let chatWidth = isInMonitorMode ? 320 : 400;
    let chatHeight = isInMonitorMode ? 240 : 600;

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
          position: "absolute",
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

    // Fallback for non-portal desktop
    return {
      left: 100,
      top: 100,
      width: chatWidth,
      height: chatHeight,
      position: "fixed",
    };
  }, [isMobile, isKeyboardOpen]);

  const [chatPosition, setChatPosition] = useState(calculateChatPosition);

  // Enhanced keyboard handling for mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleFocus = () => {
      console.log("⌨️ Keyboard: Opening");
      setIsKeyboardOpen(true);
      // Scroll to input after keyboard opens
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 300);
    };

    const handleBlur = () => {
      console.log("⌨️ Keyboard: Closing");
      setIsKeyboardOpen(false);
    };

    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const isKeyboardVisible = currentHeight < window.innerHeight * 0.8;
      setIsKeyboardOpen(isKeyboardVisible);
      setChatPosition(calculateChatPosition());
    };

    // Visual viewport API for better mobile keyboard detection
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
    }

    // Fallback focus/blur detection
    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleBlur);

    return () => {
      window.visualViewport?.removeEventListener(
        "resize",
        handleViewportChange
      );
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleBlur);
    };
  }, [isMobile, calculateChatPosition]);

  // Message handling functions
  const addMessage = useCallback((text, sender) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }, 100);
  }, []);

  const handleSendMessage = useCallback(
    async (messageText) => {
      const textToSend = messageText || (inputRef.current?.value || "").trim();

      if (!textToSend) {
        console.log("❌ No message text provided");
        return;
      }

      addMessage(textToSend, "user");

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
    [addMessage, agentConfig, getKnowledgeResponse]
  );

  const handleQuickReply = useCallback(
    (replyText) => {
      console.log("Quick reply clicked:", replyText);
      handleSendMessage(replyText);
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

  // Initialize chat
  useEffect(() => {
    console.log("🚀 Initializing Enhanced Botpress v3 Chat Widget");

    if (useFallback || !hasValidClientId || forceUseFallback || !isOnline) {
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

    if (!hasValidClientId || forceUseFallback || !isOnline) {
      console.warn("⚠️ Using fallback chat mode", {
        hasValidClientId,
        isOnline,
      });
      setUseFallback(true);
    }
  }, [
    conversationStarter,
    hasValidClientId,
    useFallback,
    forceUseFallback,
    isOnline,
  ]);

  // Enhanced Botpress v3 injection with container constraints and retry logic
  useEffect(() => {
    if (!shouldUseBotpress || useFallback) return;

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);

        // Timeout after 10 seconds
        setTimeout(() => reject(new Error("Script load timeout")), 10000);
      });
    };

    const initBotpress = async () => {
      botpressInitAttempts.current += 1;
      console.log(
        `💉 Botpress init attempt ${botpressInitAttempts.current}/${maxInitAttempts}`
      );

      try {
        // Add container constraint styles FIRST
        const globalStyle = document.createElement("style");
        globalStyle.innerHTML = `
          /* Hide default Botpress elements */
          #fab-root { display: none !important; }
          .bpFloat { display: none !important; }
          
          /* Constrain monitor screen */
          .monitor-screen {
            position: relative !important;
            overflow: hidden !important;
          }
          
          /* Force Botpress to respect container bounds */
          #genius-chat-portal #webchat-root,
          #desktop-content-wrapper #webchat-root,
          .monitor-screen #webchat-root {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            max-width: 640px !important;
            max-height: 480px !important;
            transform: none !important;
            z-index: 9999 !important;
          }
          
          #bp-web-widget {
            position: relative !important;
            overflow: hidden !important;
            width: 100% !important;
            height: 100% !important;
            -webkit-overflow-scrolling: touch !important;
            touch-action: manipulation !important;
          }
          
          #bp-web-widget iframe.bpWebchat,
          .bpw-widget-container {
            width: 100% !important;
            height: 100% !important;
            max-width: 640px !important;
            max-height: 480px !important;
            position: relative !important;
          }
          
          /* Mobile-specific styles */
          @media (max-width: 768px) {
            #bp-web-widget {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 0 !important;
            }
            
            #genius-chat-portal #webchat-root,
            #desktop-content-wrapper #webchat-root,
            .monitor-screen #webchat-root {
              max-width: 100vw !important;
              max-height: 100vh !important;
            }
          }
        `;
        document.head.appendChild(globalStyle);

        // Load scripts
        await loadScript("https://cdn.botpress.cloud/webchat/v3.0/inject.js");
        await loadScript(
          "https://files.bpcontent.cloud/2025/06/16/10/20250616104701-Y8D5D2OH.js"
        );

        // Wait for Botpress to be available
        await new Promise((resolve) => {
          const checkBotpress = setInterval(() => {
            if (window.botpress) {
              clearInterval(checkBotpress);
              resolve();
            }
          }, 100);
        });

        // Initialize with container targeting
        window.botpress.init({
          botId: botpressConfig.botId,
          clientId: botpressConfig.clientId,
          hostUrl: botpressConfig.hostUrl,
          messagingUrl: botpressConfig.messagingUrl,

          // Target the portal container if it exists
          container: document.querySelector("#genius-chat-portal")
            ? "#genius-chat-portal"
            : "#bp-web-widget",

          hideWidget: true,
          disableAnimations: isMobile,
          enableReset: false,
          enableTranscriptDownload: false,
          closeOnEscape: !isMobile,
          showPoweredBy: false,
          composerPlaceholder: "Type a message...",
          botName: "Clippy GPT",
          useSessionStorage: true,
          enableConversationDeletion: true,

          // Custom stylesheet to enforce containment
          stylesheet: `
            #webchat-root {
              position: absolute !important;
              width: 100% !important;
              height: 100% !important;
              top: 0 !important;
              left: 0 !important;
              transform: none !important;
            }
            .bpw-widget-container {
              max-width: 640px !important;
              max-height: 480px !important;
            }
            .bpw-layout {
              width: 100% !important;
              height: 100% !important;
            }
          `,
        });

        window.botpress.open();

        // Move Botpress into the desktop viewport container
        setTimeout(() => {
          const webchatRoot = document.getElementById("webchat-root");
          const monitorScreen = document.querySelector(".monitor-screen");
          const portalContainer = document.querySelector("#genius-chat-portal");
          const targetContainer = portalContainer || monitorScreen;

          if (webchatRoot && targetContainer) {
            // Move the webchat root into our container
            targetContainer.appendChild(webchatRoot);

            // Ensure proper positioning
            webchatRoot.style.position = "absolute";
            webchatRoot.style.zIndex = "9999";
            webchatRoot.style.width = "100%";
            webchatRoot.style.height = "100%";

            console.log("✅ Botpress moved into desktop viewport container");
          }
        }, 1000);

        console.log("✅ Botpress initialized successfully");
      } catch (error) {
        console.error("❌ Botpress init error:", error);

        if (botpressInitAttempts.current < maxInitAttempts) {
          console.log("🔄 Retrying in 2 seconds...");
          setTimeout(initBotpress, 2000);
        } else {
          console.log("❌ Max init attempts reached, falling back");
          setUseFallback(true);
        }
      }
    };

    initBotpress();

    // Viewport resize handler
    const handleResize = () => {
      const container = document.querySelector("#webchat-root");
      if (
        container &&
        container.parentElement?.classList.contains("monitor-screen")
      ) {
        container.style.width = "640px";
        container.style.height = "480px";
      }
      setChatPosition(calculateChatPosition());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (window.botpress && window.botpress.close) {
        window.botpress.close();
      }
    };
  }, [
    shouldUseBotpress,
    useFallback,
    botpressConfig,
    isMobile,
    calculateChatPosition,
  ]);

  // Windows 98 styles with mobile enhancements
  const windows98Styles = `
    /* Your existing Windows 98 styles */
    /* Add mobile-specific overrides */
    @media (max-width: 768px) {
      .fallback-chat {
        border-radius: 0 !important;
        border: none !important;
        box-shadow: none !important;
      }
      
      .fallback-input {
        font-size: 16px !important; /* Prevent zoom on iOS */
        -webkit-appearance: none !important;
      }
      
      .fallback-button {
        min-width: 60px !important;
        touch-action: manipulation !important;
      }
    }
  `;

  // Fallback chat component with mobile optimizations
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
          zIndex: chatPosition.position === "absolute" ? 10 : 2500,
          fontFamily: "'MS Sans Serif', 'Tahoma', sans-serif",
          fontSize: "11px",
          backgroundColor: "#c0c0c0",
          border: isMobile ? "none" : "2px outset #c0c0c0",
          borderRadius: "0",
          boxShadow: isMobile ? "none" : "2px 2px 4px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          touchAction: "manipulation",
          ...(isMobile && {
            transition: "height 0.3s ease-in-out",
          }),
        }}
        role="dialog"
        aria-label={`Chat with ${agentConfig.displayName}`}
        aria-live="polite"
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
            minHeight: isMobile ? "44px" : "20px",
            touchAction: "manipulation",
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
              borderRadius: "2px",
              minHeight: isMobile ? "32px" : "20px",
              minWidth: isMobile ? "44px" : "20px",
              touchAction: "manipulation",
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

        {/* Messages Area */}
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
            fontFamily: "'Tahoma', sans-serif",
            fontSize: isMobile ? "14px" : "11px",
            lineHeight: "1.4",
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
                fontSize: isMobile ? "14px" : "11px",
                lineHeight: "1.4",
              }}
            >
              <strong>
                {message.sender === "user" ? "You" : agentConfig.displayName}:
              </strong>{" "}
              {message.text}
            </div>
          ))}

          {isTyping && (
            <div
              style={{
                color: "#666",
                fontStyle: "italic",
                fontSize: isMobile ? "12px" : "10px",
                marginTop: "4px",
              }}
            >
              {agentConfig.displayName} is typing...
            </div>
          )}
        </div>

        {/* Quick Replies */}
        {quickReplies.length > 0 && (
          <div
            style={{
              padding: isMobile ? "8px" : "2px 6px",
              backgroundColor: "#f0f0f0",
              borderBottom: "1px solid #808080",
              display: "flex",
              flexWrap: "wrap",
              gap: isMobile ? "8px" : "3px",
              maxHeight: isMobile ? "80px" : "40px",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {quickReplies.slice(0, 4).map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                style={{
                  fontSize: isMobile ? "12px" : "9px",
                  padding: isMobile ? "8px 12px" : "1px 4px",
                  backgroundColor: "#e0e0e0",
                  border: "1px outset #e0e0e0",
                  cursor: "pointer",
                  borderRadius: "0",
                  minHeight: isMobile ? "36px" : "18px",
                  maxWidth: isMobile ? "auto" : "70px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: "'MS Sans Serif', sans-serif",
                  WebkitAppearance: "none",
                  WebkitTapHighlightColor: "transparent",
                  touchAction: "manipulation",
                }}
                onMouseEnter={(e) =>
                  !isMobile && (e.target.style.backgroundColor = "#d0d0d0")
                }
                onMouseLeave={(e) =>
                  !isMobile && (e.target.style.backgroundColor = "#e0e0e0")
                }
                aria-label={`Quick reply: ${reply}`}
                title={reply}
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
            padding: isMobile ? "8px" : "4px 8px",
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
            placeholder="Ask about martech, UTM tracking..."
            autoComplete="off"
            enterKeyHint="send"
            inputMode="text"
            style={{
              flex: 1,
              padding: isMobile ? "12px" : "4px 6px",
              border: "1px inset #999",
              fontSize: isMobile ? "16px" : "11px",
              color: "#000",
              fontFamily: "'MS Sans Serif', sans-serif",
              backgroundColor: "#fff",
              outline: "none",
              minHeight: isMobile ? "44px" : "20px",
              WebkitAppearance: "none",
              borderRadius: "0",
              touchAction: "manipulation",
            }}
            aria-label="Type your message"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            style={{
              padding: isMobile ? "12px 20px" : "4px 12px",
              backgroundColor: "#c0c0c0",
              border: "1px outset #c0c0c0",
              fontSize: isMobile ? "14px" : "11px",
              cursor: "pointer",
              color: "#000",
              fontFamily: "'MS Sans Serif', sans-serif",
              minHeight: isMobile ? "44px" : "28px",
              minWidth: isMobile ? "70px" : "50px",
              WebkitAppearance: "none",
              touchAction: "manipulation",
            }}
            onMouseEnter={(e) =>
              !isMobile && (e.target.style.backgroundColor = "#d0d0d0")
            }
            onMouseLeave={(e) =>
              !isMobile && (e.target.style.backgroundColor = "#c0c0c0")
            }
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

  // Use fallback mode if conditions aren't met
  if (useFallback || !hasValidClientId || forceUseFallback || !isOnline) {
    return (
      <>
        <style>{windows98Styles}</style>
        <FallbackChat />
      </>
    );
  }

  // Botpress integration
  return (
    <>
      <style>{windows98Styles}</style>
      <div
        style={{
          position: chatPosition.position || "fixed",
          left: `${chatPosition.left}px`,
          top: `${chatPosition.top}px`,
          width: `${chatPosition.width}px`,
          height: `${chatPosition.height}px`,
          zIndex: chatPosition.position === "absolute" ? 10 : 2500,
          display: isOpen ? "flex" : "none",
          flexDirection: "column",
          fontFamily: "'MS Sans Serif', 'Tahoma', sans-serif",
          backgroundColor: "#c0c0c0",
          border: isMobile ? "none" : "2px outset #c0c0c0",
          borderRadius: "0",
          boxShadow: isMobile ? "none" : "2px 2px 4px rgba(0,0,0,0.3)",
          overflow: "hidden",
          touchAction: "manipulation",
        }}
      >
        {/* Windows 98 Header */}
        <div
          style={{
            backgroundColor: "#000080",
            color: "white",
            padding: isMobile ? "8px" : "4px 8px",
            fontSize: "11px",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: isMobile ? "44px" : "20px",
          }}
        >
          <span>💬 Clippy GPT - Martech Specialist</span>
          <button
            onClick={() => {
              setIsOpen(false);
              if (onClose) onClose();
            }}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "white",
              fontSize: "12px",
              cursor: "pointer",
              padding: isMobile ? "8px 12px" : "2px 6px",
              minWidth: isMobile ? "44px" : "auto",
              touchAction: "manipulation",
            }}
          >
            ✕
          </button>
        </div>

        {/* Botpress v3 Container */}
        <div
          id="bp-web-widget"
          style={{
            flex: 1,
            overflow: "hidden",
            position: "relative",
            touchAction: "manipulation",
          }}
        >
          {/* Botpress will inject here */}
          {!isOnline && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                padding: "20px",
              }}
            >
              <p>📡 No internet connection</p>
              <p>Chat will load when connection is restored</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EnhancedBotpressChatWidget;
