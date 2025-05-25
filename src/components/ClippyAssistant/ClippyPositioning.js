// ClippyPositioning.js - Centralized positioning logic with REAL-TIME resize handling
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

// ===== REAL-TIME RESIZE HANDLING SYSTEM =====
class RealTimeResizeHandler {
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

    // Cache initial desktop viewport and Clippy's anchored position
    this.initialDesktopRect = null;
    this.clippyAnchorOffset = null; // Stores Clippy's fixed offset from desktop
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
      // Clear cached data when no more listeners
      this.clippyAnchorOffset = null;
      this.initialDesktopRect = null;
    }
  }

  cacheClippyAnchorPosition(clippyElement) {
    if (this.clippyAnchorOffset || !clippyElement) return; // Already cached or no element

    const desktop =
      document.querySelector(".desktop.screen") ||
      document.querySelector(".desktop") ||
      document.querySelector(".w98");

    if (!desktop) {
      console.warn("⚠️ Cannot cache Clippy anchor - desktop not found");
      return;
    }

    const desktopRect = desktop.getBoundingClientRect();
    const clippyRect = clippyElement.getBoundingClientRect();

    // Calculate Clippy's current offset from desktop edges
    this.clippyAnchorOffset = {
      // Distance from desktop edges (as percentages for scaling)
      fromDesktopRightPercent:
        (desktopRect.right - clippyRect.right) / desktopRect.width,
      fromDesktopBottomPercent:
        (desktopRect.bottom - clippyRect.bottom) / desktopRect.height,
      fromDesktopLeftPercent:
        (clippyRect.left - desktopRect.left) / desktopRect.width,
      fromDesktopTopPercent:
        (clippyRect.top - desktopRect.top) / desktopRect.height,

      // Also store original pixel values for reference
      fromDesktopRight: desktopRect.right - clippyRect.right,
      fromDesktopBottom: desktopRect.bottom - clippyRect.bottom,
      fromDesktopLeft: clippyRect.left - desktopRect.left,
      fromDesktopTop: clippyRect.top - desktopRect.top,

      // Store original dimensions for reference
      clippyWidth: clippyRect.width,
      clippyHeight: clippyRect.height,

      // Cache the desktop rect for reference
      originalDesktopRect: { ...desktopRect },
    };

    console.log("⚓ Clippy anchor position cached:", this.clippyAnchorOffset);
  }

  getAnchoredPosition() {
    if (!this.clippyAnchorOffset) {
      console.warn("⚠️ Clippy anchor offset not cached");
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

    // Use percentage-based positioning for better scaling during resize
    const anchoredPosition = {
      left:
        currentDesktopRect.right -
        this.clippyAnchorOffset.fromDesktopRightPercent *
          currentDesktopRect.width -
        this.clippyAnchorOffset.clippyWidth,
      top:
        currentDesktopRect.bottom -
        this.clippyAnchorOffset.fromDesktopBottomPercent *
          currentDesktopRect.height -
        this.clippyAnchorOffset.clippyHeight,
    };

    return anchoredPosition;
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

    // Clear cached data
    this.clippyAnchorOffset = null;
    this.initialDesktopRect = null;
  }

  // NEW: Real-time monitoring using requestAnimationFrame
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

  // NEW: Check for size changes every frame during resize
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

// Global resize handler instance
const resizeHandler = new RealTimeResizeHandler();

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

  // Apply anchored positioning to Clippy element - NOW WITH REAL-TIME UPDATES
  static applyAnchoredPosition(clippyElement) {
    if (!clippyElement) return false;

    const anchoredPos = resizeHandler.getAnchoredPosition();
    if (!anchoredPos) {
      console.warn("⚠️ Cannot apply anchored position - not cached");
      return false;
    }

    // Get current monitor zoom factor
    const zoomFactor = this.getMonitorZoomFactor();
    const adjustedScale = 0.9 * zoomFactor; // Base desktop scale * zoom factor

    const anchoredStyles = {
      position: "fixed",
      left: `${anchoredPos.left}px`,
      top: `${anchoredPos.top}px`,
      right: "auto",
      bottom: "auto",
      transform: `translateZ(0) scale(${adjustedScale})`, // Scaled with monitor zoom
      transformOrigin: "center bottom",
      zIndex: "2000",
    };

    const success = this.applyStyles(clippyElement, anchoredStyles);

    if (success) {
      // Add class to indicate Clippy is properly anchored
      clippyElement.classList.add("clippy-anchored");
    }

    return success;
  }

  // Get current monitor zoom factor
  static getMonitorZoomFactor() {
    try {
      // Method 1: Check data attribute on body (set by MonitorView)
      const dataZoom = parseInt(document.body.getAttribute("data-zoom")) || 0;

      if (dataZoom > 0) {
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

  // Main positioning function - call this to position Clippy
  static positionClippy(clippyElement, customPosition = null) {
    if (!clippyElement) return false;

    // On desktop, try to use anchored positioning if available
    if (!isMobile && resizeHandler.clippyAnchorOffset) {
      return this.applyAnchoredPosition(clippyElement);
    }

    // Fallback to normal positioning (initial setup or mobile)
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

  // Combined positioning function to ensure synchronization
  static positionClippyAndOverlay(
    clippyElement,
    overlayElement,
    customPosition = null
  ) {
    if (!clippyElement) return false;

    // Position Clippy first (using anchored positioning if available)
    const clippySuccess = this.positionClippy(clippyElement, customPosition);

    // Cache anchor position after first positioning (desktop only)
    if (!isMobile && !resizeHandler.clippyAnchorOffset && clippySuccess) {
      // Wait a frame for positioning to take effect, then cache
      requestAnimationFrame(() => {
        resizeHandler.cacheClippyAnchorPosition(clippyElement);
      });
    }

    // Then position overlay to match
    const overlaySuccess = overlayElement
      ? this.positionOverlay(overlayElement, clippyElement)
      : true;

    return clippySuccess && overlaySuccess;
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

  // ===== UPDATED RESIZE HANDLING METHODS =====

  /**
   * Start listening for resize events with REAL-TIME updates
   * Clippy will stay locked to its exact position relative to the desktop viewport
   * @param {HTMLElement} clippyElement - The Clippy DOM element
   * @param {HTMLElement} overlayElement - The overlay DOM element
   * @param {Function} customPositionGetter - Optional function to get custom position (ignored after anchoring)
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
            // Desktop: use anchored positioning to maintain exact position
            if (resizeHandler.clippyAnchorOffset) {
              // Real-time anchored positioning during resize
              this.applyAnchoredPosition(clippyElement);
              if (overlayElement) {
                this.positionOverlay(overlayElement, clippyElement);
              }
            } else {
              // No anchor yet, use normal positioning (this will establish the anchor)
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
              anchored: !isMobile && !!resizeHandler.clippyAnchorOffset,
              zoomFactor: this.getMonitorZoomFactor(),
            },
          })
        );
      } catch (error) {
        console.error("Error during real-time repositioning:", error);
      }
    };

    // Store callback reference for cleanup
    clippyElement._resizeCallback = resizeCallback;

    resizeHandler.addListener(resizeCallback);

    const mode = isMobile ? "responsive mobile" : "desktop real-time anchored";
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
      console.log("⚓ Clippy resize handling stopped");
      return true;
    }
    return false;
  }

  /**
   * Manually trigger a resize event (useful for testing or forced updates)
   */
  static triggerResize() {
    resizeHandler.handleResizeImmediate();
  }

  /**
   * Manually trigger repositioning (useful for zoom changes)
   */
  static triggerRepositioning() {
    resizeHandler.notifyListeners("manual-reposition", {
      width: window.innerWidth,
      height: window.innerHeight,
      type: "manual-reposition",
      reason: "zoom-change",
    });
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
