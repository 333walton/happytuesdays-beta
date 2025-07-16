import React, { useState, useEffect, useRef, useContext } from "react";
import { TaskBar as TaskBarComponent } from "packard-belle";
import { StartMenu } from "packard-belle";
import StartMenuPortal from "../StartMenuPortal";
import { ProgramContext } from "../../contexts";
import useStartMenuTooltipEnhancer from "../../helpers/useStartMenuTooltipEnhancer";

// Custom tooltip component
const CustomTooltip = ({ text, visible }) => {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% + 30px)",
        left: "105px",
        backgroundColor: "#ffffcc",
        border: "1px solid black",
        padding: "2px 4px",
        fontSize: "10px",
        whiteSpace: "nowrap",
        zIndex: 99999,
        pointerEvents: "none",
      }}
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
    const findClippyButton = () => {
      if (!taskbarRef.current) return;
      const buttons = taskbarRef.current.querySelectorAll("button");
      const clippyButton = Array.from(buttons).find((button) => {
        const hasClippyIcon = button.innerHTML.includes("textchat32");
        const hasClippyTitle =
          button.title === "Show Clippy" || button.title === "Hide Clippy";
        return hasClippyIcon || hasClippyTitle;
      });

      if (clippyButton) {
        clippyButtonRef.current = clippyButton;
        const buttonTitle = clippyButton.title;
        setTooltipText(buttonTitle);

        clippyButton.addEventListener("mouseenter", handleMouseEnter);
        clippyButton.addEventListener("mouseleave", handleMouseLeave);
        clippyButton.removeAttribute("title");
        clippyButton.removeAttribute("data-tooltip");

        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (
              mutation.type === "attributes" &&
              mutation.attributeName === "title"
            ) {
              const newTitle = clippyButton.getAttribute("title");
              if (newTitle) {
                setTooltipText(newTitle);
                clippyButton.removeAttribute("title");
              }
            }
          });
        });

        observer.observe(clippyButton, {
          attributes: true,
          attributeFilter: ["title"],
        });

        return () => {
          clippyButton.removeEventListener("mouseenter", handleMouseEnter);
          clippyButton.removeEventListener("mouseleave", handleMouseLeave);
          observer.disconnect();
        };
      }
    };

    const cleanup = findClippyButton();
    const timeoutId = setTimeout(findClippyButton, 1000);
    return () => {
      if (cleanup) cleanup();
      clearTimeout(timeoutId);
    };
  }, []);

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
          rssIcon.addEventListener("click", () => {
            console.log("RSS icon clicked");
          });
          timeElement.parentNode.insertBefore(rssIcon, timeElement);
        }
      }
    };

    addRSSIcon();
    const timeouts = [100, 500, 1000].map((delay) =>
      setTimeout(addRSSIcon, delay)
    );
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

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

  return (
    <div ref={taskbarRef} style={{ position: "relative" }}>
      <TaskBarComponent
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

      {menuOpen && isMobile && (
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
