// Mobile Controls rendered at the highest possible level
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Button } from "@react95/core";
import { useClippyContext } from "./ClippyProvider";

/**
 * Mobile Controls Component for Clippy
 * Rendered via portal to appear above all other elements
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

  // Ultra-high z-index to break through all stacking contexts
  const containerStyle = {
    position: 'fixed',
    bottom: 'calc(var(--taskbar-height, 40px) + 5px)', // Original PDF specification
    right: '8px',
    display: 'flex',
    gap: '6px',
    zIndex: 999999,  // Maximum z-index to appear above everything
    // Force new stacking context
    isolation: 'isolate',
    // Performance optimizations
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    willChange: 'transform',
    // Touch optimizations
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    WebkitTouchCallout: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none'
  };

  return (
    <div style={containerStyle}>
      <Button
        active={!assistantVisible}
        onClick={handleToggleVisibility}
        title={assistantVisible ? "Hide Clippy" : "Show Clippy"}
        style={{
          minWidth: '44px',
          minHeight: '44px',
          padding: '8px',
          fontSize: '16px',
          zIndex: 999999, // Also high z-index on buttons
          position: 'relative',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          color: '#000000',
          WebkitTextFillColor: '#000000',
          fontFamily: "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', emoji, sans-serif"
        }}
      >
        {assistantVisible ? "👁️" : "👁️‍🗨️"}
      </Button>

      <Button
        active={!positionLocked}
        onClick={handleToggleLock}
        title={positionLocked ? "Unlock Position" : "Lock Position"}
        style={{
          minWidth: '44px',
          minHeight: '44px',
          padding: '8px',
          fontSize: '16px',
          zIndex: 999999, // Also high z-index on buttons
          position: 'relative',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          color: '#000000',
          WebkitTextFillColor: '#000000',
          fontFamily: "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', emoji, sans-serif"
        }}
      >
        {positionLocked ? "🔒" : "🔓"}
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
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none'; // Don't block clicks except on buttons
    container.style.zIndex = '999999';
    
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