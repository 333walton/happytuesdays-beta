import React, { useEffect, useRef, useState } from 'react';
import { WindowProgram } from 'packard-belle';
import cx from 'classnames';
import Window from '../tools/Window';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import buildMenu from '../../helpers/menuBuilder';
import './_styles.scss';

const VideoPlayerTest = (props) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [videoMeta] = useState({
    show: 'Wild West Deals',
    clip: 'Don West Promo',
    author: 'ShopZone Studios',
    copyright: '©1999 ShopZone',
  });

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: false,
        autoplay: false,
        preload: 'auto',
        width: 288,
        height: 216,
      });

      playerRef.current.on('timeupdate', () => {
        const current = playerRef.current.currentTime();
        const dur = playerRef.current.duration();
        setCurrentTime(current);
        setDuration(dur);
        setProgress((current / dur) * 100);
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  const formatTime = (sec) => {
    if (!sec) return '00:00';
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const play = () => playerRef.current?.play();
  const pause = () => playerRef.current?.pause();
  const stop = () => {
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.currentTime(0);
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    playerRef.current?.volume(vol);
  };

  const handleSeek = (e) => {
    const percent = parseFloat(e.target.value);
    const newTime = (percent / 100) * duration;
    playerRef.current?.currentTime(newTime);
  };

  const menuOptions = buildMenu({
    ...props,
    componentType: 'VideoPlayerTest',
    showHelp: () => alert('Help is not available.'),
  });

  return (
    <Window
      {...props}
      title="Windows Media Player"
      icon=""
      Component={WindowProgram}
      className={cx('VideoPlayerTest', props.className)}
      menuOptions={menuOptions}
      initialWidth={294}
      initialHeight={403}
      resizable={false}
    >
      <div className="wmp98-container">
        <div className="wmp98-video-wrapper">
          <video ref={videoRef} className="video-js vjs-default-skin" playsInline>
            <source src="/static/donwest.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="wmp98-controls">
          <button className="wmp98-btn play" onClick={play} />
          <button className="wmp98-btn pause" onClick={pause} />
          <button className="wmp98-btn stop" onClick={stop} />
          <input
            type="range"
            className="wmp98-seek-bar"
            value={progress}
            onChange={handleSeek}
          />
          <button className="wmp98-btn volume" />
          <input
            type="range"
            className="wmp98-volume-slider"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>

        <div className="wmp98-timer">{formatTime(currentTime)} / {formatTime(duration)}</div>

        <div className="wmp98-info">
          <div>Show: {videoMeta.show}</div>
          <div>Clip: {videoMeta.clip}</div>
          <div>Author: {videoMeta.author}</div>
          <div>Copyright: {videoMeta.copyright}</div>
        </div>
      </div>
    </Window>
  );
};

export default VideoPlayerTest;
