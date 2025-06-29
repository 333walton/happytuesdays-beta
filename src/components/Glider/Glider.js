import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { glider16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

class Glider extends Component {
  // Changed from 'Doom' to 'Glider'
  render() {
    const { props } = this;
    return (
      <Window
        {...props}
        title="GliderPro"
        icon={glider16}
        menuOptions={buildMenu({
          ...props,
          componentType: "Glider", // Changed from 'Doom' to 'Glider'
          showHelp: this.showHelp,
          options: {},
        })}
        Component={WindowProgram}
        initialHeight={399}
        initialWidth={432}
        resizable={false}
        onMaximize={null}
        className={cx("Glider", props.className)} // Changed class name too
      >
        <div
          style={{
            width: "424.8px",
            height: "372px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <iframe
            src="https://gabrieljones.github.io/Glider/"
            title="gliderpro"
            style={{
              transform: "scale(0.67)",
              transformOrigin: "top left",
              width: "1540px",
              height: "1212px",
              position: "absolute",
              top: "-17px",
              left: "-304px",
              border: "none",
            }}
          />
        </div>
      </Window>
    );
  }
}

export default Glider; // Changed from 'Doom' to 'Glider'
