import React, { useRef, useState, useEffect, useCallback } from 'react';
import Window from '../tools/Window';
import { WindowProgram } from 'packard-belle';
import buildMenu from '../../helpers/menuBuilder';
import cx from 'classnames';
import './_styles.scss';

const VideoPlayerMobile = (props) => {
  // Create all necessary refs
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);
  const progressThumbRef = useRef(null);
  const volumeThumbRef = useRef(null);
  const timeDisplayRef = useRef(null);
  const volumeIndicatorRef = useRef(null);
  const containerRef = useRef(null);
  
  // Create state variables
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [videoPosition, setVideoPosition] = useState(0);
  const [wasPaused, setWasPaused] = useState(true);
  
  // Store state to prevent issues with closure in event handlers
  const stateRef = useRef({
    isPlaying: isPlaying,
    currentTime: currentTime,
    volume: volume,
    isMuted: isMuted,
    selectedButton: selectedButton,
    isDragging: isDragging
  });
  
  // Update stateRef when state changes
  useEffect(() => {
    stateRef.current = {
      isPlaying,
      currentTime,
      volume,
      isMuted,
      selectedButton,
      isDragging
    };
  }, [isPlaying, currentTime, volume, isMuted, selectedButton, isDragging]);

  const showHelp = () => {
    alert('Media Player Help is not implemented yet.');
  };

  const menuOptions = buildMenu({
    ...props,
    componentType: 'VideoPlayerMobile',
    showHelp,
    options: {},
  });

  // Format time as MM:SS
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Save current video state - used before any interaction that might disrupt playback
  const saveVideoState = useCallback(() => {
    if (videoRef.current) {
      const currentlyPlaying = !videoRef.current.paused;
      setWasPaused(!currentlyPlaying);
      setVideoPosition(videoRef.current.currentTime);
      return {
        playing: currentlyPlaying,
        time: videoRef.current.currentTime,
        volume: videoRef.current.volume,
        muted: videoRef.current.muted
      };
    }
    return null;
  }, []);

  // Restore video state after interaction
  const restoreVideoState = useCallback((state) => {
    if (!state || !videoRef.current) return;
    
    // Restore time position
    videoRef.current.currentTime = state.time;
    
    // Restore volume settings
    videoRef.current.volume = state.volume;
    videoRef.current.muted = state.muted;
    
    // Restore play state only if it was playing
    if (state.playing) {
      videoRef.current.play().catch(err => console.log('Playback prevented', err));
    }
  }, []);

  // Button handlers - memoized to prevent recreation
  const handlePlay = useCallback((e) => {
    // Don't do anything during window drag
    if (stateRef.current.isDragging) return;
    
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      setSelectedButton('play');
    }
  }, []);

  const handlePause = useCallback((e) => {
    // Don't do anything during window drag
    if (stateRef.current.isDragging) return;
    
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      setSelectedButton(null);
    }
  }, []);

  const handleStop = useCallback((e) => {
    // Don't do anything during window drag
    if (stateRef.current.isDragging) return;
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setSelectedButton(null);
    }
  }, []);

  const handleOpen = useCallback((e) => {
    // Don't do anything during window drag
    if (stateRef.current.isDragging) return;
    
    alert('Open file functionality is not implemented yet.');
    setSelectedButton('open');
    setTimeout(() => setSelectedButton(null), 300);
  }, []);

  const handleSeekBackward = useCallback((e) => {
    // Don't do anything during window drag
    if (stateRef.current.isDragging) return;
    
    if (videoRef.current) {
      // Save state before seeking
      const state = saveVideoState();
      
      // Set new time
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
      setSelectedButton('seekbackward');
      
      // Restore play state if needed
      if (state && state.playing) {
        videoRef.current.play().catch(() => {});
      }
      
      setTimeout(() => setSelectedButton(null), 300);
    }
  }, [saveVideoState]);

  const handleSeekForward = useCallback((e) => {
    // Don't do anything during window drag
    if (stateRef.current.isDragging) return;
    
    if (videoRef.current) {
      // Save state before seeking
      const state = saveVideoState();
      
      // Set new time
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration || 0,
        videoRef.current.currentTime + 5
      );
      setSelectedButton('seekforward');
      
      // Restore play state if needed
      if (state && state.playing) {
        videoRef.current.play().catch(() => {});
      }
      
      setTimeout(() => setSelectedButton(null), 300);
    }
  }, [saveVideoState]);

  const toggleMute = useCallback((e) => {
    // Don't do anything during window drag
    if (stateRef.current.isDragging) return;
    
    if (videoRef.current) {
      // Save state before toggling mute
      const state = saveVideoState();
      
      // Toggle mute
      const newMutedState = !stateRef.current.isMuted;
      setIsMuted(newMutedState);
      videoRef.current.muted = newMutedState;
      
      // Restore play state if needed
      if (state && state.playing) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [saveVideoState]);

  // Update volume indicator fill
  const updateVolumeIndicator = useCallback((volumeLevel, thumbPosition) => {
    if (volumeIndicatorRef.current && volumeThumbRef.current) {
      // Get the actual position of the thumb in pixels
      const thumbPosValue = parseFloat(thumbPosition || volumeThumbRef.current.style.left);
      const thumbPosPixels = thumbPosValue || 0;
      
      // Triangle clip path to match the slider area in the background image
      // Use precise coordinates to fit the embossed triangle in the UI
      volumeIndicatorRef.current.style.clipPath = `polygon(0 100%, 0 30%, ${thumbPosPixels}px 30%, ${thumbPosPixels}px 100%)`;
    }
  }, []);

  // Handle progress bar interactions
  const updateProgressPosition = useCallback((clientX) => {
    if (progressRef.current && videoRef.current && !stateRef.current.isDragging) {
      // Save current play state
      const wasPlaying = !videoRef.current.paused;
      
      const rect = progressRef.current.getBoundingClientRect();
      const thumbWidth = 10; // Width of thumb in pixels
      const effectiveWidth = rect.width - thumbWidth;
      
      // Calculate position accounting for thumb width
      let relativeX = clientX - rect.left;
      let position = relativeX / effectiveWidth;
      
      // Clamp position between 0 and 1
      position = Math.max(0, Math.min(1, position));
      
      // Apply position to video time
      const newTime = position * (videoRef.current.duration || 0);
      if (isFinite(newTime) && newTime >= 0) {
        videoRef.current.currentTime = newTime;
        
        // Update thumb position
        if (progressThumbRef.current) {
          const positionPx = Math.max(0, Math.min(position * effectiveWidth, effectiveWidth));
          progressThumbRef.current.style.left = `${positionPx}px`;
        }
        
        // Restore play state if video was playing
        if (wasPlaying) {
          videoRef.current.play().catch(() => {});
        }
      }
    }
  }, []);

  const handleProgressMouseDown = useCallback((e) => {
    if (stateRef.current.isDragging) return;
    
    // Save current state
    const state = saveVideoState();
    
    updateProgressPosition(e.clientX);
    
    // Add temporary event listeners for drag
    document.addEventListener('mousemove', handleProgressMouseMove);
    document.addEventListener('mouseup', (event) => handleProgressMouseUp(event, state));
  }, [updateProgressPosition, saveVideoState]);

  const handleProgressMouseMove = useCallback((e) => {
    updateProgressPosition(e.clientX);
  }, [updateProgressPosition]);

  const handleProgressMouseUp = useCallback((e, savedState) => {
    // Remove temporary event listeners
    document.removeEventListener('mousemove', handleProgressMouseMove);
    document.removeEventListener('mouseup', handleProgressMouseUp);
    
    // Restore play state if needed
    if (savedState && savedState.playing) {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [handleProgressMouseMove]);

  // Handle volume slider interactions
  const updateVolumePosition = useCallback((clientX) => {
    if (volumeRef.current && videoRef.current && !stateRef.current.isDragging) {
      // Save current play state
      const wasPlaying = !videoRef.current.paused;
      
      const rect = volumeRef.current.getBoundingClientRect();
      const thumbWidth = 15; // Width of thumb in pixels (adjusted to 15px)
      const effectiveWidth = rect.width - thumbWidth;
      
      // Calculate position accounting for thumb width
      let relativeX = clientX - rect.left;
      
      // Clamp position between 0 and 1 - but don't mute on drag out
      let position;
      if (relativeX < 0) {
        // Don't mute on drag out to left - keep minimal volume
        position = 0.1; 
      } else if (relativeX > effectiveWidth) {
        // Cap at maximum on drag out to right
        position = 1;
      } else {
        // Normal case - within bounds
        position = relativeX / effectiveWidth;
      }
      
      if (isFinite(position)) {
        // Apply exponential curve to volume for more natural increase
        const curvedVolume = Math.pow(position, 1.5);
        
        // Ensure volume is never less than 0.05 to prevent accidental muting
        const safeVolume = Math.max(0.05, curvedVolume);
        videoRef.current.volume = safeVolume;
        setVolume(safeVolume);
        
        // Only explicitly mute if the mute button is clicked
        if (stateRef.current.isMuted) {
          setIsMuted(false);
          videoRef.current.muted = false;
        }
        
        // Update thumb position
        if (volumeThumbRef.current) {
          const positionPx = Math.max(0, Math.min(position * effectiveWidth, effectiveWidth));
          volumeThumbRef.current.style.left = `${positionPx}px`;
          
          // Update volume indicator to match thumb position
          updateVolumeIndicator(position, `${positionPx}px`);
        }
        
        // Restore playback if it was playing
        if (wasPlaying) {
          videoRef.current.play().catch(() => {});
        }
      }
    }
  }, [updateVolumeIndicator]);

  const handleVolumeMouseDown = useCallback((e) => {
    if (stateRef.current.isDragging) return;
    
    // Save current state
    const state = saveVideoState();
    
    updateVolumePosition(e.clientX);
    
    // Add temporary event listeners for drag
    document.addEventListener('mousemove', handleVolumeMouseMove);
    document.addEventListener('mouseup', (event) => handleVolumeMouseUp(event, state));
  }, [updateVolumePosition, saveVideoState]);

  const handleVolumeMouseMove = useCallback((e) => {
    updateVolumePosition(e.clientX);
  }, [updateVolumePosition]);

  const handleVolumeMouseUp = useCallback((e, savedState) => {
    // Remove temporary event listeners
    document.removeEventListener('mousemove', handleVolumeMouseMove);
    document.removeEventListener('mouseup', handleVolumeMouseUp);
    
    // Restore play state if needed
    if (savedState && savedState.playing) {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [handleVolumeMouseMove]);

  // Initialize volume indicator
  useEffect(() => {
    // Initial update for volume indicator with a small delay to ensure DOM is ready
    setTimeout(() => {
      if (volumeThumbRef.current && volumeRef.current) {
        // Calculate initial position for thumb
        const effectiveWidth = volumeRef.current.clientWidth - 15;
        const initialPosition = `${volume * effectiveWidth}px`;
        volumeThumbRef.current.style.left = initialPosition;
        updateVolumeIndicator(volume, initialPosition);
      }
    }, 100);
  }, [updateVolumeIndicator, volume]);

  // Set up video element and initial state
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      // Add event listeners
      const handleLoadedMetadata = () => {
        setDuration(videoElement.duration);
        // Initial time display update
        if (timeDisplayRef.current) {
          timeDisplayRef.current.textContent = '00:00';
        }
      };
      
      const handlePlay = () => {
        setIsPlaying(true);
        setSelectedButton('play');
      };
      
      const handlePause = () => {
        setIsPlaying(false);
        setSelectedButton(null); // Reset to default state
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setSelectedButton(null);
      };
      
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('pause', handlePause);
      videoElement.addEventListener('ended', handleEnded);
      
      // Set initial volume
      videoElement.volume = volume;
      videoElement.muted = isMuted;
      
      // Set iOS compatibility attributes
      videoElement.setAttribute('playsinline', '');
      videoElement.setAttribute('webkit-playsinline', '');
      
      // Clean up event listeners
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
        videoElement.removeEventListener('ended', handleEnded);
      };
    }
  }, [volume, isMuted]);

  // Update time and progress bar position
  useEffect(() => {
    const updateTimeAndProgress = () => {
      if (videoRef.current) {
        const curTime = videoRef.current.currentTime;
        const dur = videoRef.current.duration || 0;
        
        // Update time state
        setCurrentTime(curTime);
        
        // Update progress thumb position
        if (progressRef.current && progressThumbRef.current && isFinite(dur) && dur > 0) {
          const progressWidth = progressRef.current.clientWidth - 10; // Adjust for thumb width
          const position = (curTime / dur) * progressWidth;
          
          // Clamp position to prevent overflow
          const clampedPosition = Math.max(0, Math.min(position, progressWidth));
          progressThumbRef.current.style.left = `${clampedPosition}px`;
        }
        
        // Update time display
        if (timeDisplayRef.current) {
          timeDisplayRef.current.textContent = formatTime(curTime);
        }
      }
    };
    
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('timeupdate', updateTimeAndProgress);
      
      return () => {
        videoElement.removeEventListener('timeupdate', updateTimeAndProgress);
      };
    }
  }, []);

  // Handle window drag
  useEffect(() => {
    // Keep track of window drag state
    let savedState = null;
    
    const handleMouseDown = (e) => {
      // Check if click is on title bar
      const titleBar = e.target.closest('.title-bar');
      if (titleBar) {
        setIsDragging(true);
        
        // Save video state
        savedState = saveVideoState();
      }
    };
    
    const handleMouseUp = () => {
      if (stateRef.current.isDragging) {
        setIsDragging(false);
        
        // Restore video state after a short delay
        setTimeout(() => {
          if (savedState) {
            restoreVideoState(savedState);
            
            // Force React to update button states
            setIsPlaying(savedState.playing);
            setSelectedButton(savedState.playing ? 'play' : null);
          }
        }, 50);
      }
    };
    
    // Add event listeners
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [saveVideoState, restoreVideoState]);

  // List of buttons with their handlers
  const buttonList = [
    { type: 'play', className: 'play', action: handlePlay },
    { type: 'pause', className: 'pause', action: handlePause },
    { type: 'stop', className: 'stop', action: handleStop },
    { type: 'open', className: 'open', action: handleOpen },
    { type: 'seekbackward', className: 'seekbackward', action: handleSeekBackward },
    { type: 'seekforward', className: 'seekforward', action: handleSeekForward },
    { type: 'mute', className: 'mute', action: toggleMute },
  ];

  return (
    <Window
      {...props}
      Component={WindowProgram}
      title="Windows Media Player"
      menuOptions={menuOptions}
      className={cx('wmp-window', props.className, { 'window-dragging': isDragging })}
      initialWidth={294}
      initialHeight={403}
      resizable={false}
      style={{ zIndex: 9, top: '50px' }}
    >
      <div 
        ref={containerRef}
        className="wmp-container"
        style={{
          width: '288px',
          height: '359px',
          position: 'relative',
          backgroundColor: 'transparent',
        }}
      >
        {/* Video Element */}
        <div className="video-wrapper">
          <video
            ref={videoRef}
            src="/static/donwest.mp4"
            crossOrigin="anonymous"
            playsInline
            preload="auto"
            disablePictureInPicture
            style={{
              width: '288px',
              height: '189px',
              position: 'absolute',
              objectFit: 'cover',
              backgroundColor: 'transparent',
              overflow: 'hidden',
              zIndex: 3,
              top: '-1px',
              left: '.5px',
              transform: 'scale(1.07)',
              transformOrigin: 'center',
            }}
          />
        </div>

        {/* Background and Buttons */}
        <div className="wmp-shell">
          <div className="wmp-bg" />

          {/* Control Buttons */}
          {buttonList.map((btn, idx) => (
            <button
              key={idx}
              className={cx('wmp-button', btn.className, {
                selected: selectedButton === btn.type || (btn.type === 'mute' && isMuted),
                hovered: btn.type === 'play' && !isPlaying, // Play button appears hovered by default
                disabled: isDragging
              })}
              onClick={btn.action}
              disabled={isDragging}
            />
          ))}

          {/* Custom Volume Slider */}
          <div 
            ref={volumeRef}
            className={cx('wmp-volume-slider', { disabled: isDragging })}
            style={{
              top: '238px',
              left: '238px',
              width: '52px',
              height: '16px',
              position: 'absolute',
              zIndex: 2,
              cursor: isDragging ? 'not-allowed' : 'pointer',
              background: 'transparent',
              overflow: 'hidden',
            }}
            onMouseDown={!isDragging ? handleVolumeMouseDown : null}
          >
            {/* Volume indicator fill with triangular shape - more translucent */}
            <div 
              ref={volumeIndicatorRef}
              className="volume-indicator"
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                height: '100%', 
                width: '100%',
                backgroundColor: 'rgba(16, 132, 208, 0.15)', // Very translucent blue
              }}
            />
            
            <div 
              ref={volumeThumbRef}
              className="volume-thumb"
              style={{
                position: 'absolute',
                top: '-1px',
                left: '0px',
                zIndex: 3,
              }}
            />
          </div>

          {/* Custom Progress Slider */}
          <div 
            ref={progressRef}
            className={cx('wmp-progress-slider', { disabled: isDragging })}
            style={{
              top: '219px',
              left: '0px',
              width: '288px',
              height: '16px',
              position: 'absolute',
              backgroundImage: 'url(../../assets/progress_bar.png)',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              zIndex: 2,
              cursor: isDragging ? 'not-allowed' : 'pointer',
            }}
            onMouseDown={!isDragging ? handleProgressMouseDown : null}
          >
            <div 
              ref={progressThumbRef}
              className="progress-thumb"
              style={{
                position: 'absolute',
                top: '1px',
                left: '0px',
                zIndex: 3,
              }}
            />
          </div>

          {/* Custom Time Display - Positioned in bottom right corner */}
          <div 
            className="wmp-time-display"
            style={{
              position: 'absolute',
              bottom: '10px', 
              right: '9px',
              width: '37px',
              height: '14px',
              color: '#ffffff',
              background: 'transparent',
              zIndex: 4,
            }}
          >
            <span ref={timeDisplayRef} className="wmp-time-text">00:00</span>
          </div>
        </div>
      </div>
    </Window>
  );
};

export default VideoPlayerMobile;