import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './_styles.scss';

// Create a separate component for the toggle button
class CRTModeToggle extends Component {
  render() {
    const { showMonitor, toggleMonitorView } = this.props;
    
    return (
      <button
        onClick={toggleMonitorView}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1000001, // Highest z-index
          backgroundColor: '#ff0000',
          color: '#ffffff',
          padding: '10px 20px',
          border: '3px solid #000000',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        {showMonitor ? 'Exit Monitor Mode' : 'Enter Monitor Mode'}
      </button>
    );
  }
}

class MonitorView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMonitor: true, // Monitor mode enabled by default
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

  // Comprehensive mobile detection logic
  checkIsMobile = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || window.innerWidth < 1024;
  };

  handleResize = () => {
    this.setState({ isMobile: this.checkIsMobile() });
  };

  toggleMonitorView = () => {
    console.log("Toggle button clicked, current state:", this.state.showMonitor);
    this.setState(prevState => ({ 
      showMonitor: !prevState.showMonitor 
    }), () => {
      console.log("State updated to:", this.state.showMonitor);
    });
  };

  renderToggleButton() {
    // Don't render on mobile
    if (this.state.isMobile) return null;
    
    // Create portal for the toggle button
    return ReactDOM.createPortal(
      <CRTModeToggle 
        showMonitor={this.state.showMonitor} 
        toggleMonitorView={this.toggleMonitorView} 
      />,
      this.toggleRoot
    );
  }

  renderMonitorView() {
    const { children } = this.props;

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
          zIndex: 999999,
          overflow: 'hidden',
        }}
      >
        {/* Monitor container */}
        <div
          className="monitor-frame"
          style={{
            position: 'relative',
            width: '800px',
            height: '700px',
          }}
        >
          {/* Your app content positioned within the screen area */}
          <div
            className="monitor-screen"
            style={{
              position: 'absolute',
              top: '158px',
              left: '165px',
              width: '640px',
              height: '480px',
              zIndex: 999998,
              overflow: 'hidden',
            }}
          >
            {children}
          </div>

          {/* Monitor image */}
          <img
            src="/static/monitor2.png"
            alt="Windows 98 Monitor"
            style={{
              position: 'absolute',
              top: 7,
              left: -75,
              width: '120%',
              height: '120%',
              zIndex: 999997,
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
    const { showMonitor, isMobile } = this.state;
    const { children } = this.props;

    // Always render these items
    return (
      <>
        {/* Always render the toggle button portal */}
        {this.renderToggleButton()}
        
        {/* Conditionally render the monitor view portal */}
        {this.renderMonitorView()}
        
        {/* Main content - hide when in monitor mode */}
        <div className="hydra98-container" style={{ 
          display: (showMonitor && !isMobile) ? 'none' : 'block' 
        }}>
          {children}
        </div>
      </>
    );
  }
}

export default MonitorView;