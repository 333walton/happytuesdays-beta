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
import "./_styles.scss";

// Create context
const ClippyContext = createContext(null);

/**
 * Provider component that makes Clippy available throughout the app
 */
const ClippyProvider = ({
  children,
  defaultAgent = "Clippy",
  fixedPosition = false, // New prop to fix Clippy in place
}) => {
  // Initialize position within the desktop viewport
  const [assistantVisible, setAssistantVisible] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(defaultAgent);
  const [position, setPosition] = useState(() => {
    return {
      // Position in the bottom-right corner of the desktop viewport
      x: 520, // Within the 640px width desktop
      y: 360, // Within the 480px height desktop
    };
  });
  const [userPositioned, setUserPositioned] = useState(false);
  const clippyInstanceRef = useRef(null);
  const desktopRectRef = useRef(null);
  const isMobileRef = useRef(false);

  // Detect if the user is on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobileCheck =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      isMobileRef.current = mobileCheck;
      console.log("Is mobile device:", mobileCheck);
    };

    checkMobile();
  }, []);

  // Make context values available globally for ClippyService
  useEffect(() => {
    window.setAssistantVisible = setAssistantVisible;
    window.setCurrentAgent = setCurrentAgent;
    window.setClippyPosition = (newPos) => {
      // Only allow position changes if not fixed
      if (!fixedPosition) {
        setPosition(newPos);
        setUserPositioned(false);
      }
    };
    window.getClippyInstance = () => clippyInstanceRef.current;

    return () => {
      delete window.setAssistantVisible;
      delete window.setCurrentAgent;
      delete window.setClippyPosition;
      delete window.getClippyInstance;
    };
  }, [fixedPosition]);

  // Gather all values for the context
  const contextValue = {
    assistantVisible,
    setAssistantVisible,
    currentAgent,
    setCurrentAgent,
    position,
    setPosition: fixedPosition ? () => {} : setPosition, // Prevent position changes if fixed
    userPositioned,
    setUserPositioned: fixedPosition ? () => {} : setUserPositioned, // Prevent user positioning if fixed
    desktopRectRef,
    isMobileRef,
    fixedPosition,
    setClippyInstance: (instance) => {
      clippyInstanceRef.current = instance;
      window.clippy = instance;
    },
    getClippyInstance: () => clippyInstanceRef.current,
  };

  return (
    <ClippyContext.Provider value={contextValue}>
      <ReactClippyProvider agentName={currentAgent}>
        {children}

        <ClippyController
          visible={assistantVisible}
          position={position}
          userPositioned={userPositioned}
          setUserPositioned={setUserPositioned}
          setPosition={setPosition}
          desktopRectRef={desktopRectRef}
          isMobileRef={isMobileRef}
          fixedPosition={fixedPosition} // Pass fixedPosition to the controller
          setClippyInstance={(instance) => {
            clippyInstanceRef.current = instance;
            window.clippy = instance;
          }}
        />
      </ReactClippyProvider>
    </ClippyContext.Provider>
  );
};

/*Component to handle Clippy positioning and visibility*/
const ClippyController = ({
  visible,
  position,
  userPositioned,
  setUserPositioned,
  setPosition,
  desktopRectRef,
  isMobileRef,
  fixedPosition, // Added fixedPosition prop
  setClippyInstance,
}) => {
  const { clippy } = useClippy();
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    hasMoved: false, // Track if mouse has actually moved during drag
  });
  const initialPositionAppliedRef = useRef(false);
  const hasBeenDraggedRef = useRef(false); // Track if Clippy has ever been dragged
  const desktopViewportRef = useRef(null);
  const clippyElementRef = useRef(null);
  const clippySizeRef = useRef({ width: 100, height: 100 });
  const lastClickTimeRef = useRef(0); // For tracking double clicks
  const balloonObserverRef = useRef(null); // For storing the MutationObserver reference

  // Relative position percentages (for responsive positioning)
  const relativePositionRef = useRef({
    xPercent: 0.81, // ~520/640
    yPercent: 0.75, // ~360/480
  });

  // Function to reposition the balloon
  const repositionClippyBalloon = useCallback(() => {
    const clippy = document.querySelector(".clippy");
    const balloon = document.querySelector(".clippy-balloon");

    if (!clippy || !balloon) return;

    // Get Clippy's position
    const clippyRect = clippy.getBoundingClientRect();

    // Get viewport bounds
    const viewportEl = document.querySelector(".w98");
    const viewportRect = viewportEl
      ? viewportEl.getBoundingClientRect()
      : {
          left: 0,
          top: 0,
          right: window.innerWidth,
          bottom: window.innerHeight,
        };

    // Style the balloon
    balloon.style.cssText = `
    position: fixed !important;
    z-index: 9999 !important;
    left: ${clippyRect.left - 10}px !important;
    top: ${clippyRect.top - 150}px !important;
    background-color: #fffcde !important;
    border: 1px solid #000 !important;
    border-radius: 5px !important;
    padding: 8px !important;
    max-width: 250px !important;
  `;

    balloon.style.position = "fixed";
    balloon.style.zIndex = "1500";
    balloon.style.backgroundColor = "#fffcde";
    balloon.style.border = "1px solid #000";
    balloon.style.borderRadius = "5px";
    balloon.style.padding = "8px";
    balloon.style.maxWidth = "250px";
    //balloon.style.bottom = "250px";
    //balloon.style.height = "250px";
    //balloon.style.border = "3px solid red";
    balloon.style.left = `${clippyRect.left - 100}px !important`;
    balloon.style.top = `${clippyRect.top - 250}px !important`; // Use a large fixed value

    // If Clippy is fixed, ensure the balloon is properly positioned
    if (fixedPosition) {
      // Ensure the balloon is also using fixed positioning
      balloon.style.position = "fixed";
      balloon.style.zIndex = "9999";

      // Remove any transitions to prevent flashing
      balloon.style.transition = "none";
    }

    // Position higher above Clippy - increase the vertical offset
    const verticalOffset = 80; // Increase this value to position the balloon higher
    balloon.style.left = clippyRect.left - 10 + "px";
    balloon.style.top =
      clippyRect.top - balloon.offsetHeight - verticalOffset + "px";

    // Ensure the balloon stays within the viewport bounds
    const balloonRect = balloon.getBoundingClientRect();

    // Check if balloon goes off the top of the viewport
    if (balloonRect.top < viewportRect.top + 10) {
      // If it goes off the top, position it to the right of Clippy instead
      balloon.style.left = clippyRect.right + 15 + "px";
      balloon.style.top = clippyRect.top - 10 + "px";
    }

    // Check if balloon goes off the right side of the viewport
    if (balloonRect.right > viewportRect.right - 10) {
      // If it goes off the right, position it to the left of Clippy
      balloon.style.left = clippyRect.left - balloon.offsetWidth - 15 + "px";
      balloon.style.top = clippyRect.top - 10 + "px";
    }

    // Remove any existing custom tips
    const existingTips = balloon.querySelectorAll(".custom-tip");
    existingTips.forEach((tip) => {
      if (tip && tip.parentNode) {
        tip.parentNode.removeChild(tip);
      }
    });

    // Hide any original tips
    const originalTips = balloon.querySelectorAll(".clippy-tip");
    originalTips.forEach((origTip) => {
      origTip.style.display = "none";
    });
  }, []);

  // Set up the balloon observer
  const setupBalloonObserver = useCallback(() => {
    // Clean up existing observer if any
    if (balloonObserverRef.current) {
      balloonObserverRef.current.disconnect();
    }

    // Create an observer
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.classList && node.classList.contains("clippy-balloon")) {
              setTimeout(repositionClippyBalloon, 0);
              return;
            }
          }
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Store observer reference for cleanup
    balloonObserverRef.current = observer;

    // Also check periodically
    const intervalId = setInterval(repositionClippyBalloon, 500);

    // Check on window resize
    window.addEventListener("resize", repositionClippyBalloon);

    // Call immediately in case the balloon is already present
    repositionClippyBalloon();

    // Return cleanup function
    return () => {
      observer.disconnect();
      clearInterval(intervalId);
      window.removeEventListener("resize", repositionClippyBalloon);
    };
  }, [repositionClippyBalloon]);

  // Define calculateBoundedPosition as a useCallback to avoid dependency issues
  const calculateBoundedPosition = useCallback(
    (x, y, desktopRect = null) => {
      if (!desktopRect && !desktopRectRef.current) return { x, y };

      // Use provided desktop rect or the stored one
      const rect = desktopRect || desktopRectRef.current;
      const desktopWidth = rect.width;
      const desktopHeight = rect.height;

      // Use actual Clippy size if available, otherwise fallback to estimates
      const clippyWidth = clippySizeRef.current.width || 100;
      const clippyHeight = clippySizeRef.current.height || 100;

      // Add some padding to prevent clipping at edges
      const padding = 5;
      const maxX = Math.max(0, desktopWidth - clippyWidth - padding);
      const maxY = Math.max(0, desktopHeight - clippyHeight - padding);

      // Constrain position
      return {
        x: Math.min(Math.max(padding, x), maxX),
        y: Math.min(Math.max(padding, y), maxY),
      };
    },
    [desktopRectRef]
  );

  // Find desktop viewport container
  useEffect(() => {
    if (!desktopViewportRef.current) {
      // Look for the desktop viewport element
      const desktopElement = document.querySelector(".w98");
      if (desktopElement) {
        desktopViewportRef.current = desktopElement;
        // Store initial desktop rect
        desktopRectRef.current = desktopElement.getBoundingClientRect();
        console.log("Found desktop element:", desktopElement);
      }
    }
  }, [desktopRectRef]);

  // Handle single click on mobile and double click on desktop
  const handleClippyClick = useCallback(
    (e) => {
      if (!clippy) return;

      // Check if it's a mobile device
      const isMobile = isMobileRef.current;

      // For mobile devices, handle single click
      if (isMobile) {
        console.log("Mobile single click detected");

        // Pick a random animation for mobile
        const mobileAnims = ["Wave", "GetAttention", "Greeting"];
        const randomAnim =
          mobileAnims[Math.floor(Math.random() * mobileAnims.length)];

        // Play animation
        if (clippy.play) {
          clippy.play(randomAnim);
        }

        // Make Clippy speak (for mobile)
        if (clippy.speak) {
          const mobilePhrases = [
            "Tap detected! How can I help you?",
            "Hello mobile user!",
            "I'm here to assist on your device!",
            "Need help with something on your mobile device?",
          ];
          const randomPhrase =
            mobilePhrases[Math.floor(Math.random() * mobilePhrases.length)];
          clippy.speak(randomPhrase);
        }
      }
    },
    [clippy, isMobileRef]
  );

  // Handle double-click on desktop
  const handleDoubleClick = useCallback(
    (e) => {
      if (!clippy) return;

      // Check if it's NOT a mobile device (desktop)
      const isMobile = isMobileRef.current;

      // Only process double-clicks on desktop
      if (!isMobile) {
        console.log("Desktop double-click detected");

        // Simulate a Clippy animation or interaction on double-click
        try {
          // Desktop-specific animations
          const desktopAnims = [
            "Congratulate",
            "GetAttention",
            "GetTechy",
            "Thinking",
          ];
          const randomAnim =
            desktopAnims[Math.floor(Math.random() * desktopAnims.length)];

          if (clippy.play) {
            clippy.play(randomAnim);
          }

          // Make Clippy speak (for desktop)
          if (clippy.speak) {
            const desktopPhrases = [
              "Double-click detected! Need some desktop assistance?",
              "Hello there, desktop user!",
              "What can I help you with on your computer?",
              "It looks like you're using a computer. Need some help?",
            ];
            const randomPhrase =
              desktopPhrases[Math.floor(Math.random() * desktopPhrases.length)];
            clippy.speak(randomPhrase);
          }
        } catch (error) {
          console.error("Error handling Clippy double-click:", error);
        }
      }
    },
    [clippy, isMobileRef]
  );

  // Function to set up Clippy click handlers based on device type
  const setupClippyClickHandlers = useCallback(() => {
    const agentElements = document.querySelectorAll(".clippy");
    if (agentElements.length === 0) return false;

    const agentElement = agentElements[0];

    // Remove any existing handlers to prevent duplicates
    agentElement.removeEventListener("click", handleClippyClick);
    agentElement.removeEventListener("dblclick", handleDoubleClick);

    // Add the appropriate handlers
    if (isMobileRef.current) {
      // For mobile devices, use click (tap) handler
      agentElement.addEventListener("click", handleClippyClick);
      console.log("Mobile click handler setup for Clippy");
    } else {
      // For desktop devices, use double-click handler
      agentElement.addEventListener("dblclick", handleDoubleClick);
      console.log("Desktop double-click handler setup for Clippy");
    }

    return true;
  }, [handleClippyClick, handleDoubleClick, isMobileRef]);

  // Add a new useEffect to set up the click handlers
  useEffect(() => {
    if (!clippy) return;

    // Try to set up the handlers immediately
    if (!setupClippyClickHandlers()) {
      // If not successful, retry with an interval
      const interval = setInterval(() => {
        if (setupClippyClickHandlers()) {
          clearInterval(interval);
        }
      }, 500);

      // Clear interval after 10 seconds maximum
      setTimeout(() => clearInterval(interval), 10000);

      return () => clearInterval(interval);
    }
  }, [clippy, setupClippyClickHandlers]);

  // Update Clippy's position based on current desktop dimensions and relative position
  const updateClippyPosition = useCallback(() => {
    // Skip position updates if fixed
    if (fixedPosition) return;

    if (!clippyElementRef.current || !desktopViewportRef.current) return;

    // Get updated desktop dimensions
    const desktopRect = desktopViewportRef.current.getBoundingClientRect();
    desktopRectRef.current = desktopRect;

    // Only update if we have a Clippy element
    const agentElement = clippyElementRef.current;
    if (!agentElement) return;

    // Get Clippy size
    const clipRect = agentElement.getBoundingClientRect();
    clippySizeRef.current = {
      width: clipRect.width,
      height: clipRect.height,
    };

    // Calculate new position based on relative percentages
    let newRelX = desktopRect.width * relativePositionRef.current.xPercent;
    let newRelY = desktopRect.height * relativePositionRef.current.yPercent;

    // Ensure the position stays within bounds using current desktop rect
    const boundedPos = calculateBoundedPosition(newRelX, newRelY, desktopRect);

    // Update relative percentages if bounded position is different
    if (boundedPos.x !== newRelX || boundedPos.y !== newRelY) {
      relativePositionRef.current = {
        xPercent: boundedPos.x / desktopRect.width,
        yPercent: boundedPos.y / desktopRect.height,
      };
    }

    // Calculate absolute position
    const newAbsX = desktopRect.left + boundedPos.x;
    const newAbsY = desktopRect.top + boundedPos.y;

    // Update Clippy position
    agentElement.style.left = `${newAbsX}px`;
    agentElement.style.top = `${newAbsY}px`;

    // Update position state to match
    setPosition(boundedPos);

    // Also reposition the balloon if it exists
    repositionClippyBalloon();
  }, [
    calculateBoundedPosition,
    desktopRectRef,
    setPosition,
    repositionClippyBalloon,
    fixedPosition,
  ]);

  // Listen for window resize events and reposition Clippy
  useEffect(() => {
    // Skip setting up resize handlers if Clippy is fixed
    if (fixedPosition) {
      // We still need to reposition the balloon on resize
      const handleResize = () => {
        requestAnimationFrame(() => {
          repositionClippyBalloon();
        });
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }

    // Add resize listener without debounce to update in real-time
    const handleResize = () => {
      requestAnimationFrame(() => {
        updateClippyPosition();
        repositionClippyBalloon();
      });
    };

    window.addEventListener("resize", handleResize);

    // Add a MutationObserver to detect changes to the desktop container
    if (desktopViewportRef.current) {
      const observer = new MutationObserver(() => {
        requestAnimationFrame(() => {
          updateClippyPosition();
          repositionClippyBalloon();
        });
      });

      // Observe the desktop element for attribute changes
      observer.observe(desktopViewportRef.current, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });

      // Clean up
      return () => {
        window.removeEventListener("resize", handleResize);
        observer.disconnect();
      };
    }

    // Clean up just resize listener if no desktop element
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [updateClippyPosition, repositionClippyBalloon, fixedPosition]);

  // Store clippy instance and set up balloon observer
  useEffect(() => {
    if (!clippy) return;

    console.log("Clippy instance:", clippy);
    setClippyInstance(clippy);

    // Initialize the balloon positioning system
    const cleanup = setupBalloonObserver();

    return cleanup;
  }, [clippy, setClippyInstance, setupBalloonObserver]);

  // Reduce Clippy size by 30%
  useEffect(() => {
    if (!clippy) return;

    // Function to apply size reduction
    const applyScaling = () => {
      const agentElements = document.querySelectorAll(".clippy");
      if (agentElements.length === 0) {
        // Try again later if no elements found
        return false;
      }

      const agentElement = agentElements[0];

      // Apply scaling transform to reduce size by 10%
      agentElement.style.transform = "scale(.9)";
      agentElement.style.transformOrigin = "center";

      // Also find and scale the balloon element that contains speech
      const balloonElement = document.querySelector(".clippy-balloon");
      if (balloonElement) {
        balloonElement.style.transform = "scale(.9)";
        balloonElement.style.transformOrigin = "center";
      }

      // Add style to ensure all new balloons are also scaled
      const styleElement = document.createElement("style");
      styleElement.textContent = `
                  .clippy-balloon {
                    transform: scale(.9) !important;
                    transform-origin: center !important;
                  }
                `;
      document.head.appendChild(styleElement);

      return true;
    };

    // Try applying scaling, retry if elements aren't ready
    if (!applyScaling()) {
      const interval = setInterval(() => {
        if (applyScaling()) {
          clearInterval(interval);
        }
      }, 500);

      // Clean up interval
      return () => clearInterval(interval);
    }
  }, [clippy]);

  // Apply initial position only once and add drag overlay
  useEffect(() => {
    if (!clippy || initialPositionAppliedRef.current) return;

    // Function to set initial position
    const applyInitialPosition = () => {
      const agentElements = document.querySelectorAll(".clippy");
      if (agentElements.length === 0) return false;

      const agentElement = agentElements[0];
      // Store reference to the Clippy element
      clippyElementRef.current = agentElement;

      // Get Clippy dimensions
      const clipRect = agentElement.getBoundingClientRect();
      clippySizeRef.current = {
        width: clipRect.width,
        height: clipRect.height,
      };

      // Get desktop container to position relative to it
      const desktopElement =
        desktopViewportRef.current || document.querySelector(".w98");

      if (desktopElement) {
        // Get desktop position and dimensions
        const desktopRect = desktopElement.getBoundingClientRect();
        desktopRectRef.current = desktopRect;
        console.log("Desktop viewport rect:", desktopRect);

        // Ensure the position is within bounds
        const boundedPos = calculateBoundedPosition(
          position.x,
          position.y,
          desktopRect
        );

        // Calculate absolute position within desktop
        const absoluteX = desktopRect.left + boundedPos.x;
        const absoluteY = desktopRect.top + boundedPos.y;

        // Calculate and store relative percentages for responsive positioning
        relativePositionRef.current = {
          xPercent: boundedPos.x / desktopRect.width,
          yPercent: boundedPos.y / desktopRect.height,
        };

        // Position using absolute positioning
        agentElement.style.position = fixedPosition ? "fixed" : "absolute";
        agentElement.style.left = `${absoluteX}px`;
        agentElement.style.top = `${absoluteY}px`;
        agentElement.style.bottom = "auto";
        agentElement.style.right = "auto";
        agentElement.style.zIndex = "1000";
        agentElement.style.display = visible ? "block" : "none";

        // Set cursor to default if fixed, otherwise set to move
        agentElement.style.cursor = fixedPosition ? "default" : "move";

        if (fixedPosition) {
          // Add direct click and double-click handlers for better interaction
          agentElement.addEventListener("click", () => {
            console.log("Clippy clicked directly");
            if (clippy && clippy.speak) {
              clippy.speak("How can I help you?");
            }
          });

          agentElement.addEventListener("dblclick", handleDoubleClick);
        }

        agentElement.style.willChange = "transform, left, top"; // Optimization for smoother animation

        // Add mobile-specific styles if needed
        if (isMobileRef.current) {
          // For mobile: Position Clippy lower on the screen
          const mobileX = position.x; // Keep horizontal position the same
          const mobileY = Math.floor(desktopRect.height * 0.92); // Position at 75% of screen height

          console.log("Using mobile position:", mobileX, mobileY);
        } else {
          // For desktop: Use the normal position
        }
        if (isMobileRef.current) {
          // Make Clippy easier to tap on mobile
          agentElement.style.touchAction = "none";

          // Make Clippy slightly larger on mobile for easier tapping
          agentElement.style.transform = "scale(1.1)";
        }

        // Log positioning info
        console.log(
          `Desktop element: ${desktopRect.left},${desktopRect.top} - ${desktopRect.width}x${desktopRect.height}`
        );
        console.log(
          `Initial clippy position: ${boundedPos.x},${boundedPos.y} (absolute: ${absoluteX},${absoluteY})`
        );
        console.log(
          `Clippy size: ${clippySizeRef.current.width}x${clippySizeRef.current.height}`
        );

        // Update position state to match bounded position
        if (boundedPos.x !== position.x || boundedPos.y !== position.y) {
          setPosition(boundedPos);
        }

        // Only add drag overlay if not fixed
        if (!fixedPosition) {
          addDragOverlay(agentElement);
        } else {
          // If fixed, still provide a way to trigger animations on click
          agentElement.addEventListener("click", handleDoubleClick);
        }

        initialPositionAppliedRef.current = true;
        return true;
      }

      return false;
    };

    // Add a transparent overlay to prevent clicks
    const addDragOverlay = (agentElement) => {
      // Skip adding overlay if Clippy is fixed
      if (fixedPosition) return;

      // Check if we already have an overlay
      let overlay = document.getElementById("clippy-drag-overlay");
      if (!overlay) {
        // Create overlay
        overlay = document.createElement("div");
        overlay.id = "clippy-drag-overlay";
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.zIndex = "1001"; // Above clippy
        overlay.style.cursor = "move";
        overlay.style.pointerEvents = "all";

        // Mobile-specific styles
        if (isMobileRef.current) {
          overlay.style.touchAction = "none"; // Disable browser handling of touch gestures
        }

        // Add to document body
        document.body.appendChild(overlay);
      }

      // Position overlay over Clippy
      const repositionOverlay = () => {
        if (!document.getElementById("clippy-drag-overlay")) return;

        const rect = agentElement.getBoundingClientRect();
        overlay.style.top = `${rect.top}px`;
        overlay.style.left = `${rect.left}px`;
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
      };

      // Initial positioning
      repositionOverlay();

      // Keep updating position until dragged
      const positionInterval = setInterval(() => {
        if (hasBeenDraggedRef.current) {
          // If already dragged, remove overlay and stop interval
          clearInterval(positionInterval);
          if (document.getElementById("clippy-drag-overlay")) {
            document.body.removeChild(overlay);
          }
          return;
        }
        repositionOverlay();
      }, 100);

      // REQUESTED CHANGE: Add double-click handler ONLY to the overlay
      // (this will only work before first drag, since overlay is removed after drag)
      overlay.addEventListener("dblclick", (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDoubleClick();
      });

      // Mouse/touch event handlers for initial drag
      const handleStart = (e) => {
        // Prevent default and stop propagation to avoid any issues
        e.preventDefault();
        e.stopPropagation();

        // Get coordinates based on event type
        const startX =
          e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const startY =
          e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

        // Get desktop container
        const desktopElement =
          desktopViewportRef.current || document.querySelector(".w98");
        const desktopRect = desktopElement
          ? desktopElement.getBoundingClientRect()
          : null;

        // Get current Clippy position
        const clipRect = agentElement.getBoundingClientRect();

        // Calculate relative position within desktop
        const startRelX = desktopRect
          ? clipRect.left - desktopRect.left
          : clipRect.left;
        const startRelY = desktopRect
          ? clipRect.top - desktopRect.top
          : clipRect.top;

        // Flag to track if we've actually moved
        let isDragging = false;

        // Handle move
        const handleMove = (moveEvent) => {
          // Prevent default to stop scrolling on mobile
          moveEvent.preventDefault();

          // Get current position from event
          const moveX =
            moveEvent.clientX ||
            (moveEvent.touches && moveEvent.touches[0]
              ? moveEvent.touches[0].clientX
              : 0);
          const moveY =
            moveEvent.clientY ||
            (moveEvent.touches && moveEvent.touches[0]
              ? moveEvent.touches[0].clientY
              : 0);

          const deltaX = moveX - startX;
          const deltaY = moveY - startY;

          // Only if moved enough
          if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            isDragging = true;

            // Calculate new position (relative to desktop)
            let newRelX = startRelX + deltaX;
            let newRelY = startRelY + deltaY;

            // Ensure position stays within bounds
            const boundedPos = calculateBoundedPosition(
              newRelX,
              newRelY,
              desktopRect
            );

            // Calculate absolute screen position
            const newAbsX = desktopRect
              ? desktopRect.left + boundedPos.x
              : boundedPos.x;
            const newAbsY = desktopRect
              ? desktopRect.top + boundedPos.y
              : boundedPos.y;

            // Update element position
            agentElement.style.left = `${newAbsX}px`;
            agentElement.style.top = `${newAbsY}px`;

            // Keep overlay in position
            repositionOverlay();

            // Mark as has been dragged
            hasBeenDraggedRef.current = true;

            // Reposition the balloon if it exists
            repositionClippyBalloon();
          }
        };

        // Handle end
        const handleEnd = () => {
          // Remove event listeners
          document.removeEventListener("mousemove", handleMove);
          document.removeEventListener("touchmove", handleMove);
          document.removeEventListener("mouseup", handleEnd);
          document.removeEventListener("touchend", handleEnd);
          document.removeEventListener("touchcancel", handleEnd);

          // If it was dragged
          if (isDragging) {
            // Remove overlay and interval
            if (document.getElementById("clippy-drag-overlay")) {
              document.body.removeChild(overlay);
            }
            clearInterval(positionInterval);

            // Get current position
            const clipRect = agentElement.getBoundingClientRect();

            // Calculate relative position within desktop
            const finalRelX = desktopRect
              ? clipRect.left - desktopRect.left
              : clipRect.left;
            const finalRelY = desktopRect
              ? clipRect.top - desktopRect.top
              : clipRect.top;

            // Ensure position stays within bounds
            const boundedPos = calculateBoundedPosition(
              finalRelX,
              finalRelY,
              desktopRect
            );

            // If position was constrained by bounds, update position
            if (boundedPos.x !== finalRelX || boundedPos.y !== finalRelY) {
              const newAbsX = desktopRect
                ? desktopRect.left + boundedPos.x
                : boundedPos.x;
              const newAbsY = desktopRect
                ? desktopRect.top + boundedPos.y
                : boundedPos.y;
              agentElement.style.left = `${newAbsX}px`;
              agentElement.style.top = `${newAbsY}px`;
            }

            // Update relative position percentages
            relativePositionRef.current = {
              xPercent: boundedPos.x / desktopRect.width,
              yPercent: boundedPos.y / desktopRect.height,
            };

            // Update position state
            setPosition(boundedPos);
            setUserPositioned(true);

            // Reposition the balloon if it exists
            repositionClippyBalloon();
          }
        };

        // Add document events for both mouse and touch
        document.addEventListener("mousemove", handleMove, {
          passive: false,
        });
        document.addEventListener("touchmove", handleMove, {
          passive: false,
        });
        document.addEventListener("mouseup", handleEnd);
        document.addEventListener("touchend", handleEnd);
        document.addEventListener("touchcancel", handleEnd);
      };

      // Add both mouse and touch event listeners
      overlay.addEventListener("mousedown", handleStart);
      overlay.addEventListener("touchstart", handleStart, { passive: false });
    };

    // Try to position immediately, retry with delay if not successful
    if (!applyInitialPosition()) {
      const timer = setTimeout(() => {
        if (!applyInitialPosition()) {
          console.warn("Could not find desktop element for Clippy positioning");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    clippy,
    position,
    visible,
    setPosition,
    setUserPositioned,
    desktopRectRef,
    isMobileRef,
    calculateBoundedPosition,
    handleDoubleClick,
    fixedPosition, // Added fixedPosition dependency
  ]);

  // Update visibility only
  useEffect(() => {
    if (!clippy) return;

    const updateVisibility = () => {
      const agentElements = document.querySelectorAll(".clippy");
      if (agentElements.length > 0) {
        agentElements[0].style.display = visible ? "block" : "none";
      }
    };

    updateVisibility();
  }, [clippy, visible]);

  // Set up normal drag handlers for Clippy
  useEffect(() => {
    // Skip setting up drag handlers if fixedPosition is true
    if (!clippy || !hasBeenDraggedRef.current || fixedPosition) return;

    // Clean up function to remove event listeners
    let cleanupListeners = () => {};

    // Find agent element
    const agentElements = document.querySelectorAll(".clippy");
    if (agentElements.length === 0) return;

    const agentElement = agentElements[0];

    // Get desktop container
    const desktopElement =
      desktopViewportRef.current || document.querySelector(".w98");

    // Mouse/touch start handler - start dragging
    const handleStart = (e) => {
      // Prevent default behaviors
      e.preventDefault();
      e.stopPropagation();

      // Get coordinates based on event type
      const startX =
        e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const startY =
        e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

      // Get desktop position
      const desktopRect = desktopElement
        ? desktopElement.getBoundingClientRect()
        : null;
      desktopRectRef.current = desktopRect;

      // Get current Clippy position
      const clipRect = agentElement.getBoundingClientRect();

      // Update clippy size reference
      clippySizeRef.current = {
        width: clipRect.width,
        height: clipRect.height,
      };

      // Store positions for dragging
      dragRef.current = {
        startX,
        startY,
        startPosX: clipRect.left,
        startPosY: clipRect.top,
        isDragging: true,
        hasMoved: false,
        // Store relative position for boundary calculations
        startRelX: desktopRect ? clipRect.left - desktopRect.left : 0,
        startRelY: desktopRect ? clipRect.top - desktopRect.top : 0,
      };

      // Immediately fix the element's position to prevent jumping
      agentElement.style.left = `${clipRect.left}px`;
      agentElement.style.top = `${clipRect.top}px`;
    };

    // Mouse/touch move handler - update position during drag
    const handleMove = (e) => {
      if (!dragRef.current.isDragging) return;

      // Prevent default to stop scrolling on mobile
      e.preventDefault();

      // Get desktop position (may have changed during drag)
      const desktopRect = desktopElement
        ? desktopElement.getBoundingClientRect()
        : null;

      // Get current position from event
      const moveX =
        e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const moveY =
        e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

      // Calculate the delta from the start position
      const deltaX = moveX - dragRef.current.startX;
      const deltaY = moveY - dragRef.current.startY;

      // Only consider it a move if the mouse/touch has moved more than 3 pixels
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        dragRef.current.hasMoved = true;
        setUserPositioned(true);
      }

      // Calculate new relative position
      const newRelX = dragRef.current.startRelX + deltaX;
      const newRelY = dragRef.current.startRelY + deltaY;

      // Ensure position stays within bounds
      const boundedPos = calculateBoundedPosition(
        newRelX,
        newRelY,
        desktopRect
      );

      // Calculate absolute position
      const newAbsX = desktopRect
        ? desktopRect.left + boundedPos.x
        : dragRef.current.startPosX + deltaX;
      const newAbsY = desktopRect
        ? desktopRect.top + boundedPos.y
        : dragRef.current.startPosY + deltaY;

      // Update element position directly
      requestAnimationFrame(() => {
        agentElement.style.left = `${newAbsX}px`;
        agentElement.style.top = `${newAbsY}px`;

        // Also reposition the balloon if it exists
        repositionClippyBalloon();
      });
    };

    // Mouse/touch end handler - stop dragging and update position state
    const handleEnd = () => {
      if (!dragRef.current.isDragging) return;

      // Only update state if actually moved
      if (dragRef.current.hasMoved) {
        // Get desktop position
        const desktopRect = desktopElement
          ? desktopElement.getBoundingClientRect()
          : null;
        desktopRectRef.current = desktopRect;

        // Get final Clippy position
        const clipRect = agentElement.getBoundingClientRect();

        // Calculate relative position within desktop
        const finalRelX = desktopRect
          ? clipRect.left - desktopRect.left
          : clipRect.left;
        const finalRelY = desktopRect
          ? clipRect.top - desktopRect.top
          : clipRect.top;

        // Ensure position stays within bounds
        const boundedPos = calculateBoundedPosition(
          finalRelX,
          finalRelY,
          desktopRect
        );

        // If position was constrained by bounds, update visual position
        if (boundedPos.x !== finalRelX || boundedPos.y !== finalRelY) {
          const newAbsX = desktopRect
            ? desktopRect.left + boundedPos.x
            : boundedPos.x;
          const newAbsY = desktopRect
            ? desktopRect.top + boundedPos.y
            : boundedPos.y;
          agentElement.style.left = `${newAbsX}px`;
          agentElement.style.top = `${newAbsY}px`;
        }

        // Update relative position percentages for responsive positioning
        relativePositionRef.current = {
          xPercent: boundedPos.x / desktopRect.width,
          yPercent: boundedPos.y / desktopRect.height,
        };

        // Update position state with relative desktop position
        setPosition(boundedPos);

        // Reposition the balloon after move completes
        repositionClippyBalloon();
      } else {
        // Handle click (drag with no movement) - still enforce boundaries
        const desktopRect = desktopElement
          ? desktopElement.getBoundingClientRect()
          : null;

        // Get current Clippy position
        const clipRect = agentElement.getBoundingClientRect();

        // Calculate relative position within desktop
        const relX = desktopRect
          ? clipRect.left - desktopRect.left
          : clipRect.left;
        const relY = desktopRect
          ? clipRect.top - desktopRect.top
          : clipRect.top;

        // Ensure position stays within bounds
        const boundedPos = calculateBoundedPosition(relX, relY, desktopRect);

        // If position was constrained by bounds, update visual position
        if (boundedPos.x !== relX || boundedPos.y !== relY) {
          const newAbsX = desktopRect
            ? desktopRect.left + boundedPos.x
            : boundedPos.x;
          const newAbsY = desktopRect
            ? desktopRect.top + boundedPos.y
            : boundedPos.y;
          agentElement.style.left = `${newAbsX}px`;
          agentElement.style.top = `${newAbsY}px`;

          // Update position state to match bounded position
          setPosition(boundedPos);
        }
      }

      // Reset drag state
      dragRef.current.isDragging = false;
    };

    // Add event listeners for both mouse and touch
    agentElement.addEventListener("mousedown", handleStart);
    agentElement.addEventListener("touchstart", handleStart, {
      passive: false,
    });
    document.addEventListener("mousemove", handleMove, { passive: false });
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchend", handleEnd);
    document.addEventListener("touchcancel", handleEnd);

    // Define cleanup function
    cleanupListeners = () => {
      agentElement.removeEventListener("mousedown", handleStart);
      agentElement.removeEventListener("touchstart", handleStart);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);
    };

    // Return cleanup function
    return cleanupListeners;
  }, [
    clippy,
    position,
    setPosition,
    setUserPositioned,
    desktopRectRef,
    isMobileRef,
    calculateBoundedPosition,
    repositionClippyBalloon,
    fixedPosition, // Added fixedPosition dependency
  ]);

  return null;
};

// Hook for using the clippy context
export const useClippyContext = () => useContext(ClippyContext);

export default ClippyProvider;
