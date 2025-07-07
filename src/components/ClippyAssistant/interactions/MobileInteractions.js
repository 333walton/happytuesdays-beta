// MobileInteractions.js - Mobile interaction handlers
// FIXED: Updated to trigger FAB for Genius agent

import { interactionManager, COOLDOWN_TYPES } from "./InteractionManager";

const isDev = process.env.NODE_ENV === "development";
const devLog = (message, ...args) => {
  if (isDev) {
    console.log(`📱 MobileInteractions: ${message}`, ...args);
  }
};

// Enhanced animation logging
const logAnimation = (animationName, context = "mobile interaction") => {
  console.log(
    `%c🎭 Mobile Animation: "${animationName}"%c (from ${context})`,
    "color: #0066cc; font-weight: bold; font-size: 14px;",
    "color: #666; font-size: 12px;"
  );
};

export const handleMobileSingleTap = ({
  clippyInstance,
  showCustomBalloon,
  setIsAnimationPlaying,
  isInitialInteraction,
  greetingPlayedRef,
  initialMessageShownRef,
  showWelcomeBalloon,
}) => {
  devLog("Single tap handler called", { isInitialInteraction });

  // Handle initial interaction
  if (isInitialInteraction && !greetingPlayedRef.current) {
    devLog("First interaction - playing greeting");
    greetingPlayedRef.current = true;

    if (clippyInstance?.play) {
      setIsAnimationPlaying(true);
      const animationName = "Wave";
      logAnimation(animationName, "initial mobile greeting");
      clippyInstance.play(animationName);

      setTimeout(() => {
        setIsAnimationPlaying(false);
        if (!initialMessageShownRef.current) {
          initialMessageShownRef.current = true;
          showWelcomeBalloon();
        }
      }, 2500);
    }
    return;
  }

  // Regular tap: 75% animation, 25% balloon
  const shouldShowAnimation = Math.random() < 0.75;

  if (shouldShowAnimation && clippyInstance?.play) {
    devLog("Mobile tap - showing animation (75% chance)");
    setIsAnimationPlaying(true);

    const animations = [
      "Wave",
      "GetAttention",
      "Thinking",
      "Writing",
      "Alert",
      "Searching",
      "Explain",
      "GestureRight",
      "GestureLeft",
    ];

    const randomIndex = Math.floor(Math.random() * animations.length);
    const animationName = animations[randomIndex];

    logAnimation(animationName, "mobile single tap (75% animation)");
    clippyInstance.play(animationName);

    setTimeout(() => {
      setIsAnimationPlaying(false);
    }, 2000);
  } else {
    devLog("Mobile tap - showing balloon (25% chance)");
    const messages = [
      "Tap me again for more!",
      "Having fun with Happy Tuesdays?",
      "Try a long press!",
      "Double-tap for options!",
      "I'm here to help!",
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    showCustomBalloon(randomMessage, 3000);
  }
};

export const handleMobileDoubleTap = ({ showContextMenu }) => {
  devLog("Double tap triggered - showing context menu");

  // Get tap position for context menu
  const clippyEl = document.querySelector(".clippy");
  if (clippyEl) {
    const rect = clippyEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;
    showContextMenu(x, y);
  }
};

// FIXED: Updated to trigger FAB for Genius
export const handleMobileLongPress = ({
  showChatBalloon,
  triggerGeniusFAB,
  currentAgent,
}) => {
  devLog("Long press triggered");

  // Haptic feedback for long press
  if (window.navigator?.vibrate) {
    window.navigator.vibrate(50);
  }

  // Open appropriate chat based on current agent
  if (currentAgent === "Genius") {
    devLog("Long press for Genius - triggering FAB");

    // Use same logic as "Chat with Genius" menu item
    setTimeout(() => {
      if (window.botpress && window.botpress.open) {
        console.log("✅ Opening Genius chat via botpress.open()");
        window.botpress.open();
      } else {
        console.warn("⚠️ Botpress not found, trying fallback");
        if (window.triggerGeniusChatFAB) {
          window.triggerGeniusChatFAB();
        } else {
          devLog("Mobile long press - no FAB trigger available");
        }
      }
    }, 200); // Same delay as menu item
  } else {
    // Legacy chat for other agents
    devLog("Long press for non-Genius agent - showing chat balloon");
    showChatBalloon("Hi! What would you like to chat about?");
  }
};

export const handleMobileDragStart = () => {
  devLog("Drag started");

  // Visual feedback
  const clippyEl = document.querySelector(".clippy");
  if (clippyEl) {
    clippyEl.style.opacity = "0.8";
    clippyEl.style.transition = "opacity 0.2s";
  }
};

export const handleMobileDrag = ({ x, y, isDragging }) => {
  if (!isDragging) return;

  const clippyEl = document.querySelector(".clippy");
  const overlayEl = document.getElementById("clippy-clickable-overlay");

  if (clippyEl && overlayEl) {
    // Update positions
    clippyEl.style.left = `${x}px`;
    clippyEl.style.top = `${y}px`;

    overlayEl.style.left = `${x}px`;
    overlayEl.style.top = `${y}px`;
  }
};

export const handleMobileDragEnd = () => {
  devLog("Drag ended");

  // Restore opacity
  const clippyEl = document.querySelector(".clippy");
  if (clippyEl) {
    clippyEl.style.opacity = "1";
  }

  // Save position if needed
  const overlayEl = document.getElementById("clippy-clickable-overlay");
  if (overlayEl) {
    const rect = overlayEl.getBoundingClientRect();
    devLog("Final position:", { x: rect.left, y: rect.top });
  }
};
