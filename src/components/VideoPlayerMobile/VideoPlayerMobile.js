import React, { useRef, useState, useEffect, useContext } from 'react';
import Window from '../tools/Window';
import { WindowProgram } from 'packard-belle';
import buildMenu from '../../helpers/menuBuilder';
import cx from 'classnames';
import { Video } from '@react95/core';
import '@react95/core/GlobalStyle';
import '@react95/core/themes/win95.css';
import './_styles.scss';
import { ProgramContext } from '../../contexts';
import readme from '../../data/textFiles/readme';

const VideoPlayerMobile = (props) => {
  // Create state for minimal functionality
  const { onOpen } = useContext(ProgramContext); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSkip, setShowSkip] = useState(true);
  const [skipTimeProgress, setSkipTimeProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(30);
  
  // Create refs for DOM elements
  const videoRef = useRef(null);
  const timeDisplayRef = useRef(null);
  const progressThumbRef = useRef(null);
  const volumeThumbRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);
  const volumeIndicatorRef = useRef(null);
  const windowRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const showHelp = () => {
    alert('Media Player Help is not implemented yet.');
  };

  const menuOptions = buildMenu({
    ...props,
    componentType: 'VideoPlayerMobile',
    showHelp,
    options: {},
  });

  // Format remaining time as 0:SS
  const formatRemainingTime = (seconds) => {
    const wholeSeconds = Math.ceil(seconds);
    return `0:${wholeSeconds.toString().padStart(2, '0')}`;
  };

  // Format time as MM:SS
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Skip function
  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = videoRef.current.duration; // Skip to the end of the video
      setShowSkip(false); // Hide the skip button
      setIsPlaying(false); // Stop the video
    }
  };

  // BUTTON HANDLERS
  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      setSelectedButton('play');
      
      // Reset progress if at the beginning
      if (currentTime < 1) {
        setSkipTimeProgress(0);
      }
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
      setSkipTimeProgress(0);
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
  
  // Progress bar for skip timer - increments over 30 seconds when playing
  useEffect(() => {
    let intervalId;
    
    if (isPlaying && skipTimeProgress < 100) {
      intervalId = setInterval(() => {
        setSkipTimeProgress(prevProgress => {
          const newProgress = prevProgress + (100 / 30) * 0.1; // 0.1 second intervals
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 100); // Update every 100ms for smooth animation
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, skipTimeProgress]);

  // Add this effect to handle the countdown timer
  useEffect(() => {
    let intervalId;
    
    if (isPlaying && remainingTime > 0) {
      intervalId = setInterval(() => {
        setRemainingTime(prevTime => {
          const newTime = prevTime - 0.1; // Decrement by 0.1 seconds
          return newTime < 0 ? 0 : newTime;
        });
      }, 100); // Update every 100ms for smooth countdown
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, remainingTime]);

  // Add this effect to reset the timer when the video is restarted
  useEffect(() => {
    if (currentTime < 1 && !isPlaying) {
      setRemainingTime(30);
    }
  }, [currentTime, isPlaying]);

  // Skip button auto-hide and reset
  useEffect(() => {
    if (showSkip) {
      const timer = setTimeout(() => {
        setShowSkip(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showSkip]);

  // Reset progress when video restarts from beginning
  useEffect(() => {
    if (currentTime < 1 && !isPlaying) {
      setSkipTimeProgress(0);
    }
  }, [currentTime, isPlaying]);
  
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
      
      // Critical fix for iOS: force playsinline attribute
      videoElement.setAttribute('playsinline', '');
      videoElement.setAttribute('webkit-playsinline', '');
      videoElement.setAttribute('x5-playsinline', '');
      videoElement.setAttribute('x5-video-player-type', 'h5');
      videoElement.setAttribute('x5-video-player-fullscreen', 'false');
      videoElement.setAttribute('x5-video-orientation', 'portraint');
      
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
      initialX={10} // Set the initial X position of the window
      initialY={2} // Set the initial Y position of the window
      position={{ x: 10, y: 2 }} // Explicitly set the position
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
            playsInline={true}
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
          
          {/* YouTube style ad info overlay in the bottom left */}
          <div
            style={{
              position: 'absolute',
              left: '10px',
              bottom: '5px',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              color: 'white',
              fontSize: '10px',
              fontFamily: 'Arial, sans-serif',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              //opacity: 0.9,
              padding: '2px 4px',
              borderRadius: '2px'
            }}
          >
            <span style={{ marginRight: '5px' }}>Ad</span>
            <span>•</span>
            <span style={{ marginLeft: '5px' }}>
            {formatRemainingTime(remainingTime)}
            </span>
            <span 
            style={{ 
              marginLeft: '10px', 
              cursor: 'pointer',
              fontSize: '9px',
              textDecoration: 'underline'
            }}
            onClick={() => {
              onOpen({
                component: "InternetExplorer",
                data: {
                  __html: readme,
                },
              });
            }}
          >
            Visit advertiser's site
          </span>
          </div>
          
          {/* Yellow progress bar */}
          <div
            style={{
              position: 'absolute',
              left: '0',
              bottom: '0px', // Positioned just under the ad info
              height: '4px', // Thin line
              width: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark background
              zIndex: 99
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '0',
                top: '0',
                height: '100%',
                width: `${skipTimeProgress}%`,
                backgroundColor: '#FFBB00', // YouTube yellow
                transition: 'width 0.1s linear'
              }}
            />
          </div>
          
          {/* YouTube-style Skip Ad button */}
          <div
            onClick={skipTimeProgress >= 100 ? handleSkip : undefined}
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '-4px',
              backgroundColor: skipTimeProgress >= 100 ? '#333333' : '#555555',
              color: 'white',
              padding: '8px 12px 8px 10px',
              fontSize: '12px',
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'bold',
              cursor: skipTimeProgress >= 100 ? 'pointer' : 'default',
              zIndex: 100,
              opacity: 0.9,
              transition: 'background-color 0.2s',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
            onMouseOver={(e) => {
              if (skipTimeProgress >= 100) e.currentTarget.style.backgroundColor = '#444444';
            }}
            onMouseOut={(e) => {
              if (skipTimeProgress >= 100) e.currentTarget.style.backgroundColor = '#333333';
            }}
          >
            <span
              onClick={skipTimeProgress >= 100 ? handleSkip : undefined} // Make text clickable
              style={{
                cursor: skipTimeProgress >= 100 ? 'pointer' : 'default', // Show pointer when clickable
              }}
            >
              Skip Ad
            </span>
            <span
              onClick={skipTimeProgress >= 100 ? handleSkip : undefined} // Make arrow clickable
              style={{
                display: 'inline-block',
                width: '0',
                height: '0',
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderLeft: '8px solid white',
                marginLeft: '3px',
                cursor: skipTimeProgress >= 100 ? 'pointer' : 'default', // Show pointer when clickable
              }}
            ></span>
          </div>
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
          
          {/* Dropdown trigger */}
          <div 
            className="dropdown-trigger"
            onClick={toggleDropdown}
            style={{
              position: 'absolute',
              left: '5px',
              top: '265px',
              width: '288px',
              height: '18px',
              zIndex: 5,
              cursor: 'pointer',
              color: '#ffffff',
              fontSize: '17px'
            }}>...</div>
          
          {/* Dropdown area - shown when isDropdownOpen is true */}
          {isDropdownOpen && (
            <div className="dropdown-content" style={{
              position: 'absolute',
              left: '0',
              top: '290px', // Right below the trigger
              width: '288px',
              height: '48px',
              backgroundColor: '#000000',
              zIndex: 5,
              color: '#ffffff',
              fontSize: '11px',
            }}>//coming soon</div>
          )}
          
          {/* Media Info Text */}
          <span className="wmp-info-text" style={{
            position: 'absolute',
            left: '44px',
            bottom: '76px',
            fontSize: '12px',
            color: '#F7931A',
          }}>VAST Inspector & Video Ad Tag Tester</span>
          <span className="wmp-info-text" style={{
            position: 'absolute',
            left: '6px',
            bottom: '56px',
            color: '#ffffff',
            fontSize: '11px'
          }}>Clip:</span>
          <span className="wmp-info-text" style={{
            position: 'absolute',
            left: '6px',
            bottom: '40px',
            color: '#ffffff',
            fontSize: '11px'
          }}>Length:</span>
          <span className="wmp-info-text" style={{
            position: 'absolute',
            left: '6px',
            bottom: '24px',
            color: '#ffffff',
            fontSize: '11px'
          }}>Date:</span>
          <span className="wmp-info-text" style={{
            position: 'absolute',
            left: '6px',
            bottom: '3px',
            color: '#ffffff',
            fontSize: '9px'
          }}>©Hydra98</span>
        </div>
      </div>
    </Window>
  );
};

export default VideoPlayerMobile;