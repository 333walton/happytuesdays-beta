/**
 * GeniusChat - Wrapper component for Genius agent's Botpress chat integration
 * FIXED: Removed pointer-events blocking and improved mobile detection
 */

import React, { useEffect, useState } from "react";
import { getAgentConfig } from "../data/AgentPersonalities";
import {
  getConversationStarter,
  getQuickReplies,
} from "../data/AgentResponses";
import EnhancedBotpressChatWidget from "./EnhancedBotpressChatWidget";
import DesktopPortalWrapper from "./DesktopPortalWrapper";

const GeniusChat = ({
  currentAgent,
  onClose,
  visible = true,
  position,
  ...props
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const agentConfig = getAgentConfig(currentAgent);

  // Enhanced mobile detection with touch support
  useEffect(() => {
    const checkMobile = () => {
      // Check for touch capability first
      const hasTouch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;

      // Check viewport size
      const isMobileWidth = window.innerWidth <= 768;

      // Check user agent as fallback
      const isMobileUA =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      // Device is mobile if it has touch AND (small screen OR mobile UA)
      const mobile = hasTouch && (isMobileWidth || isMobileUA);

      setIsMobile(mobile);
      console.log("📱 Mobile detection:", {
        hasTouch,
        isMobileWidth,
        isMobileUA,
        mobile,
        width: window.innerWidth,
      });
    };

    checkMobile();

    // Listen for orientation changes and resize
    window.addEventListener("resize", checkMobile);
    window.addEventListener("orientationchange", checkMobile);

    // Check on visibility change (important for mobile browsers)
    document.addEventListener("visibilitychange", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", checkMobile);
      document.removeEventListener("visibilitychange", checkMobile);
    };
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log("🌐 Network: Online");
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log("🌐 Network: Offline");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Initialize chat when component mounts
  useEffect(() => {
    if (visible && isOnline) {
      console.log("🚀 GeniusChat becoming visible, setting ready");
      setIsReady(true);
    } else if (!isOnline) {
      console.log("📵 GeniusChat offline, not setting ready");
    }
  }, [visible, isOnline]);

  // Only render if current agent is Genius and uses Botpress
  if (currentAgent !== "Genius" || agentConfig.chatSystem !== "botpress") {
    console.log("🔍 GeniusChat not rendering - wrong agent or chat system:", {
      currentAgent,
      chatSystem: agentConfig?.chatSystem,
    });
    return null;
  }

  // Get Genius-specific conversation starter
  const conversationStarter = getConversationStarter("genius", false);
  const quickReplies = getQuickReplies("genius");

  const handleChatClose = () => {
    console.log("🔍 GeniusChat closing");
    setIsReady(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isReady || !visible) {
    console.log("🔍 GeniusChat not rendering:", {
      isReady,
      visible,
      currentAgent,
      isOnline,
    });
    return null;
  }

  console.log("🔍 GeniusChat rendering:", {
    currentAgent,
    agentConfig,
    visible,
    isReady,
    isMobile,
    isOnline,
    position,
  });

  // Mobile rendering - FIXED: Removed pointer-events blocking
  if (isMobile) {
    console.log("📱 Rendering GeniusChat for mobile");
    return (
      <div
        className="genius-chat-mobile-wrapper"
        style={{
          position: "fixed",
          zIndex: 9999,
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          // Allow all touch events to pass through
          touchAction: "manipulation",
          // Ensure the wrapper doesn't block interactions
          background: "transparent",
        }}
      >
        <EnhancedBotpressChatWidget
          agentConfig={agentConfig}
          conversationStarter={conversationStarter}
          quickReplies={quickReplies}
          position={position}
          onClose={handleChatClose}
          isMobile={true}
          isOnline={isOnline}
          {...props}
        />
      </div>
    );
  }

  // Desktop: Use portal to render inside desktop viewport
  console.log("💻 Rendering GeniusChat for desktop with portal");
  return (
    <DesktopPortalWrapper>
      <div
        className="genius-chat-desktop-wrapper"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        <EnhancedBotpressChatWidget
          agentConfig={agentConfig}
          conversationStarter={conversationStarter}
          quickReplies={quickReplies}
          position={position}
          onClose={handleChatClose}
          isMobile={false}
          isOnline={isOnline}
          {...props}
        />
      </div>
    </DesktopPortalWrapper>
  );
};

export default GeniusChat;
