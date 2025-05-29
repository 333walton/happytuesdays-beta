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
import ClippyContextMenu from "./ClippyContextMenu";
import ClippyPositioning from "./ClippyPositioning";
import ClippyService from "./ClippyService";
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

// FIXED: Initial greeting animations array
const GREETING_ANIMATIONS = ["Greeting", "Wave", "GetAttention"];

const ClippyProvider = ({ children, defaultAgent = "Clippy" }) => {
  // Core state
  const [startupComplete, setStartupComplete] = useState(false);
  const [assistantVisible, setAssistantVisible] = useState(true);
  const [currentAgent, setCurrentAgent] = useState(defaultAgent);
  const [isScreenPoweredOn, setIsScreenPoweredOn] = useState(true);
  const [positionLocked, setPositionLocked] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // ADDED: Balloon state management
  const [balloonVisible, setBalloonVisible] = useState(false);
  const [balloonContent, setBalloonContent] = useState(null);
  const [balloonType, setBalloonType] = useState('custom'); // 'custom' or 'chat'

  // ADDED: Context menu state
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // ADDED: Animation state
  const [hasPlayedGreeting, setHasPlayedGreeting] = useState(false);

  // Refs
  const clippyInstanceRef = useRef(null);
  const overlayRef = useRef(null);
  const mountedRef = useRef(false);
  const errorCountRef = useRef(0);
  const lastErrorRef = useRef(0);
  const startupTimeoutRef = useRef(null);
  const resizeHandlingActiveRef = useRef(false);
  const currentZoomLevelRef = useRef(0);
  const balloonTimeoutRef = useRef(null);

  // Position state (desktop only)
  const [position, setPosition] = useState(() => {
    if (isMobile) return { x: 0, y: 0 };
    return safeExecute(
      () => ClippyPositioning.calculateDesktopPosition(),
      { x: 520, y: 360 },
      "initial position"
    );
  });

  // ADDED: Balloon management functions
  const showCustomBalloon = useCallback((message, duration = 6000) => {
    setBalloonContent(message);
    setBalloonType('custom');
    setBalloonVisible(true);
    
    if (balloonTimeoutRef.current) {
      clearTimeout(balloonTimeoutRef.current);
    }
    
    balloonTimeoutRef.current = setTimeout(() => {
      setBalloonVisible(false);
      setBalloonContent(null);
    }, duration);
  }, []);

  const showChatBalloon = useCallback((initialMessage) => {
    setBalloonContent(initialMessage);
    setBalloonType('chat');
    setBalloonVisible(true);
    // Chat balloons don't auto-close, user must close them
  }, []);

  const hideBalloon = useCallback(() => {
    setBalloonVisible(false);
    setBalloonContent(null);
    if (balloonTimeoutRef.current) {
      clearTimeout(balloonTimeoutRef.current);
    }
  }, []);

  // FIXED: Initial greeting animation
  const playInitialGreeting = useCallback(() => {
    if (hasPlayedGreeting || !clippyInstanceRef.current || !startupComplete) return;
    
    const randomGreeting = GREETING_ANIMATIONS[Math.floor(Math.random() * GREETING_ANIMATIONS.length)];
    console.log(`🎯 Playing initial greeting: ${randomGreeting}`);
    
    safeExecute(() => {
      if (clippyInstanceRef.current?.play) {
        clippyInstanceRef.current.play(randomGreeting);
        setHasPlayedGreeting(true);
        
        setTimeout(() => {
          if (mountedRef.current) {
            const welcomeMessage = isMobile 
              ? "Hi! I'm Clippy. Tap me for help!" 
              : "Hi! I'm Clippy. Double-click me for help!";
            showCustomBalloon(welcomeMessage, 4000);
          }
        }, 1500);
      }
    }, null, "initial greeting");
  }, [hasPlayedGreeting, showCustomBalloon, startupComplete]);

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
        // FIXED: Only trigger greeting on transition to complete
        if (!sequenceActive && !hasPlayedGreeting) {
          setTimeout(() => {
            playInitialGreeting();
          }, 1000);
        }
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
  }, [playInitialGreeting, hasPlayedGreeting]);

  // Zoom monitoring (simplified)
  useEffect(() => {
    if (isMobile || !mountedRef.current) return;

    const checkZoomChange = () => {
      const currentZoomLevel = ClippyPositioning.getCurrentZoomLevel();

      if (currentZoomLevel !== currentZoomLevelRef.current) {
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
  }, [mountedRef]);

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
          hideBalloon();
          //hideContextMenu();
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

      // FIXED: Updated balloon functions to use React state
      window.showClippyCustomBalloon = createSafeGlobalFunction((message) => {
        showCustomBalloon(message);
        return true;
      }, "showClippyCustomBalloon");

      window.hideClippyCustomBalloon = createSafeGlobalFunction(() => {
        hideBalloon();
        return true;
      }, "hideClippyCustomBalloon");

      window.showClippyChatBalloon = createSafeGlobalFunction((initialMessage) => {
        showChatBalloon(initialMessage);
        return true;
      }, "showClippyChatBalloon");

      window.getClippyInstance = () => clippyInstanceRef.current;

      window.resetClippy = () => {
        safeExecute(() => {
          hideBalloon();
          //hideContextMenu();
          setAssistantVisible(true);
          errorCountRef.current = 0;
          setHasPlayedGreeting(false);
        }, null, "clippy reset");
      };
    }

    return () => {
      mountedRef.current = false;
      if (balloonTimeoutRef.current) {
        clearTimeout(balloonTimeoutRef.current);
      }
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
        delete window.setClippyPositionLocked;
        delete window.getClippyPositionLocked;
        delete window.setClippyDragging;
      }
    };
  }, [assistantVisible, isScreenPoweredOn, createSafeGlobalFunction, positionLocked, showCustomBalloon, showChatBalloon, hideBalloon]);

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
    // ADDED: Balloon management in context
    balloonVisible,
    setBalloonVisible,
    balloonContent,
    balloonType,
    showCustomBalloon,
    showChatBalloon,
    hideBalloon,
    // ADDED: Context menu management in context
    contextMenuVisible,
    setContextMenuVisible,
    //hideContextMenu,
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
              playInitialGreeting={playInitialGreeting}
              hasPlayedGreeting={hasPlayedGreeting}
              startupComplete={startupComplete}
            />
            <MobileControls />
            {balloonVisible && balloonType === 'custom' && balloonContent && (
              <CustomBalloon
                message={balloonContent}
                position={{
                  left: Math.max(20, Math.min(window.innerWidth - 300, window.innerWidth * 0.1)),
                  top: Math.max(50, Math.min(window.innerHeight - 150, window.innerHeight * 0.2))
                }}
                onClose={hideBalloon}
              />
            )}
            {balloonVisible && balloonType === 'chat' && balloonContent && (
              <ChatBalloon
                initialMessage={balloonContent}
                position={{
                  left: Math.max(50, (window.innerWidth - 350) / 2),
                  top: Math.max(100, (window.innerHeight - 300) / 2)
                }}
                onClose={hideBalloon}
                onSendMessage={(message) => {
                  console.log('Chat message sent:', message);
                }}
              />
            )}
          </>
        )}
      </ReactClippyProvider>
    </ClippyContext.Provider>
  );
};

// FIXED: Simplified ClippyController with reliable mobile drag AND right-click support
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
  playInitialGreeting,
  hasPlayedGreeting,
  startupComplete,
  setContextMenuVisible,
  setContextMenuPosition,
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

  // FIXED: Right-click context menu handler for desktop
  const handleRightClick = useCallback((e) => {
  if (isMobile) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  if (window.showClippyCustomBalloon) {
    window.showClippyCustomBalloon(
      "Right-click options: Hide Assistant, Change Agent"
    );
  }
  
  return true;
}, []);

  // FIXED: Simplified mobile touch handlers
  const createSimplifiedTouchHandlers = useCallback(() => {
    let moveHandler = null;
    let endHandler = null;

    const handleTouchStart = (e) => {
      if (!mountedRef.current) return;

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

      // Add event listeners with consistent passive settings
      document.addEventListener('touchmove', moveHandler, { passive: false });
      document.addEventListener('touchend', endHandler, { passive: false });
      document.addEventListener('touchcancel', endHandler, { passive: false });
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
            overlay.addEventListener('touchstart', handlers.handleTouchStart, { passive: false });
            
            // Store cleanup function
            overlay._cleanupHandlers = handlers.cleanup;
          } else {
            // Desktop: double-click interaction AND right-click
            overlay.addEventListener("dblclick", handleDesktopInteraction);
            overlay.addEventListener("contextmenu", handleRightClick);
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
    handleRightClick,
    playInitialGreeting,
    hasPlayedGreeting,
    startupComplete,
    setContextMenuVisible,  // ADD THIS
    setContextMenuPosition, // ADD THIS
  ]);

  return null;
};

export const useClippyContext = () => useContext(ClippyContext);
export default ClippyProvider;