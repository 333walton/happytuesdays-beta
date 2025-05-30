// ChatBalloon.js - FIXED DOM-based interactive chat balloon implementation
// This file handles interactive chat balloons (not speech balloons)
import React from "react";
// ChatBalloon.js - FIXED DOM-based interactive chat balloon implementation
// This file handles interactive chat balloons (not speech balloons)

import { devLog, errorLog } from './ClippyPositioning';

/**
 * Creates and manages interactive chat balloons for Clippy
 * Uses direct DOM manipulation for maximum compatibility
 */
class ChatBalloonManager {
  constructor() {
    this.currentChatBalloon = null;
    this.chatHistory = [];
  }

  /**
   * Show an interactive chat balloon
   * @param {string} initialMessage - The initial message from Clippy
   * @param {Object} options - Additional options
   * @returns {boolean} - Success status
   */
  show(initialMessage, options = {}) {
    try {
      devLog(`Creating chat balloon: "${initialMessage}"`);
      
      // FIXED: Remove any existing chat balloons first
      this.hide();

      // Create chat container
      const chatContainer = document.createElement('div');
      chatContainer.className = 'custom-clippy-chat-balloon';
      
      // Calculate position
      const position = this.calculatePosition(options.position);
      
      // Apply positioning and sizing
      chatContainer.style.position = 'fixed';
      chatContainer.style.left = `${position.left}px`;
      chatContainer.style.top = `${position.top}px`;
      chatContainer.style.width = `${position.width}px`;
      chatContainer.style.height = '300px';
      chatContainer.style.zIndex = '9999';
      chatContainer.style.visibility = 'visible';
      chatContainer.style.opacity = '1';
      chatContainer.style.display = 'flex';
      chatContainer.style.flexDirection = 'column';

      // Create chat balloon HTML content
      this.createChatContent(chatContainer, initialMessage);

      // Add to DOM
      document.body.appendChild(chatContainer);
      this.currentChatBalloon = chatContainer;
      
      // Initialize chat history
      this.chatHistory = [
        { sender: 'clippy', message: initialMessage, timestamp: Date.now() }
      ];

      devLog(`Chat balloon positioned at (${position.left}, ${position.top})`);

      // Focus input after a brief delay
      setTimeout(() => {
        const input = chatContainer.querySelector('.chat-input');
        if (input) {
          input.focus();
        }
      }, 100);

      return true;
    } catch (error) {
      errorLog("Error creating chat balloon", error);
      return false;
    }
  }

  /**
   * Hide the current chat balloon
   * @returns {boolean} - Success status
   */
  hide() {
    try {
      // Remove current chat balloon
      if (this.currentChatBalloon && this.currentChatBalloon.parentNode) {
        this.currentChatBalloon.remove();
        devLog("Chat balloon removed from DOM");
      }

      // Also remove any orphaned chat balloons
      const orphanedChats = document.querySelectorAll('.custom-clippy-chat-balloon');
      orphanedChats.forEach(chat => {
        chat.remove();
        devLog("Removed orphaned chat balloon");
      });

      this.currentChatBalloon = null;
      this.chatHistory = [];
      return true;
    } catch (error) {
      errorLog("Error hiding chat balloon", error);
      return false;
    }
  }

  /**
   * Create the HTML content for the chat balloon
   * @param {HTMLElement} container - The chat container element
   * @param {string} initialMessage - Initial message from Clippy
   */
  createChatContent(container, initialMessage) {
    container.innerHTML = `
      <button class="custom-clippy-balloon-close" aria-label="Close chat" style="
        position: absolute;
        top: 8px;
        right: 12px;
        cursor: pointer;
        font-weight: bold;
        font-size: 20px;
        padding: 4px 8px;
        background: none;
        border: none;
        line-height: 1;
        min-width: 32px;
        min-height: 32px;
        color: #666666;
        -webkit-text-fill-color: #666666;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      ">×</button>
      
      <div style="
        margin-bottom: 12px;
        font-weight: bold;
        font-size: 16px;
        color: #000;
        -webkit-text-fill-color: #000;
        padding-right: 40px;
      ">
        💬 Chat with Clippy
      </div>
      
      <div class="chat-messages" style="
        flex: 1;
        overflow-y: auto;
        border: 2px inset #ccc;
        background: white;
        padding: 8px;
        margin-bottom: 12px;
        color: #000;
        -webkit-text-fill-color: #000;
        min-height: 180px;
        font-family: 'Tahoma', sans-serif;
        font-size: 14px;
      ">
        <div style="
          margin: 8px 0;
          color: #000;
          -webkit-text-fill-color: #000;
          text-align: left;
        ">
          <strong>Clippy:</strong> ${initialMessage}
        </div>
      </div>
      
      <div style="display: flex; gap: 8px;">
        <input type="text" placeholder="Type a message..." class="chat-input" style="
          flex: 1;
          padding: 8px;
          border: 2px inset #ccc;
          font-size: ${this.isMobile() ? '16px' : '14px'};
          color: #000;
          -webkit-text-fill-color: #000;
          font-family: 'Tahoma', sans-serif;
          background-color: #fff;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          min-height: ${this.isMobile() ? '48px' : 'auto'};
        " />
        <button class="chat-send" style="
          padding: ${this.isMobile() ? '12px 20px' : '8px 16px'};
          background: #c0c0c0;
          border: 2px outset #c0c0c0;
          font-size: ${this.isMobile() ? '16px' : '14px'};
          cursor: pointer;
          color: #000;
          -webkit-text-fill-color: #000;
          font-family: 'Tahoma', sans-serif;
          touch-action: manipulation;
          -webkit-appearance: none;
          appearance: none;
          min-height: ${this.isMobile() ? '48px' : 'auto'};
          min-width: ${this.isMobile() ? '80px' : 'auto'};
        ">Send</button>
      </div>
    `;

    // Attach event listeners
    this.attachEventListeners(container);
  }

  /**
   * Attach event listeners to chat elements
   * @param {HTMLElement} container - The chat container
   */
  attachEventListeners(container) {
    const closeBtn = container.querySelector('.custom-clippy-balloon-close');
    const chatInput = container.querySelector('.chat-input');
    const sendBtn = container.querySelector('.chat-send');
    const chatMessages = container.querySelector('.chat-messages');

    // Close button
    closeBtn.onclick = () => {
      this.hide();
    };

    // Close button hover effect
    closeBtn.onmouseenter = () => {
      closeBtn.style.color = '#000000';
      closeBtn.style.webkitTextFillColor = '#000000';
      closeBtn.style.backgroundColor = '#f0f0f0';
      closeBtn.style.borderRadius = '4px';
    };

    closeBtn.onmouseleave = () => {
      closeBtn.style.color = '#666666';
      closeBtn.style.webkitTextFillColor = '#666666';
      closeBtn.style.backgroundColor = 'transparent';
      closeBtn.style.borderRadius = '';
    };

    // Send message function
    const sendMessage = () => {
      const message = chatInput.value.trim();
      if (!message) return;

      // Add user message to chat
      this.addMessageToChat(chatMessages, 'user', message);
      chatInput.value = '';

      // Add to history
      this.chatHistory.push({
        sender: 'user',
        message: message,
        timestamp: Date.now()
      });

      // Generate and add Clippy response
      setTimeout(() => {
        const response = this.generateClippyResponse(message);
        this.addMessageToChat(chatMessages, 'clippy', response);
        
        // Add to history
        this.chatHistory.push({
          sender: 'clippy',
          message: response,
          timestamp: Date.now()
        });
      }, 1000 + Math.random() * 1000); // 1-2 second delay for realism
    };

    // Send button
    sendBtn.onclick = sendMessage;

    // Send button hover effect
    sendBtn.onmouseenter = () => {
      sendBtn.style.backgroundColor = '#d0d0d0';
    };

    sendBtn.onmouseleave = () => {
      sendBtn.style.backgroundColor = '#c0c0c0';
    };

    // Send button active effect
    sendBtn.onmousedown = () => {
      sendBtn.style.border = '2px inset #c0c0c0';
      sendBtn.style.paddingTop = '9px';
      sendBtn.style.paddingLeft = '17px';
    };

    sendBtn.onmouseup = () => {
      sendBtn.style.border = '2px outset #c0c0c0';
      sendBtn.style.paddingTop = this.isMobile() ? '12px' : '8px';
      sendBtn.style.paddingLeft = this.isMobile() ? '20px' : '16px';
    };

    // Input field
    chatInput.onkeypress = (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    };

    // Input focus styling
    chatInput.onfocus = () => {
      chatInput.style.borderColor = '#0078d4';
      chatInput.style.boxShadow = '0 0 0 1px #0078d4';
    };

    chatInput.onblur = () => {
      chatInput.style.borderColor = '';
      chatInput.style.boxShadow = '';
    };
  }

  /**
   * Add a message to the chat display
   * @param {HTMLElement} chatMessages - The chat messages container
   * @param {string} sender - 'user' or 'clippy'
   * @param {string} message - The message text
   */
  addMessageToChat(chatMessages, sender, message) {
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      margin: 8px 0;
      color: ${sender === 'user' ? '#000080' : '#000'};
      -webkit-text-fill-color: ${sender === 'user' ? '#000080' : '#000'};
      text-align: ${sender === 'user' ? 'right' : 'left'};
    `;

    if (sender === 'clippy') {
      messageEl.innerHTML = `<strong>Clippy:</strong> ${message}`;
    } else {
      messageEl.innerHTML = `<strong>You:</strong> ${message}`;
    }

    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
        "Hello! What can I help you with?"
      ],
      help: [
        "I can help with many things! Try asking me about Hydra98 or just chat with me.",
        "I'm here to help! What do you need assistance with?",
        "Happy to help! What would you like to know?"
      ],
      hydra: [
        "Hydra98 is an amazing Windows 98 desktop emulator! What do you think of it?",
        "Hydra98 brings back the nostalgic Windows 98 experience! Are you enjoying it?",
        "I love helping people navigate Hydra98! It's just like the good old days."
      ],
      thanks: [
        "You're very welcome! Is there anything else I can help you with?",
        "My pleasure! Feel free to ask me anything else.",
        "Happy to help! What else can I do for you?"
      ],
      bye: [
        "Goodbye! Click the X to close this chat anytime.",
        "See you later! I'll be here if you need me.",
        "Farewell! Thanks for chatting with me."
      ],
      how: [
        "That's a great question! Let me think about that...",
        "Hmm, let me help you figure that out!",
        "Good question! Here's what I think..."
      ],
      what: [
        "That's an interesting question!",
        "Let me explain that for you...",
        "Good question! Here's what I know..."
      ],
      why: [
        "That's a thoughtful question!",
        "Let me think about the reasoning behind that...",
        "Interesting! Here's my perspective..."
      ]
    };

    // Find matching response category
    for (const [key, responseArray] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        const randomResponse = responseArray[Math.floor(Math.random() * responseArray.length)];
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
      "Thanks for telling me that! What else can I help with?"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  /**
   * Calculate chat balloon position
   * @param {Object} customPosition - Optional custom position override
   * @returns {Object} - Position with left, top, and width properties
   */
  calculatePosition(customPosition = null) {
    const minWidth = 320;
    const maxWidth = 400;
    const chatHeight = 300;
    const clippyOffset = 30;

    // Responsive width based on viewport
    const viewportWidth = window.innerWidth;
    const chatWidth = Math.min(maxWidth, Math.max(minWidth, viewportWidth - 40));

    // If custom position provided, use it
    if (customPosition && customPosition.left !== undefined && customPosition.top !== undefined) {
      return {
        left: Math.max(20, Math.min(customPosition.left, viewportWidth - chatWidth - 20)),
        top: Math.max(50, Math.min(customPosition.top, window.innerHeight - chatHeight - 50)),
        width: chatWidth
      };
    }

    // Find Clippy element for relative positioning
    const clippyEl = document.querySelector('.clippy');
    
    if (clippyEl) {
      const clippyRect = clippyEl.getBoundingClientRect();
      
      // Position chat above Clippy, centered horizontally
      let left = clippyRect.left + (clippyRect.width / 2) - (chatWidth / 2);
      let top = clippyRect.top - chatHeight - clippyOffset;
      
      // Keep chat within viewport with padding
      left = Math.max(20, Math.min(left, viewportWidth - chatWidth - 20));
      top = Math.max(50, Math.min(top, window.innerHeight - chatHeight - 50));
      
      // If chat would be too high, show it below Clippy instead
      if (top < 50) {
        top = clippyRect.bottom + clippyOffset;
        top = Math.min(top, window.innerHeight - chatHeight - 50);
      }
      
      return { left, top, width: chatWidth };
    } else {
      // Fallback: center of screen
      devLog("Clippy element not found, using center positioning");
      return {
        left: (viewportWidth - chatWidth) / 2,
        top: (window.innerHeight - chatHeight) / 2,
        width: chatWidth
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
   * Check if a chat balloon is currently visible
   * @returns {boolean}
   */
  isVisible() {
    return this.currentChatBalloon && this.currentChatBalloon.parentNode;
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
    this.hide();
    devLog("ChatBalloonManager cleaned up");
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
 * Check if chat balloon is currently visible
 * @returns {boolean}
 */
export const isChatBalloonVisible = () => {
  return chatBalloonManager.isVisible();
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