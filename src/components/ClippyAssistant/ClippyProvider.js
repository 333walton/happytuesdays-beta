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

import CustomBalloon from "./CustomBalloon";
import ChatBalloon from "./ChatBalloon";
import "./_styles.scss";

const ClippyContext = createContext(null);

// Device detection - run once
const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

const ClippyProvider = ({ children, defaultAgent = "Clippy" }) => {
  // Core state
  const [assistantVisible, setAssistantVisible] = useState(true);
  const [currentAgent, setCurrentAgent] = useState(defaultAgent);
  const [isScreenPoweredOn, setIsScreenPoweredOn] = useState(true);

  // Custom features state
  const [positionLocked, setPositionLocked] = useState(() => {
    try {
      return localStorage.getItem("clippy_position_locked") !== "false";
    } catch {
      return true;
    }
  });

  // Balloon state
  const [customBalloonVisible, setCustomBalloonVisible] = useState(false);
  const [customBalloonMessage, setCustomBalloonMessage] = useState("");
  const [chatBalloonVisible, setChatBalloonVisible] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState("");
  const [balloonPosition, setBalloonPosition] = useState({ left: 0, top: 0 });

  // Refs for cleanup
  const clippyInstanceRef = useRef(null);
  const overlayRef = useRef(null);
  const welcomeShownRef = useRef(false);

  // Position state with proper desktop viewport positioning
  const [position, setPosition] = useState(() => {
    // Initialize with default values; will be updated after component mount
    return {
      x: isMobile ? window.innerWidth - 100 : 520,
      y: isMobile ? window.innerHeight - 150 : 360,
    };
  });

  // Set initial position after component mount
  useEffect(() => {
    if (isMobile || positionLocked) return; // Don't reposition on mobile or when locked

    // Helper to find the actual desktop viewport element
    const getDesktopViewport = () => {
      // Try to find the teal desktop area using various selectors
      return (
        document.querySelector(".desktop.screen") ||
        document.querySelector(".desktop") ||
        document.querySelector(".w98")
      );
    };

    // Position Clippy within the desktop viewport
    const updatePosition = () => {
      const desktop = getDesktopViewport();
      if (desktop) {
        const rect = desktop.getBoundingClientRect();
        const taskbarHeight = 30; // Approximate height of the taskbar

        // Position in bottom-right of the teal desktop area, above the taskbar
        setPosition({
          x: rect.left + rect.width - 120, // 120px from right edge
          y: rect.top + rect.height - taskbarHeight - 100, // 100px above taskbar
        });
      }
    };

    // Update on resize
    const handleResize = () => {
      updatePosition();
    };

    // Initial positioning
    updatePosition();

    // Set up resize listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile, positionLocked]);

  // Define global functions immediately, not in useEffect
  // This ensures they're available right away for other components
  if (typeof window !== "undefined" && !window._clippyPositioningDefined) {
    window._clippyPositioningDefined = true;

    // Define setClippyPosition globally
    window.setClippyPosition = function (newPosition) {
      // Will be assigned the real implementation after component mounts
      console.log("ClippyPosition function called before fully initialized");

      // Store early calls to replay later
      if (!window._earlyClippyPositionCalls) {
        window._earlyClippyPositionCalls = [];
      }
      window._earlyClippyPositionCalls.push(newPosition);
      return true;
    };
  }

  // Initialize global functions and welcome message
  useEffect(() => {
    if (window._clippyProviderInitialized) return;
    window._clippyProviderInitialized = true;

    // Replace the temporary function with the real implementation
    window.setClippyPosition = (newPosition) => {
      if (isMobile) {
        console.log("Position changes not supported on mobile devices");
        return false;
      }

      if (
        newPosition &&
        (newPosition.x !== undefined || newPosition.y !== undefined)
      ) {
        setPosition((prevPosition) => ({
          x: newPosition.x !== undefined ? newPosition.x : prevPosition.x,
          y: newPosition.y !== undefined ? newPosition.y : prevPosition.y,
        }));
        return true;
      }
      return false;
    };

    // Process any early calls that happened before initialization
    if (
      window._earlyClippyPositionCalls &&
      window._earlyClippyPositionCalls.length > 0
    ) {
      console.log(
        "Processing early position calls:",
        window._earlyClippyPositionCalls.length
      );
      window._earlyClippyPositionCalls.forEach((pos) =>
        window.setClippyPosition(pos)
      );
      window._earlyClippyPositionCalls = [];
    }

    // Global functions for external control
    window.setAssistantVisible = (visible) => {
      setAssistantVisible(visible);
      if (!visible) {
        setCustomBalloonVisible(false);
        setChatBalloonVisible(false);
      }
    };

    window.setCurrentAgent = setCurrentAgent;
    window.setScreenPowerState = setIsScreenPoweredOn;

    // Position lock functions
    window._clippyPositionLocked = positionLocked;

    // Balloon functions
    window.showClippyCustomBalloon = (message) => {
      if (!isScreenPoweredOn) return false;

      const clippyElement = document.querySelector(".clippy");
      if (clippyElement) {
        const rect = clippyElement.getBoundingClientRect();
        setBalloonPosition({
          left: rect.left + rect.width / 2 - 125,
          top: rect.top - 120,
        });
      }

      setCustomBalloonMessage(message);
      setCustomBalloonVisible(true);
      setChatBalloonVisible(false);

      setTimeout(() => setCustomBalloonVisible(false), 6000);
      return true;
    };

    window.hideClippyCustomBalloon = () => {
      setCustomBalloonVisible(false);
      setChatBalloonVisible(false);
      return true;
    };

    window.showClippyChatBalloon = (initialMessage) => {
      if (!isScreenPoweredOn) return false;

      const clippyElement = document.querySelector(".clippy");
      if (clippyElement) {
        const rect = clippyElement.getBoundingClientRect();
        setBalloonPosition({
          left: rect.left + rect.width / 2 - 110,
          top: rect.top - 200,
        });
      }

      setChatInitialMessage(initialMessage);
      setChatBalloonVisible(true);
      setCustomBalloonVisible(false);
      return true;
    };

    window.getClippyInstance = () => clippyInstanceRef.current;

    // Listen for BIOS completion for welcome message
    const handleBiosComplete = () => {
      if (!welcomeShownRef.current) {
        setTimeout(() => {
          if (window.clippy && assistantVisible) {
            window.clippy.play("Greeting");
            setTimeout(() => {
              if (window.showClippyCustomBalloon) {
                window.showClippyCustomBalloon(
                  "Welcome to Hydra98! Double-click me for help."
                );
              }
            }, 1000);
            welcomeShownRef.current = true;
          }
        }, 2000);
      }
    };

    window.addEventListener("biosSequenceCompleted", handleBiosComplete);

    return () => {
      delete window._clippyProviderInitialized;
      delete window.setAssistantVisible;
      delete window.setCurrentAgent;
      delete window.setScreenPowerState;
      delete window.showClippyCustomBalloon;
      delete window.hideClippyCustomBalloon;
      delete window.showClippyChatBalloon;
      delete window.getClippyInstance;
      window.removeEventListener("biosSequenceCompleted", handleBiosComplete);
    };
  }, [isScreenPoweredOn, assistantVisible, positionLocked]);

  // Handle position lock changes
  useEffect(() => {
    window._clippyPositionLocked = positionLocked;
    try {
      localStorage.setItem("clippy_position_locked", positionLocked.toString());
    } catch (e) {
      console.error("Error saving position lock state:", e);
    }
  }, [positionLocked]);

  // Chat message handler
  const handleChatMessage = (message, callback) => {
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
      } else if (
        lowercaseMsg.includes("hydra") ||
        lowercaseMsg.includes("98")
      ) {
        response =
          "Hydra98 is a Windows 98-themed web application that recreates the classic desktop experience!";
      } else {
        response =
          "I'm not sure about that. Is there something specific you'd like to know?";
      }

      callback(response);
    }, 1000);
  };

  // Context value
  const contextValue = {
    assistantVisible,
    setAssistantVisible,
    currentAgent,
    setCurrentAgent,
    position,
    setPosition,
    positionLocked,
    setPositionLocked,
    isScreenPoweredOn,
    setIsScreenPoweredOn,
    setClippyInstance: (instance) => {
      clippyInstanceRef.current = instance;
      window.clippy = instance;
    },
    getClippyInstance: () => clippyInstanceRef.current,
    isMobile,
  };

  return (
    <ClippyContext.Provider value={contextValue}>
      <ReactClippyProvider agentName={currentAgent}>
        {children}

        <ClippyController
          visible={assistantVisible}
          isScreenPoweredOn={isScreenPoweredOn}
          position={position}
          setPosition={setPosition}
          positionLocked={positionLocked}
          clippyInstanceRef={clippyInstanceRef}
          overlayRef={overlayRef}
        />

        {/* Balloons - only when screen is on */}
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

// Simplified ClippyController
const ClippyController = ({
  visible,
  isScreenPoweredOn,
  position,
  setPosition,
  positionLocked,
  clippyInstanceRef,
  overlayRef,
}) => {
  const { clippy } = useClippy();
  const rafRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const doubleClickCountRef = useRef(0);

  useEffect(() => {
    if (!clippy || !visible) return;

    let mounted = true;
    clippyInstanceRef.current = clippy;
    window.clippy = clippy;

    // Enhanced play method
    const originalPlay = clippy.play;
    clippy.play = function (animation) {
      if (!isScreenPoweredOn || !mounted) return;

      const clippyEl = document.querySelector(".clippy");
      if (clippyEl) {
        clippyEl.style.visibility = "visible";
        clippyEl.style.opacity = "1";
        clippyEl.style.display = "block";
      }

      try {
        return originalPlay.call(this, animation);
      } catch (e) {
        console.error(`Error playing animation ${animation}:`, e);
      }
    };

    // Setup Clippy element
    const setupClippy = () => {
      const clippyEl = document.querySelector(".clippy");
      if (!clippyEl || !mounted) return false;

      // Mobile vs Desktop positioning
      if (isMobile) {
        clippyEl.style.position = "fixed";
        clippyEl.style.bottom = "100px";
        clippyEl.style.right = "20px";
        clippyEl.style.transform = "scale(0.8)";
        clippyEl.style.transformOrigin = "center bottom";
        clippyEl.style.zIndex = "1500";
      } else {
        clippyEl.style.position = "fixed";
        clippyEl.style.left = `${position.x}px`;
        clippyEl.style.top = `${position.y}px`;
        clippyEl.style.transform = "scale(0.9)";
        clippyEl.style.transformOrigin = "center bottom";
        clippyEl.style.zIndex = "2000";
      }

      clippyEl.style.pointerEvents = "none";
      clippyEl.style.visibility = isScreenPoweredOn ? "visible" : "hidden";
      clippyEl.style.opacity = isScreenPoweredOn ? "1" : "0";

      // Create/update overlay
      if (!overlayRef.current) {
        const overlay = document.createElement("div");
        overlay.id = "clippy-clickable-overlay";
        overlay.style.position = "fixed";
        overlay.style.cursor = "pointer";
        overlay.style.background = "transparent";
        overlay.style.pointerEvents = "auto";
        overlay.style.zIndex = isMobile ? "1510" : "2010";

        // Double-click handler
        overlay.addEventListener("dblclick", (e) => {
          e.preventDefault();

          if (clippy.play) {
            clippy.play("Greeting");

            // Only show balloon every 3rd double-click
            doubleClickCountRef.current = (doubleClickCountRef.current + 1) % 3;

            if (doubleClickCountRef.current === 0) {
              setTimeout(() => {
                if (window.showClippyCustomBalloon) {
                  window.showClippyCustomBalloon("Hello! How can I help you?");
                }
              }, 800);
            }
          }
        });

        // Right-click handler
        overlay.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          if (window.showClippyCustomBalloon) {
            window.showClippyCustomBalloon("Right-click me for more options!");
          }
        });

        overlayRef.current = overlay;
        document.body.appendChild(overlay);
      }

      // Position overlay
      const rect = clippyEl.getBoundingClientRect();
      const overlay = overlayRef.current;
      overlay.style.left = `${rect.left}px`;
      overlay.style.top = `${rect.top}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.style.visibility = isScreenPoweredOn ? "visible" : "hidden";

      return true;
    };

    // Single RAF for positioning
    const updateLoop = (timestamp) => {
      if (!mounted) return;

      const interval = isMobile ? 1000 : 500;

      if (timestamp - lastUpdateRef.current > interval) {
        setupClippy();
        lastUpdateRef.current = timestamp;
      }

      rafRef.current = requestAnimationFrame(updateLoop);
    };

    // Initial setup
    const initialSetup = () => {
      if (setupClippy()) {
        rafRef.current = requestAnimationFrame(updateLoop);
      } else {
        setTimeout(initialSetup, 500);
      }
    };

    initialSetup();

    return () => {
      mounted = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (overlayRef.current && overlayRef.current.parentNode) {
        overlayRef.current.parentNode.removeChild(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, [clippy, visible, isScreenPoweredOn, position, positionLocked]);

  return null;
};

export const useClippyContext = () => useContext(ClippyContext);
export default ClippyProvider;
