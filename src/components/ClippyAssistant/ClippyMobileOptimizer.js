/**
 * ClippyMobileOptimizer.js
 *
 * This module contains optimizations specifically for mobile devices
 * and ensures that Clippy stays hidden when hidden.
 */

// Flag to track Clippy's visibility state globally
let clippyHiddenGlobally = false;

// Function to optimize Clippy for mobile devices
export function optimizeClippyForMobile() {
  console.log("Optimizing Clippy for mobile devices...");

  // Detect if we're on a mobile device
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (!isMobile) {
    console.log("Not on mobile device, skipping mobile optimizations");
    return;
  }

  console.log("Mobile device detected, applying mobile optimizations");

  // Apply mobile-specific optimizations
  const mobileOptimizations = () => {
    try {
      // Find Clippy element
      const clippyEl = document.querySelector(".clippy");
      if (!clippyEl) return;

      // Check if Clippy position is locked - only move if unlocked
      const isPositionLocked =
        typeof window._clippyPositionLocked !== "undefined"
          ? window._clippyPositionLocked
          : true; // Default to locked for safety

      // Only apply position changes if position is NOT locked
      if (!isPositionLocked) {
        // 1. Reduce size for mobile
        clippyEl.style.transform = "scale(0.8)";
        clippyEl.style.transformOrigin = "bottom right";
      }

      // 2. Apply hardware acceleration
      clippyEl.style.willChange = "transform, opacity";
      clippyEl.style.backfaceVisibility = "hidden";
      clippyEl.style.perspective = "1000px";
      clippyEl.style.webkitFontSmoothing = "antialiased";

      // 3. Optimize animations for performance
      const styleEl = document.createElement("style");
      styleEl.id = "clippy-mobile-optimizations";

      // Check position lock state for CSS
      const positioningCSS = !isPositionLocked
        ? `
          transform: scale(0.8) !important;
          transform-origin: bottom right !important;
          bottom: 195px !important;
      `
        : "";

      styleEl.textContent = `
        /* Mobile optimizations */
        .clippy {
          ${positioningCSS}
          will-change: transform, opacity !important;
          -webkit-font-smoothing: antialiased !important;
          -webkit-backface-visibility: hidden !important;
          backface-visibility: hidden !important;
        }
        
        /* Reduce animation complexity */
        .clippy .map {
          transition: none !important;
          animation-duration: 0.8s !important; /* Speed up animations */
        }
        
        /* Optimize rendering */
        .clippy * {
          -webkit-transform: translateZ(0);
          -moz-transform: translateZ(0);
          -ms-transform: translateZ(0);
          transform: translateZ(0);
        }
        
        /* Reduce repaints */
        .clippy-balloon, .custom-clippy-balloon {
          will-change: transform, opacity !important;
          transform: translateZ(0) !important;
        }
      `;
      document.head.appendChild(styleEl);

      console.log("Mobile optimizations applied successfully");
    } catch (e) {
      console.error("Error applying mobile optimizations:", e);
    }
  };

  // Apply optimizations now and whenever Clippy is shown
  mobileOptimizations();

  // Set up a mutation observer to detect when Clippy is added to the DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (
            node.nodeType === 1 &&
            (node.classList?.contains("clippy") ||
              node.id === "clippy-clickable-overlay")
          ) {
            // Clippy was added to DOM, apply optimizations
            mobileOptimizations();

            // If Clippy should be hidden, hide it immediately
            if (clippyHiddenGlobally) {
              console.log(
                "Clippy reappeared but should be hidden - hiding it again"
              );
              if (window.executeClippyNuclearOption) {
                window.executeClippyNuclearOption();
              } else if (window.DESTROY_CLIPPY) {
                window.DESTROY_CLIPPY();
              } else if (window.setAssistantVisible) {
                window.setAssistantVisible(false);
              } else {
                // Direct DOM approach as last resort
                node.style.display = "none";
                node.style.visibility = "hidden";
                node.style.opacity = "0";
              }
            }
          }
        });
      }
    });
  });

  // Start observing
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Override setAssistantVisible function to track visibility state
  if (typeof window !== "undefined" && window.setAssistantVisible) {
    const originalSetVisible = window.setAssistantVisible;
    window.setAssistantVisible = function (visible) {
      // Update our global tracking flag
      clippyHiddenGlobally = !visible;
      console.log(`Setting clippyHiddenGlobally to ${clippyHiddenGlobally}`);

      // Call the original function
      return originalSetVisible(visible);
    };
  }

  // Add function to check if Clippy should be visible
  window.shouldClippyBeVisible = function () {
    return !clippyHiddenGlobally;
  };

  // Check for position lock status changes
  window.addEventListener("storage", function (e) {
    if (e.key === "clippy_position_locked") {
      try {
        window._clippyPositionLocked = e.newValue !== "false";
        console.log(
          `Clippy position lock updated: ${window._clippyPositionLocked}`
        );
        // Re-apply optimizations with the new lock state
        mobileOptimizations();
      } catch (err) {
        console.error("Error handling clippy position lock change:", err);
      }
    }
  });

  console.log("Mobile optimizations and visibility tracking set up");

  // Return the observer for cleanup
  return observer;
}

// Export a function that will prevent Clippy from reappearing
export function enforceClippyVisibility() {
  console.log("Setting up enforced Clippy visibility state");

  // Override the show function to respect our hidden state
  if (typeof window !== "undefined") {
    // Patch ClippyService.show if available
    if (window.ClippyService && window.ClippyService.show) {
      const originalShow = window.ClippyService.show;
      window.ClippyService.show = function () {
        if (clippyHiddenGlobally) {
          console.log("Preventing Clippy.show() because it should be hidden");
          return false;
        }
        return originalShow.apply(this, arguments);
      };
    }

    // Add a periodic check to catch any rogue Clippy instances
    setInterval(() => {
      if (clippyHiddenGlobally) {
        const clippyElements = document.querySelectorAll(
          ".clippy, #clippy-clickable-overlay"
        );
        if (clippyElements.length > 0) {
          console.log(
            "Found Clippy elements when they should be hidden - removing"
          );
          if (window.executeClippyNuclearOption) {
            window.executeClippyNuclearOption();
          } else if (window.DESTROY_CLIPPY) {
            window.DESTROY_CLIPPY();
          }
        }
      }
    }, 2000); // Check every 2 seconds
  }
}

// Initialize the position lock from localStorage
function initializePositionLock() {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    try {
      const savedLockState = localStorage.getItem("clippy_position_locked");
      window._clippyPositionLocked = savedLockState !== "false";
      console.log(
        `Initialized clippy position lock: ${window._clippyPositionLocked}`
      );
    } catch (e) {
      console.error("Error reading position lock from localStorage:", e);
      window._clippyPositionLocked = true; // Default to locked
    }
  }
}

// Auto-initialize when loaded
if (typeof window !== "undefined") {
  // Initialize position lock
  initializePositionLock();

  // Run on DOM content loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      optimizeClippyForMobile();
      enforceClippyVisibility();
    });
  } else {
    // DOM already loaded, run now
    optimizeClippyForMobile();
    enforceClippyVisibility();
  }
}

// Export default for module usage
export default {
  optimizeClippyForMobile,
  enforceClippyVisibility,
};
