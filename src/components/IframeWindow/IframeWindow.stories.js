// Button.stories.js
import React from 'react';
import IframeWindow from './IframeWindow';

export default {
  title: 'Components/IframeWindow',
  component: IframeWindow,
};

export const Primary = () => <IframeWindow label="Primary IframeWindow" />;
export const Secondary = () => <IframeWindow label="Secondary IframeWindow" />;