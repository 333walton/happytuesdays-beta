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
      isMobile: false
    };
  }

  componentDidMount() {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setTimeout(() => {
      this.setState({
        isMobile,
        width: isMobile ? 300 : 293,
        height: isMobile ? 200 : 208
      });
    }, 100);
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
      height: Math.max(minHeight, newHeight)
    });
  };

  showAboutAlert = () => {
    console.log("✅ showAboutAlert triggered"); // Debug
    this.setState({ showAlert: true });
  };

  closeAboutAlert = () => {
    console.log("❌ closeAboutAlert triggered"); // Debug
    this.setState({ showAlert: false });
  };

  render() {
    const { props, state } = this;
    const { src, title, disclaimer } = props.data || {};
    const { showAlert, width, height } = state;

    const menu = buildMenu({
      ...props,
      componentType: "ImageWindow",
      showAbout: this.showAboutAlert
    });

    console.log("📋 MENU DEBUG:", menu);

    return (
      <>
        <Window
          {...props}
          title="Doodle Viewer"
          icon={paint16}
          menuOptions={menu}
          Component={WindowProgram}
          initialWidth={width}
          initialHeight={height}
          className={cx("ImageWindow", props.className)}
        >
          <div
            style={{
              height: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
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
                  objectFit: "contain"
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
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#fff",
      zIndex: 2147483647, // Very high to avoid conflicts
      width: "min(95vw, 400px)",
      maxHeight: "80vh",
      overflowY: "auto",
      padding: "10px",
      display: "block",
      border: "2px solid #000",
      boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
      pointerEvents: "all"
    }}
  >
    {disclaimer ? (
      disclaimer
    ) : (
      <div style={{ padding: "0px 10px", margin: "0" }}>
        <p><b>Doodle Name:</b> Test Doodle</p>
        <p><b>Doodler:</b> CS</p>
        <p><b>Date Submitted:</b> 3/31/25</p>
        <p><b>Doodle Statement:</b> This is the first doodle submitted to the gallery</p>
      </div>
    )}
  </WindowAlert>
)}

      </>
    );
  }
}

export default ImageWindow;
