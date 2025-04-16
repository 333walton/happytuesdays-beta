import React, { Component } from "react";
import { WindowProgram, WindowAlert } from "packard-belle";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";
import Window from "../tools/Window";
import PureIframe from "./Iframe";

class IFrame extends Component {
  // Initialize state
  state = {
    displayAlert: true, // Default to true unless explicitly disabled in props
  };

  confirm = () => this.setState({ displayAlert: false });

  render() {
    const { props, state } = this;

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
        initialHeight={props.data?.height || 380}
        initialWidth={props.data?.width || 440}
        minWidth={props.data?.width}
        minHeight={props.data?.height}
        menuOptions={props.data?.useMenu && buildMenu(props)}
        Component={WindowProgram}
        resizable={!(props.data?.width || props.data?.height)}
        hideOnDrag={true}
      >
        <div style={props.data?.style}>
          <PureIframe src={props.data?.src} title={props.title} />
        </div>
      </Window>
    );
  }
}

export default IFrame;
