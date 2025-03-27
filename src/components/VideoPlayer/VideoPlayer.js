import React from 'react';
import './Video.scss'; // Ensure the path is correct relative to your component file

const VideoPlayer = () => {
  return (
    <div>
      <video className="videoTag.visible">
        <source src="" type="video/mp4" />
      </video>
      <div className="controls">
        <button className="controlBtn">Play</button>
        <input type="range" className="range" />
      </div>
      <div className="countDownContainer">
        <span className="videoFont">00:00</span>
        <span className="currentTime">Current Time</span>
        <span className="elapsedTime">Elapsed Time</span>
      </div>
      <div className="divider"></div>
    </div>
  );
};

export default VideoPlayer;

