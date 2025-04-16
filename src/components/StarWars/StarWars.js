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
        initialHeight={307} // Set the initial height of the window  
        initialWidth={515} // Set the initial width of the window  
        resizable={false}  // This disables resizing
        onMaximize={null}  // This disables the maximize button
        className={cx("Doom", props.className)}
      >
      <div // this is the iframe within the window above
        style={{
          width: "508px", // nearly match the initial width of the window above (iframe sizing)
          height: "305px", // nearly match the initial height of the window above (iframe sizing)
          overflow: "hidden",
          position: "relative",
          }}
      >  
        <iframe
          src="https://www.asciimation.co.nz/"
          title="starwars"
          scrolling="no" // disables any scrolling within the iframe
          style={{
            transform: "scale(.87)",           // Shrinks the iframe
            transformOrigin: "top left",       // Anchor scaling to the top-left
            width: "620px",                   // Reduce the width to tighten the visible area
            height: "600px",                  // Same for height
            position: "absolute",
            top: "-103px",   // adjust these values
            left: "-11px", // until canvas is centered
            border: "none",
          }}
        />
      </div>
      </Window>
    );
  }
}

export default Doom;