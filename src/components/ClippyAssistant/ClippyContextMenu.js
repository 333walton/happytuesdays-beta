import React from "react";
import { MenuList, MenuListItem, Separator } from "react95";

// Context menu component for Clippy
class ClippyContextMenu extends React.Component {
  render() {
    const {
      agents = ["Clippy", "Links", "Bonzi", "Genie", "Merlin", "Rover"],
      animations = ["Greeting", "Wave", "GetAttention", "Thinking", "Writing"],
      currentAgent,
      onClose,
      useLeftSubmenu,
      onHideAssistant,
      onSelectAgent,
      onPlayAnimation,
      onAbout,
    } = this.props;

    // Windows 98 menu styling
    const menuListStyle = {
      backgroundColor: "#c0c0c0",
      border: "2px solid",
      borderColor: "#ffffff #808080 #808080 #ffffff",
      boxShadow: "2px 2px 3px rgba(0, 0, 0, 0.3)",
      padding: "1px",
      fontFamily: "'MS Sans Serif', sans-serif",
      fontSize: "11px",
      minWidth: "120px",
      color: "black",
    };

    const menuItemStyle = {
      padding: "1px 8px",
      height: "18px",
      lineHeight: "18px",
      cursor: "default",
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "center",
      position: "relative",
      color: "black",
    };

    const submenuLeftStyle = {
      ...menuListStyle,
      position: "absolute",
      right: "100%",
      top: "0",
      marginRight: "0",
      boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.4)",
      display: "none",
    };

    const submenuRightStyle = {
      ...menuListStyle,
      position: "absolute",
      left: "100%",
      top: "0",
      marginLeft: "0",
      boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.4)",
      display: "none",
    };

    const separatorStyle = {
      height: "1px",
      margin: "1px 0",
      backgroundColor: "#808080",
      borderBottom: "1px solid #ffffff",
    };

    return (
      <MenuList style={menuListStyle} className="react95-MenuList">
        {/* Hide Assistant */}
        <MenuListItem
          onClick={() => {
            onHideAssistant();
            onClose();
          }}
          style={menuItemStyle}
          className="react95-MenuListItem"
        >
          Hide Assistant
        </MenuListItem>

        {/* Select Assistant submenu */}
        <div className="showOnHover">
          <MenuListItem style={menuItemStyle} className="react95-MenuListItem">
            Select Assistant
            <span className="submenu-arrow">{useLeftSubmenu ? "◀" : "▶"}</span>
          </MenuListItem>
          <MenuList
            style={useLeftSubmenu ? submenuLeftStyle : submenuRightStyle}
            className="react95-MenuList submenu"
          >
            {agents.map((agent) => (
              <MenuListItem
                key={agent}
                onClick={() => {
                  onSelectAgent(agent);
                  onClose();
                }}
                style={menuItemStyle}
                className="react95-MenuListItem"
              >
                <span className="checkmark">
                  {agent === currentAgent ? "✓" : " "}
                </span>
                {agent}
              </MenuListItem>
            ))}
          </MenuList>
        </div>

        {/* Play Animation submenu */}
        <div className="showOnHover">
          <MenuListItem style={menuItemStyle} className="react95-MenuListItem">
            Play Animation
            <span className="submenu-arrow">{useLeftSubmenu ? "◀" : "▶"}</span>
          </MenuListItem>
          <MenuList
            style={useLeftSubmenu ? submenuLeftStyle : submenuRightStyle}
            className="react95-MenuList submenu"
          >
            {animations.map((anim) => (
              <MenuListItem
                key={anim}
                onClick={() => {
                  onPlayAnimation(anim);
                  onClose();
                }}
                style={menuItemStyle}
                className="react95-MenuListItem"
              >
                {anim}
              </MenuListItem>
            ))}
          </MenuList>
        </div>

        {/* Separator */}
        <div style={separatorStyle} className="react95-Separator" />

        {/* About */}
        <MenuListItem
          onClick={() => {
            onAbout();
            onClose();
          }}
          style={menuItemStyle}
          className="react95-MenuListItem"
        >
          About
        </MenuListItem>
      </MenuList>
    );
  }
}

export default ClippyContextMenu;
