import { animations, interactions } from "./ClippyContent";
// Import chatResponses when you're ready to use it
// import { chatResponses } from "./ClippyContent";

class ClippyManager {
  constructor() {
    this.clippyFixedInterval = null;
    this.initialClippyPosition = null;
    this.clippyOverlay = null;
    this.customBalloon = null;
    this.clickTimeout = null;
    this.initialMessageShown = false;
    this.isInitialized = false;

    // Bind methods to preserve 'this' context
    this.initialize = this.initialize.bind(this);
    this.enforceFixedPositionOnDesktop =
      this.enforceFixedPositionOnDesktop.bind(this);
    this.showCustomBalloon = this.showCustomBalloon.bind(this);
    this.hideCustomBalloon = this.hideCustomBalloon.bind(this);
    this.positionCustomBalloon = this.positionCustomBalloon.bind(this);
    this.showChatBalloon = this.showChatBalloon.bind(this);
    this.toggleInputArea = this.toggleInputArea.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }

  // Initialize Clippy manager
  initialize(ClippyService, isMobile = false) {
    if (this.isInitialized) return;

    // Add global styles
    this.addClippyStyles();

    // Make Clippy visible
    ClippyService.show();

    // Set initial position based on device
    if (isMobile) {
      // On mobile, position at bottom-right and move down 40px
      // Calculate the percentage equivalent of 40px based on an estimated 600px height viewport
      const extraYPercent = 40 / 600; // Converts to ~0.067 or ~6.7%
      ClippyService.setInitialPosition({
        position: `85% ${85 + extraYPercent * 100}%`,
      });
    } else {
      // On desktop, position at center-right, moved down 40px
      // Calculate the percentage equivalent of 40px based on an 800px height viewport
      const extraYPercent = 40 / 800; // Converts to 0.05 or 5%
      ClippyService.setInitialPosition({
        position: `90% ${50 + extraYPercent * 100}%`,
      });

      // Override ClippyService methods to use our direct DOM manipulation
      ClippyService.speak = (text) => {
        this.showCustomBalloon(text);
        return true;
      };

      ClippyService.showChat = (initialMessage) => {
        this.showChatBalloon(initialMessage);
        return true;
      };

      // For desktop, enforce fixed position
      this.enforceFixedPositionOnDesktop();
    }

    // Show welcome message after a delay
    setTimeout(() => {
      if (!this.initialMessageShown) {
        ClippyService.play("Greeting");

        // Add a delay between animation and speech
        setTimeout(() => {
          ClippyService.speak("Welcome to Windows 98!");
          this.initialMessageShown = true;
        }, 800);
      }
    }, 3000);

    this.isInitialized = true;
  }

  // Add global styles for Clippy and balloons
  addClippyStyles() {
    // Check if styles already exist
    if (document.getElementById("clippy-custom-styles")) return;

    const styleElement = document.createElement("style");
    styleElement.id = "clippy-custom-styles";
    styleElement.textContent = `
      /* Original balloon styles - hidden but preserved for compatibility */
      .clippy-balloon {
        position: relative !important;
        top: -400px !important;
        left: 820px !important;
        right: auto !important;
        bottom: auto !important;
        transform: none !important;
        transition: none !important;
        animation: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        display: none !important;
      }
      
      /* Hide all tips */
      .clippy-balloon .clippy-tip {
        display: none !important;
      }
      
      /* Make sure Clippy scales with viewport */
      .clippy {
        position: absolute !important;
        transition: transform 0.2s ease !important;
        will-change: transform, left, top !important;
        z-index: 2000 !important;
      }
      
      /* Custom balloon styles */
      .custom-clippy-balloon {
        position: fixed !important;
        z-index: 9999 !important;
        background-color: #fffcde !important;
        border: 1px solid #000 !important;
        border-radius: 5px !important;
        padding: 8px 12px !important;
        font-family: 'Tahoma', sans-serif !important;
        font-size: 13px !important;
        box-shadow: 2px 2px 4px rgba(0,0,0,0.2) !important;
        max-width: 250px !important;
        max-height: calc(480px - 120px) !important; /* Ensure it fits in viewport */
        overflow: auto !important;
        visibility: visible !important;
        display: block !important;
        opacity: 1 !important;
      }
      
      /* Balloon tip */
      .custom-clippy-balloon:after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 20px;
        border-width: 10px 10px 0;
        border-style: solid;
        border-color: #fffcde transparent;
        display: block;
        width: 0;
      }
      
      .custom-clippy-balloon:before {
        content: '';
        position: absolute;
        bottom: -11px;
        left: 20px;
        border-width: 10px 10px 0;
        border-style: solid;
        border-color: #000 transparent;
        display: block;
        width: 0;
      }
      
      /* Close button */
      .custom-clippy-balloon-close {
        position: absolute;
        top: 2px;
        right: 5px;
        cursor: pointer;
        font-weight: bold;
        font-size: 16px;
        color: #666;
      }
      
      .custom-clippy-balloon-close:hover {
        color: #000;
      }
      
      /* Option buttons */
      .clippy-option-button {
        background: #d4d0c8;
        border: 2px solid;
        border-color: #fff #888 #888 #fff;
        padding: 3px 8px;
        margin: 3px 5px 3px 0;
        font-family: 'Tahoma', sans-serif;
        font-size: 12px;
        cursor: pointer;
        display: inline-block;
      }
      
      .clippy-option-button:hover {
        background: #e2e0da;
      }
      
      .clippy-option-button:active {
        border-color: #888 #fff #fff #888;
      }
      
      /* Input area */
      .clippy-input-container {
        margin-top: 8px;
        border-top: 1px solid #ccc;
        padding-top: 8px;
        display: flex;
      }
      
      .clippy-input-container.collapsed {
        height: 0;
        overflow: hidden;
        margin: 0;
        padding: 0;
        border: none;
      }
      
      .clippy-input {
        flex: 1;
        border: 1px solid #888;
        padding: 3px;
        font-family: 'Tahoma', sans-serif;
        font-size: 12px;
      }
      
      .clippy-toggle-input {
        background: #d4d0c8;
        border: 1px solid #888;
        border-radius: 3px;
        padding: 2px 5px;
        margin-top: 5px;
        font-size: 11px;
        cursor: pointer;
        align-self: flex-end;
      }
    `;
    document.head.appendChild(styleElement);
  }

  // Ensure Clippy stays in fixed position on desktop and handle interactions
  enforceFixedPositionOnDesktop() {
    const clippyElements = document.querySelectorAll(".clippy");
    if (clippyElements.length === 0) {
      setTimeout(this.enforceFixedPositionOnDesktop, 500);
      return;
    }

    const clippyEl = clippyElements[0];

    // Store initial position
    const rect = clippyEl.getBoundingClientRect();
    this.initialClippyPosition = {
      left: rect.left,
      top: rect.top,
    };

    // Prevent dragging by making Clippy itself non-interactive
    clippyEl.style.position = "fixed";
    clippyEl.style.left = `${rect.left}px`;
    clippyEl.style.top = `${rect.top}px`;
    clippyEl.style.cursor = "default";
    clippyEl.style.pointerEvents = "none";
    clippyEl.style.zIndex = "2000";

    // Create a clickable overlay that sits on top of Clippy to handle interactions
    this.clippyOverlay = document.createElement("div");
    this.clippyOverlay.id = "clippy-clickable-overlay";
    this.clippyOverlay.style.position = "fixed";
    this.clippyOverlay.style.left = `${rect.left}px`;
    this.clippyOverlay.style.top = `${rect.top}px`;
    this.clippyOverlay.style.width = `${rect.width}px`;
    this.clippyOverlay.style.height = `${rect.height}px`;
    this.clippyOverlay.style.zIndex = "2001";
    this.clippyOverlay.style.cursor = "pointer";

    // Track clicks to distinguish between single and double clicks
    let clickCount = 0;

    // Click handler with delayed execution
    const handleClick = () => {
      clickCount++;

      // Clear any existing timeout
      if (this.clickTimeout) {
        clearTimeout(this.clickTimeout);
      }

      // Set a new timeout to handle the click after a delay
      this.clickTimeout = setTimeout(() => {
        // Only handle single clicks
        if (clickCount === 1) {
          // We don't do anything for single clicks
        }
        clickCount = 0;
      }, 300);
    };

    // Double-click handler
    const handleDoubleClick = () => {
      // Reset click count to prevent single-click handler from firing
      clickCount = 0;
      if (this.clickTimeout) {
        clearTimeout(this.clickTimeout);
      }

      // Handle double-click with animation then speech with options
      if (window.clippy) {
        // Use animations from content file
        const animsArray = animations.greeting || [
          "Greeting",
          "Wave",
          "Congratulate",
          "GetAttention",
        ];
        const anim = animsArray[Math.floor(Math.random() * animsArray.length)];

        // Play animation first
        window.clippy.play(anim);

        // Then show custom balloon with speech and options
        setTimeout(() => {
          // Pick a random interaction from content file
          const interaction =
            interactions[Math.floor(Math.random() * interactions.length)];
          this.showCustomBalloon(
            interaction.message,
            false,
            interaction.options
          );
        }, 800);
      }
    };

    // Right-click handler for chat
    const handleRightClick = (e) => {
      e.preventDefault(); // Prevent default context menu

      if (window.clippy) {
        window.clippy.play("GetAttention");

        // Show interactive chat balloon
        setTimeout(() => {
          this.showChatBalloon("How can I help you with Windows 98 today?");
        }, 500);
      }
    };

    // Add the event listeners
    this.clippyOverlay.addEventListener("click", handleClick);
    this.clippyOverlay.addEventListener("dblclick", handleDoubleClick);
    this.clippyOverlay.addEventListener("contextmenu", handleRightClick);

    // Add the overlay to the document
    document.body.appendChild(this.clippyOverlay);

    // Set up viewport scaling
    this.setupViewportScaling(clippyEl);

    // Use a simple interval to keep Clippy and the overlay in the right position
    this.clippyFixedInterval = setInterval(() => {
      // Keep Clippy fixed in place
      if (clippyEl) {
        clippyEl.style.position = "fixed";
        clippyEl.style.left = `${this.initialClippyPosition.left}px`;
        clippyEl.style.top = `${this.initialClippyPosition.top}px`;
        clippyEl.style.pointerEvents = "none";
      }

      // Keep the overlay aligned with Clippy
      if (this.clippyOverlay) {
        this.clippyOverlay.style.left = `${this.initialClippyPosition.left}px`;
        this.clippyOverlay.style.top = `${this.initialClippyPosition.top}px`;
      }

      // Reposition any visible balloon
      if (this.customBalloon) {
        this.positionCustomBalloon();
      }
    }, 100);
  }

  // Setup viewport scaling for Clippy
  setupViewportScaling(clippyEl) {
    // Get desktop container
    const desktopElement = document.querySelector(".w98");
    if (!desktopElement) return;

    // Base dimensions to calculate scale from
    const baseWidth = 800; // Your base design width

    // Function to update Clippy's scale based on viewport size
    const updateClippyScale = () => {
      const desktopRect = desktopElement.getBoundingClientRect();
      const scaleFactor = Math.min(
        1.2,
        Math.max(0.7, desktopRect.width / baseWidth)
      );

      // Apply scale transform
      clippyEl.style.transform = `scale(${scaleFactor * 0.9})`;
      clippyEl.style.transformOrigin = "center bottom";

      // Also scale the overlay
      if (this.clippyOverlay) {
        this.clippyOverlay.style.width = `${
          clippyEl.offsetWidth * scaleFactor
        }px`;
        this.clippyOverlay.style.height = `${
          clippyEl.offsetHeight * scaleFactor
        }px`;
      }

      // Reposition any visible balloon to account for new scale
      if (this.customBalloon) {
        this.positionCustomBalloon();
      }
    };

    // Create ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      updateClippyScale();
    });

    // Start observing
    resizeObserver.observe(desktopElement);

    // Initial scale update
    updateClippyScale();
  }

  // Create and show a custom balloon
  showCustomBalloon(message, autoHide = true, options = null) {
    // Remove any existing custom balloon
    this.hideCustomBalloon();

    // Create new balloon
    this.customBalloon = document.createElement("div");
    this.customBalloon.className = "custom-clippy-balloon";

    // Add close button
    const closeBtn = document.createElement("span");
    closeBtn.className = "custom-clippy-balloon-close";
    closeBtn.innerHTML = "×";
    closeBtn.onclick = this.hideCustomBalloon;

    // Add message
    const messageEl = document.createElement("div");
    messageEl.style.paddingRight = "15px"; // Space for close button
    messageEl.innerHTML = message;

    // Add option buttons if provided
    if (options && Array.isArray(options) && options.length > 0) {
      const optionsContainer = document.createElement("div");
      optionsContainer.style.marginTop = "8px";

      options.forEach((option) => {
        const button = document.createElement("button");
        button.className = "clippy-option-button";
        button.innerHTML = option.text;
        button.onclick = () => {
          if (option.action) {
            option.action();
          } else {
            // Default action: show a new message with the selected option
            this.showCustomBalloon(
              `You selected: ${option.text}. ${option.response || ""}`,
              true
            );
          }
        };
        optionsContainer.appendChild(button);
      });

      messageEl.appendChild(optionsContainer);
    }

    // Add toggle button for input
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "clippy-toggle-input";
    toggleBtn.innerHTML = "Ask Clippy...";
    toggleBtn.onclick = () => this.toggleInputArea(); // Ensure correct 'this' binding

    // Create input container (initially collapsed)
    const inputContainer = document.createElement("div");
    inputContainer.className = "clippy-input-container collapsed";

    // Create input field
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.className = "clippy-input";
    inputField.placeholder = "Type your question...";

    // Handle enter key
    inputField.onkeypress = (e) => {
      if (e.key === "Enter") {
        const text = inputField.value.trim();
        if (text) {
          // Show response based on input
          this.processUserInput(text, inputField);
        }
      }
    };

    // Assemble input area
    inputContainer.appendChild(inputField);

    // Assemble balloon
    this.customBalloon.appendChild(closeBtn);
    this.customBalloon.appendChild(messageEl);
    this.customBalloon.appendChild(toggleBtn);
    this.customBalloon.appendChild(inputContainer);
    document.body.appendChild(this.customBalloon);

    // Position the balloon within viewport constraints
    this.positionCustomBalloon();

    // Auto-hide after 5 seconds if requested and there are no options
    if (autoHide && (!options || options.length === 0)) {
      setTimeout(this.hideCustomBalloon, 5000);
    }

    return this.customBalloon;
  }

  // Process user input text
  processUserInput(text, inputField) {
    // Clear the input field
    inputField.value = "";

    // Let's implement an actual response system instead of showing an alert
    // Import chatResponses at the top of the file to use this
    let response =
      "I'm not sure how to help with that. Can you try asking something about Windows 98?"; // Default response

    // Look for keyword matches
    const textLower = text.toLowerCase();

    // Check for common keywords
    if (textLower.includes("hello") || textLower.includes("hi")) {
      response = "Hello there! How can I assist you today?";
    } else if (textLower.includes("help")) {
      response =
        "I'm here to help! What would you like to know about Windows 98?";
    } else if (textLower.includes("file")) {
      response =
        "To manage files, open Windows Explorer from the Start menu or double-click My Computer.";
    } else if (textLower.includes("internet") || textLower.includes("web")) {
      response =
        "You can browse the web using Internet Explorer. Find it in the Start menu!";
    } else if (
      textLower.includes("windows 98") ||
      textLower.includes("windows98")
    ) {
      response =
        "Windows 98 is a graphical operating system by Microsoft, released on June 25, 1998.";
    }

    // Show response with custom balloon
    this.showCustomBalloon(response, true);
  }

  // Hide the custom balloon
  hideCustomBalloon() {
    if (this.customBalloon && this.customBalloon.parentNode) {
      this.customBalloon.parentNode.removeChild(this.customBalloon);
      this.customBalloon = null;
    }
  }

  // Toggle the input area
  toggleInputArea() {
    if (!this.customBalloon) return;

    const inputContainer = this.customBalloon.querySelector(
      ".clippy-input-container"
    );
    if (!inputContainer) return;

    if (inputContainer.classList.contains("collapsed")) {
      // Expand
      inputContainer.classList.remove("collapsed");
      // Focus input
      setTimeout(() => {
        const input = inputContainer.querySelector("input");
        if (input) input.focus();
      }, 100);
    } else {
      // Collapse
      inputContainer.classList.add("collapsed");
    }

    // Reposition after toggle
    this.positionCustomBalloon();
  }

  // Position the custom balloon above Clippy, ensuring it stays within viewport
  positionCustomBalloon() {
    if (!this.customBalloon) return;

    const clippyElement = document.querySelector(".clippy");
    if (!clippyElement) return;

    const clippyRect = clippyElement.getBoundingClientRect();

    // Find the viewport element (the teal desktop area)
    const viewport =
      document.querySelector(".desktop.screen") ||
      document.querySelector(".w98");
    if (!viewport) return;

    const viewportRect = viewport.getBoundingClientRect();

    // Calculate initial position (centered above Clippy)
    let left =
      clippyRect.left +
      clippyRect.width / 2 -
      this.customBalloon.offsetWidth / 2;
    let top = clippyRect.top - this.customBalloon.offsetHeight - 10; // 10px gap

    // Ensure left edge stays within viewport
    if (left < viewportRect.left + 5) {
      left = viewportRect.left + 5;
    }

    // Ensure right edge stays within viewport
    if (left + this.customBalloon.offsetWidth > viewportRect.right - 5) {
      left = viewportRect.right - this.customBalloon.offsetWidth - 5;
    }

    // Ensure top edge stays within viewport
    if (top < viewportRect.top + 5) {
      // If not enough room above Clippy, position to the side instead
      top = clippyRect.top + 5;
      left = clippyRect.right + 10;

      // If still not fitting, try other positions
      if (left + this.customBalloon.offsetWidth > viewportRect.right - 5) {
        left = clippyRect.left - this.customBalloon.offsetWidth - 10;

        // Last resort: put it below
        if (left < viewportRect.left + 5) {
          left = clippyRect.left;
          top = clippyRect.bottom + 10;
        }
      }
    }

    // Apply the position
    this.customBalloon.style.left = `${left}px`;
    this.customBalloon.style.top = `${top}px`;

    // Make sure the balloon is visible
    this.customBalloon.style.visibility = "visible";
    this.customBalloon.style.display = "block";
    this.customBalloon.style.opacity = "1";
  }

  // Create and show a chat interface with options
  showChatBalloon(initialMessage) {
    // Generate some sample options based on the message
    const options = [
      {
        text: "I need help with files",
        response:
          "To manage files, open Windows Explorer from the Start menu or double-click My Computer.",
      },
      {
        text: "How do I use the internet?",
        response:
          "You can browse the web using Internet Explorer. Find it in the Start menu!",
      },
      {
        text: "Tell me about Windows 98",
        response:
          "Windows 98 is a graphical operating system by Microsoft, released on June 25, 1998. It includes many new features like better USB support and Internet Explorer 4.0.",
      },
    ];

    // Show balloon with options
    const balloon = this.showCustomBalloon(initialMessage, false, options);

    // Make sure the balloon is visible
    if (balloon) {
      balloon.style.visibility = "visible";
      balloon.style.display = "block";
      balloon.style.opacity = "1";
    }

    return balloon;
  }

  // Clean up all Clippy resources
  cleanup() {
    // Clear intervals
    if (this.clippyFixedInterval) {
      clearInterval(this.clippyFixedInterval);
      this.clippyFixedInterval = null;
    }

    // Clear timeouts
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }

    // Remove overlay
    if (this.clippyOverlay && this.clippyOverlay.parentNode) {
      this.clippyOverlay.parentNode.removeChild(this.clippyOverlay);
      this.clippyOverlay = null;
    }

    // Remove balloon
    this.hideCustomBalloon();

    // Reset flags
    this.initialMessageShown = false;
    this.isInitialized = false;
  }
}

// Export a singleton instance
const clippyManager = new ClippyManager();
export default clippyManager;
