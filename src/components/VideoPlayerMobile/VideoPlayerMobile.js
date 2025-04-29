import React, { useRef, useState, useEffect } from 'react';
import 'media-chrome';
import { MediaController, MediaTimeRange, MediaVolumeRange, MediaTimeDisplay } from 'media-chrome/react';
import Window from '../tools/Window';
import { WindowProgram } from 'packard-belle';
import buildMenu from '../../helpers/menuBuilder';
import cx from 'classnames';
import './_styles.scss';

const VideoPlayerMobile = (props) => {
  const videoRef = useRef(null);
  const volumeRangeRef = useRef(null);

  const [selectedButton, setSelectedButton] = useState(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const showHelp = () => {
    alert('Media Player Help is not implemented yet.');
  };

  const menuOptions = buildMenu({
    ...props,
    componentType: 'VideoPlayerMobile',
    showHelp,
    options: {},
  });

  const buttonList = [
    { type: 'play', className: 'play' },
    { type: 'pause', className: 'pause' },
    { type: 'stop', className: 'stop' },
    { type: 'open', className: 'open' },
    { type: 'seekbackward', className: 'seekbackward' },
    { type: 'seekforward', className: 'seekforward' },
    { type: 'mute', className: 'mute' },
  ];

  const handleButtonClick = (type) => {
    setSelectedButton(type);
    if (videoRef.current) {
      if (type === 'play') videoRef.current.play();
      if (type === 'pause') videoRef.current.pause();
      if (type === 'stop') {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const wasMuted = videoRef.current.muted;
    videoRef.current.muted = !wasMuted;
    setIsMuted(!wasMuted);

    if (volumeRangeRef.current) {
      volumeRangeRef.current.value = wasMuted ? volume : 0;
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <Window
      {...props}
      Component={WindowProgram}
      title="Windows Media Player"
      menuOptions={menuOptions}
      className={cx('wmp-window', props.className)}
      initialWidth={294}
      initialHeight={403}
      resizable={false}
      style={{ zIndex: 9, top: '50px' }}
    >
      <MediaController
        id="wmp-controller"
        style={{
          width: '288px',
          height: '359px',
          display: 'block',
          position: 'relative',
          backgroundColor: 'transparent',
        }}
      >
        {/* 🎥 Video */}
        <div className="video-wrapper">
          <video
            slot="media"
            ref={videoRef}
            src="/static/donwest.mp4"
            crossOrigin="anonymous"
            playsInline
            muted
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

        {/* 🎨 Background and Buttons */}
        <div className="wmp-shell">
          <div className="wmp-bg" />

          {buttonList.map((btn, idx) => (
            <button
              key={idx}
              slot={btn.type}
              className={cx('wmp-button', btn.className, {
                selected: selectedButton === btn.type || (btn.type === 'mute' && isMuted),
              })}
              onClick={() => {
                if (btn.type === 'mute') {
                  toggleMute();
                } else {
                  handleButtonClick(btn.type);
                }
              }}
            />
          ))}

          {/* 🎚 Volume Slider */}
          <MediaVolumeRange
            ref={volumeRangeRef}
            mediapresent="false"
            className="wmp-volume-slider"
            style={{
              top: '238px',
              left: '228px',
              width: '38px',
              height: '16px',
              position: 'absolute',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              zIndex: 2,
            }}
            onInput={(e) => {
              const newVolume = parseFloat(e.target.value);
              setVolume(newVolume);
              if (newVolume === 0) {
                setIsMuted(true);
              } else {
                setIsMuted(false);
              }
            }}
          >
            <div
              slot="thumb"
              className="volume-thumb"
            />
          </MediaVolumeRange>

          {/* ⏱ Time Progress Bar */}
          <MediaTimeRange
            mediapresent="false"
            className="wmp-progress-slider"
            style={{
              top: '219px',
              left: '0px',
              width: '288px',
              height: '16px',
              position: 'absolute',
              backgroundSize: '101% 100%',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              zIndex: 2,
            }}
          >
            <div
              slot="thumb"
              className="progress-thumb"
            />
          </MediaTimeRange>

          {/* ⏱ Time Display */}
          <div className="wmp-time-display">
            <MediaTimeDisplay mediapresent="false" />
          </div>
        </div>
      </MediaController>
    </Window>
  );
};

export default VideoPlayerMobile;
