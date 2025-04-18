import React, { useMemo } from 'react';
import { SettingsContext } from '../src/contexts';

// Global styles
//import 'packard-belle/build/pb/index.css';
import '../src/icons/icons.scss';
import '../src/components/tools/_window.scss';
import '../src/components/tools/_background.scss';
import '../src/components/tools/_StandardWindow.scss';
//import '../src/styles/storybook.scss';

// Toolbar toggle
export const globalTypes = {
  device: {
    name: 'Device',
    description: 'Toggle between desktop and mobile context',
    defaultValue: 'desktop',
    toolbar: {
      icon: 'browser',
      items: [
        { value: 'desktop', title: 'Desktop' },
        { value: 'mobile', title: 'Mobile' },
      ],
    },
  },
};

export const decorators = [
  (Story, context) => {
    const isMobile = context.globals.device === 'mobile';

    const mockSettings = useMemo(
      () => ({
        desktop: {
          theme: 'classic',
          wallpaper: 'none',
          resolution: { width: 800, height: 600 },
        },
        isMobile,
        scale: 1,
      }),
      [isMobile]
    );

    const containerStyle = {
      width: isMobile ? '375px' : '100vw',
      height: '100vh',
      margin: '0 auto',
      overflow: 'auto',
      background: '#008080',
      padding: '8px',
      boxSizing: 'border-box',
      border: '1px solid #444',
    };

    return (
      <SettingsContext.Provider value={mockSettings}>
        <div className="w98" style={containerStyle}>
          <Story />
        </div>
      </SettingsContext.Provider>
    );
  },
];

// Controls config
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
