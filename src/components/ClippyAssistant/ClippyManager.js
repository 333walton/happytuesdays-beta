import { animations, interactions } from "./ClippyContent";
// Import chatResponses when you're ready to use it
// import { chatResponses } from "./ClippyContent";
import { Menu, MenuList, MenuItem, Separator } from "@react95/core";

// Mobile detection
const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
let isPositioningLocked = false;

class ClippyManager {
  constructor() {
    this.rafId = null;
    this.lastUpdateTime = 0;
    this.updateInterval = isMobile ? 1000 : 250; // Less frequent updates on mobile
    this.initialClippyPosition = null;
    this.clippyOverlay = null;
    this.customBalloon = null;
    this.clickTimeout = null;
    this.initialMessageShown = false;
    this.isInitialized = false;
    this._retryCount = 0;

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
    this.removeDuplicateClippys = this.removeDuplicateClippys.bind(this);
  }

  // Initialize Clippy manager
  initialize(ClippyService, isMobile = false) {
    // Check if another Clippy is already running
    if (window._clippyInstanceRunning) {
      console.warn(
        "A Clippy instance is already running, aborting initialization"
      );
      return;
    }

    // Mark this as the running instance
    window._clippyInstanceRunning = true;

    if (this.isInitialized) return;

    // Add global styles
    this.addClippyStyles();

    // Remove any duplicate Clippy instances
    this.removeDuplicateClippys();

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
        try {
          console.log("Playing initial Greeting animation");
          ClippyService.play("Greeting");

          // Add a delay between animation and speech
          setTimeout(() => {
            ClippyService.speak(
              "Welcome to Hydra98! Please enjoy and don't break anything"
            );
            this.initialMessageShown = true;
          }, 800);
        } catch (e) {
          console.error("Error during initial animation/speech:", e);
        }
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
        position: absolute !important;
        top: -1000px !important; /* Position far off-screen to avoid any interaction */
        left: -1000px !important;
        right: auto !important;
        bottom: auto !important;
        transform: none !important;
        transition: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        display: none !important;
        pointer-events: none !important;
        width: 1px !important;
        height: 1px !important;
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
        transform: translateZ(0) scale(0.9) !important;
        backface-visibility: hidden !important;
      }
      
      /* CRITICAL: Ensure animations are visible */
      .clippy-animate,
      .clippy-animate * {
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
        animation: auto !important;
      }
      
      /* Animation fixes from ClippyTS */
      .clippy .maps {
        position: relative !important;
        width: 100% !important;
        height: 100% !important;
      }

      .clippy .map {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        height: 100% !important;
        width: 100% !important;
        display: none !important;
      }

      .clippy .map.animate {
        display: block !important;
      }

      /* SVG animation support */
      .clippy svg,
      .clippy svg * {
        visibility: visible !important;
        opacity: 1 !important;
        display: inline !important;
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
        transform: translateZ(0) !important;
        backface-visibility: hidden !important;
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
      
      /* Mobile optimizations */
      @media (max-width: 768px) {
        .clippy {
          transform: scale(0.8) !important; /* Slightly smaller on mobile */
        }
        
        .custom-clippy-balloon,
        .custom-clippy-chat-balloon {
          font-size: 14px !important; /* Larger text on mobile */
          max-width: 280px !important; /* Wider balloons on mobile */
        }
        
        .clippy-option-button {
          padding: 6px 10px !important; /* Larger touch targets */
          margin: 5px 5px 5px 0 !important;
          min-width: 80px !important;
        }
        
        .custom-clippy-balloon-close {
          padding: 5px 8px !important;
          font-size: 20px !important;
        }
      }
    `;
    document.head.appendChild(styleElement);
  }

  // Remove duplicate Clippy instances
  removeDuplicateClippys() {
    const clippyElements = document.querySelectorAll(".clippy");
    if (clippyElements.length > 1) {
      console.log(
        `Found ${clippyElements.length} Clippy instances - removing duplicates`
      );

      // Keep only the first one (assumed to be the one inside our app container)
      const mainContainer =
        document.querySelector(".w98") ||
        document.querySelector(".desktop.screen");

      // Find which Clippy is inside our container
      let insideClippy = null;
      let outsideClippys = [];

      clippyElements.forEach((clippy) => {
        if (mainContainer && mainContainer.contains(clippy)) {
          insideClippy = clippy;
        } else {
          outsideClippys.push(clippy);
        }
      });

      // If we found an inside Clippy, remove all others
      if (insideClippy) {
        outsideClippys.forEach((clippy) => {
          if (clippy.parentNode) {
            clippy.parentNode.removeChild(clippy);
          }
        });
      }
      // Otherwise, keep only the first one
      else if (clippyElements.length > 1) {
        for (let i = 1; i < clippyElements.length; i++) {
          if (clippyElements[i].parentNode) {
            clippyElements[i].parentNode.removeChild(clippyElements[i]);
          }
        }
      }
    }
  }

  // Ensure Clippy stays in fixed position on desktop and handle interactions
  enforceFixedPositionOnDesktop() {
    // Check if positioning is already being enforced to prevent duplicate enforcement
    if (isPositioningLocked) {
      console.log(
        "Positioning already being enforced, skipping duplicate call"
      );
      return;
    }

    isPositioningLocked = true;

    // Find Clippy but ensure we're getting the one inside our app
    const mainContainer =
      document.querySelector(".desktop.screen") ||
      document.querySelector(".w98");
    let clippyEl = null;

    if (mainContainer) {
      clippyEl = mainContainer.querySelector(".clippy");
    }

    // Fall back to any Clippy if we didn't find one in the container
    if (!clippyEl) {
      const allClippys = document.querySelectorAll(".clippy");
      if (allClippys.length === 0) {
        // Try again later but don't retry excessively
        if (!this._retryCount) this._retryCount = 0;
        this._retryCount++;

        if (this._retryCount < 5) {
          setTimeout(this.enforceFixedPositionOnDesktop, 500);
        }
        return;
      }
      clippyEl = allClippys[0];
    }

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

    // Create overlay if it doesn't exist
    if (!this.clippyOverlay) {
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
          console.log("Double clicked clippy overlay - playing animation");

          // Use animations from content file
          const animsArray = animations.greeting || [
            "Greeting",
            "Wave",
            "Congratulate",
            "GetAttention",
            "Thinking",
            "Writing",
            "Alert",
          ];
          const anim =
            animsArray[Math.floor(Math.random() * animsArray.length)];

          // Force the clippy element to be visible - target the one inside our container
          const mainContainer =
            document.querySelector(".desktop.screen") ||
            document.querySelector(".w98");
          const clippyEl = mainContainer
            ? mainContainer.querySelector(".clippy")
            : document.querySelector(".clippy");

          if (clippyEl) {
            clippyEl.style.visibility = "visible";
            clippyEl.style.opacity = "1";
            clippyEl.style.display = "block";
          }

          // Temporarily unlock positioning to ensure animations work properly
          const wasPositionLocked = window._clippyPositionLocked;
          if (wasPositionLocked) {
            window._clippyPositionLocked = false;
          }

          // Play animation first with a slight delay to ensure visibility
          setTimeout(() => {
            try {
              window.clippy.play(anim);
              console.log(`Animation started: ${anim}`);
            } catch (e) {
              console.error(`Error playing animation: ${anim}`, e);
            }

            // Re-lock position after a delay to let animation complete
            if (wasPositionLocked) {
              setTimeout(() => {
                window._clippyPositionLocked = true;
              }, 2000); // Allow 2 seconds for animation to complete
            }

            // Track double-click count using a global variable
            if (!window._clippyDoubleClickCount) {
              window._clippyDoubleClickCount = 0;
            }

            // Increment counter
            window._clippyDoubleClickCount =
              (window._clippyDoubleClickCount + 1) % 3;

            // Only show speech bubble on every 3rd double-click
            if (window._clippyDoubleClickCount === 0) {
              // Then show custom balloon with speech and options after animation
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
          }, 50);
        }
      };

      // Right-click handler for context menu with proper positioning and behavior
      const handleRightClick = (e) => {
        e.preventDefault(); // Prevent default context menu

        // First, hide any existing menus or balloons
        if (this.customBalloon && this.customBalloon.parentNode) {
          this.customBalloon.parentNode.removeChild(this.customBalloon);
          this.customBalloon = null;
        }

        // Define createDOMMenu within handleRightClick's scope to avoid the undefined error
        const createDOMMenu = (event) => {
          // Simple DOM-based menu as fallback
          const menuEl = document.createElement("div");
          menuEl.style.position = "fixed";
          menuEl.style.left = `${event.clientX}px`;
          menuEl.style.top = `${event.clientY}px`;
          menuEl.style.backgroundColor = "#c0c0c0";
          menuEl.style.border = "2px solid";
          menuEl.style.borderColor = "#ffffff #808080 #808080 #ffffff";
          menuEl.style.padding = "1px";
          menuEl.style.zIndex = "9999";
          menuEl.style.fontFamily = "'MS Sans Serif', sans-serif";
          menuEl.style.fontSize = "11px";

          // Create menu items
          const createMenuItem = (text, onClick) => {
            const item = document.createElement("div");
            item.innerText = text;
            item.style.padding = "1px 8px";
            item.style.cursor = "default";
            item.style.whiteSpace = "nowrap";

            item.addEventListener("mouseover", () => {
              item.style.backgroundColor = "#000080";
              item.style.color = "white";
            });

            item.addEventListener("mouseout", () => {
              item.style.backgroundColor = "";
              item.style.color = "black";
            });

            if (onClick) {
              item.addEventListener("click", () => {
                onClick();
                document.body.removeChild(menuEl);
              });
            }

            menuEl.appendChild(item);
            return item;
          };

          createMenuItem("Hide Assistant", () => {
            if (window.setAssistantVisible) {
              window.setAssistantVisible(false);
            }
          });

          // Add separator
          const separator = document.createElement("div");
          separator.style.height = "1px";
          separator.style.margin = "1px 0";
          separator.style.backgroundColor = "#808080";
          separator.style.borderBottom = "1px solid #ffffff";
          menuEl.appendChild(separator);

          // Add more items...
          createMenuItem("About", () => {
            const currentAgent = window.currentAgent || "Clippy";
            const message = `I'm ${currentAgent}, ready to help!`;
            if (window.showClippyCustomBalloon) {
              window.showClippyCustomBalloon(message);
            }
          });

          document.body.appendChild(menuEl);

          // Close when clicking outside
          document.addEventListener(
            "mousedown",
            function handleOutsideClick(evt) {
              if (!menuEl.contains(evt.target)) {
                if (menuEl.parentNode) {
                  menuEl.parentNode.removeChild(menuEl);
                }
                document.removeEventListener("mousedown", handleOutsideClick);
              }
            }
          );
        };

        try {
          // Dynamically import the required components
          import("react95")
            .then((React95) => {
              const { MenuList, MenuListItem, Separator } = React95;

              // Import React and ReactDOM
              const React = window.React || require("react");
              const ReactDOM = window.ReactDOM || require("react-dom");

              if (!React || !ReactDOM) {
                console.error("React or ReactDOM not available");
                return;
              }

              // Create a container for the menu
              let menuContainer = document.getElementById(
                "clippy-context-menu"
              );
              if (menuContainer) {
                ReactDOM.unmountComponentAtNode(menuContainer);
                menuContainer.parentNode.removeChild(menuContainer);
              }

              // Check if the menu would go outside the viewport and adjust position
              const viewportWidth = window.innerWidth;
              const viewportHeight = window.innerHeight;

              let menuX = e.clientX;
              let menuY = e.clientY;

              // Estimate menu dimensions
              const menuWidth = 150;
              const menuHeight = 150;

              // Adjust position if needed to stay in viewport
              if (menuX + menuWidth > viewportWidth) {
                menuX = viewportWidth - menuWidth - 10;
              }

              if (menuY + menuHeight > viewportHeight) {
                menuY = viewportHeight - menuHeight - 10;
              }

              menuContainer = document.createElement("div");
              menuContainer.id = "clippy-context-menu";
              menuContainer.style.position = "fixed";
              menuContainer.style.left = `${menuX}px`;
              menuContainer.style.top = `${menuY}px`;
              menuContainer.style.zIndex = "9999";
              menuContainer.style.transform = "scale(0.86)";
              menuContainer.style.transformOrigin = "top left";
              document.body.appendChild(menuContainer);

              // Add a style element for Windows 98 styling
              const styleEl = document.createElement("style");
              styleEl.textContent = `
        .react95-MenuList {
          background-color: #c0c0c0 !important;
          border: 4px solid !important;
          border-color: #ffffff #808080 #808080 #ffffff !important;
          box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.3) !important;
          padding: 4px !important;
          font-family: 'MS Sans Serif', sans-serif !important;
          font-size: 11px !important;
          min-width: 130px !important;
          color: black !important;
        }
        
        .react95-MenuListItem {
          padding: 2px 12px !important;
          height: 18px !important;
          line-height: 25px !important;
          cursor: default !important;
          display: flex !important;
          align-items: center !important;
          position: relative !important;
          color: black !important;
          padding-right: 18px !important;
        }
        
        .react95-MenuListItem:hover {
          background-color: #000080 !important;
          color: white !important;
        }
        
        .react95-MenuListItem:hover * {
          color: white !important;
        }
        
        .react95-Separator {
          height: 2px !important;
          margin: 1px 0 !important;
          background-color: #808080 !important;
          border-bottom: 1px solid #ffffff !important;
        }
        
        .submenu {
          box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4) !important;
          position: absolute !important;
          display: none !important;
        }
        
        .submenu-arrow {
          position: absolute;
          right: 2px;
          padding: 2px;
          font-size: 9px;
        }
        
        .checkmark {
          display: inline-block;
          width: 10px;
          margin-right: 4px;
          font-weight: bold;
        }
        
        .showOnHover:hover .submenu {
          display: block !important;
        }
      `;
              document.head.appendChild(styleEl);

              // Get current agent
              const currentAgent = window.currentAgent || "Clippy";

              // Helper function for playing animations
              const playAnimation = (animation) => {
                if (window.clippy && window.clippy.play) {
                  const wasPositionLocked = window._clippyPositionLocked;
                  if (wasPositionLocked) window._clippyPositionLocked = false;

                  window.clippy.play(animation);

                  if (wasPositionLocked) {
                    setTimeout(() => {
                      window._clippyPositionLocked = true;
                    }, 2000);
                  }
                }
              };

              // Create the About function
              const handleAbout = () => {
                const aboutMessages = {
                  Clippy:
                    "Hi, I'm Clippy! I'm here to help you with Windows 98. I was created by Microsoft as an Office Assistant in 1997.",
                  Links:
                    "Hi, I'm Links the cat! I'm here to help you with Windows 98. I was one of Microsoft's Office Assistants.",
                  Bonzi:
                    "Hi, I'm Bonzi! I'm a friendly purple gorilla here to help you with Windows 98.",
                  Genie:
                    "Hi, I'm Genie! I'm here to grant your Windows 98 wishes and help you navigate the system.",
                  Merlin:
                    "Greetings, I'm Merlin the Wizard! I use my magic to help you navigate Windows 98.",
                  Rover:
                    "Woof! I'm Rover, the friendly dog assistant. I'll help you find your way around Windows 98!",
                };

                const message =
                  aboutMessages[currentAgent] ||
                  "I'm your Windows 98 assistant, ready to help you navigate the system!";

                if (window.showClippyCustomBalloon) {
                  window.showClippyCustomBalloon(message);
                }
              };

              // Create the menu component
              class ClippyContextMenu extends React.Component {
                // Use state to track which submenu is open
                constructor(props) {
                  super(props);
                  this.state = {
                    activeSubmenu: null,
                  };
                }

                // Function to close the menu
                closeMenu = () => {
                  ReactDOM.unmountComponentAtNode(menuContainer);
                  if (menuContainer.parentNode) {
                    menuContainer.parentNode.removeChild(menuContainer);
                  }
                  if (styleEl.parentNode) {
                    styleEl.parentNode.removeChild(styleEl);
                  }
                };

                render() {
                  // Windows 98 menu styling
                  const menuListStyle = {
                    backgroundColor: "#c0c0c0",
                    border: "2px solid",
                    borderColor: "#ffffff #808080 #808080 #ffffff",
                    boxShadow: "2px 2px 3px rgba(0, 0, 0, 0.3)",
                    padding: "1px",
                    fontFamily: "'MS Sans Serif', sans-serif",
                    fontSize: "11px",
                    minWidth: "120px",
                    color: "black",
                  };

                  const menuItemStyle = {
                    padding: "1px 8px",
                    height: "18px",
                    lineHeight: "18px",
                    cursor: "default",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    color: "black",
                  };

                  const submenuLeftStyle = {
                    ...menuListStyle,
                    position: "absolute",
                    right: "100%",
                    top: "0",
                    marginRight: "0",
                    boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.4)",
                    display: "none",
                  };

                  const submenuRightStyle = {
                    ...menuListStyle,
                    position: "absolute",
                    left: "100%",
                    top: "0",
                    marginLeft: "0",
                    boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.4)",
                    display: "none",
                  };

                  const separatorStyle = {
                    height: "1px",
                    margin: "1px 0",
                    backgroundColor: "#808080",
                    borderBottom: "1px solid #ffffff",
                  };

                  // Define a list of agents and animations
                  const agents = [
                    "Clippy",
                    "Links",
                    "Bonzi",
                    "Genie",
                    "Merlin",
                    "Rover",
                  ];
                  const animations = [
                    "Greeting",
                    "Wave",
                    "GetAttention",
                    "Thinking",
                    "Writing",
                  ];

                  // Check if submenus should be on the left
                  const viewportWidth = window.innerWidth;
                  const menuRect = menuContainer.getBoundingClientRect();
                  const useLeftSubmenu = menuRect.right + 150 > viewportWidth;

                  return React.createElement(
                    MenuList,
                    { style: menuListStyle, className: "react95-MenuList" },

                    // Hide Assistant
                    React.createElement(
                      MenuListItem,
                      {
                        onClick: () => {
                          if (window.setAssistantVisible) {
                            window.setAssistantVisible(false);
                          }
                          this.closeMenu();
                        },
                        style: menuItemStyle,
                        className: "react95-MenuListItem",
                      },
                      "Hide Assistant"
                    ),

                    // Select Assistant submenu
                    React.createElement(
                      "div",
                      { className: "showOnHover" },
                      React.createElement(
                        MenuListItem,
                        {
                          style: menuItemStyle,
                          className: "react95-MenuListItem",
                        },
                        "Select Assistant",
                        // Submenu arrow
                        React.createElement(
                          "span",
                          { className: "submenu-arrow" },
                          useLeftSubmenu ? "◀" : "▶"
                        )
                      ),
                      React.createElement(
                        MenuList,
                        {
                          style: useLeftSubmenu
                            ? submenuLeftStyle
                            : submenuRightStyle,
                          className: "react95-MenuList submenu",
                        },
                        agents.map((agent) =>
                          React.createElement(
                            MenuListItem,
                            {
                              key: agent,
                              onClick: () => {
                                if (window.setCurrentAgent) {
                                  window.setCurrentAgent(agent);
                                }
                                this.closeMenu();
                              },
                              style: menuItemStyle,
                              className: "react95-MenuListItem",
                            },
                            agent === currentAgent
                              ? React.createElement(
                                  "span",
                                  { className: "checkmark" },
                                  "✓"
                                )
                              : React.createElement(
                                  "span",
                                  { className: "checkmark" },
                                  " "
                                ),
                            agent
                          )
                        )
                      )
                    ),

                    // Play Animation submenu
                    React.createElement(
                      "div",
                      { className: "showOnHover" },
                      React.createElement(
                        MenuListItem,
                        {
                          style: menuItemStyle,
                          className: "react95-MenuListItem",
                        },
                        "Play Animation",
                        // Submenu arrow
                        React.createElement(
                          "span",
                          { className: "submenu-arrow" },
                          useLeftSubmenu ? "◀" : "▶"
                        )
                      ),
                      React.createElement(
                        MenuList,
                        {
                          style: useLeftSubmenu
                            ? submenuLeftStyle
                            : submenuRightStyle,
                          className: "react95-MenuList submenu",
                        },
                        animations.map((anim) =>
                          React.createElement(
                            MenuListItem,
                            {
                              key: anim,
                              onClick: () => {
                                playAnimation(anim);
                                this.closeMenu();
                              },
                              style: menuItemStyle,
                              className: "react95-MenuListItem",
                            },
                            anim
                          )
                        )
                      )
                    ),

                    // Separator
                    React.createElement("div", {
                      style: separatorStyle,
                      className: "react95-Separator",
                    }),

                    // About
                    React.createElement(
                      MenuListItem,
                      {
                        onClick: () => {
                          handleAbout();
                          this.closeMenu();
                        },
                        style: menuItemStyle,
                        className: "react95-MenuListItem",
                      },
                      "About"
                    )
                  );
                }
              }

              // Render the menu
              ReactDOM.render(
                React.createElement(ClippyContextMenu),
                menuContainer
              );

              // Close menu when clicking outside
              document.addEventListener(
                "mousedown",
                function handleClickOutside(event) {
                  const container = document.getElementById(
                    "clippy-context-menu"
                  );
                  if (container && !container.contains(event.target)) {
                    ReactDOM.unmountComponentAtNode(container);
                    if (container.parentNode) {
                      container.parentNode.removeChild(container);
                    }
                    if (styleEl.parentNode) {
                      styleEl.parentNode.removeChild(styleEl);
                    }
                    document.removeEventListener(
                      "mousedown",
                      handleClickOutside
                    );
                  }
                }
              );
            })
            .catch((error) => {
              console.error("Error importing React95 components:", error);
              // Fallback to the simple DOM menu
              createDOMMenu(e);
            });
        } catch (error) {
          console.error("Error creating context menu:", error);
          // Fallback to the simple DOM menu
          createDOMMenu(e);
        }
      };
      // Add the event listeners
      this.clippyOverlay.addEventListener("click", handleClick);
      this.clippyOverlay.addEventListener("dblclick", handleDoubleClick);
      this.clippyOverlay.addEventListener("contextmenu", handleRightClick);

      // Add the overlay to the document
      document.body.appendChild(this.clippyOverlay);
    }

    // Set up viewport scaling
    this.setupViewportScaling(clippyEl);

    // Cancel any existing animation frame
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    // Store timing variables with better throttling for mobile
    this.lastUpdateTime = 0;

    // Flag to track if we're already updating position
    let isUpdatingPosition = false;

    // Set a global position lock to prevent ClippyController from also updating position
    // This prevents the two positioning systems from fighting with each other
    window._clippyPositionLocked = true;

    const updateFrame = (timestamp) => {
      // Only update if sufficient time has passed and we're not already updating
      if (
        !isUpdatingPosition &&
        timestamp - this.lastUpdateTime >= this.updateInterval
      ) {
        isUpdatingPosition = true;

        try {
          // Keep Clippy fixed in place
          if (clippyEl && this.initialClippyPosition) {
            clippyEl.style.position = "fixed";
            clippyEl.style.left = `${this.initialClippyPosition.left}px`;
            clippyEl.style.top = `${this.initialClippyPosition.top}px`;
            clippyEl.style.pointerEvents = "none";
          }

          // Keep the overlay aligned with Clippy
          if (this.clippyOverlay && this.initialClippyPosition) {
            this.clippyOverlay.style.left = `${this.initialClippyPosition.left}px`;
            this.clippyOverlay.style.top = `${this.initialClippyPosition.top}px`;
          }

          // Reposition any visible balloon
          if (this.customBalloon) {
            this.positionCustomBalloon();
          }
        } catch (e) {
          console.error("Error updating Clippy position:", e);
        } finally {
          isUpdatingPosition = false;
          this.lastUpdateTime = timestamp;
        }
      }

      this.rafId = requestAnimationFrame(updateFrame);
    };

    this.rafId = requestAnimationFrame(updateFrame);

    // Store reference for global cleanup
    if (!window._clippyAnimationFrames) {
      window._clippyAnimationFrames = [];
    }
    window._clippyAnimationFrames.push(this.rafId);
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
      clippyEl.style.transform = `scale(${scaleFactor * 1})`;
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
    const resizeObserver = new ResizeObserver(() => {
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
    toggleBtn.onclick = this.toggleInputArea;

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
      "I'm not sure how to help with that. Can you try asking something about Hydra 98?"; // response

    // Look for keyword matches
    const textLower = text.toLowerCase();

    // Check for common keywords
    if (textLower.includes("hello") || textLower.includes("hi")) {
      response = "Hello there! How can I assist you today?";
    } else if (textLower.includes("help")) {
      response =
        "I'm here to help! What would you like to know about Hydra 98?";
    } else if (textLower.includes("file")) {
      response =
        "To manage files, open Hydra Explorer from the Start menu or double-click My Computer.";
    } else if (textLower.includes("internet") || textLower.includes("web")) {
      response =
        "You can browse the web using Internet Explorer. Find it in the Start menu!";
    } else if (
      textLower.includes("hydra 98") ||
      textLower.includes("hydra98")
    ) {
      response =
        "Hydra 98 is a Windows 98-themed web application that recreates the classic desktop experience in your browser.";
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
          "To manage files, open Hydra Explorer from the Start menu or double-click My Computer.",
      },
      {
        text: "How do I use the internet?",
        response:
          "You can browse the web using Internet Explorer. Find it in the Start menu!",
      },
      {
        text: "Tell me about Hydra 98",
        response:
          "Hydra 98 is a web-based Windows 98 experience built with React. It recreates the classic desktop experience in your browser.",
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
    // Cancel animation frame if running
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;

      // Remove from global list
      if (window._clippyAnimationFrames) {
        window._clippyAnimationFrames = window._clippyAnimationFrames.filter(
          (id) => id !== this.rafId
        );
      }
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

    // Find all Clippy instances and remove them
    const allClippys = document.querySelectorAll(".clippy");
    allClippys.forEach((clippy) => {
      if (clippy.parentNode) {
        clippy.parentNode.removeChild(clippy);
      }
    });

    // Remove any clippy overlays
    const overlays = document.querySelectorAll("#clippy-clickable-overlay");
    overlays.forEach((overlay) => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    });

    // Reset position lock
    isPositioningLocked = false;
    window._clippyPositionLocked = false;

    // Clear marker of running instance
    delete window._clippyInstanceRunning;

    // Reset flags
    this.initialMessageShown = false;
    this.isInitialized = false;
    this._retryCount = 0;
  }
}

// Export a singleton instance
const clippyManager = new ClippyManager();
export default clippyManager;
