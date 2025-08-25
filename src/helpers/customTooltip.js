// this mainly just helps apply tooltips to disables menu items

const customTooltipTargets = ["Start Menu Builder", "Log In", "Join"];

export function enableCustomMenuTooltips() {
  let tooltipEl = null;
  let tooltipTimer = null;

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

    // Clean up any previous show attempts or existing tooltip
    if (tooltipEl) {
      tooltipEl.remove();
      tooltipEl = null;
    }
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
      tooltipTimer = null;
    }

    // Start a timer for standard tooltip delay (500ms)
    tooltipTimer = setTimeout(() => {
      tooltipEl = document.createElement("div");
      tooltipEl.className = "custom-tooltip global-menu-tooltip"; // Add unique identifier
      tooltipEl.setAttribute("data-tooltip-type", "global-menu"); // Mark it

      tooltipEl.className = "custom-tooltip";
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
        if (!tooltipEl) return;
        const rect = btn.getBoundingClientRect();
        tooltipEl.style.left = `${
          rect.left + rect.width / 2 - tooltipEl.offsetWidth / 2
        }px`;
        tooltipEl.style.top = `${rect.top - tooltipEl.offsetHeight - 8}px`;
      }

      positionTooltip();
      window.addEventListener("scroll", positionTooltip, true);
      window.addEventListener("resize", positionTooltip, true);

      btn._customTooltipCleanup = () => {
        if (tooltipEl) {
          tooltipEl.remove();
          tooltipEl = null;
        }
        window.removeEventListener("resize", positionTooltip, true);
        window.removeEventListener("scroll", positionTooltip, true);
      };
    }, 1000); // 1000ms delay (matches browser tooltips)
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

  window.addEventListener("beforeunload", () => {
    // Clean up ALL buttons with tooltips
    document.querySelectorAll(".StandardMenuItem__button").forEach((btn) => {
      if (btn._customTooltipAttached) {
        btn.removeEventListener("mouseenter", showTooltip);
        btn.removeEventListener("mouseleave", hideTooltip);
        btn._customTooltipAttached = false;
        btn._customTooltipCleanup = null;
      }
    });
    if (tooltipEl) {
      tooltipEl.remove();
      tooltipEl = null;
    }
    observer.disconnect();
  });
}
