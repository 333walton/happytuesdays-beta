// CustomBalloon.js - COMPLETE UPDATED VERSION with enhanced viewport positioning
// This file handles speech balloons (not chat balloons)
import React from "react";
import { devLog, errorLog } from './ClippyPositioning';
import './CustomBalloon.scss';  // Import SCSS styles

// FIXED: Animation logging function
const logAnimation = (animationName, context = "custom balloon") => {
  // Force log animation regardless of dev mode
  console.log(
    `%c🎭 Clippy Animation: "${animationName}"%c (from ${context})`,
    'color: #0066cc; font-weight: bold; font-size: 14px;',
    'color: #666; font-size: 12px;'
  );
  // Log stack trace to see where the animation was called from
  console.trace('Animation call stack:');
};

// Wrap clippy.play to ensure all animations are logged
const wrapClippyPlay = () => {
  if (window.clippy && window.clippy.play) {
    const originalPlay = window.clippy.play;
    window.clippy.play = function(animationName) {
      // Log the animation before playing it
      console.group(`%c🎭 Clippy Animation Debug%c "${animationName}"`, 
        'color: #0066cc; font-weight: bold; font-size: 14px;',
        'color: #666; font-size: 12px;'
      );
      console.log('Animation name:', animationName);
      console.log('Animation type:', typeof animationName);
      console.log('Call stack:');
      console.trace();
      console.groupEnd();
      
      // Call the original function
      return originalPlay.call(this, animationName);
    };
    console.log("%c🎭 Clippy animation logging enabled", "color: #0066cc; font-weight: bold;");
  }
};

// Initialize the wrapper
wrapClippyPlay();

/**
 * Creates and manages custom speech balloons for Clippy with enhanced button support
 * Uses direct DOM manipulation for maximum compatibility
 */
class CustomBalloonManager {
  constructor() {
    this.currentBalloon = null;
    this.balloonTimeout = null;
    this._resizeHandler = null;
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

      // BLOCK: Do not show the enhanced message balloon ("How may I help you?" with 4 buttons)
      if (
        message === "How may I help you?" &&
        Array.isArray(buttons) &&
        buttons.length === 4
      ) {
        devLog('Blocked display of "How may I help you?" enhanced message balloon.');
        return false;
      }

      devLog(`Creating custom balloon: "${message}" with ${buttons.length} buttons`);
      
      // FIXED: Remove any existing balloons first
      this.hide();

      // Create balloon element
      const balloonEl = document.createElement('div');
      balloonEl.className = 'custom-clippy-balloon';
      
      // Calculate position relative to Clippy with desktop viewport boundaries
      const position = this.calculatePosition({
        ...options.position
      });
      
      // Apply positioning
      balloonEl.style.position = 'fixed';
      balloonEl.style.left = `${position.left}px`;
      balloonEl.style.top = `${position.top}px`;
      balloonEl.style.zIndex = '9999';
      balloonEl.style.visibility = 'visible';
      balloonEl.style.opacity = '1';
      balloonEl.style.display = 'block';

      // SCALE DOWN: Reduce width and minHeight by 10%
      const hasButtons = buttons.length > 0;
      const baseWidth = Math.min(180, position.maxWidth * 0.9); // 200 -> 180, 10% smaller
      const buttonHeight = hasButtons ? (buttons.length * 29) + 18 : 0; // 32 -> 29, 20 -> 18

      balloonEl.style.maxWidth = `${position.maxWidth * 0.9}px`;
      balloonEl.style.width = `${baseWidth}px`;
      balloonEl.style.minHeight = hasButtons ? `${Math.max(108, 72 + buttonHeight)}px` : 'auto'; // 120 -> 108, 80 -> 72

      // FIXED: Create balloon content with enhanced button support
      this.createBalloonContent(balloonEl, message, buttons);

      // Add to DOM
      document.body.appendChild(balloonEl);
      this.currentBalloon = balloonEl;
      
      // Add dynamic repositioning
      this._addDynamicRepositioning(message, options);
      
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
   * Add dynamic repositioning for the current balloon
   */
  _addDynamicRepositioning(message, options) {
    this._removeDynamicRepositioning();
    this._resizeHandler = () => {
      if (!this.currentBalloon) return;
      const position = this.calculatePosition({
        ...options.position
      });
      this.currentBalloon.style.setProperty('left', `${position.left}px`, 'important');
      this.currentBalloon.style.setProperty('top', `${position.top}px`, 'important');
    };
    window.addEventListener('resize', this._resizeHandler);
    window.addEventListener('clippyRepositioned', this._resizeHandler);
  }

  /**
   * Remove dynamic repositioning event listeners
   */
  _removeDynamicRepositioning() {
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      window.removeEventListener('clippyRepositioned', this._resizeHandler);
      this._resizeHandler = null;
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

    // BLOCK: Do not render the enhanced message balloon content
    if (message === "How may I help you?" && Array.isArray(buttons) && buttons.length === 4) {
      devLog('Blocked rendering of "How may I help you?" enhanced message balloon content.');
      return;
    }

    // Create message content
    const messageEl = document.createElement('div');
    messageEl.className = 'balloon-message';
    messageEl.innerHTML = message;
    messageEl.style.cssText = `
      color: #000000 !important;
      -webkit-text-fill-color: #000000 !important;
      font-family: 'Tahoma', 'MS Sans Serif', sans-serif !important;
      font-size: 12.6px !important; /* 14px -> 12.6px */
      line-height: 1.3 !important;   /* 1.4 -> 1.3 */
      margin-bottom: ${buttons.length > 0 ? '10px' : '0'} !important; /* 12px -> 10px */
      word-wrap: break-word !important;
      padding: 0 !important;
      text-align: center !important;
    `;
    balloonEl.appendChild(messageEl);

    // Create buttons container if there are buttons
    if (buttons.length > 0) {
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'balloon-buttons';
      buttonsContainer.style.cssText = `
        display: flex !important;
        flex-direction: column !important;
        gap: 3.5px !important; /* 4px -> 3.5px */
        margin-top: 7px !important; /* 8px -> 7px */
        padding: 0 !important;
      `;

      buttons.forEach((button, index) => {
        const buttonEl = document.createElement('button');
        buttonEl.className = 'balloon-button';
        buttonEl.textContent = button.text || button.label || `Option ${index + 1}`;
        
        // SCALE DOWN: Reduce button font size, padding, min-height
        buttonEl.style.cssText = `
          background: #c0c0c0 !important;
          border: 2px outset #c0c0c0 !important;
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          font-family: 'Tahoma', 'MS Sans Serif', sans-serif !important;
          font-size: 9.9px !important; /* 11px -> 9.9px */
          padding: 3.5px 10.8px !important; /* 4px 12px -> 3.5px 10.8px */
          cursor: pointer !important;
          text-align: left !important;
          width: 100% !important;
          min-height: ${this.isMobile() ? '32px' : '25px'} !important; /* 36/28 -> 32/25 */
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

      // Remove dynamic repositioning
      this._removeDynamicRepositioning();

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
  
  calculatePosition(customPosition = {}) {
    // SCALE DOWN: Reduce balloonWidth and balloonHeight by 10%
    const balloonWidth = 252; // 280 * 0.9
    const balloonHeight = 108; // 120 * 0.9
    const safeMargin = 18; // 20 * 0.9
    const clippyMargin = 45; // 50 * 0.9

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
      
      // Calculate Clippy's full height including overlay
      const clippyHeight = clippyRect.height;
      const overlayHeight = overlayRect.height;
      const effectiveClippyHeight = Math.max(clippyHeight, overlayHeight);
      
      // Get the topmost position between Clippy and overlay
      const effectiveTop = Math.min(clippyRect.top, overlayRect.top);
      
      // Check if this is an enhanced message balloon
      const isEnhancedMessage = customPosition.isEnhancedMessage;
      
      // For enhanced message balloon, use chat balloon's positioning logic
      if (isEnhancedMessage) {
        // Use chat balloon's width and height
        const chatWidth = 300;
        const chatHeight = 160;
        const chatMargin = 40;

        let left = clippyRect.left + (clippyRect.width / 2) - (chatWidth / 2) + 140; // Shift 140px to the right
        let top = effectiveTop - chatHeight - (chatMargin + 80); // Move even higher above Clippy

        // Constrain horizontally to viewport
        left = Math.max(
          viewportLeft + safeMargin,
          Math.min(left, viewportLeft + viewportWidth - chatWidth - safeMargin)
        );

        // If not enough space above, fallback to side or top center
        if (top < viewportTop + safeMargin) {
          top = effectiveTop - 20;
          left = clippyRect.left - chatWidth - 40;
          if (left < viewportLeft + safeMargin) {
            left = clippyRect.right + 40;
            if (left + chatWidth > viewportLeft + viewportWidth - safeMargin) {
              left = viewportLeft + (viewportWidth - chatWidth) / 2;
              top = viewportTop + safeMargin;
            }
          }
        }

        // Final constraint checks
        left = Math.min(left, viewportLeft + viewportWidth - chatWidth - 20);
        left = Math.max(viewportLeft + 20, left);
        top = Math.max(viewportTop + safeMargin, Math.min(top, viewportTop + viewportHeight - chatHeight - safeMargin));

        return {
          left,
          top,
          maxWidth: chatWidth
        };
      }
      
      // Position balloon above Clippy's full height
      let left = clippyRect.left + (clippyRect.width / 2) - (dynamicWidth / 2);
      let top = effectiveTop - balloonHeight - clippyMargin;
      
      // Constrain to desktop viewport horizontally
      left = Math.max(
        viewportLeft + safeMargin, 
        Math.min(left, viewportLeft + viewportWidth - dynamicWidth - safeMargin)
      );
      
      // Check if balloon fits above Clippy within viewport
      if (top < viewportTop + safeMargin) {
        // If not enough space above, try positioning to the left of Clippy
        top = effectiveTop + 10; // Align roughly with Clippy's top
        left = clippyRect.left - dynamicWidth - 30; // 30px gap to the left
        
        // If still doesn't fit on left, try right side
        if (left < viewportLeft + safeMargin) {
          left = clippyRect.right + 30; // 30px gap to the right
          
          // Ensure it fits on the right
          if (left + dynamicWidth > viewportLeft + viewportWidth - safeMargin) {
            // Last resort: position at top of viewport
            left = viewportLeft + (viewportWidth - dynamicWidth) / 2;
            top = viewportTop + safeMargin;
          }
        }
      }
      
      // Final vertical constraint check
      top = Math.max(viewportTop + safeMargin, top);
      
      devLog(`Balloon position calculated: left=${left}, top=${top}, clippyHeight=${effectiveClippyHeight}`);
      
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
        messageEl.innerHTML = newMessage;
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
export const showCustomBalloon = (content, duration = 5000, options = {}) => {
  return customBalloonManager.show(content, duration, options);
};

// FIXED: Predefined classic Clippy balloon types
export const showWelcomeBalloon = () => {
  // Play the wave animation first
  if (window.clippy?.play) {
    logAnimation("Wave", "welcome balloon");
    window.clippy.play("Wave");
  }
  
  const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Custom position for mobile: shift right over Clippy's head
  let mobilePosition = undefined;
  if (isMobile) {
    const clippyEl = document.querySelector('.clippy');
    if (clippyEl) {
      const rect = clippyEl.getBoundingClientRect();
      // Place balloon above and to the right of Clippy's head
      mobilePosition = {
        left: rect.left + rect.width * 0.7, // 70% to the right of Clippy
        top: rect.top - 90 // 90px above Clippy
      };
    }
  }
  
  return showCustomBalloon({
    message: isMobile 
      ? `<span style="font-weight: 600;">Welcome to Hydra98!</span> Please enjoy and don't break anything.<br><i><span style="font-size: 12px;">Double-tap me to view menu.</span></i>`
      : `<span style="font-weight: 600;">Welcome to Hydra98!</span> Please enjoy and don't break anything.<br><i><span style="font-size: 12px;">Right-click me to view menu.</span></i>`,
    animation: "Wave",
    buttons: isMobile ? [] : []
  }, 6000, isMobile ? { position: mobilePosition } : {});
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

// Add more close-ended speech balloons (statements only, no buttons) based on user observations/tips
export const showObservationBalloon = (observationType) => {
  let message = "";
  switch (observationType) {
    case "idle":
      message = "Taking a break? Let me know if you need anything!";
      break;
    case "openedNotepad":
      message = "Notepad is great for jotting down quick notes!";
      break;
    case "openedPaint":
      message = "Feeling creative? Paint is ready for your masterpiece.";
      break;
    case "openedMinesweeper":
      message = "Good luck! Remember, sometimes it's just a guess.";
      break;
    case "openedBrowser":
      message = "Browsing the web? Stay safe out there!";
      break;
    case "changedWallpaper":
      message = "Nice choice! A fresh wallpaper brightens the desktop.";
      break;
    case "rightClickDesktop":
      message = "Right-clicking gives you more options—try it anywhere!";
      break;
    case "openedStartMenu":
      message = "The Start menu is your gateway to all programs.";
      break;
    case "openedSettings":
      message = "Tweak your settings to make Hydra98 your own.";
      break;
    case "openedChat":
      message = "I'm always here if you want to chat!";
      break;
    default:
      message = "Exploring Hydra98 is fun! Let me know if you need a tip.";
      break;
  }
  return showCustomBalloon(message, 6000);
};

export const showTipBalloon = (tipType) => {
  let message = "";
  switch (tipType) {
    case "dragClippy":
      message = "Tip: You can drag me to a new spot if I'm in your way!";
      break;
    case "lockClippy":
      message = "Tip: Lock my position to keep me from moving accidentally.";
      break;
    case "doubleClickClippy":
      message = "Tip: Double-click me for a quick greeting or a surprise!";
      break;
    case "rightClickClippy":
      message = "Tip: Right-click me for more options and settings.";
      break;
    case "useShortcuts":
      message = "Tip: Try keyboard shortcuts like Alt+Tab to switch programs.";
      break;
    case "saveOften":
      message = "Tip: Save your work often to avoid losing progress.";
      break;
    case "exploreGames":
      message = "Tip: Check out classic games like Minesweeper and Solitaire!";
      break;
    case "changeTheme":
      message = "Tip: You can change the desktop theme in settings.";
      break;
    default:
      message = "Tip: Right-click the desktop for even more options!";
      break;
  }
  return showCustomBalloon(message, 6000);
};

// Add more close-ended speech balloons (statements only, no buttons)
export const showStatementBalloon1 = () => {
  return showCustomBalloon("Welcome to Hydra98! Enjoy your stay.", 5000);
};

export const showStatementBalloon2 = () => {
  return showCustomBalloon("Clippy is here to help if you need anything.", 5000);
};

export const showStatementBalloon3 = () => {
  return showCustomBalloon("Remember to save your work often!", 5000);
};

export const showStatementBalloon4 = () => {
  return showCustomBalloon("Tip: You can right-click on the desktop for more options.", 5000);
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