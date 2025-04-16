import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { maze16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

class Doom extends Component {
  render() {
    const { props } = this;
    return (
      <Window
        {...props}
        title="ASCII Maze"
        icon={maze16}
        menuOptions={buildMenu({
          ...props,
          componentType: "Doom",
          showHelp: this.showHelp,
          options: {},
        })}
        Component={WindowProgram}
        initialHeight={260}
        initialWidth={280}
        resizable={false}  // This disables resizing
        onMaximize={null} // This disables the maximize button
        className={cx("Doom", props.className)}
      >
      <div // this will edit the iframe within the window above
        style={{
          width: "280px", // nearly match the initial width of the window above (iframe sizing)
          height: "280px", // nearly match the initial height of the window above (iframe sizing)
          overflow: "hidden",
          position: "relative",
        }}
      >
        <iframe
          src="https://www.windows93.net/c/programs/maze/index.html"
          title="ASCII Maze"
          style={{
            transform: "scale(1)",           // Shrink to 50%
            transformOrigin: "top left",       // Anchor scaling to the top-left
            width: "270px",                   // Scale width up so the visible area stays the same
            height: "200px",                  // Same for height
            position: "absolute",
            top: "1px",   // adjust these values
            left: "1px", // until canvas is centered
            border: "none",
          }}
        />
      </div>
      </Window>
    );
  }
}

export default Doom;