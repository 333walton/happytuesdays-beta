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
  const resizeHandlingActiveRef = useRef(false); // Track resize handling state

  // ZOOM-AWARE: Track current zoom level for change detection
  const currentZoomLevelRef = useRef(0);

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

  // Monitor startup and shutdown sequence completion
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

  // Replace the zoom monitoring useEffect in ClippyProvider.js with this enhanced version:

  // ENHANCED ZOOM-AWARE: Monitor for zoom level changes with IMMEDIATE response
  useEffect(() => {
    if (isMobile || !mountedRef.current) return;

    const checkZoomChange = () => {
      const currentZoomLevel = ClippyPositioning.getCurrentZoomLevel();

      if (currentZoomLevel !== currentZoomLevelRef.current) {
        const oldZoomLevel = currentZoomLevelRef.current;
        currentZoomLevelRef.current = currentZoomLevel;

        console.log(
          `📏 ClippyProvider detected zoom change: ${oldZoomLevel} → ${currentZoomLevel}`
        );

        // Get the Clippy element and handle zoom change IMMEDIATELY
        const clippyElement = document.querySelector(".clippy");
        const overlayElement = document.getElementById(
          "clippy-clickable-overlay"
        );

        if (clippyElement) {
          console.log(
            `⚡ Applying immediate positioning for zoom level ${currentZoomLevel}`
          );

          // ENHANCED: Use the centralized positioning system directly
          if (ClippyPositioning.forceImmediateZoomPositioning) {
            const positioned = ClippyPositioning.forceImmediateZoomPositioning(
              clippyElement,
              currentZoomLevel
            );

            // Update overlay if positioning succeeded
            if (positioned && overlayElement) {
              ClippyPositioning.positionOverlay(overlayElement, clippyElement);
            }

            console.log(
              `✅ ClippyProvider positioning: ${
                positioned ? "success" : "failed"
              }`
            );
          } else {
            // Fallback to standard zoom change handling
            ClippyPositioning.handleZoomChange?.(
              currentZoomLevel,
              clippyElement
            );
          }
        } else {
          console.warn("⚠️ Clippy element not found for zoom change");
        }
      }
    };

    // IMMEDIATE response checking - frequent for immediate updates
    const zoomCheckInterval = setInterval(checkZoomChange, 50);

    // Listen for data-zoom attribute changes with immediate response
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-zoom"
        ) {
          console.log(
            "📏 data-zoom attribute changed, applying immediate positioning"
          );
          // No delay - immediate response
          checkZoomChange();
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-zoom"],
    });

    // Listen for custom zoom change events from MonitorControlsPanel with immediate response
    const handleZoomLevelChangedEvent = (event) => {
      const { newZoomLevel, source, immediate } = event.detail;
      console.log(
        `📏 ClippyProvider received zoom change event from ${source}: ${newZoomLevel} (immediate: ${immediate})`
      );

      // ENHANCED: Always respond immediately to centralized positioning events
      if (source === "monitor-controls-centralized" || immediate) {
        console.log("⚡ Immediate response triggered by centralized event");
        checkZoomChange();
      } else if (immediate) {
        // No delay for immediate events
        checkZoomChange();
      } else {
        // Small delay for non-immediate events
        setTimeout(checkZoomChange, 10);
      }
    };

    window.addEventListener("zoomLevelChanged", handleZoomLevelChangedEvent);

    return () => {
      clearInterval(zoomCheckInterval);
      observer.disconnect();
      window.removeEventListener(
        "zoomLevelChanged",
        handleZoomLevelChangedEvent
      );
    };
  }, []); // No dependencies - run once and monitor continuously

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

  // Custom position getter for resize handling (desktop only)
  const getCustomPosition = useCallback(() => {
    if (isMobile) return null;
    return position;
  }, [position]);

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
    getCustomPosition, // Expose for resize handling
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
            getCustomPosition={getCustomPosition}
            resizeHandlingActiveRef={resizeHandlingActiveRef}
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

// ZOOM-AWARE: Startup-aware controller with zoom-aware resize handling integration
const StartupAwareClippyController = ({
  visible,
  isScreenPoweredOn,
  position,
  clippyInstanceRef,
  overlayRef,
  getCustomPosition,
  resizeHandlingActiveRef,
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

          // ENHANCED: Ensure correct initial positioning from the start
          const setupInitialPositioning = () => {
            // Get current zoom level from body attribute or default to 0
            const initialZoomLevel =
              parseInt(document.body.getAttribute("data-zoom")) || 0;
            console.log(
              `⚡ Setting up initial Clippy positioning for zoom level ${initialZoomLevel}`
            );

            if (isMobile) {
              // Mobile: use responsive positioning
              const mobilePosition = safeExecute(
                () => ClippyPositioning?.calculateMobilePosition(),
                null,
                "mobile position calculation"
              );
              return safeExecute(
                () =>
                  ClippyPositioning?.positionClippy(clippyEl, mobilePosition),
                false,
                "mobile clippy positioning"
              );
            } else {
              // Desktop: force immediate zoom-aware positioning
              if (ClippyPositioning?.forceImmediateZoomPositioning) {
                console.log(
                  `⚡ Using forceImmediateZoomPositioning for zoom level ${initialZoomLevel}`
                );
                return ClippyPositioning.forceImmediateZoomPositioning(
                  clippyEl,
                  initialZoomLevel
                );
              } else {
                // Fallback: cache anchor and position manually
                console.log(
                  `⚓ Fallback: Manual anchor caching for zoom level ${initialZoomLevel}`
                );
                const anchorCached =
                  ClippyPositioning?.cacheClippyAnchorPosition?.(
                    clippyEl,
                    initialZoomLevel
                  );
                console.log(
                  `⚓ Initial anchor cache: ${
                    anchorCached ? "success" : "failed"
                  }`
                );

                if (anchorCached) {
                  return (
                    safeExecute(
                      () =>
                        ClippyPositioning?.applyAnchoredPosition?.(clippyEl),
                      false,
                      "anchored positioning"
                    ) ||
                    safeExecute(
                      () => ClippyPositioning?.positionClippy?.(clippyEl, null),
                      false,
                      "fallback positioning"
                    )
                  );
                } else {
                  return safeExecute(
                    () => ClippyPositioning?.positionClippy?.(clippyEl, null),
                    false,
                    "default positioning"
                  );
                }
              }
            }
          };

          // Use enhanced initial positioning instead of the previous logic
          const positionSuccess = setupInitialPositioning();
          console.log(
            `🎯 Initial positioning: ${positionSuccess ? "success" : "failed"}`
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

            // Mobile-optimized event handlers (keeping existing code...)
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

            // Add event listeners based on device type (keeping existing mobile/desktop logic...)
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

          // ENHANCED: Synchronized positioning with immediate application
          const syncSuccess = safeExecute(
            () =>
              ClippyPositioning?.positionClippyAndOverlay(
                clippyEl,
                overlayRef.current,
                null // Let it determine position based on zoom level
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

          // ===== ENHANCED ZOOM-AWARE: START RESIZE HANDLING IMMEDIATELY =====
          if (!resizeHandlingActiveRef.current && clippyEl) {
            const resizeStarted = safeExecute(
              () =>
                ClippyPositioning?.startResizeHandling(
                  clippyEl,
                  overlayRef.current,
                  getCustomPosition
                ),
              false,
              "zoom-aware resize handling startup"
            );

            if (resizeStarted) {
              resizeHandlingActiveRef.current = true;
              console.log(
                "✅ Clippy zoom-aware resize handling activated immediately"
              );
            }
          }

          return positionSuccess && syncSuccess;
        },
        false,
        "enhanced clippy setup"
      );
    };

    // Rest of the code remains the same...
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
          // ===== ZOOM-AWARE: STOP RESIZE HANDLING =====
          const clippyEl = document.querySelector(".clippy");
          if (resizeHandlingActiveRef.current && clippyEl) {
            ClippyPositioning?.stopResizeHandling(clippyEl);
            resizeHandlingActiveRef.current = false;
            console.log("🔄 Clippy zoom-aware resize handling deactivated");
          }

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
  }, [
    clippy,
    visible,
    isScreenPoweredOn,
    position,
    updateInterval,
    getCustomPosition,
    resizeHandlingActiveRef,
  ]);

  return null;
};

export const useClippyContext = () => useContext(ClippyContext);
export default ClippyProvider;
