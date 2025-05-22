/**
 * ClippyAssistant Index
 *
 * This file serves as the main entry point for the ClippyAssistant component
 * and ensures all the fixes and enhancements are properly loaded.
 */

// Import the component
import ClippyAssistant from "./ClippyAssistant";
import ClippyProvider, { useClippyContext } from "./ClippyProvider";

// Import all fixes to ensure they're bundled
import "./ClippyContextMenuFix";
import "./ClippyNuclearFix";
import "./ClippyDestroyAll";

// Export the components
export { ClippyProvider, useClippyContext };
export default ClippyAssistant;

// Load mobile optimizer - conditionally to avoid runtime errors
let mobileOptimizer = null;
try {
  // Using require instead of import to conditionally load and avoid build errors
  mobileOptimizer = require("./ClippyMobileOptimizer").default;
} catch (e) {
  console.error("Error loading mobile optimizer:", e);
}

// Initialize mobile optimizations
if (typeof window !== "undefined" && mobileOptimizer) {
  // Ensure the mobile optimizations run
  setTimeout(() => {
    console.log("Initializing mobile optimizations from index.js");
    try {
      mobileOptimizer.optimizeClippyForMobile();
      mobileOptimizer.enforceClippyVisibility();
    } catch (e) {
      console.error("Error initializing mobile optimizations:", e);
    }
  }, 2000); // Give a small delay to ensure DOM is fully loaded
}

// Inject the emergency fix script directly into the page
// This ensures it runs as early as possible, even before React is initialized
if (typeof document !== "undefined") {
  const injectEmergencyScript = () => {
    try {
      // Add a script tag with our emergency function
      const script = document.createElement("script");
      script.textContent = `
        // EMERGENCY CLIPPY DESTROYER
        (function() {
          console.log("🚨 Installing emergency Clippy destroyer");
          
          window.DESTROY_CLIPPY = function() {
            console.log("🔥 EMERGENCY CLIPPY DESTRUCTION INITIATED 🔥");
            
            // Find and hide all possible clippy elements
            ["clippy", "agent", "clippy-agent", "clippy-clickable-overlay"]
              .forEach(selector => {
                const elements = document.querySelectorAll("." + selector + ", #" + selector);
                elements.forEach(el => {
                  if (el) {
                    // Hide instead of remove to prevent React errors
                    el.style.display = "none";
                    el.style.visibility = "hidden";
                    el.style.opacity = "0";
                  }
                });
              });
            
            // Set a flag to prevent recreation
            window._clippy_destroyed = true;
            
            // Add style to ensure any remnants are hidden
            const style = document.createElement('style');
            style.textContent = ".clippy, #clippy-agent, .agent, #clippy-clickable-overlay { display: none !important; }";
            document.head.appendChild(style);
            
            console.log("🔥 Clippy has been hidden 🔥");
          };
          
          // Add a global keyboard shortcut for emergency situations
          document.addEventListener('keydown', function(e) {
            // Alt+Shift+C to destroy Clippy
            if (e.altKey && e.shiftKey && e.code === 'KeyC') {
              window.DESTROY_CLIPPY();
            }
          });
          
          console.log("🚨 Emergency Clippy destroyer installed - press Alt+Shift+C to use");
        })();
      `;
      document.head.appendChild(script);
      console.log("Emergency Clippy destroyer script injected");
    } catch (e) {
      console.error("Failed to inject emergency script:", e);
    }
  };

  // Run immediately if document is ready, or wait for DOM content loaded
  if (document.readyState !== "loading") {
    injectEmergencyScript();
  } else {
    document.addEventListener("DOMContentLoaded", injectEmergencyScript);
  }
}

// Patch setAssistantVisible function as early as possible
if (typeof window !== "undefined") {
  // Store the original function safely
  if (!window._originalSetAssistantVisible && window.setAssistantVisible) {
    window._originalSetAssistantVisible = window.setAssistantVisible;
  }

  window.setAssistantVisible = function (visible) {
    console.log(`setAssistantVisible called with: ${visible}`);

    // If hiding, use gentler methods
    if (visible === false) {
      try {
        // Call original if it exists
        if (window._originalSetAssistantVisible) {
          window._originalSetAssistantVisible(false);
        }

        // Use gentler DESTROY_CLIPPY that hides rather than removes
        if (window.DESTROY_CLIPPY) {
          window.DESTROY_CLIPPY();
        }

        return false;
      } catch (e) {
        console.error("Error in enhanced setAssistantVisible:", e);
      }
    }

    // For showing, just use original
    if (window._originalSetAssistantVisible) {
      return window._originalSetAssistantVisible(visible);
    }

    return visible;
  };

  console.log("setAssistantVisible patched at index.js level");
}
