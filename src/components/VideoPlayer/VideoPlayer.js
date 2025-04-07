import { Component } from "react"
import { WindowProgram } from "packard-belle"
import cx from "classnames"
import Window from "../tools/Window"
import { camera16 } from "../../icons"
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
        icon={camera16}
        menuOptions={buildMenu(props)}
        Component={WindowProgram}
        initialHeight={300}
        initialWidth={325}
        resizable={false}
        className={cx("VideoPlayer", props.className)}
      >
        <Video
          // w="100%"
          // h="100%"
          src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
          style={{
            marginBottom: 4,
            height: "100%",
            width: '100%',
            objectFit: "contain"
          }}
          
        />
      </Window>
    )
  }
}

export default VideoPlayer

