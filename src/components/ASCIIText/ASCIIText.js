import React, { Component } from "react";
import Select from "react-select";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { asciibanner16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import FigletText from "./Internal";
import "./_styles.scss";

const fonts = [
  { value: "Alligator2", label: "Alligator2" },
  { value: "ANSI Regular", label: "ANSI Regular" },
  { value: "ANSI Shadow", label: "ANSI Shadow" },
  { value: "Banner3-D", label: "Banner3-D" },
  { value: "Big Money-nw", label: "Big Money-nw" },
  { value: "Bloody", label: "Bloody" },
  { value: "BlurVision ASCII", label: "BlurVision ASCII" },
  { value: "Bright", label: "Bright" },
  { value: "Broadway", label: "Broadway" },
  { value: "Bulbhead", label: "Bulbhead" },
  { value: "Chunky", label: "Chunky" },
  { value: "Colossal", label: "Colossal" },
  { value: "Contessa", label: "Contessa" },
  { value: "Contrast", label: "Contrast" },
  { value: "Delta Corps Priest 1", label: "Delta Corps Priest 1" },
  { value: "Efti Water", label: "Efti Water" },
  { value: "Fire Font-k", label: "Fire Font-k" },
  { value: "Fuzzy", label: "Fuzzy" },
  { value: "Ghost", label: "Ghost" },
  { value: "Isometric3", label: "Isometric3" },
  { value: "Lean", label: "Lean" },
  { value: "Letters", label: "Letters" },
  { value: "Marquee", label: "Marquee" },
  { value: "Mini", label: "Mini" },
  { value: "Pawp", label: "Pawp" },
  { value: "Peaks Slant", label: "Peaks Slant" },
  { value: "Roman", label: "Roman" },
  { value: "Shadow", label: "Shadow" },
  { value: "Slant", label: "Slant" },
  { value: "Slant Relief", label: "Slant Relief" },
  { value: "Small", label: "Small" },
  { value: "Small Keyboard", label: "Small Keyboard" },
  { value: "Standard", label: "Standard" },
  { value: "Sub-Zero", label: "Sub-Zero" },
  { value: "Train", label: "Train" },
  { value: "Trek", label: "Trek" },
  { value: "Tubular", label: "Tubular" },
  { value: "Wavy", label: "Wavy" },
  { value: "Whimsy", label: "Whimsy" },
];

class ASCIIText extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "TEST",
      font: { value: "Sub-Zero", label: "Sub-Zero" },
      asciiOutput: "",
      copyButtonLabel: "Copy",
      windowWidth: 370,
      windowHeight: 207,
    };

    this.outputRef = React.createRef();
  }

  handleTextChange = (e) => this.setState({ text: e.target.value });

  handleFontChange = (selectedOption) =>
    this.setState({ font: selectedOption });

  handleCopy = () => {
    const { asciiOutput } = this.state;
    navigator.clipboard.writeText(asciiOutput).then(() => {
      this.setState({ copyButtonLabel: "Copied!" });
      setTimeout(() => {
        this.setState({ copyButtonLabel: "Copy" });
      }, 2000);
    });
  };

  handleAsciiGenerated = (ascii) => {
    this.setState({ asciiOutput: ascii }, () => {
      setTimeout(this.adjustWindowSize, 0); // Wait for render
    });
  };

  adjustWindowSize = () => {
    const el = this.outputRef.current;
    if (!el) return;

    const { scrollWidth, scrollHeight } = el;
    const padding = 100;
    const minWidth = 340;
    const minHeight = 177;
    const maxWidth = 630;
    const maxHeight = 280;

    const newWidth = Math.min(Math.max(scrollWidth + padding, minWidth), maxWidth);
    const newHeight = Math.min(Math.max(scrollHeight + padding, minHeight), maxHeight);

    this.setState({ windowWidth: newWidth, windowHeight: newHeight });
  };

  render() {
    const { props } = this;
    const { text, font, copyButtonLabel, windowWidth, windowHeight } = this.state;
    const isMobile = window.innerWidth <= 768;

    return (
      <Window
        {...props}
        title="ASCII Banners"
        icon={asciibanner16}
        Component={WindowProgram}
        initialWidth={windowWidth}
        initialHeight={windowHeight}
        maxWidth={630}
        maxHeight={265}
        minWidth={340}
        minHeight={177}
        initialX={isMobile ? 1 : 1}
        initialY={isMobile ? 1 : 1}
        forceNoMobileMax={true}
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
            style={{ height: "24px", fontSize: "12px" }}
          />
          <Select
            value={font}
            onChange={this.handleFontChange}
            options={fonts}
            styles={{
              control: (provided) => ({
                ...provided,
                minHeight: "24px",
                height: "24px",
                fontSize: "12px",
              }),
              valueContainer: (provided) => ({
                ...provided,
                padding: "0 13px",
                height: "24px",
              }),
              input: (provided) => ({
                ...provided,
                margin: 1,
                padding: 1,
              }),
              indicatorsContainer: (provided) => ({
                ...provided,
                height: "24px",
              }),
              dropdownIndicator: (provided) => ({
                ...provided,
                padding: "0 6px",
              }),
              menu: (provided) => ({
                ...provided,
                marginTop: "-.5px",
              }),
              menuList: (provided) => ({
                ...provided,
                maxHeight: "150px",
                padding: 0,
              }),
            }}
          />
          <button
            onClick={this.handleCopy}
            style={{ height: "24px", fontSize: "12px" }}
          >
            {copyButtonLabel}
          </button>
        </div>

        <div
          className="ascii-banner-output"
          ref={this.outputRef}>
          <FigletText
            text={text}
            font={font.value}
            onAsciiGenerated={this.handleAsciiGenerated}
          />
        </div>
      </Window>
    );
  }
}

export default ASCIIText;