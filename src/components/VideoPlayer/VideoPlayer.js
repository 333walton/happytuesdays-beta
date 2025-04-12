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

    return (
      <Window
        {...props}
        title="Video Player"
        icon={camera16}
        Component={WindowProgram}
        initialHeight={290}
        initialWidth={320}
        resizable={false}
        className={cx("VideoPlayer", props.className)}
      >
        <Video
          src={videoSrc}
          style={{
            marginBottom: 4,
            height: "100%",
            width: "100%",
            objectFit: "contain",
          }}
        />
      </Window>
    );
  }
}

export default VideoPlayer;

