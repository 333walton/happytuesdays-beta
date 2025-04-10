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
        initialHeight={395}
        initialWidth={433}
        resizable={false}  // This disables resizing
        onMaximize={null} // This disables the maximize button
        className={cx("Doom", props.className)}
      >
      <div
        style={{
          width: "500px", // Reduce the width to tighten the visible area
          height: "372px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <iframe
          src="https://gabrieljones.github.io/Glider/"
          title="gliderpro"
          width="1050"
          height="800"
          style={{
            transform: "scale(0.66)",           // Shrink to 50%
            transformOrigin: "top left",       // Anchor scaling to the top-left
            width: "1540px",                   // Scale width up so the visible area stays the same
            height: "1212px",                  // Same for height
            position: "absolute",
            top: "-17px",   // adjust these values
            left: "-295px", // until canvas is centered
            border: "none",
          }}
        />
      </div>
      </Window>
    );
  }
}

export default Doom;