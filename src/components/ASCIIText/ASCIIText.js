import React, { Component } from "react";
import Select from "react-select";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { asciibanner16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import FigletText from "./Internal";
import "./_styles.scss";

const fonts = [/* unchanged font array here */];

class ASCIIText extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "TEST",
      font: window.innerWidth <= 768
      ? { value: "Train", label: "Train" } // Mobile
      : { value: "Colossal", label: "Colossal" }, // Desktop
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
      setTimeout(this.adjustWindowSize, 0);
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

  // ✅ Save functions now match what buildMenu expects
  //handleSave = (props) => {
    //const { asciiOutput } = this.state;
    //console.log("Saved ASCII output:", asciiOutput);
    //alert("Saved!");
  //};

  handleSaveAs = (props) => {
    const { asciiOutput } = this.state;
    const blob = new Blob([asciiOutput], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ascii-banner.txt";
    a.click();
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
        initialWidth={isMobile ? 340 : windowWidth}
        initialHeight={windowHeight}
        maxWidth={630}
        maxHeight={265}
        minWidth={340}
        minHeight={177}
        initialX={1}
        initialY={1}
        forceNoMobileMax={true}
        resizable={true}
        onMaximize={null}
        className={cx("ASCIIText", props.className)}
        menuOptions={buildMenu({
          ...props,
          componentType: "ASCIIText",
          onSaveAs: this.handleSaveAs,
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

        <div className="ascii-banner-output" ref={this.outputRef}>
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
