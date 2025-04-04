import React, { Component } from "react";
import Window from "../tools/Window";
import { WindowProgram } from "packard-belle";
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
  };

  componentDidMount() {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.setState({
      isMobile,
      width: isMobile ? 299 : 293,
      height: isMobile ? 214 : 208
    });
  };

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
    const { src, title, disclaimer } = props.data || {};
    const { showAlert } = state;

    return (
      <>
        <Window
          {...props}
          title="Doodle Viewer"
          icon={paint16}
          menuOptions={buildMenu({
            ...props,
            componentType: "ImageWindow",
            showAbout: this.showAboutAlert,
          })}
          Component={WindowProgram}
          initialHeight={state.height}
          initialWidth={state.width}
          maximizeOnOpen={false}
          forceNoMobileMax={true}
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
          <Window
            title="Doodler's Abstract"
            icon={paint16}
            onClose={this.closeAboutAlert}
            className="DoodlerAlert"
            initialX={window.innerWidth / 9}
            initialY={window.innerHeight / 9}
            resizable={false}
            draggable={false}
            isActive={true}
            disableRandomLaunch={true}
            Component={WindowProgram}
            style={{
              zIndex: 1000,
              pointerEvents: "auto",
            }}
          >
            <div className="image-content">
              {disclaimer ? (
                disclaimer
              ) : (
                <>
                  <p><b>Doodle Name:</b> Test Doodle</p>
                  <p><b>Doodler:</b> CS</p>
                  <p><b>Doodle Date:</b> 3/31/25</p>
                  <p><b>Doodle Statement:</b> This is the first doodle submitted to the gallery</p>
                </>
              )}
            </div>
          </Window>
        )}
      </>
    );
  }
}

export default ImageWindow;

