const customTooltipTargets = [
  "Start Menu Builder",
  "Log In",
  "Join",
  "My Feed",
  "Hide Clippy",
  "Show Clippy",
];

export function enableCustomMenuTooltips() {
  let tooltipEl = null;
  let tooltipTimer = null;
  const tooltipId = `global-menu-${Date.now()}`;

  function showTooltip(e) {
    if (!e.currentTarget) return;

    const btn = e.currentTarget;
    const text = btn.textContent.replace(/\s+/g, " ").trim();

    // Check if this is a specific disabled button OR has data-tooltip
    const isTargetButton = customTooltipTargets.some((target) =>
      text.includes(target)
    );
    const hasDataTooltip = btn.hasAttribute("data-tooltip");

    if (!isTargetButton && !hasDataTooltip) return;

    const tooltipMap = {
      "Start Menu Builder": "Log in to access",
      "My Feed": "Log in to access",
      "Hide Clippy": "Hide Clippy",
      "Show Clippy": "Show Clippy",
      "Log In • Join": "soon",
      "Log In": "soon",
      Join: "soon",
    };

    const matched = Object.keys(tooltipMap).find((key) => text.includes(key));
    const tooltipText =
      btn.getAttribute("data-tooltip") || // Check data-tooltip first
      btn.getAttribute("title") ||
      (matched ? tooltipMap[matched] : "Info");

    if (!tooltipText) return;

    // Clean up only OUR tooltip, not others
    if (
      tooltipEl &&
      tooltipEl.getAttribute("data-tooltip-owner") === tooltipId
    ) {
      tooltipEl.remove();
      tooltipEl = null;
    }
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
      tooltipTimer = null;
    }

    // Start a timer for standard tooltip delay (500ms to match AOL)
    tooltipTimer = setTimeout(() => {
      tooltipEl = document.createElement("div");
      tooltipEl.className = "custom-tooltip global-menu-tooltip";
      tooltipEl.setAttribute("data-tooltip-type", "global-menu");
      tooltipEl.setAttribute("data-tooltip-owner", tooltipId); // Mark ownership

      tooltipEl.textContent = tooltipText;
      // Apply AOLNewsletterFunnel.js tooltip styling
      tooltipEl.style.position = "fixed";
      tooltipEl.style.zIndex = "100";
      tooltipEl.style.backgroundColor = "#ffffe1";
      tooltipEl.style.border = "1px solid #000";
      tooltipEl.style.padding = "2px 4px";
      tooltipEl.style.fontSize = "11px";
      tooltipEl.style.fontFamily = '"MS Sans Serif", sans-serif';
      tooltipEl.style.pointerEvents = "none";
      tooltipEl.style.whiteSpace = "nowrap";
      tooltipEl.style.left = "0px";
      tooltipEl.style.top = "0px";

      document.body.appendChild(tooltipEl);

      function positionTooltip() {
        if (
          !tooltipEl ||
          tooltipEl.getAttribute("data-tooltip-owner") !== tooltipId
        )
          return;
        const rect = btn.getBoundingClientRect();
        tooltipEl.style.left = `${
          rect.left + rect.width / 2 - tooltipEl.offsetWidth / 2
        }px`;
        tooltipEl.style.top = `${rect.top - tooltipEl.offsetHeight - 8}px`;
      }

      positionTooltip();

      const scrollHandler = () => positionTooltip();
      const resizeHandler = () => positionTooltip();

      window.addEventListener("scroll", scrollHandler, true);
      window.addEventListener("resize", resizeHandler, true);

      btn._customTooltipCleanup = () => {
        // Only clean up our own tooltip
        if (
          tooltipEl &&
          tooltipEl.getAttribute("data-tooltip-owner") === tooltipId
        ) {
          tooltipEl.remove();
          tooltipEl = null;
        }
        window.removeEventListener("resize", resizeHandler, true);
        window.removeEventListener("scroll", scrollHandler, true);
      };
    }, 500); // 500ms delay to match AOL funnel
  }

  function hideTooltip(e) {
    const btn = e.currentTarget;
    // Clear the timer if user leaves early
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
      tooltipTimer = null;
    }
    if (btn && btn._customTooltipCleanup) {
      btn._customTooltipCleanup();
      btn._customTooltipCleanup = null;
    }
  }

  function attachHandlersToMenuItems() {
    // Handle disabled items with specific text
    document
      .querySelectorAll(".StandardMenuItem__button.disabled")
      .forEach((btn) => {
        const text = btn.textContent.replace(/\s+/g, " ").trim();
        if (
          !btn._customTooltipAttached &&
          customTooltipTargets.some((target) => text.includes(target))
        ) {
          btn.addEventListener("mouseenter", showTooltip);
          btn.addEventListener("mouseleave", hideTooltip);
          btn._customTooltipAttached = true;
        }
      });

    // Handle any menu items with data-tooltip attribute
    document
      .querySelectorAll(".StandardMenuItem__button[data-tooltip]")
      .forEach((btn) => {
        if (!btn._customTooltipAttached) {
          btn.addEventListener("mouseenter", showTooltip);
          btn.addEventListener("mouseleave", hideTooltip);
          btn._customTooltipAttached = true;
        }
      });
  }

  attachHandlersToMenuItems();

  const observer = new MutationObserver(attachHandlersToMenuItems);
  observer.observe(document.body, { childList: true, subtree: true });

  // Listen for window events but don't interfere with other components
  window.addEventListener("windowOpened", (e) => {
    // Don't hide our tooltips when AOLNewsletterFunnel opens
    if (e.detail && e.detail.component === "AOLNewsletterFunnel") {
      // AOL component will manage its own tooltips
      return;
    }
  });

  window.addEventListener("windowClosed", (e) => {
    // Don't restore tooltips when AOLNewsletterFunnel closes
    if (e.detail && e.detail.component === "AOLNewsletterFunnel") {
      // AOL component has cleaned up its own tooltips
      return;
    }
  });

  window.addEventListener("beforeunload", () => {
    // Clean up only OUR tooltips and handlers
    document.querySelectorAll(".StandardMenuItem__button").forEach((btn) => {
      if (btn._customTooltipAttached) {
        btn.removeEventListener("mouseenter", showTooltip);
        btn.removeEventListener("mouseleave", hideTooltip);
        btn._customTooltipAttached = false;
        btn._customTooltipCleanup = null;
      }
    });

    // Remove only our tooltips
    document
      .querySelectorAll(`[data-tooltip-owner="${tooltipId}"]`)
      .forEach((el) => {
        el.remove();
      });

    if (
      tooltipEl &&
      tooltipEl.getAttribute("data-tooltip-owner") === tooltipId
    ) {
      tooltipEl.remove();
      tooltipEl = null;
    }
    observer.disconnect();
  });

  return () => {
    // Cleanup function that only affects our tooltips
    document
      .querySelectorAll(`[data-tooltip-owner="${tooltipId}"]`)
      .forEach((el) => {
        el.remove();
      });
  };
}
