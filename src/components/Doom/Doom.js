import React, { Component } from "react";
import { WindowProgram, WindowAlert } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { doom16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

class Doom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAlert: true, // State variable to control the visibility of the alert
      isDesktop: window.innerWidth > 1024 // State variable to check if the user is on a desktop
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize = () => {
    this.setState({ isDesktop: window.innerWidth > 1024 });
  };

  confirm = () => {
    this.setState({ showAlert: false });
  };

  showHelp = () => {
    this.setState({ showAlert: true });
  };

  render() {
    const { props } = this;
    const { showAlert, isDesktop } = this.state;

    const commonProps = {
      title: props.title,
      icon: props.icon,
      onClose: () => props.onClose(props)
    };

    return (
      <>
        <Window
          {...props}
          title="DOOM"
          icon={doom16}
          menuOptions={buildMenu({ ...props, componentType: "Doom", showHelp: this.showHelp })}
          Component={WindowProgram}
          initialHeight={388}
          initialWidth={560}
          className={cx("Doom", props.className, { "hide-maximize": !isDesktop })} // Add conditional class
          onMaximize={isDesktop ? undefined : null} // Disables maximize button on mobile
        >
          <iframe
            src="https://doom-jsdos.vercel.app/"
            title="Doom"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
          />
        </Window>

        {showAlert && isDesktop && (
          <WindowAlert
            {...commonProps}
            title="DOOM Controls" // Custom title for the WindowAlert
            onOK={this.confirm}
            onClose={this.confirm} // Separate handler for closing the alert
            className="IframeWindow--alert Window--active"
            style={{ zIndex: 1000 }} // Ensure the alert has a higher z-index
          >
            {props.data && props.data.disclaimer ? (
              props.data.disclaimer
            ) : (
              <div style={{ paddingTop: "px", paddingLeft: "5px", paddingRight: "5px" }}>
                <b>Arrows</b> - Move (up, down, left, right)<br></br>
                <b>Enter</b> - Use<br></br>
                <b>CTRL</b> - Shoot<br></br>
                <b>ESC</b> - Pause<br></br>
              </div>
            )}
          </WindowAlert>
        )}
      </>
    );
  }
}

export default Doom;