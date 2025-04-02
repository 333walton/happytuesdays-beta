import React, { Component } from "react";
import Window from "../tools/Window";
import { WindowProgram, WindowAlert } from "packard-belle";
import { paint16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import cx from "classnames";
import "./_styles.scss";

class ImageWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 293,
      height: 208,
      showAlert: false,
      isMobile: false,
    };
  }

  componentDidMount() {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.setState({
      isMobile,
      width: isMobile ? 300 : 293,
      height: isMobile ? 200 : 208,
    });
  }

  handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    const { isMobile } = this.state;

    const maxWidth = isMobile ? 300 : 800;
    const maxHeight = isMobile ? 250 : 600;
    const minWidth = 282;
    const minHeight = 200;

    const aspectRatio = naturalWidth / naturalHeight;
    let newWidth = Math.min(naturalWidth, maxWidth);
    let newHeight = newWidth / aspectRatio;

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }

    this.setState({
      width: Math.max(minWidth, newWidth),
      height: Math.max(minHeight, newHeight),
    });
  };

  showAboutAlert = () => {
    console.log("showAboutAlert triggered");
    this.setState({ showAlert: true });
  };

  closeAboutAlert = () => {
    this.setState({ showAlert: false });
  };

  render() {
    const { props, state } = this;
    const { src, title, disclaimer } = props.data || {};
    const { showAlert, isMobile } = state;

    return (
      <>
        <Window
          {...props}
          title="Doodle Viewer"
          icon={paint16}
          menuOptions={buildMenu({
            ...props,
            componentType: "ImageWindow",
            showAbout: this.showAboutAlert, // Pass the handler to the menu
          })}
          Component={WindowProgram}
          initialWidth={state.width} // Use dynamic width
          initialHeight={state.height} // Use dynamic height
          className={cx("ImageWindow", props.className)}
          style={{
            width: `${state.width}px`, // Explicitly set width
            height: `${state.height}px`, // Explicitly set height
            maxWidth: "100%", // Ensure it does not exceed the screen width
            maxHeight: "100%", // Ensure it does not exceed the screen height
            overflow: "hidden", // Prevent content overflow
            position: "absolute", // Ensure it is positioned correctly
            top: "50%", // Center vertically
            left: "50%", // Center horizontally
            transform: "translate(-50%, -50%)", // Adjust for the element's size
            boxSizing: "border-box", // Ensure padding and borders are included in dimensions
          }}
        >
          <div
            style={{
              height: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {src ? (
              <img
                src={src}
                alt={title}
                onLoad={this.handleImageLoad}
                onError={(e) => {
                  e.target.src = "/static/fallback.png";
                  e.target.alt = "Image not found";
                }}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <p style={{ textAlign: "center" }}>No image source provided</p>
            )}
          </div>
        </Window>

        {showAlert && (
          <WindowAlert
            title="Doodler's Abstract"
            icon={paint16}
            onOK={this.closeAboutAlert}
            onClose={this.closeAboutAlert}
            className="Window--active"
            style={{
              zIndex: 99999,
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: isMobile ? "90vw" : "75vw",
              maxWidth: isMobile ? "300px" : "400px",
              backgroundColor: "#fff",
              padding: "10px",
              display: "block",
              border: "2px solid red", // TEMP: Red border to confirm visibility
              pointerEvents: "all",
            }}
          >
            {disclaimer ? (
              disclaimer
            ) : (
              <div style={{ padding: "0px 10px", margin: "0" }}>
                <p>
                  <b>Doodle Name:</b> Test Doodle
                </p>
                <p>
                  <b>Doodler:</b> CS
                </p>
                <p>
                  <b>Date Submitted:</b> 3/31/25
                </p>
                <p>
                  <b>Doodle Statement:</b> This is the first doodle submitted to the gallery
                </p>
              </div>
            )}
          </WindowAlert>
        )}
      </>
    );
  }
}

export default ImageWindow;
