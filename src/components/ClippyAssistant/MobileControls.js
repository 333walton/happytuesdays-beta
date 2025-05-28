// Mobile Controls rendered at the highest possible level
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Button } from "@react95/core";
import { useClippyContext } from "./ClippyProvider";
import "./MobileControls.scss";

/**
 * Mobile Controls Component for Clippy
 * Rendered via portal to appear above all other elements
 * Uses proper Clippy visibility toggling mechanism
 */
const MobileControlsContent = () => {
  console.log('MobileControls rendering with portal');

  const {
    assistantVisible,
    setAssistantVisible,
    isScreenPoweredOn,
  } = useClippyContext();

  const [positionLocked, setPositionLocked] = useState(true);

  const handleToggleVisibility = () => {
    const newVisibility = !assistantVisible;
    console.log(`🎛️ Mobile controls: Toggling Clippy visibility to ${newVisibility ? "VISIBLE" : "HIDDEN"}`);
    
    // Update the context state
    setAssistantVisible(newVisibility);

    // CRITICAL: Use the global function to ensure coordination with ClippyIntegration
    if (window.setAssistantVisible) {
      console.log(`🎛️ Using global setAssistantVisible: ${newVisibility}`);
      window.setAssistantVisible(newVisibility);
    }

    // COORDINATE WITH ClippyIntegration: Use body classes instead of direct DOM manipulation
    // This way ClippyIntegration's CSS rules will still work properly
    if (newVisibility) {
      // Remove the mobile hide class - let ClippyIntegration's CSS handle the rest
      document.body.classList.remove("clippy-manually-hidden");
      console.log("📱 Mobile controls: Removed manual hide class");

      // Show feedback message after a brief delay (only if screen is also powered on)
      if (isScreenPoweredOn && window.showClippyCustomBalloon) {
        setTimeout(() => {
          window.showClippyCustomBalloon("I'm back! Tap me for help.");
        }, 300);
      }
    } else {
      // Add manual hide class that works alongside screen-off
      document.body.classList.add("clippy-manually-hidden");
      console.log("📱 Mobile controls: Added manual hide class");

      // Clean up any existing balloons
      if (window.hideClippyCustomBalloon) {
        window.hideClippyCustomBalloon();
      }
    }
  };

  const handleToggleLock = () => {
    const newLocked = !positionLocked;
    setPositionLocked(newLocked);

    if (window.showClippyCustomBalloon) {
      const message = newLocked
        ? "Position locked! I won't move around anymore."
        : "Position unlocked! You can now drag me around.";
      
      setTimeout(() => {
        window.showClippyCustomBalloon(message);
      }, 100);
    }

    if (window.setClippyPositionLocked) {
      window.setClippyPositionLocked(newLocked);
    }
  };

  // Monitor assistantVisible changes and apply CSS class coordination
  useEffect(() => {
    console.log(`🎛️ Mobile controls: assistantVisible changed to ${assistantVisible}`);
    
    // COORDINATE: Use a different class name that works WITH ClippyIntegration's screen-off
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
      >
        {assistantVisible ? "👁️" : ""}
      </Button>

      <Button
        className="mobile-controls-button"
        active={!positionLocked}
        onClick={handleToggleLock}
        title={positionLocked ? "Unlock Position" : "Lock Position"}
        data-active={!positionLocked}
      >
        {positionLocked ? "🔒" : ""}
      </Button>
    </div>
  );
};

const MobileControls = () => {
  const [portalContainer, setPortalContainer] = useState(null);

  // Direct mobile check
  const isMobile = window.innerWidth <= 768;
  
  const {
    isScreenPoweredOn,
  } = useClippyContext();

  useEffect(() => {
    // Create a portal container at the very top level of the DOM
    const container = document.createElement('div');
    container.id = 'mobile-controls-portal';
    // Styling moved to SCSS - container will inherit styles from #mobile-controls-portal
    
    // Append to body (highest level)
    document.body.appendChild(container);
    setPortalContainer(container);

    // Inject CSS styles for proper Clippy visibility integration
    const injectVisibilityStyles = () => {
      // Remove existing style if present
      const existingStyle = document.getElementById("mobile-clippy-visibility");
      if (existingStyle) {
        existingStyle.remove();
      }

      const styleElement = document.createElement("style");
      styleElement.id = "mobile-clippy-visibility";
      styleElement.textContent = `
        /* COORDINATE: When Clippy is manually hidden via mobile controls */
        /* This works ALONGSIDE ClippyIntegration's screen-off class */
        body.clippy-manually-hidden .clippy,
        body.clippy-manually-hidden #clippy-clickable-overlay,
        body.clippy-manually-hidden .custom-clippy-balloon,
        body.clippy-manually-hidden .custom-clippy-chat-balloon {
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transition: visibility 0.3s, opacity 0.3s !important;
        }
        /* When Clippy is shown via mobile controls */
        body:not(.clippy-manually-hidden) .clippy,
        body:not(.clippy-manually-hidden) #clippy-clickable-overlay,
        body:not(.clippy-manually-hidden) .custom-clippy-balloon,
        body:not(.clippy-manually-hidden) .custom-clippy-chat-balloon {
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          transition: visibility 0.35s, opacity 0.35s !important;
        }

        /* PRIORITY: Screen off takes precedence over manual hide */
        /* ClippyIntegration's screen-off class has higher specificity */
        body.screen-off .clippy,
        body.screen-off #clippy-clickable-overlay,
        body.screen-off .custom-clippy-balloon,
        body.screen-off .custom-clippy-chat-balloon {
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transition: visibility 0.3s, opacity 0.3s !important;
        }

        /* ENSURE: Mobile controls stay visible in both states */
        body.clippy-manually-hidden .mobile-controls-container,
        body.screen-off .mobile-controls-container {
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }

        /* COORDINATE: When both screen is off AND manually hidden */
        body.screen-off.clippy-manually-hidden .clippy,
        body.screen-off.clippy-manually-hidden #clippy-clickable-overlay,
        body.screen-off.clippy-manually-hidden .custom-clippy-balloon,
        body.screen-off.clippy-manually-hidden .custom-clippy-chat-balloon {
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          body:not(.clippy-hidden);
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
      
      // Remove injected styles
      const visibilityStyle = document.getElementById("mobile-clippy-visibility");
      if (visibilityStyle) {
        visibilityStyle.remove();
      }
      
      // Remove body class
      document.body.classList.remove("clippy-manually-hidden");
    };
  }, []);

  // Only render on mobile and when screen is powered on
  if (!isMobile || !isScreenPoweredOn || !portalContainer) {
    return null;
  }

  // Use React Portal to render at the highest DOM level
  return ReactDOM.createPortal(
    <MobileControlsContent />,
    portalContainer
  );
};

export default MobileControls;