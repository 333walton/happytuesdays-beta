import React, { Component } from "react";
import Window from "../tools/Window";
import { WindowProgram, WindowAlert } from "packard-belle";
import { paint16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import cx from "classnames";
import "./_styles.scss";

// Utility function to detect mobile devices
const isMobile = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

class ImageWindow extends Component {
  state = {
    width: isMobile() ? 200 : 282, // Default width for mobile and desktop
    height: isMobile() ? 150 : 200, // Default height for mobile and desktop
    showAlert: false // State to control the visibility of the WindowAlert
  };

  handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;

    // Set constraints for minimum and maximum dimensions
    const maxWidth = isMobile() ? 300 : 800; // Adjust max width for mobile
    const maxHeight = isMobile() ? 250 : 600; // Adjust max height for mobile
    const minWidth = 282; // Minimum width for the window
    const minHeight = 200; // Minimum height for the window

    // Calculate the new dimensions while maintaining the aspect ratio
    const aspectRatio = naturalWidth / naturalHeight;
    let newWidth = Math.min(naturalWidth, maxWidth);
    let newHeight = newWidth / aspectRatio;

    // Ensure the height does not exceed the maximum height
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }

    this.setState({
      width: Math.max(minWidth, newWidth),
      height: Math.max(minHeight, newHeight)
    });
  };

  // Handler to show the alert
  showAboutAlert = () => {
    this.setState({ showAlert: true });
  };

  // Handler to close the alert
  closeAboutAlert = () => {
    this.setState({ showAlert: false });
  };

  render() {
    const { props, state } = this;
    console.log("ImageWindow data:", props.data);
    const { src, title } = props.data || {};
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
            showAbout: this.showAboutAlert // Pass the handler to the menu
          })}
          Component={WindowProgram}
          initialWidth={state.width}
          initialHeight={state.height}
          className={cx("ImageWindow", props.className)}
        >
          <div style={{ height: "auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
            {src ? (
              <img
                src={src}
                alt={title}
                onLoad={this.handleImageLoad}
                onError={(e) => {
                  e.target.src = "/static/fallback.png"; // Replace with a fallback image
                  e.target.alt = "Image not found";
                }}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain" // Ensures the image fits within the frame
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
            icon={paint16} // Add the icon here
            onOK={this.closeAboutAlert}
            onClose={this.closeAboutAlert}
            className="Window--active"
            style={{
              zIndex: 1000, // Ensure the alert has a higher z-index
              position: "fixed", // Position the alert in the middle of the screen
              top: "50%", // Center vertically
              left: "50%", // Center horizontally
              transform: "translate(-50%, -50%)", // Adjust for the element's size
              width: "75%", // Reduce width by 25%
              height: "auto", // Adjust height dynamically based on content
              maxWidth: "400px", // Optional: Set a maximum width
              maxHeight: "300px", // Optional: Set a maximum height
              padding: "10px", // Add padding for better spacing
              backgroundColor: "#fff", // Ensure a white background
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Add a subtle shadow
              borderRadius: "8px", // Optional: Add rounded corners
              overflow: "hidden" // Prevent content overflow
            }}
          >
            {props.data && props.data.disclaimer ? (
              props.data.disclaimer
            ) : (
              <div style={{ padding: "0px 10px", margin: "0" }}>
                <p style={{ margin: "5px 0" }}>
                  <b>Doodle Name:</b> Test Doodle
                </p>
                <p style={{ margin: "5px 0" }}>
                  <b>Doodler:</b> CS
                </p>
                <p style={{ margin: "5px 0" }}>
                  <b>Date Submitted:</b> 3/31/25
                </p>
                <p style={{ margin: "5px 0" }}>
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
