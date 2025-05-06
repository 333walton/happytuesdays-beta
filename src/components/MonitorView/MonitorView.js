import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './_styles.scss';


class MonitorView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMonitor: true,
      isMobile: this.checkIsMobile(),
    };
    console.log("MonitorView constructor ran");
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    console.log("MonitorView mounted");
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
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
    console.log("Toggle button clicked");
    this.setState((prevState) => ({ showMonitor: !prevState.showMonitor }));
  };

  renderMonitorView() {
    const { children } = this.props;

    // Create the monitor view content to be rendered in the portal
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
        {/* Exit button */}
        <button
          onClick={this.toggleMonitorView}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1000001,
            backgroundColor: '#ff0000',
            color: '#ffffff',
            padding: '5px 10px',
            border: '3px solid #000000',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Exit Monitor Mode
        </button>

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
    return ReactDOM.createPortal(monitorContent, document.body);
  }

  render() {
    console.log("MONITOR VIEW IS RENDERING");
    const { showMonitor, isMobile } = this.state;
    const { children } = this.props;

    // If on mobile, render only the children and hide the toggle button
    if (isMobile) {
      return children;
    }

    // Toggle button for normal view
    const toggleButton = (
      <button
        onClick={this.toggleMonitorView}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 999999,
          backgroundColor: '#ff0000',
          color: '#ffffff',
          padding: '10px 20px',
          border: '3px solid #000000',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        {showMonitor ? 'Exit Monitor Mode' : ''}
      </button>
    );

    // If not in monitor mode, just show regular view with toggle button
    if (!showMonitor) {
      return (
        <div className="hydra98-container">
          {toggleButton}
          {children}
        </div>
      );
    }

    // When in monitor mode, render both:
    // 1. A portal with the monitor view at document.body level
    // 2. The normal children (hidden) to maintain component hierarchy
    return (
      <>
        {this.renderMonitorView()}
        <div style={{ display: 'none' }}>{children}</div>
      </>
    );
  }
}

export default MonitorView;