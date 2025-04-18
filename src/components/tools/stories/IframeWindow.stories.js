import React from 'react';
import Window from '../Window';
import IframeWindow from '../IframeWindow';
import { WindowProgram } from 'packard-belle';

export default {
  title: 'Tools/IframeWindow',
  component: IframeWindow,
};

export const WrappedInWindow = () => (
  <Window
    title="IframeWindow Tool"
    Component={WindowProgram}
    initialWidth={320}
    initialHeight={200}
    icon=""
  >
    <IframeWindow />
  </Window>
);
