import React, { useRef, useState, useEffect } from 'react';
import Window from '../tools/Window';
import { WindowProgram } from 'packard-belle';
import buildMenu from '../../helpers/menuBuilder';
import cx from 'classnames';
import { Video } from '@react95/core';
import '@react95/core/GlobalStyle';
import '@react95/core/themes/win95.css';
import './_styles.scss';

const VideoPlayerMobile = (props) => {
  // Create state for minimal functionality
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  
  // Create refs for DOM elements
  const videoRef = useRef(null);
  const timeDisplayRef = useRef(null);
  const progressThumbRef = useRef(null);
  const volumeThumbRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);
  const volumeIndicatorRef = useRef(null);
  const windowRef = useRef(null);

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

  // BUTTON HANDLERS
  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      setSelectedButton('play');
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      setSelectedButton(null);
    }
  };

  const handleStop = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setSelectedButton(null);
    }
  };

  const handleOpen = () => {
    alert('Open file functionality is not implemented yet.');
    setSelectedButton('open');
    setTimeout(() => setSelectedButton(null), 300);
  };

  const handleSeekBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
      setSelectedButton('seekbackward');
      setTimeout(() => setSelectedButton(null), 300);
    }
  };

  const handleSeekForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration || 0,
        videoRef.current.currentTime + 5
      );
      setSelectedButton('seekforward');
      setTimeout(() => setSelectedButton(null), 300);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      videoRef.current.muted = newMutedState;
    }
  };

  // Progress slider interaction
  const handleProgressMouseDown = (e) => {
    if (progressRef.current && videoRef.current) {
      // Store if video was playing
      const wasPlaying = !videoRef.current.paused;
      
      // Calculate position
      const rect = progressRef.current.getBoundingClientRect();
      const thumbWidth = 10;
      const effectiveWidth = rect.width - thumbWidth;
      let position = (e.clientX - rect.left) / effectiveWidth;
      position = Math.max(0, Math.min(1, position));
      
      // Set video time
      const newTime = position * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      
      // Update thumb position
      if (progressThumbRef.current) {
        const positionPx = Math.max(0, Math.min(position * effectiveWidth, effectiveWidth));
        progressThumbRef.current.style.left = `${positionPx}px`;
      }
      
      // Resume playback if it was playing
      if (wasPlaying) {
        videoRef.current.play();
      }
      
      // Setup drag handlers
      document.addEventListener('mousemove', handleProgressMouseMove);
      document.addEventListener('mouseup', handleProgressMouseUp);
    }
  };
  
  const handleProgressMouseMove = (e) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const thumbWidth = 10;
      const effectiveWidth = rect.width - thumbWidth;
      let position = (e.clientX - rect.left) / effectiveWidth;
      position = Math.max(0, Math.min(1, position));
      
      // Set video time
      const newTime = position * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      
      // Update thumb position
      if (progressThumbRef.current) {
        const positionPx = Math.max(0, Math.min(position * effectiveWidth, effectiveWidth));
        progressThumbRef.current.style.left = `${positionPx}px`;
      }
    }
  };
  
  const handleProgressMouseUp = () => {
    // Remove drag handlers
    document.removeEventListener('mousemove', handleProgressMouseMove);
    document.removeEventListener('mouseup', handleProgressMouseUp);
  };

  // Volume slider interaction
  const handleVolumeMouseDown = (e) => {
    if (volumeRef.current && videoRef.current) {
      // Calculate position
      const rect = volumeRef.current.getBoundingClientRect();
      const thumbWidth = 15;
      const effectiveWidth = rect.width - thumbWidth;
      let position = (e.clientX - rect.left) / effectiveWidth;
      position = Math.max(0, Math.min(1, position));
      
      // Set volume
      videoRef.current.volume = position;
      setVolume(position);
      
      // Update volume indicator and thumb
      updateVolumeIndicator(position);
      
      // Setup drag handlers
      document.addEventListener('mousemove', handleVolumeMouseMove);
      document.addEventListener('mouseup', handleVolumeMouseUp);
    }
  };
  
  const handleVolumeMouseMove = (e) => {
    if (volumeRef.current && videoRef.current) {
      const rect = volumeRef.current.getBoundingClientRect();
      const thumbWidth = 15;
      const effectiveWidth = rect.width - thumbWidth;
      let position = (e.clientX - rect.left) / effectiveWidth;
      position = Math.max(0, Math.min(1, position));
      
      // Set volume
      videoRef.current.volume = position;
      setVolume(position);
      
      // Update volume indicator and thumb
      updateVolumeIndicator(position);
    }
  };
  
  const handleVolumeMouseUp = () => {
    // Remove drag handlers
    document.removeEventListener('mousemove', handleVolumeMouseMove);
    document.removeEventListener('mouseup', handleVolumeMouseUp);
  };

  // Update volume indicator fill
  const updateVolumeIndicator = (volumeLevel) => {
    if (volumeIndicatorRef.current && volumeThumbRef.current && volumeRef.current) {
      const volumeWidth = volumeRef.current.clientWidth - 15;
      const thumbPos = volumeLevel * volumeWidth;
      
      // Update clip path for a right triangle
      volumeIndicatorRef.current.style.clipPath = `polygon(8px 100%, ${thumbPos}px 100%, ${thumbPos}px 30%)`;
      
      // Update thumb position
      volumeThumbRef.current.style.left = `${thumbPos}px`;
    }
  };
  
  // Reinstall event handlers after window drag
  const reinstallHandlers = () => {
    // Re-attach slider handlers
    if (progressRef.current) {
      progressRef.current.onmousedown = handleProgressMouseDown;
    }
    
    if (volumeRef.current) {
      volumeRef.current.onmousedown = handleVolumeMouseDown;
    }
  };
  
  // Handle window drag
  useEffect(() => {
    const handleDragStart = () => {
      // Store video state before drag
      if (videoRef.current) {
        videoRef.current._wasPlaying = !videoRef.current.paused;
        videoRef.current._volume = videoRef.current.volume;
        videoRef.current._time = videoRef.current.currentTime;
        videoRef.current._muted = videoRef.current.muted;
      }
    };
    
    const handleDragEnd = () => {
      // Small delay to let the window settle
      setTimeout(() => {
        // Restore video state
        if (videoRef.current) {
          videoRef.current.volume = videoRef.current._volume || volume;
          videoRef.current.currentTime = videoRef.current._time || currentTime;
          videoRef.current.muted = videoRef.current._muted || isMuted;
          
          if (videoRef.current._wasPlaying) {
            videoRef.current.play();
          }
        }
        
        // Reinstall event handlers
        reinstallHandlers();
        
        // Update UI state
        if (videoRef.current) {
          updateVolumeIndicator(videoRef.current.volume);
        }
      }, 50);
    };
    
    const targetElement = document.querySelector('span.r95_13gnpv08');
    if (targetElement) {
      targetElement.classList.add('hidden-by-ai');
    }
    
    // Get window element
    const windowElement = document.querySelector('.wmp-window');
    if (windowElement) {
      // Get title bar
      const titleBar = windowElement.querySelector('.title-bar');
      if (titleBar) {
        titleBar.addEventListener('mousedown', handleDragStart);
        document.addEventListener('mouseup', handleDragEnd);
      }
    }
    
    return () => {
      const windowElement = document.querySelector('.wmp-window');
      if (windowElement) {
        const titleBar = windowElement.querySelector('.title-bar');
        if (titleBar) {
          titleBar.removeEventListener('mousedown', handleDragStart);
          document.removeEventListener('mouseup', handleDragEnd);
        }
      }
    };
  }, [volume, currentTime, isMuted]);
  
  // Get video element reference after component mounts
  useEffect(() => {
    // Find the actual video element inside the Video component
    const videoElement = document.querySelector('.wmp-window video');
    if (videoElement) {
      // Store reference to the actual video element
      videoRef.current = videoElement;
      
      // Set up event listeners
      const handleTimeUpdate = () => {
        const currentTime = videoElement.currentTime;
        setCurrentTime(currentTime);
        
        // Update progress bar
        if (progressRef.current && progressThumbRef.current) {
          const duration = videoElement.duration || 1;
          const progress = currentTime / duration;
          const progressWidth = progressRef.current.clientWidth - 10;
          const thumbPosition = progress * progressWidth;
          progressThumbRef.current.style.left = `${thumbPosition}px`;
        }
        
        // Update time display
        if (timeDisplayRef.current) {
          timeDisplayRef.current.textContent = formatTime(currentTime);
        }
      };
      
      const handleVideoPlay = () => {
        setIsPlaying(true);
        setSelectedButton('play');
      };
      
      const handleVideoPause = () => {
        setIsPlaying(false);
        setSelectedButton(null);
      };
      
      // Add event listeners
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      videoElement.addEventListener('play', handleVideoPlay);
      videoElement.addEventListener('pause', handleVideoPause);
      
      // Initialize volume indicator
      setTimeout(() => {
        const currentVolume = videoElement.volume || 1;
        setVolume(currentVolume);
        updateVolumeIndicator(currentVolume);
        
        // Install handlers
        reinstallHandlers();
      }, 100);
      
      // Cleanup
      return () => {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('play', handleVideoPlay);
        videoElement.removeEventListener('pause', handleVideoPause);
      };
    }
  }, []);

  // List of buttons with handlers
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
      ref={windowRef}
      Component={WindowProgram}
      title="Windows Media Player"
      menuOptions={menuOptions}
      className={cx('wmp-window', props.className)}
      initialWidth={294}
      initialHeight={403}
      resizable={false}
      style={{ zIndex: 9, top: '50px' }}
    >
      <div 
        className="wmp-container"
        style={{
          width: '288px',
          height: '359px',
          position: 'relative',
          backgroundColor: 'transparent',
        }}
      >
        {/* Video Element - Using @react95/core Video component */}
        <div className="video-wrapper">
          <Video
            src="/static/donwest.mp4"
            controls={false}
            playsInline
            playsinline="true"
            webkit-playsinline="true"
            preload="auto"
            onContextMenu={(e) => e.preventDefault()}
            style={{
              width: '288px',
              height: '189px',
              position: 'absolute',
              objectFit: 'cover',
              backgroundColor: 'transparent',
              overflow: 'hidden',
              zIndex: 3,
              top: '11px',
              left: '.69px',
              transform: 'scale(1.25)',
              transformOrigin: 'center',
              display: 'inline',
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
                hovered: btn.type === 'play' && !isPlaying
              })}
              onClick={btn.action}
            />
          ))}

          {/* Custom Volume Slider */}
          <div 
            ref={volumeRef}
            className="wmp-volume-slider"
            style={{
              top: '238px',
              left: '238px',
              width: '52px',
              height: '16px',
              position: 'absolute',
              zIndex: 2,
              cursor: 'pointer',
              background: 'transparent',
              overflow: 'hidden',
            }}
            onMouseDown={handleVolumeMouseDown}
          >
            {/* Volume indicator with triangle */}
            <div 
              ref={volumeIndicatorRef}
              className="volume-indicator"
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                height: '100%', 
                width: '100%',
                backgroundColor: 'rgba(16, 132, 208, 0.15)',
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
            className="wmp-progress-slider"
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
              cursor: 'pointer',
            }}
            onMouseDown={handleProgressMouseDown}
          >
            <div 
              ref={progressThumbRef}
              className="progress-thumb"
              style={{
                position: 'absolute',
                top: '-1.5px',
                left: '0px',
                zIndex: 3,
              }}
            />
          </div>

          {/* Custom Time Display */}
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