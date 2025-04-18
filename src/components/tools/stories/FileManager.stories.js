import React from 'react';
import Window from '../Window';
import FileManager from '../FileManager';
import { WindowProgram } from 'packard-belle';

export default {
  title: 'Tools/FileManager',
  component: FileManager,
};

export const WrappedInWindow = () => (
  <Window
    title="FileManager Tool"
    Component={WindowProgram}
    initialWidth={320}
    initialHeight={200}
    icon=""
  >
    <FileManager />
  </Window>
);
