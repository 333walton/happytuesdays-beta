import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { burn16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

class Burn extends Component {
  render() {
    const { props } = this;
    return (
      <Window
        {...props}
        title="BURN (coming soon)"
        icon={burn16}
        menuOptions={buildMenu(props)}
        Component={WindowProgram}
        initialHeight={420}
        initialWidth={450}
        className={cx("JSDos", props.className)}
      >
        <iframe
          src="https://doom-flame.vercel.app/"
          title="Doom Flame"
          width="100%"
          height="100%"
          frameBorder="0"
        />
      </Window>
    );
  }
}

export default Burn;