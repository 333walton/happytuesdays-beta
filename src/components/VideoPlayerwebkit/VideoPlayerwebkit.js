import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { camera16 } from "../../icons";
import "./_styles.scss";
import { Video } from "@react95/core";
import "@react95/core/GlobalStyle";
import "@react95/core/themes/win95.css";

class VideoPlayer extends Component {
  render() {
    const { props } = this;
    const videoSrc = props.data?.src || "/static/donwest.mp4";
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // Determine if we need iOS class
    const classNames = cx("VideoPlayer", props.className, {
      "ios-player": isIOS
    });
    
    return (
      <Window
        {...props}
        title="Video Player"
        icon={camera16}
        Component={WindowProgram}
        initialHeight={298}
        initialWidth={322}
        resizable={false} // Lock dimensions for consistency
        className={classNames}
        style={{ width: "322px", height: "298px" }} // Force dimensions
      >
        <div className="video-content-wrapper">
          <Video
            src={videoSrc}
            style={{
              background: "#000",
              width: "322px",
              height: "298px"
            }}
            controls={false}
            playsInline
            preload="metadata"
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </Window>
    );
  }
}

export default VideoPlayer;