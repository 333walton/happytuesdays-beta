import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  useClippy,
  ClippyProvider as ReactClippyProvider,
} from "@react95/clippy";

import CustomBalloon from "./CustomBalloon";
import ChatBalloon from "./ChatBalloon";
import ClippyContextMenu from "./ClippyContextMenu";
import ClippyPositioning from "./ClippyPositioning";
import ClippyService from "./ClippyService";
import MobileControls from "./MobileControls";
import "./_styles.scss";

const ClippyContext = createContext(null);

// Device detection
const detectMobile = () => {
  try {
    if (typeof window === "undefined") return false;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent) || window.innerWidth < 768;
  } catch (error) {
    return false;
  }
};

const isMobile = detectMobile();

// Development logging
const isDev = process.env.NODE_ENV === 'development';
const devLog = (message, ...args) => {
  if (isDev) {
    console.log(`🎛️ ClippyProvider: ${message}`, ...args);
  }
};

// Safe execution wrapper
const safeExecute = (operation, fallback = null, context = "operation") => {
  try {
    return operation();
  } catch (error) {
    if (isDev) {
      console.warn(`ClippyProvider error in ${context}:`, error);
    }
    return fallback;
  }
};

// FIXED: Greeting animations array
const GREETING_ANIMATIONS = ["Greeting", "Wave", "GetAttention"];

// FIXED: Simplified ClippyController with proper interaction handlers
const FixedClippyController = ({
  visible,
  isScreenPoweredOn,
  position,
  clippyInstanceRef,
  overlayRef,
  getCustomPosition,
  resizeHandlingActiveRef,
  positionLocked,
  isDragging,
  playInitialGreeting,
  startupComplete,
  handleInteraction,
  handleLongPress,
  handleRightClick,
  showContextMenu,
  hideContextMenu,
}) => {
  const { clippy } = useClippy();
  const rafRef = useRef(null);
  const mountedRef = useRef(false);
  const setupAttemptRef = useRef(0);

  // Mobile drag state
  const dragStateRef = useRef({
    startX: 0,
    startY: 0,
    origRightPx: 0,
    origBottomPx: 0,
    longPressTimer: null,
    dragStarted: false,
    lastInteraction: 0,
  });

  // Cooldown system
  const COOLDOWN_DURATION = 1500;

  const isInCooldown = useCallback(() => {
    const now = Date.now();
    return now - dragStateRef.current.lastInteraction < COOLDOWN_DURATION;
  }, []);

  const startCooldown = useCallback(() => {
    dragStateRef.current.lastInteraction = Date.now();
  }, []);

  // FIXED: Mobile touch handlers with proper interaction routing
  const createMobileTouchHandlers = useCallback(() => {
    let moveHandler = null;
    let endHandler = null;

    const handleTouchStart = (e) => {
      if (!mountedRef.current) return;

      const touch = e.touches[0];
      const dragState = dragStateRef.current;

      dragState.startX = touch.clientX;
      dragState.startY = touch.clientY;
      dragState.dragStarted = false;

      // Get current Clippy position for dragging
      if (!positionLocked) {
        const clippyEl = document.querySelector('.clippy');
        if (clippyEl) {
          const rect = clippyEl.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          dragState.origRightPx = viewportWidth - rect.right;
          dragState.origBottomPx = viewportHeight - rect.bottom;
        }
      }

      // Create move handler
      moveHandler = (e) => {
        if (!mountedRef.current || positionLocked) return;

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - dragState.startX);
        const deltaY = Math.abs(touch.clientY - dragState.startY);

        // Start drag when threshold crossed
        if (!dragState.dragStarted && (deltaX > 10 || deltaY > 10)) {
          clearTimeout(dragState.longPressTimer);
          dragState.dragStarted = true;
          
          e.preventDefault();
          
          if (window.setClippyDragging) {
            window.setClippyDragging(true);
          }
        }

        if (dragState.dragStarted) {
          e.preventDefault();
          
          const totalDeltaX = touch.clientX - dragState.startX;
          const totalDeltaY = touch.clientY - dragState.startY;

          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          // Calculate new position
          const newRightPx = Math.max(
            10,
            Math.min(
              viewportWidth - 70,
              dragState.origRightPx - totalDeltaX
            )
          );

          const newBottomPx = Math.max(
            90,
            Math.min(
              viewportHeight - 90,
              dragState.origBottomPx - totalDeltaY
            )
          );

          // Apply position directly for maximum performance
          const clippyEl = document.querySelector('.clippy');
          if (clippyEl) {
            clippyEl.style.position = 'fixed';
            clippyEl.style.right = `${newRightPx}px`;
            clippyEl.style.bottom = `${newBottomPx}px`;
            clippyEl.style.left = 'auto';
            clippyEl.style.top = 'auto';
            clippyEl.style.transform = 'translateZ(0) scale(1.05)';
            clippyEl.style.zIndex = '1550';
            clippyEl.style.transition = 'none';

            // Sync overlay
            if (overlayRef.current) {
              overlayRef.current.style.position = 'fixed';
              overlayRef.current.style.right = `${newRightPx}px`;
              overlayRef.current.style.bottom = `${newBottomPx}px`;
              overlayRef.current.style.left = 'auto';
              overlayRef.current.style.top = 'auto';
            }
          }
        }
      };

      // Create end handler
      endHandler = (e) => {
        const dragState = dragStateRef.current;

        // Clean up event listeners
        if (moveHandler) {
          document.removeEventListener('touchmove', moveHandler);
        }
        if (endHandler) {
          document.removeEventListener('touchend', endHandler);
          document.removeEventListener('touchcancel', endHandler);
        }

        clearTimeout(dragState.longPressTimer);

        if (!dragState.dragStarted) {
          // FIXED: Route to proper interaction handler
          if (isInCooldown()) return;
          startCooldown();
          handleInteraction(e, "tap");
        } else {
          // End drag mode
          const clippyEl = document.querySelector('.clippy');
          if (clippyEl) {
            clippyEl.style.transform = 'translateZ(0) scale(0.8)';
            clippyEl.style.zIndex = '1500';
            clippyEl.style.transition = '';
          }

          setTimeout(() => {
            if (window.setClippyDragging) {
              window.setClippyDragging(false);
            }
          }, 100);
        }

        dragState.dragStarted = false;
      };

      // FIXED: Set up long-press timer with proper handler routing
      if (!positionLocked) {
        dragState.longPressTimer = setTimeout(() => {
          if (!dragState.dragStarted && mountedRef.current) {
            if (isInCooldown()) return;
            startCooldown();
            handleLongPress(e);
          }
        }, 800);
      } else {
        // Show lock message for locked position
        dragState.longPressTimer = setTimeout(() => {
          if (!dragState.dragStarted && mountedRef.current) {
            if (isInCooldown()) return;
            startCooldown();
            
            if (clippy?.play) {
              clippy.play("Greeting");
              setTimeout(() => {
                if (window.showClippyCustomBalloon && mountedRef.current) {
                  window.showClippyCustomBalloon("Position is locked! Unlock to drag me around.");
                }
              }, 800);
            }
          }
        }, 400);
      }

      // Add event listeners
      document.addEventListener('touchmove', moveHandler, { passive: false });
      document.addEventListener('touchend', endHandler, { passive: false });
      document.addEventListener('touchcancel', endHandler, { passive: false });
    };

    return {
      handleTouchStart,
      cleanup: () => {
        if (moveHandler) {
          document.removeEventListener('touchmove', moveHandler);
        }
        if (endHandler) {
          document.removeEventListener('touchend', endHandler);
          document.removeEventListener('touchcancel', endHandler);
        }
        clearTimeout(dragStateRef.current.longPressTimer);
      }
    };
  }, [handleInteraction, handleLongPress, isInCooldown, startCooldown, positionLocked, clippy]);

  // FIXED: Desktop interaction with proper handler routing
  const handleDesktopInteraction = useCallback((e) => {
    if (isInCooldown()) return;
    startCooldown();
    return handleInteraction(e, "double-click");
  }, [handleInteraction, isInCooldown, startCooldown]);

  // Main setup effect
  useEffect(() => {
    if (!clippy || !visible) return;

    mountedRef.current = true; // FIXED: Set mounted FIRST
    clippyInstanceRef.current = clippy;
    window.clippy = clippy;
    
    devLog("ClippyController mounted with clippy instance");

    const setupClippy = () => {
  if (!mountedRef.current) {
    devLog("Setup aborted - component not mounted");
    return false;
  }

  if (setupAttemptRef.current >= 3) {
    devLog("Setup aborted - max attempts reached");
    return false;
  }

  setupAttemptRef.current++;
  devLog(`Clippy setup attempt ${setupAttemptRef.current}`);

  return safeExecute(() => {
    const clippyEl = document.querySelector(".clippy");
    if (!clippyEl) {
      devLog("Setup failed - no clippy element found");
      return false;
    }

    devLog("Clippy element found, proceeding with setup");

    // FIXED: Better positioning logic with error handling
    const setupInitialPositioning = () => {
      try {
        const initialZoomLevel = parseInt(document.body.getAttribute("data-zoom")) || 0;
        devLog(`Setting up positioning with zoom level: ${initialZoomLevel}`);
        
        if (isMobile) {
          if (ClippyPositioning?.calculateEnhancedMobilePosition && ClippyPositioning?.applyMobilePosition) {
            const mobilePosition = ClippyPositioning.calculateEnhancedMobilePosition();
            devLog("Applying mobile position:", mobilePosition);
            return ClippyPositioning.applyMobilePosition(clippyEl, mobilePosition, false);
          } else {
            devLog("Mobile positioning functions not available, using fallback");
            // Mobile fallback positioning
            clippyEl.style.position = 'fixed';
            clippyEl.style.right = '20px';
            clippyEl.style.bottom = '100px';
            clippyEl.style.left = 'auto';
            clippyEl.style.top = 'auto';
            return true;
          }
        } else {
          if (ClippyPositioning?.forceImmediateZoomPositioning) {
            devLog("Using zoom positioning");
            return ClippyPositioning.forceImmediateZoomPositioning(clippyEl, initialZoomLevel);
          } else if (ClippyPositioning?.positionClippy) {
            devLog("Using standard positioning");
            return ClippyPositioning.positionClippy(clippyEl, null);
          } else {
            devLog("No positioning functions available, using fallback");
            // Desktop fallback positioning
            clippyEl.style.position = 'fixed';
            clippyEl.style.right = '50px';
            clippyEl.style.bottom = '50px';
            clippyEl.style.left = 'auto';
            clippyEl.style.top = 'auto';
            return true;
          }
        }
      } catch (positionError) {
        devLog("Positioning error:", positionError);
        // Fallback positioning
        clippyEl.style.position = 'fixed';
        clippyEl.style.right = isMobile ? '20px' : '50px';
        clippyEl.style.bottom = isMobile ? '100px' : '50px';
        clippyEl.style.left = 'auto';
        clippyEl.style.top = 'auto';
        return true;
      }
    };

    const positionSuccess = setupInitialPositioning();
    devLog(`Positioning success: ${positionSuccess}`);

    // FIXED: Set visibility with safety checks
    const visibilityStyles = {
      visibility: isScreenPoweredOn ? "visible" : "hidden",
      opacity: isScreenPoweredOn ? "1" : "0",
      pointerEvents: "auto",
      display: "block", // FIXED: Ensure display is not none
    };

    try {
      if (ClippyPositioning?.applyStyles) {
        ClippyPositioning.applyStyles(clippyEl, visibilityStyles);
      } else {
        // Manual style application
        Object.assign(clippyEl.style, visibilityStyles);
      }
      devLog("Visibility styles applied");
    } catch (styleError) {
      devLog("Style application error:", styleError);
      // Fallback manual style application
      clippyEl.style.visibility = isScreenPoweredOn ? "visible" : "hidden";
      clippyEl.style.opacity = isScreenPoweredOn ? "1" : "0";
      clippyEl.style.pointerEvents = "auto";
      clippyEl.style.display = "block";
    }

    // FIXED: Setup overlay with better error handling
    if (!overlayRef.current && mountedRef.current) {
      try {
        devLog("Creating overlay element");
        const overlay = document.createElement("div");
        overlay.id = "clippy-clickable-overlay";
        
        // FIXED: Ensure overlay has proper styles
        overlay.style.pointerEvents = "auto";
        overlay.style.cursor = "pointer";
        overlay.style.background = "transparent";
        overlay.style.position = "fixed";
        overlay.style.zIndex = "1500";

        // FIXED: Mobile and desktop interaction setup with error handling
        if (isMobile) {
          const handlers = createMobileTouchHandlers();
          if (handlers && handlers.handleTouchStart) {
            overlay.addEventListener('touchstart', handlers.handleTouchStart, { passive: false });
            overlay._cleanupHandlers = handlers.cleanup;
            devLog("Mobile touch handlers attached");
          } else {
            devLog("Warning: Mobile handlers not available");
          }
        } else {
          // FIXED: Desktop interactions with proper handlers
          overlay.addEventListener("dblclick", (e) => {
            devLog("Overlay double-click detected");
            handleDesktopInteraction(e);
          });
          overlay.addEventListener("contextmenu", (e) => {
            devLog("Overlay right-click detected");
            handleRightClick(e);
          });
          devLog("Desktop event handlers attached");
        }

        overlayRef.current = overlay;
        document.body.appendChild(overlay);
        devLog("Overlay created and added to DOM");
      } catch (overlayError) {
        devLog("Overlay creation error:", overlayError);
        // Continue without overlay - direct interaction with clippy element
      }
    }

    // FIXED: Synchronized positioning with error handling
    try {
      if (ClippyPositioning?.positionClippyAndOverlay) {
        ClippyPositioning.positionClippyAndOverlay(clippyEl, overlayRef.current, null);
        devLog("Synchronized positioning applied");
      } else if (overlayRef.current) {
        // Manual overlay positioning
        const clippyRect = clippyEl.getBoundingClientRect();
        const overlay = overlayRef.current;
        overlay.style.left = clippyRect.left + 'px';
        overlay.style.top = clippyRect.top + 'px';
        overlay.style.width = clippyRect.width + 'px';
        overlay.style.height = clippyRect.height + 'px';
        devLog("Manual overlay positioning applied");
      }
    } catch (syncError) {
      devLog("Positioning sync error:", syncError);
    }

    // Set overlay visibility
    if (overlayRef.current) {
      try {
        if (ClippyPositioning?.applyStyles) {
          ClippyPositioning.applyStyles(overlayRef.current, {
            visibility: isScreenPoweredOn ? "visible" : "hidden",
            pointerEvents: "auto",
          });
        } else {
          overlayRef.current.style.visibility = isScreenPoweredOn ? "visible" : "hidden";
          overlayRef.current.style.pointerEvents = "auto";
        }
        devLog("Overlay visibility set");
      } catch (overlayStyleError) {
        devLog("Overlay style error:", overlayStyleError);
      }
    }

    // FIXED: Start resize handling with better error checking
    if (!resizeHandlingActiveRef.current && clippyEl) {
      try {
        if (ClippyPositioning?.startResizeHandling) {
          const resizeStarted = ClippyPositioning.startResizeHandling(
            clippyEl,
            overlayRef.current,
            getCustomPosition
          );

          if (resizeStarted) {
            resizeHandlingActiveRef.current = true;
            devLog("Resize handling started successfully");
          } else {
            devLog("Resize handling failed to start");
          }
        } else {
          devLog("Resize handling function not available");
        }
      } catch (resizeError) {
        devLog("Resize handling error:", resizeError);
      }
    }

    devLog("Setup completed successfully");
    return true;

  }, false, "clippy setup");
};

    // Initial setup with retry logic
    let setupSuccess = false;
    for (let i = 0; i < 3 && !setupSuccess; i++) {
      setupSuccess = setupClippy();
      if (!setupSuccess && isDev) {
        console.warn(`Clippy setup attempt ${i + 1} failed, retrying...`);
      }
    }

    if (setupSuccess) {
      const updateInterval = isMobile ? 3000 : 2000;
      let lastUpdateTime = 0;
      
      const updateLoop = (timestamp) => {
        if (!mountedRef.current) return;

        if (timestamp - lastUpdateTime > updateInterval) {
          setupClippy();
          lastUpdateTime = timestamp;
        }

        rafRef.current = requestAnimationFrame(updateLoop);
      };

      rafRef.current = requestAnimationFrame(updateLoop);
    }

    return () => {
      mountedRef.current = false;

      safeExecute(() => {
        // Stop resize handling
        const clippyEl = document.querySelector(".clippy");
        if (resizeHandlingActiveRef.current && clippyEl) {
          ClippyPositioning?.stopResizeHandling(clippyEl);
          resizeHandlingActiveRef.current = false;
        }

        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }

        if (overlayRef.current && overlayRef.current.parentNode) {
          // Clean up mobile handlers
          if (overlayRef.current._cleanupHandlers) {
            overlayRef.current._cleanupHandlers();
          }
          
          overlayRef.current.parentNode.removeChild(overlayRef.current);
          overlayRef.current = null;
        }
        
        clearTimeout(dragStateRef.current.longPressTimer);
      }, null, "controller cleanup");
    };
  }, [
    clippy,
    visible,
    isScreenPoweredOn,
    position,
    getCustomPosition,
    resizeHandlingActiveRef,
    positionLocked,
    isDragging,
    createMobileTouchHandlers,
    handleDesktopInteraction,
    handleRightClick,
    playInitialGreeting,
    startupComplete,
    showContextMenu,
    hideContextMenu,
  ]);

  return null;
};

const ClippyProvider = ({ children, defaultAgent = "Clippy" }) => {
  // Core state
  const [startupComplete, setStartupComplete] = useState(false);
  const [assistantVisible, setAssistantVisible] = useState(true);
  const [currentAgent, setCurrentAgent] = useState(defaultAgent);
  const [isScreenPoweredOn, setIsScreenPoweredOn] = useState(true);
  const [positionLocked, setPositionLocked] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // FIXED: Context menu state
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // FIXED: Interaction state tracking
  const [interactionCounter, setInteractionCounter] = useState(0);

  // Refs
  const clippyInstanceRef = useRef(null);
  const overlayRef = useRef(null);
  const mountedRef = useRef(false);
  const errorCountRef = useRef(0);
  const lastErrorRef = useRef(0);
  const startupTimeoutRef = useRef(null);
  const resizeHandlingActiveRef = useRef(false);
  const currentZoomLevelRef = useRef(0);
  const greetingPlayedRef = useRef(false);

  // Position state (desktop only)
  const [position, setPosition] = useState(() => {
    if (isMobile) return { x: 0, y: 0 };
    return safeExecute(
      () => ClippyPositioning.calculateDesktopPosition(),
      { x: 520, y: 360 },
      "initial position"
    );
  });

  // FIXED: DOM-based balloon management functions
  const showCustomBalloon = useCallback((message, duration = 6000) => {
    devLog(`Creating custom balloon: "${message}"`);
    
    // Remove existing balloons first
    const existingBalloons = document.querySelectorAll('.custom-clippy-balloon, .custom-clippy-chat-balloon');
    existingBalloons.forEach(balloon => balloon.remove());

    // Create new balloon element
    const balloonEl = document.createElement('div');
    balloonEl.className = 'custom-clippy-balloon';
    balloonEl.textContent = message;
    
    // FIXED: Better positioning logic
    const clippyEl = document.querySelector('.clippy');
    if (clippyEl) {
      const rect = clippyEl.getBoundingClientRect();
      const balloonWidth = 280;
      const balloonHeight = 120;
      
      // Position above Clippy with better calculations
      let left = rect.left + (rect.width / 2) - (balloonWidth / 2);
      let top = rect.top - balloonHeight - 30; // More space above
      
      // Keep balloon in viewport with padding
      left = Math.max(20, Math.min(left, window.innerWidth - balloonWidth - 20));
      top = Math.max(20, Math.min(top, window.innerHeight - balloonHeight - 20));
      
      // If balloon would be too high, show it below Clippy instead
      if (top < 20) {
        top = rect.bottom + 20;
      }
      
      balloonEl.style.left = `${left}px`;
      balloonEl.style.top = `${top}px`;
      balloonEl.style.position = 'fixed';
      balloonEl.style.zIndex = '9999';
      
      devLog(`Balloon positioned at (${left}, ${top})`);
    } else {
      // Fallback positioning - center of screen
      balloonEl.style.left = '50%';
      balloonEl.style.top = '30%';
      balloonEl.style.transform = 'translateX(-50%)';
      balloonEl.style.position = 'fixed';
      balloonEl.style.zIndex = '9999';
      
      devLog("Balloon positioned at screen center (fallback)");
    }

    document.body.appendChild(balloonEl);
    devLog("Balloon added to DOM");

    // Auto-hide after duration
    setTimeout(() => {
      if (balloonEl.parentNode) {
        balloonEl.remove();
        devLog("Balloon removed after timeout");
      }
    }, duration);

    return true;
  }, []);

  const showChatBalloon = useCallback((initialMessage) => {
    devLog(`Creating chat balloon: "${initialMessage}"`);
    
    // Remove existing balloons first
    const existingBalloons = document.querySelectorAll('.custom-clippy-balloon, .custom-clippy-chat-balloon');
    existingBalloons.forEach(balloon => balloon.remove());

    // Create chat balloon container
    const chatContainer = document.createElement('div');
    chatContainer.className = 'custom-clippy-chat-balloon';
    
    // FIXED: Better positioning for chat balloon
    const clippyEl = document.querySelector('.clippy');
    if (clippyEl) {
      const rect = clippyEl.getBoundingClientRect();
      const chatWidth = Math.min(350, window.innerWidth - 40);
      const chatHeight = 300;
      
      let left = rect.left + (rect.width / 2) - (chatWidth / 2);
      let top = rect.top - chatHeight - 30;
      
      // Keep chat in viewport with padding
      left = Math.max(20, Math.min(left, window.innerWidth - chatWidth - 20));
      top = Math.max(50, Math.min(top, window.innerHeight - chatHeight - 50));
      
      // If chat would be too high, show it below Clippy instead
      if (top < 50) {
        top = rect.bottom + 20;
      }
      
      chatContainer.style.left = `${left}px`;
      chatContainer.style.top = `${top}px`;
      chatContainer.style.position = 'fixed';
      chatContainer.style.zIndex = '9999';
      
      devLog(`Chat balloon positioned at (${left}, ${top})`);
    } else {
      // Center fallback
      chatContainer.style.left = '50%';
      chatContainer.style.top = '50%';
      chatContainer.style.transform = 'translate(-50%, -50%)';
      chatContainer.style.position = 'fixed';
      chatContainer.style.zIndex = '9999';
      
      devLog("Chat balloon positioned at screen center (fallback)");
    }

    chatContainer.style.width = `${Math.min(350, window.innerWidth - 40)}px`;
    chatContainer.style.height = '300px';

    // Create chat balloon content
    chatContainer.innerHTML = `
      <button class="custom-clippy-balloon-close" aria-label="Close chat">×</button>
      <div style="margin-bottom: 12px; font-weight: bold; font-size: 16px; color: #000;">
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
        min-height: 180px;
        font-family: 'Tahoma', sans-serif;
        font-size: 14px;
      ">
        <div style="margin: 8px 0; color: #000; text-align: left;">
          <strong>Clippy:</strong> ${initialMessage}
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <input type="text" placeholder="Type a message..." class="chat-input" style="
          flex: 1;
          padding: 8px;
          border: 2px inset #ccc;
          font-size: 14px;
          color: #000;
          font-family: 'Tahoma', sans-serif;
        " />
        <button class="chat-send" style="
          padding: 8px 16px;
          background: #c0c0c0;
          border: 2px outset #c0c0c0;
          font-size: 14px;
          cursor: pointer;
          color: #000;
          font-family: 'Tahoma', sans-serif;
        ">Send</button>
      </div>
    `;

    // Add event listeners
    const closeBtn = chatContainer.querySelector('.custom-clippy-balloon-close');
    const chatInput = chatContainer.querySelector('.chat-input');
    const sendBtn = chatContainer.querySelector('.chat-send');
    const chatMessages = chatContainer.querySelector('.chat-messages');

    closeBtn.onclick = () => {
      if (chatContainer.parentNode) {
        chatContainer.remove();
      }
    };

    const sendMessage = () => {
      const message = chatInput.value.trim();
      if (!message) return;

      // Add user message
      const userMsg = document.createElement('div');
      userMsg.style.cssText = 'margin: 8px 0; color: #000080; text-align: right;';
      userMsg.innerHTML = `<strong>You:</strong> ${message}`;
      chatMessages.appendChild(userMsg);

      chatInput.value = '';

      // Simple response logic
      setTimeout(() => {
        const responses = {
          hello: "Hello there! How can I assist you today?",
          help: "I can help with many things! Try asking me about Hydra98 or just chat with me.",
          hydra: "Hydra98 is an amazing Windows 98 desktop emulator! What do you think of it?",
          thanks: "You're very welcome! Is there anything else I can help you with?",
          bye: "Goodbye! Click the X to close this chat anytime.",
          default: "That's interesting! Tell me more, or ask me something else."
        };

        const lowerMessage = message.toLowerCase();
        let response = responses.default;
        
        for (const [key, value] of Object.entries(responses)) {
          if (lowerMessage.includes(key)) {
            response = value;
            break;
          }
        }

        const clippyMsg = document.createElement('div');
        clippyMsg.style.cssText = 'margin: 8px 0; color: #000; text-align: left;';
        clippyMsg.innerHTML = `<strong>Clippy:</strong> ${response}`;
        chatMessages.appendChild(clippyMsg);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1000);

      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    sendBtn.onclick = sendMessage;
    chatInput.onkeypress = (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    };

    document.body.appendChild(chatContainer);
    devLog("Chat balloon added to DOM");
    
    // Focus input after a brief delay
    setTimeout(() => {
      const input = chatContainer.querySelector('.chat-input');
      if (input) {
        input.focus();
      }
    }, 100);

    return true;
  }, []);

  const hideBalloon = useCallback(() => {
    const balloons = document.querySelectorAll('.custom-clippy-balloon, .custom-clippy-chat-balloon');
    balloons.forEach(balloon => balloon.remove());
    return true;
  }, []);

  // FIXED: Context menu management with viewport bounds
  const showContextMenu = useCallback((x, y) => {
    // Ensure menu stays within viewport
    const menuWidth = 180;
    const menuHeight = 150;
    const adjustedX = Math.min(x, window.innerWidth - menuWidth - 10);
    const adjustedY = Math.min(y, window.innerHeight - menuHeight - 10);
    
    devLog(`Showing context menu at (${adjustedX}, ${adjustedY}) - adjusted from (${x}, ${y})`);
    setContextMenuPosition({ x: adjustedX, y: adjustedY });
    setContextMenuVisible(true);
  }, []);

  const hideContextMenu = useCallback(() => {
    devLog("Hiding context menu");
    setContextMenuVisible(false);
  }, []);

  // FIXED: Interaction handler with better validation
  const handleInteraction = useCallback((e, interactionType = "tap") => {
    e.preventDefault();
    e.stopPropagation();

    devLog(`${interactionType} interaction triggered`);
    devLog(`Mounted: ${mountedRef.current}, Clippy instance: ${!!clippyInstanceRef.current}`);

    if (!mountedRef.current) {
      devLog("Interaction blocked - component not mounted");
      return false;
    }

    if (!clippyInstanceRef.current) {
      devLog("Interaction blocked - no clippy instance, trying to get from window.clippy");
      
      // Try to get clippy from window.clippy as fallback
      if (window.clippy) {
        clippyInstanceRef.current = window.clippy;
        devLog("Successfully got clippy instance from window.clippy");
      } else {
        devLog("No clippy instance available anywhere");
        return false;
      }
    }

    const newCounter = interactionCounter + 1;
    setInteractionCounter(newCounter);

    devLog(`${interactionType} interaction #${newCounter} - triggering animation and balloon`);

    return safeExecute(() => {
      if (clippyInstanceRef.current.play) {
        clippyInstanceRef.current.play("Greeting");
        devLog("Animation triggered successfully");
        
        setTimeout(() => {
          if (mountedRef.current) {
            // FIXED: Alternating behavior - every other interaction shows chat
            if (newCounter % 2 === 0) {
              const chatMessage = isMobile 
                ? "Hi! What would you like to chat about?" 
                : "Hello! How can I help you today?";
              devLog(`Showing chat balloon (interaction #${newCounter})`);
              showChatBalloon(chatMessage);
            } else {
              const speechMessage = isMobile
                ? "Tap me again for more help!"
                : "Double-click me again for more help!";
              devLog(`Showing speech balloon (interaction #${newCounter})`);
              showCustomBalloon(speechMessage);
            }
          }
        }, 800);
      } else {
        devLog("Could not play animation - clippy.play not available");
      }
      return true;
    }, false, `${interactionType} interaction`);
  }, [interactionCounter, showChatBalloon, showCustomBalloon]);

  // FIXED: Long press handler (mobile only)
  const handleLongPress = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!mountedRef.current || !isMobile) return false;

    devLog("Long press interaction - always shows chat");

    return safeExecute(() => {
      if (clippyInstanceRef.current?.play) {
        clippyInstanceRef.current.play("GetAttention");
        
        setTimeout(() => {
          if (mountedRef.current) {
            showChatBalloon("Hi! What would you like to chat about?");
          }
        }, 500);
      }
      return true;
    }, false, "long press interaction");
  }, [showChatBalloon]);

  // FIXED: Right-click handler (desktop only)
  const handleRightClick = useCallback((e) => {
    if (isMobile) return;
    
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation(); // FIXED: Stop all event propagation
    
    devLog("Right-click context menu");
    
    // Show context menu at click position
    showContextMenu(e.clientX, e.clientY);
    return true;
  }, [showContextMenu]);

  // FIXED: Simplified greeting animation
  const playInitialGreeting = useCallback(() => {
    if (greetingPlayedRef.current || !clippyInstanceRef.current || !startupComplete) {
      return;
    }
    
    greetingPlayedRef.current = true;
    
    devLog("Playing initial greeting animation");
    
    safeExecute(() => {
      const randomGreeting = GREETING_ANIMATIONS[Math.floor(Math.random() * GREETING_ANIMATIONS.length)];
      
      if (clippyInstanceRef.current?.play) {
        clippyInstanceRef.current.play(randomGreeting);
        
        setTimeout(() => {
          if (mountedRef.current) {
            const welcomeMessage = isMobile 
              ? "Hi! I'm Clippy. Tap me for help!" 
              : "Hi! I'm Clippy. Double-click me for help!";
            showCustomBalloon(welcomeMessage, 4000);
          }
        }, 1500);
      }
    }, null, "initial greeting");
  }, [showCustomBalloon, startupComplete]);

  // Startup sequence monitoring
  useEffect(() => {
    let isMonitoring = true;

    const checkSequenceStatus = () => {
      if (!isMonitoring) return;

      const biosWrapper = document.querySelector(".BIOSWrapper");
      const windowsLaunchWrapper = document.querySelector(".WindowsLaunchWrapper");
      const desktop = document.querySelector(".desktop");
      const shutdownScreen = document.querySelector(".itIsNowSafeToTurnOffYourComputer");

      let sequenceActive = false;

      if (biosWrapper && windowsLaunchWrapper) {
        const biosVisible = !biosWrapper.classList.contains("hidden") &&
                           getComputedStyle(biosWrapper).opacity !== "0";
        const windowsVisible = !windowsLaunchWrapper.classList.contains("hidden") &&
                              getComputedStyle(windowsLaunchWrapper).opacity !== "0";
        sequenceActive = biosVisible || windowsVisible;
      }

      if (desktop?.classList.contains("windowsShuttingDown") || shutdownScreen) {
        sequenceActive = true;
      }

      const wasComplete = startupComplete;
      const isComplete = !sequenceActive;

      if (wasComplete !== isComplete) {
        setStartupComplete(isComplete);
        
        // FIXED: Only trigger greeting on transition to complete
        if (isComplete && !greetingPlayedRef.current) {
          setTimeout(() => {
            playInitialGreeting();
          }, 1000);
        }
      }

      const nextCheckDelay = sequenceActive ? 500 : 2000;
      startupTimeoutRef.current = setTimeout(checkSequenceStatus, nextCheckDelay);
    };

    checkSequenceStatus();

    return () => {
      isMonitoring = false;
      if (startupTimeoutRef.current) {
        clearTimeout(startupTimeoutRef.current);
      }
    };
  }, [playInitialGreeting, startupComplete]);

  // FIXED: Context menu click-outside handler with proper delay
  useEffect(() => {
    if (!contextMenuVisible) return;

    let cleanup = null;
    let timeoutId = null;

    // FIXED: Delay the click-outside handler to prevent immediate closure
    timeoutId = setTimeout(() => {
      const handleClickOutside = (e) => {
        // Don't close if clicking on Clippy or the menu itself
        if (e.target.closest('.clippy') || 
            e.target.closest('#clippy-clickable-overlay') ||
            e.target.closest('.clippy-context-menu-debug')) {
          return;
        }
        devLog("Click outside context menu - hiding");
        hideContextMenu();
      };

      const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
          devLog("Escape key pressed - hiding context menu");
          hideContextMenu();
        }
      };

      document.addEventListener('click', handleClickOutside, { capture: true });
      document.addEventListener('keydown', handleEscapeKey);

      cleanup = () => {
        document.removeEventListener('click', handleClickOutside, { capture: true });
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }, 100); // Wait 100ms before attaching click-outside handler

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (cleanup) cleanup();
    };
  }, [contextMenuVisible, hideContextMenu]);

  // Zoom monitoring (simplified)
  useEffect(() => {
    if (isMobile || !mountedRef.current) return;

    const checkZoomChange = () => {
      const currentZoomLevel = ClippyPositioning.getCurrentZoomLevel();

      if (currentZoomLevel !== currentZoomLevelRef.current) {
        currentZoomLevelRef.current = currentZoomLevel;

        const clippyElement = document.querySelector(".clippy");
        if (clippyElement && ClippyPositioning.forceImmediateZoomPositioning) {
          const positioned = ClippyPositioning.forceImmediateZoomPositioning(
            clippyElement,
            currentZoomLevel
          );
          
          if (positioned) {
            const overlayElement = document.getElementById("clippy-clickable-overlay");
            if (overlayElement) {
              ClippyPositioning.positionOverlay(overlayElement, clippyElement);
            }
          }
        }
      }
    };

    const zoomCheckInterval = setInterval(checkZoomChange, 100);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "data-zoom") {
          checkZoomChange();
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-zoom"],
    });

    return () => {
      clearInterval(zoomCheckInterval);
      observer.disconnect();
    };
  }, []);

  // Error rate limiting
  const isErrorRateLimited = useCallback(() => {
    const now = Date.now();
    if (now - lastErrorRef.current < 1000) {
      errorCountRef.current++;
    } else {
      errorCountRef.current = 1;
    }
    lastErrorRef.current = now;
    return errorCountRef.current > 5;
  }, []);

  // Global function creation
  const createSafeGlobalFunction = useCallback(
    (fn, functionName) => {
      return (...args) => {
        if (!mountedRef.current || isErrorRateLimited()) {
          return false;
        }

        const biosWrapper = document.querySelector(".BIOSWrapper");
        const windowsLaunchWrapper = document.querySelector(".WindowsLaunchWrapper");
        const desktop = document.querySelector(".desktop");
        const shutdownScreen = document.querySelector(".itIsNowSafeToTurnOffYourComputer");

        let sequenceActive = false;
        if (biosWrapper && windowsLaunchWrapper) {
          sequenceActive = !biosWrapper.classList.contains("hidden") || 
                          !windowsLaunchWrapper.classList.contains("hidden");
        }
        if (desktop?.classList.contains("windowsShuttingDown") || shutdownScreen) {
          sequenceActive = true;
        }

        if (sequenceActive) return false;

        return safeExecute(() => fn(...args), false, `global function ${functionName}`);
      };
    },
    [isErrorRateLimited]
  );

  // Initialize global functions
  useEffect(() => {
    if (typeof window !== "undefined" && !window._clippyGlobalsInitialized) {
      window._clippyGlobalsInitialized = true;

      // Position functions
      window.setClippyPosition = createSafeGlobalFunction((newPosition) => {
        if (isMobile) return false;
        if (newPosition && (newPosition.x !== undefined || newPosition.y !== undefined)) {
          setPosition(newPosition);
          const clippyEl = document.querySelector(".clippy");
          if (clippyEl && ClippyPositioning) {
            return ClippyPositioning.positionClippy(clippyEl, newPosition);
          }
        }
        return false;
      }, "setClippyPosition");

      // Mobile control functions
      window.setClippyPositionLocked = createSafeGlobalFunction((locked) => {
        setPositionLocked(locked);
        return true;
      }, "setClippyPositionLocked");

      window.getClippyPositionLocked = createSafeGlobalFunction(() => {
        return positionLocked;
      }, "getClippyPositionLocked");

      window.setClippyDragging = createSafeGlobalFunction((dragging) => {
        setIsDragging(dragging);
        return true;
      }, "setClippyDragging");

      // Visibility functions
      window.setAssistantVisible = createSafeGlobalFunction((visible) => {
        setAssistantVisible(visible);
        if (!visible) {
          hideBalloon();
          hideContextMenu();
        }
        return true;
      }, "setAssistantVisible");

      window.setCurrentAgent = createSafeGlobalFunction((agent) => {
        setCurrentAgent(agent);
        return true;
      }, "setCurrentAgent");

      window.setScreenPowerState = createSafeGlobalFunction((powered) => {
        setIsScreenPoweredOn(powered);
        return true;
      }, "setScreenPowerState");

      // FIXED: DOM-based balloon functions
      window.showClippyCustomBalloon = createSafeGlobalFunction((message) => {
        return showCustomBalloon(message);
      }, "showClippyCustomBalloon");

      window.hideClippyCustomBalloon = createSafeGlobalFunction(() => {
        return hideBalloon();
      }, "hideClippyCustomBalloon");

      window.showClippyChatBalloon = createSafeGlobalFunction((initialMessage) => {
        return showChatBalloon(initialMessage);
      }, "showClippyChatBalloon");

      window.getClippyInstance = () => clippyInstanceRef.current;

      // FIXED: Test functions for debugging  
      window.testClippyBalloon = () => {
        devLog("Manual balloon test triggered");
        const success = showCustomBalloon("🎉 Test balloon - if you see this, balloons are working!");
        devLog(`Balloon creation success: ${success}`);
        
        // Also check DOM immediately
        setTimeout(() => {
          const balloons = document.querySelectorAll('.custom-clippy-balloon');
          devLog(`Balloons in DOM: ${balloons.length}`);
          if (balloons.length > 0) {
            const balloon = balloons[0];
            const rect = balloon.getBoundingClientRect();
            devLog(`Balloon position: (${rect.left}, ${rect.top}) size: ${rect.width}x${rect.height}`);
            devLog(`Balloon styles: ${balloon.style.cssText}`);
          }
        }, 100);
        
        return success;
      };

      window.testClippyChat = () => {
        devLog("Manual chat test triggered");
        const success = showChatBalloon("💬 Test chat - type a message to test chat functionality");
        devLog(`Chat creation success: ${success}`);
        
        // Also check DOM immediately
        setTimeout(() => {
          const chats = document.querySelectorAll('.custom-clippy-chat-balloon');
          devLog(`Chat balloons in DOM: ${chats.length}`);
          if (chats.length > 0) {
            const chat = chats[0];
            const rect = chat.getBoundingClientRect();
            devLog(`Chat position: (${rect.left}, ${rect.top}) size: ${rect.width}x${rect.height}`);
          }
        }, 100);
        
        return success;
      };

      // FIXED: Context menu test - NUCLEAR VISIBLE VERSION
      window.forceShowContextMenu = () => {
        devLog("Force showing NUCLEAR VISIBLE context menu");
        setContextMenuPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        setContextMenuVisible(true);
        
        // Also create a DOM-based ultra-visible context menu as backup
        const existingNuclear = document.getElementById('nuclear-context-menu');
        if (existingNuclear) existingNuclear.remove();
        
        const nuclearMenu = document.createElement('div');
        nuclearMenu.id = 'nuclear-context-menu';
        nuclearMenu.style.cssText = `
          position: fixed !important;
          left: 50% !important;
          top: 50% !important;
          transform: translate(-50%, -50%) !important;
          z-index: 999999 !important;
          background: linear-gradient(45deg, #ff0000, #00ff00) !important;
          border: 5px solid #000000 !important;
          box-shadow: 0 0 50px rgba(255,0,0,1) !important;
          padding: 20px !important;
          border-radius: 10px !important;
          font-family: Arial, sans-serif !important;
          font-size: 16px !important;
          font-weight: bold !important;
          color: #ffffff !important;
          text-shadow: 2px 2px 4px #000000 !important;
          min-width: 200px !important;
          text-align: center !important;
          animation: nuclearPulse 1s infinite !important;
        `;
        
        nuclearMenu.innerHTML = `
          <div style="margin-bottom: 10px; font-size: 18px;">🚨 NUCLEAR CONTEXT MENU 🚨</div>
          <div style="padding: 8px; margin: 5px 0; background: rgba(0,0,0,0.5); border-radius: 5px; cursor: pointer;" 
               onclick="this.parentElement.remove(); setAssistantVisible(false);">
            🚫 Hide Clippy
          </div>
          <div style="padding: 8px; margin: 5px 0; background: rgba(0,0,0,0.5); border-radius: 5px; cursor: pointer;"
               onclick="this.parentElement.remove(); if(window.clippy) window.clippy.play('Wave');">
            👋 Wave Animation
          </div>
          <div style="padding: 8px; margin: 5px 0; background: rgba(0,0,0,0.5); border-radius: 5px; cursor: pointer;"
               onclick="this.parentElement.remove();">
            ❌ Close Menu
          </div>
        `;
        
        document.body.appendChild(nuclearMenu);
        devLog("Nuclear context menu created and added to DOM");
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
          if (nuclearMenu.parentNode) {
            nuclearMenu.remove();
            devLog("Nuclear context menu auto-removed");
          }
        }, 10000);
        
        return true;
      };

      // FIXED: Simple test balloon at center of screen
      window.testBalloonCenter = () => {
        devLog("Creating test balloon at center");
        
        const balloon = document.createElement('div');
        balloon.className = 'custom-clippy-balloon';
        balloon.textContent = '🎯 CENTER TEST BALLOON - You should see this!';
        balloon.style.cssText = `
          position: fixed !important;
          left: 50% !important;
          top: 30% !important;
          transform: translateX(-50%) !important;
          z-index: 99999 !important;
          background: #fffcde !important;
          border: 3px solid #000 !important;
          border-radius: 8px !important;
          padding: 12px 16px !important;
          font-family: Tahoma, sans-serif !important;
          font-size: 14px !important;
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          box-shadow: 4px 4px 8px rgba(0,0,0,0.3) !important;
          max-width: 280px !important;
          visibility: visible !important;
          opacity: 1 !important;
          display: block !important;
        `;
        
        document.body.appendChild(balloon);
        devLog("Center test balloon added to DOM");
        
        setTimeout(() => {
          if (balloon.parentNode) {
            balloon.remove();
            devLog("Center test balloon removed");
          }
        }, 5000);
        
        return true;
      };

      // FIXED: Ultra-visible test balloon
      window.testBalloonUltraVisible = () => {
        devLog("Creating ULTRA VISIBLE test balloon");
        
        const balloon = document.createElement('div');
        balloon.textContent = '🚨 ULTRA VISIBLE BALLOON - YOU MUST SEE THIS! 🚨';
        balloon.style.cssText = `
          position: fixed !important;
          left: 50% !important;
          top: 50% !important;
          transform: translate(-50%, -50%) !important;
          z-index: 999999 !important;
          background: red !important;
          color: white !important;
          border: 5px solid yellow !important;
          padding: 20px !important;
          font-family: Arial, sans-serif !important;
          font-size: 18px !important;
          font-weight: bold !important;
          text-align: center !important;
          border-radius: 10px !important;
          box-shadow: 0 0 20px rgba(255,0,0,0.8) !important;
          animation: balloonPulse 1s infinite !important;
          visibility: visible !important;
          opacity: 1 !important;
          display: block !important;
          width: 300px !important;
          height: 100px !important;
          line-height: 60px !important;
        `;
        
        document.body.appendChild(balloon);
        devLog("Ultra visible balloon added to DOM");
        
        setTimeout(() => {
          if (balloon.parentNode) {
            balloon.remove();
            devLog("Ultra visible balloon removed");
          }
        }, 5000);
        
        return true;
      };

      devLog("All global functions initialized successfully");
    }

    return () => {
      if (typeof window !== "undefined" && window._clippyGlobalsInitialized) {
        // Clean up global functions
        delete window.setClippyPosition;
        delete window.setClippyPositionLocked;
        delete window.getClippyPositionLocked;
        delete window.setClippyDragging;
        delete window.setAssistantVisible;
        delete window.setCurrentAgent;
        delete window.setScreenPowerState;
        delete window.showClippyCustomBalloon;
        delete window.hideClippyCustomBalloon;
        delete window.showClippyChatBalloon;
        delete window.getClippyInstance;
        delete window.testClippyBalloon;
        delete window.testClippyChat;
        delete window.forceShowContextMenu;
        delete window.testBalloonCenter;
        delete window.testBalloonUltraVisible;
        delete window._clippyGlobalsInitialized;
      }
    };
  }, [
    createSafeGlobalFunction,
    setPosition,
    setPositionLocked,
    positionLocked,
    setIsDragging,
    setAssistantVisible,
    setCurrentAgent,
    setIsScreenPoweredOn,
    showCustomBalloon,
    hideBalloon,
    showChatBalloon,
    hideContextMenu,
  ]);

  // Get custom position function for controller
  const getCustomPosition = useCallback(() => {
    if (isMobile) return null;
    return position;
  }, [position]);

  // Mount effect
  useEffect(() => {
    mountedRef.current = true;
    devLog("ClippyProvider mounted");

    return () => {
      mountedRef.current = false;
      devLog("ClippyProvider unmounted");
    };
  }, []);

  // Context value
  const contextValue = {
    // State
    assistantVisible,
    currentAgent,
    isScreenPoweredOn,
    position,
    positionLocked,
    isDragging,
    startupComplete,
    contextMenuVisible,
    contextMenuPosition,
    interactionCounter,

    // Actions
    setAssistantVisible,
    setCurrentAgent,
    setIsScreenPoweredOn,
    setPosition,
    setPositionLocked,
    setIsDragging,

    // Balloon functions
    showCustomBalloon,
    showChatBalloon,
    hideBalloon,

    // Context menu functions
    showContextMenu,
    hideContextMenu,

    // Interaction handlers
    handleInteraction,
    handleLongPress,
    handleRightClick,

    // Greeting function
    playInitialGreeting,

    // Refs
    clippyInstanceRef,
    overlayRef,
    mountedRef,

    // Device info
    isMobile,
  };

  return (
    <ClippyContext.Provider value={contextValue}>
      <ReactClippyProvider agent={currentAgent}>
        {assistantVisible && (
          <FixedClippyController
            visible={assistantVisible}
            isScreenPoweredOn={isScreenPoweredOn}
            position={position}
            clippyInstanceRef={clippyInstanceRef}
            overlayRef={overlayRef}
            getCustomPosition={getCustomPosition}
            resizeHandlingActiveRef={resizeHandlingActiveRef}
            positionLocked={positionLocked}
            isDragging={isDragging}
            playInitialGreeting={playInitialGreeting}
            startupComplete={startupComplete}
            handleInteraction={handleInteraction}
            handleLongPress={handleLongPress}
            handleRightClick={handleRightClick}
            showContextMenu={showContextMenu}
            hideContextMenu={hideContextMenu}
          />
        )}

        {/* Context Menu */}
        {contextMenuVisible && (
          <ClippyContextMenu
            x={contextMenuPosition.x}
            y={contextMenuPosition.y}
            onClose={hideContextMenu}
            onAction={(action) => {
              devLog(`Context menu action: ${action}`);
              hideContextMenu();
              
              switch (action) {
                case 'hide':
                  setAssistantVisible(false);
                  break;
                case 'wave':
                  if (clippyInstanceRef.current?.play) {
                    clippyInstanceRef.current.play('Wave');
                  }
                  break;
                case 'greet':
                  if (clippyInstanceRef.current?.play) {
                    clippyInstanceRef.current.play('Greeting');
                    setTimeout(() => {
                      showCustomBalloon("Hello there! 👋");
                    }, 800);
                  }
                  break;
                case 'chat':
                  showChatBalloon("Hi! What would you like to chat about?");
                  break;
                default:
                  devLog(`Unknown context menu action: ${action}`);
              }
            }}
          />
        )}

        {/* Mobile Controls */}
        {isMobile && (
          <MobileControls
            positionLocked={positionLocked}
            onToggleLock={() => setPositionLocked(!positionLocked)}
            onHide={() => setAssistantVisible(false)}
          />
        )}

        {children}
      </ReactClippyProvider>
    </ClippyContext.Provider>
  );
};

export const useClippyContext = () => useContext(ClippyContext);
export default ClippyProvider;