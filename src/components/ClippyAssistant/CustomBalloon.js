// CustomBalloon.js - FIXED DOM-based balloon implementation
// This file handles speech balloons (not chat balloons)
import React from "react";
import { devLog, errorLog } from './ClippyPositioning';

/**
 * Creates and manages custom speech balloons for Clippy
 * Uses direct DOM manipulation for maximum compatibility
 */
class CustomBalloonManager {
  constructor() {
    this.currentBalloon = null;
    this.balloonTimeout = null;
  }

  /**
   * Show a custom speech balloon
   * @param {string} message - The message to display
   * @param {number} duration - How long to show the balloon (ms)
   * @param {Object} options - Additional options
   * @returns {boolean} - Success status
   */
  show(message, duration = 6000, options = {}) {
    try {
      // FIXED: Check if any balloon (speech or chat) is already open
      const existingBalloons = document.querySelectorAll('.custom-clippy-balloon, .custom-clippy-chat-balloon');
      if (existingBalloons.length > 0) {
        devLog("Balloon creation blocked - another balloon is already open");
        return false;
      }

      devLog(`Creating custom balloon: "${message}"`);
      
      // FIXED: Remove any existing balloons first
      this.hide();

      // Create balloon element
      const balloonEl = document.createElement('div');
      balloonEl.className = 'custom-clippy-balloon';
      balloonEl.textContent = message;
      
      // Calculate position relative to Clippy with desktop viewport boundaries
      const position = this.calculatePosition(options.position);
      
      // Apply positioning
      balloonEl.style.position = 'fixed';
      balloonEl.style.left = `${position.left}px`;
      balloonEl.style.top = `${position.top}px`;
      balloonEl.style.zIndex = '9999';
      balloonEl.style.visibility = 'visible';
      balloonEl.style.opacity = '1';
      balloonEl.style.display = 'block';

      // FIXED: Dynamic sizing to fit within desktop viewport
      balloonEl.style.maxWidth = `${position.maxWidth}px`;
      balloonEl.style.width = `${Math.min(280, position.maxWidth)}px`;

      // Add to DOM
      document.body.appendChild(balloonEl);
      this.currentBalloon = balloonEl;
      
      devLog(`Balloon positioned at (${position.left}, ${position.top}) with max width ${position.maxWidth}px`);

      // Set auto-hide timer
      this.balloonTimeout = setTimeout(() => {
        this.hide();
      }, duration);

      return true;
    } catch (error) {
      errorLog("Error creating custom balloon", error);
      return false;
    }
  }

  /**
   * Hide the current balloon
   * @returns {boolean} - Success status
   */
  hide() {
    try {
      // Clear timeout
      if (this.balloonTimeout) {
        clearTimeout(this.balloonTimeout);
        this.balloonTimeout = null;
      }

      // Remove current balloon
      if (this.currentBalloon && this.currentBalloon.parentNode) {
        this.currentBalloon.remove();
        devLog("Balloon removed from DOM");
      }

      // Also remove any orphaned balloons
      const orphanedBalloons = document.querySelectorAll('.custom-clippy-balloon');
      orphanedBalloons.forEach(balloon => {
        balloon.remove();
        devLog("Removed orphaned balloon");
      });

      this.currentBalloon = null;
      return true;
    } catch (error) {
      errorLog("Error hiding balloon", error);
      return false;
    }
  }

  /**
   * Calculate balloon position relative to Clippy - FIXED with desktop viewport boundaries
   * @param {Object} customPosition - Optional custom position override
   * @returns {Object} - Position with left, top, and maxWidth properties
   */
  calculatePosition(customPosition = null) {
    const balloonWidth = 280;
    const balloonHeight = 120;
    const safeMargin = 15; // Minimum distance from desktop edges
    const clippyMargin = 10; // FIXED: Reduced distance from Clippy (was 15px)

    // FIXED: Always use desktop viewport instead of window viewport
    const desktop = document.querySelector(".desktop.screen") || 
                   document.querySelector(".desktop") || 
                   document.querySelector(".w98");
    
    let viewportWidth, viewportHeight, viewportLeft = 0, viewportTop = 0;
    
    if (desktop) {
      const desktopRect = desktop.getBoundingClientRect();
      viewportWidth = desktopRect.width;
      viewportHeight = desktopRect.height;
      viewportLeft = desktopRect.left;
      viewportTop = desktopRect.top;
      devLog(`Using desktop viewport: ${viewportWidth}x${viewportHeight} at (${viewportLeft}, ${viewportTop})`);
    } else {
      // Emergency fallback
      viewportWidth = 640;
      viewportHeight = 480;
      viewportLeft = (window.innerWidth - 640) / 2;
      viewportTop = (window.innerHeight - 480) / 2;
      devLog("Desktop viewport not found, using fallback 640x480");
    }

    // Calculate dynamic sizing
    const maxAvailableWidth = viewportWidth - (safeMargin * 2);
    const dynamicWidth = Math.min(balloonWidth, maxAvailableWidth);

    // If custom position provided, validate and constrain to desktop
    if (customPosition && customPosition.left !== undefined && customPosition.top !== undefined) {
      const constrainedLeft = Math.max(
        viewportLeft + safeMargin, 
        Math.min(customPosition.left, viewportLeft + viewportWidth - dynamicWidth - safeMargin)
      );
      const constrainedTop = Math.max(
        viewportTop + safeMargin, 
        Math.min(customPosition.top, viewportTop + viewportHeight - balloonHeight - safeMargin)
      );
      
      return {
        left: constrainedLeft,
        top: constrainedTop,
        maxWidth: maxAvailableWidth
      };
    }

    // Find Clippy element for relative positioning
    const clippyEl = document.querySelector('.clippy');
    
    if (clippyEl) {
      const clippyRect = clippyEl.getBoundingClientRect();
      
      // FIXED: Position closer to Clippy's head (reduced margin from 15px to 10px)
      let left = clippyRect.left + (clippyRect.width / 2) - (dynamicWidth / 2);
      let top = clippyRect.top - balloonHeight - clippyMargin;
      
      // FIXED: Strict containment within desktop viewport
      left = Math.max(
        viewportLeft + safeMargin, 
        Math.min(left, viewportLeft + viewportWidth - dynamicWidth - safeMargin)
      );
      top = Math.max(
        viewportTop + safeMargin, 
        Math.min(top, viewportTop + viewportHeight - balloonHeight - safeMargin)
      );
      
      // FIXED: If balloon overlaps with Clippy, try positioning below
      if (top + balloonHeight + clippyMargin > clippyRect.top && top < clippyRect.bottom + clippyMargin) {
        const belowPosition = clippyRect.bottom + clippyMargin;
        
        // Only use below position if it fits within desktop viewport
        if (belowPosition + balloonHeight + safeMargin <= viewportTop + viewportHeight) {
          top = belowPosition;
        } else {
          // Try side positioning within desktop bounds
          const rightPosition = clippyRect.right + clippyMargin;
          const leftPosition = clippyRect.left - dynamicWidth - clippyMargin;
          
          if (rightPosition + dynamicWidth + safeMargin <= viewportLeft + viewportWidth) {
            // Position to the right
            left = rightPosition;
            top = Math.max(
              viewportTop + safeMargin, 
              Math.min(clippyRect.top, viewportTop + viewportHeight - balloonHeight - safeMargin)
            );
          } else if (leftPosition >= viewportLeft + safeMargin) {
            // Position to the left
            left = leftPosition;
            top = Math.max(
              viewportTop + safeMargin, 
              Math.min(clippyRect.top, viewportTop + viewportHeight - balloonHeight - safeMargin)
            );
          } else {
            // Last resort: center in desktop viewport
            left = viewportLeft + (viewportWidth - dynamicWidth) / 2;
            top = viewportTop + (viewportHeight - balloonHeight) / 2;
          }
        }
      }
      
      return { 
        left, 
        top,
        maxWidth: maxAvailableWidth
      };
    } else {
      // Fallback: center of desktop viewport
      devLog("Clippy element not found, centering in desktop viewport");
      return {
        left: viewportLeft + (viewportWidth - dynamicWidth) / 2,
        top: viewportTop + (viewportHeight - balloonHeight) / 2,
        maxWidth: maxAvailableWidth
      };
    }
  }

  /**
   * Check if a balloon is currently visible
   * @returns {boolean}
   */
  isVisible() {
    return this.currentBalloon && this.currentBalloon.parentNode;
  }

  /**
   * Update balloon message without repositioning
   * @param {string} newMessage - New message to display
   * @returns {boolean} - Success status
   */
  updateMessage(newMessage) {
    if (!this.isVisible()) {
      return false;
    }

    try {
      this.currentBalloon.textContent = newMessage;
      devLog(`Balloon message updated to: "${newMessage}"`);
      return true;
    } catch (error) {
      errorLog("Error updating balloon message", error);
      return false;
    }
  }

  /**
   * Cleanup method for component unmount
   */
  cleanup() {
    this.hide();
    devLog("CustomBalloonManager cleaned up");
  }
}

// Create singleton instance
const customBalloonManager = new CustomBalloonManager();

/**
 * Show a custom speech balloon (main public API)
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds (default: 6000)
 * @param {Object} options - Additional options
 * @returns {boolean} - Success status
 */
export const showCustomBalloon = (message, duration = 6000, options = {}) => {
  return customBalloonManager.show(message, duration, options);
};

/**
 * Hide the current custom balloon
 * @returns {boolean} - Success status
 */
export const hideCustomBalloon = () => {
  return customBalloonManager.hide();
};

/**
 * Check if balloon is currently visible
 * @returns {boolean}
 */
export const isCustomBalloonVisible = () => {
  return customBalloonManager.isVisible();
};

/**
 * Update current balloon message
 * @param {string} newMessage - New message
 * @returns {boolean} - Success status
 */
export const updateCustomBalloonMessage = (newMessage) => {
  return customBalloonManager.updateMessage(newMessage);
};

/**
 * Cleanup function for unmount
 */
export const cleanupCustomBalloon = () => {
  customBalloonManager.cleanup();
};

// React component for backwards compatibility (if needed)
const CustomBalloon = ({ message, position, onClose, duration = 6000 }) => {
  // This is just a wrapper - actual implementation is DOM-based above
  React.useEffect(() => {
    if (message) {
      showCustomBalloon(message, duration, { position });
    }

    return () => {
      if (onClose) {
        onClose();
      }
    };
  }, [message, duration, position, onClose]);

  // Return null since we're using DOM manipulation
  return null;
};

export default CustomBalloon;