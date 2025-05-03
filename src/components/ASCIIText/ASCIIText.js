import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { asciibanner16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import FigletText from "./Internal";
import { ProgramContext } from "../../contexts";
import "./_styles.scss";

const fonts = [
  { value: "Train", label: "Train" },
  { value: "Slant Relief", label: "Slant Relief" },
  { value: "Colossal", label: "Colossal" },
  { value: "Standard", label: "Standard" },
  { value: "Shadow", label: "Shadow" },
  { value: "ANSI Shadow", label: "ANSI Shadow" },
];

class ASCIIText extends Component {
  static contextType = ProgramContext;

  constructor(props) {
    super(props);
    this.state = {
      text: "TEST",
      font: window.innerWidth <= 768
        ? { value: "Colossal", label: "Colossal" }
        : { value: "Slant Relief", label: "Slant Relief" },
      asciiOutput: "",
      copyButtonLabel: "Copy",
      showSaveModal: false,
      saveFileName: "ascii-banner",
      saveFileType: "txt",
      showMessageWindow: false,
      copyFormat: "plain",
      textColor: "green",
    };

    this.outputRef = React.createRef();
    this.isMobile = window.innerWidth <= 768;
  }

  componentDidMount() {
    this.handleResize = () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;
      
      if (wasMobile !== this.isMobile) {
        this.setState({
          font: this.isMobile
            ? { value: "Colossal", label: "Colossal" }
            : { value: "Slant Relief", label: "Slant Relief" }
        });
      }
    };
    
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleTextChange = (e) => this.setState({ text: e.target.value });

  handleFontChange = (selectedOption) =>
    this.setState({ font: selectedOption });

  handleCopy = () => {
    const { asciiOutput, copyFormat } = this.state;
    
    if (copyFormat === "plain") {
      navigator.clipboard.writeText(asciiOutput).then(() => {
        this.setState({ copyButtonLabel: "Copied!" });
        setTimeout(() => {
          this.setState({ copyButtonLabel: "Copy" });
        }, 2000);
      });
    } else if (copyFormat === "markdown") {
      const markdownOutput = "```\n" + asciiOutput + "\n```";
      navigator.clipboard.writeText(markdownOutput).then(() => {
        this.setState({ copyButtonLabel: "Copied!" });
        setTimeout(() => {
          this.setState({ copyButtonLabel: "Copy" });
        }, 2000);
      });
    } else if (copyFormat === "html") {
      const htmlOutput = `<pre style="font-family: monospace; white-space: pre; line-height: 1;">${asciiOutput}</pre>`;
      
      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([asciiOutput], { type: 'text/plain' }),
        'text/html': new Blob([htmlOutput], { type: 'text/html' })
      });
      
      navigator.clipboard.write([clipboardItem]).then(() => {
        this.setState({ copyButtonLabel: "Copied!" });
        setTimeout(() => {
          this.setState({ copyButtonLabel: "Copy" });
        }, 2000);
      }).catch((err) => {
        navigator.clipboard.writeText(asciiOutput).then(() => {
          this.setState({ copyButtonLabel: "Copied!" });
          setTimeout(() => {
            this.setState({ copyButtonLabel: "Copy" });
          }, 2000);
        });
      });
    }
  };

  handleAsciiGenerated = (ascii) => {
    this.setState({ asciiOutput: ascii });
  };

  handleColorToggle = (e) => {
    const newColor = e.target.checked ? "white" : "green";
    this.setState({ textColor: newColor });
  };

  confirmSave = () => {
    this.setState({
      showSaveModal: false,
      showMessageWindow: true,
    });

    if (this.context?.setRecycleBinFull) {
      this.context.setRecycleBinFull(true);
    }
  };

  renderSaveAsModal() {
    return (
      <div className="modal-overlay">
        <div className="pb-window modal">
          <div className="pb-title-bar">
            <span>Save As</span>
            <button onClick={() => this.setState({ showSaveModal: false })}>✕</button>
          </div>

          <div className="pb-window-body">
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

  renderMessageWindow() {
    return (
      <Window
        title="File Location"
        icon={asciibanner16}
        Component={WindowProgram}
        initialWidth={330}
        initialHeight={177}
        resizable={false}
        className="always-blue-heading Window--active"
        onClose={() => this.setState({ showMessageWindow: false })}
      >
        <div style={{ padding: "10px", fontSize: "13px" }}>
          <strong>Well this is awkward...</strong>
          <br />
          <br />
          After a scan of your art, it was determined that it belongs in the <strong>Recycle Bin</strong>.
          <br />
          <br />
          If you really want to save that, you can find it in there.
          <div style={{ marginTop: "18px", textAlign: "center" }}>
            <button
              className="pb-button"
              onClick={() => this.setState({ showMessageWindow: false })}
            >
              OK
            </button>
          </div>
        </div>
      </Window>
    );
  }

  render() {
    const { props } = this;
    const { text, font, copyButtonLabel, showSaveModal, showMessageWindow, copyFormat, textColor } = this.state;

    return (
      <>
        {showSaveModal && this.renderSaveAsModal()}
        {showMessageWindow && this.renderMessageWindow()}

        <Window
          {...props}
          title="ASCII Banners"
          icon={asciibanner16}
          Component={WindowProgram}
          initialWidth={this.isMobile ? 370 : 620}
          initialHeight={this.isMobile ? 211 : 244}
          maxWidth={630}
          maxHeight={280}
          minWidth={340}
          minHeight={177}
          initialX={1}
          initialY={1}
          forceNoMobileMax={true}
          resizable={true}
          onMaximize={null}
          className={cx("ASCIIText", "hide-maximize", props.className)}
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
            />
            <div className="dropdown">
              <select
                value={font.value}
                onChange={(e) => {
                  const selectedFont = fonts.find((f) => f.value === e.target.value);
                  this.handleFontChange(selectedFont);
                }}
              >
                {fonts.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="dropdown copy-format" title={
              copyFormat === "plain" ? "Best for: Text editors & terminals" :
              copyFormat === "markdown" ? "Best for: GitHub, Discord & Markdown" :
              "Best for: Email, Word & rich text editors"
            }>
              <select
                value={copyFormat}
                onChange={(e) => this.setState({ copyFormat: e.target.value })}
              >
                <option value="plain">Plain Text</option>
                <option value="markdown">Markdown</option>
                <option value="html">HTML</option>
              </select>
            </div>
            <button onClick={this.handleCopy}>
              {copyButtonLabel}
            </button>
            <div className="color-toggle">
              <input
                type="checkbox"
                id="colorToggle"
                checked={textColor === "white"}
                onChange={this.handleColorToggle}
              />
              <label htmlFor="colorToggle" title="Toggle text color (Green/White)"></label>
            </div>
          </div>

          <div className="ascii-banner-output-wrapper">
            <div 
              className="ascii-banner-output"
              ref={this.outputRef}
              data-color={textColor}
            >
              <FigletText
                text={text}
                font={font.value}
                onAsciiGenerated={this.handleAsciiGenerated}
              />
            </div>
          </div>
        </Window>
      </>
    );
  }
}

export default ASCIIText;