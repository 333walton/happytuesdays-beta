import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

/**
 * DesktopPortalWrapper - Renders children inside the desktop viewport using React Portal
 * This ensures the chat widget is contained within the monitor's desktop area
 */
const DesktopPortalWrapper = ({ children }) => {
  const [portalContainer, setPortalContainer] = useState(null);

  useEffect(() => {
    // Find or create portal container inside desktop viewport
    const findOrCreatePortalContainer = () => {
      // Try to find the desktop content wrapper inside monitor-screen
      const desktopWrapper = document.querySelector(".desktop-content-wrapper");
      const monitorScreen = document.querySelector(".monitor-screen");
      const desktop =
        document.querySelector(".desktop.screen") ||
        document.querySelector(".desktop") ||
        document.querySelector(".w98");

      // Prefer desktop-content-wrapper, then monitor-screen, then desktop
      const targetContainer = desktopWrapper || monitorScreen || desktop;

      if (!targetContainer) {
        console.warn("No desktop container found for portal");
        return null;
      }

      // Check if portal container already exists
      let portal = targetContainer.querySelector("#genius-chat-portal");

      if (!portal) {
        // Create portal container
        portal = document.createElement("div");
        portal.id = "genius-chat-portal";
        portal.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2400;
          overflow: hidden;
          contain: layout style paint;
        `;
        targetContainer.appendChild(portal);
        console.log(
          "Created portal container inside:",
          targetContainer.className
        );
      }

      return portal;
    };

    // Try to create portal container
    const container = findOrCreatePortalContainer();

    if (!container) {
      // If no container found initially, try again after a delay
      const retryTimeout = setTimeout(() => {
        const retryContainer = findOrCreatePortalContainer();
        if (retryContainer) {
          setPortalContainer(retryContainer);
        }
      }, 500);

      return () => clearTimeout(retryTimeout);
    }

    setPortalContainer(container);

    // Cleanup
    return () => {
      if (
        container &&
        container.parentNode &&
        container.childNodes.length === 0
      ) {
        container.parentNode.removeChild(container);
      }
    };
  }, []);

  if (!portalContainer) {
    // If no portal container yet, render nothing
    return null;
  }

  // Use React Portal to render children inside the desktop viewport
  return ReactDOM.createPortal(
    <div style={{ pointerEvents: "auto" }}>{children}</div>,
    portalContainer
  );
};

export default DesktopPortalWrapper;
