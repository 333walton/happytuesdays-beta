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
import "./_styles.scss";

const ClippyContext = createContext(null);

// Device detection - run once and cache
const isMobile = (() => {
  try {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768
    );
  } catch {
    return false;
  }
})();

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

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

  // Refs for cleanup and preventing memory leaks
  const clippyInstanceRef = useRef(null);
  const overlayRef = useRef(null);
  const welcomeShownRef = useRef(false);
  const initializationRef = useRef(false);
  const mountedRef = useRef(false);

  // Position state with safe defaults
  const [position, setPosition] = useState(() => {
    if (isMobile) {
      return { x: 0, y: 0 }; // Not used on mobile
    }
    return { x: 520, y: 360 };
  });

  // Safe DOM query helper
  const safeQuerySelector = useCallback((selector) => {
    try {
      return document.querySelector(selector);
    } catch {
      return null;
    }
  }, []);

  // Safe position calculation for desktop
  const calculateDesktopPosition = useCallback(() => {
    if (isMobile || !mountedRef.current) return null;

    try {
      const desktop =
        safeQuerySelector(".desktop.screen") ||
        safeQuerySelector(".desktop") ||
        safeQuerySelector(".w98");

      if (desktop) {
        const rect = desktop.getBoundingClientRect();
        const taskbarHeight = 30;
        return {
          x: rect.left + rect.width - 135, // 15px more to the right (was 120)
          y: rect.top + rect.height - taskbarHeight - 100,
        };
      }
    } catch (error) {
      console.warn("Error calculating desktop position:", error);
    }
    return null;
  }, [safeQuerySelector]);

  // Debounced position update
  const debouncedPositionUpdate = useCallback(
    debounce(() => {
      if (!isMobile && mountedRef.current) {
        const newPos = calculateDesktopPosition();
        if (newPos) {
          setPosition(newPos);
        }
      }
    }, 250),
    [calculateDesktopPosition]
  );

  // Initialize global functions once
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;
    mountedRef.current = true;

    // Only set up globals if not already defined
    if (typeof window !== "undefined" && !window._clippyGlobalsInitialized) {
      window._clippyGlobalsInitialized = true;

      // Safe global functions with error handling
      window.setClippyPosition = (newPosition) => {
        if (!mountedRef.current) return false;

        try {
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
        } catch (error) {
          console.error("Error setting Clippy position:", error);
        }
        return false;
      };

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

      // Balloon functions with safety checks
      window.showClippyCustomBalloon = (message) => {
        if (!mountedRef.current || !isScreenPoweredOn) return false;

        try {
          const clippyElement = safeQuerySelector(".clippy");
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
          const clippyElement = safeQuerySelector(".clippy");
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
        } catch (error) {
          console.error("Error showing chat balloon:", error);
          return false;
        }
      };

      window.getClippyInstance = () => clippyInstanceRef.current;
    }

    // Initial position calculation for desktop
    if (!isMobile) {
      debouncedPositionUpdate();
    }

    // Safe resize listener
    const handleResize = () => {
      if (!isMobile && mountedRef.current) {
        debouncedPositionUpdate();
      }
    };

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
                    "Welcome to Hydra98! Double-click me for help."
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

    // Add listeners
    window.addEventListener("resize", handleResize);
    window.addEventListener("biosSequenceCompleted", handleBiosComplete);

    // Cleanup function
    return () => {
      mountedRef.current = false;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("biosSequenceCompleted", handleBiosComplete);
    };
  }, [assistantVisible, debouncedPositionUpdate, isScreenPoweredOn]);

  // Handle position lock changes
  useEffect(() => {
    if (!mountedRef.current) return;

    try {
      window._clippyPositionLocked = positionLocked;
      localStorage.setItem("clippy_position_locked", positionLocked.toString());
    } catch (e) {
      console.error("Error saving position lock state:", e);
    }
  }, [positionLocked]);

  // Chat message handler with error handling
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

        {/* Balloons - only when screen is on and component is mounted */}
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

// Crash-resistant ClippyController
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
  const mountedRef = useRef(false);

  // Safe DOM manipulation
  const safeSetStyle = useCallback((element, styles) => {
    if (!element || !mountedRef.current) return false;

    try {
      Object.entries(styles).forEach(([key, value]) => {
        element.style[key] = value;
      });
      return true;
    } catch (error) {
      console.error("Error setting styles:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!clippy || !visible) return;

    mountedRef.current = true;
    clippyInstanceRef.current = clippy;
    window.clippy = clippy;

    // Enhanced play method with safety checks
    const originalPlay = clippy.play;
    clippy.play = function (animation) {
      if (!isScreenPoweredOn || !mountedRef.current) return;

      const clippyEl = document.querySelector(".clippy");
      if (clippyEl) {
        safeSetStyle(clippyEl, {
          visibility: "visible",
          opacity: "1",
          display: "block",
        });
      }

      try {
        return originalPlay.call(this, animation);
      } catch (e) {
        console.error(`Error playing animation ${animation}:`, e);
      }
    };

    // Setup Clippy element with crash protection
    const setupClippy = () => {
      if (!mountedRef.current) return false;

      const clippyEl = document.querySelector(".clippy");
      if (!clippyEl) return false;

      try {
        // Mobile vs Desktop positioning
        if (isMobile) {
          safeSetStyle(clippyEl, {
            position: "fixed",
            bottom: "100px",
            right: "35px", // 15px more to the right for mobile
            transform: "scale(0.8)",
            transformOrigin: "center bottom",
            zIndex: "1500",
            pointerEvents: "none",
            visibility: isScreenPoweredOn ? "visible" : "hidden",
            opacity: isScreenPoweredOn ? "1" : "0",
          });
        } else {
          safeSetStyle(clippyEl, {
            position: "fixed",
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: "scale(0.9)",
            transformOrigin: "center bottom",
            zIndex: "2000",
            pointerEvents: "none",
            visibility: isScreenPoweredOn ? "visible" : "hidden",
            opacity: isScreenPoweredOn ? "1" : "0",
          });
        }

        // Create/update overlay with safety checks
        if (!overlayRef.current && mountedRef.current) {
          const overlay = document.createElement("div");
          overlay.id = "clippy-clickable-overlay";

          safeSetStyle(overlay, {
            position: "fixed",
            cursor: "pointer",
            background: "transparent",
            pointerEvents: "auto",
            zIndex: isMobile ? "1510" : "2010",
          });

          // Safe event handlers
          const handleDoubleClick = (e) => {
            if (!mountedRef.current) return;

            try {
              e.preventDefault();

              if (clippy.play) {
                clippy.play("Greeting");

                doubleClickCountRef.current =
                  (doubleClickCountRef.current + 1) % 3;

                if (doubleClickCountRef.current === 0) {
                  setTimeout(() => {
                    if (window.showClippyCustomBalloon && mountedRef.current) {
                      window.showClippyCustomBalloon(
                        "Hello! How can I help you?"
                      );
                    }
                  }, 800);
                }
              }
            } catch (error) {
              console.error("Error handling double click:", error);
            }
          };

          const handleContextMenu = (e) => {
            if (!mountedRef.current) return;

            try {
              e.preventDefault();
              if (window.showClippyCustomBalloon) {
                window.showClippyCustomBalloon(
                  "Right-click me for more options!"
                );
              }
            } catch (error) {
              console.error("Error handling context menu:", error);
            }
          };

          overlay.addEventListener("dblclick", handleDoubleClick);
          overlay.addEventListener("contextmenu", handleContextMenu);

          overlayRef.current = overlay;
          document.body.appendChild(overlay);
        }

        // Position overlay safely
        if (overlayRef.current) {
          const rect = clippyEl.getBoundingClientRect();
          safeSetStyle(overlayRef.current, {
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            visibility: isScreenPoweredOn ? "visible" : "hidden",
          });
        }

        return true;
      } catch (error) {
        console.error("Error setting up Clippy:", error);
        return false;
      }
    };

    // Throttled update loop
    const updateLoop = (timestamp) => {
      if (!mountedRef.current) return;

      const interval = isMobile ? 1000 : 500;

      if (timestamp - lastUpdateRef.current > interval) {
        setupClippy();
        lastUpdateRef.current = timestamp;
      }

      rafRef.current = requestAnimationFrame(updateLoop);
    };

    // Initial setup with retry logic
    const initialSetup = () => {
      if (!mountedRef.current) return;

      if (setupClippy()) {
        rafRef.current = requestAnimationFrame(updateLoop);
      } else {
        setTimeout(initialSetup, 500);
      }
    };

    initialSetup();

    return () => {
      mountedRef.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
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
  }, [
    clippy,
    visible,
    isScreenPoweredOn,
    position,
    positionLocked,
    safeSetStyle,
  ]);

  return null;
};

export const useClippyContext = () => useContext(ClippyContext);
export default ClippyProvider;
