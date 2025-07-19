import React, { Component, useEffect, useState, useContext } from "react";
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

    // Override onOpen to handle navigation for News Feed items
    const originalOnOpen = this.context.onOpen;
    if (originalOnOpen) {
      this.originalOnOpen = originalOnOpen;
      this.context.onOpen = (programData) => {
        if (programData?.data?.shouldNavigate && programData.data.navigateTo) {
          this.props.navigate(programData.data.navigateTo);
        } else {
          originalOnOpen(programData);
        }
      };
    }

    this.attemptAutoOpen();
  }

  componentDidUpdate(prevProps, prevState) {
    // If we previously didn't have onOpen but now we do, try auto-opening
    if (
      !prevState?.contextReady &&
      this.context.onOpen &&
      this.props.defaultProgram
    ) {
      console.log("Context now ready, attempting auto-open");
      this.attemptAutoOpen();
    }
  }

  attemptAutoOpen() {
    const { defaultProgram, routerParams } = this.props;
    console.log("attemptAutoOpen called", {
      defaultProgram: defaultProgram,
      routerParams: routerParams,
      pathname: window.location.pathname,
      hasOnOpen: !!this.context.onOpen,
    });

    if (!defaultProgram) {
      console.log("No defaultProgram specified");
      return;
    }

    if (!this.context.onOpen) {
      console.log("onOpen not available yet, will retry when context updates");
      return;
    }

    this.autoOpenWindowFromRoute();
  }

  autoOpenWindowFromRoute() {
    const { defaultProgram, routerParams } = this.props;
    if (defaultProgram === "feeds") {
      const { tab, subtab } = routerParams || {};
      console.log("Opening feeds with tab:", tab, "subtab:", subtab);

      let programData = desktopData.find((item) => item.title === "Feeds");

      if (!programData) {
        console.log(
          "Creating new programData for Feeds - not found in desktopData"
        );
        programData = {
          title: "Feeds",
          component: "HappyTuesdayNewsFeed",
          icon: "feeds32",
        };
      } else {
        console.log("Found existing Feeds in desktopData:", programData);
      }

      programData = {
        ...programData,
        data: {
          ...programData.data,
          initialTab: tab || "blog",
          initialSubTab: subtab,
        },
      };

      console.log("Final programData:", JSON.stringify(programData, null, 2));

      const activePrograms = this.context.activePrograms || {};
      console.log("Active programs:", Object.keys(activePrograms));

      const active = Object.values(activePrograms).find(
        (prog) =>
          prog.title === "Feeds" ||
          prog.component === "HappyTuesdayNewsFeed" ||
          (prog.data && prog.data.component === "HappyTuesdayNewsFeed")
      );

      if (!active) {
        console.log("Opening new Feeds window with onOpen");
        this.context.onOpen(programData);
      } else {
        console.log("Moving existing Feeds window to top", active);
        this.context.moveToTop(active.id);

        if (this.context.updateProgramData) {
          this.context.updateProgramData(active.id, {
            initialTab: tab || "blog",
            initialSubTab: subtab,
          });
        }
      }
    }
  }

  renderFeedsWindow(tab, subtab) {
    return (
      <HappyTuesdayNewsFeed initialTab={tab || "blog"} initialSubTab={subtab} />
    );
  }

  render() {
    const isMobile = this.context.isMobile;
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
  const [hasAttemptedAutoOpen, setHasAttemptedAutoOpen] = useState(false);

  // Use useContext to access the settings context
  const context = useContext(SettingsContext);

  useEffect(() => {
    // Only attempt auto-open once when both conditions are met
    if (context.onOpen && props.defaultProgram && !hasAttemptedAutoOpen) {
      console.log("Auto-opening window from useEffect");
      setHasAttemptedAutoOpen(true);

      // Call the auto-open logic here
      if (props.defaultProgram === "feeds") {
        const routerParams = props.routerParams || {};
        const { tab, subtab } = routerParams;

        let programData = desktopData.find((item) => item.title === "Feeds");

        if (!programData) {
          programData = {
            title: "Feeds",
            component: "HappyTuesdayNewsFeed",
            icon: "feeds32",
          };
        }

        programData = {
          ...programData,
          data: {
            ...programData.data,
            initialTab: tab || "blog",
            initialSubTab: subtab,
          },
        };

        context.onOpen(programData);
      }
    }
  }, [
    context.onOpen,
    props.defaultProgram,
    hasAttemptedAutoOpen,
    props.routerParams,
  ]);

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
