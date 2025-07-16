import { useEffect } from "react";

// Normalize string to match tooltipMap keys
const normalize = (str) =>
  (str || "")
    .replace(/^✓/, "") // Remove checkmark
    .replace(/[^\w\s]/g, "") // Remove symbols like ™, ®
    .trim()
    .toLowerCase();

const useStartMenuTooltipEnhancer = (menuData) => {
  useEffect(() => {
    if (!Array.isArray(menuData)) return;

    const tooltipMap = {};

    // Build normalized title => tooltip map
    const buildMap = (items) => {
      items.forEach((item) => {
        if (item?.title && item?.tooltip) {
          tooltipMap[normalize(item.title)] = item.tooltip;
        }
        if (Array.isArray(item.options)) {
          buildMap(item.options);
        }
      });
    };
    buildMap(menuData);

    // Function to apply tooltips to menu items
    const enhanceTooltips = () => {
      const nodes = document.querySelectorAll(
        ".StandardMenuItem:not([data-tooltip-applied])"
      );

      nodes.forEach((node) => {
        const label = node.textContent?.trim() || "";
        const norm = normalize(label);

        const tooltip = tooltipMap[norm];

        if (tooltip) {
          node.setAttribute("title", tooltip);
          node.setAttribute("data-tooltip-applied", "true");
        }
      });
    };

    // Observe DOM changes inside any open menu
    const targetRoot =
      document.querySelector(".StartMenuPortal") || document.body;

    const observer = new MutationObserver(() => {
      setTimeout(() => {
        enhanceTooltips();
      }, 10); // Delay slightly after paint
    });

    if (targetRoot) {
      observer.observe(targetRoot, {
        childList: true,
        subtree: true,
      });
    }

    // Listen for manual agent change trigger
    const onAgentChanged = () => {
      // Clear previously-applied attributes (useful for reapplying)
      document
        .querySelectorAll("[data-tooltip-applied]")
        .forEach((el) => el.removeAttribute("data-tooltip-applied"));
      enhanceTooltips();
    };

    window.addEventListener("agentChanged", onAgentChanged);

    // First run
    setTimeout(enhanceTooltips, 100);

    return () => {
      window.removeEventListener("agentChanged", onAgentChanged);
      observer.disconnect();
    };
  }, [menuData]);
};

export default useStartMenuTooltipEnhancer;
