// ClippyContextMenu.js - COMPLETE FIXED VERSION with submenu gap fix and agent switching

import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import faq from "../../data/textFiles/faq";

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
  agents = ["Clippy GPT", "Links", "Bonzi", "Genie", "Merlin", "Rover"],
  currentAgent = "Clippy GPT",
}) => {
  const [portalContainer, setPortalContainer] = useState(null);
  const [submenuOpen, setSubmenuOpen] = useState(null);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  const [dynamicPosition, setDynamicPosition] = useState({ x, y });

  // All available Clippy animations
  const animations = [
    "Congratulate",
    "LookRight",
    "SendMail",
    "Thinking",
    "Explain",
    "IdleRopePile",
    "IdleAtom",
    "Print",
    "Hide",
    "GetAttention",
    "Save",
    "GetTechy",
    "GestureUp",
    "Idle1_1",
    "Processing",
    "Alert",
    "LookUpRight",
    "IdleSideToSide",
    "GoodBye",
    "LookLeft",
    "IdleHeadScratch",
    "LookUpLeft",
    "CheckingSomething",
    "Hearing_1",
    "GetWizardy",
    "IdleFingerTap",
    "GestureLeft",
    "Wave",
    "GestureRight",
    "Writing",
    "IdleSnooze",
    "LookDownRight",
    "GetArtsy",
    "Show",
    "LookDown",
    "Searching",
    "EmptyTrash",
    "Greeting",
    "LookUp",
    "GestureDown",
    "RestPose",
    "IdleEyeBrowRaise",
    "LookDownLeft",
  ];

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

  // Create portal container on mount
  useEffect(() => {
    console.log("🎯 ClippyContextMenu creating portal container");

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

  // Always constrain menu to viewport on mount and when x/y change
  useEffect(() => {
    const menuWidth = 180;
    const menuHeight = 250;
    const margin = 10;
    const mobileBottomMargin = 100; // Minimum distance from bottom on mobile
    const viewport = getViewport();
    let adjustedX = Math.max(
      viewport.left + margin,
      Math.min(x, viewport.right - menuWidth - margin)
    );
    let adjustedY;
    if (
      window.innerWidth <= 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      // On mobile, keep at least 20px above the bottom
      adjustedY = Math.max(
        viewport.top + margin,
        Math.min(y, viewport.bottom - menuHeight - mobileBottomMargin)
      );
    } else {
      adjustedY = Math.max(
        viewport.top + margin,
        Math.min(y, viewport.bottom - menuHeight - margin)
      );
    }

    // Adjust main menu vertical position for mobile based on height reduction (6 items * 3px)
    if (
      window.innerWidth <= 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      adjustedY -= 18; // Total reduction for 6 main menu items
    }

    setDynamicPosition({ x: adjustedX, y: adjustedY });
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
    // Highlight if hovered OR if it's a parent with an open submenu (desktop only)
    const isHighlighted =
      isHovered ||
      (hasSubmenu && currentSubmenuOpen === submenuType && !isMobile);

    // Apply hover style on desktop
    const finalStyle = {
      ...menuItemStyle,
      // Only apply hover style on desktop if highlighted and not disabled
      ...(isHighlighted && !isMobile && !disabled ? menuItemHoverStyle : {}),
      transition: "background-color 0.1s ease-in-out",
    };

    return (
      <div
        className={`context-menu-item ${disabled ? "disabled" : ""} ${
          isSubmenuItem ? "submenu-item" : ""
        } ${isMobile ? "mobile" : ""}`}
        onClick={disabled ? null : onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={finalStyle}
        data-submenu={hasSubmenu ? submenuType : undefined}
      >
        {leftIcon && (
          <span style={{ marginRight: "8px", fontSize: "12px" }}>
            {leftIcon}
          </span>
        )}
        <span>{children}</span>
        {rightIcon && (
          <span style={{ marginLeft: "8px", fontSize: "12px" }}>
            {rightIcon}
          </span>
        )}
      </div>
    );
  };

  // FIXED: Submenu positioning with NO GAP
  const handleSubmenuOpen = (submenuType, event) => {
    const isMobile =
      window.innerWidth <= 768 ||
      /Android|webOS|iPhone|iPad|Icod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const rect = event.currentTarget.getBoundingClientRect();
    const submenuWidth = isMobile ? 180 : 160; // Increased width for mobile
    const submenuHeight =
      submenuType === "animations" && isMobile
        ? 150
        : submenuType === "animations"
        ? 300
        : 200;
    const viewport = getViewport();

    // Check if submenu would overflow desktop or mobile viewport boundaries
    const wouldOverflowRight = rect.right + submenuWidth > viewport.right - 10;
    const wouldOverflowBottom = rect.top + submenuHeight > viewport.bottom - 10;

    // Position submenu directly bordering main menu (no gap)
    const newX = wouldOverflowRight ? rect.left - submenuWidth : rect.right;

    let currentMobileBottomMargin = 10; // Default for desktop
    if (isMobile) {
      if (submenuType === "animations") {
        currentMobileBottomMargin = 223; // Specific margin for animations submenu on mobile
      } else if (submenuType === "agents") {
        currentMobileBottomMargin = 125; // Specific margin for agents submenu on mobile
      } else {
        currentMobileBottomMargin = 100; // Default mobile margin for other submenus (if any)
      }
    }

    let newY = wouldOverflowBottom
      ? Math.max(
          viewport.top + 5,
          viewport.bottom - submenuHeight - currentMobileBottomMargin
        )
      : rect.top; // Revert to original calculation

    // Adjust vertical position based on parent item index for mobile submenus
    if (isMobile) {
      let parentItemIndex = -1; // 0-indexed
      // Find the index of the parent item in the main menu
      const mainMenuActions = [
        "hide",
        "wave",
        "selectAgent",
        "playAnimation",
        "chat",
        "greet",
      ];
      parentItemIndex = mainMenuActions.indexOf(
        submenuType === "agents" ? "selectAgent" : "playAnimation"
      );

      if (parentItemIndex !== -1) {
        // Subtract the cumulative height reduction of items above the parent
        newY -= parentItemIndex * 3;
      }
    }

    let constrainedX = Math.max(
      viewport.left + 5,
      Math.min(newX, viewport.right - submenuWidth - 5)
    );
    let constrainedY = Math.max(
      viewport.top + 5,
      Math.min(
        newY,
        viewport.bottom - submenuHeight - currentMobileBottomMargin
      )
    );

    // Adjust vertical position for desktop agents submenu - Apply here after declaration
    if (!isMobile && submenuType === "agents") {
      constrainedY -= 20; // Raise by 20px
    }

    // Apply horizontal adjustment ONLY for mobile
    if (isMobile) {
      constrainedX += 57;
    }
    // Apply horizontal adjustment ONLY for desktop
    if (!isMobile) {
      constrainedX += 36; // Apply offset ONLY for desktop
    }

    console.log(`🎯 Submenu positioning (${submenuType}):`, {
      menuItem: { left: rect.left, right: rect.right, top: rect.top },
      submenu: { x: constrainedX, y: constrainedY },
      openLeft: wouldOverflowRight,
      isMobile: isMobile,
      submenuHeight: submenuHeight,
      wouldOverflowBottom: wouldOverflowBottom,
      calculatedNewY: newY,
      constrainedY: constrainedY,
      mobileBottomMargin: currentMobileBottomMargin, // Use the dynamic value in log
    });

    setSubmenuPosition({
      x: constrainedX,
      y: constrainedY,
      openLeft: wouldOverflowRight,
    });

    setSubmenuOpen(submenuType);
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

    // Use global function to change agent (will trigger actual character change)
    if (window.setCurrentAgent) {
      window.setCurrentAgent(newAgent);
    }

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

      case "selectAgent":
        // FIXED: Enhanced agent change with actual character switching
        handleAgentChange(data);
        onAction("selectAgent", data);
        break;

      case "playAnimation":
        // FIXED: Play specific animation with logging
        if (window.clippy?.play && data) {
          // Ensure we're using the exact animation name
          const animationName = String(data).trim();
          if (animations.includes(animationName)) {
            logAnimation(animationName, "context menu selection");
            window.clippy.play(animationName);
          } else {
            console.warn(`Invalid animation name: ${animationName}`);
          }
        }
        onAction("playAnimation", data);
        break;

      case "chat":
        // Open chat balloon
        if (window.showClippyChatBalloon) {
          window.showClippyChatBalloon(
            "Hi! What would you like to chat about?"
          );
        }
        onAction("chat");
        break;

      case "wave":
        // FIXED: Change Wave action to open Notepad with FAQ content
        console.log("🎯 Context menu action: Open About Clippy (Notepad)");
        if (window.ProgramContext?.onOpen) {
          window.ProgramContext.onOpen({
            component: "Notepad",
            multiInstance: true,
            title: "About Clippy",
            icon: "textchat32",
            data: {
              content: faq,
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

      case "greet":
        // FIXED: Play greeting animation with message and logging
        if (window.clippy?.play) {
          logAnimation("Greeting", "context menu greet action");
          window.clippy.play("Greeting");
          if (window.showClippyCustomBalloon) {
            setTimeout(() => {
              window.showClippyCustomBalloon(
                "Well hello there! It's great to see you. Feel free to explore Hydra98!"
              );
            }, 800);
          }
        }
        onAction("greet");
        break;

      default:
        console.warn(`Unknown context menu action: ${action}`);
        onAction(action, data);
    }

    onClose();
  };

  // Styles
  const menuStyle = {
    position: "absolute",
    left: `${dynamicPosition.x}px`,
    top: `${dynamicPosition.y}px`,
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
    ...menuItemStyle,
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

  // FIXED: Enhanced submenu styles for perfect alignment (NO GAP)
  const submenuStyle = {
    position: "absolute",
    left: `${submenuPosition.x}px`,
    top: `${submenuPosition.y}px`,
    backgroundColor: "#c0c0c0",
    border: "2px outset #c0c0c0",
    boxShadow: "4px 4px 8px rgba(0,0,0,0.3)",
    minWidth: "140px",
    maxHeight: "240px",
    overflowY: "auto",
    fontFamily: "Tahoma, sans-serif",
    fontSize: "11px",
    pointerEvents: "auto",
    visibility: "visible",
    opacity: 1,
    display: "block",
    transform: "translateZ(0) translate3d(0, 0, 0)", // FIXED: Snap to pixel boundaries
    zIndex: 2,
    textAlign: "left",
    margin: "0", // FIXED: Ensure no margin that could create gaps
    padding: "0", // FIXED: Ensure no padding that could create gaps
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
    `;
    document.head.appendChild(style);
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
          {/* Hide Clippy - Emoji on Right */}
          <MenuItem
            onClick={() => handleMenuAction("hide")}
            rightIcon="↔️"
            currentSubmenuOpen={submenuOpen}
            disabled={true}
          >
            Drag Clippy
          </MenuItem>
          {/* Wave - Emoji on Right */}
          <MenuItem
            onClick={() => handleMenuAction("wave")}
            rightIcon="👋"
            currentSubmenuOpen={submenuOpen} // Pass submenuOpen state
          >
            About Clippy {/* Changed text from Wave */}
          </MenuItem>
          {/* Separator */}
          <div style={separatorStyle} />

          {/* Select Agent - Emoji on Left, Arrow on Right pointing Left */}
          <MenuItem
            hasSubmenu
            onMouseEnter={(e) => handleSubmenuOpen("agents", e)}
            leftIcon="◀"
            rightIcon="🤖"
            currentSubmenuOpen={submenuOpen} // Pass submenuOpen state
            submenuType="agents" // Indicate submenu type
          >
            Select AI Agent
          </MenuItem>

          {/* Play Animation - Emoji on Left, Arrow on Right pointing Left */}
          <MenuItem
            hasSubmenu
            onMouseEnter={(e) => handleSubmenuOpen("animations", e)}
            leftIcon="◀"
            rightIcon="🎭"
            currentSubmenuOpen={submenuOpen} // Pass submenuOpen state
            submenuType="animations" // Indicate submenu type
          >
            Play Animation
          </MenuItem>

          {/* Separator */}
          <div style={separatorStyle} />

          {/* Chat - Emoji on Right */}
          <MenuItem
            onClick={() => handleMenuAction("chat")}
            rightIcon="💬"
            currentSubmenuOpen={submenuOpen} // Pass submenuOpen state
          >
            Chat with Clippy
          </MenuItem>

          {/* Greet - Emoji on Right */}
          <MenuItem
            onClick={() => handleMenuAction("greet")}
            rightIcon="😊"
            currentSubmenuOpen={submenuOpen} // Pass submenuOpen state
          >
            Say Hello
          </MenuItem>
        </div>

        {/* Agents Submenu - Left Aligned, Checkmark on Left */}
        {submenuOpen === "agents" && (
          <div
            className="context-submenu"
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
            {animations.slice(0, 20).map((animation) => (
              <MenuItem
                key={animation}
                onClick={() => handleMenuAction("playAnimation", animation)}
                isSubmenuItem
                leftIcon={null}
                rightIcon={null}
                currentSubmenuOpen={submenuOpen}
              >
                {animation}
              </MenuItem>
            ))}
          </div>
        )}
      </>
    );
  };

  // Don't render until portal container is ready
  if (!portalContainer) {
    return null;
  }

  // Use ReactDOM.createPortal to render outside component tree
  return ReactDOM.createPortal(<MenuContent />, portalContainer);
};

export default ClippyContextMenu;
