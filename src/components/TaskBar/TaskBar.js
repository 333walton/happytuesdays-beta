import React, { useState, useEffect, useRef } from "react";
import { TaskBar as TaskBarComponent } from "packard-belle";
import StartMenuPortal from "../StartMenuPortal";
import { StartMenu } from "packard-belle";
import { ProgramContext } from "../../contexts";

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
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipTimeout, setTooltipTimeout] = useState(null);
  const taskbarRef = useRef(null);
  const [tooltipText, setTooltipText] = useState("");
  const clippyButtonRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ left: 0, bottom: 0 });

  // Mobile detection
  const isMobile =
    typeof window !== "undefined" &&
    (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.innerWidth <= 768);

  const handleMouseEnter = () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
    }
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setTooltipVisible(false);
    }, 200);
    setTooltipTimeout(timeout);
  };

  // Open menu and set position
  const openMenu = (startButton) => {
    if (startButton) {
      const rect = startButton.getBoundingClientRect();
      // Position menu above the start button
      setMenuPosition({
        left: rect.left,
        bottom: window.innerHeight - rect.top, // Distance from bottom of viewport
      });
      setMenuOpen(true);
    }
  };

  // Close menu handler
  const closeMenu = () => setMenuOpen(false);

  // Override Start button behavior ONLY on mobile
  useEffect(() => {
    if (!taskbarRef.current || !isMobile) return;
    
    // Function to attach handlers to start button
    const attachStartHandlers = () => {
      const startBtn = taskbarRef.current.querySelector('.StartButton');
      if (!startBtn) {
        console.log('Start button not found');
        return;
      }
      
      console.log('Attaching custom Start button handler for mobile');
      
      // Store original onclick handler
      const originalOnClick = startBtn.onclick;
      
      // Override click handler for mobile only
      startBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('Mobile Start button clicked');
        openMenu(startBtn);
        return false;
      };
      
      // Also add touch handler for mobile
      startBtn.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('Mobile Start button touched');
        openMenu(startBtn);
      }, { passive: false });
      
      // Return cleanup function
      return () => {
        startBtn.onclick = originalOnClick;
      };
    };
    
    // Try immediately and after delays to ensure the button is rendered
    let cleanup = attachStartHandlers();
    const timeouts = [100, 500, 1000].map(delay => 
      setTimeout(() => {
        cleanup = attachStartHandlers();
      }, delay)
    );
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      if (cleanup) cleanup();
    };
  }, [isMobile]);

  // Find and modify the Clippy button after render
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
            // Add your RSS functionality here
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

  // Click outside to close menu (mobile only)
  useEffect(() => {
    if (!menuOpen || !isMobile) return;
    
    const handleClickOutside = (e) => {
      // Don't close if clicking the start button
      if (e.target.closest('.StartButton')) return;
      // Don't close if clicking inside the menu
      if (e.target.closest('.TaskBar__start')) return;
      
      closeMenu();
    };
    
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen, isMobile]);

  return (
    <ProgramContext.Consumer>
      {(context) => (
        <div ref={taskbarRef} style={{ position: "relative" }}>
          <TaskBarComponent
            options={context.startMenu} // Pass the actual menu options for desktop
            quickLaunch={context.quickLaunch.map((item) => {
              if (
                item.title === "Show Clippy" ||
                item.title === "Hide Clippy"
              ) {
                return {
                  ...item,
                  isActive: item.active,
                  dataActive: item.active ? "true" : "false",
                  title: item.title,
                  className: `quick-launch-button-clippy btn ButtonIconSmall ${
                    item.className || ""
                  }`,
                  style: {
                    position: "relative",
                  },
                };
              }
              return {
                ...item,
                isActive: item.active,
                dataActive: item.active ? "true" : "false",
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
          
          {/* Start Menu Portal - Mobile Only */}
          {menuOpen && isMobile && (
            <StartMenuPortal>
              <div
                style={{
                  position: "fixed",
                  left: `${menuPosition.left}px`,
                  bottom: `${menuPosition.bottom}px`,
                  zIndex: 10000, // Ensure it's above everything
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
      )}
    </ProgramContext.Consumer>
  );
};

export default TaskBar;