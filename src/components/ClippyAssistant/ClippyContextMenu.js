// ClippyContextMenu.js - COMPLETE FIXED VERSION with submenu gap fix and agent switching

import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

// FIXED: Animation logging function
const logAnimation = (animationName, context = "context menu") => {
  // Force log animation regardless of dev mode
  console.log(
    `%c🎭 Clippy Animation: "${animationName}"%c (from ${context})`,
    'color: #0066cc; font-weight: bold; font-size: 14px;',
    'color: #666; font-size: 12px;'
  );
};

const ClippyContextMenu = ({
  x,
  y,
  onClose,
  onAction,
  agents = ["Clippy", "Links", "Bonzi", "Genie", "Merlin", "Rover"],
  currentAgent = "Clippy",
}) => {
  const [portalContainer, setPortalContainer] = useState(null);
  const [submenuOpen, setSubmenuOpen] = useState(null);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  const [dynamicPosition, setDynamicPosition] = useState({ x, y });

  // All available Clippy animations
  const animations = [
    "Congratulate", "LookRight", "SendMail", "Thinking", "Explain",
    "IdleRopePile", "IdleAtom", "Print", "Hide", "GetAttention",
    "Save", "GetTechy", "GestureUp", "Idle1_1", "Processing",
    "Alert", "LookUpRight", "IdleSideToSide", "GoodBye", "LookLeft",
    "IdleHeadScratch", "LookUpLeft", "CheckingSomething", "Hearing_1", "GetWizardy",
    "IdleFingerTap", "GestureLeft", "Wave", "GestureRight", "Writing",
    "IdleSnooze", "LookDownRight", "GetArtsy", "Show", "LookDown",
    "Searching", "EmptyTrash", "Greeting", "LookUp", "GestureDown",
    "RestPose", "IdleEyeBrowRaise", "LookDownLeft",
  ];

  // Get desktop viewport boundaries for positioning
  const getDesktopViewport = () => {
    const desktop = document.querySelector(".desktop.screen") || 
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
        height: rect.height
      };
    }
    
    // Fallback to window viewport
    return {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight
    };
  };

  // Helper to get viewport for both mobile and desktop
  const getViewport = () => {
    // Use window for mobile, desktop container for desktop
    if (window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      return {
        left: 0,
        top: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
    return getDesktopViewport();
  };

  // Create portal container on mount
  useEffect(() => {
    console.log("🎯 ClippyContextMenu creating portal container");
    
    const container = document.createElement('div');
    container.id = 'clippy-context-menu-portal';
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
    if (window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
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
    setDynamicPosition({ x: adjustedX, y: adjustedY });
  }, [x, y, portalContainer]);

  // FIXED: Submenu positioning with NO GAP
  const handleSubmenuOpen = (submenuType, event) => {
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|Icod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const rect = event.currentTarget.getBoundingClientRect();
    const submenuWidth = isMobile ? 180 : 160;
    const submenuHeight = submenuType === "animations" ? 300 : 200;
    const viewport = getViewport();

    // Check if submenu would overflow desktop or mobile viewport boundaries
    const wouldOverflowRight = rect.right + submenuWidth > viewport.right - 10;
    const wouldOverflowBottom = rect.top + submenuHeight > viewport.bottom - 10;

    // FIXED: Position submenu directly bordering main menu (no gap)
    const newX = wouldOverflowRight 
      ? rect.left - submenuWidth // Align submenu's right edge with main menu's left edge
      : rect.right;              // Align submenu's left edge with main menu's right edge
    
    const newY = wouldOverflowBottom
      ? Math.max(viewport.top + 5, viewport.bottom - submenuHeight - 10)
      : rect.top;

    let constrainedX = Math.max(
      viewport.left + 5, 
      Math.min(newX, viewport.right - submenuWidth - 5)
    );
    const constrainedY = Math.max(
      viewport.top + 5, 
      Math.min(newY, viewport.bottom - submenuHeight - 5)
    );

    // Manually adjust submenu position to the right by 10px
    constrainedX += 36; // Add the desired pixel amount here

    console.log(`🎯 Submenu positioning (${submenuType}):`, {
      menuItem: { left: rect.left, right: rect.right, top: rect.top },
      submenu: { x: constrainedX, y: constrainedY },
      openLeft: wouldOverflowRight,
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
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setTimeout(() => {
      setSubmenuOpen(null);
    }, isMobile ? 500 : 300); // Longer delay on mobile
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
    const clippyEl = document.querySelector('.clippy');
    if (clippyEl) {
      clippyEl.style.opacity = '0.7';
      clippyEl.style.transform = 'translateZ(0) scale(0.9)';
      
      setTimeout(() => {
        // Restore appearance
        clippyEl.style.opacity = '1';
        const isMobile = window.innerWidth <= 768;
        const correctScale = isMobile ? '0.8' : '0.9';
        clippyEl.style.transform = `translateZ(0) scale(${correctScale})`;
        
        // Play welcome animation for new agent
        if (window.clippy?.play) {
          setTimeout(() => {
            logAnimation('Wave', `agent change to ${newAgent}`);
            window.clippy.play('Wave');
            
            // Show welcome message
            if (window.showClippyCustomBalloon) {
              setTimeout(() => {
                window.showClippyCustomBalloon(`Hello! I'm ${newAgent} now. How can I help you?`);
              }, 800);
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
      case 'hide':
        // Use global function to hide Clippy
        if (window.setAssistantVisible) {
          window.setAssistantVisible(false);
        }
        onAction('hide');
        break;
        
      case 'selectAgent':
        // FIXED: Enhanced agent change with actual character switching
        handleAgentChange(data);
        onAction('selectAgent', data);
        break;
        
      case 'playAnimation':
        // FIXED: Play specific animation with logging
        if (window.clippy?.play && data) {
          // Ensure we're using the exact animation name
          const animationName = String(data).trim();
          if (animations.includes(animationName)) {
            logAnimation(animationName, 'context menu selection');
            window.clippy.play(animationName);
          } else {
            console.warn(`Invalid animation name: ${animationName}`);
          }
        }
        onAction('playAnimation', data);
        break;
        
      case 'chat':
        // Open chat balloon
        if (window.showClippyChatBalloon) {
          window.showClippyChatBalloon("Hi! What would you like to chat about?");
        }
        onAction('chat');
        break;
        
      case 'wave':
        // FIXED: Play wave animation with message and logging
        if (window.clippy?.play) {
          logAnimation('Wave', 'context menu wave action');
          window.clippy.play('Wave');
          if (window.showClippyCustomBalloon) {
            setTimeout(() => {
              window.showClippyCustomBalloon("👋 Hello there!");
            }, 500);
          }
        }
        onAction('wave');
        break;
        
      case 'greet':
        // FIXED: Play greeting animation with message and logging
        if (window.clippy?.play) {
          logAnimation('Greeting', 'context menu greet action');
          window.clippy.play('Greeting');
          if (window.showClippyCustomBalloon) {
            setTimeout(() => {
              window.showClippyCustomBalloon("Well hello there! It's great to see you. Feel free to explore Hydra98!");
            }, 800);
          }
        }
        onAction('greet');
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
    maxHeight: "280px",
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

  // FIXED: Enhanced MenuItem with proper hover handling and flexible icon/arrow placement
  const MenuItem = ({ children, onClick, onMouseEnter, onMouseLeave, disabled, hasSubmenu, isSubmenuItem, leftIcon, rightIcon, currentSubmenuOpen, submenuType }) => {
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|Icod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const [isHovered, setIsHovered] = useState(false); // Add hover state

    // Combine external onMouseEnter/onMouseLeave with internal hover state management
    const handleMouseEnter = (e) => {
      if (!disabled) {
        setIsHovered(true);
        if (onMouseEnter) onMouseEnter(e);
      }
    };

    const handleMouseLeave = (e) => {
      if (!disabled) {
        setIsHovered(false);
        if (onMouseLeave) onMouseLeave(e);
      }
    };

    // Determine if the menu item should be highlighted
    const isHighlighted = isHovered || (hasSubmenu && currentSubmenuOpen === submenuType);

    return (
      <div
        className={`context-menu-item ${disabled ? 'disabled' : ''} ${isSubmenuItem ? 'submenu-item' : ''} ${isMobile ? 'mobile' : ''}`}
        onClick={disabled ? null : onClick}
        onMouseEnter={handleMouseEnter} // Use combined handler
        onMouseLeave={handleMouseLeave} // Use combined handler
        style={{
          padding: '6px 16px',
          minHeight: 'auto',
          display: 'flex',
          alignItems: 'center',
          // Rely on CSS for justify-content, remove inline logic
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          // Apply hover style on desktop or if associated submenu is open
          ...((isHighlighted && !isMobile && !disabled) ? menuItemHoverStyle : menuItemStyle)
        }}
      >
        {/* Render left icon/arrow if provided */}
        {leftIcon && (
          <span style={{ marginRight: '8px', fontSize: '12px' }}>{leftIcon}</span> // Standard margin for spacing
        )}

        {/* Render text content */}
        {/* Remove flexGrow and textAlign inherit, rely on CSS for submenu items */}
        <span>{children}</span>

        {/* Render right icon/arrow if provided */}
        {rightIcon && (
           <span style={{ marginLeft: '8px', fontSize: '12px' }}>{rightIcon}</span> // Standard margin for spacing
        )}
      </div>
    );
  };

  // Add mobile-specific styles and standard submenu alignment
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .context-menu-item.mobile {
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }

      .context-menu-item.mobile:active {
        background-color: rgba(0, 0, 0, 0.1);
      }

      .context-submenu {
        padding: 0; /* Keep original padding */
        text-align: left; /* Keep explicitly left-aligning submenu content */
        min-width: 120px !important; /* Reduced minimum width for compactness */
      }

      .context-submenu .context-menu-item {
        padding: 6px 8px 6px 12px; /* Reduced right padding */
        min-height: auto; /* Removed min-height */
        /* Force left alignment for all submenu item content */
        justify-content: flex-start !important;
        flex-direction: row; /* Ensure left-to-right flow */
      }

      .context-submenu .context-menu-item span:first-child { /* Target text span */
        /* Remove flex-grow and text-align */
        margin-left: 0; /* Ensure no extra margin */
      }

      /* Revert specific padding adjustments for submenu items with a left icon */
      .context-submenu .context-menu-item.submenu-item {
        padding: 6px 8px 6px 8px; /* Adjusted padding for items with left icons */
      }

      .context-submenu.mobile .context-menu-item {
        padding: 6px 12px; /* Reverted to original padding */
        min-height: auto; /* Removed min-height */
      }

      /* Remove mobile-specific sizing and font-size adjustments */
      @media (max-width: 768px) {
        .clippy-context-menu {
          min-width: 160px !important; /* Reverted to original */
          max-width: none !important; /* Removed max-width */
          font-size: 11px !important; /* Reverted to original */
        }

        .context-submenu {
          min-width: 140px !important; /* Reverted to original */
          max-width: none !important; /* Removed max-width */
        }
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
        const menuElement = document.querySelector('#clippy-context-menu-portal .context-menu-content');
        if (menuElement) {
          menuRef.current = menuElement;
        }
      }, 0);

      // Click outside handler with proper exclusions
      const handleClickOutside = (event) => {
        // Ignore clicks on Clippy-related elements
        const isClippyElement = event.target.closest('.clippy') || 
                               event.target.closest('#clippy-clickable-overlay') ||
                               event.target.closest('.context-menu-content') ||
                               event.target.closest('.context-submenu') ||
                               event.target.id === 'clippy-clickable-overlay';
        
        if (isClippyElement) {
          return;
        }
        
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          onClose();
        }
      };

      const handleEscKey = (event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      // Add delay to prevent immediate closure from the right-click that opened menu
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside, { capture: true });
        document.addEventListener("keydown", handleEscKey);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside, { capture: true });
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
            onClick={() => handleMenuAction('hide')}
            rightIcon="🚫"
            currentSubmenuOpen={submenuOpen} // Pass submenuOpen state
          >
            Hide Clippy
          </MenuItem>

          {/* Separator */}
          <div style={separatorStyle} />

          {/* Select Agent - Emoji on Left, Arrow on Right pointing Left */}
          <MenuItem
            hasSubmenu
            onMouseEnter={(e) => handleSubmenuOpen("agents", e)}
            leftIcon="◀"
            rightIcon="👤"
            currentSubmenuOpen={submenuOpen} // Pass submenuOpen state
            submenuType="agents" // Indicate submenu type
          >
            Select Agent
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
            onClick={() => handleMenuAction('chat')}
            rightIcon="💬"
            currentSubmenuOpen={submenuOpen} // Pass submenuOpen state
          >
            Chat with Clippy
          </MenuItem>

          {/* Wave - Emoji on Right */}
          <MenuItem
            onClick={() => handleMenuAction('wave')}
            rightIcon="👋"
            currentSubmenuOpen={submenuOpen} // Pass submenuOpen state
          >
            Wave
          </MenuItem>

          {/* Greet - Emoji on Right */}
          <MenuItem
            onClick={() => handleMenuAction('greet')}
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
              padding: "5px",
              textAlign: "left", // Explicitly left-align submenu
            }}
            onMouseEnter={() => {
              // Clear any pending close timeout when entering submenu
              if (closeTimeout) {
                clearTimeout(closeTimeout);
                setCloseTimeout(null);
              }
              setSubmenuOpen("agents");
            }}
            // Removed onMouseLeave to prevent unexpected closing
          >
            {/* Agents list */}
            {agents.map((agent) => (
                <MenuItem
                  key={agent}
                  onClick={() => handleMenuAction('selectAgent', agent)}
                  isSubmenuItem // Mark as submenu item
                  leftIcon={agent === currentAgent ? "✓" : null} // Pass checkmark or null
                  rightIcon={null} // Ensure no right icon for agent items
                  currentSubmenuOpen={submenuOpen} // Pass submenuOpen state
                >
                  {/* Agent name text only */}
                  {agent}
                </MenuItem>
              ))
            }
          </div>
        )}

        {/* Animations Submenu - Left Aligned */}
        {submenuOpen === "animations" && (
          <div
            className="context-submenu"
            style={submenuStyle}
            onMouseEnter={() => setSubmenuOpen("animations")}
          >
            {animations.slice(0, 20).map((animation) => (
              <MenuItem
                key={animation}
                onClick={() => handleMenuAction('playAnimation', animation)}
                isSubmenuItem // Mark as submenu item
                leftIcon={null} // Ensure no left icon for animation items
                rightIcon={null} // Ensure no right icon for animation items
                currentSubmenuOpen={submenuOpen} // Pass submenuOpen state
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
  return ReactDOM.createPortal(
    <MenuContent />,
    portalContainer
  );
};

export default ClippyContextMenu;