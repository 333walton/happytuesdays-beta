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

// Agent-specific animations
const AGENT_ANIMATIONS = {
  Clippy: {
    Congratulate: "Congratulate",
    "Send Mail": "SendMail",
    Print: "Print",
    "Get Attention": "GetAttention",
    Save: "Save",
    "Get Techy": "GetTechy",
    Writing: "Writing",
    Processing: "Processing",
    "Good Bye": "GoodBye",
    Checking: "CheckingSomething",
    Hearing: "Hearing_1",
    "Idle Snooze": "IdleSnooze",
    "Get Artsy": "GetArtsy",
    Searching: "Searching",
    "Empty Trash": "EmptyTrash",
    "Rest Pose": "RestPose",
  },
  F1: {
    Wave: "Wave",
    Greeting: "Greeting",
    "Get Attention": "GetAttention",
    Alert: "Alert",
    Thinking: "Thinking",
    Processing: "Processing",
    "Get Techy": "GetTechy",
  },
  Genius: {
    Wave: "Wave",
    "Good Bye": "GoodBye",
    Greeting: "Greeting",
    "Get Attention": "GetAttention",
    Thinking: "Thinking",
    Processing: "Processing",
    "Get Techy": "GetTechy",
    "Look Up": "LookUp",
    "Gesture Up": "GestureUp",
    "Gesture Down": "GestureDown",
  },
  Merlin: {
    Wave: "Wave",
    "Get Attention": "GetAttention",
    Alert: "Alert",
    Thinking: "Thinking",
    Processing: "Processing",
    "Look Down": "LookDown",
    "Gesture Up": "GestureUp",
    "Rest Pose": "RestPose",
    Show: "Show",
    Explain: "Explain",
  },
  Bonzi: {
    Wave: "Wave",
    Greeting: "Greeting",
    "Get Attention": "GetAttention",
    "Look Down": "LookDown",
    "Gesture Up": "GestureUp",
    "Gesture Down": "GestureDown",
    Show: "Show",
    Explain: "Explain",
  },
};

// Get agent-specific animations array
const getAgentAnimations = (agent) => {
  const animations = AGENT_ANIMATIONS[agent] || AGENT_ANIMATIONS.Clippy;
  return Object.values(animations);
};

// Agent-specific balloon messages
const getAgentMessages = (agent) => {
  const messageMap = {
    Clippy: [
      "It looks like you're having fun!",
      "Need help with anything?",
      "Lets build something!",
      "Try a long press for chat!",
      "Double-tap for my menu!",
      "I'm here to assist you!",
    ],
    F1: [
      "Racing to help you!",
      "Need some assistance?",
      "Try a long press for turbo chat!",
      "Double-tap for menu options!",
    ],
    Genius: [
      "Need some assistance?",
      "Try a long press for chat!",
      "Double-tap for smart options!",
      "I'm here with big brain energy!",
    ],
    Merlin: [
      "Need some assistance?",
      "Lets build something!",
      "Long press for mystical chat!",
      "Double-tap for menu options!",
    ],
    Bonzi: [
      "Hey there, buddy!",
      "Bonzi's here to help!",
      "Long press for a chat, pal!",
      "Double-tap for more options!",
      "I'm your friendly desktop companion!",
    ],
  };

  return messageMap[agent] || messageMap.Clippy;
};

export const handleMobileSingleTap = ({
  clippyInstance,
  showCustomBalloon,
  setIsAnimationPlaying,
  isInitialInteraction,
  greetingPlayedRef,
  initialMessageShownRef,
  showWelcomeBalloon,
  currentAgent = "Clippy", // Default to Clippy if not provided
}) => {
  devLog("Single tap handler called", { isInitialInteraction, currentAgent });

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

    // Get agent-specific animations
    const animations = getAgentAnimations(currentAgent);
    const randomIndex = Math.floor(Math.random() * animations.length);
    const animationName = animations[randomIndex];

    logAnimation(
      animationName,
      `mobile single tap (75% animation) - ${currentAgent}`
    );
    clippyInstance.play(animationName);

    setTimeout(() => {
      setIsAnimationPlaying(false);
    }, 2000);
  } else {
    devLog("Mobile tap - showing balloon (25% chance)");

    // Get agent-specific messages
    const messages = getAgentMessages(currentAgent);
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
