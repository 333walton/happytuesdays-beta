/**
 * GeniusChat - Wrapper component for Genius agent's Botpress chat integration
 * FIXED: Improved isReady state management and mobile detection
 */

import React, { useEffect, useState } from "react";
import { getAgentConfig } from "../data/AgentPersonalities";
import {
  getConversationStarter,
  getQuickReplies,
} from "../data/AgentResponses";
import GeniusWebchatIntegration from "./GeniusWebchatIntegration";
import DesktopPortalWrapper from "./DesktopPortalWrapper";

const GeniusChat = ({
  currentAgent,
  chatSystem, // <-- Ensure this is passed from ClippyProvider or parent
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
      const hasTouch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;
      const isMobileWidth = window.innerWidth <= 768;
      const isMobileUA =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
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
    window.addEventListener("resize", checkMobile);
    window.addEventListener("orientationchange", checkMobile);
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

  // FIXED: Improved isReady state management, now includes chatSystem check
  useEffect(() => {
    console.log("🔍 GeniusChat state check:", {
      visible,
      isOnline,
      currentAgent,
      chatSystem,
      agentChatSystem: agentConfig?.chatSystem,
    });

    // Set isReady based on all conditions
    if (
      visible &&
      currentAgent === "Genius" &&
      (chatSystem === "botpress" || agentConfig?.chatSystem === "botpress")
    ) {
      console.log("🚀 GeniusChat becoming ready");
      setIsReady(true);
    } else {
      console.log("❌ GeniusChat not ready:", {
        visible,
        correctAgent: currentAgent === "Genius",
        correctChatSystem:
          chatSystem === "botpress" || agentConfig?.chatSystem === "botpress",
      });
      setIsReady(false);
    }
  }, [visible, currentAgent, chatSystem, agentConfig]);

  // Only render if current agent is Genius and uses Botpress
  if (
    currentAgent !== "Genius" ||
    (chatSystem !== "botpress" && agentConfig?.chatSystem !== "botpress")
  ) {
    console.log("🔍 GeniusChat not rendering - wrong agent or chat system:", {
      currentAgent,
      chatSystem: chatSystem || agentConfig?.chatSystem,
    });
    return null;
  }

  // Get Genius-specific conversation starter and quick replies
  const conversationStarter = getConversationStarter("genius", false);
  const quickReplies = getQuickReplies("genius");

  const handleChatClose = () => {
    console.log("🔍 GeniusChat closing");
    setIsReady(false);
    if (onClose) {
      onClose();
    }
  };

  // Show loading state when not ready but should be visible
  if (!isReady && visible && currentAgent === "Genius") {
    console.log("🔍 GeniusChat showing loading state");
    return (
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 2100,
          padding: "10px",
          background: "#c0c0c0",
          border: "2px outset #c0c0c0",
          fontFamily: "'MS Sans Serif', sans-serif",
          fontSize: "11px",
        }}
      >
        Loading Genius Chat...
      </div>
    );
  }

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

  // Mobile rendering
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
          touchAction: "manipulation",
          background: "transparent",
        }}
      >
        <GeniusWebchatIntegration
          agentConfig={agentConfig}
          onClose={handleChatClose}
          isMobile={true}
          conversationStarter={conversationStarter}
          quickReplies={quickReplies}
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
        <GeniusWebchatIntegration
          agentConfig={agentConfig}
          onClose={handleChatClose}
          isMobile={false}
          conversationStarter={conversationStarter}
          quickReplies={quickReplies}
          {...props}
        />
      </div>
    </DesktopPortalWrapper>
  );
};

export default GeniusChat;
