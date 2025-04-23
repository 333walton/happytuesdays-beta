import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { maze16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

class Doom extends Component {
  iframeRef = null;

  sendKeyToIframe = (label, key) => {
    const iframe = this.iframeRef;
    if (!iframe || !iframe.contentWindow || !iframe.contentWindow.document) return;

    const keyCodeMap = {
      ArrowUp: 38,
      ArrowDown: 40,
      ArrowLeft: 37,
      ArrowRight: 39,
    };

    const keyCode = keyCodeMap[key];
    if (!keyCode) return;

    const doc = iframe.contentWindow.document;

    ["keydown", "keyup"].forEach((type) => {
      const event = new KeyboardEvent(type, {
        key,
        keyCode,
        bubbles: true,
      });

      Object.defineProperty(event, "keyCode", { get: () => keyCode });
      Object.defineProperty(event, "which", { get: () => keyCode });

      doc.dispatchEvent(event);
    });

    console.log(`🔘 Pressed ${label} → Sent ${key} (${keyCode})`);
  };

  render() {
    const { props } = this;
    const isMobile = window.innerWidth <= 768;

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
        initialHeight={isMobile ? 315 : 263}
        initialWidth={isMobile ? 190 : 190}
        initialX={isMobile ? 1 : 1}
        initialY={isMobile ? 1 : 1}
        resizable={false}
        onMaximize={null}
        className={cx("Doom", props.className)}
      >
        <div
          style={{
            width: "184px", // was 280px
            height: "275px", // was 328px
            overflow: "hidden",
            position: "relative",
      }}
      >
        <iframe
          ref={(ref) => (this.iframeRef = ref)}
          src="/maze/index.html"
          title="ASCII Maze"
          style={{
            transform: "scale(0.75)", // shrink iframe content
            transformOrigin: "top left",
            width: "270px", // keep original width for scaling
            height: "280px",
            position: "relative",
            top: "1px",
            left: "1px",
            border: "none",
          }}
        />
      </div>

        {/* Mobile Controls */}
        <div className="ASCIIMaze-controls">
          <div className="row">
            <button onClick={() => this.sendKeyToIframe("Up", "ArrowUp")}>↑</button>
          </div>
          <div className="row">
            <button onClick={() => this.sendKeyToIframe("Left", "ArrowLeft")}>←</button>
            <button onClick={() => this.sendKeyToIframe("Down", "ArrowDown")}>↓</button>
            <button onClick={() => this.sendKeyToIframe("Right", "ArrowRight")}>→</button>
          </div>
        </div>
      </Window>
    );
  }
}

export default Doom;