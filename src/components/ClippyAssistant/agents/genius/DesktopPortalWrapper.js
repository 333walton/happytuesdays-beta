import React from "react";

/**
 * DesktopPortalWrapper
 *
 * Phase 1: Renders children directly, with no overlays or pointer-events issues.
 * Phase 2: You can enable portal logic here to render into a specific container.
 *
 * Usage:
 * <DesktopPortalWrapper>
 *   {children}
 * </DesktopPortalWrapper>
 */
const DesktopPortalWrapper = ({ children, usePortal = false }) => {
  // For Phase 1, simply render children directly.
  // In Phase 2, you can implement portal logic here if needed.
  return children;
};

export default DesktopPortalWrapper;
// Note: This component is a placeholder for future portal logic.
