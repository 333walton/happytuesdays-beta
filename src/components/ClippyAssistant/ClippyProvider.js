// Modified ClippyProvider.js section to handle screen power state

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  useClippy,
  ClippyProvider as ReactClippyProvider,
} from "@react95/clippy";

// Import extracted components
import CustomBalloon from "./CustomBalloon";
import ChatBalloon from "./ChatBalloon";
import ClippyController from "./ClippyController";

import "./_styles.scss";

// Create context
const ClippyContext = createContext(null);

/**
 * Provider component that makes Clippy available throughout the app
 */
const ClippyProvider = ({
  children,
  defaultAgent = "Clippy",
  fixedPosition = false,
}) => {
  const [assistantVisible, setAssistantVisible] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(defaultAgent);
  const [position, setPosition] = useState(() => ({
    x: 520,
    y: 360,
  }));
  const [userPositioned, setUserPositioned] = useState(false);
  const clippyInstanceRef = useRef(null);
  const desktopRectRef = useRef(null);
  const isMobileRef = useRef(false);

  // Custom balloon states
  const [customBalloonVisible, setCustomBalloonVisible] = useState(false);
  const [customBalloonMessage, setCustomBalloonMessage] = useState("");
  const [chatBalloonVisible, setChatBalloonVisible] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState("");
  const [balloonPosition, setBalloonPosition] = useState({ left: 0, top: 0 });

  // Reference to track initial position settings
  const relativePositionRef = useRef({
    xPercent: 0.81,
    yPercent: 0.75,
  });

  // Track screen power state from MonitorView
  const [isScreenPoweredOn, setIsScreenPoweredOn] = useState(true);

  // Detect if the user is on mobile
  useEffect(() => {
    isMobileRef.current =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
  }, []);

  // Monitor the black overlay state from MonitorView
  useEffect(() => {
    const checkScreenPower = () => {
      const blackOverlay = document.querySelector(".black-overlay");
      if (blackOverlay) {
        // Check if the black overlay is visible (screen is powered off)
        const isVisible = window.getComputedStyle(blackOverlay).opacity !== "0";

        // If screen power state changed, update our state
        if (isVisible !== !isScreenPoweredOn) {
          setIsScreenPoweredOn(!isVisible);
        }
      }
    };

    // Set up a periodic check for the black overlay visibility
    const intervalId = setInterval(checkScreenPower, 500);

    return () => clearInterval(intervalId);
  }, [isScreenPoweredOn]);

  // Handle Clippy visibility based on screen power state
  useEffect(() => {
    // Only run after clippy is initialized
    if (clippyInstanceRef.current) {
      const clippyElement = document.querySelector(".clippy");
      const overlayElement = document.getElementById(
        "clippy-clickable-overlay"
      );

      if (clippyElement) {
        if (isScreenPoweredOn) {
          // Show Clippy when screen is on
          clippyElement.style.visibility = "visible";
          clippyElement.style.opacity = "1";

          if (overlayElement) {
            overlayElement.style.visibility = "visible";
            overlayElement.style.pointerEvents = "auto";
          }
        } else {
          // Hide Clippy when screen is off
          clippyElement.style.visibility = "hidden";
          clippyElement.style.opacity = "0";

          // Also hide any balloons
          setCustomBalloonVisible(false);
          setChatBalloonVisible(false);

          if (overlayElement) {
            overlayElement.style.visibility = "hidden";
            overlayElement.style.pointerEvents = "none";
          }
        }
      }
    }
  }, [isScreenPoweredOn]);

  // Make context values available globally for ClippyService
  useEffect(() => {
    // These window globals are used by ClippyService to control the assistant
    window.setAssistantVisible = setAssistantVisible;
    window.setCurrentAgent = setCurrentAgent;
    window.setClippyPosition = (newPos) => {
      if (!fixedPosition) {
        setPosition(newPos);
        setUserPositioned(false);
      }
    };

    // Add function to update screen power state
    window.setScreenPowerState = (isPoweredOn) => {
      setIsScreenPoweredOn(isPoweredOn);
    };

    // Add new function for the simplified initial position setting
    window.setClippyInitialPosition = (percentPos) => {
      if (!fixedPosition) {
        relativePositionRef.current = {
          xPercent: percentPos.xPercent || 0.85,
          yPercent: percentPos.yPercent || 0.85,
        };

        // If we already have a desktop element, calculate and apply position now
        if (desktopRectRef.current) {
          const desktopRect = desktopRectRef.current;
          const newPos = {
            x: desktopRect.width * relativePositionRef.current.xPercent,
            y: desktopRect.height * relativePositionRef.current.yPercent,
          };
          setPosition(newPos);
          setUserPositioned(false);
        }
      }
    };

    // Add custom balloon functions
    window.showClippyCustomBalloon = (message) => {
      // Don't show balloons when screen is off
      if (!isScreenPoweredOn) return false;

      // Calculate position based on Clippy's position
      const clippyElement = document.querySelector(".clippy");
      if (clippyElement) {
        const rect = clippyElement.getBoundingClientRect();

        // Position the balloon centered above Clippy
        setBalloonPosition({
          left: rect.left + rect.width / 2 - 125, // Assuming 250px max-width for balloon, center it
          top: rect.top - 120, // Higher above Clippy's head
        });
      }

      setCustomBalloonMessage(message);
      setCustomBalloonVisible(true);
      setChatBalloonVisible(false); // Hide chat if visible

      // Auto-hide after 8 seconds
      setTimeout(() => {
        setCustomBalloonVisible(false);
      }, 8000);

      return true;
    };

    window.hideClippyCustomBalloon = () => {
      setCustomBalloonVisible(false);
      setChatBalloonVisible(false);
      return true;
    };

    window.showClippyChatBalloon = (initialMessage) => {
      // Don't show balloons when screen is off
      if (!isScreenPoweredOn) return false;

      // Calculate position based on Clippy's position
      const clippyElement = document.querySelector(".clippy");
      if (clippyElement) {
        const rect = clippyElement.getBoundingClientRect();

        // Position the chat balloon centered above Clippy
        setBalloonPosition({
          left: rect.left + rect.width / 2 - 110, // Center 220px wide balloon
          top: rect.top - 200, // Position well above Clippy
        });
      }

      setChatInitialMessage(initialMessage);
      setChatBalloonVisible(true);
      setCustomBalloonVisible(false); // Hide regular balloon if visible

      return true;
    };

    window.getClippyInstance = () => clippyInstanceRef.current;

    return () => {
      delete window.setAssistantVisible;
      delete window.setCurrentAgent;
      delete window.setClippyPosition;
      delete window.setClippyInitialPosition;
      delete window.getClippyInstance;
      delete window.showClippyCustomBalloon;
      delete window.hideClippyCustomBalloon;
      delete window.showClippyChatBalloon;
      delete window.setScreenPowerState;
    };
  }, [fixedPosition, desktopRectRef, isScreenPoweredOn]);

  // Handle chat messages
  const handleChatMessage = (message, callback) => {
    // Simple chat response handling
    setTimeout(() => {
      let response;
      const lowercaseMsg = message.toLowerCase();

      if (lowercaseMsg.includes("hello") || lowercaseMsg.includes("hi")) {
        response = "Hello there! How can I assist you?";
      } else if (lowercaseMsg.includes("help")) {
        response =
          "I can help with many tasks. What specifically do you need assistance with?";
      } else if (
        lowercaseMsg.includes("file") ||
        lowercaseMsg.includes("explorer")
      ) {
        response = "To manage your files, you can access the file explorer.";
      } else if (
        lowercaseMsg.includes("internet") ||
        lowercaseMsg.includes("web")
      ) {
        response = "You can browse the web using a web browser.";
      } else {
        response =
          "I'm not sure about that. Is there something specific you'd like to know?";
      }

      callback(response);
    }, 1000);
  };

  // Gather all values for the context
  const contextValue = {
    assistantVisible,
    setAssistantVisible,
    currentAgent,
    setCurrentAgent,
    position,
    setPosition: fixedPosition ? () => {} : setPosition,
    userPositioned,
    setUserPositioned: fixedPosition ? () => {} : setUserPositioned,
    desktopRectRef,
    isMobileRef,
    fixedPosition,
    isScreenPoweredOn,
    setIsScreenPoweredOn,
    setClippyInstance: (instance) => {
      clippyInstanceRef.current = instance;
      window.clippy = instance;
    },
    getClippyInstance: () => clippyInstanceRef.current,
  };

  // Set assistantVisible to true when component mounts
  useEffect(() => {
    setAssistantVisible(true);
  }, []);

  return (
    <ClippyContext.Provider value={contextValue}>
      <ReactClippyProvider agentName={currentAgent}>
        {children}

        <ClippyController
          visible={assistantVisible}
          position={position}
          userPositioned={userPositioned}
          setUserPositioned={setUserPositioned}
          setPosition={setPosition}
          desktopRectRef={desktopRectRef}
          isMobileRef={isMobileRef}
          fixedPosition={fixedPosition}
          relativePositionRef={relativePositionRef}
          currentAgent={currentAgent}
          setCurrentAgent={setCurrentAgent}
          setAssistantVisible={setAssistantVisible}
          isScreenPoweredOn={isScreenPoweredOn}
          setClippyInstance={(instance) => {
            clippyInstanceRef.current = instance;
            window.clippy = instance;
          }}
        />

        {/* Add custom balloon components - only when screen is on */}
        {isScreenPoweredOn && customBalloonVisible && (
          <CustomBalloon
            message={customBalloonMessage}
            position={balloonPosition}
          />
        )}

        {isScreenPoweredOn && chatBalloonVisible && (
          <ChatBalloon
            initialMessage={chatInitialMessage}
            position={balloonPosition}
            onClose={() => setChatBalloonVisible(false)}
            onSendMessage={handleChatMessage}
          />
        )}
      </ReactClippyProvider>
    </ClippyContext.Provider>
  );
};

// Hook for using the clippy context
export const useClippyContext = () => useContext(ClippyContext);

export default ClippyProvider;
