import React, { Component } from 'react';
// Comment out the packard-belle import if it's causing issues
// import { ButtonIconLarge } from 'packard-belle';
import './_styles.scss';
//import { sand16 } from "../../icons"; 

class MonitorView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMonitor: false,
      isMobile: false
    };
    console.log("MonitorView constructor ran");
  }

  componentDidMount() {
    this.checkIsMobile();
    window.addEventListener('resize', this.checkIsMobile);
    console.log("MonitorView mounted");
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkIsMobile);
  }

  checkIsMobile = () => {
    const isMobile = window.innerWidth < 1024;
    this.setState({ isMobile });
    
    if (isMobile) {
      this.setState({ showMonitor: false });
    }
  };

  toggleMonitorView = () => {
    console.log("Toggle button clicked");
    this.setState(prevState => ({ showMonitor: !prevState.showMonitor }));
  };

  render() {
    console.log("MONITOR VIEW IS RENDERING");
    const { showMonitor, isMobile } = this.state;
    const { children } = this.props;

    // Add this very obvious marker that should be visible regardless of styling
    const debugMarker = (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '50px',
        backgroundColor: 'red',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center',
        zIndex: 9999999,
        padding: '10px',
        border: '5px solid black'
      }}>
        MonitorView is active - Toggle button should be below this bar
      </div>
    );

    if (isMobile) {
      return (
        <>
          {debugMarker}
          {children}
        </>
      );
    }

    console.log("Rendering MonitorView, showMonitor:", showMonitor);

    // Create a plain, very visible button that should show up regardless of CSS
    const toggleButton = (
      <button 
        onClick={this.toggleMonitorView}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 9999,
          backgroundColor: '#ff0000',
          color: '#ffffff',
          padding: '10px 20px',
          border: '3px solid #000000',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        {showMonitor ? 'Exit CRT Mode' : 'Enter CRT Mode'}
      </button>
    );

    if (!showMonitor) {
      return (
        <div className="hydra98-container">
          {toggleButton}
          {children}
        </div>
      );
    }

    return (
      <div className="windows98-monitor-container">
        {toggleButton}
        <div className="monitor-frame">
          <div className="monitor-screen">
            {children}
          </div>
          {/* No image yet */}
        </div>
      </div>
    );
  }
}

export default MonitorView;