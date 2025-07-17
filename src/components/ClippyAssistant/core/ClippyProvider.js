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

// FIXED: Import enhanced balloon managers from new organized structure
import {
  showCustomBalloon,
  showWelcomeBalloon,
  showHelpBalloon,
  showErrorBalloon,
  showTipsBalloon,
  hideCustomBalloon,
  cleanupCustomBalloon,
  isCustomBalloonVisible,
} from "../chat/balloons/CustomBalloon";
import {
  showChatBalloon,
  hideChatBalloon,
  cleanupChatBalloon,
  isChatBalloonVisible,
  isUserInteractingWithChat,
} from "../chat/legacy/ChatBalloon";

// NEW: Import Genius-specific Botpress chat
import GeniusChat from "../agents/genius/GeniusChat";
import { getAgentConfig } from "../agents/data/AgentPersonalities";

import ClippyContextMenu from "../interactions/ClippyContextMenu";
import ClippyPositioning from "./ClippyPositioning";
import ClippyService from "../ClippyService";
import MobileControls from "../interactions/MobileControls";
import DesktopControls from "../interactions/DesktopControls";
import FloatingHandPointer from "../interactions/FloatingHandPointer";

// NEW: Import interaction manager for smart cooldowns and iOS Safari support
import {
  interactionManager,
  COOLDOWN_TYPES,
  isIOSSafari,
} from "../interactions/InteractionManager";

// NEW: Import mobile modules
import { createMobileTouchHandler } from "../interactions/MobileTouchHandler";
import {
  handleMobileSingleTap,
  handleMobileDoubleTap,
  handleMobileLongPress,
  handleMobileDrag,
  handleMobileDragStart,
  handleMobileDragEnd,
} from "../interactions/MobileInteractions";
import {
  calculateMobilePosition,
  applyMobilePosition,
  positionMobileOverlay,
} from "../interactions/MobilePositioning";

// NEW: Import balloon position validator for global testing functions
import "../BalloonPositionValidator";

import "../styles/_styles.scss";

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
const INITIAL_MESSAGE_CONTENT = "";

// UPDATED: Using smart cooldown system from InteractionManager
// Different cooldowns for different interaction types - no cooldown for double-click/double-tap

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
  const hideButtonTipShownRef = useRef(false);
  const [showHandPointer, setShowHandPointer] = useState(false);

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

  // UPDATED: Enhanced cooldown management using InteractionManager
  const startCooldown = useCallback(() => {
    setIsInCooldown(true);
    setTimeout(() => {
      setIsInCooldown(false);
      devLog("Cooldown period ended");
    }, COOLDOWN_TYPES.ANIMATION); // Use animation cooldown for backwards compatibility
  }, []);

  // FIXED: Check if any balloon is currently open (including Genius chat)
  const isAnyBalloonOpen = useCallback(() => {
    return isCustomBalloonVisible() || isChatBalloonVisible();
  }, []); // No dependencies needed

  const triggerGeniusFAB = useCallback(() => {
    console.log("🔍 Attempting to trigger Genius FAB");
    if (currentAgent === "Genius" && window.triggerGeniusChatFAB) {
      const triggered = window.triggerGeniusChatFAB();
      if (triggered) {
        console.log("✅ Genius FAB triggered successfully");
        return true;
      }
    }
    console.log("❌ Genius FAB trigger failed:", {
      isGeniusAgent: currentAgent === "Genius",
      hasTriggerFunction: !!window.triggerGeniusChatFAB,
    });
    return false;
  }, [currentAgent]);

  // NEW: Genius chat management
  //const showGeniusChat = useCallback(() => {
  //console.log("🔍 showGeniusChat called:", {
  //currentAgent,
  //});
  //if (currentAgent === "Genius") {
  //devLog("Showing Genius chat for current agent");
  //console.log("🔍 Setting geniusChatVisible to true");
  //setGeniusChatVisible(true);
  //return true;
  //}
  //devLog("Genius chat blocked - current agent is not Genius");
  //console.log("🔍 Genius chat blocked - not Genius agent");
  //return false;
  //}, [currentAgent]);

  //const hideGeniusChat = useCallback(() => {
  //devLog("Hiding Genius chat");
  //setGeniusChatVisible(false);
  //}, []);

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
        "Clippy",
        "F1",
        "Genius",
        "Merlin",
        //"Links",
        "Bonzi",
      ];

      if (!officialAgents.includes(newAgent)) {
        devLog(`Agent change rejected - invalid agent name: ${newAgent}`);
        console.error(
          `❌ Invalid agent: ${newAgent}. Must be one of:`,
          officialAgents
        );
        return false;
      }

      if (!mountedRef.current || newAgent === currentAgent) {
        devLog(
          `Agent change blocked - same agent (${newAgent}) or not mounted`
        );
        return false;
      }

      devLog(
        `Changing agent from ${currentAgent} to ${newAgent} (official React95 agent)`
      );

      return safeExecute(
        () => {
          // COMPREHENSIVE: Enhanced cleanup sequence with complete DOM removal
          const cleanupPreviousAgent = () => {
            let savedPosition = null;

            try {
              // 1. POSITION PRESERVATION - Find the PRIMARY positioned agent (with clippy-anchored class)
              let primaryAgent = document.querySelector(
                ".clippy.clippy-anchored"
              );
              if (!primaryAgent) {
                // Fallback to first .clippy if no anchored agent found
                primaryAgent = document.querySelector(".clippy");
              }

              if (primaryAgent) {
                const rect = primaryAgent.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(primaryAgent);
                savedPosition = {
                  left: primaryAgent.style.left || `${rect.left}px`,
                  top: primaryAgent.style.top || `${rect.top}px`,
                  right: primaryAgent.style.right,
                  bottom: primaryAgent.style.bottom,
                  transform: computedStyle.transform,
                  zIndex: computedStyle.zIndex,
                  position: computedStyle.position,
                };
                devLog(
                  `Saved position for ${currentAgent} from primary agent:`,
                  savedPosition
                );
              }

              // 2. STOP ALL ACTIVE SYSTEMS for ALL agents
              const allAgents = document.querySelectorAll(".clippy");
              allAgents.forEach((agent, index) => {
                if (agent && ClippyPositioning?.stopResizeHandling) {
                  ClippyPositioning.stopResizeHandling(agent);
                  devLog(`Stopped resize handling for agent ${index}`);
                }

                // Stop animations immediately
                if (agent) {
                  agent.style.animation = "none";
                  agent.style.transition = "none";
                  agent.classList.remove("clippy-dragging", "clippy-anchored");
                  devLog(`Stopped animations for agent ${index}`);
                }
              });

              // 3. EVENT LISTENER CLEANUP - Clean ALL agent elements
              const elementsToClean = [
                ...allAgents,
                document.getElementById("clippy-clickable-overlay"),
                ...document.querySelectorAll(".clippy svg, .clippy .map"),
              ].filter(Boolean);

              elementsToClean.forEach((element, index) => {
                if (element && element.parentNode) {
                  // Create clean clone without event listeners
                  const cleanClone = element.cloneNode(true);
                  element.parentNode.replaceChild(cleanClone, element);
                  devLog(`Cleaned event listeners from element ${index}`);
                }
              });

              // 4. OVERLAY CLEANUP
              const overlayEl = document.getElementById(
                "clippy-clickable-overlay"
              );
              if (overlayEl) {
                // Clear overlay synchronization
                if (ClippyPositioning?.clearOverlaySynchronization) {
                  ClippyPositioning.clearOverlaySynchronization(overlayEl);
                }

                // Clean up mobile touch handler if exists
                if (overlayEl._touchHandler) {
                  overlayEl._touchHandler.detach();
                  overlayEl._touchHandler = null;
                }

                // Force remove overlay
                overlayEl.remove();
                overlayRef.current = null;
                devLog("Removed overlay and cleared touch handlers");
              }

              // 5. CRITICAL: FORCE REMOVE ALL AGENT ELEMENTS
              const finalAgentCleanup = document.querySelectorAll(".clippy");
              devLog(
                `Force removing ${finalAgentCleanup.length} agent elements`
              );
              finalAgentCleanup.forEach((agent, index) => {
                if (agent && agent.parentNode) {
                  agent.parentNode.removeChild(agent);
                  devLog(`Force removed agent ${index}`);
                }
              });

              // Double-check removal worked
              const remainingAgents = document.querySelectorAll(".clippy");
              if (remainingAgents.length > 0) {
                devLog(
                  `WARNING: ${remainingAgents.length} agents still remain after cleanup`
                );
                // Force remove any stragglers
                remainingAgents.forEach((agent, index) => {
                  try {
                    agent.remove();
                    devLog(`Emergency removed remaining agent ${index}`);
                  } catch (e) {
                    devLog(`Failed to remove agent ${index}:`, e);
                  }
                });
              }

              // 7. RESET POSITIONING SYSTEMS
              if (ClippyPositioning?.clearZoomAnchor) {
                ClippyPositioning.clearZoomAnchor();
                devLog("Cleared zoom anchors for agent change");
              }

              // 8. RESOURCE CLEANUP
              if (window.agentCache) {
                window.agentCache.clear();
              }

              // Clear any temporary clippy elements
              document
                .querySelectorAll(".temp-clippy, .clippy-temp")
                .forEach((el) => el.remove());

              // 9. STATE RESET
              setIsAnimationPlaying(false);
              resizeHandlingActiveRef.current = false;
              devLog("Reset all agent state");

              // 10. RETURN SAVED POSITION for restoration
              return savedPosition;
            } catch (error) {
              devLog("Cleanup error (non-critical):", error);
              return savedPosition; // Return whatever we managed to save
            }
          };

          // Hide any open balloons during transition
          hideCustomBalloon();
          hideChatBalloon();
          //hideGeniusChat(); // FIXED: Also hide Genius chat
          hideContextMenu();

          // COMPREHENSIVE: Perform cleanup and get saved position
          const savedPosition = cleanupPreviousAgent();

          // Wait for cleanup to completely finish before state change
          setTimeout(() => {
            // Verify cleanup worked
            const remainingAfterCleanup = document.querySelectorAll(".clippy");
            devLog(
              `Agents remaining after cleanup: ${remainingAfterCleanup.length}`
            );

            // Update agent state - this will trigger ReactClippyProvider re-render
            setCurrentAgent(newAgent);

            // POSITION RESTORATION - Wait longer for React95 to create new agent
            setTimeout(() => {
              const newClippyEl = document.querySelector(".clippy");
              devLog(`New agent found after state change:`, {
                found: !!newClippyEl,
                className: newClippyEl?.className,
                agent: newClippyEl?.getAttribute("data-agent"),
              });

              if (newClippyEl) {
                // BOUNDARY-AWARE: Use proper positioning system instead of blindly preserving old position
                newClippyEl.setAttribute("data-agent", newAgent);
                newClippyEl.classList.add("clippy-anchored");

                devLog(`Setting up boundary-aware positioning for ${newAgent}`);

                // Apply boundary-aware positioning using the enhanced positioning system
                if (ClippyPositioning?.positionClippyAndOverlay) {
                  const overlayEl = document.getElementById(
                    "clippy-clickable-overlay"
                  );
                  const positioned = ClippyPositioning.positionClippyAndOverlay(
                    newClippyEl,
                    overlayEl,
                    null // No custom position - calculate proper boundary-aware position
                  );

                  if (positioned) {
                    devLog(
                      `Boundary-aware positioning applied for ${newAgent}`
                    );

                    // Verify final position is within bounds
                    const finalRect = newClippyEl.getBoundingClientRect();
                    const isValid =
                      ClippyPositioning.validateClippyPosition(newClippyEl);

                    devLog(`Position validation for ${newAgent}:`, {
                      position: `(${finalRect.left.toFixed(
                        1
                      )}, ${finalRect.top.toFixed(1)})`,
                      size: `${finalRect.width.toFixed(
                        1
                      )}x${finalRect.height.toFixed(1)}`,
                      valid: isValid,
                      method: "boundary-aware positioning",
                    });
                  } else {
                    devLog(
                      `Boundary-aware positioning failed for ${newAgent}, falling back to saved position`
                    );

                    // Fallback: apply saved position only if boundary positioning fails
                    if (savedPosition) {
                      Object.entries(savedPosition).forEach(([key, value]) => {
                        if (value && value !== "auto" && value !== "none") {
                          newClippyEl.style[key] = value;
                        }
                      });
                    }
                  }
                } else {
                  devLog(
                    `ClippyPositioning not available for ${newAgent}, using fallback`
                  );

                  // Fallback: apply saved position if positioning system unavailable
                  if (savedPosition) {
                    Object.entries(savedPosition).forEach(([key, value]) => {
                      if (value && value !== "auto" && value !== "none") {
                        newClippyEl.style[key] = value;
                      }
                    });
                  }
                }
              } else {
                devLog(`New agent element not found for ${newAgent}`);
              }
            }, 800); // Increased wait time for React95 re-render
          }, 200); // Wait for cleanup to settle

          // Show welcome message after new agent loads and positions
          setTimeout(() => {
            if (mountedRef.current && clippyInstanceRef.current?.play) {
              // Special greeting animation for Genius
              if (newAgent === "Genius") {
                logAnimation("Greeting", `agent switch to ${newAgent}`);
                clippyInstanceRef.current.play("Greeting");

                // Show welcome message after Greeting animation completes (2.5 seconds)
                setTimeout(() => {
                  if (mountedRef.current && !isAnyBalloonOpen()) {
                    showCustomBalloon(
                      `Hello! I'm ${newAgent} now. How can I help you?`,
                      6000
                    );
                  }
                }, 2500); // Wait for Greeting animation to complete
              } else {
                // Standard Wave animation for other agents
                logAnimation("Wave", `agent switch to ${newAgent}`);
                clippyInstanceRef.current.play("Wave");

                // Show welcome message after Wave animation starts
                setTimeout(() => {
                  if (mountedRef.current && !isAnyBalloonOpen()) {
                    showCustomBalloon(
                      `Hello! I'm ${newAgent} now. How can I help you?`,
                      6000
                    );
                  }
                }, 500); // Small delay for Wave animation
              }
            }
          }, 1500); // Give time for new agent to load and position

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
      showCustomBalloon,
      // REMOVED: hideGeniusChat from dependencies
    ]
  );

  const handleProgramOpen = useCallback(
    (programName) => {
      // Only show the tip once per session
      if (hideButtonTipShownRef.current || !mountedRef.current) {
        return;
      }

      // Don't show if any balloon is already open
      if (isAnyBalloonOpen()) {
        return;
      }

      // Mark as shown
      hideButtonTipShownRef.current = true;

      devLog(`First program opened: ${programName} - showing hide button tip`);

      // Show the tip after a short delay
      setTimeout(() => {
        if (mountedRef.current && !isAnyBalloonOpen()) {
          showCustomBalloon(
            "💡 Tip: You can hide me anytime by clicking the 'Hide Clippy' button in the taskbar!",
            8000 // Show for 8 seconds to give user time to read
          );

          // Show the floating hand pointer
          setShowHandPointer(true);

          // Hide the pointer after 8 seconds (matching balloon duration)
          setTimeout(() => {
            setShowHandPointer(false);
          }, 8000);
        }
      }, 1000); // 1 second delay after program opens
    },
    [isAnyBalloonOpen, showCustomBalloon, setShowHandPointer]
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
          devLog(
            "Welcome balloon marked as completed - animations now unblocked"
          );
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

      // InteractionManager already checked cooldown in processSingleClick() - no duplicate check needed

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

      // Preserve Clippy's scale during interaction (no repositioning needed)
      const clippyEl = document.querySelector(".clippy");
      if (clippyEl && ClippyPositioning?.preserveClippyScale) {
        const preserved = ClippyPositioning.preserveClippyScale(clippyEl);
        devLog(
          `Clippy scale preservation: ${preserved ? "success" : "failed"}`
        );
      }

      // NEW RULE: 75% chance for animation, 25% chance for balloon
      const shouldShowAnimation = Math.random() < 0.75;

      devLog(`Desktop single click pattern:`, {
        shouldShowAnimation,
        percentage: shouldShowAnimation ? "75% - Animation" : "25% - Balloon",
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
                "Wave",
                "Congratulate",
                "GetAttention",
                "Thinking",
                "Writing",
                "GoodBye",
                "Processing",
                "Alert",
                "GetArtsy",
                "Searching",
                "Explain",
                "Greeting",
              ];

              const randomIndex = Math.floor(Math.random() * animations.length);
              const animationName = animations[randomIndex];

              logAnimation(
                animationName,
                `desktop single click (75% animation)`
              );
              clippyInstanceRef.current.play(animationName);

              // Special handling for Hide animation (handled in context menu)
              if (animationName === "Hide") {
                // Hide animation handling is done in context menu
                setTimeout(() => {
                  setIsAnimationPlaying(false);
                }, 2000); // Just the animation duration
              } else {
                // Add extra delay for GoodBye animation
                const animationDelay =
                  animationName === "GoodBye" ? 3000 : 2000;
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
                  "Enjoying Happy Tuesdays so far?",
                  "Try right-clicking me for more options!",
                  "Double-click me to open my menu!",
                  "Need help? Just let me know!",
                  "Welcome to the nostalgic world of Windows 98!",
                  "Feeling productive today?",
                  "Don't forget to save your work!",
                ];

                const randomMessage =
                  balloonMessages[
                    Math.floor(Math.random() * balloonMessages.length)
                  ];
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
      showCustomBalloon,
    ]
  );

  // NEW: Desktop double click handler for chat balloon (Genius uses Botpress, others use legacy)
  const handleDesktopDoubleClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();

      devLog(
        "Desktop double click - bypassing cooldowns (InteractionManager allows double-clicks)"
      );

      if (isAnimationPlaying) {
        devLog("Desktop double click blocked - animation currently playing");
        return false;
      }

      if (isAnyBalloonOpen()) {
        devLog("Desktop double click blocked - balloon is already open");
        return false;
      }

      devLog(`Desktop double click - opening chat for agent: ${currentAgent}`);

      // Show appropriate chat based on current agent
      setTimeout(() => {
        if (mountedRef.current && !isAnyBalloonOpen()) {
          if (currentAgent === "Genius") {
            // Use same logic as "Chat with Genius" menu item
            console.log("🎯 Genius double-clicked - triggering FAB");

            setTimeout(() => {
              if (window.botpress && window.botpress.open) {
                console.log("✅ Opening Genius chat via botpress.open()");
                window.botpress.open();
              } else {
                console.warn("⚠️ Botpress not found, trying fallback");
                if (window.triggerGeniusChatFAB) {
                  window.triggerGeniusChatFAB();
                } else {
                  if (window.showClippyCustomBalloon) {
                    window.showClippyCustomBalloon(
                      "Genius chat is initializing, please try again in a moment."
                    );
                  }
                }
              }
            }, 200); // Same delay as menu item
          } else {
            // Use legacy chat for other agents
            if (window.showClippyChatBalloon) {
              window.showClippyChatBalloon(
                "Hi! What would you like to chat about?"
              );
              devLog(
                "Desktop double click legacy chat balloon shown via global function"
              );
            } else {
              showChatBalloon("Hi! What would you like to chat about?");
              devLog(
                "Desktop double click legacy chat balloon shown via direct call (fallback)"
              );
            }
          }

          setLastInteractionTime(now);
          startCooldown();
        }
      }, 200);

      return true;
    },
    [
      isAnimationPlaying,
      isAnyBalloonOpen,
      startCooldown,
      currentAgent,
      showChatBalloon,
      triggerGeniusFAB, // CHANGED: Added triggerGeniusFAB
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

  // UPDATED: Desktop click handler using InteractionManager for smart click separation
  const handleDesktopClick = useCallback(
    (e) => {
      const clippyEl = document.querySelector(".clippy");

      // Use InteractionManager for smart single/double click separation
      interactionManager.handleClick(
        clippyEl,
        {
          onSingleClick: (event) => {
            // InteractionManager handles recording in processSingleClick() - no duplicate recording needed
            return handleDesktopSingleClick(event);
          },
          onDoubleClick: (event) => {
            // Double-clicks don't need recording - they bypass cooldowns
            return handleDesktopDoubleClick(event);
          },
        },
        e
      );
    },
    [handleDesktopSingleClick, handleDesktopDoubleClick]
  );

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
              ClippyPositioning.clearOverlaySynchronization(overlayElement);
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

  // FIXED: Simplified mobile touch handler setup
  const setupMobileTouchHandler = useCallback(() => {
    if (!isMobile) return null;

    const touchHandler = createMobileTouchHandler({
      positionLocked,

      isInCooldown: () => isInCooldown,
      isAnimationPlaying: () => isAnimationPlaying,
      isAnyBalloonOpen: () => isAnyBalloonOpen(),

      onSingleTap: (e) => {
        const now = Date.now();

        // Block if Clippy is hiding
        if (window.clippyIsHiding || window.clippyIsHidden) {
          devLog("Mobile tap blocked - Clippy is hiding/hidden");
          return;
        }

        // Check if this is initial interaction
        const isInitialInteraction =
          !greetingPlayedRef.current && !initialMessageShownRef.current;

        // Update interaction tracking
        setLastInteractionTime(now);
        startCooldown();
        setInteractionCount((count) => count + 1);

        // Handle the tap
        handleMobileSingleTap({
          clippyInstance: clippyInstanceRef.current || window.clippy,
          showCustomBalloon,
          setIsAnimationPlaying,
          isInitialInteraction,
          greetingPlayedRef,
          initialMessageShownRef,
          showWelcomeBalloon,
        });
      },

      onDoubleTap: (e) => {
        // Block if context menu already visible
        if (contextMenuVisible) {
          devLog("Mobile double-tap blocked - context menu already visible");
          return;
        }

        handleMobileDoubleTap({ showContextMenu });
      },

      onLongPress: (e) => {
        const now = Date.now();
        setLastInteractionTime(now);
        startCooldown();

        handleMobileLongPress({
          showChatBalloon,
          triggerGeniusFAB, // CHANGED: Pass triggerGeniusFAB instead of showGeniusChat
          currentAgent,
        });
      },

      onDragStart: (e) => {
        setIsDragging(true);
        handleMobileDragStart();
      },

      onDragMove: (position) => {
        handleMobileDrag({ ...position, isDragging: true });
      },

      onDragEnd: (e) => {
        setIsDragging(false);
        handleMobileDragEnd();
      },
    });

    return touchHandler;
  }, [
    isMobile,
    positionLocked,
    isInCooldown,
    isAnimationPlaying,
    isAnyBalloonOpen,
    contextMenuVisible,
    startCooldown,
    showContextMenu,
    showChatBalloon,
    showCustomBalloon,
    showWelcomeBalloon,
    triggerGeniusFAB, // CHANGED: Added triggerGeniusFAB
    currentAgent,
    setIsAnimationPlaying,
    setIsDragging,
    setLastInteractionTime,
    setInteractionCount,
  ]);

  // Initialize global functions
  useEffect(() => {
    if (typeof window !== "undefined" && !window._clippyGlobalsInitialized) {
      window._clippyGlobalsInitialized = true;

      // Position management
      window.setClippyPosition = createSafeGlobalFunction((x, y) => {
        if (!isMobile) {
          setPosition({ x, y });
          return true;
        }
        return false;
      }, "setClippyPosition");

      // Lock management
      window.setPositionLocked = createSafeGlobalFunction((locked) => {
        setPositionLocked(locked);
        return true;
      }, "setPositionLocked");

      window.getPositionLocked = createSafeGlobalFunction(
        () => positionLocked,
        "getPositionLocked"
      );

      // Drag state management
      window.setClippyDragging = createSafeGlobalFunction((dragging) => {
        setIsDragging(dragging);
        return true;
      }, "setClippyDragging");

      // Visibility management
      window.setAssistantVisible = createSafeGlobalFunction((visible) => {
        setAssistantVisible(visible);
        return true;
      }, "setAssistantVisible");

      // FIXED: Agent management - this is the missing function!
      window.setCurrentAgent = createSafeGlobalFunction((newAgent) => {
        devLog(`Global setCurrentAgent called with: ${newAgent}`);
        return handleAgentChange(newAgent);
      }, "setCurrentAgent");

      window.getCurrentAgent = createSafeGlobalFunction(
        () => currentAgent,
        "getCurrentAgent"
      );

      // Screen power management
      window.setIsScreenPoweredOn = createSafeGlobalFunction((powered) => {
        setIsScreenPoweredOn(powered);
        return true;
      }, "setIsScreenPoweredOn");

      // Message management
      window.showClippyInitialMessage = createSafeGlobalFunction(() => {
        showInitialMessage();
        return true;
      }, "showClippyInitialMessage");

      // Context menu management
      window.hideClippyContextMenu = createSafeGlobalFunction(() => {
        hideContextMenu();
        return true;
      }, "hideClippyContextMenu");

      devLog("All enhanced global functions initialized successfully");
    }
    window.showHideButtonTip = createSafeGlobalFunction(() => {
      if (!hideButtonTipShownRef.current && !isAnyBalloonOpen()) {
        hideButtonTipShownRef.current = true;
        showCustomBalloon(
          "💡 Tip: You can hide me anytime by clicking the 'Hide Clippy' button in the taskbar!",
          8000
        );
        setShowHandPointer(true);
        setTimeout(() => setShowHandPointer(false), 8000);
        return true;
      }
      return false;
    }, "showHideButtonTip");

    return () => {
      if (typeof window !== "undefined" && window._clippyGlobalsInitialized) {
        // Cleanup all global functions
        delete window.setClippyPosition;
        delete window.setPositionLocked;
        delete window.getPositionLocked;
        delete window.setClippyDragging;
        delete window.setAssistantVisible;
        delete window.setCurrentAgent;
        delete window.getCurrentAgent;
        delete window.setIsScreenPoweredOn;
        delete window.showClippyInitialMessage;
        delete window.hideClippyContextMenu;
        delete window._clippyGlobalsInitialized;
        delete window.showHideButtonTip;
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
    currentAgent,
    setIsScreenPoweredOn,
    showInitialMessage,
    hideContextMenu,
    handleAgentChange,
  ]);

  // ClippyController component
  const ClippyController = () => {
    const { clippy } = useClippy();
    const setupAttemptRef = useRef(0);
    const lastAgentRef = useRef(currentAgent);

    useEffect(() => {
      devLog(`ClippyController - clippy object:`, {
        exists: !!clippy,
        methods: clippy ? Object.keys(clippy) : [],
        currentAgent,
      });
    }, [clippy, currentAgent]);

    // PHASE 2: Enhanced agent change detection
    useEffect(() => {
      if (lastAgentRef.current !== currentAgent) {
        devLog(`Agent changed: ${lastAgentRef.current} → ${currentAgent}`);
        lastAgentRef.current = currentAgent;

        // Force complete re-setup for new agent
        setupAttemptRef.current = 0; // Reset setup attempts
        devLog(`Reset setup attempts for new agent: ${currentAgent}`);

        // Clear any stale positioning data for new agent
        const clippyEl = document.querySelector(".clippy");
        if (clippyEl && ClippyPositioning?.refreshZoomAnchor) {
          ClippyPositioning.refreshZoomAnchor(clippyEl);
          devLog(`Refreshed zoom anchor for new agent: ${currentAgent}`);
        }
      }
    }, [currentAgent]);

    // PHASE 2: State synchronization for agent changes
    useEffect(() => {
      if (currentAgent !== defaultAgent && clippy) {
        // Agent was changed, ensure proper positioning after React95 re-render
        const clippyEl = document.querySelector(".clippy");
        if (clippyEl && ClippyPositioning?.positionClippyAndOverlay) {
          setTimeout(() => {
            // Re-apply positioning for new agent after DOM updates
            ClippyPositioning.positionClippyAndOverlay(
              clippyEl,
              overlayRef.current
            );
            devLog(`Re-positioned new agent: ${currentAgent}`);
            // Play special greeting for Genius after repositioning
          }, 100); // Small delay to ensure DOM is updated
        }
      }
    }, [currentAgent, clippy, defaultAgent]); // React to agent changes

    useEffect(() => {
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

      if (clippy && clippy.play) {
        const originalPlay = clippy.play.bind(clippy);
        clippy.play = function (animationName, ...args) {
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

            clippyEl.setAttribute("data-agent", currentAgent);

            // ENHANCED: Add agent-specific class for SCSS targeting
            clippyEl.classList.add(
              "clippy",
              "clippy-anchored",
              currentAgent.toLowerCase()
            );
            devLog(
              `Added agent-specific classes: clippy clippy-anchored ${currentAgent.toLowerCase()}`
            );

            // Right-click handling
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

            addRightClickToElement(clippyEl, "main Clippy element");

            const svgElements = clippyEl.querySelectorAll("svg, .map");
            svgElements.forEach((svg, index) => {
              addRightClickToElement(svg, `SVG element ${index}`);
            });

            // Initial positioning
            const initialZoomLevel =
              parseInt(document.body.getAttribute("data-zoom")) || 0;

            if (isMobile) {
              const mobilePosition = calculateMobilePosition();
              applyMobilePosition(clippyEl, mobilePosition, false);
            } else {
              if (ClippyPositioning?.forceImmediateZoomPositioning) {
                ClippyPositioning.forceImmediateZoomPositioning(
                  clippyEl,
                  initialZoomLevel
                );
              }
            }

            clippyEl.style.visibility = isScreenPoweredOn
              ? "visible"
              : "hidden";
            clippyEl.style.opacity = "1";
            clippyEl.style.pointerEvents = "auto";
            clippyEl.style.display = "block";

            // Setup overlay
            if (!overlayRef.current) {
              const overlay = document.createElement("div");
              overlay.id = "clippy-clickable-overlay";

              overlay.style.cssText = `
                position: fixed !important;
                background: transparent !important;
                cursor: pointer !important;
                pointer-events: auto !important;
                z-index: 1500 !important;
                touch-action: none !important;
              `;

              if (isMobile) {
                // Use new touch handler
                const touchHandler = setupMobileTouchHandler();
                if (touchHandler) {
                  touchHandler.attach(overlay);
                  overlay._touchHandler = touchHandler;
                }
              } else {
                // Use InteractionManager for desktop overlay click handling
                overlay.addEventListener("click", (e) => {
                  if (e.button === 0) {
                    // Only handle left click
                    handleDesktopClick(e);
                  }
                });
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

            // Position overlay
            if (isMobile) {
              positionMobileOverlay(overlayRef.current, clippyEl);
            } else {
              if (ClippyPositioning?.positionOverlay) {
                ClippyPositioning.positionOverlay(overlayRef.current, clippyEl);
              }
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

            // Start overlay alignment monitoring to prevent positioning overrides
            if (
              overlayRef.current &&
              ClippyPositioning?.startOverlayAlignmentMonitoring
            ) {
              ClippyPositioning.startOverlayAlignmentMonitoring(
                clippyEl,
                overlayRef.current
              );
              devLog(
                `Started overlay alignment monitoring for ${currentAgent}`
              );
            }

            return true;
          },
          false,
          "clippy setup"
        );
      };

      setupClippy();

      return () => {
        mountedRef.current = false;

        safeExecute(
          () => {
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
              // Clean up mobile touch handler
              if (overlayRef.current._touchHandler) {
                overlayRef.current._touchHandler.detach();
                overlayRef.current._touchHandler = null;
              }
              overlayRef.current.parentNode.removeChild(overlayRef.current);
              overlayRef.current = null;
            }
          },
          null,
          "controller cleanup"
        );
      };
    }, [clippy]);
    if (window.clippyIsHidden || window.clippyIsHiding) {
      return null;
    }

    return null;
  };

  // Mount effect
  useEffect(() => {
    mountedRef.current = true;
    devLog("ClippyProvider mounted");

    const setupDesktopBounds = () => {
      const desktop =
        document.querySelector(".desktop.screen") ||
        document.querySelector(".desktop") ||
        document.querySelector(".w98");
      if (desktop) {
        const desktopRect = desktop.getBoundingClientRect();
        window._desktopViewportBounds = {
          left: desktopRect.left,
          top: desktopRect.top,
          width: desktopRect.width,
          height: desktopRect.height,
          right: desktopRect.right,
          bottom: desktopRect.bottom,
        };
        console.log(
          `🖥️ Early desktop viewport bounds setup for balloons:`,
          window._desktopViewportBounds
        );
        return true;
      }
      return false;
    };

    if (!setupDesktopBounds()) {
      const checkDesktop = () => {
        if (setupDesktopBounds()) {
          return;
        }
        setTimeout(checkDesktop, 50);
      };
      setTimeout(checkDesktop, 50);
    }

    return () => {
      mountedRef.current = false;
      devLog("ClippyProvider unmounted");
    };
  }, []);

  // Unmount cleanup
  useEffect(() => {
    return () => {
      if (clippyInstanceRef.current?.play) {
        devLog("Playing GoodBye animation before unmount");
        const animationName = "GoodBye";
        logAnimation(animationName, "component unmount");
        clippyInstanceRef.current.play(animationName);

        setTimeout(() => {
          devLog("GoodBye animation delay completed");
        }, 1000);
      }

      cleanupCustomBalloon();
      cleanupChatBalloon();

      if (shutdownTimeoutRef.current) {
        clearTimeout(shutdownTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;

    let windowOpenObserver = null;
    let processedWindows = new Set();

    const checkForNewWindows = () => {
      // Log all possible window-like elements for debugging
      const allPossibleWindows = document.querySelectorAll(
        '[class*="window" i], [class*="Window" i], [role="dialog"], [class*="modal" i], [class*="dialog" i]'
      );
      devLog(
        `Found ${allPossibleWindows.length} potential window elements:`,
        Array.from(allPossibleWindows).map((el) => ({
          className: el.className,
          id: el.id,
          role: el.getAttribute("role"),
          tagName: el.tagName,
        }))
      );

      // Mark existing windows as processed
      allPossibleWindows.forEach((window) => {
        processedWindows.add(window);
      });

      // Monitor for new elements being added
      windowOpenObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;

            // Debug log every element with certain attributes
            if (node.className && typeof node.className === "string") {
              const className = node.className.toLowerCase();
              if (
                className.includes("window") ||
                className.includes("modal") ||
                className.includes("dialog") ||
                className.includes("app") ||
                className.includes("program")
              ) {
                devLog(`Potential window element added:`, {
                  className: node.className,
                  id: node.id,
                  innerHTML: node.innerHTML?.substring(0, 100) + "...",
                });
              }
            }

            // Check the node and all its children for windows
            const checkNode = (element) => {
              if (!element || processedWindows.has(element)) return;

              const className = (element.className || "")
                .toString()
                .toLowerCase();
              const role = (element.getAttribute?.("role") || "").toLowerCase();
              const id = (element.id || "").toLowerCase();

              // Very broad detection
              const isWindow =
                className.includes("window") ||
                className.includes("modal") ||
                className.includes("dialog") ||
                className.includes("app-window") ||
                className.includes("program") ||
                role === "dialog" ||
                role === "window" ||
                role === "application" ||
                id.includes("window") ||
                element.tagName === "DIALOG";

              if (isWindow && !processedWindows.has(element)) {
                processedWindows.add(element);

                // Try multiple selectors for title
                const titleElement =
                  element.querySelector(
                    '[class*="title" i], [class*="header" i], h1, h2, header'
                  ) ||
                  element.querySelector('[role="heading"]') ||
                  element.firstElementChild;

                const programName =
                  titleElement?.textContent?.trim() ||
                  element.getAttribute("title") ||
                  element.getAttribute("aria-label") ||
                  "a program";

                devLog(`🎉 NEW WINDOW DETECTED: ${programName}`, {
                  element,
                  className: element.className,
                  role: element.getAttribute("role"),
                });

                handleProgramOpen(programName);
              }

              // Check all children
              if (element.children) {
                Array.from(element.children).forEach((child) =>
                  checkNode(child)
                );
              }
            };

            checkNode(node);
          });
        });
      });

      // Observe the entire document with aggressive settings
      windowOpenObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "role", "style"],
      });

      devLog("Enhanced window monitoring started");
    };

    // Start monitoring immediately and after a delay
    checkForNewWindows();

    return () => {
      if (windowOpenObserver) {
        windowOpenObserver.disconnect();
      }
    };
  }, [handleProgramOpen]);

  window.testWindowDetection = () => {
    const allElements = document.querySelectorAll("*");
    const windowLikeElements = Array.from(allElements).filter((el) => {
      const className = (el.className || "").toString().toLowerCase();
      return (
        className.includes("window") ||
        className.includes("modal") ||
        className.includes("dialog") ||
        className.includes("app")
      );
    });

    console.log("🔍 Window Detection Test Results:");
    console.log("Total elements:", allElements.length);
    console.log("Window-like elements found:", windowLikeElements.length);
    windowLikeElements.forEach((el, i) => {
      console.log(`${i + 1}. ${el.tagName} - ${el.className}`, el);
    });

    return windowLikeElements;
  };

  useEffect(() => {
    if (!mountedRef.current) return;

    let lastFocusedWindow = null;

    const handleFocusIn = (e) => {
      const window = e.target.closest('.window, .Window95, [role="dialog"]');
      if (window && window !== lastFocusedWindow) {
        // Check if this window is newly created (not in DOM before)
        if (!window.hasAttribute("data-clippy-seen")) {
          window.setAttribute("data-clippy-seen", "true");
          const titleBar = window.querySelector(
            ".title-bar-text, .TitleBar__Text, header"
          );
          const programName = titleBar?.textContent?.trim() || "a program";
          devLog(`Window focused for first time: ${programName}`);
          handleProgramOpen(programName);
        }
        lastFocusedWindow = window;
      }
    };

    document.addEventListener("focusin", handleFocusIn, true);

    return () => {
      document.removeEventListener("focusin", handleFocusIn, true);
    };
  }, [handleProgramOpen]);

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
    showHandPointer,
    setShowHandPointer,

    // Actions
    setAssistantVisible,
    setCurrentAgent,
    setIsScreenPoweredOn,
    setPosition,
    setPositionLocked,
    setIsDragging,

    // Balloon functions
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
    handleRightClick,

    // Agent change function
    handleAgentChange,

    // Greeting function
    playInitialGreeting,

    // ADDED: Genius FAB trigger
    triggerGeniusFAB,

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
        {assistantVisible && shouldRenderClippy && (
          <ClippyController key={`controller-${currentAgent}`} />
        )}
        {contextMenuVisible && (
          <ClippyContextMenu
            x={contextMenuPosition.x}
            y={contextMenuPosition.y}
            onClose={hideContextMenu}
            currentAgent={currentAgent}
            agents={["Clippy", "F1", "Genius", "Merlin", "Bonzi"]}
            toggleSettings={
              window.program?.toggleSettings || window.toggleSettings
            } // <-- ADD THIS LINE HERE
            onAction={(action, data) => {
              devLog(`Context menu action: ${action}`, data);

              if (action === "chat") {
                // Ensure the chat balloon opens correctly
                if (mountedRef.current && !isAnyBalloonOpen()) {
                  if (currentAgent === "Genius") {
                    // CHANGED: Trigger FAB for Genius
                    triggerGeniusFAB();
                    devLog("Genius FAB triggered from context menu");
                  } else {
                    // Use legacy chat for other agents
                    showChatBalloon("Hi! What would you like to chat about?");
                    devLog("Legacy chat balloon triggered from context menu");
                  }
                } else {
                  devLog(
                    "Chat balloon blocked - another balloon is open or not mounted"
                  );
                }
              }
            }}
          />
        )}
        {showHandPointer && (
          <FloatingHandPointer
            targetSelector=".TaskBar__quick-launch button[title*='Hide'], .TaskBar__quick-launch button[aria-label*='Hide']"
            duration={8000}
            onComplete={() => setShowHandPointer(false)}
          />
        )}
        {isMobile && shouldRenderClippy && (
          <MobileControls
            positionLocked={positionLocked}
            onToggleLock={() => setPositionLocked(!positionLocked)}
            onHide={() => setAssistantVisible(false)}
          />
        )}
        {!isMobile && shouldRenderClippy && <DesktopControls />}
        {currentAgent === "Genius" && (
          <GeniusChat
            visible={false} // Not used anymore, FAB handles visibility
            onClose={() => {}} // FAB handles its own close
            currentAgent={currentAgent}
            chatSystem="botpress"
          />
        )}
        {children}
      </ReactClippyProvider>
    </ClippyContext.Provider>
  );
};

export const useClippyContext = () => useContext(ClippyContext);
export default ClippyProvider;
