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
import ClippyPositioning from "./ClippyPositioning";
import "./_styles.scss";

const ClippyContext = createContext(null);

// Safe device detection with fallbacks
const detectMobile = () => {
  try {
    if (typeof window === "undefined") return false;

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isSmallScreen = window.innerWidth < 768 || window.innerHeight < 600;
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    return mobileRegex.test(userAgent) || isSmallScreen || isTouchDevice;
  } catch (error) {
    console.warn("Error detecting mobile device:", error);
    return false;
  }
};

const isMobile = detectMobile();

// Safe error wrapper for all operations
const safeExecute = (operation, fallback = null, context = "operation") => {
  try {
    return operation();
  } catch (error) {
    console.error(`Safe execution failed in ${context}:`, error);
    return fallback;
  }
};

const ClippyProvider = ({ children, defaultAgent = "Clippy" }) => {
  // Startup sequence state - Clippy hidden until startup completes
  const [startupComplete, setStartupComplete] = useState(false);

  // Core state with safe defaults
  const [assistantVisible, setAssistantVisible] = useState(true);
  const [currentAgent, setCurrentAgent] = useState(defaultAgent);
  const [isScreenPoweredOn, setIsScreenPoweredOn] = useState(true);

  // Balloon state
  const [customBalloonVisible, setCustomBalloonVisible] = useState(false);
  const [customBalloonMessage, setCustomBalloonMessage] = useState("");
  const [chatBalloonVisible, setChatBalloonVisible] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState("");
  const [balloonPosition, setBalloonPosition] = useState({ left: 0, top: 0 });

  // Refs for cleanup and crash prevention
  const clippyInstanceRef = useRef(null);
  const overlayRef = useRef(null);
  const welcomeShownRef = useRef(false);
  const initializationRef = useRef(false);
  const mountedRef = useRef(false);
  const errorCountRef = useRef(0);
  const lastErrorRef = useRef(0);
  const startupTimeoutRef = useRef(null);

  // Position state - only used for desktop
  const [position, setPosition] = useState(() => {
    if (isMobile) {
      return { x: 0, y: 0 }; // Not used on mobile
    }
    return safeExecute(
      () => ClippyPositioning.calculateDesktopPosition(),
      { x: 520, y: 360 },
      "initial position calculation"
    );
  });

  // Monitor startup and shutdown sequence completion (CLEANED UP)
  useEffect(() => {
    let isMonitoring = true;
    let lastLogTime = 0;

    const checkSequenceStatus = () => {
      if (!isMonitoring) return;

      const biosWrapper = document.querySelector(".BIOSWrapper");
      const windowsLaunchWrapper = document.querySelector(
        ".WindowsLaunchWrapper"
      );
      const desktop = document.querySelector(".desktop");
      const shutdownScreen = document.querySelector(
        ".itIsNowSafeToTurnOffYourComputer"
      );

      let sequenceActive = false;

      // Check startup/shutdown screens
      if (biosWrapper && windowsLaunchWrapper) {
        const biosStyles = getComputedStyle(biosWrapper);
        const windowsStyles = getComputedStyle(windowsLaunchWrapper);

        const biosVisible =
          !biosWrapper.classList.contains("hidden") &&
          biosStyles.opacity !== "0" &&
          biosStyles.visibility !== "hidden" &&
          biosStyles.display !== "none";

        const windowsVisible =
          !windowsLaunchWrapper.classList.contains("hidden") &&
          windowsStyles.opacity !== "0" &&
          windowsStyles.visibility !== "hidden" &&
          windowsStyles.display !== "none";

        const biosTransitioning =
          parseFloat(biosStyles.opacity) > 0 ||
          biosWrapper.style.opacity === "1" ||
          biosWrapper.classList.contains("visible");

        const windowsTransitioning =
          parseFloat(windowsStyles.opacity) > 0 ||
          windowsLaunchWrapper.style.opacity === "1" ||
          windowsLaunchWrapper.classList.contains("visible");

        sequenceActive =
          biosVisible ||
          windowsVisible ||
          biosTransitioning ||
          windowsTransitioning;
      }

      // Check for Windows shutting down screen
      if (desktop && desktop.classList.contains("windowsShuttingDown")) {
        sequenceActive = true;
      }

      // Check for final shutdown screen
      if (shutdownScreen) {
        sequenceActive = true;
      }

      // Only update state if it actually changed
      if (sequenceActive !== !startupComplete) {
        const now = Date.now();

        if (sequenceActive) {
          console.log("🔄 Shutdown/startup sequence detected - Hiding Clippy");
          setStartupComplete(false);
        } else {
          console.log("✅ Shutdown/startup sequence ended - Showing Clippy");
          setStartupComplete(true);
        }

        lastLogTime = now;
      }

      // Adaptive monitoring - check more frequently during active sequences, less when idle
      const nextCheckDelay = sequenceActive ? 500 : 2000; // Reduced frequency
      startupTimeoutRef.current = setTimeout(
        checkSequenceStatus,
        nextCheckDelay
      );
    };

    // Initial check
    checkSequenceStatus();

    return () => {
      isMonitoring = false;
      if (startupTimeoutRef.current) {
        clearTimeout(startupTimeoutRef.current);
      }
    };
  }, [startupComplete]);

  // Error rate limiting
  const isErrorRateLimited = useCallback(() => {
    const now = Date.now();
    if (now - lastErrorRef.current < 1000) {
      errorCountRef.current++;
    } else {
      errorCountRef.current = 1;
    }
    lastErrorRef.current = now;

    if (errorCountRef.current > 5) {
      console.warn("Clippy error rate limit exceeded, throttling operations");
      return true;
    }
    return false;
  }, []);

  // Safe global function wrapper
  const createSafeGlobalFunction = useCallback(
    (fn, functionName) => {
      return (...args) => {
        if (!mountedRef.current || isErrorRateLimited() || !startupComplete) {
          return false;
        }

        return safeExecute(
          () => fn(...args),
          false,
          `global function ${functionName}`
        );
      };
    },
    [isErrorRateLimited, startupComplete]
  );

  // Initialize global functions once with crash protection
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;
    mountedRef.current = true;

    if (typeof window !== "undefined" && !window._clippyGlobalsInitialized) {
      window._clippyGlobalsInitialized = true;

      // Position functions with mobile checks
      window.setClippyPosition = createSafeGlobalFunction((newPosition) => {
        if (isMobile) {
          console.log("Position setting not supported on mobile devices");
          return false;
        }

        if (
          newPosition &&
          (newPosition.x !== undefined || newPosition.y !== undefined)
        ) {
          setPosition(newPosition);

          // Immediately apply the new position
          const clippyEl = document.querySelector(".clippy");
          if (clippyEl && ClippyPositioning) {
            return ClippyPositioning.positionClippy(clippyEl, newPosition);
          }
        }
        return false;
      }, "setClippyPosition");

      // Visibility functions
      window.setAssistantVisible = createSafeGlobalFunction((visible) => {
        setAssistantVisible(visible);
        if (!visible) {
          setCustomBalloonVisible(false);
          setChatBalloonVisible(false);
        }
        return true;
      }, "setAssistantVisible");

      window.setCurrentAgent = createSafeGlobalFunction((agent) => {
        setCurrentAgent(agent);
        return true;
      }, "setCurrentAgent");

      window.setScreenPowerState = createSafeGlobalFunction((powered) => {
        setIsScreenPoweredOn(powered);
        return true;
      }, "setScreenPowerState");

      // Balloon functions with safe positioning
      window.showClippyCustomBalloon = createSafeGlobalFunction((message) => {
        if (!isScreenPoweredOn || !startupComplete) return false;

        const clippyElement = document.querySelector(".clippy");
        const position = safeExecute(
          () => ClippyPositioning?.getBalloonPosition(clippyElement, "speech"),
          { left: 50, top: 50 },
          "balloon position calculation"
        );

        setBalloonPosition(position);
        setCustomBalloonMessage(message);
        setCustomBalloonVisible(true);
        setChatBalloonVisible(false);

        // Auto-hide after 6 seconds
        setTimeout(() => {
          if (mountedRef.current) {
            setCustomBalloonVisible(false);
          }
        }, 6000);

        return true;
      }, "showClippyCustomBalloon");

      window.hideClippyCustomBalloon = createSafeGlobalFunction(() => {
        setCustomBalloonVisible(false);
        setChatBalloonVisible(false);
        return true;
      }, "hideClippyCustomBalloon");

      window.showClippyChatBalloon = createSafeGlobalFunction(
        (initialMessage) => {
          if (!isScreenPoweredOn || !startupComplete) return false;

          const clippyElement = document.querySelector(".clippy");
          const position = safeExecute(
            () => ClippyPositioning?.getBalloonPosition(clippyElement, "chat"),
            { left: 50, top: 50 },
            "chat balloon position calculation"
          );

          setBalloonPosition(position);
          setChatInitialMessage(initialMessage);
          setChatBalloonVisible(true);
          setCustomBalloonVisible(false);
          return true;
        },
        "showClippyChatBalloon"
      );

      window.getClippyInstance = () => clippyInstanceRef.current;

      // Emergency reset function
      window.resetClippy = () => {
        console.log("🔄 Resetting Clippy...");
        safeExecute(
          () => {
            setCustomBalloonVisible(false);
            setChatBalloonVisible(false);
            setAssistantVisible(true);
            errorCountRef.current = 0;
          },
          null,
          "clippy reset"
        );
      };
    }

    // Enhanced BIOS completion handler with startup sequence awareness
    const handleBiosComplete = () => {
      if (
        !welcomeShownRef.current &&
        mountedRef.current &&
        assistantVisible &&
        startupComplete
      ) {
        // Wait a bit longer for startup sequence to fully complete
        setTimeout(() => {
          safeExecute(
            () => {
              if (window.clippy && mountedRef.current && startupComplete) {
                window.clippy.play("Greeting");
                setTimeout(() => {
                  if (window.showClippyCustomBalloon && mountedRef.current) {
                    const welcomeMessage = isMobile
                      ? "Welcome to Hydra98! Tap me for help."
                      : "Welcome to Hydra98! Double-click me for help.";
                    window.showClippyCustomBalloon(welcomeMessage);
                  }
                }, 1000);
                welcomeShownRef.current = true;
              }
            },
            null,
            "welcome sequence"
          );
        }, 3000); // Longer delay to ensure startup is fully complete
      }
    };

    const safeEventListener = (event) => {
      safeExecute(() => handleBiosComplete(), null, "BIOS completion handler");
    };

    window.addEventListener("biosSequenceCompleted", safeEventListener);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("biosSequenceCompleted", safeEventListener);
    };
  }, [
    assistantVisible,
    isScreenPoweredOn,
    createSafeGlobalFunction,
    startupComplete,
  ]);

  // Safe chat message handler
  const handleChatMessage = useCallback(
    (message, callback) => {
      if (!mountedRef.current || !startupComplete) return;

      safeExecute(
        () => {
          setTimeout(() => {
            if (!mountedRef.current || !startupComplete) return;

            let response;
            const lowercaseMsg = message.toLowerCase();

            if (lowercaseMsg.includes("hello") || lowercaseMsg.includes("hi")) {
              response = "Hello there! How can I assist you today?";
            } else if (lowercaseMsg.includes("help")) {
              response =
                "I can help with many tasks. What specifically do you need assistance with?";
            } else if (
              lowercaseMsg.includes("hydra") ||
              lowercaseMsg.includes("98")
            ) {
              response =
                "Hydra98 is a Windows 98-themed web application that recreates the classic desktop experience!";
            } else if (
              lowercaseMsg.includes("mobile") ||
              lowercaseMsg.includes("touch")
            ) {
              response = isMobile
                ? "I'm optimized for mobile! Tap me for quick help, or long-press for this chat."
                : "This appears to be a desktop environment. Double-click me for interactions!";
            } else {
              response =
                "I'm not sure about that. Is there something specific you'd like to know about Hydra98?";
            }

            if (mountedRef.current && callback) {
              callback(response);
            }
          }, 1000);
        },
        null,
        "chat message handling"
      );
    },
    [startupComplete]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;

      safeExecute(
        () => {
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
            delete window.resetClippy;
          }
        },
        null,
        "cleanup"
      );
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
    startupComplete, // Expose startup state
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

        {/* Only render Clippy components after startup completes */}
        {startupComplete && (
          <StartupAwareClippyController
            visible={assistantVisible}
            isScreenPoweredOn={isScreenPoweredOn}
            position={position}
            clippyInstanceRef={clippyInstanceRef}
            overlayRef={overlayRef}
          />
        )}

        {/* Only render balloons after startup completes */}
        {mountedRef.current &&
          isScreenPoweredOn &&
          customBalloonVisible &&
          startupComplete && (
            <CustomBalloon
              message={customBalloonMessage}
              position={balloonPosition}
            />
          )}

        {mountedRef.current &&
          isScreenPoweredOn &&
          chatBalloonVisible &&
          startupComplete && (
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

// Startup-aware controller with additional startup checks
const StartupAwareClippyController = ({
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
  const errorCountRef = useRef(0);
  const setupAttemptRef = useRef(0);

  // Mobile-optimized update intervals
  const updateInterval = isMobile ? 2000 : 1000;
  const maxSetupAttempts = 5;

  useEffect(() => {
    if (!clippy || !visible) return;

    mountedRef.current = true;
    clippyInstanceRef.current = clippy;
    window.clippy = clippy;

    const setupClippy = () => {
      if (!mountedRef.current || setupAttemptRef.current >= maxSetupAttempts) {
        return false;
      }

      setupAttemptRef.current++;

      return safeExecute(
        () => {
          const clippyEl = document.querySelector(".clippy");
          if (!clippyEl) return false;

          // Use centralized positioning with fallbacks
          const currentPosition = isMobile
            ? null
            : safeExecute(
                () => ClippyPositioning?.calculateDesktopPosition(),
                position,
                "desktop position calculation"
              );

          const positionSuccess = safeExecute(
            () => ClippyPositioning?.positionClippy(clippyEl, currentPosition),
            false,
            "clippy positioning"
          );

          // Set visibility with fallback
          const visibilityStyles = {
            visibility: isScreenPoweredOn ? "visible" : "hidden",
            opacity: isScreenPoweredOn ? "1" : "0",
            pointerEvents: "none",
          };

          safeExecute(
            () => ClippyPositioning?.applyStyles(clippyEl, visibilityStyles),
            false,
            "visibility styling"
          );

          // Setup overlay with crash protection
          if (!overlayRef.current && mountedRef.current) {
            const overlay = safeExecute(
              () => {
                const el = document.createElement("div");
                el.id = "clippy-clickable-overlay";
                return el;
              },
              null,
              "overlay creation"
            );

            if (!overlay) return false;

            // Mobile-optimized event handlers
            const handleInteraction = (e) => {
              if (!mountedRef.current) return;

              safeExecute(
                () => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (clippy.play) {
                    clippy.play("Greeting");

                    setTimeout(() => {
                      if (
                        window.showClippyCustomBalloon &&
                        mountedRef.current
                      ) {
                        const messages = [
                          isMobile
                            ? "Tap me again for more help!"
                            : "Double-click me again for more help!",
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
                },
                null,
                "interaction handling"
              );
            };

            // Add event listeners based on device type
            if (isMobile) {
              // Mobile: tap and long press
              overlay.addEventListener("touchstart", handleInteraction, {
                passive: false,
              });

              // Long press for chat with safety
              let longPressTimer;
              overlay.addEventListener(
                "touchstart",
                (e) => {
                  safeExecute(
                    () => {
                      longPressTimer = setTimeout(() => {
                        if (
                          window.showClippyChatBalloon &&
                          mountedRef.current
                        ) {
                          window.showClippyChatBalloon(
                            "Hi! What would you like to chat about?"
                          );
                        }
                      }, 800);
                    },
                    null,
                    "long press setup"
                  );
                },
                { passive: false }
              );

              overlay.addEventListener(
                "touchend",
                () => {
                  safeExecute(
                    () => {
                      clearTimeout(longPressTimer);
                    },
                    null,
                    "long press cleanup"
                  );
                },
                { passive: false }
              );
            } else {
              // Desktop: double-click
              overlay.addEventListener("dblclick", handleInteraction);
            }

            overlayRef.current = overlay;
            document.body.appendChild(overlay);
          }

          // Synchronized positioning with error handling
          const syncSuccess = safeExecute(
            () =>
              ClippyPositioning?.positionClippyAndOverlay(
                clippyEl,
                overlayRef.current,
                currentPosition
              ),
            false,
            "synchronized positioning"
          );

          if (overlayRef.current) {
            safeExecute(
              () =>
                ClippyPositioning?.applyStyles(overlayRef.current, {
                  visibility: isScreenPoweredOn ? "visible" : "hidden",
                }),
              false,
              "overlay visibility"
            );
          }

          return positionSuccess && syncSuccess;
        },
        false,
        "clippy setup"
      );
    };

    // Throttled update loop for mobile performance
    const updateLoop = (timestamp) => {
      if (!mountedRef.current) return;

      if (timestamp - lastUpdateRef.current > updateInterval) {
        if (setupClippy()) {
          errorCountRef.current = 0;
        } else {
          errorCountRef.current++;
          if (errorCountRef.current > 10) {
            console.warn(
              "Clippy setup failing repeatedly, reducing update frequency"
            );
            return;
          }
        }
        lastUpdateRef.current = timestamp;
      }

      rafRef.current = requestAnimationFrame(updateLoop);
    };

    // Initial setup with retry logic
    let setupSuccess = false;
    for (let i = 0; i < 3 && !setupSuccess; i++) {
      setupSuccess = setupClippy();
      if (!setupSuccess) {
        console.warn(`Clippy setup attempt ${i + 1} failed, retrying...`);
      }
    }

    if (setupSuccess) {
      rafRef.current = requestAnimationFrame(updateLoop);
    }

    const currentTapTimeout = tapTimeoutRef.current;

    return () => {
      mountedRef.current = false;

      safeExecute(
        () => {
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
          }
          if (currentTapTimeout) {
            clearTimeout(currentTapTimeout);
          }
          if (overlayRef.current && overlayRef.current.parentNode) {
            overlayRef.current.parentNode.removeChild(overlayRef.current);
            overlayRef.current = null;
          }
        },
        null,
        "controller cleanup"
      );
    };
  }, [clippy, visible, isScreenPoweredOn, position, updateInterval]);

  return null;
};

export const useClippyContext = () => useContext(ClippyContext);
export default ClippyProvider;
