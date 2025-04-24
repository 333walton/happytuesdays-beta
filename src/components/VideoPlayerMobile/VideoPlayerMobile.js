import React, { Component } from "react";
import Window from "../tools/Window";
import { WindowProgram } from "packard-belle"; // ✅ Add this import
import "./_styles.scss";

class VideoPlayerMobile extends Component {
  render() {
    return (
      <Window
        {...this.props}
        Component={WindowProgram} // ✅ Required prop!
        title="Video Player"
        className="video98-player"
        initialWidth={400}
        initialHeight={300}
        resizable={true}
      >
        <media-controller>
          <video
            slot="media"
            src="/static/donwest.mp4"
            crossOrigin="anonymous"
            playsInline
            controls
          ></video>
          <media-control-bar>
            <media-play-button></media-play-button>
            <media-seek-backward-button></media-seek-backward-button>
            <media-seek-forward-button></media-seek-forward-button>
            <media-mute-button></media-mute-button>
            <media-volume-range></media-volume-range>
            <media-time-range></media-time-range>
            <media-fullscreen-button></media-fullscreen-button>
          </media-control-bar>
        </media-controller>
      </Window>
    );
  }
}

export default VideoPlayerMobile;