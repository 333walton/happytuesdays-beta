// ClippyIntegration.js - Updated with animation restoration code

import { Component } from "react";

/**
 * ClippyIntegration handles integration between MonitorView's screen power state
 * and Clippy visibility. This component doesn't render anything visible.
 */
class ClippyIntegration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      observerReady: false,
      previousPowerState: props.isScreenPoweredOn, // Track previous state
    };

    this.blackOverlayObserver = null;
  }

  componentDidMount() {
    // Notify Clippy of initial power state
    this.notifyClippyOfPowerState(this.props.isScreenPoweredOn);

    // Add initial body class
    this.updateBodyScreenClass(this.props.isScreenPoweredOn);

    // Inject styles for Clippy/screen integration
    this.injectClippyStyles();

    // Set up observer for black overlay
    this.setupBlackOverlayObserver();
  }

  componentDidUpdate(prevProps) {
    // If screen power state changed, update Clippy
    if (prevProps.isScreenPoweredOn !== this.props.isScreenPoweredOn) {
      this.notifyClippyOfPowerState(this.props.isScreenPoweredOn);
      this.updateBodyScreenClass(this.props.isScreenPoweredOn);

      // Store previous state
      this.setState({ previousPowerState: prevProps.isScreenPoweredOn });

      // If turning screen back on, fix Clippy animations
      if (this.props.isScreenPoweredOn && !prevProps.isScreenPoweredOn) {
        // Wait a moment for the display transition to complete
        setTimeout(() => {
          this.restoreClippyAnimations();
        }, 500);
      }
    }
  }

  componentWillUnmount() {
    // Clean up black overlay observer
    if (this.blackOverlayObserver) {
      this.blackOverlayObserver.disconnect();
    }

    // Remove body class
    document.body.classList.remove("screen-off");

    // Remove style element
    const style = document.getElementById("clippy-monitor-integration");
    if (style && style.parentNode) {
      style.parentNode.removeChild(style);
    }
  }

  /**
   * Notify Clippy of screen power state changes
   */
  notifyClippyOfPowerState(isPoweredOn) {
    // Use the global window function if it exists
    if (window.setScreenPowerState) {
      console.log(
        `Notifying Clippy of screen power state: ${isPoweredOn ? "ON" : "OFF"}`
      );
      window.setScreenPowerState(isPoweredOn);
    }
  }

  /**
   * Add a global class to body based on screen power
   */
  updateBodyScreenClass(isPoweredOn) {
    if (isPoweredOn) {
      document.body.classList.remove("screen-off");
    } else {
      document.body.classList.add("screen-off");
    }
  }

  /**
   * Restore Clippy animations after screen power is turned back on
   * This fixes issues with animations not working after power state changes
   */
  restoreClippyAnimations() {
    console.log("Restoring Clippy animations after screen power on");

    // Find Clippy elements
    const clippyElement = document.querySelector(".clippy");
    const overlayElement = document.getElementById("clippy-clickable-overlay");

    if (clippyElement) {
      // CRITICAL: Reset Clippy styles completely
      clippyElement.style.visibility = "visible";
      clippyElement.style.opacity = "1";
      clippyElement.style.display = "block";
      clippyElement.style.pointerEvents = "none";

      // Re-apply the correct z-index
      clippyElement.style.zIndex = "1001";

      // Make SVG elements visible
      const svgElements = clippyElement.querySelectorAll("svg");
      if (svgElements.length > 0) {
        svgElements.forEach((svg) => {
          svg.style.visibility = "visible";
          svg.style.opacity = "1";
          svg.style.display = "inline";

          // Make all SVG children visible
          Array.from(svg.querySelectorAll("*")).forEach((el) => {
            el.style.visibility = "visible";
            el.style.opacity = "1";
            el.style.display = "inline";
          });
        });
      }

      // Reset animation maps
      const maps = clippyElement.querySelectorAll(".map");
      if (maps.length > 0) {
        maps.forEach((map) => {
          if (map.classList.contains("animate")) {
            map.style.display = "block";
            map.style.visibility = "visible";
            map.style.opacity = "1";
          }
        });
      }
    }

    // Restore overlay
    if (overlayElement) {
      overlayElement.style.visibility = "visible";
      overlayElement.style.pointerEvents = "auto";
      overlayElement.style.zIndex = "1002";
    }

    // Apply temporary animation fix style
    const fixStyle = document.createElement("style");
    fixStyle.id = "clippy-powerup-fix";
    fixStyle.textContent = `
      .clippy * {
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
      }
      
      .clippy-animate,
      .clippy-animate * {
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
        animation: auto !important;
      }
      
      .clippy svg,
      .clippy svg * {
        visibility: visible !important;
        opacity: 1 !important;
        display: inline !important;
      }
      
      /* Ensure transform doesn't block animations */
      .clippy {
        /* transform: scale(0.95) !important; */ /* Removed to prevent override */
        transform-origin: center bottom !important;
        z-index: 1001 !important;
      }
    `;
    document.head.appendChild(fixStyle);

    // Test animation to "wake up" Clippy
    setTimeout(() => {
      if (window.clippy && window.clippy.play) {
        try {
          // Play a simple animation to reset internal state
          window.clippy.play("Greeting");
          console.log("Clippy wake-up animation played");
        } catch (e) {
          console.error("Error playing wake-up animation:", e);
        }
      }

      // Remove the temporary style after animation
      setTimeout(() => {
        if (fixStyle.parentNode) {
          fixStyle.parentNode.removeChild(fixStyle);
        }
      }, 3000);
    }, 100);
  }

  /**
   * Set up observer for black overlay to detect external power changes
   */
  setupBlackOverlayObserver() {
    // Wait for black overlay to be rendered
    setTimeout(() => {
      const blackOverlay = document.querySelector(".black-overlay");
      if (!blackOverlay) {
        console.log("Black overlay not found, will retry");
        setTimeout(() => this.setupBlackOverlayObserver(), 500);
        return;
      }

      // Create mutation observer to watch for style changes
      this.blackOverlayObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "style"
          ) {
            // Get current opacity of the black overlay
            const opacity = parseFloat(blackOverlay.style.opacity);
            const isScreenOff = opacity >= 0.9; // Consider screen off when opacity is close to 1

            // Only update if there's a change in our view of power state
            const currentPowerState = !isScreenOff;
            if (currentPowerState !== this.props.isScreenPoweredOn) {
              // Notify parent component of the changed power state
              if (this.props.onPowerStateChange) {
                this.props.onPowerStateChange(currentPowerState);
              }

              // Also notify Clippy directly
              this.notifyClippyOfPowerState(currentPowerState);

              // Update body class
              this.updateBodyScreenClass(currentPowerState);

              // If turning screen back on, restore animations
              if (currentPowerState && !this.state.previousPowerState) {
                setTimeout(() => {
                  this.restoreClippyAnimations();
                }, 500);
              }

              // Update previous state
              this.setState({ previousPowerState: !currentPowerState });
            }
          }
        });
      });

      // Start observing
      this.blackOverlayObserver.observe(blackOverlay, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });

      this.setState({ observerReady: true });
      console.log("Black overlay observer set up successfully");
    }, 500);
  }

  /**
   * Inject CSS styles for proper Clippy integration
   */
  injectClippyStyles() {
    const styleElement = document.createElement("style");
    styleElement.id = "clippy-monitor-integration";
    styleElement.textContent = `
      /* When screen is off, hide Clippy and related elements */
      body.screen-off .clippy,
      body.screen-off #clippy-clickable-overlay,
      body.screen-off .custom-clippy-balloon,
      body.screen-off .custom-clippy-chat-balloon {
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        transition: visibility 0.3s, opacity 0.3s !important;
      }

      /* Ensure black overlay has higher z-index than other content */
      .black-overlay {
        z-index: 1000 !important;
      }
      
      /* Ensure Clippy has higher z-index than black overlay */
      .clippy {
        z-index: 1001 !important;
      }
      
      /* Make clickable overlay above Clippy */
      #clippy-clickable-overlay {
        z-index: 1002 !important;
      }
      
      /* Balloons should appear on top */
      .custom-clippy-balloon,
      .custom-clippy-chat-balloon {
        z-index: 1003 !important;
      }
      
      /* Critical animation fixes */
      .clippy-animate,
      .clippy-animate * {
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
        animation: auto !important;
      }
    `;
    document.head.appendChild(styleElement);
  }

  render() {
    // This component doesn't render anything visible
    return null;
  }
}

export default ClippyIntegration;
