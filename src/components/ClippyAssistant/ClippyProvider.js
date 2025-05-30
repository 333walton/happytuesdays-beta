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

// FIXED: Import dedicated balloon managers
import { 
  showCustomBalloon, 
  hideCustomBalloon, 
  cleanupCustomBalloon,
  isCustomBalloonVisible
} from "./CustomBalloon";
import { 
  showChatBalloon, 
  hideChatBalloon, 
  cleanupChatBalloon,
  isChatBalloonVisible,
  isUserInteractingWithChat
} from "./ChatBalloon";

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

// FIXED: Proper greeting animations array
const GREETING_ANIMATIONS = ["Greeting", "Wave", "GetAttention"];

// FIXED: Initial message content from StartMessage component
const INITIAL_MESSAGE_CONTENT = "Welcome to Hydra98! Please enjoy and don't break anything";

// FIXED: All 41 available Clippy animations for context menu
const ALL_CLIPPY_ANIMATIONS = [
  "Congratulate", "LookRight", "SendMail", "Thinking", "Explain",
  "IdleRopePile", "IdleAtom", "Print", "Hide", "GetAttention",
  "Save", "GetTechy", "GestureUp", "Idle1_1", "Processing",
  "Alert", "LookUpRight", "IdleSideToSide", "GoodBye", "LookLeft",
  "IdleHeadScratch", "LookUpLeft", "CheckingSomething", "Hearing_1", "GetWizardy",
  "IdleFingerTap", "GestureLeft", "Wave", "GestureRight", "Writing",
  "IdleSnooze", "LookDownRight", "GetArtsy", "Show", "LookDown",
  "Searching", "EmptyTrash", "Greeting", "LookUp", "GestureDown",
  "RestPose", "IdleEyeBrowRaise", "LookDownLeft"
];

// FIXED: Increased cooldown to 1.5 seconds as required
const INTERACTION_COOLDOWN_MS = 1500;

const ClippyProvider = ({ children, defaultAgent = "Clippy" }) => {
  // Core state
  const [startupComplete, setStartupComplete] = useState(false);
  const [assistantVisible, setAssistantVisible] = useState(true);
  const [currentAgent, setCurrentAgent] = useState(defaultAgent);
  const [isScreenPoweredOn, setIsScreenPoweredOn] = useState(true);
  const [positionLocked, setPositionLocked] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Context menu state
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // FIXED: Enhanced interaction state tracking with 1.5s cooldown
  const [interactionCount, setInteractionCount] = useState(0);
  const [lastInteractionTime, setLastInteractionTime] = useState(0);
  const [isInCooldown, setIsInCooldown] = useState(false);

  // FIXED: Animation queue prevention
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);

  // Refs
  const clippyInstanceRef = useRef(null);
  const overlayRef = useRef(null);
  const mountedRef = useRef(false);
  const errorCountRef = useRef(0);
  const lastErrorRef = useRef(0);
  const startupTimeoutRef = useRef(null);
  const resizeHandlingActiveRef = useRef(false);
  const currentZoomLevelRef = useRef(0);
  const greetingPlayedRef = useRef(false);
  const initialMessageShownRef = useRef(false);
  const shutdownTimeoutRef = useRef(null);

  // FIXED: Track if Clippy should be rendered based on sequence states
  const [shouldRenderClippy, setShouldRenderClippy] = useState(false);

  // Position state (desktop only)
  const [position, setPosition] = useState(() => {
    if (isMobile) return { x: 0, y: 0 };
    return safeExecute(
      () => ClippyPositioning.calculateDesktopPosition(),
      { x: 520, y: 360 },
      "initial position"
    );
  });

  // FIXED: Enhanced cooldown management
  const startCooldown = useCallback(() => {
    setIsInCooldown(true);
    setTimeout(() => {
      setIsInCooldown(false);
      devLog("Cooldown period ended");
    }, INTERACTION_COOLDOWN_MS);
  }, []);

  // FIXED: Check if any balloon is currently open
  const isAnyBalloonOpen = useCallback(() => {
    return isCustomBalloonVisible() || isChatBalloonVisible();
  }, []);

  // FIXED: Context menu management
  const showContextMenu = useCallback((x, y) => {
    const menuWidth = 180;
    const menuHeight = 200;
    const adjustedX = Math.min(x, window.innerWidth - menuWidth - 10);
    const adjustedY = Math.min(y, window.innerHeight - menuHeight - 10);
    
    devLog(`Showing context menu at (${adjustedX}, ${adjustedY})`);
    setContextMenuPosition({ x: adjustedX, y: adjustedY });
    setContextMenuVisible(true);
  }, []);

  const hideContextMenu = useCallback(() => {
    devLog("Hiding context menu");
    setContextMenuVisible(false);
  }, []);

  // FIXED: Enhanced interaction handler with 1.5s cooldown and balloon rules
  const handleInteraction = useCallback((e, interactionType = "tap") => {
    e.preventDefault();
    e.stopPropagation();

    const now = Date.now();
    
    // FIXED: Enforce 1.5s cooldown for ALL interactions
    if (isInCooldown || now - lastInteractionTime < INTERACTION_COOLDOWN_MS) {
      devLog(`Interaction blocked - in ${INTERACTION_COOLDOWN_MS}ms cooldown`);
      return false;
    }

    // FIXED: Block if animation is currently playing
    if (isAnimationPlaying) {
      devLog("Interaction blocked - animation currently playing");
      return false;
    }

    // FIXED: Check if persistent chat is open - don't allow new interactions
    if (isChatBalloonVisible() && isUserInteractingWithChat()) {
      devLog("Interaction blocked - user is actively using chat balloon (persistent)");
      return false;
    }

    // FIXED: Block if any balloon is already open
    if (isAnyBalloonOpen()) {
      devLog("Interaction blocked - another balloon is already open");
      return false;
    }

    setLastInteractionTime(now);
    startCooldown();
    
    const newCount = interactionCount + 1;
    setInteractionCount(newCount);

    devLog(`${interactionType} interaction #${newCount} triggered`);

    if (!mountedRef.current || !clippyInstanceRef.current) {
      if (window.clippy) {
        clippyInstanceRef.current = window.clippy;
      } else {
        devLog("No clippy instance available");
        return false;
      }
    }

    // FIXED: Implement balloon interaction rules
    // Single tap (mobile): Every other tap should show a chat balloon
    // Double-click (desktop): Every other click shows a chat balloon
    // Long press (mobile, 800ms hold): Always shows a speech balloon
    
    const shouldShowChatBalloon = (newCount % 2 === 0) && interactionType !== "long-press";
    
    devLog(`Will show ${shouldShowChatBalloon ? 'chat' : 'speech'} balloon (interaction #${newCount})`);

    return safeExecute(() => {
      if (clippyInstanceRef.current.play) {
        setIsAnimationPlaying(true);
        
        clippyInstanceRef.current.play("Greeting");
        devLog("Animation triggered successfully");
        
        // Clear animation state after reasonable time
        setTimeout(() => {
          setIsAnimationPlaying(false);
        }, 2000);
        
        setTimeout(() => {
          if (mountedRef.current && !isAnyBalloonOpen()) { // Double-check balloon state
            if (shouldShowChatBalloon) {
              const chatMessage = isMobile 
                ? "Hi! What would you like to chat about?" 
                : "Hello! How can I help you today?";
              devLog("Showing chat balloon");
              showChatBalloon(chatMessage);
            } else {
              const speechMessage = isMobile
                ? "Tap me again for more help!"
                : "Double-click me again for more help!";
              devLog("Showing speech balloon");
              showCustomBalloon(speechMessage);
            }
          }
        }, 800);
      }
      return true;
    }, false, `${interactionType} interaction`);
  }, [interactionCount, lastInteractionTime, isInCooldown, isAnimationPlaying, startCooldown, isAnyBalloonOpen]);

  // FIXED: Long press handler (mobile only) - always shows speech balloon
  const handleLongPress = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!mountedRef.current || !isMobile) return false;

    const now = Date.now();
    
    // FIXED: Enforce 1.5s cooldown
    if (isInCooldown || now - lastInteractionTime < INTERACTION_COOLDOWN_MS) {
      devLog("Long press blocked - in cooldown");
      return false;
    }

    // FIXED: Block if animation is playing
    if (isAnimationPlaying) {
      devLog("Long press blocked - animation playing");
      return false;
    }

    // FIXED: Check if persistent chat is open
    if (isChatBalloonVisible() && isUserInteractingWithChat()) {
      devLog("Long press blocked - user is actively using chat balloon");
      return false;
    }

    // FIXED: Block if any balloon is open
    if (isAnyBalloonOpen()) {
      devLog("Long press blocked - another balloon is open");
      return false;
    }

    devLog("Long press interaction - always shows chat balloon");

    setLastInteractionTime(now);
    startCooldown();

    return safeExecute(() => {
      if (clippyInstanceRef.current?.play) {
        setIsAnimationPlaying(true);
        
        clippyInstanceRef.current.play("GetAttention");
        
        // Clear animation state
        setTimeout(() => {
          setIsAnimationPlaying(false);
        }, 2000);
        
        setTimeout(() => {
          if (mountedRef.current && !isAnyBalloonOpen()) {
            // FIXED: Long press always shows chat balloon as required
            showChatBalloon("Hi! What would you like to chat about?");
          }
        }, 500);
      }
      return true;
    }, false, "long press interaction");
  }, [lastInteractionTime, isInCooldown, isAnimationPlaying, startCooldown, isAnyBalloonOpen]);

  // FIXED: Right-click handler with proper enforcement
  const handleRightClick = useCallback((e) => {
    if (isMobile) return false;
    
    e.preventDefault();
    e.stopPropagation();
    
    // FIXED: Right-click should work even during cooldown for context menu
    devLog("Right-click context menu triggered");
    showContextMenu(e.clientX, e.clientY);
    return true;
  }, [showContextMenu]);

  // FIXED: Initial message function with flag check
  const showInitialMessage = useCallback(() => {
    if (initialMessageShownRef.current) {
      devLog("Initial message already shown, skipping");
      return;
    }
    
    initialMessageShownRef.current = true;
    devLog("Showing initial welcome message");
    
    if (clippyInstanceRef.current?.play) {
      clippyInstanceRef.current.play("GetAttention");
      
      setTimeout(() => {
        if (mountedRef.current && !isAnyBalloonOpen()) {
          showCustomBalloon(INITIAL_MESSAGE_CONTENT, 8000); // Show longer for initial message
        }
      }, 800);
    }
  }, [isAnyBalloonOpen]);

  // FIXED: Proper greeting animation selection from correct array
  const playInitialGreeting = useCallback(() => {
    if (greetingPlayedRef.current || !clippyInstanceRef.current || !startupComplete) {
      return;
    }
    
    greetingPlayedRef.current = true;
    
    devLog("Playing initial greeting animation");
    
    safeExecute(() => {
      // FIXED: Select from the correct greeting animations
      const randomGreeting = GREETING_ANIMATIONS[Math.floor(Math.random() * GREETING_ANIMATIONS.length)];
      
      devLog(`Selected greeting animation: ${randomGreeting}`);
      
      if (clippyInstanceRef.current?.play) {
        clippyInstanceRef.current.play(randomGreeting);
        devLog("Initial greeting animation started");
      }
    }, null, "initial greeting");
  }, [startupComplete]);

  // FIXED: Enhanced shutdown detection and handling
  const handleShutdownSequence = useCallback((isShuttingDown) => {
    if (isShuttingDown) {
      devLog("Shutdown sequence detected - playing GoodBye and removing Clippy");
      
      // Play GoodBye animation immediately
      if (clippyInstanceRef.current?.play) {
        clippyInstanceRef.current.play("GoodBye");
      }
      
      // Hide all balloons immediately
      hideCustomBalloon();
      hideChatBalloon();
      hideContextMenu();
      
      // Remove Clippy from viewport after animation
      shutdownTimeoutRef.current = setTimeout(() => {
        setShouldRenderClippy(false);
        devLog("Clippy removed from viewport due to shutdown");
      }, 1000); // Give time for GoodBye animation
      
    } else {
      devLog("Shutdown cancelled - re-rendering Clippy");
      
      // Clear shutdown timeout
      if (shutdownTimeoutRef.current) {
        clearTimeout(shutdownTimeoutRef.current);
        shutdownTimeoutRef.current = null;
      }
      
      // Re-render Clippy
      setShouldRenderClippy(true);
    }
  }, [hideContextMenu]);

  // FIXED: Mobile touch handlers with enhanced drag/interaction separation
  const createMobileTouchHandlers = useCallback(() => {
    let moveHandler = null;
    let endHandler = null;

    const handleTouchStart = (e) => {
      if (!mountedRef.current) return;

      const touch = e.touches[0];
      const dragState = {
        startX: touch.clientX,
        startY: touch.clientY,
        dragStarted: false,
        longPressTimer: null,
        origRightPx: 0,
        origBottomPx: 0
      };

      // Only set up drag if position is unlocked
      if (!positionLocked) {
        const clippyEl = document.querySelector('.clippy');
        if (clippyEl) {
          const rect = clippyEl.getBoundingClientRect();
          dragState.origRightPx = window.innerWidth - rect.right;
          dragState.origBottomPx = window.innerHeight - rect.bottom;
        }
      }

      // Move handler
      moveHandler = (e) => {
        if (!mountedRef.current) return;

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - dragState.startX);
        const deltaY = Math.abs(touch.clientY - dragState.startY);

        // Start drag only if unlocked AND movement threshold crossed
        if (!dragState.dragStarted && !positionLocked && (deltaX > 10 || deltaY > 10)) {
          clearTimeout(dragState.longPressTimer);
          dragState.dragStarted = true;
          e.preventDefault();
          
          if (window.setClippyDragging) {
            window.setClippyDragging(true);
          }
        }

        // Handle drag movement
        if (dragState.dragStarted && !positionLocked) {
          e.preventDefault();
          
          const totalDeltaX = touch.clientX - dragState.startX;
          const totalDeltaY = touch.clientY - dragState.startY;
          
          const newRightPx = Math.max(10, Math.min(window.innerWidth - 70, dragState.origRightPx - totalDeltaX));
          const newBottomPx = Math.max(90, Math.min(window.innerHeight - 90, dragState.origBottomPx - totalDeltaY));

          const clippyEl = document.querySelector('.clippy');
          if (clippyEl && ClippyPositioning?.handleMobileDrag) {
            ClippyPositioning.handleMobileDrag(clippyEl, overlayRef.current, { rightPx: newRightPx, bottomPx: newBottomPx }, true);
          }
        }
      };

      // End handler
      endHandler = (e) => {
        // Clean up event listeners
        if (moveHandler) document.removeEventListener('touchmove', moveHandler);
        if (endHandler) {
          document.removeEventListener('touchend', endHandler);
          document.removeEventListener('touchcancel', endHandler);
        }

        clearTimeout(dragState.longPressTimer);

        // FIXED: Only trigger interaction if no drag occurred
        if (!dragState.dragStarted) {
          handleInteraction(e, "tap");
        } else {
          // End drag mode
          const clippyEl = document.querySelector('.clippy');
          if (clippyEl && ClippyPositioning?.endMobileDrag) {
            ClippyPositioning.endMobileDrag(clippyEl, overlayRef.current, null);
          }

          setTimeout(() => {
            if (window.setClippyDragging) {
              window.setClippyDragging(false);
            }
          }, 100);
        }
      };

      // Set up long-press timer with cooldown check
      const now = Date.now();
      if (now - lastInteractionTime >= INTERACTION_COOLDOWN_MS && !isInCooldown) {
        dragState.longPressTimer = setTimeout(() => {
          if (!dragState.dragStarted && mountedRef.current) {
            clearTimeout(dragState.longPressTimer);
            handleLongPress(e);
          }
        }, 800);
      }

      // Add event listeners
      document.addEventListener('touchmove', moveHandler, { passive: false });
      document.addEventListener('touchend', endHandler, { passive: false });
      document.addEventListener('touchcancel', endHandler, { passive: false });
    };

    return {
      handleTouchStart,
      cleanup: () => {
        if (moveHandler) document.removeEventListener('touchmove', moveHandler);
        if (endHandler) {
          document.removeEventListener('touchend', endHandler);
          document.removeEventListener('touchcancel', endHandler);
        }
      }
    };
  }, [handleInteraction, handleLongPress, lastInteractionTime, positionLocked, isInCooldown]);

  // FIXED: Desktop interaction with 1.5s cooldown
  const handleDesktopInteraction = useCallback((e) => {
    const now = Date.now();
    if (isInCooldown || now - lastInteractionTime < INTERACTION_COOLDOWN_MS) {
      devLog("Desktop interaction blocked - in cooldown");
      return;
    }
    return handleInteraction(e, "double-click");
  }, [handleInteraction, lastInteractionTime, isInCooldown]);

  // FIXED: Enhanced unmount with GoodBye animation
  useEffect(() => {
    return () => {
      if (clippyInstanceRef.current?.play) {
        devLog("Playing GoodBye animation before unmount");
        clippyInstanceRef.current.play("GoodBye");
        
        // Small delay to let animation start
        setTimeout(() => {
          devLog("GoodBye animation completed");
        }, 500);
      }
      
      // Cleanup balloon managers
      cleanupCustomBalloon();
      cleanupChatBalloon();
      
      // Clear shutdown timeout
      if (shutdownTimeoutRef.current) {
        clearTimeout(shutdownTimeoutRef.current);
      }
    };
  }, []);

  // FIXED: Initial message trigger when startup completes
  useEffect(() => {
    if (startupComplete && shouldRenderClippy && !initialMessageShownRef.current && clippyInstanceRef.current) {
      devLog("Startup complete - will show initial message after greeting");
      
      // Wait for initial greeting to finish, then show initial message
      setTimeout(() => {
        if (mountedRef.current) {
          showInitialMessage();
        }
      }, 3000); // Wait 3 seconds after greeting animation
    }
  }, [startupComplete, shouldRenderClippy, showInitialMessage]);

  // FIXED: Enhanced startup and shutdown sequence monitoring
  useEffect(() => {
    let isMonitoring = true;

    const checkSequenceStatus = () => {
      if (!isMonitoring) return;

      const biosWrapper = document.querySelector(".BIOSWrapper");
      const windowsLaunchWrapper = document.querySelector(".WindowsLaunchWrapper");
      const desktop = document.querySelector(".desktop");
      const shutdownScreen = document.querySelector(".itIsNowSafeToTurnOffYourComputer");

      let sequenceActive = false;
      let isShuttingDown = false;

      // Check startup sequences
      if (biosWrapper && windowsLaunchWrapper) {
        const biosVisible = !biosWrapper.classList.contains("hidden") &&
                           getComputedStyle(biosWrapper).opacity !== "0";
        const windowsVisible = !windowsLaunchWrapper.classList.contains("hidden") &&
                              getComputedStyle(windowsLaunchWrapper).opacity !== "0";
        sequenceActive = biosVisible || windowsVisible;
      }

      // FIXED: Check shutdown sequences
      if (desktop?.classList.contains("windowsShuttingDown")) {
        isShuttingDown = true;
        sequenceActive = true;
      }

      // FIXED: Shutdown screen takes absolute precedence
      if (shutdownScreen) {
        isShuttingDown = true;
        sequenceActive = true;
      }

      const wasComplete = startupComplete;
      const wasRendering = shouldRenderClippy;
      const isComplete = !sequenceActive;
      const shouldRender = isComplete && !isShuttingDown;

      // Handle state changes
      if (wasComplete !== isComplete) {
        setStartupComplete(isComplete);
        
        // FIXED: Only trigger greeting on transition to complete (and not shutting down)
        if (isComplete && !isShuttingDown && !greetingPlayedRef.current) {
          setTimeout(() => {
            playInitialGreeting();
          }, 1000);
        }
      }

      // FIXED: Handle rendering state
      if (wasRendering !== shouldRender) {
        setShouldRenderClippy(shouldRender);
        
        if (!shouldRender && wasRendering) {
          // Clippy being hidden due to shutdown
          handleShutdownSequence(true);
        } else if (shouldRender && !wasRendering) {
          // Clippy being shown (shutdown cancelled or startup complete)
          if (wasRendering === false) { // Only if we were previously rendering
            handleShutdownSequence(false);
          }
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
  }, [playInitialGreeting, startupComplete, shouldRenderClippy, handleShutdownSequence]);

  // Context menu click-outside handler
  useEffect(() => {
    if (!contextMenuVisible) return;

    let cleanup = null;
    let timeoutId = null;

    timeoutId = setTimeout(() => {
      const handleClickOutside = (e) => {
        if (e.target.closest('.clippy') || 
            e.target.closest('#clippy-clickable-overlay') ||
            e.target.closest('.clippy-context-menu-debug')) {
          return;
        }
        devLog("Click outside context menu - hiding");
        hideContextMenu();
      };

      const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
          devLog("Escape key pressed - hiding context menu");
          hideContextMenu();
        }
      };

      document.addEventListener('click', handleClickOutside, { capture: true });
      document.addEventListener('keydown', handleEscapeKey);

      cleanup = () => {
        document.removeEventListener('click', handleClickOutside, { capture: true });
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }, 100);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (cleanup) cleanup();
    };
  }, [contextMenuVisible, hideContextMenu]);

  // Zoom monitoring (keeping existing logic)
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

        // FIXED: Enhanced sequence checking for shutdown
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

  // Initialize global functions (FIXED: use dedicated balloon functions)
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
          hideCustomBalloon();
          hideChatBalloon();
          hideContextMenu();
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

      // FIXED: Balloon functions now use dedicated managers with single balloon enforcement
      window.showClippyCustomBalloon = createSafeGlobalFunction((message) => {
        // FIXED: Check if any balloon is already open
        if (isCustomBalloonVisible() || isChatBalloonVisible()) {
          devLog("Cannot show custom balloon - another balloon is already open");
          return false;
        }
        return showCustomBalloon(message);
      }, "showClippyCustomBalloon");

      window.hideClippyCustomBalloon = createSafeGlobalFunction(() => {
        return hideCustomBalloon();
      }, "hideClippyCustomBalloon");

      window.showClippyChatBalloon = createSafeGlobalFunction((initialMessage) => {
        // FIXED: Check if any balloon is already open
        if (isCustomBalloonVisible() || isChatBalloonVisible()) {
          devLog("Cannot show chat balloon - another balloon is already open");
          return false;
        }
        return showChatBalloon(initialMessage);
      }, "showClippyChatBalloon");

      window.hideChatBalloon = createSafeGlobalFunction(() => {
        return hideChatBalloon();
      }, "hideChatBalloon");

      // FIXED: Initial message function with flag checking
      window.showClippyInitialMessage = createSafeGlobalFunction(() => {
        return showInitialMessage();
      }, "showClippyInitialMessage");

      window.getClippyInstance = () => clippyInstanceRef.current;

      // FIXED: Test functions now use dedicated managers with balloon checking
      window.testClippyBalloon = () => {
        devLog("Manual balloon test triggered");
        if (isCustomBalloonVisible() || isChatBalloonVisible()) {
          devLog("Cannot test balloon - another balloon is already open");
          return false;
        }
        const success = showCustomBalloon("🎉 Test balloon - if you see this, balloons are working!");
        devLog(`Balloon creation success: ${success}`);
        return success;
      };

      window.testClippyChat = () => {
        devLog("Manual chat test triggered");
        if (isCustomBalloonVisible() || isChatBalloonVisible()) {
          devLog("Cannot test chat - another balloon is already open");
          return false;
        }
        const success = showChatBalloon("💬 Test chat - type a message to test chat functionality");
        devLog(`Chat creation success: ${success}`);
        return success;
      };

      window.testClippyInitialMessage = () => {
        devLog("Manual initial message test triggered");
        const success = showInitialMessage();
        devLog(`Initial message success: ${success}`);
        return success;
      };

      // Context menu test functions
      window.forceShowContextMenu = () => {
        devLog("Force showing context menu");
        setContextMenuPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        setContextMenuVisible(true);
        return true;
      };

      // FIXED: Reset cooldown function for testing
      window.resetClippyCooldown = () => {
        setIsInCooldown(false);
        setLastInteractionTime(0);
        devLog("Clippy interaction cooldown reset");
        return true;
      };

      devLog("All global functions initialized successfully");
    }

    return () => {
      if (typeof window !== "undefined" && window._clippyGlobalsInitialized) {
        // Clean up global functions
        delete window.setClippyPosition;
        delete window.setClippyPositionLocked;
        delete window.getClippyPositionLocked;
        delete window.setClippyDragging;
        delete window.setAssistantVisible;
        delete window.setCurrentAgent;
        delete window.setScreenPowerState;
        delete window.showClippyCustomBalloon;
        delete window.hideClippyCustomBalloon;
        delete window.showClippyChatBalloon;
        delete window.hideChatBalloon;
        delete window.showClippyInitialMessage;
        delete window.getClippyInstance;
        delete window.testClippyBalloon;
        delete window.testClippyChat;
        delete window.testClippyInitialMessage;
        delete window.forceShowContextMenu;
        delete window.resetClippyCooldown;
        delete window._clippyGlobalsInitialized;
      }
    };
  }, [
    createSafeGlobalFunction,
    setPosition,
    setPositionLocked,
    positionLocked,
    setIsDragging,
    setAssistantVisible,
    setCurrentAgent,
    setIsScreenPoweredOn,
    showInitialMessage,
    hideContextMenu,
  ]);

  // ClippyController - simplified version focused on setup
  const ClippyController = () => {
    const { clippy } = useClippy();
    const setupAttemptRef = useRef(0);

    useEffect(() => {
      if (!clippy || !assistantVisible || !shouldRenderClippy) {
        devLog("ClippyController: Conditions not met for rendering", {
          hasClippy: !!clippy,
          assistantVisible,
          shouldRenderClippy
        });
        return;
      }

      mountedRef.current = true;
      clippyInstanceRef.current = clippy;
      window.clippy = clippy;
      
      devLog("ClippyController mounted with clippy instance");

      const setupClippy = () => {
        if (!mountedRef.current || setupAttemptRef.current >= 3) return false;

        setupAttemptRef.current++;
        devLog(`Clippy setup attempt ${setupAttemptRef.current}`);

        return safeExecute(() => {
          const clippyEl = document.querySelector(".clippy");
          if (!clippyEl) return false;

          // Initial positioning
          const initialZoomLevel = parseInt(document.body.getAttribute("data-zoom")) || 0;
          
          if (isMobile) {
            if (ClippyPositioning?.calculateEnhancedMobilePosition && ClippyPositioning?.applyMobilePosition) {
              const mobilePosition = ClippyPositioning.calculateEnhancedMobilePosition();
              ClippyPositioning.applyMobilePosition(clippyEl, mobilePosition, false);
            }
          } else {
            if (ClippyPositioning?.forceImmediateZoomPositioning) {
              ClippyPositioning.forceImmediateZoomPositioning(clippyEl, initialZoomLevel);
            }
          }

          // Set visibility
          clippyEl.style.visibility = isScreenPoweredOn ? "visible" : "hidden";
          clippyEl.style.opacity = isScreenPoweredOn ? "1" : "0";
          clippyEl.style.pointerEvents = "auto";
          clippyEl.style.display = "block";

          // Setup overlay
          if (!overlayRef.current) {
            const overlay = document.createElement("div");
            overlay.id = "clippy-clickable-overlay";
            overlay.style.pointerEvents = "auto";
            overlay.style.cursor = "pointer";
            overlay.style.background = "transparent";
            overlay.style.position = "fixed";
            overlay.style.zIndex = "1500";

            if (isMobile) {
              const handlers = createMobileTouchHandlers();
              if (handlers?.handleTouchStart) {
                overlay.addEventListener('touchstart', handlers.handleTouchStart, { passive: false });
                overlay._cleanupHandlers = handlers.cleanup;
              }
            } else {
              overlay.addEventListener("dblclick", handleDesktopInteraction);
              overlay.addEventListener("contextmenu", handleRightClick);
            }

            overlayRef.current = overlay;
            document.body.appendChild(overlay);
          }

          // Position overlay
          if (ClippyPositioning?.positionClippyAndOverlay) {
            ClippyPositioning.positionClippyAndOverlay(clippyEl, overlayRef.current, null);
          }

          // Start resize handling
          if (!resizeHandlingActiveRef.current) {
            if (ClippyPositioning?.startResizeHandling) {
              const resizeStarted = ClippyPositioning.startResizeHandling(clippyEl, overlayRef.current, null);
              if (resizeStarted) {
                resizeHandlingActiveRef.current = true;
              }
            }
          }

          return true;
        }, false, "clippy setup");
      };

      setupClippy();

      return () => {
        mountedRef.current = false;
        
        safeExecute(() => {
          const clippyEl = document.querySelector(".clippy");
          if (resizeHandlingActiveRef.current && clippyEl) {
            ClippyPositioning?.stopResizeHandling(clippyEl);
            resizeHandlingActiveRef.current = false;
          }

          if (overlayRef.current?.parentNode) {
            if (overlayRef.current._cleanupHandlers) {
              overlayRef.current._cleanupHandlers();
            }
            overlayRef.current.parentNode.removeChild(overlayRef.current);
            overlayRef.current = null;
          }
        }, null, "controller cleanup");
      };
    }, [
      clippy,
      assistantVisible,
      shouldRenderClippy,
      isScreenPoweredOn,
      createMobileTouchHandlers,
      handleDesktopInteraction,
      handleRightClick,
    ]);

    return null;
  };

  // Get custom position function for controller
  const getCustomPosition = useCallback(() => {
    if (isMobile) return null;
    return position;
  }, [position]);

  // Mount effect
  useEffect(() => {
    mountedRef.current = true;
    devLog("ClippyProvider mounted");

    return () => {
      mountedRef.current = false;
      devLog("ClippyProvider unmounted");
    };
  }, []);

  // Context value
  const contextValue = {
    // State
    assistantVisible,
    currentAgent,
    isScreenPoweredOn,
    position,
    positionLocked,
    isDragging,
    startupComplete,
    shouldRenderClippy,
    contextMenuVisible,
    contextMenuPosition,
    interactionCount,
    isInCooldown,
    isAnimationPlaying,

    // Actions
    setAssistantVisible,
    setCurrentAgent,
    setIsScreenPoweredOn,
    setPosition,
    setPositionLocked,
    setIsDragging,

    // FIXED: Balloon functions now use dedicated managers
    showCustomBalloon,
    showChatBalloon,
    hideCustomBalloon,
    hideChatBalloon,
    showInitialMessage,
    isAnyBalloonOpen,

    // Context menu functions
    showContextMenu,
    hideContextMenu,

    // Interaction handlers
    handleInteraction,
    handleLongPress,
    handleRightClick,

    // Greeting function
    playInitialGreeting,

    // Refs
    clippyInstanceRef,
    overlayRef,
    mountedRef,

    // Device info
    isMobile,
  };

  return (
    <ClippyContext.Provider value={contextValue}>
      <ReactClippyProvider agent={currentAgent}>
        {/* FIXED: Only render ClippyController when shouldRenderClippy is true */}
        {assistantVisible && shouldRenderClippy && <ClippyController />}

        {/* FIXED: Context Menu with all animations */}
        {contextMenuVisible && (
          <ClippyContextMenu
            x={contextMenuPosition.x}
            y={contextMenuPosition.y}
            onClose={hideContextMenu}
            currentAgent={currentAgent}
            agents={["Clippy", "Links", "Bonzi", "Genie", "Merlin", "Rover"]}
            animations={ALL_CLIPPY_ANIMATIONS}
            onAction={(action, data) => {
              devLog(`Context menu action: ${action}`, data);
              hideContextMenu();
              
              switch (action) {
                case 'hide':
                  setAssistantVisible(false);
                  break;
                case 'selectAgent':
                  setCurrentAgent(data);
                  if (clippyInstanceRef.current?.play && !isAnimationPlaying) {
                    setIsAnimationPlaying(true);
                    clippyInstanceRef.current.play('Wave');
                    setTimeout(() => {
                      setIsAnimationPlaying(false);
                      if (!isAnyBalloonOpen()) {
                        showCustomBalloon(`Hello! I'm ${data} now. How can I help you?`);
                      }
                    }, 800);
                  }
                  break;
                case 'playAnimation':
                  if (clippyInstanceRef.current?.play && !isAnimationPlaying) {
                    setIsAnimationPlaying(true);
                    clippyInstanceRef.current.play(data);
                    setTimeout(() => {
                      setIsAnimationPlaying(false);
                    }, 2000);
                  }
                  break;
                case 'wave':
                  if (clippyInstanceRef.current?.play && !isAnimationPlaying) {
                    setIsAnimationPlaying(true);
                    clippyInstanceRef.current.play('Wave');
                    setTimeout(() => {
                      setIsAnimationPlaying(false);
                    }, 2000);
                  }
                  break;
                case 'greet':
                  if (clippyInstanceRef.current?.play && !isAnimationPlaying) {
                    setIsAnimationPlaying(true);
                    clippyInstanceRef.current.play('Greeting');
                    setTimeout(() => {
                      setIsAnimationPlaying(false);
                      if (!isAnyBalloonOpen()) {
                        showCustomBalloon("Hello there! 👋");
                      }
                    }, 800);
                  }
                  break;
                case 'chat':
                  if (!isAnyBalloonOpen()) {
                    showChatBalloon("Hi! What would you like to chat about?");
                  }
                  break;
                default:
                  devLog(`Unknown context menu action: ${action}`);
              }
            }}
          />
        )}

        {/* Mobile Controls - only show when Clippy should be rendered */}
        {isMobile && shouldRenderClippy && (
          <MobileControls
            positionLocked={positionLocked}
            onToggleLock={() => setPositionLocked(!positionLocked)}
            onHide={() => setAssistantVisible(false)}
          />
        )}

        {children}
      </ReactClippyProvider>
    </ClippyContext.Provider>
  );
};

export const useClippyContext = () => useContext(ClippyContext);
export default ClippyProvider;