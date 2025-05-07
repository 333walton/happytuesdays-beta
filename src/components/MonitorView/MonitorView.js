import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./_styles.scss";
import StarfieldContainer from "../StarfieldContainer"; 
import Starfield2 from "../Starfield2";

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
const MonitorButton = ({ onClick, isActive, style }) => (
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
  />
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
      activeScreensaver: 'default', // Which screensaver to show: 'default' or 'p5js'
      isMobile: this.checkIsMobile(),
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      powerButtonReady: false, // State to track if power button position is ready
      zoomLevel: 0, // 0 = 100%, 1 = 110%, 2 = 125%
      zoomActive: false // Track if zoom button is pressed
    };

    // Only create DOM elements if not on mobile
    if (!this.state.isMobile) {
      // Create root elements for our portals
      this.toggleRoot = document.createElement('div');
      this.toggleRoot.id = 'monitor-toggle-root';
      this.monitorRoot = document.createElement('div');
      this.monitorRoot.id = 'monitor-root';
      this.starfieldRoot = document.createElement('div');
      this.starfieldRoot.id = 'starfield-root';
      this.p5jsStarfieldRoot = document.createElement('div');
      this.p5jsStarfieldRoot.id = 'p5js-starfield-root';
      
      // Reference to the monitor frame
      this.monitorFrameRef = React.createRef();
    }
    
    console.log("MonitorView constructor ran, isMobile:", this.state.isMobile);
  }

  componentDidMount() {
    // If on mobile, don't do any of the monitor setup
    if (this.state.isMobile) {
      console.log("Mobile device detected, skipping MonitorView initialization");
      return;
    }

    // Append portal roots to the document body
    document.body.appendChild(this.toggleRoot);
    document.body.appendChild(this.monitorRoot);
    document.body.appendChild(this.starfieldRoot);
    document.body.appendChild(this.p5jsStarfieldRoot);

    // Add resize listener to detect mobile/desktop changes
    window.addEventListener('resize', this.handleResize);
    
    // Set initial background color based on initial monitor state
    this.updateBackgroundColor();
    
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

    if (this.toggleRoot.parentNode) {
      this.toggleRoot.parentNode.removeChild(this.toggleRoot);
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

  // Update background color based on current state
  updateBackgroundColor = () => {
    // If screensaver is active, make background transparent to show starfield
    if (this.state.showScreensaver) {
      document.body.style.backgroundColor = 'transparent';
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.backgroundColor = 'transparent';
      }
    } 
    // If only monitor is active, use normal darkslategrey background
    else {
      document.body.style.backgroundColor = 'darkslategrey';
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.backgroundColor = '';
      }
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
        // Scale the entire monitor container
        monitorContainer.style.transform = `scale(${zoomFactor})`;
        monitorContainer.style.transformOrigin = 'center center';
        
        // Add a class for CSS targeting
        monitorContainer.classList.add('zoomed');
      } else {
        // Reset scaling
        monitorContainer.style.transform = '';
        monitorContainer.style.transformOrigin = '';
        
        // Remove zoomed class
        monitorContainer.classList.remove('zoomed');
      }
    }
    
    // Set data attribute on body for CSS targeting
    document.body.setAttribute('data-zoom', level.toString());
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
    
    // Reset zoom level data attribute on body
    document.body.removeAttribute('data-zoom');
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

  toggleScreensaverMode = () => {
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

  toggleRocket = () => {
    if (this.state.isMobile) return;
    
    console.log("Rocket button clicked, current state:", this.state.rocketActive);
    this.setState(prevState => ({
      rocketActive: !prevState.rocketActive,
      // Toggle between screensavers
      activeScreensaver: !prevState.rocketActive ? 'p5js' : 'default',
      // Make sure only one button is active at a time
      nextActive: false,
      // Turn off monitor mode when rocket is activated
      showMonitor: prevState.rocketActive
    }), () => {
      console.log("Rocket state updated to:", this.state.rocketActive);
      console.log("Active screensaver:", this.state.activeScreensaver);
      console.log("Monitor mode set to:", this.state.showMonitor);
      
      // Update background color
      this.updateBackgroundColor();
    });
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

  toggleZoom = () => {
    if (this.state.isMobile) return;
    
    console.log("Zoom button clicked, current level:", this.state.zoomLevel);
    
    // Calculate the next zoom level (cycling through 0, 1, 2)
    const nextZoomLevel = (this.state.zoomLevel + 1) % 3;
    
    this.setState({
      zoomLevel: nextZoomLevel,
      zoomActive: nextZoomLevel > 0 // Active when zoomed in
    }, () => {
      console.log("Zoom level updated to:", this.state.zoomLevel);
      
      // Apply the zoom scaling
      this.applyZoom(nextZoomLevel);
    });
  };

  renderMonitorControls() {
    if (this.state.isMobile || !this.state.powerButtonReady) return null;
    
    return (
      <div className="monitor-controls" style={{
        position: 'absolute',
        bottom: 32,
        right: 160, // Moved 100px left from original position
        zIndex: 999, // Higher z-index to ensure it's above everything
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'auto' // Ensure it's clickable
      }}>
        {/* Zoom level indicator */}
        {this.state.zoomLevel > 0 && (
          <div style={{
            position: 'absolute',
            top: -20,
            right: 70,
            backgroundColor: '#333',
            color: 'white',
            padding: '2px 4px',
            borderRadius: '2px',
            fontSize: '10px',
            fontFamily: 'Arial',
            boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
            pointerEvents: 'none'
          }}>
            {this.state.zoomLevel === 1 ? '110%' : '125%'}
          </div>
        )}
        
        {/* Use proper button elements for better click handling */}
        <MonitorButton 
          onClick={this.toggleZoom}
          isActive={this.state.zoomActive}
        />
        
        {/* Power indicator light */}
        <div 
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: this.state.isScreenPoweredOn ? '#00ff00' : '#333333',
            boxShadow: this.state.isScreenPoweredOn ? '0 0 4px rgba(0, 255, 0, 0.8)' : '0 0 2px rgba(0, 0, 0, 0.5)',
            margin: '0 5px'
          }}
        />
        
        <MonitorButton 
          onClick={this.toggleScreenPower}
          isActive={!this.state.isScreenPoweredOn}
        />
      </div>
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
                top: 110, // Fixed position to match original
                left: 80,
                width: 641,
                height: 482,
                backgroundColor: 'transparent', // Always transparent, black overlay is separate
                zIndex: 98,
                overflow: 'hidden',
                transition: 'background-color 0.3s ease',
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
                {/* Only render CRT effect if zoom level is 0 */}
                {this.state.zoomLevel === 0 && (
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
                      opacity: 0.15
                    }}
                  />
                )}
                
                {/* Children will be rendered here (desktop content) */}
                {this.props.children}
              </div>
              
              {/* Black overlay when power is off - ALWAYS ON TOP */}
              {!this.state.isScreenPoweredOn && (
                <div 
                  className="black-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'black',
                    zIndex: 999,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>

            {/* Only render monitor image if showMonitor is true */}
            {this.state.showMonitor && (
              <img
                src="/static/monitor3.png"
                alt="Windows 98 Monitor"
                style={{
                  position: 'absolute',
                  top: -115.5,
                  left: -155,
                  transform: 'scale(0.766, 0.758)',
                  transformOrigin: 'center center',
                  zIndex: 97,
                  userSelect: 'none', // Prevent selection
                  pointerEvents: 'none', // Don't interfere with mouse events
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

  renderToggleButton() {
    // Don't render on mobile
    if (this.state.isMobile) return null;

    // Create portal for the toggle buttons
    return ReactDOM.createPortal(
      <>
        {/* Monitor Mode Button */}
        <CRTModeToggle
          label="Monitor Mode"
          isActive={this.state.showMonitor}
          onClick={this.toggleMonitorView}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 101,
          }}
        />
        
        {/* Screensaver Mode Button - with identical styling but 40px lower */}
        <CRTModeToggle
          label="Screensaver"
          isActive={this.state.showScreensaver}
          onClick={this.toggleScreensaverMode}
          style={{
            position: 'fixed',
            top: '60px', // 40px below the Monitor Mode button
            left: '20px',
            zIndex: 101,
          }}
        />
        
        {/* Rocket Button - only visible when screensaver is active */}
        {this.state.showScreensaver && (
          <CRTModeToggle
            label="🚀"
            isActive={this.state.rocketActive}
            onClick={this.toggleRocket}
            isSquare={true} // Make it square
            style={{
              position: 'fixed',
              top: '100px', // 40px below the Screensaver Mode button
              left: '20px',
              zIndex: 101,
            }}
          />
        )}
        
        {/* Next Button - only visible when screensaver is active */}
        {this.state.showScreensaver && (
          <CRTModeToggle
            label="▶️"
            isActive={this.state.nextActive}
            onClick={this.toggleNext}
            isSquare={true} // Make it square
            style={{
              position: 'fixed',
              top: '100px', // Same height as Rocket button
              left: '82.5px', // Right next to Rocket button (rocket width 52.5px + 10px space)
              zIndex: 101,
            }}
          />
        )}
      </>,
      this.toggleRoot
    );
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
        {/* Add custom styles scoped to monitor components */}
        <style>
          {`
            /* Hide CRT effect when zoomed */
            .monitor-container.zoomed .crt-effect,
            [data-zoom="1"] .crt-effect,
            [data-zoom="2"] .crt-effect {
              display: none !important;
            }
            
            /* Ensure monitor controls styles don't affect other UI elements */
            .monitor-controls button {
              width: 18px !important;
              height: 18px !important;
              background: #c0c0c0 !important;
              border: outset 2px #ffffff !important;
              box-sizing: content-box !important;
              cursor: pointer !important;
              margin: 0 5px !important;
              padding: 0 !important;
              pointer-events: auto !important;
            }
            
            .monitor-controls button.active {
              border-style: inset !important;
              background-color: #a0a0a0 !important;
            }
            
            .monitor-controls button:hover {
              filter: brightness(1.1) !important;
            }
          `}
        </style>

        {/* Render the appropriate screensaver based on the active state */}
        {this.renderDefaultStarfield()}
        {this.renderP5jsStarfield()}
        
        {/* Always render the toggle buttons portal */}
        {this.renderToggleButton()}

        {/* Conditionally render the monitor view portal */}
        {this.renderMonitorView()}
      </>
    );
  }
}

export default MonitorView;