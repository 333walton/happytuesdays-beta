"use client"

import React, { Component } from "react"
import { WindowProgram } from "packard-belle"
import cx from "classnames"
import Window from "../tools/Window"
// import { video16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder"
import "./_styles.scss"

class VideoPlayer extends Component {
  state = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
  }

  videoRef = React.createRef()

  handlePlay = () => {
    this.setState({ isPlaying: true })
  }

  handlePause = () => {
    this.setState({ isPlaying: false })
  }

  handleTimeUpdate = () => {
    const video = this.videoRef.current
    if (video) {
      this.setState({
        currentTime: video.currentTime,
        duration: video.duration,
      })
    }
  }

  handleVolumeChange = (e) => {
    const volume = Number.parseFloat(e.target.value)
    this.setState({ volume })
    if (this.videoRef.current) {
      this.videoRef.current.volume = volume
    }
  }

  formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  render() {
    const { props } = this
    const { isPlaying, currentTime, duration, volume } = this.state
    const videoSrc = props.data?.src || "/static/SampleVideo_1280x720_1mb (1).mp4"

    // Handle the onClose prop
    const onClose = props.onClose || (() => console.log("No onClose handler provided"))

    return (
      <Window
        {...props}
        title="Video Player"
        // icon={video16}
        menuOptions={buildMenu(props)}
        Component={WindowProgram}
        initialHeight={360}
        initialWidth={480}
        className={cx("VideoPlayer", props.className)}
        onClose={onClose}
      >
        <div className="video-container" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ flex: 1, background: "#000", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <video
              ref={this.videoRef}
              src={videoSrc}
              style={{ maxWidth: "100%", maxHeight: "100%" }}
              onPlay={this.handlePlay}
              onPause={this.handlePause}
              onTimeUpdate={this.handleTimeUpdate}
              autoPlay={props.data?.autoPlay}
              controls
            />
          </div>

          <div
            className="video-controls"
            style={{ padding: "8px", background: "#c0c0c0", borderTop: "1px solid #fff" }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ marginRight: "8px", fontSize: "12px" }}>
                {this.formatTime(currentTime)} / {this.formatTime(duration)}
              </span>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "12px", marginRight: "4px" }}>Volume:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={this.handleVolumeChange}
                  style={{ width: "80px" }}
                />
              </div>
              <div style={{ marginLeft: "auto", fontSize: "12px" }}>Status: {isPlaying ? "Playing" : "Paused"}</div>
            </div>
          </div>
        </div>
      </Window>
    )
  }
}

export default VideoPlayer

