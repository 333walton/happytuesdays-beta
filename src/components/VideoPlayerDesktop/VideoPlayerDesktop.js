import { Component } from "react"
import { WindowProgram } from "packard-belle"
import cx from "classnames"
import Window from "../tools/Window"
import { camera16 } from "../../icons"
import "./_styles.scss"
import { Video } from "@react95/core"
import "@react95/core/GlobalStyle"
import "@react95/core/themes/win95.css"


class VideoPlayer extends Component {
  render() {
    const { props } = this;
    const videoSrc = props.data?.src || "/static/donwest.mp4";
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMobile = /Mobi|Android/.test(navigator.userAgent) || isIOS;

    // Calculate dimensions based on device
    const mobileHeight = isIOS ? '100%' : window.innerHeight * 0.35;
    const mobileWidth = isIOS ? '100%' : window.innerWidth * 0.855;

    return (
      <Window
        {...props}
        title="Video Player"
        icon={camera16}
        Component={WindowProgram}
        initialHeight={isMobile ? mobileHeight : 290}
        initialWidth={isMobile ? mobileWidth : 320}
        resizable={!isMobile}
        className={cx("VideoPlayer", props.className, { 
          "mobile-player": isMobile,
          "ios-player": isIOS 
        })}
      >
        <Video
          src={videoSrc}
          style={{
            marginBottom: isMobile ? 0 : 4,
            height: "100%",
            width: "100%",
            objectFit: "contain",
            background: "#000",
            maxWidth: "100vw",
            maxHeight: isIOS ? "100vh" : "auto"
          }}
          controls={isMobile}
          playsInline
          preload="metadata"
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          playsinline="true"
          webkit-playsinline="true"
        />
      </Window>
    );
  }
}

export default VideoPlayer;