import React, { useEffect } from "react";

/**
 * CustomBalloon component for Clippy speech without any tips or close button
 */
const CustomBalloon = ({ message, position }) => {
  // Add style to override any balloon tips that might be coming from CSS
  useEffect(() => {
    // Create a style element to override any ::after or :before pseudo-elements
    const styleEl = document.createElement("style");
    styleEl.id = "clippy-balloon-tip-remover";
    styleEl.textContent = `
      .custom-clippy-balloon::after,
      .custom-clippy-balloon:after,
      .custom-clippy-balloon::before,
      .custom-clippy-balloon:before {
        display: none !important;
        visibility: hidden !important;
        content: none !important;
        border: none !important;
        width: 0 !important;
        height: 0 !important;
      }
    `;

    // Add the style element if it doesn't already exist
    if (!document.getElementById("clippy-balloon-tip-remover")) {
      document.head.appendChild(styleEl);
    }

    // Clean up on unmount
    return () => {
      const existingStyle = document.getElementById(
        "clippy-balloon-tip-remover"
      );
      if (existingStyle) {
        existingStyle.parentNode.removeChild(existingStyle);
      }
    };
  }, []);

  // Basic balloon styles without any tips
  const balloonStyle = {
    position: "fixed",
    zIndex: 9999,
    backgroundColor: "#fffcde",
    border: "1px solid #000",
    borderRadius: "5px",
    padding: "8px 12px",
    maxWidth: "250px",
    boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
    fontFamily: "Tahoma, Arial, sans-serif",
    fontSize: "12px",
    left: `${position.left}px`,
    top: `${position.top}px`,
    transition: "none",
    animation: "none",
    visibility: "visible",
    display: "block",
    opacity: 1,
  };

  return (
    <div
      style={balloonStyle}
      className="custom-clippy-balloon"
      data-notips="true" // Add a data attribute to target if needed
    >
      <div>{message}</div>
    </div>
  );
};

export default CustomBalloon;
