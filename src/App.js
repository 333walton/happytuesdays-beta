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
import ClippyProvider from "./components/ClippyAssistant/ClippyProvider";
import ClippyService from "./components/ClippyAssistant/ClippyService";

class Desktop extends Component {
  static contextType = SettingsContext;

  componentDidMount() {
    if (window.innerWidth < 800) {
      this.context.toggleMobile(true);
    }

    // Simple Clippy initialization
    this.initializeClippy();
  }

  initializeClippy = () => {
    const isMobile = this.context.isMobile;

    setTimeout(() => {
      console.log("Initializing Clippy...");

      if (!isMobile) {
        setTimeout(() => {
          ClippyService.setInitialPosition({ position: "higher-right" });
        }, 1000);
      }
    }, 1500);
  };

  componentWillUnmount() {
    if (ClippyService.emergencyReset) {
      ClippyService.emergencyReset();
    }
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
