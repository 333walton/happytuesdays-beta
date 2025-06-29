import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { maze16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

class ASCIIMaze extends Component {
  // Changed from 'Doom' to 'ASCIIMaze'
  iframeRef = null;

  sendKeyToIframe = (label, key) => {
    const iframe = this.iframeRef;
    if (!iframe || !iframe.contentWindow || !iframe.contentWindow.document)
      return;

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
          componentType: "ASCIIMaze", // Changed from 'Doom' to 'ASCIIMaze'
          showHelp: this.showHelp,
          options: {},
        })}
        Component={WindowProgram}
        initialHeight={isMobile ? 350 : 315}
        initialWidth={isMobile ? 270 : 280}
        initialX={1}
        initialY={1}
        resizable={false}
        onMaximize={null}
        className={cx("ASCIIMaze", props.className)} // Changed class name
      >
        <div
          style={{
            width: "260px",
            height: "250px",
            overflow: "hidden",
            position: "relative",
            background: "#bbc3c4",
          }}
        >
          <iframe
            ref={(ref) => (this.iframeRef = ref)}
            src="/maze/index.html"
            title="ASCII Maze"
            style={{
              width: "260px",
              height: "250px",
              border: "none",
              position: "relative",
            }}
          />
        </div>

        {/* Mobile Controls */}
        <div className="ASCIIMaze-controls">
          <div className="row">
            <button onClick={() => this.sendKeyToIframe("Up", "ArrowUp")}>
              ↑
            </button>
          </div>
          <div className="row">
            <button onClick={() => this.sendKeyToIframe("Left", "ArrowLeft")}>
              ←
            </button>
            <button onClick={() => this.sendKeyToIframe("Down", "ArrowDown")}>
              ↓
            </button>
            <button onClick={() => this.sendKeyToIframe("Right", "ArrowRight")}>
              →
            </button>
          </div>
        </div>
      </Window>
    );
  }
}

export default ASCIIMaze; // Changed from 'Doom' to 'ASCIIMaze'
// Note: This component is now specifically for ASCIIMaze, not Doom
// It displays an ASCII maze game with arrow key controls for navigation.
