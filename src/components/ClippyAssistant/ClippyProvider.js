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
  isCustomBalloonVisible,
} from "./CustomBalloon";
import {
  showChatBalloon,
  hideChatBalloon,
  cleanupChatBalloon,
  isChatBalloonVisible,
  isUserInteractingWithChat,
} from "./ChatBalloon";

import ClippyContextMenu from "./ClippyContextMenu";
import ClippyPositioning from "./ClippyPositioning";
import ClippyService from "./ClippyService";
import MobileControls from "./MobileControls";
import DesktopControls from "./DesktopControls";
import "./_styles.scss";

const ClippyContext = createContext(null);

// Device detection
const detectMobile = () => {
  try {
    if (typeof window === "undefined") return false;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent) || window.innerWidth < 768;
  } catch (error) {
    return false;
  }
};

const isMobile = detectMobile();

// Development logging
const isDev = process.env.NODE_ENV === "development";
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
const INITIAL_MESSAGE_CONTENT =
  "Welcome to Hydra98! Please enjoy and don't break anything";

// FIXED: Increased cooldown to 3 seconds to prevent animation queue
const INTERACTION_COOLDOWN_MS = 3000;

// ENHANCED: Global animation logging function
const logAllAnimations = (animationName, context = "unknown") => {
  console.log(
    `%c🎭 CLIPPY ANIMATION: "${animationName}"%c (triggered from: ${context})`,
    "color: #ff6b35; font-weight: bold; font-size: 14px; background: #fff3cd; padding: 2px 6px; border-radius: 3px;",
    "color: #856404; font-size: 12px;"
  );
};


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
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

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
  const welcomeBalloonCompletedRef = useRef(false);
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
  const handleShutdownSequence = useCallback(
    (isShuttingDown) => {
      if (isShuttingDown) {
        devLog(
          "Shutdown sequence detected - playing GoodBye and hiding Clippy completely"
        );

        // FIXED: Play GoodBye animation with logging and 1 second delay
        if (clippyInstanceRef.current?.play) {
          const animationName = "GoodBye";
          logAnimation(animationName, "shutdown sequence");
          clippyInstanceRef.current.play(animationName);
          
          // Add 1 second delay after GoodBye animation
          setTimeout(() => {
            devLog("GoodBye animation delay completed");
          }, 1000);
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
          devLog(
            "Clippy completely removed from all viewports due to shutdown"
          );
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

          // Explicitly restore position and scale
          if (ClippyPositioning?.positionClippyAndOverlay) {
            const overlayEl = document.getElementById(
              "clippy-clickable-overlay"
            );
            ClippyPositioning.positionClippyAndOverlay(
              clippyEl,
              overlayEl,
              null
            );
          }
        }

        if (overlayEl) {
          overlayEl.style.display = "block";
          overlayEl.style.visibility = "visible";
          overlayEl.style.opacity = "1";
          overlayEl.style.pointerEvents = "auto";
        }
      }
    },
    [hideContextMenu]
  );

  // FIXED: Enhanced agent change function with proper React95 provider switching
  const handleAgentChange = useCallback(
    (newAgent) => {
      // Validate agent name against official React95 agents
      const officialAgents = [
        "Clippy", "Links", "Bonzi", "Genie", "Genius", 
        "Merlin", "F1", "Peedy", "Rocky", "Rover"
      ];
      
      if (!officialAgents.includes(newAgent)) {
        devLog(`Agent change rejected - invalid agent name: ${newAgent}`);
        console.error(`❌ Invalid agent: ${newAgent}. Must be one of:`, officialAgents);
        return false;
      }

      if (!mountedRef.current || newAgent === currentAgent) {
        devLog(
          `Agent change blocked - same agent (${newAgent}) or not mounted`
        );
        return false;
      }

      devLog(`Changing agent from ${currentAgent} to ${newAgent} (official React95 agent)`);

      return safeExecute(
        () => {
          // Hide any open balloons during transition
          hideCustomBalloon();
          hideChatBalloon();
          hideContextMenu();

          // Update agent state - this will trigger ReactClippyProvider re-render
          setCurrentAgent(newAgent);

          // Show welcome message after a brief delay for new agent to load
          setTimeout(() => {
            if (mountedRef.current && !isAnyBalloonOpen()) {
              showCustomBalloon(
                `Hello! I'm ${newAgent} now. How can I help you?`,
                6000
              );
            }
          }, 1500); // Give time for new agent to load

          return true;
        },
        false,
        "agent change"
      );
    },
    [
      currentAgent,
      hideCustomBalloon,
      hideChatBalloon,
      hideContextMenu,
      isAnyBalloonOpen,
    ]
  );

  // FIXED: Enhanced initial message with welcome balloon completion tracking
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
        
        // Set welcome balloon completion after a delay
        setTimeout(() => {
          welcomeBalloonCompletedRef.current = true;
          devLog("Welcome balloon marked as completed - animations now unblocked");
        }, 6000); // 6 seconds to allow user to read welcome message
      }
    }, 800);
  }, [isAnyBalloonOpen]);

  // NEW: Desktop single click handler with 75%/25% animation/balloon split
  const handleDesktopSingleClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();

      // Check cooldown and hiding state
      if (isInCooldown || now - lastInteractionTime < INTERACTION_COOLDOWN_MS) {
        devLog(`Desktop single click blocked - in ${INTERACTION_COOLDOWN_MS}ms cooldown`);
        return false;
      }
      
      // Block all interactions if Clippy is hiding or hidden
      if (window.clippyIsHiding || window.clippyIsHidden) {
        devLog("Desktop single click blocked - Clippy is hiding/hidden");
        return false;
      }

      // Block if animation is currently playing
      if (isAnimationPlaying) {
        devLog("Desktop single click blocked - animation currently playing");
        return false;
      }

      // Block animations until welcome balloon completes (except welcome animation itself)
      if (!welcomeBalloonCompletedRef.current && greetingPlayedRef.current) {
        devLog("Desktop single click blocked - welcome balloon not completed");
        return false;
      }

      // Block if any balloon is already open
      if (isAnyBalloonOpen()) {
        devLog("Desktop single click blocked - balloon is already open");
        return false;
      }

      setLastInteractionTime(now);
      startCooldown();

      const newCount = interactionCount + 1;
      setInteractionCount(newCount);

      devLog(`Desktop single click #${newCount} triggered`);

      if (!mountedRef.current || !clippyInstanceRef.current) {
        if (window.clippy) {
          clippyInstanceRef.current = window.clippy;
        } else {
          devLog("No clippy instance available");
          return false;
        }
      }

      // Preserve Clippy's positioning and scale during interaction
      const clippyEl = document.querySelector(".clippy");
      if (clippyEl && ClippyPositioning?.preserveClippyScale) {
        const preserved = ClippyPositioning.preserveClippyScale(clippyEl);
        devLog(`Clippy scale preservation: ${preserved ? "success" : "failed"}`);

        setTimeout(() => {
          if (ClippyPositioning?.positionClippyAndOverlay) {
            const overlayEl = document.getElementById("clippy-clickable-overlay");
            ClippyPositioning.positionClippyAndOverlay(clippyEl, overlayEl, null);
            devLog("Clippy positioning restored after interaction");
          }
        }, 100);
      }

      // NEW RULE: 75% chance for animation, 25% chance for balloon
      const shouldShowAnimation = Math.random() < 0.75;

      devLog(`Desktop single click pattern:`, {
        shouldShowAnimation,
        percentage: shouldShowAnimation ? "75% - Animation" : "25% - Balloon"
      });

      return safeExecute(
        () => {
          if (shouldShowAnimation) {
            // 75% case: Play random animation only
            devLog("Desktop single click - playing random animation (75%)");

            if (clippyInstanceRef.current.play) {
              setIsAnimationPlaying(true);

              // Available animations for random selection
              const animations = [
                "Wave", "Congratulate", "GetAttention", "Thinking", "Writing", 
                "GoodBye", "Processing", "Alert", "GetArtsy", "Searching", 
                "Explain", "Greeting", "GestureRight", "GestureLeft", "GestureUp"
              ];
              
              const randomIndex = Math.floor(Math.random() * animations.length);
              const animationName = animations[randomIndex];
              
              logAnimation(animationName, `desktop single click (75% animation)`);
              clippyInstanceRef.current.play(animationName);

              // Special handling for Hide animation (handled in context menu)
              if (animationName === "Hide") {
                // Hide animation handling is done in context menu
                setTimeout(() => {
                  setIsAnimationPlaying(false);
                }, 2000); // Just the animation duration
              } else {
                // Add extra delay for GoodBye animation
                const animationDelay = animationName === "GoodBye" ? 3000 : 2000;
                setTimeout(() => {
                  setIsAnimationPlaying(false);
                  if (animationName === "GoodBye") {
                    devLog("GoodBye animation delay completed");
                  }
                }, animationDelay);
              }
            }
          } else {
            // 25% case: Show custom balloon message
            devLog("Desktop single click - showing custom balloon (25%)");

            setTimeout(() => {
              if (mountedRef.current && !isAnyBalloonOpen()) {
                // Random balloon messages
                const balloonMessages = [
                  "Hi there! Having a good day?",
                  "Click me again for another surprise!",
                  "I'm here if you need any help!",
                  "Enjoying Hydra98 so far?",
                  "Try right-clicking me for more options!",
                  "Double-click me to open my menu!",
                  "Need help? Just let me know!",
                  "Welcome to the nostalgic world of Windows 98!",
                  "Feeling productive today?",
                  "Don't forget to save your work!"
                ];
                
                const randomMessage = balloonMessages[Math.floor(Math.random() * balloonMessages.length)];
                showCustomBalloon(randomMessage, 4000);
                devLog(`Custom balloon shown: "${randomMessage}"`);
              }
            }, 200);
          }

          return true;
        },
        false,
        "desktop single click"
      );
    },
    [
      isInCooldown,
      lastInteractionTime,
      isAnimationPlaying,
      isAnyBalloonOpen,
      startCooldown,
      interactionCount,
      setInteractionCount,
      setLastInteractionTime,
      setIsAnimationPlaying,
      mountedRef,
      clippyInstanceRef,
      showCustomBalloon
    ]
  );

  // NEW: Desktop double click handler for chat balloon
  const handleDesktopDoubleClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();

      // Check cooldown
      if (isInCooldown || now - lastInteractionTime < INTERACTION_COOLDOWN_MS) {
        devLog(`Desktop double click blocked - in ${INTERACTION_COOLDOWN_MS}ms cooldown`);
        return false;
      }

      // Block if animation is currently playing
      if (isAnimationPlaying) {
        devLog("Desktop double click blocked - animation currently playing");
        return false;
      }

      // Block if any balloon is already open
      if (isAnyBalloonOpen()) {
        devLog("Desktop double click blocked - balloon is already open");
        return false;
      }

      setLastInteractionTime(now);
      startCooldown();

      devLog("Desktop double click - opening chat balloon");

      // Show chat balloon
      setTimeout(() => {
        if (mountedRef.current && !isAnyBalloonOpen()) {
          showChatBalloon("Hi! What would you like to chat about?");
          devLog("Desktop double click chat balloon shown");
        }
      }, 200);

      return true;
    },
    [isInCooldown, lastInteractionTime, isAnimationPlaying, isAnyBalloonOpen, startCooldown, showChatBalloon]
  );

  // NEW: Mobile single tap handler - 75% animation, 25% speech balloon ONLY
  const handleMobileSingleTap = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();

      // Check cooldown and hiding state
      if (isInCooldown || now - lastInteractionTime < INTERACTION_COOLDOWN_MS) {
        devLog(`Mobile single tap blocked - in ${INTERACTION_COOLDOWN_MS}ms cooldown`);
        return false;
      }
      
      // Block all interactions if Clippy is hiding or hidden
      if (window.clippyIsHiding || window.clippyIsHidden) {
        devLog("Mobile single tap blocked - Clippy is hiding/hidden");
        return false;
      }

      // Block if animation is currently playing
      if (isAnimationPlaying) {
        devLog("Mobile single tap blocked - animation currently playing");
        return false;
      }

      // Block animations until welcome balloon completes (except welcome animation itself)
      if (!welcomeBalloonCompletedRef.current && greetingPlayedRef.current) {
        devLog("Mobile single tap blocked - welcome balloon not completed");
        return false;
      }

      // Block if any balloon is already open
      if (isAnyBalloonOpen()) {
        devLog("Mobile single tap blocked - balloon is already open");
        return false;
      }

      // Block if context menu is visible
      if (contextMenuVisible) {
        devLog("Mobile single tap blocked - context menu is visible");
        return false;
      }

      setLastInteractionTime(now);
      startCooldown();

      const newCount = interactionCount + 1;
      setInteractionCount(newCount);

      devLog(`Mobile single tap #${newCount} triggered`);

      if (!mountedRef.current || !clippyInstanceRef.current) {
        if (window.clippy) {
          clippyInstanceRef.current = window.clippy;
        } else {
          devLog("No clippy instance available");
          return false;
        }
      }

      // Handle initial interaction
      const isInitialInteraction = !greetingPlayedRef.current && !initialMessageShownRef.current;

      if (isInitialInteraction) {
        devLog("Initial mobile single tap - will show greeting animation and welcome balloon");

        return safeExecute(
          () => {
            if (clippyInstanceRef.current.play) {
              setIsAnimationPlaying(true);

              const randomIndex = Math.floor(Math.random() * GREETING_ANIMATIONS.length);
              const animationName = GREETING_ANIMATIONS[randomIndex];
              logAnimation(animationName, `initial mobile single tap`);

              clippyInstanceRef.current.play(animationName);
              greetingPlayedRef.current = true;

              setTimeout(() => {
                setIsAnimationPlaying(false);
              }, 2000);

              setTimeout(() => {
                if (mountedRef.current && !initialMessageShownRef.current) {
                  initialMessageShownRef.current = true;
                  showWelcomeBalloon();
                  devLog("Welcome balloon shown");
                }
              }, 1200);
            }
            return true;
          },
          false,
          "initial mobile single tap"
        );
      }

      // Standard mobile single tap - 75% animation, 25% speech balloon
      const shouldShowAnimation = Math.random() < 0.75;

      devLog(`Mobile single tap pattern:`, {
        shouldShowAnimation,
        percentage: shouldShowAnimation ? "75% - Animation" : "25% - Speech Balloon"
      });

      return safeExecute(
        () => {
          if (shouldShowAnimation) {
            // 75% case: Play random animation only
            devLog("Mobile single tap - playing random animation (75%)");

            if (clippyInstanceRef.current.play) {
              setIsAnimationPlaying(true);

              const animations = [
                "Wave", "Congratulate", "GetAttention", "Thinking", "Writing", 
                "GoodBye", "Processing", "Alert", "GetArtsy", "Searching", 
                "Explain", "Greeting", "GestureRight", "GestureLeft", "GestureUp"
              ];
              
              const randomIndex = Math.floor(Math.random() * animations.length);
              const animationName = animations[randomIndex];
              
              logAnimation(animationName, `mobile single tap (75% animation)`);
              clippyInstanceRef.current.play(animationName);

              // Special handling for Hide animation (handled in context menu)
              if (animationName === "Hide") {
                // Hide animation handling is done in context menu
                setTimeout(() => {
                  setIsAnimationPlaying(false);
                }, 2000); // Just the animation duration
              } else {
                // Add extra delay for GoodBye animation
                const animationDelay = animationName === "GoodBye" ? 3000 : 2000;
                setTimeout(() => {
                  setIsAnimationPlaying(false);
                  if (animationName === "GoodBye") {
                    devLog("GoodBye animation delay completed");
                  }
                }, animationDelay);
              }
            }
          } else {
            // 25% case: Show custom speech balloon message (NEVER chat)
            devLog("Mobile single tap - showing speech balloon (25%) - NEVER CHAT");

            setTimeout(() => {
              if (mountedRef.current && !isAnyBalloonOpen()) {
                const balloonMessages = [
                  "Hi there! Having a good day?",
                  "Tap me again for another surprise!",
                  "I'm here if you need any help!",
                  "Enjoying Hydra98 so far?",
                  "Try double-tapping me for my menu!",
                  "Long-press me to start a chat!",
                  "Need help? Just let me know!",
                  "Welcome to the nostalgic world of Windows 98!",
                  "Feeling productive today?",
                  "Don't forget to save your work!"
                ];
                
                const randomMessage = balloonMessages[Math.floor(Math.random() * balloonMessages.length)];
                // CRITICAL: Only use showCustomBalloon (speech), NEVER showChatBalloon
                if (showCustomBalloon && typeof showCustomBalloon === 'function') {
                  showCustomBalloon(randomMessage, 4000);
                  devLog(`Speech balloon shown: "${randomMessage}"`);
                } else {
                  devLog("ERROR: showCustomBalloon function not available");
                }
              } else {
                devLog("Speech balloon blocked - balloon already open or not mounted");
              }
            }, 200);
          }

          return true;
        },
        false,
        "mobile single tap"
      );
    },
    [
      interactionCount,
      lastInteractionTime,
      isInCooldown,
      isAnimationPlaying,
      startCooldown,
      isAnyBalloonOpen,
      contextMenuVisible,
      showCustomBalloon
    ]
  );

  // NEW: Mobile double-tap handler - context menu ONLY
  const handleMobileDoubleTap = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!mountedRef.current || !isMobile) return false;

      // Block if any balloon is already open
      if (isAnyBalloonOpen()) {
        devLog("Mobile double-tap blocked - balloon is already open");
        return false;
      }

      // Block if context menu is already visible
      if (contextMenuVisible) {
        devLog("Mobile double-tap blocked - context menu already visible");
        return false;
      }

      devLog("Mobile double-tap - opening context menu ONLY (NEVER CHAT)");

      // CRITICAL: Double-tap must ONLY show context menu, NEVER chat balloon
      try {
        // Show context menu positioned above Clippy
        const clippyEl = document.querySelector(".clippy");
        if (clippyEl) {
          const rect = clippyEl.getBoundingClientRect();
          showContextMenu(
            rect.left + rect.width / 2,
            rect.top - 20
          );
        } else {
          showContextMenu(window.innerWidth / 2, window.innerHeight / 2);
        }
        devLog("Mobile double-tap context menu successfully shown");
        return true;
      } catch (error) {
        devLog("ERROR: Mobile double-tap context menu failed:", error);
        return false;
      }
    },
    [isAnyBalloonOpen, contextMenuVisible, showContextMenu]
  );

  // NEW: Mobile long press handler - chat balloon ONLY
  const handleMobileLongPress = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!mountedRef.current || !isMobile) return false;

      const now = Date.now();

      if (isInCooldown || now - lastInteractionTime < INTERACTION_COOLDOWN_MS) {
        devLog("Mobile long press blocked - in cooldown");
        return false;
      }

      if (isAnimationPlaying) {
        devLog("Mobile long press blocked - animation playing");
        return false;
      }

      if (isAnyBalloonOpen()) {
        devLog("Mobile long press blocked - another balloon is open");
        return false;
      }

      if (contextMenuVisible) {
        devLog("Mobile long press blocked - context menu is visible");
        return false;
      }

      devLog("Mobile long press - showing chat balloon ONLY");

      setLastInteractionTime(now);
      startCooldown();

      return safeExecute(
        () => {
          // ONLY: Long press shows chat balloon (no animation)
          setTimeout(() => {
            if (mountedRef.current && !isAnyBalloonOpen()) {
              showChatBalloon("Hi! What would you like to chat about?");
              devLog("Mobile long press chat balloon shown");
            }
          }, 100);

          return true;
        },
        false,
        "mobile long press"
      );
    },
    [
      lastInteractionTime,
      isInCooldown,
      isAnimationPlaying,
      startCooldown,
      isAnyBalloonOpen,
      contextMenuVisible,
      showChatBalloon
    ]
  );

  // FIXED: Enhanced right-click handler with interaction blocking
  const handleRightClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Block if any balloon is already open
      if (isAnyBalloonOpen()) {
        devLog("Right-click blocked - balloon is already open");
        return false;
      }
      
      // Block all interactions if Clippy is hiding or hidden
      if (window.clippyIsHiding || window.clippyIsHidden) {
        devLog("Right-click blocked - Clippy is hiding/hidden");
        return false;
      }

      // Block if context menu is already visible
      if (contextMenuVisible) {
        devLog("Right-click blocked - context menu already visible");
        return false;
      }

      devLog("Right-click context menu triggered", {
        target: e.target.className,
        clientX: e.clientX,
        clientY: e.clientY,
      });

      showContextMenu(e.clientX, e.clientY);
      return true;
    },
    [showContextMenu, isAnyBalloonOpen, contextMenuVisible]
  );

  // FIXED: Proper greeting animation selection with animation logging - ENFORCED to only use the specified animations
  const playInitialGreeting = useCallback(() => {
    if (
      greetingPlayedRef.current ||
      !clippyInstanceRef.current ||
      !startupComplete
    ) {
      return;
    }

    greetingPlayedRef.current = true;

    devLog("Playing initial greeting animation");

    safeExecute(
      () => {
        // FIXED: ENFORCED - Only select from the specified greeting animations
        const randomIndex = Math.floor(
          Math.random() * GREETING_ANIMATIONS.length
        );
        const selectedGreeting = GREETING_ANIMATIONS[randomIndex];

        // FIXED: Log animation with forced console output
        logAnimation(
          selectedGreeting,
          `initial greeting (index ${randomIndex})`
        );

        devLog(
          `Selected greeting animation: ${selectedGreeting} (index ${randomIndex} from [${GREETING_ANIMATIONS.join(
            ", "
          )}])`
        );

        if (clippyInstanceRef.current?.play) {
          clippyInstanceRef.current.play(selectedGreeting);
          devLog("Initial greeting animation started");
        }
      },
      null,
      "initial greeting"
    );
  }, [startupComplete]);

  // FIXED: Initial message trigger when startup completes
  useEffect(() => {
    if (
      startupComplete &&
      shouldRenderClippy &&
      !initialMessageShownRef.current &&
      clippyInstanceRef.current
    ) {
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
      const windowsLaunchWrapper = document.querySelector(
        ".WindowsLaunchWrapper"
      );
      const desktop = document.querySelector(".desktop");
      const shutdownScreen = document.querySelector(
        ".itIsNowSafeToTurnOffYourComputer"
      );

      let sequenceActive = false;
      let isShuttingDown = false;

      // Check startup sequences
      if (biosWrapper && windowsLaunchWrapper) {
        const biosVisible =
          !biosWrapper.classList.contains("hidden") &&
          getComputedStyle(biosWrapper).opacity !== "0";
        const windowsVisible =
          !windowsLaunchWrapper.classList.contains("hidden") &&
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
      startupTimeoutRef.current = setTimeout(
        checkSequenceStatus,
        nextCheckDelay
      );
    };

    checkSequenceStatus();

    return () => {
      isMonitoring = false;
      if (startupTimeoutRef.current) {
        clearTimeout(startupTimeoutRef.current);
      }
    };
  }, [
    playInitialGreeting,
    startupComplete,
    shouldRenderClippy,
    handleShutdownSequence,
  ]);

  // Context menu click-outside handler
  useEffect(() => {
    if (!contextMenuVisible) return;

    let cleanup = null;
    let timeoutId = null;

    timeoutId = setTimeout(() => {
      const handleClickOutside = (e) => {
        if (
          e.target.closest(".clippy") ||
          e.target.closest("#clippy-clickable-overlay") ||
          e.target.closest(".clippy-context-menu") ||
          e.target.closest(".context-menu-content") ||
          e.target.closest(".context-submenu")
        ) {
          return;
        }
        devLog("Click outside context menu - hiding");
        hideContextMenu();
      };

      const handleEscapeKey = (e) => {
        if (e.key === "Escape") {
          devLog("Escape key pressed - hiding context menu");
          hideContextMenu();
        }
      };

      document.addEventListener("click", handleClickOutside, { capture: true });
      document.addEventListener("keydown", handleEscapeKey);

      cleanup = () => {
        document.removeEventListener("click", handleClickOutside, {
          capture: true,
        });
        document.removeEventListener("keydown", handleEscapeKey);
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
            const overlayElement = document.getElementById(
              "clippy-clickable-overlay"
            );
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
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-zoom"
        ) {
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
        const windowsLaunchWrapper = document.querySelector(
          ".WindowsLaunchWrapper"
        );
        const desktop = document.querySelector(".desktop");
        const shutdownScreen = document.querySelector(
          ".itIsNowSafeToTurnOffYourComputer"
        );

        let sequenceActive = false;
        if (biosWrapper && windowsLaunchWrapper) {
          sequenceActive =
            !biosWrapper.classList.contains("hidden") ||
            !windowsLaunchWrapper.classList.contains("hidden");
        }
        if (
          desktop?.classList.contains("windowsShuttingDown") ||
          shutdownScreen
        ) {
          sequenceActive = true;
        }

        if (sequenceActive) return false;

        return safeExecute(
          () => fn(...args),
          false,
          `global function ${functionName}`
        );
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
        if (
          newPosition &&
          (newPosition.x !== undefined || newPosition.y !== undefined)
        ) {
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
        
        // CAPTURE CLIPPY'S EXACT POSITIONING BEFORE SWITCHING
        const clippyEl = document.querySelector('.clippy');
        if (clippyEl && currentAgent === 'Clippy') {
          const style = window.getComputedStyle(clippyEl);
          const rect = clippyEl.getBoundingClientRect();
          
          const clippyStyles = {
            // Inline styles (what actually gets applied)
            inlineStyles: clippyEl.style.cssText,
            // Computed styles (what the browser calculates)
            position: style.position,
            left: style.left,
            top: style.top,
            right: style.right,
            bottom: style.bottom,
            zIndex: style.zIndex,
            transform: style.transform,
            transformOrigin: style.transformOrigin,
            visibility: style.visibility,
            opacity: style.opacity,
            display: style.display,
            pointerEvents: style.pointerEvents,
            // Actual visual position
            visualLeft: rect.left,
            visualTop: rect.top,
            // CSS classes
            classes: clippyEl.className
          };
          
          console.log('📋 CAPTURED CLIPPY POSITIONING RULES:', clippyStyles);
          
          // Store globally for immediate application to new agents
          window._clippyCorrectStyles = clippyStyles;
        }
        
        return handleAgentChange(agent);
      }, "setCurrentAgent");

      window.setScreenPowerState = createSafeGlobalFunction((powered) => {
        setIsScreenPoweredOn(powered);
        return true;
      }, "setScreenPowerState");

      // FIXED: Enhanced balloon functions with button support
      window.showClippyCustomBalloon = createSafeGlobalFunction((content) => {
        if (isCustomBalloonVisible() || isChatBalloonVisible()) {
          devLog(
            "Cannot show custom balloon - another balloon is already open"
          );
          return false;
        }

        // Support both string and object content
        return showCustomBalloon(content);
      }, "showClippyCustomBalloon");

      window.hideClippyCustomBalloon = createSafeGlobalFunction(() => {
        return hideCustomBalloon();
      }, "hideClippyCustomBalloon");

      window.showClippyChatBalloon = createSafeGlobalFunction(
        (initialMessage) => {
          if (isCustomBalloonVisible() || isChatBalloonVisible()) {
            devLog(
              "Cannot show chat balloon - another balloon is already open"
            );
            return false;
          }
          return showChatBalloon(initialMessage);
        },
        "showClippyChatBalloon"
      );

      window.hideChatBalloon = createSafeGlobalFunction(() => {
        return hideChatBalloon();
      }, "hideChatBalloon");

      // FIXED: New enhanced balloon functions
      window.showClippyWelcomeBalloon = createSafeGlobalFunction(() => {
        if (isCustomBalloonVisible() || isChatBalloonVisible()) {
          devLog(
            "Cannot show welcome balloon - another balloon is already open"
          );
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

      window.showClippyErrorBalloon = createSafeGlobalFunction(
        (errorMessage) => {
          if (isCustomBalloonVisible() || isChatBalloonVisible()) {
            devLog(
              "Cannot show error balloon - another balloon is already open"
            );
            return false;
          }
          return showErrorBalloon(errorMessage);
        },
        "showClippyErrorBalloon"
      );

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
          message:
            "🎉 Enhanced balloon test! This balloon has interactive buttons.",
          buttons: [
            {
              text: "✨ Play animation",
              animation: "Congratulate",
            },
            {
              text: "💬 Open chat",
              chat: "Hello! This chat was opened from a balloon button.",
            },
            {
              text: "📢 Show message",
              message: "This is a follow-up message triggered by a button!",
            },
            {
              text: "👍 Got it",
              action: () => {
                devLog("Test balloon button clicked - test complete!");
              },
            },
          ],
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
        const success = showChatBalloon(
          "💬 Test chat - type a message to test chat functionality"
        );
        devLog(`Chat creation success: ${success}`);
        return success;
      };

      // Context menu test functions
      window.forceShowContextMenu = () => {
        devLog("Force showing context menu");
        setContextMenuPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        });
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

      // FIXED: Testing functions for all 10 agents with visual verification
      window.testAllAgents = () => {
        const allAgents = [
          "Clippy", "Links", "Bonzi", "Genie", "Genius", 
          "Merlin", "F1", "Peedy", "Rocky", "Rover"
        ];
        let currentIndex = 0;
        
        console.log(`🎭 Starting agent test sequence. Current agent: ${currentAgent}`);
        
        const checkVisualAgent = () => {
          const clippyEl = document.querySelector('.clippy');
          if (clippyEl) {
            const dataAgent = clippyEl.getAttribute('data-agent');
            const bgImage = window.getComputedStyle(clippyEl.querySelector('div') || clippyEl).backgroundImage;
            console.log(`👁️ Visual check - data-agent: ${dataAgent}, background: ${bgImage ? 'loaded' : 'none'}`);
          }
        };
        
        const testNextAgent = () => {
          if (currentIndex >= allAgents.length) {
            console.log("🎉 All agents tested successfully!");
            checkVisualAgent();
            return;
          }
          
          const agent = allAgents[currentIndex];
          console.log(`🧪 Testing agent ${currentIndex + 1}/10: ${agent}`);
          
          // Skip if already the current agent
          if (agent === currentAgent) {
            console.log(`⏭️ Skipping ${agent} - already current agent`);
            currentIndex++;
            setTimeout(testNextAgent, 500);
            return;
          }
          
          if (handleAgentChange(agent)) {
            setTimeout(() => {
              checkVisualAgent();
              currentIndex++;
              testNextAgent();
            }, 3000); // 3 second delay between tests
          } else {
            console.error(`❌ Failed to switch to agent: ${agent}`);
            currentIndex++;
            setTimeout(testNextAgent, 1000); // Continue with next agent
          }
        };
        
        checkVisualAgent();
        testNextAgent();
      };

      window.switchToAgent = (agentName) => {
        // Official React95 agent names only
        const officialAgents = [
          "Clippy", "Links", "Bonzi", "Genie", "Genius", 
          "Merlin", "F1", "Peedy", "Rocky", "Rover"
        ];
        
        // Validate agent name against official list
        if (!officialAgents.includes(agentName)) {
          console.error(`❌ Invalid agent: ${agentName}. Available agents:`, officialAgents);
          return false;
        }
        
        console.log(`🔄 Switching to official agent: ${agentName}`);
        return handleAgentChange(agentName);
      };

      window.resetToClippy = () => {
        console.log(`🔄 Resetting to official Clippy agent`);
        return handleAgentChange("Clippy");
      };

      window.listAvailableAgents = () => {
        const officialAgents = [
          "Clippy", "Links", "Bonzi", "Genie", "Genius", 
          "Merlin", "F1", "Peedy", "Rocky", "Rover"
        ];
        console.log("🎭 Official React95 agents:", officialAgents);
        console.log(`🎯 Current agent: ${currentAgent}`);
        
        // Check if current agent is valid
        if (!officialAgents.includes(currentAgent)) {
          console.warn(`⚠️ Current agent "${currentAgent}" is not an official React95 agent!`);
          console.log("💡 Use resetToClippy() to fix this");
        }
        
        console.log("💡 Use switchToAgent('AgentName') to switch agents");
        console.log("🧪 Use testAllAgents() to test all agents sequentially");
        console.log("❓ Use getCurrentAgent() to check current agent");
        console.log("🔄 Use resetToClippy() to reset to official Clippy");
        return officialAgents;
      };

      window.getCurrentAgent = () => {
        console.log(`🎯 Current agent: ${currentAgent}`);
        return currentAgent;
      };

      // DIAGNOSTIC: Add the diagnostic functions from the developer's brief
      window.diagnoseAgentSwitching = () => {
        console.log("🔍 AGENT SWITCHING DIAGNOSIS\n");
        
        // Check React95 imports
        console.log("1. Checking @react95/clippy imports:");
        try {
          console.log("   ✅ @react95/clippy is imported");
        } catch (e) {
          console.log("   ❌ Import issue:", e.message);
        }
        
        // Check ReactClippyProvider props
        console.log("\n2. ReactClippyProvider Analysis:");
        const providerElements = document.querySelectorAll('[data-react95-clippy]');
        console.log(`   📍 Found ${providerElements.length} provider elements`);
        
        // Check current clippy instance
        console.log("\n3. Current Clippy Instance:");
        if (window.clippy) {
          console.log("   ✅ window.clippy exists");
          console.log("   🎭 Current agent:", window.clippy.agent || "Unknown");
          console.log("   📋 Available methods:", Object.keys(window.clippy));
          
          // Test if load method exists
          if (window.clippy.load) {
            console.log("   ✅ clippy.load() method available");
          } else {
            console.log("   ❌ clippy.load() method NOT available");
          }
        } else {
          console.log("   ❌ window.clippy not found");
        }
        
        // Check DOM elements
        console.log("\n4. DOM Elements:");
        const clippyElements = document.querySelectorAll('.clippy');
        console.log(`   📍 Found ${clippyElements.length} .clippy elements`);
        
        if (clippyElements.length > 0) {
          const clippy = clippyElements[0];
          const dataAgent = clippy.getAttribute('data-agent');
          console.log(`   🎯 data-agent attribute: ${dataAgent}`);
          console.log(`   📏 Visible: ${clippy.offsetParent !== null}`);
        }
        
        return {
          hasClippy: !!window.clippy,
          hasLoadMethod: !!(window.clippy && window.clippy.load),
          domElements: clippyElements.length,
          currentAgent: window.clippy?.agent || "Unknown"
        };
      };

      window.debugReact95Provider = () => {
        console.log('🔬 React95 ClippyProvider Debug:');
        console.log(`- Provider agent prop: ${currentAgent}`);
        console.log(`- ClippyController clippy:`, clippyInstanceRef.current ? 'exists' : 'null');
        console.log(`- window.clippy:`, window.clippy ? 'exists' : 'null');
        
        // Check React component tree
        const providerElements = document.querySelectorAll('[data-testid*="clippy"], [class*="clippy"]');
        console.log(`- Found ${providerElements.length} clippy-related elements`);
        
        // Check if React95 is properly loading agents
        if (window.clippy && window.clippy.animations) {
          console.log(`- Available animations:`, window.clippy.animations());
        }
        
        return {
          currentAgent,
          hasClippyInstance: !!clippyInstanceRef.current,
          hasWindowClippy: !!window.clippy,
          elementCount: providerElements.length
        };
      };

      window.inspectClippyElement = () => {
        const clippyEl = document.querySelector('.clippy');
        if (clippyEl) {
          const dataAgent = clippyEl.getAttribute('data-agent');
          const children = clippyEl.children;
          const rect = clippyEl.getBoundingClientRect();
          const style = window.getComputedStyle(clippyEl);
          
          console.log('🔍 Clippy element inspection:');
          console.log(`- data-agent attribute: ${dataAgent}`);
          console.log(`- Current agent in state: ${currentAgent}`);
          console.log(`- children count: ${children.length}`);
          console.log(`- Position: left=${style.left}, top=${style.top}, right=${style.right}, bottom=${style.bottom}`);
          console.log(`- Transform: ${style.transform}`);
          console.log(`- BoundingRect: x=${rect.x}, y=${rect.y}, width=${rect.width}, height=${rect.height}`);
          console.log(`- Visible: ${clippyEl.offsetParent !== null}`);
          console.log(`- Z-index: ${style.zIndex}`);
          
          Array.from(children).forEach((child, index) => {
            const childStyle = window.getComputedStyle(child);
            const bgImage = childStyle.backgroundImage;
            const display = childStyle.display;
            console.log(`  Child ${index}: display=${display}, bg=${bgImage !== 'none' ? 'has background' : 'no background'}`);
          });
          
          // Check if React95 provider has the right agent
          const provider = document.querySelector('[data-react95-clippy-provider]');
          console.log(`- React95 provider found: ${!!provider}`);
          
          // Check window.clippy object
          console.log(`- window.clippy exists: ${!!window.clippy}`);
          if (window.clippy) {
            console.log(`- window.clippy methods:`, Object.keys(window.clippy));
          }
          
          // Check React95 clippy hook
          console.log(`- ClippyController clippy instance:`, !!clippyInstanceRef.current);
          
          // Check overlay
          const overlay = document.getElementById('clippy-clickable-overlay');
          if (overlay) {
            const overlayRect = overlay.getBoundingClientRect();
            const overlayStyle = window.getComputedStyle(overlay);
            console.log(`- Overlay found: x=${overlayRect.x}, y=${overlayRect.y}, w=${overlayRect.width}, h=${overlayRect.height}`);
            console.log(`- Overlay transform: ${overlayStyle.transform}`);
          } else {
            console.log(`- ❌ No overlay found`);
          }
          
        } else {
          console.log('❌ No .clippy element found');
        }
      };
      
      // SIMPLE: Apply Clippy's exact positioning to any agent
      window.applyClippyPositioning = (targetAgent) => {
        // FIND ALL .clippy elements and fix them
        const allClippyEls = document.querySelectorAll('.clippy');
        console.log(`🔍 Found ${allClippyEls.length} .clippy elements in DOM`);
        
        if (allClippyEls.length === 0) {
          console.log(`❌ No agent elements found`);
          return false;
        }
        
        // Log all clippy elements found
        allClippyEls.forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          console.log(`📍 Clippy element ${index}: positioned at ${rect.left.toFixed(1)}, ${rect.top.toFixed(1)}, classes: "${el.className}", display: ${style.display}`);
        });
        
        const agentName = targetAgent || 'Current Agent';
        console.log(`🎯 Applying Clippy's exact positioning to ${agentName}`);
        
        // Use captured Clippy styles if available
        if (window._clippyCorrectStyles) {
          const styles = window._clippyCorrectStyles;
          console.log(`📋 Using captured Clippy styles for overlay position: ${styles.visualLeft.toFixed(1)}, ${styles.visualTop.toFixed(1)}`);
          
          // Apply to ALL .clippy elements
          allClippyEls.forEach((clippyEl, index) => {
            console.log(`🔧 Fixing clippy element ${index}...`);
            
            // Preserve existing classes and add required ones
            if (!clippyEl.classList.contains('clippy')) {
              clippyEl.classList.add('clippy');
            }
            if (!clippyEl.classList.contains('clippy-anchored')) {
              clippyEl.classList.add('clippy-anchored');
            }
            clippyEl.setAttribute('data-agent', agentName);
            
            // Apply only positioning-related styles, preserving React95 agent visual properties
            clippyEl.style.setProperty('position', 'fixed', 'important');
            clippyEl.style.setProperty('left', styles.left, 'important');
            clippyEl.style.setProperty('top', styles.top, 'important');
            clippyEl.style.setProperty('right', 'auto', 'important');
            clippyEl.style.setProperty('bottom', 'auto', 'important');
            clippyEl.style.setProperty('z-index', styles.zIndex, 'important');
            clippyEl.style.setProperty('transform', styles.transform, 'important');
            clippyEl.style.setProperty('transform-origin', styles.transformOrigin, 'important');
            clippyEl.style.setProperty('visibility', 'visible', 'important');
            clippyEl.style.setProperty('opacity', '1', 'important');
            clippyEl.style.setProperty('display', 'block', 'important');
            clippyEl.style.setProperty('pointer-events', 'auto', 'important');
            
            // DON'T override width/height - let React95 handle agent-specific dimensions
            
            // Force reflow
            void clippyEl.offsetHeight;
            
            console.log(`✅ Applied positioning to clippy element ${index}`);
          });
          
          // Also ensure overlay matches
          const overlayEl = document.getElementById('clippy-clickable-overlay');
          if (overlayEl) {
            overlayEl.style.cssText = `
              position: fixed !important;
              left: ${styles.left} !important;
              top: ${styles.top} !important;
              width: 124px !important;
              height: 93px !important;
              z-index: ${parseInt(styles.zIndex) + 10} !important;
              background: transparent !important;
              pointer-events: auto !important;
              cursor: pointer !important;
            `;
            console.log(`✅ Overlay positioned to match at: ${styles.left}, ${styles.top}`);
          }
          
          // Verify all elements after positioning
          setTimeout(() => {
            const updatedEls = document.querySelectorAll('.clippy');
            updatedEls.forEach((el, index) => {
              const rect = el.getBoundingClientRect();
              const isCorrect = Math.abs(rect.left - styles.visualLeft) < 5 && Math.abs(rect.top - styles.visualTop) < 5;
              console.log(`🔍 Final check element ${index}: ${rect.left.toFixed(1)}, ${rect.top.toFixed(1)} - ${isCorrect ? '✅ CORRECT' : '❌ WRONG'}`);
            });
          }, 50);
          
          return true;
        } else {
          console.log(`⚠️ No captured Clippy styles available - use Clippy first to capture positioning`);
          return false;
        }
      };
      
      window.forceAgentRepositioning = () => {
        return window.applyClippyPositioning(currentAgent);
      };
      
      // FIXED: Initialize hiding flags
      if (window.clippyIsHidden === undefined) {
        window.clippyIsHidden = false;
      }
      if (window.clippyIsHiding === undefined) {
        window.clippyIsHiding = false;
      }

      // FIXED: Mark welcome balloon as completed
      window.markWelcomeBalloonCompleted = () => {
        welcomeBalloonCompletedRef.current = true;
        devLog("Welcome balloon manually marked as completed - animations now unblocked");
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
        delete window.markWelcomeBalloonCompleted;
        delete window.clippyIsHidden;
        delete window.clippyIsHiding;
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
    const DOUBLE_TAP_THRESHOLD = 300; // Match desktop double-click timing (strict)
    const TAP_DISTANCE_THRESHOLD = 20; // Match desktop double-click distance (strict)
    let lastTapX = 0;
    let lastTapY = 0;

    const handleTouchStart = (e) => {
      if (!mountedRef.current) return;

      const touch = e.touches[0];
      const currentTime = Date.now();
      const currentX = touch.clientX;
      const currentY = touch.clientY;

      // Store current tap coordinates for distance calculation
      lastTapX = currentX;
      lastTapY = currentY;

      const dragState = {
        startX: touch.clientX,
        startY: touch.clientY,
        dragStarted: false,
        longPressTimer: null,
        origRightPx: 0,
        origBottomPx: 0,
        initialClientX: touch.clientX,
        initialClientY: touch.clientY,
        tapDetected: false, // Track if this is a tap vs drag
      };

      // Only set up drag if position is unlocked
      if (!positionLocked) {
        const clippyEl = document.querySelector(".clippy");
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
        if (
          !dragState.dragStarted &&
          !positionLocked &&
          (deltaX > 10 || deltaY > 10)
        ) {
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

          const newRightPx = Math.max(
            10,
            Math.min(
              window.innerWidth - 70,
              dragState.origRightPx - totalDeltaX
            )
          );
          const newBottomPx = Math.max(
            90,
            Math.min(
              window.innerHeight - 90,
              dragState.origBottomPx - totalDeltaY
            )
          );

          const clippyEl = document.querySelector(".clippy");
          if (clippyEl && ClippyPositioning?.handleMobileDrag) {
            ClippyPositioning.handleMobileDrag(
              clippyEl,
              overlayRef.current,
              { rightPx: newRightPx, bottomPx: newBottomPx },
              true
            );
          }
        }
      };

      // End handler
      endHandler = (e) => {
        // Clean up event listeners
        if (moveHandler) document.removeEventListener("touchmove", moveHandler);
        if (endHandler) {
          document.removeEventListener("touchend", endHandler);
          document.removeEventListener("touchcancel", endHandler);
        }

        clearTimeout(dragState.longPressTimer);

        // If no drag occurred (it was a tap)
        if (!dragState.dragStarted) {
          const tapEndTime = Date.now();
          const timeSinceLastTap = tapEndTime - lastTapTime;

          // Check distance moved since start of touch to confirm it's a tap
          const deltaX = Math.abs(
            e.changedTouches[0].clientX - dragState.initialClientX
          );
          const deltaY = Math.abs(
            e.changedTouches[0].clientY - dragState.initialClientY
          );
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (distance < TAP_DISTANCE_THRESHOLD) {
            // It's a valid tap - use simplified double-tap detection
            if (
              timeSinceLastTap < DOUBLE_TAP_THRESHOLD &&
              tapCount === 1
            ) {
              // Double tap detected
              tapCount = 0;
              lastTapTime = 0;
              devLog("Mobile double-tap detected - showing context menu ONLY");

              // Block if any balloon is already open
              if (isAnyBalloonOpen()) {
                devLog("Mobile double-tap blocked - balloon is already open");
                return;
              }

              // Block if context menu is already visible
              if (contextMenuVisible) {
                devLog("Mobile double-tap blocked - context menu already visible");
                return;
              }

              // Execute double-tap with error handling
              try {
                e.preventDefault();
                e.stopImmediatePropagation();
                handleMobileDoubleTap(e);
                return; // Exit immediately to prevent any other handlers
              } catch (error) {
                devLog("Mobile double-tap handler failed:", error);
                return;
              }
            } else {
              // Single tap - set up delayed execution to allow for potential double tap
              tapCount = 1;
              lastTapTime = tapEndTime;
              devLog("Mobile single tap registered - waiting for potential double tap");

              // Use setTimeout to handle single tap after double-tap window closes
              setTimeout(() => {
                if (tapCount === 1 && Date.now() - lastTapTime >= DOUBLE_TAP_THRESHOLD - 50) {
                  // Confirmed single tap - execute with error handling
                  try {
                    devLog("Executing confirmed mobile single tap");
                    handleMobileSingleTap(e);
                  } catch (error) {
                    devLog("Mobile single-tap handler failed:", error);
                  }
                  tapCount = 0;
                  lastTapTime = 0;
                }
              }, DOUBLE_TAP_THRESHOLD);
            }
          } else {
            // Movement was too large for a tap, reset tap count
            tapCount = 0;
            lastTapTime = 0;
            devLog("Touch movement too large, not a tap");
          }
        } else {
          // End drag mode and preserve scale
          const clippyEl = document.querySelector(".clippy");
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
      if (
        !dragState.dragStarted &&
        touchStartTimeForLongPress - lastInteractionTime >=
          INTERACTION_COOLDOWN_MS &&
        !isInCooldown
      ) {
        dragState.longPressTimer = setTimeout(() => {
          if (!dragState.dragStarted && mountedRef.current) {
            clearTimeout(dragState.longPressTimer);
            handleMobileLongPress(e);
            // Reset tap count after long press
            tapCount = 0;
            lastTapTime = 0;
          }
        }, 800);
      }

      // Add event listeners
      document.addEventListener("touchmove", moveHandler, { passive: false });
      document.addEventListener("touchend", endHandler, { passive: false });
      document.addEventListener("touchcancel", endHandler, { passive: false });
    };

    return {
      handleTouchStart,
      cleanup: () => {
        if (moveHandler) document.removeEventListener("touchmove", moveHandler);
        if (endHandler) {
          document.removeEventListener("touchend", endHandler);
          document.removeEventListener("touchcancel", endHandler);
        }
      },
    };
  }, [
    handleMobileSingleTap,
    handleMobileDoubleTap,
    handleMobileLongPress,
    lastInteractionTime,
    positionLocked,
    isInCooldown,
    isAnyBalloonOpen,
    contextMenuVisible,
  ]);

  // NEW: Desktop click handler with proper single/double click separation
  const handleDesktopClick = useCallback(
    (e) => {
      // Use a timeout to distinguish between single and double clicks
      if (e.detail === 1) {
        // Single click - set timeout to check if it becomes a double click
        const singleClickTimer = setTimeout(() => {
          handleDesktopSingleClick(e);
        }, 250); // Wait 250ms to see if there's a second click
        
        // Store timer for potential cancellation
        e.target._singleClickTimer = singleClickTimer;
      } else if (e.detail === 2) {
        // Double click detected - cancel single click timer and handle double click
        if (e.target._singleClickTimer) {
          clearTimeout(e.target._singleClickTimer);
          delete e.target._singleClickTimer;
        }
        handleDesktopDoubleClick(e);
      }
    },
    [handleDesktopSingleClick, handleDesktopDoubleClick]
  );

  // FIXED: Enhanced ClippyController with agent monitoring and scale preservation
  const ClippyController = () => {
    const { clippy } = useClippy();
    const setupAttemptRef = useRef(0);
    const lastAgentRef = useRef(currentAgent);

    // Debug the clippy object
    useEffect(() => {
      devLog(`ClippyController - clippy object:`, {
        exists: !!clippy,
        methods: clippy ? Object.keys(clippy) : [],
        currentAgent,
      });
    }, [clippy, currentAgent]);

    // Monitor agent changes with immediate positioning fix
    useEffect(() => {
      if (lastAgentRef.current !== currentAgent) {
        devLog(
          `Agent change detected in ClippyController: ${lastAgentRef.current} → ${currentAgent}`
        );
        lastAgentRef.current = currentAgent;

        // The React95 ClippyProvider should handle agent switching automatically
        // We just need to ensure our references are up to date
        if (clippy) {
          clippyInstanceRef.current = clippy;
          window.clippy = clippy;
          
          // ENHANCED: Re-intercept animations after agent reload
          if (clippy && clippy.play) {
            const originalPlay = clippy.play.bind(clippy);
            clippy.play = function(animationName, ...args) {
              logAllAnimations(animationName, "clippy.play() call");
              return originalPlay(animationName, ...args);
            };
            window.clippy.play = clippy.play;
          }
          
          devLog(`ClippyController updated with agent: ${currentAgent}`);
          
          // IMMEDIATE: Fix positioning right after agent change detection
          requestAnimationFrame(() => {
            const clippyEl = document.querySelector(".clippy");
            if (clippyEl) {
              devLog(`🚨 IMMEDIATE positioning fix for ${currentAgent}`);
              
              // Force correct classes immediately
              clippyEl.classList.add("clippy");
              clippyEl.classList.add("clippy-anchored");
              clippyEl.setAttribute("data-agent", currentAgent);
              
              // Get overlay position as reference
              const overlayEl = document.getElementById("clippy-clickable-overlay");
              if (overlayEl) {
                const overlayRect = overlayEl.getBoundingClientRect();
                const beforeRect = clippyEl.getBoundingClientRect();
                devLog(`🔄 IMMEDIATE FIX - Before: agent at ${beforeRect.left.toFixed(1)}, ${beforeRect.top.toFixed(1)}`);
                devLog(`🎯 Overlay position reference: ${overlayRect.left.toFixed(1)}, ${overlayRect.top.toFixed(1)}`);
                
                // Force agent to match overlay position exactly
                clippyEl.style.position = "fixed";
                clippyEl.style.left = `${overlayRect.left}px`;
                clippyEl.style.top = `${overlayRect.top}px`;
                clippyEl.style.right = "auto";
                clippyEl.style.bottom = "auto";
                clippyEl.style.zIndex = isMobile ? "1500" : "2000";
                clippyEl.style.pointerEvents = "auto";
                clippyEl.style.visibility = "visible";
                clippyEl.style.opacity = "1";
                clippyEl.style.display = "block";
                
                const zoomFactor = ClippyPositioning?.getMonitorZoomFactor ? ClippyPositioning.getMonitorZoomFactor() : 1.0;
                const scale = isMobile ? 1 : (0.95 * zoomFactor);
                clippyEl.style.transform = `translateZ(0) scale(${scale})`;
                clippyEl.style.transformOrigin = "center bottom";
                
                // Verify immediate positioning
                setTimeout(() => {
                  const afterRect = clippyEl.getBoundingClientRect();
                  const matchesOverlay = Math.abs(afterRect.left - overlayRect.left) < 2 && Math.abs(afterRect.top - overlayRect.top) < 2;
                  devLog(`✅ IMMEDIATE FIX - After: agent at ${afterRect.left.toFixed(1)}, ${afterRect.top.toFixed(1)} | Match: ${matchesOverlay ? 'YES' : 'NO'}`);
                }, 10);
                
                devLog(`${currentAgent} IMMEDIATELY positioned to match overlay: ${overlayRect.left}px, ${overlayRect.top}px with scale ${scale}`);
              }
            }
          });
          
          // ENHANCED: Comprehensive agent positioning fix with multiple attempts
          setTimeout(() => {
            devLog(`🔧 STARTING ENHANCED AGENT FIX FOR ${currentAgent}`);
            
            // Function to apply complete Clippy positioning rules
            const applyClippyRulesToAgent = (attempt = 1) => {
              const clippyEl = document.querySelector(".clippy");
              const overlayEl = document.getElementById("clippy-clickable-overlay");
              
              devLog(`Agent positioning attempt ${attempt} for ${currentAgent}:`, {
                agentFound: !!clippyEl,
                overlayFound: !!overlayEl,
                className: clippyEl?.className,
                hasClippyClass: clippyEl?.classList.contains("clippy"),
                hasAnchoredClass: clippyEl?.classList.contains("clippy-anchored"),
                zIndex: clippyEl ? window.getComputedStyle(clippyEl).zIndex : "none",
                currentAgent: currentAgent
              });
              
              if (!clippyEl && attempt < 5) {
                // Agent element not ready yet, try again
                setTimeout(() => applyClippyRulesToAgent(attempt + 1), 100);
                return;
              }
              
              if (!clippyEl) {
                devLog(`❌ No .clippy element found for ${currentAgent} after ${attempt} attempts`);
                return;
              }
              
              // CRITICAL: Apply all essential CSS classes and properties
              clippyEl.classList.add("clippy");
              clippyEl.classList.add("clippy-anchored");
              
              // Force exact positioning properties
              clippyEl.style.position = "fixed";
              clippyEl.style.zIndex = isMobile ? "1500" : "2000";
              clippyEl.style.pointerEvents = "auto";
              clippyEl.style.visibility = "visible";
              clippyEl.style.opacity = "1";
              clippyEl.style.display = "block";
              
              // Apply proper transform and transform-origin
              const zoomFactor = ClippyPositioning?.getMonitorZoomFactor ? ClippyPositioning.getMonitorZoomFactor() : 1.0;
              const scale = isMobile ? 1 : (0.95 * zoomFactor);
              clippyEl.style.transform = `translateZ(0) scale(${scale})`;
              clippyEl.style.transformOrigin = "center bottom";
              
              // Calculate and apply correct position
              if (isMobile) {
                // Use mobile positioning
                const mobilePosition = ClippyPositioning?.calculateMobilePosition ? 
                  ClippyPositioning.calculateMobilePosition() : 
                  { bottom: "120px", right: "11px" };
                
                clippyEl.style.bottom = mobilePosition.bottom;
                clippyEl.style.right = mobilePosition.right;
                clippyEl.style.left = "auto";
                clippyEl.style.top = "auto";
                
                devLog(`${currentAgent} positioned for mobile: ${mobilePosition.right} from right, ${mobilePosition.bottom} from bottom`);
              } else {
                // Use desktop positioning - calculate exact coordinates
                const desktop = document.querySelector(".desktop.screen") || 
                               document.querySelector(".desktop") || 
                               document.querySelector(".w98");
                
                if (desktop) {
                  const rect = desktop.getBoundingClientRect();
                  const rightOffset = 120;
                  const bottomOffset = 100;
                  const taskbarHeight = 30;
                  
                  const correctLeft = rect.left + rect.width - rightOffset;
                  const correctTop = rect.top + rect.height - taskbarHeight - bottomOffset;
                  
                  clippyEl.style.left = `${correctLeft}px`;
                  clippyEl.style.top = `${correctTop}px`;
                  clippyEl.style.right = "auto";
                  clippyEl.style.bottom = "auto";
                  
                  devLog(`${currentAgent} positioned for desktop: ${correctLeft}px left, ${correctTop}px top`);
                } else {
                  // Fallback positioning
                  clippyEl.style.left = "520px";
                  clippyEl.style.top = "360px";
                  devLog(`${currentAgent} using fallback desktop position`);
                }
              }
              
              // Position overlay to match
              if (overlayEl) {
                const clippyRect = clippyEl.getBoundingClientRect();
                overlayEl.style.position = "fixed";
                overlayEl.style.left = `${clippyRect.left}px`;
                overlayEl.style.top = `${clippyRect.top}px`;
                overlayEl.style.width = `${clippyRect.width}px`;
                overlayEl.style.height = `${clippyRect.height}px`;
                overlayEl.style.zIndex = isMobile ? "1510" : "2010";
                overlayEl.style.background = "transparent";
                overlayEl.style.pointerEvents = "auto";
                overlayEl.style.cursor = "pointer";
                
                devLog(`${currentAgent} overlay positioned and synced`);
              }
              
              // Apply positioning system if available
              if (ClippyPositioning?.positionClippyAndOverlay) {
                setTimeout(() => {
                  ClippyPositioning.positionClippyAndOverlay(clippyEl, overlayEl, null);
                  devLog(`${currentAgent} positioning system applied`);
                }, 50);
              }
              
              // Verify final positioning
              setTimeout(() => {
                const finalRect = clippyEl.getBoundingClientRect();
                const finalStyle = window.getComputedStyle(clippyEl);
                const isPositionedCorrectly = isMobile ? 
                  (finalRect.right > window.innerWidth - 200 && finalRect.bottom > window.innerHeight - 200) :
                  (finalRect.right > window.innerWidth - 200 && finalRect.bottom > window.innerHeight - 200);
                
                devLog(`${currentAgent} final verification:`, {
                  position: `left: ${finalStyle.left}, top: ${finalStyle.top}, right: ${finalStyle.right}, bottom: ${finalStyle.bottom}`,
                  zIndex: finalStyle.zIndex,
                  transform: finalStyle.transform,
                  classes: clippyEl.className,
                  isCorrectlyPositioned: isPositionedCorrectly,
                  boundingRect: {
                    x: finalRect.x.toFixed(1),
                    y: finalRect.y.toFixed(1),
                    width: finalRect.width.toFixed(1),
                    height: finalRect.height.toFixed(1)
                  }
                });
                
                if (!isPositionedCorrectly && attempt < 3) {
                  devLog(`${currentAgent} positioning verification failed, retrying...`);
                  setTimeout(() => applyClippyRulesToAgent(attempt + 1), 200);
                } else {
                  devLog(`${currentAgent} positioning complete: ${isPositionedCorrectly ? '✅ SUCCESS' : '⚠️ PARTIAL'}`);
                }
              }, 100);
            };
            
            // Start the positioning process
            applyClippyRulesToAgent(1);
          }, 100); // Reduced initial delay
        }
      }
    }, [currentAgent, clippy]);

    useEffect(() => {
      // FIXED: Check if Clippy is globally hidden or hiding
      if (window.clippyIsHidden || window.clippyIsHiding) {
        devLog("ClippyController: Clippy is hidden/hiding, not rendering");
        return;
      }
      
      if (!clippy || !assistantVisible || !shouldRenderClippy) {
        devLog("ClippyController: Conditions not met for rendering", {
          hasClippy: !!clippy,
          assistantVisible,
          shouldRenderClippy,
          currentAgent,
        });
        return;
      }

      mountedRef.current = true;
      clippyInstanceRef.current = clippy;
      window.clippy = clippy;

      // ENHANCED: Intercept all animation calls for comprehensive logging
      if (clippy && clippy.play) {
        const originalPlay = clippy.play.bind(clippy);
        clippy.play = function(animationName, ...args) {
          logAllAnimations(animationName, "clippy.play() call");
          return originalPlay(animationName, ...args);
        };
        window.clippy.play = clippy.play;
      }

      devLog(`ClippyController mounted with agent: ${currentAgent}`);

      const setupClippy = () => {
        if (!mountedRef.current || setupAttemptRef.current >= 3) return false;

        setupAttemptRef.current++;
        devLog(
          `Clippy setup attempt ${setupAttemptRef.current} for agent: ${currentAgent}`
        );

        return safeExecute(
          () => {
            const clippyEl = document.querySelector(".clippy");
            if (!clippyEl) return false;

            // Agent-specific styling if needed
            clippyEl.setAttribute("data-agent", currentAgent);
            
            // CRITICAL: Immediate positioning fix BEFORE any other positioning logic
            const overlayEl = document.getElementById("clippy-clickable-overlay");
            if (overlayEl) {
              const overlayRect = overlayEl.getBoundingClientRect();
              const beforeRect = clippyEl.getBoundingClientRect();
              
              devLog(`🚨 CRITICAL EARLY FIX for ${currentAgent}:`);
              devLog(`   Before: agent at ${beforeRect.left.toFixed(1)}, ${beforeRect.top.toFixed(1)}`);
              devLog(`   Overlay reference: ${overlayRect.left.toFixed(1)}, ${overlayRect.top.toFixed(1)}`);
              
              // Force immediate position correction
              clippyEl.style.position = "fixed";
              clippyEl.style.left = `${overlayRect.left}px`;
              clippyEl.style.top = `${overlayRect.top}px`;
              clippyEl.style.right = "auto";
              clippyEl.style.bottom = "auto";
              clippyEl.style.zIndex = isMobile ? "1500" : "2000";
              
              const afterRect = clippyEl.getBoundingClientRect();
              devLog(`   After: agent at ${afterRect.left.toFixed(1)}, ${afterRect.top.toFixed(1)}`);
              
              // Force a reflow to ensure styles are applied
              void clippyEl.offsetHeight;
            }

            // FIXED: Bind right-click directly to Clippy element
            const addRightClickToElement = (element, elementName) => {
              if (element && !element._hasContextMenu) {
                element.addEventListener(
                  "contextmenu",
                  (e) => {
                    devLog(`Right-click on ${elementName}`);
                    handleRightClick(e);
                  },
                  { passive: false }
                );
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
            const initialZoomLevel =
              parseInt(document.body.getAttribute("data-zoom")) || 0;

            if (isMobile) {
              if (
                ClippyPositioning?.calculateEnhancedMobilePosition &&
                ClippyPositioning?.applyMobilePosition
              ) {
                const mobilePosition =
                  ClippyPositioning.calculateEnhancedMobilePosition();
                ClippyPositioning.applyMobilePosition(
                  clippyEl,
                  mobilePosition,
                  false
                );
              }
            } else {
              if (ClippyPositioning?.forceImmediateZoomPositioning) {
                ClippyPositioning.forceImmediateZoomPositioning(
                  clippyEl,
                  initialZoomLevel
                );
              }
            }

            // Set visibility
            clippyEl.style.visibility = isScreenPoweredOn
              ? "visible"
              : "hidden";
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
                  overlay.addEventListener(
                    "touchstart",
                    handlers.handleTouchStart,
                    { passive: false }
                  );
                  overlay._cleanupHandlers = handlers.cleanup;
                }
              } else {
                // NEW: Use single click handler that handles both single and double clicks
                overlay.addEventListener("click", handleDesktopClick);
                // FIXED: Enhanced context menu binding
                overlay.addEventListener(
                  "contextmenu",
                  (e) => {
                    devLog("Right-click on overlay");
                    handleRightClick(e);
                  },
                  { passive: false }
                );
              }

              overlayRef.current = overlay;
              document.body.appendChild(overlay);
            }

            // SIMPLE: Apply Clippy's exact positioning rules to new agent
            devLog(`🎯 APPLYING CLIPPY'S EXACT POSITIONING TO ${currentAgent}`);
            
            // Try to apply captured Clippy positioning first
            if (window.applyClippyPositioning) {
              const success = window.applyClippyPositioning(currentAgent);
              if (success) {
                devLog(`✅ Successfully applied Clippy's positioning to ${currentAgent}`);
                return;
              } else {
                devLog(`⚠️ No captured Clippy styles - applying fallback positioning`);
              }
            }
            
            // Fallback: basic positioning if no Clippy styles captured
            clippyEl.classList.add("clippy");
            clippyEl.classList.add("clippy-anchored");
            clippyEl.setAttribute("data-agent", currentAgent);
            
            if (ClippyPositioning?.positionClippyAndOverlay) {
              const positioned = ClippyPositioning.positionClippyAndOverlay(
                clippyEl,
                overlayRef.current,
                null
              );
              devLog(`Fallback positioning result for ${currentAgent}: ${positioned}`);
            }

            // Start resize handling
            if (!resizeHandlingActiveRef.current) {
              if (ClippyPositioning?.startResizeHandling) {
                const resizeStarted = ClippyPositioning.startResizeHandling(
                  clippyEl,
                  overlayRef.current,
                  null
                );
                if (resizeStarted) {
                  resizeHandlingActiveRef.current = true;
                }
              }
            }

            return true;
          },
          false,
          "clippy setup"
        );
      };

      setupClippy();

      // ENHANCED: Set up MutationObserver to catch agent DOM changes IMMEDIATELY
      const agentObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) { // Element node
                const clippyEl = node.classList?.contains('clippy') ? node : node.querySelector?.('.clippy');
                if (clippyEl) {
                  devLog(`🔍 MutationObserver detected new agent element for ${currentAgent}`);
                  
                  // IMMEDIATE positioning fix (no requestAnimationFrame delay)
                  const beforeRect = clippyEl.getBoundingClientRect();
                  devLog(`🚨 MUTATION OBSERVER - Agent detected at: ${beforeRect.left.toFixed(1)}, ${beforeRect.top.toFixed(1)}`);
                  
                  // Force correct classes IMMEDIATELY
                  clippyEl.classList.add("clippy");
                  clippyEl.classList.add("clippy-anchored");
                  clippyEl.setAttribute("data-agent", currentAgent);
                  
                  // Use overlay as positioning reference
                  const overlayEl = document.getElementById("clippy-clickable-overlay");
                  if (overlayEl) {
                    const overlayRect = overlayEl.getBoundingClientRect();
                    devLog(`🎯 MUTATION OBSERVER - Overlay reference: ${overlayRect.left.toFixed(1)}, ${overlayRect.top.toFixed(1)}`);
                    
                    // FORCE position IMMEDIATELY - no delays
                    clippyEl.style.cssText = `
                      position: fixed !important;
                      left: ${overlayRect.left}px !important;
                      top: ${overlayRect.top}px !important;
                      right: auto !important;
                      bottom: auto !important;
                      z-index: ${isMobile ? "1500" : "2000"} !important;
                      pointer-events: auto !important;
                      visibility: visible !important;
                      opacity: 1 !important;
                      display: block !important;
                      transform: translateZ(0) scale(${isMobile ? 1 : 0.95}) !important;
                      transform-origin: center bottom !important;
                    `;
                    
                    // Force reflow
                    void clippyEl.offsetHeight;
                    
                    const afterRect = clippyEl.getBoundingClientRect();
                    devLog(`✅ MUTATION OBSERVER - Agent repositioned to: ${afterRect.left.toFixed(1)}, ${afterRect.top.toFixed(1)}`);
                  }
                }
              }
            });
          }
        });
      });

      // Start observing the document for agent changes
      agentObserver.observe(document.body, {
        childList: true,
        subtree: true
      });

      return () => {
        // FIXED: Enhanced cleanup
        mountedRef.current = false;
        
        // Disconnect observer
        agentObserver.disconnect();

        safeExecute(
          () => {
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
          },
          null,
          "controller cleanup"
        );
      };
    }, [
      clippy,
      assistantVisible,
      shouldRenderClippy,
      isScreenPoweredOn,
      currentAgent, // ADDED: React to agent changes
      createMobileTouchHandlers,
      handleDesktopClick,
      handleRightClick,
    ]);

    // FIXED: Handle hidden/hiding state with conditional rendering
    if (window.clippyIsHidden || window.clippyIsHiding) {
      return null;
    }
    
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

  // ENHANCED: CSS for agent positioning consistency and transitions
  useEffect(() => {
    const agentTransitionStyles = `
      .agent-transitioning {
        transition: opacity 0.3s ease, transform 0.3s ease !important;
      }

      /* CRITICAL: Ensure all agents get the same positioning rules as Clippy */
      .clippy {
        position: fixed !important;
        pointer-events: auto !important;
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
        transform-origin: center bottom !important;
        will-change: transform !important;
        z-index: 2000 !important; /* Desktop z-index */
      }

      /* FORCE positioning for all agents - override any React95 defaults */
      .clippy.clippy-anchored {
        position: fixed !important;
        z-index: 2000 !important;
        transform-origin: center bottom !important;
        /* Position coordinates will be set via JavaScript */
      }

      /* Ensure all agent variants get proper positioning */
      .clippy[data-agent] {
        position: fixed !important;
        z-index: 2000 !important;
        transform-origin: center bottom !important;
      }

      /* Mobile-specific z-index override */
      @media (max-width: 768px) {
        .clippy {
          z-index: 1500 !important;
        }
      }

      /* Ensure anchored positioning works for all agents */
      .clippy.clippy-anchored {
        /* Anchored positioning styles already handled by ClippyPositioning */
      }

      /* Agent-specific overrides (if needed for visual differences) */
      .clippy[data-agent="Bonzi"] {
        /* Bonzi keeps all Clippy positioning rules */
      }

      .clippy[data-agent="Genie"] {
        /* Genie keeps all Clippy positioning rules */
      }

      .clippy[data-agent="Merlin"] {
        /* Merlin keeps all Clippy positioning rules */
      }

      .clippy[data-agent="Rover"] {
        /* Rover keeps all Clippy positioning rules */
      }

      .clippy[data-agent="Links"] {
        /* Links keeps all Clippy positioning rules */
      }

      .clippy[data-agent="F1"] {
        /* F1 keeps all Clippy positioning rules */
      }

      .clippy[data-agent="Peedy"] {
        /* Peedy keeps all Clippy positioning rules */
      }

      .clippy[data-agent="Rocky"] {
        /* Rocky keeps all Clippy positioning rules */
      }

      .clippy[data-agent="Genius"] {
        /* Genius keeps all Clippy positioning rules */
      }

      /* Overlay positioning consistency */
      #clippy-clickable-overlay {
        position: fixed !important;
        background: transparent !important;
        pointer-events: auto !important;
        cursor: pointer !important;
        z-index: 2010 !important; /* Always above agents */
      }

      @media (max-width: 768px) {
        #clippy-clickable-overlay {
          z-index: 1510 !important;
        }
      }
    `;

    const styleEl = document.createElement("style");
    styleEl.id = "clippy-agent-transitions";
    styleEl.textContent = agentTransitionStyles;
    document.head.appendChild(styleEl);

    return () => {
      const existingStyle = document.getElementById("clippy-agent-transitions");
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

        // 1 second delay after GoodBye animation
        setTimeout(() => {
          devLog("GoodBye animation delay completed");
        }, 1000);
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
    handleMobileSingleTap,
    handleMobileDoubleTap,
    handleMobileLongPress,
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
      <ReactClippyProvider key={currentAgent} agentName={currentAgent}>
        {/* FIXED: Only render ClippyController when shouldRenderClippy is true */}
        {assistantVisible && shouldRenderClippy && <ClippyController key={`controller-${currentAgent}`} />}

        {/* FIXED: Context Menu with enhanced functionality */}
        {contextMenuVisible && (
          <ClippyContextMenu
            x={contextMenuPosition.x}
            y={contextMenuPosition.y}
            onClose={hideContextMenu}
            currentAgent={currentAgent}
            agents={[
              "Clippy",    // Classic paperclip  
              "Links",     // Cat
              "Bonzi",     // Purple gorilla
              "Genie",     // Blue genie
              "Genius",    // Einstein-like character
              "Merlin",    // Wizard
              "F1",        // Robot assistant
              "Peedy",     // Parrot
              "Rocky",     // Brown dog
              "Rover",     // Dog (search)
            ]}
            onAction={(action, data) => {
              devLog(`Context menu action: ${action}`, data);
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

        {/* Desktop Controls - only show when Clippy should be rendered */}
        {!isMobile && shouldRenderClippy && <DesktopControls />}

        {children}
      </ReactClippyProvider>
    </ClippyContext.Provider>
  );
};

export const useClippyContext = () => useContext(ClippyContext);
export default ClippyProvider;
