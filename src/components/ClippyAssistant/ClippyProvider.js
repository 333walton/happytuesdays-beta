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

// FIXED: Import enhanced balloon managers
import { 
  showCustomBalloon, 
  showWelcomeBalloon,
  showHelpBalloon,
  showErrorBalloon,
  showTipsBalloon,
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

// FIXED: Enhanced animation logging with forced console output
const logAnimation = (animationName, context = "unknown") => {
  // Force log animation regardless of dev mode
  console.log(`🎭 Animation Triggered: "${animationName}" from ${context}`);
  
  // Also log to dev console if in dev mode
  if (isDev) {
    devLog(`Animation: ${animationName} (${context})`);
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

// FIXED: Enforced greeting animations array - will only select from these
const GREETING_ANIMATIONS = ["Wave"];

// FIXED: Initial message content from StartMessage component
const INITIAL_MESSAGE_CONTENT = "Welcome to Hydra98! Please enjoy and don't break anything";

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
    devLog(`Showing context menu at (${x}, ${y})`);
    setContextMenuPosition({ x, y });
    setContextMenuVisible(true);
  }, []);

  const hideContextMenu = useCallback(() => {
    devLog("Hiding context menu");
    setContextMenuVisible(false);
  }, []);

  // FIXED: Enhanced shutdown detection and handling with GoodBye animation and logging
  const handleShutdownSequence = useCallback((isShuttingDown) => {
    if (isShuttingDown) {
      devLog("Shutdown sequence detected - playing GoodBye and hiding Clippy completely");
      
      // FIXED: Play GoodBye animation with logging
      if (clippyInstanceRef.current?.play) {
        const animationName = "GoodBye";
        logAnimation(animationName, "shutdown sequence");
        clippyInstanceRef.current.play(animationName);
      }
      
      // Hide all balloons immediately
      hideCustomBalloon();
      hideChatBalloon();
      hideContextMenu();
      
      // Hide Clippy from ALL viewports (including surrounding frame)
      const clippyEl = document.querySelector(".clippy");
      const overlayEl = document.getElementById("clippy-clickable-overlay");
      
      if (clippyEl) {
        clippyEl.style.display = "none";
        clippyEl.style.visibility = "hidden";
        clippyEl.style.opacity = "0";
        clippyEl.style.transform = "translateX(-9999px) translateY(-9999px)";
        clippyEl.style.pointerEvents = "none";
      }
      
      if (overlayEl) {
        overlayEl.style.display = "none";
        overlayEl.style.visibility = "hidden";
        overlayEl.style.opacity = "0";
        overlayEl.style.pointerEvents = "none";
      }
      
      // Remove Clippy from viewport after animation
      shutdownTimeoutRef.current = setTimeout(() => {
        setShouldRenderClippy(false);
        devLog("Clippy completely removed from all viewports due to shutdown");
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
      
      // Restore Clippy visibility
      const clippyEl = document.querySelector(".clippy");
      const overlayEl = document.getElementById("clippy-clickable-overlay");
      
      if (clippyEl) {
        clippyEl.style.display = "block";
        clippyEl.style.visibility = "visible";
        clippyEl.style.opacity = "1";
        clippyEl.style.transform = "";
        clippyEl.style.pointerEvents = "auto";
      }
      
      if (overlayEl) {
        overlayEl.style.display = "block";
        overlayEl.style.visibility = "visible";
        overlayEl.style.opacity = "1";
        overlayEl.style.pointerEvents = "auto";
      }
    }
  }, [hideContextMenu]);

  // FIXED: Enhanced agent change function with actual character switching
  const handleAgentChange = useCallback((newAgent) => {
    if (!mountedRef.current || newAgent === currentAgent) {
      devLog(`Agent change blocked - same agent (${newAgent}) or not mounted`);
      return false;
    }

    devLog(`Changing agent from ${currentAgent} to ${newAgent}`);
    
    return safeExecute(() => {
      // Hide any open balloons during transition
      hideCustomBalloon();
      hideChatBalloon();
      hideContextMenu();
      
      // Update agent state
      setCurrentAgent(newAgent);
      
      // FIXED: Force reload Clippy with new agent
      const clippyEl = document.querySelector('.clippy');
      if (clippyEl) {
        // Add transitioning class for smooth change
        clippyEl.classList.add('agent-transitioning');
        
        // Brief fade out
        clippyEl.style.opacity = '0.3';
        clippyEl.style.transform = 'translateZ(0) scale(0.7)';
        
        setTimeout(() => {
          // Trigger agent change in React95 Clippy
          if (window.clippy && window.clippy.load) {
            window.clippy.load(newAgent, () => {
              devLog(`Agent ${newAgent} loaded successfully`);
              
              // Update clippy instance reference
              clippyInstanceRef.current = window.clippy;
              
              // Restore appearance with new agent
              clippyEl.style.opacity = '1';
              
              // Apply correct scale for device
              const correctScale = isMobile ? '0.8' : `${0.9 * ClippyPositioning.getMonitorZoomFactor()}`;
              clippyEl.style.transform = `translateZ(0) scale(${correctScale})`;
              
              clippyEl.classList.remove('agent-transitioning');
              
              // Reposition for new agent
              setTimeout(() => {
                if (ClippyPositioning?.positionClippyAndOverlay) {
                  const overlayEl = document.getElementById("clippy-clickable-overlay");
                  ClippyPositioning.positionClippyAndOverlay(clippyEl, overlayEl, null);
                }
                
                // Play welcome animation for new agent
                if (window.clippy?.play) {
                  logAnimation('Wave', `agent change welcome (${newAgent})`);
                  window.clippy.play('Wave');
                  
                  // Show welcome message
                  setTimeout(() => {
                    if (mountedRef.current && !isAnyBalloonOpen()) {
                      showCustomBalloon(`Hello! I'm ${newAgent} now. How can I help you?`, 6000);
                    }
                  }, 800);
                }
              }, 100);
            });
          } else {
            // Fallback: Update agent through context if direct load not available
            devLog(`Fallback agent change to ${newAgent}`);
            
            // Restore appearance
            clippyEl.style.opacity = '1';
            const correctScale = isMobile ? '0.8' : `${0.9 * ClippyPositioning.getMonitorZoomFactor()}`;
            clippyEl.style.transform = `translateZ(0) scale(${correctScale})`;
            clippyEl.classList.remove('agent-transitioning');
            
            // Show change message
            setTimeout(() => {
              if (mountedRef.current && !isAnyBalloonOpen()) {
                showCustomBalloon(`I'm now ${newAgent}! How can I help you?`, 6000);
              }
            }, 300);
          }
        }, 300);
      }
      
      return true;
    }, false, "agent change");
  }, [currentAgent, hideCustomBalloon, hideChatBalloon, hideContextMenu, isAnyBalloonOpen]);

  // FIXED: Enhanced initial message with welcome balloon
  const showInitialMessage = useCallback(() => {
    if (initialMessageShownRef.current) {
      devLog("Initial message already shown, skipping");
      return;
    }
    
    initialMessageShownRef.current = true;
    devLog("Showing enhanced initial welcome message with buttons");
    
    setTimeout(() => {
      if (mountedRef.current && !isAnyBalloonOpen()) {
        devLog("Showing enhanced welcome balloon with options");
        showWelcomeBalloon(); // Use the enhanced welcome balloon
      }
    }, 800);
  }, [isAnyBalloonOpen]);

  // FIXED: Enhanced interaction handler with guaranteed responses and scale preservation
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

    // FIXED: Preserve Clippy's positioning and scale during interaction
    const clippyEl = document.querySelector('.clippy');
    if (clippyEl && ClippyPositioning?.preserveClippyScale) {
      // Store and preserve current scale before interaction
      const preserved = ClippyPositioning.preserveClippyScale(clippyEl);
      devLog(`Clippy scale preservation: ${preserved ? 'success' : 'failed'}`);
      
      // After interaction completes, ensure positioning is maintained
      setTimeout(() => {
        if (ClippyPositioning?.positionClippyAndOverlay) {
          const overlayEl = document.getElementById("clippy-clickable-overlay");
          ClippyPositioning.positionClippyAndOverlay(clippyEl, overlayEl, null);
          devLog("Clippy positioning restored after interaction");
        }
      }, 100);
    }

    // FIXED: GUARANTEED RESPONSE - Every interaction gets either animation OR balloon (never both except initial)
    const isInitialInteraction = !greetingPlayedRef.current && !initialMessageShownRef.current;
    
    if (isInitialInteraction) {
      // SPECIAL CASE: Initial interaction gets BOTH animation AND enhanced welcome balloon
      devLog("Initial interaction - will show BOTH animation and enhanced welcome balloon");
      
      return safeExecute(() => {
        if (clippyInstanceRef.current.play) {
          setIsAnimationPlaying(true);
          
          const randomIndex = Math.floor(Math.random() * GREETING_ANIMATIONS.length);
          const animationName = GREETING_ANIMATIONS[randomIndex];
          logAnimation(animationName, `initial interaction (both animation + enhanced welcome)`);
          
          clippyInstanceRef.current.play(animationName);
          greetingPlayedRef.current = true;
          
          setTimeout(() => {
            setIsAnimationPlaying(false);
          }, 2000);
          
          // Show enhanced welcome balloon after animation
          setTimeout(() => {
            if (mountedRef.current && !initialMessageShownRef.current) {
              initialMessageShownRef.current = true;
              showWelcomeBalloon(); // Enhanced welcome with buttons
              devLog("Enhanced welcome balloon shown");
            }
          }, 1200);
        }
        return true;
      }, false, "initial interaction");
    }

    // FIXED: STANDARD INTERACTIONS - Guaranteed animation OR balloon (never both, never neither)
    const shouldShowChatBalloon = (newCount % 2 === 0) && interactionType !== "long-press";
    const shouldShowSpeechBalloon = !shouldShowChatBalloon;
    
    // RULE: Even interactions (2, 4, 6...) = Chat balloon only (no animation)
    // RULE: Odd interactions (1, 3, 5...) = Animation + Enhanced Speech balloon
    
    devLog(`Enhanced interaction pattern for #${newCount}:`, {
      isEven: newCount % 2 === 0,
      willShowChat: shouldShowChatBalloon,
      willShowSpeech: shouldShowSpeechBalloon,
      willPlayAnimation: shouldShowSpeechBalloon // Animation only with speech
    });

    return safeExecute(() => {
      if (shouldShowChatBalloon) {
        // EVEN INTERACTIONS: Chat balloon only (no animation)
        devLog("Even interaction - showing chat balloon (no animation)");
        
        setTimeout(() => {
          if (mountedRef.current && !isAnyBalloonOpen()) {
            const chatMessage = isMobile 
              ? "Hi! What would you like to chat about?" 
              : "Hello! How can I help you today?";
            showChatBalloon(chatMessage);
            devLog("Chat balloon shown for even interaction");
          }
        }, 200);
        
      } else {
        // ODD INTERACTIONS: Animation + Enhanced Speech balloon with buttons
        devLog("Odd interaction - playing animation + showing enhanced speech balloon");
        
        if (clippyInstanceRef.current.play) {
          setIsAnimationPlaying(true);
          
          const randomIndex = Math.floor(Math.random() * GREETING_ANIMATIONS.length);
          const animationName = GREETING_ANIMATIONS[randomIndex];
          logAnimation(animationName, `${interactionType} interaction #${newCount} (odd - with enhanced speech)`);
          
          clippyInstanceRef.current.play(animationName);
          
          setTimeout(() => {
            setIsAnimationPlaying(false);
          }, 2000);
          
          // Show enhanced speech balloon with contextual buttons
          setTimeout(() => {
            if (mountedRef.current && !isAnyBalloonOpen()) {
              const enhancedMessage = {
                message: isMobile 
                  ? "How may I help you?" 
                  : "How may I help you?",
                buttons: [
                  {
                    text: "💬 Let's chat",
                    chat: "Great! What would you like to talk about?"
                  },
                  {
                    text: "🎭 Show me tricks",
                    action: () => {
                      if (window.clippy?.play) {
                        const tricks = ["GetAttention", "Congratulate", "Wave", "GestureRight"];
                        const randomTrick = tricks[Math.floor(Math.random() * tricks.length)];
                        logAnimation(randomTrick, "enhanced balloon trick button");
                        window.clippy.play(randomTrick);
                      }
                    }
                  },
                  {
                    text: "❓ I need help",
                    action: () => showHelpBalloon()
                  },
                  {
                    text: "👋 Just saying hi",
                    message: "Well hello there! It's great to see you. Feel free to explore Hydra98!"
                  }
                ]
              };
              
              showCustomBalloon(enhancedMessage, 12000);
              devLog("Enhanced speech balloon with buttons shown");
            }
          }, 800);
        }
      }
      
      return true;
    }, false, `${interactionType} interaction`);
  }, [interactionCount, lastInteractionTime, isInCooldown, isAnimationPlaying, startCooldown, isAnyBalloonOpen]);

  // FIXED: Long press guaranteed response
  const handleLongPress = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!mountedRef.current || !isMobile) return false;

    const now = Date.now();
    
    if (isInCooldown || now - lastInteractionTime < INTERACTION_COOLDOWN_MS) {
      devLog("Long press blocked - in cooldown");
      return false;
    }

    if (isAnimationPlaying) {
      devLog("Long press blocked - animation playing");
      return false;
    }

    if (isChatBalloonVisible() && isUserInteractingWithChat()) {
      devLog("Long press blocked - user is actively using chat balloon");
      return false;
    }

    if (isAnyBalloonOpen()) {
      devLog("Long press blocked - another balloon is open");
      return false;
    }

    devLog("Long press interaction - GUARANTEED chat balloon");

    setLastInteractionTime(now);
    startCooldown();

    return safeExecute(() => {
      // GUARANTEED: Long press always shows chat balloon (no animation)
      setTimeout(() => {
        if (mountedRef.current && !isAnyBalloonOpen()) {
          showChatBalloon("Hi! What would you like to chat about?");
          devLog("Long press chat balloon guaranteed");
        }
      }, 100);
      
      return true;
    }, false, "long press interaction");
  }, [lastInteractionTime, isInCooldown, isAnimationPlaying, startCooldown, isAnyBalloonOpen]);

  // FIXED: Enhanced right-click handler with better event handling
  const handleRightClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    devLog("Right-click context menu triggered", { 
      target: e.target.className,
      clientX: e.clientX, 
      clientY: e.clientY 
    });
    
    // Ensure menu shows even if other balloons are open
    showContextMenu(e.clientX, e.clientY);
    return true;
  }, [showContextMenu]);

  // FIXED: Proper greeting animation selection with animation logging - ENFORCED to only use the specified animations
  const playInitialGreeting = useCallback(() => {
    if (greetingPlayedRef.current || !clippyInstanceRef.current || !startupComplete) {
      return;
    }
    
    greetingPlayedRef.current = true;
    
    devLog("Playing initial greeting animation");
    
    safeExecute(() => {
      // FIXED: ENFORCED - Only select from the specified greeting animations
      const randomIndex = Math.floor(Math.random() * GREETING_ANIMATIONS.length);
      const selectedGreeting = GREETING_ANIMATIONS[randomIndex];
      
      // FIXED: Log animation with forced console output
      logAnimation(selectedGreeting, `initial greeting (index ${randomIndex})`);
      
      devLog(`Selected greeting animation: ${selectedGreeting} (index ${randomIndex} from [${GREETING_ANIMATIONS.join(', ')}])`);
      
      if (clippyInstanceRef.current?.play) {
        clippyInstanceRef.current.play(selectedGreeting);
        devLog("Initial greeting animation started");
      }
    }, null, "initial greeting");
  }, [startupComplete]);

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

  // FIXED: Enhanced startup and shutdown sequence monitoring with complete hiding
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

      // FIXED: Check shutdown sequences - both windowsShuttingDown class and shutdown screen
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

      // FIXED: Handle rendering state with shutdown detection
      if (wasRendering !== shouldRender) {
        setShouldRenderClippy(shouldRender);
        
        if (!shouldRender && wasRendering) {
          // Clippy being hidden due to shutdown
          handleShutdownSequence(true);
        } else if (shouldRender && !wasRendering) {
          // Clippy being shown (shutdown cancelled or startup complete)
          if (wasRendering === false) {
            handleShutdownSequence(false);
          }
        }
      }

      // FIXED: If shutdown is detected but shouldRender is still true, force shutdown handling
      if (isShuttingDown && shouldRender) {
        setShouldRenderClippy(false);
        handleShutdownSequence(true);
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
            e.target.closest('.clippy-context-menu') ||
            e.target.closest('.context-menu-content') ||
            e.target.closest('.context-submenu')) {
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

  // FIXED: Initialize enhanced global functions with button support and agent switching
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

      // FIXED: Enhanced agent change function
      window.setCurrentAgent = createSafeGlobalFunction((agent) => {
        devLog(`Global setCurrentAgent called: ${agent}`);
        return handleAgentChange(agent);
      }, "setCurrentAgent");

      window.setScreenPowerState = createSafeGlobalFunction((powered) => {
        setIsScreenPoweredOn(powered);
        return true;
      }, "setScreenPowerState");

      // FIXED: Enhanced balloon functions with button support
      window.showClippyCustomBalloon = createSafeGlobalFunction((content) => {
        if (isCustomBalloonVisible() || isChatBalloonVisible()) {
          devLog("Cannot show custom balloon - another balloon is already open");
          return false;
        }
        
        // Support both string and object content
        return showCustomBalloon(content);
      }, "showClippyCustomBalloon");

      window.hideClippyCustomBalloon = createSafeGlobalFunction(() => {
        return hideCustomBalloon();
      }, "hideClippyCustomBalloon");

      window.showClippyChatBalloon = createSafeGlobalFunction((initialMessage) => {
        if (isCustomBalloonVisible() || isChatBalloonVisible()) {
          devLog("Cannot show chat balloon - another balloon is already open");
          return false;
        }
        return showChatBalloon(initialMessage);
      }, "showClippyChatBalloon");

      window.hideChatBalloon = createSafeGlobalFunction(() => {
        return hideChatBalloon();
      }, "hideChatBalloon");

      // FIXED: New enhanced balloon functions
      window.showClippyWelcomeBalloon = createSafeGlobalFunction(() => {
        if (isCustomBalloonVisible() || isChatBalloonVisible()) {
          devLog("Cannot show welcome balloon - another balloon is already open");
          return false;
        }
        return showWelcomeBalloon();
      }, "showClippyWelcomeBalloon");

      window.showClippyHelpBalloon = createSafeGlobalFunction(() => {
        if (isCustomBalloonVisible() || isChatBalloonVisible()) {
          devLog("Cannot show help balloon - another balloon is already open");
          return false;
        }
        return showHelpBalloon();
      }, "showClippyHelpBalloon");

      window.showClippyErrorBalloon = createSafeGlobalFunction((errorMessage) => {
        if (isCustomBalloonVisible() || isChatBalloonVisible()) {
          devLog("Cannot show error balloon - another balloon is already open");
          return false;
        }
        return showErrorBalloon(errorMessage);
      }, "showClippyErrorBalloon");

      window.showClippyTipsBalloon = createSafeGlobalFunction(() => {
        if (isCustomBalloonVisible() || isChatBalloonVisible()) {
          devLog("Cannot show tips balloon - another balloon is already open");
          return false;
        }
        return showTipsBalloon();
      }, "showClippyTipsBalloon");

      // FIXED: Initial message function with flag checking
      window.showClippyInitialMessage = createSafeGlobalFunction(() => {
        return showInitialMessage();
      }, "showClippyInitialMessage");

      window.getClippyInstance = () => clippyInstanceRef.current;

      // FIXED: Enhanced test functions with buttons
      window.testClippyBalloon = () => {
        devLog("Manual enhanced balloon test triggered");
        if (isCustomBalloonVisible() || isChatBalloonVisible()) {
          devLog("Cannot test balloon - another balloon is already open");
          return false;
        }
        
        const testBalloon = {
          message: "🎉 Enhanced balloon test! This balloon has interactive buttons.",
          buttons: [
            {
              text: "✨ Play animation",
              animation: "Congratulate"
            },
            {
              text: "💬 Open chat",
              chat: "Hello! This chat was opened from a balloon button."
            },
            {
              text: "📢 Show message",
              message: "This is a follow-up message triggered by a button!"
            },
            {
              text: "👍 Got it",
              action: () => {
                devLog("Test balloon button clicked - test complete!");
              }
            }
          ]
        };
        
        const success = showCustomBalloon(testBalloon, 15000);
        devLog(`Enhanced balloon creation success: ${success}`);
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

      // Context menu test functions
      window.forceShowContextMenu = () => {
        devLog("Force showing context menu");
        setContextMenuPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        setContextMenuVisible(true);
        return true;
      };

      // Expose showContextMenu globally for mobile View Menu button
      window.showClippyContextMenu = (x, y) => {
        showContextMenu(x, y);
      };

      // FIXED: Reset cooldown function for testing
      window.resetClippyCooldown = () => {
        setIsInCooldown(false);
        setLastInteractionTime(0);
        devLog("Clippy interaction cooldown reset");
        return true;
      };

      devLog("All enhanced global functions initialized successfully");
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
        delete window.showClippyWelcomeBalloon;
        delete window.showClippyHelpBalloon;
        delete window.showClippyErrorBalloon;
        delete window.showClippyTipsBalloon;
        delete window.showClippyInitialMessage;
        delete window.getClippyInstance;
        delete window.testClippyBalloon;
        delete window.testClippyChat;
        delete window.forceShowContextMenu;
        delete window.showClippyContextMenu;
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
    handleAgentChange,
  ]);

  // FIXED: Mobile touch handlers with enhanced drag/interaction separation and scale preservation
  const createMobileTouchHandlers = useCallback(() => {
    let moveHandler = null;
    let endHandler = null;
    let lastTapTime = 0; // Track time of last tap
    let tapCount = 0; // Track consecutive taps
    const DOUBLE_TAP_THRESHOLD = 300; // Max time between taps for double tap (ms)
    const TAP_DISTANCE_THRESHOLD = 20; // Max distance between taps for double tap (px)

    const handleTouchStart = (e) => {
      if (!mountedRef.current) return;

      const touch = e.touches[0];

      const dragState = {
        startX: touch.clientX,
        startY: touch.clientY,
        dragStarted: false,
        longPressTimer: null,
        origRightPx: 0,
        origBottomPx: 0,
        // Store initial position for distance check
        initialClientX: touch.clientX,
        initialClientY: touch.clientY,
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

        // If no drag occurred (it was a tap)
        if (!dragState.dragStarted) {
          const tapEndTime = Date.now();
          const timeSinceLastTap = tapEndTime - lastTapTime;
          
          // Check distance moved since start of touch to confirm it's a tap
          const deltaX = Math.abs(e.changedTouches[0].clientX - dragState.initialClientX);
          const deltaY = Math.abs(e.changedTouches[0].clientY - dragState.initialClientY);
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (distance < TAP_DISTANCE_THRESHOLD) {
            // It's a valid tap
            if (timeSinceLastTap < DOUBLE_TAP_THRESHOLD && tapCount === 1) {
              // Double tap detected
              tapCount = 0; // Reset tap count
              lastTapTime = 0; // Reset timer
              devLog("Mobile double-tap detected - opening context menu");

              // Open context menu with specified positioning
              const clippyEl = document.querySelector('.clippy');
              if (clippyEl) {
                const rect = clippyEl.getBoundingClientRect();
                // Show menu directly above Clippy's head
                showContextMenu(
                  rect.left + rect.width / 2,
                  rect.top - 20 // 20px above Clippy
                );
              } else {
                // Fallback: show in center of screen
                showContextMenu(window.innerWidth / 2, window.innerHeight / 2);
              }
            } else {
              // Single tap detected (or start of double tap sequence)
              tapCount = 1;
              lastTapTime = tapEndTime;
              devLog("Mobile single tap detected");
              
              // Only handle single tap if we're not in a potential double-tap sequence
              if (timeSinceLastTap >= DOUBLE_TAP_THRESHOLD) {
                handleInteraction(e, "tap");
              }
              
              // Reset tap count after double tap threshold if no second tap occurs
              setTimeout(() => {
                if (tapCount === 1 && Date.now() - lastTapTime >= DOUBLE_TAP_THRESHOLD) {
                  tapCount = 0;
                  lastTapTime = 0;
                  devLog("Mobile tap count reset");
                }
              }, DOUBLE_TAP_THRESHOLD);
            }
          } else {
            // Movement was too large for a tap, reset tap count
            tapCount = 0;
            lastTapTime = 0;
          }
        } else {
          // End drag mode and preserve scale
          const clippyEl = document.querySelector('.clippy');
          if (clippyEl && ClippyPositioning?.endMobileDrag) {
            ClippyPositioning.endMobileDrag(clippyEl, overlayRef.current, null);
            
            // Preserve scale after drag
            if (ClippyPositioning?.preserveClippyScale) {
              ClippyPositioning.preserveClippyScale(clippyEl);
            }
          }

          setTimeout(() => {
            if (window.setClippyDragging) {
              window.setClippyDragging(false);
            }
          }, 100);
        }
      };

      // Set up long-press timer with cooldown check
      const touchStartTimeForLongPress = Date.now();
      if (!dragState.dragStarted && touchStartTimeForLongPress - lastInteractionTime >= INTERACTION_COOLDOWN_MS && !isInCooldown) {
        dragState.longPressTimer = setTimeout(() => {
          if (!dragState.dragStarted && mountedRef.current) {
            clearTimeout(dragState.longPressTimer);
            handleLongPress(e);
            // Reset tap count after long press
            tapCount = 0;
            lastTapTime = 0;
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
  }, [handleInteraction, handleLongPress, lastInteractionTime, positionLocked, isInCooldown, showContextMenu]);

  // FIXED: Desktop interaction with 1.5s cooldown
  const handleDesktopInteraction = useCallback((e) => {
    const now = Date.now();
    if (isInCooldown || now - lastInteractionTime < INTERACTION_COOLDOWN_MS) {
      devLog("Desktop interaction blocked - in cooldown");
      return;
    }
    return handleInteraction(e, "double-click");
  }, [handleInteraction, lastInteractionTime, isInCooldown]);

  // FIXED: Enhanced ClippyController with agent monitoring and scale preservation
  const ClippyController = () => {
    const { clippy } = useClippy();
    const setupAttemptRef = useRef(0);
    const lastAgentRef = useRef(currentAgent);

    // Monitor agent changes
    useEffect(() => {
      if (lastAgentRef.current !== currentAgent) {
        devLog(`Agent change detected in ClippyController: ${lastAgentRef.current} → ${currentAgent}`);
        lastAgentRef.current = currentAgent;
        
        // Trigger agent reload if available
        if (clippy && clippy.load) {
          clippy.load(currentAgent, () => {
            clippyInstanceRef.current = clippy;
            window.clippy = clippy;
            devLog(`ClippyController reloaded with agent: ${currentAgent}`);
          });
        }
      }
    }, [currentAgent, clippy]);

    useEffect(() => {
      if (!clippy || !assistantVisible || !shouldRenderClippy) {
        devLog("ClippyController: Conditions not met for rendering", {
          hasClippy: !!clippy,
          assistantVisible,
          shouldRenderClippy,
          currentAgent
        });
        return;
      }

      mountedRef.current = true;
      clippyInstanceRef.current = clippy;
      window.clippy = clippy;
      
      devLog(`ClippyController mounted with agent: ${currentAgent}`);

      const setupClippy = () => {
        if (!mountedRef.current || setupAttemptRef.current >= 3) return false;

        setupAttemptRef.current++;
        devLog(`Clippy setup attempt ${setupAttemptRef.current} for agent: ${currentAgent}`);

        return safeExecute(() => {
          const clippyEl = document.querySelector(".clippy");
          if (!clippyEl) return false;

          // Agent-specific styling if needed
          clippyEl.setAttribute('data-agent', currentAgent);

          // FIXED: Bind right-click directly to Clippy element
          const addRightClickToElement = (element, elementName) => {
            if (element && !element._hasContextMenu) {
              element.addEventListener("contextmenu", (e) => {
                devLog(`Right-click on ${elementName}`);
                handleRightClick(e);
              }, { passive: false });
              element._hasContextMenu = true;
            }
          };

          // Add right-click to main Clippy element
          addRightClickToElement(clippyEl, "main Clippy element");

          // Add right-click to all SVG elements within Clippy
          const svgElements = clippyEl.querySelectorAll("svg, .map");
          svgElements.forEach((svg, index) => {
            addRightClickToElement(svg, `SVG element ${index}`);
          });

          // Initial positioning with scale preservation
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
            
            // Enhanced overlay styles for better event capture
            overlay.style.cssText = `
              position: fixed !important;
              background: transparent !important;
              cursor: pointer !important;
              pointer-events: auto !important;
              z-index: 1500 !important;
              touch-action: none !important;
            `;

            if (isMobile) {
              const handlers = createMobileTouchHandlers();
              if (handlers?.handleTouchStart) {
                overlay.addEventListener('touchstart', handlers.handleTouchStart, { passive: false });
                overlay._cleanupHandlers = handlers.cleanup;
              }
            } else {
              overlay.addEventListener("dblclick", handleDesktopInteraction);
              // FIXED: Enhanced context menu binding
              overlay.addEventListener("contextmenu", (e) => {
                devLog("Right-click on overlay");
                handleRightClick(e);
              }, { passive: false });
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
        // FIXED: Enhanced cleanup
        mountedRef.current = false;
        
        safeExecute(() => {
          // Remove context menu handlers
          const clippyEl = document.querySelector(".clippy");
          if (clippyEl && clippyEl._hasContextMenu) {
            clippyEl.removeEventListener("contextmenu", handleRightClick);
            clippyEl._hasContextMenu = false;
          }

          const svgElements = clippyEl?.querySelectorAll("svg, .map") || [];
          svgElements.forEach((svg) => {
            if (svg._hasContextMenu) {
              svg.removeEventListener("contextmenu", handleRightClick);
              svg._hasContextMenu = false;
            }
          });

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
      currentAgent, // ADDED: React to agent changes
      createMobileTouchHandlers,
      handleDesktopInteraction,
      handleRightClick,
    ]);

    return null;
  };

  // Mount effect
  useEffect(() => {
    mountedRef.current = true;
    devLog("ClippyProvider mounted");

    return () => {
      mountedRef.current = false;
      devLog("ClippyProvider unmounted");
    };
  }, []);

  // FIXED: CSS for agent transitions
  useEffect(() => {
    const agentTransitionStyles = `
      .agent-transitioning {
        transition: opacity 0.3s ease, transform 0.3s ease !important;
      }

      .clippy[data-agent="Bonzi"] {
        /* Bonzi-specific styling if needed */
      }

      .clippy[data-agent="Genie"] {
        /* Genie-specific styling if needed */
      }

      .clippy[data-agent="Merlin"] {
        /* Merlin-specific styling if needed */
      }

      .clippy[data-agent="Rover"] {
        /* Rover-specific styling if needed */
      }

      .clippy[data-agent="Links"] {
        /* Links-specific styling if needed */
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'clippy-agent-transitions';
    styleEl.textContent = agentTransitionStyles;
    document.head.appendChild(styleEl);

    return () => {
      const existingStyle = document.getElementById('clippy-agent-transitions');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // FIXED: Enhanced unmount with GoodBye animation and logging
  useEffect(() => {
    return () => {
      if (clippyInstanceRef.current?.play) {
        devLog("Playing GoodBye animation before unmount");
        const animationName = "GoodBye";
        logAnimation(animationName, "component unmount");
        clippyInstanceRef.current.play(animationName);
        
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

    // FIXED: Enhanced balloon functions
    showCustomBalloon,
    showWelcomeBalloon,
    showHelpBalloon,
    showErrorBalloon,
    showTipsBalloon,
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

    // Agent change function
    handleAgentChange,

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

        {/* FIXED: Context Menu with enhanced functionality */}
        {contextMenuVisible && (
          <ClippyContextMenu
            x={contextMenuPosition.x}
            y={contextMenuPosition.y}
            onClose={hideContextMenu}
            currentAgent={currentAgent}
            agents={["Clippy", "Links", "Bonzi", "Genie", "Merlin", "Rover"]}
            onAction={(action, data) => {
              devLog(`Context menu action: ${action}`, data);
              // Menu actions are now handled within ClippyContextMenu component
              // This just logs for debugging
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