import { Component } from "react"
import { WindowProgram } from "packard-belle"
import cx from "classnames"
import Window from "../tools/Window"
import { burn16 } from "../../icons"
import buildMenu from "../../helpers/menuBuilder"
import "./_styles.scss"
import { Video } from "@react95/core"
import "@react95/core/GlobalStyle"
import "@react95/core/themes/win95.css"

class VideoPlayer extends Component {



  constructor(props) {
    super(props)
  }

  toggleFullScreen = () => {
    const playerElement = this.player.current
    playerElement?.requestFullscreen()
  }

  render() {
    const { props } = this
    return (
      <Window
        {...props}
        title="Video Player" 
        icon={burn16}
        menuOptions={buildMenu(props)}
        Component={WindowProgram}
        initialHeight={300}
        initialWidth={325}
        resizable={false}
        className={cx("VideoPlayer", props.className)}
      >
        <Video
          src="/static/donwest.mp4" // Update to your video file path
          controls
          autoPlay
          muted
          playsInline
          style={{
            marginBottom: 4,
            height: "calc(100% - 40px)", // Adjust height for controls
            width: "100%",
            objectFit: "contain",
            backgroundColor: "#000", // Add background color
          }}
        />
      </Window>
    )
  }
}

export default VideoPlayer