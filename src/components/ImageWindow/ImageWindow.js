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
      width: 300,
      height: 200,
      showAlert: false,
      isMobile: false
    };
  }

  componentDidMount() {
    // Safe mobile detection AFTER mount
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.setState({ isMobile });
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
    this.setState({ showAlert: true });
  };

  closeAboutAlert = () => {
    this.setState({ showAlert: false });
  };

  render() {
    const { props, state } = this;
    const { src, title } = props.data || {};
    const { showAlert, isMobile, width, height } = state;

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
          initialWidth={width}
          initialHeight={height}
          className={cx("ImageWindow", props.className)}
        >
          <div className="image-content">
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
            title="Doodler's Abstract"
            icon={paint16}
            onOK={this.closeAboutAlert}
            onClose={this.closeAboutAlert}
            className="Window--active"
            style={{
              zIndex: 1000,
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: isMobile ? "90%" : "400px",
              maxWidth: "400px",
              backgroundColor: "#fff",
              padding: "10px"
            }}
          >
            {props.data?.disclaimer ? (
              props.data.disclaimer
            ) : (
              <div>
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

