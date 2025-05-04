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
  { value: "ANSI Regular", label: "ANSI Regular" },
  { value: "ANSI Shadow", label: "ANSI Shadow" },
  { value: "Alligator2", label: "Alligator2" },
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
  { value: "Isometric3", label: "Isometric3" },
  { value: "Lean", label: "Lean" },
  { value: "Letters", label: "Letters" },
  { value: "Marquee", label: "Marquee" },
  { value: "Mini", label: "Mini" },
  { value: "Pawp", label: "Pawp" },
  { value: "Peaks Slant", label: "Peaks Slant" },
  { value: "Roman", label: "Roman" },
  { value: "Shadow", label: "Shadow" },
  { value: "Slant Relief", label: "Slant Relief" },
  { value: "Small Keyboard", label: "Small Keyboard" },
  { value: "Train", label: "Train" },
  { value: "Trek", label: "Trek" },
  { value: "Tubular", label: "Tubular" },
  { value: "Wavy", label: "Wavy" },
  { value: "Whimsy", label: "Whimsy" }
];

class ASCIIText extends Component {
  static contextType = ProgramContext;

  constructor(props) {
    super(props);
    this.state = {
      text: "TEST",
      font: window.innerWidth <= 768
        ? { value: "Isometric3", label: "Colossal" }
        : { value: "Slant Relief", label: "Slant Relief" },
      asciiOutput: "",
      isCopied: false,
      showSaveModal: false,
      saveFileName: "ascii-banner",
      saveFileType: "txt",
      showMessageWindow: false,
      copyFormat: "markdown",
      textColor: "green",
      contentHeight: { mobile: "300px", desktop: "190px" },
      contentWidth: { mobile: "400px", desktop: "535px" },
      isMobileDevice: window.innerWidth <= 768,
      isFontDropdownOpen: false,
      isCopyFormatDropdownOpen: false,
    };

    this.outputRef = React.createRef();
    this.preRef = React.createRef();
    this.isMobile = window.innerWidth <= 768;
    this.resizeObserver = null;
    this.fontDropdownRef = React.createRef();
    this.copyFormatDropdownRef = React.createRef();
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
    // Add click outside listener
    document.addEventListener('mousedown', this.handleClickOutside);
    
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
    document.removeEventListener('mousedown', this.handleClickOutside);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  handleClickOutside = (event) => {
    if (this.fontDropdownRef.current && !this.fontDropdownRef.current.contains(event.target)) {
      this.setState({ isFontDropdownOpen: false });
    }
    if (this.copyFormatDropdownRef.current && !this.copyFormatDropdownRef.current.contains(event.target)) {
      this.setState({ isCopyFormatDropdownOpen: false });
    }
  }

  toggleFontDropdown = () => {
    this.setState(prevState => ({
      isFontDropdownOpen: !prevState.isFontDropdownOpen,
      isCopyFormatDropdownOpen: false // Close other dropdown
    }));
  }

  toggleCopyFormatDropdown = () => {
    this.setState(prevState => ({
      isCopyFormatDropdownOpen: !prevState.isCopyFormatDropdownOpen,
      isFontDropdownOpen: false // Close other dropdown
    }));
  }

  handleFontSelect = (selectedFont) => {
    this.handleFontChange(selectedFont);
    this.setState({ isFontDropdownOpen: false });
  }

  handleCopyFormatSelect = (format) => {
    this.setState({ 
      copyFormat: format,
      isCopyFormatDropdownOpen: false
    });
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
    const { text, font, isCopied, showSaveModal, showMessageWindow, copyFormat, textColor, 
      contentWidth, contentHeight, isFontDropdownOpen, isCopyFormatDropdownOpen } = this.state;

    const copyFormatOptions = [
      { value: "plain", label: "Plain Text", title: "Best for: Text editors & terminals" },
      { value: "markdown", label: "Markdown", title: "Best for: GitHub, Discord & Markdown" },
      { value: "html", label: "HTML", title: "Best for: Email, Word & rich text editors" }
    ];

    return (
      <>
        {showSaveModal && this.renderSaveAsModal()}
        {showMessageWindow && this.renderMessageWindow()}

        <Window
          {...props}
          title="ASCII Banners"
          icon={asciibanner16}
          Component={WindowProgram}
          maxHeight={300}
          maxWidth={this.state.isMobileDevice ? '414' : '530'} 
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
            
            {/* Custom Font Dropdown - this allows you to set a dropdown height to override native dropdown settings */}
            <div className="custom-dropdown" ref={this.fontDropdownRef}>
              <div 
                className="custom-select"
                onClick={this.toggleFontDropdown}
                style={{
                  WebkitTextFillColor: 'inherit',
                  color: 'inherit',
                }}
              >
                {font.label}
              </div>
              
              {isFontDropdownOpen && (
                <div className="custom-dropdown-list">
                  {fonts.map((fontOption) => (
                    <div
                      key={fontOption.value}
                      className={cx("custom-dropdown-item", {
                        selected: fontOption.value === font.value
                      })}
                      onClick={() => this.handleFontSelect(fontOption)}
                    >
                      {fontOption.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Copy Format Dropdown */}
            <div 
              className="custom-dropdown copy-format" 
              ref={this.copyFormatDropdownRef}
              title={copyFormatOptions.find(opt => opt.value === copyFormat)?.title}
            >
              <div 
                className="custom-select"
                onClick={this.toggleCopyFormatDropdown}
                style={{
                  WebkitTextFillColor: 'inherit',
                  color: 'inherit',
                }}
              >
                {copyFormatOptions.find(opt => opt.value === copyFormat)?.label}
              </div>
              
              {isCopyFormatDropdownOpen && (
                <div className="custom-dropdown-list">
                  {copyFormatOptions.map((option) => (
                    <div
                      key={option.value}
                      className={cx("custom-dropdown-item", {
                        selected: option.value === copyFormat
                      })}
                      onClick={() => this.handleCopyFormatSelect(option.value)}
                      title={option.title}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
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