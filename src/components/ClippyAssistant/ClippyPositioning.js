// ClippyPositioning.js - Optimized with reduced logging and iOS Safari performance improvements
// This is the SINGLE source of truth for all Clippy positioning

// Optimized logging system
const isDev = process.env.NODE_ENV === 'development';

const devLog = (message, data = null) => {
  if (isDev) {
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

// iOS Safari detection
const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent);

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

  // MOBILE positioning values (centralized)
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

    const currentZoom = zoomLevel !== null ? zoomLevel : this.getCurrentZoomLevel();
    
    devLog(`Caching anchor for zoom ${currentZoom}`);

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
    const safeTop = desktopRect.top + desktopRect.height - taskbarHeight - bottomOffset;

    const zoomAnchorData = {
      zoomLevel: currentZoom,
      timestamp: Date.now(),
      zoomFactor: zoomFactor,
      fromDesktopRightPercent: rightOffset / desktopRect.width,
      fromDesktopBottomPercent: (taskbarHeight + bottomOffset) / desktopRect.height,
      fromDesktopLeftPercent: (desktopRect.width - rightOffset) / desktopRect.width,
      fromDesktopTopPercent: (desktopRect.height - taskbarHeight - bottomOffset) / desktopRect.height,
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

    devLog(`Cached anchor for zoom ${currentZoom}`, {
      zoomFactor,
      expectedSize: `${scaledClippyWidth.toFixed(1)}x${scaledClippyHeight.toFixed(1)}`,
      position: `(${safeLeft.toFixed(1)}, ${safeTop.toFixed(1)})`,
    });
    return true;
  }

  getZoomFactorForLevel(zoomLevel) {
    switch (zoomLevel) {
      case 1: return 1.1;
      case 2: return 1.25;
      default: return 1.0;
    }
  }

  getAnchoredPosition(zoomLevel = null) {
    const currentZoom = zoomLevel !== null ? zoomLevel : this.getCurrentZoomLevel();
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
      top: currentDesktopRect.top + currentDesktopRect.height - taskbarHeight - bottomOffset,
      zoomLevel: currentZoom,
      appliedWidth: anchorData.expectedWidth,
      appliedHeight: anchorData.expectedHeight,
    };

    devLog(`Calculated anchored position for zoom ${currentZoom}`, {
      position: `(${anchoredPosition.left.toFixed(1)}, ${anchoredPosition.top.toFixed(1)})`,
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
      devLog(`Zoom change: ${oldZoomLevel} → ${newZoomLevel}`);

      this.currentZoomLevel = newZoomLevel;
      this.clearZoomAnchor(newZoomLevel);

      if (clippyElement) {
        const newAnchorSuccess = this.cacheClippyAnchorPosition(clippyElement, newZoomLevel);

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

    window.addEventListener("resize", this.handleResizeImmediate, { passive: true });
    this.startRealTimeMonitoring();

    if (isMobile) {
      window.addEventListener("orientationchange", this.handleOrientationChange, { passive: true });

      if (isIOSSafari) {
        window.addEventListener("scroll", this.handleIOSViewportChange, { passive: true });
        if (window.visualViewport) {
          window.visualViewport.addEventListener("resize", this.handleIOSViewportChange, { passive: true });
        }
      }
    }
  }

  stopListening() {
    if (!this.isListening) return;

    this.isListening = false;

    window.removeEventListener("resize", this.handleResizeImmediate);
    window.removeEventListener("orientationchange", this.handleOrientationChange);

    if (isIOSSafari) {
      window.removeEventListener("scroll", this.handleIOSViewportChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", this.handleIOSViewportChange);
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
  static getClippyPosition(customPosition = null) {
    if (isMobile) {
      return this.calculateMobilePosition();
    }

    const desktop = { ...CLIPPY_POSITIONS.desktop };
    const zoomFactor = this.getMonitorZoomFactor();
    const adjustedScale = 0.95 * zoomFactor;
    desktop.transform = `translateZ(0) scale(${adjustedScale})`;

    if (customPosition) {
      desktop.left = `${customPosition.x}px`;
      desktop.top = `${customPosition.y}px`;
    } else {
      const calculated = this.calculateDesktopPosition();
      desktop.left = `${calculated.x}px`;
      desktop.top = `${calculated.y}px`;
    }

    return desktop;
  }

  static calculateMobilePosition(taskbarHeight = 26) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const values = CLIPPY_POSITIONS.mobileValues;

    let desiredBottomFromViewport;
    let desiredRightFromViewport;

    // Apply offset based on device
    if (isIOSSafari) {
      // iOS Safari specific offset relative to original default
      desiredRightFromViewport = values.right + 20; // Shift 20px right for iOS Safari
      desiredBottomFromViewport = values.bottom + 5; // Shift 5px down for iOS Safari (maintain)
    } else {
      // 65px above the taskbar for all other mobile, and 15px further right
      const gapAboveTaskbar = 65;
      desiredBottomFromViewport = taskbarHeight + gapAboveTaskbar;
      desiredRightFromViewport = values.right + 15; // Shift 15px right
    }

    // Apply viewport constraints
    const finalBottom = Math.min(desiredBottomFromViewport, viewportHeight * 0.2);
    const finalRight = Math.min(desiredRightFromViewport, viewportWidth * 0.1);

    return {
      ...CLIPPY_POSITIONS.mobile,
      bottom: `${finalBottom}px`,
      right: `${finalRight}px`,
      left: "auto",
      top: "auto",
    };
  }

  static calculateDesktopPosition() {
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
            const zoomLevel = parseInt(document.body.getAttribute("data-zoom")) || 0;
            switch (zoomLevel) {
              case 1: zoomFactor = 1.1; break;
              case 2: zoomFactor = 1.25; break;
              default: zoomFactor = 1.0; break;
            }
          }
        }

        const basePosition = {
          x: rect.left + rect.width - values.rightOffset,
          y: rect.top + rect.height - values.taskbarHeight - values.bottomOffset,
        };

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
  
  // Account for clickable overlay height
  const overlayEl = document.getElementById('clippy-clickable-overlay');
  const overlayRect = overlayEl ? overlayEl.getBoundingClientRect() : clippyRect;
  
  // Calculate Clippy's full height including overlay
  const clippyHeight = clippyRect.height;
  const overlayHeight = overlayRect.height;
  const effectiveClippyHeight = Math.max(clippyHeight, overlayHeight);
  const effectiveClippyTop = Math.min(clippyRect.top, overlayRect.top);

  if (balloonType === "chat") {
    const balloonWidth = Math.min(300, viewportWidth - 40);
    const balloonHeight = Math.min(220, viewportHeight - 150); // Reduced to ensure fit
    
    // Position above Clippy with more margin
    let left = Math.max(safeMargin, (viewportWidth - balloonWidth) / 2 - 20);
    let top = effectiveClippyTop - balloonHeight - 40; // Increased gap
    
    // If doesn't fit above, position at top of viewport
    if (top < safeMargin) {
      top = safeMargin;
      // Shift to left side to avoid Clippy if it's on the right
      if (clippyRect.right > viewportWidth / 2) {
        left = safeMargin;
      } else {
        left = viewportWidth - balloonWidth - safeMargin;
      }
    }
    
    return { left, top };
  } else {
    // Speech balloon
    const balloonWidth = Math.min(260, viewportWidth - 40);
    const balloonHeight = 100;
    
    // Center above Clippy
    let left = clippyRect.left + (clippyRect.width / 2) - (balloonWidth / 2);
    let top = effectiveClippyTop - balloonHeight - 30; // Increased gap
    
    // Constrain to viewport
    left = Math.max(safeMargin, Math.min(left, viewportWidth - balloonWidth - safeMargin));
    
    // If doesn't fit above, position to the side
    if (top < safeMargin) {
      top = effectiveClippyTop - 20; // Align near Clippy's top
      
      // Try left side first
      if (clippyRect.left > balloonWidth + 30) {
        left = clippyRect.left - balloonWidth - 20;
      } else {
        // Otherwise right side
        left = clippyRect.right + 20;
        if (left + balloonWidth > viewportWidth - safeMargin) {
          // Last resort: top of viewport
          left = (viewportWidth - balloonWidth) / 2;
          top = safeMargin;
        }
      }
    }
    
    return { left, top };
  }
}

  static getDesktopBalloonPosition(clippyRect, balloonType) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

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

  static applyStyles(element, styles) {
    if (!element) return false;

    try {
      // Log the transform style being applied
      // if (styles.transform) {
      //   devLog(`Applying transform style: ${styles.transform}`, { elementId: element.id, elementClass: element.className });
      // }

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
    clippyElement.style.transition = 'none';
    clippyElement.style.animation = 'none';
    clippyElement.style.animationPlayState = 'paused';
    
    // Force immediate style application for iOS Safari
    void clippyElement.offsetHeight; // Trigger reflow
    
    if (isIOSSafari && isDev) {
      devLog("iOS Safari animations cancelled for drag performance");
    }
  }

  // Enhanced mobile drag handling optimized for iOS Safari
  static optimizedIOSMobileDrag(clippyElement, overlayElement, newPosition, isDragging = true) {
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
        transform: translateZ(0) scale(${isDragging ? '1.05' : '1'}) !important;
        transform-origin: center bottom !important;
        z-index: ${isDragging ? '1550' : '1500'} !important;
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
          z-index: ${isDragging ? '1560' : '1510'} !important;
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
      errorLog(`Cannot apply anchored position - no anchor cached for zoom ${currentZoomLevel}`);
      const anchorCreated = resizeHandler.cacheClippyAnchorPosition(clippyElement, currentZoomLevel);
      if (anchorCreated) {
        const newAnchoredPos = resizeHandler.getAnchoredPosition(currentZoomLevel);
        if (newAnchoredPos) {
          return this.applyCalculatedPosition(clippyElement, newAnchoredPos, currentZoomLevel);
        }
      }
      return false;
    }

    return this.applyCalculatedPosition(clippyElement, anchoredPos, currentZoomLevel);
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
        position: `(${positionData.left.toFixed(1)}, ${positionData.top.toFixed(1)})`,
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
          case 1: factor = 1.1; break;
          case 2: factor = 1.25; break;
          default: factor = 1.0; break;
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
        case 1: zoomFactor = 1.1; break;
        case 2: zoomFactor = 1.25; break;
        default: zoomFactor = 1.0; break;
      }

      const adjustedScale = CLIPPY_POSITIONS.desktopValues.scale * zoomFactor;
      const rightOffset = 120;
      const bottomOffset = 100;
      const taskbarHeight = 30;

      const correctLeft = desktopRect.left + desktopRect.width - rightOffset;
      const correctTop = desktopRect.top + desktopRect.height - taskbarHeight - bottomOffset;

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
        const anchorCached = resizeHandler.cacheClippyAnchorPosition(clippyElement, newZoomLevel);

        clippyElement.classList.add("clippy-anchored");
        clippyElement.setAttribute("data-zoom-anchored", newZoomLevel.toString());

        devLog(`Applied positioning for zoom ${newZoomLevel}`, {
          position: `(${correctLeft.toFixed(1)}, ${correctTop.toFixed(1)})`,
          scale: adjustedScale,
          desktop: `${desktopRect.width.toFixed(1)}x${desktopRect.height.toFixed(1)}`,
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

  static positionClippy(clippyElement, customPosition = null, taskbarHeight = 26) {
    if (!clippyElement) return false;

    const currentZoomLevel = resizeHandler.getCurrentZoomLevel();
    devLog(`Positioning Clippy for zoom level ${currentZoomLevel}`);

    if (!isMobile) {
      if (resizeHandler.zoomLevelAnchors.has(currentZoomLevel)) {
        devLog(`Using cached anchor for zoom level ${currentZoomLevel}`);
        return this.applyAnchoredPosition(clippyElement);
      } else {
        devLog(`No anchor cached for zoom level ${currentZoomLevel}, creating fresh anchor`);
        const anchorCached = resizeHandler.cacheClippyAnchorPosition(clippyElement, currentZoomLevel);

        if (anchorCached) {
          return this.applyAnchoredPosition(clippyElement);
        } else {
          errorLog("Failed to cache anchor, falling back to normal positioning");
        }
      }
    }

    const position = isMobile ? this.calculateMobilePosition(taskbarHeight) : this.getClippyPosition(customPosition);
    return this.applyStyles(clippyElement, position);
  }

  static positionOverlay(overlayElement, clippyElement) {
    if (!overlayElement || !clippyElement) return false;

    const position = this.getOverlayPosition(clippyElement);

    if (position) {
      delete position.transform;
    }

    return this.applyStyles(overlayElement, position);
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

  static positionClippyAndOverlay(clippyElement, overlayElement, customPosition = null, taskbarHeight = 26) {
    if (!clippyElement) return false;

    const currentZoomLevel = resizeHandler.getCurrentZoomLevel();
    devLog(`Positioning Clippy and overlay for zoom level ${currentZoomLevel}`);

    const clippySuccess = this.positionClippy(clippyElement, customPosition, taskbarHeight);

    if (!isMobile && clippySuccess && !resizeHandler.zoomLevelAnchors.has(currentZoomLevel)) {
      devLog(`Caching anchor after positioning for zoom level ${currentZoomLevel}`);
      resizeHandler.cacheClippyAnchorPosition(clippyElement, currentZoomLevel);
    }

    const overlaySuccess = overlayElement
      ? this.positionOverlay(overlayElement, clippyElement)
      : true;

    const success = clippySuccess && overlaySuccess;
    devLog(`Synchronized positioning: ${success ? "success" : "failed"}`);

    return success;
  }

  static calculateMobilePositionForDrag() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const values = CLIPPY_POSITIONS.mobileValues;

    const bottomPx = Math.min(values.bottom, viewportHeight * 0.2);
    const rightPx = Math.min(values.right, viewportWidth * 0.1);

    return {
      rightPx,
      bottomPx,
      right: `${rightPx}px`,
      bottom: `${bottomPx}px`
    };
  }

  static applyMobilePosition(clippyElement, position, isDragging = false) {
    if (!clippyElement) return false;

    try {
      if (isDragging) {
        clippyElement.classList.add('clippy-dragging');
        document.body.classList.add('clippy-drag-active');
      } else {
        clippyElement.classList.remove('clippy-dragging');
        document.body.classList.remove('clippy-drag-active');
      }

      const mobileStyles = {
        position: "fixed",
        right: position.right || `${position.rightPx}px`,
        bottom: position.bottom || `${position.bottomPx}px`,
        left: "auto",
        top: "auto",
        transform: isDragging 
          ? "translateZ(0) scale(1.05)"
          : "translateZ(0) scale(1)",
        transformOrigin: "center bottom",
        zIndex: isDragging ? "1550" : "1500",
        backfaceVisibility: "hidden",
        willChange: isDragging ? "transform, opacity, right, bottom" : "transform",
        WebkitTransform: isDragging 
          ? "translateZ(0) scale(1.05)" 
          : "translateZ(0) scale(1)",
        WebkitBackfaceVisibility: "hidden",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        transition: isDragging ? "none" : "transform 0.2s ease, right 0.2s ease, bottom 0.2s ease",
      };

      return this.applyStyles(clippyElement, mobileStyles);
    } catch (error) {
      errorLog("Error applying mobile position", error);
      return false;
    }
  }

  static enforceMobileBoundaries(position) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const safeLeft = Math.max(10, window.safeAreaInsets?.left || 0);
    const safeRight = Math.max(10, window.safeAreaInsets?.right || 0);
    const safeTop = Math.max(10, window.safeAreaInsets?.top || 0);
    const safeBottom = Math.max(80, window.safeAreaInsets?.bottom || 0);

    // Updated dimensions based on new scaling
    const baseWidth = 124;
    const baseHeight = 93;
    const clippyWidth = baseWidth * 1; // Mobile scale is 1
    const clippyHeight = baseHeight * 1; // Mobile scale is 1

    const boundedPosition = {
      rightPx: Math.max(
        safeRight,
        Math.min(
          viewportWidth - clippyWidth - safeLeft,
          position.rightPx || parseInt(position.right, 10) || 0
        )
      ),
      bottomPx: Math.max(
        safeBottom,
        Math.min(
          viewportHeight - clippyHeight - safeTop,
          position.bottomPx || parseInt(position.bottom, 10) || 0
        )
      )
    };

    return {
      ...boundedPosition,
      right: `${boundedPosition.rightPx}px`,
      bottom: `${boundedPosition.bottomPx}px`
    };
  }

  static handleMobileDrag(clippyElement, overlayElement, newPosition, isDragging = true) {
    if (!clippyElement || !isMobile) return false;

    try {
      // For iOS Safari, use the optimized method
      if (isIOSSafari && isDragging) {
        return this.optimizedIOSMobileDrag(clippyElement, overlayElement, newPosition, isDragging);
      }

      const boundedPosition = this.enforceMobileBoundaries(newPosition);
      const clippySuccess = this.applyMobilePosition(clippyElement, boundedPosition, isDragging);

      let overlaySuccess = true;
      if (overlayElement) {
        if (isDragging) {
          overlayElement.classList.add('overlay-dragging');
        } else {
          overlayElement.classList.remove('overlay-dragging');
        }

        overlaySuccess = this.positionOverlay(overlayElement, clippyElement);
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
      clippyElement.classList.add('clippy-dragging');
      document.body.classList.add('clippy-drag-active');
      
      if (overlayElement) {
        overlayElement.classList.add('overlay-dragging');
      }

      clippyElement.style.transition = 'none';
      if (overlayElement) {
        overlayElement.style.transition = 'none';
      }

      const enhancedStyles = {
        willChange: 'transform, opacity, right, bottom',
        contain: 'layout style paint',
        isolation: 'isolate',
      };

      this.applyStyles(clippyElement, enhancedStyles);

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
        const boundedPosition = this.enforceMobileBoundaries(finalPosition);
        this.applyMobilePosition(clippyElement, boundedPosition, false);
      }

      clippyElement.classList.remove('clippy-dragging');
      document.body.classList.remove('clippy-drag-active');
      
      if (overlayElement) {
        overlayElement.classList.remove('overlay-dragging');
      }

      setTimeout(() => {
        if (clippyElement) {
          clippyElement.style.transition = '';
        }
        if (overlayElement) {
          overlayElement.style.transition = '';
        }
      }, 100);

      const resetStyles = {
        willChange: 'transform',
        contain: '',
        isolation: '',
      };

      this.applyStyles(clippyElement, resetStyles);

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
        clippyElement.classList.add('position-locked');
      } else {
        clippyElement.classList.remove('position-locked');
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
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 10,
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 10,
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 80,
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 10,
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

    const bottomPx = Math.min(
      values.bottom + safeAreas.bottom,
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
      top: "auto"
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

  static startResizeHandling(clippyElement, overlayElement, customPositionGetter = null) {
    if (!clippyElement) {
      errorLog("Cannot start resize handling: Clippy element not provided");
      return false;
    }

    const resizeCallback = (eventType, data) => {
      try {
        if (eventType === "zoom-change-immediate") {
          devLog(`Handling immediate zoom change: ${data.oldZoomLevel} → ${data.newZoomLevel}`);

          if (isMobile) {
            const customPosition = customPositionGetter ? customPositionGetter() : null;
            this.positionClippyAndOverlay(clippyElement, overlayElement, customPosition);
          } else {
            const positioned = this.applyAnchoredPosition(clippyElement);
            if (positioned && overlayElement) {
              this.positionOverlay(overlayElement, clippyElement);
            }
          }
          return;
        }

        if (eventType === "zoom-change") {
          devLog(`Handling zoom change: ${data.oldZoomLevel} → ${data.newZoomLevel}`);

          setTimeout(() => {
            if (isMobile) {
              const customPosition = customPositionGetter ? customPositionGetter() : null;
              this.positionClippyAndOverlay(clippyElement, overlayElement, customPosition);
            } else {
              this.positionClippyAndOverlay(clippyElement, overlayElement, null);
            }
          }, 50);
          return;
        }

        if (eventType === "realtime-resize" || eventType === "resize-start") {
          if (isMobile) {
            const customPosition = customPositionGetter ? customPositionGetter() : null;
            this.positionClippyAndOverlay(clippyElement, overlayElement, customPosition);
          } else {
            const currentZoomLevel = resizeHandler.getCurrentZoomLevel();
            if (resizeHandler.zoomLevelAnchors.has(currentZoomLevel)) {
              this.applyAnchoredPosition(clippyElement);
              if (overlayElement) {
                this.positionOverlay(overlayElement, clippyElement);
              }
            } else {
              this.positionClippyAndOverlay(
                clippyElement,
                overlayElement,
                customPositionGetter ? customPositionGetter() : null
              );
            }
          }
        }

        if (eventType === "resize-complete") {
          devLog("Resize operation completed");
        }

        window.dispatchEvent(
          new CustomEvent("clippyRepositioned", {
            detail: {
              eventType,
              data,
              anchored: !isMobile && resizeHandler.zoomLevelAnchors.has(resizeHandler.getCurrentZoomLevel()),
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

    const success = this.forceImmediateZoomPositioning(clippyElement, newZoomLevel);
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

    return resizeHandler.cacheClippyAnchorPosition(clippyElement, currentZoomLevel);
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
          const bodyZoomAttr = parseInt(document.body.getAttribute("data-zoom")) || 0;

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
              devLog("Desktop viewport still changing, waiting for stability...");
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
        const isInBottomRight = rect.bottom < viewportHeight && rect.right < viewportWidth;
        const isReasonablyPositioned = rect.left > 0 && rect.top > 0;

        const isValid = isVisible && isInBottomRight && isReasonablyPositioned;

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

        devLog(`Desktop position validation: ${isValid ? "VALID" : "INVALID"}`, {
          withinBounds: isWithinBounds,
          visible: isVisible,
          nearExpected: isNearExpected,
          position: `(${rect.left.toFixed(1)}, ${rect.top.toFixed(1)})`,
          expected: `(${expectedX.toFixed(1)}, ${expectedY.toFixed(1)})`,
        });

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
          devLog(`Cleared anchors for correction at zoom level ${currentZoomLevel}`);

          let success = false;

          if (isMobile) {
            const position = this.calculateMobilePosition();
            success = this.applyStyles(clippyElement, position);
          } else {
            success = this.forceImmediateZoomPositioning(clippyElement, currentZoomLevel);
          }

          if (success) {
            devLog("Position correction applied successfully");

            requestAnimationFrame(() => {
              const isNowValid = this.validateClippyPosition(clippyElement);
              devLog(`Post-correction validation: ${isNowValid ? "SUCCESS" : "STILL INVALID"}`);
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

      const overlayElement = document.getElementById("clippy-clickable-overlay");
      devLog(`Auto-detected overlay: ${overlayElement ? "found" : "not found"}`);
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
          positionSuccess = this.forceImmediateZoomPositioning(clippyElement, newZoomLevel);

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

            devLog("Hybrid positioning completed successfully - validation passed");
            resolve(true);
          } else {
            devLog("Phase 4: Validation failed, applying correction");
            const correctionSuccess = await this.positionCorrection(clippyElement);

            if (correctionSuccess) {
              if (overlayElement) {
                this.positionOverlay(overlayElement, clippyElement);
              }

              devLog("Hybrid positioning completed successfully - correction applied");
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