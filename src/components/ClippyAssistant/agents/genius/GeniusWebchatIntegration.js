import React, { useState, useEffect, useCallback, useRef } from "react";
import EnhancedBotpressChatWidget from "./EnhancedBotpressChatWidget";
import "./GeniusWebchatIntegration.css";

/**
 * Main Genius Webchat Integration Component
 * FIXED: Hidden FAB that can be remotely triggered to open Botpress chat
 */
const GeniusWebchatIntegration = ({
  agentConfig,
  onClose,
  isMobile,
  conversationStarter,
  quickReplies,
}) => {
  const [isWebchatOpen, setIsWebchatOpen] = useState(false);
  const fabRef = useRef(null);

  // Create global trigger function when component mounts
  useEffect(() => {
    // Create global function to trigger FAB click
    window.triggerGeniusChatFAB = () => {
      console.log("🎯 Triggering Genius FAB click remotely");
      if (fabRef.current) {
        fabRef.current.click();
        return true;
      }
      console.warn("⚠️ Genius FAB not available for remote trigger");
      return false;
    };

    console.log("✅ Global triggerGeniusChatFAB function created");

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up triggerGeniusChatFAB function");
      delete window.triggerGeniusChatFAB;
    };
  }, []);

  const handleToggleChat = useCallback(() => {
    console.log("🔍 FAB clicked - toggling chat:", {
      currentState: isWebchatOpen,
      newState: !isWebchatOpen,
    });
    setIsWebchatOpen((prev) => !prev);
  }, [isWebchatOpen]);

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

  return (
    <>
      {/* Enhanced Botpress Chat Widget - shown when FAB is clicked */}
      {isWebchatOpen && (
        <div
          className={`genius-chat-container ${isMobile ? "mobile" : "desktop"}`}
          style={{
            position: "fixed",
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
          <EnhancedBotpressChatWidget
            agentConfig={agentConfig}
            onClose={handleCloseChat}
            conversationStarter={conversationStarter}
          />
        </div>
      )}

      {/* Hidden FAB - always rendered but invisible */}
      <button
        ref={fabRef}
        className="genius-fab genius-fab-hidden"
        onClick={handleToggleChat}
        style={{
          position: "fixed",
          bottom: "-100px", // Hidden below viewport
          right: "-100px", // Hidden to the right
          zIndex: -1, // Behind everything
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "auto", // Still clickable programmatically
          visibility: "hidden",
          overflow: "hidden",
          border: "none",
          background: "transparent",
          cursor: "default",
        }}
        role="button"
        aria-label="Hidden Genius Chat Trigger"
        aria-hidden="true"
        tabIndex={-1}
      >
        {/* Empty button - just needs to be clickable */}
      </button>
    </>
  );
};

export default GeniusWebchatIntegration;
