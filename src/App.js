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
import { ClippyProvider } from "./components/ClippyAssistant/index";
import ClippyService from "./components/ClippyAssistant/ClippyService";

class Desktop extends Component {
  static contextType = SettingsContext;

  componentDidMount() {
    if (window.innerWidth < 800) {
      this.context.toggleMobile(true);
    }

    // Simplified Clippy initialization
    this.initializeClippy();
  }

  initializeClippy = () => {
    // Prevent multiple initializations
    if (window._clippyInitialized) {
      return;
    }
    window._clippyInitialized = true;

    const isMobile = this.context.isMobile;

    // Wait longer to ensure ClippyProvider and all DOM elements are mounted
    setTimeout(() => {
      try {
        console.log("Initializing Clippy");

        // Enhanced positioning function that retries until successful
        const positionClippy = (attempt = 1) => {
          // Helper to find the desktop element
          const getDesktopViewport = () => {
            return (
              document.querySelector(".desktop.screen") ||
              document.querySelector(".desktop") ||
              document.querySelector(".w98")
            );
          };

          // Check if desktop element exists yet
          const desktop = getDesktopViewport();

          if (desktop && !isMobile) {
            console.log(
              `Desktop element found on attempt ${attempt}, positioning Clippy`
            );
            // Position within the desktop viewport
            ClippyService.setInitialPosition({
              position: "higher-right",
            });
            return true;
          } else if (attempt <= 10) {
            // Retry with exponential backoff (100ms, 200ms, 300ms, etc.)
            const delay = 100 * attempt;
            console.log(
              `Desktop element not found yet, retrying in ${delay}ms (attempt ${attempt})`
            );
            setTimeout(() => positionClippy(attempt + 1), delay);
            return false;
          } else {
            console.warn("Could not find desktop element after 10 attempts");
            return false;
          }
        };

        // Start the positioning process
        if (!isMobile) {
          positionClippy();
        }

        // Show welcome message after Clippy is ready (with longer delay)
        setTimeout(() => {
          if (ClippyService.isAvailable()) {
            ClippyService.play("Greeting");
            setTimeout(() => {
              ClippyService.speak(
                "Welcome to Hydra98! How can I help you today?"
              );
            }, 1000);
          }
        }, 3000);
      } catch (error) {
        console.error("Clippy initialization error:", error);
      }
    }, 2000); // Increased initial delay to 2000ms
  };

  componentWillUnmount() {
    // Clean up
    delete window._clippyInitialized;
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

            {/* Simplified ClippyProvider - always non-draggable for stability */}
            <ClippyProvider defaultAgent="Clippy" />

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
