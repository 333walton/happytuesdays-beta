import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { rebelcommand16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

class Doom extends Component {
  render() {
    const { props } = this;

    return (
      <Window
        {...props}
        title="Rebel Command Prompt"
        icon={rebelcommand16}
        menuOptions={buildMenu({
          ...props,
          componentType: "Doom",
          showHelp: this.showHelp,
          options: {},
        })}
        Component={WindowProgram}
        initialHeight={window.innerWidth <= 420 ? 270 : 307} // Adjust height for mobile
        initialWidth={window.innerWidth <= 420 ? window.innerWidth * 0.98 : 515} // Adjust width for mobile
        initialX={window.innerWidth <= 420 ? 1 : 1} // Center horizontally on mobile
        initialY={window.innerWidth <= 420 ? 1 : 1} // Center vertically on mobile
        resizable={window.innerWidth > 420} // Disable resizing on mobile
        onMaximize={window.innerWidth <= 420 ? null : undefined} // Disable maximize button on mobile
        className={cx("Doom", "fixed-window", props.className)} // Add the custom class
      >
        <div
          style={{
            height: window.innerWidth <= 420 ? "305px" : "305px", // Adjust iframe height for mobile
            width: window.innerWidth <= 420 ? window.innerWidth * 0.967 : "508px", // Adjust iframe width for mobile
            overflow: "hidden",
            position: "relative",
          }}
        >
          <iframe
            src="https://www.asciimation.co.nz/"
            title="starwars"
            scrolling="no"
            style={{
              transform: window.innerWidth <= 420 ? "scale(.75)" : "scale(.87)", // Adjust scaling for mobile
              transformOrigin: "top left",
              width: "620px",
              height: "600px",
              position: "absolute",
              top: window.innerWidth <= 420 ? "-87px" : "-103px", // Adjust positioning for mobile
              left: window.innerWidth <= 420 ? "-28px" : "-11px",
              border: "none",
            }}
          />
        </div>
      </Window>
    );
  }
}

export default Doom;