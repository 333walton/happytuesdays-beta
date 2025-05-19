import React, { useEffect, useRef } from "react";

/**
 * CustomBalloon component for Clippy speech without any tips or close button
 */
const CustomBalloon = ({ message, position }) => {
  const balloonRef = useRef(null);

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

  // Add smooth fade-in animation
  useEffect(() => {
    if (balloonRef.current) {
      // Start transparent
      balloonRef.current.style.opacity = "0";

      // Fade in after a tiny delay (ensures the initial state is applied)
      setTimeout(() => {
        balloonRef.current.style.transition = "opacity 0.15s ease-in";
        balloonRef.current.style.opacity = "1";
      }, 10);
    }
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
    // Removing transition from default styles since we're handling it in the useEffect
    // to prevent interference with the initial opacity setting
    transition: "none",
    animation: "none",
    visibility: "visible",
    display: "block",
    // Initial opacity will be overridden by the useEffect
  };

  return (
    <div
      ref={balloonRef}
      style={balloonStyle}
      className="custom-clippy-balloon"
      data-notips="true" // Add a data attribute to target if needed
    >
      <div>{message}</div>
    </div>
  );
};

export default CustomBalloon;
