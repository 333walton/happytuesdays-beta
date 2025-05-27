// ClippyContextMenu.js - Enhanced with React95 styling and full functionality

import React, { useState, useEffect, useRef } from "react";
import { MenuList, MenuListItem, Separator } from "react95";

const ClippyContextMenu = ({
  x,
  y,
  onClose,
  agents = ["Clippy", "Links", "Bonzi", "Genie", "Merlin", "Rover"],
  currentAgent = "Clippy",
  onHideAssistant,
  onSelectAgent,
  onPlayAnimation,
  onAbout,
}) => {
  const menuRef = useRef(null);
  const [submenuOpen, setSubmenuOpen] = useState(null);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });

  // All available Clippy animations from the GitHub repo
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
    const menuHeight = 120;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (adjustedX + menuWidth > viewportWidth) {
      adjustedX = viewportWidth - menuWidth - 10;
    }

    if (adjustedY + menuHeight > viewportHeight) {
      adjustedY = viewportHeight - menuHeight - 10;
    }

    return { x: adjustedX, y: adjustedY };
  }, [x, y]);

  // Handle clicks outside menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Handle submenu positioning
  const handleSubmenuOpen = (submenuType, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const submenuWidth = 160;
    const viewportWidth = window.innerWidth;

    // Determine if submenu should open to the left or right
    const openLeft = rect.right + submenuWidth > viewportWidth;

    setSubmenuPosition({
      x: openLeft ? rect.left - submenuWidth : rect.right,
      y: rect.top,
      openLeft,
    });

    setSubmenuOpen(submenuType);
  };

  const handleSubmenuClose = () => {
    setSubmenuOpen(null);
  };

  // Handle agent selection
  const handleAgentSelect = (agent) => {
    onSelectAgent(agent);
    onClose();
  };

  // Handle animation play
  const handleAnimationPlay = (animation) => {
    onPlayAnimation(animation);
    onClose();
  };

  // Handle hide assistant
  const handleHideAssistant = () => {
    onHideAssistant();
    onClose();
  };

  // Handle about
  const handleAbout = () => {
    onAbout();
    onClose();
  };

  return (
    <>
      {/* Main Menu */}
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          left: `${adjustedPosition.x}px`,
          top: `${adjustedPosition.y}px`,
          zIndex: 10000,
        }}
      >
        <MenuList>
          {/* Hide Assistant */}
          <MenuListItem onClick={handleHideAssistant}>
            Hide Assistant
          </MenuListItem>

          {/* Select Assistant */}
          <MenuListItem
            onMouseEnter={(e) => handleSubmenuOpen("agents", e)}
            onMouseLeave={handleSubmenuClose}
            style={{ position: "relative" }}
          >
            Select Assistant ▶
          </MenuListItem>

          {/* Play Animation */}
          <MenuListItem
            onMouseEnter={(e) => handleSubmenuOpen("animations", e)}
            onMouseLeave={handleSubmenuClose}
            style={{ position: "relative" }}
          >
            Play Animation ▶
          </MenuListItem>

          <Separator />

          {/* About */}
          <MenuListItem onClick={handleAbout}>About</MenuListItem>
        </MenuList>
      </div>

      {/* Agents Submenu */}
      {submenuOpen === "agents" && (
        <div
          style={{
            position: "fixed",
            left: `${submenuPosition.x}px`,
            top: `${submenuPosition.y}px`,
            zIndex: 10001,
          }}
          onMouseEnter={() => setSubmenuOpen("agents")}
          onMouseLeave={handleSubmenuClose}
        >
          <MenuList>
            {agents.map((agent) => (
              <MenuListItem
                key={agent}
                onClick={() => handleAgentSelect(agent)}
                style={{
                  fontWeight: agent === currentAgent ? "bold" : "normal",
                }}
              >
                {agent === currentAgent ? "✓ " : "  "}
                {agent}
              </MenuListItem>
            ))}
          </MenuList>
        </div>
      )}

      {/* Animations Submenu */}
      {submenuOpen === "animations" && (
        <div
          style={{
            position: "fixed",
            left: `${submenuPosition.x}px`,
            top: `${submenuPosition.y}px`,
            zIndex: 10001,
            maxHeight: "300px",
            overflowY: "auto",
          }}
          onMouseEnter={() => setSubmenuOpen("animations")}
          onMouseLeave={handleSubmenuClose}
        >
          <MenuList>
            {animations.map((animation) => (
              <MenuListItem
                key={animation}
                onClick={() => handleAnimationPlay(animation)}
              >
                {animation}
              </MenuListItem>
            ))}
          </MenuList>
        </div>
      )}
    </>
  );
};

export default ClippyContextMenu;
