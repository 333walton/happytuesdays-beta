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
    
    // Create chat balloon HTML
    container.innerHTML = `
    <button class="custom-clippy-balloon-close" aria-label="Close chat" style="
      position: absolute;
      top: 4px;
      right: 8px;
      cursor: pointer;
      font-weight: bold;
      font-size: ${isMobile ? '18px' : '16px'};
      padding: ${isMobile ? '4px 8px' : '2px 6px'};
      background: none;
      border: none;
      line-height: 1;
      min-width: ${isMobile ? '32px' : '28px'};
      min-height: ${isMobile ? '32px' : '28px'};
      color: #666666;
      -webkit-text-fill-color: #666666;
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
      margin-bottom: 6px;
      color: #000;
      -webkit-text-fill-color: #000;
      min-height: 60px;
      max-height: 70px;
      font-family: 'Tahoma', sans-serif;
      font-size: 12px;
      line-height: 1.3;
    ">
      <div style="
        margin: 2px 0;
        color: #000;
        -webkit-text-fill-color: #000;
        text-align: left;
      ">
        <strong>${agentNickname}:</strong> ${initialMessage}
      </div>
    </div>
    
    <div style="display: flex; gap: 6px; align-items: stretch;">
      <input type="text" placeholder="Type a message..." class="chat-input" style="
        flex: 1;
        padding: 4px 6px;
        border: 1px inset #999;
        font-size: ${this.isMobile() ? "16px" : "11px"};
        color: #000;
        -webkit-text-fill-color: #000;
        font-family: 'Tahoma', sans-serif;
        background-color: #fff;
        outline: none;
        -webkit-appearance: none;
        appearance: none;
        min-height: ${this.isMobile() ? "36px" : "24px"};
        height: ${this.isMobile() ? "36px" : "24px"};
      " />
      <button class="chat-send" style="
        padding: ${this.isMobile() ? "8px 12px" : "4px 12px"};
        background: #c0c0c0;
        border: 1px outset #c0c0c0;
        font-size: ${this.isMobile() ? "12px" : "11px"};
        cursor: pointer;
        color: #000;
        -webkit-text-fill-color: #000;
        font-family: 'Tahoma', sans-serif;
        min-height: ${this.isMobile() ? "36px" : "24px"};
        height: ${this.isMobile() ? "36px" : "24px"};
        min-width: ${this.isMobile() ? "60px" : "50px"};
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
      font-size: 12px;
      line-height: 1.3;
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
   * Calculate chat balloon position - FIXED with enhanced viewport constraints
   * @param {Object} customPosition - Optional custom position override
   * @returns {Object} - Position with left, top, width, and height properties
   */
  calculatePosition(customPosition = null) {
    const minWidth = 260;
    const maxWidth = 300;
    const minHeight = 140; // Reduced from 200
    const maxHeight = 160; // Reduced from 240
    const safeMargin = 16; // Tighter margin for mobile
    const clippyMargin = 32; // Slightly less gap for mobile

    // Use mobile viewport for mobile devices
    const isMobile =
      window.innerWidth <= 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
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

      // Get the topmost position between Clippy and overlay
      const effectiveTop = Math.min(clippyRect.top, overlayRect.top);

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

      // Position balloon above Clippy's full height
      let left = clippyRect.left + clippyRect.width / 2 - chatWidth / 2;
      let top = effectiveTop - chatHeight - clippyMargin;

      // Constrain to viewport horizontally
      left = Math.max(
        viewportLeft + safeMargin,
        Math.min(left, viewportLeft + viewportWidth - chatWidth - safeMargin)
      );

      // Check if balloon fits above Clippy within viewport
      if (top < viewportTop + safeMargin) {
        // If not enough space above, try positioning to the left of Clippy
        top = effectiveTop + 10; // Align roughly with Clippy's top
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
