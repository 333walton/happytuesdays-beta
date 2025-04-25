import React from 'react';
import 'media-chrome';
import Window from '../tools/Window';
import { WindowProgram } from 'packard-belle';
import './_styles.scss';

const VideoPlayerMobile = (props) => {
  return (
    <Window
      {...props}
      Component={WindowProgram}
      title="Windows Media Player"
      className="wmp-window"
      initialWidth={294}
      initialHeight={403}
      resizable={false}
    >
      <media-controller
        style={{
          width: '294px',
          height: '403px',
          display: 'block',
          position: 'relative',
        }}
      >
        <video
          slot="media"
          src="/static/donwest.mp4"
          crossOrigin="anonymous"
          playsInline
          style={{
            display: 'block',
            width: '0px',
            height: '0px',
            position: 'absolute',
          }}
        />

        <div className="wmp-shell">
          {/* 🎨 Background Shell */}
          <img
            src="/wmp_assets/window_player.png"
            alt="WMP Background"
            className="wmp-bg"
          />

          {/* 🎮 Controls */}
          <media-play-button
            mediapresent="false"
            style={{
              backgroundImage: 'url("/wmp_assets/bar2_play.png")',
              top: '276px',
              left: '6px',
              width: '20px',
              height: '20px',
              position: 'absolute',
              zIndex: 2,
            }}
          />
          <media-pause-button
            mediapresent="false"
            style={{
              backgroundImage: 'url("/wmp_assets/bar2_pause.png")',
              top: '276px',
              left: '28px',
              width: '20px',
              height: '20px',
              position: 'absolute',
              zIndex: 2,
            }}
          />
          <media-stop-button
            mediapresent="false"
            style={{
              backgroundImage: 'url("/wmp_assets/bar2_stop.png")',
              top: '276px',
              left: '50px',
              width: '21px',
              height: '21px',
              position: 'absolute',
              zIndex: 2,
            }}
          />
          <media-open-button
            mediapresent="false"
            style={{
              backgroundImage: 'url("/wmp_assets/bar2_open.png")',
              top: '276px',
              left: '72px',
              width: '21px',
              height: '21px',
              position: 'absolute',
              zIndex: 2,
            }}
          />
          <media-seek-backward-button
            mediapresent="false"
            style={{
              backgroundImage: 'url("/wmp_assets/bar2_prev.png")',
              top: '276px',
              left: '94px',
              width: '21px',
              height: '21px',
              position: 'absolute',
              zIndex: 2,
            }}
          />
          <media-seek-forward-button
            mediapresent="false"
            style={{
              backgroundImage: 'url("/wmp_assets/bar2_next.png")',
              top: '276px',
              left: '116px',
              width: '21px',
              height: '21px',
              position: 'absolute',
              zIndex: 2,
            }}
          />
          <media-mute-button
            mediapresent="false"
            style={{
              backgroundImage: 'url("/wmp_assets/bar2_mute.png")',
              top: '276px',
              left: '216px',
              width: '24px',
              height: '21px',
              position: 'absolute',
              zIndex: 2,
            }}
          />

          {/* 🎚 Volume Slider */}
          <media-volume-range
            mediapresent="false"
            className="wmp-slider"
            style={{
              top: '276px',
              left: '237px',
              width: '51px',
              height: '21px',
              position: 'absolute',
              backgroundImage: 'url("/wmp_assets/bar2_volume_slide.png")',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              zIndex: 2,
            }}
          />

          {/* ⏱ Time Slider */}
          <media-time-range
            mediapresent="false"
            className="wmp-slider"
            style={{
              top: '257px',
              left: '5px',
              width: '283px',
              height: '15px',
              position: 'absolute',
              backgroundImage: 'url("/wmp_assets/progress_bar.png")',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              zIndex: 2,
            }}
          />

          {/* 🕘 Info (Current Time) */}
          <div
            style={{
              top: '305px',
              left: '8px',
              width: '278px',
              height: '14px',
              color: '#ffffff',
              fontSize: '14px',
              fontFamily: 'Microsoft Sans Serif, sans-serif',
              position: 'absolute',
              textAlign: 'left',
              lineHeight: '14px',
              zIndex: 2,
            }}
          >
            <media-time-display mediapresent="false" />
          </div>

          {/* 📟 Status Text */}
          <div
            style={{
              top: '380px',
              left: '33px',
              width: '175px',
              height: '14px',
              color: '#ffffff',
              fontSize: '14px',
              fontFamily: 'Microsoft Sans Serif, sans-serif',
              position: 'absolute',
              textAlign: 'left',
              zIndex: 2,
            }}
          >
            Status text here
          </div>

          {/* 🔢 LED Digits */}
          <img
            src="/wmp_assets/number.png"
            alt="LED"
            style={{
              position: 'absolute',
              top: '379px',
              left: '208px',
              width: '31px',
              height: '15px',
              zIndex: 2,
            }}
          />

          {/* 🎧 Stereo Indicator */}
          <div
            style={{
              top: '380px',
              left: '245px',
              width: '37px',
              height: '14px',
              color: '#ffffff',
              fontSize: '14px',
              fontFamily: 'Microsoft Sans Serif, sans-serif',
              textAlign: 'right',
              position: 'absolute',
              zIndex: 2,
            }}
          >
            Stereo
          </div>
        </div>
      </media-controller>
    </Window>
  );
};

export default VideoPlayerMobile;