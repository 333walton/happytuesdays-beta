// ClippyPositioning.js - Centralized positioning logic
// This is the SINGLE source of truth for all Clippy positioning

// Device detection
const isMobile = (() => {
  try {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isSmallScreen = window.innerWidth < 768 || window.innerHeight < 600;
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    return mobileRegex.test(userAgent) || isSmallScreen || isTouchDevice;
  } catch {
    return false;
  }
})();

// ===== SINGLE SOURCE OF TRUTH FOR POSITIONING =====
const CLIPPY_POSITIONS = {
  // Mobile positioning (fixed)
  mobile: {
    position: "fixed",
    bottom: "120px",
    right: "11px", // 15px more to the right than original
    left: "auto",
    top: "auto",
    transform: "translateZ(0) scale(0.8)",
    transformOrigin: "center bottom",
    zIndex: "1500",
  },

  // Desktop positioning (calculated)
  desktop: {
    position: "fixed",
    transform: "translateZ(0) scale(0.9)",
    transformOrigin: "center bottom",
    zIndex: "2000",
    // left and top calculated dynamically
  },

  // Overlay positioning (matches Clippy exactly)
  overlay: {
    position: "fixed",
    background: "transparent",
    cursor: "pointer",
    pointerEvents: "auto",
    // position calculated to match Clippy
  },

  // Touch area expansion (invisible)
  touchPadding: {
    mobile: 20, // 20px invisible padding on mobile
    desktop: 10, // 10px invisible padding on desktop
  },
};

// ===== POSITIONING CALCULATOR =====
class ClippyPositioning {
  static getClippyPosition(customPosition = null) {
    if (isMobile) {
      return CLIPPY_POSITIONS.mobile;
    }

    // Desktop positioning
    const desktop = { ...CLIPPY_POSITIONS.desktop };

    if (customPosition) {
      desktop.left = `${customPosition.x}px`;
      desktop.top = `${customPosition.y}px`;
    } else {
      // Calculate default desktop position
      const calculated = this.calculateDesktopPosition();
      desktop.left = `${calculated.x}px`;
      desktop.top = `${calculated.y}px`;
    }

    return desktop;
  }

  static getOverlayPosition(clippyElement) {
    if (!clippyElement) return null;

    const rect = clippyElement.getBoundingClientRect();
    const padding =
      CLIPPY_POSITIONS.touchPadding[isMobile ? "mobile" : "desktop"];

    return {
      ...CLIPPY_POSITIONS.overlay,
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      zIndex: isMobile ? "1510" : "2010",
      // Use CSS pseudo-element for touch padding, not positioning
    };
  }

  static getBalloonPosition(clippyElement, balloonType = "speech") {
    if (!clippyElement) {
      return { left: 50, top: 50 }; // Fallback
    }

    const rect = clippyElement.getBoundingClientRect();

    if (isMobile) {
      return this.getMobileBalloonPosition(rect, balloonType);
    } else {
      return this.getDesktopBalloonPosition(rect, balloonType);
    }
  }

  static getMobileBalloonPosition(clippyRect, balloonType) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (balloonType === "chat") {
      // Center chat balloon on mobile
      const balloonWidth = Math.min(320, viewportWidth - 20);
      const balloonHeight = Math.min(280, viewportHeight - 100);

      return {
        left: Math.max(10, (viewportWidth - balloonWidth) / 2),
        top: Math.max(50, (viewportHeight - balloonHeight) / 2),
      };
    } else {
      // Speech balloon - above Clippy
      const balloonWidth = 280;
      const balloonHeight = 120;

      let left = Math.max(
        10,
        Math.min(clippyRect.left - 100, viewportWidth - balloonWidth - 10)
      );

      let top = Math.max(10, clippyRect.top - balloonHeight - 20);

      // If goes above screen, put below Clippy
      if (top < 10) {
        top = clippyRect.bottom + 10;
      }

      return { left, top };
    }
  }

  static getDesktopBalloonPosition(clippyRect, balloonType) {
    if (balloonType === "chat") {
      return {
        left: clippyRect.left + clippyRect.width / 2 - 110,
        top: clippyRect.top - 200,
      };
    } else {
      return {
        left: clippyRect.left + clippyRect.width / 2 - 125,
        top: clippyRect.top - 120,
      };
    }
  }

  static calculateDesktopPosition() {
    try {
      const desktop =
        document.querySelector(".desktop.screen") ||
        document.querySelector(".desktop") ||
        document.querySelector(".w98");

      if (desktop) {
        const rect = desktop.getBoundingClientRect();
        const taskbarHeight = 30;
        return {
          x: rect.left + rect.width - 135, // 15px more to the right
          y: rect.top + rect.height - taskbarHeight - 100,
        };
      }
    } catch (error) {
      console.warn("Error calculating desktop position:", error);
    }

    // Fallback position
    return { x: 520, y: 360 };
  }

  // Apply positioning styles to an element
  static applyStyles(element, styles) {
    if (!element) return false;

    try {
      Object.entries(styles).forEach(([key, value]) => {
        element.style[key] = value;
      });
      return true;
    } catch (error) {
      console.error("Error applying styles:", error);
      return false;
    }
  }

  // Main positioning function - call this to position Clippy
  static positionClippy(clippyElement, customPosition = null) {
    if (!clippyElement) return false;

    const position = this.getClippyPosition(customPosition);
    return this.applyStyles(clippyElement, position);
  }

  // Main overlay positioning function
  static positionOverlay(overlayElement, clippyElement) {
    if (!overlayElement || !clippyElement) return false;

    const position = this.getOverlayPosition(clippyElement);
    return this.applyStyles(overlayElement, position);
  }
}

// ===== GLOBAL ACCESS =====
window.ClippyPositioning = ClippyPositioning;

export default ClippyPositioning;
