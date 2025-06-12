// MobilePositioning.js - Clean mobile positioning logic
import { devLog } from "./ClippyPositioning";

// Constants
const MOBILE_SAFE_MARGINS = {
  top: 10,
  right: 4,
  bottom: 115,
  left: 4,
};

const CLIPPY_DIMENSIONS = {
  width: 124,
  height: 93,
};

const BROWSER_ADJUSTMENTS = {
  iosSafari: { bottom: 30, right: 0 },
  chrome: { bottom: 15, right: 3 },
  googleApp: { bottom: -30, right: 0 },
};

/**
 * Detect browser type for mobile adjustments
 */
function detectMobileBrowser() {
  const userAgent = navigator.userAgent || "";

  if (/iPad|iPhone|iPod/.test(userAgent)) {
    if (/GSA\//.test(userAgent)) {
      return "googleApp";
    }
    if (/CriOS\//.test(userAgent)) {
      return "chrome";
    }
    if (
      /Safari/.test(userAgent) &&
      !/CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent)
    ) {
      return "iosSafari";
    }
  }

  return "default";
}

/**
 * Calculate mobile position for Clippy
 */
export function calculateMobilePosition(customPosition = null) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (customPosition) {
    return enforceMobileBoundaries(customPosition);
  }

  // Default positioning
  let bottom = MOBILE_SAFE_MARGINS.bottom;
  let right = MOBILE_SAFE_MARGINS.right;

  // Try to detect taskbar for better positioning
  const taskbarNotifications = document.querySelector(
    ".TaskBar__notifications"
  );
  if (taskbarNotifications) {
    const taskbarRect = taskbarNotifications.getBoundingClientRect();
    const taskbarFromBottom = viewportHeight - taskbarRect.top;
    bottom = taskbarFromBottom + 13; // Gap above taskbar
  } else {
    // Apply browser-specific adjustments
    const browser = detectMobileBrowser();
    const adjustment = BROWSER_ADJUSTMENTS[browser];
    if (adjustment) {
      bottom += adjustment.bottom;
      right += adjustment.right;
    }
  }

  // Constrain to viewport
  bottom = Math.max(
    10,
    Math.min(bottom, viewportHeight - CLIPPY_DIMENSIONS.height - 10)
  );
  right = Math.max(
    4,
    Math.min(right, viewportWidth - CLIPPY_DIMENSIONS.width - 4)
  );

  return {
    position: "fixed",
    bottom: `${bottom}px`,
    right: `${right}px`,
    left: "auto",
    top: "auto",
    transform: "translateZ(0) scale(1)",
    transformOrigin: "center bottom",
    zIndex: "1500",
  };
}

/**
 * Enforce mobile viewport boundaries
 */
export function enforceMobileBoundaries(position) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const safeLeft = Math.max(10, window.safeAreaInsets?.left || 0);
  const safeRight = Math.max(10, window.safeAreaInsets?.right || 0);
  const safeTop = Math.max(10, window.safeAreaInsets?.top || 0);
  const safeBottom = Math.max(80, window.safeAreaInsets?.bottom || 0);

  const rightPx = position.rightPx || parseInt(position.right, 10) || 0;
  const bottomPx = position.bottomPx || parseInt(position.bottom, 10) || 0;

  const boundedRight = Math.max(
    safeRight,
    Math.min(viewportWidth - CLIPPY_DIMENSIONS.width - safeLeft, rightPx)
  );

  const boundedBottom = Math.max(
    safeBottom,
    Math.min(viewportHeight - CLIPPY_DIMENSIONS.height - safeTop, bottomPx)
  );

  return {
    rightPx: boundedRight,
    bottomPx: boundedBottom,
    right: `${boundedRight}px`,
    bottom: `${boundedBottom}px`,
  };
}

/**
 * Apply mobile position to Clippy element
 */
export function applyMobilePosition(
  clippyElement,
  position,
  isDragging = false
) {
  if (!clippyElement) return false;

  try {
    // Add/remove dragging class
    if (isDragging) {
      clippyElement.classList.add("clippy-dragging");
      document.body.classList.add("clippy-drag-active");
    } else {
      clippyElement.classList.remove("clippy-dragging");
      document.body.classList.remove("clippy-drag-active");
    }

    // Apply styles
    const styles = {
      position: "fixed",
      right: position.right || `${position.rightPx}px`,
      bottom: position.bottom || `${position.bottomPx}px`,
      left: "auto",
      top: "auto",
      transform: isDragging
        ? "translateZ(0) scale(1.05)"
        : "translateZ(0) scale(1)",
      transformOrigin: "center bottom",
      zIndex: isDragging ? "1550" : "1500",
      backfaceVisibility: "hidden",
      willChange: isDragging ? "transform, right, bottom" : "transform",
      WebkitTransform: isDragging
        ? "translateZ(0) scale(1.05)"
        : "translateZ(0) scale(1)",
      WebkitBackfaceVisibility: "hidden",
      touchAction: "none",
      userSelect: "none",
      WebkitUserSelect: "none",
      WebkitTouchCallout: "none",
      transition: isDragging
        ? "none"
        : "transform 0.2s ease, right 0.2s ease, bottom 0.2s ease",
    };

    Object.assign(clippyElement.style, styles);

    devLog(
      `Mobile position applied: right=${position.right}, bottom=${position.bottom}, dragging=${isDragging}`
    );
    return true;
  } catch (error) {
    console.error("Error applying mobile position:", error);
    return false;
  }
}

/**
 * Position mobile overlay to match Clippy
 */
export function positionMobileOverlay(overlayElement, clippyElement) {
  if (!overlayElement || !clippyElement) return false;

  const rect = clippyElement.getBoundingClientRect();

  Object.assign(overlayElement.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: "1510",
    background: "transparent",
    pointerEvents: "auto",
    cursor: "pointer",
  });

  return true;
}
