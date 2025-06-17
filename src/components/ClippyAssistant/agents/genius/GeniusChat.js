/**
 * GeniusChat - Wrapper component for Genius agent's Botpress chat integration
 * UPDATED: Now uses Botpress v3 with mobile support
 *
 * This component handles the conditional rendering of Botpress chat specifically
 * for the Genius agent (martech/adtech specialist) while maintaining consistency
 * with the existing ClippyAssistant architecture.
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
  const agentConfig = getAgentConfig(currentAgent);

  // Update mobile detection to be reactive
  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(mobile);
      console.log("📱 Mobile check:", { mobile, width: window.innerWidth });
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialize chat when component mounts
  useEffect(() => {
    if (visible) {
      console.log("🚀 GeniusChat becoming visible, setting ready");
      setIsReady(true);
    }
  }, [visible]);

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
    });
    return null;
  }

  console.log("🔍 GeniusChat rendering:", {
    currentAgent,
    agentConfig,
    visible,
    isReady,
    isMobile,
    position,
  });

  // Always render directly without portal on mobile
  if (isMobile) {
    console.log("📱 Rendering GeniusChat for mobile");
    return (
      <div
        className="genius-chat-wrapper"
        style={{
          position: "fixed",
          zIndex: 9999,
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none", // Allow clicks to pass through except on the chat
        }}
      >
        <div
          style={{
            pointerEvents: "auto", // Re-enable clicks on the actual chat
            width: "100%",
            height: "100%",
          }}
        >
          <EnhancedBotpressChatWidget
            agentConfig={agentConfig}
            conversationStarter={conversationStarter}
            quickReplies={quickReplies}
            position={position}
            onClose={handleChatClose}
            isMobile={true}
            {...props}
          />
        </div>
      </div>
    );
  }

  // Desktop: Use portal to render inside desktop viewport
  console.log("💻 Rendering GeniusChat for desktop with portal");
  return (
    <DesktopPortalWrapper>
      <div className="genius-chat-wrapper">
        <EnhancedBotpressChatWidget
          agentConfig={agentConfig}
          conversationStarter={conversationStarter}
          quickReplies={quickReplies}
          position={position}
          onClose={handleChatClose}
          isMobile={false}
          {...props}
        />
      </div>
    </DesktopPortalWrapper>
  );
};

export default GeniusChat;
