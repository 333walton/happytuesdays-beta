/**
 * ClippyDestroyAll.js
 *
 * EMERGENCY NUCLEAR OPTION
 *
 * This file provides a function that can be called directly from the console
 * to completely and permanently remove all Clippy instances from the DOM.
 *
 * Usage: executeClippyNuclearOption()
 */

// Global flag to track if we've already initialized the toggle button
let toggleButtonInitialized = false;

// This function will be exposed to the window object for direct execution
window.executeClippyNuclearOption = function () {
  console.log("🔥🔥🔥 EXECUTING EMERGENCY CLIPPY REMOVAL 🔥🔥🔥");

  try {
    // Force all React components to update their state - but avoid using destroy
    if (window.setAssistantVisible) {
      console.log("Using setAssistantVisible to hide Clippy");
      window.setAssistantVisible(false);
    }

    // Direct DOM manipulation to hide ONLY clippy-related elements (not remove)
    const hideElements = (selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        console.log(`Found ${elements.length} elements matching: ${selector}`);
        elements.forEach((el) => {
          if (el) {
            console.log(`Hiding element: ${selector}`);
            // Hide instead of remove to prevent unmount errors
            el.style.display = "none";
            el.style.visibility = "hidden";
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
          }
        });
      } catch (e) {
        console.error(`Error hiding ${selector}:`, e);
      }
    };

    // ONLY hide Clippy-specific elements
    hideElements(".clippy"); // The main Clippy element
    hideElements("#clippy-agent"); // Possible agent container
    hideElements("#clippy-clickable-overlay"); // The overlay for interactions
    hideElements(".clippy-balloon"); // Official balloon
    hideElements(".custom-clippy-balloon"); // Our custom balloon
    hideElements(".custom-clippy-chat-balloon"); // Our custom chat balloon

    // More targeted selectors for Clippy-specific elements only
    hideElements('[id^="clippy-"]'); // IDs that start with clippy-
    hideElements('[class^="clippy-"]'); // Classes that start with clippy-

    // Find and hide clippy context menus if any
    const menus = document.querySelectorAll('div[style*="z-index: 999999"]');
    menus.forEach((menu) => {
      // Only hide if it's likely a clippy menu (check for text content)
      if (
        menu.textContent.includes("Hide Assistant") ||
        menu.textContent.includes("NUCLEAR Hide")
      ) {
        // Hide instead of remove
        menu.style.display = "none";
        menu.style.visibility = "hidden";
        menu.style.opacity = "0";
      }
    });

    // IMPORTANT: Fix the monitor power button errors by defining a safe global function
    // This completely avoids any "destroy is not a function" errors
    window.ReactCommitUnmount = function () {
      console.log("Safe ReactCommitUnmount called");
      return true; // Always return success
    };

    // Define safelyCallDestroy to avoid errors
    window.safelyCallDestroy = function () {
      console.log("Safe safelyCallDestroy called");
      return true; // Always return success
    };

    // Create a stub for destroy to prevent the error
    if (typeof window.destroy === "undefined") {
      window.destroy = function () {
        console.log("Safe destroy stub called");
        return true;
      };
    }

    // IMPORTANT: Preserve monitor functionality
    // Make sure we don't interfere with MonitorView's black overlay
    // Update the setScreenPowerState function to work with our changes
    if (window.setScreenPowerState) {
      // Store original only if we haven't already replaced it
      if (!window._originalSetScreenPowerState) {
        window._originalSetScreenPowerState = window.setScreenPowerState;
      }

      window.setScreenPowerState = function (isPoweredOn) {
        console.log("Safe setScreenPowerState called:", isPoweredOn);

        try {
          // Call original with try/catch to prevent any errors
          if (window._originalSetScreenPowerState) {
            window._originalSetScreenPowerState(isPoweredOn);
          }
        } catch (e) {
          console.error("Error in original setScreenPowerState:", e);
        }

        // Ensure the black overlay is working properly
        try {
          const blackOverlay = document.querySelector(".black-overlay");
          if (blackOverlay) {
            if (!isPoweredOn) {
              // Screen is off
              blackOverlay.style.opacity = "1";
              blackOverlay.style.visibility = "visible";
            } else {
              // Screen is on
              blackOverlay.style.opacity = "0";
              blackOverlay.style.visibility = "hidden";
            }
          }
        } catch (e) {
          console.error("Error updating black overlay:", e);
        }

        return true; // Always return success
      };
    }

    // Add a TARGETED style that ONLY hides Clippy elements
    const nukeStyle = document.createElement("style");
    nukeStyle.id = "clippy-targeted-hide";
    nukeStyle.innerHTML = `
      /* Hide only specific clippy elements */
      .clippy, 
      #clippy-agent,
      #clippy-clickable-overlay,
      .clippy-balloon, 
      .custom-clippy-balloon, 
      .custom-clippy-chat-balloon,
      [id^="clippy-"],
      [class^="clippy-"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(nukeStyle);

    // Reset Clippy-specific global state
    if (window.ClippyService && window.ClippyService.emergencyReset) {
      window.ClippyService.emergencyReset();
    }

    // Null out (but don't delete) Clippy-related global variables
    const nullGlobals = [
      "clippy",
      "setAssistantVisible",
      "setCurrentAgent",
      "ClippyManager",
      "setClippyPosition",
    ];

    nullGlobals.forEach((name) => {
      if (window[name]) {
        console.log(`Nullifying global: ${name}`);
        window[name] = function () {
          console.log(`Disabled ${name} called`);
          return null;
        };
      }
    });

    console.log("🔥🔥🔥 CLIPPY REMOVAL COMPLETE 🔥🔥🔥");

    // Update the toggle button state if it exists
    updateToggleButtonState(false);

    return "Clippy has been hidden. Other UI elements should remain intact.";
  } catch (e) {
    console.error("Error during clippy removal:", e);
    return "Error during removal: " + e.message;
  }
};

// Function to update toggle button state
function updateToggleButtonState(isVisible) {
  const button = document.getElementById("clippy-toggle-button");
  if (button) {
    if (isVisible) {
      button.innerText = "ON";
      button.style.background = "#c0c0c8";
      button.style.borderColor = "#ffffff #808080 #808080 #ffffff";
    } else {
      button.innerText = "OFF";
      button.style.background = "#c0c0c8";
      button.style.borderColor = "#808080 #ffffff #ffffff #808080";
    }
  }
}

// Add lock button to the DOM to lock/unlock Clippy position
function addWindowsStyleLockButton() {
  // Remove any existing lock button first
  const existingLockButton = document.getElementById("clippy-lock-button");
  if (existingLockButton && existingLockButton.parentNode) {
    existingLockButton.parentNode.removeChild(existingLockButton);
  }

  // Create lock button
  const lockButton = document.createElement("button");
  lockButton.id = "clippy-lock-button";
  lockButton.innerText = "🔒"; // Default to locked

  // Load saved state from localStorage
  try {
    const isLocked = localStorage.getItem("clippy_position_locked") !== "false";
    lockButton.innerText = isLocked ? "🔒" : "🔓";
    window._clippyPositionLocked = isLocked;
  } catch (e) {
    console.error("Error reading lock state from localStorage:", e);
    window._clippyPositionLocked = true; // Default to locked
  }

  // Style the button like a Windows 98 button but smaller
  lockButton.style.position = "fixed";
  lockButton.style.right = "190px !important"; // Position much further to the left of the toggle button
  lockButton.style.top = "40px"; // Same top position as toggle button
  lockButton.style.zIndex = "9999999"; // Same z-index as toggle button
  lockButton.style.background = "#c0c0c8"; // Windows 98 gray
  lockButton.style.color = "#000000"; // Black text
  lockButton.style.padding = "4.3px 8px";
  lockButton.style.border = "2px solid";
  lockButton.style.borderColor = "#ffffff #808080 #808080 #ffffff"; // 3D effect
  lockButton.style.borderRadius = "0px"; // Square corners
  lockButton.style.fontFamily = "'MS Sans Serif', Arial, sans-serif";
  lockButton.style.fontSize = "11px";
  lockButton.style.fontWeight = "normal";
  lockButton.style.cursor = "pointer";
  lockButton.style.boxShadow = "none";
  lockButton.style.textTransform = "none";
  lockButton.style.minWidth = "40px"; // Smaller width than toggle button
  lockButton.style.maxWidth = "40px";
  lockButton.style.textAlign = "center";
  lockButton.style.outline = "none";
  lockButton.style.userSelect = "none";
  lockButton.style.transform = "none"; // Clear any transforms

  // Toggle function for lock button
  lockButton.onclick = function () {
    // Toggle locked state
    const isLocked = (window._clippyPositionLocked =
      !window._clippyPositionLocked);

    // Update button appearance
    lockButton.innerText = isLocked ? "🔒" : "🔓";

    // When pressing the button, show the pressed state
    lockButton.style.borderColor = "#808080 #ffffff #ffffff #808080";

    // Save state to localStorage
    try {
      localStorage.setItem("clippy_position_locked", isLocked.toString());
    } catch (e) {
      console.error("Error storing lock state in localStorage:", e);
    }

    // After a brief delay, restore the normal border style
    setTimeout(() => {
      if (isLocked) {
        lockButton.style.borderColor = "#ffffff #808080 #808080 #ffffff";
      } else {
        lockButton.style.borderColor = "#808080 #ffffff #ffffff #808080";
      }
    }, 100);
  };

  // Mouse down effect (pressed button)
  lockButton.addEventListener("mousedown", function () {
    lockButton.style.borderColor = "#808080 #ffffff #ffffff #808080";
  });

  // Mouse up effect (released button)
  lockButton.addEventListener("mouseup", function () {
    if (window._clippyPositionLocked) {
      lockButton.style.borderColor = "#ffffff #808080 #808080 #ffffff";
    } else {
      lockButton.style.borderColor = "#808080 #ffffff #ffffff #808080";
    }
  });

  // Position the button
  function positionLockButton() {
    const monitorScreen = document.querySelector(".monitor-screen");
    if (monitorScreen) {
      const rect = monitorScreen.getBoundingClientRect();
      if (rect.width > 0) {
        // Check if we're on a mobile device
        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );

        if (isMobile) {
          // For mobile, position near the bottom of the screen
          const taskbar = document.querySelector(".taskbar");
          const taskbarHeight = taskbar ? taskbar.offsetHeight : 30;

          // Set position from bottom based on device
          if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            lockButton.style.bottom = "65px"; // Higher up for iOS
          } else {
            lockButton.style.bottom = `${taskbarHeight + 10}px`; // Just above taskbar
          }
          lockButton.style.right = "225px";
          lockButton.style.top = "auto"; // Clear top positioning
        } else {
          // For desktop, position in the upper right of the monitor screen
          lockButton.style.top = rect.top + 20 + "px";
          lockButton.style.right = window.innerWidth - rect.right + 70 + "px";
          lockButton.style.bottom = "auto"; // Clear bottom positioning
        }
      }
    }
  }

  // Try to position initially
  setTimeout(positionLockButton, 500);
  // Try again a bit later to ensure monitor is fully rendered
  setTimeout(positionLockButton, 1500);

  // Update position on resize
  window.addEventListener("resize", positionLockButton);

  // Add the button to the document
  document.body.appendChild(lockButton);
  console.log("Windows-style lock button added");

  return lockButton;
}

// Add a toggle button to the DOM for clippy visibility
function addWindowsStyleToggleButton() {
  // Only add once
  if (toggleButtonInitialized) return;
  toggleButtonInitialized = true;

  // Remove any existing button first
  const existingButton = document.getElementById("clippy-toggle-button");
  if (existingButton && existingButton.parentNode) {
    existingButton.parentNode.removeChild(existingButton);
  }

  // Add the lock button first
  const lockButton = addWindowsStyleLockButton();

  // Create toggle button
  const button = document.createElement("button");
  button.id = "clippy-toggle-button";
  button.innerText = "ON";

  // Style the button like a Windows 98 button
  button.style.position = "fixed";
  button.style.right = "20px"; // Position on right side of viewport
  button.style.top = "40px"; // Position at top of viewport
  button.style.zIndex = "9999999"; // Extremely high z-index to ensure visibility
  button.style.background = "#c0c0c8"; // Windows 98 gray
  button.style.color = "#000000"; // Black text
  button.style.padding = "3px 8px";
  button.style.border = "2px solid";
  button.style.borderColor = "#ffffff #808080 #808080 #ffffff"; // 3D effect
  button.style.borderRadius = "0px"; // Square corners
  button.style.fontFamily = "'MS Sans Serif', Arial, sans-serif";
  button.style.fontSize = "11px";
  button.style.fontWeight = "normal";
  button.style.cursor = "pointer";
  button.style.boxShadow = "none";
  button.style.textTransform = "none";
  button.style.minWidth = "40px";
  button.style.maxWidth = "60px";
  button.style.textAlign = "center";
  button.style.outline = "none";
  button.style.userSelect = "none";
  button.style.transform = "none"; // Clear any transforms

  // Check if we're on a mobile device
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Add specific iOS Safari fixes
  if (isMobile) {
    button.style.WebkitAppearance = "none"; // Remove iOS default styling
    button.style.color = "#000000 !important"; // Force black text
    button.style.fontWeight = "bold"; // Make text more visible

    // iOS Safari often has issues with fixed positioning
    button.style.position = "absolute";

    // Position buttons side by side below the clock with a 20px gap
    const clockElement = document.querySelector(
      ".clock-display, .taskbar-time, .time-display"
    );

    // Make both buttons the same size (40px width)
    button.style.minWidth = "40px";
    button.style.maxWidth = "40px";
    button.style.width = "40px";

    if (lockButton) {
      lockButton.style.minWidth = "40px";
      lockButton.style.maxWidth = "40px";
      lockButton.style.width = "40px";
    }

    if (clockElement) {
      // If we find a clock element, position relative to it
      const clockRect = clockElement.getBoundingClientRect();

      // Get taskbar height to position buttons properly
      const taskbar = document.querySelector(".taskbar");
      const taskbarHeight = taskbar ? taskbar.offsetHeight : 30;

      // Position the ON/OFF button (rightmost)
      button.style.position = "absolute";
      button.style.top = "auto";
      button.style.bottom = `${taskbarHeight + 10}px`; // 10px above taskbar
      button.style.right = "20px";

      // Position lock button (to the left of ON/OFF with 5px gap)
      if (lockButton) {
        lockButton.style.position = "absolute";
        lockButton.style.top = "auto";
        lockButton.style.bottom = `${taskbarHeight + 1}px`; // Same bottom position as toggle button
        lockButton.style.right = "65px"; // 5px gap + 40px button width
      }
    } else {
      // Fallback if no clock found
      button.style.position = "absolute";
      button.style.top = "auto";
      button.style.bottom = "40px"; // 40px gap (20px up from before)
      button.style.right = "20px";

      if (lockButton) {
        lockButton.style.position = "absolute";
        lockButton.style.top = "auto";
        lockButton.style.bottom = "40px";
        lockButton.style.right = "65px"; // 5px gap + 40px width
      }
    }

    // Specific iOS tweaks
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      button.style.bottom = "115px"; // Higher up from bottom to avoid iOS UI
      if (lockButton) {
        lockButton.style.bottom = "115px";
      }
    }
  }

  // Track toggle state - detect if Clippy is currently visible
  let isClippyVisible = document.querySelector(".clippy") !== null;

  // Initial state
  updateToggleButtonState(isClippyVisible);

  // Toggle function - use closure to capture isMobile
  button.onclick = function () {
    // Get current visibility state by checking DOM
    isClippyVisible = document.querySelector(".clippy") !== null;

    // Toggle the state based on current visibility
    if (isClippyVisible) {
      // If Clippy is currently visible, turn it OFF
      console.log("Turning Clippy OFF");

      // Toggle button appearance
      updateToggleButtonState(false);

      // When pressing the button, show the pressed state
      button.style.borderColor = "#808080 #ffffff #ffffff #808080";

      // Execute the nuclear option to hide clippy
      window.executeClippyNuclearOption();

      // Store state in localStorage for persistence
      try {
        localStorage.setItem("clippy_enabled", "false");
      } catch (e) {
        console.error("Error storing in localStorage:", e);
      }
    } else {
      // If Clippy is currently hidden, turn it ON
      console.log("Turning Clippy ON");

      // Toggle button appearance
      updateToggleButtonState(true);

      // When pressing the button, show the pressed state
      button.style.borderColor = "#ffffff #808080 #808080 #ffffff";

      // Alert user that a refresh is needed
      alert("Clippy will be restored when you refresh the page.");

      // Store state in localStorage for persistence
      try {
        localStorage.setItem("clippy_enabled", "true");
      } catch (e) {
        console.error("Error storing in localStorage:", e);
      }
    }
  };

  // Mouse down effect (pressed button)
  button.addEventListener("mousedown", function () {
    button.style.borderColor = "#808080 #ffffff #ffffff #808080";
  });

  // Mouse up effect (released button)
  button.addEventListener("mouseup", function () {
    if (document.querySelector(".clippy") !== null) {
      button.style.borderColor = "#ffffff #808080 #808080 #ffffff";
    } else {
      button.style.borderColor = "#808080 #ffffff #ffffff #808080";
    }
  });

  // Check initial state from localStorage
  try {
    const savedState = localStorage.getItem("clippy_enabled");
    if (savedState === "false") {
      // Start with Clippy disabled
      console.log("Starting with Clippy OFF based on localStorage");
      isClippyVisible = false;
      updateToggleButtonState(false);

      // Hide Clippy immediately with a delay to ensure it's loaded first
      setTimeout(() => {
        if (document.querySelector(".clippy") !== null) {
          console.log("Hiding Clippy on init");
          window.executeClippyNuclearOption();
        }
      }, 1000);
    }
  } catch (e) {
    console.error("Error reading localStorage:", e);
  }

  // Position the button inside the teal area
  function positionButtonInViewport() {
    const monitorScreen = document.querySelector(".monitor-screen");
    if (monitorScreen) {
      const rect = monitorScreen.getBoundingClientRect();
      if (rect.width > 0) {
        // Position in the upper right of the monitor screen
        button.style.top = rect.top + 20 + "px";
        button.style.right = window.innerWidth - rect.right + 20 + "px";
      }
    }
  }

  // Try to position initially
  setTimeout(positionButtonInViewport, 500);
  // Try again a bit later to ensure monitor is fully rendered
  setTimeout(positionButtonInViewport, 1500);

  // Update position on resize
  window.addEventListener("resize", positionButtonInViewport);

  // Add the button to the document
  document.body.appendChild(button);
  console.log("Windows-style toggle button added");
}

// Execute this function immediately
(function () {
  console.log("Loading ClippyDestroyAll.js");

  // Add the windows-style toggle button
  if (document.body) {
    addWindowsStyleToggleButton();
  } else {
    // Wait for body to be available
    document.addEventListener("DOMContentLoaded", addWindowsStyleToggleButton);
  }

  // Also directly update window.setAssistantVisible if it exists
  if (window.setAssistantVisible) {
    console.log("Patching window.setAssistantVisible directly");

    const originalSetVisible = window.setAssistantVisible;
    window.setAssistantVisible = function (visible) {
      // Update toggle button first
      updateToggleButtonState(visible);

      // Call original with try/catch to prevent errors
      let result;
      try {
        result = originalSetVisible(visible);
      } catch (e) {
        console.error("Error in original setAssistantVisible:", e);
      }

      // If hiding, ensure Clippy is really hidden
      if (visible === false) {
        console.log("Enhanced hide triggered from setAssistantVisible");

        // DOM manipulation to ensure Clippy is hidden
        const clippyEl = document.querySelector(".clippy");
        if (clippyEl) {
          clippyEl.style.visibility = "hidden";
          clippyEl.style.opacity = "0";
          clippyEl.style.display = "none";
        }

        // Hide overlay
        const overlay = document.getElementById("clippy-clickable-overlay");
        if (overlay) {
          overlay.style.visibility = "hidden";
          overlay.style.opacity = "0";
          overlay.style.pointerEvents = "none";
        }
      }

      return result;
    };
  }

  // Make sure the button is added when DOM is ready and after window load
  window.addEventListener("load", function () {
    // Add button immediately
    addWindowsStyleToggleButton();

    // And try again after a short delay to ensure it's positioned correctly
    setTimeout(addWindowsStyleToggleButton, 500);
    setTimeout(addWindowsStyleToggleButton, 1500);

    // Set an interval to ensure the button always exists
    setInterval(function () {
      const button = document.getElementById("clippy-toggle-button");
      if (!button) {
        console.log("Toggle button disappeared, re-adding it");
        addWindowsStyleToggleButton();
      }
    }, 2000);
  });
})();
