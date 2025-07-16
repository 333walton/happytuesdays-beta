// ClippyContextMenu.js - COMPLETE FIXED VERSION with proper positioning

import React, { useState, useEffect, useRef } from "react";
import * as icons from "../../../icons";
import ReactDOM from "react-dom";
import clippyFaq from "../../../data/textFiles/clippyFaq";

// FIXED: Animation logging function
const logAnimation = (animationName, context = "context menu") => {
  // Force log animation regardless of dev mode
  console.log(
    `%c🎭 Clippy Animation: "${animationName}"%c (from ${context})`,
    "color: #0066cc; font-weight: bold; font-size: 14px;",
    "color: #666; font-size: 12px;"
  );
};

const ClippyContextMenu = ({
  x,
  y,
  onClose,
  onAction,
  agents,
  toggleSettings,
  currentAgent,
}) => {
  const [portalContainer, setPortalContainer] = useState(null);
  const [submenuOpen, setSubmenuOpen] = useState(null);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  // FIXED: Start with null position to prevent flashing
  const [dynamicPosition, setDynamicPosition] = useState(null);

  // FIXED: Device-specific arrow symbols with fallback rendering
  const isMobile =
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const leftArrowIcon = ""; // Use CSS pseudo-element for both mobile and desktop

  // PHASE 3: Dynamic agent-specific animation configurations
  const AGENT_ANIMATIONS = {
    Clippy: {
      Congratulate: "Congratulate",
      "Send Mail": "SendMail",
      Print: "Print",
      "Get Attention": "GetAttention",
      Save: "Save",
      "Get Techy": "GetTechy",
      "Gesture Up": "GestureUp",
      Writing: "Writing",
      Processing: "Processing",
      "Good Bye": "GoodBye",
      Checking: "CheckingSomething",
      Hearing: "Hearing_1",
      "Idle Snooze": "IdleSnooze",
      "Get Artsy": "GetArtsy",
      Searching: "Searching",
      "Empty Trash": "EmptyTrash",
      "Rest Pose": "RestPose",
    },
    F1: {
      Wave: "Wave", //good
      Greeting: "Greeting", //great
      "Get Attention": "GetAttention", //good
      Alert: "Alert", //good
      Thinking: "Thinking", //good
      Processing: "Processing", //good
      "Get Techy": "GetTechy", //good
    },
    Genius: {
      Wave: "Wave", //good
      "Good Bye": "GoodBye",
      Greeting: "Greeting", //best
      "Get Attention": "GetAttention", //good
      Thinking: "Thinking", //good
      Processing: "Processing", //good
      "Get Techy": "GetTechy", //good
      "Look Up": "LookUp", //good
      "Gesture Up": "GestureUp", //good
      "Gesture Down": "GestureDown", //good
    },
    Merlin: {
      Wave: "Wave", //good
      "Get Attention": "GetAttention", //good
      Alert: "Alert", //good
      Thinking: "Thinking", //good
      Processing: "Processing", //great
      "Look Down": "LookDown", //good
      "Gesture Up": "GestureUp", //good
      "Rest Pose": "RestPose", //good
      Show: "Show", //great
      Explain: "Explain", //good
    },
    //Genie: {
    //Wave: "Wave",
    //"Good Bye": "GoodBye",
    //Greeting: "Greeting",
    //"Get Attention": "GetAttention",
    //Alert: "Alert",
    //Thinking: "Thinking",
    //Processing: "Processing",
    //"Get Wizardy": "GetWizardy",
    //"Look Left": "LookLeft",
    //"Look Right": "LookRight",
    //"Look Up": "LookUp",
    //"Look Down": "LookDown",
    //"Gesture Up": "GestureUp",
    //"Gesture Down": "GestureDown",
    //"Gesture Left": "GestureLeft",
    //"Gesture Right": "GestureRight",
    //"Rest Pose": "RestPose",
    //Show: "Show",
    //},
    //Links: {
    //Wave: "Wave",
    //"Good Bye": "GoodBye",
    //Greeting: "Greeting",
    //"Get Attention": "GetAttention",
    //Alert: "Alert",
    //Thinking: "Thinking",
    //Writing: "Writing",
    //Processing: "Processing",
    //Searching: "Searching",
    //"Look Left": "LookLeft",
    //"Look Right": "LookRight",
    //"Look Up": "LookUp",
    //"Look Down": "LookDown",
    //"Gesture Up": "GestureUp",
    //"Gesture Down": "GestureDown",
    //"Gesture Left": "GestureLeft",
    //"Gesture Right": "GestureRight",
    //"Rest Pose": "RestPose",
    //Show: "Show",
    //},
    Bonzi: {
      Wave: "Wave", //good
      Greeting: "Greeting", //good
      "Get Attention": "GetAttention", //good
      "Look Down": "LookDown", //good
      "Gesture Up": "GestureUp", //good
      "Gesture Down": "GestureDown", //good
      Show: "Show", //great
      Explain: "Explain", //good
    },
  };

  // PHASE 3: Get current agent's animations dynamically
  const currentAgentAnimations =
    AGENT_ANIMATIONS[currentAgent] || AGENT_ANIMATIONS.Clippy;
  const animationList = currentAgentAnimations; // Use current agent's animations
  const animations = Object.values(animationList); // For validation
  const displayNames = Object.keys(animationList); // For menu display

  console.log(`🎭 Dynamic animations for ${currentAgent}:`, {
    count: displayNames.length,
    animations: displayNames.slice(0, 5).join(", ") + "...",
  });

  // Get desktop viewport boundaries for positioning
  const getDesktopViewport = () => {
    const desktop =
      document.querySelector(".desktop.screen") ||
      document.querySelector(".desktop") ||
      document.querySelector(".w98");

    if (desktop) {
      const rect = desktop.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      };
    }

    // Fallback to window viewport
    return {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  };

  // Helper to get viewport for both mobile and desktop
  const getViewport = () => {
    // Use window for mobile, desktop container for desktop
    if (
      window.innerWidth <= 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      return {
        left: 0,
        top: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return getDesktopViewport();
  };

  // Create portal container on mount and trigger Gesture Up animation
  useEffect(() => {
    console.log("🎯 ClippyContextMenu creating portal container");

    // FIXED: Trigger "Gesture Up" animation when context menu opens, bypassing all rules
    if (window.clippy?.play) {
      setTimeout(() => {
        console.log(
          '🎭 Context Menu Opened: Playing "Gesture Up" animation (bypassing all cooldowns)'
        );
        window.clippy.play("GestureUp");
      }, 200); // Small delay to ensure smooth opening
    }

    const container = document.createElement("div");
    container.id = "clippy-context-menu-portal";
    container.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      pointer-events: none !important;
      z-index: 2147483647 !important;
      visibility: visible !important;
      opacity: 1 !important;
      display: block !important;
    `;

    document.body.appendChild(container);
    setPortalContainer(container);

    return () => {
      if (container.parentElement) {
        container.remove();
      }
    };
  }, []);

  // FIXED: Calculate position once with delay for agent loading
  useEffect(() => {
    if (!portalContainer) return;

    // 150ms delay to wait for agent height adjustments
    const timeoutId = setTimeout(() => {
      const overlayEl = document.getElementById("clippy-clickable-overlay");
      const menuWidth = 180;
      const fixedGap = 18; // 18px gap above overlay
      const viewport = getViewport();

      // Detect if mobile
      const isMobile =
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      if (!overlayEl) {
        // Fallback to click-based positioning if overlay not found
        const fallbackX = Math.max(
          viewport.left + 5,
          Math.min(x, viewport.right - menuWidth - 5)
        );
        const fallbackY = Math.max(
          viewport.top + 5,
          Math.min(y - 60, viewport.bottom - 170 - 5)
        );
        setDynamicPosition({ x: fallbackX - 8, y: fallbackY });
        return;
      }

      const overlayRect = overlayEl.getBoundingClientRect();

      // FIXED: Center horizontally above Clippy
      const menuLeft = overlayRect.left + overlayRect.width / 2 - menuWidth / 2;
      const constrainedLeft = Math.max(
        viewport.left + 5,
        Math.min(menuLeft, viewport.right - menuWidth - 5)
      );

      // INITIAL POSITION: Set a temporary position first
      // Position menu well above Clippy initially
      const tempTop = overlayRect.top - 200; // Temporary position

      setDynamicPosition({
        x: constrainedLeft - 8,
        y: tempTop,
      });

      // CRITICAL: Wait for menu to render, then reposition with actual height
      requestAnimationFrame(() => {
        setTimeout(() => {
          const menuElement = document.querySelector(
            ".context-menu-content.clippy-context-menu"
          );
          if (menuElement) {
            const menuRect = menuElement.getBoundingClientRect();
            const actualMenuHeight = menuRect.height;

            // Now calculate the exact position with actual height
            const menuBottom = overlayRect.top - fixedGap;
            const finalMenuTop = menuBottom - actualMenuHeight;

            // Ensure menu stays within viewport
            const constrainedTop = Math.max(viewport.top + 5, finalMenuTop);

            // Update to final position
            setDynamicPosition({
              x: constrainedLeft - 8,
              y: constrainedTop,
            });

            console.log(
              `🎯 Context menu final position (${
                isMobile ? "mobile" : "desktop"
              }): ` +
                `overlay at ${overlayRect.top}px, actual menu height ${actualMenuHeight}px, ` +
                `menu bottom at ${menuBottom}px, final top at ${constrainedTop}px, gap: ${fixedGap}px`
            );
          }
        }, 10); // Small delay to ensure render is complete
      });
    }, 10);

    return () => clearTimeout(timeoutId);
  }, [x, y, portalContainer]);

  // FIXED: Enhanced MenuItem with proper hover handling and flexible icon/arrow placement
  const MenuItem = ({
    children,
    onClick,
    onMouseEnter,
    onMouseLeave,
    disabled,
    hasSubmenu,
    isSubmenuItem,
    leftIcon,
    rightIcon,
    currentSubmenuOpen,
    submenuType,
  }) => {
    const isMobile =
      window.innerWidth <= 768 ||
      /Android|webOS|iPhone|iPad|Icod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const [isHovered, setIsHovered] = useState(false);
    const [isMobileTouched, setIsMobileTouched] = useState(false);

    // Mobile touch handlers for blue highlighting
    const handleTouchStart = (e) => {
      if (isMobile && !disabled) {
        setIsMobileTouched(true);
      }
    };

    const handleTouchEnd = (e) => {
      if (isMobile && !disabled) {
        setIsMobileTouched(false);
      }
    };

    const handleTouchCancel = (e) => {
      if (isMobile && !disabled) {
        setIsMobileTouched(false);
      }
    };

    // Combine external onMouseEnter/onMouseLeave with internal hover state management
    const handleMouseEnter = (e) => {
      if (!disabled) {
        setIsHovered(true);
        if (onMouseEnter) onMouseEnter(e);
        // Only open submenu on hover for desktop
        if (hasSubmenu && !isMobile && !disabled) {
          handleSubmenuOpen(submenuType, e);
        } else if (!hasSubmenu && !isSubmenuItem && currentSubmenuOpen) {
          // If hovering over a different main menu item, close any open submenu
          setSubmenuOpen(null);
        }
      }
    };

    const handleMouseLeave = (e) => {
      if (!disabled) {
        setIsHovered(false);
        if (onMouseLeave) onMouseLeave(e);
      }
    };

    // Determine if the menu item should be highlighted
    // Desktop: Highlight if hovered OR if it's a parent with an open submenu
    // Mobile: Highlight if touched OR if it's a parent with an open submenu
    const isHighlighted =
      (isMobile ? isMobileTouched : isHovered) ||
      (hasSubmenu && currentSubmenuOpen === submenuType);

    // Apply hover/touch style
    const finalStyle = {
      ...menuItemStyle,
      // Apply blue highlight style if highlighted and not disabled
      ...(isHighlighted && !disabled ? menuItemHoverStyle : {}),
      transition: "background-color 0.1s ease-in-out, color 0.1s ease-in-out",
    };

    return (
      <div
        className={`context-menu-item ${disabled ? "disabled" : ""} ${
          isSubmenuItem ? "submenu-item" : ""
        } ${isMobile ? "mobile" : ""}`}
        onClick={disabled ? null : onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        style={finalStyle}
        data-submenu={hasSubmenu ? submenuType : undefined}
      >
        {(leftIcon || hasSubmenu) && (
          <span
            className={`arrow ${
              isSubmenuItem
                ? "submenu-icon"
                : isMobile
                ? "arrow-mobile"
                : "arrow-desktop"
            } ${isHighlighted && !disabled ? "arrow-highlighted" : ""}`}
            style={{
              marginRight: "8px",
              fontSize: isMobile ? "11px" : "12px",
              fontFamily: isSubmenuItem
                ? "Arial, Helvetica, sans-serif"
                : "Arial, Helvetica, sans-serif",
              fontWeight: isMobile ? "bold" : "normal",
              position: isSubmenuItem
                ? "static"
                : isMobile
                ? "absolute"
                : "absolute",
              left: isSubmenuItem ? "auto" : isMobile ? "6px" : "6px",
            }}
          >
            {/* For submenu items, show the leftIcon (checkmark), otherwise show empty for arrow */}
            {isSubmenuItem ? leftIcon : "◄"}
            {hasSubmenu &&
              !isSubmenuItem &&
              console.log(
                "Arrow span rendered with class:",
                `arrow ${isMobile ? "arrow-mobile" : "arrow-desktop"}`
              )}
          </span>
        )}
        <span
          style={{
            textAlign: hasSubmenu ? "center" : "left",
            width: hasSubmenu ? "100%" : "auto",
            display: hasSubmenu ? "block" : "inline",
          }}
        >
          {children}
        </span>
        {rightIcon && (
          <span style={{ marginLeft: "8px", fontSize: "12px" }}>
            {rightIcon}
          </span>
        )}
      </div>
    );
  };

  // FIXED: Simplified submenu positioning with bottom alignment
  const handleSubmenuOpen = (submenuType, event) => {
    const isMobile =
      window.innerWidth <= 768 ||
      /Android|webOS|iPhone|iPad|Icod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const submenuWidth = isMobile ? 180 : 160;
    const viewport = getViewport();

    // Get main menu for alignment
    const mainMenu = document.querySelector(
      ".context-menu-content.clippy-context-menu"
    );

    if (!mainMenu) {
      console.warn("Main menu not found for submenu positioning");
      return;
    }

    const mainMenuRect = mainMenu.getBoundingClientRect();

    // Check if submenu would overflow right
    const wouldOverflowRight =
      mainMenuRect.right + submenuWidth > viewport.right;

    // Position submenu horizontally with slight overlap
    const OVERLAP = 2;
    const HORIZONTAL_OFFSET = 19; // Desktop offset
    const MOBILE_EXTRA_OFFSET = isMobile ? 19 : 0; // Additional 19px for mobile

    let submenuX;
    if (wouldOverflowRight) {
      // Position to the left
      submenuX =
        mainMenuRect.left -
        submenuWidth +
        OVERLAP +
        HORIZONTAL_OFFSET +
        MOBILE_EXTRA_OFFSET;
    } else {
      // Position to the right
      submenuX =
        mainMenuRect.right - OVERLAP + HORIZONTAL_OFFSET + MOBILE_EXTRA_OFFSET;
    }

    // FIXED: More accurate submenu height calculation
    let actualSubmenuHeight;
    if (submenuType === "animations") {
      // Animations submenu has many items, will hit max-height
      actualSubmenuHeight = 166; // Based on CSS max-height
    } else if (submenuType === "agents") {
      // Calculate based on actual number of agents
      // Each item is 25px height (including borders/padding)
      // Plus 4px for the submenu borders (2px top + 2px bottom)
      actualSubmenuHeight = agents.length * 25 + 6;

      // Mobile-specific adjustment - REMOVED the +9 that was adding extra height
      // if (isMobile && submenuType === "agents") {
      //   actualSubmenuHeight += 9; // This line is commented out/removed
      // }
    } else {
      actualSubmenuHeight = 200; // Default
    }

    // CRITICAL: Account for border differences between main menu and submenu
    const borderAdjustment = 2;

    // Position submenu so its bottom aligns with main menu bottom
    let submenuTop =
      mainMenuRect.bottom - actualSubmenuHeight + borderAdjustment;

    // NEW: Apply mobile-specific offset for agents submenu
    if (isMobile && submenuType === "agents") {
      submenuTop -= 13; // Move up by 7px for mobile agents submenu
    }

    // Ensure submenu doesn't go above viewport
    const constrainedTop = Math.max(viewport.top + 5, submenuTop);

    setSubmenuPosition({
      x: Math.round(submenuX),
      y: Math.round(constrainedTop),
      openLeft: wouldOverflowRight,
    });

    setSubmenuOpen(submenuType);

    console.log(
      `🎯 Submenu positioned: type=${submenuType}, main bottom=${mainMenuRect.bottom}px, submenu top=${constrainedTop}px, height=${actualSubmenuHeight}px, mobile=${isMobile}`
    );
  };

  const handleSubmenuClose = () => {
    // Increased delay for mobile to make it easier to select options
    const isMobile =
      window.innerWidth <= 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    setTimeout(
      () => {
        setSubmenuOpen(null);
      },
      isMobile ? 500 : 300
    );
  };

  // FIXED: Enhanced agent change function with actual character switching
  const handleAgentChange = (newAgent) => {
    console.log(`🎯 Changing agent from ${currentAgent} to ${newAgent}`);

    // If switching away from Genius, close the chat by clicking the X button
    if (currentAgent === "Genius" && newAgent !== "Genius") {
      console.log("🔄 Switching away from Genius - closing chat window");

      // Look for the close button in the Botpress chat header
      setTimeout(() => {
        // Target the close button in the header, not the container close button
        const closeButton =
          document.querySelector(
            ".bpHeaderContentActionsContainer .lucide.lucide-x"
          ) ||
          document.querySelector(
            ".bpHeaderContentActionsContainer svg.lucide-x"
          ) ||
          document.querySelector(
            '.bpHeaderContentActionsContainer [class*="lucide-x"]'
          ) ||
          document.querySelector('[aria-label="Close Chatbot Button"]');

        if (closeButton) {
          console.log("✅ Found header close button:", closeButton);

          // Find the clickable parent (usually a button)
          const clickableElement =
            closeButton.closest("button") ||
            closeButton.closest('[role="button"]') ||
            closeButton.parentElement;

          if (clickableElement) {
            console.log("Clicking parent button element");
            const clickEvent = new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
            });
            clickableElement.dispatchEvent(clickEvent);
          } else {
            // Fallback: dispatch click on the SVG itself
            const clickEvent = new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
            });
            closeButton.dispatchEvent(clickEvent);
          }
        } else {
          console.warn("⚠️ Close button not found, trying alternative methods");

          // Alternative: Use botpress.close() if available
          if (window.botpress && window.botpress.close) {
            console.log("Using botpress.close() method");
            window.botpress.close();
          }
        }
      }, 100); // Small delay to ensure chat is open
    }

    // Use global function to change agent (will trigger actual character change)
    if (window.setCurrentAgent) {
      window.setCurrentAgent(newAgent);
    }

    // Update global agent state for menu
    window.currentAgent = newAgent;

    // Trigger event to refresh start menu
    window.dispatchEvent(
      new CustomEvent("agentChanged", { detail: { agent: newAgent } })
    );

    // Hide any open balloons during transition
    if (window.hideClippyCustomBalloon) {
      window.hideClippyCustomBalloon();
    }
    if (window.hideChatBalloon) {
      window.hideChatBalloon();
    }

    // Brief visual feedback
    const clippyEl = document.querySelector(".clippy");
    if (clippyEl) {
      clippyEl.style.opacity = "0.7";

      setTimeout(() => {
        // Restore appearance
        clippyEl.style.opacity = "1";
        // The correct scale will be applied by positionClippyAndOverlay

        // Play welcome animation for new agent
        if (window.clippy?.play) {
          setTimeout(() => {
            logAnimation("Wave", `agent change to ${newAgent}`);
            window.clippy.play("Wave");

            // Show welcome message
            if (window.showClippyCustomBalloon) {
              setTimeout(() => {
                window.showClippyCustomBalloon(
                  `Hello! I'm ${newAgent} now. How can I help you?`
                );
              }, 800);
            }

            // Reposition for new agent - this will also set the correct scale
            if (window.ClippyPositioning?.positionClippyAndOverlay) {
              const overlayEl = document.getElementById(
                "clippy-clickable-overlay"
              );
              window.ClippyPositioning.positionClippyAndOverlay(
                clippyEl,
                overlayEl,
                null
              );
            }
          }, 200);
        }
      }, 400);
    }
  };

  // FIXED: Functional menu actions with enhanced agent switching
  const handleMenuAction = (action, data = null) => {
    console.log(`🎯 Context menu action triggered: ${action}`, data);

    switch (action) {
      case "hide":
        // Use global function to hide Clippy
        if (window.setAssistantVisible) {
          window.setAssistantVisible(false);
        }
        onAction("hide");
        break;

      case "about":
        console.log("🎯 Context menu action: Open About Clippy (Notepad)");
        if (typeof window !== "undefined") {
          window.clippyFaqContent = clippyFaq;
          window.textchat32Icon = icons.textchat32;
          window.ProgramContext.onOpen({
            component: "Notepad",
            multiInstance: true,
            title: `About ${window.currentAgent || "Clippy"}`,
            icon: window.faq32Icon,
            data: {
              content: window.clippyFaqContent,
              wrap: true,
              readOnly: true,
              enableHtml: true, // ADD THIS LINE
              contentType: "clippyfaq", // ADD THIS LINE
            },
          });
        } else {
          console.warn("window.ProgramContext.onOpen is not available.");
          if (window.showClippyCustomBalloon) {
            window.showClippyCustomBalloon(
              "Sorry, I couldn't open the About Clippy information."
            );
          }
        }
        onAction("aboutClippy");
        break;

      case "selectAgent":
        // FIXED: Enhanced agent change with actual character switching
        handleAgentChange(data);

        // Special handling for Genius - set flag to auto-open chat
        if (data === "Genius") {
          console.log("🎯 Genius selected - setting flag to auto-open chat");
          window.geniusShouldAutoOpenChat = true;
        }

        onAction("selectAgent", data);
        break;

      case "playAnimation":
        // FIXED: Play specific animation with logging
        if (window.clippy?.play && data) {
          // Ensure we're using the exact animation name
          const animationName = String(data).trim();
          if (animations.includes(animationName)) {
            logAnimation(animationName, "context menu selection");

            // FIXED: Proper Hide animation - play animation, then hide for 2 seconds
            if (animationName === "Hide") {
              console.log("🎭 Playing Hide animation");

              // Disable all interactions immediately
              window.clippyIsHiding = true;

              // Play the hide animation
              window.clippy.play(animationName);

              // Wait for hide animation to complete (approximately 2 seconds)
              setTimeout(() => {
                console.log(
                  "🎭 Hide animation completed, hiding Clippy for 2 seconds"
                );

                const clippyEl = document.querySelector(".clippy");
                const overlayEl = document.getElementById(
                  "clippy-clickable-overlay"
                );

                // Completely hide Clippy elements
                if (clippyEl) {
                  clippyEl.style.visibility = "hidden";
                  clippyEl.style.opacity = "0";
                  clippyEl.style.transform = "translateX(-9999px)";
                }
                if (overlayEl) {
                  overlayEl.style.visibility = "hidden";
                  overlayEl.style.opacity = "0";
                  overlayEl.style.pointerEvents = "none";
                  overlayEl.style.transform = "translateX(-9999px)";
                }

                // Set global flag to prevent any Clippy rendering
                window.clippyIsHidden = true;

                // Restore Clippy after 2 seconds of being hidden
                setTimeout(() => {
                  console.log("🎭 Restoring Clippy after hide period");

                  // Clear both flags
                  window.clippyIsHidden = false;
                  window.clippyIsHiding = false;

                  // Restore Clippy elements
                  if (clippyEl) {
                    clippyEl.style.visibility = "visible";
                    clippyEl.style.opacity = "1";
                    clippyEl.style.transform = "";
                  }
                  if (overlayEl) {
                    overlayEl.style.visibility = "visible";
                    overlayEl.style.opacity = "1";
                    overlayEl.style.pointerEvents = "auto";
                    overlayEl.style.transform = "";
                  }

                  console.log("🎭 Clippy fully restored after hide sequence");
                }, 2000); // Hidden for 2 seconds
              }, 2000); // Wait for hide animation to complete (~2 seconds)
            } else {
              window.clippy.play(animationName);
            }
          } else {
            console.warn(`Invalid animation name: ${animationName}`);
          }
        }
        onAction("playAnimation", data);
        break;

      case "chat":
        // Check if current agent is Genius
        if (currentAgent === "Genius") {
          console.log("🎯 Chat with Genius - triggering FAB");

          // Small delay to ensure Botpress is loaded
          setTimeout(() => {
            if (window.botpress && window.botpress.open) {
              console.log("✅ Opening Genius chat via botpress.open()");
              window.botpress.open();
            } else {
              console.warn("⚠️ Botpress not found, trying fallback");
              // Fallback to trigger function if available
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
          }, 200); // Small delay to ensure everything is loaded
        } else {
          // For non-Genius agents, show regular chat balloon
          if (window.showClippyChatBalloon) {
            window.showClippyChatBalloon(
              "Hi! What would you like to chat about?"
            );
          }
        }
        onAction("chat");
        break;

      case "greet":
        if (window.clippy?.play) {
          let animationName;
          if (currentAgent === "Clippy") {
            animationName = "GetAttention"; // Or use "GetAttention", "Congratulate", etc.
          } else {
            animationName = "Wave";
          }
          logAnimation(animationName, "context menu greet action");
          window.clippy.play(animationName);

          if (window.showClippyCustomBalloon) {
            setTimeout(() => {
              window.showClippyCustomBalloon(
                "Well hello there! It's great to see you. Feel free to explore Happy Tuesdays!"
              );
            }, 800);
          }
        }
        onAction("wave");
        break;

      case "settings":
        if (typeof toggleSettings === "function") {
          toggleSettings(true); // ✅ Make sure to explicitly open with `true`
        } else {
          console.warn("toggleSettings function not found.");
          if (window.showClippyCustomBalloon) {
            window.showClippyCustomBalloon("Settings function unavailable.");
          }
        }
        onAction("settings");
        break;

      default:
        console.warn(`Unknown context menu action: ${action}`);
        onAction(action, data);
    }

    onClose();
  };

  // Styles - Place this BEFORE the MenuItem component
  const menuStyle = {
    position: "absolute",
    left: `${dynamicPosition?.x}px`,
    top: `${dynamicPosition?.y}px`,
    backgroundColor: "#c0c0c0",
    border: "2px outset #c0c0c0",
    boxShadow: "4px 4px 8px rgba(0,0,0,0.3)",
    minWidth: "160px",
    fontFamily: "Tahoma, sans-serif",
    fontSize: "11px",
    color: "#000000",
    WebkitTextFillColor: "#000000",
    pointerEvents: "auto",
    visibility: "visible",
    opacity: 1,
    display: "block",
    transform: "translateZ(0)",
    isolation: "isolate",
    textAlign: "right",
  };

  const menuItemStyle = {
    padding: "6px 16px",
    minHeight: "auto",
    cursor: "pointer",
    fontSize: "11px",
    fontFamily: "Tahoma, sans-serif",
    color: "#000000",
    WebkitTextFillColor: "#000000",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    transition: "background-color 0.1s",
    userSelect: "none",
    WebkitUserSelect: "none",
  };

  const menuItemHoverStyle = {
    backgroundColor: "#0066cc",
    color: "#ffffff",
    WebkitTextFillColor: "#ffffff",
  };

  const separatorStyle = {
    height: "1px",
    backgroundColor: "#c0c0c0",
    margin: "2px 0",
    borderTop: "1px solid #808080",
  };

  const submenuStyle = {
    position: "absolute",
    left: `${submenuPosition.x}px`,
    top: `${submenuPosition.y}px`,
    backgroundColor: "#c0c0c0",
    border: "2px outset #c0c0c0",
    boxShadow: "4px 4px 8px rgba(0,0,0,0.3)",
    width: "140px",
    height: "auto",
    maxHeight: "200px",
    minHeight: "25px",
    overflowY: "auto",
    overflowX: "hidden",
    fontFamily: "Tahoma, sans-serif",
    fontSize: "11px",
    pointerEvents: "auto",
    visibility: "visible",
    opacity: 1,
    display: "flex",
    flexDirection: "column",
    transform: "translateZ(0) translate3d(0, 0, 0)",
    zIndex: isMobile ? 10000 : 2, // Much higher z-index for mobile
    textAlign: "left",
    margin: "0",
    padding: "0",
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  };

  // Add mobile-specific styles and standard submenu alignment
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .context-menu-item.mobile {
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }

      .context-menu-item.mobile:active {
        background-color: rgba(0, 0, 0, 0.1);
      }

      .context-submenu {
        padding: 0;
        text-align: left;
        min-width: 120px !important;
        max-height: 164px !important;
      }

      .context-submenu .context-menu-item {
        padding: 6px 8px 6px 12px;
        min-height: auto;
        justify-content: flex-start !important;
        flex-direction: row;
      }

      .context-submenu .context-menu-item span:first-child {
        margin-left: 0;
      }

      .context-submenu .context-menu-item.submenu-item {
        padding: 6px 8px 6px 8px;
      }

      .context-submenu.mobile .context-menu-item {
        padding: 6px 12px;
        min-height: auto;
      }

      /* Apply hover style using pseudo-class */
      .context-menu-item:not(.mobile):not(.disabled):hover {
        background-color: #0066cc !important;
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
      }

      /* Left scrollbar for animations submenu */
      .context-submenu.animations-submenu {
        direction: rtl;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .context-submenu.animations-submenu .context-menu-item {
        direction: ltr;
        margin-left: 0px;
      }

      /* Remove mobile-specific sizing and font-size adjustments */
      @media (max-width: 768px) {
        .clippy-context-menu {
          min-width: 160px !important;
          max-width: none !important;
          font-size: 11px !important;
        }

        .context-submenu {
          min-width: auto;
          max-width: none;
        }

        .context-menu-item.mobile {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          padding-top: 4.5px;
          padding-bottom: 4.5px;
        }

        .context-menu-item.mobile:active {
          background-color: rgba(0, 0, 0, 0.1);
        }

        .context-submenu.mobile .context-menu-item {
          padding: 4.5px 12px; /* Reduced vertical padding by 1.5px top/bottom */
          min-height: auto;
        }
      }

      /* Add styles for disabled menu items */
      .context-menu-item.disabled {
        opacity: 0.6;
        cursor: not-allowed;
        color: #666666;
        -webkit-text-fill-color: #666666;
      }

      /* Desktop-only: Match main menu item height to submenu item height */
      @media (min-width: 769px) {
        .clippy-context-menu .context-menu-item:not(.submenu-item) {
          height: 25px !important;
          padding: 4px 16px !important; /* Adjust padding to achieve 25px total height */
          min-height: 25px !important;
        }

        /* Ensure submenu items have consistent height for bottom alignment */
        .context-submenu .context-menu-item {
          height: 25px !important;
          min-height: 25px !important;
          max-height: 25px !important;
          padding: 4px 8px !important;
          box-sizing: border-box !important;
          display: flex !important;
          align-items: center !important;
        }

        /* Ensure submenu container maintains bottom alignment */
        .context-submenu {
          box-sizing: border-box !important;
        }
      }

      Here are the fixes in easy-to-paste chunks:
Fix 1: First, locate this line in your useEffect where styles are created:
Find this section (around line 771):
javascript      /* Enlarge touch targets on mobile without changing visual appearance */
      @media (max-width: 768px), (pointer: coarse) {
Fix 2: Replace everything from that line until the end of the style content with this:
javascript      /* Enlarge touch targets on mobile without changing visual appearance */
      @media (max-width: 768px), (pointer: coarse) {
        .context-menu-item {
          position: relative;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation !important;
          margin: -5px 0;
          padding-top: calc(4.5px + 5px) !important;
          padding-bottom: calc(4.5px + 5px) !important;
        }
      }

      /* Mobile-only: Fix bottom alignment for mobile context menus */
      @media (max-width: 768px) {
        .clippy-context-menu .context-menu-item {
          height: auto !important;
          min-height: auto !important;
          padding-top: 4.5px !important;
          padding-bottom: 4.5px !important;
          box-sizing: border-box !important;
        }

        /* Ensure mobile submenu items have consistent height for bottom alignment */
        .context-submenu .context-menu-item {
          height: auto !important;
          min-height: auto !important;
          padding: 4.5px 12px !important;
          box-sizing: border-box !important;
          display: flex !important;
          align-items: center !important;
        }

        /* Ensure mobile submenu container maintains bottom alignment */
        .context-submenu {
          box-sizing: border-box !important;
          z-index: 10000 !important;
        }
      }

      /* Arrow symbol styling to prevent emoji substitution */
      .arrow {
        font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace !important;
        font-variant-emoji: text !important;
        -webkit-font-variant-emoji: text !important;
        font-feature-settings: 'liga' off, 'kern' off !important;
        -webkit-font-feature-settings: 'liga' off, 'kern' off !important;
        text-rendering: geometricPrecision !important;
        font-weight: normal !important;
      }

      /* FIXED: Consolidated arrow styles - Mobile and Desktop arrow using CSS pseudo-element */
      /* FIXED: Consolidated arrow styles - Mobile and Desktop arrow using CSS pseudo-element */
      .arrow-highlighted.arrow-mobile::after,
      .arrow-highlighted.arrow-desktop::after {
        content: "" !important;
        display: inline-block !important;
        width: 0 !important;
        height: 0 !important;
        border-top: 4.8px solid transparent !important;
        border-bottom: 4.8px solid transparent !important;
        border-right: 6.4px solid #000000 !important;
        margin-left: 2px !important;
        position: relative !important;
        z-index: 1 !important;
        visibility: visible !important;
        opacity: 1 !important;
      }

/* Force arrow visibility with higher specificity */
.context-menu-content .arrow-mobile::after,
.context-menu-content .arrow-desktop::after {
  content: "" !important;
  display: inline-block !important;
  width: 0 !important;
  height: 0 !important;
  border-style: solid !important;
  border-color: transparent !important;
  border-top-width: 4.8px !important;
  border-bottom-width: 4.8px !important;
  border-left-width: 0 !important;
  border-right-width: 6.4px !important;
  border-right-color: #000000 !important;
  margin-left: 2px !important;
  position: relative !important;
  visibility: visible !important;
  opacity: 1 !important;
}

      /* White arrow when menu item is highlighted */
      .arrow-highlighted.arrow-mobile::after,
      .arrow-highlighted.arrow-desktop::after {
        border-right-color: #ffffff !important;
      }


      /* Agents submenu specific styling - width reduction for flush alignment */
      .agents-submenu {
        width: 100px !important;
        margin-left: 20px !important;
      }

      /* Submenu icons (checkmarks) - prevent CSS triangle styling */
      .submenu-icon {
        display: inline !important;
        position: static !important;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 12px !important;
        color: inherit !important;
      }

      .submenu-icon::after {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    // Debug: Check if arrow elements exist after a short delay
    setTimeout(() => {
      const arrowElements = document.querySelectorAll(
        ".arrow-mobile, .arrow-desktop"
      );
      console.log("🔍 Arrow elements found:", arrowElements.length);
      arrowElements.forEach((el, index) => {
        console.log(`🔍 Arrow ${index + 1}:`, {
          className: el.className,
          computedStyle: window.getComputedStyle(el, "::after"),
          parent: el.parentElement?.textContent?.trim(),
        });
      });
    }, 1000);

    return () => style.remove();
  }, []);

  // Menu content component
  const MenuContent = () => {
    const [closeTimeout, setCloseTimeout] = useState(null);

    useEffect(() => {
      // Set ref after portal mount
      setTimeout(() => {
        const menuElement = document.querySelector(
          "#clippy-context-menu-portal .context-menu-content"
        );
        if (menuElement) {
          menuRef.current = menuElement;
        }
      }, 0);

      // Click outside handler with proper exclusions
      const handleClickOutside = (event) => {
        // Ignore clicks on Clippy-related elements
        const isClippyElement =
          event.target.closest(".clippy") ||
          event.target.closest("#clippy-clickable-overlay") ||
          event.target.closest(".context-menu-content") ||
          event.target.closest(".context-submenu") ||
          event.target.id === "clippy-clickable-overlay";

        if (isClippyElement) {
          return;
        }

        if (menuRef.current && !menuRef.current.contains(event.target)) {
          onClose();
        }
      };

      const handleEscKey = (event) => {
        if (event.key === "Escape") {
          onClose();
        }
      };

      // Add delay to prevent immediate closure from the right-click that opened menu
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside, {
          capture: true,
        });
        document.addEventListener("keydown", handleEscKey);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside, {
          capture: true,
        });
        document.removeEventListener("keydown", handleEscKey);
      };
    }, []);

    return (
      <>
        {/* Main Menu */}
        <div
          className="context-menu-content clippy-context-menu"
          style={menuStyle}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Chat - Emoji on Right */}
          <MenuItem
            onClick={() => handleMenuAction("chat")}
            rightIcon="💬"
            currentSubmenuOpen={submenuOpen} // Pass submenuOpen state
          >
            Chat with {currentAgent}
          </MenuItem>

          {/* Greet - Emoji on Right */}
          <MenuItem
            onClick={() => handleMenuAction("greet")}
            rightIcon="😊"
            currentSubmenuOpen={submenuOpen}
          >
            Say Hello
          </MenuItem>
          {/* Separator */}
          <div style={separatorStyle} />

          {/* Select Agent - Arrow on Left, Emoji on Right */}
          <MenuItem
            hasSubmenu
            onMouseEnter={(e) => handleSubmenuOpen("agents", e)}
            leftIcon={leftArrowIcon}
            rightIcon="🤖"
            currentSubmenuOpen={submenuOpen} // Pass submenuOpen state
            submenuType="agents" // Indicate submenu type
          >
            Select AI Agent
          </MenuItem>

          {/* Play Animation - Arrow on Left, Emoji on Right */}
          <MenuItem
            hasSubmenu
            onMouseEnter={(e) => handleSubmenuOpen("animations", e)}
            leftIcon={leftArrowIcon}
            rightIcon="🎭"
            currentSubmenuOpen={submenuOpen} // Pass submenuOpen state
            submenuType="animations" // Indicate submenu type
          >
            Play Animation
          </MenuItem>

          {/* Separator */}
          <div style={separatorStyle} />

          {/* Wave - Emoji on Right */}
          <MenuItem
            onClick={() => handleMenuAction("about")}
            rightIcon="👋"
            currentSubmenuOpen={submenuOpen} // Pass submenuOpen state
          >
            About {currentAgent} {/* Changed text from Wave */}
          </MenuItem>
          {/* Separator */}

          {/* Chat - Emoji on Right */}
          <MenuItem
            onClick={() => handleMenuAction("settings")}
            rightIcon="⚙️"
            currentSubmenuOpen={submenuOpen}
          >
            Settings
          </MenuItem>
        </div>

        {/* Agents Submenu - Left Aligned, Checkmark on Left */}
        {submenuOpen === "agents" && (
          <div
            className="context-submenu agents-submenu"
            style={{
              ...submenuStyle,
              padding: "0px",
              textAlign: "left",
            }}
            onMouseEnter={() => {
              // Keep submenu open when hovering over it
              setSubmenuOpen("agents");
            }}
            onMouseLeave={() => {
              // Only close if we're not hovering over the parent menu item
              const menuItem = document.querySelector(
                `.context-menu-item[data-submenu="agents"]`
              );
              if (!menuItem?.matches(":hover")) {
                handleSubmenuClose();
              }
            }}
          >
            {/* Agents list */}
            {agents.map((agent) => (
              <MenuItem
                key={agent}
                onClick={() => handleMenuAction("selectAgent", agent)}
                isSubmenuItem
                leftIcon={agent === currentAgent ? "✓" : null}
                rightIcon={null}
                currentSubmenuOpen={submenuOpen}
              >
                {agent}
              </MenuItem>
            ))}
          </div>
        )}

        {/* Animations Submenu - Left Aligned with Left Scrollbar */}
        {submenuOpen === "animations" && (
          <div
            className="context-submenu animations-submenu"
            style={{
              ...submenuStyle,
              padding: "0px",
              textAlign: "left",
            }}
            onMouseEnter={() => {
              // Keep submenu open when hovering over it
              setSubmenuOpen("animations");
            }}
            onMouseLeave={() => {
              // Only close if we're not hovering over the parent menu item
              const menuItem = document.querySelector(
                `.context-menu-item[data-submenu="animations"]`
              );
              if (!menuItem?.matches(":hover")) {
                handleSubmenuClose();
              }
            }}
          >
            {displayNames.map((displayName) => (
              <MenuItem
                key={displayName}
                onClick={() =>
                  handleMenuAction("playAnimation", animationList[displayName])
                }
                isSubmenuItem
                leftIcon={null}
                rightIcon={null}
                currentSubmenuOpen={submenuOpen}
              >
                {displayName}
              </MenuItem>
            ))}
          </div>
        )}
      </>
    );
  };

  // Don't render until portal container is ready AND position is calculated
  if (!portalContainer || !dynamicPosition) {
    return null;
  }

  // Use ReactDOM.createPortal to render outside component tree
  return ReactDOM.createPortal(<MenuContent />, portalContainer);
};

export default ClippyContextMenu;
