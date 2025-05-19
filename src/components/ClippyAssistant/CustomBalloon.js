import React, { useEffect, useRef } from "react";

/**
 * CustomBalloon component for Clippy speech - Updated with positioning fixes
 */
const CustomBalloon = ({ message, position }) => {
  const balloonRef = useRef(null);

  // Add smooth fade-in animation and positioning
  useEffect(() => {
    if (balloonRef.current) {
      // Start transparent
      balloonRef.current.style.opacity = "0";

      // Position balloon correctly above Clippy's head
      const positionBalloon = () => {
        const clippyElement = document.querySelector(".clippy");
        if (clippyElement) {
          const rect = clippyElement.getBoundingClientRect();

          // Center the balloon above Clippy's head
          const balloonWidth = balloonRef.current.offsetWidth;
          const left = rect.left + rect.width / 2 - balloonWidth / 2;

          // Position above with a gap
          const top = rect.top - balloonRef.current.offsetHeight - 15;

          balloonRef.current.style.left = `${left}px`;
          balloonRef.current.style.top = `${top}px`;
        }
      };

      // Position balloon immediately
      positionBalloon();

      // Fade in after positioning
      setTimeout(() => {
        balloonRef.current.style.transition = "opacity 0.15s ease-in";
        balloonRef.current.style.opacity = "1";
      }, 10);

      // Listen for clippy movement to reposition balloon
      const handleClippyMove = () => {
        positionBalloon();
      };

      document.addEventListener("clippy-moved", handleClippyMove);
      document.addEventListener("clippy-resize", handleClippyMove);

      return () => {
        document.removeEventListener("clippy-moved", handleClippyMove);
        document.removeEventListener("clippy-resize", handleClippyMove);
      };
    }
  }, []);

  // Basic balloon styles
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
    opacity: "1",
    // Remove scrollbars
    overflow: "visible",
    maxHeight: "none",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  };

  // Balloon tip styles
  const tipStyle = {
    position: "absolute",
    bottom: "-10px",
    left: "20px",
    borderWidth: "10px 10px 0",
    borderStyle: "solid",
    borderColor: "#fffcde transparent",
    display: "block",
    width: "0",
  };

  // Balloon tip border
  const tipBorderStyle = {
    position: "absolute",
    bottom: "-11px",
    left: "20px",
    borderWidth: "10px 10px 0",
    borderStyle: "solid",
    borderColor: "#000 transparent",
    display: "block",
    width: "0",
  };

  // Close button style
  const closeButtonStyle = {
    position: "absolute",
    top: "2px",
    right: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
    color: "#666",
  };

  return (
    <div
      ref={balloonRef}
      style={balloonStyle}
      className="custom-clippy-balloon"
    >
      <div style={tipBorderStyle}></div>
      <div style={tipStyle}></div>
      <span
        style={closeButtonStyle}
        onClick={() => {
          if (balloonRef.current && balloonRef.current.parentNode) {
            balloonRef.current.parentNode.removeChild(balloonRef.current);
          }
        }}
      >
        ×
      </span>
      <div>{message}</div>
    </div>
  );
};

export default CustomBalloon;
