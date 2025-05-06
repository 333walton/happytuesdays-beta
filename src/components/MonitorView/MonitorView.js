import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './_styles.scss';

// Create a separate component for the toggle buttons
class CRTModeToggle extends Component {
  render() {
    const { label, isActive, onClick, style, className, imageSrc } = this.props;

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

    // Default button rendering
    return (
      <button
        onClick={onClick}
        className={`submit-doodle-button ${isActive ? 'pressed' : ''} ${className || ''}`}
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
      isMobile: this.checkIsMobile(),
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      powerButtonReady: false // New state to track if power button position is ready
    };

    // Create root elements for our portals
    this.toggleRoot = document.createElement('div');
    this.toggleRoot.id = 'monitor-toggle-root';
    this.monitorRoot = document.createElement('div');
    this.monitorRoot.id = 'monitor-root';
    
    // Reference to the monitor frame
    this.monitorFrameRef = React.createRef();

    console.log("MonitorView constructor ran");
  }

  componentDidMount() {
    // Append portal roots to the document body
    document.body.appendChild(this.toggleRoot);
    document.body.appendChild(this.monitorRoot);

    // Add resize listener to detect mobile/desktop changes
    window.addEventListener('resize', this.handleResize);
    
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
    console.log("Toggle button clicked, current state:", this.state.showMonitor);
    this.setState(prevState => ({
      showMonitor: !prevState.showMonitor,
      // Reset power button ready state when toggling monitor off
      powerButtonReady: prevState.showMonitor ? false : prevState.powerButtonReady
    }), () => {
      console.log("State updated to:", this.state.showMonitor);
      
      // If turning monitor on, wait for it to render before showing power button
      if (this.state.showMonitor) {
        // Use a short timeout to ensure the monitor has rendered first
        setTimeout(() => {
          this.setState({ powerButtonReady: true });
        }, 200);
      }
    });
  };

  toggleScreenPower = () => {
    console.log("Screen Power button clicked, current state:", this.state.isScreenPoweredOn);
    this.setState(prevState => ({
      isScreenPoweredOn: !prevState.isScreenPoweredOn,
    }), () => {
      console.log("Power state updated to:", this.state.isScreenPoweredOn);
      
      // No need to recalculate position when toggling power
      // We're just changing the visual state of the button
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
        {/* Power button using image */}
        {this.state.showMonitor && this.state.powerButtonReady && (
        <CRTModeToggle
            label="Power"
            isActive={this.state.isScreenPoweredOn}
            onClick={this.toggleScreenPower}
            style={{
            ...this.calculatePowerButtonPosition(),
            left: `${parseInt(this.calculatePowerButtonPosition().left, 10) - 43}px`, // Shift 39px to the left
            top: `${parseInt(this.calculatePowerButtonPosition().top, 10) - 8}px`, // Shift 2px to the top
            // Remove the transform property since it's handled in the CSS
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
        {/* Always render the toggle button portal */}
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