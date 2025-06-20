import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { getAgentConfig } from "../data/AgentPersonalities";
import {
  getConversationStarter,
  getQuickReplies,
} from "../data/AgentResponses";
import GeniusWebchatIntegration from "./GeniusWebchatIntegration";

const GeniusChat = ({
  currentAgent,
  chatSystem,
  onClose,
  visible = true, // Not used anymore, kept for compatibility
  position,
  ...props
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [portalContainer, setPortalContainer] = useState(null);
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

  // Setup desktop portal container
  useEffect(() => {
    if (isMobile) return;

    const desktop =
      document.querySelector(".desktop.screen") ||
      document.querySelector(".desktop") ||
      document.querySelector(".w98");

    if (!desktop) return;

    let container = document.getElementById("genius-chat-portal");
    if (!container) {
      container = document.createElement("div");
      container.id = "genius-chat-portal";
      container.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -2000; // Behind everything else as a quick fix 6.20.25
      `;
      desktop.appendChild(container);
    }

    setPortalContainer(container);

    return () => {
      if (container && container.parentNode) {
        container.remove();
      }
    };
  }, [isMobile]);

  // Always render if current agent is Genius
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

  console.log("🔍 GeniusChat rendering for Genius agent:", {
    currentAgent,
    hasAgentConfig: !!agentConfig,
    isMobile,
    hasPortalContainer: !!portalContainer,
  });

  // Mobile rendering - direct DOM render
  if (isMobile) {
    console.log("📱 Rendering GeniusChat wrapper for mobile");
    return (
      <div
        className="genius-chat-mobile-wrapper"
        style={{
          position: "fixed",
          zIndex: -2000 /* quick fix 6.20.25 */,
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none", // Don't block interactions when chat is closed
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

  // Desktop: Wait for portal container before rendering
  if (!portalContainer) {
    console.log("💻 Waiting for portal container...");
    return null;
  }

  // Desktop: Render within desktop viewport portal
  console.log("💻 Rendering GeniusChat wrapper for desktop with portal");

  return ReactDOM.createPortal(
    <div
      className="genius-chat-desktop-wrapper"
      style={{
        position: "absolute",
        // Center the chat within the desktop viewport
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "400px",
        height: "500px",
        maxWidth: "calc(100% - 40px)", // Leave some margin from edges
        maxHeight: "calc(100% - 80px)", // Account for taskbar
        pointerEvents: "none", // Don't block desktop interactions when chat is closed
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
    </div>,
    portalContainer
  );
};

export default GeniusChat;
