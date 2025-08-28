import React, { useState, useEffect, useRef, useContext } from "react";
import { TaskBar as TaskBarComponent } from "packard-belle";
import { StartMenu } from "packard-belle";
import StartMenuPortal from "../StartMenuPortal";
import { ProgramContext } from "../../contexts";
import useStartMenuTooltipEnhancer from "../../helpers/useStartMenuTooltipEnhancer";

// Custom tooltip component with enforced styling that cannot be overridden
const CustomTooltip = ({ text, visible }) => {
  const tooltipRef = useRef(null);
  const [tooltipId] = useState(`taskbar-tooltip-${Date.now()}`);

  useEffect(() => {
    if (!tooltipRef.current) return;

    const applyProtectedStyles = () => {
      if (!tooltipRef.current) return;
      const tooltip = tooltipRef.current;
      tooltip.setAttribute("data-tooltip-type", "taskbar");
      tooltip.setAttribute("data-tooltip-owner", "taskbar-component");
      tooltip.setAttribute("data-protected", "true");
      tooltip.setAttribute("id", tooltipId);

      const styleRules = [
        "position: fixed !important",
        "bottom: 30px !important",
        "left: 105px !important",
        "background-color: #ffffe1 !important",
        "border: 1px solid black !important",
        "padding: 2px 4px !important",
        "font-size: 10px !important",
        "white-space: nowrap !important",
        "pointer-events: none !important",
        'font-family: "MS Sans Serif", sans-serif !important',
        "z-index: 99 !important",
        "color: #000000 !important",
        "line-height: normal !important",
        "text-align: left !important",
        "box-shadow: none !important",
        "border-radius: 0 !important",
        "opacity: 1 !important",
        "transform: none !important",
        "display: block !important",
      ].join(";");

      tooltip.setAttribute("style", styleRules);
    };

    // Always apply styles (not just when visible)
    applyProtectedStyles();

    const protectionInterval = setInterval(applyProtectedStyles, 100);
    tooltipRef.current._protectionInterval = protectionInterval;

    return () => {
      if (tooltipRef.current && tooltipRef.current._protectionInterval) {
        clearInterval(tooltipRef.current._protectionInterval);
      }
      const styleEl = document.getElementById(`${tooltipId}-style`);
      if (styleEl) styleEl.remove();
    };
  }, [tooltipId, visible]);

  if (!visible) return null;

  return (
    <div
      ref={tooltipRef}
      id={tooltipId}
      className="taskbar-custom-tooltip"
      data-tooltip-type="taskbar"
      data-tooltip-owner="taskbar-component"
      data-protected="true"
    >
      {text}
    </div>
  );
};

const TaskBar = () => {
  const context = useContext(ProgramContext);
  useStartMenuTooltipEnhancer(context.startMenu);
  const taskbarRef = useRef(null);
  const clippyButtonRef = useRef(null);

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const [tooltipTimeout, setTooltipTimeout] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ left: 0, bottom: 0 });
  const [refreshKey, setRefreshKey] = useState(0);

  const isMobile =
    typeof window !== "undefined" &&
    (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.innerWidth <= 768);

  const handleMouseEnter = () => {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => setTooltipVisible(false), 200);
    setTooltipTimeout(timeout);
  };

  const openMenu = (startButton) => {
    if (startButton) {
      const rect = startButton.getBoundingClientRect();
      setMenuPosition({
        left: rect.left,
        bottom: window.innerHeight - rect.top,
      });
      setMenuOpen(true);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const btn = clippyButtonRef.current;
    if (!btn) return;
    btn.addEventListener("mouseenter", handleMouseEnter);
    btn.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      btn.removeEventListener("mouseenter", handleMouseEnter);
      btn.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [clippyButtonRef.current]);

  <button ref={clippyButtonRef}>Clippy</button>;

  // Enhanced protection against style changes from other components
  useEffect(() => {
    // Create a MutationObserver to watch for attribute/style changes on taskbar tooltips
    const protectTaskbarTooltips = () => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.target &&
            mutation.target.nodeType === 1 &&
            (mutation.target.getAttribute("data-tooltip-owner") ===
              "taskbar-component" ||
              mutation.target.classList?.contains("taskbar-custom-tooltip"))
          ) {
            // If styles were changed, reapply our styles
            if (
              mutation.type === "attributes" &&
              (mutation.attributeName === "style" ||
                mutation.attributeName === "class")
            ) {
              const target = mutation.target;
              const currentStyle = target.getAttribute("style") || "";

              // Check if our styles are still applied
              if (!currentStyle.includes("background-color: #ffffe1")) {
                console.log("Taskbar tooltip style was changed, reapplying...");

                const correctStyles = [
                  "position: fixed !important",
                  "bottom: 30px !important",
                  "left: 105px !important",
                  "background-color: #ffffe1 !important",
                  "border: 1px solid black !important",
                  "padding: 2px 4px !important",
                  "font-size: 10px !important",
                  "white-space: nowrap !important",
                  "pointer-events: none !important",
                  'font-family: "MS Sans Serif", sans-serif !important',
                  "z-index: 99 !important",
                  "color: #000000 !important",
                  "line-height: normal !important",
                  "text-align: left !important",
                  "box-shadow: none !important",
                  "border-radius: 0 !important",
                  "opacity: 1 !important",
                  "transform: none !important",
                  "display: block !important",
                ].join(";");

                target.setAttribute("style", correctStyles);
              }
            }
          }
        });
      });

      // Observe the entire document for changes
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["style", "class"],
        subtree: true,
      });

      return () => observer.disconnect();
    };

    const cleanup = protectTaskbarTooltips();

    return cleanup;
  }, []);

  useEffect(() => {
    let protectionInterval = null;

    const protectClippyTooltip = () => {
      // Ensure tooltip remains visible when it should be
      if (tooltipVisible) {
        // Check if tooltip exists
        const existingTooltips = document.querySelectorAll(
          [
            ".taskbar-custom-tooltip",
            ".taskbar-tooltip-protected",
            '[data-tooltip-owner="taskbar-component"]',
            '[id*="taskbar-tooltip"]',
          ].join(",")
        );

        if (existingTooltips.length === 0) {
          // Force re-render if tooltip is missing
          console.log("Taskbar tooltip missing, forcing visibility");
          setTooltipVisible(false);
          setTimeout(() => setTooltipVisible(true), 10);
        }
      }
    };

    // Listen for AOL funnel events
    const handleAOLOpened = () => {
      console.log("AOL Funnel opened - protecting taskbar tooltip");
      // Start protection interval when AOL opens
      protectionInterval = setInterval(protectClippyTooltip, 100);

      // Also ensure our tooltip state is preserved
      if (tooltipVisible) {
        // Force tooltip to remain visible
        const tempText = tooltipText;
        setTooltipText("");
        setTimeout(() => setTooltipText(tempText), 10);
      }
    };

    const handleAOLClosed = () => {
      console.log("AOL Funnel closed - stopping protection");
      // Clear protection interval when AOL closes
      if (protectionInterval) {
        clearInterval(protectionInterval);
        protectionInterval = null;
      }
    };

    window.addEventListener("aolFunnelOpened", handleAOLOpened);
    window.addEventListener("aolFunnelClosed", handleAOLClosed);

    return () => {
      window.removeEventListener("aolFunnelOpened", handleAOLOpened);
      window.removeEventListener("aolFunnelClosed", handleAOLClosed);
      if (protectionInterval) {
        clearInterval(protectionInterval);
      }
    };
  }, [tooltipVisible, tooltipText]);

  // Mobile: override Start button behavior
  useEffect(() => {
    if (!taskbarRef.current || !isMobile) return;

    let lastStartBtn = null;

    const attachHandler = () => {
      const startBtn = taskbarRef.current.querySelector(".StartButton");
      if (!startBtn || startBtn === lastStartBtn) return;
      lastStartBtn = startBtn;

      startBtn.onclick = null;
      startBtn.ontouchstart = null;

      const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openMenu(startBtn);
        return false;
      };

      startBtn.onclick = handler;
      startBtn.ontouchstart = handler;
    };

    attachHandler();
    const observer = new MutationObserver(attachHandler);
    observer.observe(taskbarRef.current, { childList: true, subtree: true });
    const interval = setInterval(attachHandler, 200);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [isMobile, menuOpen]);

  // Clippy button tooltip detection
  useEffect(() => {
    const findAndProtectClippyButton = () => {
      if (!taskbarRef.current) return;

      const buttons = taskbarRef.current.querySelectorAll("button");
      const clippyButton = Array.from(buttons).find((button) => {
        const hasClippyIcon = button.innerHTML.includes("textchat32");
        const hasClippyTitle =
          button.title === "Show Clippy" || button.title === "Hide Clippy";
        const hasClippyClass = button.className?.includes("clippy");
        return hasClippyIcon || hasClippyTitle || hasClippyClass;
      });

      if (clippyButton) {
        clippyButtonRef.current = clippyButton;

        // Extract and save the title
        const buttonTitle =
          clippyButton.title ||
          clippyButton.getAttribute("data-original-title") ||
          tooltipText ||
          "Show Clippy";
        setTooltipText(buttonTitle);

        // Store original title in data attribute
        if (!clippyButton.getAttribute("data-original-title")) {
          clippyButton.setAttribute("data-original-title", buttonTitle);
        }

        // Remove native tooltip attributes
        clippyButton.removeAttribute("title");
        clippyButton.removeAttribute("data-tooltip");
        clippyButton.removeAttribute("aria-label");
        clippyButton.setAttribute("data-no-native-tooltip", "true");

        // Remove old listeners to prevent duplicates
        clippyButton.removeEventListener("mouseenter", handleMouseEnter);
        clippyButton.removeEventListener("mouseleave", handleMouseLeave);

        // Add new listeners
        clippyButton.addEventListener("mouseenter", handleMouseEnter);
        clippyButton.addEventListener("mouseleave", handleMouseLeave);

        // Monitor for attribute changes
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === "attributes") {
              const attributesToRemove = [
                "title",
                "data-tooltip",
                "aria-label",
              ];
              attributesToRemove.forEach((attr) => {
                if (clippyButton.hasAttribute(attr)) {
                  const value = clippyButton.getAttribute(attr);
                  if (value && attr === "title") {
                    setTooltipText(value);
                    clippyButton.setAttribute("data-original-title", value);
                  }
                  clippyButton.removeAttribute(attr);
                }
              });
              // Always ensure data-no-native-tooltip is set to "true"
              if (
                clippyButton.getAttribute("data-no-native-tooltip") !== "true"
              ) {
                clippyButton.setAttribute("data-no-native-tooltip", "true");
              }
            }
          });
        });

        observer.observe(clippyButton, {
          attributes: true,
          attributeFilter: ["title", "data-tooltip", "aria-label"],
        });

        return () => {
          clippyButton.removeEventListener("mouseenter", handleMouseEnter);
          clippyButton.removeEventListener("mouseleave", handleMouseLeave);
          observer.disconnect();
        };
      }
    };

    const cleanup = findAndProtectClippyButton();

    // Re-run periodically to ensure button is protected
    const interval = setInterval(findAndProtectClippyButton, 1000);

    // Listen for AOL events to re-establish protection
    const handleAOLChange = () => {
      setTimeout(findAndProtectClippyButton, 100);
    };

    window.addEventListener("aolFunnelOpened", handleAOLChange);
    window.addEventListener("aolFunnelClosed", handleAOLChange);

    return () => {
      if (cleanup) cleanup();
      clearInterval(interval);
      window.removeEventListener("aolFunnelOpened", handleAOLChange);
      window.removeEventListener("aolFunnelClosed", handleAOLChange);
    };
  }, [tooltipText]); // Include tooltipText in dependencies

  // Add RSS icon to notification area
  useEffect(() => {
    const addRSSIcon = () => {
      if (!taskbarRef.current) return;
      const notificationsArea = taskbarRef.current.querySelector(
        ".TaskBar__notifications"
      );
      if (notificationsArea && !notificationsArea.querySelector(".rss-icon")) {
        const timeElement = notificationsArea.querySelector(
          ".TaskBar__notifications__time"
        );
        if (timeElement) {
          const rssIcon = document.createElement("img");
          rssIcon.src = require("../../icons/rss32-min.png");
          rssIcon.alt = "RSS";
          rssIcon.className = "rss-icon";
          rssIcon.style.width = "16px";
          rssIcon.style.height = "16px";
          rssIcon.style.marginRight = "1px";
          rssIcon.style.verticalAlign = "middle";
          rssIcon.style.cursor = "pointer";
          rssIcon.style.zIndex = "99999";
          rssIcon.addEventListener("click", () => {
            console.log("RSS icon clicked");
          });
          timeElement.parentNode.insertBefore(rssIcon, timeElement);
        }
      }
    };

    addRSSIcon();
    const timeouts = [100, 500, 1000, 2000].map((delay) =>
      setTimeout(addRSSIcon, delay)
    );

    const observer = new MutationObserver(() => {
      const existingIcon = taskbarRef.current?.querySelector(".rss-icon");
      if (!existingIcon) {
        addRSSIcon();
      }
    });

    if (taskbarRef.current) {
      observer.observe(taskbarRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      observer.disconnect();
    };
  }, [refreshKey]);

  // In a component that has access to ProgramContext - might not be in the best location but it works
  useEffect(() => {
    const body = document.body;

    if (context.shutDownMenu) {
      body.classList.add("shutdown-active");
    } else {
      body.classList.remove("shutdown-active");
    }
  }, [context.shutDownMenu]);

  useEffect(() => {
    if (!menuOpen || !isMobile) return;

    const handleClickOutside = (e) => {
      if (e.target.closest(".StartButton")) return;
      if (e.target.closest(".TaskBar__start")) return;
      closeMenu();
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen, isMobile]);

  // Mail status change event handler
  useEffect(() => {
    const handleMenuRefresh = (eventType) => {
      console.log(
        `📧 TaskBar received ${eventType} - ProgramProvider should handle this`
      );
      setMenuOpen(false);
      setRefreshKey((prev) => prev + 1);
    };

    const events = [
      "mailStatusChanged",
      "startMenuUpdate",
      "forceRefresh",
      "forceMenuRefresh",
    ];

    const handlers = events.map((eventType) => {
      const handler = () => handleMenuRefresh(eventType);
      window.addEventListener(eventType, handler);
      return { eventType, handler };
    });

    return () => {
      handlers.forEach(({ eventType, handler }) => {
        window.removeEventListener(eventType, handler);
      });
    };
  }, []);

  return (
    <div ref={taskbarRef} style={{ position: "relative" }}>
      <TaskBarComponent
        key={refreshKey}
        options={context.startMenu}
        quickLaunch={context.quickLaunch.map((item) => {
          const isClippy =
            item.title === "Show Clippy" || item.title === "Hide Clippy";
          return {
            ...item,
            isActive: item.active,
            dataActive: item.active ? "true" : "false",
            title: item.tooltip || item.title,
            className: isClippy
              ? `quick-launch-button-clippy btn ButtonIconSmall ${
                  item.className || ""
                }`
              : item.className || "",
            style: isClippy ? { position: "relative" } : item.style || {},
          };
        })}
        openWindows={context.openOrder.map((windowId) => {
          const { activePrograms } = context;
          const isActive = windowId === context.activeId;
          const onClick = isActive ? context.onMinimize : context.moveToTop;
          const { title, icon } = activePrograms[windowId];
          return {
            id: windowId,
            title,
            icon,
            isActive,
            onClick: () => onClick(windowId),
          };
        })}
      />

      <CustomTooltip text={tooltipText} visible={tooltipVisible} />

      {menuOpen && isMobile && !context.shutDownMenu && (
        <StartMenuPortal>
          <div
            className="StartMenuPortalContainer"
            style={{
              position: "fixed",
              left: `${Math.round(menuPosition.left)}px`,
              bottom: `${Math.round(menuPosition.bottom)}px`,
              zIndex: 10000,
            }}
          >
            <StartMenu
              className="TaskBar__start"
              options={context.startMenu}
              onClose={closeMenu}
            />
          </div>
        </StartMenuPortal>
      )}
    </div>
  );
};

export default TaskBar;
