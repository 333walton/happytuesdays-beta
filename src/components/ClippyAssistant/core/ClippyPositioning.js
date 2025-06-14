// ClippyPositioning.js - Optimized with modular mobile handling
// This is the SINGLE source of truth for all Clippy positioning

// Import mobile modules
import {
  calculateMobilePosition,
  enforceMobileBoundaries,
  applyMobilePosition,
  positionMobileOverlay,
} from "../interactions/MobilePositioning";

// Optimized logging system with reduced frequency
const isDev = process.env.NODE_ENV === "development";
const VERBOSE_LOGGING = false; // Set to true for detailed debugging

const devLog = (message, data = null, forceLog = false) => {
  if (isDev && (VERBOSE_LOGGING || forceLog)) {
    if (data) {
      console.log(`🎯 ClippyPositioning: ${message}`, data);
    } else {
      console.log(`🎯 ClippyPositioning: ${message}`);
    }
  }
};

let lastErrorTime = 0;
const errorLog = (message, error = null) => {
  const now = Date.now();
  if (now - lastErrorTime > 1000) {
    if (error) {
      console.error(`❌ ClippyPositioning Error: ${message}`, error);
    } else {
      console.error(`❌ ClippyPositioning Error: ${message}`);
    }
    lastErrorTime = now;
  }
};

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

// iOS Safari detection (more refined)
const isIOSSafari = (() => {
  try {
    const userAgent = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent);

    // More comprehensive check for common non-Safari browser indicators on iOS
    const isLikelyNotSafari =
      /CriOS\/|FxiOS\/|EdgiOS\/|OPiOS\/|Coast\/|AlohaBrowser\/|Vivaldi\/|DuckDuckGo\//.test(
        userAgent
      );

    return isIOS && isSafari && !isLikelyNotSafari;
  } catch {
    return false;
  }
})();

// Google App on iOS detection
const isGoogleAppOnIOS = (() => {
  try {
    const userAgent = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isGoogleApp = /GSA\//.test(userAgent);
    return isIOS && isGoogleApp;
  } catch {
    return false;
  }
})();

// ===== SINGLE SOURCE OF TRUTH FOR POSITIONING =====
const CLIPPY_POSITIONS = {
  // Mobile positioning (dynamic-ready)
  mobile: {
    position: "fixed",
    transform: "translateZ(0) scale(1)",
    transformOrigin: "center bottom",
    zIndex: "1500",
  },

  // Desktop positioning (calculated)
  desktop: {
    position: "fixed",
    transform: "translateZ(0) scale(0.95)",
    transformOrigin: "center bottom",
    zIndex: "2000",
  },

  // MOBILE positioning values (centralized) - Keep for reference but calculations will use fixed values
  mobileValues: {
    bottom: 120,
    right: 11,
    scale: 1,
  },

  // DESKTOP positioning values (centralized)
  desktopValues: {
    rightOffset: 120,
    bottomOffset: 100,
    taskbarHeight: 30,
    scale: 0.95,
  },

  // Overlay positioning (matches Clippy exactly)
  overlay: {
    position: "fixed",
    background: "transparent",
    cursor: "pointer",
    pointerEvents: "auto",
  },

  // Touch area expansion (invisible)
  touchPadding: {
    mobile: 20,
    desktop: 10,
  },
};

// PHASE 4: Agent-specific dimension and positioning configurations
const AGENT_DIMENSIONS = {
  Clippy: {
    width: 124,
    height: 93,
    scale: { mobile: 1.0, desktop: 0.95 },
    positioning: {
      mobile: { rightOffset: 11, bottomOffset: 120 },
      desktop: { rightOffset: 120, bottomOffset: 100 },
    },
  },
  Links: {
    width: 132, // Slightly wider than Clippy
    height: 98, // Slightly taller than Clippy
    scale: { mobile: 0.95, desktop: 0.9 }, // Slightly smaller scale to fit
    positioning: {
      mobile: { rightOffset: 8, bottomOffset: 125 }, // Adjusted for size
      desktop: { rightOffset: 125, bottomOffset: 105 },
    },
  },
  Bonzi: {
    width: 140, // Wider character
    height: 110, // Taller character
    scale: { mobile: 0.88, desktop: 0.85 }, // Scaled down to fit
    positioning: {
      mobile: { rightOffset: 5, bottomOffset: 130 }, // More spacing needed
      desktop: { rightOffset: 130, bottomOffset: 110 },
    },
  },
  Genie: {
    width: 128,
    height: 105, // Taller due to lamp/hat
    scale: { mobile: 0.92, desktop: 0.88 },
    positioning: {
      mobile: { rightOffset: 9, bottomOffset: 125 },
      desktop: { rightOffset: 122, bottomOffset: 105 },
    },
  },
  Genius: {
    width: 126,
    height: 96,
    scale: { mobile: 0.96, desktop: 0.92 },
    positioning: {
      mobile: { rightOffset: 10, bottomOffset: 122 },
      desktop: { rightOffset: 121, bottomOffset: 102 },
    },
  },
  Merlin: {
    width: 135, // Wider due to robes
    height: 108, // Taller due to hat
    scale: { mobile: 0.9, desktop: 0.86 },
    positioning: {
      mobile: { rightOffset: 7, bottomOffset: 128 },
      desktop: { rightOffset: 127, bottomOffset: 108 },
    },
  },
  F1: {
    width: 118, // Race car is lower/wider
    height: 85, // Lower profile
    scale: { mobile: 1.02, desktop: 0.98 }, // Slightly larger since it's smaller
    positioning: {
      mobile: { rightOffset: 13, bottomOffset: 115 },
      desktop: { rightOffset: 118, bottomOffset: 95 },
    },
  },
};

// PHASE 4: Get agent-specific dimensions and positioning
const getAgentConfig = (agentName = "Clippy") => {
  return AGENT_DIMENSIONS[agentName] || AGENT_DIMENSIONS.Clippy;
};

const getAgentDimensions = (agentName = "Clippy") => {
  const config = getAgentConfig(agentName);
  return {
    width: config.width,
    height: config.height,
    scaledWidth: {
      mobile: config.width * config.scale.mobile,
      desktop: config.width * config.scale.desktop,
    },
    scaledHeight: {
      mobile: config.height * config.scale.mobile,
      desktop: config.height * config.scale.desktop,
    },
  };
};

const getAgentScale = (agentName = "Clippy", isMobile = false) => {
  const config = getAgentConfig(agentName);
  return isMobile ? config.scale.mobile : config.scale.desktop;
};

const getAgentPositioning = (agentName = "Clippy", isMobile = false) => {
  const config = getAgentConfig(agentName);
  return isMobile ? config.positioning.mobile : config.positioning.desktop;
};

// ===== ZOOM-AWARE REAL-TIME RESIZE HANDLING SYSTEM =====
class ZoomAwareResizeHandler {
  constructor() {
    this.listeners = new Set();
    this.isListening = false;
    this.animationFrameId = null;
    this.lastWidth = window.innerWidth;
    this.lastHeight = window.innerHeight;
    this.orientationChangeTimeout = null;
    this.iosViewportHeight = window.innerHeight;
    this.iosViewportChangeTimeout = null;
    this.zoomLevelAnchors = new Map();
    this.currentZoomLevel = 0;
    this.isResizing = false;

    this.handleResizeImmediate = this.handleResizeImmediate.bind(this);
    this.handleOrientationChange = this.handleOrientationChange.bind(this);
    this.handleIOSViewportChange = this.handleIOSViewportChange.bind(this);
    this.checkForResize = this.checkForResize.bind(this);
  }

  addListener(callback) {
    this.listeners.add(callback);
    this.startListening();
  }

  removeListener(callback) {
    this.listeners.delete(callback);
    if (this.listeners.size === 0) {
      this.stopListening();
      this.zoomLevelAnchors.clear();
      this.currentZoomLevel = 0;
    }
  }

  cacheClippyAnchorPosition(clippyElement, zoomLevel = null) {
    if (!clippyElement) return false;

    const currentZoom =
      zoomLevel !== null ? zoomLevel : this.getCurrentZoomLevel();

    devLog(`Caching anchor for zoom ${currentZoom}`, null, true);

    const desktop =
      document.querySelector(".desktop.screen") ||
      document.querySelector(".desktop") ||
      document.querySelector(".w98");

    if (!desktop) {
      errorLog("Cannot cache Clippy anchor - desktop not found");
      return false;
    }

    const desktopRect = desktop.getBoundingClientRect();
    const baseClippyWidth = 124;
    const baseClippyHeight = 93;
    const zoomFactor = this.getZoomFactorForLevel(currentZoom);
    const baseScale = isMobile ? 1 : 0.95;
    const scaledClippyWidth = baseClippyWidth * baseScale * zoomFactor;
    const scaledClippyHeight = baseClippyHeight * baseScale * zoomFactor;

    const rightOffset = 120;
    const bottomOffset = 100;
    const taskbarHeight = 30;

    const safeLeft = desktopRect.left + desktopRect.width - rightOffset;
    const safeTop =
      desktopRect.top + desktopRect.height - taskbarHeight - bottomOffset;

    const zoomAnchorData = {
      zoomLevel: currentZoom,
      timestamp: Date.now(),
      zoomFactor: zoomFactor,
      fromDesktopRightPercent: rightOffset / desktopRect.width,
      fromDesktopBottomPercent:
        (taskbarHeight + bottomOffset) / desktopRect.height,
      fromDesktopLeftPercent:
        (desktopRect.width - rightOffset) / desktopRect.width,
      fromDesktopTopPercent:
        (desktopRect.height - taskbarHeight - bottomOffset) /
        desktopRect.height,
      safeLeft: safeLeft,
      safeTop: safeTop,
      rightOffset: rightOffset,
      bottomOffset: bottomOffset,
      taskbarHeight: taskbarHeight,
      expectedWidth: scaledClippyWidth,
      expectedHeight: scaledClippyHeight,
      desktopRect: { ...desktopRect },
    };

    this.zoomLevelAnchors.set(currentZoom, zoomAnchorData);
    this.currentZoomLevel = currentZoom;

    // Only log anchor caching in verbose mode
    devLog(`Cached anchor for zoom ${currentZoom}`, {
      zoomFactor,
      expectedSize: `${scaledClippyWidth.toFixed(
        1
      )}x${scaledClippyHeight.toFixed(1)}`,
      position: `(${safeLeft.toFixed(1)}, ${safeTop.toFixed(1)})`,
    });
    return true;
  }

  getZoomFactorForLevel(zoomLevel) {
    switch (zoomLevel) {
      case 1:
        return 1.1;
      case 2:
        return 1.25;
      default:
        return 1.0;
    }
  }

  getAnchoredPosition(zoomLevel = null) {
    const currentZoom =
      zoomLevel !== null ? zoomLevel : this.getCurrentZoomLevel();
    const anchorData = this.zoomLevelAnchors.get(currentZoom);

    if (!anchorData) {
      errorLog(`No anchor data cached for zoom level ${currentZoom}`);
      return null;
    }

    const desktop =
      document.querySelector(".desktop.screen") ||
      document.querySelector(".desktop") ||
      document.querySelector(".w98");

    if (!desktop) {
      errorLog("Desktop viewport not found for anchored positioning");
      return null;
    }

    const currentDesktopRect = desktop.getBoundingClientRect();
    const rightOffset = anchorData.rightOffset || 120;
    const bottomOffset = anchorData.bottomOffset || 100;
    const taskbarHeight = anchorData.taskbarHeight || 30;

    const anchoredPosition = {
      left: currentDesktopRect.left + currentDesktopRect.width - rightOffset,
      top:
        currentDesktopRect.top +
        currentDesktopRect.height -
        taskbarHeight -
        bottomOffset,
      zoomLevel: currentZoom,
      appliedWidth: anchorData.expectedWidth,
      appliedHeight: anchorData.expectedHeight,
    };

    // Only log position calculations in verbose mode
    devLog(`Calculated anchored position for zoom ${currentZoom}`, {
      position: `(${anchoredPosition.left.toFixed(
        1
      )}, ${anchoredPosition.top.toFixed(1)})`,
      desktop: `${currentDesktopRect.width}x${currentDesktopRect.height}`,
    });

    return anchoredPosition;
  }

  clearZoomAnchor(zoomLevel = null) {
    if (zoomLevel !== null) {
      this.zoomLevelAnchors.delete(zoomLevel);
      devLog(`Cleared anchor cache for zoom level ${zoomLevel}`);
    } else {
      this.zoomLevelAnchors.clear();
      devLog("Cleared all zoom level anchor caches");
    }
  }

  handleZoomChange(newZoomLevel, clippyElement) {
    const oldZoomLevel = this.currentZoomLevel;

    if (oldZoomLevel !== newZoomLevel) {
      devLog(`Zoom change: ${oldZoomLevel} → ${newZoomLevel}`, null, true);

      this.currentZoomLevel = newZoomLevel;
      this.clearZoomAnchor(newZoomLevel);

      if (clippyElement) {
        const newAnchorSuccess = this.cacheClippyAnchorPosition(
          clippyElement,
          newZoomLevel
        );

        if (newAnchorSuccess) {
          this.notifyListeners("zoom-change-immediate", {
            oldZoomLevel,
            newZoomLevel,
            type: "zoom-change-immediate",
            requiresImmedateUpdate: true,
          });
        }
      }

      this.notifyListeners("zoom-change", {
        oldZoomLevel,
        newZoomLevel,
        type: "zoom-change",
      });
    }
  }

  getCurrentZoomLevel() {
    try {
      const dataZoom = parseInt(document.body.getAttribute("data-zoom")) || 0;
      if (dataZoom >= 0) {
        return dataZoom;
      }

      const monitorContainer = document.querySelector(".monitor-container");
      if (monitorContainer?.classList.contains("zoomed")) {
        const transform = window.getComputedStyle(monitorContainer).transform;
        if (transform && transform !== "none") {
          const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
          if (matrixMatch) {
            const values = matrixMatch[1].split(",");
            const factor = parseFloat(values[0]) || 1.0;

            if (Math.abs(factor - 1.25) < 0.01) return 2;
            if (Math.abs(factor - 1.1) < 0.01) return 1;
            return 0;
          }
        }
      }

      return 0;
    } catch (error) {
      errorLog("Error getting current zoom level", error);
      return 0;
    }
  }

  startListening() {
    if (this.isListening) return;

    this.isListening = true;

    window.addEventListener("resize", this.handleResizeImmediate, {
      passive: true,
    });
    this.startRealTimeMonitoring();

    if (isMobile) {
      window.addEventListener(
        "orientationchange",
        this.handleOrientationChange,
        { passive: true }
      );

      if (isIOSSafari) {
        window.addEventListener("scroll", this.handleIOSViewportChange, {
          passive: true,
        });
        if (window.visualViewport) {
          window.visualViewport.addEventListener(
            "resize",
            this.handleIOSViewportChange,
            { passive: true }
          );
        }
      }
    }
  }

  stopListening() {
    if (!this.isListening) return;

    this.isListening = false;

    window.removeEventListener("resize", this.handleResizeImmediate);
    window.removeEventListener(
      "orientationchange",
      this.handleOrientationChange
    );

    if (isIOSSafari) {
      window.removeEventListener("scroll", this.handleIOSViewportChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          this.handleIOSViewportChange
        );
      }
    }

    this.stopRealTimeMonitoring();

    if (this.orientationChangeTimeout) {
      clearTimeout(this.orientationChangeTimeout);
    }
    if (this.iosViewportChangeTimeout) {
      clearTimeout(this.iosViewportChangeTimeout);
    }

    this.zoomLevelAnchors.clear();
    this.currentZoomLevel = 0;
  }

  startRealTimeMonitoring() {
    this.checkForResize();
  }

  stopRealTimeMonitoring() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.isResizing = false;
  }

  checkForResize() {
    if (!this.isListening) return;

    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;

    if (currentWidth !== this.lastWidth || currentHeight !== this.lastHeight) {
      this.isResizing = true;

      this.notifyListeners("realtime-resize", {
        width: currentWidth,
        height: currentHeight,
        type: "realtime-resize",
        isResizing: true,
      });

      this.lastWidth = currentWidth;
      this.lastHeight = currentHeight;
    } else if (this.isResizing) {
      this.isResizing = false;
      this.notifyListeners("resize-complete", {
        width: currentWidth,
        height: currentHeight,
        type: "resize-complete",
        isResizing: false,
      });
    }

    this.animationFrameId = requestAnimationFrame(this.checkForResize);
  }

  handleResizeImmediate() {
    this.isResizing = true;

    this.notifyListeners("resize-start", {
      width: window.innerWidth,
      height: window.innerHeight,
      type: "resize-start",
      isResizing: true,
    });
  }

  handleOrientationChange() {
    if (this.orientationChangeTimeout) {
      clearTimeout(this.orientationChangeTimeout);
    }

    this.orientationChangeTimeout = setTimeout(() => {
      this.notifyListeners("orientationchange", {
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: window.orientation || 0,
        type: "orientationchange",
      });
    }, 500);
  }

  handleIOSViewportChange() {
    if (this.iosViewportChangeTimeout) {
      clearTimeout(this.iosViewportChangeTimeout);
    }

    this.iosViewportChangeTimeout = setTimeout(() => {
      const currentHeight = window.innerHeight;

      if (Math.abs(currentHeight - this.iosViewportHeight) > 50) {
        this.iosViewportHeight = currentHeight;

        this.notifyListeners("iosviewport", {
          width: window.innerWidth,
          height: currentHeight,
          type: "iosviewport",
        });
      }
    }, 100);
  }

  notifyListeners(eventType, data) {
    this.listeners.forEach((callback) => {
      try {
        callback(eventType, data);
      } catch (error) {
        errorLog("Error in resize listener", error);
      }
    });
  }
}

// Global zoom-aware resize handler instance
const resizeHandler = new ZoomAwareResizeHandler();

// ===== POSITIONING CALCULATOR =====
class ClippyPositioning {
  static getClippyPosition(customPosition = null, agentName = null) {
    if (isMobile) {
      return this.calculateMobilePosition(null, agentName);
    }

    const desktop = { ...CLIPPY_POSITIONS.desktop };
    const zoomFactor = this.getMonitorZoomFactor();

    // PHASE 4: Use agent-specific scale
    const agentScale = getAgentScale(agentName || "Clippy", isMobile);
    const adjustedScale = agentScale * zoomFactor;
    desktop.transform = `translateZ(0) scale(${adjustedScale})`;

    if (customPosition) {
      desktop.left = `${customPosition.x}px`;
      desktop.top = `${customPosition.y}px`;
    } else {
      const calculated = this.calculateDesktopPosition(agentName);
      desktop.left = `${calculated.x}px`;
      desktop.top = `${calculated.y}px`;
    }

    return desktop;
  }

  static calculateMobilePosition(taskbarHeight = 26, agentName = "Clippy") {
    // PHASE 4: Use agent-specific mobile positioning
    const agentConfig = getAgentConfig(agentName);
    const agentPositioning = agentConfig.positioning.mobile;
    const agentScale = agentConfig.scale.mobile;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const clippyWidth = agentConfig.width * agentScale;
    const clippyHeight = agentConfig.height * agentScale;
    const gapAboveTaskbar = 13; // Adjusted gap above taskbar
    const gapFromRight = agentPositioning.rightOffset || 4;

    // Try to detect the taskbar notification area
    const taskbarNotifications = document.querySelector(
      ".TaskBar__notifications"
    );
    let bottom, right;

    if (taskbarNotifications) {
      const taskbarRect = taskbarNotifications.getBoundingClientRect();
      // Distance from bottom of viewport to top of taskbar
      const taskbarFromBottom = viewportHeight - taskbarRect.top;
      bottom = taskbarFromBottom + gapAboveTaskbar;
      right = gapFromRight;
    } else {
      // Use agent-specific positioning values as fallback
      bottom = agentPositioning.bottomOffset;
      right = gapFromRight;

      // Browser-specific adjustments
      if (isIOSSafari) {
        bottom += 30;
      } else if (window.navigator.userAgent.includes("CriOS")) {
        bottom += 15;
        right += 3;
      } else if (isGoogleAppOnIOS) {
        bottom -= 30;
      }
    }

    // Constrain to viewport (never off-screen)
    bottom = Math.max(10, Math.min(bottom, viewportHeight - clippyHeight - 10));
    right = Math.max(4, Math.min(right, viewportWidth - clippyWidth - 4));

    devLog(`Mobile position for ${agentName}:`, {
      dimensions: `${clippyWidth.toFixed(1)}x${clippyHeight.toFixed(1)}`,
      scale: agentScale,
      position: `bottom=${bottom}px, right=${right}px`,
    });

    return {
      position: "fixed",
      bottom: `${bottom}px`,
      right: `${right}px`,
      left: "auto",
      top: "auto",
      transform: `translateZ(0) scale(${agentScale})`,
      transformOrigin: "center bottom",
      zIndex: "1500",
    };
  }

  static calculateDesktopPosition(agentName = "Clippy") {
    try {
      const desktop =
        document.querySelector(".desktop.screen") ||
        document.querySelector(".desktop") ||
        document.querySelector(".w98");

      if (desktop) {
        const rect = desktop.getBoundingClientRect();
        const values = CLIPPY_POSITIONS.desktopValues;

        const monitorContainer = document.querySelector(".monitor-container");
        let zoomFactor = 1.0;

        if (monitorContainer) {
          const transform = window.getComputedStyle(monitorContainer).transform;
          if (transform && transform !== "none") {
            const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
            if (matrixMatch) {
              const values = matrixMatch[1].split(",");
              zoomFactor = parseFloat(values[0]) || 1.0;
            }
          }

          if (monitorContainer.classList.contains("zoomed")) {
            const zoomLevel =
              parseInt(document.body.getAttribute("data-zoom")) || 0;
            switch (zoomLevel) {
              case 1:
                zoomFactor = 1.1;
                break;
              case 2:
                zoomFactor = 1.25;
                break;
              default:
                zoomFactor = 1.0;
                break;
            }
          }
        }

        // EDGE-ALIGNED POSITIONING: Bottom edge = taskbar top, Right edge = desktop right
        const agentConfig = getAgentConfig(agentName);
        const agentScale = getAgentScale(agentName, false); // false = desktop
        const actualScale = agentScale * zoomFactor;

        // Calculate agent's actual rendered dimensions
        const actualWidth = agentConfig.width * actualScale;
        const actualHeight = agentConfig.height * actualScale;

        const basePosition = {
          x: rect.left + rect.width - actualWidth, // Right edge aligned to desktop right
          y: rect.top + rect.height - values.taskbarHeight - actualHeight, // Bottom edge aligned to taskbar top
        };

        devLog(`Desktop position for ${agentName}:`, {
          dimensions: `${agentConfig.width}×${agentConfig.height}`,
          scale: actualScale,
          actualSize: `${actualWidth.toFixed(1)}×${actualHeight.toFixed(1)}`,
          position: `(${basePosition.x.toFixed(1)}, ${basePosition.y.toFixed(
            1
          )})`,
          method: "edge-aligned",
        });

        return basePosition;
      }
    } catch (error) {
      errorLog("Error calculating desktop position", error);
    }

    return { x: 520, y: 360 };
  }

  static getOverlayPosition(clippyElement) {
    if (!clippyElement) return null;

    const rect = clippyElement.getBoundingClientRect();

    return {
      ...CLIPPY_POSITIONS.overlay,
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      zIndex: isMobile ? "1510" : "2010",
    };
  }

  static getBalloonPosition(clippyElement, balloonType = "speech") {
    if (!clippyElement) {
      return { left: 50, top: 50 };
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
    const safeMargin = 15;

    // Overlay height logic (used for mobile, ignored for desktop)
    const overlayEl = document.getElementById("clippy-clickable-overlay");
    const overlayRect = overlayEl
      ? overlayEl.getBoundingClientRect()
      : clippyRect;
    const clippyHeight = clippyRect.height;
    const overlayHeight = overlayRect.height;
    const effectiveClippyHeight = Math.max(clippyHeight, overlayHeight);
    const effectiveClippyTop = Math.min(clippyRect.top, overlayRect.top);

    if (isMobile) {
      // Mobile logic
      if (balloonType === "chat") {
        const balloonWidth = Math.min(300, viewportWidth - 40);
        const balloonHeight = Math.min(220, viewportHeight - 150);
        let left = Math.max(
          safeMargin,
          (viewportWidth - balloonWidth) / 2 - 20
        );
        let top = effectiveClippyTop - balloonHeight - 40;
        if (top < safeMargin) {
          top = safeMargin;
          left =
            clippyRect.right > viewportWidth / 2
              ? safeMargin
              : viewportWidth - balloonWidth - safeMargin;
        }
        return { left, top };
      } else {
        // Speech balloon
        const balloonWidth = Math.min(260, viewportWidth - 40);
        const balloonHeight = 100;
        let left = clippyRect.left + clippyRect.width / 2 - balloonWidth / 2;
        let top = effectiveClippyTop - balloonHeight - 30;
        left = Math.max(
          safeMargin,
          Math.min(left, viewportWidth - balloonWidth - safeMargin)
        );
        if (top < safeMargin) {
          top = effectiveClippyTop - 20;
          if (clippyRect.left > balloonWidth + 30) {
            left = clippyRect.left - balloonWidth - 20;
          } else {
            left = clippyRect.right + 20;
            if (left + balloonWidth > viewportWidth - safeMargin) {
              left = (viewportWidth - balloonWidth) / 2;
              top = safeMargin;
            }
          }
        }
        return { left, top };
      }
    } else {
      // Desktop logic
      if (balloonType === "chat") {
        const balloonWidth = 320;
        const balloonHeight = 200;
        let left = clippyRect.left + clippyRect.width / 2 - 110;
        let top = clippyRect.top - 200;
        left = Math.max(10, Math.min(left, viewportWidth - balloonWidth - 10));
        top = Math.max(10, Math.min(top, viewportHeight - balloonHeight - 10));
        return { left, top };
      } else {
        const balloonWidth = 280;
        const balloonHeight = 120;
        let left = clippyRect.left + clippyRect.width / 2 - 125;
        let top = clippyRect.top - 120;
        left = Math.max(10, Math.min(left, viewportWidth - balloonWidth - 10));
        top = Math.max(10, Math.min(top, viewportHeight - balloonHeight - 10));
        return { left, top };
      }
    }
  }

  static applyStyles(element, styles) {
    if (!element) return false;

    try {
      Object.entries(styles).forEach(([key, value]) => {
        element.style[key] = value;
      });

      if (styles.transform) {
        const actualTransform = element.style.transform;
        if (actualTransform !== styles.transform) {
          element.style.setProperty("transform", styles.transform, "important");
        }
      }

      return true;
    } catch (error) {
      errorLog("Error applying styles", error);
      return false;
    }
  }

  // iOS Safari Performance Optimization: Cancel all animations immediately
  static cancelAllAnimations(clippyElement) {
    if (!clippyElement) return;

    // Stop Clippy animations immediately
    if (window.clippy && window.clippy.stop) {
      window.clippy.stop();
    }

    // Cancel CSS animations and transitions
    clippyElement.style.transition = "none";
    clippyElement.style.animation = "none";
    clippyElement.style.animationPlayState = "paused";

    // Force immediate style application for iOS Safari
    void clippyElement.offsetHeight; // Trigger reflow

    if (isIOSSafari && VERBOSE_LOGGING && isDev) {
      devLog("iOS Safari animations cancelled for drag performance");
    }
  }

  // Enhanced mobile drag handling optimized for iOS Safari
  static optimizedIOSMobileDrag(
    clippyElement,
    overlayElement,
    newPosition,
    isDragging = true
  ) {
    if (!clippyElement || !isMobile) return false;

    try {
      // CRITICAL: Cancel all animations immediately for iOS Safari
      this.cancelAllAnimations(clippyElement);

      // Apply position with maximum iOS Safari performance
      const boundedPosition = this.enforceMobileBoundaries(newPosition);

      // Direct style application - fastest method for iOS Safari
      clippyElement.style.cssText = `
        position: fixed !important;
        right: ${boundedPosition.rightPx}px !important;
        bottom: ${boundedPosition.bottomPx}px !important;
        left: auto !important;
        top: auto !important;
        transform: translateZ(0) scale(${isDragging ? "1.05" : "1"}) !important;
        transform-origin: center bottom !important;
        z-index: ${isDragging ? "1550" : "1500"} !important;
        transition: none !important;
        animation: none !important;
        will-change: transform, right, bottom !important;
        backface-visibility: hidden !important;
        touch-action: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      `;

      // Sync overlay immediately
      if (overlayElement) {
        overlayElement.style.cssText = `
          position: fixed !important;
          right: ${boundedPosition.rightPx}px !important;
          bottom: ${boundedPosition.bottomPx}px !important;
          left: auto !important;
          top: auto !important;
          width: 124px !important;
          height: 93px !important;
          background: transparent !important;
          pointer-events: auto !important;
          cursor: pointer !important;
          z-index: ${isDragging ? "1560" : "1510"} !important;
          transition: none !important;
          touch-action: none !important;
          -webkit-touch-callout: none !important;
        `;
      }

      return true;
    } catch (error) {
      errorLog("Error in optimized iOS mobile drag", error);
      return false;
    }
  }

  static applyAnchoredPosition(clippyElement) {
    if (!clippyElement) return false;

    const currentZoomLevel = resizeHandler.getCurrentZoomLevel();
    const anchoredPos = resizeHandler.getAnchoredPosition(currentZoomLevel);

    if (!anchoredPos) {
      errorLog(
        `Cannot apply anchored position - no anchor cached for zoom ${currentZoomLevel}`
      );
      const anchorCreated = resizeHandler.cacheClippyAnchorPosition(
        clippyElement,
        currentZoomLevel
      );
      if (anchorCreated) {
        const newAnchoredPos =
          resizeHandler.getAnchoredPosition(currentZoomLevel);
        if (newAnchoredPos) {
          return this.applyCalculatedPosition(
            clippyElement,
            newAnchoredPos,
            currentZoomLevel
          );
        }
      }
      return false;
    }

    return this.applyCalculatedPosition(
      clippyElement,
      anchoredPos,
      currentZoomLevel
    );
  }

  static applyCalculatedPosition(clippyElement, positionData, zoomLevel) {
    const zoomFactor = this.getMonitorZoomFactor();
    const adjustedScale = CLIPPY_POSITIONS.desktopValues.scale * zoomFactor;

    const anchoredStyles = {
      position: "fixed",
      left: `${positionData.left}px`,
      top: `${positionData.top}px`,
      right: "auto",
      bottom: "auto",
      transform: `translateZ(0) scale(${adjustedScale})`,
      transformOrigin: "center bottom",
      zIndex: "2000",
    };

    const success = this.applyStyles(clippyElement, anchoredStyles);

    if (success) {
      clippyElement.classList.add("clippy-anchored");
      clippyElement.setAttribute("data-zoom-anchored", zoomLevel.toString());

      devLog(`Applied anchored position for zoom ${zoomLevel}`, {
        position: `(${positionData.left.toFixed(1)}, ${positionData.top.toFixed(
          1
        )})`,
        scale: adjustedScale,
      });
    }

    return success;
  }

  static getMonitorZoomFactor() {
    try {
      const dataZoom = parseInt(document.body.getAttribute("data-zoom")) || 0;

      if (dataZoom >= 0) {
        let factor;
        switch (dataZoom) {
          case 1:
            factor = 1.1;
            break;
          case 2:
            factor = 1.25;
            break;
          default:
            factor = 1.0;
            break;
        }
        return factor;
      }

      const monitorContainer = document.querySelector(".monitor-container");

      if (!monitorContainer) {
        return 1.0;
      }

      if (monitorContainer.classList.contains("zoomed")) {
        const transform = window.getComputedStyle(monitorContainer).transform;

        if (transform && transform !== "none") {
          const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
          if (matrixMatch) {
            const values = matrixMatch[1].split(",");
            const factor = parseFloat(values[0]) || 1.0;
            return factor;
          }
        }
      }

      return 1.0;
    } catch (error) {
      errorLog("Error getting monitor zoom factor", error);
      return 1.0;
    }
  }

  static forceImmediateZoomPositioning(clippyElement, newZoomLevel) {
    if (!clippyElement) {
      errorLog("Cannot force positioning: Clippy element not provided");
      return false;
    }

    devLog(`Forcing immediate positioning for zoom ${newZoomLevel}`);

    try {
      resizeHandler.clearZoomAnchor(newZoomLevel);

      const desktop =
        document.querySelector(".desktop.screen") ||
        document.querySelector(".desktop") ||
        document.querySelector(".w98");

      if (!desktop) {
        errorLog("Desktop viewport not found for positioning");
        return false;
      }

      const desktopRect = desktop.getBoundingClientRect();

      let zoomFactor = 1.0;
      switch (newZoomLevel) {
        case 1:
          zoomFactor = 1.1;
          break;
        case 2:
          zoomFactor = 1.25;
          break;
        default:
          zoomFactor = 1.0;
          break;
      }

      const adjustedScale = CLIPPY_POSITIONS.desktopValues.scale * zoomFactor;
      const rightOffset = 120;
      const bottomOffset = 100;
      const taskbarHeight = 30;

      const correctLeft = desktopRect.left + desktopRect.width - rightOffset;
      const correctTop =
        desktopRect.top + desktopRect.height - taskbarHeight - bottomOffset;

      const correctStyles = {
        position: "fixed",
        left: `${correctLeft}px`,
        top: `${correctTop}px`,
        right: "auto",
        bottom: "auto",
        transform: `translateZ(0) scale(${adjustedScale})`,
        transformOrigin: "center bottom",
        zIndex: "2000",
        visibility: "visible",
        opacity: "1",
        pointerEvents: "none",
      };

      const success = this.applyStyles(clippyElement, correctStyles);

      if (success) {
        const anchorCached = resizeHandler.cacheClippyAnchorPosition(
          clippyElement,
          newZoomLevel
        );

        clippyElement.classList.add("clippy-anchored");
        clippyElement.setAttribute(
          "data-zoom-anchored",
          newZoomLevel.toString()
        );

        devLog(`Applied positioning for zoom ${newZoomLevel}`, {
          position: `(${correctLeft.toFixed(1)}, ${correctTop.toFixed(1)})`,
          scale: adjustedScale,
          desktop: `${desktopRect.width.toFixed(
            1
          )}x${desktopRect.height.toFixed(1)}`,
          anchorCached: anchorCached ? "yes" : "no",
        });

        return true;
      } else {
        errorLog("Failed to apply positioning styles");
        return false;
      }
    } catch (error) {
      errorLog("Error in forceImmediateZoomPositioning", error);
      return false;
    }
  }

  static positionClippy(
    clippyElement,
    customPosition = null,
    taskbarHeight = 26
  ) {
    if (!clippyElement) return false;

    const currentZoomLevel = resizeHandler.getCurrentZoomLevel();
    // Only log positioning in verbose mode
    devLog(`Positioning Clippy for zoom level ${currentZoomLevel}`);

    if (!isMobile) {
      if (resizeHandler.zoomLevelAnchors.has(currentZoomLevel)) {
        devLog(`Using cached anchor for zoom level ${currentZoomLevel}`);
        return this.applyAnchoredPosition(clippyElement);
      } else {
        devLog(
          `No anchor cached for zoom level ${currentZoomLevel}, creating fresh anchor`
        );
        const anchorCached = resizeHandler.cacheClippyAnchorPosition(
          clippyElement,
          currentZoomLevel
        );

        if (anchorCached) {
          return this.applyAnchoredPosition(clippyElement);
        } else {
          errorLog(
            "Failed to cache anchor, falling back to normal positioning"
          );
        }
      }
    }

    if (isMobile) {
      const position = calculateMobilePosition(customPosition);
      return applyMobilePosition(clippyElement, position, false);
    }

    const position = isMobile
      ? this.calculateMobilePosition(taskbarHeight)
      : this.getClippyPosition(customPosition);
    return this.applyStyles(clippyElement, position);
  }

  static positionOverlay(overlayElement, clippyElement) {
    if (!overlayElement || !clippyElement) return false;

    if (isMobile) {
      return positionMobileOverlay(overlayElement, clippyElement);
    }

    // Simple agent-first approach: overlay matches agent's final position and dimensions
    const position = this.getOverlayPosition(clippyElement);
    if (position) delete position.transform;
    return this.applyStyles(overlayElement, position);
  }

  static ensureInitialOverlayPositioning(overlayElement, clippyElement) {
    if (!overlayElement || !clippyElement) return false;

    devLog("Ensuring initial overlay positioning with scale awareness");

    // Wait for agent's positioning, scaling, and dimensions to be fully established
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 200; // Maximum 2 second wait (increased for reliability)

      const checkAndPosition = () => {
        attempts++;

        const computedStyle = window.getComputedStyle(clippyElement);
        const transform = computedStyle.transform;
        const rect = clippyElement.getBoundingClientRect();

        // Check if agent is properly positioned and scaled
        const hasValidTransform =
          transform && transform !== "none" && transform.includes("scale");
        const hasValidPosition =
          rect.width > 0 && rect.height > 0 && rect.left > 0 && rect.top > 0;
        const isProperlyPositioned =
          hasValidPosition && (isMobile || hasValidTransform);

        // Additional check: ensure agent is visible and has reasonable dimensions
        const hasReasonableDimensions = rect.width > 50 && rect.height > 50; // Agent should be at least 50x50
        const isFullyReady = isProperlyPositioned && hasReasonableDimensions;

        if (attempts <= 5 || attempts % 10 === 0) {
          // Log every 10 attempts after first 5
          devLog(
            `Attempt ${attempts}: transform=${transform}, position=${rect.left.toFixed(
              1
            )},${rect.top.toFixed(1)}, size=${rect.width.toFixed(
              1
            )}x${rect.height.toFixed(1)}, ready=${isFullyReady}`
          );
        }

        if (isFullyReady) {
          // Agent is ready, set up synchronization instead of one-time positioning
          const success = this.setupOverlaySynchronization(
            overlayElement,
            clippyElement
          );
          devLog(
            `Initial overlay synchronization complete: ${
              success ? "success" : "failed"
            }`
          );

          // Verify the overlay was positioned correctly
          if (success) {
            const overlayRect = overlayElement.getBoundingClientRect();
            const agentRect = clippyElement.getBoundingClientRect();
            devLog(
              `Final verification: agent=${agentRect.left.toFixed(
                1
              )},${agentRect.top.toFixed(
                1
              )}, overlay=${overlayRect.left.toFixed(
                1
              )},${overlayRect.top.toFixed(1)}`
            );

            // Double-check alignment
            const leftAligned = Math.abs(agentRect.left - overlayRect.left) < 2;
            const topAligned = Math.abs(agentRect.top - overlayRect.top) < 2;
            devLog(`Alignment check: left=${leftAligned}, top=${topAligned}`);
          }

          resolve(success);
        } else if (attempts >= maxAttempts) {
          // Timeout reached, position anyway
          devLog(
            "Timeout reached, positioning overlay with current agent state"
          );
          const success = this.positionOverlay(overlayElement, clippyElement);
          resolve(success);
        } else {
          // Not ready yet, check again
          setTimeout(checkAndPosition, 10);
        }
      };

      // Start checking immediately
      checkAndPosition();
    });
  }

  // NEW: Force immediate overlay repositioning (for use after agent loads)
  static forceOverlayRepositioning(clippyElement) {
    const overlayElement = document.getElementById("clippy-clickable-overlay");
    if (overlayElement && clippyElement) {
      devLog("Forcing immediate overlay repositioning");
      return this.positionOverlay(overlayElement, clippyElement);
    }
    return false;
  }

  // NEW: Set up automatic overlay synchronization using CSS transforms
  static setupOverlaySynchronization(overlayElement, clippyElement) {
    if (!overlayElement || !clippyElement) return false;

    devLog("Setting up automatic overlay synchronization");

    // Get the initial position relationship
    const position = this.getOverlayPosition(clippyElement);
    if (!position) return false;

    // Apply the position once
    this.applyStyles(overlayElement, position);

    // Make overlay follow Clippy's position using CSS that automatically syncs
    overlayElement.style.cssText = `
      position: fixed !important;
      left: ${position.left} !important;
      top: ${position.top} !important;
      width: ${position.width} !important;
      height: ${position.height} !important;
      background: transparent !important;
      cursor: pointer !important;
      pointer-events: auto !important;
      z-index: ${position.zIndex} !important;
      touch-action: none !important;
    `;

    // Mark as synchronized to avoid unnecessary repositioning
    overlayElement.setAttribute("data-synchronized", "true");
    clippyElement.setAttribute("data-overlay-synced", "true");

    devLog("Overlay synchronization setup complete");
    return true;
  }

  // Check if overlay is already synchronized
  static isOverlaySynchronized(overlayElement) {
    return (
      overlayElement &&
      overlayElement.getAttribute("data-synchronized") === "true"
    );
  }

  // Clear overlay synchronization (force repositioning on next call)
  static clearOverlaySynchronization(overlayElement) {
    if (overlayElement) {
      overlayElement.removeAttribute("data-synchronized");
      devLog("Overlay synchronization cleared - will reposition on next call");
    }
  }

  // Force overlay repositioning for agent changes
  static handleAgentChange(overlayElement, clippyElement, agentName) {
    if (!overlayElement || !clippyElement) return false;

    devLog(
      `Agent change detected: ${agentName} - forcing overlay repositioning`
    );

    // Clear synchronization to force repositioning
    this.clearOverlaySynchronization(overlayElement);

    // Set up new synchronization for this agent
    const success = this.setupOverlaySynchronization(
      overlayElement,
      clippyElement
    );

    if (success) {
      // Mark which agent this overlay is synchronized to
      overlayElement.setAttribute("data-synced-agent", agentName);
      devLog(`Overlay successfully synchronized to agent: ${agentName}`);
    }

    return success;
  }

  static preserveClippyScale(clippyElement) {
    if (!clippyElement) return false;

    try {
      const currentStyle = window.getComputedStyle(clippyElement);
      const currentTransform = currentStyle.transform;

      // Extract current scale from transform
      let currentScale = 0.95; // Default desktop scale
      if (isMobile) {
        currentScale = 1; // Mobile scale
      } else {
        // For desktop, calculate proper scale based on zoom
        const zoomFactor = this.getMonitorZoomFactor();
        currentScale = 0.95 * zoomFactor;
      }

      // Ensure the correct scale is applied
      const correctTransform = `translateZ(0) scale(${currentScale})`;

      if (currentTransform !== correctTransform) {
        clippyElement.style.transform = correctTransform;
        devLog(`Scale corrected: ${currentTransform} → ${correctTransform}`);
        return true;
      }

      return true;
    } catch (error) {
      errorLog("Error preserving Clippy scale", error);
      return false;
    }
  }

  static positionClippyAndOverlay(
    clippyElement,
    overlayElement,
    customPosition = null,
    taskbarHeight = 26
  ) {
    if (!clippyElement) return false;

    const currentZoomLevel = resizeHandler.getCurrentZoomLevel();
    const agentName = clippyElement.getAttribute("data-agent") || "Unknown";
    devLog(
      `Positioning agent ${agentName} and overlay for zoom level ${currentZoomLevel}`
    );

    // ENHANCED: Ensure all agents get the same essential properties as Clippy
    clippyElement.classList.add("clippy");
    clippyElement.classList.add("clippy-anchored");

    // Force positioning properties that all agents should have
    clippyElement.style.position = "fixed";
    clippyElement.style.zIndex = isMobile ? "1500" : "2000";
    clippyElement.style.pointerEvents = "auto";
    clippyElement.style.visibility = "visible";
    clippyElement.style.opacity = "1";
    clippyElement.style.display = "block";

    // FIXED: Preserve current position if agent was already positioned
    let position;
    const hasCustomPosition =
      customPosition &&
      customPosition.x !== undefined &&
      customPosition.y !== undefined;

    if (hasCustomPosition) {
      // Use provided custom position
      position = isMobile
        ? this.calculateMobilePosition(taskbarHeight)
        : this.getClippyPosition(customPosition);
      devLog(
        `Agent ${agentName} using custom position: ${customPosition.x}, ${customPosition.y}`
      );
    } else {
      // Check if agent already has a positioned state - preserve it
      const currentRect = clippyElement.getBoundingClientRect();
      const hasValidCurrentPosition =
        currentRect.width > 0 &&
        currentRect.height > 0 &&
        currentRect.left > 0 &&
        currentRect.top > 0;

      if (
        hasValidCurrentPosition &&
        !clippyElement.classList.contains("clippy-repositioning")
      ) {
        // Agent is already positioned and not in the middle of repositioning - preserve current position
        const currentLeft =
          parseFloat(clippyElement.style.left) || currentRect.left;
        const currentTop =
          parseFloat(clippyElement.style.top) || currentRect.top;

        position = {
          position: "fixed",
          left: `${currentLeft}px`,
          top: `${currentTop}px`,
          right: "auto",
          bottom: "auto",
          transform:
            clippyElement.style.transform ||
            `translateZ(0) scale(${
              isMobile ? 1 : 0.95 * this.getMonitorZoomFactor()
            })`,
          transformOrigin: "center bottom",
          zIndex: isMobile ? "1500" : "2000",
        };

        devLog(
          `Agent ${agentName} preserving current position: ${currentLeft}, ${currentTop}`
        );

        // CRITICAL: Ensure switched agents get position anchoring for resize events
        if (!isMobile && agentName !== "Clippy") {
          const currentZoomLevel = resizeHandler.getCurrentZoomLevel();
          devLog(
            `Creating position anchor for switched agent ${agentName} at zoom level ${currentZoomLevel}`
          );

          // Create anchor cache entry for this agent's preserved position
          resizeHandler.cacheClippyAnchorPosition(
            clippyElement,
            currentZoomLevel
          );

          // Mark as anchored to enable anchor-based positioning during resizes
          clippyElement.classList.add("clippy-anchored");
          clippyElement.setAttribute(
            "data-zoom-anchored",
            currentZoomLevel.toString()
          );
        }
      } else {
        // Calculate new position normally
        position = isMobile
          ? this.calculateMobilePosition(taskbarHeight, agentName)
          : this.getClippyPosition(customPosition, agentName);
        devLog(`Agent ${agentName} calculating new position`);
      }

      // CRITICAL FIX: For Bonzi, always force recalculation to ensure edge alignment
      if (agentName === "Bonzi" && !isMobile) {
        devLog(`Forcing fresh edge-aligned calculation for Bonzi`);
        position = this.getClippyPosition(customPosition, agentName);
      }
    }

    // ENHANCED: Apply comprehensive positioning for all agents
    const clippySuccess = this.applyStyles(clippyElement, position);

    // Ensure proper transform is applied for all agents
    if (clippySuccess) {
      const zoomFactor = this.getMonitorZoomFactor();
      const scale = isMobile ? 1 : 0.95 * zoomFactor;

      // Only update transform if it wasn't already preserved from current position
      if (!position.transform || position.transform.indexOf("scale") === -1) {
        clippyElement.style.transform = `translateZ(0) scale(${scale})`;
      }
      clippyElement.style.transformOrigin = "center bottom";
      clippyElement.style.willChange = "transform";

      devLog(`Agent ${agentName} transform applied: scale(${scale})`);
    }

    if (!isMobile && clippySuccess) {
      // CRITICAL FIX: Ensure all agents get anchor caching, not just when no anchor exists
      if (
        !resizeHandler.zoomLevelAnchors.has(currentZoomLevel) ||
        !clippyElement.classList.contains("clippy-anchored")
      ) {
        devLog(
          `Caching anchor after positioning agent ${agentName} for zoom level ${currentZoomLevel}`
        );
        resizeHandler.cacheClippyAnchorPosition(
          clippyElement,
          currentZoomLevel
        );

        // Mark this agent as anchored for future resize events
        clippyElement.classList.add("clippy-anchored");
        clippyElement.setAttribute(
          "data-zoom-anchored",
          currentZoomLevel.toString()
        );
      } else {
        devLog(
          `Agent ${agentName} already has anchor for zoom level ${currentZoomLevel}`
        );
      }
    }

    // ENHANCED: Improved overlay positioning for all agents
    let overlaySuccess = true;
    if (overlayElement) {
      overlaySuccess = this.positionOverlay(overlayElement, clippyElement);

      // Ensure overlay gets proper z-index for all agents
      if (overlaySuccess) {
        overlayElement.style.zIndex = isMobile ? "1510" : "2010";
        overlayElement.style.background = "transparent";
        overlayElement.style.pointerEvents = "auto";
        overlayElement.style.cursor = "pointer";
        devLog(
          `Agent ${agentName} overlay configured with z-index ${overlayElement.style.zIndex}`
        );
      }
    }

    const success = clippySuccess && overlaySuccess;
    devLog(
      `Agent ${agentName} synchronized positioning: ${
        success ? "success" : "failed"
      }`
    );

    return success;
  }

  // Removed unused: calculateMobilePositionForDrag (not referenced anywhere)

  static applyMobilePosition(clippyElement, position, isDragging = false) {
    // Delegate to the new module
    return applyMobilePosition(clippyElement, position, isDragging);
  }

  static enforceMobileBoundaries(position) {
    // Delegate to the new module
    return enforceMobileBoundaries(position);
  }

  static handleMobileDrag(
    clippyElement,
    overlayElement,
    newPosition,
    isDragging = true
  ) {
    if (!clippyElement || !isMobile) return false;

    try {
      // Use the new mobile positioning functions
      const boundedPosition = enforceMobileBoundaries(newPosition);
      const clippySuccess = applyMobilePosition(
        clippyElement,
        boundedPosition,
        isDragging
      );

      let overlaySuccess = true;
      if (overlayElement) {
        overlaySuccess = positionMobileOverlay(overlayElement, clippyElement);
      }

      return clippySuccess && overlaySuccess;
    } catch (error) {
      errorLog("Error handling mobile drag", error);
      return false;
    }
  }

  static startMobileDrag(clippyElement, overlayElement) {
    if (!clippyElement || !isMobile) return false;

    try {
      clippyElement.classList.add("clippy-dragging");
      document.body.classList.add("clippy-drag-active");

      if (overlayElement) {
        overlayElement.classList.add("overlay-dragging");
      }

      // Remove transitions for smooth dragging
      clippyElement.style.transition = "none";
      if (overlayElement) {
        overlayElement.style.transition = "none";
      }

      return true;
    } catch (error) {
      errorLog("Error starting mobile drag", error);
      return false;
    }
  }

  static endMobileDrag(clippyElement, overlayElement, finalPosition) {
    if (!clippyElement || !isMobile) return false;

    try {
      if (finalPosition) {
        const boundedPosition = enforceMobileBoundaries(finalPosition);
        applyMobilePosition(clippyElement, boundedPosition, false);
      }

      clippyElement.classList.remove("clippy-dragging");
      document.body.classList.remove("clippy-drag-active");

      if (overlayElement) {
        overlayElement.classList.remove("overlay-dragging");
        positionMobileOverlay(overlayElement, clippyElement);
      }

      // Restore transitions
      setTimeout(() => {
        if (clippyElement) {
          clippyElement.style.transition = "";
        }
        if (overlayElement) {
          overlayElement.style.transition = "";
        }
      }, 100);

      return true;
    } catch (error) {
      errorLog("Error ending mobile drag", error);
      return false;
    }
  }

  static applyLockState(clippyElement, isLocked) {
    if (!clippyElement) return false;

    try {
      if (isLocked) {
        clippyElement.classList.add("position-locked");
      } else {
        clippyElement.classList.remove("position-locked");
      }

      return true;
    } catch (error) {
      errorLog("Error applying lock state", error);
      return false;
    }
  }

  static getMobileSafeAreas() {
    try {
      const computedStyle = getComputedStyle(document.documentElement);

      return {
        top:
          parseInt(
            computedStyle.getPropertyValue("env(safe-area-inset-top)")
          ) || 10,
        right:
          parseInt(
            computedStyle.getPropertyValue("env(safe-area-inset-right)")
          ) || 10,
        bottom:
          parseInt(
            computedStyle.getPropertyValue("env(safe-area-inset-bottom)")
          ) || 80,
        left:
          parseInt(
            computedStyle.getPropertyValue("env(safe-area-inset-left)")
          ) || 10,
      };
    } catch (error) {
      return { top: 10, right: 10, bottom: 80, left: 10 };
    }
  }

  static calculateEnhancedMobilePosition(customPosition = null) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const values = CLIPPY_POSITIONS.mobileValues;
    const safeAreas = this.getMobileSafeAreas();

    if (customPosition) {
      return this.enforceMobileBoundaries(customPosition);
    }

    // Use our desired higher position (300px) instead of values.bottom
    const bottomPx = Math.min(
      300, // Fixed higher position
      viewportHeight * 0.2
    );
    const rightPx = Math.min(
      values.right + safeAreas.right,
      viewportWidth * 0.1
    );

    return {
      rightPx,
      bottomPx,
      right: `${rightPx}px`,
      bottom: `${bottomPx}px`,
      position: "fixed",
      transform: "translateZ(0) scale(1)",
      transformOrigin: "center bottom",
      zIndex: "1500",
      left: "auto",
      top: "auto",
    };
  }

  static getExpectedClippyDimensions() {
    const baseWidth = 124;
    const baseHeight = 93;
    const scale = isMobile ? 1 : 0.95;
    return {
      width: baseWidth * scale,
      height: baseHeight * scale,
    };
  }

  // ===== ZOOM-AWARE RESIZE HANDLING METHODS =====

  static startResizeHandling(
    clippyElement,
    overlayElement,
    customPositionGetter = null
  ) {
    if (!clippyElement) {
      errorLog("Cannot start resize handling: Clippy element not provided");
      return false;
    }

    const resizeCallback = (eventType, data) => {
      try {
        if (eventType === "zoom-change-immediate") {
          devLog(
            `Handling immediate zoom change: ${data.oldZoomLevel} → ${data.newZoomLevel}`
          );

          // Mark agent as being repositioned during zoom changes
          clippyElement.classList.add("clippy-repositioning");

          if (isMobile) {
            const customPosition = customPositionGetter
              ? customPositionGetter()
              : null;
            this.positionClippyAndOverlay(
              clippyElement,
              overlayElement,
              customPosition
            );
          } else {
            const newZoomLevel = data.newZoomLevel;

            // CRITICAL FIX: Check if this agent has anchor data for the new zoom level
            const hasAnchor = resizeHandler.zoomLevelAnchors.has(newZoomLevel);
            const isAnchored =
              clippyElement.classList.contains("clippy-anchored");

            if (hasAnchor || isAnchored) {
              devLog(
                `Using anchored positioning for immediate zoom change (hasAnchor: ${hasAnchor}, isAnchored: ${isAnchored})`
              );

              // If agent is marked as anchored but no anchor exists for new zoom, create one
              if (isAnchored && !hasAnchor) {
                devLog(
                  `Creating missing anchor for anchored agent at immediate zoom level ${newZoomLevel}`
                );
                resizeHandler.cacheClippyAnchorPosition(
                  clippyElement,
                  newZoomLevel
                );
              }

              const positioned = this.applyAnchoredPosition(clippyElement);
              if (positioned && overlayElement) {
                this.positionOverlay(overlayElement, clippyElement);
              }
            } else {
              devLog(
                `No anchor available for immediate zoom change, repositioning normally`
              );
              this.positionClippyAndOverlay(
                clippyElement,
                overlayElement,
                null
              );
            }
          }

          // Remove repositioning flag after positioning is complete
          setTimeout(() => {
            clippyElement.classList.remove("clippy-repositioning");
          }, 100);
          return;
        }

        if (eventType === "zoom-change") {
          devLog(
            `Handling zoom change: ${data.oldZoomLevel} → ${data.newZoomLevel}`
          );

          // Mark agent as being repositioned during zoom changes
          clippyElement.classList.add("clippy-repositioning");

          setTimeout(() => {
            if (isMobile) {
              const customPosition = customPositionGetter
                ? customPositionGetter()
                : null;
              this.positionClippyAndOverlay(
                clippyElement,
                overlayElement,
                customPosition
              );
            } else {
              const newZoomLevel = data.newZoomLevel;

              // CRITICAL FIX: Check if this agent has anchor data for the new zoom level
              const hasAnchor =
                resizeHandler.zoomLevelAnchors.has(newZoomLevel);
              const isAnchored =
                clippyElement.classList.contains("clippy-anchored");

              if (hasAnchor || isAnchored) {
                devLog(
                  `Using anchored positioning for zoom change (hasAnchor: ${hasAnchor}, isAnchored: ${isAnchored})`
                );

                // If agent is marked as anchored but no anchor exists for new zoom, create one
                if (isAnchored && !hasAnchor) {
                  devLog(
                    `Creating missing anchor for anchored agent at new zoom level ${newZoomLevel}`
                  );
                  resizeHandler.cacheClippyAnchorPosition(
                    clippyElement,
                    newZoomLevel
                  );
                }

                this.applyAnchoredPosition(clippyElement);
                if (overlayElement) {
                  this.positionOverlay(overlayElement, clippyElement);
                }
              } else {
                devLog(
                  `No anchor available for zoom change, repositioning normally`
                );
                this.positionClippyAndOverlay(
                  clippyElement,
                  overlayElement,
                  null
                );
              }
            }

            // Remove repositioning flag after positioning is complete
            setTimeout(() => {
              clippyElement.classList.remove("clippy-repositioning");
            }, 100);
          }, 50);
          return;
        }

        if (eventType === "realtime-resize" || eventType === "resize-start") {
          // Mark agent as being repositioned during resize operations
          clippyElement.classList.add("clippy-repositioning");

          // Clear overlay synchronization for resize events
          if (overlayElement) {
            this.clearOverlaySynchronization(overlayElement);
          }

          if (isMobile) {
            const customPosition = customPositionGetter
              ? customPositionGetter()
              : null;
            this.positionClippyAndOverlay(
              clippyElement,
              overlayElement,
              customPosition
            );
          } else {
            const currentZoomLevel = resizeHandler.getCurrentZoomLevel();

            // CRITICAL FIX: Check if this specific agent has an anchor, not just if any anchor exists
            const hasAnchor =
              resizeHandler.zoomLevelAnchors.has(currentZoomLevel);
            const isAnchored =
              clippyElement.classList.contains("clippy-anchored");

            if (hasAnchor || isAnchored) {
              devLog(
                `Using anchored positioning for resize (hasAnchor: ${hasAnchor}, isAnchored: ${isAnchored})`
              );

              // If agent is marked as anchored but no anchor exists, create one from current position
              if (isAnchored && !hasAnchor) {
                devLog(
                  `Creating missing anchor for anchored agent at zoom level ${currentZoomLevel}`
                );
                resizeHandler.cacheClippyAnchorPosition(
                  clippyElement,
                  currentZoomLevel
                );
              }

              this.applyAnchoredPosition(clippyElement);
              if (overlayElement) {
                this.positionOverlay(overlayElement, clippyElement);
              }
            } else {
              devLog(`No anchor available, repositioning normally`);
              this.positionClippyAndOverlay(
                clippyElement,
                overlayElement,
                customPositionGetter ? customPositionGetter() : null
              );
            }
          }

          // Remove repositioning flag after a brief delay to allow positioning to complete
          setTimeout(() => {
            clippyElement.classList.remove("clippy-repositioning");
          }, 100);
        }

        if (eventType === "resize-complete") {
          devLog("Resize operation completed");
        }

        window.dispatchEvent(
          new CustomEvent("clippyRepositioned", {
            detail: {
              eventType,
              data,
              anchored:
                !isMobile &&
                resizeHandler.zoomLevelAnchors.has(
                  resizeHandler.getCurrentZoomLevel()
                ),
              zoomLevel: resizeHandler.getCurrentZoomLevel(),
              zoomFactor: this.getMonitorZoomFactor(),
            },
          })
        );
      } catch (error) {
        errorLog("Error during zoom-aware repositioning", error);
      }
    };

    clippyElement._resizeCallback = resizeCallback;
    resizeHandler.addListener(resizeCallback);

    const mode = isMobile ? "responsive mobile" : "desktop zoom-aware anchored";
    devLog(`Clippy resize handling started in ${mode} mode`);
    return true;
  }

  static stopResizeHandling(clippyElement) {
    if (clippyElement && clippyElement._resizeCallback) {
      resizeHandler.removeListener(clippyElement._resizeCallback);
      delete clippyElement._resizeCallback;
      devLog("Clippy zoom-aware resize handling stopped");
      return true;
    }
    return false;
  }

  static handleZoomChange(newZoomLevel, clippyElement) {
    devLog(`ClippyPositioning.handleZoomChange called: zoom → ${newZoomLevel}`);

    if (!clippyElement) {
      errorLog("Cannot handle zoom change: Clippy element not provided");
      return false;
    }

    const success = this.forceImmediateZoomPositioning(
      clippyElement,
      newZoomLevel
    );
    resizeHandler.handleZoomChange(newZoomLevel, clippyElement);

    return success;
  }

  static clearZoomAnchor(zoomLevel = null) {
    resizeHandler.clearZoomAnchor(zoomLevel);
  }

  static getCurrentZoomLevel() {
    return resizeHandler.getCurrentZoomLevel();
  }

  static refreshZoomAnchor(clippyElement) {
    if (!clippyElement) return false;

    const currentZoomLevel = resizeHandler.getCurrentZoomLevel();
    resizeHandler.clearZoomAnchor(currentZoomLevel);

    return resizeHandler.cacheClippyAnchorPosition(
      clippyElement,
      currentZoomLevel
    );
  }

  static triggerResize() {
    resizeHandler.handleResizeImmediate();
  }

  static triggerRepositioning() {
    const currentZoomLevel = resizeHandler.getCurrentZoomLevel();

    resizeHandler.notifyListeners("manual-reposition", {
      width: window.innerWidth,
      height: window.innerHeight,
      type: "manual-reposition",
      reason: "zoom-change",
      zoomLevel: currentZoomLevel,
    });
  }

  static waitForMonitorMovementCompletion(maxWaitTime = 1000) {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const checkMovementComplete = () => {
        try {
          if (Date.now() - startTime > maxWaitTime) {
            devLog("Monitor movement wait timeout reached, proceeding");
            resolve(true);
            return;
          }

          const monitorContainer = document.querySelector(".monitor-container");
          if (monitorContainer) {
            const computedStyle = window.getComputedStyle(monitorContainer);
            const isTransitioning =
              computedStyle.transitionDuration !== "0s" ||
              computedStyle.animationDuration !== "0s";

            if (isTransitioning) {
              devLog("Monitor transition in progress, waiting...");
              setTimeout(checkMovementComplete, 50);
              return;
            }
          }

          const currentZoomLevel = resizeHandler.getCurrentZoomLevel();
          const bodyZoomAttr =
            parseInt(document.body.getAttribute("data-zoom")) || 0;

          if (bodyZoomAttr !== currentZoomLevel) {
            devLog("Zoom state settling, waiting for consistency...");
            setTimeout(checkMovementComplete, 25);
            return;
          }

          const desktop =
            document.querySelector(".desktop.screen") ||
            document.querySelector(".desktop") ||
            document.querySelector(".w98");

          if (desktop) {
            const currentRect = desktop.getBoundingClientRect();

            if (!this._lastDesktopRect) {
              this._lastDesktopRect = currentRect;
              setTimeout(checkMovementComplete, 25);
              return;
            }

            const rectChanged =
              Math.abs(this._lastDesktopRect.width - currentRect.width) > 1 ||
              Math.abs(this._lastDesktopRect.height - currentRect.height) > 1 ||
              Math.abs(this._lastDesktopRect.left - currentRect.left) > 1 ||
              Math.abs(this._lastDesktopRect.top - currentRect.top) > 1;

            if (rectChanged) {
              devLog(
                "Desktop viewport still changing, waiting for stability..."
              );
              this._lastDesktopRect = currentRect;
              setTimeout(checkMovementComplete, 25);
              return;
            }
          }

          devLog("Monitor movement completed, safe to position Clippy");
          delete this._lastDesktopRect;
          resolve(true);
        } catch (error) {
          errorLog("Error checking monitor movement completion", error);
          resolve(true);
        }
      };

      checkMovementComplete();
    });
  }

  static validateClippyPosition(clippyElement) {
    if (!clippyElement) {
      errorLog("Cannot validate position: no Clippy element");
      return false;
    }

    try {
      const rect = clippyElement.getBoundingClientRect();

      if (isMobile) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const isVisible = rect.width > 0 && rect.height > 0;
        const isInBottomRight =
          rect.bottom < viewportHeight && rect.right < viewportWidth;
        const isReasonablyPositioned = rect.left > 0 && rect.top > 0;

        const isValid = isVisible && isInBottomRight && isReasonablyPositioned;

        // Only log validation details in verbose mode
        devLog(`Mobile position validation: ${isValid ? "VALID" : "INVALID"}`, {
          visible: isVisible,
          bottomRight: isInBottomRight,
          reasonable: isReasonablyPositioned,
          position: `(${rect.left.toFixed(1)}, ${rect.top.toFixed(1)})`,
        });

        return isValid;
      } else {
        const desktop =
          document.querySelector(".desktop.screen") ||
          document.querySelector(".desktop") ||
          document.querySelector(".w98");

        if (!desktop) {
          errorLog("Cannot validate desktop position: desktop not found");
          return false;
        }

        const desktopRect = desktop.getBoundingClientRect();

        const isWithinBounds =
          rect.left >= desktopRect.left &&
          rect.top >= desktopRect.top &&
          rect.right <= desktopRect.right &&
          rect.bottom <= desktopRect.bottom;

        const isVisible = rect.width > 0 && rect.height > 0;

        const expectedX = desktopRect.left + desktopRect.width - 120;
        const expectedY = desktopRect.top + desktopRect.height - 30 - 100;
        const positionTolerance = 100;

        const isNearExpected =
          Math.abs(rect.left - expectedX) < positionTolerance &&
          Math.abs(rect.top - expectedY) < positionTolerance;

        const isValid = isWithinBounds && isVisible && isNearExpected;

        // Only log desktop validation details in verbose mode
        devLog(
          `Desktop position validation: ${isValid ? "VALID" : "INVALID"}`,
          {
            withinBounds: isWithinBounds,
            visible: isVisible,
            nearExpected: isNearExpected,
            position: `(${rect.left.toFixed(1)}, ${rect.top.toFixed(1)})`,
            expected: `(${expectedX.toFixed(1)}, ${expectedY.toFixed(1)})`,
          }
        );

        return isValid;
      }
    } catch (error) {
      errorLog("Error validating Clippy position", error);
      return false;
    }
  }

  static positionCorrection(clippyElement) {
    return new Promise((resolve) => {
      if (!clippyElement) {
        errorLog("Cannot apply position correction: no Clippy element");
        resolve(false);
        return;
      }

      devLog("Applying position correction...");

      requestAnimationFrame(() => {
        try {
          const currentZoomLevel = resizeHandler.getCurrentZoomLevel();
          resizeHandler.clearZoomAnchor(currentZoomLevel);
          devLog(
            `Cleared anchors for correction at zoom level ${currentZoomLevel}`
          );

          let success = false;

          if (isMobile) {
            const position = this.calculateMobilePosition();
            success = this.applyStyles(clippyElement, position);
          } else {
            success = this.forceImmediateZoomPositioning(
              clippyElement,
              currentZoomLevel
            );
          }

          if (success) {
            devLog("Position correction applied successfully");

            requestAnimationFrame(() => {
              const isNowValid = this.validateClippyPosition(clippyElement);
              devLog(
                `Post-correction validation: ${
                  isNowValid ? "SUCCESS" : "STILL INVALID"
                }`
              );
              resolve(isNowValid);
            });
          } else {
            errorLog("Position correction failed to apply");
            resolve(false);
          }
        } catch (error) {
          errorLog("Error during position correction", error);
          resolve(false);
        }
      });
    });
  }

  static hybridZoomPositioning(clippyElement, newZoomLevel) {
    return new Promise(async (resolve) => {
      if (!clippyElement) {
        errorLog("Cannot perform hybrid positioning: no Clippy element");
        resolve(false);
        return;
      }

      const overlayElement = document.getElementById(
        "clippy-clickable-overlay"
      );
      devLog(
        `Auto-detected overlay: ${overlayElement ? "found" : "not found"}`
      );
      devLog(`Starting hybrid zoom positioning for level ${newZoomLevel}`);

      try {
        devLog("Phase 1: Waiting for monitor movement completion");
        await this.waitForMonitorMovementCompletion(150);

        devLog("Phase 2: Applying primary positioning");
        let positionSuccess = false;

        if (isMobile) {
          const position = this.calculateMobilePosition();
          positionSuccess = this.applyStyles(clippyElement, position);

          if (positionSuccess && overlayElement) {
            this.positionOverlay(overlayElement, clippyElement);
          }
        } else {
          positionSuccess = this.forceImmediateZoomPositioning(
            clippyElement,
            newZoomLevel
          );

          if (positionSuccess && overlayElement) {
            this.positionOverlay(overlayElement, clippyElement);
          }
        }

        if (!positionSuccess) {
          errorLog("Phase 2 failed: Could not apply primary positioning");
          resolve(false);
          return;
        }

        requestAnimationFrame(async () => {
          devLog("Phase 3: Validating positioning accuracy");
          const isValid = this.validateClippyPosition(clippyElement);

          if (isValid) {
            if (overlayElement) {
              this.positionOverlay(overlayElement, clippyElement);
            }

            devLog(
              "Hybrid positioning completed successfully - validation passed"
            );
            resolve(true);
          } else {
            devLog("Phase 4: Validation failed, applying correction");
            const correctionSuccess = await this.positionCorrection(
              clippyElement
            );

            if (correctionSuccess) {
              if (overlayElement) {
                this.positionOverlay(overlayElement, clippyElement);
              }

              devLog(
                "Hybrid positioning completed successfully - correction applied"
              );
              resolve(true);
            } else {
              errorLog("Hybrid positioning failed - correction unsuccessful");
              resolve(false);
            }
          }
        });
      } catch (error) {
        errorLog("Error during hybrid zoom positioning", error);
        resolve(false);
      }
    });
  }

  static getZoomDebugInfo() {
    const currentZoomLevel = resizeHandler.getCurrentZoomLevel();
    const zoomFactor = this.getMonitorZoomFactor();
    const hasAnchor = resizeHandler.zoomLevelAnchors.has(currentZoomLevel);
    const anchorData = resizeHandler.zoomLevelAnchors.get(currentZoomLevel);

    return {
      currentZoomLevel,
      zoomFactor,
      hasAnchor,
      cachedZoomLevels: Array.from(resizeHandler.zoomLevelAnchors.keys()),
      anchorData: anchorData
        ? {
            timestamp: anchorData.timestamp,
            fromDesktopRightPercent: anchorData.fromDesktopRightPercent,
            fromDesktopBottomPercent: anchorData.fromDesktopBottomPercent,
          }
        : null,
    };
  }

  static getViewportInfo() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile,
      orientation: window.orientation || 0,
      devicePixelRatio: window.devicePixelRatio || 1,
      visualViewport: window.visualViewport
        ? {
            width: window.visualViewport.width,
            height: window.visualViewport.height,
            scale: window.visualViewport.scale,
          }
        : null,
      zoom: this.getZoomDebugInfo(),
    };
  }

  static get isMobile() {
    return isMobile;
  }
}

// ===== GLOBAL ACCESS =====
window.ClippyPositioning = ClippyPositioning;
window.ClippyResizeHandler = resizeHandler;

// Export logging functions for use in other files
export { devLog, errorLog };
export default ClippyPositioning;
