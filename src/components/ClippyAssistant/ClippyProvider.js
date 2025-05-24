import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  useClippy,
  ClippyProvider as ReactClippyProvider,
} from "@react95/clippy";

import CustomBalloon from "./CustomBalloon";
import ChatBalloon from "./ChatBalloon";
import ClippyPositioning from "./ClippyPositioning"; // Import centralized positioning
import "./_styles.scss";

const ClippyContext = createContext(null);

// Get device info from centralized positioning
const isMobile =
  ClippyPositioning?.isMobile ||
  (() => {
    try {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      return mobileRegex.test(userAgent) || window.innerWidth < 768;
    } catch {
      return false;
    }
  })();

const ClippyProvider = ({ children, defaultAgent = "Clippy" }) => {
  // Core state
  const [assistantVisible, setAssistantVisible] = useState(true);
  const [currentAgent, setCurrentAgent] = useState(defaultAgent);
  const [isScreenPoweredOn, setIsScreenPoweredOn] = useState(true);

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
  const initializationRef = useRef(false);
  const mountedRef = useRef(false);

  // Position state - only used for desktop
  const [position, setPosition] = useState(() => {
    if (isMobile) {
      return { x: 0, y: 0 }; // Not used on mobile - positioning handled by CSS
    }
    return ClippyPositioning.calculateDesktopPosition();
  });

  // Initialize global functions once
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;
    mountedRef.current = true;

    if (typeof window !== "undefined" && !window._clippyGlobalsInitialized) {
      window._clippyGlobalsInitialized = true;

      // Position functions
      window.setClippyPosition = (newPosition) => {
        if (!mountedRef.current || isMobile) return false;

        try {
          if (
            newPosition &&
            (newPosition.x !== undefined || newPosition.y !== undefined)
          ) {
            setPosition(newPosition);
            return true;
          }
        } catch (error) {
          console.error("Error setting Clippy position:", error);
        }
        return false;
      };

      // Visibility functions
      window.setAssistantVisible = (visible) => {
        if (!mountedRef.current) return false;
        try {
          setAssistantVisible(visible);
          if (!visible) {
            setCustomBalloonVisible(false);
            setChatBalloonVisible(false);
          }
          return true;
        } catch (error) {
          console.error("Error setting assistant visibility:", error);
          return false;
        }
      };

      window.setCurrentAgent = (agent) => {
        if (!mountedRef.current) return false;
        try {
          setCurrentAgent(agent);
          return true;
        } catch (error) {
          console.error("Error setting current agent:", error);
          return false;
        }
      };

      window.setScreenPowerState = (powered) => {
        if (!mountedRef.current) return false;
        try {
          setIsScreenPoweredOn(powered);
          return true;
        } catch (error) {
          console.error("Error setting screen power state:", error);
          return false;
        }
      };

      // Balloon functions using centralized positioning
      window.showClippyCustomBalloon = (message) => {
        if (!mountedRef.current || !isScreenPoweredOn) return false;

        try {
          const clippyElement = document.querySelector(".clippy");
          const position = ClippyPositioning.getBalloonPosition(
            clippyElement,
            "speech"
          );

          setBalloonPosition(position);
          setCustomBalloonMessage(message);
          setCustomBalloonVisible(true);
          setChatBalloonVisible(false);

          setTimeout(() => {
            if (mountedRef.current) {
              setCustomBalloonVisible(false);
            }
          }, 6000);
          return true;
        } catch (error) {
          console.error("Error showing custom balloon:", error);
          return false;
        }
      };

      window.hideClippyCustomBalloon = () => {
        if (!mountedRef.current) return false;
        try {
          setCustomBalloonVisible(false);
          setChatBalloonVisible(false);
          return true;
        } catch (error) {
          console.error("Error hiding custom balloon:", error);
          return false;
        }
      };

      window.showClippyChatBalloon = (initialMessage) => {
        if (!mountedRef.current || !isScreenPoweredOn) return false;

        try {
          const clippyElement = document.querySelector(".clippy");
          const position = ClippyPositioning.getBalloonPosition(
            clippyElement,
            "chat"
          );

          setBalloonPosition(position);
          setChatInitialMessage(initialMessage);
          setChatBalloonVisible(true);
          setCustomBalloonVisible(false);
          return true;
        } catch (error) {
          console.error("Error showing chat balloon:", error);
          return false;
        }
      };

      window.getClippyInstance = () => clippyInstanceRef.current;
    }

    // BIOS completion handler
    const handleBiosComplete = () => {
      if (!welcomeShownRef.current && mountedRef.current) {
        setTimeout(() => {
          if (window.clippy && assistantVisible && mountedRef.current) {
            try {
              window.clippy.play("Greeting");
              setTimeout(() => {
                if (window.showClippyCustomBalloon && mountedRef.current) {
                  window.showClippyCustomBalloon(
                    "Welcome to Hydra98! Tap me for help."
                  );
                }
              }, 1000);
              welcomeShownRef.current = true;
            } catch (error) {
              console.error("Error playing welcome animation:", error);
            }
          }
        }, 2000);
      }
    };

    window.addEventListener("biosSequenceCompleted", handleBiosComplete);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("biosSequenceCompleted", handleBiosComplete);
    };
  }, [assistantVisible, isScreenPoweredOn]);

  // Chat message handler
  const handleChatMessage = useCallback((message, callback) => {
    if (!mountedRef.current) return;

    try {
      setTimeout(() => {
        if (!mountedRef.current) return;

        let response;
        const lowercaseMsg = message.toLowerCase();

        if (lowercaseMsg.includes("hello") || lowercaseMsg.includes("hi")) {
          response = "Hello there! How can I assist you?";
        } else if (lowercaseMsg.includes("help")) {
          response =
            "I can help with many tasks. What specifically do you need assistance with?";
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

        if (mountedRef.current && callback) {
          callback(response);
        }
      }, 1000);
    } catch (error) {
      console.error("Error handling chat message:", error);
      if (callback) {
        callback("Sorry, I encountered an error processing your message.");
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (typeof window !== "undefined") {
        delete window._clippyGlobalsInitialized;
        delete window.setAssistantVisible;
        delete window.setCurrentAgent;
        delete window.setScreenPowerState;
        delete window.showClippyCustomBalloon;
        delete window.hideClippyCustomBalloon;
        delete window.showClippyChatBalloon;
        delete window.getClippyInstance;
        delete window.setClippyPosition;
      }
    };
  }, []);

  const contextValue = {
    assistantVisible,
    setAssistantVisible,
    currentAgent,
    setCurrentAgent,
    position,
    setPosition,
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

        <SimplifiedClippyController
          visible={assistantVisible}
          isScreenPoweredOn={isScreenPoweredOn}
          position={position}
          clippyInstanceRef={clippyInstanceRef}
          overlayRef={overlayRef}
        />

        {mountedRef.current && isScreenPoweredOn && customBalloonVisible && (
          <CustomBalloon
            message={customBalloonMessage}
            position={balloonPosition}
          />
        )}

        {mountedRef.current && isScreenPoweredOn && chatBalloonVisible && (
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

// Simplified controller using centralized positioning
const SimplifiedClippyController = ({
  visible,
  isScreenPoweredOn,
  position,
  clippyInstanceRef,
  overlayRef,
}) => {
  const { clippy } = useClippy();
  const rafRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const tapCountRef = useRef(0);
  const mountedRef = useRef(false);
  const tapTimeoutRef = useRef(null);

  useEffect(() => {
    if (!clippy || !visible) return;

    mountedRef.current = true;
    clippyInstanceRef.current = clippy;
    window.clippy = clippy;

    const setupClippy = () => {
      if (!mountedRef.current) return false;

      const clippyEl = document.querySelector(".clippy");
      if (!clippyEl) return false;

      try {
        // Use centralized positioning - SINGLE SOURCE OF TRUTH
        ClippyPositioning.positionClippy(clippyEl, isMobile ? null : position);

        // Set visibility
        ClippyPositioning.applyStyles(clippyEl, {
          visibility: isScreenPoweredOn ? "visible" : "hidden",
          opacity: isScreenPoweredOn ? "1" : "0",
          pointerEvents: "none",
        });

        // Setup overlay using centralized positioning
        if (!overlayRef.current && mountedRef.current) {
          const overlay = document.createElement("div");
          overlay.id = "clippy-clickable-overlay";

          // Event handlers (simplified - no positioning logic here)
          const handleInteraction = (e) => {
            if (!mountedRef.current) return;

            try {
              e.preventDefault();
              e.stopPropagation();

              if (clippy.play) {
                clippy.play("Greeting");

                setTimeout(() => {
                  if (window.showClippyCustomBalloon && mountedRef.current) {
                    const messages = [
                      "Hello! Tap me again for more help!",
                      "Need assistance? I'm here to help!",
                      "What can I help you with today?",
                    ];
                    tapCountRef.current =
                      (tapCountRef.current + 1) % messages.length;
                    window.showClippyCustomBalloon(
                      messages[tapCountRef.current]
                    );
                  }
                }, 800);
              }
            } catch (error) {
              console.error("Error handling interaction:", error);
            }
          };

          // Add appropriate event listeners
          if (isMobile) {
            overlay.addEventListener("touchstart", handleInteraction, {
              passive: false,
            });

            // Long press for chat
            let longPressTimer;
            overlay.addEventListener(
              "touchstart",
              (e) => {
                longPressTimer = setTimeout(() => {
                  if (window.showClippyChatBalloon && mountedRef.current) {
                    window.showClippyChatBalloon(
                      "Hi! What would you like to chat about?"
                    );
                  }
                }, 800);
              },
              { passive: false }
            );

            overlay.addEventListener(
              "touchend",
              () => {
                clearTimeout(longPressTimer);
              },
              { passive: false }
            );
          } else {
            overlay.addEventListener("dblclick", handleInteraction);
          }

          overlayRef.current = overlay;
          document.body.appendChild(overlay);
        }

        // Position overlay using centralized positioning
        if (overlayRef.current) {
          ClippyPositioning.positionOverlay(overlayRef.current, clippyEl);

          ClippyPositioning.applyStyles(overlayRef.current, {
            visibility: isScreenPoweredOn ? "visible" : "hidden",
          });
        }

        return true;
      } catch (error) {
        console.error("Error setting up Clippy:", error);
        return false;
      }
    };

    // Simple update loop
    const updateLoop = (timestamp) => {
      if (!mountedRef.current) return;

      const interval = 1000; // Update every second

      if (timestamp - lastUpdateRef.current > interval) {
        setupClippy();
        lastUpdateRef.current = timestamp;
      }

      rafRef.current = requestAnimationFrame(updateLoop);
    };

    // Initial setup
    if (setupClippy()) {
      rafRef.current = requestAnimationFrame(updateLoop);
    }

    return () => {
      mountedRef.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      if (overlayRef.current && overlayRef.current.parentNode) {
        try {
          overlayRef.current.parentNode.removeChild(overlayRef.current);
        } catch (error) {
          console.error("Error removing overlay:", error);
        }
        overlayRef.current = null;
      }
    };
  }, [clippy, visible, isScreenPoweredOn, position]);

  return null;
};

export const useClippyContext = () => useContext(ClippyContext);
export default ClippyProvider;
