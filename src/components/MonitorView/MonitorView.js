import React, { Component } from 'react';

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
    this.setState((prevState) => ({ showMonitor: !prevState.showMonitor }));
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
            {/* Custom Button */}
            <button
              className="w98-button"
              onClick={this.toggleMonitorView}
            >
              CRT Mode
            </button>
          </div>
          {children}
        </div>
      );
    }

    return (
      <div className="windows98-monitor-container">
        <div className="desktop-icons">
          {/* Custom Button */}
          <button
            className="w98-button"
            onClick={this.toggleMonitorView}
          >
            Modern Mode
          </button>
        </div>

        <div className="monitor-frame">
          <div className="monitor-screen">{children}</div>
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

<MonitorView>
  <div>Your content here</div>
</MonitorView>