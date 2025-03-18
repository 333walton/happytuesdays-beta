import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import Window from "../tools/Window";
import { Video, WindowAlert } from "@react95/core";

import "./_video-player.scss";
import buildMenu from "../../helpers/menuBuilder";

class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAlert: true // State variable to control the visibility of the alert
    };
  }

  confirm = () => {
    this.setState({ showAlert: false });
  };

  showHelp = () => {
    this.setState({ showAlert: true });
  };

  render() {
    const { props } = this;
    const { showAlert } = this.state;

    const commonProps = {
      title: props.title,
      icon: props.icon,
      onClose: () => props.onClose(props)
    };

    return (
      <>
        {showAlert && (
          <WindowAlert
            {...commonProps}
            title="Media Player Help" // Custom title for the WindowAlert
            onOK={this.confirm}
            onClose={this.confirm} // Separate handler for closing the alert
            className="IframeWindow--alert Window--active"
            style={{ zIndex: 1000 }} // Ensure the alert has a higher z-index
          >
            <div style={{ paddingLeft: "20px", paddingRight: "20px" }}>
              <b>Play/Pause</b> - Click the play/pause button<br></br>
              <b>Volume</b> - Adjust the volume slider<br></br>
              <b>Fullscreen</b> - Click the fullscreen button<br></br>
            </div>
          </WindowAlert>
        )}

        <Window
          {...props}
          resizable={true}
          initialX={150}
          initialY={100}
          initialWidth={400}
          initialHeight={300}
          Component={WindowProgram}
          title="Media Player"
          className="VideoPlayer Window--active"
          menuOptions={buildMenu({ ...props, componentType: "VideoPlayer", showHelp: this.showHelp })}
        >
          <div className="VideoPlayer__container">
            <Video
              src="https://www.w3schools.com/html/mov_bbb.mp4"
              controls
              className="VideoPlayer__video"
            />
          </div>
        </Window>
      </>
    );
  }
}

export default VideoPlayer;

