/**
 * ClippyService.js - Utility service for working with the Office Assistant
 *
 * This service uses the window.clippy global instance set by the ClippyProvider
 */

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
  calc: {
    text: "Need help with calculations?",
    animation: "Thinking",
  },
  cmd: {
    text: "Working with the command prompt? Try typing 'help' to see available commands.",
    animation: "Explain",
  },
  default: {
    text: "Need help with Windows 98?",
    animation: "Greeting",
  },
};

/**
 * Check if Clippy is available
 */
const isAvailable = () => {
  return typeof window !== "undefined" && window.clippy !== undefined;
};

/**
 * Show Clippy
 */
const show = () => {
  if (isAvailable() && window.setAssistantVisible) {
    window.setAssistantVisible(true);
    return true;
  }
  return false;
};

/**
 * Hide Clippy
 */
const hide = () => {
  if (isAvailable() && window.setAssistantVisible) {
    window.setAssistantVisible(false);
    return true;
  }
  return false;
};

/**
 * Make Clippy speak
 * @param {string} text - The text for Clippy to speak
 */
const speak = (text) => {
  if (isAvailable() && window.clippy.speak) {
    try {
      window.clippy.speak(text);
      return true;
    } catch (e) {
      console.error("Error making Clippy speak:", e);
    }
  }
  return false;
};

/**
 * Play an animation
 * @param {string} animation - The animation name
 */
const play = (animation) => {
  if (isAvailable() && window.clippy.play) {
    try {
      window.clippy.play(animation);
      return true;
    } catch (e) {
      console.error(`Error playing Clippy animation "${animation}":`, e);
    }
  }
  return false;
};

/**
 * Change the agent
 * @param {string} agent - The agent name (Clippy, Merlin, etc.)
 */
const changeAgent = (agent) => {
  if (isAvailable() && window.setCurrentAgent) {
    window.setCurrentAgent(agent);
    return true;
  }
  return false;
};

/**
 * Set the position of Clippy
 * @param {number} x - X position (right distance in pixels)
 * @param {number} y - Y position (bottom distance in pixels)
 */
const setPosition = (x, y) => {
  if (typeof window !== "undefined" && window.setClippyPosition) {
    window.setClippyPosition({ x, y });

    // Also try to directly position any existing clippy elements
    try {
      const agentElements = document.querySelectorAll(".clippy");
      if (agentElements.length > 0) {
        const agentElement = agentElements[0];

        // Position the agent
        agentElement.style.position = "fixed";
        agentElement.style.bottom = y + "px";
        agentElement.style.right = x + "px";
        agentElement.style.top = "auto";
        agentElement.style.left = "auto";
      }
    } catch (e) {
      console.error("Error positioning Clippy:", e);
    }

    return true;
  }
  return false;
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
  if (isAvailable()) {
    // Show Clippy
    show();

    // Get help message
    const help = getHelpForWindow(windowTitle);

    // Display help
    setTimeout(() => {
      speak(help.text);
      play(help.animation);
    }, 300);

    return true;
  }
  return false;
};

/**
 * Handle window help button click
 *
 * This should be called from the CustomWindow component:
 *
 * handleHelpClick = () => {
 *   ClippyService.handleWindowHelp(this.props.title);
 *   if (this.props.onHelp) {
 *     this.props.onHelp();
 *   }
 * }
 */
const handleWindowHelp = (windowTitle) => {
  return showHelpForWindow(windowTitle);
};

// Export the service
const ClippyService = {
  isAvailable,
  show,
  hide,
  speak,
  play,
  changeAgent,
  setPosition,
  getHelpForWindow,
  showHelpForWindow,
  handleWindowHelp,
};

export default ClippyService;
