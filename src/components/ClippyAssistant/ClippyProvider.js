// ClippyProvider.js - Fixed Mobile Drag Implementation
// Key fixes: Simplified touch handling, better event management, reliable drag detection

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

// Device detection
const detectMobile = () => {
  try {
    if (typeof window === "undefined") return false;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent) || window.innerWidth < 768;
  } catch (error) {
    return false;
  }
};

const isMobile = detectMobile();
const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent);

// Development logging
const isDev = process.env.NODE_ENV === 'development';
const devLog = (message, ...args) => {
  if (isDev) {
    console.log(`🎛️ ClippyProvider: ${message}`, ...args);
  }
};

// Safe execution wrapper
const safeExecute = (operation, fallback = null, context = "operation") => {
  try {
    return operation();
  } catch (error) {
    if (isDev) {
      console.warn(`ClippyProvider error in ${context}:`, error);
    }
    return fallback;
  }
};

const ClippyProvider = ({ children, defaultAgent = "Clippy" }) => {
  // Core state
  const [startupComplete, setStartupComplete] = useState(false);
  const [assistantVisible, setAssistantVisible] = useState(true);
  const [currentAgent, setCurrentAgent] = useState(defaultAgent);
  const [isScreenPoweredOn, setIsScreenPoweredOn] = useState(true);
  const [positionLocked, setPositionLocked] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const clippyInstanceRef = useRef(null);
  const overlayRef = useRef(null);
  const mountedRef = useRef(false);
  const errorCountRef = useRef(0);
  const lastErrorRef = useRef(0);
  const startupTimeoutRef = useRef(null);
  const resizeHandlingActiveRef = useRef(false);
  const currentZoomLevelRef = useRef(0);

  // Position state (desktop only)
  const [position, setPosition] = useState(() => {
    if (isMobile) return { x: 0, y: 0 };
    return safeExecute(
      () => ClippyPositioning.calculateDesktopPosition(),
      { x: 520, y: 360 },
      "initial position"
    );
  });

  // Startup sequence monitoring (simplified)
  useEffect(() => {
    let isMonitoring = true;

    const checkSequenceStatus = () => {
      if (!isMonitoring) return;

      const biosWrapper = document.querySelector(".BIOSWrapper");
      const windowsLaunchWrapper = document.querySelector(".WindowsLaunchWrapper");
      const desktop = document.querySelector(".desktop");
      const shutdownScreen = document.querySelector(".itIsNowSafeToTurnOffYourComputer");

      let sequenceActive = false;

      if (biosWrapper && windowsLaunchWrapper) {
        const biosVisible = !biosWrapper.classList.contains("hidden") &&
                           getComputedStyle(biosWrapper).opacity !== "0";
        const windowsVisible = !windowsLaunchWrapper.classList.contains("hidden") &&
                              getComputedStyle(windowsLaunchWrapper).opacity !== "0";
        sequenceActive = biosVisible || windowsVisible;
      }

      if (desktop?.classList.contains("windowsShuttingDown") || shutdownScreen) {
        sequenceActive = true;
      }

      if (sequenceActive !== !startupComplete) {
        setStartupComplete(!sequenceActive);
      }

      const nextCheckDelay = sequenceActive ? 500 : 2000;
      startupTimeoutRef.current = setTimeout(checkSequenceStatus, nextCheckDelay);
    };

    checkSequenceStatus();

    return () => {
      isMonitoring = false;
      if (startupTimeoutRef.current) {
        clearTimeout(startupTimeoutRef.current);
      }
    };
  }, [startupComplete]);

  // Zoom monitoring (simplified)
  useEffect(() => {
    if (isMobile || !mountedRef.current) return;

    const checkZoomChange = () => {
      const currentZoomLevel = ClippyPositioning.getCurrentZoomLevel();

      if (currentZoomLevel !== currentZoomLevelRef.current) {
        const oldZoomLevel = currentZoomLevelRef.current;
        currentZoomLevelRef.current = currentZoomLevel;

        const clippyElement = document.querySelector(".clippy");
        if (clippyElement && ClippyPositioning.forceImmediateZoomPositioning) {
          const positioned = ClippyPositioning.forceImmediateZoomPositioning(
            clippyElement,
            currentZoomLevel
          );
          
          if (positioned) {
            const overlayElement = document.getElementById("clippy-clickable-overlay");
            if (overlayElement) {
              ClippyPositioning.positionOverlay(overlayElement, clippyElement);
            }
          }
        }
      }
    };

    const zoomCheckInterval = setInterval(checkZoomChange, 100);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "data-zoom") {
          checkZoomChange();
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-zoom"],
    });

    return () => {
      clearInterval(zoomCheckInterval);
      observer.disconnect();
    };
  }, []);

  // Error rate limiting
  const isErrorRateLimited = useCallback(() => {
    const now = Date.now();
    if (now - lastErrorRef.current < 1000) {
      errorCountRef.current++;
    } else {
      errorCountRef.current = 1;
    }
    lastErrorRef.current = now;
    return errorCountRef.current > 5;
  }, []);

  // Global function creation
  const createSafeGlobalFunction = useCallback(
    (fn, functionName) => {
      return (...args) => {
        if (!mountedRef.current || isErrorRateLimited()) {
          return false;
        }

        const biosWrapper = document.querySelector(".BIOSWrapper");
        const windowsLaunchWrapper = document.querySelector(".WindowsLaunchWrapper");
        const desktop = document.querySelector(".desktop");
        const shutdownScreen = document.querySelector(".itIsNowSafeToTurnOffYourComputer");

        let sequenceActive = false;
        if (biosWrapper && windowsLaunchWrapper) {
          sequenceActive = !biosWrapper.classList.contains("hidden") || 
                          !windowsLaunchWrapper.classList.contains("hidden");
        }
        if (desktop?.classList.contains("windowsShuttingDown") || shutdownScreen) {
          sequenceActive = true;
        }

        if (sequenceActive) return false;

        return safeExecute(() => fn(...args), false, `global function ${functionName}`);
      };
    },
    [isErrorRateLimited]
  );

  // Initialize global functions (simplified)
  useEffect(() => {
    if (typeof window !== "undefined" && !window._clippyGlobalsInitialized) {
      window._clippyGlobalsInitialized = true;

      // Position functions
      window.setClippyPosition = createSafeGlobalFunction((newPosition) => {
        if (isMobile) return false;
        if (newPosition && (newPosition.x !== undefined || newPosition.y !== undefined)) {
          setPosition(newPosition);
          const clippyEl = document.querySelector(".clippy");
          if (clippyEl && ClippyPositioning) {
            return ClippyPositioning.positionClippy(clippyEl, newPosition);
          }
        }
        return false;
      }, "setClippyPosition");

      // Mobile control functions
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
          document.querySelectorAll(".custom-clippy-balloon").forEach((el) => el.remove());
          document.querySelectorAll(".custom-clippy-chat-balloon").forEach((el) => el.remove());
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

      // Balloon functions (keeping existing working implementation)
      window.showClippyCustomBalloon = createSafeGlobalFunction((message) => {
        document.querySelectorAll(".custom-clippy-balloon").forEach((el) => el.remove());

        const clippyEl = document.querySelector(".clippy");
        let left = 200, top = 200;

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

        setTimeout(() => {
          balloon.style.transition = "opacity 0.3s ease";
          balloon.style.opacity = "0";
          setTimeout(() => balloon.remove(), 300);
        }, 6000);

        return true;
      }, "showClippyCustomBalloon");

      window.hideClippyCustomBalloon = createSafeGlobalFunction(() => {
        document.querySelectorAll(".custom-clippy-balloon").forEach((el) => el.remove());
        document.querySelectorAll(".custom-clippy-chat-balloon").forEach((el) => el.remove());
        return true;
      }, "hideClippyCustomBalloon");

      // Chat balloon function (keeping working implementation)
      window.showClippyChatBalloon = createSafeGlobalFunction((initialMessage) => {
        document.querySelectorAll(".custom-clippy-chat-balloon").forEach((el) => el.remove());

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
              const userDiv = document.createElement('div');
              userDiv.style.cssText = 'margin: 8px 0; color: #000080; -webkit-text-fill-color: #000080; text-align: right;';
              userDiv.innerHTML = '<strong>You:</strong> ' + userText;
              messages.appendChild(userDiv);
              
              const thinkDiv = document.createElement('div');
              thinkDiv.style.cssText = 'margin: 8px 0; color: #666; -webkit-text-fill-color: #666; font-style: italic;';
              thinkDiv.textContent = 'Clippy is thinking...';
              messages.appendChild(thinkDiv);
              
              input.value = '';
              messages.scrollTop = messages.scrollHeight;
              
              setTimeout(() => {
                thinkDiv.remove();
                const respDiv = document.createElement('div');
                respDiv.style.cssText = 'margin: 8px 0; color: #000; -webkit-text-fill-color: #000;';
                
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

        setTimeout(() => {
          const input = balloon.querySelector("input");
          if (input) input.focus();
        }, 100);

        return true;
      }, "showClippyChatBalloon");

      window.getClippyInstance = () => clippyInstanceRef.current;

      window.resetClippy = () => {
        safeExecute(() => {
          document.querySelectorAll(".custom-clippy-balloon").forEach((el) => el.remove());
          document.querySelectorAll(".custom-clippy-chat-balloon").forEach((el) => el.remove());
          setAssistantVisible(true);
          errorCountRef.current = 0;
        }, null, "clippy reset");
      };
    }

    return () => {
      mountedRef.current = false;
      if (typeof window !== "undefined") {
        document.querySelectorAll(".custom-clippy-balloon").forEach((el) => el.remove());
        document.querySelectorAll(".custom-clippy-chat-balloon").forEach((el) => el.remove());
        
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
        delete window.setClippyPositionLocked;
        delete window.getClippyPositionLocked;
        delete window.setClippyDragging;
      }
    };
  }, [assistantVisible, isScreenPoweredOn, createSafeGlobalFunction, positionLocked]);

  // Custom position getter
  const getCustomPosition = useCallback(() => {
    if (isMobile) return null;
    return position;
  }, [position]);

  // Context value
  const contextValue = {
    assistantVisible,
    setAssistantVisible,
    currentAgent,
    setCurrentAgent,
    position,
    setPosition,
    isScreenPoweredOn,
    setIsScreenPoweredOn,
    startupComplete,
    setClippyInstance: (instance) => {
      clippyInstanceRef.current = instance;
      window.clippy = instance;
    },
    getClippyInstance: () => clippyInstanceRef.current,
    getCustomPosition,
    isMobile,
    positionLocked,
    setPositionLocked,
    isDragging,
    setIsDragging,
  };

  return (
    <ClippyContext.Provider value={contextValue}>
      <ReactClippyProvider agentName={currentAgent}>
        {children}
        {startupComplete && (
          <>
            <FixedClippyController
              visible={assistantVisible}
              isScreenPoweredOn={isScreenPoweredOn}
              position={position}
              clippyInstanceRef={clippyInstanceRef}
              overlayRef={overlayRef}
              getCustomPosition={getCustomPosition}
              resizeHandlingActiveRef={resizeHandlingActiveRef}
              positionLocked={positionLocked}
              isDragging={isDragging}
            />
            <MobileControls />
          </>
        )}
      </ReactClippyProvider>
    </ClippyContext.Provider>
  );
};

// FIXED: Simplified ClippyController with reliable mobile drag
const FixedClippyController = ({
  visible,
  isScreenPoweredOn,
  position,
  clippyInstanceRef,
  overlayRef,
  getCustomPosition,
  resizeHandlingActiveRef,
  positionLocked,
  isDragging,
}) => {
  const { clippy } = useClippy();
  const rafRef = useRef(null);
  const mountedRef = useRef(false);
  const setupAttemptRef = useRef(0);

  // SIMPLIFIED: Mobile drag state
  const dragStateRef = useRef({
    startX: 0,
    startY: 0,
    origRightPx: 0,
    origBottomPx: 0,
    longPressTimer: null,
    dragStarted: false,
    lastInteraction: 0,
  });

  // SIMPLIFIED: Cooldown system
  const COOLDOWN_DURATION = 1500;

  const isInCooldown = useCallback(() => {
    const now = Date.now();
    return now - dragStateRef.current.lastInteraction < COOLDOWN_DURATION;
  }, []);

  const startCooldown = useCallback(() => {
    dragStateRef.current.lastInteraction = Date.now();
  }, []);

  // SIMPLIFIED: Interaction handler
  const handleInteractionWithCooldown = useCallback((e, interactionType = "tap") => {
    if (isInCooldown()) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    startCooldown();

    if (!mountedRef.current) return false;

    return safeExecute(() => {
      e.preventDefault();
      e.stopPropagation();

      if (clippy.play) {
        clippy.play("Greeting");
        setTimeout(() => {
          if (window.showClippyCustomBalloon && mountedRef.current) {
            const message = isMobile
              ? "Tap me again for more help!"
              : "Double-click me again for more help!";
            window.showClippyCustomBalloon(message);
          }
        }, 800);
      }
      return true;
    }, false, `${interactionType} interaction`);
  }, [isInCooldown, startCooldown, mountedRef, clippy]);

  // FIXED: Simplified mobile touch handlers
  const createSimplifiedTouchHandlers = useCallback(() => {
    let moveHandler = null;
    let endHandler = null;

    const handleTouchStart = (e) => {
      if (!mountedRef.current) return;

      devLog('Touch start detected, position locked:', positionLocked);

      // CRITICAL: Don't prevent default on touchstart for iOS Safari
      const touch = e.touches[0];
      const dragState = dragStateRef.current;

      dragState.startX = touch.clientX;
      dragState.startY = touch.clientY;
      dragState.dragStarted = false;

      // Get current Clippy position
      if (!positionLocked) {
        const clippyEl = document.querySelector('.clippy');
        if (clippyEl) {
          const rect = clippyEl.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          // Calculate current right/bottom values
          dragState.origRightPx = viewportWidth - rect.right;
          dragState.origBottomPx = viewportHeight - rect.bottom;
          
          devLog(`Current position - right: ${dragState.origRightPx}px, bottom: ${dragState.origBottomPx}px`);
        }
      }

      // Create move handler
      moveHandler = (e) => {
        if (!mountedRef.current || positionLocked) return;

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - dragState.startX);
        const deltaY = Math.abs(touch.clientY - dragState.startY);

        // Start drag when threshold crossed
        if (!dragState.dragStarted && (deltaX > 10 || deltaY > 10)) {
          clearTimeout(dragState.longPressTimer);
          dragState.dragStarted = true;
          
          // Prevent default AFTER drag starts to allow initial tap detection
          e.preventDefault();
          
          if (window.setClippyDragging) {
            window.setClippyDragging(true);
          }
          
          devLog('Started dragging');
        }

        if (dragState.dragStarted) {
          e.preventDefault(); // Now prevent default during drag
          
          const totalDeltaX = touch.clientX - dragState.startX;
          const totalDeltaY = touch.clientY - dragState.startY;

          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          // Calculate new position
          const newRightPx = Math.max(
            10,
            Math.min(
              viewportWidth - 70,
              dragState.origRightPx - totalDeltaX
            )
          );

          const newBottomPx = Math.max(
            90,
            Math.min(
              viewportHeight - 90,
              dragState.origBottomPx - totalDeltaY
            )
          );

          // Apply position directly for maximum performance
          const clippyEl = document.querySelector('.clippy');
          if (clippyEl) {
            clippyEl.style.position = 'fixed';
            clippyEl.style.right = `${newRightPx}px`;
            clippyEl.style.bottom = `${newBottomPx}px`;
            clippyEl.style.left = 'auto';
            clippyEl.style.top = 'auto';
            clippyEl.style.transform = 'translateZ(0) scale(1.05)';
            clippyEl.style.zIndex = '1550';
            clippyEl.style.transition = 'none';

            // Sync overlay
            if (overlayRef.current) {
              overlayRef.current.style.position = 'fixed';
              overlayRef.current.style.right = `${newRightPx}px`;
              overlayRef.current.style.bottom = `${newBottomPx}px`;
              overlayRef.current.style.left = 'auto';
              overlayRef.current.style.top = 'auto';
            }
          }
        }
      };

      // Create end handler
      endHandler = (e) => {
        const dragState = dragStateRef.current;

        devLog('Touch end, was dragging:', dragState.dragStarted);

        // Clean up event listeners
        if (moveHandler) {
          document.removeEventListener('touchmove', moveHandler);
        }
        if (endHandler) {
          document.removeEventListener('touchend', endHandler);
          document.removeEventListener('touchcancel', endHandler);
        }

        clearTimeout(dragState.longPressTimer);

        if (!dragState.dragStarted) {
          // Simple tap interaction
          handleInteractionWithCooldown(e, "tap");
        } else {
          // End drag mode
          const clippyEl = document.querySelector('.clippy');
          if (clippyEl) {
            clippyEl.style.transform = 'translateZ(0) scale(0.8)';
            clippyEl.style.zIndex = '1500';
            clippyEl.style.transition = '';
          }

          setTimeout(() => {
            if (window.setClippyDragging) {
              window.setClippyDragging(false);
            }
          }, 100);
        }

        dragState.dragStarted = false;
      };

      // Set up long-press timer
      if (!positionLocked) {
        dragState.longPressTimer = setTimeout(() => {
          if (!dragState.dragStarted && mountedRef.current) {
            if (isInCooldown()) return;
            startCooldown();

            if (window.showClippyChatBalloon) {
              window.showClippyChatBalloon("Hi! What would you like to chat about?");
            }
          }
        }, 800);
      } else {
        dragState.longPressTimer = setTimeout(() => {
          if (!dragState.dragStarted && mountedRef.current) {
            if (isInCooldown()) return;
            startCooldown();

            if (clippy.play) {
              clippy.play("Greeting");
              setTimeout(() => {
                if (window.showClippyCustomBalloon && mountedRef.current) {
                  window.showClippyCustomBalloon("Position is locked! Unlock to drag me around.");
                }
              }, 800);
            }
          }
        }, 400);
      }

      // Add event listeners - using default passive behavior initially
      document.addEventListener('touchmove', moveHandler, { passive: false });
      document.addEventListener('touchend', endHandler, { passive: true });
      document.addEventListener('touchcancel', endHandler, { passive: true });
    };

    return {
      handleTouchStart,
      cleanup: () => {
        if (moveHandler) {
          document.removeEventListener('touchmove', moveHandler);
        }
        if (endHandler) {
          document.removeEventListener('touchend', endHandler);
          document.removeEventListener('touchcancel', endHandler);
        }
        clearTimeout(dragStateRef.current.longPressTimer);
      }
    };
  }, [handleInteractionWithCooldown, isInCooldown, startCooldown, positionLocked, clippy]);

  // Desktop interaction
  const handleDesktopInteraction = useCallback((e) => {
    return handleInteractionWithCooldown(e, "double-click");
  }, [handleInteractionWithCooldown]);

  // Main setup effect
  useEffect(() => {
    if (!clippy || !visible) return;

    mountedRef.current = true;
    clippyInstanceRef.current = clippy;
    window.clippy = clippy;

    const setupClippy = () => {
      if (!mountedRef.current || setupAttemptRef.current >= 3) return false;

      setupAttemptRef.current++;

      return safeExecute(() => {
        const clippyEl = document.querySelector(".clippy");
        if (!clippyEl) return false;

        // Initial positioning
        const setupInitialPositioning = () => {
          const initialZoomLevel = parseInt(document.body.getAttribute("data-zoom")) || 0;
          
          if (isMobile) {
            const mobilePosition = ClippyPositioning?.calculateEnhancedMobilePosition();
            return ClippyPositioning?.applyMobilePosition(clippyEl, mobilePosition, false);
          } else {
            if (ClippyPositioning?.forceImmediateZoomPositioning) {
              return ClippyPositioning.forceImmediateZoomPositioning(clippyEl, initialZoomLevel);
            } else {
              return ClippyPositioning?.positionClippy?.(clippyEl, null);
            }
          }
        };

        const positionSuccess = setupInitialPositioning();

        // Set visibility
        const visibilityStyles = {
          visibility: isScreenPoweredOn ? "visible" : "hidden",
          opacity: isScreenPoweredOn ? "1" : "0",
          pointerEvents: "none",
        };
        ClippyPositioning?.applyStyles(clippyEl, visibilityStyles);

        // Setup overlay
        if (!overlayRef.current && mountedRef.current) {
          const overlay = document.createElement("div");
          overlay.id = "clippy-clickable-overlay";

          // FIXED: Mobile interaction setup
          if (isMobile) {
            const handlers = createSimplifiedTouchHandlers();
            overlay.addEventListener('touchstart', handlers.handleTouchStart, { passive: true });
            
            // Store cleanup function
            overlay._cleanupHandlers = handlers.cleanup;
          } else {
            // Desktop: double-click interaction
            overlay.addEventListener("dblclick", handleDesktopInteraction);
          }

          overlayRef.current = overlay;
          document.body.appendChild(overlay);
        }

        // Synchronized positioning
        ClippyPositioning?.positionClippyAndOverlay(clippyEl, overlayRef.current, null);

        if (overlayRef.current) {
          ClippyPositioning?.applyStyles(overlayRef.current, {
            visibility: isScreenPoweredOn ? "visible" : "hidden",
          });
        }

        // Start resize handling
        if (!resizeHandlingActiveRef.current && clippyEl) {
          const resizeStarted = ClippyPositioning?.startResizeHandling(
            clippyEl,
            overlayRef.current,
            getCustomPosition
          );

          if (resizeStarted) {
            resizeHandlingActiveRef.current = true;
          }
        }

        return positionSuccess;
      }, false, "clippy setup");
    };

    // Initial setup with retry logic
    let setupSuccess = false;
    for (let i = 0; i < 3 && !setupSuccess; i++) {
      setupSuccess = setupClippy();
      if (!setupSuccess && isDev) {
        console.warn(`Clippy setup attempt ${i + 1} failed, retrying...`);
      }
    }

    if (setupSuccess) {
      const updateInterval = isMobile ? 3000 : 2000;
      let lastUpdateTime = 0;
      
      const updateLoop = (timestamp) => {
        if (!mountedRef.current) return;

        if (timestamp - lastUpdateTime > updateInterval) {
          setupClippy();
          lastUpdateTime = timestamp;
        }

        rafRef.current = requestAnimationFrame(updateLoop);
      };

      rafRef.current = requestAnimationFrame(updateLoop);
    }

    return () => {
      mountedRef.current = false;

      safeExecute(() => {
        // Stop resize handling
        const clippyEl = document.querySelector(".clippy");
        if (resizeHandlingActiveRef.current && clippyEl) {
          ClippyPositioning?.stopResizeHandling(clippyEl);
          resizeHandlingActiveRef.current = false;
        }

        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }

        if (overlayRef.current && overlayRef.current.parentNode) {
          // Clean up mobile handlers
          if (overlayRef.current._cleanupHandlers) {
            overlayRef.current._cleanupHandlers();
          }
          
          overlayRef.current.parentNode.removeChild(overlayRef.current);
          overlayRef.current = null;
        }
        
        clearTimeout(dragStateRef.current.longPressTimer);
      }, null, "controller cleanup");
    };
  }, [
    clippy,
    visible,
    isScreenPoweredOn,
    position,
    getCustomPosition,
    resizeHandlingActiveRef,
    positionLocked,
    isDragging,
    createSimplifiedTouchHandlers,
    handleDesktopInteraction,
  ]);

  return null;
};

export const useClippyContext = () => useContext(ClippyContext);
export default ClippyProvider;