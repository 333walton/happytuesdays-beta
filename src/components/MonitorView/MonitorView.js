import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './_styles.scss';

// Create a separate component for the toggle buttons
class CRTModeToggle extends Component {
  render() {
    const { label, isActive, onClick, top, left, className } = this.props;

    return (
      <button
        onClick={onClick}
        className={`submit-doodle-button ${isActive ? 'pressed' : ''} ${className || ''}`} // Include the custom class
        style={{
          position: 'fixed',
          top: top,
          left: left,
          zIndex: 101,
        }}
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
    };

    // Create root elements for our portals
    this.toggleRoot = document.createElement('div');
    this.toggleRoot.id = 'monitor-toggle-root';
    this.monitorRoot = document.createElement('div');
    this.monitorRoot.id = 'monitor-root';

    console.log("MonitorView constructor ran");
  }

  componentDidMount() {
    // Append portal roots to the document body
    document.body.appendChild(this.toggleRoot);
    document.body.appendChild(this.monitorRoot);

    // Add resize listener to detect mobile/desktop changes
    window.addEventListener('resize', this.handleResize);
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
    this.setState({ isMobile: this.checkIsMobile() });
  };

  toggleMonitorView = () => {
    console.log("Toggle button clicked, current state:", this.state.showMonitor);
    this.setState(prevState => ({
      showMonitor: !prevState.showMonitor,
    }), () => {
      console.log("State updated to:", this.state.showMonitor);
    });
  };

  toggleScreenPower = () => {
    console.log("Screen Power button clicked, current state:", this.state.isScreenPoweredOn);
    this.setState(prevState => ({
      isScreenPoweredOn: !prevState.isScreenPoweredOn,
    }), () => {
      console.log("State updated to:", this.state.isScreenPoweredOn);
    });
  };

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
          top="20px"
          left="20px"
        />
        <CRTModeToggle
          label="Power"
          isActive={this.state.isScreenPoweredOn}
          onClick={this.toggleScreenPower}
          top="799px" // Custom top position for the second button
          left="1171px" // Custom left position for the second button
          className="screen-power-button" // Ensure this class is added
        />
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
              top: '106px', // Adjust position inside the monitor frame
              left: '44px',
              width: '720px', // Size relative to the monitor-frame
              height: '488px',
              backgroundColor: this.state.isScreenPoweredOn ? 'transparent' : 'black', // Change background color based on screen power
              zIndex: 98,
              pointerEvents: 'none',
            }}
          ></div>

          {/* Monitor image */}
          <img
            src="/static/monitor2.png"
            alt="Windows 98 Monitor"
            style={{
              position: 'absolute',
              top: 7, // Original top position
              left: -75, // Original left position
              width: '120%', // Original width
              height: '120%', // Original height
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

        {/* Conditionally render the monitor view portal */}
        {this.renderMonitorView()}

        {/* Render any children if they exist */}
        {children}
      </>
    );
  }
}

export default MonitorView;