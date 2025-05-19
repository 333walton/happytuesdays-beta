import React, { useEffect, useRef, useCallback } from "react";
import { useClippy } from "@react95/clippy";

/**
 * Component to handle Clippy positioning and interactions
 * This is a standalone controller that will add necessary DOM elements
 * and handle all the interactions for Clippy.
 */
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

  // Calculate bounded position helper
  const calculateBoundedPosition = useCallback(
    (x, y, desktopRect = null) => {
      if (!desktopRect && !desktopRectRef.current) return { x, y };

      const rect = desktopRect || desktopRectRef.current;
      const desktopWidth = rect.width;
      const desktopHeight = rect.height;

      const clippyWidth = clippySizeRef.current.width || 100;
      const clippyHeight = clippySizeRef.current.height || 100;

      const padding = 5;
      const maxX = Math.max(0, desktopWidth - clippyWidth - padding);
      const maxY = Math.max(0, desktopHeight - clippyHeight - padding);

      return {
        x: Math.min(Math.max(padding, x), maxX),
        y: Math.min(Math.max(padding, y), maxY),
      };
    },
    [desktopRectRef]
  );

  // Set up the balloon observer - enhanced to redirect content
  const setupBalloonObserver = useCallback(() => {
    if (balloonObserverRef.current) {
      balloonObserverRef.current.disconnect();
    }

    // Create an observer for balloon changes that redirects to our custom balloons
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            if (node.classList && node.classList.contains("clippy-balloon")) {
              // Hide the default balloon
              node.style.visibility = "hidden";
              node.style.opacity = "0";
              node.style.display = "none";

              // Don't show balloons when screen is off
              if (!isScreenPoweredOn) return;

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

    observer.observe(document.body, { childList: true, subtree: true });
    balloonObserverRef.current = observer;

    // Check periodically for balloons
    const intervalId = setInterval(() => {
      // Don't process balloons when screen is off
      if (!isScreenPoweredOn) return;

      const balloon = document.querySelector(".clippy-balloon");
      if (balloon) {
        // Get content and redirect to custom balloon
        const content = balloon.querySelector(".clippy-content");
        if (content && content.textContent && window.showClippyCustomBalloon) {
          balloon.style.visibility = "hidden";
          balloon.style.opacity = "0";
          balloon.style.display = "none";
          window.showClippyCustomBalloon(content.textContent);
        } else {
          // Just hide it if we can't redirect
          balloon.style.visibility = "hidden";
          balloon.style.opacity = "0";
          balloon.style.display = "none";
        }
      }
    }, 300);

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, [isScreenPoweredOn]); // Add isScreenPoweredOn as dependency

  // Find desktop viewport container
  useEffect(() => {
    if (!desktopViewportRef.current) {
      const desktopElement = document.querySelector(".w98");
      if (desktopElement) {
        desktopViewportRef.current = desktopElement;
        desktopRectRef.current = desktopElement.getBoundingClientRect();
      }
    }
  }, [desktopRectRef]);

  // Handle interactions for Clippy using our custom balloon
  const handleClippyInteraction = useCallback(() => {
    if (!clippy || !isScreenPoweredOn) return; // Don't interact when screen is off

    console.log("Handling Clippy interaction");

    // Force Clippy element to be visible
    const clippyEl = document.querySelector(".clippy");
    if (!clippyEl) {
      console.error("Clippy element not found");
      return;
    }

    // CRITICAL: Make clippy and its children visible
    clippyEl.style.visibility = "visible";
    clippyEl.style.opacity = "1";
    clippyEl.style.display = "block";

    // Find and make visible any SVG elements
    const svgElements = clippyEl.querySelectorAll("svg");
    if (svgElements.length > 0) {
      svgElements.forEach((svg) => {
        svg.style.visibility = "visible";
        svg.style.opacity = "1";
        svg.style.display = "inline";

        // Make all SVG children visible too
        Array.from(svg.querySelectorAll("*")).forEach((el) => {
          el.style.visibility = "visible";
          el.style.opacity = "1";
          el.style.display = "inline";
        });
      });
    }

    // Play animation with slight delay to ensure visibility
    setTimeout(() => {
      // List of common animations that work well
      const animations = ["Greeting", "Wave", "GetAttention"];
      const randomAnim =
        animations[Math.floor(Math.random() * animations.length)];

      // Apply temporary animation fix
      const fixStyle = document.createElement("style");
      fixStyle.id = "clippy-temp-fix";
      fixStyle.textContent = `
        .clippy * {
          visibility: visible !important;
          opacity: 1 !important;
          display: block !important;
        }
        
        .clippy-animate,
        .clippy-animate * {
          visibility: visible !important;
          opacity: 1 !important;
          display: block !important;
          animation: auto !important;
        }
      `;
      document.head.appendChild(fixStyle);

      console.log(`Playing animation: ${randomAnim}`);
      try {
        clippy.play(randomAnim);
        console.log("Animation triggered successfully");
      } catch (e) {
        console.error("Error playing animation:", e);
      }

      // Remove the style after animation
      setTimeout(() => {
        if (fixStyle.parentNode) {
          fixStyle.parentNode.removeChild(fixStyle);
        }
      }, 3000);

      // Show speech balloon after animation
      setTimeout(() => {
        if (!isScreenPoweredOn) return; // Don't show balloon if screen is off

        // Increment counter
        clickCounterRef.current = (clickCounterRef.current + 1) % 3;

        // Only show speech on every 3rd click or first click
        if (clickCounterRef.current === 0 || clickCounterRef.current === 1) {
          const phrases = [
            "Hello there! How can I help you?",
            "Need some assistance?",
            "I'm here to help! What can I do for you?",
            "Looking for some help?",
            "What can I help you with today?",
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
      }, 800); // Delay to let animation play first
    }, 50);
  }, [clippy, isScreenPoweredOn]); // Add isScreenPoweredOn as dependency

  // Setup double-click and right-click handlers with overlay
  useEffect(() => {
    if (!clippy) return;

    const setupHandlers = () => {
      // Find the Clippy element
      const agentElements = document.querySelectorAll(".clippy");
      if (agentElements.length === 0) return false;

      const agentElement = agentElements[0];
      clippyElementRef.current = agentElement;

      // CRITICAL: Make Clippy non-interactive (pointer-events: none)
      // This is key to fixing animation issues
      agentElement.style.pointerEvents = "none";
      agentElement.style.visibility = isScreenPoweredOn ? "visible" : "hidden";
      agentElement.style.opacity = isScreenPoweredOn ? "1" : "0";
      agentElement.style.display = "block";
      agentElement.style.transition = "visibility 0.3s, opacity 0.3s";
      agentElement.style.zIndex = "1001"; // Set z-index higher than black overlay

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
        overlay.style.zIndex = "1002"; // Higher than Clippy
        overlay.style.cursor = "pointer";
        overlay.style.background = "transparent";
        overlay.style.pointerEvents = isScreenPoweredOn ? "auto" : "none";
        overlay.style.visibility = isScreenPoweredOn ? "visible" : "hidden";
        overlay.style.transition = "visibility 0.3s";

        clippyOverlayRef.current = overlay;
        document.body.appendChild(overlay);

        // Add double-click handler
        overlay.addEventListener("dblclick", (e) => {
          if (!isScreenPoweredOn) return; // Don't interact when screen is off
          e.preventDefault();
          e.stopPropagation();
          handleClippyInteraction();
        });

        // Add right-click handler
        overlay.addEventListener("contextmenu", (e) => {
          if (!isScreenPoweredOn) return; // Don't interact when screen is off
          e.preventDefault();
          e.stopPropagation();

          // Show Clippy's speech bubble with a simple message
          if (window.showClippyCustomBalloon) {
            // Force Clippy visible first
            const clippyEl = document.querySelector(".clippy");
            if (clippyEl) {
              clippyEl.style.visibility = "visible";
              clippyEl.style.opacity = "1";
              clippyEl.style.display = "block";
            }

            setTimeout(() => {
              clippy.play("GetAttention");

              setTimeout(() => {
                window.showClippyCustomBalloon(
                  "Right-click me for more options!"
                );
              }, 500);
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
      setTimeout(() => clearInterval(interval), 10000);
      return () => clearInterval(interval);
    }
  }, [clippy, handleClippyInteraction, isScreenPoweredOn]); // Add isScreenPoweredOn as dependency

  // Update Clippy visibility when screen power changes
  useEffect(() => {
    if (!clippyElementRef.current && !clippyOverlayRef.current) return;

    const clippyElement =
      clippyElementRef.current || document.querySelector(".clippy");
    const overlayElement =
      clippyOverlayRef.current ||
      document.getElementById("clippy-clickable-overlay");

    if (clippyElement) {
      clippyElement.style.visibility = isScreenPoweredOn ? "visible" : "hidden";
      clippyElement.style.opacity = isScreenPoweredOn ? "1" : "0";

      if (overlayElement) {
        overlayElement.style.visibility = isScreenPoweredOn
          ? "visible"
          : "hidden";
        overlayElement.style.pointerEvents = isScreenPoweredOn
          ? "auto"
          : "none";
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
          originalBalloon.style.visibility = "hidden";
          originalBalloon.style.opacity = "0";
          originalBalloon.style.display = "none";
        }
      }
    }
  }, [isScreenPoweredOn]);

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

        console.log(`Enhanced play: ${animation}`);

        // Force Clippy element to be visible
        const clippyEl = document.querySelector(".clippy");
        if (clippyEl) {
          clippyEl.style.visibility = "visible";
          clippyEl.style.opacity = "1";
          clippyEl.style.display = "block";

          // Find and make visible any SVG elements
          const svgElements = clippyEl.querySelectorAll("svg");
          if (svgElements.length > 0) {
            svgElements.forEach((svg) => {
              svg.style.visibility = "visible";
              svg.style.opacity = "1";
              svg.style.display = "inline";

              // Make all SVG children visible too
              Array.from(svg.querySelectorAll("*")).forEach((el) => {
                el.style.visibility = "visible";
                el.style.opacity = "1";
                el.style.display = "inline";
              });
            });
          }

          // Find animation maps
          const maps = clippyEl.querySelectorAll(".map");
          if (maps.length > 0) {
            console.log(`Found ${maps.length} animation maps`);

            // Add animate class to all maps to ensure visibility
            maps.forEach((map) => {
              map.classList.add("animate");
              map.style.display = "block";
              map.style.visibility = "visible";
              map.style.opacity = "1";
            });
          }
        }

        // Apply global animation fix
        const styleEl = document.createElement("style");
        styleEl.id = "clippy-animation-fix-temp";
        styleEl.textContent = `
          .clippy * {
            visibility: visible !important;
            opacity: 1 !important;
            display: block !important;
          }
          
          .clippy-animate,
          .clippy-animate * {
            visibility: visible !important;
            opacity: 1 !important;
            display: block !important;
            animation: auto !important;
          }
        `;
        document.head.appendChild(styleEl);

        // Remove the style after animation
        setTimeout(() => {
          if (styleEl.parentNode) {
            styleEl.parentNode.removeChild(styleEl);
          }
        }, 3000);

        // Call original method
        try {
          return originalPlay.call(this, animation);
        } catch (e) {
          console.error(`Error playing animation ${animation}:`, e);
        }
      };

      // Set up the enhanced balloon observer
      return setupBalloonObserver();
    }
  }, [clippy, setClippyInstance, setupBalloonObserver, isScreenPoweredOn]); // Add isScreenPoweredOn as dependency

  // Add critical CSS styles for animations
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.id = "clippy-animation-styles";
    styleElement.textContent = `
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
        overflow: visible !important; /* Remove scrollbars */
        max-height: none !important; /* Remove height restriction */
        scrollbar-width: none !important; /* Firefox */
      }
      
      .custom-clippy-balloon::-webkit-scrollbar,
      .custom-clippy-chat-balloon::-webkit-scrollbar {
        display: none !important; /* Chrome/Safari/Edge */
      }
      
      /* Ensure Clippy displays properly */
      .clippy {
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
        pointer-events: none !important;
        transform: scale(0.9) !important;
        transform-origin: center bottom !important;
        z-index: 1001 !important; /* Higher than black overlay (999) */
        transition: visibility 0.3s, opacity 0.3s !important;
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
        z-index: 1002 !important; /* Higher than clippy */
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

      // Force animations to work
      const styleEl = document.createElement("style");
      styleEl.id = "clippy-emergency-fix";
      styleEl.textContent = `
        .clippy * {
          visibility: visible !important;
          opacity: 1 !important;
          display: block !important;
        }
        
        .clippy-animate,
        .clippy-animate * {
          visibility: visible !important;
          opacity: 1 !important;
          display: block !important;
          animation: auto !important;
        }
        
        /* Ensure transform doesn't block animations */
        .clippy {
          transform: scale(0.9) !important;
          transform-origin: center bottom !important;
          z-index: 1001 !important; /* Higher than black overlay */
        }
        
        /* Keep overlay above clippy */
        #clippy-clickable-overlay {
          z-index: 1002 !important;
        }
      `;
      document.head.appendChild(styleEl);

      // Force play a test animation
      setTimeout(() => {
        if (window.clippy && window.clippy.play && isScreenPoweredOn) {
          try {
            window.clippy.play("Wave");
            console.log("Test animation triggered");
          } catch (e) {
            console.error("Test animation failed:", e);
          }
        }
      }, 100);

      console.log("Animation fix applied");
      return "Animation fix applied";
    };

    return () => {
      delete window.fixClippyAnimations;
    };
  }, [isScreenPoweredOn]);

  // Position Clippy at the bottom right of the screen
  useEffect(() => {
    if (!clippy || initialPositionAppliedRef.current) return;

    const applyInitialPosition = () => {
      const agentElements = document.querySelectorAll(".clippy");
      if (agentElements.length === 0) return false;

      const agentElement = agentElements[0];
      clippyElementRef.current = agentElement;

      // Get desktop container
      const desktopElement =
        desktopViewportRef.current || document.querySelector(".w98");
      if (!desktopElement) return false;

      // Calculate position - position at bottom right
      const desktopRect = desktopElement.getBoundingClientRect();
      desktopRectRef.current = desktopRect;

      // Position at bottom right with margins
      const posX = desktopRect.width - 120; // 120px from right edge
      const posY = desktopRect.height - 150; // 150px from bottom

      // Apply position
      const absoluteX = desktopRect.left + posX;
      const absoluteY = desktopRect.top + posY;

      // Directly position the Clippy element
      agentElement.style.position = "fixed";
      agentElement.style.left = `${absoluteX}px`;
      agentElement.style.top = `${absoluteY}px`;
      agentElement.style.right = "auto";
      agentElement.style.bottom = "auto";
      agentElement.style.visibility = isScreenPoweredOn ? "visible" : "hidden";
      agentElement.style.opacity = isScreenPoweredOn ? "1" : "0";
      agentElement.style.display = "block";
      agentElement.style.pointerEvents = "none";
      agentElement.style.transformOrigin = "center bottom";
      agentElement.style.zIndex = "1001"; // Higher than black overlay (999)

      // Position the overlay
      if (clippyOverlayRef.current) {
        clippyOverlayRef.current.style.left = `${absoluteX}px`;
        clippyOverlayRef.current.style.top = `${absoluteY}px`;
        clippyOverlayRef.current.style.width = `${agentElement.offsetWidth}px`;
        clippyOverlayRef.current.style.height = `${agentElement.offsetHeight}px`;
        clippyOverlayRef.current.style.visibility = isScreenPoweredOn
          ? "visible"
          : "hidden";
        clippyOverlayRef.current.style.pointerEvents = isScreenPoweredOn
          ? "auto"
          : "none";
        clippyOverlayRef.current.style.zIndex = "1002"; // Higher than clippy
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
  }, [clippy, setPosition, isScreenPoweredOn]);

  // Handle window resize - Keep Clippy at bottom right
  useEffect(() => {
    const handleResize = () => {
      if (initialPositionAppliedRef.current) {
        const desktopElement =
          desktopViewportRef.current || document.querySelector(".w98");
        if (!desktopElement) return;

        const desktopRect = desktopElement.getBoundingClientRect();
        const agentElement = document.querySelector(".clippy");

        if (agentElement) {
          // Position at bottom right with margins
          const posX = desktopRect.width - 120; // 120px from right
          const posY = desktopRect.height - 150; // 150px from bottom

          // Apply position
          const absoluteX = desktopRect.left + posX;
          const absoluteY = desktopRect.top + posY;

          agentElement.style.left = `${absoluteX}px`;
          agentElement.style.top = `${absoluteY}px`;

          // Update overlay position too
          const overlay = document.getElementById("clippy-clickable-overlay");
          if (overlay) {
            overlay.style.left = `${absoluteX}px`;
            overlay.style.top = `${absoluteY}px`;
            overlay.style.width = `${agentElement.offsetWidth}px`;
            overlay.style.height = `${agentElement.offsetHeight}px`;
          }

          // Update position state
          setPosition({ x: posX, y: posY });
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Remove any custom styles
      const styleElements = [
        document.getElementById("clippy-animation-styles"),
        document.getElementById("clippy-emergency-fix"),
        document.getElementById("clippy-animation-fix-temp"),
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
    };
  }, []);

  return null; // This component just adds the overlay and functionality
};

export default ClippyController;
