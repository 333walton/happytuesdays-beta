import React, { Component } from 'react';
import { ButtonIconLarge } from 'packard-belle';

class MonitorView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMonitor: false,
      isMobile: false
    };
  }

  componentDidMount() {
    this.checkIsMobile();
    window.addEventListener('resize', this.checkIsMobile);
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
    this.setState(prevState => ({ showMonitor: !prevState.showMonitor }));
  };

  render() {
    const { showMonitor, isMobile } = this.state;
    const { children } = this.props;

    if (isMobile) {
      return children;
    }

    if (!showMonitor) {
      return (
        <div className="hydra98-container">
          <div className="desktop-icons">
            <ButtonIconLarge
              title="CRT Mode"
              onClick={this.toggleMonitorView}
            />
          </div>
          {children}
        </div>
      );
    }

    return (
      <div className="windows98-monitor-container">
        <div className="desktop-icons">
          <ButtonIconLarge
            title="Modern Mode"
            onClick={this.toggleMonitorView}
          />
        </div>

        <div className="monitor-frame">
          <div className="monitor-screen">
            {children}
          </div>
          <img 
            alt="Windows 98 Monitor" 
            className="monitor-image" 
          />
        </div>
      </div>
    );
  }
}

export default MonitorView;