// MobileTouchHandler.js - Modularized mobile touch interaction handler
import { devLog } from "../core/ClippyPositioning";

// Constants
const DOUBLE_TAP_THRESHOLD = 250; // ms - Updated to match InteractionManager timing
const TAP_DISTANCE_THRESHOLD = 20; // px
const LONG_PRESS_DURATION = 500; // ms
const DRAG_THRESHOLD = 10; // px
const INTERACTION_COOLDOWN_MS = 30; // ms

/**
 * Mobile Touch Handler Class
 * Handles all mobile touch interactions for Clippy
 */
export class MobileTouchHandler {
  constructor(options = {}) {
    this.options = {
      onSingleTap: options.onSingleTap || (() => {}),
      onDoubleTap: options.onDoubleTap || (() => {}),
      onLongPress: options.onLongPress || (() => {}),
      onDragStart: options.onDragStart || (() => {}),
      onDragMove: options.onDragMove || (() => {}),
      onDragEnd: options.onDragEnd || (() => {}),
      positionLocked: options.positionLocked || false,
      isInCooldown: options.isInCooldown || (() => false),
      isAnimationPlaying: options.isAnimationPlaying || (() => false),
      isAnyBalloonOpen: options.isAnyBalloonOpen || (() => false),
      ...options,
    };

    // Touch tracking state
    this.touchState = {
      lastTapTime: 0,
      tapCount: 0,
      lastTapX: 0,
      lastTapY: 0,
      dragStarted: false,
      longPressTimer: null,
      startX: 0,
      startY: 0,
      startTime: 0,
      origRightPx: 0,
      origBottomPx: 0,
    };

    // Bound handlers
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTouchCancel = this.handleTouchCancel.bind(this);
  }

  /**
   * Update options dynamically
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Attach event listeners to an element
   */
  attach(element) {
    if (!element) return;

    element.addEventListener("touchstart", this.handleTouchStart, {
      passive: false,
    });
    element.addEventListener("touchmove", this.handleTouchMove, {
      passive: false,
    });
    element.addEventListener("touchend", this.handleTouchEnd, {
      passive: false,
    });
    element.addEventListener("touchcancel", this.handleTouchCancel, {
      passive: false,
    });

    this.element = element;
    devLog("Mobile touch handler attached");
  }

  /**
   * Detach event listeners
   */
  detach() {
    if (!this.element) return;

    this.element.removeEventListener("touchstart", this.handleTouchStart);
    this.element.removeEventListener("touchmove", this.handleTouchMove);
    this.element.removeEventListener("touchend", this.handleTouchEnd);
    this.element.removeEventListener("touchcancel", this.handleTouchCancel);

    this.cleanup();
    this.element = null;
    devLog("Mobile touch handler detached");
  }

  /**
   * Handle touch start
   */
  handleTouchStart(e) {
    const touch = e.touches[0];
    const currentTime = Date.now();

    // Initialize touch state
    this.touchState.startX = touch.clientX;
    this.touchState.startY = touch.clientY;
    this.touchState.startTime = currentTime;
    this.touchState.dragStarted = false;

    // Clear any existing long press timer
    this.clearLongPressTimer();

    // Store original position for drag
    if (!this.options.positionLocked) {
      const clippyEl = document.querySelector(".clippy");
      if (clippyEl) {
        const rect = clippyEl.getBoundingClientRect();
        this.touchState.origRightPx = window.innerWidth - rect.right;
        this.touchState.origBottomPx = window.innerHeight - rect.bottom;
      }
    }

    // Set up long press detection
    if (!this.options.isInCooldown() && !this.options.isAnimationPlaying()) {
      this.touchState.longPressTimer = setTimeout(() => {
        if (!this.touchState.dragStarted && !this.options.isAnyBalloonOpen()) {
          devLog("Long press detected");
          this.options.onLongPress(e);
          this.reset();
        }
      }, LONG_PRESS_DURATION);
    }
  }

  /**
   * Handle touch move
   */
  handleTouchMove(e) {
    if (!e.touches.length) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - this.touchState.startX);
    const deltaY = Math.abs(touch.clientY - this.touchState.startY);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Check if movement exceeds drag threshold
    if (!this.touchState.dragStarted && distance > DRAG_THRESHOLD) {
      // Cancel long press if drag starts
      this.clearLongPressTimer();

      // Start drag only if position is unlocked
      if (!this.options.positionLocked) {
        this.touchState.dragStarted = true;
        e.preventDefault();
        this.options.onDragStart(e);
      }
    }

    // Handle drag movement
    if (this.touchState.dragStarted && !this.options.positionLocked) {
      e.preventDefault();

      const totalDeltaX = touch.clientX - this.touchState.startX;
      const totalDeltaY = touch.clientY - this.touchState.startY;

      const newRightPx = Math.max(
        10,
        Math.min(
          window.innerWidth - 70,
          this.touchState.origRightPx - totalDeltaX
        )
      );
      const newBottomPx = Math.max(
        90,
        Math.min(
          window.innerHeight - 90,
          this.touchState.origBottomPx - totalDeltaY
        )
      );

      this.options.onDragMove({
        rightPx: newRightPx,
        bottomPx: newBottomPx,
        deltaX: totalDeltaX,
        deltaY: totalDeltaY,
      });
    }
  }

  /**
   * Handle touch end
   */
  handleTouchEnd(e) {
    this.clearLongPressTimer();

    const currentTime = Date.now();
    const touchDuration = currentTime - this.touchState.startTime;

    // If drag occurred, handle drag end
    if (this.touchState.dragStarted) {
      this.options.onDragEnd(e);
      this.reset();
      return;
    }

    // Check if this was a tap (not a drag)
    if (e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - this.touchState.startX);
      const deltaY = Math.abs(touch.clientY - this.touchState.startY);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (
        distance < TAP_DISTANCE_THRESHOLD &&
        touchDuration < LONG_PRESS_DURATION
      ) {
        this.handleTap(e, currentTime);
      }
    }
  }

  /**
   * Handle touch cancel
   */
  handleTouchCancel(e) {
    devLog("Touch cancelled");
    this.cleanup();
    this.reset();
  }

  /**
   * Handle tap logic (single vs double)
   */
  handleTap(e, currentTime) {
    const timeSinceLastTap = currentTime - this.touchState.lastTapTime;

    // Check for double tap
    if (
      timeSinceLastTap < DOUBLE_TAP_THRESHOLD &&
      this.touchState.tapCount === 1
    ) {
      // Double tap detected - bypasses cooldowns like desktop double-click!
      devLog(
        "Double tap detected - bypassing cooldowns (matches InteractionManager behavior)"
      );
      this.touchState.tapCount = 0;
      this.touchState.lastTapTime = 0;

      // Double-taps only check for balloons, NOT cooldowns or animations (like desktop)
      if (this.options.isAnyBalloonOpen()) {
        devLog("Double tap blocked - balloon is open");
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      this.options.onDoubleTap(e);
    } else {
      // Single tap - wait to see if it becomes a double tap
      this.touchState.tapCount = 1;
      this.touchState.lastTapTime = currentTime;

      setTimeout(() => {
        if (
          this.touchState.tapCount === 1 &&
          Date.now() - this.touchState.lastTapTime >= DOUBLE_TAP_THRESHOLD - 50
        ) {
          // Confirmed single tap
          devLog("Single tap confirmed");

          // Check blockers
          if (this.options.isInCooldown()) {
            devLog("Single tap blocked - in cooldown");
            return;
          }

          if (this.options.isAnimationPlaying()) {
            devLog("Single tap blocked - animation playing");
            return;
          }

          if (this.options.isAnyBalloonOpen()) {
            devLog("Single tap blocked - balloon is open");
            return;
          }

          this.options.onSingleTap(e);
          this.touchState.tapCount = 0;
          this.touchState.lastTapTime = 0;
        }
      }, DOUBLE_TAP_THRESHOLD);
    }
  }

  /**
   * Clear long press timer
   */
  clearLongPressTimer() {
    if (this.touchState.longPressTimer) {
      clearTimeout(this.touchState.longPressTimer);
      this.touchState.longPressTimer = null;
    }
  }

  /**
   * Clean up any active timers
   */
  cleanup() {
    this.clearLongPressTimer();
  }

  /**
   * Reset touch state
   */
  reset() {
    this.touchState.dragStarted = false;
    this.touchState.startX = 0;
    this.touchState.startY = 0;
    this.touchState.startTime = 0;
    this.clearLongPressTimer();
  }
}

// Export singleton for easy use
export const createMobileTouchHandler = (options) =>
  new MobileTouchHandler(options);
