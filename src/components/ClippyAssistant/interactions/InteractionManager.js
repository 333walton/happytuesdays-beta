// InteractionManager.js - Smart interaction handling with iOS Safari support
const isDev = process.env.NODE_ENV === "development";

// iOS Safari detection (more refined)
const isIOSSafari = (() => {
  try {
    const userAgent = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent);
    const isLikelyNotSafari = /CriOS\/|FxiOS\/|EdgiOS\/|OPiOS\//.test(
      userAgent
    );
    return isIOS && isSafari && !isLikelyNotSafari;
  } catch {
    return false;
  }
})();

// Smart cooldown system - different cooldowns for different interaction types
const COOLDOWN_TYPES = {
  ANIMATION: 1500, // Prevent animation queuing (reduced from 3000ms)
  BALLOON: 1000, // Prevent balloon spam
  CONTEXT_MENU: 500, // Prevent menu spam
  // NO cooldown for double-click/double-tap - they should always work!
};

const devLog = (message, ...args) => {
  if (isDev) {
    console.log(`🎛️ InteractionManager: ${message}`, ...args);
  }
};

class InteractionManager {
  constructor() {
    this.lastInteractionTimes = {
      animation: 0,
      balloon: 0,
      contextMenu: 0,
    };
    this.pendingTimeouts = new Map();
    this.isDoubleClickInProgress = false;
  }

  // iOS Safari optimized timing
  getDoubleClickDelay() {
    return isIOSSafari ? 200 : 250;
  }

  // Check if interaction type is allowed (no cooldown check for double-click/double-tap)
  canInteract(type) {
    const now = Date.now();

    switch (type) {
      case "double-click":
      case "double-tap":
        // Double interactions ALWAYS allowed - no cooldown!
        return true;

      case "single-click":
      case "single-tap":
        return (
          now - this.lastInteractionTimes.animation > COOLDOWN_TYPES.ANIMATION
        );

      case "balloon":
        return now - this.lastInteractionTimes.balloon > COOLDOWN_TYPES.BALLOON;

      case "context-menu":
        return (
          now - this.lastInteractionTimes.contextMenu >
          COOLDOWN_TYPES.CONTEXT_MENU
        );

      default:
        return true;
    }
  }

  // Record interaction time (only for types that need cooldown)
  recordInteraction(type) {
    const now = Date.now();

    switch (type) {
      case "single-click":
      case "single-tap":
        this.lastInteractionTimes.animation = now;
        break;
      case "balloon":
        this.lastInteractionTimes.balloon = now;
        break;
      case "context-menu":
        this.lastInteractionTimes.contextMenu = now;
        break;
      // No recording for double-click/double-tap - they don't have cooldowns
    }
  }

  // Enhanced click handler that properly separates single/double clicks
  handleClick(element, handlers, e) {
    const clickCount = e.detail;
    const elementId = element.id || element.className || "unknown";

    devLog(`Click detected: count=${clickCount}, element=${elementId}`);

    if (clickCount === 1) {
      // Single click - set timeout to see if it becomes a double click
      const timeoutId = `${elementId}-single-click`;

      // Clear any existing timeout for this element
      if (this.pendingTimeouts.has(timeoutId)) {
        clearTimeout(this.pendingTimeouts.get(timeoutId));
      }

      const singleClickTimer = setTimeout(() => {
        this.pendingTimeouts.delete(timeoutId);

        // Only process single click if double click detection period has passed
        if (!this.isDoubleClickInProgress) {
          this.processSingleClick(handlers, e);
        }
      }, this.getDoubleClickDelay());

      this.pendingTimeouts.set(timeoutId, singleClickTimer);
    } else if (clickCount === 2) {
      // Double click detected
      const timeoutId = `${elementId}-single-click`;

      // Cancel any pending single click
      if (this.pendingTimeouts.has(timeoutId)) {
        clearTimeout(this.pendingTimeouts.get(timeoutId));
        this.pendingTimeouts.delete(timeoutId);
      }

      // Set flag to prevent single click processing
      this.isDoubleClickInProgress = true;

      // Process double click immediately (no cooldown check!)
      this.processDoubleClick(handlers, e);

      // Clear flag after a short delay
      setTimeout(() => {
        this.isDoubleClickInProgress = false;
      }, this.getDoubleClickDelay() + 50);
    }
  }

  processSingleClick(handlers, e) {
    // Check cooldown only for single click
    if (!this.canInteract("single-click")) {
      devLog("Single click blocked by animation cooldown");
      return false;
    }

    devLog("Processing single click");
    this.recordInteraction("single-click");

    if (handlers.onSingleClick) {
      return handlers.onSingleClick(e);
    }
    return false;
  }

  processDoubleClick(handlers, e) {
    // Double click bypasses all cooldowns!
    devLog("Processing double click (no cooldown check)");

    if (handlers.onDoubleClick) {
      return handlers.onDoubleClick(e);
    }
    return false;
  }

  // iOS Safari-specific touch optimizations
  setupIOSSafariTouch(element) {
    if (!isIOSSafari) return;

    // Apply iOS Safari-specific styles to prevent interference
    element.style.cssText += `
      -webkit-touch-callout: none !important;
      -webkit-user-select: none !important;
      touch-action: manipulation !important;
      -webkit-tap-highlight-color: transparent !important;
    `;

    devLog("iOS Safari touch optimizations applied to element");
  }

  // Enhanced mobile touch handling with iOS Safari support
  handleMobileTouch(element, handlers) {
    if (!element) return;

    // Apply iOS Safari optimizations
    this.setupIOSSafariTouch(element);

    let touchStartTime = 0;
    let touchCount = 0;
    let touchTimer = null;
    let lastTouchEnd = 0;

    const doubleTapDelay = this.getDoubleClickDelay();

    element.addEventListener(
      "touchstart",
      (e) => {
        touchStartTime = Date.now();
      },
      { passive: true }
    );

    element.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault(); // Prevent 300ms delay and double-tap zoom on iOS Safari

        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;

        // Ignore very long touches (likely drag or long press)
        if (touchDuration > 1000) return;

        const timeSinceLastTouch = touchEndTime - lastTouchEnd;
        lastTouchEnd = touchEndTime;

        // If this touch is within double-tap timeframe, it's a double-tap
        if (timeSinceLastTouch < doubleTapDelay && touchCount === 1) {
          // Double-tap detected
          if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
          }

          touchCount = 0;
          devLog("Mobile double-tap detected (no cooldown check)");

          if (handlers.onDoubleTap) {
            handlers.onDoubleTap(e);
          }
          return;
        }

        // Single tap
        touchCount = 1;

        if (touchTimer) {
          clearTimeout(touchTimer);
        }

        touchTimer = setTimeout(() => {
          if (touchCount === 1) {
            // Check cooldown only for single tap
            if (this.canInteract("single-tap")) {
              devLog("Mobile single-tap processed");
              this.recordInteraction("single-tap");

              if (handlers.onSingleTap) {
                handlers.onSingleTap(e);
              }
            } else {
              devLog("Mobile single-tap blocked by animation cooldown");
            }
          }
          touchCount = 0;
        }, doubleTapDelay);
      },
      { passive: false }
    );
  }

  // Cleanup method
  cleanup() {
    // Clear all pending timeouts
    for (const [id, timeoutId] of this.pendingTimeouts) {
      clearTimeout(timeoutId);
    }
    this.pendingTimeouts.clear();
    this.isDoubleClickInProgress = false;
  }

  // Get current cooldown status for debugging
  getCooldownStatus() {
    const now = Date.now();
    return {
      animation: Math.max(
        0,
        COOLDOWN_TYPES.ANIMATION - (now - this.lastInteractionTimes.animation)
      ),
      balloon: Math.max(
        0,
        COOLDOWN_TYPES.BALLOON - (now - this.lastInteractionTimes.balloon)
      ),
      contextMenu: Math.max(
        0,
        COOLDOWN_TYPES.CONTEXT_MENU -
          (now - this.lastInteractionTimes.contextMenu)
      ),
    };
  }
}

// Export singleton instance
export const interactionManager = new InteractionManager();

// Export utilities
export { COOLDOWN_TYPES, isIOSSafari };

export default InteractionManager;
