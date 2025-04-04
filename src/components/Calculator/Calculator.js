import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
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
      showAlert: true,
      isDesktop: window.innerWidth > 1024
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

    return (
      <>
        <Window
          {...props}
          title="Calculator"
          icon={doom16}
          menuOptions={buildMenu({
            ...props,
            componentType: "Doom",
            showHelp: this.showHelp
          })}
          Component={WindowProgram}
          initialHeight={257}
          initialWidth={215}
          forceNoMobileMax={true} // this toggles auto-maximize on mobile devices
          className={cx("Doom", props.className)}
        >
          <Windows98Calculator />
        </Window>
      </>
    );
  }
}

export default Doom;
