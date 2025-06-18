import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

/**
 * DesktopPortalWrapper - Renders children inside the desktop viewport using React Portal
 * FIXED: Ensures bp-web-widget container is created before Botpress initialization
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
          contain: layout style paint size;
          transform: translateZ(0);
          will-change: auto;
        `;

        // Insert as first child to minimize layout impact
        if (targetContainer.firstChild) {
          targetContainer.insertBefore(portal, targetContainer.firstChild);
        } else {
          targetContainer.appendChild(portal);
        }

        console.log(
          "Created portal container inside:",
          targetContainer.className
        );
      }

      // CRITICAL: Create bp-web-widget container inside portal
      let bpContainer = portal.querySelector("#bp-web-widget");
      if (!bpContainer) {
        bpContainer = document.createElement("div");
        bpContainer.id = "bp-web-widget";
        bpContainer.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 400px;
          height: 600px;
          max-width: 90%;
          max-height: 90%;
          pointer-events: auto;
          z-index: 10;
          display: block;
          background: transparent;
        `;
        portal.appendChild(bpContainer);
        console.log("Created bp-web-widget container inside portal");
      }

      return portal;
    };

    // Create container immediately
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

    // Cleanup function
    return () => {
      // Only remove if no children remain
      if (
        container &&
        container.parentNode &&
        container.childNodes.length === 0
      ) {
        requestAnimationFrame(() => {
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
        });
      }
    };
  }, []);

  if (!portalContainer) {
    // If no portal container yet, render nothing
    return null;
  }

  // Wrapper to ensure proper positioning
  const portalContent = (
    <div
      style={{
        pointerEvents: "auto",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        transform: "translateZ(0)",
        contain: "layout style paint",
      }}
    >
      {children}
    </div>
  );

  // Use React Portal to render children inside the desktop viewport
  return ReactDOM.createPortal(portalContent, portalContainer);
};

export default DesktopPortalWrapper;
