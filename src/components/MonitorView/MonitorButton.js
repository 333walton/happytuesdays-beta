import React from "react";

/**
 * Simple button component for monitor controls
 */
const MonitorButton = ({ onClick, isActive, style, children }) => (
  <button
    onClick={onClick}
    className={isActive ? "active" : ""}
    style={{
      width: "18px",
      height: "18px",
      background: "#c0c0c0",
      border: isActive ? "inset 2px #ffffff" : "outset 2px #ffffff",
      boxSizing: "content-box",
      cursor: "pointer",
      margin: "0 5px",
      padding: 0,
      ...style,
    }}
  >
    {children}
  </button>
);

export default MonitorButton;
