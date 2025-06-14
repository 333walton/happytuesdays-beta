/**
 * GeniusChat - Wrapper component for Genius agent's Botpress chat integration
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
import BotpressChatWidget from "./BotpressChatWidget";

const GeniusChat = ({
  currentAgent,
  onClose,
  visible = true,
  position,
  ...props
}) => {
  const [isReady, setIsReady] = useState(false);
  const agentConfig = getAgentConfig(currentAgent);

  // Initialize chat when component mounts
  useEffect(() => {
    if (visible) {
      setIsReady(true);
    }
  }, [visible]);

  // Only render if current agent is Genius and uses Botpress
  if (currentAgent !== "Genius" || agentConfig.chatSystem !== "botpress") {
    return null;
  }

  // Get Genius-specific conversation starter
  const conversationStarter = getConversationStarter("genius", false);
  const quickReplies = getQuickReplies("genius");

  const handleChatClose = () => {
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
  });

  return (
    <div className="genius-chat-wrapper">
      <BotpressChatWidget
        agentConfig={agentConfig}
        conversationStarter={conversationStarter}
        quickReplies={quickReplies}
        position={position}
        onClose={handleChatClose}
        {...props}
      />
    </div>
  );
};

export default GeniusChat;
