import React, { Component } from "react";
import cx from "classnames";

class Win98Alert extends Component {
  render() {
    const { title, message, onClose } = this.props;
    
    // Handle multi-line messages by splitting on newlines
    const messageLines = message.split('\n').map((line, index) => (
      <p key={index} className="win98-alert-message-line">{line}</p>
    ));
    
    return (
      <div className="win98-alert-overlay">
        <div className="win98-alert-dialog">
          <div className="win98-alert-title">
            <div className="win98-alert-title-text">
              {title}
            </div>
            <button className="win98-alert-close" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="win98-alert-content">
            <div className="win98-alert-content-icon">
              <span className="win98-alert-icon-info">i</span>
            </div>
            <div className="win98-alert-message">
              {messageLines}
            </div>
          </div>
          <div className="win98-alert-buttons">
            <button 
              className="win98-alert-button"
              onClick={onClose}
              style={{
                WebkitAppearance: 'none',
                appearance: 'none',
                WebkitTextFillColor: '#000000',
                color: '#000000',
                borderRadius: 0
              }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Win98Alert;