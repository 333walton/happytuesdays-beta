// Create a new file: src/components/ClippyAssistant/ClippyContextMenu.jsx

import React from "react";
import { Menu, MenuList, MenuItem, Separator } from "@react95/core";

const ClippyContextMenu = ({
  position,
  onClose,
  onHide,
  onSelectAgent,
  onPlayAnimation,
  onAbout,
  currentAgent,
  availableAgents,
  availableAnimations,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 9999,
      }}
    >
      <Menu open={true} onClick={onClose}>
        <MenuList>
          <MenuItem onClick={onHide}>Hide Assistant</MenuItem>
          <MenuItem>
            Select Assistant
            <MenuList>
              {availableAgents.map((agent) => (
                <MenuItem
                  key={agent}
                  onClick={() => onSelectAgent(agent)}
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
              {availableAnimations.map((anim) => (
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
    </div>
  );
};

export default ClippyContextMenu;
