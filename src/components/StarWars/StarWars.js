import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { rebelcommand16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

class StarWars extends Component {
  // Changed from 'Doom' to 'StarWars'
  render() {
    const { props } = this;

    return (
      <Window
        {...props}
        title="Rebel Command Prompt"
        icon={rebelcommand16}
        menuOptions={buildMenu({
          ...props,
          componentType: "StarWars", // Changed from 'Doom' to 'StarWars'
          showHelp: this.showHelp,
          options: {},
        })}
        Component={WindowProgram}
        initialHeight={window.innerWidth <= 420 ? 225 : 270}
        initialWidth={
          window.innerWidth <= 420 ? window.innerWidth * 0.978 : 505
        }
        initialX={window.innerWidth <= 420 ? 1 : 1}
        initialY={window.innerWidth <= 420 ? 1 : 1}
        resizable={false}
        onMaximize={window.innerWidth <= 420 ? null : undefined}
        className={cx("StarWars", props.className)} // Changed class name
      >
        <div
          style={{
            height: window.innerWidth <= 420 ? "225px" : "270px",
            width:
              window.innerWidth <= 420 ? window.innerWidth * 0.96 : "499px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <iframe
            src="https://www.asciimation.co.nz/"
            title="starwars"
            scrolling="no"
            style={{
              transform: window.innerWidth <= 420 ? "scale(.70)" : "scale(.82)",
              transformOrigin: "top left",
              width: "610px",
              height: "600px",
              position: "absolute",
              overflow: "hidden",
              top: window.innerWidth <= 420 ? "-95px" : "-100px",
              left: window.innerWidth <= 420 ? "-15px" : "0px",
              border: "none",
            }}
          />
        </div>
      </Window>
    );
  }
}

export default StarWars; // Changed from 'Doom' to 'StarWars'
// Note: This component is now specifically for Star Wars, not Doom
// It displays the Rebel Command Prompt with an ASCII art animation of Star Wars.
