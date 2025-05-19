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
  default: { text: "Need help with Windows 98?", animation: "Greeting" },
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
  return executeIfAvailable(() => window.clippy.play(animation));
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
 * This is a convenience method that delegates to the ClippyProvider's implementation
 * which handles actual positioning, bounds checking, and display updates.
 *
 * @param {number} x - X position within the viewport
 * @param {number} y - Y position within the viewport
 */
const setPosition = (x, y) => {
  return executeIfAvailable(() => window.setClippyPosition({ x, y }));
};

/**
 * Set the initial position of Clippy with a more intuitive approach
 * @param {Object} options - Position options
 * @param {string} options.position - Named position: 'bottom-right', 'top-right', 'center', etc.
 *                                    Or percentages: '80% 50%' (80% from left, 50% from top)
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

      // Calculate the desktop dimensions for percentage calculations
      const desktopElement = document.querySelector(".w98");
      const desktopHeight = desktopElement
        ? desktopElement.getBoundingClientRect().height
        : window.innerHeight;

      // Apply 40px offset downward
      const extraYOffset = 40 / desktopHeight;
      yPercent += extraYOffset;

      // Cap at 95% to ensure it doesn't go off-screen
      yPercent = Math.min(yPercent, 0.95);

      // Set the position using the window global
      if (window.setClippyInitialPosition) {
        window.setClippyInitialPosition({ xPercent, yPercent });
      } else if (window.setClippyPosition) {
        // Find the desktop element to calculate pixel positions
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

  setTimeout(() => {
    play(help.animation);
    setTimeout(() => {
      speak(help.text);
    }, 200); // Small delay to ensure animation starts first
  }, 300);

  return true;
};

/**
 * Debug clippy - logs status and checks for issues
 * Useful for troubleshooting in the browser console
 */
const debug = () => {
  console.log("Clippy Status:");
  console.log("- Available:", isAvailable());
  console.log("- Clippy instance:", window.clippy);
  console.log("- Custom balloon functions:", {
    showCustomBalloon: !!window.showClippyCustomBalloon,
    hideCustomBalloon: !!window.hideClippyCustomBalloon,
    showChatBalloon: !!window.showClippyChatBalloon,
  });

  // Check elements in DOM
  const clippyElement = document.querySelector(".clippy");
  console.log("- Clippy DOM element:", clippyElement);

  const balloonElement = document.querySelector(".clippy-balloon");
  console.log("- Default balloon DOM element:", balloonElement);

  const customBalloonElement = document.querySelector(".custom-clippy-balloon");
  console.log("- Custom balloon DOM element:", customBalloonElement);

  // Try to fetch clippy styles
  const clippyStyles = window.getComputedStyle(clippyElement || document.body);
  console.log(
    "- Clippy visibility:",
    clippyElement
      ? {
          display: clippyStyles.display,
          visibility: clippyStyles.visibility,
          opacity: clippyStyles.opacity,
          zIndex: clippyStyles.zIndex,
          transform: clippyStyles.transform,
        }
      : "N/A"
  );

  // Test balloon
  if (isAvailable() && window.showClippyCustomBalloon) {
    window.showClippyCustomBalloon("Testing balloon visibility");
    console.log("- Test balloon triggered");
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
  debug, // Add debug function
};

export default ClippyService;
