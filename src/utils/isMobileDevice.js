// src/utils/isMobileDevice.js
import React, { useState, useEffect } from "react";

/**
 * Mobile device detection utility
 * Matches the existing mobile detection pattern from ClippyPositioning.js
 */

export const isMobileDevice = () => {
  try {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 600;
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    return mobileRegex.test(userAgent) || isSmallScreen || isTouchDevice;
  } catch (error) {
    console.warn("Error detecting mobile device:", error);
    return false;
  }
};

// Reactive mobile detection with resize listener
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(isMobileDevice);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
};

export default isMobileDevice;
