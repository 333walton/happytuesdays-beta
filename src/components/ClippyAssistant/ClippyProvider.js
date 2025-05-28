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
import MobileControls from "./MobileControls";
import "./_styles.scss";

const ClippyContext = createContext(null);

// Safe device detection with fallbacks  .
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

  // NEW: Mobile control states (no persistence, resets on reload)
  const [positionLocked, setPositionLocked] = useState(true); // Default locked
  const [isDragging, setIsDragging] = useState(false);

  // Balloon state - KEEP FOR COMPATIBILITY BUT WE'LL USE DIRECT DOM
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

  // Safe global function wrapper - FIXED STARTUP DETECTION
  const createSafeGlobalFunction = useCallback(
    (fn, functionName) => {
      return (...args) => {
        if (!mountedRef.current || isErrorRateLimited()) {
          return false;
        }

        // FIXED: Check if startup sequence screens are actually hidden instead of relying on state
        const biosWrapper = document.querySelector(".BIOSWrapper");
        const windowsLaunchWrapper = document.querySelector(
          ".WindowsLaunchWrapper"
        );
        const desktop = document.querySelector(".desktop");
        const shutdownScreen = document.querySelector(
          ".itIsNowSafeToTurnOffYourComputer"
        );

        // Check if any startup/shutdown screens are currently active
        let sequenceActive = false;

        if (biosWrapper && windowsLaunchWrapper) {
          const biosHidden = biosWrapper.classList.contains("hidden");
          const windowsHidden =
            windowsLaunchWrapper.classList.contains("hidden");
          sequenceActive = !biosHidden || !windowsHidden;
        }

        if (
          desktop?.classList.contains("windowsShuttingDown") ||
          shutdownScreen
        ) {
          sequenceActive = true;
        }

        // Only block if screens are actually visible
        if (sequenceActive) {
          console.log(
            `🚫 Blocking ${functionName} - startup/shutdown sequence active`
          );
          return false;
        }

        return safeExecute(
          () => fn(...args),
          false,
          `global function ${functionName}`
        );
      };
    },
    [isErrorRateLimited] // Removed startupComplete dependency
  );

  // ENHANCED: Initialize global functions with mobile control support
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

      // NEW: Mobile control support functions
      window.setClippyPositionLocked = createSafeGlobalFunction((locked) => {
        setPositionLocked(locked);
        return true;
      }, "setClippyPositionLocked");

      window.getClippyPositionLocked = createSafeGlobalFunction(() => {
        return positionLocked;
      }, "getClippyPositionLocked");

      window.setClippyDragging = createSafeGlobalFunction((dragging) => {
        setIsDragging(dragging);
        return true;
      }, "setClippyDragging");

      // Visibility functions
      window.setAssistantVisible = createSafeGlobalFunction((visible) => {
        setAssistantVisible(visible);
        if (!visible) {
          // Clean up any DOM balloons
          document
            .querySelectorAll(".custom-clippy-balloon")
            .forEach((el) => el.remove());
          document
            .querySelectorAll(".custom-clippy-chat-balloon")
            .forEach((el) => el.remove());
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

      // ===== FIXED BALLOON FUNCTIONS - USING YOUR WORKING CONSOLE IMPLEMENTATIONS =====

      // SPEECH BALLOON - Using your working console implementation
      window.showClippyCustomBalloon = createSafeGlobalFunction((message) => {
        console.log("💬 Custom balloon called:", message);

        // Remove existing speech balloons
        document
          .querySelectorAll(".custom-clippy-balloon")
          .forEach((el) => el.remove());

        // Get Clippy position for better placement
        const clippyEl = document.querySelector(".clippy");
        let left = 200,
          top = 200; // fallback

        if (clippyEl) {
          const rect = clippyEl.getBoundingClientRect();
          left = Math.max(20, rect.left - 150);
          top = Math.max(20, rect.top - 80);
        }

        const balloon = document.createElement("div");
        balloon.className = "custom-clippy-balloon";
        balloon.style.cssText = `
          position: fixed; left: ${left}px; top: ${top}px;
          background: #fffcde; border: 2px solid #000; border-radius: 8px;
          padding: 12px 16px; font-family: Tahoma, sans-serif; font-size: 14px;
          color: #000; -webkit-text-fill-color: #000; z-index: 9999;
          max-width: 250px; box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          line-height: 1.4; word-wrap: break-word;
        `;

        balloon.textContent = message;
        document.body.appendChild(balloon);

        // Auto-hide after 6 seconds
        setTimeout(() => {
          balloon.style.transition = "opacity 0.3s ease";
          balloon.style.opacity = "0";
          setTimeout(() => balloon.remove(), 300);
        }, 6000);

        return true;
      }, "showClippyCustomBalloon");

      window.hideClippyCustomBalloon = createSafeGlobalFunction(() => {
        document
          .querySelectorAll(".custom-clippy-balloon")
          .forEach((el) => el.remove());
        document
          .querySelectorAll(".custom-clippy-chat-balloon")
          .forEach((el) => el.remove());
        return true;
      }, "hideClippyCustomBalloon");

      // CHAT BALLOON - Using your working console implementation
      window.showClippyChatBalloon = createSafeGlobalFunction(
        (initialMessage) => {
          console.log("💬 Chat balloon called:", initialMessage);

          // Remove any existing chat balloons
          document
            .querySelectorAll(".custom-clippy-chat-balloon")
            .forEach((el) => el.remove());

          const balloon = document.createElement("div");
          balloon.className = "custom-clippy-chat-balloon";
          balloon.style.cssText = `
          position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
          background: #fffcde; border: 3px solid #000; border-radius: 8px;
          padding: 20px; font-family: Tahoma, sans-serif; font-size: 14px; z-index: 9999;
          width: 350px; height: 300px; color: #000; -webkit-text-fill-color: #000;
          display: flex; flex-direction: column; box-shadow: 4px 4px 8px rgba(0,0,0,0.3);
        `;

          balloon.innerHTML = `
          <button onclick="this.parentElement.remove()" style="
            position: absolute; top: 8px; right: 12px; background: none; border: none;
            font-size: 20px; cursor: pointer; color: #666; padding: 4px 8px;
            min-width: 32px; min-height: 32px; -webkit-text-fill-color: #666;
          ">×</button>
          
          <div style="margin-bottom: 12px; font-weight: bold; font-size: 16px; color: #000;">
            💬 Chat with Clippy
          </div>
          
          <div id="chat-messages" style="
            flex: 1; overflow-y: auto; border: 2px inset #ccc; background: white;
            padding: 8px; margin-bottom: 12px; color: #000; min-height: 180px;
          ">
            <div style="margin-bottom: 8px; color: #000; -webkit-text-fill-color: #000;">
              <strong>Clippy:</strong> ${initialMessage}
            </div>
          </div>
          
          <form onsubmit="
            event.preventDefault();
            const input = this.querySelector('input');
            const messages = document.getElementById('chat-messages');
            const userText = input.value.trim();
            if (userText) {
              // Add user message
              const userDiv = document.createElement('div');
              userDiv.style.cssText = 'margin: 8px 0; color: #000080; -webkit-text-fill-color: #000080; text-align: right;';
              userDiv.innerHTML = '<strong>You:</strong> ' + userText;
              messages.appendChild(userDiv);
              
              // Add thinking indicator
              const thinkDiv = document.createElement('div');
              thinkDiv.style.cssText = 'margin: 8px 0; color: #666; -webkit-text-fill-color: #666; font-style: italic;';
              thinkDiv.textContent = 'Clippy is thinking...';
              messages.appendChild(thinkDiv);
              
              // Clear input and scroll
              input.value = '';
              messages.scrollTop = messages.scrollHeight;
              
              // Generate response after delay
              setTimeout(() => {
                thinkDiv.remove();
                const respDiv = document.createElement('div');
                respDiv.style.cssText = 'margin: 8px 0; color: #000; -webkit-text-fill-color: #000;';
                
                // Simple response logic
                const responses = {
                  'hello': 'Hello there! How can I assist you today?',
                  'help': 'I can help with many things! Try asking me about Hydra98 or just chat with me.',
                  'hydra': 'Hydra98 is an amazing Windows 98 desktop emulator! What do you think of it?',
                  'thanks': 'You\\'re very welcome! Is there anything else I can help you with?',
                  'bye': 'Goodbye! Click the X to close this chat anytime.',
                  'default': 'That\\'s interesting! Tell me more, or ask me something else.'
                };
                
                const lowerText = userText.toLowerCase();
                let response = responses.default;
                
                for (const [key, value] of Object.entries(responses)) {
                  if (lowerText.includes(key)) {
                    response = value;
                    break;
                  }
                }
                
                respDiv.innerHTML = '<strong>Clippy:</strong> ' + response;
                messages.appendChild(respDiv);
                messages.scrollTop = messages.scrollHeight;
              }, 1500);
            }
          " style="display: flex; gap: 8px;">
            <input type="text" placeholder="Type a message..." style="
              flex: 1; padding: 8px; border: 2px inset #ccc; font-size: 14px;
              color: #000; -webkit-text-fill-color: #000; font-family: Tahoma, sans-serif;
            ">
            <button type="submit" style="
              padding: 8px 16px; background: #c0c0c0; border: 2px outset #c0c0c0;
              font-size: 14px; cursor: pointer; color: #000; -webkit-text-fill-color: #000;
              font-family: Tahoma, sans-serif;
            ">Send</button>
          </form>
        `;

          document.body.appendChild(balloon);

          // Focus the input after a brief delay
          setTimeout(() => {
            const input = balloon.querySelector("input");
            if (input) input.focus();
          }, 100);

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
            // Clean up DOM balloons
            document
              .querySelectorAll(".custom-clippy-balloon")
              .forEach((el) => el.remove());
            document
              .querySelectorAll(".custom-clippy-chat-balloon")
              .forEach((el) => el.remove());
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
    positionLocked, // Add to dependency array
  ]);

  // Safe chat message handler - KEPT FOR COMPATIBILITY
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
            // Clean up DOM balloons on unmount
            document
              .querySelectorAll(".custom-clippy-balloon")
              .forEach((el) => el.remove());
            document
              .querySelectorAll(".custom-clippy-chat-balloon")
              .forEach((el) => el.remove());

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
            // NEW: Clean up mobile control functions
            delete window.setClippyPositionLocked;
            delete window.getClippyPositionLocked;
            delete window.setClippyDragging;
          }
        },
        null,
        "cleanup"
      );
    };
  }, []);

  // ENHANCED: Context value with mobile control states
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
    // NEW: Mobile control states
    positionLocked,
    setPositionLocked,
    isDragging,
    setIsDragging,
  };

  return (
    <ClippyContext.Provider value={contextValue}>
      <ReactClippyProvider agentName={currentAgent}>
        {children}

        {/* Only render Clippy components after startup completes */}
        {startupComplete && (
          <>
            <StartupAwareClippyController
              visible={assistantVisible}
              isScreenPoweredOn={isScreenPoweredOn}
              position={position}
              clippyInstanceRef={clippyInstanceRef}
              overlayRef={overlayRef}
              getCustomPosition={getCustomPosition}
              resizeHandlingActiveRef={resizeHandlingActiveRef}
              // NEW: Pass mobile control states
              positionLocked={positionLocked}
              isDragging={isDragging}
            />
            
            {/* NEW: Mobile Controls Component */}
            <MobileControls />
          </>
        )}

        {/* REMOVE REACT BALLOONS - We're using DOM balloons now */}
        {/* The working balloons are created directly in DOM via the window functions above */}
      </ReactClippyProvider>
    </ClippyContext.Provider>
  );
};

// ENHANCED: StartupAwareClippyController with mobile drag support and COOLDOWN SYSTEM
const StartupAwareClippyController = ({
  visible,
  isScreenPoweredOn,
  position,
  clippyInstanceRef,
  overlayRef,
  getCustomPosition,
  resizeHandlingActiveRef,
  positionLocked, // NEW
  isDragging,     // NEW
}) => {
  const { clippy } = useClippy();
  const rafRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const tapCountRef = useRef(0);
  const mountedRef = useRef(false);
  const tapTimeoutRef = useRef(null);
  const errorCountRef = useRef(0);
  const setupAttemptRef = useRef(0);

  // NEW: Cooldown system refs
  const cooldownRef = useRef(false);
  const lastInteractionRef = useRef(0);
  const COOLDOWN_DURATION = 2000; // 2 seconds

  // NEW: Mobile drag handling refs
  const dragStateRef = useRef({
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    longPressTimer: null,
    dragStarted: false,
  });

  // Mobile-optimized update intervals
  const updateInterval = isMobile ? 2000 : 1000;
  const maxSetupAttempts = 5;

  // NEW: Cooldown checker function
  const isInCooldown = useCallback(() => {
    const now = Date.now();
    const timeSinceLastInteraction = now - lastInteractionRef.current;
    
    if (timeSinceLastInteraction < COOLDOWN_DURATION) {
      console.log(`🚫 Interaction blocked - cooldown active (${Math.ceil((COOLDOWN_DURATION - timeSinceLastInteraction) / 1000)}s remaining)`);
      return true;
    }
    
    return false;
  }, []);

  // NEW: Start cooldown function
  const startCooldown = useCallback(() => {
    const now = Date.now();
    lastInteractionRef.current = now;
    cooldownRef.current = true;
    
    console.log(`⏱️ Starting 2-second interaction cooldown`);
    
    // Clear cooldown after duration
    setTimeout(() => {
      cooldownRef.current = false;
      console.log(`✅ Interaction cooldown ended`);
    }, COOLDOWN_DURATION);
  }, []);

  // MODIFIED: Enhanced interaction handler with cooldown
  const handleInteractionWithCooldown = useCallback((e, interactionType = "tap") => {
    // IMMEDIATE COOLDOWN CHECK - Block if in cooldown
    if (isInCooldown()) {
      console.log(`🚫 ${interactionType} interaction ignored - cooldown active`);
      e.preventDefault();
      e.stopPropagation();
      return false; // Explicitly return false to indicate blocked
    }

    // START COOLDOWN IMMEDIATELY
    startCooldown();

    if (!mountedRef.current) return false;

    console.log(`✅ Processing ${interactionType} interaction`);

    return safeExecute(
      () => {
        e.preventDefault();
        e.stopPropagation();

        if (clippy.play) {
          clippy.play("Greeting");

          setTimeout(() => {
            if (window.showClippyCustomBalloon && mountedRef.current) {
              const messages = [
                isMobile
                  ? "Tap me again for more help!"
                  : "Double-click me again for more help!",
                "Need assistance? I'm here to help!",
                "What can I help you with today?",
              ];
              tapCountRef.current = (tapCountRef.current + 1) % messages.length;
              window.showClippyCustomBalloon(messages[tapCountRef.current]);
            }
          }, 800);
        }
        return true;
      },
      false,
      `${interactionType} interaction handling`
    );
  }, [isInCooldown, startCooldown, mountedRef, clippy]);

  // FIXED: Enhanced mobile touch handlers with cooldown and proper references
  const createCooldownAwareTouchHandlers = useCallback(() => {
    let touchMoveHandler;
    let touchEndHandler;

    const handleEnhancedTouchStart = (e) => {
      if (!mountedRef.current) return;

      console.log('🤚 Touch start detected, position locked:', positionLocked);

      const touch = e.touches[0];
      const dragState = dragStateRef.current;

      dragState.startX = touch.clientX;
      dragState.startY = touch.clientY;
      dragState.dragStarted = false;

      // Get current position for drag calculations
      if (!positionLocked) {
        safeExecute(() => {
          const clippyEl = document.querySelector('.clippy');
          if (clippyEl) {
            const rect = clippyEl.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Calculate current right/bottom values from current position
            dragState.origX = viewportWidth - rect.right;
            dragState.origY = viewportHeight - rect.bottom;
            
            console.log(`📍 Current Clippy position - right: ${dragState.origX}px, bottom: ${dragState.origY}px`);
          }
        }, null, "drag position calculation");
      }

      // Create touch move handler
      touchMoveHandler = (e) => {
        if (!mountedRef.current || positionLocked) return;

        const touch = e.touches[0];
        const dragState = dragStateRef.current;

        // Check if drag threshold is crossed
        const deltaX = Math.abs(touch.clientX - dragState.startX);
        const deltaY = Math.abs(touch.clientY - dragState.startY);

        if (!dragState.dragStarted && (deltaX > 10 || deltaY > 10)) {
          // Cancel long-press and start drag
          clearTimeout(dragState.longPressTimer);
          dragState.dragStarted = true;
          
          if (window.setClippyDragging) {
            window.setClippyDragging(true);
          }
          
          console.log(`🎯 Started dragging (no cooldown for drag movement)`);
        }

        if (dragState.dragStarted) {
          e.preventDefault();

          const totalDeltaX = touch.clientX - dragState.startX;
          const totalDeltaY = touch.clientY - dragState.startY;

          // Calculate new position with boundary enforcement
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          const newRight = Math.max(
            10,
            Math.min(
              viewportWidth - 70, // Clippy width approximation
              dragState.origX - totalDeltaX
            )
          );

          const newBottom = Math.max(
            90, // Above taskbar
            Math.min(
              viewportHeight - 90, // Clippy height approximation
              dragState.origY - totalDeltaY
            )
          );

          console.log(`🎯 Moving Clippy to - right: ${newRight}px, bottom: ${newBottom}px`);

          // Apply new position using enhanced mobile positioning
          const clippyEl = document.querySelector('.clippy');
          if (clippyEl && ClippyPositioning) {
            const customPosition = {
              rightPx: newRight,
              bottomPx: newBottom,
              right: `${newRight}px`,
              bottom: `${newBottom}px`
            };

            safeExecute(() => {
              // Use the enhanced mobile positioning method
              const success = ClippyPositioning.handleMobileDrag(
                clippyEl, 
                overlayRef.current, 
                customPosition, 
                true // isDragging
              );
              
              if (!success) {
                // Fallback to direct positioning
                ClippyPositioning.applyStyles(clippyEl, {
                  position: 'fixed',
                  right: `${newRight}px`,
                  bottom: `${newBottom}px`,
                  left: 'auto',
                  top: 'auto',
                  transform: 'translateZ(0) scale(1.05)', // Drag feedback
                  zIndex: '1550'
                });
                
                if (overlayRef.current) {
                  ClippyPositioning.positionOverlay(overlayRef.current, clippyEl);
                }
              }
            }, null, "drag positioning");
          }
        }
      };

      // Create touch end handler
      touchEndHandler = (e) => {
        const dragState = dragStateRef.current;

        console.log('✋ Touch end, was dragging:', dragState.dragStarted);

        // Clean up event listeners
        document.removeEventListener('touchmove', touchMoveHandler);
        document.removeEventListener('touchend', touchEndHandler);
        document.removeEventListener('touchcancel', touchEndHandler);

        // Clear timers
        clearTimeout(dragState.longPressTimer);

        // Handle tap (if no drag occurred)
        if (!dragState.dragStarted) {
          // SIMPLE TAP INTERACTION WITH COOLDOWN CHECK
          handleInteractionWithCooldown(e, "tap");
        } else {
          // End drag mode
          const clippyEl = document.querySelector('.clippy');
          if (clippyEl && ClippyPositioning) {
            const rect = clippyEl.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const finalPosition = {
              rightPx: viewportWidth - rect.right,
              bottomPx: viewportHeight - rect.bottom
            };
            
            ClippyPositioning.endMobileDrag(clippyEl, overlayRef.current, finalPosition);
          }
        }

        // Reset drag state
        if (dragState.dragStarted) {
          setTimeout(() => {
            if (window.setClippyDragging) {
              window.setClippyDragging(false);
            }
          }, 100);
        }

        dragState.dragStarted = false;
      };

      // Set up long-press timer for chat (if not locked and not in cooldown)
      if (!positionLocked) {
        dragState.longPressTimer = setTimeout(() => {
          if (!dragState.dragStarted && mountedRef.current) {
            // CHECK COOLDOWN BEFORE LONG-PRESS CHAT
            if (isInCooldown()) {
              console.log(`🚫 Long-press chat ignored - cooldown active`);
              return;
            }

            // START COOLDOWN FOR LONG-PRESS
            startCooldown();

            safeExecute(() => {
              if (window.showClippyChatBalloon) {
                console.log(`✅ Processing long-press chat interaction`);
                window.showClippyChatBalloon(
                  "Hi! What would you like to chat about?"
                );
              }
            }, null, "long press chat");
          }
        }, 800);
      } else {
        // If locked, check cooldown before showing lock message
        dragState.longPressTimer = setTimeout(() => {
          if (!dragState.dragStarted && mountedRef.current) {
            // CHECK COOLDOWN BEFORE LOCK MESSAGE
            if (isInCooldown()) {
              console.log(`🚫 Lock message ignored - cooldown active`);
              return;
            }

            // START COOLDOWN FOR LOCK MESSAGE
            startCooldown();

            safeExecute(() => {
              if (clippy.play) {
                console.log(`✅ Processing locked position interaction`);
                clippy.play("Greeting");
                setTimeout(() => {
                  if (window.showClippyCustomBalloon && mountedRef.current) {
                    window.showClippyCustomBalloon("Position is locked! Unlock to drag me around.");
                  }
                }, 800);
              }
            }, null, "locked interaction");
          }
        }, 400); // Shorter delay for lock feedback
      }

      // Add move and end listeners
      document.addEventListener('touchmove', touchMoveHandler, { passive: false });
      document.addEventListener('touchend', touchEndHandler, { passive: false });
      document.addEventListener('touchcancel', touchEndHandler, { passive: false });
    };

    return {
      handleEnhancedTouchStart,
      cleanup: () => {
        if (touchMoveHandler) {
          document.removeEventListener('touchmove', touchMoveHandler);
        }
        if (touchEndHandler) {
          document.removeEventListener('touchend', touchEndHandler);
          document.removeEventListener('touchcancel', touchEndHandler);
        }
      }
    };
  }, [handleInteractionWithCooldown, isInCooldown, startCooldown, positionLocked]);

  // MODIFIED: Desktop interaction with cooldown
  const handleDesktopInteraction = useCallback((e) => {
    return handleInteractionWithCooldown(e, "double-click");
  }, [handleInteractionWithCooldown]);

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

            // FIXED: Enhanced mobile interaction setup WITH COOLDOWN
            if (isMobile) {
              const handlers = createCooldownAwareTouchHandlers();
              overlay.addEventListener('touchstart', handlers.handleEnhancedTouchStart, { passive: false });
              
              // Store handlers for cleanup
              overlay._handlers = handlers;
              overlay._mobileCleanup = () => {
                overlay.removeEventListener('touchstart', handlers.handleEnhancedTouchStart);
                handlers.cleanup();
                clearTimeout(dragStateRef.current.longPressTimer);
              };
            } else {
              // Desktop: double-click interaction with cooldown
              overlay.addEventListener("dblclick", handleDesktopInteraction);
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

    // Initial setup with retry logic
    let setupSuccess = false;
    for (let i = 0; i < 3 && !setupSuccess; i++) {
      setupSuccess = setupClippy();
      if (!setupSuccess) {
        console.warn(`Clippy setup attempt ${i + 1} failed, retrying...`);
      }
    }

    if (setupSuccess) {
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
            // NEW: Mobile drag cleanup with cooldown system
            if (overlayRef.current._mobileCleanup) {
              overlayRef.current._mobileCleanup();
            }
            
            overlayRef.current.parentNode.removeChild(overlayRef.current);
            overlayRef.current = null;
          }
          
          clearTimeout(dragStateRef.current.longPressTimer);
        },
        null,
        "enhanced controller cleanup"
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
    positionLocked, // NEW
    isDragging,     // NEW
    createCooldownAwareTouchHandlers, // NEW
    handleDesktopInteraction, // NEW
  ]);

  return null;
};

export const useClippyContext = () => useContext(ClippyContext);
export default ClippyProvider;