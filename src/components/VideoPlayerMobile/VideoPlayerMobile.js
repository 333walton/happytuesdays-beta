import React, { useRef, useState } from 'react';
import 'media-chrome';
import Window from '../tools/Window';
import { WindowProgram } from 'packard-belle';
import buildMenu from '../../helpers/menuBuilder';
import './_styles.scss';

const VideoPlayerMobile = (props) => {
  const videoRef = useRef(null);

  const showHelp = () => {
    alert('Media Player Help is not implemented yet.');
  };

  const menuOptions = buildMenu({
    ...props,
    componentType: 'VideoPlayerMobile',
    showHelp,
    options: {},
  });

  // 📼 WMP Button
  const WmpButton = ({ backgroundImage, left, top }) => {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    const getBackgroundPosition = () => {
      if (pressed) return "-42px 0";  // active (pressed)
      if (hovered) return "-21px 0";  // hover
      return "0 0";                   // default
    };

    return (
      <div
        style={{
          position: "absolute",
          width: "21px",
          height: "21px",
          left: `${left}px`,
          top: `${top}px`,
          backgroundImage: `url(${backgroundImage})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "84px 21px",
          backgroundPosition: getBackgroundPosition(),
          imageRendering: "pixelated",
          cursor: "pointer",
          zIndex: 6,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setPressed(false);
        }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
      />
    );
  };

  // 📋 Button Data
  const controlButtons = [
    { image: "/wmp_assets/bar2_play.png", left: 6, top: 237 },
    { image: "/wmp_assets/bar2_pause.png", left: 28, top: 237 },
    { image: "/wmp_assets/bar2_stop.png", left: 50, top: 237 },
    { image: "/wmp_assets/bar2_open.png", left: 82, top: 237 },
    { image: "/wmp_assets/bar2_prev.png", left: 104, top: 237 },
    { image: "/wmp_assets/bar2_next.png", left: 126, top: 237 },
    { image: "/wmp_assets/bar2_mute.png", left: 212, top: 237 },
  ];

  return (
    <Window
      {...props}
      Component={WindowProgram}
      title="Windows Media Player"
      menuOptions={menuOptions}
      className="wmp-window"
      initialWidth={294}
      initialHeight={403}
      resizable={false}
      style={{
        zIndex: 11,
        top: '50px',
      }}
    >
      <media-controller
        autohide="-1"
        style={{
          width: '288px',
          height: '359px',
          display: 'block',
          top: '0px',
          position: 'relative',
          backgroundColor: 'transparent', // important
          zIndex: 3,
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

        {/* 🛡 Empty fallback to prevent black screen */}
        <div slot="fallback"></div>

        {/* 🎨 Background Shell */}
        <div className="wmp-shell">
          <img
            src="/wmp_assets/window_player_crop2.png"
            alt="WMP Background"
            className="wmp-bg"
          />

          {/* 🎮 Render Buttons */}
          {controlButtons.map((btn, index) => (
            <WmpButton
              key={index}
              backgroundImage={btn.image}
              left={btn.left}
              top={btn.top}
            />
          ))}

          {/* 🎚 Volume Slider */}
          <media-volume-range
            mediapresent="false"
            className="wmp-slider"
            style={{
              top: '247px',
              left: '232px',
              width: '38px',
              height: '0px',
              position: 'absolute',
              //backgroundImage: 'url("/wmp_assets/bar2_volume_slide - crop.png")',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover', // cover not contain for bar background
              zIndex: 2,
            }}
          >
            {/* Volume Thumb */}
            <div
              slot="thumb"
              style={{
                width: '10px',
                height: '16px',
                backgroundImage: 'url("/wmp_assets/bar2_volume_slide - crop.png")', // reusing progress thumb png here
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                zIndex: 3,
                cursor: 'pointer',
              }}
            >
              <media-volume-range
                style={{
                  height: '5px',
                }}
              />
            </div>
          </media-volume-range>
            
          {/* Time Progress Bar */}
          <media-time-range
            mediapresent="false"
            className="wmp-slider"
            style={{
              top: '219px',
              left: '0px',
              width: '288px',
              height: '16px',
              position: 'absolute',
              backgroundImage: 'url("/wmp_assets/progress_bar.png")',
              backgroundSize: '101% 100%',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              zIndex: 2,
            }}
          >
            {/* time prog thumb */}
            <div
              slot="thumb"
              style={{
                width: '12px',
                height: '14px',
                position: 'absolute',
                backgroundImage: 'url("/wmp_assets/progress_slide - crop.png")',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                zIndex: 3,
                cursor: 'pointer',
              }}
            />
          </media-time-range>

          {/* 📄 Info Panels */}
          <div
            style={{
              top: '266px',
              left: '-200px',
              width: '270px',
              height: '14px',
              color: '#ffffff',
              fontSize: '10px',
              fontFamily: 'Microsoft Sans Serif, sans-serif',
              position: 'absolute',
              textAlign: 'right',
              lineHeight: '14px',
              zIndex: 2,
            }}
          >
            Media Type:
          </div>

          <div
            style={{
              top: '285px',
              left: '-200px',
              width: '270px',
              height: '50px',
              color: '#ffffff',
              fontSize: '10px',
              fontFamily: 'Microsoft Sans Serif, sans-serif',
              position: 'absolute',
              textAlign: 'right',
              lineHeight: '16px',
              zIndex: 2,
            }}
          >
            Clip:<br />
            Author:<br />
            Copyright:
          </div>

          {/* ⏱ Time Display */}
          <div
            style={{
              top: '325px',
              left: '250px',
              width: '37px',
              height: '14px',
              color: '#ffffff',
              background: 'transparent', 
              fontSize: '10px',
              fontFamily: 'Microsoft Sans Serif, sans-serif',
              textAlign: 'right',
              position: 'absolute',
              zIndex: 2,
            }}
          >
            <media-time-display
              mediapresent="false"
              style={{
                backgroundColor: 'transparent',
                fontSize: '11px',
              }}
            />
          </div>
        </div>
      </media-controller>
    </Window>
  );
};

export default VideoPlayerMobile;
