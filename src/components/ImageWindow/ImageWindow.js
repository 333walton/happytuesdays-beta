import React, { Component } from "react";
import Window from "../tools/Window";
import { WindowProgram, WindowAlert } from "packard-belle";
import { paint16 } from "../../icons";
import cx from "classnames";
import "./_styles.scss";

class ImageWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 293,
      height: 189,
      showAlert: true,
      isMobile: false
    };
  };

  componentDidMount() {
  const isMobile = window.innerWidth < 600;
  this.setState({
    isMobile,
    width: isMobile ? 299 : 293,
    height: isMobile ? 214 : 208
  });
}

  getCenteredPosition = () => {
    const { width, height, isMobile } = this.state;

    if (!isMobile) return {}; // Let default behavior apply on desktop

    const x = (window.innerWidth - width) / 2;
    const y = (window.innerHeight - height) / 2;

    return { initialX: x, initialY: y };
  };


  handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    const { isMobile } = this.state;

    const maxWidth = isMobile ? 299 : 800;
    const maxHeight = isMobile ? 214 : 600;
    const minWidth = 269;
    const minHeight = 184;

    const aspectRatio = naturalWidth / naturalHeight;
    let newWidth = Math.min(naturalWidth, maxWidth);
    let newHeight = newWidth / aspectRatio;

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }

    this.setState({
      width: Math.max(minWidth, newWidth),
      height: Math.max(minHeight, newHeight)
    });
  };

  showAboutAlert = () => {
    this.setState({ showAlert: true });
  };

  closeAboutAlert = () => {
    this.setState({ showAlert: false });
  };

  render() {
    const { props, state } = this;
    const { src, title, doodleName, doodler, dateSubmitted, doodleStatement } = props.data || {};
    const { showAlert } = state;

    return (
      <>
        <Window
          {...props}
          title="Doodle Viewer"
          icon={paint16}
          Component={WindowProgram}
          initialHeight={189}
          initialWidth={293}
          resizable={true}
          onMaximize={null}           // This disables the maximize button
          forceNoMobileMax={true} // this prevents the window from maximizing on mobile
          {...this.getCenteredPosition()} // ✅ Center the window on mobile
          className={cx("ImageWindow", props.className)}
        >
          <div className="image-wrapper">
            {src ? (
              <img
                src={src}
                alt={title}
                onLoad={this.handleImageLoad}
                onError={(e) => {
                  e.target.src = "/static/fallback.png";
                  e.target.alt = "Image not found";
                }}
              />
            ) : (
              <p>No image source provided</p>
            )}
          </div>
        </Window>

        {showAlert && (
          <WindowAlert
            title="About This Doodle"
            icon={paint16}
            onClose={this.closeAboutAlert}
            className="DoodlerAlert Window--active"
            style={{
              zIndex: 0,
              position: "fixed", // Forces visibility
              top: "50px", // Adjust vertical position
              left: "50%", // Adjust horizontal position
              transform: "translate(-50%)", // Center horizontally
              width: this.state.isMobile ? "200px" : "200px", // ✅ dynamic width
              padding: 0,
            }}
          >
            <div
              style={{
                padding: "6px 10px",
                fontSize: "11px",
                lineHeight: "1.3",
              }}
            >
              <span style={{ lineHeight: "1.0" }}>
                <b>Doodle Name:</b> {doodleName || "N/A"}
              </span>
              <p style={{ margin: "2px 0" }}>
                <b>Doodler:</b> {doodler || "N/A"}
              </p>
              <p style={{ margin: "2px 0" }}>
                <b>Date Submitted:</b> {dateSubmitted || "N/A"}
              </p>
              <p style={{ margin: "2px 0" }}>
                <b>Doodle Statement:</b> {doodleStatement || "N/A"}
              </p>
            </div>
          </WindowAlert>
        )}
      </>
    );
  }
}


export default ImageWindow;

