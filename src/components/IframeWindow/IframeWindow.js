import React, { Component } from "react";
import { WindowProgram, WindowAlert } from "packard-belle";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";
import Window from "../tools/Window";
import PureIframe from "./Iframe";

class IFrame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayAlert: true, // Default to true unless explicitly disabled in props
      isDesktop: window.innerWidth > 768 // State variable to check if the user is on a desktop
    };
  }

  confirm = () => this.setState({ displayAlert: false });

  render() {
    const { props, state } = this;
    const { displayAlert, isDesktop } = this.state;

    const commonProps = {
      title: props.title,
      icon: props.icon,
      onClose: () => props.onClose(props),
    };

    // Check if alerts are disabled for this iframe
    if (state.displayAlert && !props.data?.disableAlert) {
      return (
        <WindowAlert
          {...commonProps}
          onOK={this.confirm}
          onCancel={commonProps.onClose}
          className="IframeWindow--alert Window--active"
        >
          {props.data?.disclaimer || (
            <div>
              The following is an iframe, content belongs to{" "}
              {props.data?.creator || "the original creator"} at
              <a
                href={props.data?.src}
                target="_blank"
                rel="noopener noreferrer"
              >
                {props.data?.src}
              </a>
              . Behaviour will be inconsistent with rest of system.
            </div>
          )}
        </WindowAlert>
      );
    }

    return (
      <Window
        {...props}
        className={"IframeWindow"}
        initialX={isDesktop ? 20 : 23}
        initialY={isDesktop ? 10 : 3}
        initialHeight={isDesktop ? 335 : 335}
        initialWidth={isDesktop ? 389 : 389}
        minHeight={isDesktop ? 335 : 335}
        minWidth={isDesktop ? 389 : 389}
        menuOptions={props.data?.useMenu && buildMenu(props)}
        Component={WindowProgram}
        resizable={true} // Ensure resizing is enabled
        hideOnDrag={true}
        maximizeOnOpen={false} // Prevent automatic maximization
        forceNoMobileMax={true} // Prevent automatic maximization on mobile
        onRestore={this.restore} // Always enable the restore functionality
        onMaximize={this.maximize} // Always enable the maximize functionality
        disableMaximize={false}
      >
        <div style={props.data?.style}>
          <PureIframe src={props.data?.src} title={props.title} />
        </div>
      </Window>
    );
  }
}

export default IFrame;
