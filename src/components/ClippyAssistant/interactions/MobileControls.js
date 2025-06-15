// MobileControls.js - Optimized with reduced logging and better performance
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Button } from "@react95/core";
import { useClippyContext } from "../core/ClippyProvider";
import "./MobileControls.scss";

// Development mode check
const isDev = process.env.NODE_ENV === "development";

// Optimized logging - only in development
const devLog = (message, ...args) => {
  if (isDev) {
    console.log(`🎛️ MobileControls: ${message}`, ...args);
  }
};

/**
 * Mobile Controls Component for Clippy
 * Optimized for performance with reduced logging
 */
const MobileControlsContent = () => {
  const {
    assistantVisible,
    setAssistantVisible,
    isScreenPoweredOn,
    positionLocked,
    setPositionLocked,
  } = useClippyContext();

  // Local state for UI responsiveness
  const [localPositionLocked, setLocalPositionLocked] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync local state with context state
  useEffect(() => {
    setLocalPositionLocked(positionLocked);
  }, [positionLocked]);

  const handleToggleVisibility = () => {
    if (isUpdating) return; // Prevent rapid clicking

    setIsUpdating(true);
    const newVisibility = !assistantVisible;

    if (isDev) {
      devLog(
        `Toggling Clippy visibility to ${newVisibility ? "VISIBLE" : "HIDDEN"}`
      );
    }

    // Update context state
    setAssistantVisible(newVisibility);

    // Use global function for coordination
    if (window.setAssistantVisible) {
      window.setAssistantVisible(newVisibility);
    }

    // Coordinate with ClippyIntegration using body classes
    if (newVisibility) {
      document.body.classList.remove("clippy-manually-hidden");

      // Show feedback message (only if screen is powered on)
      if (isScreenPoweredOn && window.showClippyCustomBalloon) {
        setTimeout(() => {
          window.showClippyCustomBalloon("I'm back! Tap me for help.");
        }, 300);
      }
    } else {
      document.body.classList.add("clippy-manually-hidden");

      // Clean up balloons
      if (window.hideClippyCustomBalloon) {
        window.hideClippyCustomBalloon();
      }
    }

    // Reset updating state
    setTimeout(() => setIsUpdating(false), 300);
  };

  const handleToggleLock = () => {
    if (isUpdating) return; // Prevent rapid clicking

    setIsUpdating(true);
    const newLocked = !localPositionLocked;

    if (isDev) {
      devLog(
        `Toggling position lock from ${localPositionLocked} to ${newLocked}`
      );
    }

    // Update both local and context state
    setLocalPositionLocked(newLocked);
    setPositionLocked(newLocked);

    // Update global function
    if (window.setClippyPositionLocked) {
      window.setClippyPositionLocked(newLocked);
    }

    // Show feedback message
    if (window.showClippyCustomBalloon) {
      const message = newLocked
        ? "Position locked! I won't move around anymore."
        : "Position unlocked! You can now drag me around.";

      setTimeout(() => {
        window.showClippyCustomBalloon(message);
      }, 100);
    }

    // Reset updating state
    setTimeout(() => setIsUpdating(false), 300);
  };

  // Monitor assistantVisible changes
  useEffect(() => {
    if (assistantVisible) {
      document.body.classList.remove("clippy-manually-hidden");
    } else {
      document.body.classList.add("clippy-manually-hidden");
    }
  }, [assistantVisible]);

  return (
    <div className="mobile-controls-container">
      <Button
        className="mobile-controls-button"
        active={!assistantVisible}
        onClick={handleToggleVisibility}
        title={assistantVisible ? "Hide Clippy" : "Show Clippy"}
        data-active={!assistantVisible}
        disabled={isUpdating}
      >
        {assistantVisible ? (
          <img
            src="/static/Textchat_16x16_4.png"
            alt="Chat Icon"
            style={{ width: "17px", height: "17px", marginTop: "5px" }}
          />
        ) : (
          <span
            className="centered-icon"
            style={{ width: "12px", height: "12px" }}
          >
            🚫
          </span>
        )}
      </Button>
    </div>
  );
};

const MobileControls = () => {
  const [portalContainer, setPortalContainer] = useState(null);

  // Direct mobile check
  const isMobile = window.innerWidth <= 768;

  const { isScreenPoweredOn } = useClippyContext();

  useEffect(() => {
    // Create portal container
    const container = document.createElement("div");
    container.id = "mobile-controls-portal";
    document.body.appendChild(container);
    setPortalContainer(container);

    // Inject optimized visibility styles
    const injectVisibilityStyles = () => {
      const existingStyle = document.getElementById("mobile-clippy-visibility");
      if (existingStyle) {
        existingStyle.remove();
      }

      const styleElement = document.createElement("style");
      styleElement.id = "mobile-clippy-visibility";
      styleElement.textContent = `
        /* Coordinate manual hide with ClippyIntegration */
        body.clippy-manually-hidden .clippy,
        body.clippy-manually-hidden #clippy-clickable-overlay,
        body.clippy-manually-hidden .custom-clippy-balloon,
        body.clippy-manually-hidden .custom-clippy-chat-balloon {
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transition: visibility 0.3s, opacity 0.3s !important;
        }

        /* Show when not manually hidden */
        body:not(.clippy-manually-hidden) .clippy,
        body:not(.clippy-manually-hidden) #clippy-clickable-overlay {
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          transition: visibility 0.35s, opacity 0.35s !important;
        }

        /* Screen off takes precedence */
        body.screen-off .clippy,
        body.screen-off #clippy-clickable-overlay,
        body.screen-off .custom-clippy-balloon,
        body.screen-off .custom-clippy-chat-balloon {
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transition: visibility 0.3s, opacity 0.3s !important;
        }

        /* Mobile controls always hidden but functional */
        .mobile-controls-container {
          position: absolute !important;
          left: -9999px !important;
          top: -9999px !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          z-index: -9999 !important;
        }

        /* Combined state handling */
        body.screen-off.clippy-manually-hidden .clippy,
        body.screen-off.clippy-manually-hidden #clippy-clickable-overlay,
        body.screen-off.clippy-manually-hidden .custom-clippy-balloon,
        body.screen-off.clippy-manually-hidden .custom-clippy-chat-balloon {
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transition: visibility 0.35s, opacity 0.35s !important;
        }
      `;
      document.head.appendChild(styleElement);
    };

    injectVisibilityStyles();

    // Cleanup
    return () => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }

      const visibilityStyle = document.getElementById(
        "mobile-clippy-visibility"
      );
      if (visibilityStyle) {
        visibilityStyle.remove();
      }

      document.body.classList.remove("clippy-manually-hidden");
    };
  }, []);

  // Only render on mobile and when screen is powered on
  if (!isMobile || !isScreenPoweredOn || !portalContainer) {
    return null;
  }

  // Use React Portal for highest DOM level rendering
  return ReactDOM.createPortal(<MobileControlsContent />, portalContainer);
};

export default MobileControls;
