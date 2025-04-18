import React from 'react';
import Window from '../Window';
import FileManager from '../FileManager';
import IframeWindow from '../IframeWindow';
import CRT from '../CRT';
import Background from '../Background';
import { WindowProgram } from 'packard-belle';

export default {
  title: 'Tools/All',
};

export const WindowTool = () => (
  <Window
    title="Test Window"
    id="test"
    Component={WindowProgram}
    onClose={() => console.log('Closed')}
    onMinimize={() => console.log('Minimized')}
    onMaximize={() => console.log('Maximized')}
    resizable={true}
    initialWidth={320}
    initialHeight={200}
    className="Window--storybook"
    zIndex={1}
  >
    <div style={{ padding: 12 }}>Test content inside the window</div>
  </Window>
);


export const FileManagerTool = () => <FileManager />;
export const IframeWindowTool = () => <IframeWindow />;
export const CRTTool = () => <CRT />;
export const BackgroundTool = () => <Background />;