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

  // Position state
  const [position, setPosition] = useState(() => ({
    x: isMobile ? window.innerWidth - 100 : 520,
    y: isMobile ? window.innerHeight - 150 : 360,
  }));

  // Initialize global functions and welcome message
  useEffect(() => {
    if (window._clippyProviderInitialized) return;
    window._clippyProviderInitialized = true;

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

    // Position functions
    window.setClippyPosition = (pos) => {
      if (typeof pos === "object" && pos !== null) {
        if (pos.x !== undefined && pos.y !== undefined) {
          setPosition({ x: pos.x, y: pos.y });
          return true;
        }
      }
      return false;
    };

    window.setClippyInitialPosition = (options) => {
      if (typeof options !== "object" || options === null) {
        return false;
      }

      const desktop = document.querySelector(".desktop") || document.body;
      const rect = desktop.getBoundingClientRect();

      if (typeof options.position === "string") {
        const percentMatch = options.position.match(/(\d+)%\s+(\d+)%/);
        if (percentMatch) {
          const xPercent = parseInt(percentMatch[1], 10) / 100;
          const yPercent = parseInt(percentMatch[2], 10) / 100;
          setPosition({
            x: rect.left + rect.width * xPercent,
            y: rect.top + rect.height * yPercent,
          });
          return true;
        }

        const namedPositions = {
          "higher-right": { x: 0.85, y: 0.65 },
          "bottom-right": { x: 0.85, y: 0.85 },
          "bottom-left": { x: 0.15, y: 0.85 },
          "top-right": { x: 0.85, y: 0.15 },
          "top-left": { x: 0.15, y: 0.15 },
          center: { x: 0.5, y: 0.5 },
        };

        const position =
          namedPositions[options.position.toLowerCase()] ||
          namedPositions["higher-right"];
        setPosition({
          x: rect.left + rect.width * position.x - 30,
          y: rect.top + rect.height * position.y + 30,
        });
        return true;
      } else if (options.x !== undefined && options.y !== undefined) {
        setPosition({ x: options.x, y: options.y });
        return true;
      }

      return false;
    };

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
      delete window.setClippyPosition;
      delete window.setClippyInitialPosition;
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

    // Setup Clippy element with delayed positioning for stability
    const setupClippy = () => {
      const clippyEl = document.querySelector(".clippy");
      if (!clippyEl || !mounted) return false;

      // CSS will handle most of the styling and positioning
      // We just need to add delayed desktop positioning

      // For desktop only, calculate position after layout is stable
      if (window.innerWidth > 768) {
        // Delay desktop positioning to allow layout to stabilize
        setTimeout(() => {
          if (!mounted || !clippyEl) return;

          // Get desktop after delay when it should be stable
          const desktop = document.querySelector(".desktop") || document.body;
          const rect = desktop.getBoundingClientRect();

          // Only apply positioning if desktop has a valid size
          if (rect.width > 0 && rect.height > 0) {
            // Use position if explicitly set, otherwise calculate optimal position
            if (position.x !== 0 || position.y !== 0) {
              clippyEl.style.left = `${position.x}px`;
              clippyEl.style.top = `${position.y}px`;
            } else {
              // Perfected desktop formula with delay to ensure stability
              clippyEl.style.left = `${rect.left + rect.width * 0.85 - 30}px`;
              clippyEl.style.top = `${rect.top + rect.height * 0.65 + 30}px`;
            }
          }
        }, 1000); // Initial delay for layout stabilization
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

    // Add window resize handler to trigger position updates
    const resizeHandler = () => {
      window._clippyLastResize = Date.now();
    };
    window.addEventListener("resize", resizeHandler);

    // Update overlay position separately from clippy positioning
    const updateOverlayPosition = () => {
      if (!overlayRef.current) return;

      const clippyEl = document.querySelector(".clippy");
      if (!clippyEl) return;

      const rect = clippyEl.getBoundingClientRect();
      const overlay = overlayRef.current;

      overlay.style.left = `${rect.left}px`;
      overlay.style.top = `${rect.top}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.style.visibility = isScreenPoweredOn ? "visible" : "hidden";
    };

    // Modified RAF loop with reduced frequency
    const updateLoop = (timestamp) => {
      if (!mounted) return;

      // Use consistent interval for better performance
      const interval = 1000; // 1 second interval regardless of device

      if (timestamp - lastUpdateRef.current > interval) {
        // Check if resize happened recently
        if (
          window._clippyLastResize &&
          Date.now() - window._clippyLastResize < 2000
        ) {
          setupClippy();
          window._clippyLastResize = null;
        }

        // Always update overlay position
        updateOverlayPosition();
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
      // Clean up resize handler
      window.removeEventListener("resize", resizeHandler);

      // Clean up animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Clean up overlay element
      if (overlayRef.current && overlayRef.current.parentNode) {
        overlayRef.current.parentNode.removeChild(overlayRef.current);
        overlayRef.current = null;
      }

      // Reset resize tracking
      window._clippyLastResize = null;
    };
  }, [clippy, visible, isScreenPoweredOn, position, positionLocked]);

  return null;
};

export const useClippyContext = () => useContext(ClippyContext);
export default ClippyProvider;
