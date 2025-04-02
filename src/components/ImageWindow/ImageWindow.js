import React, { Component } from "react";
import { createPortal } from "react-dom";
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
      showAlert: false
    };
  }

  componentDidMount() {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const width = isMobile ? 300 : 293;
    const height = isMobile ? 200 : 208;
    this.setState({ width, height });
  }

  handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    const maxWidth = 800;
    const maxHeight = 600;
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
    console.log("✅ showAboutAlert triggered");
    this.setState({ showAlert: true });
  };

  closeAboutAlert = () => {
    console.log("✅ closeAboutAlert triggered");
    this.setState({ showAlert: false });
  };

  renderAlert = () => {
    const { showAlert } = this.state;
    const { disclaimer } = this.props.data || {};

    if (!showAlert) return null;

    return createPortal(
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
          width: "90vw",
          maxWidth: "400px",
          backgroundColor: "#fff",
          padding: "10px",
          display: "block",
          border: "2px solid #000",
          pointerEvents: "all",
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
      </WindowAlert>,
      document.body // append outside Window context
    );
  };

  render() {
    const { props, state } = this;
    const { src, title } = props.data || {};

    return (
      <>
        <Window
          {...props}
          title="Doodle Viewer"
          icon={paint16}
          menuOptions={buildMenu({
            ...props,
            componentType: "ImageWindow",
            showAbout: this.showAboutAlert
          })}
          Component={WindowProgram}
          initialWidth={state.width}
          initialHeight={state.height}
          className={cx("ImageWindow", props.className)}
        >
          <div style={{
            height: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
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

        {this.renderAlert()}
      </>
    );
  }
}

export default ImageWindow;


