import React, { useState, useEffect } from "react";

/**
 * Custom speech balloon for Clippy
 * Optimized for performance and mobile compatibility
 */
const CustomBalloon = ({ message, position }) => {
  const [visible, setVisible] = useState(false);

  // Show with animation after mounting
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="custom-clippy-balloon"
      style={{
        position: "fixed",
        left: `${position.left}px`,
        top: `${position.top}px`,
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : "10px"})`,
        transition: "opacity 0.3s, transform 0.3s",
        zIndex: 2100,
      }}
    >
      {message}
    </div>
  );
};

export default CustomBalloon;
