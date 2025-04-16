import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { maze16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import FigletText from "./Internal";
import "./_styles.scss";

const fonts = ["Standard", "Slant", "Ghost", "Graffiti", "Sub-Zero", "Small"];

class ASCIIText extends Component {
  state = {
    text: "Hydra98",
    font: "Graffiti",
  };

  handleTextChange = (e) => this.setState({ text: e.target.value });
  handleFontChange = (e) => this.setState({ font: e.target.value });

  render() {
    const { props } = this;
    const { text, font } = this.state;

    return (
      <Window
        {...props}
        title="ASCII Banners"
        icon={maze16}
        Component={WindowProgram}
        initialHeight={320}
        initialWidth={440}
        resizable={true}
        onMaximize={null}
        className={cx("ASCIIText", props.className)}
        menuOptions={buildMenu({
          ...props,
          componentType: "ASCIIText",
        })}
      >
        <div className="ascii-banner-controls">
          <input
            type="text"
            value={text}
            onChange={this.handleTextChange}
            placeholder="Type something..."
          />
          <select value={font} onChange={this.handleFontChange}>
            {fonts.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="ascii-banner-output">
          <FigletText text={text} font={font} />
        </div>
      </Window>
    );
  }
}

export default ASCIIText;