import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

/**
 * DesktopPortalWrapper - Renders children directly into document.body using React Portal
 * FIXED: Renders as sibling to .clippy element in the same DOM layer
 * ENHANCED: Added future-ready portal infrastructure with fallback mode
 */
const DesktopPortalWrapper = ({
  children,
  portalTarget = null,
  fallbackMode = true,
}) => {
  const [portalContainer, setPortalContainer] = useState(null);

  useEffect(() => {
    // If using a custom portal target
    if (portalTarget && !fallbackMode) {
      const target = document.getElementById(portalTarget);
      if (target) {
        setPortalContainer(target);
        return;
      }
    }

    // Create portal container as direct child of body
    const findOrCreatePortalContainer = () => {
      // Check if portal container already exists
      let portal = document.body.querySelector("#genius-chat-portal");

      if (!portal) {
        // Create portal container
        portal = document.createElement("div");
        portal.id = "genius-chat-portal";
        portal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2000;
          overflow: visible;
          transform: translateZ(0);
          will-change: auto;
        `;

        // Append directly to body, making it a sibling to .clippy
        document.body.appendChild(portal);

        console.log("Created portal container as direct child of body");
      }

      // CRITICAL: Create bp-web-widget container inside portal
      let bpContainer = portal.querySelector("#bp-web-widget");
      if (!bpContainer) {
        bpContainer = document.createElement("div");
        bpContainer.id = "bp-web-widget";
        bpContainer.style.cssText = `
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 400px;
          height: 600px;
          pointer-events: auto;
          z-index: 2000;
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
  }, [portalTarget, fallbackMode]);

  // If in fallback mode without a portal container, render directly
  if (fallbackMode && !portalContainer && !portalTarget) {
    return <div className="genius-chat-container">{children}</div>;
  }

  // If no portal container available, render nothing
  if (!portalContainer) {
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
