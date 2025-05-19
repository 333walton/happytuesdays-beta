import React, { useEffect, useRef, useCallback } from "react";
import { useClippy } from "@react95/clippy";

// Global counter to ensure it persists between renders
let globalClickCounter = 0;

/**
 * Component to handle Clippy positioning and interactions
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
}) => {
  const { clippy } = useClippy();
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

              // IMPORTANT: Redirect to custom balloon
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
    }, 300); // Check more frequently

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, []);

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
    if (!clippy) return;

    // Use the global counter
    globalClickCounter = (globalClickCounter + 1) % 3;
    console.log("Double-click counter:", globalClickCounter);

    // Play animation on every double-click
    const animations = ["GetAttention", "Wave", "Greeting"];
    const randomAnim =
      animations[Math.floor(Math.random() * animations.length)];
    if (clippy.play) clippy.play(randomAnim);

    // Only show speech balloon on every 3rd click (when counter is 0)
    if (globalClickCounter === 0) {
      // Use a single set of animations and phrases for all devices
      const phrases = [
        "Welcome to Hydra98! Please enjoy and don't break anything",
        "Need some assistance?",
        "Hello there! How can I help you?",
        "What can I help you with today?",
        "Need help with something?",
        "Looking for some help with Windows 98?",
      ];

      // Choose random phrase
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

      // Use timeout to let animation start first
      setTimeout(() => {
        // Use our custom balloon function
        if (window.showClippyCustomBalloon) {
          window.showClippyCustomBalloon(randomPhrase);
        } else if (clippy.speak) {
          clippy.speak(randomPhrase);
        }
      }, 500);
    }
  }, [clippy]);

  // Handle context menu options
  const handleContextMenu = useCallback(
    (e) => {
      e.preventDefault(); // Prevent default context menu
      e.stopPropagation(); // Stop event from bubbling

      if (!clippy) return;

      // Get mouse position
      const x = e.clientX;
      const y = e.clientY;

      // Remove any existing menus
      const existingMenu = document.querySelector(".clippy-context-menu");
      if (existingMenu) document.body.removeChild(existingMenu);

      // Create menu container
      const menu = document.createElement("div");
      menu.className = "clippy-context-menu";
      menu.style.position = "fixed";
      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
      menu.style.backgroundColor = "#d4d0c8";
      menu.style.border = "1px solid #000";
      menu.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.2)";
      menu.style.padding = "2px";
      menu.style.zIndex = "9999";
      menu.style.minWidth = "150px";

      // Create menu items
      const createMenuItem = (text, action, hasSubmenu = false) => {
        const item = document.createElement("div");
        item.textContent = text;
        item.style.padding = "4px 20px";
        item.style.cursor = "pointer";
        item.style.fontSize = "12px";
        item.style.fontFamily = "Tahoma, Arial, sans-serif";
        item.style.position = "relative";

        if (hasSubmenu) {
          const arrow = document.createElement("span");
          arrow.textContent = "►";
          arrow.style.position = "absolute";
          arrow.style.right = "5px";
          arrow.style.fontSize = "10px";
          item.appendChild(arrow);
        }

        item.onmouseover = () => {
          item.style.backgroundColor = "#0a246a";
          item.style.color = "white";
        };

        item.onmouseout = () => {
          item.style.backgroundColor = "";
          item.style.color = "";
        };

        if (!hasSubmenu) {
          item.onclick = () => {
            document.body.removeChild(menu);
            if (action) action();
          };
        }

        return item;
      };

      // Create separator
      const createSeparator = () => {
        const sep = document.createElement("div");
        sep.style.height = "1px";
        sep.style.margin = "2px 0";
        sep.style.backgroundColor = "#888";
        return sep;
      };

      // Add items
      const hideItem = createMenuItem("Hide Assistant", () =>
        setAssistantVisible(false)
      );
      menu.appendChild(hideItem);

      // Select Assistant submenu
      const agents = ["Clippy", "Links", "Bonzi", "Merlin", "Rover", "Genie"];
      const selectAssistantItem = createMenuItem(
        "Select Assistant",
        null,
        true
      );
      menu.appendChild(selectAssistantItem);

      const selectSubmenu = document.createElement("div");
      selectSubmenu.className = "clippy-submenu";
      selectSubmenu.style.position = "absolute";
      selectSubmenu.style.left = "100%";
      selectSubmenu.style.top = "0";
      selectSubmenu.style.backgroundColor = "#d4d0c8";
      selectSubmenu.style.border = "1px solid #000";
      selectSubmenu.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.2)";
      selectSubmenu.style.padding = "2px";
      selectSubmenu.style.display = "none";
      selectSubmenu.style.zIndex = "10000";

      agents.forEach((agent) => {
        const agentItem = createMenuItem(agent, () => setCurrentAgent(agent));
        if (agent === currentAgent) {
          agentItem.style.fontWeight = "bold";
          const check = document.createElement("span");
          check.textContent = "✓";
          check.style.position = "absolute";
          check.style.left = "5px";
          agentItem.appendChild(check);
        }
        selectSubmenu.appendChild(agentItem);
      });

      selectAssistantItem.appendChild(selectSubmenu);
      selectAssistantItem.onmouseover = () => {
        selectAssistantItem.style.backgroundColor = "#0a246a";
        selectAssistantItem.style.color = "white";
        selectSubmenu.style.display = "block";
      };

      selectAssistantItem.onmouseout = () => {
        selectAssistantItem.style.backgroundColor = "";
        selectAssistantItem.style.color = "";
        // Only hide if not hovering over submenu
        if (!selectSubmenu.matches(":hover")) {
          selectSubmenu.style.display = "none";
        }
      };

      // Make sure submenu stays visible when hovering it
      selectSubmenu.onmouseleave = () => {
        selectSubmenu.style.display = "none";
      };

      // Create animation submenu
      menu.appendChild(createSeparator());

      const animations = [
        "Greeting",
        "Wave",
        "Congratulate",
        "GetAttention",
        "Alert",
        "GetTechy",
        "Thinking",
      ];
      const animationItem = createMenuItem("Play Animation", null, true);
      menu.appendChild(animationItem);

      const animSubmenu = document.createElement("div");
      animSubmenu.className = "clippy-submenu";
      animSubmenu.style.position = "absolute";
      animSubmenu.style.left = "100%";
      animSubmenu.style.top = "0";
      animSubmenu.style.backgroundColor = "#d4d0c8";
      animSubmenu.style.border = "1px solid #000";
      animSubmenu.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.2)";
      animSubmenu.style.padding = "2px";
      animSubmenu.style.display = "none";
      animSubmenu.style.zIndex = "10000";

      animations.forEach((anim) => {
        const animItem = createMenuItem(anim, () => clippy.play(anim));
        animSubmenu.appendChild(animItem);
      });

      animationItem.appendChild(animSubmenu);
      animationItem.onmouseover = () => {
        animationItem.style.backgroundColor = "#0a246a";
        animationItem.style.color = "white";
        animSubmenu.style.display = "block";
      };

      animationItem.onmouseout = () => {
        animationItem.style.backgroundColor = "";
        animationItem.style.color = "";
        // Only hide if not hovering over submenu
        if (!animSubmenu.matches(":hover")) {
          animSubmenu.style.display = "none";
        }
      };

      // Make sure submenu stays visible when hovering it
      animSubmenu.onmouseleave = () => {
        animSubmenu.style.display = "none";
      };

      menu.appendChild(createSeparator());

      // About item
      const aboutItem = createMenuItem("About", () => {
        clippy.play("GetAttention");
        setTimeout(() => {
          const aboutMessage = `I'm ${currentAgent}, your Office Assistant! Welcome to Hydra98! Please enjoy and don't break anything`;
          window.showClippyCustomBalloon(aboutMessage);
        }, 500);
      });
      menu.appendChild(aboutItem);

      // Add menu to body
      document.body.appendChild(menu);

      // Close menu when clicking outside
      const closeMenu = (e) => {
        if (
          !menu.contains(e.target) &&
          !menu.querySelector(".clippy-submenu")?.contains(e.target)
        ) {
          if (document.body.contains(menu)) {
            document.body.removeChild(menu);
          }
          document.removeEventListener("click", closeMenu);
        }
      };

      // Delay adding the click handler to avoid immediate closing
      setTimeout(() => {
        document.addEventListener("click", closeMenu);
      }, 10);
    },
    [clippy, currentAgent, setAssistantVisible, setCurrentAgent]
  );

  // Setup double-click and right-click handlers with complete priority for right-click
  useEffect(() => {
    if (!clippy) return;

    const setupHandlers = () => {
      const agentElements = document.querySelectorAll(".clippy");
      if (agentElements.length === 0) return false;

      const agentElement = agentElements[0];

      // Clone to reset event listeners
      const newAgentElement = agentElement.cloneNode(true);
      if (agentElement.parentNode) {
        agentElement.parentNode.replaceChild(newAgentElement, agentElement);
        clippyElementRef.current = newAgentElement;
      }

      // First, add the right-click handler with highest priority
      newAgentElement.addEventListener(
        "contextmenu",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          // Ensure the menu shows by directly calling it with a short delay
          setTimeout(() => {
            handleContextMenu(e);
          }, 10);

          return false;
        },
        { capture: true }
      );

      // Then add double-click handler with lower priority
      newAgentElement.addEventListener("dblclick", (e) => {
        handleClippyInteraction();
      });

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
  }, [clippy, handleClippyInteraction, handleContextMenu]);

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
  }, [
    calculateBoundedPosition,
    desktopRectRef,
    setPosition,
    fixedPosition,
    relativePositionRef,
  ]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(() => {
        if (!fixedPosition) {
          updateClippyPosition();
        }

        // Reposition custom balloons as needed
        if (window.showClippyCustomBalloon || window.showClippyChatBalloon) {
          // This will trigger redrawing of any visible balloons
          const clippyElement = document.querySelector(".clippy");
          if (clippyElement) {
            const event = new Event("clippy-resize");
            document.dispatchEvent(event);
          }
        }
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
  }, [updateClippyPosition, fixedPosition]);

  // Store clippy instance and set up balloon observer
  useEffect(() => {
    if (clippy) {
      setClippyInstance(clippy);

      // Modify clippy's speak function to use our custom balloon
      const originalSpeak = clippy.speak;
      clippy.speak = (text) => {
        if (window.showClippyCustomBalloon) {
          window.showClippyCustomBalloon(text);
          return;
        }
        // Fall back to original method if needed
        if (originalSpeak) originalSpeak.call(clippy, text);
      };

      // Set up the enhanced balloon observer
      return setupBalloonObserver();
    }
  }, [clippy, setClippyInstance, setupBalloonObserver]);

  // Apply FIXED scaling to Clippy only (NO viewport scaling)
  useEffect(() => {
    if (!clippy) return;

    const applyScaling = () => {
      const agentElements = document.querySelectorAll(".clippy");
      if (agentElements.length === 0) return false;

      // Just apply simple fixed scaling - NO viewport-based scaling
      // This is the original approach
      const clippyElement = agentElements[0];
      clippyElement.style.transform = "scale(.9)";
      clippyElement.style.transformOrigin = "center";

      // Remove any transition effects that might affect positioning
      clippyElement.style.transition = "none";

      // Apply global styles to hide the original balloon and clean up any pseudo-elements
      const styleElement = document.createElement("style");
      styleElement.id = "clippy-custom-styles";
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
          }
          
          /* Explicitly hide balloon tips */
          .custom-clippy-balloon::after,
          .custom-clippy-balloon:after,
          .custom-clippy-balloon::before,
          .custom-clippy-balloon:before {
            display: none !important;
            visibility: hidden !important;
            content: none !important;
            border: none !important;
            width: 0 !important;
            height: 0 !important;
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

  // Drag handlers for moving Clippy
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

          // Trigger an event to reposition any visible balloons
          const event = new Event("clippy-moved");
          document.dispatchEvent(event);
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

          // Final balloon position update
          const event = new Event("clippy-moved");
          document.dispatchEvent(event);
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
      setPosition,
      setUserPositioned,
      hasBeenDraggedRef,
      desktopViewportRef,
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
        // Calculate extra offset for 40px down
        const extraYOffset = desktopRect ? 40 / desktopRect.height : 0.05;

        relativePositionRef.current = {
          xPercent: isMobile ? 0.85 : 0.9,
          yPercent: (isMobile ? 0.85 : 0.5) + extraYOffset, // Add 40px equivalent
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
      const isDraggable = !fixedPosition; // Draggable when not in fixed mode

      agentElement.style.position = fixedPosition ? "fixed" : "absolute";
      agentElement.style.left = `${absoluteX}px`;
      agentElement.style.top = `${absoluteY}px`;
      agentElement.style.bottom = "auto";
      agentElement.style.right = "auto";
      agentElement.style.zIndex = "1000";
      agentElement.style.display = visible ? "block" : "none";
      agentElement.style.cursor = isDraggable ? "move" : "default";
      agentElement.style.willChange = "transform, left, top";
      agentElement.style.transform = "scale(.9)";
      agentElement.style.transformOrigin = "center";

      // Update position state
      if (boundedPos.x !== position.x || boundedPos.y !== position.y) {
        setPosition(boundedPos);
      }

      // Setup drag handling when not in fixed position
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

      // Listen for custom events to reposition any open balloons
      document.addEventListener("clippy-moved", () => {
        if (window.hideClippyCustomBalloon && window.showClippyCustomBalloon) {
          // Force reposition of any open balloons
          const message =
            document.querySelector(".custom-clippy-balloon")?.textContent ||
            document.querySelector(".clippy-content")?.textContent;

          if (message) {
            window.hideClippyCustomBalloon();
            setTimeout(() => {
              window.showClippyCustomBalloon(message);
            }, 10);
          }
        }
      });

      document.addEventListener("clippy-resize", () => {
        // Similar to clippy-moved, but can be handled differently if needed
        if (window.hideClippyCustomBalloon && window.showClippyCustomBalloon) {
          const message =
            document.querySelector(".custom-clippy-balloon")?.textContent ||
            document.querySelector(".clippy-content")?.textContent;

          if (message) {
            window.hideClippyCustomBalloon();
            setTimeout(() => {
              window.showClippyCustomBalloon(message);
            }, 10);
          }
        }
      });

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

      // Hide any balloons when Clippy is hidden
      if (!visible && window.hideClippyCustomBalloon) {
        window.hideClippyCustomBalloon();
      }
    }
  }, [clippy, visible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Remove any custom styles
      const styleElement = document.getElementById("clippy-custom-styles");
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }

      // Remove event listeners
      document.removeEventListener("clippy-moved", () => {});
      document.removeEventListener("clippy-resize", () => {});

      // Disconnect observer
      if (balloonObserverRef.current) {
        balloonObserverRef.current.disconnect();
      }
    };
  }, []);

  return null;
};

export default ClippyController;
