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
    const videoSrc = props.data?.src || "https://media.w3.org/2010/05/sintel/trailer_hd.mp4";
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    return (
      <Window
        {...props}
        title="Video Player"
        icon={camera16}
        Component={WindowProgram}
        initialHeight={isMobile ? window.innerHeight * 0.35 : 290}
        initialWidth={isMobile ? window.innerWidth * 0.855 : 320}
        resizable={!isMobile}
        className={cx("VideoPlayer", props.className, { "mobile-player": isMobile })}
      >
        <Video
          src={videoSrc}
          style={{
            marginBottom: 4,
            height: "100%",
            width: "100%",
            objectFit: "contain",
          }}
          controls={isMobile}
          playsInline
          preload="metadata"
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
        />
      </Window>
    );
  }
}

export default VideoPlayer;

