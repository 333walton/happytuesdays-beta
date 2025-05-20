import React, { useEffect, useRef } from "react";

// Mobile detection
const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

/**
 * CustomBalloon component for Clippy speech - Updated with positioning fixes and mobile optimizations
 */
const CustomBalloon = ({ message, position }) => {
  const balloonRef = useRef(null);
  const positioningRafRef = useRef(null);

  // Add smooth fade-in animation and positioning
  useEffect(() => {
    if (balloonRef.current) {
      // Start transparent
      balloonRef.current.style.opacity = "0";

      // Position balloon correctly above Clippy's head
      const positionBalloon = () => {
        // Cancel any existing animation frame
        if (positioningRafRef.current) {
          cancelAnimationFrame(positioningRafRef.current);
        }

        const clippyElement = document.querySelector(".clippy");
        if (clippyElement) {
          const rect = clippyElement.getBoundingClientRect();

          // Center the balloon above Clippy's head
          const balloonWidth = balloonRef.current.offsetWidth;

          // For mobile, position slightly more to the side to prevent edge clipping
          const offsetX = isMobile ? 0 : rect.width / 2 - balloonWidth / 2;
          const left = position?.left || rect.left + offsetX;

          // Position above with a gap - bigger gap on mobile
          const gap = isMobile ? 25 : 15;
          const top =
            position?.top || rect.top - balloonRef.current.offsetHeight - gap;

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

      // Optimize repositioning with requestAnimationFrame for smoother performance
      let lastUpdateTime = 0;
      const updateInterval = isMobile ? 500 : 100; // Less frequent updates on mobile

      const updatePosition = (timestamp) => {
        if (timestamp - lastUpdateTime >= updateInterval) {
          positionBalloon();
          lastUpdateTime = timestamp;
        }
        positioningRafRef.current = requestAnimationFrame(updatePosition);
      };

      positioningRafRef.current = requestAnimationFrame(updatePosition);

      return () => {
        if (positioningRafRef.current) {
          cancelAnimationFrame(positioningRafRef.current);
        }
      };
    }
  }, [position]);

  // Basic balloon styles - optimized for mobile
  const balloonStyle = {
    position: "fixed",
    zIndex: 9999,
    backgroundColor: "#fffcde",
    border: "1px solid #000",
    borderRadius: "5px",
    padding: isMobile ? "10px 14px" : "8px 12px", // Larger touch targets on mobile
    maxWidth: isMobile ? "280px" : "250px", // Slightly wider on mobile
    boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
    fontFamily: "Tahoma, Arial, sans-serif",
    fontSize: isMobile ? "14px" : "12px", // Larger text on mobile
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
    // Fix for iOS rendering
    WebkitBackfaceVisibility: "hidden",
    backfaceVisibility: "hidden",
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

  // Close button style - larger on mobile
  const closeButtonStyle = {
    position: "absolute",
    top: "2px",
    right: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: isMobile ? "20px" : "16px", // Larger on mobile for easier tapping
    color: "#666",
    padding: isMobile ? "5px 8px" : "0", // Add padding for mobile touch target
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
          // Clean up animation frame
          if (positioningRafRef.current) {
            cancelAnimationFrame(positioningRafRef.current);
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
