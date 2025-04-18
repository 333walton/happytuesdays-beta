import React, { useMemo } from 'react';
import { SettingsContext } from '../src/contexts';

// Global styles
// import 'packard-belle/build/pb/index.css';
import '../src/icons/icons.scss';
import '../src/components/tools/_window.scss';
import '../src/components/tools/_background.scss';
import '../src/components/tools/_StandardWindow.scss';
// import '../src/styles/storybook.scss';

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
      width: '768px',
      height: '768px',
      margin: '0 auto',
      background: '#008080',
      overflow: 'auto',
      padding: '8px',
      boxSizing: 'border-box',
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

// Controls + Viewport config
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewport: {
    viewports: {
      desktop640: {
        name: 'Desktop (640x480)',
        styles: {
          width: '640px',
          height: '480px',
        },
        type: 'desktop',
      },
      mobile320: {
        name: 'Mobile (320x640)',
        styles: {
          width: '320px',
          height: '640px',
        },
        type: 'mobile',
      },
      tablet768: {
        name: 'Tablet (768x1024)',
        styles: {
          width: '768px',
          height: '1024px',
        },
        type: 'tablet',
      },
    },
    defaultViewport: 'desktop640',
  },
};
