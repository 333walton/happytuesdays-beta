import React, { useEffect, useRef, useCallback } from "react";
import { useClippy } from "@react95/clippy";

// Check if we're inside MonitorView
const isInsideMonitorView = () => {
  return document.getElementById("monitor-root") !== null;
};

// Global animation throttling variables
let isAnimationPlaying = false;
let animationDebounceTimeout = null;
let globalPositioningLock = false;

/**
 * Component to handle Clippy positioning and interactions
 * This is a standalone controller that will add necessary DOM elements
 * and handle all the interactions for Clippy.
 */

const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

const ClippyController = ({
  visible,
  position,
  userPositioned,
  setUserPositioned,
  setPosition,
  desktopRectRef,
  isMobileRef,
  fixedPosition,
  relativePositionRef,
  currentAgent,
  setCurrentAgent,
  setAssistantVisible,
  setClippyInstance,
  isScreenPoweredOn, // New prop to track screen power state
}) => {
  const { clippy } = useClippy();
  const initialPositionAppliedRef = useRef(false);
  const hasBeenDraggedRef = useRef(false);
  const desktopViewportRef = useRef(null);
  const clippyElementRef = useRef(null);
  const clippySizeRef = useRef({ width: 100, height: 100 });
  const balloonObserverRef = useRef(null);
  const clippyOverlayRef = useRef(null);
  const clickCounterRef = useRef(0);
  const rafIdRef = useRef(null);
  const lastUpdateRef = useRef(0);

  // We're now using a single global RAF for all Clippy positioning
  // This prevents redundant updates and improves performance
  const useGlobalPositioning = true;

  // Calculate bounded position helper
  const calculateBoundedPosition = useCallback(
    (x, y, desktopRect = null) => {
      if (!desktopRect && !desktopRectRef.current) return { x, y };

      const rect = desktopRect || desktopRectRef.current;
      const desktopWidth = rect.width;
      const desktopHeight = rect.height;

      // Get actual Clippy dimensions or use defaults
      const clippyWidth = clippySizeRef.current.width || 100;
      const clippyHeight = clippySizeRef.current.height || 100;

      // Ensure padding is proportional on smaller screens
      const padding = Math.max(5, Math.min(desktopWidth, desktopHeight) * 0.01);
      const maxX = Math.max(0, desktopWidth - clippyWidth - padding);
      const maxY = Math.max(0, desktopHeight - clippyHeight - padding);

      return {
        x: Math.min(Math.max(padding, x), maxX),
        y: Math.min(Math.max(padding, y), maxY),
      };
    },
    [desktopRectRef]
  );

  /**
   * Fix animations after screen power state changes
   * This function can be called manually if animations stop working
   */
  const fixAnimations = useCallback(() => {
    if (!clippy) return;

    console.log("Fixing Clippy animations");

    // Force Clippy element to be visible via CSS classes
    const clippyEl = document.querySelector(".clippy");
    if (clippyEl) {
      // Use classList instead of direct style manipulation
      clippyEl.classList.add("clippy-visible");
      clippyEl.classList.remove("clippy-hidden");

      // Reset z-index - use standard value from our hierarchy
      clippyEl.style.zIndex = isInsideMonitorView() ? "1001" : "2000";

      // Find SVG elements and ensure they're visible
      const svgElements = clippyEl.querySelectorAll("svg");
      if (svgElements.length > 0) {
        svgElements.forEach((svg) => {
          svg.classList.add("clippy-visible");
        });
      }

      // Fix animation maps
      const maps = clippyEl.querySelectorAll(".map");
      if (maps.length > 0) {
        maps.forEach((map) => {
          if (map.classList.contains("animate")) {
            map.classList.add("clippy-visible");
          }
        });
      }
    }

    // Fix overlay
    const overlay = document.getElementById("clippy-clickable-overlay");
    if (overlay) {
      overlay.classList.add("clippy-overlay-visible");
      overlay.style.zIndex = isInsideMonitorView() ? "1002" : "2010"; // Use correct z-index
    }

    // Apply temporary fix style - only if not already present
    if (!document.getElementById("clippy-animation-fix")) {
      const fixStyle = document.createElement("style");
      fixStyle.id = "clippy-animation-fix";
      fixStyle.textContent = `
        .clippy-visible {
          visibility: visible !important;
          opacity: 1 !important;
          display: block !important;
        }
        
        .clippy-hidden {
          visibility: hidden !important;
          opacity: 0 !important;
        }
        
        .clippy-animate,
        .clippy-animate * {
          visibility: visible !important;
          opacity: 1 !important;
          display: block !important;
        }
        
        .clippy svg,
        .clippy svg * {
          visibility: visible !important;
          opacity: 1 !important;
          display: inline !important;
        }
        
        /* Temporary fix for z-index */
        .clippy {
          z-index: ${isInsideMonitorView() ? "1001" : "2000"} !important;
        }
        
        #clippy-clickable-overlay {
          z-index: ${isInsideMonitorView() ? "1002" : "2010"} !important;
        }
        
        .custom-clippy-balloon, 
        .custom-clippy-chat-balloon {
          z-index: ${isInsideMonitorView() ? "1003" : "2100"} !important;
        }
      `;
      document.head.appendChild(fixStyle);
    }

    // Play a test animation with delay to ensure styles have applied
    setTimeout(() => {
      try {
        clippy.play("Wave");
        console.log("Animation test successful");
      } catch (e) {
        console.error("Animation test failed:", e);
      }
    }, 300);

    return true;
  }, [clippy]);

  // Set up the balloon observer - enhanced to redirect content
  const setupBalloonObserver = useCallback(() => {
    if (balloonObserverRef.current) {
      balloonObserverRef.current.disconnect();
    }

    // Find the clippy element to observe
    const clippyEl = document.querySelector(".clippy");
    if (!clippyEl) return null; // Return null instead of undefined

    // Adjust observer behavior for MonitorView
    const inMonitorView = isInsideMonitorView();

    // Create an observer with more limited scope
    const observer = new MutationObserver((mutations) => {
      // Don't process when screen is off
      if (!isScreenPoweredOn) return;

      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            if (node.classList && node.classList.contains("clippy-balloon")) {
              // Hide the default balloon
              node.classList.add("clippy-hidden");

              // Redirect to custom balloon
              const content = node.querySelector(".clippy-content");
              if (
                content &&
                content.textContent &&
                window.showClippyCustomBalloon
              ) {
                window.showClippyCustomBalloon(content.textContent);
              }
              return;
            }
          }
        }
      }
    });

    // Only observe the clippy element, not the entire document
    observer.observe(clippyEl, { childList: true, subtree: true });
    balloonObserverRef.current = observer;

    // On mobile, don't use polling interval at all
    if (isMobile) {
      // Just do one check now
      const balloon = document.querySelector(".clippy-balloon");
      if (balloon) {
        const content = balloon.querySelector(".clippy-content");
        if (content && content.textContent && window.showClippyCustomBalloon) {
          balloon.classList.add("clippy-hidden");
          window.showClippyCustomBalloon(content.textContent);
        }
      }
    }

    // IMPORTANT: Return a proper cleanup function, not the observer itself
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [isScreenPoweredOn]);

  // Find desktop viewport container
  useEffect(() => {
    if (!desktopViewportRef.current) {
      // For MonitorView compatibility, try to find the monitor screen first
      const monitorScreen = isInsideMonitorView()
        ? document.querySelector(".monitor-screen")
        : null;
      const desktopElement = monitorScreen || document.querySelector(".w98");

      if (desktopElement) {
        desktopViewportRef.current = desktopElement;
        desktopRectRef.current = desktopElement.getBoundingClientRect();
      }
    }
  }, [desktopRectRef]);

  // Replace the entire handleClippyInteraction function
  const handleClippyInteraction = useCallback(() => {
    if (!clippy || !isScreenPoweredOn || isInsideMonitorView()) return; // Skip if inside MonitorView

    console.log("Handling Clippy interaction");

    // Force Clippy element to be visible using classList
    const clippyEl = document.querySelector(".clippy");
    if (!clippyEl) {
      console.error("Clippy element not found");
      return;
    }

    // Modify the enforcement for mobile
    if (isMobileRef.current) {
      // On mobile, position at bottom right corner with padding
      clippyEl.style.position = "absolute";
      clippyEl.style.bottom = "10px";
      clippyEl.style.right = "10px";
      clippyEl.style.left = "auto";
      clippyEl.style.top = "auto";

      // Also position the overlay
      if (clippyOverlayRef.current) {
        clippyOverlayRef.current.style.position = "absolute";
        clippyOverlayRef.current.style.bottom = "10px";
        clippyOverlayRef.current.style.right = "10px";
        clippyOverlayRef.current.style.left = "auto";
        clippyOverlayRef.current.style.top = "auto";
      }

      // Skip the animation frame positioning on mobile
      return;
    }

    // CRITICAL: Make clippy and its children visible with classes
    clippyEl.classList.add("clippy-visible");
    clippyEl.classList.remove("clippy-hidden");

    // Temporarily unlock positioning during animation
    const wasPositionLocked = globalPositioningLock;
    if (wasPositionLocked) {
      globalPositioningLock = false;
      window._clippyPositionLocked = false;
    }

    // Play animation with slight delay to ensure visibility
    setTimeout(() => {
      // Use a reduced set of reliable animations
      const animations = ["Greeting", "Wave", "GetAttention", "Thinking"];
      const randomAnim =
        animations[Math.floor(Math.random() * animations.length)];

      console.log(`Playing animation: ${randomAnim}`);
      try {
        clippy.play(randomAnim);
        console.log("Animation triggered successfully");
      } catch (e) {
        console.error("Error playing animation:", e);
      }

      // Re-lock position after animation completes
      if (wasPositionLocked) {
        setTimeout(() => {
          globalPositioningLock = true;
          window._clippyPositionLocked = true;
        }, 2000);
      }

      // Show speech balloon after animation - only on every 3rd click
      setTimeout(() => {
        if (!isScreenPoweredOn) return; // Don't show balloon if screen is off

        // Increment counter
        clickCounterRef.current = (clickCounterRef.current + 1) % 3;

        // Only show speech on every 3rd click (when counter is 0)
        if (clickCounterRef.current === 0) {
          const phrases = [
            "Hello there! How can I help you?",
            "Need some assistance?",
            "I'm here to help! What can I do for you?",
            "Looking for some help?",
          ];

          // Choose random phrase
          const randomPhrase =
            phrases[Math.floor(Math.random() * phrases.length)];

          // Use our custom balloon function
          if (window.showClippyCustomBalloon) {
            window.showClippyCustomBalloon(randomPhrase);
          } else if (clippy.speak) {
            clippy.speak(randomPhrase);
          }
        }
      }, 800);
    }, 100);
  }, [clippy, isScreenPoweredOn]);

  // Setup double-click and right-click handlers with overlay
  useEffect(() => {
    if (!clippy) return;

    const setupHandlers = () => {
      // Find the Clippy element
      const agentElements = document.querySelectorAll(".clippy");
      if (agentElements.length === 0) return false;

      const agentElement = agentElements[0];
      clippyElementRef.current = agentElement;

      // CRITICAL: Make Clippy non-interactive with classes
      agentElement.classList.add("clippy-no-events");

      // Set initial visibility based on screen power
      if (isScreenPoweredOn) {
        agentElement.classList.add("clippy-visible");
        agentElement.classList.remove("clippy-hidden");
      } else {
        agentElement.classList.add("clippy-hidden");
        agentElement.classList.remove("clippy-visible");
      }

      // Set z-index properly based on environment
      agentElement.style.zIndex = isInsideMonitorView() ? "1001" : "2000";

      // Create clickable overlay if it doesn't exist
      if (!clippyOverlayRef.current) {
        const rect = agentElement.getBoundingClientRect();
        const overlay = document.createElement("div");
        overlay.id = "clippy-clickable-overlay";
        overlay.style.position = "fixed";
        overlay.style.left = `${rect.left}px`;
        overlay.style.top = `${rect.top}px`;
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
        overlay.style.zIndex = isInsideMonitorView() ? "1002" : "2010"; // Set z-index based on environment
        overlay.style.cursor = "pointer";
        overlay.style.background = "transparent";

        // Set initial visibility based on screen power
        if (isScreenPoweredOn) {
          overlay.classList.add("clippy-overlay-visible");
        } else {
          overlay.classList.add("clippy-overlay-hidden");
        }

        clippyOverlayRef.current = overlay;
        document.body.appendChild(overlay);

        // Add double-click handler with better touch handling
        let touchStartTime = 0;
        let lastTapTime = 0;

        // Handle touch events specially for mobile
        overlay.addEventListener("touchstart", (e) => {
          touchStartTime = Date.now();
        });

        overlay.addEventListener("touchend", (e) => {
          if (!isScreenPoweredOn) return;

          const touchDuration = Date.now() - touchStartTime;
          const currentTime = Date.now();
          const tapTimeDiff = currentTime - lastTapTime;

          // Detect double tap (two quick taps less than 300ms apart)
          if (tapTimeDiff < 300 && touchDuration < 200) {
            e.preventDefault();
            handleClippyInteraction();
            lastTapTime = 0; // Reset
          } else {
            lastTapTime = currentTime;
          }
        });

        // Regular double-click for desktop
        overlay.addEventListener("dblclick", (e) => {
          if (!isScreenPoweredOn) return;
          e.preventDefault();
          e.stopPropagation();
          handleClippyInteraction();
        });

        // Add right-click/contextmenu handler
        overlay.addEventListener("contextmenu", (e) => {
          if (!isScreenPoweredOn) return;
          e.preventDefault();
          e.stopPropagation();

          // Show Clippy's speech bubble with a simple message
          if (window.showClippyCustomBalloon) {
            // Force Clippy visible first
            const clippyEl = document.querySelector(".clippy");
            if (clippyEl) {
              clippyEl.classList.add("clippy-visible");
              clippyEl.classList.remove("clippy-hidden");
            }

            setTimeout(() => {
              try {
                clippy.play("GetAttention");

                setTimeout(() => {
                  window.showClippyCustomBalloon(
                    "Right-click me for more options!"
                  );
                }, 500);
              } catch (e) {
                console.error("Error showing context menu message:", e);
                // Fallback if animation fails
                window.showClippyCustomBalloon(
                  "Right-click me for more options!"
                );
              }
            }, 50);
          }
        });
      }

      return true;
    };

    // Try to set up handlers with retry
    if (!setupHandlers()) {
      const interval = setInterval(() => {
        if (setupHandlers()) clearInterval(interval);
      }, 500);
      setTimeout(() => clearInterval(interval), 5000);
      return () => clearInterval(interval);
    }
  }, [clippy, handleClippyInteraction, isScreenPoweredOn]);

  // Update Clippy visibility when screen power changes
  useEffect(() => {
    if (!clippyElementRef.current && !clippyOverlayRef.current) return;

    const clippyElement =
      clippyElementRef.current || document.querySelector(".clippy");
    const overlayElement =
      clippyOverlayRef.current ||
      document.getElementById("clippy-clickable-overlay");

    if (clippyElement) {
      if (isScreenPoweredOn) {
        clippyElement.classList.add("clippy-visible");
        clippyElement.classList.remove("clippy-hidden");
      } else {
        clippyElement.classList.add("clippy-hidden");
        clippyElement.classList.remove("clippy-visible");
      }

      if (overlayElement) {
        if (isScreenPoweredOn) {
          overlayElement.classList.add("clippy-overlay-visible");
          overlayElement.classList.remove("clippy-overlay-hidden");
        } else {
          overlayElement.classList.add("clippy-overlay-hidden");
          overlayElement.classList.remove("clippy-overlay-visible");
        }
      }

      // Hide any speech balloons when screen is off
      if (!isScreenPoweredOn) {
        const customBalloon = document.querySelector(".custom-clippy-balloon");
        const chatBalloon = document.querySelector(
          ".custom-clippy-chat-balloon"
        );

        if (customBalloon && customBalloon.parentNode) {
          customBalloon.parentNode.removeChild(customBalloon);
        }

        if (chatBalloon && chatBalloon.parentNode) {
          chatBalloon.parentNode.removeChild(chatBalloon);
        }

        // Also clear any original clippy balloons
        const originalBalloon = document.querySelector(".clippy-balloon");
        if (originalBalloon) {
          originalBalloon.classList.add("clippy-hidden");
        }
      }
    }
  }, [isScreenPoweredOn]);

  // Add a global function to allow manual fixing from console
  useEffect(() => {
    window.fixClippyAfterPowerChange = fixAnimations;

    return () => {
      delete window.fixClippyAfterPowerChange;
    };
  }, [fixAnimations]);

  // Listen for power state changes from the parent component
  useEffect(() => {
    if (typeof isScreenPoweredOn !== "undefined") {
      // Track previous power state
      const prevPowered = clippyElementRef.current?.dataset.powered === "true";

      // Store current power state
      if (clippyElementRef.current) {
        clippyElementRef.current.dataset.powered = isScreenPoweredOn;
      }

      // If power state changed from off to on, fix animations
      if (isScreenPoweredOn && !prevPowered) {
        // Only try to restore animations if not inside MonitorView
        if (!isInsideMonitorView()) {
          // Wait for transition to complete
          setTimeout(fixAnimations, 500);
        }
      }
    }
  }, [isScreenPoweredOn, fixAnimations]);

  // Store clippy instance and set up enhanced play method
  useEffect(() => {
    if (clippy) {
      setClippyInstance(clippy);
      window.clippy = clippy; // Store globally for easy access

      // Override the play method to ensure animations are visible
      const originalPlay = clippy.play;
      clippy.play = function (animation) {
        // Don't play animations when screen is off
        if (!isScreenPoweredOn) return;

        // CRITICAL: Prevent animation spam
        if (isAnimationPlaying) {
          console.log(`Animation already in progress, skipping: ${animation}`);
          return;
        }

        // Set flag to prevent multiple animations
        isAnimationPlaying = true;

        // Clear any existing debounce timeout
        if (animationDebounceTimeout) {
          clearTimeout(animationDebounceTimeout);
        }

        console.log(`Playing animation: ${animation}`);

        // Force Clippy element to be visible with classes
        const clippyEl = document.querySelector(".clippy");
        if (clippyEl) {
          clippyEl.classList.add("clippy-visible");
          clippyEl.classList.remove("clippy-hidden");

          // Find SVG elements and ensure they're visible
          const svgElements = clippyEl.querySelectorAll("svg");
          if (svgElements.length > 0) {
            svgElements.forEach((svg) => {
              svg.classList.add("clippy-visible");
            });
          }

          // Find animation maps
          const maps = clippyEl.querySelectorAll(".map");
          if (maps.length > 0) {
            // Add animate class to all maps to ensure visibility
            maps.forEach((map) => {
              map.classList.add("animate");
              map.classList.add("clippy-visible");
            });
          }
        }

        // Call original method
        try {
          const result = originalPlay.call(this, animation);

          // Reset the flag after animation completes (typical animation duration ~2s)
          animationDebounceTimeout = setTimeout(() => {
            isAnimationPlaying = false;
          }, 2000);

          return result;
        } catch (e) {
          console.error(`Error playing animation ${animation}:`, e);
          isAnimationPlaying = false; // Reset flag on error
        }
      };

      // Set up the enhanced balloon observer
      return setupBalloonObserver();
    }
  }, [clippy, setClippyInstance, setupBalloonObserver, isScreenPoweredOn]);

  // Modified useEffect for CSS styles
  useEffect(() => {
    if (document.getElementById("clippy-critical-styles")) return;

    const styleElement = document.createElement("style");
    styleElement.id = "clippy-critical-styles";

    // Common styles that don't change
    const commonStyles = `
    /* Common visibility classes */
    .clippy-visible {
      visibility: visible !important;
      opacity: 1 !important;
      display: block !important;
    }
    
    .clippy-hidden {
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    
    .clippy-no-events {
      pointer-events: none !important;
    }
    
    .clippy-overlay-visible {
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }
    
    .clippy-overlay-hidden {
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    
    /* Hide original clippy balloon */
    .clippy-balloon {
      visibility: hidden !important;
      opacity: 0 !important;
      display: none !important;
    }
    
    /* Ensure custom balloons are visible */
    .custom-clippy-balloon,
    .custom-clippy-chat-balloon {
      visibility: visible !important;
      opacity: 1 !important;
      display: block !important;
      overflow: visible !important;
      max-height: none !important;
      scrollbar-width: none !important;
    }
    
    .custom-clippy-balloon::-webkit-scrollbar,
    .custom-clippy-chat-balloon::-webkit-scrollbar {
      display: none !important;
    }
    
    /* Ensure Clippy displays properly */
    .clippy {
      visibility: visible !important;
      opacity: 1 !important;
      display: block !important;
      pointer-events: none !important;
      transform: scale(0.9) !important;
      transform-origin: center bottom !important;
      transition: visibility 0.3s, opacity 0.3s !important;
    }
    
    /* Mobile optimizations */
    @media (max-width: 768px) {
      .clippy {
        transform: scale(0.8) !important;
      }
      
      .custom-clippy-balloon,
      .custom-clippy-chat-balloon {
        font-size: 16px !important;
        max-width: 280px !important;
      }
    }
    
    /* CRITICAL: Animation fixes */
    .clippy .maps {
      position: relative !important;
      width: 100% !important;
      height: 100% !important;
    }

    .clippy .map {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      height: 100% !important;
      width: 100% !important;
      display: none !important;
    }

    .clippy .map.animate {
      display: block !important;
    }
    
    /* Always make animated elements visible */
    .clippy .map.animate,
    .clippy .map.animate *,
    .clippy [class*="animate"],
    .clippy .animate,
    .clippy .animate * {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    /* SVG animation support */
    .clippy svg,
    .clippy svg * {
      visibility: visible !important;
      opacity: 1 !important;
      display: inline !important;
    }
    
    /* Clickable overlay */
    #clippy-clickable-overlay {
      position: fixed !important;
      cursor: pointer !important;
      pointer-events: auto !important;
      display: block !important;
      visibility: visible !important;
      background: transparent !important;
      transition: visibility 0.3s !important;
    }
    
    /* Override screen power state for Clippy */
    body.screen-off .clippy,
    body.screen-off #clippy-clickable-overlay,
    body.screen-off .custom-clippy-balloon,
    body.screen-off .custom-clippy-chat-balloon {
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;

    // Check if we're inside MonitorView and set appropriate z-index values
    if (isInsideMonitorView()) {
      // Use MonitorView compatible z-index values
      styleElement.textContent = `
      ${commonStyles}
      
      /* Z-index standardization for MonitorView compatibility */
      .clippy {
        z-index: 1001 !important;
      }
      
      #clippy-clickable-overlay {
        z-index: 1002 !important;
      }
      
      .custom-clippy-balloon, 
      .custom-clippy-chat-balloon {
        z-index: 1003 !important;
      }
    `;
    } else {
      // Use original z-index values
      styleElement.textContent = `
      ${commonStyles}
      
      /* Original z-index standardization */
      .clippy {
        z-index: 2000 !important;
      }
      
      #clippy-clickable-overlay {
        z-index: 2010 !important;
      }
      
      .custom-clippy-balloon, 
      .custom-clippy-chat-balloon {
        z-index: 2100 !important;
      }
    `;
    }

    document.head.appendChild(styleElement);

    return () => {
      if (styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);

  // Add animation debugging helper
  useEffect(() => {
    window.fixClippyAnimations = () => {
      console.log("Applying emergency animation fix...");
      return fixAnimations();
    };

    return () => {
      delete window.fixClippyAnimations;
    };
  }, [fixAnimations, isScreenPoweredOn]);

  // Position Clippy at the bottom right of the screen
  useEffect(() => {
    if (!clippy || initialPositionAppliedRef.current) return;

    const applyInitialPosition = () => {
      const agentElements = document.querySelectorAll(".clippy");
      if (agentElements.length === 0) return false;

      const agentElement = agentElements[0];
      clippyElementRef.current = agentElement;

      // Get desktop container - handle MonitorView specially
      const inMonitorView = isInsideMonitorView();
      const monitorScreen = inMonitorView
        ? document.querySelector(".monitor-screen")
        : null;
      const desktopElement =
        monitorScreen ||
        desktopViewportRef.current ||
        document.querySelector(".w98");

      if (!desktopElement) return false;

      // Calculate position - position at bottom right
      const desktopRect = desktopElement.getBoundingClientRect();
      desktopRectRef.current = desktopRect;

      // Position at bottom right with margins - use percentages for better scaling
      // Use more conservative margins in MonitorView to keep Clippy visible
      const rightMarginPercent = inMonitorView ? 0.12 : isMobile ? 0.15 : 0.1;
      const bottomMarginPercent = inMonitorView ? 0.12 : isMobile ? 0.15 : 0.1;

      const posX = desktopRect.width * (1 - rightMarginPercent);
      const posY = desktopRect.height * (1 - bottomMarginPercent);

      // Apply position
      const absoluteX = desktopRect.left + posX;
      const absoluteY = desktopRect.top + posY;

      // Add a class to handle styles
      agentElement.classList.add("clippy-positioned");

      // Directly position the Clippy element
      agentElement.style.position = "fixed";
      agentElement.style.left = `${absoluteX}px`;
      agentElement.style.top = `${absoluteY}px`;
      agentElement.style.right = "auto";
      agentElement.style.bottom = "auto";

      // Set visibility based on screen power
      if (isScreenPoweredOn) {
        agentElement.classList.add("clippy-visible");
        agentElement.classList.remove("clippy-hidden");
      } else {
        agentElement.classList.add("clippy-hidden");
        agentElement.classList.remove("clippy-visible");
      }

      // Position the overlay
      if (clippyOverlayRef.current) {
        clippyOverlayRef.current.style.left = `${absoluteX}px`;
        clippyOverlayRef.current.style.top = `${absoluteY}px`;
        clippyOverlayRef.current.style.width = `${agentElement.offsetWidth}px`;
        clippyOverlayRef.current.style.height = `${agentElement.offsetHeight}px`;

        if (isScreenPoweredOn) {
          clippyOverlayRef.current.classList.add("clippy-overlay-visible");
          clippyOverlayRef.current.classList.remove("clippy-overlay-hidden");
        } else {
          clippyOverlayRef.current.classList.add("clippy-overlay-hidden");
          clippyOverlayRef.current.classList.remove("clippy-overlay-visible");
        }
      }

      // Update position state
      setPosition({ x: posX, y: posY });

      initialPositionAppliedRef.current = true;
      return true;
    };

    // Try to apply position with retry
    if (!applyInitialPosition()) {
      const interval = setInterval(() => {
        if (applyInitialPosition()) clearInterval(interval);
      }, 500);
      setTimeout(() => clearInterval(interval), 5000);
    }
  }, [clippy, setPosition, isScreenPoweredOn, isMobile]);

  // Handle window resize - Keep Clippy at bottom right with requestAnimationFrame
  // This is the ONLY positioning RAF we'll use - all others will be disabled
  useEffect(() => {
    // Skip if we're using global positioning from ClippyManager
    if (useGlobalPositioning && window._clippyGlobalPositioningActive) {
      console.log(
        "Using global positioning system, skipping local positioning"
      );
      return;
    }

    // Mark that we're using global positioning
    window._clippyGlobalPositioningActive = true;
    globalPositioningLock = true;
    window._clippyPositionLocked = true;

    const updatePositionFrame = (timestamp) => {
      // Adjust timing based on environment
      // Use even slower updates in MonitorView
      const inMonitorView = isInsideMonitorView();
      const updateInterval = inMonitorView ? 1500 : isMobile ? 1000 : 250;

      if (timestamp - lastUpdateRef.current > updateInterval) {
        if (initialPositionAppliedRef.current && !globalPositioningLock) {
          // Get appropriate container based on environment
          const monitorScreen = inMonitorView
            ? document.querySelector(".monitor-screen")
            : null;
          const desktopElement =
            monitorScreen ||
            desktopViewportRef.current ||
            document.querySelector(".w98");

          if (desktopElement && !isAnimationPlaying) {
            const desktopRect = desktopElement.getBoundingClientRect();
            const agentElement = document.querySelector(".clippy");

            if (agentElement) {
              // Position at bottom right with margins - use percentages for better scaling
              // Use more conservative margins in MonitorView
              const rightMarginPercent = inMonitorView
                ? 0.12
                : isMobile
                ? 0.15
                : 0.1;
              const bottomMarginPercent = inMonitorView
                ? 0.12
                : isMobile
                ? 0.15
                : 0.1;

              const posX = desktopRect.width * (1 - rightMarginPercent);
              const posY = desktopRect.height * (1 - bottomMarginPercent);

              // Apply position
              const absoluteX = desktopRect.left + posX;
              const absoluteY = desktopRect.top + posY;

              // Store last position to detect significant changes
              if (!window._lastClippyPosition) {
                window._lastClippyPosition = { x: absoluteX, y: absoluteY };
              }

              // Only update if position changed significantly
              // Use larger threshold in MonitorView for better performance
              const positionThreshold = inMonitorView ? 8 : 5;
              const xDiff = Math.abs(window._lastClippyPosition.x - absoluteX);
              const yDiff = Math.abs(window._lastClippyPosition.y - absoluteY);

              if (xDiff > positionThreshold || yDiff > positionThreshold) {
                agentElement.style.left = `${absoluteX}px`;
                agentElement.style.top = `${absoluteY}px`;

                // Update overlay position too
                const overlay = document.getElementById(
                  "clippy-clickable-overlay"
                );
                if (overlay) {
                  overlay.style.left = `${absoluteX}px`;
                  overlay.style.top = `${absoluteY}px`;
                  overlay.style.width = `${agentElement.offsetWidth}px`;
                  overlay.style.height = `${agentElement.offsetHeight}px`;
                }

                // Save new position
                window._lastClippyPosition = { x: absoluteX, y: absoluteY };

                // Update position state (less frequently)
                setPosition({ x: posX, y: posY });
              }
            }
          }
        }

        lastUpdateRef.current = timestamp;
      }

      rafIdRef.current = requestAnimationFrame(updatePositionFrame);
    };

    // Start the animation frame for position updates
    rafIdRef.current = requestAnimationFrame(updatePositionFrame);

    // Store reference for global cleanup
    if (!window._clippyAnimationFrames) {
      window._clippyAnimationFrames = [];
    }
    window._clippyAnimationFrames.push(rafIdRef.current);

    // Handle window resize by letting the animation frame handle it
    const handleResize = () => {
      // Reset last update time to force an immediate update on resize
      lastUpdateRef.current = 0;

      // Temporarily unlock positioning during resize
      const wasPosLocked = globalPositioningLock;
      if (wasPosLocked) {
        globalPositioningLock = false;
        window._clippyPositionLocked = false;

        // Re-lock after resize completes
        setTimeout(() => {
          globalPositioningLock = true;
          window._clippyPositionLocked = true;
        }, 500);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);

        // Remove from global list
        if (window._clippyAnimationFrames) {
          window._clippyAnimationFrames = window._clippyAnimationFrames.filter(
            (id) => id !== rafIdRef.current
          );
        }
      }

      // Clean up global positioning flag
      delete window._clippyGlobalPositioningActive;

      window.removeEventListener("resize", handleResize);
    };
  }, [setPosition, isMobile, initialPositionAppliedRef, useGlobalPositioning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel animation frame if running
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;

        // Remove from global list
        if (window._clippyAnimationFrames) {
          window._clippyAnimationFrames = window._clippyAnimationFrames.filter(
            (id) => id !== rafIdRef.current
          );
        }
      }

      // Remove any custom styles
      const styleElements = [
        document.getElementById("clippy-critical-styles"),
        document.getElementById("clippy-animation-fix"),
        document.getElementById("clippy-animation-fix-temp"),
        document.getElementById("clippy-manual-fix"),
      ];

      styleElements.forEach((el) => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });

      // Remove overlay
      if (clippyOverlayRef.current && clippyOverlayRef.current.parentNode) {
        clippyOverlayRef.current.parentNode.removeChild(
          clippyOverlayRef.current
        );
      }

      // Disconnect observer
      if (balloonObserverRef.current) {
        balloonObserverRef.current.disconnect();
      }

      // Reset global flags
      delete window._clippyGlobalPositioningActive;
    };
  }, []);

  return null; // This component just adds the overlay and functionality
};

export default ClippyController;
