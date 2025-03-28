import React from 'react';
import { Video } from '@react95/core';
import { ThemeProvider, createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* You can add other global styles here if needed */
`;

const VideoPlayer = () => {
  return (
    <ThemeProvider theme={{}}>
      <GlobalStyle />
      <div>
        <h1>My Video Player</h1>
        <Video
          src="/assets/videotest.gif" // Path to your video file
          controls
          autoPlay
        />
      </div>
    </ThemeProvider>
  );
};

export default VideoPlayer;
