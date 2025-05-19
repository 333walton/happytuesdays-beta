import React, { Component } from "react";

/**
 * Reusable toggle button component for CRT mode and other toggle options
 */
class CRTModeToggle extends Component {
  render() {
    const { label, isActive, onClick, style, className, imageSrc, isSquare } =
      this.props;

    // If an image source is provided, render an <img> instead of a button
    if (imageSrc) {
      return (
        <div
          className={`power-button-container ${isActive ? "active" : ""}`}
          style={{
            position: "relative",
            ...style,
          }}
        >
          <img
            src={imageSrc}
            alt={label}
            onClick={onClick}
            className={`submit-doodle-button ${isActive ? "pressed" : ""} ${
              className || ""
            }`}
            style={{
              cursor: "pointer", // Ensure the image behaves like a button
            }}
          />
        </div>
      );
    }

    // Default button rendering (can be square if isSquare prop is true)
    return (
      <button
        onClick={onClick}
        className={`submit-doodle-button ${isActive ? "pressed" : ""} ${
          isSquare ? "square-button" : ""
        } ${className || ""}`}
        style={style}
      >
        <span>{label}</span>
      </button>
    );
  }
}

export default CRTModeToggle;
