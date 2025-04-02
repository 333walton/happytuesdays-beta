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
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.state = {
      width: isMobile ? 300 : 293,
      height: isMobile ? 200 : 208,
      showAlert: false,
      isMobile
    };
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
    console.log("showAboutAlert triggered");
    this.setState({ showAlert: true });
  };

  closeAboutAlert = () => {
    console.log("closeAboutAlert triggered");
    this.setState({ showAlert: false });
  };

  render() {
    const { props, state } = this;
    const { src, title, disclaimer } = props.data || {};
    const { showAlert } = state;

    // Debug: log menu options
    const menuOptions = buildMenu({
      ...props,
      componentType: "ImageWindow",
      showAbout: this.showAboutAlert
    });
    console.log("MENU DEBUG", menuOptions);

    return (
      <>
        <Window
          {...props}
          title="Doodle Viewer"
          icon={paint16}
          // Toggle between the two menu options here for testing
          menuOptions={menuOptions}

          // Uncomment below to test simplified menu:
          // menuOptions={[
          //   {
          //     title: "Help",
          //     options: [
          //       [{ title: "Doodler's Abstract", onClick: this.showAboutAlert }]
          //     ]
          //   }
          // ]}
          Component={WindowProgram}
          initialWidth={state.width}
          initialHeight={state.height}
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
            key="doodler-alert"
            title="Doodler's Abstract"
            icon={paint16}
            onOK={this.closeAboutAlert}
            onClose={this.closeAboutAlert}
            className="Window--active"
            style={{
              zIndex: 9999,
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

        {/* TEMP DEBUG BUTTON */}
        <button
          onClick={this.showAboutAlert}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 99999,
            backgroundColor: "#c0c0c0",
            padding: "6px 10px",
            fontFamily: "sans-serif"
          }}
        >
          Show Alert
        </button>
      </>
    );
  }
}

export default ImageWindow;
