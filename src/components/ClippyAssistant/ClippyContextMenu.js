import React from "react";
import { Menu, MenuList, MenuButton, MenuItem, Separator } from "@react95/core";

/**
 * Context menu for Clippy with options like hide, select assistant, etc.
 */
const ClippyContextMenu = ({
  onHide,
  onSelect,
  onPlayAnimation,
  onAbout,
  currentAgent = "Clippy",
}) => {
  // Available assistants
  const availableAgents = [
    "Clippy",
    "Links",
    "Bonzi",
    "Genie",
    "Merlin",
    "Rover",
  ];

  // Common animations that work well with most assistants
  const commonAnimations = [
    "Greeting",
    "Wave",
    "GetAttention",
    "GetTechy",
    "Thinking",
    "Processing",
    "Congratulate",
    "Alert",
  ];

  return (
    <Menu>
      <MenuList>
        <MenuItem onClick={onHide}>Hide Assistant</MenuItem>
        <MenuItem>
          Select Assistant
          <MenuList>
            {availableAgents.map((agent) => (
              <MenuItem
                key={agent}
                onClick={() => onSelect(agent)}
                checked={agent === currentAgent}
              >
                {agent}
              </MenuItem>
            ))}
          </MenuList>
        </MenuItem>
        <MenuItem>
          Play Animation
          <MenuList>
            {commonAnimations.map((anim) => (
              <MenuItem key={anim} onClick={() => onPlayAnimation(anim)}>
                {anim}
              </MenuItem>
            ))}
          </MenuList>
        </MenuItem>
        <Separator />
        <MenuItem onClick={onAbout}>About</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ClippyContextMenu;
