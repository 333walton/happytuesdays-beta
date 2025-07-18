import React, { Component, useEffect } from "react";
import { Theme } from "packard-belle";
import cx from "classnames";
import "./App.css";
// Components
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
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { withRouterParams } from "./components/withRouterParams";
import HappyTuesdayNewsFeed from "./components/HappyTuesdayNewsFeed/HappyTuesdayNewsFeed";
// Program data
import desktopData from "./data/desktop";
import startMenuData from "./data/start";

//
// DESKTOP COMPONENT:
//
class Desktop extends Component {
  static contextType = SettingsContext;

  componentDidMount() {
    if (window.innerWidth < 800) this.context.toggleMobile(true);
    this.autoOpenWindowFromRoute();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.defaultProgram &&
      (prevProps.routerParams?.tab !== this.props.routerParams?.tab ||
        prevProps.routerParams?.subtab !== this.props.routerParams?.subtab ||
        prevProps.defaultProgram !== this.props.defaultProgram)
    ) {
      this.autoOpenWindowFromRoute();
    }
  }

  autoOpenWindowFromRoute() {
    const { defaultProgram, routerParams } = this.props;
    if (!defaultProgram || !this.context.onOpen) return;
    if (defaultProgram === "feeds") {
      const { tab, subtab } = routerParams || {};

      // Find a matching "programData" for the feeds category and subcategory
      let programData;

      if (tab) {
        // Find by tab (category) in start menu data
        programData = startMenuData.find(
          (item) => item.data && item.data.tab === tab
        );
        // If found, add the subtab info to data
        if (programData && subtab) {
          programData = {
            ...programData,
            data: {
              ...programData.data,
              subtab,
            },
          };
        }
      } else {
        // If just /feeds, open main Feeds from desktop icons
        programData = desktopData.find((item) => item.title === "Feeds");
      }

      if (programData) {
        this.context.onOpen(programData);
      }
    }
    // You can expand with other defaultProgram logic for other site sections here
  }

  renderFeedsWindow(tab, subtab) {
    return (
      <HappyTuesdayNewsFeed initialTab={tab || "blog"} initialSubTab={subtab} />
    );
  }

  render() {
    const isMobile = this.context.isMobile;
    // ...your normal window and desktop rendering logic
    // In your code, ProgramProvider and WindowManager should render program windows.
    // In the place where you render window contents,
    // you will render this.renderFeedsWindow(tab, subtab)
    return (
      <ProgramProvider>
        <MonitorView>
          <Theme
            className={cx("desktop screen", {
              desktopX2: this.context.scale === 2,
              desktopX1_5: this.context.scale === 1.5,
              notMobile: !isMobile,
              fullScreen: this.context.fullScreen,
            })}
          >
            <Background />
            <DesktopView />
            <TaskBar />
            <WindowManager navigate={this.props.navigate} />
            <TaskManager />
            <Settings />
            <ShutDown />
            <ClippyProvider defaultAgent="Clippy" />
            {this.context.crt && <CRTOverlay />}
          </Theme>
        </MonitorView>
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
