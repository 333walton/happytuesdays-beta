/**
 * GeniusChat - Wrapper component for Genius agent's Botpress chat integration
 * FIXED: Always renders when Genius is active agent to keep FAB available
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
  chatSystem,
  onClose,
  visible = true, // Not used anymore, kept for compatibility
  position,
  ...props
}) => {
  const [isMobile, setIsMobile] = useState(false);
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
      console.log("📱 GeniusChat Mobile detection:", {
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

  // FIXED: Always render if current agent is Genius, regardless of visibility
  // This ensures the hidden FAB is always available for remote triggering
  if (currentAgent !== "Genius") {
    console.log("🔍 GeniusChat not rendering - not Genius agent:", {
      currentAgent,
    });
    return null;
  }

  // Get Genius-specific conversation starter and quick replies
  const conversationStarter = getConversationStarter("genius", false);
  const quickReplies = getQuickReplies("genius");

  const handleChatClose = () => {
    console.log("🔍 GeniusChat wrapper handling close");
    if (onClose) {
      onClose();
    }
  };

  console.log("🔍 GeniusChat rendering with hidden FAB for Genius agent:", {
    currentAgent,
    hasAgentConfig: !!agentConfig,
    isMobile,
  });

  // Mobile rendering
  if (isMobile) {
    console.log("📱 Rendering GeniusChat wrapper for mobile");
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
          pointerEvents: "none", // Don't block interactions when FAB is hidden
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
  console.log("💻 Rendering GeniusChat wrapper for desktop with portal");
  return (
    <DesktopPortalWrapper>
      <div
        className="genius-chat-desktop-wrapper"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          pointerEvents: "none", // Don't block interactions when FAB is hidden
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
