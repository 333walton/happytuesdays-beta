import React, { Component, useEffect } from "react";
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
import BIOSPixelEffect from "./components/BIOSPixelEffect/BIOSPixelEffect";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { enableCustomMenuTooltips } from "./helpers/customTooltip";

class Desktop extends Component {
  static contextType = SettingsContext;

  componentDidMount() {
    if (window.innerWidth < 800) {
      this.context.toggleMobile(true);
    }
    console.log(
      "Desktop mounted, Clippy will be initialized by ClippyProvider"
    );
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

const App = () => {
  const isBeta = process.env.REACT_APP_IS_BETA === "true";

  useEffect(() => {
    enableCustomMenuTooltips();
  }, []);

  return (
    <HelmetProvider>
      <Helmet>
        {isBeta && <meta name="robots" content="noindex, nofollow" />}
      </Helmet>

      <SettingsProvider>
        <BIOSPixelEffect />
        <Desktop />
      </SettingsProvider>
    </HelmetProvider>
  );
};

export default App;
