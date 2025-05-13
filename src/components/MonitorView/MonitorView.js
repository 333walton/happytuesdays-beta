import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./_styles.scss";
import StarfieldContainer from "../StarfieldContainer"; 
import Starfield2 from "../Starfield2";
import BouncyBallsScreensaver from "../BouncyBalls";
import FlowerBoxScreensaver from "../FlowerBoxScreensaver";
import { SettingsContext } from "../../contexts";
import MonitorControlsPanel from "./MonitorControlsPanel";
import { MonitorThemeProvider } from './ThemeWrapper';

// Create a separate component for the toggle buttons
class CRTModeToggle extends Component {
  render() {
    const { label, isActive, onClick, style, className, imageSrc, isSquare } = this.props;

    // If an image source is provided, render an <img> instead of a button
    if (imageSrc) {
      return (
        <div 
          className={`power-button-container ${isActive ? 'active' : ''}`}
          style={{
            position: 'relative',
            ...style
          }}
        >
          <img
            src={imageSrc}
            alt={label}
            onClick={onClick}
            className={`submit-doodle-button ${isActive ? 'pressed' : ''} ${className || ''}`}
            style={{
              cursor: 'pointer', // Ensure the image behaves like a button
            }}
          />
        </div>
      );
    }

    // Default button rendering (can be square if isSquare prop is true)
    return (
      <button
        onClick={onClick}
        className={`submit-doodle-button ${isActive ? 'pressed' : ''} ${isSquare ? 'square-button' : ''} ${className || ''}`}
        style={style}
      >
        <span>{label}</span>
      </button>
    );
  }
}

// Create a simple button component for monitor controls
const MonitorButton = ({ onClick, isActive, style, children }) => (
  <button 
    onClick={onClick}
    className={isActive ? 'active' : ''}
    style={{
      width: '18px',
      height: '18px',
      background: '#c0c0c0',
      border: isActive ? 'inset 2px #ffffff' : 'outset 2px #ffffff',
      boxSizing: 'content-box',
      cursor: 'pointer',
      margin: '0 5px',
      padding: 0,
      ...style
    }}
  >
    {children}
  </button>
);

class MonitorView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMonitor: true, // Monitor mode enabled by default
      isScreenPoweredOn: true, // Screen power is on by default
      showScreensaver: false, // Screensaver mode disabled by default
      rocketActive: false, // Rocket button state
      nextActive: false, // Next button state
      activeScreensaver: 'default', // Which screensaver to show: 'default', 'p5js', or 'maze3d'
      isMobile: this.checkIsMobile(),
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      powerButtonReady: false, // State to track if power button position is ready
      zoomLevel: 0, // 0 = 100%, 1 = 110%, 2 = 125%
      zoomActive: false, // Track if zoom button is pressed
      viewframeColor: '#2F4F4F', // Default dark-slate-gray color for static viewframe
    };

    // Only create DOM elements if not on mobile
    if (!this.state.isMobile) {
      // Create root elements for our portals
      this.monitorRoot = document.createElement('div');
      this.monitorRoot.id = 'monitor-root';
      this.flowerboxRoot = document.createElement('div');
      this.flowerboxRoot.id = 'flowerbox-root';
      this.starfieldRoot = document.createElement('div');
      this.starfieldRoot.id = 'starfield-root';
      this.p5jsStarfieldRoot = document.createElement('div');
      this.p5jsStarfieldRoot.id = 'p5js-starfield-root';
      this.BouncyBallsRoot = document.createElement('div');  // Add this line
      this.BouncyBallsRoot.id = 'BouncyBalls-root';              // Add this line
      this.lastColorRef = React.createRef();
      this.rootRef = React.createRef();
      
      // Reference to the monitor frame
      this.monitorFrameRef = React.createRef();
      // Initialize with default value
      this.lastColorRef.current = '#2F4F4F'; // Default color
    }
    
    console.log("MonitorView constructor ran, isMobile:", this.state.isMobile);
  }

  // Set up context access
  static contextType = SettingsContext;

  componentDidMount() {
    // If on mobile, don't do any of the monitor setup
    if (this.state.isMobile) {
      console.log("Mobile device detected, skipping MonitorView initialization");
      return;
    }

    // Append portal roots to the document body
    document.body.appendChild(this.monitorRoot);
    document.body.appendChild(this.starfieldRoot);
    document.body.appendChild(this.p5jsStarfieldRoot);
    document.body.appendChild(this.BouncyBallsRoot);  // Add this line
    document.body.appendChild(this.flowerboxRoot);


    // Add resize listener to detect mobile/desktop changes
    window.addEventListener('resize', this.handleResize);
    
    // Set initial background color based on initial monitor state
    this.updateBackgroundColor();
    this.lastColorRef.current = this.state.viewframeColor; // Initialize to default color
    this.rootRef.current = document.getElementById('root'); // Get reference to root element
    
    // Wait for monitor to render, then calculate power button position
    if (this.state.showMonitor) {
      // Use a short timeout to ensure the monitor has rendered first
      setTimeout(() => {
        this.setState({ powerButtonReady: true });
      }, 200);
    }
    
    console.log("MonitorView mounted with showMonitor:", this.state.showMonitor);
  }

  componentWillUnmount() {
    // If on mobile, there's nothing to clean up
    if (this.state.isMobile) {
      return;
    }

    // Clean up the portal roots when component unmounts
    window.removeEventListener('resize', this.handleResize);

    if (this.BouncyBallsRoot.parentNode) {
      this.BouncyBallsRoot.parentNode.removeChild(this.BouncyBallsRoot);
    }

    if (this.flowerboxRoot.parentNode) {
      this.flowerboxRoot.parentNode.removeChild(this.flowerboxRoot);
    }
    
    if (this.monitorRoot.parentNode) {
      this.monitorRoot.parentNode.removeChild(this.monitorRoot);
    }

    if (this.starfieldRoot.parentNode) {
      this.starfieldRoot.parentNode.removeChild(this.starfieldRoot);
    }

    if (this.p5jsStarfieldRoot.parentNode) {
      this.p5jsStarfieldRoot.parentNode.removeChild(this.p5jsStarfieldRoot);
    }
    
    // Restore original background color when component unmounts
    document.body.style.backgroundColor = 'darkslategrey';
    
    // Reset root element background
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.backgroundColor = '';
    }
    
    // Reset any zoom when component unmounts
    this.resetZoom();
  }

  renderFlowerBox() {
    console.log('⚠️ ATTEMPTING TO RENDER FLOWERBOX', {
      isMobile: this.state.isMobile,
      showScreensaver: this.state.showScreensaver,
      activeScreensaver: this.state.activeScreensaver
    });
    
    if (this.state.isMobile || 
        !this.state.showScreensaver || 
        this.state.activeScreensaver !== 'flowerbox') {
      console.log('❌ NOT RENDERING FLOWERBOX - conditions not met');
      return null;
    }
  
    console.log('✅ RENDERING FLOWERBOX CONTAINER TO', this.flowerboxRoot);
    // Create portal for the 3D FlowerBox
    return ReactDOM.createPortal(
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        backgroundColor: 'black', 
        zIndex: 89 
      }}>
        <FlowerBoxScreensaver />
      </div>,
      this.flowerboxRoot
    );
  }
  
  // Only render if not mobile and screensaver mode is active and the active screensaver is 'maze3d'
  renderBouncyBalls() {
    if (this.state.isMobile || 
        !this.state.showScreensaver || 
        this.state.activeScreensaver !== 'bouncyballs') {
      console.log('❌ NOT RENDERING MAZE3D - conditions not met');
      return null;
    }
  
    console.log('✅ RENDERING MAZE3D CONTAINER TO', this.BouncyBallsRoot);
    // Create portal for the 3D Maze with a fallback color
    return ReactDOM.createPortal(
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        backgroundColor: 'black', 
        zIndex: 89 
      }}>
        <BouncyBallsScreensaver />
      </div>,
      this.BouncyBallsRoot
    );
  }
  
  // Update background color based on current state
  updateBackgroundColor = () => {
    // If screensaver is active, make background transparent to show starfield
    if (this.state.showScreensaver) {
      document.body.style.backgroundColor = 'transparent';
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.backgroundColor = 'transparent';
      }
      
      // For animated viewframe - make monitor screen transparent
      const monitorScreen = document.querySelector('.monitor-screen');
      if (monitorScreen) {
        monitorScreen.style.backgroundColor = 'transparent';
      }
    } 
    // If only monitor is active, use normal darkslategrey background or the selected color
    else {
      document.body.style.backgroundColor = 'darkslategrey';
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.backgroundColor = '';
      }
      
      // For static color viewframe - use the selected color
      const monitorScreen = document.querySelector('.monitor-screen');
      if (monitorScreen) {
        monitorScreen.style.backgroundColor = this.state.viewframeColor;
      }
    }
  }

  // Direct CRT toggling that works with the context
  handleCRTToggle = (e) => {
    // Ensure correct cursor style is maintained by stopping event propagation
    e.stopPropagation();
    
    // Access toggleCrt method from context and call it directly
    if (this.context && typeof this.context.toggleCrt === 'function') {
      this.context.toggleCrt();
    }
  }

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
    const monitorContainer = document.querySelector('.monitor-container');
    
    if (monitorContainer) {
      if (zoomFactor > 1) {
        monitorContainer.style.transform = `scale(${zoomFactor})`;
        monitorContainer.style.transformOrigin = 'center center';
        monitorContainer.classList.add('zoomed');
      } else {
        monitorContainer.style.transform = '';
        monitorContainer.style.transformOrigin = '';
        monitorContainer.classList.remove('zoomed');
      }
    }
  }
  
  // Reset zoom
  resetZoom = () => {
    if (this.state.isMobile) return;
    
    const monitorContainer = document.querySelector('.monitor-container');
    
    if (monitorContainer) {
      monitorContainer.style.transform = '';
      monitorContainer.style.transformOrigin = '';
      monitorContainer.classList.remove('zoomed');
    }
  }

  // Detect mobile devices
  checkIsMobile = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || window.innerWidth < 1024;
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
    
    this.setState({ 
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      // Reset power button on resize to prevent incorrect positioning
      powerButtonReady: false
    }, () => {
      // If monitor is showing, recalculate power button position after a delay
      if (this.state.showMonitor) {
        setTimeout(() => {
          this.setState({ powerButtonReady: true });
        }, 200);
      }
    });
  };

  toggleMonitorView = () => {
    if (this.state.isMobile) return;
    
    console.log("Monitor Mode button clicked, current state:", this.state.showMonitor);
    this.setState(prevState => ({
      showMonitor: !prevState.showMonitor,
      // Reset power button ready state when toggling monitor off
      powerButtonReady: prevState.showMonitor ? false : prevState.powerButtonReady
    }), () => {
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
    });
  };

  toggleScreensaver = () => {
    if (this.state.isMobile) return;
    
    console.log("Screensaver Mode button clicked, current state:", this.state.showScreensaver);
    this.setState(prevState => ({
      showScreensaver: !prevState.showScreensaver,
      // Reset to default screensaver when toggling off and back on
      activeScreensaver: !prevState.showScreensaver ? 'default' : prevState.activeScreensaver,
      // Reset button states when toggling screensaver off
      rocketActive: !prevState.showScreensaver ? false : prevState.rocketActive,
      nextActive: !prevState.showScreensaver ? false : prevState.nextActive
    }), () => {
      console.log("Screensaver state updated to:", this.state.showScreensaver);
      
      // Update background color
      this.updateBackgroundColor();
    });
  };

  // Fixed toggle functions for MonitorView component
// These need to be integrated into the MonitorView.js file

  // Fix for the toggleRocket function
  toggleRocket = () => {
    if (this.state.isMobile) return;
    
    console.log("Rocket button clicked, current state:", this.state.rocketActive);
    
    this.setState(prevState => {
      // Define the new state based on current state
      const newRocketActive = !prevState.rocketActive;
      
      // Create full state update to ensure consistency
      return {
        rocketActive: newRocketActive,
        // Use p5js (Stars) when activating rocket, default when deactivating
        activeScreensaver: newRocketActive ? 'p5js' : 'default',
        // No next button needed
        nextActive: false,
        // When activating rocket, hide monitor. When deactivating, show it
        showMonitor: newRocketActive ? false : true,
        // Always keep screensaver active when in rocket mode
        showScreensaver: newRocketActive ? true : prevState.showScreensaver,
        // Update active viewframe category accordingly
        // activeViewframeCategory: newRocketActive ? 'animated' : 'static' - removed this since its not in my state
      };
    }, () => {
      console.log("Rocket state updated to:", this.state.rocketActive);
      console.log("Active screensaver:", this.state.activeScreensaver);
      console.log("Monitor mode set to:", this.state.showMonitor);
      console.log("Screensaver active:", this.state.showScreensaver);
      
      // Update background color
      this.updateBackgroundColor();
    });
  };

  // Fix for toggleCategory in the MonitorControlsPanel
  // This function needs to be implemented in the MonitorView component 
  // to ensure proper monitor visibility when switching categories
  toggleCategory = (category) => {
    // Ensure monitor and viewport restoration when switching between static/animated
    if (this.state.rocketActive) {
      // If rocket is active and switching to static, restore monitor and viewport
      if (category === 'static') {
        this.setState({
          rocketActive: false,
          showMonitor: true,
          activeScreensaver: 'default'
        });
      }
    }
    
    // Rest of the existing toggleCategory logic...
    // Only proceed if changing category
    if (category !== this.state.activeViewframeCategory) {
      this.setState({ activeViewframeCategory: category });
      
      // If switching to animated, enable screensaver
      if (category === 'animated' && !this.state.showScreensaver) {
        // Save the current color before switching
        this.lastColorRef.current = this.state.viewframeColor;
        this.toggleScreensaver();
      } 
      // If switching to static, disable screensaver
      else if (category === 'static' && this.state.showScreensaver) {
        this.toggleScreensaver();
        
        // Restore the color when switching back to static
        if (this.rootRef.current) {
          this.rootRef.current.style.backgroundColor = this.lastColorRef.current;
        }
      }
    } else {
      // If clicking the same category button again, allow toggling off animated
      if (category === 'animated' && this.state.showScreensaver) {
        this.setState({ activeViewframeCategory: 'static' });
        this.toggleScreensaver();
        
        // Restore the color when switching back to static
        if (this.rootRef.current) {
          this.rootRef.current.style.backgroundColor = this.lastColorRef.current;
        }
      }
    }
  };

  toggleNext = () => {
    if (this.state.isMobile) return;
    
    console.log("Next button clicked, current state:", this.state.nextActive);
    this.setState(prevState => ({
      nextActive: !prevState.nextActive,
      // Cycle between screensavers
      activeScreensaver: !prevState.nextActive 
        ? (prevState.activeScreensaver === 'default' ? 'p5js' : 'default')
        : prevState.activeScreensaver,
      // Make sure only one button is active at a time
      rocketActive: !prevState.nextActive && prevState.activeScreensaver === 'default'
    }), () => {
      console.log("Next state updated to:", this.state.nextActive);
      console.log("Active screensaver:", this.state.activeScreensaver);
    });
  };

  toggleScreenPower = () => {
    if (this.state.isMobile) return;
    
    console.log("Screen Power button clicked, current state:", this.state.isScreenPoweredOn);
    this.setState(prevState => ({
      isScreenPoweredOn: !prevState.isScreenPoweredOn
    }), () => {
      console.log("Power state updated to:", this.state.isScreenPoweredOn);
    });
  };

  // Set zoom level (used by controls panel)
  setZoomLevel = (level) => {
    if (this.state.isMobile) return;
    
    console.log("Zoom level button clicked, setting to:", level);
    this.setState({
      zoomLevel: level,
      zoomActive: level > 0 // Active when zoomed in
    }, () => {
      console.log("Zoom level updated to:", this.state.zoomLevel);
      
      // Apply the zoom scaling
      this.applyZoom(level);
    });
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

  renderMonitorControls() {
    if (this.state.isMobile || !this.state.powerButtonReady) return null;
    
    // Get CRT state directly from context
    const isCRTActive = this.context ? this.context.crt : true;
    
    return (
      <>
        {/* Monitor controls container */}
        <div className="monitor-controls" style={{
          position: 'absolute',
          bottom: 32,
          right: 160,
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'auto'
        }}>
          {/* Power indicator light */}
          <div 
            style={{
              position: 'absolute',
              width: 8,
              height: 8,
              left: -22,
              bottom: -5,
              borderRadius: '50%',
              backgroundColor: this.state.isScreenPoweredOn ? '#00ff00' : '#333333',
              boxShadow: this.state.isScreenPoweredOn ? '0 0 4px rgba(0, 255, 0, 0.8)' : '0 0 2px rgba(0, 0, 0, 0.5)',
              margin: '0 5px',
              transition: 'background-color 0.2s ease, box-shadow 0.3s ease'
            }}
            />
            </div>
        
        {/* CRT Effect toggle button */}
        <div style={{
          position: 'absolute',
          bottom: 60,
          right: 680,
          zIndex: 999,
          pointerEvents: 'auto'
        }}>
          <MonitorButton
            onClick={this.handleCRTToggle}
            isActive={isCRTActive}
            style={{
              width: '40px',
              height: '17px',
              backgroundColor: isCRTActive ? '#d5cca1' : '#d5cca1', //'#cabe93' : '#d5cca1'
              borderRadius: '0px',
              border: isCRTActive 
                ? 'inset 1px #888888' 
                : 'outset 1px #ffffff',
              boxShadow: isCRTActive 
                ? 'inset 1px 1px 1.5px rgba(0,0,0,0.5)' 
                : 'none',
              transform: isCRTActive
                ? 'inset 0 1px 1.5px rgba(255, 255, 255, 0.3), 0 1px 1.5px rgba(0, 0, 0, 0.2)'
                : 'inset 0 1px 1px rgba(0, 0, 0, 0.15)',
              color: isCRTActive ? '#5c5845' : '#fff7e6',
              transition: 'all 0.17s ease-in-out',
              fontSize: '9px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer' // Ensure cursor is always pointer
            }}
          >
          </MonitorButton>
        </div>
        
        {/* Power button - positioned separately */}
        <div style={{
          position: 'absolute',
          bottom: 1,
          right: 100,
          zIndex: 999,
          pointerEvents: 'auto',
          transition: 'background-color 0.4s ease, box-shadow 0.3s ease, border 0.3s ease, transform 0.3s ease, color 0.3s ease'
        }}>
          <MonitorButton
            onClick={this.toggleScreenPower}
            style={{
              width: '51px',
              height: '27px',
              backgroundColor: this.state.isScreenPoweredOn ? '#d5cca1' : '#d5cca1', //'#cabe93' : '#d5cca1'
              borderRadius: '0px',
              border: this.state.isScreenPoweredOn 
              ? 'inset 1px #888888' 
              : 'outset 1px #ffffff',
            boxShadow: this.state.isScreenPoweredOn 
              ? 'inset 1px 1px 1.5px rgba(0,0,0,0.5)' 
              : 'none',
              transform: !this.state.isScreenPoweredOn 
              ? 'inset 0 1px 1.5px rgba(255, 255, 255, 0.3), 0 1px 1.5px rgba(0, 0, 0, 0.2)'
              : 'inset 0 1px 1px rgba(0, 0, 0, 0.15)',
              color: this.state.isScreenPoweredOn ? '#5c5845' : '#fff7e6',
              transition: 'background-color 0.4s ease, box-shadow 0.3s ease'
            }}
          >
            {this.state.isScreenPoweredOn ? '' : ''}
          </MonitorButton>
        </div>
      </>
    );
  }

  renderDefaultStarfield() {
    // Only render if not mobile and screensaver mode is active and the active screensaver is 'default'
    if (this.state.isMobile || 
        !this.state.showScreensaver || 
        this.state.activeScreensaver !== 'default') {
      return null;
    }

    // Create portal for the default starfield
    return ReactDOM.createPortal(
      <StarfieldContainer />,
      this.starfieldRoot
    );
  }

  renderP5jsStarfield() {
    // Only render if not mobile and screensaver mode is active and the active screensaver is 'p5js'
    if (this.state.isMobile || 
        !this.state.showScreensaver || 
        this.state.activeScreensaver !== 'p5js') {
      return null;
    }

    // Create portal for the P5.js starfield
    return ReactDOM.createPortal(
      <Starfield2 />,
      this.p5jsStarfieldRoot
    );
  }

  // Updated renderMonitorView method to handle monitor toggling correctly
  renderMonitorView() {
    // Don't render anything if on mobile
    if (this.state.isMobile) return null;
    
    // Don't render desktop viewport if rocket emoji is active (rocketActive is true)
    if (this.state.rocketActive) return null;

    // Create content for monitor frame and desktop viewport
    const monitorContent = (
      <div
        id="monitor-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          overflow: 'hidden',
        }}
      >
        {/* Monitor container - scale both the monitor and desktop together */}
        <div
          className={`monitor-container ${this.state.zoomLevel > 0 ? 'zoomed' : ''}`}
          style={{
            position: 'relative',
            width: 'auto',
            height: 'auto',
            transition: 'transform 0.3s ease',
            transformOrigin: 'center center'
          }}
        >
          {/* Monitor frame - Only render if showMonitor is true */}
          <div
            ref={this.monitorFrameRef}
            className="monitor-frame"
            style={{
              position: 'relative',
              width: '800px',
              height: '700px',
            }}
          >
            {/* Desktop viewport / screen area - Always render regardless of showMonitor state */}
            <div
              className="monitor-screen"
              style={{
                position: 'absolute',
                top: 109, // Fixed position to match original
                left: 78,
                width: 643,
                height: 482,
                backgroundColor: this.state.showScreensaver ? 'transparent' : this.state.viewframeColor,
                zIndex: 98,
                overflow: 'hidden',
                transition: 'background-color 0.3s ease !important',
                borderRadius: '2px',
              }}
            >
              {/* This div allows us to properly pass mouse events to desktop content */}
              <div 
                className="desktop-content-wrapper"
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  // Don't block desktop interaction when power is on
                  pointerEvents: this.state.isScreenPoweredOn ? 'auto' : 'none'
                }}
              >
                {/* Children will be rendered here (desktop content) WORKS*/}
                {this.context.crt && this.state.zoomLevel > 0 && (
                  <div
                    className="crt-effect"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
                      backgroundSize: '100% 4px',
                      zIndex: 200,
                      pointerEvents: 'none',
                      opacity: 0.75 // Only rendered when zoomed
                    }}
                  />
                )}

                {this.props.children}
              </div>
              
              {/* Black overlay ALWAYS present, but with varying opacity */}
              <div 
                className={`black-overlay ${this.state.isScreenPoweredOn ? 'black-overlay-on' : 'black-overlay-off'}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'black',
                  zIndex: 999,
                  pointerEvents: 'none',
                  opacity: this.state.isScreenPoweredOn ? 0 : 1, // Key change here
                  transition: 'opacity 0.4s ease',
                  visibility: this.state.isScreenPoweredOn ? 'hidden' : 'visible', // Add after transition completes
                  transitionDelay: this.state.isScreenPoweredOn ? '0s, 0.4s' : '0s', // Delay visibility change
                  transitionProperty: 'opacity, visibility'
                }}
              />
            </div>

            {/* Only render monitor image if showMonitor is true */}
            {this.state.showMonitor && (
              <img
                src="/static/monitor3.png"
                alt="Windows 98 Monitor"
                style={{
                  position: 'absolute',
                  top: -116.5,
                  left: -155,
                  transform: 'scale(0.766, 0.752)',
                  transformOrigin: 'center center',
                  zIndex: 998,
                  userSelect: 'none', // Prevent selection
                  pointerEvents: 'none', // Don't interfere with mouse events
                  borderRadius: '12px', //not working
                }}
              />
            )}
            
            {/* Only render monitor buttons if showMonitor is true */}
            {this.state.showMonitor && this.renderMonitorControls()}
          </div>
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
        {/* Render screensavers and monitor view WITHOUT theme wrapper */}
        {this.renderDefaultStarfield()}
        {this.renderP5jsStarfield()}
        {this.renderBouncyBalls()}
        {this.renderFlowerBox()}
        {this.renderMonitorView()}
        
        {/* ONLY apply theme wrapper to the controls panel */}
        <MonitorThemeProvider>
          <MonitorControlsPanel 
            showMonitor={this.state.showMonitor} //essential
            toggleMonitorView={this.toggleMonitorView} //essential
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