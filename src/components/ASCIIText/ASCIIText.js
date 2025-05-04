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
      isCopied: false,
      showSaveModal: false,
      saveFileName: "ascii-banner",
      saveFileType: "txt",
      showMessageWindow: false,
      copyFormat: "plain",
      textColor: "green",
      //contentWidth: 460,
      contentHeight: { mobile: "270px", desktop: "190px" },
      contentWidth: { mobile: "400px", desktop: "535px" },
      //contentHeight: { mobile: '240', desktop: '240' },
      isMobileDevice: window.innerWidth <= 768,
    };

    this.outputRef = React.createRef();
    this.preRef = React.createRef();
    this.isMobile = window.innerWidth <= 768;
    this.resizeObserver = null;
  }

  componentDidMount() {
    this.handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      if (this.state.isMobileDevice !== isMobile) {
          this.setState({
            font: this.isMobile
              ? { value: "Colossal", label: "Colossal" }
              : { value: "Slant Relief", label: "Slant Relief" }});
      }
    };
    
    window.addEventListener('resize', this.handleResize);
    
    // Set up ResizeObserver to watch for content size changes
    this.resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        this.updateWindowSize();
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // When font or text changes, update the window size
    if (prevState.font !== this.state.font || prevState.text !== this.state.text) {
      this.updateWindowSize();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  updateWindowSize = () => {
    if (this.preRef.current) {
      const pre = this.preRef.current;
      const rect = pre.getBoundingClientRect();
      
      // Account for transform scale (0.9)
      const scaledWidth = rect.width / 0.9;
      const scaledHeight = rect.height / 0.9;
      
      // Add padding for controls and window chrome
      const controlsHeight = 45; // Height of controls
      const windowPadding = 40; // Extra padding for window chrome
      const horizontalPadding = 50; // Extra horizontal padding
      
      const newWidth = Math.max(340, Math.min(600, scaledWidth + horizontalPadding));
      const newHeight = Math.max(177, Math.min(400, scaledHeight + controlsHeight + windowPadding));
      
      this.setState({
        contentWidth: newWidth,
        contentHeight: newHeight,
      });
    }
  };

  handleTextChange = (e) => this.setState({ text: e.target.value });

  handleFontChange = (selectedOption) =>
    this.setState({ font: selectedOption });

  handleCopy = () => {
    const { asciiOutput, copyFormat } = this.state;
    
    if (copyFormat === "plain") {
      navigator.clipboard.writeText(asciiOutput).then(() => {
        this.setState({ isCopied: true });
        setTimeout(() => {
          this.setState({ isCopied: false });
        }, 2000);
      });
    } else if (copyFormat === "markdown") {
      const markdownOutput = "```\n" + asciiOutput + "\n```";
      navigator.clipboard.writeText(markdownOutput).then(() => {
        this.setState({ isCopied: true });
        setTimeout(() => {
          this.setState({ isCopied: false });
        }, 2000);
      });
    } else if (copyFormat === "html") {
      const htmlOutput = `<pre style="font-family: monospace; white-space: pre; line-height: 1;">${asciiOutput}</pre>`;
      
      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([asciiOutput], { type: 'text/plain' }),
        'text/html': new Blob([htmlOutput], { type: 'text/html' })
      });
      
      navigator.clipboard.write([clipboardItem]).then(() => {
        this.setState({ isCopied: true });
        setTimeout(() => {
          this.setState({ isCopied: false });
        }, 2000);
      }).catch((err) => {
        navigator.clipboard.writeText(asciiOutput).then(() => {
          this.setState({ isCopied: true });
          setTimeout(() => {
            this.setState({ isCopied: false });
          }, 2000);
        });
      });
    }
  };

  handleAsciiGenerated = (ascii) => {
    this.setState({ asciiOutput: ascii }, () => {
      // Update window size after ASCII is generated
      setTimeout(this.updateWindowSize, 0);
    });
  };

  handlePreRef = (el) => {
    this.preRef.current = el;
    
    if (el && this.resizeObserver) {
      this.resizeObserver.observe(el);
    }
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
        initialWidth={220}
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
    const { text, font, isCopied, showSaveModal, showMessageWindow, copyFormat, textColor, contentWidth, contentHeight } = this.state;

    return (
      <>
        {showSaveModal && this.renderSaveAsModal()}
        {showMessageWindow && this.renderMessageWindow()}

        <Window
          {...props}
          title="ASCII Banners"
          icon={asciibanner16}
          Component={WindowProgram}
          //initialWidth={contentWidth}
          //initialHeight={contentHeight}
          //maxWidth={600}
          maxHeight={300}
          maxWidth={this.state.isMobileDevice ? '414' : '530'} 
          //maxHeight={this.state.isMobileDevice ? 'contentHeight' : '300'}
          //minWidth={340}
          //minHeight={177}
          minWidth={this.state.isMobileDevice ? '340' : '340'}
          minHeight={this.state.isMobileDevice ? '177' : '177'}
          initialWidth={this.state.isMobileDevice ? this.state.contentWidth.mobile : this.state.contentWidth.desktop}
          initialHeight={this.state.isMobileDevice ? this.state.contentHeight.mobile : this.state.contentHeight.desktop}
          initialX={this.state.isMobileDevice ? '1' : '105'}
          initialY={this.state.isMobileDevice ? '1' : '1'}
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
              style={{
                WebkitTextFillColor: 'inherit',
                color: 'inherit'
              }}
            />
            <div className="dropdown">
              <select
                value={font.value}
                onChange={(e) => {
                  const selectedFont = fonts.find((f) => f.value === e.target.value);
                  this.handleFontChange(selectedFont);
                }}
                style={{
                  WebkitTextFillColor: 'inherit',
                  color: 'inherit',
                  WebkitAppearance: 'none'
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
                style={{
                  WebkitTextFillColor: 'inherit',
                  color: 'inherit',
                  WebkitAppearance: 'none'
                }}
              >
                <option value="plain">Plain Text</option>
                <option value="markdown">Markdown</option>
                <option value="html">HTML</option>
              </select>
            </div>
            <div className="button-toggle-container">
              <button 
                onClick={this.handleCopy}
                style={{ 
                  minWidth: '60px',
                  WebkitTextFillColor: 'inherit',
                  color: 'inherit',
                  WebkitAppearance: 'none'
                }}
              >
                {isCopied ? '✓' : 'Copy'}
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
          </div>

          <div className="ascii-banner-output-wrapper">
            <div 
              className="ascii-banner-output"
              ref={this.outputRef}
              data-color={textColor}
            >
              <FigletText
                ref={this.handlePreRef}
                text={text}
                font={font.value}
                textColor={textColor}
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