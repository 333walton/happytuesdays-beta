// ClippyContextMenu.js - Custom Windows 98 style context menu

import React, { useState, useEffect, useRef } from "react";

const ClippyContextMenu = ({
  x,
  y,
  onClose,
  onAction,
  agents = ["Clippy", "Links", "Bonzi", "Genie", "Merlin", "Rover"],
  currentAgent = "Clippy",
}) => {
  const menuRef = useRef(null);
  const [submenuOpen, setSubmenuOpen] = useState(null);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });

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

  // Adjust position to stay within viewport
  const adjustedPosition = React.useMemo(() => {
    const menuWidth = 180;
    const menuHeight = 160;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = Math.max(5, Math.min(x, viewportWidth - menuWidth - 5));
    let adjustedY = Math.max(5, Math.min(y, viewportHeight - menuHeight - 5));

    return { x: adjustedX, y: adjustedY };
  }, [x, y]);

  // Handle clicks outside menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Small delay to prevent immediate closure from the same click that opened the menu
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  // Handle submenu positioning
  const handleSubmenuOpen = (submenuType, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const submenuWidth = 160;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Determine if submenu should open to the left or right
    const openLeft = rect.right + submenuWidth > viewportWidth - 10;
    
    // Calculate position
    const newX = openLeft ? rect.left - submenuWidth : rect.right;
    const newY = Math.min(rect.top, viewportHeight - 300); // Keep submenu in viewport

    setSubmenuPosition({
      x: Math.max(5, newX),
      y: Math.max(5, newY),
      openLeft,
    });

    setSubmenuOpen(submenuType);
  };

  const handleSubmenuClose = () => {
    setSubmenuOpen(null);
  };

  // Menu item styles
  const menuItemStyle = {
    padding: "6px 16px",
    cursor: "pointer",
    fontSize: "11px",
    fontFamily: "Tahoma, sans-serif",
    color: "#000",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    transition: "background-color 0.1s",
  };

  const menuItemHoverStyle = {
    ...menuItemStyle,
    backgroundColor: "#0066cc",
    color: "#fff",
  };

  const separatorStyle = {
    height: "1px",
    backgroundColor: "#c0c0c0",
    margin: "2px 0",
    borderTop: "1px solid #808080",
  };

  // Custom MenuItem component
  const MenuItem = ({ children, onClick, onMouseEnter, onMouseLeave, disabled, hasSubmenu }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        style={isHovered && !disabled ? menuItemHoverStyle : { ...menuItemStyle, color: disabled ? "#808080" : "#000" }}
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

  // Menu container style
  const menuStyle = {
    position: "fixed",
    left: `${adjustedPosition.x}px`,
    top: `${adjustedPosition.y}px`,
    zIndex: 999999,
    backgroundColor: "#c0c0c0",
    border: "2px outset #c0c0c0",
    boxShadow: "4px 4px 8px rgba(0,0,0,0.3)",
    minWidth: "160px",
    fontFamily: "Tahoma, sans-serif",
    fontSize: "11px",
  };

  const submenuStyle = {
    position: "fixed",
    left: `${submenuPosition.x}px`,
    top: `${submenuPosition.y}px`,
    zIndex: 1000000,
    backgroundColor: "#c0c0c0",
    border: "2px outset #c0c0c0",
    boxShadow: "4px 4px 8px rgba(0,0,0,0.3)",
    minWidth: "140px",
    maxHeight: "300px",
    overflowY: "auto",
    fontFamily: "Tahoma, sans-serif",
    fontSize: "11px",
  };

  return (
    <>
      {/* Main Menu */}
      <div
        ref={menuRef}
        style={menuStyle}
        className="clippy-context-menu-debug"
      >
        {/* Hide Clippy */}
        <MenuItem onClick={() => onAction('hide')}>
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
        <MenuItem onClick={() => onAction('chat')}>
          💬 Chat with Clippy
        </MenuItem>

        {/* Wave */}
        <MenuItem onClick={() => onAction('wave')}>
          👋 Wave
        </MenuItem>

        {/* Greet */}
        <MenuItem onClick={() => onAction('greet')}>
          😊 Say Hello
        </MenuItem>
      </div>

      {/* Agents Submenu */}
      {submenuOpen === "agents" && (
        <div
          style={submenuStyle}
          onMouseEnter={() => setSubmenuOpen("agents")}
          onMouseLeave={handleSubmenuClose}
        >
          {agents.map((agent) => (
            <MenuItem
              key={agent}
              onClick={() => {
                onAction('selectAgent', agent);
                onClose();
              }}
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
          style={submenuStyle}
          onMouseEnter={() => setSubmenuOpen("animations")}
          onMouseLeave={handleSubmenuClose}
        >
          {animations.map((animation) => (
            <MenuItem
              key={animation}
              onClick={() => {
                onAction('playAnimation', animation);
                onClose();
              }}
            >
              {animation}
            </MenuItem>
          ))}
        </div>
      )}
    </>
  );
};

export default ClippyContextMenu;