/**
 * mobile-clippy-fix.js
 * Fixes Clippy positioning and styling issues on mobile devices
 * Optimized for performance and reduced debug output
 */

// Helper to check if we're on a mobile device
const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

// Shared state to prevent duplicate work
const state = {
  overlayCheckInterval: null,
  positioningApplied: false,
  stylesApplied: false,
};

/**
 * Globally accessible function to clean up duplicate overlays
 * Makes it available for both mobile and desktop code paths
 */
window.cleanupDuplicateClippyOverlays = function () {
  const overlays = document.querySelectorAll("#clippy-clickable-overlay");
  if (overlays.length <= 1) return 0;

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
  if (window.cleanupDuplicateClippyOverlays) {
    window.cleanupDuplicateClippyOverlays();
  }

  // Exit early if not mobile
  if (!isMobile) {
    return false;
  }

  // Set a global flag to prevent multiple initializations
  if (window._clippyMobileFixApplied) {
    return false;
  }

  // Clean up any existing overlays before creating a new one
  removeAllOverlays();

  // Add mobile-specific styles
  addMobileStyles();

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
  // Skip if already applied
  if (state.stylesApplied) return;

  // Remove any existing mobile fix styles
  removeMobileStyles();

  // Check if position is locked
  const isPositionLocked =
    typeof window._clippyPositionLocked !== "undefined"
      ? window._clippyPositionLocked
      : true; // Default to locked for safety

  // Create and add the style element
  const styleEl = document.createElement("style");
  styleEl.id = "clippy-mobile-fix";

  // Only apply position styling if not locked
  const positioningCSS = !isPositionLocked
    ? `
    position: absolute !important;
    transform: scale(0.7) !important;
    transform-origin: center bottom !important;
    max-width: 123px !important;
    max-height: 93px !important;
    bottom: 195px !important;
    right: 60px !important;
    left: auto !important;
    top: auto !important;
  `
    : "";

  styleEl.textContent = `
      /* Fix Clippy positioning on mobile - with more specific selectors */
      .clippy[class] {
        ${positioningCSS}
        z-index: 1500 !important;
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
        pointer-events: none !important;
        will-change: transform !important;
      }
      
      /* Fix overlay positioning */
      #clippy-clickable-overlay[id] {
        position: absolute !important;
        bottom: 195px !important;
        right: 60px !important;
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
        will-change: transform !important;
      }
      
      /* Fix balloon styling */
      div.custom-clippy-balloon,
      div.custom-clippy-chat-balloon {
        max-width: 70% !important;
        z-index: 1520 !important;
        font-size: 16px !important;
        overflow: hidden !important;
        max-height: 300px !important; /* Set a max height to prevent excessive size */
      }
      
      /* Prevent scrolling in balloon content */
      div.custom-clippy-balloon .clippy-content,
      div.custom-clippy-chat-balloon .clippy-content,
      div.custom-clippy-balloon div,
      div.custom-clippy-chat-balloon div {
        overflow: hidden !important;
        overflow-y: hidden !important;
        overflow-x: hidden !important;
      }
      
      /* Hide the balloon tip on mobile */
      .clippy-tip, 
      .custom-clippy-balloon .clippy-tip,
      .custom-clippy-chat-balloon .clippy-tip {
        display: none !important;
      }
      
      /* Make the Ask Clippy button smaller for mobile */
      .custom-clippy-balloon button,
      .custom-clippy-chat-balloon button {
        height: 12px !important;
        min-height: 12px !important;
        padding-top: 1px !important;
        padding-bottom: 1px !important;
        line-height: 1 !important;
        font-size: 11px !important;
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
  state.stylesApplied = true;
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
    // Only apply if position is not locked
    if (!window._clippyPositionLocked) {
      applyMobilePosition();
    }
  };

  // Also override the initial position setter if it exists
  if (window.setClippyInitialPosition) {
    window._originalSetClippyInitialPosition = window.setClippyInitialPosition;
  }

  window.setClippyInitialPosition = function (percentPos) {
    // Only apply if position is not locked
    if (!window._clippyPositionLocked) {
      applyMobilePosition();
    }
  };

  // Listen for lock state changes
  window.addEventListener("storage", function (e) {
    if (e.key === "clippy_position_locked") {
      try {
        // Update state based on storage change
        window._clippyPositionLocked = e.newValue !== "false";

        // Re-apply styles with new lock state
        removeMobileStyles();
        addMobileStyles();

        console.log(
          `Mobile fix updated lock state: ${window._clippyPositionLocked}`
        );
      } catch (err) {
        console.error(
          "Error handling lock state change in mobile-clippy-fix:",
          err
        );
      }
    }
  });
}

/**
 * Apply mobile-specific positioning to Clippy and overlay
 */
function applyMobilePosition() {
  // Skip if already applied and nothing has changed
  if (state.positioningApplied) {
    // Just run cleanup occasionally
    if (window.cleanupDuplicateClippyOverlays) {
      window.cleanupDuplicateClippyOverlays();
    }
    return;
  }

  // Check if position is locked
  const isPositionLocked =
    typeof window._clippyPositionLocked !== "undefined"
      ? window._clippyPositionLocked
      : true; // Default to locked for safety

  // Don't apply positioning if locked
  if (isPositionLocked) {
    console.log("Clippy position is locked, skipping position changes");
    return;
  }

  // Fix Clippy element position - with extra safety checks
  const clippyEl = document.querySelector(".clippy");
  if (clippyEl && clippyEl.classList.contains("clippy")) {
    clippyEl.style.position = "absolute";
    clippyEl.style.bottom = "195px";
    clippyEl.style.right = "60px";
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
    overlay.style.bottom = "195px";
    overlay.style.right = "60px";
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
    newOverlay.style.bottom = "195px";
    newOverlay.style.right = "60px";
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
  }

  state.positioningApplied = true;
}

/**
 * Schedule the position fix to run after Clippy is loaded
 * Uses less frequent intervals to reduce performance impact
 */
function schedulePositionFix() {
  // Apply the position fix once after delays to ensure Clippy is loaded
  setTimeout(() => {
    applyMobilePosition();

    // Try again after a longer delay as a fallback
    setTimeout(applyMobilePosition, 2000);

    // Clear any existing interval
    if (state.overlayCheckInterval) {
      clearInterval(state.overlayCheckInterval);
    }

    // Set up much less frequent checking for duplicate overlays
    state.overlayCheckInterval = setInterval(() => {
      if (window.cleanupDuplicateClippyOverlays) {
        window.cleanupDuplicateClippyOverlays();
      }
    }, 30000); // Check only every 30 seconds instead of 5
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
  state.stylesApplied = false;
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

  // Clear intervals
  if (state.overlayCheckInterval) {
    clearInterval(state.overlayCheckInterval);
    state.overlayCheckInterval = null;
  }

  // Restore original methods if they exist
  if (window._originalSetClippyPosition) {
    window.setClippyPosition = window._originalSetClippyPosition;
    delete window._originalSetClippyPosition;
  }

  if (window._originalSetClippyInitialPosition) {
    window.setClippyInitialPosition = window._originalSetClippyInitialPosition;
    delete window._originalSetClippyInitialPosition;
  }

  // Reset initialization flag
  delete window._clippyMobileFixApplied;

  // Reset state
  state.positioningApplied = false;

  return true;
}

// Initialize lock state
if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
  try {
    const savedLockState = localStorage.getItem("clippy_position_locked");
    window._clippyPositionLocked = savedLockState !== "false";
    console.log(
      `Mobile fix initialized lock state: ${window._clippyPositionLocked}`
    );
  } catch (e) {
    console.error("Error reading lock state in mobile-clippy-fix:", e);
    window._clippyPositionLocked = true; // Default to locked for safety
  }
}

// Export a simple check for mobile
export const isClippyOnMobile = isMobile;
