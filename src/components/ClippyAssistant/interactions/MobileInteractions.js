// MobileInteractions.js - Simplified mobile interaction logic
import { devLog } from "../core/ClippyPositioning";
import ClippyPositioning from "../core/ClippyPositioning";

// Animation pool for random selection
const MOBILE_ANIMATIONS = [
  "Wave",
  "Congratulate",
  "GetAttention",
  "Thinking",
  "Writing",
  "GoodBye",
  "Processing",
  "Alert",
  "GetArtsy",
  "Searching",
  "Explain",
  "Greeting",
  "GestureRight",
  "GestureLeft",
  "GestureUp",
];

// Balloon messages for mobile
const MOBILE_BALLOON_MESSAGES = [
  "Hi there! Having a good day?",
  "Tap me again for another surprise!",
  "I'm here if you need any help!",
  "Enjoying Hydra98 so far?",
  "Try double-tapping me for my menu!",
  "Long-press me to start a chat!",
  "Need help? Just let me know!",
  "Welcome to the nostalgic world of Windows 98!",
  "Feeling productive today?",
  "Don't forget to save your work!",
];

/**
 * Handle mobile single tap interaction
 * 75% animation, 25% speech balloon
 */
export function handleMobileSingleTap({
  clippyInstance,
  showCustomBalloon,
  setIsAnimationPlaying,
  isInitialInteraction = false,
  greetingPlayedRef,
  initialMessageShownRef,
  showWelcomeBalloon,
}) {
  devLog("Processing mobile single tap");

  // Handle initial interaction
  if (isInitialInteraction) {
    devLog("Initial mobile tap - showing welcome");

    if (clippyInstance?.play) {
      setIsAnimationPlaying(true);
      clippyInstance.play("Wave");
      greetingPlayedRef.current = true;

      setTimeout(() => {
        setIsAnimationPlaying(false);
      }, 2000);

      setTimeout(() => {
        if (!initialMessageShownRef.current) {
          initialMessageShownRef.current = true;
          showWelcomeBalloon();
          devLog("Welcome balloon shown");
        }
      }, 1200);
    }
    return true;
  }

  // Standard tap: 75% animation, 25% speech balloon
  const shouldShowAnimation = Math.random() < 0.75;

  if (shouldShowAnimation) {
    // Play random animation
    devLog("Mobile tap - playing animation (75%)");

    if (clippyInstance?.play) {
      setIsAnimationPlaying(true);

      const randomAnimation =
        MOBILE_ANIMATIONS[Math.floor(Math.random() * MOBILE_ANIMATIONS.length)];
      clippyInstance.play(randomAnimation);

      const animationDuration = randomAnimation === "GoodBye" ? 3000 : 2000;
      setTimeout(() => {
        setIsAnimationPlaying(false);
      }, animationDuration);
    }
  } else {
    // Show speech balloon
    devLog("Mobile tap - showing speech balloon (25%)");

    setTimeout(() => {
      const randomMessage =
        MOBILE_BALLOON_MESSAGES[
          Math.floor(Math.random() * MOBILE_BALLOON_MESSAGES.length)
        ];
      showCustomBalloon(randomMessage, 4000);
    }, 200);
  }

  return true;
}

/**
 * Handle mobile double tap interaction
 * Always shows context menu
 */
export function handleMobileDoubleTap({ showContextMenu }) {
  devLog("Mobile double tap - showing context menu");

  // Position context menu above Clippy
  const clippyEl = document.querySelector(".clippy");
  if (clippyEl) {
    const rect = clippyEl.getBoundingClientRect();
    showContextMenu(rect.left + rect.width / 2, rect.top - 20);
  } else {
    showContextMenu(window.innerWidth / 2, window.innerHeight / 2);
  }

  return true;
}

/**
 * Handle mobile long press interaction
 * Shows agent-specific chat (Botpress for Genius, legacy for others)
 */
export function handleMobileLongPress({
  showChatBalloon,
  showGeniusChat,
  currentAgent = "Clippy",
}) {
  devLog(`Mobile long press - showing ${currentAgent} chat`);

  // Prevent text selection/highlighting during long press (webkit fix)
  document.body.style.webkitUserSelect = "none";
  document.body.style.userSelect = "none";

  setTimeout(() => {
    // Re-enable text selection after interaction
    document.body.style.webkitUserSelect = "";
    document.body.style.userSelect = "";

    if (currentAgent === "Genius" && showGeniusChat) {
      // Use Botpress chat for Genius agent
      showGeniusChat();
      devLog("Genius Botpress chat shown via mobile long press");
    } else {
      // Use legacy chat for other agents
      if (window.showClippyChatBalloon) {
        window.showClippyChatBalloon("Hi! What would you like to chat about?");
        devLog("Legacy chat balloon shown via global function");
      } else {
        showChatBalloon("Hi! What would you like to chat about?");
        devLog("Legacy chat balloon shown via direct call");
      }
    }
  }, 100);

  return true;
}

/**
 * Handle mobile drag interactions
 */
export function handleMobileDrag({ rightPx, bottomPx, isDragging = true }) {
  const clippyEl = document.querySelector(".clippy");
  const overlayEl = document.getElementById("clippy-clickable-overlay");

  if (!clippyEl) return false;

  if (ClippyPositioning?.handleMobileDrag) {
    return ClippyPositioning.handleMobileDrag(
      clippyEl,
      overlayEl,
      { rightPx, bottomPx },
      isDragging
    );
  }

  return false;
}

/**
 * Handle drag start
 */
export function handleMobileDragStart() {
  devLog("Mobile drag started");

  if (window.setClippyDragging) {
    window.setClippyDragging(true);
  }

  const clippyEl = document.querySelector(".clippy");
  const overlayEl = document.getElementById("clippy-clickable-overlay");

  if (ClippyPositioning?.startMobileDrag) {
    ClippyPositioning.startMobileDrag(clippyEl, overlayEl);
  }
}

/**
 * Handle drag end
 */
export function handleMobileDragEnd() {
  devLog("Mobile drag ended");

  const clippyEl = document.querySelector(".clippy");
  const overlayEl = document.getElementById("clippy-clickable-overlay");

  if (ClippyPositioning?.endMobileDrag) {
    ClippyPositioning.endMobileDrag(clippyEl, overlayEl, null);

    // Preserve scale after drag
    if (ClippyPositioning?.preserveClippyScale) {
      ClippyPositioning.preserveClippyScale(clippyEl);
    }
  }

  setTimeout(() => {
    if (window.setClippyDragging) {
      window.setClippyDragging(false);
    }
  }, 100);
}
