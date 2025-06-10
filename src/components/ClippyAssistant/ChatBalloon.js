// ChatBalloon.js - COMPLETE FIXED VERSION with enhanced viewport positioning
import React from "react";
import { devLog, errorLog } from "./ClippyPositioning";

/**
 * Get agent nickname for display in chat dialogue
 * @param {string} agentName - The full agent name
 * @returns {string} - Agent nickname for dialogue
 */
const getAgentNickname = (agentName) => {
  const nicknames = {
    "Clippy GPT": "Clippy",
    "Links": "Links",
    "Bonzi": "Bonzi", 
    "Genie": "Genie",
    "Merlin": "Merlin",
    "Rover": "Rover"
  };
  return nicknames[agentName] || "Clippy";
};

/**
 * Creates and manages interactive chat balloons for Clippy
 * Uses direct DOM manipulation for maximum compatibility
 */
class ChatBalloonManager {
  constructor() {
    this.currentChatBalloon = null;
    this.chatHistory = [];
    this.isUserInteracting = false; // Track if user has interacted with chat
    this.hasUserEverInteracted = false; // Track if user has EVER interacted
    this._resizeHandler = null;
    this._titleObserver = null;
    this._agentChangeHandler = null;
  }

  /**
   * Show an interactive chat balloon
   * @param {string} initialMessage - The initial message from Clippy
   * @param {Object} options - Additional options
   * @returns {boolean} - Success status
   */
  show(initialMessage, options = {}) {
    try {
      // Check if any balloon (speech or chat) is already open
      const existingBalloons = document.querySelectorAll(
        ".custom-clippy-balloon, .custom-clippy-chat-balloon"
      );
      if (existingBalloons.length > 0) {
        devLog("Balloon creation blocked - another balloon is already open");
        return false;
      }

      devLog(`Creating chat balloon: "${initialMessage}"`);

      // Remove any existing chat balloons first
      this.hide();

      // Create chat container
      const chatContainer = document.createElement("div");
      chatContainer.className = "custom-clippy-chat-balloon";

      // FIXED: Calculate position with enhanced viewport constraints
      const position = this.calculatePosition(options.position);

      // Apply positioning and sizing with bounds checking
      chatContainer.style.position = "fixed";
      chatContainer.style.left = `${position.left}px`;
      chatContainer.style.top = `${position.top}px`;
      chatContainer.style.width = `${position.width}px`;
      chatContainer.style.height = `${position.height}px`;
      
      // Store the original top position and bottom position for resize functionality
      chatContainer.dataset.originalTop = position.top;
      chatContainer.dataset.originalBottom = position.top + position.height;
      
      // CRITICAL: Store the calculated width for mobile positioning adjustments
      chatContainer.dataset.calculatedWidth = position.width;
      chatContainer.style.zIndex = "9999";
      chatContainer.style.visibility = "visible";
      chatContainer.style.opacity = "1";
      chatContainer.style.display = "flex";
      chatContainer.style.flexDirection = "column";

      // Create chat balloon HTML content with improved styling
      this.createChatContent(chatContainer, initialMessage, options);

      // Add to DOM
      document.body.appendChild(chatContainer);
      this.currentChatBalloon = chatContainer;

      // Initialize chat history
      this.chatHistory = [
        { sender: "clippy", message: initialMessage, timestamp: Date.now() },
      ];

      // Reset interaction states
      this.isUserInteracting = false;
      this.hasUserEverInteracted = false;

      devLog(
        `Chat balloon positioned at (${position.left}, ${position.top}) size ${position.width}x${position.height}`
      );
      devLog(
        `Desktop viewport bounds checked: within bounds = ${position.withinBounds}`
      );

      // Focus input after a brief delay
      setTimeout(() => {
        const input = chatContainer.querySelector(".chat-input");
        if (input) {
          input.focus();
        }
      }, 100);

      // Add dynamic repositioning
      this._addDynamicRepositioning(options);
      
      // CRITICAL: Fix mobile positioning after DOM render using actual dimensions
      if (this.isMobile()) {
        setTimeout(() => {
          const actualWidth = chatContainer.offsetWidth;
          const actualHeight = chatContainer.offsetHeight;
          
          // Fix width positioning
          if (actualWidth !== position.width) {
            const correctedLeft = window.innerWidth - actualWidth - 14;
            chatContainer.style.left = `${correctedLeft}px`;
            devLog(`Mobile balloon width corrected: calculated=${position.width}px, actual=${actualWidth}px, newLeft=${correctedLeft}px`);
          }
          
          // FORCE exact positioning: 1px above clippy overlay using actual rendered dimensions
          const overlayEl = document.getElementById("clippy-clickable-overlay");
          if (overlayEl) {
            const overlayRect = overlayEl.getBoundingClientRect();
            const balloonRect = chatContainer.getBoundingClientRect();
            const trueBalloonHeight = balloonRect.height;
            const forcedTop = overlayRect.top - trueBalloonHeight - 1; // 1px above overlay
            chatContainer.style.top = `${forcedTop}px`;
            
            devLog(`Mobile balloon FORCED using true height: ${trueBalloonHeight}px, top=${forcedTop}px for 1px gap above clippy`);
          }
          
          // CRITICAL: Calculate the EXACT bottom position that should never change
          setTimeout(() => {
            const overlayEl = document.getElementById("clippy-clickable-overlay");
            if (overlayEl) {
              const overlayRect = overlayEl.getBoundingClientRect();
              const exactBottom = overlayRect.top - 1; // Exactly 1px above clippy
              
              chatContainer.dataset.originalBottom = exactBottom;
              chatContainer.dataset.originalTop = chatContainer.getBoundingClientRect().top;
              chatContainer.dataset.originalHeight = chatContainer.getBoundingClientRect().height;
              
              devLog(`Mobile balloon LOCKED bottom position: ${exactBottom}px (1px above clippy at ${overlayRect.top}px)`);
            }
          }, 50);
        }, 0);
      }

      return true;
    } catch (error) {
      errorLog("Error creating chat balloon", error);
      return false;
    }
  }

  /**
   * Hide the current chat balloon - with persistence check
   * @returns {boolean} - Success status
   */
  hide(forceClose = false) {
    try {
      // Don't auto-close if user has interacted, unless forced
      if (this.hasUserEverInteracted && !forceClose) {
        devLog(
          "Chat balloon persistence active - user has interacted, not auto-closing"
        );
        return false;
      }

      // Remove current chat balloon
      if (this.currentChatBalloon && this.currentChatBalloon.parentNode) {
        this.currentChatBalloon.remove();
        devLog("Chat balloon removed from DOM");
      }

      // Also remove any orphaned chat balloons
      const orphanedChats = document.querySelectorAll(
        ".custom-clippy-chat-balloon"
      );
      orphanedChats.forEach((chat) => {
        chat.remove();
        devLog("Removed orphaned chat balloon");
      });

      this.currentChatBalloon = null;
      this.chatHistory = [];
      this.isUserInteracting = false;
      this.hasUserEverInteracted = false;

      // Remove dynamic repositioning
      this._removeDynamicRepositioning();
      
      // Clean up visibility monitoring
      if (this._visibilityCheckInterval) {
        clearInterval(this._visibilityCheckInterval);
        this._visibilityCheckInterval = null;
      }
      
      if (this._clippyObserver) {
        this._clippyObserver.disconnect();
        this._clippyObserver = null;
      }
      
      if (this._overlayObserver) {
        this._overlayObserver.disconnect();
        this._overlayObserver = null;
      }

      return true;
    } catch (error) {
      errorLog("Error hiding chat balloon", error);
      return false;
    }
  }

  /**
   * Force close chat balloon (for manual close button)
   * @returns {boolean} - Success status
   */
  forceClose() {
    devLog("Force closing chat balloon");
    return this.hide(true);
  }

  /**
   * Create the HTML content for the chat balloon - FIXED with centered send button
   * @param {HTMLElement} container - The chat container element
   * @param {string} initialMessage - Initial message from Clippy
   * @param {Object} options - Additional options (may include agentName)
   */
  createChatContent(container, initialMessage, options = {}) {
    // Get the current agent name from window.selectedAIAgent or fall back to options
    const getCurrentAgent = () => {
      // Try getting from window.selectedAIAgent first
      if (window.selectedAIAgent) {
        return window.selectedAIAgent;
      }
      // Then try clippy element's data-agent attribute
      const clippyEl = document.querySelector('.clippy');
      const dataAgent = clippyEl?.getAttribute('data-agent');
      if (dataAgent) {
        window.selectedAIAgent = dataAgent; // Sync the global state
        return dataAgent;
      }
      // Then try options
      if (options.agentName) {
        window.selectedAIAgent = options.agentName; // Sync the global state
        return options.agentName;
      }
      // Default to Clippy
      return "Clippy";
    };

    const selectedAgent = getCurrentAgent();
    const agentNickname = getAgentNickname(selectedAgent);
    const agentTitle = `Chat with ${selectedAgent}`;

    // FIXED: Mobile-responsive close button styling
    const isMobile = this.isMobile();
    
    // Store original height for minimum resize constraint  
    // FIXED: Height reduced by 7px total (3px bottom padding + 4px margin reduction)
    const originalHeight = 200; // Tightened spacing to eliminate empty area below send button
    container.dataset.originalHeight = originalHeight;

    // Create chat balloon HTML
    container.innerHTML = `
    <div class="chat-resize-handle" style="
      position: absolute;
      top: -2px;
      left: 0;
      right: 0;
      height: ${isMobile ? '10px' : '8px'};
      cursor: n-resize;
      background: transparent;
      z-index: 1000;
    "></div>
    <button class="custom-clippy-balloon-close" aria-label="Close chat" style="
      position: absolute;
      top: 4px;
      right: 8px;
      cursor: pointer;
      font-weight: bold;
      font-size: 16px;
      padding: 2px 6px;
      background: none transparent;
      border: none;
      line-height: 1;
      min-width: 28px;
      min-height: 28px;
      color: rgb(102, 102, 102);
      -webkit-text-fill-color: rgb(102, 102, 102);
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    ">×</button>
    
    <div <div class="custom-clippy-balloon-title" style="
      margin-bottom: 6px;
      font-weight: bold;
      font-size: 12px;
      color: #000;
      -webkit-text-fill-color: #000;
      padding-right: 35px;
    ">
      💬 ${agentTitle}
    </div>
    
    <div class="chat-messages" style="
      flex: 1;
      overflow-y: auto;
      border: 1px inset #999;
      background: white;
      padding: 6px;
      margin-bottom: 2px;
      color: #000;
      -webkit-text-fill-color: #000;
      min-height: 60px;
      max-height: 70px;
      font-family: 'Tahoma', sans-serif;
      font-size: 11px;
      line-height: 1.3;
    ">
      <div style="
        margin: 2px 0;
        color: #000;
        -webkit-text-fill-color: #000;
        text-align: left;
        font-size: 11px !important;
        line-height: 1.3;
        font-family: 'Tahoma', sans-serif !important;
      ">
        <strong>${agentNickname}:</strong> ${initialMessage}
      </div>
    </div>
    
    <div style="display: flex; gap: 6px; align-items: stretch;">
      <input type="text" placeholder="Type a message..." class="chat-input" style="
        flex: 1;
        padding: 4px 6px;
        border: 1px inset #999;
        font-size: 11px !important;
        color: #000;
        -webkit-text-fill-color: #000;
        font-family: 'MS Sans Serif', sans-serif !important;
        background-color: #fff;
        outline: none;
        -webkit-appearance: none;
        appearance: none;
        min-height: 28px;
        height: 28px;
        max-height: 28px;
      " />
      <button class="chat-send" style="
        padding: 4px 12px;
        background: rgb(192, 192, 192);
        border: 1px outset rgb(192, 192, 192);
        font-size: 11px;
        cursor: pointer;
        color: rgb(0, 0, 0);
        -webkit-text-fill-color: rgb(0, 0, 0);
        font-family: 'Tahoma', sans-serif;
        min-height: 28px;
        height: 28px;
        max-height: 28px;
        min-width: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">Send</button>
    </div>
  `;

    // Also update window.selectedAIAgent for consistency
    window.selectedAIAgent = selectedAgent;

    // Enhanced updateTitle function that also updates the initial message
    const updateTitle = () => {
      const titleEl = container.querySelector('.custom-clippy-balloon-title');
      const messageEl = container.querySelector('.chat-messages div:first-child strong');
      if (titleEl || messageEl) {
        const currentAgent = window.selectedAIAgent || "Clippy";
        if (titleEl) {
          titleEl.innerHTML = `💬 Chat with ${currentAgent}`;
        }
        if (messageEl) {
          const nickname = getAgentNickname(currentAgent);
          messageEl.textContent = `${nickname}:`;
        }
      }
    };

    // Set up agent change event listener
    this._agentChangeHandler = (event) => {
      if (event.detail?.agent) {
        window.selectedAIAgent = event.detail.agent;
        updateTitle();
      }
    };
    window.addEventListener('agentChanged', this._agentChangeHandler);

    // Set up mutation observer with enhanced event handling
    const clippyEl = document.querySelector('.clippy');
    if (clippyEl) {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.attributeName === 'data-agent') {
            const newAgent = clippyEl.getAttribute('data-agent');
            if (newAgent) {
              window.selectedAIAgent = newAgent;
              updateTitle();
            }
          }
        }
      });
      observer.observe(clippyEl, { attributes: true, attributeFilter: ['data-agent'] });
      this._titleObserver = observer;
    }

    // Attach event listeners
    this.attachEventListeners(container);
    
    // Add vertical resize functionality
    this.addResizeFunctionality(container);
    
    // Set up Clippy visibility monitoring
    this.setupClippyVisibilityMonitoring();
  }

  /**
   * Attach event listeners to chat elements - with interaction tracking
   * @param {HTMLElement} container - The chat container
   */
  attachEventListeners(container) {
    const closeBtn = container.querySelector(".custom-clippy-balloon-close");
    const chatInput = container.querySelector(".chat-input");
    const sendBtn = container.querySelector(".chat-send");
    const messagesContainer = container.querySelector(".chat-messages");

    // Add visual viewport resize handler for mobile keyboard
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", () => {
        if (this.currentChatBalloon) {
          const position = this.calculatePosition();
          this.currentChatBalloon.style.left = `${position.left}px`;
          this.currentChatBalloon.style.top = `${position.top}px`;
        }
      });
    }

    // Close button - use forceClose
    closeBtn.onclick = () => {
      this.forceClose();
    };

    // Close button hover effect
    closeBtn.onmouseenter = () => {
      closeBtn.style.color = "#000000";
      closeBtn.style.webkitTextFillColor = "#000000";
      closeBtn.style.backgroundColor = "#f0f0f0";
      closeBtn.style.borderRadius = "2px";
    };

    closeBtn.onmouseleave = () => {
      closeBtn.style.color = "#666666";
      closeBtn.style.webkitTextFillColor = "#666666";
      closeBtn.style.backgroundColor = "transparent";
      closeBtn.style.borderRadius = "";
    };

    // Track user interaction for persistent chat
    const markUserInteraction = () => {
      if (!this.hasUserEverInteracted) {
        this.hasUserEverInteracted = true;
        this.isUserInteracting = true;
        devLog("🔒 Chat balloon now persistent - user has interacted");
      }
    };

    // Send message function
    const sendMessage = () => {
      const message = chatInput.value.trim();
      if (!message) return;

      // Mark user interaction
      markUserInteraction();

      // Add user message to chat
      this.addMessageToChat(messagesContainer, "user", message);
      chatInput.value = "";

      // Add to history
      this.chatHistory.push({
        sender: "user",
        message: message,
        timestamp: Date.now(),
      });

      // Generate and add Clippy response
      setTimeout(() => {
        const response = this.generateClippyResponse(message);
        this.addMessageToChat(messagesContainer, "clippy", response);

        // Add to history
        this.chatHistory.push({
          sender: "clippy",
          message: response,
          timestamp: Date.now(),
        });
      }, 1000 + Math.random() * 1000); // 1-2 second delay for realism
    };

    // Send button
    sendBtn.onclick = sendMessage;

    // Send button hover effect
    sendBtn.onmouseenter = () => {
      sendBtn.style.backgroundColor = "#d0d0d0";
    };

    sendBtn.onmouseleave = () => {
      sendBtn.style.backgroundColor = "#c0c0c0";
    };

    // FIXED: Send button active effect with proper centering
    sendBtn.onmousedown = () => {
      sendBtn.style.border = "1px inset #c0c0c0";
      // Don't adjust padding to maintain centering
    };

    sendBtn.onmouseup = () => {
      sendBtn.style.border = "1px outset #c0c0c0";
      // Don't adjust padding to maintain centering
    };

    // Input field - track ALL interactions
    chatInput.onkeypress = (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    };

    chatInput.oninput = () => {
      markUserInteraction();
    };

    chatInput.onclick = () => {
      markUserInteraction();
    };

    chatInput.onfocus = () => {
      markUserInteraction();
      chatInput.style.borderColor = "#0078d4";
      chatInput.style.boxShadow = "0 0 0 1px #0078d4";
    };

    chatInput.onblur = () => {
      chatInput.style.borderColor = "";
      chatInput.style.boxShadow = "";
    };
  }

  /**
   * Add a message to the chat display - with improved styling
   * @param {HTMLElement} chatMessages - The chat messages container
   * @param {string} sender - 'user' or 'clippy'
   * @param {string} message - The message text
   */
  addMessageToChat(chatMessages, sender, message) {
    const messageEl = document.createElement("div");
    messageEl.style.cssText = `
      margin: 3px 0;
      color: ${sender === "user" ? "#000080" : "#000"};
      -webkit-text-fill-color: ${sender === "user" ? "#000080" : "#000"};
      text-align: ${sender === "user" ? "right" : "left"};
      font-size: 11px !important;
      line-height: 1.3;
      font-family: 'Tahoma', sans-serif !important;
    `;

    // Get current agent name for the message
    const currentAgent = window.selectedAIAgent || "Clippy";
    const nickname = getAgentNickname(currentAgent);

    if (sender === "clippy") {
      messageEl.innerHTML = `<strong>${nickname}:</strong> ${message}`;
    } else {
      messageEl.innerHTML = `<strong>You:</strong> ${message}`;
    }

    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /**
   * Add vertical resize functionality to chat balloon
   * @param {HTMLElement} container - The chat balloon container
   */
  /**
   * Handle Clippy visibility changes - hide/show chat balloon but preserve history
   */
  handleClippyVisibilityChange() {
    const clippyEl = document.querySelector('.clippy');
    const overlayEl = document.getElementById('clippy-clickable-overlay');
    
    if (!this.currentChatBalloon) return;
    
    // Check if Clippy and overlay are hidden
    const clippyHidden = !clippyEl || 
      clippyEl.style.visibility === 'hidden' || 
      clippyEl.style.display === 'none' ||
      window.clippyIsHidden || 
      window.clippyIsHiding;
      
    const overlayHidden = !overlayEl || 
      overlayEl.style.visibility === 'hidden' || 
      overlayEl.style.display === 'none';
    
    if (clippyHidden || overlayHidden) {
      // Hide chat balloon but preserve it
      this.currentChatBalloon.style.visibility = 'hidden';
      this.currentChatBalloon.style.opacity = '0';
      this.currentChatBalloon.style.pointerEvents = 'none';
    } else {
      // Show chat balloon
      this.currentChatBalloon.style.visibility = 'visible';
      this.currentChatBalloon.style.opacity = '1';
      this.currentChatBalloon.style.pointerEvents = 'auto';
    }
  }

  /**
   * Set up monitoring for Clippy visibility changes
   */
  setupClippyVisibilityMonitoring() {
    // Check visibility every 500ms
    this._visibilityCheckInterval = setInterval(() => {
      this.handleClippyVisibilityChange();
    }, 500);
    
    // Also set up MutationObserver for immediate style changes
    const clippyEl = document.querySelector('.clippy');
    const overlayEl = document.getElementById('clippy-clickable-overlay');
    
    if (clippyEl) {
      this._clippyObserver = new MutationObserver(() => {
        this.handleClippyVisibilityChange();
      });
      this._clippyObserver.observe(clippyEl, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
    
    if (overlayEl) {
      this._overlayObserver = new MutationObserver(() => {
        this.handleClippyVisibilityChange();
      });
      this._overlayObserver.observe(overlayEl, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
  }

  addResizeFunctionality(container) {
    const resizeHandle = container.querySelector('.chat-resize-handle');
    const chatMessages = container.querySelector('.chat-messages');
    const originalHeight = parseInt(container.dataset.originalHeight) || 160;
    
    if (!resizeHandle || !chatMessages) return;
    
    let isResizing = false;
    let startY = 0;
    let startHeight = 0;
    let containerStartHeight = 0;
    
    const startResize = (e) => {
      isResizing = true;
      startY = e.clientY || e.touches[0].clientY;
      startHeight = chatMessages.offsetHeight;
      containerStartHeight = container.offsetHeight;
      
      // Use the original top position that was set during creation
      // Only set it if it doesn't exist (shouldn't happen, but safety check)
      if (!container.dataset.originalTop) {
        const currentTop = parseInt(container.style.top.replace('px', '')) || 0;
        container.dataset.originalTop = currentTop;
      }
      
      // Prevent text selection during resize
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      
      // Add global event listeners
      document.addEventListener('mousemove', doResize);
      document.addEventListener('mouseup', stopResize);
      document.addEventListener('touchmove', doResize);
      document.addEventListener('touchend', stopResize);
      
      e.preventDefault();
      e.stopPropagation();
    };
    
    const doResize = (e) => {
      if (!isResizing) return;
      
      const currentY = e.clientY || e.touches[0].clientY;
      const deltaY = startY - currentY; // Positive when dragging up (expanding)
      
      const newContainerHeight = containerStartHeight + deltaY;
      const newChatHeight = startHeight + deltaY;
      
      // Get viewport boundaries for constraint checking
      const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const viewport = isMobile ? {
        top: 0,
        bottom: window.innerHeight,
        height: window.innerHeight
      } : (() => {
        const desktop = document.querySelector('.desktop.screen') || document.querySelector('.desktop') || document.querySelector('.w98');
        if (desktop) {
          const rect = desktop.getBoundingClientRect();
          return { top: rect.top, bottom: rect.bottom, height: rect.height };
        }
        return { top: 0, bottom: window.innerHeight, height: window.innerHeight };
      })();
      
      // Calculate current container position
      const currentTop = parseInt(container.style.top.replace('px', '')) || parseInt(container.dataset.originalTop) || 0;
      const currentBottom = currentTop + newContainerHeight;
      
      // Viewport constraints - prevent expanding beyond viewport
      const minTop = viewport.top + 10; // Minimum 10px from top
      const maxBottom = viewport.bottom - 10; // Minimum 10px from bottom
      const maxAllowedHeight = maxBottom - minTop;
      
      // Constrain new height to viewport
      const constrainedHeight = Math.min(newContainerHeight, maxAllowedHeight);
      const constrainedChatHeight = Math.max(60, newChatHeight - (newContainerHeight - constrainedHeight));
      
      
      // FIXED: Anchor to bottom position and enforce minimum height to prevent bottom drift
      const originalBottom = parseInt(container.dataset.originalBottom);
      const minAllowedHeight = parseInt(container.dataset.originalHeight); // Don't shrink below original
      
      // Enforce minimum height while maintaining bottom anchor
      if (constrainedHeight >= minAllowedHeight && constrainedChatHeight >= 60) {
        let newTop = originalBottom - constrainedHeight;
        
        // CRITICAL: Check viewport boundary
        if (newTop < minTop) {
          // We've hit the viewport boundary - STOP expanding and lock current state
          console.log('Viewport boundary hit - stopping resize to prevent bottom shift');
          return; // Exit completely to prevent any position changes
        } else {
          // Apply resize with bottom anchor (expanding only, no shrinking below original)
          container.style.setProperty('height', `${constrainedHeight}px`, 'important');
          chatMessages.style.setProperty('max-height', `${constrainedChatHeight}px`, 'important');
          chatMessages.style.setProperty('min-height', `${constrainedChatHeight}px`, 'important');
          chatMessages.style.setProperty('height', `${constrainedChatHeight}px`, 'important');
          
          // Apply the new top position calculated from bottom anchor
          container.style.setProperty('top', `${newTop}px`, 'important');
        }
        
      }
      
      e.preventDefault();
      e.stopPropagation();
    };
    
    const stopResize = () => {
      if (!isResizing) return;
      
      isResizing = false;
      
      // Restore text selection
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      
      // Remove global event listeners
      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', stopResize);
      document.removeEventListener('touchmove', doResize);
      document.removeEventListener('touchend', stopResize);
    };
    
    // Add event listeners to resize handle
    resizeHandle.addEventListener('mousedown', startResize);
    resizeHandle.addEventListener('touchstart', startResize);
  }

  /**
   * Calculate chat balloon position - FIXED with enhanced viewport constraints
   * @param {Object} customPosition - Optional custom position override
   * @returns {Object} - Position with left, top, width, and height properties
   */
  calculatePosition(customPosition = null) {
    // Use mobile viewport for mobile devices
    const isMobile =
      window.innerWidth <= 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
    const minWidth = 260;
    const maxWidth = isMobile ? 330 : 330; // 10% increase for both mobile and desktop (300 * 1.1 = 330)
    const minHeight = 140; // Reduced from 200
    const maxHeight = 200; // FIXED: Tightened spacing to eliminate empty area below send button
    const safeMargin = isMobile ? 8 : 16; // FIXED: Proportional margin - mobile gets half the margin
    const clippyMargin = 32; // Slightly less gap for mobile
    let viewportWidth,
      viewportHeight,
      viewportLeft = 0,
      viewportTop = 0;

    if (isMobile) {
      // On mobile, use visual viewport to account for keyboard
      viewportWidth = window.visualViewport?.width || window.innerWidth;
      viewportHeight = window.visualViewport?.height || window.innerHeight;
      viewportLeft = window.visualViewport?.offsetLeft || 0;
      viewportTop = window.visualViewport?.offsetTop || 0;
    } else {
      // Desktop container logic
      const desktop =
        document.querySelector(".desktop.screen") ||
        document.querySelector(".desktop") ||
        document.querySelector(".w98");
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
    }

    // Calculate sizing within viewport constraints
    const chatWidth = Math.min(
      maxWidth,
      Math.max(minWidth, viewportWidth - safeMargin * 2)
    );
    const chatHeight = Math.min(
      maxHeight,
      Math.max(minHeight, viewportHeight - 200)
    );

    // Find Clippy and overlay
    const clippyEl = document.querySelector(".clippy");
    const overlayEl = document.getElementById("clippy-clickable-overlay");

    if (clippyEl) {
      const clippyRect = clippyEl.getBoundingClientRect();
      const overlayRect = overlayEl
        ? overlayEl.getBoundingClientRect()
        : clippyRect;

      // Calculate Clippy's full height including overlay
      const clippyHeight = clippyRect.height;
      const overlayHeight = overlayRect.height;
      const effectiveClippyHeight = Math.max(clippyHeight, overlayHeight);

      // For mobile, position at bottom of viewport when keyboard is open
      if (isMobile && window.visualViewport?.height < window.innerHeight) {
        return {
          left: viewportLeft + (viewportWidth - chatWidth) / 2,
          top: viewportTop + viewportHeight - chatHeight - safeMargin,
          width: chatWidth,
          height: chatHeight,
          withinBounds: true,
        };
      }

      // Position balloon 1px above the TOP of Clippy overlay
      let left, top;
      
      if (isMobile) {
        // FIXED: Mobile right border should be 14px from right viewport edge
        left = viewportLeft + viewportWidth - chatWidth - 14;
      } else {
        // Desktop: center on Clippy
        left = clippyRect.left + clippyRect.width / 2 - chatWidth / 2;
      }
      
      top = overlayRect.top - chatHeight - 1; // 1px above the TOP of overlay

      // Constrain to viewport horizontally
      left = Math.max(
        viewportLeft + safeMargin,
        Math.min(left, viewportLeft + viewportWidth - chatWidth - safeMargin)
      );

      // Check if balloon fits above Clippy within viewport
      if (top < viewportTop + safeMargin) {
        // If not enough space above, try positioning to the left of Clippy
        top = overlayRect.top + 10; // Align roughly with Clippy's top
        left = clippyRect.left - chatWidth - 30; // 30px gap to the left

        // If still doesn't fit on left, try right side
        if (left < viewportLeft + safeMargin) {
          left = clippyRect.right + 30; // 30px gap to the right

          // Ensure it fits on the right
          if (left + chatWidth > viewportLeft + viewportWidth - safeMargin) {
            // Last resort: position at top of viewport
            left = viewportLeft + (viewportWidth - chatWidth) / 2;
            top = viewportTop + safeMargin;
          }
        }
      }

      // Final vertical constraint check
      top = Math.max(viewportTop + safeMargin, top);

      devLog(
        `Chat balloon position: left=${left}, top=${top}, size=${chatWidth}x${chatHeight}`
      );

      return {
        left,
        top,
        width: chatWidth,
        height: chatHeight,
        withinBounds: true,
      };
    } else {
      // Fallback
      return {
        left: viewportLeft + safeMargin,
        top: viewportTop + safeMargin,
        width: chatWidth,
        height: chatHeight,
        withinBounds: true,
      };
    }
  }

  /**
   * Generate a response from Clippy based on user input
   * @param {string} userMessage - The user's message
   * @returns {string} - Clippy's response
   */
  generateClippyResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    // Response patterns
    const responses = {
      hello: [
        "Hello there! How can I assist you today?",
        "Hi! Great to chat with you!",
        "Hello! What can I help you with?",
      ],
      help: [
        "I can help with many things! Try asking me about Hydra98 or just chat with me.",
        "I'm here to help! What do you need assistance with?",
        "Happy to help! What would you like to know?",
      ],
      hydra: [
        "Hydra98 is an amazing Windows 98 desktop emulator! What do you think of it?",
        "Hydra98 brings back the nostalgic Windows 98 experience! Are you enjoying it?",
        "I love helping people navigate Hydra98! It's just like the good old days.",
      ],
      thanks: [
        "You're very welcome! Is there anything else I can help you with?",
        "My pleasure! Feel free to ask me anything else.",
        "Happy to help! What else can I do for you?",
      ],
      bye: [
        "Goodbye! Click the X to close this chat anytime.",
        "See you later! I'll be here if you need me.",
        "Farewell! Thanks for chatting with me.",
      ],
      how: [
        "That's a great question! Let me think about that...",
        "Hmm, let me help you figure that out!",
        "Good question! Here's what I think...",
      ],
      what: [
        "That's an interesting question!",
        "Let me explain that for you...",
        "Good question! Here's what I know...",
      ],
      why: [
        "That's a thoughtful question!",
        "Let me think about the reasoning behind that...",
        "Interesting! Here's my perspective...",
      ],
    };

    // Find matching response category
    for (const [key, responseArray] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        const randomResponse =
          responseArray[Math.floor(Math.random() * responseArray.length)];
        return randomResponse;
      }
    }

    // Default responses for unmatched input
    const defaultResponses = [
      "That's interesting! Tell me more, or ask me something else.",
      "I see! What else would you like to chat about?",
      "Fascinating! Is there anything specific I can help you with?",
      "Thanks for sharing! What else is on your mind?",
      "Interesting perspective! What would you like to know?",
      "I appreciate you sharing that! How else can I assist you?",
      "That's a good point! What other questions do you have?",
      "Thanks for telling me that! What else can I help with?",
    ];

    return defaultResponses[
      Math.floor(Math.random() * defaultResponses.length)
    ];
  }

  /**
   * Check if mobile device
   * @returns {boolean}
   */
  isMobile() {
    return (
      window.innerWidth <= 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
  }

  /**
   * Check if a chat balloon is currently visible
   * @returns {boolean}
   */
  isVisible() {
    return this.currentChatBalloon && this.currentChatBalloon.parentNode;
  }

  /**
   * Check if user has interacted with the chat (making it persistent)
   * @returns {boolean}
   */
  isUserInteractingWithChat() {
    return this.hasUserEverInteracted;
  }

  /**
   * Get chat history
   * @returns {Array} - Array of chat messages
   */
  getChatHistory() {
    return [...this.chatHistory];
  }

  /**
   * Cleanup method for component unmount
   */
  cleanup() {
    if (this._titleObserver) {
      this._titleObserver.disconnect();
      this._titleObserver = null;
    }
    if (this._agentChangeHandler) {
      window.removeEventListener('agentChanged', this._agentChangeHandler);
      this._agentChangeHandler = null;
    }
    this.forceClose();
    devLog("ChatBalloonManager cleaned up");
  }

  /**
   * Add dynamic repositioning for the current chat balloon
   */
  _addDynamicRepositioning(options) {
    this._removeDynamicRepositioning();
    this._resizeHandler = () => {
      if (!this.currentChatBalloon) return;
      const position = this.calculatePosition(options?.position);
      this.currentChatBalloon.style.setProperty(
        "left",
        `${position.left}px`,
        "important"
      );
      this.currentChatBalloon.style.setProperty(
        "top",
        `${position.top}px`,
        "important"
      );
    };
    window.addEventListener("resize", this._resizeHandler);
    window.addEventListener("clippyRepositioned", this._resizeHandler);
  }

  /**
   * Remove dynamic repositioning event listeners
   */
  _removeDynamicRepositioning() {
    if (this._resizeHandler) {
      window.removeEventListener("resize", this._resizeHandler);
      window.removeEventListener("clippyRepositioned", this._resizeHandler);
      this._resizeHandler = null;
    }
  }
}

// Create singleton instance
const chatBalloonManager = new ChatBalloonManager();

/**
 * Show an interactive chat balloon (main public API)
 * @param {string} initialMessage - Initial message from Clippy
 * @param {Object} options - Additional options
 * @returns {boolean} - Success status
 */
export const showChatBalloon = (initialMessage, options = {}) => {
  return chatBalloonManager.show(initialMessage, options);
};

/**
 * Hide the current chat balloon
 * @returns {boolean} - Success status
 */
export const hideChatBalloon = () => {
  return chatBalloonManager.hide();
};

/**
 * Force close chat balloon (for manual close)
 * @returns {boolean} - Success status
 */
export const forceCloseChatBalloon = () => {
  return chatBalloonManager.forceClose();
};

/**
 * Check if chat balloon is currently visible
 * @returns {boolean}
 */
export const isChatBalloonVisible = () => {
  return chatBalloonManager.isVisible();
};

/**
 * Check if user is actively interacting with chat (making it persistent)
 * @returns {boolean}
 */
export const isUserInteractingWithChat = () => {
  return chatBalloonManager.isUserInteractingWithChat();
};

/**
 * Get chat history
 * @returns {Array} - Array of chat messages
 */
export const getChatHistory = () => {
  return chatBalloonManager.getChatHistory();
};

/**
 * Cleanup function for unmount
 */
export const cleanupChatBalloon = () => {
  chatBalloonManager.cleanup();
};

// React component for backwards compatibility (if needed)
const ChatBalloon = ({ initialMessage, position, onClose }) => {
  // This is just a wrapper - actual implementation is DOM-based above
  React.useEffect(() => {
    if (initialMessage) {
      showChatBalloon(initialMessage, { position });
    }

    return () => {
      if (onClose) {
        onClose();
      }
    };
  }, [initialMessage, position, onClose]);

  // Return null since we're using DOM manipulation
  return null;
};

export default ChatBalloon;
