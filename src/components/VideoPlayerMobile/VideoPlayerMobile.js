import React from "react";
import "./_styles.scss"; // import your custom styles (if any)

const VideoPlayerMobile = () => {
  return (
    <div className="window video98-player">
      <div className="title-bar">
        <div className="title-bar-text">Windows 98 Video Player</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="window-body">
        <media-controller>
          <video
            slot="media"
            src="https://archive.org/download/CC1301_windows_95/CC1301_windows_95_512kb.mp4"
            crossorigin
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
      </div>
    </div>
  );
};

export default VideoPlayerMobile;