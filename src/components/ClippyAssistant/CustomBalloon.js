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
      devLog(`Creating custom balloon: "${message}"`);
      
      // FIXED: Remove any existing balloons first
      this.hide();

      // Create balloon element
      const balloonEl = document.createElement('div');
      balloonEl.className = 'custom-clippy-balloon';
      balloonEl.textContent = message;
      
      // Calculate position relative to Clippy
      const position = this.calculatePosition(options.position);
      
      // Apply positioning
      balloonEl.style.position = 'fixed';
      balloonEl.style.left = `${position.left}px`;
      balloonEl.style.top = `${position.top}px`;
      balloonEl.style.zIndex = '9999';
      balloonEl.style.visibility = 'visible';
      balloonEl.style.opacity = '1';
      balloonEl.style.display = 'block';

      // Add to DOM
      document.body.appendChild(balloonEl);
      this.currentBalloon = balloonEl;
      
      devLog(`Balloon positioned at (${position.left}, ${position.top})`);

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
   * Calculate balloon position relative to Clippy
   * @param {Object} customPosition - Optional custom position override
   * @returns {Object} - Position with left and top properties
   */
  calculatePosition(customPosition = null) {
    const balloonWidth = 280;
    const balloonHeight = 120;
    const clippyOffset = 30; // Space between Clippy and balloon

    // If custom position provided, use it
    if (customPosition && customPosition.left !== undefined && customPosition.top !== undefined) {
      return {
        left: Math.max(20, Math.min(customPosition.left, window.innerWidth - balloonWidth - 20)),
        top: Math.max(20, Math.min(customPosition.top, window.innerHeight - balloonHeight - 20))
      };
    }

    // Find Clippy element for relative positioning
    const clippyEl = document.querySelector('.clippy');
    
    if (clippyEl) {
      const clippyRect = clippyEl.getBoundingClientRect();
      
      // Position balloon above Clippy, centered horizontally
      let left = clippyRect.left + (clippyRect.width / 2) - (balloonWidth / 2);
      let top = clippyRect.top - balloonHeight - clippyOffset;
      
      // Keep balloon within viewport with padding
      left = Math.max(20, Math.min(left, window.innerWidth - balloonWidth - 20));
      top = Math.max(20, Math.min(top, window.innerHeight - balloonHeight - 20));
      
      // If balloon would be too high, show it below Clippy instead
      if (top < 20) {
        top = clippyRect.bottom + clippyOffset;
        // Make sure it doesn't go below viewport
        top = Math.min(top, window.innerHeight - balloonHeight - 20);
      }
      
      return { left, top };
    } else {
      // Fallback: center of screen
      devLog("Clippy element not found, using center positioning");
      return {
        left: (window.innerWidth - balloonWidth) / 2,
        top: window.innerHeight * 0.3 // 30% from top
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