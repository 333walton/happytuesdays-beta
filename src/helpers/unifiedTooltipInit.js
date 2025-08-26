// src/helpers/unifiedTooltipInit.js
// Unified tooltip initialization that prevents duplicates

// Track initialization state to prevent duplicates
let tooltipsInitialized = false;
let cleanupFunctions = [];

// Import the individual tooltip systems if they exist as separate files
// If not, we'll define them inline below
let setupAIAssistantTooltips;
let enableCustomMenuTooltips;

// Try to import existing helpers if available
try {
  const aiModule = require("./aiAssistantTooltips");
  setupAIAssistantTooltips =
    aiModule.setupAIAssistantTooltips ||
    aiModule.default?.setupAIAssistantTooltips;
} catch (e) {
  // Define inline if not found
  setupAIAssistantTooltips = function () {
    let activeTooltips = new Map();
    let tooltipTimers = new Map();

    function createAOLStyledTooltip(text) {
      const tooltip = document.createElement("div");
      tooltip.className = "ai-assistant-tooltip";
      tooltip.setAttribute("data-tooltip-type", "ai-assistant");
      tooltip.setAttribute("data-tooltip-owner", "ai-assistant-menu");

      tooltip.textContent = text;
      tooltip.style.position = "fixed";
      tooltip.style.zIndex = "100";
      tooltip.style.backgroundColor = "#ffffe1";
      tooltip.style.border = "1px solid #000";
      tooltip.style.padding = "2px 4px";
      tooltip.style.fontSize = "11px";
      tooltip.style.fontFamily = '"MS Sans Serif", sans-serif';
      tooltip.style.pointerEvents = "none";
      tooltip.style.whiteSpace = "nowrap";

      return tooltip;
    }

    function positionTooltip(tooltip, targetElement) {
      const rect = targetElement.getBoundingClientRect();
      tooltip.style.left = `${
        rect.left + rect.width / 2 - tooltip.offsetWidth / 2
      }px`;
      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;

      const tooltipRect = tooltip.getBoundingClientRect();
      if (tooltipRect.left < 5) {
        tooltip.style.left = "5px";
      }
      if (tooltipRect.right > window.innerWidth - 5) {
        tooltip.style.left = `${window.innerWidth - tooltip.offsetWidth - 5}px`;
      }
      if (tooltipRect.top < 5) {
        tooltip.style.top = `${rect.bottom + 8}px`;
      }
    }

    function showTooltip(element, tooltipText) {
      if (!tooltipText) return;

      if (tooltipTimers.has(element)) {
        clearTimeout(tooltipTimers.get(element));
        tooltipTimers.delete(element);
      }

      const existingTooltip = activeTooltips.get(element);
      if (existingTooltip) {
        existingTooltip.remove();
        activeTooltips.delete(element);
      }

      const timer = setTimeout(() => {
        const tooltip = createAOLStyledTooltip(tooltipText);
        document.body.appendChild(tooltip);
        positionTooltip(tooltip, element);
        activeTooltips.set(element, tooltip);

        const updatePosition = () => {
          if (activeTooltips.has(element)) {
            positionTooltip(tooltip, element);
          }
        };

        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition, true);

        tooltip._cleanup = () => {
          window.removeEventListener("scroll", updatePosition, true);
          window.removeEventListener("resize", updatePosition, true);
        };

        tooltipTimers.delete(element);
      }, 500);

      tooltipTimers.set(element, timer);
    }

    function hideTooltip(element) {
      if (tooltipTimers.has(element)) {
        clearTimeout(tooltipTimers.get(element));
        tooltipTimers.delete(element);
      }

      const tooltip = activeTooltips.get(element);
      if (tooltip) {
        if (tooltip._cleanup) {
          tooltip._cleanup();
        }
        tooltip.remove();
        activeTooltips.delete(element);
      }
    }

    function attachToAIMenuItems() {
      document
        .querySelectorAll(".StandardMenuItem__button")
        .forEach((button) => {
          const text = button.textContent || "";
          const cleanText = text.replace(/✓/g, "").trim();

          const isAIAssistant =
            cleanText.includes("GPT") &&
            (cleanText.includes("Clippy") ||
              cleanText.includes("F1") ||
              cleanText.includes("Genius") ||
              cleanText.includes("Merlin") ||
              cleanText.includes("Bonzi"));

          if (isAIAssistant && !button._aiTooltipAttached) {
            let tooltipText = "";

            if (cleanText.includes("Clippy")) {
              tooltipText = "Site Guide";
            } else if (cleanText.includes("F1")) {
              tooltipText = "Tech";
            } else if (cleanText.includes("Genius")) {
              tooltipText = "Building & Productivity";
            } else if (cleanText.includes("Merlin")) {
              tooltipText = "Art & Design";
            } else if (cleanText.includes("Bonzi")) {
              tooltipText = "Gaming";
            }

            if (tooltipText) {
              button.removeAttribute("title");
              button.addEventListener("mouseenter", () =>
                showTooltip(button, tooltipText)
              );
              button.addEventListener("mouseleave", () => hideTooltip(button));
              button._aiTooltipAttached = true;
              button._aiTooltipText = tooltipText;
            }
          }
        });
    }

    setTimeout(attachToAIMenuItems, 100);

    const observer = new MutationObserver((mutations) => {
      const hasMenuChanges = mutations.some((mutation) => {
        return Array.from(mutation.addedNodes).some((node) => {
          if (node.nodeType === 1) {
            return (
              node.classList?.contains("StandardMenuItem") ||
              node.querySelector?.(".StandardMenuItem")
            );
          }
          return false;
        });
      });

      if (hasMenuChanges) {
        setTimeout(attachToAIMenuItems, 10);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return function cleanup() {
      tooltipTimers.forEach((timer) => clearTimeout(timer));
      tooltipTimers.clear();
      activeTooltips.forEach((tooltip) => {
        if (tooltip._cleanup) tooltip._cleanup();
        tooltip.remove();
      });
      activeTooltips.clear();
      document
        .querySelectorAll('[data-tooltip-owner="ai-assistant-menu"]')
        .forEach((el) => {
          el.remove();
        });
      observer.disconnect();
    };
  };
}

// Try to import custom menu tooltips if available
try {
  const customModule = require("./customTooltip");
  enableCustomMenuTooltips =
    customModule.enableCustomMenuTooltips || customModule.default;
} catch (e) {
  // Use existing implementation if available
  enableCustomMenuTooltips =
    window.enableCustomMenuTooltips ||
    function () {
      console.log("Custom menu tooltips not found, using fallback");
      return () => {};
    };
}

export function initializeTooltips() {
  // Prevent duplicate initialization
  if (tooltipsInitialized) {
    console.log("Tooltips already initialized, skipping...");
    return () => cleanupAll();
  }

  console.log("Initializing tooltip systems...");

  // First, disable native browser tooltips for menu items that we'll handle
  disableNativeTooltips();

  // Setup custom tooltips with a delay to ensure DOM is ready
  setTimeout(() => {
    // Setup global menu tooltips (for disabled items, etc.)
    if (typeof enableCustomMenuTooltips === "function") {
      const cleanupGlobal = enableCustomMenuTooltips();
      if (cleanupGlobal) cleanupFunctions.push(cleanupGlobal);
    }

    // Setup AI Assistant specific tooltips with AOL styling
    if (typeof setupAIAssistantTooltips === "function") {
      const cleanupAI = setupAIAssistantTooltips();
      if (cleanupAI) cleanupFunctions.push(cleanupAI);
    }

    tooltipsInitialized = true;
  }, 200);

  // Return cleanup function
  return () => cleanupAll();
}

// Disable native browser tooltips for elements we'll handle
function disableNativeTooltips() {
  const checkAndRemoveTitles = () => {
    document.querySelectorAll(".StandardMenuItem__button").forEach((button) => {
      const text = button.textContent || "";
      const cleanText = text.replace(/✓/g, "").trim();

      // Check if this is an AI Assistant item
      if (
        cleanText.includes("GPT") &&
        (cleanText.includes("Clippy") ||
          cleanText.includes("F1") ||
          cleanText.includes("Genius") ||
          cleanText.includes("Merlin") ||
          cleanText.includes("Bonzi"))
      ) {
        const title = button.getAttribute("title");
        if (title) {
          button.setAttribute("data-original-title", title);
          button.removeAttribute("title");
        }
      }
    });
  };

  checkAndRemoveTitles();

  const observer = new MutationObserver(() => {
    checkAndRemoveTitles();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  cleanupFunctions.push(() => observer.disconnect());
}

// Cleanup all tooltip systems
function cleanupAll() {
  console.log("Cleaning up tooltip systems...");

  cleanupFunctions.forEach((cleanup) => {
    try {
      if (typeof cleanup === "function") cleanup();
    } catch (e) {
      console.error("Error during tooltip cleanup:", e);
    }
  });

  cleanupFunctions = [];
  tooltipsInitialized = false;

  // Remove any lingering tooltips
  document
    .querySelectorAll(
      [".ai-assistant-tooltip", ".custom-tooltip", "[data-tooltip-type]"].join(
        ","
      )
    )
    .forEach((el) => {
      if (el.getAttribute("data-protected") !== "true") {
        el.remove();
      }
    });
}

// Helper to ensure tooltips are properly isolated between components
export function isolateComponentTooltips() {
  window.addEventListener("windowOpened", (e) => {
    if (e.detail) {
      const { component } = e.detail;
      if (component === "AOLNewsletterFunnel") {
        protectNonAOLTooltips();
      }
    }
  });

  window.addEventListener("windowClosed", (e) => {
    if (e.detail) {
      const { component } = e.detail;
      if (component === "AOLNewsletterFunnel") {
        setTimeout(() => {
          restoreTooltipFunctionality();
        }, 100);
      }
    }
  });
}

// Protect tooltips that don't belong to AOLNewsletterFunnel
function protectNonAOLTooltips() {
  const tooltipsToProtect = document.querySelectorAll(
    [
      '[data-tooltip-type="ai-assistant"]',
      '[data-tooltip-type="global-menu"]',
      '[data-tooltip-type="taskbar"]',
      '[data-tooltip-owner="taskbar-component"]',
      ".taskbar-custom-tooltip",
    ].join(",")
  );

  tooltipsToProtect.forEach((tooltip) => {
    tooltip.setAttribute("data-protected", "true");

    if (
      tooltip.getAttribute("data-tooltip-type") === "taskbar" ||
      tooltip.classList.contains("taskbar-custom-tooltip")
    ) {
      tooltip.style.backgroundColor = "#ffffe1";
      tooltip.style.border = "1px solid black";
      tooltip.style.fontFamily = '"MS Sans Serif", sans-serif';
      tooltip.style.fontSize = "10px";
    }
  });
}

// Restore tooltip functionality after component closes
function restoreTooltipFunctionality() {
  const taskbarTooltips = document.querySelectorAll(
    '[data-tooltip-owner="taskbar-component"]'
  );
  taskbarTooltips.forEach((tooltip) => {
    tooltip.style.backgroundColor = "#ffffe1";
    tooltip.style.border = "1px solid black";
    tooltip.style.fontFamily = '"MS Sans Serif", sans-serif';
  });
}

// Initialize on app start
export function setupTooltipSystem() {
  const cleanup = initializeTooltips();
  isolateComponentTooltips();
  return cleanup;
}

export default setupTooltipSystem;
