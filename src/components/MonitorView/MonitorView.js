import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./_styles.scss";
import StarfieldContainer from "../StarfieldContainer"; 

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

class MonitorView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMonitor: true, // Monitor mode enabled by default
      isScreenPoweredOn: true, // Screen power is on by default
      showScreensaver: false, // Screensaver mode disabled by default
      rocketActive: false, // Rocket button state
      nextActive: false, // Next button state
      isMobile: this.checkIsMobile(),
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      powerButtonReady: false // State to track if power button position is ready
    };

    // Create root elements for our portals
    this.toggleRoot = document.createElement('div');
    this.toggleRoot.id = 'monitor-toggle-root';
    this.monitorRoot = document.createElement('div');
    this.monitorRoot.id = 'monitor-root';
    this.starfieldRoot = document.createElement('div');
    this.starfieldRoot.id = 'starfield-root';
    
    // Reference to the monitor frame
    this.monitorFrameRef = React.createRef();

    console.log("MonitorView constructor ran");
  }

  componentDidMount() {
    // Append portal roots to the document body
    document.body.appendChild(this.toggleRoot);
    document.body.appendChild(this.monitorRoot);
    document.body.appendChild(this.starfieldRoot);

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
    
    // Restore original background color when component unmounts
    document.body.style.backgroundColor = 'darkslategrey';
    
    // Reset root element background
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.backgroundColor = '';
    }
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

  // Detect mobile devices
  checkIsMobile = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || window.innerWidth < 1024;
  };

  // Update mobile state on resize
  handleResize = () => {
    this.setState({ 
      isMobile: this.checkIsMobile(),
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
    console.log("Screensaver Mode button clicked, current state:", this.state.showScreensaver);
    this.setState(prevState => ({
      showScreensaver: !prevState.showScreensaver
    }), () => {
      console.log("Screensaver state updated to:", this.state.showScreensaver);
      
      // Update background color
      this.updateBackgroundColor();
    });
  };

  toggleRocket = () => {
    console.log("Rocket button clicked, current state:", this.state.rocketActive);
    this.setState(prevState => ({
      rocketActive: !prevState.rocketActive
    }), () => {
      console.log("Rocket state updated to:", this.state.rocketActive);
      // You'll add rocket functionality here later
    });
  };

  toggleNext = () => {
    console.log("Next button clicked, current state:", this.state.nextActive);
    this.setState(prevState => ({
      nextActive: !prevState.nextActive
    }), () => {
      console.log("Next state updated to:", this.state.nextActive);
      // You'll add next screensaver functionality here later
    });
  };

  toggleScreenPower = () => {
    console.log("Screen Power button clicked, current state:", this.state.isScreenPoweredOn);
    this.setState(prevState => ({
      isScreenPoweredOn: !prevState.isScreenPoweredOn
    }), () => {
      console.log("Power state updated to:", this.state.isScreenPoweredOn);
    });
  };

  // Calculate position for the power button relative to the monitor image
  calculatePowerButtonPosition = () => {
    // Default position if we can't calculate
    let position = {
      position: 'fixed',
      top: '933px', // Default position
      left: '1176px',
      zIndex: 101,
    };

    // Calculate position based on monitor frame
    if (this.monitorFrameRef.current) {
      const monitorRect = this.monitorFrameRef.current.getBoundingClientRect();
      
      // Position relative to the monitor's bottom-right area (power button area)
      // These offsets position the button on the monitor's power button area
      const powerButtonOffsetTop = 669;  
      const powerButtonOffsetLeft = 667; 
      
      position = {
        position: 'fixed',
        top: `${monitorRect.top + powerButtonOffsetTop}px`,
        left: `${monitorRect.left + powerButtonOffsetLeft}px`,
        zIndex: 101,
      };
    }

    return position;
  };

  // Calculate position for the power indicator light relative to the monitor image
  calculateIndicatorPosition = () => {
    // Default position if we can't calculate
    let position = {
      position: 'fixed',
      top: '920px', // Higher than the power button
      left: '1100px', // To the left of the power button
      zIndex: 102,
    };

    // Calculate position based on monitor frame
    if (this.monitorFrameRef.current) {
      const monitorRect = this.monitorFrameRef.current.getBoundingClientRect();
      
      // Position relative to the monitor
      const indicatorOffsetTop = 669;  // Above the power button
      const indicatorOffsetLeft = 605; // To the left of the power button
      
      position = {
        position: 'fixed',
        top: `${monitorRect.top + indicatorOffsetTop}px`,
        left: `${monitorRect.left + indicatorOffsetLeft}px`,
        zIndex: 102,
      };
    }

    return position;
  };

  renderStarfield() {
    // Only render if screensaver mode is active
    if (!this.state.showScreensaver || this.state.isMobile) return null;

    // Create portal for the starfield
    return ReactDOM.createPortal(
      <StarfieldContainer />,
      this.starfieldRoot
    );
  }

  renderPowerIndicator() {
    // Don't render if monitor not showing, on mobile, or button not ready
    if (!this.state.showMonitor || this.state.isMobile || !this.state.powerButtonReady) return null;

    // Create the indicator light
    return ReactDOM.createPortal(
      <div
        className={`power-indicator ${this.state.isScreenPoweredOn ? 'on' : 'off'}`}
        style={{
          ...this.calculateIndicatorPosition(),
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: this.state.isScreenPoweredOn ? '#00ff00' : '#333333',
          boxShadow: this.state.isScreenPoweredOn ? '0 0 4px rgba(0, 255, 0, 0.8)' : '0 0 2px rgba(0, 0, 0, 0.5)',
          transition: 'all 0.3s ease',
          pointerEvents: 'none', // Don't block clicks
        }}
      />,
      this.toggleRoot
    );
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

        {/* Screensaver Button - with identical styling but 40px lower */}
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
        
        {/* Power button using image */}
        {this.state.showMonitor && this.state.powerButtonReady && (
          <CRTModeToggle
            label="Power"
            isActive={this.state.isScreenPoweredOn}
            onClick={this.toggleScreenPower}
            style={{
              ...this.calculatePowerButtonPosition(),
              left: `${parseInt(this.calculatePowerButtonPosition().left, 10) - 43}px`, // Shift 43px to the left
              top: `${parseInt(this.calculatePowerButtonPosition().top, 10) - 8}px`, // Shift 8px to the top
            }}
            className="screen-power-button"
            imageSrc="/static/btn1.png" // Pass the image source as a prop
          />
        )}
      </>,
      this.toggleRoot
    );
  }

  renderMonitorView() {
    // Don't render if not showing monitor or on mobile
    if (!this.state.showMonitor || this.state.isMobile) return null;

    // Create the monitor view content
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
          pointerEvents: 'none', // Make entire overlay click-through
        }}
      >
        {/* Monitor container */}
        <div
          ref={this.monitorFrameRef}
          className="monitor-frame"
          style={{
            position: 'relative', // Ensure the monitor-screen is positioned relative to this container
            width: '800px', // Original monitor frame size
            height: '700px',
            pointerEvents: 'none',
          }}
        >
          {/* Black square (screen) */}
          <div
            className="monitor-screen"
            style={{
              position: 'absolute', // Position relative to the monitor-frame
              top: '108px', // Adjust position inside the monitor frame
              left: '80px',
              width: '641px', // Size relative to the monitor-frame
              height: '482px',
              backgroundColor: this.state.isScreenPoweredOn ? 'transparent' : 'black', // Change background color based on screen power
              zIndex: 98,
              pointerEvents: 'none',
              transition: 'background-color 0.3s ease', // Add a short transition delay
              borderRadius: '2px', // Slightly round the corners
            }}
          ></div>

          {/* Monitor image */}
          <img
            src="/static/monitor3.png"
            alt="Windows 98 Monitor"
            style={{
              position: 'absolute',
              top: -115.5, // Original top position
              left: -155, // Original left position
              transform: 'scale(0.766, 0.758)', // Scale width by 76.5% and height by 76.4%
              transformOrigin: 'center center', // Scale from the center of the image
              zIndex: 97,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    );

    // Create a portal to render at document.body level
    return ReactDOM.createPortal(monitorContent, this.monitorRoot);
  }

  render() {
    console.log("MONITOR VIEW IS RENDERING, showMonitor:", this.state.showMonitor);
    const { children } = this.props;

    return (
      <>
        {/* Render the starfield when screensaver is active */}
        {this.renderStarfield()}
        
        {/* Always render the toggle buttons portal */}
        {this.renderToggleButton()}

        {/* Render the power indicator */}
        {this.renderPowerIndicator()}

        {/* Conditionally render the monitor view portal */}
        {this.renderMonitorView()}

        {/* Render any children if they exist */}
        {children}
      </>
    );
  }
}

export default MonitorView;