import React, { Component } from "react";
import Window from "../tools/Window";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import "./_styles.scss";

class StartMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showWelcomeAlert: false,
      isMobile: false,
      buttonPressed: false,
      windowPosition: {
        x: 200, // Default desktop position
        y: 200,
      },
      rocketModeToggled: false,
    };
  }

  componentDidMount() {
    // Check if user is on mobile and set position
    this.checkDeviceType();

    // Add resize listener to handle orientation changes
    window.addEventListener("resize", this.checkDeviceType);

    // Listen for the BIOS sequence completion
    window.addEventListener("biosSequenceCompleted", this.handleBiosCompletion);

    // Listen for rocket mode toggle events
    window.addEventListener("rocketModeToggled", this.handleRocketModeToggle);

    // Add simple document-level mouse event handlers
    document.addEventListener("mousedown", this.handleMouseDown);
    document.addEventListener("mouseup", this.handleMouseUp);

    // For development - simulate BIOS completion if needed
    setTimeout(() => {
      console.log("Showing welcome alert");
      this.handleBiosCompletion();
    }, 1000);
  }

  componentWillUnmount() {
    window.removeEventListener(
      "biosSequenceCompleted",
      this.handleBiosCompletion
    );
    window.removeEventListener(
      "rocketModeToggled",
      this.handleRocketModeToggle
    );
    window.removeEventListener("resize", this.checkDeviceType);
    document.removeEventListener("mousedown", this.handleMouseDown);
    document.removeEventListener("mouseup", this.handleMouseUp);
  }

  // Handle rocket mode toggle events
  handleRocketModeToggle = (event) => {
    this.setState({ rocketModeToggled: true });
  };

  // Simple global mouse handlers
  handleMouseDown = () => {
    document.body.classList.add("mouse-down");
  };

  handleMouseUp = () => {
    document.body.classList.remove("mouse-down");
    // Also reset the OK button state
    if (this.state.buttonPressed) {
      this.setState({ buttonPressed: false });
    }
  };

  checkDeviceType = () => {
    const isMobile = window.innerWidth <= 768;

    // Set window position based on device type
    const windowPosition = this.calculateWindowPosition(isMobile);

    this.setState({
      isMobile,
      windowPosition,
    });
  };

  // Calculate centered position based on viewport and window size
  calculateWindowPosition = (isMobile) => {
    const windowWidth = 290;
    const windowHeight = 110;

    // For mobile, position in the center of the screen
    if (isMobile) {
      return {
        x: Math.max(10, (window.innerWidth - windowWidth) / 2),
        y: Math.max(10, (window.innerHeight - windowHeight) / 2),
      };
    }

    // For desktop, keep original position
    return {
      x: 200,
      y: 200,
    };
  };

  handleBiosCompletion = () => {
    this.setState({ showWelcomeAlert: true });
  };

  closeWelcomeAlert = () => {
    this.setState({ showWelcomeAlert: false });
  };

  // Button press animation handlers
  handleButtonDown = () => {
    this.setState({ buttonPressed: true });
  };

  handleButtonUp = () => {
    this.setState({ buttonPressed: false });
    this.closeWelcomeAlert();
  };

  render() {
    // Don't render for mobile or after rocket mode has been toggled
    if (
      this.state.isMobile ||
      this.state.rocketModeToggled ||
      !this.state.showWelcomeAlert
    ) {
      return null;
    }

    const welcomeMessage = "Welcome! Please enjoy and don't break anything";

    return (
      <Window
        title="Welcome"
        Component={WindowProgram}
        initialWidth={290}
        initialHeight={137}
        initialX={this.state.windowPosition.x}
        initialY={this.state.windowPosition.y}
        resizable={false}
        onClose={this.closeWelcomeAlert}
        className={cx("welcome-window", "Window--active")}
        style={{
          zIndex: 800,
        }}
      >
        <div
          className="welcome-content"
          style={{
            padding: "8px 10px",
            backgroundColor: "#c0c0c0",
          }}
        >
          {/* Message area with icon */}
          <div
            style={{
              display: "flex",
              marginBottom: "8px",
              flexGrow: 1,
              alignItems: "center",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: "40px",
                height: "40px",
                marginRight: "10px",
                backgroundImage: "url(/static/windows98%20flag.gif)",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                flexShrink: 0,
              }}
            ></div>

            {/* Message text */}
            <div
              style={{
                fontFamily: '"Microsoft Sans Serif", Tahoma, sans-serif',
                fontSize: "11px",
                lineHeight: "1.4",
                color: "#000",
              }}
            >
              {welcomeMessage}
            </div>
          </div>

          {/* Button area */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "auto",
              marginBottom: "3px",
            }}
          >
            <button
              onMouseDown={this.handleButtonDown}
              onMouseUp={this.handleButtonUp}
              onMouseLeave={() => this.setState({ buttonPressed: false })}
              style={{
                fontFamily: '"Microsoft Sans Serif", Tahoma, sans-serif',
                fontSize: "11px",
                color: "#000000",
                bottom: "1px",
                background: "#c0c0c0",
                border: "2px solid",
                borderTopColor: this.state.buttonPressed
                  ? "#808080"
                  : "#dfdfdf",
                borderLeftColor: this.state.buttonPressed
                  ? "#808080"
                  : "#dfdfdf",
                borderRightColor: this.state.buttonPressed
                  ? "#dfdfdf"
                  : "#808080",
                borderBottomColor: this.state.buttonPressed
                  ? "#dfdfdf"
                  : "#808080",
                padding: "3px 6px",
                width: "82px",
                textAlign: "center",
                position: "relative",
                outline: this.state.buttonPressed ? "1px dotted #000" : "none",
                outlineOffset: "-4px",
                cursor: "default",
                WebkitAppearance: "none",
                WebkitTextFillColor: "#000000",
                appearance: "none",
                borderRadius: 0,
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
