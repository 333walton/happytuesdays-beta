/**
 * mobile-clippy-fix.js
 * Fixes Clippy positioning and styling issues on mobile devices
 */

// Helper to check if we're on a mobile device
const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

/**
 * Main function to apply all mobile Clippy fixes
 * Import and call this from ClippyProvider.js
 */
export function applyMobileClippyFix() {
  // Only apply on mobile devices
  if (!isMobile) {
    return false;
  }

  console.log("Applying mobile Clippy positioning fix");

  // Add mobile-specific styles
  addMobileStyles();

  // Lock positioning system to prevent conflicts
  window._clippyPositionLocked = true;

  // Override positioning methods
  overridePositioningMethods();

  // Apply the position fix after a delay
  schedulePositionFix();

  return true;
}

/**
 * Add mobile-specific CSS overrides
 */
function addMobileStyles() {
  // Remove any existing mobile fix styles
  removeMobileStyles();

  // Create and add the style element
  const styleEl = document.createElement("style");
  styleEl.id = "clippy-mobile-fix";
  styleEl.textContent = `
      /* Fix Clippy positioning on mobile */
      .clippy {
        position: absolute !important;
        transform: scale(0.7) !important;
        transform-origin: center bottom !important;
        max-width: 93px !important;
        max-height: 93px !important;
        bottom: 10px !important;
        right: 10px !important;
        left: auto !important;
        top: auto !important;
        z-index: 1500 !important;
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
        pointer-events: none !important;
      }
      
      /* Fix overlay positioning */
      #clippy-clickable-overlay {
        position: absolute !important;
        bottom: 10px !important;
        right: 10px !important;
        left: auto !important;
        top: auto !important;
        width: 93px !important;
        height: 93px !important;
        z-index: 1510 !important;
        cursor: pointer !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }
      
      /* Fix balloon styling */
      .custom-clippy-balloon,
      .custom-clippy-chat-balloon {
        max-width: 70% !important;
        z-index: 1520 !important;
        font-size: 16px !important;
      }
      
      /* Animation fixes */
      .clippy-animate,
      .clippy-animate * {
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
      }
      
      /* SVG animation support */
      .clippy svg,
      .clippy svg * {
        visibility: visible !important;
        opacity: 1 !important;
        display: inline !important;
      }
    `;
  document.head.appendChild(styleEl);
}

/**
 * Override the positioning methods to enforce mobile constraints
 */
function overridePositioningMethods() {
  // Store original method if we need it later
  if (window.setClippyPosition) {
    window._originalSetClippyPosition = window.setClippyPosition;
  }

  // Override with mobile-friendly version
  window.setClippyPosition = function (newPos) {
    applyMobilePosition();
  };

  // Also override the initial position setter if it exists
  if (window.setClippyInitialPosition) {
    window._originalSetClippyInitialPosition = window.setClippyInitialPosition;
  }

  window.setClippyInitialPosition = function (percentPos) {
    applyMobilePosition();
  };
}

/**
 * Apply mobile-specific positioning to Clippy and overlay
 */
function applyMobilePosition() {
  // Fix Clippy element position
  const clippyEl = document.querySelector(".clippy");
  if (clippyEl) {
    clippyEl.style.position = "absolute";
    clippyEl.style.bottom = "10px";
    clippyEl.style.right = "10px";
    clippyEl.style.left = "auto";
    clippyEl.style.top = "auto";
    clippyEl.style.zIndex = "1500";
    clippyEl.style.transform = "scale(0.7)";
    clippyEl.style.transformOrigin = "center bottom";
  }

  // Fix overlay position
  const overlay = document.getElementById("clippy-clickable-overlay");
  if (overlay) {
    overlay.style.position = "absolute";
    overlay.style.bottom = "10px";
    overlay.style.right = "10px";
    overlay.style.left = "auto";
    overlay.style.top = "auto";
    overlay.style.zIndex = "1510";

    // Make sure the overlay matches clippy size
    if (clippyEl) {
      overlay.style.width = `${clippyEl.offsetWidth}px`;
      overlay.style.height = `${clippyEl.offsetHeight}px`;
    }
  }
}

/**
 * Schedule the position fix to run after Clippy is loaded
 */
function schedulePositionFix() {
  // Apply the position fix once after delays to ensure Clippy is loaded
  setTimeout(() => {
    applyMobilePosition();

    // Try again after a longer delay as a fallback
    setTimeout(applyMobilePosition, 2000);
  }, 1000);
}

/**
 * Remove mobile styles if they exist
 */
function removeMobileStyles() {
  const styleEl = document.getElementById("clippy-mobile-fix");
  if (styleEl && styleEl.parentNode) {
    styleEl.parentNode.removeChild(styleEl);
  }
}

/**
 * Clean up all mobile fixes
 * Call this when unmounting if needed
 */
export function cleanupMobileClippyFix() {
  if (!isMobile) {
    return false;
  }

  // Remove added styles
  removeMobileStyles();

  // Restore original methods if they exist
  if (window._originalSetClippyPosition) {
    window.setClippyPosition = window._originalSetClippyPosition;
    delete window._originalSetClippyPosition;
  }

  if (window._originalSetClippyInitialPosition) {
    window.setClippyInitialPosition = window._originalSetClippyInitialPosition;
    delete window._originalSetClippyInitialPosition;
  }

  // Reset positioning lock
  delete window._clippyPositionLocked;

  return true;
}

// Export a simple check for mobile
export const isClippyOnMobile = isMobile;
