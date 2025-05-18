import React, { Component } from "react";
import { Theme } from "packard-belle";
import cx from "classnames";
import "./App.css";
import TaskBar from "./components/TaskBar";
import WindowManager from "./components/WindowManager";
import ProgramProvider from "./contexts/programs";
import SettingsProvider from "./contexts/settings";
import { SettingsContext } from "./contexts";
import TaskManager from "./components/TaskManager";
import DesktopView from "./components/DesktopView";
import Settings from "./components/Settings";
import CRTOverlay from "./components/tools/CRT";
import ShutDown from "./components/ShutDown/ShutDown";
import Background from "./components/tools/Background";
import MonitorView from "./components/MonitorView/MonitorView";
import StartMessage from "./components/StartMessage/StartMessage";
import { ClippyProvider } from "./components/ClippyAssistant/index";
import ClippyService from "./components/ClippyAssistant/ClippyService";

class Desktop extends Component {
  static contextType = SettingsContext;

  constructor(props) {
    super(props);
    this.clippyFixedInterval = null;
    this.initialClippyPosition = null;
    this.clippyOverlay = null;
    this.initialMessageShown = false;
    this.clickTimeout = null;
    this.balloonFixTimeout = null;
    this.isFixingBalloon = false;
  }

  componentDidMount() {
    if (window.innerWidth < 800) {
      this.context.toggleMobile(true);
    }

    // Initialize Clippy after a delay to ensure it's fully loaded
    setTimeout(() => {
      this.initializeClippy();
    }, 2000);

    // Add a global stylesheet to prevent balloon flashing
    this.addGlobalBalloonStyles();
  }

  componentWillUnmount() {
    if (this.clippyFixedInterval) {
      clearInterval(this.clippyFixedInterval);
    }
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
    if (this.balloonFixTimeout) {
      clearTimeout(this.balloonFixTimeout);
    }
    // Remove the overlay if it exists
    if (this.clippyOverlay && this.clippyOverlay.parentNode) {
      this.clippyOverlay.parentNode.removeChild(this.clippyOverlay);
    }
    // Remove global balloon styles
    const styleElement = document.getElementById("clippy-balloon-styles");
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
  }

  // Add global styles to prevent balloon flashing
  addGlobalBalloonStyles = () => {
    const styleElement = document.createElement("style");
    styleElement.id = "clippy-balloon-styles";
    styleElement.textContent = `
      .clippy-balloon {
        position: fixed !important;
        z-index: 9999 !important;
        opacity: 1 !important;
        visibility: visible !important;
        transition: none !important;
        animation: none !important;
        background-color: #fffcde !important;
        border: 1px solid #000 !important;
        border-radius: 5px !important;
        padding: 8px !important;
        max-width: 250px !important;
      }
      
      /* Hide original clippy balloon tips */
      .clippy-tip {
        display: none !important;
      }
    `;
    document.head.appendChild(styleElement);
  };

  initializeClippy = () => {
    // Make Clippy visible without initial animation
    ClippyService.show();

    // Set initial position based on device
    const isMobile = window.innerWidth < 800;
    if (isMobile) {
      // On mobile, position at bottom-right
      ClippyService.setInitialPosition({ position: "bottom-right" });
    } else {
      // On desktop, position at center-right
      ClippyService.setInitialPosition({ position: "90% 50%" });

      // For desktop, completely block dragging and replace with a click overlay
      this.preventClippyDraggingOnDesktop();
    }

    // Wait a bit longer before trying to show welcome message
    setTimeout(() => {
      this.showWelcomeMessage();
    }, 3000);
  };

  showWelcomeMessage = () => {
    if (!this.initialMessageShown && window.clippy) {
      // Play greeting animation first
      window.clippy.play("Greeting");

      // Then speak after a delay
      setTimeout(() => {
        if (window.clippy && window.clippy.speak) {
          window.clippy.speak("Welcome to Windows 98!");
          this.initialMessageShown = true;

          // Fix balloon positioning once it appears
          this.fixBalloonOnce();
        }
      }, 800);
    }
  };

  // Fix balloon positioning only once after it appears
  fixBalloonOnce = () => {
    if (this.isFixingBalloon) return;
    this.isFixingBalloon = true;

    // Clear any existing timeout
    if (this.balloonFixTimeout) {
      clearTimeout(this.balloonFixTimeout);
    }

    // Check for balloon every 100ms
    const checkBalloon = () => {
      const balloon = document.querySelector(".clippy-balloon");
      if (balloon) {
        // Position it properly once and stop checking
        this.positionBalloon(balloon);
        this.isFixingBalloon = false;
      } else {
        // Keep checking for up to 2 seconds
        this.balloonFixTimeout = setTimeout(checkBalloon, 100);
      }
    };

    checkBalloon();

    // Set a final timeout to stop checking after 2 seconds
    setTimeout(() => {
      this.isFixingBalloon = false;
      if (this.balloonFixTimeout) {
        clearTimeout(this.balloonFixTimeout);
      }
    }, 2000);
  };

  // Position the balloon relative to Clippy
  positionBalloon = (balloon) => {
    if (!balloon) return;

    const clippy = document.querySelector(".clippy");
    if (!clippy) return;

    const clippyRect = clippy.getBoundingClientRect();

    // Position the balloon above Clippy
    balloon.style.position = "fixed";
    balloon.style.zIndex = "9999";
    balloon.style.left = `${clippyRect.left - 20}px`;
    balloon.style.top = `${clippyRect.top - balloon.offsetHeight - 30}px`;

    // Ensure it stays visible
    balloon.style.display = "block";
    balloon.style.visibility = "visible";
    balloon.style.opacity = "1";

    // Prevent any transitions or animations that might cause flashing
    balloon.style.transition = "none";
    balloon.style.animation = "none";

    // Make sure it stays above the overlay
    if (this.clippyOverlay) {
      this.clippyOverlay.style.pointerEvents = "none";

      // Restore pointer events after balloon is likely gone
      setTimeout(() => {
        if (this.clippyOverlay) {
          this.clippyOverlay.style.pointerEvents = "auto";
        }
      }, 5000);
    }
  };

  // Completely prevent dragging on desktop
  preventClippyDraggingOnDesktop = () => {
    const clippyElements = document.querySelectorAll(".clippy");
    if (clippyElements.length === 0) {
      setTimeout(this.preventClippyDraggingOnDesktop, 500);
      return;
    }

    const clippyEl = clippyElements[0];

    // Store initial position
    const rect = clippyEl.getBoundingClientRect();
    this.initialClippyPosition = {
      left: rect.left,
      top: rect.top,
    };

    // Apply critical styles to completely prevent dragging
    clippyEl.style.position = "fixed";
    clippyEl.style.left = `${rect.left}px`;
    clippyEl.style.top = `${rect.top}px`;
    clippyEl.style.cursor = "default";

    // Completely disable pointer events on the real Clippy element
    clippyEl.style.pointerEvents = "none";

    // Create a clickable overlay that sits on top of Clippy
    this.clippyOverlay = document.createElement("div");
    this.clippyOverlay.id = "clippy-clickable-overlay";
    this.clippyOverlay.style.position = "fixed";
    this.clippyOverlay.style.left = `${rect.left}px`;
    this.clippyOverlay.style.top = `${rect.top}px`;
    this.clippyOverlay.style.width = `${rect.width}px`;
    this.clippyOverlay.style.height = `${rect.height}px`;
    this.clippyOverlay.style.zIndex = "2000";
    this.clippyOverlay.style.cursor = "pointer";

    // Track clicks to distinguish between single and double clicks
    let clickCount = 0;

    // Add click handler with delayed execution to avoid triggering on double-click
    this.clippyOverlay.addEventListener("click", () => {
      clickCount++;

      // Clear any existing timeout
      if (this.clickTimeout) {
        clearTimeout(this.clickTimeout);
      }

      // Set a new timeout to handle the click after a delay
      this.clickTimeout = setTimeout(() => {
        // Only handle single clicks (double clicks will reset this)
        if (clickCount === 1) {
          // For single clicks, we don't do anything
        }
        clickCount = 0;
      }, 300); // Delay to distinguish between single and double clicks
    });

    // Add double-click handler
    this.clippyOverlay.addEventListener("dblclick", () => {
      // Reset click count to prevent single-click handler from firing
      clickCount = 0;
      if (this.clickTimeout) {
        clearTimeout(this.clickTimeout);
      }

      // Handle double-click with animation then speech
      if (window.clippy) {
        const anims = ["Greeting", "Wave", "Congratulate", "GetAttention"];
        const anim = anims[Math.floor(Math.random() * anims.length)];

        // Play animation first
        window.clippy.play(anim);

        // Then show speech after animation starts
        setTimeout(() => {
          if (window.clippy && window.clippy.speak) {
            const phrases = [
              "What can I help you with today?",
              "Need some assistance with Windows?",
              "Looking for some help?",
              "How can I assist you?",
            ];
            const phrase = phrases[Math.floor(Math.random() * phrases.length)];

            // Speak and then fix the balloon
            window.clippy.speak(phrase);
            this.fixBalloonOnce();
          }
        }, 800);
      }
    });

    // Add the overlay to the document
    document.body.appendChild(this.clippyOverlay);

    // Use a much simpler interval that just keeps Clippy in place
    // and doesn't constantly mess with the balloon
    this.clippyFixedInterval = setInterval(() => {
      // Ensure Clippy element remains in position
      if (clippyEl) {
        clippyEl.style.position = "fixed";
        clippyEl.style.left = `${this.initialClippyPosition.left}px`;
        clippyEl.style.top = `${this.initialClippyPosition.top}px`;
        clippyEl.style.pointerEvents = "none";
      }

      // Ensure overlay remains aligned with Clippy
      if (this.clippyOverlay) {
        this.clippyOverlay.style.left = `${this.initialClippyPosition.left}px`;
        this.clippyOverlay.style.top = `${this.initialClippyPosition.top}px`;
      }
    }, 100);
  };

  render() {
    const { context } = this;
    const isMobile = context.isMobile;

    return (
      <ProgramProvider>
        <MonitorView>
          <Theme
            className={cx("desktop screen", {
              desktopX2: context.scale === 2,
              desktopX1_5: context.scale === 1.5,
              notMobile: !isMobile,
              fullScreen: context.fullScreen,
            })}
          >
            <Background />
            <DesktopView />
            <TaskBar />
            <WindowManager />
            <TaskManager />
            <Settings />
            <ShutDown />
            <StartMessage />
            {/* Set fixedPosition based on device type */}
            <ClippyProvider
              defaultAgent="Clippy"
              fixedPosition={!isMobile} // Non-draggable on desktop, draggable on mobile
            />
            {context.crt && <CRTOverlay />}
          </Theme>
        </MonitorView>
      </ProgramProvider>
    );
  }
}

const App = () => (
  <SettingsProvider>
    <Desktop />
  </SettingsProvider>
);

export default App;
