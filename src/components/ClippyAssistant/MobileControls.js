// Mobile Controls rendered at the highest possible level
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Button } from "@react95/core";
import { useClippyContext } from "./ClippyProvider";
import "./MobileControls.scss";

/**
 * Mobile Controls Component for Clippy
 * Rendered via portal to appear above all other elements
 * Most styling moved to MobileControls.scss
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
    setAssistantVisible(newVisibility);

    if (newVisibility && window.showClippyCustomBalloon) {
      setTimeout(() => {
        window.showClippyCustomBalloon("I'm back! Tap me for help.");
      }, 300);
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

    // Cleanup
    return () => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
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