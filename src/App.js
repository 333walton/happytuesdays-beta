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
//import StartMessage from "./components/StartMessage/StartMessage";
import { ClippyProvider } from "./components/ClippyAssistant/index";
import ClippyService from "./components/ClippyAssistant/ClippyService";
import clippyManager from "./components/ClippyAssistant/ClippyManager"; // Import the manager

class Desktop extends Component {
  static contextType = SettingsContext;

  componentDidMount() {
    if (window.innerWidth < 800) {
      this.context.toggleMobile(true);
    }

    // Initialize Clippy with standard delay
    setTimeout(() => {
      console.log("Initializing Clippy");
      const isMobile = this.context.isMobile;
      clippyManager.initialize(ClippyService, isMobile);

      // Position Clippy differently based on device
      setTimeout(() => {
        if (!isMobile) {
          ClippyService.setInitialPosition({ position: "higher-right" });
        }
      }, 1000);
    }, 2000);

    // Set up our custom overlay handling system
    setTimeout(() => {
      this.setupCustomOverlayHandlers();
    }, 4000);

    // Make sure handlers are applied, check every few seconds
    this.overlayCheckInterval = setInterval(() => {
      // Check if overlay exists but our data attribute isn't set
      const overlay = document.getElementById("clippy-clickable-overlay");
      if (overlay && !overlay.getAttribute("data-custom-handlers")) {
        console.log("Overlay found without custom handlers, reapplying...");
        this.setupCustomOverlayHandlers();
      }
    }, 5000);

    // Add the force animation flag to window
    window._forceNextAnimation = false;
  }

  setupCustomOverlayHandlers = () => {
    // Find the clippy overlay - this is what we need to modify
    const overlay = document.getElementById("clippy-clickable-overlay");
    if (!overlay) {
      console.log("Clippy overlay not found yet, will retry later");
      return false;
    }

    console.log("Found clippy overlay, setting up custom handlers");

    // Add a style to make the overlay visible during development (comment out in production)
    // overlay.style.border = '1px solid red';

    // Remove all existing event listeners by cloning
    const newOverlay = overlay.cloneNode(true);
    if (overlay.parentNode) {
      overlay.parentNode.replaceChild(newOverlay, overlay);
    }

    // Mark this overlay as having our custom handlers
    newOverlay.setAttribute("data-custom-handlers", "true");

    // Now add our custom double-click handler
    newOverlay.addEventListener("dblclick", (e) => {
      console.log(
        "%c🖱️ Clippy overlay double-clicked!",
        "color: #4CAF50; font-weight: bold;"
      );

      e.preventDefault();
      e.stopPropagation();

      this.forceClippyAnimation();
    });

    // Add right-click handler too as a fallback
    newOverlay.addEventListener("contextmenu", (e) => {
      console.log("Right-click detected on Clippy overlay");

      e.preventDefault();
      e.stopPropagation();

      this.forceClippyAnimation();
    });

    console.log("Custom overlay handlers installed successfully");
    return true;
  };

  forceClippyAnimation = () => {
    console.log("Forcing Clippy animation...");

    // Set the force flag to allow animation to happen
    window._forceNextAnimation = true;

    // Reset all animation flags first
    window.isAnimationPlaying = false;
    window._clippyPositionLocked = false;
    window.globalPositioningLock = false;

    // Force Clippy to be visible
    const clippyEl = document.querySelector(".clippy");
    if (clippyEl) {
      clippyEl.classList.add("clippy-visible");
      clippyEl.classList.remove("clippy-hidden");
    }

    // Select a random animation
    const animations = ["Greeting", "Wave", "GetAttention", "Thinking"];
    const randomAnim =
      animations[Math.floor(Math.random() * animations.length)];

    // Simply play the animation - the force flag will ensure it runs
    if (window.clippy && window.clippy.play) {
      console.log(`Playing "${randomAnim}" animation with force flag set`);
      window.clippy.play(randomAnim);
      return true;
    }

    // If standard approach failed, try direct DOM manipulation
    try {
      console.log("Forcing animation using DOM manipulation");

      // Get the Clippy element
      const clippyEl = document.querySelector(".clippy");
      if (!clippyEl) {
        console.error("Could not find Clippy element");
        return false;
      }

      // Force visibility
      clippyEl.classList.add("clippy-visible");
      clippyEl.classList.remove("clippy-hidden");

      // Find all animation maps
      const maps = clippyEl.querySelectorAll(".map");
      console.log(`Found ${maps.length} animation maps`);

      if (maps.length === 0) {
        console.error("No animation maps found");
        return false;
      }

      // Get a random animation map
      const randomIndex = Math.floor(Math.random() * maps.length);
      const animMap = maps[randomIndex];

      // Reset all animation maps
      maps.forEach((map) => {
        map.classList.remove("animate");
        map.style.display = "none";
      });

      // Force the animation to play
      animMap.style.display = "block";
      animMap.classList.add("animate");

      console.log(`Manually triggered animation map #${randomIndex}`);

      // Add some extra animation classes to ensure it displays
      const styleEl = document.createElement("style");
      styleEl.id = "temp-anim-fix";
      styleEl.textContent = `
        .clippy .map.animate {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      `;
      document.head.appendChild(styleEl);

      // Remove the style after animation
      setTimeout(() => {
        if (styleEl.parentNode) {
          styleEl.parentNode.removeChild(styleEl);
        }
      }, 3000);

      return true;
    } catch (e) {
      console.error("Error during manual animation:", e);
      return false;
    }
  };

  componentWillUnmount() {
    // Clean up Clippy resources
    clippyManager.cleanup();

    // Clear intervals
    if (this.overlayCheckInterval) {
      clearInterval(this.overlayCheckInterval);
    }

    // Remove global flags
    delete window._forceNextAnimation;
    delete window.forceClippyAnimation;
  }

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
