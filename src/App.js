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

    // Initialize Clippy after a delay to ensure it's fully loaded
    setTimeout(() => {
      const isMobile = this.context.isMobile;
      clippyManager.initialize(ClippyService, isMobile);
    }, 2000);
  }

  componentWillUnmount() {
    // Clean up Clippy resources
    clippyManager.cleanup();
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
