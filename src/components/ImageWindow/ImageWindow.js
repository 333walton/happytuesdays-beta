import React, { Component } from "react";
import Window from "../tools/Window";
import { WindowProgram } from "packard-belle";
import { paint16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import cx from "classnames";
import "./_styles.scss";

class ImageWindow extends Component {
  state = {
    width: 282, // Default width
    height: 200 // Default height
  };

  handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;

    // Set constraints for minimum and maximum dimensions
    const maxWidth = 800; // Maximum width for the window
    const maxHeight = 600; // Maximum height for the window
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

  render() {
    const { props, state } = this;
    console.log("ImageWindow data:", props.data);
    const { src, title } = props.data || {};
    return (
      <Window
        {...props}
        title="Doodle Viewer"
        icon={paint16}
        menuOptions={buildMenu(props)}
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
    );
  }
}

export default ImageWindow;
