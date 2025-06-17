import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./_styles.scss";
import { SettingsContext } from "../../contexts";
import MonitorControlsPanel from "./MonitorControlsPanel";
import { MonitorThemeProvider } from "./ThemeWrapper";

// Import extracted components
import ScreensaverRenderer from "./ScreensaverRenderer";
import MonitorFrame from "./MonitorFrame";
import ClippyIntegration from "./ClippyIntegration";

class MonitorView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMonitor: true, // Monitor mode enabled by default
      isScreenPoweredOn: true, // Screen power is on by default
      showScreensaver: false, // Screensaver mode disabled by default
      rocketActive: false, // Rocket button state
      nextActive: false, // Next button state
      activeScreensaver: "default", // Which screensaver to show: 'default', 'p5js', or 'maze3d'
      isMobile: this.checkIsMobile(),
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      powerButtonReady: false, // State to track if power button position is ready
      zoomLevel: 0, // 0 = 100%, 1 = 110%, 2 = 125%
      zoomActive: false, // Track if zoom button is pressed
      viewframeColor: "#2F4F4F", // Default dark-slate-gray color for static viewframe
    };

    this.positionStartupSequences = () => {
      // Wait for monitor to render
      setTimeout(() => {
        const monitorScreen = document.querySelector(".monitor-screen");
        const biosWrapper = document.querySelector(".BIOSWrapper");
        const windowsLaunchWrapper = document.querySelector(
          ".WindowsLaunchWrapper"
        );

        if (monitorScreen && biosWrapper && windowsLaunchWrapper) {
          const monitorRect = monitorScreen.getBoundingClientRect();

          // Position BIOS wrapper
          biosWrapper.style.position = "absolute";
          biosWrapper.style.top = monitorRect.top + "px";
          biosWrapper.style.left = monitorRect.left + "px";
          biosWrapper.style.width = monitorRect.width + "px";
          biosWrapper.style.height = monitorRect.height + "px";
          biosWrapper.style.zIndex = "101";

          // Position Windows Launch wrapper
          windowsLaunchWrapper.style.position = "absolute";
          windowsLaunchWrapper.style.top = monitorRect.top + "px";
          windowsLaunchWrapper.style.left = monitorRect.left + "px";
          windowsLaunchWrapper.style.width = monitorRect.width + "px";
          windowsLaunchWrapper.style.height = monitorRect.height + "px";
          windowsLaunchWrapper.style.zIndex = "101";
        }
      }, 300);
    };

    // Only create DOM elements if not on mobile
    if (!this.state.isMobile) {
      // Create root element for monitor portal
      this.monitorRoot = document.createElement("div");
      this.monitorRoot.id = "monitor-root";

      this.lastColorRef = React.createRef();
      this.rootRef = React.createRef();

      // Reference to the monitor frame
      this.monitorFrameRef = React.createRef();
      // Initialize with default value
      this.lastColorRef.current = "#2F4F4F"; // Default color
      window.positionStartupSequencesIfReady = this.positionStartupSequences;
      this.positionStartupSequences();
    }

    console.log("MonitorView constructor ran, isMobile:", this.state.isMobile);
  }

  // Set up context access
  static contextType = SettingsContext;

  componentDidMount() {
    // If on mobile, don't do any of the monitor setup
    if (this.state.isMobile) {
      console.log(
        "Mobile device detected, skipping MonitorView initialization"
      );
      return;
    }

    // Append monitor root to the document body
    document.body.appendChild(this.monitorRoot);

    // Add resize listener to detect mobile/desktop changes
    window.addEventListener("resize", this.handleResize);

    // Set initial background color based on initial monitor state
    this.updateBackgroundColor();
    this.lastColorRef.current = this.state.viewframeColor; // Initialize to default color
    this.rootRef.current = document.getElementById("root"); // Get reference to root element

    // Wait for monitor to render, then calculate power button position
    if (this.state.showMonitor) {
      // Use a short timeout to ensure the monitor has rendered first
      setTimeout(() => {
        this.setState({ powerButtonReady: true });
      }, 200);
    }

    console.log(
      "MonitorView mounted with showMonitor:",
      this.state.showMonitor
    );
  }

  componentWillUnmount() {
    // If on mobile, there's nothing to clean up
    if (this.state.isMobile) {
      if (typeof window !== "undefined") {
        window.positionStartupSequencesIfReady = undefined;
      }
      return;
    }

    // Clean up the portal roots when component unmounts
    window.removeEventListener("resize", this.handleResize);

    if (this.monitorRoot.parentNode) {
      this.monitorRoot.parentNode.removeChild(this.monitorRoot);
    }

    // Restore original background color when component unmounts
    document.body.style.backgroundColor = "darkslategrey";

    // Reset root element background
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.style.backgroundColor = "";
    }

    // Reset any zoom when component unmounts
    this.resetZoom();

    // Clear zoom data attribute for Clippy
    document.body.removeAttribute("data-zoom");
  }
  // Update background color based on current state
  updateBackgroundColor = () => {
    // If screensaver is active, make background transparent to show starfield
    if (this.state.showScreensaver) {
      document.body.style.backgroundColor = "transparent";
      const rootElement = document.getElementById("root");
      if (rootElement) {
        rootElement.style.backgroundColor = "transparent";
      }

      // For animated viewframe - make monitor screen transparent
      const monitorScreen = document.querySelector(".monitor-screen");
      if (monitorScreen) {
        monitorScreen.style.backgroundColor = "transparent";
      }
    }
    // If only monitor is active, use normal darkslategrey background or the selected color
    else {
      document.body.style.backgroundColor = "darkslategrey";
      const rootElement = document.getElementById("root");
      if (rootElement) {
        rootElement.style.backgroundColor = "";
      }

      // For static color viewframe - use the selected color
      const monitorScreen = document.querySelector(".monitor-screen");
      if (monitorScreen) {
        monitorScreen.style.backgroundColor = this.state.viewframeColor;
      }
    }
  };

  // Direct CRT toggling that works with the context
  handleCRTToggle = (e) => {
    // Ensure correct cursor style is maintained by stopping event propagation
    e.stopPropagation();

    // Access toggleCrt method from context and call it directly
    if (this.context && typeof this.context.toggleCrt === "function") {
      this.context.toggleCrt();
    }
  };

  // Apply zoom level to both monitor and desktop viewport
  applyZoom = (level) => {
    if (this.state.isMobile) return;

    let zoomFactor;
    switch (level) {
      case 1:
        zoomFactor = 1.1; // 110%
        break;
      case 2:
        zoomFactor = 1.25; // 125%
        break;
      default:
        zoomFactor = 1.0; // 100%
    }

    // Get references to elements
    const monitorContainer = document.querySelector(".monitor-container");

    if (monitorContainer) {
      if (zoomFactor > 1) {
        // Use CSS variable to maintain centering while zooming
        monitorContainer.style.setProperty("--zoom-scale", zoomFactor);
        monitorContainer.classList.add("zoomed");
      } else {
        monitorContainer.style.removeProperty("--zoom-scale");
        monitorContainer.classList.remove("zoomed");
      }
    }
  };

  // Reset zoom
  resetZoom = () => {
    if (this.state.isMobile) return;

    const monitorContainer = document.querySelector(".monitor-container");

    if (monitorContainer) {
      monitorContainer.style.removeProperty("--zoom-scale");
      monitorContainer.classList.remove("zoomed");
    }
  };

  // Detect mobile devices
  checkIsMobile = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return (
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent
      ) || window.innerWidth < 1024
    );
  };

  // Update mobile state on resize
  handleResize = () => {
    const wasMobile = this.state.isMobile;
    const isMobileNow = this.checkIsMobile();

    // If switching between mobile and desktop, reload the page for a clean slate
    if (wasMobile !== isMobileNow) {
      console.log("Device type changed, reloading page...");
      window.location.reload();
      return;
    }

    this.setState(
      {
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        // Reset power button on resize to prevent incorrect positioning
        powerButtonReady: false,
      },
      () => {
        // If monitor is showing, recalculate power button position after a delay
        if (this.state.showMonitor) {
          setTimeout(() => {
            this.setState({ powerButtonReady: true });
          }, 200);
        }
      }
    );
  };

  toggleMonitorView = () => {
    if (this.state.isMobile) return;

    console.log(
      "Monitor Mode button clicked, current state:",
      this.state.showMonitor
    );
    this.setState(
      (prevState) => ({
        showMonitor: !prevState.showMonitor,
        // Reset power button ready state when toggling monitor off
        powerButtonReady: prevState.showMonitor
          ? false
          : prevState.powerButtonReady,
      }),
      () => {
        console.log("Monitor state updated to:", this.state.showMonitor);

        // Update background color
        this.updateBackgroundColor();

        // If turning monitor on, wait for it to render before showing power button
        if (this.state.showMonitor) {
          // Use a short timeout to ensure the monitor has rendered first
          setTimeout(() => {
            this.setState({ powerButtonReady: true });
          }, 200);
        }
      }
    );
  };

  toggleScreensaver = () => {
    if (this.state.isMobile) return;

    console.log(
      "Screensaver Mode button clicked, current state:",
      this.state.showScreensaver
    );
    this.setState(
      (prevState) => ({
        showScreensaver: !prevState.showScreensaver,
        // Reset to default screensaver when toggling off and back on
        activeScreensaver: !prevState.showScreensaver
          ? "default"
          : prevState.activeScreensaver,
        // Reset button states when toggling screensaver off
        rocketActive: !prevState.showScreensaver
          ? false
          : prevState.rocketActive,
        nextActive: !prevState.showScreensaver ? false : prevState.nextActive,
      }),
      () => {
        console.log(
          "Screensaver state updated to:",
          this.state.showScreensaver
        );

        // Update background color
        this.updateBackgroundColor();
      }
    );
  };

  // Fix for the toggleRocket function
  toggleRocket = () => {
    if (this.state.isMobile) return;

    console.log(
      "Rocket button clicked, current state:",
      this.state.rocketActive
    );

    this.setState(
      (prevState) => {
        // Define the new state based on current state
        const newRocketActive = !prevState.rocketActive;

        // Create full state update to ensure consistency
        return {
          rocketActive: newRocketActive,
          // Use p5js (Stars) when activating rocket, default when deactivating
          activeScreensaver: newRocketActive ? "p5js" : "default",
          // No next button needed
          nextActive: false,
          // When activating rocket, hide monitor. When deactivating, show it
          showMonitor: newRocketActive ? false : true,
          // Always keep screensaver active when in rocket mode
          showScreensaver: newRocketActive ? true : prevState.showScreensaver,
        };
      },
      () => {
        console.log("Rocket state updated to:", this.state.rocketActive);
        console.log("Active screensaver:", this.state.activeScreensaver);
        console.log("Monitor mode set to:", this.state.showMonitor);
        console.log("Screensaver active:", this.state.showScreensaver);

        // Update background color
        this.updateBackgroundColor();
      }
    );
  };

  // Fix for toggleCategory in the MonitorControlsPanel
  toggleCategory = (category) => {
    // Ensure monitor and viewport restoration when switching between static/animated
    if (this.state.rocketActive) {
      // If rocket is active and switching to static, restore monitor and viewport
      if (category === "static") {
        this.setState({
          rocketActive: false,
          showMonitor: true,
          activeScreensaver: "default",
        });
      }
    }

    // Rest of the existing toggleCategory logic...
    // Only proceed if changing category
    if (category !== this.state.activeViewframeCategory) {
      this.setState({ activeViewframeCategory: category });

      // If switching to animated, enable screensaver
      if (category === "animated" && !this.state.showScreensaver) {
        // Save the current color before switching
        this.lastColorRef.current = this.state.viewframeColor;
        this.toggleScreensaver();
      }
      // If switching to static, disable screensaver
      else if (category === "static" && this.state.showScreensaver) {
        this.toggleScreensaver();

        // Restore the color when switching back to static
        if (this.rootRef.current) {
          this.rootRef.current.style.backgroundColor =
            this.lastColorRef.current;
        }
      }
    } else {
      // If clicking the same category button again, allow toggling off animated
      if (category === "animated" && this.state.showScreensaver) {
        this.setState({ activeViewframeCategory: "static" });
        this.toggleScreensaver();

        // Restore the color when switching back to static
        if (this.rootRef.current) {
          this.rootRef.current.style.backgroundColor =
            this.lastColorRef.current;
        }
      }
    }
  };

  toggleNext = () => {
    if (this.state.isMobile) return;

    console.log("Next button clicked, current state:", this.state.nextActive);
    this.setState(
      (prevState) => ({
        nextActive: !prevState.nextActive,
        // Cycle between screensavers
        activeScreensaver: !prevState.nextActive
          ? prevState.activeScreensaver === "default"
            ? "p5js"
            : "default"
          : prevState.activeScreensaver,
        // Make sure only one button is active at a time
        rocketActive:
          !prevState.nextActive && prevState.activeScreensaver === "default",
      }),
      () => {
        console.log("Next state updated to:", this.state.nextActive);
        console.log("Active screensaver:", this.state.activeScreensaver);
      }
    );
  };

  // Toggle screen power state and notify Clippy
  toggleScreenPower = () => {
    if (this.state.isMobile) return;

    console.log(
      "Screen Power button clicked, current state:",
      this.state.isScreenPoweredOn
    );
    this.setState(
      (prevState) => ({
        isScreenPoweredOn: !prevState.isScreenPoweredOn,
      }),
      () => {
        console.log("Power state updated to:", this.state.isScreenPoweredOn);
      }
    );
  };

  // Handle power state changes from ClippyIntegration
  handlePowerStateChange = (isPoweredOn) => {
    if (this.state.isScreenPoweredOn !== isPoweredOn) {
      this.setState({ isScreenPoweredOn: isPoweredOn });
    }
  };

  // Set zoom level (used by controls panel)
  setZoomLevel = (level) => {
    if (this.state.isMobile) return;

    console.log("Zoom level button clicked, setting to:", level);
    this.setState(
      {
        zoomLevel: level,
        zoomActive: level > 0, // Active when zoomed in
      },
      () => {
        console.log("Zoom level updated to:", this.state.zoomLevel);

        // Set data attribute on body for Clippy to detect zoom level
        document.body.setAttribute("data-zoom", level.toString());
        console.log(`📏 Set data-zoom attribute to: ${level}`);

        // Apply the zoom scaling to monitor
        this.applyZoom(level);

        // COMPLETE HYBRID SOLUTION: Use 4-phase hybrid zoom positioning
        if (
          window.ClippyPositioning &&
          window.ClippyPositioning.hybridZoomPositioning
        ) {
          console.log("🚀 Using complete 4-phase hybrid zoom positioning");

          // Get Clippy element for hybrid positioning
          const clippyElement = document.querySelector(".clippy");

          if (clippyElement) {
            window.ClippyPositioning.hybridZoomPositioning(
              clippyElement,
              level
            ).then((success) => {
              if (success) {
                console.log(
                  "✅ Hybrid zoom positioning completed successfully"
                );
              } else {
                console.warn(
                  "⚠️ Hybrid zoom positioning failed, trying fallback"
                );
                // Fallback to triggering repositioning
                window.ClippyPositioning.triggerRepositioning();
              }
            });
          } else {
            console.warn(
              "⚠️ Clippy element not found, using fallback approach"
            );
            // Fallback if no Clippy element
            window.ClippyPositioning.triggerRepositioning();
          }
        } else {
          // Fallback to the original timeout approach
          setTimeout(() => {
            if (window.ClippyPositioning) {
              console.log(
                "🔄 Triggering Clippy repositioning for zoom change (fallback)"
              );
              window.ClippyPositioning.triggerRepositioning();
            } else {
              console.warn(
                "⚠️ ClippyPositioning not available for zoom trigger"
              );
            }
          }, 100);
        }
      }
    );
  };

  // Set static viewframe color
  setViewframeColor = (color) => {
    if (this.state.isMobile) return;

    this.setState({ viewframeColor: color }, () => {
      this.updateBackgroundColor();
    });
  };

  // Set which screensaver to show
  setActiveScreensaver = (screensaverType) => {
    if (this.state.isMobile) return;

    this.setState({ activeScreensaver: screensaverType });
  };

  // Render monitor frame and desktop content
  renderMonitorView() {
    // Don't render anything if on mobile
    if (this.state.isMobile) return null;

    // Don't render desktop viewport if rocket emoji is active (rocketActive is true)
    if (this.state.rocketActive) return null;

    // Get CRT state directly from context
    const isCRTActive = this.context ? this.context.crt : true;

    // Create content for monitor frame and desktop viewport
    const monitorContent = (
      <div
        id="monitor-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 90,
          overflow: "hidden",
        }}
      >
        {/* Monitor container - scale both the monitor and desktop together */}
        <div
          className={`monitor-container ${
            this.state.zoomLevel > 0 ? "zoomed" : ""
          }`}
        >
          {/* Use MonitorFrame component */}
          <MonitorFrame
            monitorFrameRef={this.monitorFrameRef}
            showMonitor={this.state.showMonitor}
            isScreenPoweredOn={this.state.isScreenPoweredOn}
            toggleScreenPower={this.toggleScreenPower}
            handleCRTToggle={this.handleCRTToggle}
            isCRTActive={isCRTActive}
            showScreensaver={this.state.showScreensaver}
            viewframeColor={this.state.viewframeColor}
            zoomLevel={this.state.zoomLevel}
          >
            {this.props.children}
          </MonitorFrame>
        </div>
      </div>
    );

    // Create a portal to render at document.body level
    return ReactDOM.createPortal(monitorContent, this.monitorRoot);
  }

  render() {
    console.log("MONITOR VIEW IS RENDERING, isMobile:", this.state.isMobile);

    // If on mobile, just render children without any monitor wrapper
    if (this.state.isMobile) {
      console.log("Rendering children directly without monitor on mobile");
      return this.props.children;
    }

    return (
      <>
        {/* Clippy Integration Component */}
        <ClippyIntegration
          isScreenPoweredOn={this.state.isScreenPoweredOn}
          onPowerStateChange={this.handlePowerStateChange}
        />

        {/* Screensaver Renderer Component */}
        <ScreensaverRenderer
          isMobile={this.state.isMobile}
          showScreensaver={this.state.showScreensaver}
          activeScreensaver={this.state.activeScreensaver}
        />

        {/* Render Monitor View */}
        {this.renderMonitorView()}

        {/* ONLY apply theme wrapper to the controls panel */}
        <MonitorThemeProvider>
          <MonitorControlsPanel
            showMonitor={this.state.showMonitor}
            toggleMonitorView={this.toggleMonitorView}
            zoomLevel={this.state.zoomLevel}
            setZoomLevel={this.setZoomLevel}
            isScreensaverActive={this.state.showScreensaver}
            toggleScreensaver={this.toggleScreensaver}
            isRocketActive={this.state.rocketActive}
            toggleRocket={this.toggleRocket}
            activeScreensaver={this.state.activeScreensaver}
            setActiveScreensaver={this.setActiveScreensaver}
            viewframeColor={this.state.viewframeColor}
            setViewframeColor={this.setViewframeColor}
          />
        </MonitorThemeProvider>
      </>
    );
  }
}

export default MonitorView;
