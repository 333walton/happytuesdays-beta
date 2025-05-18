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

class Desktop extends Component {
  static contextType = SettingsContext;

  constructor(props) {
    super(props);
    this.clippyFixedInterval = null;
    this.initialClippyPosition = null;
  }

  componentDidMount() {
    if (window.innerWidth < 800) {
      this.context.toggleMobile(true);
    }

    // Direct approach to fix Clippy in position
    setTimeout(() => {
      this.fixClippyPosition();
    }, 2000); // Wait for Clippy to be fully loaded and positioned
  }

  componentWillUnmount() {
    if (this.clippyFixedInterval) {
      clearInterval(this.clippyFixedInterval);
    }
  }

  fixClippyPosition = () => {
    // Find Clippy element
    const clippyElements = document.querySelectorAll(".clippy");
    if (clippyElements.length === 0) {
      // Try again later if not found
      setTimeout(this.fixClippyPosition, 500);
      return;
    }

    const clippyEl = clippyElements[0];
    console.log("Found Clippy, fixing position");

    // Store initial position
    const rect = clippyEl.getBoundingClientRect();
    this.initialClippyPosition = {
      left: rect.left,
      top: rect.top,
    };

    // Apply critical styles to prevent dragging
    clippyEl.style.position = "fixed";
    clippyEl.style.left = `${rect.left}px`;
    clippyEl.style.top = `${rect.top}px`;
    clippyEl.style.cursor = "default";

    // Disable pointer events on Clippy for drag prevention
    // This is drastic but will ensure it can't be dragged
    clippyEl.style.pointerEvents = "none";

    // Add a clone of Clippy that only handles clicks
    const clickableClone = document.createElement("div");
    clickableClone.style.position = "fixed";
    clickableClone.style.left = `${rect.left}px`;
    clickableClone.style.top = `${rect.top}px`;
    clickableClone.style.width = `${rect.width}px`;
    clickableClone.style.height = `${rect.height}px`;
    clickableClone.style.zIndex = "2000";
    clickableClone.style.cursor = "pointer";
    clickableClone.id = "clippy-clickable-overlay";

    // Add click handler to the clone
    clickableClone.addEventListener("click", () => {
      console.log("Clippy clicked via overlay");
      if (window.clippy && window.clippy.speak) {
        window.clippy.speak("How can I help you?");
      }
    });

    clickableClone.addEventListener("dblclick", () => {
      console.log("Clippy double-clicked via overlay");
      if (window.clippy) {
        const anims = ["Greeting", "Wave", "Congratulate", "GetAttention"];
        const anim = anims[Math.floor(Math.random() * anims.length)];
        window.clippy.play(anim);

        if (window.clippy.speak) {
          window.clippy.speak("What can I help you with today?");
        }
      }
    });

    // Add the clickable overlay to the document
    document.body.appendChild(clickableClone);

    // Create a continuous monitor to ensure Clippy stays fixed
    // This handles any attempt by the component to reposition Clippy
    this.clippyFixedInterval = setInterval(() => {
      const clippyEls = document.querySelectorAll(".clippy");
      if (clippyEls.length > 0) {
        const currEl = clippyEls[0];
        const currRect = currEl.getBoundingClientRect();

        // If position has changed significantly, reset it
        if (
          Math.abs(currRect.left - this.initialClippyPosition.left) > 5 ||
          Math.abs(currRect.top - this.initialClippyPosition.top) > 5
        ) {
          console.log("Clippy moved, fixing position");
          currEl.style.position = "fixed";
          currEl.style.left = `${this.initialClippyPosition.left}px`;
          currEl.style.top = `${this.initialClippyPosition.top}px`;
        }

        // Make sure the clickable overlay is still in the right position
        const overlay = document.getElementById("clippy-clickable-overlay");
        if (overlay) {
          overlay.style.left = `${this.initialClippyPosition.left}px`;
          overlay.style.top = `${this.initialClippyPosition.top}px`;
        }
      }

      // Also ensure any balloon is using fixed positioning
      const balloon = document.querySelector(".clippy-balloon");
      if (balloon) {
        balloon.style.position = "fixed";
        balloon.style.zIndex = "9999";
      }
    }, 100);
  };

  render() {
    const { context } = this;
    return (
      <ProgramProvider>
        <MonitorView>
          <Theme
            className={cx("desktop screen", {
              desktopX2: context.scale === 2,
              desktopX1_5: context.scale === 1.5,
              notMobile: !context.isMobile,
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
            <ClippyProvider defaultAgent="Clippy"></ClippyProvider>
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
