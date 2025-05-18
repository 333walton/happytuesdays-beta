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
  fixedPosition = false,
}) => {
  const [assistantVisible, setAssistantVisible] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(defaultAgent);
  const [position, setPosition] = useState(() => ({
    x: 520,
    y: 360,
  }));
  const [userPositioned, setUserPositioned] = useState(false);
  const clippyInstanceRef = useRef(null);
  const desktopRectRef = useRef(null);
  const isMobileRef = useRef(false);

  // Reference to track initial position settings
  const relativePositionRef = useRef({
    xPercent: 0.81,
    yPercent: 0.75,
  });

  // Detect if the user is on mobile
  useEffect(() => {
    isMobileRef.current =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
  }, []);

  // Make context values available globally for ClippyService
  useEffect(() => {
    // These window globals are used by ClippyService to control the assistant
    window.setAssistantVisible = setAssistantVisible;
    window.setCurrentAgent = setCurrentAgent;
    window.setClippyPosition = (newPos) => {
      if (!fixedPosition) {
        setPosition(newPos);
        setUserPositioned(false);
      }
    };
    // Add new function for the simplified initial position setting
    window.setClippyInitialPosition = (percentPos) => {
      if (!fixedPosition) {
        relativePositionRef.current = {
          xPercent: percentPos.xPercent || 0.85,
          yPercent: percentPos.yPercent || 0.85,
        };

        // If we already have a desktop element, calculate and apply position now
        if (desktopRectRef.current) {
          const desktopRect = desktopRectRef.current;
          const newPos = {
            x: desktopRect.width * relativePositionRef.current.xPercent,
            y: desktopRect.height * relativePositionRef.current.yPercent,
          };
          setPosition(newPos);
          setUserPositioned(false);
        }
      }
    };
    window.getClippyInstance = () => clippyInstanceRef.current;

    return () => {
      delete window.setAssistantVisible;
      delete window.setCurrentAgent;
      delete window.setClippyPosition;
      delete window.setClippyInitialPosition;
      delete window.getClippyInstance;
    };
  }, [fixedPosition, desktopRectRef]);

  // Gather all values for the context
  const contextValue = {
    assistantVisible,
    setAssistantVisible,
    currentAgent,
    setCurrentAgent,
    position,
    setPosition: fixedPosition ? () => {} : setPosition,
    userPositioned,
    setUserPositioned: fixedPosition ? () => {} : setUserPositioned,
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
          fixedPosition={fixedPosition}
          relativePositionRef={relativePositionRef}
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
  fixedPosition,
  relativePositionRef,
  setClippyInstance,
}) => {
  const { clippy } = useClippy();
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    hasMoved: false,
  });
  const initialPositionAppliedRef = useRef(false);
  const hasBeenDraggedRef = useRef(false);
  const desktopViewportRef = useRef(null);
  const clippyElementRef = useRef(null);
  const clippySizeRef = useRef({ width: 100, height: 100 });
  const balloonObserverRef = useRef(null);

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

  // Function to reposition the balloon
  const repositionClippyBalloon = useCallback(() => {
    const clippy = document.querySelector(".clippy");
    const balloon = document.querySelector(".clippy-balloon");

    if (!clippy || !balloon) return;

    const clippyRect = clippy.getBoundingClientRect();
    const viewportEl = document.querySelector(".w98");
    const viewportRect = viewportEl
      ? viewportEl.getBoundingClientRect()
      : {
          left: 0,
          top: 0,
          right: window.innerWidth,
          bottom: window.innerHeight,
        };

    // Apply all balloon styles at once
    balloon.style.cssText = `
          position: fixed !important;
          z-index: 9999 !important;
          backgroundColor: #fffcde !important;
          border: 1px solid #000 !important;
          borderRadius: 5px !important;
          padding: 8px !important;
          maxWidth: 250px !important;
      `;

    // Position higher above Clippy
    const verticalOffset = 80;
    balloon.style.left = clippyRect.left - 10 + "px";
    balloon.style.top =
      clippyRect.top - balloon.offsetHeight - verticalOffset + "px";

    // Handle edge cases
    const balloonRect = balloon.getBoundingClientRect();
    if (balloonRect.top < viewportRect.top + 10) {
      balloon.style.left = clippyRect.right + 15 + "px";
      balloon.style.top = clippyRect.top - 10 + "px";
    }
    if (balloonRect.right > viewportRect.right - 10) {
      balloon.style.left = clippyRect.left - balloon.offsetWidth - 15 + "px";
      balloon.style.top = clippyRect.top - 10 + "px";
    }

    // Clean up tips
    const existingTips = balloon.querySelectorAll(".custom-tip, .clippy-tip");
    existingTips.forEach((tip) => {
      if (tip.classList.contains("clippy-tip")) {
        tip.style.display = "none";
      } else if (tip && tip.parentNode) {
        tip.parentNode.removeChild(tip);
      }
    });
  }, []);

  // Set up the balloon observer
  const setupBalloonObserver = useCallback(() => {
    if (balloonObserverRef.current) {
      balloonObserverRef.current.disconnect();
    }

    // Create an observer for balloon changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            if (node.classList && node.classList.contains("clippy-balloon")) {
              setTimeout(repositionClippyBalloon, 0);
              return;
            }
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    balloonObserverRef.current = observer;

    // Check periodically and on resize
    const intervalId = setInterval(repositionClippyBalloon, 500);
    window.addEventListener("resize", repositionClippyBalloon);
    repositionClippyBalloon();

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
      window.removeEventListener("resize", repositionClippyBalloon);
    };
  }, [repositionClippyBalloon]);

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

  // Handle interactions for Clippy (unified for all devices)
  const handleClippyInteraction = useCallback(() => {
    if (!clippy) return;

    // Use a single set of animations and phrases for all devices
    const animations = [
      "Congratulate",
      "GetAttention",
      "Wave",
      "Greeting",
      "GetTechy",
      "Thinking",
    ];
    const phrases = [
      "Need some assistance?",
      "Hello there! How can I help you?",
      "What can I help you with today?",
      "Need help with something?",
      "Looking for some help with Windows 98?",
    ];

    // Play random animation and speak random phrase
    const randomAnim =
      animations[Math.floor(Math.random() * animations.length)];
    if (clippy.play) clippy.play(randomAnim);

    if (clippy.speak) {
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      clippy.speak(randomPhrase);
    }
  }, [clippy]);

  // Setup double-click handler for both mobile and desktop
  useEffect(() => {
    if (!clippy) return;

    const setupHandlers = () => {
      const agentElements = document.querySelectorAll(".clippy");
      if (agentElements.length === 0) return false;

      const agentElement = agentElements[0];

      // Clean up existing handlers
      agentElement.removeEventListener("click", handleClippyInteraction);
      agentElement.removeEventListener("dblclick", handleClippyInteraction);

      // Use double-click for both mobile and desktop
      agentElement.addEventListener("dblclick", handleClippyInteraction);

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
  }, [clippy, handleClippyInteraction]);

  // Update Clippy position based on container dimensions
  const updateClippyPosition = useCallback(() => {
    if (fixedPosition) return;
    if (!clippyElementRef.current || !desktopViewportRef.current) return;

    const desktopRect = desktopViewportRef.current.getBoundingClientRect();
    desktopRectRef.current = desktopRect;
    const agentElement = clippyElementRef.current;

    // Update Clippy size reference
    const clipRect = agentElement.getBoundingClientRect();
    clippySizeRef.current = {
      width: clipRect.width,
      height: clipRect.height,
    };

    // Calculate new position based on responsive percentages
    const newRelX = desktopRect.width * relativePositionRef.current.xPercent;
    const newRelY = desktopRect.height * relativePositionRef.current.yPercent;
    const boundedPos = calculateBoundedPosition(newRelX, newRelY, desktopRect);

    // Update relative percentages if bounded position is different
    if (boundedPos.x !== newRelX || boundedPos.y !== newRelY) {
      relativePositionRef.current = {
        xPercent: boundedPos.x / desktopRect.width,
        yPercent: boundedPos.y / desktopRect.height,
      };
    }

    // Apply position
    const newAbsX = desktopRect.left + boundedPos.x;
    const newAbsY = desktopRect.top + boundedPos.y;
    agentElement.style.left = `${newAbsX}px`;
    agentElement.style.top = `${newAbsY}px`;

    setPosition(boundedPos);
    repositionClippyBalloon();
  }, [
    calculateBoundedPosition,
    desktopRectRef,
    setPosition,
    repositionClippyBalloon,
    fixedPosition,
    relativePositionRef,
  ]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(() => {
        if (!fixedPosition) updateClippyPosition();
        repositionClippyBalloon();
      });
    };

    window.addEventListener("resize", handleResize);

    // Watch for desktop container changes
    if (desktopViewportRef.current && !fixedPosition) {
      const observer = new MutationObserver(handleResize);
      observer.observe(desktopViewportRef.current, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });
      return () => {
        window.removeEventListener("resize", handleResize);
        observer.disconnect();
      };
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [updateClippyPosition, repositionClippyBalloon, fixedPosition]);

  // Store clippy instance and set up balloon observer
  useEffect(() => {
    if (clippy) {
      setClippyInstance(clippy);
      return setupBalloonObserver();
    }
  }, [clippy, setClippyInstance, setupBalloonObserver]);

  // Apply scaling to Clippy (90%)
  useEffect(() => {
    if (!clippy) return;

    const applyScaling = () => {
      const agentElements = document.querySelectorAll(".clippy");
      if (agentElements.length === 0) return false;

      // Apply scaling to Clippy
      agentElements[0].style.transform = "scale(.9)";
      agentElements[0].style.transformOrigin = "center";

      // Apply scaling to balloon via CSS
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

    if (!applyScaling()) {
      const interval = setInterval(() => {
        if (applyScaling()) clearInterval(interval);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [clippy]);

  // Unified drag handler function
  const setupDragHandlers = useCallback(
    (agentElement, startEvent) => {
      startEvent.preventDefault();
      startEvent.stopPropagation();

      const desktopElement =
        desktopViewportRef.current || document.querySelector(".w98");
      const desktopRect = desktopElement
        ? desktopElement.getBoundingClientRect()
        : null;
      const clipRect = agentElement.getBoundingClientRect();

      // Get start coordinates
      const startX =
        startEvent.clientX ||
        (startEvent.touches && startEvent.touches[0]
          ? startEvent.touches[0].clientX
          : 0);
      const startY =
        startEvent.clientY ||
        (startEvent.touches && startEvent.touches[0]
          ? startEvent.touches[0].clientY
          : 0);

      // Calculate starting positions
      const startRelX = desktopRect
        ? clipRect.left - desktopRect.left
        : clipRect.left;
      const startRelY = desktopRect
        ? clipRect.top - desktopRect.top
        : clipRect.top;

      let isDragging = false;

      const handleMove = (moveEvent) => {
        moveEvent.preventDefault();

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

        // Only count as dragging if moved enough
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
          isDragging = true;

          // Calculate new position
          const newRelX = startRelX + deltaX;
          const newRelY = startRelY + deltaY;
          const boundedPos = calculateBoundedPosition(
            newRelX,
            newRelY,
            desktopRect
          );

          // Apply new position
          const newAbsX = desktopRect
            ? desktopRect.left + boundedPos.x
            : boundedPos.x;
          const newAbsY = desktopRect
            ? desktopRect.top + boundedPos.y
            : boundedPos.y;

          agentElement.style.left = `${newAbsX}px`;
          agentElement.style.top = `${newAbsY}px`;

          hasBeenDraggedRef.current = true;
          repositionClippyBalloon();
        }
      };

      const handleEnd = () => {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchend", handleEnd);
        document.removeEventListener("touchcancel", handleEnd);

        if (isDragging) {
          // Get final position
          const clipRect = agentElement.getBoundingClientRect();
          const finalRelX = desktopRect
            ? clipRect.left - desktopRect.left
            : clipRect.left;
          const finalRelY = desktopRect
            ? clipRect.top - desktopRect.top
            : clipRect.top;

          // Ensure bounds
          const boundedPos = calculateBoundedPosition(
            finalRelX,
            finalRelY,
            desktopRect
          );

          // Update relative positioning percentages for responsive positioning
          if (desktopRect) {
            relativePositionRef.current = {
              xPercent: boundedPos.x / desktopRect.width,
              yPercent: boundedPos.y / desktopRect.height,
            };
          }

          // Set final position
          setPosition(boundedPos);
          setUserPositioned(true);
          repositionClippyBalloon();
        }
      };

      // Add event listeners
      document.addEventListener("mousemove", handleMove, { passive: false });
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchend", handleEnd);
      document.addEventListener("touchcancel", handleEnd);
    },
    [
      calculateBoundedPosition,
      repositionClippyBalloon,
      setPosition,
      setUserPositioned,
      relativePositionRef,
    ]
  );

  // Handle initial positioning and setup dragging
  useEffect(() => {
    if (!clippy || initialPositionAppliedRef.current) return;

    const applyInitialPosition = () => {
      const agentElements = document.querySelectorAll(".clippy");
      if (agentElements.length === 0) return false;

      const agentElement = agentElements[0];
      clippyElementRef.current = agentElement;

      // Store clippy size
      const clipRect = agentElement.getBoundingClientRect();
      clippySizeRef.current = {
        width: clipRect.width,
        height: clipRect.height,
      };

      // Get desktop container
      const desktopElement =
        desktopViewportRef.current || document.querySelector(".w98");
      if (!desktopElement) return false;

      // Calculate position - use a simplified approach for initial positioning
      const desktopRect = desktopElement.getBoundingClientRect();
      desktopRectRef.current = desktopRect;

      // Use simplified initial positions with percentage-based positioning
      // Mobile: Position at the bottom right corner of the screen
      // Desktop: Position at the right side, middle height
      const isMobile = isMobileRef.current;

      // Set simplified initial positions based on device type
      if (!userPositioned) {
        relativePositionRef.current = {
          xPercent: isMobile ? 0.85 : 0.9, // Move it a bit left on mobile
          yPercent: isMobile ? 0.85 : 0.5, // Bottom on mobile, center on desktop
        };
      }

      // Calculate actual pixel position
      const posX = desktopRect.width * relativePositionRef.current.xPercent;
      const posY = desktopRect.height * relativePositionRef.current.yPercent;
      const boundedPos = calculateBoundedPosition(posX, posY, desktopRect);

      // Position Clippy
      const absoluteX = desktopRect.left + boundedPos.x;
      const absoluteY = desktopRect.top + boundedPos.y;

      // Set styles
      const isDraggable = isMobile && !fixedPosition; // Only draggable on mobile and when not in fixed mode

      agentElement.style.position = fixedPosition ? "fixed" : "absolute";
      agentElement.style.left = `${absoluteX}px`;
      agentElement.style.top = `${absoluteY}px`;
      agentElement.style.bottom = "auto";
      agentElement.style.right = "auto";
      agentElement.style.zIndex = "1000";
      agentElement.style.display = visible ? "block" : "none";
      agentElement.style.cursor = isDraggable ? "move" : "default";
      agentElement.style.willChange = "transform, left, top";

      // Update position state
      if (boundedPos.x !== position.x || boundedPos.y !== position.y) {
        setPosition(boundedPos);
      }

      // Setup drag handling only on mobile devices when not in fixed position
      if (isDraggable) {
        agentElement.addEventListener("mousedown", (e) =>
          setupDragHandlers(agentElement, e)
        );
        agentElement.addEventListener(
          "touchstart",
          (e) => setupDragHandlers(agentElement, e),
          { passive: false }
        );
      } else {
        // Remove any drag handlers to ensure it's not draggable
        agentElement.removeEventListener("mousedown", setupDragHandlers);
        agentElement.removeEventListener("touchstart", setupDragHandlers);
      }

      // Always add the interaction handler for double-click
      agentElement.addEventListener("dblclick", handleClippyInteraction);

      initialPositionAppliedRef.current = true;
      return true;
    };

    // Try to apply initial position
    if (!applyInitialPosition()) {
      setTimeout(applyInitialPosition, 500);
    }
  }, [
    clippy,
    position,
    visible,
    setPosition,
    calculateBoundedPosition,
    setupDragHandlers,
    handleClippyInteraction,
    fixedPosition,
    isMobileRef,
    userPositioned,
  ]);

  // Update visibility
  useEffect(() => {
    if (!clippy) return;

    const agentElements = document.querySelectorAll(".clippy");
    if (agentElements.length > 0) {
      agentElements[0].style.display = visible ? "block" : "none";
    }
  }, [clippy, visible]);

  return null;
};

// Hook for using the clippy context
export const useClippyContext = () => useContext(ClippyContext);

export default ClippyProvider;
