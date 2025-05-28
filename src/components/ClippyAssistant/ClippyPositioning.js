// ClippyPositioning.js - Centralized positioning logic with ZOOM-AWARE anchor positioning
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
  // Mobile positioning (now dynamic-ready)
  mobile: {
    position: "fixed",
    transform: "translateZ(0) scale(0.8)",
    transformOrigin: "center bottom",
    zIndex: "1500",
    // bottom and right will be calculated dynamically
  },

  // Desktop positioning (calculated)
  desktop: {
    position: "fixed",
    transform: "translateZ(0) scale(0.9)",
    transformOrigin: "center bottom",
    zIndex: "2000",
    // left and top calculated dynamically
  },

  // MOBILE positioning values (centralized)
  mobileValues: {
    bottom: 120, // pixels from bottom
    right: 11, // pixels from right
    scale: 0.8, // scale factor
  },

  // DESKTOP positioning values (centralized)
  desktopValues: {
    rightOffset: 120, // pixels from right edge (original value)
    bottomOffset: 100, // pixels from bottom
    taskbarHeight: 30, // taskbar height
    scale: 0.9,
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

// ===== ZOOM-AWARE REAL-TIME RESIZE HANDLING SYSTEM =====
class ZoomAwareResizeHandler {
  constructor() {
    this.listeners = new Set();
    this.isListening = false;
    this.animationFrameId = null;
    this.lastWidth = window.innerWidth;
    this.lastHeight = window.innerHeight;
    this.orientationChangeTimeout = null;

    // iOS Safari specific handling
    this.iosViewportHeight = window.innerHeight;
    this.iosViewportChangeTimeout = null;

    // ZOOM-AWARE ANCHOR CACHING: Store anchor per zoom level
    this.zoomLevelAnchors = new Map(); // Maps zoom level to anchor data
    this.currentZoomLevel = 0; // Track current zoom level
    this.isResizing = false; // Track active resize state

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
      // Clear ALL cached data when no more listeners
      this.zoomLevelAnchors.clear();
      this.currentZoomLevel = 0;
    }
  }

  // ZOOM-AWARE: Cache anchor position with size-aware boundary constraints
  cacheClippyAnchorPosition(clippyElement, zoomLevel = null) {
    if (!clippyElement) return false;

    // Get current zoom level if not provided
    const currentZoom =
      zoomLevel !== null ? zoomLevel : this.getCurrentZoomLevel();

    console.log(
      `⚓ Caching size-aware anchor position for zoom level ${currentZoom}`
    );

    const desktop =
      document.querySelector(".desktop.screen") ||
      document.querySelector(".desktop") ||
      document.querySelector(".w98");

    if (!desktop) {
      console.warn("⚠️ Cannot cache Clippy anchor - desktop not found");
      return false;
    }

    const desktopRect = desktop.getBoundingClientRect();

    // Calculate expected Clippy dimensions for this zoom level
    const baseClippyWidth = 124; // Base Clippy width
    const baseClippyHeight = 93; // Base Clippy height
    const zoomFactor = this.getZoomFactorForLevel(currentZoom);
    const scaledClippyWidth = baseClippyWidth * 0.9 * zoomFactor; // Apply desktop scale + zoom
    const scaledClippyHeight = baseClippyHeight * 0.9 * zoomFactor;

    // CORRECTED POSITIONING: Use the same values as your working desktop positioning
    const rightOffset = 120; // Match CLIPPY_POSITIONS.desktopValues.rightOffset
    const bottomOffset = 100; // Match CLIPPY_POSITIONS.desktopValues.bottomOffset
    const taskbarHeight = 30; // Match CLIPPY_POSITIONS.desktopValues.taskbarHeight

    // Calculate position using the same logic as calculateDesktopPosition
    const safeLeft = desktopRect.left + desktopRect.width - rightOffset;
    const safeTop =
      desktopRect.top + desktopRect.height - taskbarHeight - bottomOffset;

    // Calculate anchor data based on corrected positioning
    const zoomAnchorData = {
      zoomLevel: currentZoom,
      timestamp: Date.now(),
      zoomFactor: zoomFactor,

      // Store the positioning as percentages for scaling
      fromDesktopRightPercent: rightOffset / desktopRect.width,
      fromDesktopBottomPercent:
        (taskbarHeight + bottomOffset) / desktopRect.height,
      fromDesktopLeftPercent:
        (desktopRect.width - rightOffset) / desktopRect.width,
      fromDesktopTopPercent:
        (desktopRect.height - taskbarHeight - bottomOffset) /
        desktopRect.height,

      // Store pixel values that match calculateDesktopPosition
      safeLeft: safeLeft,
      safeTop: safeTop,
      rightOffset: rightOffset,
      bottomOffset: bottomOffset,
      taskbarHeight: taskbarHeight,

      // Store expected dimensions for this zoom level
      expectedWidth: scaledClippyWidth,
      expectedHeight: scaledClippyHeight,

      // Cache the desktop rect for this zoom level
      desktopRect: { ...desktopRect },
    };

    // Store anchor data for this specific zoom level
    this.zoomLevelAnchors.set(currentZoom, zoomAnchorData);
    this.currentZoomLevel = currentZoom;

    console.log(`⚓ Cached corrected anchor for zoom ${currentZoom}:`, {
      zoomFactor,
      expectedSize: `${scaledClippyWidth.toFixed(
        1
      )}x${scaledClippyHeight.toFixed(1)}`,
      position: `(${safeLeft.toFixed(1)}, ${safeTop.toFixed(1)})`,
      offsets: `right: ${rightOffset}px, bottom: ${bottomOffset}px, taskbar: ${taskbarHeight}px`,
    });
    return true;
  }

  // Helper method to get zoom factor for a specific level
  getZoomFactorForLevel(zoomLevel) {
    switch (zoomLevel) {
      case 1:
        return 1.1; // 110%
      case 2:
        return 1.25; // 125%
      default:
        return 1.0; // 100%
    }
  }

  // ZOOM-AWARE: Get size-aware anchor position for current zoom level
  getAnchoredPosition(zoomLevel = null) {
    const currentZoom =
      zoomLevel !== null ? zoomLevel : this.getCurrentZoomLevel();
    const anchorData = this.zoomLevelAnchors.get(currentZoom);

    if (!anchorData) {
      console.warn(`⚠️ No anchor data cached for zoom level ${currentZoom}`);
      return null;
    }

    const desktop =
      document.querySelector(".desktop.screen") ||
      document.querySelector(".desktop") ||
      document.querySelector(".w98");

    if (!desktop) {
      console.warn("⚠️ Desktop viewport not found for anchored positioning");
      return null;
    }

    const currentDesktopRect = desktop.getBoundingClientRect();

    // CORRECTED: Use the same positioning logic as calculateDesktopPosition
    const rightOffset = anchorData.rightOffset || 120;
    const bottomOffset = anchorData.bottomOffset || 100;
    const taskbarHeight = anchorData.taskbarHeight || 30;

    // Calculate position exactly like calculateDesktopPosition does
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

    console.log(`⚓ Calculated anchored position for zoom ${currentZoom}:`, {
      position: `(${anchoredPosition.left.toFixed(
        1
      )}, ${anchoredPosition.top.toFixed(1)})`,
      desktop: `${currentDesktopRect.width}x${currentDesktopRect.height}`,
      offsets: `right: ${rightOffset}px, bottom: ${bottomOffset}px, taskbar: ${taskbarHeight}px`,
    });

    return anchoredPosition;
  }

  // ZOOM-AWARE: Clear cached anchor for specific zoom level or all
  clearZoomAnchor(zoomLevel = null) {
    if (zoomLevel !== null) {
      this.zoomLevelAnchors.delete(zoomLevel);
      console.log(`🗑️ Cleared anchor cache for zoom level ${zoomLevel}`);
    } else {
      this.zoomLevelAnchors.clear();
      console.log("🗑️ Cleared all zoom level anchor caches");
    }
  }

  // ZOOM-AWARE: Handle zoom level changes with immediate positioning
  handleZoomChange(newZoomLevel, clippyElement) {
    const oldZoomLevel = this.currentZoomLevel;

    if (oldZoomLevel !== newZoomLevel) {
      console.log(`📏 Zoom level changed: ${oldZoomLevel} → ${newZoomLevel}`);

      // Update current zoom level immediately
      this.currentZoomLevel = newZoomLevel;

      // Clear any existing anchor for the new zoom level to force fresh calculation
      this.clearZoomAnchor(newZoomLevel);

      // If we have a clippyElement, immediately calculate and apply new positioning
      if (clippyElement) {
        // IMMEDIATE POSITIONING: Calculate size-aware position for new zoom level
        const newAnchorSuccess = this.cacheClippyAnchorPosition(
          clippyElement,
          newZoomLevel
        );

        if (newAnchorSuccess) {
          // Apply the new position immediately
          this.notifyListeners("zoom-change-immediate", {
            oldZoomLevel,
            newZoomLevel,
            type: "zoom-change-immediate",
            requiresImmedateUpdate: true,
          });
        }
      }

      // Also notify with regular zoom change event
      this.notifyListeners("zoom-change", {
        oldZoomLevel,
        newZoomLevel,
        type: "zoom-change",
      });
    }
  }

  // Get current zoom level from various sources
  getCurrentZoomLevel() {
    try {
      // Method 1: Check data attribute on body (set by MonitorView)
      const dataZoom = parseInt(document.body.getAttribute("data-zoom")) || 0;
      if (dataZoom >= 0) {
        return dataZoom;
      }

      // Method 2: Check monitor container for zoom classes
      const monitorContainer = document.querySelector(".monitor-container");
      if (monitorContainer?.classList.contains("zoomed")) {
        // Try to extract zoom from transform
        const transform = window.getComputedStyle(monitorContainer).transform;
        if (transform && transform !== "none") {
          const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
          if (matrixMatch) {
            const values = matrixMatch[1].split(",");
            const factor = parseFloat(values[0]) || 1.0;

            // Convert factor back to zoom level
            if (Math.abs(factor - 1.25) < 0.01) return 2;
            if (Math.abs(factor - 1.1) < 0.01) return 1;
            return 0;
          }
        }
      }

      return 0; // Default zoom level
    } catch (error) {
      console.warn("Error getting current zoom level:", error);
      return 0;
    }
  }

  startListening() {
    if (this.isListening) return;

    this.isListening = true;

    // Use IMMEDIATE resize event handler instead of throttled
    window.addEventListener("resize", this.handleResizeImmediate, {
      passive: true,
    });

    // Start real-time monitoring loop
    this.startRealTimeMonitoring();

    // Orientation change for mobile
    if (isMobile) {
      window.addEventListener(
        "orientationchange",
        this.handleOrientationChange,
        { passive: true }
      );

      // iOS Safari viewport changes (address bar show/hide)
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        window.addEventListener("scroll", this.handleIOSViewportChange, {
          passive: true,
        });
        // Also listen for visual viewport API if available
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

    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      window.removeEventListener("scroll", this.handleIOSViewportChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          this.handleIOSViewportChange
        );
      }
    }

    // Stop real-time monitoring
    this.stopRealTimeMonitoring();

    // Clear any pending timeouts
    if (this.orientationChangeTimeout) {
      clearTimeout(this.orientationChangeTimeout);
    }
    if (this.iosViewportChangeTimeout) {
      clearTimeout(this.iosViewportChangeTimeout);
    }

    // Clear ALL cached data
    this.zoomLevelAnchors.clear();
    this.currentZoomLevel = 0;
  }

  // Real-time monitoring using requestAnimationFrame
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

  // Check for size changes every frame during resize
  checkForResize() {
    if (!this.isListening) return;

    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;

    // Check if dimensions have changed
    if (currentWidth !== this.lastWidth || currentHeight !== this.lastHeight) {
      this.isResizing = true;

      // Notify listeners immediately for real-time updates
      this.notifyListeners("realtime-resize", {
        width: currentWidth,
        height: currentHeight,
        type: "realtime-resize",
        isResizing: true,
      });

      this.lastWidth = currentWidth;
      this.lastHeight = currentHeight;
    } else if (this.isResizing) {
      // Resize has stopped
      this.isResizing = false;
      this.notifyListeners("resize-complete", {
        width: currentWidth,
        height: currentHeight,
        type: "resize-complete",
        isResizing: false,
      });
    }

    // Continue monitoring
    this.animationFrameId = requestAnimationFrame(this.checkForResize);
  }

  handleResizeImmediate() {
    // This fires immediately when resize starts, but we rely on
    // real-time monitoring for continuous updates
    this.isResizing = true;

    this.notifyListeners("resize-start", {
      width: window.innerWidth,
      height: window.innerHeight,
      type: "resize-start",
      isResizing: true,
    });
  }

  handleOrientationChange() {
    // iOS needs extra time for orientation changes to complete
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
    }, 500); // iOS needs time for orientation to complete
  }

  handleIOSViewportChange() {
    // Handle iOS Safari address bar show/hide
    if (this.iosViewportChangeTimeout) {
      clearTimeout(this.iosViewportChangeTimeout);
    }

    this.iosViewportChangeTimeout = setTimeout(() => {
      const currentHeight = window.innerHeight;

      // Check if this is a significant viewport change (not just scroll)
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
        console.error("Error in resize listener:", error);
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

    // Desktop positioning
    const desktop = { ...CLIPPY_POSITIONS.desktop };

    // Get current monitor zoom factor and apply to scale
    const zoomFactor = this.getMonitorZoomFactor();
    const adjustedScale = 0.9 * zoomFactor; // Base desktop scale * zoom factor
    desktop.transform = `translateZ(0) scale(${adjustedScale})`;

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

  static calculateMobilePosition() {
    // Dynamic mobile positioning based on current viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const values = CLIPPY_POSITIONS.mobileValues;

    // Calculate responsive mobile position
    const bottom = Math.min(values.bottom, viewportHeight * 0.2); // Max 20% from bottom
    const right = Math.min(values.right, viewportWidth * 0.1); // Max 10% from right

    return {
      ...CLIPPY_POSITIONS.mobile,
      bottom: `${bottom}px`,
      right: `${right}px`,
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

        // Check if monitor is zoomed by looking for zoom classes/transforms
        const monitorContainer = document.querySelector(".monitor-container");
        let zoomFactor = 1.0;

        if (monitorContainer) {
          const transform = window.getComputedStyle(monitorContainer).transform;
          if (transform && transform !== "none") {
            // Extract scale from transform matrix
            const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
            if (matrixMatch) {
              const values = matrixMatch[1].split(",");
              zoomFactor = parseFloat(values[0]) || 1.0;
            }
          }

          // Also check for zoom classes
          if (monitorContainer.classList.contains("zoomed")) {
            // Get the zoom level from data attribute or other source
            const zoomLevel =
              parseInt(document.body.getAttribute("data-zoom")) || 0;
            switch (zoomLevel) {
              case 1:
                zoomFactor = 1.1;
                break; // 110%
              case 2:
                zoomFactor = 1.25;
                break; // 125%
              default:
                zoomFactor = 1.0;
                break; // 100%
            }
          }
        }

        // Always calculate position relative to the current desktop viewport
        // This ensures Clippy stays anchored to the desktop container
        const basePosition = {
          x: rect.left + rect.width - values.rightOffset, // Centralized value
          y:
            rect.top + rect.height - values.taskbarHeight - values.bottomOffset,
        };

        return basePosition;
      }
    } catch (error) {
      console.warn("Error calculating desktop position:", error);
    }

    // Fallback position
    return { x: 520, y: 360 };
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
      // Speech balloon - position relative to dynamic Clippy position
      const balloonWidth = Math.min(280, viewportWidth - 40);
      const balloonHeight = 120;

      // Use the current mobile positioning values for consistent spacing
      const mobileValues = CLIPPY_POSITIONS.mobileValues;
      const clippyBottom = Math.min(mobileValues.bottom, viewportHeight * 0.2);
      const clippyRight = Math.min(mobileValues.right, viewportWidth * 0.1);

      // Calculate balloon position relative to expected Clippy position
      const clippyLeft = viewportWidth - clippyRight - 60; // Approximate Clippy width
      const clippyTop = viewportHeight - clippyBottom - 80; // Approximate Clippy height

      let left = Math.max(
        10,
        Math.min(clippyLeft - 100, viewportWidth - balloonWidth - 10)
      );

      let top = Math.max(10, clippyTop - balloonHeight - 20);

      // If goes above screen, put below Clippy
      if (top < 10) {
        top = clippyTop + 80 + 10; // Below Clippy
      }

      return { left, top };
    }
  }

  // FIXED CODE with bounds checking:
  static getDesktopBalloonPosition(clippyRect, balloonType) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (balloonType === "chat") {
      // Chat balloon dimensions (from CSS)
      const balloonWidth = 320; // from min(320px, calc(100vw - 20px))
      const balloonHeight = 200; // approximate height

      // Calculate desired position
      let left = clippyRect.left + clippyRect.width / 2 - 110;
      let top = clippyRect.top - 200;

      // Apply bounds checking to keep balloon on screen
      left = Math.max(10, Math.min(left, viewportWidth - balloonWidth - 10));
      top = Math.max(10, Math.min(top, viewportHeight - balloonHeight - 10));

      return { left, top };
    } else {
      // Speech balloon dimensions
      const balloonWidth = 280; // from max-width
      const balloonHeight = 120; // approximate height

      // Calculate desired position
      let left = clippyRect.left + clippyRect.width / 2 - 125;
      let top = clippyRect.top - 120;

      // Apply bounds checking to keep balloon on screen
      left = Math.max(10, Math.min(left, viewportWidth - balloonWidth - 10));
      top = Math.max(10, Math.min(top, viewportHeight - balloonHeight - 10));

      return { left, top };
    }
  }

  // Apply positioning styles to an element
  static applyStyles(element, styles) {
    if (!element) return false;

    try {
      Object.entries(styles).forEach(([key, value]) => {
        element.style[key] = value;
      });

      // Verify transform was applied correctly
      if (styles.transform) {
        const actualTransform = element.style.transform;

        // Add important flag if transform isn't sticking
        if (actualTransform !== styles.transform) {
          element.style.setProperty("transform", styles.transform, "important");
        }
      }

      return true;
    } catch (error) {
      console.error("Error applying styles:", error);
      return false;
    }
  }

  // ZOOM-AWARE: Apply anchored positioning with size-aware boundary constraints
  static applyAnchoredPosition(clippyElement) {
    if (!clippyElement) return false;

    const currentZoomLevel = resizeHandler.getCurrentZoomLevel();
    const anchoredPos = resizeHandler.getAnchoredPosition(currentZoomLevel);

    if (!anchoredPos) {
      console.warn(
        `⚠️ Cannot apply anchored position - no anchor cached for zoom ${currentZoomLevel}`
      );
      // If no anchor exists, create one immediately based on current size
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

  // Helper method to apply calculated position with proper scaling
  static applyCalculatedPosition(clippyElement, positionData, zoomLevel) {
    // Get current monitor zoom factor
    const zoomFactor = this.getMonitorZoomFactor();
    const adjustedScale = 0.9 * zoomFactor; // Base desktop scale * zoom factor

    const anchoredStyles = {
      position: "fixed",
      left: `${positionData.left}px`,
      top: `${positionData.top}px`,
      right: "auto",
      bottom: "auto",
      transform: `translateZ(0) scale(${adjustedScale})`, // Scaled with monitor zoom
      transformOrigin: "center bottom",
      zIndex: "2000",
    };

    const success = this.applyStyles(clippyElement, anchoredStyles);

    if (success) {
      // Add class to indicate Clippy is properly anchored for this zoom level
      clippyElement.classList.add("clippy-anchored");
      clippyElement.setAttribute("data-zoom-anchored", zoomLevel.toString());
      console.log(
        `⚓ Applied size-aware anchored position for zoom level ${zoomLevel}`,
        {
          position: `(${positionData.left.toFixed(
            1
          )}, ${positionData.top.toFixed(1)})`,
          scale: adjustedScale,
          expectedSize: positionData.appliedWidth
            ? `${positionData.appliedWidth.toFixed(
                1
              )}x${positionData.appliedHeight.toFixed(1)}`
            : "calculated",
        }
      );
    }

    return success;
  }

  // Get current monitor zoom factor
  static getMonitorZoomFactor() {
    try {
      // Method 1: Check data attribute on body (set by MonitorView)
      const dataZoom = parseInt(document.body.getAttribute("data-zoom")) || 0;

      if (dataZoom >= 0) {
        let factor;
        switch (dataZoom) {
          case 1:
            factor = 1.1;
            break; // 110%
          case 2:
            factor = 1.25;
            break; // 125%
          default:
            factor = 1.0;
            break; // 100%
        }
        return factor;
      }

      // Method 2: Check monitor container for zoom classes
      const monitorContainer = document.querySelector(".monitor-container");

      if (!monitorContainer) {
        return 1.0;
      }

      // Check for zoom classes
      if (monitorContainer.classList.contains("zoomed")) {
        // Try to extract zoom from transform
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

      return 1.0; // Default no zoom
    } catch (error) {
      console.warn("Error getting monitor zoom factor:", error);
      return 1.0;
    }
  }

  // ENHANCED: Force immediate positioning update for zoom changes
  static forceImmediateZoomPositioning(clippyElement, newZoomLevel) {
    if (!clippyElement) {
      console.warn("Cannot force positioning: Clippy element not provided");
      return false;
    }

    console.log(
      `⚡ Forcing immediate positioning for zoom level ${newZoomLevel}`
    );

    try {
      // 1. Clear any existing anchor for this zoom level for fresh calculation
      resizeHandler.clearZoomAnchor(newZoomLevel);

      // 2. Get current desktop viewport for accurate calculation
      const desktop =
        document.querySelector(".desktop.screen") ||
        document.querySelector(".desktop") ||
        document.querySelector(".w98");

      if (!desktop) {
        console.warn("Desktop viewport not found for positioning");
        return false;
      }

      const desktopRect = desktop.getBoundingClientRect();

      // 3. Calculate zoom factor
      let zoomFactor = 1.0;
      switch (newZoomLevel) {
        case 1:
          zoomFactor = 1.1;
          break; // 110%
        case 2:
          zoomFactor = 1.25;
          break; // 125%
        default:
          zoomFactor = 1.0;
          break; // 100%
      }

      const adjustedScale = 0.9 * zoomFactor;

      // 4. Use the EXACT same positioning values as CLIPPY_POSITIONS.desktopValues
      const rightOffset = 120;
      const bottomOffset = 100;
      const taskbarHeight = 30;

      // 5. Calculate position using the EXACT same logic as calculateDesktopPosition
      const correctLeft = desktopRect.left + desktopRect.width - rightOffset;
      const correctTop =
        desktopRect.top + desktopRect.height - taskbarHeight - bottomOffset;

      // 6. Apply positioning directly with all required styles
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

      // Apply styles with error handling
      const success = this.applyStyles(clippyElement, correctStyles);

      if (success) {
        // 7. Cache the anchor for future use with this zoom level
        const anchorCached = resizeHandler.cacheClippyAnchorPosition(
          clippyElement,
          newZoomLevel
        );

        // 8. Add visual indicators
        clippyElement.classList.add("clippy-anchored");
        clippyElement.setAttribute(
          "data-zoom-anchored",
          newZoomLevel.toString()
        );

        console.log(
          `✅ Applied immediate positioning for zoom ${newZoomLevel}:`,
          {
            position: `(${correctLeft.toFixed(1)}, ${correctTop.toFixed(1)})`,
            scale: adjustedScale,
            desktop: `${desktopRect.width.toFixed(
              1
            )}x${desktopRect.height.toFixed(1)}`,
            anchorCached: anchorCached ? "yes" : "no",
          }
        );

        return true;
      } else {
        console.error("Failed to apply positioning styles");
        return false;
      }
    } catch (error) {
      console.error("Error in forceImmediateZoomPositioning:", error);
      return false;
    }
  }

  // ENHANCED ZOOM-AWARE: Main positioning function with enhanced zoom priority
  static positionClippy(clippyElement, customPosition = null) {
    if (!clippyElement) return false;

    const currentZoomLevel = resizeHandler.getCurrentZoomLevel();
    console.log(`📍 Positioning Clippy for zoom level ${currentZoomLevel}`);

    // On desktop, ALWAYS try to use zoom-aware anchored positioning
    if (!isMobile) {
      // Check if we have a cached anchor for current zoom level
      if (resizeHandler.zoomLevelAnchors.has(currentZoomLevel)) {
        console.log(
          `⚓ Using cached anchor for zoom level ${currentZoomLevel}`
        );
        return this.applyAnchoredPosition(clippyElement);
      } else {
        console.log(
          `⚓ No anchor cached for zoom level ${currentZoomLevel}, creating fresh anchor`
        );
        // Create fresh anchor for current zoom level
        const anchorCached = resizeHandler.cacheClippyAnchorPosition(
          clippyElement,
          currentZoomLevel
        );

        if (anchorCached) {
          // Apply the fresh anchor immediately
          return this.applyAnchoredPosition(clippyElement);
        } else {
          console.warn(
            "Failed to cache anchor, falling back to normal positioning"
          );
        }
      }
    }

    // Fallback to normal positioning (mobile or if anchoring failed)
    const position = this.getClippyPosition(customPosition);
    return this.applyStyles(clippyElement, position);
  }

  // Main overlay positioning function
  static positionOverlay(overlayElement, clippyElement) {
    if (!overlayElement || !clippyElement) return false;

    const position = this.getOverlayPosition(clippyElement);

    // Don't override Clippy's transform - let overlay inherit the scale
    if (position) {
      // Remove transform from overlay positioning to avoid conflicts
      delete position.transform;
    }

    return this.applyStyles(overlayElement, position);
  }

  // ENHANCED ZOOM-AWARE: Combined positioning function with immediate zoom response
  static positionClippyAndOverlay(
    clippyElement,
    overlayElement,
    customPosition = null
  ) {
    if (!clippyElement) return false;

    const currentZoomLevel = resizeHandler.getCurrentZoomLevel();
    console.log(
      `🎯 Positioning Clippy and overlay for zoom level ${currentZoomLevel}`
    );

    // Position Clippy first with enhanced zoom-aware logic
    const clippySuccess = this.positionClippy(clippyElement, customPosition);

    // Ensure we have an anchor cached for the current zoom level after positioning
    if (
      !isMobile &&
      clippySuccess &&
      !resizeHandler.zoomLevelAnchors.has(currentZoomLevel)
    ) {
      console.log(
        `⚓ Caching anchor after positioning for zoom level ${currentZoomLevel}`
      );
      resizeHandler.cacheClippyAnchorPosition(clippyElement, currentZoomLevel);
    }

    // Then position overlay to match
    const overlaySuccess = overlayElement
      ? this.positionOverlay(overlayElement, clippyElement)
      : true;

    const success = clippySuccess && overlaySuccess;
    console.log(
      `🎯 Synchronized positioning: ${success ? "success" : "failed"}`
    );

    return success;
  }

  /**
   * Calculate mobile position for drag operations
   * Returns pixel values instead of CSS strings for easier calculations
   */
  static calculateMobilePositionForDrag() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const values = CLIPPY_POSITIONS.mobileValues;

    // Calculate responsive mobile position with pixel values
    const bottomPx = Math.min(values.bottom, viewportHeight * 0.2);
    const rightPx = Math.min(values.right, viewportWidth * 0.1);

    return {
      rightPx,
      bottomPx,
      // Also return CSS strings for compatibility
      right: `${rightPx}px`,
      bottom: `${bottomPx}px`
    };
  }

  /**
   * Apply mobile position with drag state handling
   * Integrates with drag system and performance optimizations
   */
  static applyMobilePosition(clippyElement, position, isDragging = false) {
    if (!clippyElement) return false;

    try {
      // Add drag state classes for CSS optimizations
      if (isDragging) {
        clippyElement.classList.add('clippy-dragging');
        // Prevent body scroll during drag
        document.body.classList.add('clippy-drag-active');
      } else {
        clippyElement.classList.remove('clippy-dragging');
        document.body.classList.remove('clippy-drag-active');
      }

      // Apply position with mobile-specific optimizations
      const mobileStyles = {
        position: "fixed",
        right: position.right || `${position.rightPx}px`,
        bottom: position.bottom || `${position.bottomPx}px`,
        left: "auto",
        top: "auto",
        transform: isDragging 
          ? "translateZ(0) scale(1.05)" // Slightly larger during drag
          : "translateZ(0) scale(0.8)",
        transformOrigin: "center bottom",
        zIndex: isDragging ? "1550" : "1500", // Higher z-index during drag
        // Performance optimizations
        backfaceVisibility: "hidden",
        willChange: isDragging ? "transform, opacity, right, bottom" : "transform",
        // iOS Safari optimizations
        WebkitTransform: isDragging 
          ? "translateZ(0) scale(1.05)" 
          : "translateZ(0) scale(0.8)",
        WebkitBackfaceVisibility: "hidden",
        // Touch optimizations
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        // Transitions
        transition: isDragging ? "none" : "transform 0.2s ease, right 0.2s ease, bottom 0.2s ease",
      };

      return this.applyStyles(clippyElement, mobileStyles);
    } catch (error) {
      console.error("Error applying mobile position:", error);
      return false;
    }
  }

  /**
   * Enforce mobile boundaries during drag
   * Prevents Clippy from being dragged off-screen
   */
  static enforceMobileBoundaries(position) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Safe areas with iOS considerations
    const safeLeft = Math.max(10, window.safeAreaInsets?.left || 0);
    const safeRight = Math.max(10, window.safeAreaInsets?.right || 0);
    const safeTop = Math.max(10, window.safeAreaInsets?.top || 0);
    const safeBottom = Math.max(80, window.safeAreaInsets?.bottom || 0); // Above taskbar

    // Clippy dimensions (approximate)
    const clippyWidth = 60;
    const clippyHeight = 80;

    // Enforce boundaries
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

  /**
   * Handle mobile drag positioning with performance optimizations
   * Main method called during drag operations
   */
  static handleMobileDrag(clippyElement, overlayElement, newPosition, isDragging = true) {
    if (!clippyElement || !isMobile) return false;

    try {
      // Enforce boundaries
      const boundedPosition = this.enforceMobileBoundaries(newPosition);

      // Apply position to Clippy with drag optimizations
      const clippySuccess = this.applyMobilePosition(clippyElement, boundedPosition, isDragging);

      // Synchronize overlay position immediately
      let overlaySuccess = true;
      if (overlayElement) {
        // Add drag state to overlay
        if (isDragging) {
          overlayElement.classList.add('overlay-dragging');
        } else {
          overlayElement.classList.remove('overlay-dragging');
        }

        overlaySuccess = this.positionOverlay(overlayElement, clippyElement);
      }

      return clippySuccess && overlaySuccess;
    } catch (error) {
      console.error("Error handling mobile drag:", error);
      return false;
    }
  }

  /**
   * Start mobile drag session
   * Sets up performance optimizations and initial state
   */
  static startMobileDrag(clippyElement, overlayElement) {
    if (!clippyElement || !isMobile) return false;

    try {
      // Add performance optimizations
      clippyElement.classList.add('clippy-dragging');
      document.body.classList.add('clippy-drag-active');
      
      if (overlayElement) {
        overlayElement.classList.add('overlay-dragging');
      }

      // Disable transitions for immediate response
      clippyElement.style.transition = 'none';
      if (overlayElement) {
        overlayElement.style.transition = 'none';
      }

      // Enhance hardware acceleration
      const enhancedStyles = {
        willChange: 'transform, opacity, right, bottom',
        contain: 'layout style paint',
        isolation: 'isolate',
      };

      this.applyStyles(clippyElement, enhancedStyles);

      return true;
    } catch (error) {
      console.error("Error starting mobile drag:", error);
      return false;
    }
  }

  /**
   * End mobile drag session
   * Cleans up performance optimizations and resets state
   */
  static endMobileDrag(clippyElement, overlayElement, finalPosition) {
    if (!clippyElement || !isMobile) return false;

    try {
      // Apply final position
      if (finalPosition) {
        const boundedPosition = this.enforceMobileBoundaries(finalPosition);
        this.applyMobilePosition(clippyElement, boundedPosition, false);
      }

      // Clean up drag classes
      clippyElement.classList.remove('clippy-dragging');
      document.body.classList.remove('clippy-drag-active');
      
      if (overlayElement) {
        overlayElement.classList.remove('overlay-dragging');
      }

      // Re-enable transitions
      setTimeout(() => {
        if (clippyElement) {
          clippyElement.style.transition = '';
        }
        if (overlayElement) {
          overlayElement.style.transition = '';
        }
      }, 100);

      // Reset performance optimizations
      const resetStyles = {
        willChange: 'transform',
        contain: '',
        isolation: '',
      };

      this.applyStyles(clippyElement, resetStyles);

      return true;
    } catch (error) {
      console.error("Error ending mobile drag:", error);
      return false;
    }
  }

  /**
   * Apply lock state styling
   * Visual indicator for locked/unlocked state
   */
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
      console.error("Error applying lock state:", error);
      return false;
    }
  }

  /**
   * Get safe area insets for mobile positioning
   * Handles iOS safe areas and Android navigation bars
   */
  static getMobileSafeAreas() {
    try {
      // Try to get CSS environment variables (iOS safe areas)
      const computedStyle = getComputedStyle(document.documentElement);
      
      return {
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 10,
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 10,
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 80,
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 10,
      };
    } catch (error) {
      // Fallback safe areas
      return { top: 10, right: 10, bottom: 80, left: 10 };
    }
  }

  /**
   * Enhanced mobile positioning that replaces calculateMobilePosition for drag support
   */
  static calculateEnhancedMobilePosition(customPosition = null) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const values = CLIPPY_POSITIONS.mobileValues;
    const safeAreas = this.getMobileSafeAreas();

    if (customPosition) {
      // Use custom position with boundary enforcement
      return this.enforceMobileBoundaries(customPosition);
    }

    // Calculate default position with safe areas
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
      transform: "translateZ(0) scale(0.8)",
      transformOrigin: "center bottom",
      zIndex: "1500",
      left: "auto",
      top: "auto"
    };
  }

  // Expose mobile detection for consistency
  static get isMobile() {
    return isMobile;
  }

  // Get current expected Clippy dimensions for calculations
  static getExpectedClippyDimensions() {
    const scale = isMobile
      ? CLIPPY_POSITIONS.mobileValues.scale
      : CLIPPY_POSITIONS.desktopValues.scale;
    return {
      width: 124 * scale, // Base Clippy width * scale
      height: 93 * scale, // Base Clippy height * scale
    };
  }

  // ===== ZOOM-AWARE RESIZE HANDLING METHODS =====

  /**
   * ZOOM-AWARE: Start listening for resize events with zoom awareness
   * @param {HTMLElement} clippyElement - The Clippy DOM element
   * @param {HTMLElement} overlayElement - The overlay DOM element
   * @param {Function} customPositionGetter - Optional function to get custom position
   */
  static startResizeHandling(
    clippyElement,
    overlayElement,
    customPositionGetter = null
  ) {
    if (!clippyElement) {
      console.warn("Cannot start resize handling: Clippy element not provided");
      return false;
    }

    const resizeCallback = (eventType, data) => {
      try {
        // Handle immediate zoom changes - apply positioning right away
        if (eventType === "zoom-change-immediate") {
          console.log(
            `📏 Handling immediate zoom change: ${data.oldZoomLevel} → ${data.newZoomLevel}`
          );

          // Apply new positioning immediately without waiting
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
            // Desktop: Apply fresh size-aware positioning immediately
            const positioned = this.applyAnchoredPosition(clippyElement);
            if (positioned && overlayElement) {
              this.positionOverlay(overlayElement, clippyElement);
            }
          }
          return;
        }

        // Handle regular zoom changes - for any cleanup or secondary effects
        if (eventType === "zoom-change") {
          console.log(
            `📏 Handling zoom change: ${data.oldZoomLevel} → ${data.newZoomLevel}`
          );

          // Small delay to ensure any DOM changes are complete
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
              // Desktop: Ensure positioning is correct
              this.positionClippyAndOverlay(
                clippyElement,
                overlayElement,
                null
              );
            }
          }, 50);
          return;
        }

        // Handle real-time resize events for smooth visual updates
        if (eventType === "realtime-resize" || eventType === "resize-start") {
          if (isMobile) {
            // Mobile: use normal responsive positioning
            const customPosition = customPositionGetter
              ? customPositionGetter()
              : null;
            this.positionClippyAndOverlay(
              clippyElement,
              overlayElement,
              customPosition
            );
          } else {
            // Desktop: use zoom-aware anchored positioning to maintain exact position
            const currentZoomLevel = resizeHandler.getCurrentZoomLevel();
            if (resizeHandler.zoomLevelAnchors.has(currentZoomLevel)) {
              // Real-time zoom-aware anchored positioning during resize
              this.applyAnchoredPosition(clippyElement);
              if (overlayElement) {
                this.positionOverlay(overlayElement, clippyElement);
              }
            } else {
              // No anchor for current zoom level, use normal positioning
              this.positionClippyAndOverlay(
                clippyElement,
                overlayElement,
                customPositionGetter ? customPositionGetter() : null
              );
            }
          }
        }

        // Handle resize completion
        if (eventType === "resize-complete") {
          console.log("🔄 Resize operation completed");
        }

        // Trigger custom event for other components
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
        console.error("Error during zoom-aware repositioning:", error);
      }
    };

    // Store callback reference for cleanup
    clippyElement._resizeCallback = resizeCallback;

    resizeHandler.addListener(resizeCallback);

    const mode = isMobile ? "responsive mobile" : "desktop zoom-aware anchored";
    console.log(`⚓ Clippy resize handling started in ${mode} mode`);
    return true;
  }

  /**
   * Stop listening for resize events
   * @param {HTMLElement} clippyElement - The Clippy DOM element (used to get stored callback)
   */
  static stopResizeHandling(clippyElement) {
    if (clippyElement && clippyElement._resizeCallback) {
      resizeHandler.removeListener(clippyElement._resizeCallback);
      delete clippyElement._resizeCallback;
      console.log("⚓ Clippy zoom-aware resize handling stopped");
      return true;
    }
    return false;
  }

  /**
   * ENHANCED: Handle zoom level changes with immediate positioning
   * @param {number} newZoomLevel - The new zoom level (0, 1, or 2)
   * @param {HTMLElement} clippyElement - The Clippy DOM element
   */
  static handleZoomChange(newZoomLevel, clippyElement) {
    console.log(
      `📏 ClippyPositioning.handleZoomChange called: zoom → ${newZoomLevel}`
    );

    if (!clippyElement) {
      console.warn("Cannot handle zoom change: Clippy element not provided");
      return false;
    }

    // Use the enhanced immediate positioning
    const success = this.forceImmediateZoomPositioning(
      clippyElement,
      newZoomLevel
    );

    // Also delegate to the resize handler's zoom change logic for completeness
    resizeHandler.handleZoomChange(newZoomLevel, clippyElement);

    return success;
  }

  /**
   * ZOOM-AWARE: Clear cached anchors for specific or all zoom levels
   * @param {number|null} zoomLevel - Specific zoom level to clear, or null for all
   */
  static clearZoomAnchor(zoomLevel = null) {
    resizeHandler.clearZoomAnchor(zoomLevel);
  }

  /**
   * ZOOM-AWARE: Get current zoom level
   * @returns {number} Current zoom level (0, 1, or 2)
   */
  static getCurrentZoomLevel() {
    return resizeHandler.getCurrentZoomLevel();
  }

  /**
   * ZOOM-AWARE: Force refresh of anchor for current zoom level
   * @param {HTMLElement} clippyElement - The Clippy DOM element
   */
  static refreshZoomAnchor(clippyElement) {
    if (!clippyElement) return false;

    const currentZoomLevel = resizeHandler.getCurrentZoomLevel();

    // Clear existing anchor for current zoom
    resizeHandler.clearZoomAnchor(currentZoomLevel);

    // Cache fresh anchor for current zoom
    return resizeHandler.cacheClippyAnchorPosition(
      clippyElement,
      currentZoomLevel
    );
  }

  /**
   * Manually trigger a resize event (useful for testing or forced updates)
   */
  static triggerResize() {
    resizeHandler.handleResizeImmediate();
  }

  /**
   * ZOOM-AWARE: Manually trigger repositioning with zoom consideration
   */
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

  /**
   * HYBRID SOLUTION: Wait for monitor movement/transitions to complete
   * This is the core method that solves the zoom positioning timing issue
   * @param {number} maxWaitTime - Maximum time to wait in milliseconds
   * @returns {Promise} Promise that resolves when monitor movement is complete
   */
  static waitForMonitorMovementCompletion(maxWaitTime = 1000) {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const checkMovementComplete = () => {
        try {
          // Check if we've exceeded max wait time
          if (Date.now() - startTime > maxWaitTime) {
            console.log("⏱️ Monitor movement wait timeout reached, proceeding");
            resolve(true);
            return;
          }

          // Check for active CSS transitions on monitor container
          const monitorContainer = document.querySelector(".monitor-container");
          if (monitorContainer) {
            const computedStyle = window.getComputedStyle(monitorContainer);
            const isTransitioning =
              computedStyle.transitionDuration !== "0s" ||
              computedStyle.animationDuration !== "0s";

            if (isTransitioning) {
              console.log("🔄 Monitor transition in progress, waiting...");
              setTimeout(checkMovementComplete, 50);
              return;
            }
          }

          // Check for zoom state consistency
          const currentZoomLevel = resizeHandler.getCurrentZoomLevel();
          const bodyZoomAttr =
            parseInt(document.body.getAttribute("data-zoom")) || 0;

          if (bodyZoomAttr !== currentZoomLevel) {
            console.log("⚙️ Zoom state settling, waiting for consistency...");
            setTimeout(checkMovementComplete, 25);
            return;
          }

          // Check for viewport stability
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
              console.log(
                "📐 Desktop viewport still changing, waiting for stability..."
              );
              this._lastDesktopRect = currentRect;
              setTimeout(checkMovementComplete, 25);
              return;
            }
          }

          // All checks passed - movement is complete
          console.log("✅ Monitor movement completed, safe to position Clippy");
          delete this._lastDesktopRect;
          resolve(true);
        } catch (error) {
          console.warn("Error checking monitor movement completion:", error);
          resolve(true);
        }
      };

      checkMovementComplete();
    });
  }

  /**
   * HYBRID PHASE 2: Position validation - checks if Clippy position is reasonable
   * @param {HTMLElement} clippyElement - The Clippy DOM element
   * @returns {boolean} True if position is valid, false if correction needed
   */
  static validateClippyPosition(clippyElement) {
    if (!clippyElement) {
      console.warn("⚠️ Cannot validate position: no Clippy element");
      return false;
    }

    try {
      const rect = clippyElement.getBoundingClientRect();

      if (isMobile) {
        // Mobile validation: check bottom-right positioning with visibility
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Clippy should be visible and in bottom-right area
        const isVisible = rect.width > 0 && rect.height > 0;
        const isInBottomRight =
          rect.bottom < viewportHeight && rect.right < viewportWidth;
        const isReasonablyPositioned = rect.left > 0 && rect.top > 0;

        const isValid = isVisible && isInBottomRight && isReasonablyPositioned;

        console.log(
          `📱 Mobile position validation: ${
            isValid ? "✅ VALID" : "❌ INVALID"
          }`,
          {
            visible: isVisible,
            bottomRight: isInBottomRight,
            reasonable: isReasonablyPositioned,
            position: `(${rect.left.toFixed(1)}, ${rect.top.toFixed(1)})`,
            size: `${rect.width.toFixed(1)}x${rect.height.toFixed(1)}`,
          }
        );

        return isValid;
      } else {
        // Desktop validation: check bounds within desktop area, avoiding corners
        const desktop =
          document.querySelector(".desktop.screen") ||
          document.querySelector(".desktop") ||
          document.querySelector(".w98");

        if (!desktop) {
          console.warn(
            "⚠️ Cannot validate desktop position: desktop not found"
          );
          return false;
        }

        const desktopRect = desktop.getBoundingClientRect();

        // Check if Clippy is within desktop bounds
        const isWithinBounds =
          rect.left >= desktopRect.left &&
          rect.top >= desktopRect.top &&
          rect.right <= desktopRect.right &&
          rect.bottom <= desktopRect.bottom;

        // Check if Clippy is visible (not zero-sized)
        const isVisible = rect.width > 0 && rect.height > 0;

        // Avoid corners - Clippy should not be too close to edges
        const margin = 50;
        const isNotInCorners =
          rect.left > desktopRect.left + margin &&
          rect.top > desktopRect.top + margin &&
          rect.right < desktopRect.right - margin &&
          rect.bottom < desktopRect.bottom - margin;

        // Expected positioning check - should be in lower-right area
        const expectedX = desktopRect.left + desktopRect.width - 120; // rightOffset
        const expectedY = desktopRect.top + desktopRect.height - 30 - 100; // taskbar + bottomOffset
        const positionTolerance = 100; // Allow some tolerance

        const isNearExpected =
          Math.abs(rect.left - expectedX) < positionTolerance &&
          Math.abs(rect.top - expectedY) < positionTolerance;

        const isValid = isWithinBounds && isVisible && isNearExpected;

        console.log(
          `🖥️ Desktop position validation: ${
            isValid ? "✅ VALID" : "❌ INVALID"
          }`,
          {
            withinBounds: isWithinBounds,
            visible: isVisible,
            nearExpected: isNearExpected,
            notInCorners: isNotInCorners,
            position: `(${rect.left.toFixed(1)}, ${rect.top.toFixed(1)})`,
            expected: `(${expectedX.toFixed(1)}, ${expectedY.toFixed(1)})`,
            desktop: `${desktopRect.width.toFixed(
              1
            )}x${desktopRect.height.toFixed(1)}`,
          }
        );

        return isValid;
      }
    } catch (error) {
      console.error("Error validating Clippy position:", error);
      return false;
    }
  }

  /**
   * HYBRID PHASE 3: Position correction - applies corrective positioning when validation fails
   * @param {HTMLElement} clippyElement - The Clippy DOM element
   * @returns {Promise<boolean>} Promise resolving to success of correction
   */
  static positionCorrection(clippyElement) {
    return new Promise((resolve) => {
      if (!clippyElement) {
        console.warn("⚠️ Cannot apply position correction: no Clippy element");
        resolve(false);
        return;
      }

      console.log("🔧 Applying position correction...");

      // Use requestAnimationFrame for minimal delay
      requestAnimationFrame(() => {
        try {
          const currentZoomLevel = resizeHandler.getCurrentZoomLevel();

          // Clear cached anchors to force fresh calculation
          resizeHandler.clearZoomAnchor(currentZoomLevel);
          console.log(
            `🗑️ Cleared anchors for correction at zoom level ${currentZoomLevel}`
          );

          // Apply fresh positioning
          let success = false;

          if (isMobile) {
            // Mobile: use fresh mobile positioning
            const position = this.calculateMobilePosition();
            success = this.applyStyles(clippyElement, position);
          } else {
            // Desktop: force immediate fresh positioning
            success = this.forceImmediateZoomPositioning(
              clippyElement,
              currentZoomLevel
            );
          }

          if (success) {
            console.log("✅ Position correction applied successfully");

            // OPTIMIZED: Use requestAnimationFrame for fastest validation
            requestAnimationFrame(() => {
              const isNowValid = this.validateClippyPosition(clippyElement);
              console.log(
                `🔍 Post-correction validation: ${
                  isNowValid ? "✅ SUCCESS" : "❌ STILL INVALID"
                }`
              );
              resolve(isNowValid);
            }); // OPTIMIZED: ~16ms instead of 50ms
          } else {
            console.error("❌ Position correction failed to apply");
            resolve(false);
          }
        } catch (error) {
          console.error("Error during position correction:", error);
          resolve(false);
        }
      });
    });
  }

  /**
   * HYBRID PHASE 4: Main hybrid zoom positioning method - orchestrates all 4 phases
   * @param {HTMLElement} clippyElement - The Clippy DOM element
   * @param {number} newZoomLevel - The new zoom level (0, 1, or 2)
   * @returns {Promise<boolean>} Promise resolving to success of positioning
   */
  static hybridZoomPositioning(clippyElement, newZoomLevel) {
    return new Promise(async (resolve) => {
      if (!clippyElement) {
        console.warn("⚠️ Cannot perform hybrid positioning: no Clippy element");
        resolve(false);
        return;
      }

      // AUTO-FIND OVERLAY: Get the clickable overlay element automatically
      const overlayElement = document.getElementById(
        "clippy-clickable-overlay"
      );
      console.log(
        `🎯 Auto-detected overlay: ${overlayElement ? "found" : "not found"}`
      );

      console.log(
        `🚀 Starting hybrid zoom positioning with overlay for level ${newZoomLevel}`
      );

      try {
        // PHASE 1: Wait for monitor movement completion (OPTIMIZED: faster timeout)
        console.log("📍 Phase 1: Waiting for monitor movement completion...");
        await this.waitForMonitorMovementCompletion(150); // Reduced from 300ms to 150ms

        // PHASE 2: Apply primary positioning (CLIPPY + OVERLAY)
        console.log("📍 Phase 2: Applying primary positioning...");
        let positionSuccess = false;

        if (isMobile) {
          const position = this.calculateMobilePosition();
          positionSuccess = this.applyStyles(clippyElement, position);

          // Position overlay immediately after Clippy on mobile
          if (positionSuccess && overlayElement) {
            this.positionOverlay(overlayElement, clippyElement);
          }
        } else {
          positionSuccess = this.forceImmediateZoomPositioning(
            clippyElement,
            newZoomLevel
          );

          // Position overlay immediately after Clippy on desktop
          if (positionSuccess && overlayElement) {
            this.positionOverlay(overlayElement, clippyElement);
          }
        }

        if (!positionSuccess) {
          console.error(
            "❌ Phase 2 failed: Could not apply primary positioning"
          );
          resolve(false);
          return;
        }

        // OPTIMIZED: Use requestAnimationFrame instead of setTimeout for faster response
        requestAnimationFrame(async () => {
          // PHASE 3: Validate positioning accuracy
          console.log("📍 Phase 3: Validating positioning accuracy...");
          const isValid = this.validateClippyPosition(clippyElement);

          if (isValid) {
            // OVERLAY SYNC: Ensure overlay follows Clippy after validation
            if (overlayElement) {
              this.positionOverlay(overlayElement, clippyElement);
            }

            console.log(
              "✅ Hybrid positioning completed successfully - validation passed"
            );
            resolve(true);
          } else {
            // PHASE 4: Apply correction if validation fails (CLIPPY + OVERLAY)
            console.log(
              "📍 Phase 4: Validation failed, applying correction..."
            );
            const correctionSuccess = await this.positionCorrection(
              clippyElement
            );

            if (correctionSuccess) {
              // OVERLAY SYNC: Ensure overlay follows Clippy after correction
              if (overlayElement) {
                this.positionOverlay(overlayElement, clippyElement);
              }

              console.log(
                "✅ Hybrid positioning completed successfully - correction applied"
              );
              resolve(true);
            } else {
              console.error(
                "❌ Hybrid positioning failed - correction unsuccessful"
              );
              resolve(false);
            }
          }
        }); // OPTIMIZED: ~16ms instead of 100ms
      } catch (error) {
        console.error("Error during hybrid zoom positioning:", error);
        resolve(false);
      }
    });
  }

  /**
   * ZOOM-AWARE: Get debug information about zoom and anchoring
   */
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

  /**
   * Get information about current viewport and device
   */
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

  // Expose mobile detection
  static get isMobile() {
    return isMobile;
  }
}

// ===== GLOBAL ACCESS =====
window.ClippyPositioning = ClippyPositioning;
window.ClippyResizeHandler = resizeHandler;

export default ClippyPositioning;
