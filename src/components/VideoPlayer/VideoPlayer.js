import React from 'react';
import { Video } from '@react95/core';
import { ThemeProvider, createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('@react95/core/GlobalStyle');
  @import url('@react95/core/themes/win95.css');
`;

const VideoPlayer = () => {
  return (
    <ThemeProvider theme={{}}>
      <GlobalStyle />
      <div>
        <h1>My Video Player</h1>
        <Video
          src="path_to_your_video_file.mp4" // Replace with the actual path to your video file
          controls
          autoPlay
        />
      </div>
    </ThemeProvider>
  );
};

export default VideoPlayer;
