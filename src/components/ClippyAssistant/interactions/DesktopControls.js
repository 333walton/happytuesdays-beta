// DesktopControls.js - Desktop version of Clippy controls
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Button } from "@react95/core";
import { useClippyContext } from "../core/ClippyProvider";
import "./DesktopControls.scss";

// Development mode check
const isDev = process.env.NODE_ENV === "development";

// Optimized logging - only in development
const devLog = (message, ...args) => {
  if (isDev) {
    console.log(`🎛️ DesktopControls: ${message}`, ...args);
  }
};

/**
 * Desktop Controls Component for Clippy
 * Provides a hide/show toggle button for desktop users
 */
const DesktopControlsContent = () => {
  const { assistantVisible, setAssistantVisible, isScreenPoweredOn } =
    useClippyContext();

  // Local state for UI responsiveness
  const [isUpdating, setIsUpdating] = useState(false);

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
          window.showClippyCustomBalloon("I'm back! Click me for help.");
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

  return (
    <div className="desktop-controls-container">
      <Button
        className="desktop-controls-button"
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
            style={{ width: "16px", height: "16px" }}
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

const DesktopControls = () => {
  const [portalContainer, setPortalContainer] = useState(null);

  // Direct desktop check
  const isDesktop = window.innerWidth > 768;

  const { isScreenPoweredOn } = useClippyContext();

  useEffect(() => {
    // Create portal container
    const container = document.createElement("div");
    container.id = "desktop-controls-portal";
    document.body.appendChild(container);
    setPortalContainer(container);

    // Inject visibility styles
    const injectVisibilityStyles = () => {
      const existingStyle = document.getElementById(
        "desktop-clippy-visibility"
      );
      if (existingStyle) {
        existingStyle.remove();
      }

      const styleElement = document.createElement("style");
      styleElement.id = "desktop-clippy-visibility";
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

        /* Desktop controls always hidden but functional */
        .desktop-controls-container {
          position: absolute !important;
          left: -9999px !important;
          top: -9999px !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          z-index: 0 !important;
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
        "desktop-clippy-visibility"
      );
      if (visibilityStyle) {
        visibilityStyle.remove();
      }

      document.body.classList.remove("clippy-manually-hidden");
    };
  }, []);

  // Only render on desktop and when screen is powered on
  if (!isDesktop || !isScreenPoweredOn || !portalContainer) {
    return null;
  }

  // Use React Portal for highest DOM level rendering
  return ReactDOM.createPortal(<DesktopControlsContent />, portalContainer);
};

export default DesktopControls;
