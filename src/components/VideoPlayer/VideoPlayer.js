import React, { Component } from "react"
import { WindowProgram } from "packard-belle"
import cx from "classnames"
import Window from "../tools/Window"
import { mediavid16 } from "../../icons"
import buildMenu from "../../helpers/menuBuilder"
import "./_styles.scss"

class VideoPlayer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isLoading: true,
    }
    this.videoRef = React.createRef()
  }

  componentDidMount() {
    const video = this.videoRef.current
    if (video) {
      video.addEventListener('loadedmetadata', this.handleLoadedMetadata)
      video.addEventListener('timeupdate', this.handleTimeUpdate)
      video.addEventListener('ended', this.handleEnded)
      video.addEventListener('canplay', this.handleCanPlay)
    }
  }

  componentWillUnmount() {
    const video = this.videoRef.current
    if (video) {
      video.removeEventListener('loadedmetadata', this.handleLoadedMetadata)
      video.removeEventListener('timeupdate', this.handleTimeUpdate)
      video.removeEventListener('ended', this.handleEnded)
      video.removeEventListener('canplay', this.handleCanPlay)
    }
  }

  handleLoadedMetadata = () => {
    const video = this.videoRef.current
    if (video) {
      this.setState({ duration: video.duration })
    }
  }

  handleTimeUpdate = () => {
    const video = this.videoRef.current
    if (video) {
      this.setState({ currentTime: video.currentTime })
    }
  }

  handleEnded = () => {
    this.setState({ isPlaying: false })
  }

  handleCanPlay = () => {
    this.setState({ isLoading: false })
  }

  togglePlay = () => {
    const video = this.videoRef.current
    if (video) {
      if (this.state.isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      this.setState({ isPlaying: !this.state.isPlaying })
    }
  }

  handleStop = () => {
    const video = this.videoRef.current
    if (video) {
      video.pause()
      video.currentTime = 0
      this.setState({ isPlaying: false, currentTime: 0 })
    }
  }

  handleSeek = (e) => {
    const video = this.videoRef.current
    if (video) {
      const value = parseFloat(e.target.value)
      video.currentTime = value
      this.setState({ currentTime: value })
    }
  }

  formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  render() {
    const { props } = this
    const { isPlaying, currentTime, duration, isLoading } = this.state

    return (
      <Window
        {...props}
        title="Video Player"
        icon={mediavid16}
        menuOptions={buildMenu(props)}
        Component={WindowProgram}
        initialHeight={300}
        initialWidth={325}
        resizable={false}
        className={cx("VideoPlayer", props.className)}
      >
        <div className="video-player-container">
          <video
            ref={this.videoRef}
            className="video"
            src="/static/donwest.mp4"
            playsInline
            style={{
              height: "calc(100% - 80px)", // Adjust for larger controls
              width: "100%",
              background: "#000",
              objectFit: "contain",
            }}
          />
          
          <div className="video-controls-container">
            <div className="countdown-container" style={{ height: "45px", minHeight: "45px" }}>
              <div className="time-display left">
                <span className="current-time-display">
                  {this.formatTime(currentTime)}
                </span>
              </div>
              <div className="time-display">
                <span className="duration-display">
                  TIME
                </span>
              </div>
              <div className="time-display right">
                <span className="elapsed-display">
                  {this.formatTime(duration - currentTime)}
                </span>
              </div>
            </div>
            
            <div className="control-panel" style={{ height: "27px", minHeight: "27px" }}>
              <div className="control-buttons">
                <button 
                  className="control-btn"
                  onClick={this.togglePlay}
                  disabled={isLoading}
                  style={{ width: "22px", height: "22px" }}
                >
                  {isPlaying ? (
                    <svg viewBox="0 0 8 8">
                      <rect x="1" y="1" width="2" height="6" />
                      <rect x="5" y="1" width="2" height="6" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 8 8">
                      <path d="M1 1 L1 7 L7 4 Z" />
                    </svg>
                  )}
                </button>
                
                <button 
                  className="control-btn"
                  onClick={this.handleStop}
                  disabled={isLoading}
                  style={{ width: "22px", height: "22px" }}
                >
                  <svg viewBox="0 0 8 8">
                    <rect x="1" y="1" width="6" height="6" />
                  </svg>
                </button>
              </div>
              
              <div className="progress-container">
                <input
                  type="range"
                  className="progress-slider"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={this.handleSeek}
                  step={0.1}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </Window>
    )
  }
}

export default VideoPlayer