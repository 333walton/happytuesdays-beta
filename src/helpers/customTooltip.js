// src/helpers/customTooltip.js

const customTooltipTargets = ["Start Menu Builder", "Log In", "Join"];

export function enableCustomMenuTooltips() {
  let tooltipEl = null;
  let tooltipTimer = null;

  function showTooltip(e) {
    if (!e.currentTarget) return;

    const btn = e.currentTarget;
    const text = btn.textContent.replace(/\s+/g, " ").trim();
    if (!customTooltipTargets.some((target) => text.includes(target))) return;

    const tooltipMap = {
      "Start Menu Builder": "Log in to access",
      "Log In • Join": "soon",
      "Log In": "soon",
      Join: "soon",
    };
    const matched = Object.keys(tooltipMap).find((key) => text.includes(key));
    const tooltipText =
      btn.getAttribute("title") ||
      btn.getAttribute("data-tooltip") ||
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

    document.addEventListener("DOMContentLoaded", () => {
      const tooltip = document.createElement("div");
      tooltip.className = "custom-tooltip";
      document.body.appendChild(tooltip);
      tooltip.style.display = "none";

      document.querySelectorAll("[data-tooltip]").forEach((el) => {
        el.addEventListener("mouseenter", (e) => {
          const tooltipText = el.getAttribute("data-tooltip");
          tooltip.textContent = tooltipText;

          // Fixed offset from cursor
          const offsetX = 10; // right
          const offsetY = 50; // lower

          tooltip.style.left = `${e.clientX + offsetX}px`;
          tooltip.style.top = `${e.clientY + offsetY}px`;
          tooltip.style.display = "block";
        });

        el.addEventListener("mouseleave", () => {
          tooltip.style.display = "none";
        });
      });
    });

    // Start a timer for standard tooltip delay (500ms)
    tooltipTimer = setTimeout(() => {
      tooltipEl = document.createElement("div");
      tooltipEl.className = "custom-tooltip";
      tooltipEl.textContent = tooltipText;
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
  }

  attachHandlersToMenuItems();

  const observer = new MutationObserver(attachHandlersToMenuItems);
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("beforeunload", () => {
    document
      .querySelectorAll(".StandardMenuItem__button.disabled")
      .forEach((btn) => {
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
