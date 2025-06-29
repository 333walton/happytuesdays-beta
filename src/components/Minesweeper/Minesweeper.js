import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { minesweeper16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

class Minesweeper extends Component {
  // Changed from 'Doom' to 'Minesweeper'
  render() {
    const { props } = this;
    return (
      <Window
        {...props}
        title="Minesweeper"
        icon={minesweeper16}
        menuOptions={buildMenu({
          ...props,
          componentType: "Minesweeper", // Changed from 'Doom' to 'Minesweeper'
          showHelp: this.showHelp,
          options: {},
        })}
        Component={WindowProgram}
        initialHeight={247}
        initialWidth={166}
        resizable={false}
        onMaximize={null}
        className={cx("Minesweeper", props.className)}
      >
        <iframe
          src="/dist/minesweeper222.html"
          title="Minesweeper"
          width="100%"
          height="100%"
          style={{
            border: "none",
            left: "-1px",
          }}
          frameBorder="0"
          scrolling="no"
        />
      </Window>
    );
  }
}

export default Minesweeper; // Changed from 'Doom' to 'Minesweeper'
// Note: This component is now specifically for Minesweeper, not Doom
