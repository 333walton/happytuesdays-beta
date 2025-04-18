import React from 'react';
import Window from '../Window';
import CRT from '../CRT';
import { WindowProgram } from 'packard-belle';

export default {
  title: 'Tools/CRT',
  component: CRT,
};

export const WrappedInWindow = () => (
  <Window
    title="CRT Tool"
    Component={WindowProgram}
    initialWidth={320}
    initialHeight={200}
    icon=""
  >
    <CRT />
  </Window>
);
