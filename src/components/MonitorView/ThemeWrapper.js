import React from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import ms_sans_serif from 'react95/dist/fonts/ms_sans_serif.woff2';
import ms_sans_serif_bold from 'react95/dist/fonts/ms_sans_serif_bold.woff2';

// Theme definition remains the same
const original = {
  name: 'original',
  anchor: '#1034a6',
  anchorVisited: '#440381',
  borderDark: '#868a8e',
  borderDarkest: '#000000',
  borderLight: '#dfe0e3',
  borderLighter: '#ffffff',
  borderLightest: '#ffffff',
  canvas: '#ffffff',
  canvasText: '#000000',
  canvasTextDisabled: '#868a8e',
  canvasTextDisabledShadow: '#ffffff',
  canvasTextInvert: '#ffffff',
  checkmark: '#000000',
  checkmarkDisabled: '#868a8e',
  desktopBackground: '#008080',
  flatDark: '#9e9e9e',
  flatLight: '#d8d8d8',
  focusSecondary: '#fefe03',
  headerBackground: '#000080',
  headerNotActiveBackground: '#7f787f',
  headerNotActiveText: '#d8d8d8',
  headerText: '#ffffff',
  hoverBackground: '#000080',
  material: '#ced0cf',
  materialDark: '#9a9e9c',
  materialText: '#000000',
  materialTextDisabled: '#868a8e',
  materialTextDisabledShadow: '#ffffff',
  materialTextInvert: '#ffffff',
  progress: '#000080',
  tooltip: '#fefbcc',
};

// Updated styles with proper isolation
const ControlPanelStyles = createGlobalStyle`
  /* Font definitions - only for control panel */
  .monitor-controls-container {
    /* Scoped font definitions */
    @font-face {
      font-family: 'ms_sans_serif_controls';
      src: url(${ms_sans_serif}) format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: block;
    }
    
    @font-face {
      font-family: 'ms_sans_serif_controls';
      src: url(${ms_sans_serif_bold}) format('woff2');
      font-weight: bold;
      font-style: normal;
      font-display: block;
    }
  }
  
  /* REMOVE THIS COMPLETELY - it's affecting global window styles
  .react-draggable > .Window {
    border-width: thin !important;
    box-shadow: -1px -1px 0px #0c0c0c, 
                1px 1px 0px #bbc3c4, 
                -2px -2px 0px #808088, 
                2px 2px 0px #ffffff !important;
  }
  */
  
  /* Styles for the controls container */
  .monitor-controls-container {
    position: relative;
    z-index: 9999;
    
    /* This ensures styles are only applied within the container */
    &, & * {
      font-family: 'ms_sans_serif_controls', sans-serif;
    }
    
    /* React95 component styles scoped to the control panel */
    & .react95__toolbar,
    & .react95__button,
    & .react95__tab,
    & .react95__tabs,
    & .react95__window,
    & .react95__window-header,
    & .react95__window-content,
    & .react95__select,
    & .react95__menu,
    & .react95__menu-item,
    & .react95__groupbox {
      font-family: 'ms_sans_serif_controls', sans-serif;
      font-size: 11px;
    }
    
    /* Monitor control panel specific styling */
    & .monitor-controls button {
      width: 18px;
      height: 18px;
      background: #c0c0c0;
      border: outset 2px #ffffff;
      box-sizing: content-box;
      cursor: pointer;
      margin: 0 5px;
      padding: 0;
      pointer-events: auto;
    }
    
    & .monitor-controls button.active {
      border-style: inset;
      background-color: #a0a0a0;
    }
    
    & .monitor-controls button:hover {
      filter: brightness(1.1);
    }
    
    /* Tab styling */
    & .react95__tabs > div > button {
      height: 22px;
      font-size: 11px;
      padding: 0 6px;
    }
    
    /* Select dropdown styling */
    & .react95__select {
      width: 140px;
      
      & > button {
        font-size: 11px;
        height: 20px;
      }
      
      & ul {
        font-size: 11px;
        max-height: 120px;
        z-index: 9999;
      }
      
      & li {
        font-size: 11px;
        height: 23px;
        padding: 0 6px;
      }
    }
  }
  
  /* Mobile hiding */
  @media (max-width: 1023px) {
    .monitor-controls-container {
      display: none !important;
    }
  }
`;

// Encapsulated theme provider
export const MonitorThemeProvider = ({ children }) => (
  <>
    <ControlPanelStyles />
    <div className="monitor-controls-container">
      <ThemeProvider theme={original}>
        {children}
      </ThemeProvider>
    </div>
  </>
);

export default MonitorThemeProvider;