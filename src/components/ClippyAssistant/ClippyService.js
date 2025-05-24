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

const isAvailable = () => {
  return typeof window !== "undefined" && window.clippy !== undefined;
};

const executeIfAvailable = (action) => {
  if (!isAvailable()) {
    console.warn("Clippy not available");
    return false;
  }

  try {
    return action();
  } catch (e) {
    console.error("Error executing Clippy action:", e);
    return false;
  }
};

const show = () => {
  return executeIfAvailable(() => {
    if (window.setAssistantVisible) {
      window.setAssistantVisible(true);
      return true;
    }
    return false;
  });
};

const hide = () => {
  return executeIfAvailable(() => {
    if (window.setAssistantVisible) {
      window.setAssistantVisible(false);
      return true;
    }
    return false;
  });
};

const speak = (text) => {
  return executeIfAvailable(() => {
    const clippyEl = document.querySelector(".clippy");
    if (clippyEl) {
      clippyEl.style.visibility = "visible";
      clippyEl.style.opacity = "1";
      clippyEl.style.display = "block";
    }

    if (window.showClippyCustomBalloon) {
      return window.showClippyCustomBalloon(text);
    } else if (window.clippy && window.clippy.speak) {
      return window.clippy.speak(text);
    }
    return false;
  });
};

const showChat = (initialMessage = "How can I help you today?") => {
  return executeIfAvailable(() => {
    const clippyEl = document.querySelector(".clippy");
    if (clippyEl) {
      clippyEl.style.visibility = "visible";
      clippyEl.style.opacity = "1";
      clippyEl.style.display = "block";
    }

    if (window.showClippyChatBalloon) {
      return window.showClippyChatBalloon(initialMessage);
    }
    return speak(initialMessage);
  });
};

const hideBalloon = () => {
  if (window.hideClippyCustomBalloon) {
    return window.hideClippyCustomBalloon();
  }
  return true;
};

const play = (animation) => {
  return executeIfAvailable(() => {
    const clippyEl = document.querySelector(".clippy");
    if (clippyEl) {
      clippyEl.style.visibility = "visible";
      clippyEl.style.opacity = "1";
      clippyEl.style.display = "block";
    }

    if (window.clippy && window.clippy.play) {
      try {
        window.clippy.play(animation);
        return true;
      } catch (e) {
        console.error(`Error playing animation ${animation}:`, e);
        return false;
      }
    }
    return false;
  });
};

const changeAgent = (agent) => {
  return executeIfAvailable(() => {
    if (window.setCurrentAgent) {
      window.setCurrentAgent(agent);
      return true;
    }
    return false;
  });
};

const setPosition = (x, y) => {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    console.log("Position changes not supported on mobile devices");
    return false;
  }

  return executeIfAvailable(() => {
    if (window.setClippyPosition) {
      window.setClippyPosition({ x, y });
      return true;
    }
    return false;
  });
};

const setInitialPosition = (options) => {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    return true; // Mobile positioning is handled by CSS
  }

  return executeIfAvailable(() => {
    // Helper to find the actual desktop viewport element (same as in ClippyProvider)
    const getDesktopViewport = () => {
      // Try to find the teal desktop area using various selectors
      return (
        document.querySelector(".desktop.screen") ||
        document.querySelector(".desktop") ||
        document.querySelector(".w98")
      );
    };

    // Get the desktop viewport rectangle
    const desktop = getDesktopViewport();
    const rect = desktop ? desktop.getBoundingClientRect() : null;

    // If we couldn't find the desktop viewport, use window dimensions
    const viewportWidth = rect ? rect.width : window.innerWidth;
    const viewportHeight = rect ? rect.height : window.innerHeight;
    // Reference point (top-left corner of viewport)
    const offsetX = rect ? rect.left : 0;
    const offsetY = rect ? rect.top : 0;
    // Taskbar height approximation for positioning
    const taskbarHeight = 30;

    if (typeof options.position === "string") {
      // Handle percentage-based positioning (e.g. "85% 65%")
      const percentMatch = options.position.match(/(\d+)%\s+(\d+)%/);
      if (percentMatch) {
        const xPercent = parseInt(percentMatch[1], 10) / 100;
        const yPercent = parseInt(percentMatch[2], 10) / 100;

        // Calculate position relative to desktop viewport
        const x = offsetX + viewportWidth * xPercent;
        const y = offsetY + viewportHeight * yPercent;

        return setPosition(x, y);
      }

      // Named positions with specific viewport percentages
      const namedPositions = {
        "higher-right": { x: 0.85, y: 0.65 },
        "bottom-right": { x: 0.85, y: 0.85 },
        "bottom-left": { x: 0.15, y: 0.85 },
        "top-right": { x: 0.85, y: 0.15 },
        "top-left": { x: 0.15, y: 0.15 },
        center: { x: 0.5, y: 0.5 },
      };

      // Default to higher-right if position name not found
      const position =
        namedPositions[options.position.toLowerCase()] ||
        namedPositions["higher-right"];

      // If position is "bottom-right", ensure we're above the taskbar
      if (options.position.toLowerCase() === "bottom-right" && rect) {
        const x = offsetX + viewportWidth - 120;
        const y = offsetY + viewportHeight - taskbarHeight - 100;

        if (window.setClippyPosition) {
          return window.setClippyPosition({ x, y });
        } else {
          return setPosition(x, y);
        }
      }

      // For other positions, calculate based on desktop viewport
      const x = offsetX + viewportWidth * position.x;
      const y = offsetY + viewportHeight * position.y;

      // Use the window.setClippyPosition global function added in ClippyProvider
      if (window.setClippyPosition) {
        return window.setClippyPosition({ x, y });
      } else {
        // Fallback to the local setPosition function
        return setPosition(x, y);
      }
    } else if (options.x !== undefined && options.y !== undefined) {
      // For direct pixel positioning, add desktop viewport offsets
      const x = offsetX + options.x;
      const y = offsetY + options.y;

      if (window.setClippyPosition) {
        return window.setClippyPosition({ x, y });
      } else {
        return setPosition(x, y);
      }
    }

    return false;
  });
};

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

const showHelpForWindow = (windowTitle) => {
  if (!isAvailable()) return false;

  show();
  const help = getHelpForWindow(windowTitle);

  const clippyEl = document.querySelector(".clippy");
  if (clippyEl) {
    clippyEl.style.visibility = "visible";
    clippyEl.style.opacity = "1";
    clippyEl.style.display = "block";
  }

  setTimeout(() => {
    play(help.animation);
    setTimeout(() => {
      speak(help.text);
    }, 800);
  }, 300);

  return true;
};

const debug = () => {
  console.log("=== Clippy Debug Info ===");
  console.log("Available:", isAvailable());
  console.log("Clippy instance:", window.clippy);

  const clippyElement = document.querySelector(".clippy");
  console.log("Clippy DOM element:", clippyElement);

  if (clippyElement) {
    const styles = window.getComputedStyle(clippyElement);
    console.log("Clippy styles:", {
      display: styles.display,
      visibility: styles.visibility,
      opacity: styles.opacity,
      position: styles.position,
      left: styles.left,
      top: styles.top,
      transform: styles.transform,
    });
  }

  const overlay = document.getElementById("clippy-clickable-overlay");
  console.log("Overlay element:", overlay);

  if (isAvailable()) {
    console.log("Testing animation...");
    play("Wave");
    setTimeout(() => {
      console.log("Testing speech...");
      speak("Debug test complete!");
    }, 1000);
  }

  return "Debug complete. Check console for details.";
};

const emergencyReset = () => {
  console.log("🚨 Emergency Clippy reset");

  try {
    if (window.setAssistantVisible) {
      window.setAssistantVisible(false);
    }

    const elementsToHide = [
      ".clippy",
      "#clippy-clickable-overlay",
      ".clippy-balloon",
      ".custom-clippy-balloon",
      ".custom-clippy-chat-balloon",
    ];

    elementsToHide.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        el.style.display = "none";
        el.style.visibility = "hidden";
        el.style.opacity = "0";
      });
    });

    const hideStyle = document.createElement("style");
    hideStyle.id = "clippy-emergency-hide";
    hideStyle.textContent = `
      .clippy, #clippy-clickable-overlay,
      .clippy-balloon, .custom-clippy-balloon,
      .custom-clippy-chat-balloon {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;

    const existing = document.getElementById("clippy-emergency-hide");
    if (existing) existing.remove();

    document.head.appendChild(hideStyle);

    return "Emergency reset complete. Refresh the page to restore Clippy.";
  } catch (e) {
    console.error("Error during emergency reset:", e);
    return "Error during reset. Try refreshing the page.";
  }
};

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
  handleWindowHelp: showHelpForWindow,
  debug,
  emergencyReset,
};

if (typeof window !== "undefined") {
  window.ClippyService = ClippyService;
  window.resetClippy = emergencyReset;
}

export default ClippyService;
