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
    animation: "Explain",
  },
  calc: { text: "Need help with calculations?", animation: "Explain" },
  cmd: {
    text: "Working with the command prompt? Try typing 'help' to see available commands.",
    animation: "Explain",
  },
  default: { text: "Need help?", animation: "Greeting" },
};

// Device detection cache
const isMobile = (() => {
  try {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768
    );
  } catch {
    return false;
  }
})();

// Safe execution wrapper
const safeExecute = (action, fallbackReturn = false) => {
  try {
    if (typeof window === "undefined") {
      return fallbackReturn;
    }
    return action();
  } catch (error) {
    console.error("ClippyService error:", error);
    return fallbackReturn;
  }
};

// Check if Clippy is available
const isAvailable = () => {
  return safeExecute(() => window.clippy !== undefined);
};

// Execute action only if Clippy is available
const executeIfAvailable = (action) => {
  return safeExecute(() => {
    if (!isAvailable()) {
      console.warn("Clippy not available");
      return false;
    }
    return action();
  });
};

// Safe DOM element manipulation
const ensureClippyVisible = () => {
  return safeExecute(() => {
    const clippyEl = document.querySelector(".clippy");
    if (clippyEl) {
      clippyEl.style.visibility = "visible";
      clippyEl.style.opacity = "1";
      clippyEl.style.display = "block";
      return true;
    }
    return false;
  });
};

const show = () => {
  return executeIfAvailable(() => {
    ensureClippyVisible();
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
    ensureClippyVisible();

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
    ensureClippyVisible();

    if (window.showClippyChatBalloon) {
      return window.showClippyChatBalloon(initialMessage);
    }
    return speak(initialMessage);
  });
};

const hideBalloon = () => {
  return safeExecute(() => {
    if (window.hideClippyCustomBalloon) {
      return window.hideClippyCustomBalloon();
    }
    return true;
  });
};

const play = (animation) => {
  return executeIfAvailable(() => {
    ensureClippyVisible();

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
  if (isMobile) {
    return true; // Mobile positioning is handled by CSS
  }

  return executeIfAvailable(() => {
    // Helper to find the actual desktop viewport element
    const getDesktopViewport = () => {
      return safeExecute(() => {
        return (
          document.querySelector(".desktop.screen") ||
          document.querySelector(".desktop") ||
          document.querySelector(".w98")
        );
      });
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
        const x = offsetX + viewportWidth - 135; // 15px more to the right
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

  return safeExecute(() => {
    show();
    const help = getHelpForWindow(windowTitle);

    ensureClippyVisible();

    setTimeout(() => {
      play(help.animation);
      setTimeout(() => {
        speak(help.text);
      }, 800);
    }, 300);

    return true;
  });
};

const debug = () => {
  return safeExecute(() => {
    console.log("=== Clippy Debug Info ===");
    console.log("Available:", isAvailable());
    console.log("Clippy instance:", window.clippy);
    console.log("Is mobile:", isMobile);

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
        right: styles.right,
        bottom: styles.bottom,
        transform: styles.transform,
      });
    }

    const overlay = document.getElementById("clippy-clickable-overlay");
    console.log("Overlay element:", overlay);

    if (overlay) {
      const overlayStyles = window.getComputedStyle(overlay);
      console.log("Overlay styles:", {
        display: overlayStyles.display,
        visibility: overlayStyles.visibility,
        position: overlayStyles.position,
        zIndex: overlayStyles.zIndex,
      });
    }

    if (isAvailable()) {
      console.log("Testing animation...");
      play("Wave");
      setTimeout(() => {
        console.log("Testing speech...");
        speak("Debug test complete!");
      }, 1000);
    }

    return "Debug complete. Check console for details.";
  }, "Debug failed");
};

const emergencyReset = () => {
  console.log("🚨 Emergency Clippy reset");

  return safeExecute(() => {
    // Hide via global functions first
    if (window.setAssistantVisible) {
      window.setAssistantVisible(false);
    }

    // Force hide all Clippy-related elements
    const elementsToHide = [
      ".clippy",
      "#clippy-clickable-overlay",
      ".clippy-balloon",
      ".custom-clippy-balloon",
      ".custom-clippy-chat-balloon",
    ];

    elementsToHide.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          el.style.display = "none";
          el.style.visibility = "hidden";
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
        });
      } catch (e) {
        console.error(`Error hiding ${selector}:`, e);
      }
    });

    // Add emergency hide styles
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
        transform: translateX(-9999px) !important;
      }
    `;

    const existing = document.getElementById("clippy-emergency-hide");
    if (existing) existing.remove();

    document.head.appendChild(hideStyle);

    // Clear any running animations
    if (window.clippy && window.clippy.stop) {
      try {
        window.clippy.stop();
      } catch (e) {
        console.error("Error stopping clippy animations:", e);
      }
    }

    return "Emergency reset complete. Refresh the page to restore Clippy.";
  }, "Emergency reset failed. Try refreshing the page.");
};

// Nuclear option - completely remove Clippy
const nuclearReset = () => {
  console.log("💥 Nuclear Clippy reset - removing all elements");

  return safeExecute(() => {
    // Remove all Clippy-related elements from DOM
    const elementsToRemove = [
      ".clippy",
      "#clippy-clickable-overlay",
      ".clippy-balloon",
      ".custom-clippy-balloon",
      ".custom-clippy-chat-balloon",
    ];

    elementsToRemove.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
      } catch (e) {
        console.error(`Error removing ${selector}:`, e);
      }
    });

    // Clear global variables
    try {
      delete window.clippy;
      delete window.setAssistantVisible;
      delete window.setCurrentAgent;
      delete window.setScreenPowerState;
      delete window.showClippyCustomBalloon;
      delete window.hideClippyCustomBalloon;
      delete window.showClippyChatBalloon;
      delete window.getClippyInstance;
      delete window.setClippyPosition;
      delete window._clippyGlobalsInitialized;
    } catch (e) {
      console.error("Error clearing global variables:", e);
    }

    return "Nuclear reset complete. All Clippy elements removed. Refresh to restore.";
  }, "Nuclear reset failed. Try refreshing the page.");
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
  nuclearReset, // Added nuclear option
  isMobile, // Expose mobile detection
};

// Global exposure with safety checks
if (typeof window !== "undefined") {
  window.ClippyService = ClippyService;
  window.resetClippy = emergencyReset;
  window.killClippy = nuclearReset; // Nuclear option
}

export default ClippyService;
