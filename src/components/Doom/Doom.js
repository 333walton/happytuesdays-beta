import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { doom16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

class Doom extends Component {
  render() {
    const { props } = this;
    return (
      <Window
        {...props}
        title="DOOM"
        icon={doom16}
        menuOptions={buildMenu(props)}
        Component={WindowProgram}
        initialHeight={410}
        initialWidth={560}
        className={cx("Doom", props.className)}
      >
        <iframe
          src="https://doom-jsdos.vercel.app/"
          title="Doom"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
        />
      </Window>
    );
  }
}

export default Doom;