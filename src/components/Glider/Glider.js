import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { glider16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

class Doom extends Component {
  render() {
    const { props } = this;
    return (
      <Window
        {...props}
        title="GliderPro"
        icon={glider16}
        menuOptions={buildMenu({
          ...props,
          componentType: "Doom",
          showHelp: this.showHelp,
          options: {},
        })}
        Component={WindowProgram}
        initialHeight={399}
        initialWidth={432}
        resizable={false}  // This disables resizing
        onMaximize={null} // This disables the maximize button
        className={cx("Doom", props.className)}
      >
      <div // this will edit the iframe within the window above
        style={{
          width: "424.8px", // nearly match the initial width of the window above (iframe sizing)
          height: "372px", // nearly match the initial height of the window above (iframe sizing)
          overflow: "hidden",
          position: "relative",
        }}
      >
        <iframe
          src="https://gabrieljones.github.io/Glider/"
          title="gliderpro"
          style={{
            transform: "scale(0.67)",           // Shrink to 50%
            transformOrigin: "top left",       // Anchor scaling to the top-left
            width: "1540px",                   // Scale width up so the visible area stays the same
            height: "1212px",                  // Same for height
            position: "absolute",
            top: "-17px",   // adjust these values
            left: "-304px", // until canvas is centered
            border: "none",
          }}
        />
      </div>
      </Window>
    );
  }
}

export default Doom;