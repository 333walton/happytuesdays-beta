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

    // CRITICAL: Also use the global function like ClippyIntegration does
    if (window.setAssistantVisible) {
      console.log(`🎛️ Using global setAssistantVisible: ${newVisibility}`);
      window.setAssistantVisible(newVisibility);
    }

    // Apply immediate DOM changes for visibility (similar to ClippyIntegration)
    const clippyElement = document.querySelector(".clippy");
    const overlayElement = document.getElementById("clippy-clickable-overlay");
    const balloons = document.querySelectorAll(".custom-clippy-balloon, .custom-clippy-chat-balloon");

    if (newVisibility) {
      // SHOW CLIPPY
      console.log("📱 Mobile controls: Showing Clippy elements");
      
      if (clippyElement) {
        clippyElement.style.visibility = "visible";
        clippyElement.style.opacity = "1";
        clippyElement.style.pointerEvents = "auto";
        clippyElement.style.transition = "visibility 0.35s, opacity 0.35s";

        // Make SVG elements visible
        const svgElements = clippyElement.querySelectorAll("svg");
        svgElements.forEach((svg) => {
          svg.style.visibility = "visible";
          svg.style.opacity = "1";
          svg.style.display = "inline";
        });
      }

      if (overlayElement) {
        overlayElement.style.visibility = "visible";
        overlayElement.style.pointerEvents = "auto";
        overlayElement.style.transition = "visibility 0.35s, opacity 0.35s";
      }

      // Update body class
      document.body.classList.remove("clippy-hidden");

      // Show feedback message after a brief delay
      if (window.showClippyCustomBalloon) {
        setTimeout(() => {
          window.showClippyCustomBalloon("I'm back! Tap me for help.");
        }, 300);
      }
    } else {
      // HIDE CLIPPY - Similar to ClippyIntegration's screen-off behavior
      console.log("📱 Mobile controls: Hiding Clippy elements");
      
      if (clippyElement) {
        clippyElement.style.visibility = "hidden";
        clippyElement.style.opacity = "0";
        clippyElement.style.pointerEvents = "none";
      }

      if (overlayElement) {
        overlayElement.style.visibility = "hidden";
        overlayElement.style.pointerEvents = "none";
      }

      // Hide all balloons immediately
      balloons.forEach((balloon) => {
        balloon.style.visibility = "hidden";
        balloon.style.opacity = "0";
        balloon.style.pointerEvents = "none";
      });

      // Update body class
      document.body.classList.add("clippy-hidden");

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

  // Monitor assistantVisible changes and apply DOM updates
  useEffect(() => {
    console.log(`🎛️ Mobile controls: assistantVisible changed to ${assistantVisible}`);
    
    // Apply CSS class to body for consistent styling
    if (assistantVisible) {
      document.body.classList.remove("clippy-hidden");
    } else {
      document.body.classList.add("clippy-hidden");
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
        /* When Clippy is hidden via mobile controls */
        body.clippy-hidden .clippy,
        body.clippy-hidden #clippy-clickable-overlay,
        body.clippy-hidden .custom-clippy-balloon,
        body.clippy-hidden .custom-clippy-chat-balloon {
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transition: visibility 0.35s, opacity 0.35s !important;
        }
          /* When Clippy is shown via mobile controls */
body:not(.clippy-hidden) .clippy,
body:not(.clippy-hidden) #clippy-clickable-overlay,
body:not(.clippy-hidden) .custom-clippy-balloon,
body:not(.clippy-hidden) .custom-clippy-chat-balloon {
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  transition: visibility 0.35s, opacity 0.35s !important; /* Ensure transition is applied */
}

        /* Ensure mobile controls stay visible when Clippy is hidden */
        body.clippy-hidden .mobile-controls-container {
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
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
      document.body.classList.remove("clippy-hidden");
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