import React, { Component } from "react";
import { WindowProgram, WindowAlert } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { doom16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";
import Windows98Calculator from "./Internal";

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
          title="Calculator"
          icon={doom16}
          menuOptions={buildMenu({ ...props, componentType: "Doom", showHelp: this.showHelp })}
          Component={WindowProgram}
          initialHeight={257}
          initialWidth={215}
          className={cx("Doom", props.className)}
        >
          <Windows98Calculator />
        </Window>

        
      
      </>
    );
  }
}

export default Doom;