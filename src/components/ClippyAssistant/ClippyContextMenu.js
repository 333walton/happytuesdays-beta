// ClippyContextMenu.js - FIXED with desktop viewport constraints and functional actions

import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

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

  // FIXED: Get desktop viewport boundaries for positioning
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

  // FIXED: Position calculation with strict desktop viewport constraints
  const position = React.useMemo(() => {
    const menuWidth = 180;
    const menuHeight = 250; // Increased for more menu items
    const margin = 10;
    const viewport = getDesktopViewport();
    
    // Constrain to desktop viewport with margin
    let adjustedX = Math.max(
      viewport.left + margin, 
      Math.min(x, viewport.right - menuWidth - margin)
    );
    let adjustedY = Math.max(
      viewport.top + margin, 
      Math.min(y, viewport.bottom - menuHeight - margin)
    );
    
    console.log(`🎯 Context menu positioning within desktop viewport:`, {
      original: { x, y },
      adjusted: { x: adjustedX, y: adjustedY },
      viewport: viewport
    });
    
    return { x: adjustedX, y: adjustedY };
  }, [x, y]);

  // FIXED: Submenu positioning with desktop viewport awareness
  const handleSubmenuOpen = (submenuType, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const submenuWidth = 160;
    const submenuHeight = submenuType === "animations" ? 300 : 200;
    const viewport = getDesktopViewport();

    // Check if submenu would overflow desktop viewport boundaries
    const wouldOverflowRight = rect.right + submenuWidth > viewport.right - 10;
    const wouldOverflowBottom = rect.top + submenuHeight > viewport.bottom - 10;

    // Position submenu
    const newX = wouldOverflowRight 
      ? Math.max(viewport.left + 5, rect.left - submenuWidth)
      : rect.right;
    
    const newY = wouldOverflowBottom
      ? Math.max(viewport.top + 5, viewport.bottom - submenuHeight - 10)
      : rect.top;

    // Final constraint to desktop viewport
    const constrainedX = Math.max(
      viewport.left + 5, 
      Math.min(newX, viewport.right - submenuWidth - 5)
    );
    const constrainedY = Math.max(
      viewport.top + 5, 
      Math.min(newY, viewport.bottom - submenuHeight - 5)
    );

    setSubmenuPosition({
      x: constrainedX,
      y: constrainedY,
      openLeft: wouldOverflowRight,
    });

    setSubmenuOpen(submenuType);
  };

  const handleSubmenuClose = () => {
    setSubmenuOpen(null);
  };

  // Styles
  const menuStyle = {
    position: "absolute",
    left: `${position.x}px`,
    top: `${position.y}px`,
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
  };

  const menuItemStyle = {
    padding: "6px 16px",
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
    transform: "translateZ(0)",
    zIndex: 2,
  };

  // FIXED: Functional menu actions
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
        // Change agent via global function
        if (window.setCurrentAgent) {
          window.setCurrentAgent(data);
        }
        // Play welcome animation for new agent
        if (window.clippy?.play) {
          setTimeout(() => {
            window.clippy.play('Wave');
            // Show welcome message
            if (window.showClippyCustomBalloon) {
              setTimeout(() => {
                window.showClippyCustomBalloon(`Hello! I'm ${data} now. How can I help you?`);
              }, 800);
            }
          }, 100);
        }
        onAction('selectAgent', data);
        break;
        
      case 'playAnimation':
        // Play specific animation
        if (window.clippy?.play) {
          window.clippy.play(data);
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
        // Play wave animation with message
        if (window.clippy?.play) {
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
        // Play greeting animation with message
        if (window.clippy?.play) {
          window.clippy.play('Greeting');
          if (window.showClippyCustomBalloon) {
            setTimeout(() => {
              window.showClippyCustomBalloon("Hello! How can I help you today?");
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

  // Menu content component
  const MenuContent = () => {
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

    const MenuItem = ({ children, onClick, onMouseEnter, onMouseLeave, disabled, hasSubmenu }) => {
      const [isHovered, setIsHovered] = useState(false);

      return (
        <div
          style={isHovered && !disabled ? menuItemHoverStyle : { 
            ...menuItemStyle, 
            color: disabled ? "#808080" : "#000000",
            WebkitTextFillColor: disabled ? "#808080" : "#000000"
          }}
          onClick={disabled ? undefined : onClick}
          onMouseEnter={(e) => {
            if (!disabled) {
              setIsHovered(true);
              onMouseEnter?.(e);
            }
          }}
          onMouseLeave={(e) => {
            setIsHovered(false);
            onMouseLeave?.(e);
          }}
        >
          <span>{children}</span>
          {hasSubmenu && <span>▶</span>}
        </div>
      );
    };

    return (
      <>
        {/* Main Menu */}
        <div
          className="context-menu-content clippy-context-menu"
          style={menuStyle}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Hide Clippy */}
          <MenuItem onClick={() => handleMenuAction('hide')}>
            🚫 Hide Clippy
          </MenuItem>

          {/* Separator */}
          <div style={separatorStyle} />

          {/* Select Agent */}
          <MenuItem
            hasSubmenu
            onMouseEnter={(e) => handleSubmenuOpen("agents", e)}
            onMouseLeave={handleSubmenuClose}
          >
            👤 Select Agent
          </MenuItem>

          {/* Play Animation */}
          <MenuItem
            hasSubmenu
            onMouseEnter={(e) => handleSubmenuOpen("animations", e)}
            onMouseLeave={handleSubmenuClose}
          >
            🎭 Play Animation
          </MenuItem>

          {/* Separator */}
          <div style={separatorStyle} />

          {/* Chat */}
          <MenuItem onClick={() => handleMenuAction('chat')}>
            💬 Chat with Clippy
          </MenuItem>

          {/* Wave */}
          <MenuItem onClick={() => handleMenuAction('wave')}>
            👋 Wave
          </MenuItem>

          {/* Greet */}
          <MenuItem onClick={() => handleMenuAction('greet')}>
            😊 Say Hello
          </MenuItem>
        </div>

        {/* Agents Submenu */}
        {submenuOpen === "agents" && (
          <div
            className="context-submenu"
            style={submenuStyle}
            onMouseEnter={() => setSubmenuOpen("agents")}
            onMouseLeave={handleSubmenuClose}
          >
            {agents.map((agent) => (
              <MenuItem
                key={agent}
                onClick={() => handleMenuAction('selectAgent', agent)}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {agent === currentAgent ? "✓" : " "}
                  <span>{agent}</span>
                </span>
              </MenuItem>
            ))}
          </div>
        )}

        {/* Animations Submenu */}
        {submenuOpen === "animations" && (
          <div
            className="context-submenu"
            style={submenuStyle}
            onMouseEnter={() => setSubmenuOpen("animations")}
            onMouseLeave={handleSubmenuClose}
          >
            {animations.slice(0, 15).map((animation) => (
              <MenuItem
                key={animation}
                onClick={() => handleMenuAction('playAnimation', animation)}
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