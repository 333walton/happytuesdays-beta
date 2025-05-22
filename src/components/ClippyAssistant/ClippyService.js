// Help messages for different windows
const helpMessages = {
  notepad: {
    text: "It looks like you're writing a document! Need help with that?",
    animation: "Writing",
  },
  paint: {
    text: "Want to learn how to draw something cool?",
    animation: "GetAttention",
  },
  explorer: {
    text: "Looking for files? I can help you organize them!",
    animation: "Searching",
  },
  minesweeper: {
    text: "Looking for mines? Remember to check the numbers carefully!",
    animation: "Alert",
  },
  calc: { text: "Need help with calculations?", animation: "Thinking" },
  cmd: {
    text: "Working with the command prompt? Try typing 'help' to see available commands.",
    animation: "Explain",
  },
  default: { text: "Need help?", animation: "Greeting" },
};

// Define the variables that were referenced but not defined
// These should match the ones in ClippyController.js and ClippyManager.js
let isAnimationPlaying = false;
let isPositioningLocked = false;

/**
 * Check if Clippy is available
 */
const isAvailable = () => {
  return typeof window !== "undefined" && window.clippy !== undefined;
};

/**
 * Execute a Clippy action if available
 * @param {Function} action - The action to perform
 * @returns {boolean} Whether the action was successful
 */
const executeIfAvailable = (action) => {
  if (!isAvailable()) return false;

  try {
    action();
    return true;
  } catch (e) {
    console.error("Error executing Clippy action:", e);
    return false;
  }
};

/**
 * Show Clippy
 */
const show = () => {
  return executeIfAvailable(() => window.setAssistantVisible(true));
};

/**
 * Hide Clippy
 */
const hide = () => {
  return executeIfAvailable(() => window.setAssistantVisible(false));
};

/**
 * Make Clippy speak using our custom balloon
 * @param {string} text - The text for Clippy to speak
 */
const speak = (text) => {
  // Force Clippy element to be visible first
  if (typeof window !== "undefined") {
    const clippyEl = document.querySelector(".clippy");
    if (clippyEl) {
      clippyEl.style.visibility = "visible";
      clippyEl.style.opacity = "1";
      clippyEl.style.display = "block";

      // Find and make visible any SVG elements
      const svgElements = clippyEl.querySelectorAll("svg");
      if (svgElements.length > 0) {
        svgElements.forEach((svg) => {
          svg.style.visibility = "visible";
          svg.style.opacity = "1";
          svg.style.display = "inline";

          // Make all SVG children visible too
          Array.from(svg.querySelectorAll("*")).forEach((el) => {
            el.style.visibility = "visible";
            el.style.opacity = "1";
            el.style.display = "inline";
          });
        });
      }
    }
  }

  // Try using the custom balloon first
  if (window.showClippyCustomBalloon) {
    return executeIfAvailable(() => window.showClippyCustomBalloon(text));
  }

  // Fall back to the default speak method if custom balloon isn't available
  return executeIfAvailable(() => window.clippy.speak(text));
};

/**
 * Show interactive chat balloon
 * @param {string} initialMessage - Initial message to show in the chat
 */
const showChat = (initialMessage = "How can I help you today?") => {
  // Force Clippy element to be visible first
  if (typeof window !== "undefined") {
    const clippyEl = document.querySelector(".clippy");
    if (clippyEl) {
      clippyEl.style.visibility = "visible";
      clippyEl.style.opacity = "1";
      clippyEl.style.display = "block";
    }
  }

  if (window.showClippyChatBalloon) {
    return executeIfAvailable(() =>
      window.showClippyChatBalloon(initialMessage)
    );
  }

  // Fall back to regular speech if chat isn't implemented
  return speak(initialMessage);
};

/**
 * Hide the custom balloon
 */
const hideBalloon = () => {
  if (window.hideClippyCustomBalloon) {
    return executeIfAvailable(() => window.hideClippyCustomBalloon());
  }

  // No equivalent in original clippy
  return true;
};

/**
 * Play an animation
 * @param {string} animation - The animation name
 */
// Replace the play function in ClippyService.js
const play = (animation) => {
  // If we're in emergency mode, don't allow animations
  if (window._clippyEmergencyReset) return false;

  // Force Clippy element to be visible first
  if (typeof window !== "undefined") {
    const clippyEl = document.querySelector(".clippy");
    if (clippyEl) {
      clippyEl.style.visibility = "visible";
      clippyEl.style.opacity = "1";
      clippyEl.style.display = "block";

      // Find and make visible any SVG elements
      const svgElements = clippyEl.querySelectorAll("svg");
      if (svgElements.length > 0) {
        svgElements.forEach((svg) => {
          svg.style.visibility = "visible";
          svg.style.opacity = "1";
          svg.style.display = "inline";
        });
      }
    }
  }

  // Temporarily unlock positioning to ensure animations work
  const wasPositionLocked = window._clippyPositionLocked;
  if (wasPositionLocked) {
    window._clippyPositionLocked = false;
  }

  // Play animation with small delay
  setTimeout(() => {
    executeIfAvailable(() => window.clippy.play(animation));

    // Re-lock position after a delay to let animation complete
    if (wasPositionLocked) {
      setTimeout(() => {
        window._clippyPositionLocked = true;
      }, 2000); // Allow 2 seconds for animation to complete
    }
  }, 50);

  return true;
};

/**
 * Change the agent
 * @param {string} agent - The agent name (Clippy, Merlin, etc.)
 */
const changeAgent = (agent) => {
  return executeIfAvailable(() => window.setCurrentAgent(agent));
};

/**
 * Set the position of Clippy
 * @param {number} x - X position within the viewport
 * @param {number} y - Y position within the viewport
 */
const setPosition = (x, y) => {
  return executeIfAvailable(() => window.setClippyPosition({ x, y }));
};

/**
 * Set the initial position of Clippy with a more intuitive approach
 * @param {Object} options - Position options
 * @param {string} options.position - Named position or percentages
 */
const setInitialPosition = (options) => {
  return executeIfAvailable(() => {
    // Check if we're dealing with a named position
    if (typeof options.position === "string") {
      // Convert named positions to percentages
      let xPercent, yPercent;

      // First, check if it's a percentage string like "80% 50%"
      const percentMatch = options.position.match(/(\d+)%\s+(\d+)%/);
      if (percentMatch) {
        xPercent = parseInt(percentMatch[1], 10) / 100;
        yPercent = parseInt(percentMatch[2], 10) / 100;
      } else {
        // Otherwise, check for named positions
        switch (options.position.toLowerCase()) {
          case "higher-right": // New position added
            xPercent = 0.85;
            yPercent = 0.65; // Higher than bottom-right
            break;
          case "bottom-right":
            xPercent = 0.85;
            yPercent = 0.85;
            break;
          case "bottom-left":
            xPercent = 0.15;
            yPercent = 0.85;
            break;
          case "top-right":
            xPercent = 0.85;
            yPercent = 0.15;
            break;
          case "top-left":
            xPercent = 0.15;
            yPercent = 0.15;
            break;
          case "center":
            xPercent = 0.5;
            yPercent = 0.5;
            break;
          default:
            // Modified default to use higher position
            xPercent = 0.85;
            yPercent = 0.65; // Changed from 0.85 to position higher
        }
      }

      // Check if we're on desktop and not on mobile
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      // Set the position using the window global
      if (window.setClippyInitialPosition) {
        window.setClippyInitialPosition({ xPercent, yPercent });
      } else if (window.setClippyPosition) {
        // Find the desktop element to calculate pixel positions
        const desktopElement = document.querySelector(".w98");
        if (desktopElement) {
          const desktopRect = desktopElement.getBoundingClientRect();
          window.setClippyPosition({
            x: desktopRect.width * xPercent,
            y: desktopRect.height * yPercent,
          });
        }
      }
    }
    // If it's already an object with x and y coordinates, use them directly
    else if (options.x !== undefined && options.y !== undefined) {
      window.setClippyPosition({ x: options.x, y: options.y });
    }
  });
};

/**
 * Get help for a specific window
 * @param {string} windowTitle - The title of the window
 */
const getHelpForWindow = (windowTitle) => {
  if (!windowTitle) return helpMessages.default;

  const title = windowTitle.toLowerCase();

  if (title.includes("notepad")) return helpMessages.notepad;
  if (title.includes("paint")) return helpMessages.paint;
  if (title.includes("explorer") || title.includes("file"))
    return helpMessages.explorer;
  if (title.includes("minesweeper")) return helpMessages.minesweeper;
  if (title.includes("calc")) return helpMessages.calc;
  if (
    title.includes("cmd") ||
    title.includes("command") ||
    title.includes("prompt")
  )
    return helpMessages.cmd;

  return helpMessages.default;
};

/**
 * Show help for a specific window
 * @param {string} windowTitle - The title of the window
 */
const showHelpForWindow = (windowTitle) => {
  if (!isAvailable()) return false;

  show();
  const help = getHelpForWindow(windowTitle);

  // Force Clippy element to be visible
  if (typeof window !== "undefined") {
    const clippyEl = document.querySelector(".clippy");
    if (clippyEl) {
      clippyEl.style.visibility = "visible";
      clippyEl.style.opacity = "1";
      clippyEl.style.display = "block";
    }
  }

  setTimeout(() => {
    play(help.animation);
    setTimeout(() => {
      speak(help.text);
    }, 800); // Larger delay to ensure animation starts first
  }, 300);

  return true;
};

/**
 * Debug clippy - logs status and checks for issues
 */
const debug = () => {
  console.log("Clippy Status:");
  console.log("- Available:", isAvailable());
  console.log("- Clippy instance:", window.clippy);

  // Check elements in DOM
  const clippyElement = document.querySelector(".clippy");
  console.log("- Clippy DOM element:", clippyElement);

  // Try to fetch clippy styles
  if (clippyElement) {
    const clippyStyles = window.getComputedStyle(clippyElement);
    console.log("- Clippy visibility:", {
      display: clippyStyles.display,
      visibility: clippyStyles.visibility,
      opacity: clippyStyles.opacity,
      zIndex: clippyStyles.zIndex,
      transform: clippyStyles.transform,
    });
  }

  // Test animation
  if (isAvailable()) {
    console.log("Testing animation...");
    play("Wave");

    setTimeout(() => {
      console.log("Testing speech...");
      speak("Clippy debug test is complete!");
    }, 1000);
  }

  // Add emergency animation fix
  if (window.fixClippyAnimations) {
    window.fixClippyAnimations();
  } else {
    console.log("Emergency animation fix not available");

    // Apply fix directly
    const styleEl = document.createElement("style");
    styleEl.id = "clippy-emergency-fix";
    styleEl.textContent = `
        .clippy * {
          visibility: visible !important;
          opacity: 1 !important;
          display: block !important;
        }
        
        .clippy-animate,
        .clippy-animate * {
          visibility: visible !important;
          opacity: 1 !important;
          display: block !important;
          animation: auto !important;
        }
        
        /* Ensure transform doesn't block animations */
        .clippy {
          transform: scale(0.9) !important;
          transform-origin: center bottom !important;
          pointer-events: none !important;
        }
        
        /* Ensure overlay works */
        #clippy-clickable-overlay {
          position: fixed !important;
          z-index: 2001 !important;
          cursor: pointer !important;
          pointer-events: auto !important;
          display: block !important;
          visibility: visible !important;
          background: transparent !important;
        }
      `;
    document.head.appendChild(styleEl);
    console.log("Emergency animation fix applied directly");
  }

  return "Clippy debug complete. Check console for details.";
};

/**
 * Emergency reset function to completely remove all Clippy instances and clean up
 */
const emergencyReset = () => {
  console.log("Emergency Clippy reset initiated");

  // Flag to track if we're in emergency mode
  window._clippyEmergencyReset = true;

  // Reset animation and positioning flags
  isAnimationPlaying = false;
  isPositioningLocked = false;

  // Stop all animation frames
  if (window._clippyAnimationFrames) {
    window._clippyAnimationFrames.forEach((id) => {
      cancelAnimationFrame(id);
    });
    window._clippyAnimationFrames = [];
  }

  // Reset all global flags
  delete window._clippyInstanceRunning;
  delete window._clippyInitializing;

  // Clear all timeouts and intervals
  const highestTimeoutId = setTimeout(() => {}, 0);
  for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i);
    clearInterval(i);
  }

  // Remove all Clippy-related DOM elements
  const clippyElements = document.querySelectorAll(".clippy");
  clippyElements.forEach((el) => {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });

  // Remove overlays
  const overlays = document.querySelectorAll("#clippy-clickable-overlay");
  overlays.forEach((el) => {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });

  // Remove balloons
  const balloons = document.querySelectorAll(
    ".clippy-balloon, .custom-clippy-balloon, .custom-clippy-chat-balloon"
  );
  balloons.forEach((el) => {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });

  // Remove any Clippy-related styles
  const styles = document.querySelectorAll('style[id^="clippy-"]');
  styles.forEach((el) => {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });

  // Reset all Clippy-related globals
  window.clippy = null;
  window.setAssistantVisible = null;
  window.setCurrentAgent = null;
  window.setClippyPosition = null;
  window.setClippyInitialPosition = null;
  window.getClippyInstance = null;
  window.showClippyCustomBalloon = null;
  window.hideClippyCustomBalloon = null;
  window.showClippyChatBalloon = null;

  // Clear the emergency flag after 3 seconds
  setTimeout(() => {
    delete window._clippyEmergencyReset;
  }, 3000);

  return "Clippy emergency reset complete. Refresh the page to restart with a clean slate.";
};

/**
 * More aggressive kill switch for unresponsive situations
 */
const killClippy = () => {
  try {
    // Immediately remove all Clippy elements from DOM
    const elements = document.querySelectorAll(
      ".clippy, #clippy-clickable-overlay, .clippy-balloon, .custom-clippy-balloon, .custom-clippy-chat-balloon"
    );
    elements.forEach((el) => el.parentNode && el.parentNode.removeChild(el));

    // Remove all Clippy styles
    const styles = document.querySelectorAll('style[id^="clippy-"]');
    styles.forEach((el) => el.parentNode && el.parentNode.removeChild(el));

    // Nullify all Clippy-related globals
    for (const key in window) {
      if (key.toLowerCase().includes("clippy")) {
        window[key] = null;
      }
    }

    return "Clippy killed. Refresh the page to start over.";
  } catch (e) {
    console.error("Error during emergency kill:", e);
    return "Error killing Clippy. Try refreshing the page.";
  }
};

// Expose these globally
if (typeof window !== "undefined") {
  window.resetClippy = emergencyReset;
  window.killClippy = killClippy;
}

// Export the updated service
const ClippyService = {
  isAvailable,
  show,
  hide,
  speak,
  showChat,
  hideBalloon,
  play,
  changeAgent,
  setPosition,
  setInitialPosition,
  getHelpForWindow,
  showHelpForWindow,
  handleWindowHelp: showHelpForWindow, // Alias for backward compatibility
  debug,
  emergencyReset,
  killClippy,
};

// Expose service to window for external access
if (typeof window !== "undefined") {
  window.ClippyService = ClippyService;
}

export default ClippyService;
