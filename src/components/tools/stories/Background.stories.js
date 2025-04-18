import React from 'react';
import Window from '../Window';
import Background from '../Background';
import { WindowProgram } from 'packard-belle';

export default {
  title: 'Tools/Background',
  component: Background,
};

export const WrappedInWindow = () => (
  <Window
    title="Background Tool"
    Component={WindowProgram}
    initialWidth={320}
    initialHeight={200}
    icon=""
  >
    <Background />
  </Window>
);
