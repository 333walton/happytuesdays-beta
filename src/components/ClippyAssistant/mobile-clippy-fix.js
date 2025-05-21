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
 * Globally accessible function to clean up duplicate overlays
 * Makes it available for both mobile and desktop code paths
 */
window.cleanupDuplicateClippyOverlays = function () {
  const overlays = document.querySelectorAll("#clippy-clickable-overlay");
  if (overlays.length <= 1) return 0;

  console.log(
    `Found ${overlays.length} clippy overlays - cleaning up duplicates`
  );

  // Keep only the first one
  let removed = 0;
  for (let i = 1; i < overlays.length; i++) {
    if (overlays[i] && overlays[i].parentNode) {
      overlays[i].parentNode.removeChild(overlays[i]);
      removed++;
    }
  }

  return removed;
};

/**
 * Removes all clippy overlays to ensure a clean state
 */
function removeAllOverlays() {
  const overlays = document.querySelectorAll("#clippy-clickable-overlay");
  let count = 0;
  overlays.forEach((overlay) => {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
      count++;
    }
  });
  return count;
}

/**
 * Main function to apply all mobile Clippy fixes
 * Import and call this from ClippyProvider.js
 */
export function applyMobileClippyFix() {
  // Clean up duplicate overlays even if not on mobile
  // This helps both desktop and mobile scenarios
  if (window.cleanupDuplicateClippyOverlays) {
    const removedCount = window.cleanupDuplicateClippyOverlays();
    if (removedCount > 0) {
      console.log(
        `Removed ${removedCount} duplicate overlays during initialization`
      );
    }
  }

  // Exit early if not mobile
  if (!isMobile) {
    return false;
  }

  // Set a global flag to prevent multiple initializations
  if (window._clippyMobileFixApplied) {
    console.log(
      "Mobile clippy fix already applied, skipping duplicate application"
    );
    return false;
  }

  console.log("Applying mobile Clippy positioning fix");

  // Clean up any existing overlays before creating a new one
  const removedCount = removeAllOverlays();
  if (removedCount > 0) {
    console.log(`Removed ${removedCount} previous clippy overlay(s)`);
  }

  // Add mobile-specific styles
  addMobileStyles();

  // Lock positioning system to prevent conflicts
  window._clippyPositionLocked = true;

  // Set the initialization flag
  window._clippyMobileFixApplied = true;

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
      /* Fix Clippy positioning on mobile - with more specific selectors */
      .clippy[class] {
        position: absolute !important;
        transform: scale(0.7) !important;
        transform-origin: center bottom !important;
        max-width: 123px !important;
        max-height: 93px !important;
        bottom: 220px !important;
        right: 20px !important;
        left: auto !important;
        top: auto !important;
        z-index: 1500 !important;
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
        pointer-events: none !important;
      }
      
      /* Fix overlay positioning */
      #clippy-clickable-overlay[id] {
        position: absolute !important;
        bottom: 220px !important;
        right: 20px !important;
        left: auto !important;
        top: auto !important;
        width: 93px !important;
        height: 93px !important;
        z-index: 1510 !important;
        cursor: pointer !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        background: transparent !important;
      }
      
      /* Fix balloon styling */
      div.custom-clippy-balloon,
      div.custom-clippy-chat-balloon {
        max-width: 70% !important;
        z-index: 1520 !important;
        font-size: 16px !important;
      }
      
      /* Animation fixes - more targeted */
      .clippy .clippy-animate,
      .clippy .clippy-animate * {
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
      }
      
      /* SVG animation support - more targeted */
      .clippy svg,
      .clippy svg * {
        visibility: visible !important;
        opacity: 1 !important;
        display: inline !important;
      }

      /* Add reset stylesheet to counteract global form styles */
      .window button, 
      .window input, 
      .window select,
      .desktop button,
      .desktop input,
      .desktop select,
      .taskbar button,
      .taskbar input,
      .taskbar select {
        min-height: initial !important;
        height: auto !important;
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
  // Run global cleanup of duplicate overlays
  if (window.cleanupDuplicateClippyOverlays) {
    window.cleanupDuplicateClippyOverlays();
  }

  // Fix Clippy element position - with extra safety checks
  const clippyEl = document.querySelector(".clippy");
  if (clippyEl && clippyEl.classList.contains("clippy")) {
    clippyEl.style.position = "absolute";
    clippyEl.style.bottom = "220px"; // Match your CSS value
    clippyEl.style.right = "20px"; // Match your CSS value
    clippyEl.style.left = "auto";
    clippyEl.style.top = "auto";
    clippyEl.style.zIndex = "1500";
    clippyEl.style.transform = "scale(0.7)";
    clippyEl.style.transformOrigin = "center bottom";
  }

  // Fix overlay position - with ID verification
  const overlay = document.querySelector("#clippy-clickable-overlay");
  if (overlay && overlay.id === "clippy-clickable-overlay") {
    overlay.style.position = "absolute";
    overlay.style.bottom = "220px"; // Match your CSS value
    overlay.style.right = "20px"; // Match your CSS value
    overlay.style.left = "auto";
    overlay.style.top = "auto";
    overlay.style.zIndex = "1510";
    overlay.style.background = "transparent";

    // Make sure the overlay matches clippy size
    if (clippyEl) {
      overlay.style.width = `${clippyEl.offsetWidth}px`;
      overlay.style.height = `${clippyEl.offsetHeight}px`;
    }
  }

  // Check if we need to create an overlay if none exists
  if (!overlay && clippyEl) {
    const newOverlay = document.createElement("div");
    newOverlay.id = "clippy-clickable-overlay";
    newOverlay.style.position = "absolute";
    newOverlay.style.bottom = "220px";
    newOverlay.style.right = "20px";
    newOverlay.style.left = "auto";
    newOverlay.style.top = "auto";
    newOverlay.style.width = `${clippyEl.offsetWidth}px`;
    newOverlay.style.height = `${clippyEl.offsetHeight}px`;
    newOverlay.style.zIndex = "1510";
    newOverlay.style.cursor = "pointer";
    newOverlay.style.background = "transparent";
    newOverlay.style.visibility = "visible";
    newOverlay.style.opacity = "1";
    newOverlay.style.pointerEvents = "auto";
    document.body.appendChild(newOverlay);

    console.log("Created new clickable overlay for Clippy");
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

    // Set up periodic checking for duplicate overlays
    setInterval(() => {
      if (window.cleanupDuplicateClippyOverlays) {
        window.cleanupDuplicateClippyOverlays();
      }
    }, 5000); // Check every 5 seconds
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

  // Clean up any overlays we created
  removeAllOverlays();

  // Restore original methods if they exist
  if (window._originalSetClippyPosition) {
    window.setClippyPosition = window._originalSetClippyPosition;
    delete window._originalSetClippyPosition;
  }

  if (window._originalSetClippyInitialPosition) {
    window.setClippyInitialPosition = window._originalSetClippyInitialPosition;
    delete window._originalSetClippyInitialPosition;
  }

  // Reset positioning lock and initialization flag
  delete window._clippyPositionLocked;
  delete window._clippyMobileFixApplied;

  return true;
}

// Export a simple check for mobile
export const isClippyOnMobile = isMobile;
