import { useEffect } from "react";

// Normalize string for tooltipMap keys AND DOM matching
const normalize = (str) =>
  (str || "")
    .replace(/^✓/, "") // Remove checkmark
    .replace(/[^\w\s]/g, "") // Remove symbols like ™, ®
    .replace(/\s+/g, " ") // Collapse multiple spaces to one
    .trim()
    .toLowerCase();

const useStartMenuTooltipEnhancer = (menuData) => {
  useEffect(() => {
    if (!Array.isArray(menuData)) return;

    const tooltipMap = {};

    // Recursively build normalized title => tooltip mapping
    const buildMap = (items) => {
      items.forEach((item) => {
        if (item?.title && item?.tooltip) {
          // If title is a React node (e.g., <span>...</span>), try to get the string
          const titleStr =
            typeof item.title === "string"
              ? item.title
              : item.title?.props?.children
              ? Array.isArray(item.title.props.children)
                ? item.title.props.children.join(" ")
                : item.title.props.children
              : "";
          tooltipMap[normalize(titleStr || item.title)] = item.tooltip;
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
        ".StandardMenuItem__button:not([data-tooltip-applied])"
      );

      nodes.forEach((node) => {
        let label = node.textContent || "";
        label = label.replace(/\s+/g, " ").trim();
        const norm = normalize(label);

        let tooltip = tooltipMap[norm];

        // Fallback: fuzzy match if exact match fails
        if (!tooltip) {
          for (const [key, value] of Object.entries(tooltipMap)) {
            if (key === norm || key.includes(norm) || norm.includes(key)) {
              tooltip = value;
              break;
            }
          }
        }

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
