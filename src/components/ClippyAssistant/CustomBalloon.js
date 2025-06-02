// CustomBalloon.js - COMPLETE UPDATED VERSION with enhanced viewport positioning
// This file handles speech balloons (not chat balloons)
import React from "react";
import { devLog, errorLog } from './ClippyPositioning';

// FIXED: Animation logging function
const logAnimation = (animationName, context = "custom balloon") => {
  // Force log animation regardless of dev mode
  console.log(`🎭 Animation Triggered: "${animationName}" from ${context}`);
};

/**
 * Creates and manages custom speech balloons for Clippy with enhanced button support
 * Uses direct DOM manipulation for maximum compatibility
 */
class CustomBalloonManager {
  constructor() {
    this.currentBalloon = null;
    this.balloonTimeout = null;
  }

  /**
   * Show a custom speech balloon with optional buttons
   * @param {string|Object} content - The message or content object with buttons
   * @param {number} duration - How long to show the balloon (ms)
   * @param {Object} options - Additional options
   * @returns {boolean} - Success status
   */
  show(content, duration = 8000, options = {}) {
    try {
      // FIXED: Check if any balloon (speech or chat) is already open
      const existingBalloons = document.querySelectorAll('.custom-clippy-balloon, .custom-clippy-chat-balloon');
      if (existingBalloons.length > 0) {
        devLog("Balloon creation blocked - another balloon is already open");
        return false;
      }

      // Parse content
      let message, buttons = [];
      if (typeof content === 'string') {
        message = content;
      } else if (content && typeof content === 'object') {
        message = content.message || content.text || '';
        buttons = content.buttons || [];
      } else {
        message = String(content);
      }

      devLog(`Creating custom balloon: "${message}" with ${buttons.length} buttons`);
      
      // FIXED: Remove any existing balloons first
      this.hide();

      // Create balloon element
      const balloonEl = document.createElement('div');
      balloonEl.className = 'custom-clippy-balloon';
      
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

      // FIXED: Dynamic sizing to fit within desktop viewport with button consideration
      const hasButtons = buttons.length > 0;
      const baseWidth = Math.min(200, position.maxWidth); // REDUCED from 280
      const buttonHeight = hasButtons ? (buttons.length * 32) + 20 : 0;
      
      balloonEl.style.maxWidth = `${position.maxWidth}px`;
      balloonEl.style.width = `${baseWidth}px`;
      balloonEl.style.minHeight = hasButtons ? `${Math.max(120, 80 + buttonHeight)}px` : 'auto';

      // FIXED: Create balloon content with enhanced button support
      this.createBalloonContent(balloonEl, message, buttons);

      // Add to DOM
      document.body.appendChild(balloonEl);
      this.currentBalloon = balloonEl;
      
      devLog(`Balloon positioned at (${position.left}, ${position.top}) with max width ${position.maxWidth}px`);

      // Set auto-hide timer (longer for balloons with buttons)
      const autoHideDuration = hasButtons ? Math.max(duration, 15000) : duration;
      this.balloonTimeout = setTimeout(() => {
        this.hide();
      }, autoHideDuration);

      return true;
    } catch (error) {
      errorLog("Error creating custom balloon", error);
      return false;
    }
  }

  /**
   * Create balloon content with message and buttons - CLASSIC CLIPPY STYLE
   * @param {HTMLElement} balloonEl - The balloon element
   * @param {string} message - The message text
   * @param {Array} buttons - Array of button objects
   */
  createBalloonContent(balloonEl, message, buttons = []) {
    // Clear any existing content
    balloonEl.innerHTML = '';

    // Create message content
    const messageEl = document.createElement('div');
    messageEl.className = 'balloon-message';
    messageEl.textContent = message;
    messageEl.style.cssText = `
      color: #000000 !important;
      -webkit-text-fill-color: #000000 !important;
      font-family: 'Tahoma', 'MS Sans Serif', sans-serif !important;
      font-size: 14px !important;
      line-height: 1.4 !important;
      margin-bottom: ${buttons.length > 0 ? '12px' : '0'} !important;
      word-wrap: break-word !important;
      padding: 0 !important;
    `;
    balloonEl.appendChild(messageEl);

    // Create buttons container if there are buttons
    if (buttons.length > 0) {
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'balloon-buttons';
      buttonsContainer.style.cssText = `
        display: flex !important;
        flex-direction: column !important;
        gap: 4px !important;
        margin-top: 8px !important;
        padding: 0 !important;
      `;

      buttons.forEach((button, index) => {
        const buttonEl = document.createElement('button');
        buttonEl.className = 'balloon-button';
        buttonEl.textContent = button.text || button.label || `Option ${index + 1}`;
        
        // Classic Windows 98 button styling with iOS Safari compatibility
        buttonEl.style.cssText = `
          background: #c0c0c0 !important;
          border: 2px outset #c0c0c0 !important;
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          font-family: 'Tahoma', 'MS Sans Serif', sans-serif !important;
          font-size: 11px !important;
          padding: 4px 12px !important;
          cursor: pointer !important;
          text-align: left !important;
          width: 100% !important;
          min-height: ${this.isMobile() ? '36px' : '28px'} !important;
          touch-action: manipulation !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          user-select: none !important;
          box-sizing: border-box !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          margin: 0 !important;
          outline: none !important;
          -webkit-appearance: none !important;
          appearance: none !important;
        `;

        // Button hover interactions
        buttonEl.addEventListener('mouseenter', () => {
          buttonEl.style.background = '#d0d0d0 !important';
          buttonEl.style.borderColor = '#d0d0d0 !important';
        });

        buttonEl.addEventListener('mouseleave', () => {
          buttonEl.style.background = '#c0c0c0 !important';
          buttonEl.style.borderColor = '#c0c0c0 !important';
        });

        // Button press effect
        buttonEl.addEventListener('mousedown', () => {
          buttonEl.style.border = '2px inset #c0c0c0 !important';
          buttonEl.style.paddingTop = '5px !important';
          buttonEl.style.paddingLeft = '13px !important';
        });

        buttonEl.addEventListener('mouseup', () => {
          buttonEl.style.border = '2px outset #c0c0c0 !important';
          buttonEl.style.paddingTop = '4px !important';
          buttonEl.style.paddingLeft = '12px !important';
        });

        // Enhanced button click handler with multiple action types
        buttonEl.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          devLog(`Balloon button clicked: "${button.text}"`);
          
          // Execute button action based on type
          if (button.action && typeof button.action === 'function') {
            // Custom function action
            try {
              button.action();
              devLog(`Button custom action executed for: ${button.text}`);
            } catch (error) {
              errorLog(`Error executing button action for ${button.text}`, error);
            }
          } else if (button.message) {
            // Show follow-up message
            this.hide();
            setTimeout(() => {
              this.show(button.message, 8000);
              devLog(`Button follow-up message shown for: ${button.text}`);
            }, 200);
            return; // Don't close balloon yet
          } else if (button.animation && window.clippy?.play) {
            // Play animation
            logAnimation(button.animation, `balloon button (${button.text})`);
            window.clippy.play(button.animation);
            devLog(`Button animation played: ${button.animation}`);
          } else if (button.chat) {
            // Open chat
            this.hide();
            if (window.showClippyChatBalloon) {
              setTimeout(() => {
                window.showClippyChatBalloon(button.chat);
                devLog(`Button chat opened: ${button.chat}`);
              }, 200);
            }
            return; // Don't close balloon yet
          } else if (button.balloon) {
            // Show another balloon
            this.hide();
            setTimeout(() => {
              this.show(button.balloon, 8000);
              devLog(`Button balloon shown: ${button.balloon}`);
            }, 200);
            return; // Don't close balloon yet
          } else if (button.help) {
            // Show help balloon
            this.hide();
            setTimeout(() => {
              if (window.showClippyHelpBalloon) {
                window.showClippyHelpBalloon();
              } else {
                this.show("Here are some things I can help you with! Try right-clicking me for more options.", 8000);
              }
              devLog(`Button help shown`);
            }, 200);
            return; // Don't close balloon yet
          }
          
          // Close balloon after action (unless it shows another balloon/chat)
          this.hide();
        });

        buttonsContainer.appendChild(buttonEl);
      });

      balloonEl.appendChild(buttonsContainer);
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
   * Calculate balloon position relative to Clippy - FIXED with enhanced viewport constraints
   * @param {Object} customPosition - Optional custom position override
   * @returns {Object} - Position with left, top, and maxWidth properties
   */
  calculatePosition(customPosition = null) {
  const balloonWidth = 280;
  const balloonHeight = 120;
  const safeMargin = 20;
  const clippyMargin = 25; // Gap between Clippy/overlay and balloon

  // Get desktop viewport
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
  } else {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
  }

  const maxAvailableWidth = viewportWidth - (safeMargin * 2);
  const dynamicWidth = Math.min(balloonWidth, maxAvailableWidth);

  // Find Clippy and overlay
  const clippyEl = document.querySelector('.clippy');
  const overlayEl = document.getElementById('clippy-clickable-overlay');
  
  if (clippyEl) {
    const clippyRect = clippyEl.getBoundingClientRect();
    const overlayRect = overlayEl ? overlayEl.getBoundingClientRect() : clippyRect;
    
    // Use the higher top position (accounts for overlay)
    const effectiveTop = Math.min(clippyRect.top, overlayRect.top);
    
    // Position above Clippy/overlay
    let left = clippyRect.left + (clippyRect.width / 2) - (dynamicWidth / 2);
    let top = effectiveTop - balloonHeight - clippyMargin;
    
    // Constrain to desktop viewport
    left = Math.max(
      viewportLeft + safeMargin, 
      Math.min(left, viewportLeft + viewportWidth - dynamicWidth - safeMargin)
    );
    
    // Ensure balloon is within top boundary
    top = Math.max(viewportTop + safeMargin, top);
    
    return { 
      left, 
      top,
      maxWidth: maxAvailableWidth
    };
  } else {
    // Fallback
    return {
      left: viewportLeft + (viewportWidth - dynamicWidth) / 2,
      top: viewportTop + safeMargin,
      maxWidth: maxAvailableWidth
    };
  }
}

  /**
   * Check if mobile device
   * @returns {boolean}
   */
  isMobile() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
      const messageEl = this.currentBalloon.querySelector('.balloon-message');
      if (messageEl) {
        messageEl.textContent = newMessage;
        devLog(`Balloon message updated to: "${newMessage}"`);
        return true;
      }
      return false;
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
 * @param {string|Object} content - Message string or content object with buttons
 * @param {number} duration - Duration in milliseconds (default: 8000)
 * @param {Object} options - Additional options
 * @returns {boolean} - Success status
 */
export const showCustomBalloon = (content, duration = 8000, options = {}) => {
  return customBalloonManager.show(content, duration, options);
};

// FIXED: Predefined classic Clippy balloon types
export const showWelcomeBalloon = () => {
  return showCustomBalloon({
    message: "Welcome to Hydra98! How can I help you today?",
    buttons: [
      {
        text: "💬 Start a conversation",
        chat: "Hi! What would you like to chat about?"
      },
      {
        text: "🎭 Show me some animations",
        action: () => {
          if (window.clippy?.play) {
            const animations = ["Wave", "Congratulate", "GetAttention", "GestureRight"];
            const randomAnim = animations[Math.floor(Math.random() * animations.length)];
            logAnimation(randomAnim, "welcome balloon animation button");
            window.clippy.play(randomAnim);
          }
        }
      },
      {
        text: "ℹ️ Tell me about Hydra98",
        message: "Hydra98 is a Windows 98 desktop emulator that brings back the nostalgic computing experience! You can run programs, play games, and explore just like the good old days. Try right-clicking me for more options!"
      },
      {
        text: "👋 Just say hello",
        animation: "Greeting"
      }
    ]
  }, 20000);
};

export const showHelpBalloon = () => {
  return showCustomBalloon({
    message: "What kind of help do you need?",
    buttons: [
      {
        text: "🖱️ How do I interact with you?",
        message: "You can double-click me for a quick greeting, or right-click for more options! On mobile, just tap me or long-press for chat."
      },
      {
        text: "🎮 What can I do in Hydra98?",
        message: "You can explore the desktop, run classic programs like Notepad and Paint, play games like Minesweeper, and even browse the web! Try clicking the Start button."
      },
      {
        text: "⚙️ How do I change settings?",
        message: "Right-click on the desktop to access display settings, or use the Start menu to find system preferences. You can also right-click me for agent options!"
      },
      {
        text: "💬 I want to chat more",
        chat: "Great! I love chatting. What's on your mind?"
      }
    ]
  }, 15000);
};

export const showErrorBalloon = (errorMessage) => {
  return showCustomBalloon({
    message: `Oops! ${errorMessage || "Something went wrong."}`,
    buttons: [
      {
        text: "🔄 Try again",
        action: () => {
          window.location.reload();
        }
      },
      {
        text: "💬 Get help",
        chat: "I'm having trouble. Can you help me figure out what went wrong?"
      },
      {
        text: "😊 It's okay",
        animation: "Wave",
        message: "Thanks for being understanding! Let me know if you need anything else."
      }
    ]
  }, 12000);
};

export const showTipsBalloon = () => {
  return showCustomBalloon({
    message: "Here are some helpful tips for using Hydra98!",
    buttons: [
      {
        text: "🖱️ Mouse tips",
        message: "Try right-clicking on different things! Right-click the desktop for settings, right-click me for options, and double-click to open programs."
      },
      {
        text: "⌨️ Keyboard shortcuts",
        message: "Use Ctrl+Alt+Del for Task Manager, Alt+Tab to switch programs, and the Windows key to open the Start menu!"
      },
      {
        text: "🎮 Fun stuff to try",
        message: "Check out Minesweeper, Paint, Notepad, and the screensavers! You can also change the wallpaper by right-clicking the desktop."
      },
      {
        text: "💭 More help",
        help: true
      }
    ]
  }, 18000);
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
const CustomBalloon = ({ message, position, onClose, duration = 8000 }) => {
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