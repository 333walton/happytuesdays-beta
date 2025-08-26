// AI Assistant specific tooltip handler with AOL-style tooltips
// This ensures AI Assistant tooltips use the same styling as AOLNewsletterFunnel

export function setupAIAssistantTooltips() {
  let activeTooltips = new Map(); // Track active tooltips by element
  let tooltipTimers = new Map(); // Track timers by element

  // Create tooltip with AOL styling
  function createAOLStyledTooltip(text, targetElement) {
    const tooltip = document.createElement("div");

    // Use same classes and styling as AOLNewsletterFunnel
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

    // Position above the element, centered
    tooltip.style.left = `${
      rect.left + rect.width / 2 - tooltip.offsetWidth / 2
    }px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;

    // Ensure tooltip stays within viewport
    const tooltipRect = tooltip.getBoundingClientRect();

    if (tooltipRect.left < 5) {
      tooltip.style.left = "5px";
    }

    if (tooltipRect.right > window.innerWidth - 5) {
      tooltip.style.left = `${window.innerWidth - tooltip.offsetWidth - 5}px`;
    }

    if (tooltipRect.top < 5) {
      // Position below if no room above
      tooltip.style.top = `${rect.bottom + 8}px`;
    }
  }

  function showTooltip(element, tooltipText) {
    if (!tooltipText) return;

    // Clear any existing timer for this element
    if (tooltipTimers.has(element)) {
      clearTimeout(tooltipTimers.get(element));
      tooltipTimers.delete(element);
    }

    // Remove any existing tooltip for this element
    const existingTooltip = activeTooltips.get(element);
    if (existingTooltip) {
      existingTooltip.remove();
      activeTooltips.delete(element);
    }

    // Create timer for delayed show (500ms like AOLNewsletterFunnel)
    const timer = setTimeout(() => {
      const tooltip = createAOLStyledTooltip(tooltipText, element);
      document.body.appendChild(tooltip);

      // Initial positioning
      positionTooltip(tooltip, element);

      // Track this tooltip
      activeTooltips.set(element, tooltip);

      // Update position on scroll/resize
      const updatePosition = () => {
        if (activeTooltips.has(element)) {
          positionTooltip(tooltip, element);
        }
      };

      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition, true);

      // Store cleanup function
      tooltip._cleanup = () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition, true);
      };

      tooltipTimers.delete(element);
    }, 500);

    tooltipTimers.set(element, timer);
  }

  function hideTooltip(element) {
    // Clear timer if tooltip hasn't appeared yet
    if (tooltipTimers.has(element)) {
      clearTimeout(tooltipTimers.get(element));
      tooltipTimers.delete(element);
    }

    // Remove tooltip if it exists
    const tooltip = activeTooltips.get(element);
    if (tooltip) {
      if (tooltip._cleanup) {
        tooltip._cleanup();
      }
      tooltip.remove();
      activeTooltips.delete(element);
    }
  }

  // Attach to AI Assistant menu items
  function attachToAIMenuItems() {
    // Find all menu buttons and check their text content
    document.querySelectorAll(".StandardMenuItem__button").forEach((button) => {
      const text = button.textContent || "";
      const cleanText = text.replace(/✓/g, "").trim(); // Remove checkmarks

      // Check if this is an AI Assistant menu item
      const isAIAssistant =
        cleanText.includes("GPT") &&
        (cleanText.includes("Clippy") ||
          cleanText.includes("F1") ||
          cleanText.includes("Genius") ||
          cleanText.includes("Merlin") ||
          cleanText.includes("Bonzi"));

      // Also check if it's in the AI Assistants submenu by checking parent elements
      const inAIMenu =
        button.closest('[class*="ai-assistants"]') ||
        button
          .closest(".StandardMenuItem")
          ?.textContent?.includes("AI Assistants");

      if ((isAIAssistant || inAIMenu) && !button._aiTooltipAttached) {
        // Determine tooltip text based on the assistant name
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
        } else if (cleanText.includes("What Are These")) {
          // Don't add tooltip for the help item
          return;
        }

        if (tooltipText) {
          // Remove native title attribute if present
          const originalTitle = button.getAttribute("title");
          button.removeAttribute("title");

          // Use original title if it exists and we don't have a specific tooltip
          if (!tooltipText && originalTitle) {
            tooltipText = originalTitle;
          }

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

  // Initial attachment with a small delay to ensure DOM is ready
  setTimeout(attachToAIMenuItems, 100);

  // Watch for menu changes
  const observer = new MutationObserver((mutations) => {
    // Check if any mutations added menu items
    const hasMenuChanges = mutations.some((mutation) => {
      return Array.from(mutation.addedNodes).some((node) => {
        if (node.nodeType === 1) {
          // Element node
          return (
            node.classList?.contains("StandardMenuItem") ||
            node.querySelector?.(".StandardMenuItem")
          );
        }
        return false;
      });
    });

    if (hasMenuChanges) {
      // Re-attach when menu structure changes
      setTimeout(attachToAIMenuItems, 10);
    }
  });

  // Observe the document for menu additions
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Cleanup function
  function cleanup() {
    // Clear all timers
    tooltipTimers.forEach((timer) => clearTimeout(timer));
    tooltipTimers.clear();

    // Remove all tooltips
    activeTooltips.forEach((tooltip) => {
      if (tooltip._cleanup) {
        tooltip._cleanup();
      }
      tooltip.remove();
    });
    activeTooltips.clear();

    // Remove all AI assistant tooltips from DOM
    document
      .querySelectorAll('[data-tooltip-owner="ai-assistant-menu"]')
      .forEach((el) => {
        el.remove();
      });

    // Remove event listeners
    document.querySelectorAll(".StandardMenuItem__button").forEach((button) => {
      if (button._aiTooltipAttached) {
        button._aiTooltipAttached = false;
      }
    });

    // Disconnect observer
    observer.disconnect();
  }

  // Handle window events that should NOT affect AI tooltips
  window.addEventListener("windowOpened", (e) => {
    // Don't clean up AI tooltips when other windows open
    if (e.detail && e.detail.component !== "ai-assistant-menu") {
      // Keep AI tooltips active
    }
  });

  window.addEventListener("windowClosed", (e) => {
    // Don't restore AI tooltips when other windows close
    if (e.detail && e.detail.component !== "ai-assistant-menu") {
      // Keep AI tooltips in their current state
    }
  });

  // Return cleanup function for external use
  return cleanup;
}

// Helper to check if AI tooltips should be protected
export function protectAITooltips() {
  // Ensure AI assistant tooltips aren't removed by other components
  const protectedTooltips = document.querySelectorAll(
    [
      '[data-tooltip-type="ai-assistant"]',
      ".ai-assistant-tooltip",
      '[data-tooltip-owner="ai-assistant-menu"]',
    ].join(",")
  );

  protectedTooltips.forEach((tooltip) => {
    tooltip.setAttribute("data-protected", "true");
  });
}

// Export for use in start menu or other components
export default {
  setupAIAssistantTooltips,
  protectAITooltips,
};
