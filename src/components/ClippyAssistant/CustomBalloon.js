import React, { useEffect, useRef } from "react";

/**
 * CustomBalloon component for Clippy speech - Updated with positioning fixes and mobile optimizations
 */

const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

const CustomBalloon = ({ message, position }) => {
  const balloonRef = useRef(null);
  const positioningRafRef = useRef(null);
  const lastPositionRef = useRef({ left: 0, top: 0 });

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
          const balloonWidth = balloonRef.current.offsetWidth;
          const balloonHeight = balloonRef.current.offsetHeight;

          // Calculate responsive positioning
          // On mobile, position more to the side to prevent edge clipping
          const offsetX = isMobile
            ? rect.width * 0.1
            : rect.width / 2 - balloonWidth / 2;
          let left = position?.left || rect.left + offsetX;

          // Position with proportional gap - adjusted for screen size
          const viewportHeight = window.innerHeight;
          const gapPercent = isMobile ? 0.05 : 0.03; // 5% on mobile, 3% on desktop
          const gap = Math.max(15, viewportHeight * gapPercent);
          let top = position?.top || rect.top - balloonHeight - gap;

          // Ensure balloon stays within viewport
          const viewportWidth = window.innerWidth;

          if (left < 10) left = 10;
          if (left + balloonWidth > viewportWidth - 10)
            left = viewportWidth - balloonWidth - 10;

          if (top < 10) top = 10;
          // If no room above, try positioning to the side
          if (top < 10 && !position) {
            top = rect.top + rect.height / 2 - balloonHeight / 2;
            left = rect.left - balloonWidth - 15;

            // If still no room, try right side
            if (left < 10) {
              left = rect.right + 15;

              // Last resort: below
              if (left + balloonWidth > viewportWidth - 10) {
                left = rect.left + rect.width / 2 - balloonWidth / 2;
                top = rect.bottom + 15;
              }
            }
          }

          // Only update DOM if position changed significantly (performance optimization)
          if (
            Math.abs(lastPositionRef.current.left - left) > 2 ||
            Math.abs(lastPositionRef.current.top - top) > 2
          ) {
            balloonRef.current.style.left = `${left}px`;
            balloonRef.current.style.top = `${top}px`;
            lastPositionRef.current = { left, top };
          }
        }
      };

      // Position balloon immediately
      positionBalloon();

      // Fade in after positioning
      setTimeout(() => {
        balloonRef.current.style.transition = "opacity 0.15s ease-in";
        balloonRef.current.style.opacity = "1";
      }, 10);

      // Optimize repositioning with throttled requestAnimationFrame
      let lastUpdateTime = 0;
      const updateInterval = isMobile ? 750 : 250; // Much less frequent updates on mobile

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
    zIndex: 2100, // Standardized z-index hierarchy
    backgroundColor: "#fffcde",
    border: "1px solid #000",
    borderRadius: "5px",
    padding: isMobile ? "12px 16px" : "8px 12px", // Larger touch targets on mobile
    maxWidth: isMobile ? "280px" : "250px", // Slightly wider on mobile
    boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
    fontFamily: "Tahoma, Arial, sans-serif",
    fontSize: isMobile ? "16px" : "12px", // Larger text on mobile
    // Hardware acceleration for better performance
    transform: "translateZ(0)",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    // Remove scrollbars
    overflow: "visible",
    maxHeight: "none",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  };

  // Balloon tip styles - make tip position responsive on mobile
  const tipStyle = {
    position: "absolute",
    bottom: "-10px",
    left: isMobile ? "30px" : "20px", // Further from edge on mobile
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
    left: isMobile ? "29px" : "19px", // Match tip position
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
    fontSize: isMobile ? "24px" : "16px", // Larger on mobile for easier tapping
    color: "#666",
    padding: isMobile ? "6px 10px" : "0", // Add padding for mobile touch target
    // No need for background or border - cleaner look
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
            // Fade out before removing
            balloonRef.current.style.opacity = "0";
            balloonRef.current.style.transition = "opacity 0.15s ease-out";

            setTimeout(() => {
              if (balloonRef.current && balloonRef.current.parentNode) {
                balloonRef.current.parentNode.removeChild(balloonRef.current);
              }
            }, 150);
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
