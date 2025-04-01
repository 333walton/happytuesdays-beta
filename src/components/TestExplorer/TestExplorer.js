import React, { Component } from "react";
import cx from "classnames";
import nanoid from "nanoid";
import * as icons from "../../icons";
import "./_styles.scss";
import { WindowExplorer } from "packard-belle";
import Window from "../tools/Window";
import buildMenu from "../../helpers/menuBuilder";

const noop = () => {};

class TestExplorer extends Component {
  id = "b".concat(nanoid()).replace("-", "");

  render() {
    const { props } = this;
    const { src, title } = props.data || {};

    console.log("TestExplorer data:", props.data); // Debugging: Log the data prop

    return (
      <Window
        {...props}
        Component={WindowExplorer}
        className={cx("WindowExplorer", props.className)}
        title={title || "Test Explorer"}
        menuOptions={buildMenu(props)}
        minHeight={300}
        minWidth={300}
        explorerOptions={[
          {
            icon: icons.back,
            title: "Back",
            onClick: noop
          },
          {
            icon: icons.forward,
            title: "Forward",
            onClick: noop
          },
          {
            icon: icons.ieStop,
            title: "Stop",
            onClick: noop
          },
          {
            icon: icons.ieRefresh,
            title: "Refresh",
            onClick: noop
          },
          {
            icon: icons.ieHome,
            title: "Home",
            onClick: noop
          }
        ]}
        maximizeOnOpen
      >
        {src ? (
          <iframe
            className={this.id}
            frameBorder="0"
            src={src} // Use the dynamic src from props.data
            title={title || "Test Explorer"} // Use the dynamic title from props.data
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <p style={{ padding: "10px", textAlign: "center" }}>
            No content to display.
          </p>
        )}
      </Window>
    );
  }
}

export default TestExplorer;
