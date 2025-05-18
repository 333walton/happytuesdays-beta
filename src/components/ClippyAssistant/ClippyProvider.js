import React, { createContext, useState, useContext, useEffect } from "react";
import {
  useClippy,
  ClippyProvider as ReactClippyProvider,
} from "@react95/clippy";

// Create context
const ClippyContext = createContext(null);

/**
 * Provider component that makes Clippy available throughout the app
 *
 * This should be placed high in your component tree
 */
const ClippyProvider = ({ children, defaultAgent = "Clippy" }) => {
  const [assistantVisible, setAssistantVisible] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(defaultAgent);
  const [position, setPosition] = useState({ x: 400, y: 300 }); // Desktop coordinates

  // Make context values available globally for ClippyService
  useEffect(() => {
    window.setAssistantVisible = setAssistantVisible;
    window.setCurrentAgent = setCurrentAgent;
    window.setClippyPosition = setPosition;

    return () => {
      delete window.setAssistantVisible;
      delete window.setCurrentAgent;
      delete window.setClippyPosition;
    };
  }, []);

  // Gather all values for the context
  const contextValue = {
    assistantVisible,
    setAssistantVisible,
    currentAgent,
    setCurrentAgent,
    position,
    setPosition,
  };

  return (
    <ClippyContext.Provider value={contextValue}>
      <ReactClippyProvider agentName={currentAgent}>
        {children}

        {/* Invisible component to position Clippy */}
        {assistantVisible && <PositionClippy position={position} />}
      </ReactClippyProvider>
    </ClippyContext.Provider>
  );
};

/**
 * Simple component to position Clippy agent
 */
const PositionClippy = ({ position }) => {
  const { clippy } = useClippy();

  // Update clippy position
  useEffect(() => {
    if (!clippy) return;

    // Make clippy globally available
    window.clippy = clippy;

    // Position the clippy element
    const positionClippy = () => {
      const agentElements = document.querySelectorAll(".clippy");
      if (agentElements.length > 0) {
        const agentElement = agentElements[0];

        // Position using screen coordinates instead of fixed
        agentElement.style.position = "absolute";
        agentElement.style.left = `${position.x}px`;
        agentElement.style.top = `${position.y}px`;

        // Reset other positioning
        agentElement.style.bottom = "auto";
        agentElement.style.right = "auto";

        // Make sure it stays above most desktop elements
        agentElement.style.zIndex = "50";

        console.log("Positioned Clippy at:", position);
      }
    };

    // Position initially
    setTimeout(positionClippy, 100);

    // Update when position changes
    positionClippy();

    return () => {
      delete window.clippy;
    };
  }, [clippy, position]);

  // No need to render anything, this is just for positioning
  return null;
};

// Hook for using the clippy context
export const useClippyContext = () => useContext(ClippyContext);

export default ClippyProvider;
