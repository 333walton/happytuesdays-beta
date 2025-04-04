import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { calculator16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";
import Windows98Calculator from "./Internal";

class Calculator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAlert: false,
      isDesktop: window.innerWidth > 1024,
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

  showHelp = () => {
    this.setState({ showAlert: true });
  };

  render() {
    const { props } = this;

    return (
      <Window
        {...props}
        title="Calculator"
        icon={calculator16}
        menuOptions={buildMenu({
          ...props,
          componentType: "Doom",
          showHelp: this.showHelp,
        })}
        Component={WindowProgram}
        initialHeight={235}
        initialWidth={234} // ✅ Wider to fit layout
        forceNoMobileMax={true}
        className={cx("Doom", props.className)}
        theme={props.theme}
      >
        <div className="calculator-wrapper">
          <Windows98Calculator />
        </div>
      </Window>
    );
  }
}

export default Calculator;


