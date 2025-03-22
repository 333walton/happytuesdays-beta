import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { pipes16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

class Pipes extends Component {
  render() {
    const { props } = this;
    return (
      <Window
        {...props}
        title="Pipes"
        icon={pipes16}
        menuOptions={buildMenu(props)}
        Component={WindowProgram}
        initialHeight={420}
        initialWidth={450}
        className={cx("JSDos", props.className)}
      >
        <iframe
          src="https://play.ertdfgcvb.xyz/#/src/contributed/pathfinder"
          title="Pipes Ascii"
          width="100%"
          height="100%"
          style={{ border: "none", overflow: "hidden" }}
          scrolling="no"
          frameBorder="0"
        />
      </Window>
    );
  }
}

export default Pipes;