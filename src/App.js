import React, { Component, useEffect, useState, useContext } from "react";
import { Theme } from "packard-belle";
import cx from "classnames";
import "./App.css";
// Components
import TaskBar from "./components/TaskBar";
import WindowManager from "./components/WindowManager";
import ProgramProvider from "./contexts/programs";
import { ProgramContext } from "././contexts";
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
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { withRouterParams } from "./components/withRouterParams";
import NewsletterFunnelManager from "./components/NewsletterFunnel/NewsletterFunnelManager";
import HappyTuesdayNewsFeed from "./components/HappyTuesdayNewsFeed/HappyTuesdayNewsFeed";
// Program data
import desktopData from "./data/desktop";
import startMenuData from "./data/start";

// Debug flag - set to false in production to disable most logging
const DEBUG_LOGGING = process.env.NODE_ENV === "development";
const VERBOSE_LOGGING = false; // Set to true only when debugging specific issues

//
// DESKTOP COMPONENT:
//
class DesktopInner extends Component {
  static contextType = ProgramContext;

  constructor(props) {
    super(props);
    this.hasAutoOpened = false;
  }

  componentDidMount() {
    const { settings } = this.props;
    if (window.innerWidth < 800 && settings.toggleMobile) {
      settings.toggleMobile(true);
    }

    if (VERBOSE_LOGGING) {
      console.log(
        "DesktopInner componentDidMount - ProgramContext:",
        this.context
      );
      console.log(
        "DesktopInner componentDidMount - Context keys:",
        Object.keys(this.context || {})
      );
    }

    // Set up polling to check for context availability
    let pollCount = 0;
    const maxPollAttempts = 50; // 5 seconds at 100ms intervals

    this.contextCheckInterval = setInterval(() => {
      pollCount++;

      // Only log context state for critical debugging, less frequently
      if (VERBOSE_LOGGING && pollCount % 20 === 0) {
        console.log(
          `Context check #${pollCount} - onOpen available:`,
          !!this.context.onOpen
        );
      }

      if (
        this.context.onOpen &&
        !this.hasAutoOpened &&
        this.props.defaultProgram
      ) {
        if (DEBUG_LOGGING) {
          console.log("Context onOpen now available, attempting auto-open");
        }
        clearInterval(this.contextCheckInterval);

        this.hasAutoOpened = true;
        this.attemptAutoOpen();
      }

      // Stop after 5 seconds to prevent infinite polling
      if (pollCount > maxPollAttempts) {
        if (DEBUG_LOGGING) {
          console.warn(
            "Stopping context polling after 5 seconds - onOpen never became available"
          );
        }
        clearInterval(this.contextCheckInterval);
      }
    }, 100);

    // Also try immediately in case it's already available
    this.attemptAutoOpen();
  }

  componentWillUnmount() {
    if (this.contextCheckInterval) {
      clearInterval(this.contextCheckInterval);
    }
  }

  attemptAutoOpen() {
    const { defaultProgram, routerParams } = this.props;

    if (VERBOSE_LOGGING) {
      console.log("attemptAutoOpen called", {
        defaultProgram: defaultProgram,
        routerParams: routerParams,
        pathname: window.location.pathname,
        hasOnOpen: !!this.context.onOpen,
        hasAutoOpened: this.hasAutoOpened,
      });
    }

    if (!defaultProgram || this.hasAutoOpened) {
      return;
    }

    if (!this.context.onOpen) {
      if (VERBOSE_LOGGING) {
        console.log("onOpen not available yet, will retry via polling");
      }
      return;
    }

    this.hasAutoOpened = true;

    // Small delay to ensure context is fully initialized
    setTimeout(() => {
      this.autoOpenWindowFromRoute();
    }, 100);
  }

  autoOpenWindowFromRoute() {
    const { defaultProgram, routerParams } = this.props;
    if (defaultProgram === "feeds") {
      const { tab, subtab } = routerParams || {};

      if (VERBOSE_LOGGING) {
        console.log("autoOpenWindowFromRoute - routerParams:", routerParams);
        console.log("autoOpenWindowFromRoute - tab:", tab, "subtab:", subtab);
        console.log(
          "autoOpenWindowFromRoute - pathname:",
          window.location.pathname
        );
      }

      let programData = desktopData.find((item) => item.title === "Feeds");

      if (!programData) {
        programData = {
          title: "Feeds",
          component: "HappyTuesdayNewsFeed",
          icon: "feeds32",
        };
      }

      // Make sure we're setting the correct tab
      const finalTab = tab || "blog";

      if (VERBOSE_LOGGING) {
        console.log("autoOpenWindowFromRoute - finalTab:", finalTab);
      }

      programData = {
        ...programData,
        data: {
          ...programData.data,
          initialTab: finalTab,
          initialSubTab: subtab,
        },
      };

      if (VERBOSE_LOGGING) {
        console.log(
          "Final programData being passed to onOpen:",
          JSON.stringify(programData, null, 2)
        );
      }

      if (DEBUG_LOGGING) {
        console.log("Opening Feeds window with tab:", finalTab);
      }

      this.context.onOpen(programData);
    }
  }

  render() {
    const { settings, navigate } = this.props;
    const isMobile = settings.isMobile;

    return (
      <MonitorView>
        <NewsletterFunnelManager>
          <Theme
            className={cx("desktop screen", {
              desktopX2: settings.scale === 2,
              desktopX1_5: settings.scale === 1.5,
              notMobile: !isMobile,
              fullScreen: settings.fullScreen,
            })}
          >
            <Background />
            <DesktopView />
            <TaskBar />
            <WindowManager navigate={navigate} />
            <TaskManager />
            <Settings />
            <ShutDown />
            <ClippyProvider defaultAgent="Clippy" />
            {settings.crt && <CRTOverlay />}
          </Theme>
        </NewsletterFunnelManager>
      </MonitorView>
    );
  }
}

class Desktop extends Component {
  static contextType = SettingsContext;

  render() {
    return (
      <ProgramProvider>
        <DesktopInner {...this.props} settings={this.context} />
      </ProgramProvider>
    );
  }
}

//
// WRAP Desktop so it receives route params as props
//
function DesktopWithRouter(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const context = useContext(SettingsContext);

  // Only log router information when debugging routing issues
  if (VERBOSE_LOGGING) {
    console.log("DesktopWithRouter - props:", props);
    console.log("DesktopWithRouter - routerParams:", props.routerParams);
    console.log("DesktopWithRouter - location.pathname:", location.pathname);
  }

  return <Desktop {...props} navigate={navigate} location={location} />;
}

const DesktopWithParams = withRouterParams(DesktopWithRouter);

const App = () => {
  useEffect(() => {
    enableCustomMenuTooltips();
  }, []);
  return (
    <HelmetProvider>
      <Helmet>{/*...*/}</Helmet>
      <SettingsProvider>
        <BIOSPixelEffect />
        <Routes>
          <Route path="/" element={<DesktopWithParams />} />
          <Route
            path="/feeds"
            element={<DesktopWithParams defaultProgram="feeds" />}
          />
          <Route
            path="/feeds/:tab"
            element={<DesktopWithParams defaultProgram="feeds" />}
          />
          <Route
            path="/feeds/:tab/:subtab"
            element={<DesktopWithParams defaultProgram="feeds" />}
          />
        </Routes>
      </SettingsProvider>
    </HelmetProvider>
  );
};

export default App;
