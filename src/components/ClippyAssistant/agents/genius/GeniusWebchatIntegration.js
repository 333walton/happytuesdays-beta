import React, { useState, useEffect, useCallback } from "react";
import ReactBotpressChatWidget from "./ReactBotpressChatWidget";
import "./GeniusWebchatIntegration.css";

/**
 * Updated Genius Webchat Integration using React Webchat Library
 * No more hidden FABs or script injection - direct React component control
 */
const GeniusWebchatIntegration = ({
  agentConfig,
  onClose,
  isMobile,
  conversationStarter,
  quickReplies,
}) => {
  const [isWebchatOpen, setIsWebchatOpen] = useState(false);

  // Create global trigger function when component mounts
  useEffect(() => {
    // Create global function to open chat programmatically
    window.triggerGeniusChatFAB = () => {
      console.log("🎯 Opening Genius chat via React component");
      setIsWebchatOpen(true);
      console.log("✅ Genius chat opened");
      return true;
    };

    console.log("✅ Global triggerGeniusChatFAB function created");

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up triggerGeniusChatFAB function");
      delete window.triggerGeniusChatFAB;
    };
  }, []);

  const handleCloseChat = useCallback(() => {
    console.log("🔍 Closing Genius chat");
    setIsWebchatOpen(false);
    if (onClose) onClose();
  }, [onClose]);

  console.log("🤖 GeniusWebchatIntegration render:", {
    isWebchatOpen,
    isMobile,
    hasAgentConfig: !!agentConfig,
  });

  // Only render the chat when it's open - no hidden elements needed!
  if (!isWebchatOpen) {
    return null;
  }

  return (
    <div
      className={`genius-chat-container ${isMobile ? "mobile" : "desktop"}`}
      style={{
        position: isMobile ? "fixed" : "absolute",
        top: isMobile ? 0 : "auto",
        left: isMobile ? 0 : "auto",
        bottom: isMobile ? 0 : "90px",
        right: isMobile ? 0 : "20px",
        width: isMobile ? "100vw" : "400px",
        height: isMobile ? "100vh" : "600px",
        zIndex: 2000,
        pointerEvents: "auto",
      }}
    >
      <ReactBotpressChatWidget
        agentConfig={agentConfig}
        onClose={handleCloseChat}
        conversationStarter={conversationStarter}
      />
    </div>
  );
};

export default GeniusWebchatIntegration;
