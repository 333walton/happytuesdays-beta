import React from "react";
import { Button } from "react95";
import { useClippyContext } from "./ClippyProvider";

const MobileControls = () => {
  const {
    assistantVisible,
    setAssistantVisible,
    positionLocked,
    setPositionLocked,
    isMobile,
    isScreenPoweredOn,
  } = useClippyContext();

  // Only render on mobile and when screen is powered on
  if (!isMobile || !isScreenPoweredOn) return null;

  const handleToggleVisibility = () => {
    setAssistantVisible(!assistantVisible);
  };

  const handleToggleLock = () => {
    const newLocked = !positionLocked;
    setPositionLocked(newLocked);

    // Provide feedback
    if (window.showClippyCustomBalloon) {
      const message = newLocked
        ? "Position locked! Clippy won't move around."
        : "Position unlocked! You can now drag Clippy.";
      setTimeout(() => window.showClippyCustomBalloon(message), 100);
    }
  };

  return (
    <div className="mobile-controls-container">
      <Button
        onClick={handleToggleVisibility}
        active={!assistantVisible}
        size="sm"
        style={{
          width: "44px",
          height: "44px",
          padding: "2px",
          fontSize: "16px",
          minWidth: "44px",
          minHeight: "44px",
          touchAction: "manipulation",
        }}
        title={assistantVisible ? "Hide Clippy" : "Show Clippy"}
      >
        {assistantVisible ? "👁️" : "👁️‍🗨️"}
      </Button>

      <Button
        onClick={handleToggleLock}
        active={!positionLocked}
        size="sm"
        style={{
          width: "44px",
          height: "44px",
          padding: "2px",
          fontSize: "16px",
          minWidth: "44px",
          minHeight: "44px",
          touchAction: "manipulation",
        }}
        title={positionLocked ? "Unlock Position" : "Lock Position"}
      >
        {positionLocked ? "🔒" : "🔓"}
      </Button>
    </div>
  );
};

export default MobileControls;
