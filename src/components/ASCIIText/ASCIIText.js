import React, { Component } from "react";
import Select from "react-select";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { asciibanner16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import FigletText from "./Internal";
import "./_styles.scss"; // Your app theme/styles

const fonts = [
  { value: "Train", label: "Train" },
  { value: "Slant Relief", label: "Slant Relief" },
  { value: "Colossal", label: "Colossal" },
  { value: "Standard", label: "Standard" },
  { value: "Shadow", label: "Shadow" },
  { value: "ANSI Shadow", label: "ANSI Shadow" },
];

class ASCIIText extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "TEST",
      font: window.innerWidth <= 768
        ? { value: "Train", label: "Train" }
        : { value: "Slant Relief", label: "Slant Relief" },
      asciiOutput: "",
      copyButtonLabel: "Copy",
      showSaveModal: false,
      saveFileName: "ascii-banner",
      saveFileType: "txt",
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

  confirmSave = () => {
    const { asciiOutput, saveFileName, saveFileType } = this.state;
    const blob = new Blob([asciiOutput], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = saveFileName.endsWith(`.${saveFileType}`)
      ? saveFileName
      : `${saveFileName}.${saveFileType}`;
    a.click();
    this.setState({ showSaveModal: false });
  };

  renderSaveAsModal() {
    return (
      <div className="modal-overlay" style={{
        position: 'fixed',
        zIndex: 9999,
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="pb-window modal" style={{
          width: 320,
          background: '#eee',
          border: '2px solid #000',
          boxShadow: '4px 4px #888',
          fontFamily: 'var(--font, Tahoma, sans-serif)',
        }}>
          <div className="pb-title-bar" style={{
            background: 'linear-gradient(to right, #0055aa, #3366cc)',
            color: 'white',
            padding: '4px 8px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <span>Save As</span>
            <button onClick={() => this.setState({ showSaveModal: false })}>✕</button>
          </div>

          <div className="pb-window-body" style={{ padding: '12px' }}>
            <label style={{ display: 'block', marginBottom: 8 }}>
              File name:
              <input
                type="text"
                value={this.state.saveFileName}
                onChange={(e) => this.setState({ saveFileName: e.target.value })}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: 4,
                  padding: 4,
                  fontSize: 13,
                }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: 12 }}>
              Save as type:
              <select
                value={this.state.saveFileType}
                onChange={(e) => this.setState({ saveFileType: e.target.value })}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: 4,
                  fontSize: 13,
                }}
              >
                <option value="txt">Text (*.txt)</option>
              </select>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                className="pb-button"
                onClick={this.confirmSave}
                style={{ padding: '4px 12px' }}
              >
                Save
              </button>
              <button
                className="pb-button"
                onClick={() => this.setState({ showSaveModal: false })}
                style={{ padding: '4px 12px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { props } = this;
    const { text, font, copyButtonLabel, showSaveModal } = this.state;
    const isMobile = window.innerWidth <= 768;

    return (
      <>
        {showSaveModal && this.renderSaveAsModal()}

        <Window
          {...props}
          title="ASCII Banners"
          icon={asciibanner16}
          Component={WindowProgram}
          initialWidth={isMobile ? 370 : 620}
          initialHeight={isMobile ? 207 : 266}
          maxWidth={isMobile ? 500 : 630}
          maxHeight={280}
          minWidth={isMobile ? 311 : 305}
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
            onSaveAs: () => this.setState({ showSaveModal: true }),
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
      </>
    );
  }
}

export default ASCIIText;