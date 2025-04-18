import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { asciibanner16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import FigletText from "./Internal";
import "./_styles.scss";

const fonts = ["Standard", "Slant", "Ghost", "Sub-Zero", "Small"];

class ASCIIText extends Component {
  state = {
    text: "TEST",
    font: "Sub-Zero",
  };

  handleTextChange = (e) => this.setState({ text: e.target.value });
  handleFontChange = (e) => this.setState({ font: e.target.value });

  render() {
    const { props } = this;
    const { text, font } = this.state;
    const isMobile = window.innerWidth <= 768; // Define isMobile based on screen width

    return (
      <Window
        {...props}
        title="ASCII Banners"
        icon={asciibanner16}
        Component={WindowProgram}
        initialHeight={207}
        initialWidth={370}
        maxHeight={isMobile ? 207 : 260} 
        maxWidth={isMobile ? 410 : 630} 
        minHeight={177}
        minWidth={340}
        initialX={isMobile ? 1 : 1} 
        initialY={isMobile ? 1 : 1} 
        forceNoMobileMax={true} // Prevent automatic maximization on mobile
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