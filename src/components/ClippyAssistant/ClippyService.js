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
const play = (animation) => {
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

  // Apply temporary animation fix
  const fixStyle = document.createElement("style");
  fixStyle.id = "clippy-anim-fix-temp";
  fixStyle.textContent = `
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
  
      /* Animation fixes from ClippyTS */
      .clippy .maps {
        position: relative !important;
        width: 100% !important;
        height: 100% !important;
      }
  
      .clippy .map {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        height: 100% !important;
        width: 100% !important;
        display: none !important;
      }
  
      .clippy .map.animate {
        display: block !important;
      }
    `;
  document.head.appendChild(fixStyle);

  // Play animation with small delay
  setTimeout(() => {
    executeIfAvailable(() => window.clippy.play(animation));
  }, 50);

  // Remove the style after animation
  setTimeout(() => {
    if (fixStyle.parentNode) {
      fixStyle.parentNode.removeChild(fixStyle);
    }
  }, 3000);

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
            // Default to bottom right if we can't parse
            xPercent = 0.85;
            yPercent = 0.85;
        }
      }

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

// Export the service
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
};

export default ClippyService;
