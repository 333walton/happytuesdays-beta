import React, { Component } from "react"
import { WindowProgram } from "packard-belle"
import cx from "classnames"
import Window from "../tools/Window"
import { mediavid16 } from "../../icons"
import buildMenu from "../../helpers/menuBuilder"
import "./_styles.scss"

class HookScoreHeatmap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      videoUrl: null,
      isPlaying: false,
      currentTime: 0,
      duration: 30, // Default 30s duration
      isLoading: true,
      isAnalyzing: false,
      isDragging: false,
      heatmapData: [],
      playbackSpeed: 1,
      showHelp: false
    }
    this.videoRef = React.createRef()
    this.fileInputRef = React.createRef()
  }

  componentDidMount() {
    // Initialize the file input reference if it wasn't set in constructor
    if (!this.fileInputRef) {
      this.fileInputRef = React.createRef()
    }
    
    const video = this.videoRef.current
    if (video) {
      video.addEventListener('loadedmetadata', this.handleLoadedMetadata)
      video.addEventListener('timeupdate', this.handleTimeUpdate)
      video.addEventListener('ended', this.handleEnded)
      video.addEventListener('canplay', this.handleCanPlay)
      
      // Add error handling
      video.addEventListener('error', this.handleVideoError)
    }
  }
  
  componentWillUnmount() {
    const video = this.videoRef.current
    if (video) {
      video.removeEventListener('loadedmetadata', this.handleLoadedMetadata)
      video.removeEventListener('timeupdate', this.handleTimeUpdate)
      video.removeEventListener('ended', this.handleEnded)
      video.removeEventListener('canplay', this.handleCanPlay)
      video.removeEventListener('error', this.handleVideoError)
    }
  }
  
  handleVideoError = (e) => {
    console.error("Video error:", e)
    console.error("Video error details:", this.videoRef.current.error)
    alert("Error playing video. Please try another video file.")
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
        this.setState({ isPlaying: false })
      } else {
        // Fix for playback issues
        const playPromise = video.play()
        
        // Handle the play promise to catch any errors
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Play started successfully
              this.setState({ isPlaying: true })
            })
            .catch(error => {
              // Auto-play was prevented or other error
              console.error("Video play error:", error)
              // Attempt to fix common autoplay issues
              video.muted = true
              video.play().then(() => {
                this.setState({ isPlaying: true })
              }).catch(err => {
                console.error("Even muted play failed:", err)
              })
            })
        } else {
          // Older browsers might not return a promise
          this.setState({ isPlaying: !this.state.isPlaying })
        }
      }
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

  handleFileChange = (e) => {
    if (e && e.target && e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file && file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file)
        this.setState({ 
          videoUrl: url, 
          isAnalyzing: true
        }, this.analyzeVideo)
      }
    }
  }

  handleDragOver = (e) => {
    e.preventDefault()
    this.setState({ isDragging: true })
  }

  handleDragLeave = () => {
    this.setState({ isDragging: false })
  }

  handleDrop = (e) => {
    e.preventDefault()
    this.setState({ isDragging: false })
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file)
      this.setState({ 
        videoUrl: url, 
        isAnalyzing: true
      }, this.analyzeVideo)
    }
  }

  analyzeVideo = () => {
    // Simulate analysis with a timeout
    setTimeout(() => {
      const { duration } = this.state
      const data = []
      
      // Create simulated attention scores for each second
      for (let i = 0; i < duration; i++) {
        // Start with high attention that generally drops over time
        let baseScore = 100 - (i / duration * 60)
        
        // Add some variance with periodic peaks for "hooks"
        if (i === 0) {
          // First second is always high
          baseScore = 95
        } else if (i === 3) {
          // Drop after intro
          baseScore = Math.max(40, baseScore - 30)
        } else if (i === 5 || i === 15 || i === 22) {
          // Add hooks at key points
          baseScore = Math.min(100, baseScore + 30)
        } else if (i > 5 && i < 8) {
          // Downward trend after first hook
          baseScore = Math.max(30, baseScore - 15)
        }
        
        // Add some noise
        const noise = Math.random() * 10 - 5
        const finalScore = Math.max(0, Math.min(100, baseScore + noise))
        
        data.push({
          time: i,
          score: finalScore,
          isHook: i === 0 || i === 5 || i === 15 || i === 22
        })
      }
      
      this.setState({
        heatmapData: data,
        isAnalyzing: false
      })
    }, 3000)
  }

  handleGoToHook = (time) => {
    const video = this.videoRef.current
    if (video) {
      video.currentTime = time
      this.setState({ currentTime: time })
    }
  }

  handleSetSpeed = (speed) => {
    const video = this.videoRef.current
    if (video) {
      video.playbackRate = speed
      this.setState({ playbackSpeed: speed })
    }
  }

  toggleHelp = () => {
    this.setState(prevState => ({ showHelp: !prevState.showHelp }))
  }

  getScoreColor = (score) => {
    if (score > 80) return '#00cc00' // Green
    if (score > 60) return '#ffcc00' // Yellow
    if (score > 40) return '#ff9900' // Orange
    return '#cc0000' // Red
  }

  renderUploadArea() {
    const { isDragging } = this.state
    
    const loadDemoVideo = () => {
      this.setState({ 
        videoUrl: "/static/donwest.mp4", 
        isAnalyzing: true
      }, this.analyzeVideo)
    }
    
    return (
      <div 
        className={cx("upload-area", { "dragging": isDragging })}
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
        style={{
          height: "150px", // Reduced height
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #888",
          margin: "10px",
          background: isDragging ? "#e0e0e0" : "#f0f0f0",
          borderRadius: "3px"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "10px" }}>
            <svg viewBox="0 0 24 24" width="32" height="32" fill="#666">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-8h4V8h3l-5-5-5 5h3v4z"/>
            </svg>
          </div>
          <p style={{ fontSize: "11px", margin: "2px 0" }}>Drag and drop a video file here</p>
          <div style={{ 
            display: "flex", 
            flexDirection: "row", 
            justifyContent: "center", 
            alignItems: "center",
            margin: "4px 0"
          }}>
            <button 
              className="packard-button"
              onClick={() => {
                // Check if fileInputRef is available before trying to click it
                if (this.fileInputRef && this.fileInputRef.current) {
                  this.fileInputRef.current.click()
                }
              }}
              style={{ margin: "0 4px", fontSize: "11px", padding: "1px 4px" }}
            >
              Browse Files
            </button>
            <span style={{ fontSize: "11px", margin: "0 4px" }}>or</span>
            <button 
              className="packard-button"
              onClick={loadDemoVideo}
              style={{ margin: "0 4px", fontSize: "11px", padding: "1px 4px" }}
            >
              Use Demo Video
            </button>
          </div>
          <input 
            ref={this.fileInputRef}
            type="file" 
            accept="video/*" 
            style={{ display: "none" }}
            onChange={this.handleFileChange}
          />
        </div>
      </div>
    )
  }

  renderAnalyzing() {
    return (
      <div style={{ 
        height: "200px", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center"
      }}>
        <div style={{ width: "32px", height: "32px", marginBottom: "15px" }}>
          {/* Simple loading spinner made with CSS */}
          <div style={{ 
            width: "32px", 
            height: "32px", 
            border: "4px solid #f3f3f3", 
            borderTop: "4px solid #3498db", 
            borderRadius: "50%",
            animation: "spin 2s linear infinite"
          }} />
        </div>
        <p>Analyzing video hook effectiveness...</p>
        <p style={{ fontSize: "12px", color: "#666" }}>This might take a few moments</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  renderHeatmap() {
    const { heatmapData, currentTime, duration } = this.state
    
    if (heatmapData.length === 0) return null
    
    return (
      <div style={{ margin: "5px", marginTop: "8px" }}>
        <div style={{ marginBottom: "3px", fontWeight: "bold", fontSize: "11px" }}>
          Audience Attention Heatmap:
        </div>
        <div style={{ 
          height: "35px", // Reduced height
          border: "1px inset #fff",
          background: "#fff",
          position: "relative",
          overflow: "hidden"
        }}>
          {heatmapData.map((point, index) => (
            <div 
              key={index}
              onClick={() => this.handleGoToHook(point.time)}
              className="heatmap-bar"
              title={`Time: ${this.formatTime(point.time)} | Attention: ${Math.round(point.score)}%${point.isHook ? ' | Key Hook Point!' : ''}`}
              style={{ 
                position: "absolute",
                bottom: 0,
                backgroundColor: this.getScoreColor(point.score),
                borderRight: "1px solid rgba(255,255,255,0.2)",
                left: `${(point.time / duration) * 100}%`, 
                height: `${point.score}%`,
                width: `${100 / duration}%`,
                cursor: "pointer"
              }}
            />
          ))}
          
          {/* Current position indicator */}
          <div 
            style={{ 
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "1px",
              backgroundColor: "#000",
              left: `${(currentTime / duration) * 100}%`,
              zIndex: 2
            }}
          />
          
          {/* Hook indicators - simplified for smaller space */}
          {heatmapData.filter(point => point.isHook).map((hook, index) => (
            <div 
              key={`hook-${index}`}
              onClick={() => this.handleGoToHook(hook.time)}
              title={`Hook #${index + 1} | Time: ${this.formatTime(hook.time)} | Attention Spike: ${Math.round(hook.score)}%`}
              style={{ 
                position: "absolute",
                top: "2px",
                left: `${(hook.time / duration) * 100}%`,
                cursor: "pointer",
                zIndex: 3
              }}
            >
              <div style={{ position: "relative" }}>
                <div style={{ 
                  height: "6px", 
                  width: "6px", 
                  backgroundColor: "#ffcc00", 
                  border: "1px solid #000",
                  borderRadius: "50%"
                }}/>
                {/* Only show tooltip on hover with CSS */}
                <div className="hook-tooltip" style={{ 
                  position: "absolute", 
                  top: "9px", 
                  left: "50%", 
                  transform: "translateX(-50%)",
                  backgroundColor: "#ffffcc",
                  border: "1px solid #000",
                  fontSize: "8px",
                  padding: "0px 2px",
                  whiteSpace: "nowrap",
                  zIndex: 10,
                  opacity: 0, // Hidden by default, shown on hover via CSS
                  pointerEvents: "none" // Don't block clicks
                }}>
                  #{index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  renderAnalysisResults() {
    const { heatmapData, duration } = this.state
    
    if (heatmapData.length === 0) return null
    
    // Find suggested trim points (engagement peaks and drops)
    const peaks = heatmapData
      .filter((point, i, arr) => 
        i > 0 && point.score > arr[i-1].score && point.score > 70
      )
      .slice(0, 2) // Reduced number of peaks
    
    const drops = heatmapData
      .filter((point, i, arr) => 
        i > 0 && point.score < arr[i-1].score && point.score < 40
      )
      .slice(0, 1) // Only show one drop
    
    const openingScore = heatmapData.length > 0 ? heatmapData[0].score : 0
    const retentionRate = heatmapData.length > 0 
      ? (heatmapData[Math.min(29, heatmapData.length-1)].score / heatmapData[0].score) * 100
      : 0
    
    return (
      <div style={{ margin: "5px", display: "flex", flexDirection: "row" }}>
        {/* Left column - Trim points */}
        <div style={{ flex: 1, marginRight: "3px" }}>
          <div style={{ 
            border: "1px inset #fff",
            background: "#fff",
            padding: "4px",
            height: "100%",
            fontSize: "10px"
          }}>
            <div style={{ fontWeight: "bold", marginBottom: "3px", fontSize: "11px" }}>
              Trim Points:
            </div>
            <ul style={{ 
              paddingLeft: "12px",
              margin: "3px 0"
            }}>
              {peaks.map((point, index) => (
                <li key={index} style={{ marginBottom: "2px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Peak: {this.formatTime(point.time)}</span>
                    <button 
                      className="packard-button"
                      onClick={() => this.handleGoToHook(point.time)}
                      style={{ fontSize: "9px", padding: "0px 2px", marginLeft: "2px" }}
                    >
                      Go
                    </button>
                  </div>
                </li>
              ))}
              {drops.map((point, index) => (
                <li key={`drop-${index}`} style={{ 
                  marginBottom: "2px",
                  color: "#cc0000"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Drop: {this.formatTime(point.time)}</span>
                    <button 
                      className="packard-button"
                      onClick={() => this.handleGoToHook(point.time)}
                      style={{ fontSize: "9px", padding: "0px 2px", marginLeft: "2px" }}
                    >
                      Go
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Right column - Scores */}
        <div style={{ flex: 1, marginLeft: "3px" }}>
          <div style={{ 
            border: "1px inset #fff",
            background: "#fff",
            padding: "4px",
            height: "100%",
            fontSize: "10px"
          }}>
            <div style={{ fontWeight: "bold", marginBottom: "3px", fontSize: "11px" }}>
              Hook Score:
            </div>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              marginBottom: "3px"
            }}>
              <div style={{ 
                flex: 1,
                height: "10px",
                background: "#e0e0e0",
                border: "1px solid #888",
                position: "relative"
              }}>
                <div style={{ 
                  height: "100%",
                  width: `${openingScore}%`,
                  background: "#0066cc"
                }} />
              </div>
              <span style={{ 
                marginLeft: "3px",
                fontWeight: "bold",
                fontSize: "9px"
              }}>
                {Math.round(openingScore)}%
              </span>
            </div>
            
            <p style={{ fontSize: "9px", marginBottom: "4px" }}>
              {openingScore > 80
                ? "Strong opening! Good retention."
                : "Opening needs work. Improve first 5s."}
            </p>
            
            <div style={{ fontWeight: "bold", marginBottom: "2px", fontSize: "10px" }}>
              Retention (30s):
            </div>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center"
            }}>
              <div style={{ 
                flex: 1,
                height: "10px",
                background: "#e0e0e0",
                border: "1px solid #888",
                position: "relative"
              }}>
                <div style={{ 
                  height: "100%",
                  width: `${retentionRate}%`,
                  background: "#00aa00"
                }} />
              </div>
              <span style={{ 
                marginLeft: "3px",
                fontWeight: "bold",
                fontSize: "9px"
              }}>
                {Math.round(retentionRate)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderHelpDialog() {
    if (!this.state.showHelp) return null
    
    return (
      <div style={{
        position: "absolute",
        top: "20%",
        left: "10%",
        right: "10%",
        bottom: "20%",
        background: "#c0c0c0",
        border: "2px outset #fff",
        boxShadow: "2px 2px 10px rgba(0,0,0,0.3)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{
          background: "#000080",
          color: "#fff",
          padding: "3px 5px",
          display: "flex",
          justifyContent: "space-between"
        }}>
          <div style={{ fontWeight: "bold" }}>
            Hook Score Help
          </div>
          <button 
            onClick={this.toggleHelp}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ padding: "10px", overflow: "auto", flex: 1 }}>
          <h3 style={{ margin: "0 0 10px 0" }}>How to use the Hook Score Heatmap:</h3>
          <ul style={{ paddingLeft: "20px", marginBottom: "15px" }}>
            <li>Upload your video to analyze its opening hook and engagement patterns</li>
            <li>The heatmap shows predicted audience attention throughout your video</li>
            <li>Yellow markers indicate key hooks or moments of high engagement</li>
            <li>Click on any point in the heatmap to jump to that timestamp</li>
            <li>The analysis provides recommendations for potential edit points</li>
          </ul>
          
          <h3 style={{ margin: "0 0 10px 0" }}>Hook Score Metrics:</h3>
          <ul style={{ paddingLeft: "20px", marginBottom: "15px" }}>
            <li>Opening Hook: How compelling your first 5 seconds are</li>
            <li>Retention Rate: Estimated viewer retention after 30 seconds</li>
            <li>Engagement Peaks: Points where viewer attention increases</li>
            <li>Drop-offs: Points where viewer attention decreases significantly</li>
          </ul>
        </div>
        
        <div style={{
          padding: "10px",
          display: "flex",
          justifyContent: "flex-end",
          borderTop: "1px solid #888"
        }}>
          <button 
            className="packard-button"
            onClick={this.toggleHelp}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  render() {
    const { props } = this
    const { 
      videoUrl, 
      isPlaying, 
      currentTime, 
      duration, 
      isLoading, 
      isAnalyzing, 
      playbackSpeed,
      showHelp
    } = this.state

    return (
      <Window
        {...props}
        title="Hook Score Heatmap"
        icon={mediavid16}
        menuOptions={buildMenu(props)}
        Component={WindowProgram}
        initialHeight={400}
        initialWidth={440}
        resizable={true}
        className={cx("HookScoreHeatmap", props.className)}
      >
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Main content area */}
          <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
            {!videoUrl ? (
              this.renderUploadArea()
            ) : (
              <>
                {/* Video preview area */}
                <div style={{ 
                  height: "150px", // Reduced height
                  background: "#000",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {isAnalyzing ? (
                    this.renderAnalyzing()
                  ) : (
                    <>
                      <video
                        ref={this.videoRef}
                        src={videoUrl}
                        style={{
                          maxHeight: "100%",
                          maxWidth: "100%",
                          display: "block"
                        }}
                        onClick={this.togglePlay}
                        playsInline // Required for mobile
                        preload="auto" // Preload video data
                        controls={true} // Add native controls as fallback
                      />
                      {!isPlaying && !isLoading && (
                        <div style={{
                          position: "absolute",
                          cursor: "pointer"
                        }}
                        onClick={this.togglePlay}>
                          <svg viewBox="0 0 24 24" width="36" height="36" fill="#ffffff">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {!isAnalyzing && (
                  <>
                    {/* Controls - more compact */}
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      padding: "2px 5px"
                    }}>
                      <button 
                        className="packard-button"
                        onClick={this.togglePlay}
                        disabled={isLoading}
                        style={{ marginRight: "3px", padding: "1px 4px", fontSize: "11px" }}
                      >
                        {isPlaying ? "Pause" : "Play"}
                      </button>
                      
                      <button 
                        className="packard-button"
                        onClick={this.handleStop}
                        disabled={isLoading}
                        style={{ marginRight: "3px", padding: "1px 4px", fontSize: "11px" }}
                      >
                        Stop
                      </button>
                      
                      <select 
                        className="packard-dropdown"
                        value={playbackSpeed}
                        onChange={(e) => this.handleSetSpeed(parseFloat(e.target.value))}
                        disabled={isLoading}
                        style={{ marginRight: "auto", fontSize: "11px", height: "18px" }}
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={1}>1.0x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2.0x</option>
                      </select>
                      
                      <button 
                        className="packard-button"
                        onClick={this.toggleHelp}
                        style={{ marginLeft: "auto", padding: "1px 4px", fontSize: "11px" }}
                      >
                        Help
                      </button>
                    </div>
                    
                    {/* Time display and progress bar */}
                    <div style={{ padding: "0 5px", marginTop: "2px" }}>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        fontSize: "10px",
                        marginBottom: "2px"
                      }}>
                        <span>{this.formatTime(currentTime)}</span>
                        <span>{this.formatTime(duration)}</span>
                      </div>
                      
                      <div style={{ 
                        border: "1px inset #fff",
                        height: "10px",
                        position: "relative",
                        background: "#e0e0e0"
                      }}>
                        <input
                          type="range"
                          min={0}
                          max={duration || 0}
                          value={currentTime}
                          onChange={this.handleSeek}
                          step={0.1}
                          disabled={isLoading}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                            zIndex: 2
                          }}
                        />
                        <div style={{
                          height: "100%",
                          width: `${(currentTime / duration) * 100}%`,
                          background: "#0066cc"
                        }} />
                      </div>
                    </div>
                    
                    {/* Heatmap and Analysis */}
                    {this.renderHeatmap()}
                    {this.renderAnalysisResults()}
                  </>
                )}
              </>
            )}
          </div>
          
          {/* Help dialog */}
          {this.renderHelpDialog()}
        </div>
      </Window>
    )
  }
}

export default HookScoreHeatmap