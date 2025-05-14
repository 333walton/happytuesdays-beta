import React, { Component } from 'react';
import Window from '../tools/Window';
import { WindowProgram } from 'packard-belle';
import cx from 'classnames';
import './_styles.scss';

class StartMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showWelcomeAlert: false,
      isMobile: false,
      buttonPressed: false
    };
  }

  componentDidMount() {
    // Check if user is on mobile
    this.checkDeviceType();
    
    // Listen for the BIOS sequence completion
    window.addEventListener('biosSequenceCompleted', this.handleBiosCompletion);
    
    // For development - simulate BIOS completion if needed
    setTimeout(() => {
      console.log("Showing welcome alert");
      this.handleBiosCompletion();
    }, 1000);
  }
  
  componentWillUnmount() {
    window.removeEventListener('biosSequenceCompleted', this.handleBiosCompletion);
  }
  
  checkDeviceType = () => {
    const isMobile = window.innerWidth <= 768;
    this.setState({ isMobile });
  }
  
  handleBiosCompletion = () => {
    this.setState({ showWelcomeAlert: true });
  }
  
  closeWelcomeAlert = () => {
    this.setState({ showWelcomeAlert: false });
  }
  
  // Button press animation handlers
  handleButtonDown = () => {
    this.setState({ buttonPressed: true });
  }
  
  handleButtonUp = () => {
    this.setState({ buttonPressed: false });
    this.closeWelcomeAlert();
  }

  render() {
    if (!this.state.showWelcomeAlert) {
      return null;
    }
    
    const welcomeMessage = this.state.isMobile 
      ? "For best experience view this site on desktop" 
      : "Welcome to Hydra98! Please enjoy your experience";

    return (
      <Window
        title="Welcome"
        Component={WindowProgram}
        initialWidth={280}
        initialHeight={110}
        initialX={200}
        initialY={200}
        resizable={false}
        onClose={this.closeWelcomeAlert}
        className={cx(
          'welcome-window',
          'Window--active',
          { 'is-mobile': this.state.isMobile }
        )}
        style={{
          zIndex: 800
        }}
      >
        <div className="welcome-content" style={{
          padding: '8px 10px',
          backgroundColor: '#c0c0c0'
        }}>
          {/* Message area with icon */}
          <div style={{
            display: 'flex', 
            marginBottom: '8px',
            flexGrow: 1,
            alignItems: 'center'
          }}>
            {/* Icon */}
            <div style={{
              width: '40px',
              height: '40px',
              marginRight: '10px',
              backgroundImage: 'url(/static/windows98%20flag.gif)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              flexShrink: 0
            }}></div>
            
            {/* Message text */}
            <div style={{
              fontFamily: '"Microsoft Sans Serif", Tahoma, sans-serif',
              fontSize: '11px',
              lineHeight: '1.4',
              color: '#000'
            }}>
              {welcomeMessage}
            </div>
          </div>
          
          {/* Button area - Centered button with dotted border only on press */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 'auto',
            marginBottom: '3px'
          }}>
            <button 
              onMouseDown={this.handleButtonDown}
              onMouseUp={this.handleButtonUp}
              onMouseLeave={() => this.setState({ buttonPressed: false })}
              style={{
                fontFamily: '"Microsoft Sans Serif", Tahoma, sans-serif',
                fontSize: '11px',
                color: '#000000',
                bottom: '1px',
                background: '#c0c0c0',
                border: '2px solid',
                borderTopColor: this.state.buttonPressed ? '#808080' : '#dfdfdf',
                borderLeftColor: this.state.buttonPressed ? '#808080' : '#dfdfdf',
                borderRightColor: this.state.buttonPressed ? '#dfdfdf' : '#808080',
                borderBottomColor: this.state.buttonPressed ? '#dfdfdf' : '#808080',
                padding: '3px 6px',
                cursor: 'pointer',
                width: '82px',
                textAlign: 'center',
                position: 'relative',
                outline: this.state.buttonPressed ? '1px dotted #000' : 'none',
                outlineOffset: '-4px'
              }}
            >
              OK
            </button>
          </div>
        </div>
      </Window>
    );
  }
}

export default StartMessage;