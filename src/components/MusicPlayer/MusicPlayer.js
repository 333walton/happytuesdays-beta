import React, { Component } from 'react';
import cx from 'classnames';
import { WindowProgram } from 'packard-belle';
import buildMenu from '../../helpers/menuBuilder';
import {
  loadWebamp,
  loadButterchurn,
  loadButterchurnPresets,
  createWebampContainer,
  removeWebampContainer,
} from './webampLoader';
import './_styles.scss';

class MusicPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isWebampReady: false,
      error: null,
      isMobileDevice: false,
      isSafari: false
    };
    this.containerRef = React.createRef();
    this.webampInstance = null;
    this.containerId = 'webamp-container-' + Math.floor(Math.random() * 1000000);
  }

  componentDidMount() {
    this.detectDevice();
    this.initializeWebamp();
  }

  detectDevice = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.setState({ 
      isMobileDevice: isMobile,
      isSafari: isSafari
    });
  }

  // We'll use the built-in helpers to load Butterchurn instead of direct imports
  // This avoids CORS issues since the helper handles the loading properly
  initializeWebamp = async () => {
    try {
      this.setState({ isLoading: true });
      
      // Create container for Webamp
      const container = createWebampContainer(this.containerId);

      // Define tracks
      const tracks = [
        {
          metaData: { title: "Hotel Pools", artist: "Distance" },
          url: "/music/Distance.mp3"
        },
        {
          metaData: { title: "Krosia", artist: "Slight Days" },
          url: "/music/Slight Days.mp3"
        },
        {
          metaData: { title: "Hotel Pools", artist: "Crush" },
          url: "/music/Crush.mp3"
        },
        {
          metaData: { title: "FRM", artist: "Endless Lines" },
          url: "/music/Endless Lines.mp3"
        },
        {
          metaData: { title: "De Lorra", artist: "Let Us" },
          url: "/music/Let Us.mp3"
        },
        {
          metaData: { title: "Rosentwig", artist: "Hiraeth" },
          url: "/music/Hiraeth.mp3"
        },
        {
          metaData: { title: "Hotel Pools", artist: "Parallel" },
          url: "/music/Parallel.mp3"
        },
        {
          metaData: { title: "oDDling", artist: "Aurora" },
          url: "/music/Aurora.mp3"
        }
      ];

      // Define skins
      const availableSkins = [
        { name: "Windows 98", url: "/skins/Windows98.wsz" },
        { name: "CuteAmp", url: "/skins/CuteAmp.wsz" },
        { name: "NES Edition", url: "/skins/NES Edition.wsz" },
        { name: "Matrix 001", url: "/skins/Matrix 001.zip" },
        { name: "Shrek 001", url: "/skins/Shrek001.wsz" }
      ];

      // First load Webamp
      const Webamp = await loadWebamp();

      // Then load Butterchurn and presets using our helpers
      // This avoids CORS issues by using your loaders instead of direct imports
      const butterchurn = await loadButterchurn();
      const butterchurnPresets = await loadButterchurnPresets();

      // Setup visualizer options based on device
      const visualizerOptions = {
        width: this.state.isMobileDevice ? 300 : 600,
        height: this.state.isMobileDevice ? 200 : 400,
        pixelRatio: window.devicePixelRatio || 1,
        meshWidth: this.state.isMobileDevice ? 32 : 48,
        meshHeight: this.state.isMobileDevice ? 24 : 36
      };

      // Configure Webamp with our options
      const options = {
        initialTracks: tracks,
        zIndex: 99999,
        initialSkin: {
          url: availableSkins[0].url
        },
        initialWindowLayout: {
          main: { position: { x: 0, y: 0 } }
        },
        __butterchurnOptions: {
          butterchurn: butterchurn,
          getPresets: () => butterchurnPresets,
          butterchurnOptions: visualizerOptions
        }
      };

      // Initialize Webamp
      this.webampInstance = new Webamp(options);

      // Set close handler if provided
      if (this.props.onClose) {
        this.webampInstance.onClose(this.props.onClose);
      }

      // Render Webamp
      await this.webampInstance.renderWhenReady(container);

      // Set available skins
      this.webampInstance.store.dispatch({
        type: "SET_AVAILABLE_SKINS",
        skins: availableSkins
      });

      // Open visualizer window with a delay to ensure DOM is ready
      setTimeout(() => {
        if (this.webampInstance) {
          // Open visualizer window
          this.webampInstance.store.dispatch({
            type: "TOGGLE_VISUALIZER_WINDOW"
          });

          // Set EQ settings for better visualization with Techno preset
          this.webampInstance.store.dispatch({
            type: "SET_EQ",
            value: {
              preamp: 0.6,
              bands: [
                0.7,    // hz60 - Bass boost
                0.6,    // hz170 - Bass boost
                0.3,    // hz310 - Mid-bass
                0.0,    // hz600 - Mid
                0.2,    // hz1000 - Mid
                0.4,    // hz3000 - Upper-mid
                0.5,    // hz6000 - Presence
                0.6,    // hz12000 - Treble
                0.5,    // hz14000 - Treble
                0.4     // hz16000 - High end
              ],
              on: true
            }
          });

          // Enable EQ auto mode
          this.webampInstance.store.dispatch({
            type: "SET_EQ_AUTO",
            value: true
          });

          // Try to find and set techno preset
          this.setTechnoPreset(butterchurnPresets);

          // Make visualizer draggable on mobile
          if (this.state.isMobileDevice) {
            this.setupMobileDragging();
          }
        }
      }, 1000);

      // Update Webamp positioning
      setTimeout(() => {
        this.positionWebampInViewport();
      }, 1500);

      // Add window resize handler
      window.addEventListener("resize", this.positionWebampInViewport);

      // Update component state
      this.setState({
        isLoading: false,
        isWebampReady: true
      });

    } catch (error) {
      console.error("Error initializing Webamp:", error);
      this.setState({
        isLoading: false,
        error: error.message || "Error initializing Webamp"
      });
    }
  };

  setTechnoPreset = (butterchurnPresets) => {
    try {
      if (!this.webampInstance || !butterchurnPresets) return;

      // Get presets
      const presets = butterchurnPresets;
      const presetNames = Object.keys(presets);

      // Look for a techno preset
      let technoPresetName = presetNames.find(name => 
        name.toLowerCase() === 'techno' || 
        name.toLowerCase().includes('techno'));

      // If not found, try some common good presets
      if (!technoPresetName) {
        technoPresetName = presetNames.find(name =>
          name.includes('Geiss') || 
          name.includes('Flexi') || 
          name.includes('martin'));
      }

      // If still not found, use first preset
      if (!technoPresetName && presetNames.length > 0) {
        technoPresetName = presetNames[0];
      }

      // Set the preset if found
      if (technoPresetName) {
        console.log("Setting preset:", technoPresetName);
        
        try {
          this.webampInstance.store.dispatch({
            type: "SET_MILKDROP_DESKTOP_VISUALIZER_PRESET",
            presetName: technoPresetName,
            preset: presets[technoPresetName]
          });
        } catch (e) {
          console.warn("Could not set preset:", e);
        }
      }
    } catch (error) {
      console.error("Error setting techno preset:", error);
    }
  };

  setupMobileDragging = () => {
    try {
      // Make main window draggable
      const mainWindow = document.getElementById('webamp');
      if (mainWindow) {
        this.makeElementDraggable(mainWindow);
      }

      // Make visualizer window draggable
      const visualizerWindow = document.querySelector('.milkdrop-window');
      if (visualizerWindow) {
        this.makeElementDraggable(visualizerWindow);
        
        // Force visualizer to be visible
        visualizerWindow.style.width = '300px';
        visualizerWindow.style.height = '200px';
        visualizerWindow.style.visibility = 'visible';
        visualizerWindow.style.display = 'block';
        
        // Force canvas to be visible
        const canvas = visualizerWindow.querySelector('canvas');
        if (canvas) {
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          canvas.style.visibility = 'visible';
          canvas.style.display = 'block';
        }
      }
    } catch (e) {
      console.error("Error setting up mobile dragging:", e);
    }
  };

  makeElementDraggable = (element) => {
    if (!element) return;
    
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      
      // Get current position
      const rect = element.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      
      isDragging = true;
      
      // Add dragging styles
      element.style.position = 'absolute';
      element.style.zIndex = '99999';
      
      e.preventDefault();
    };
    
    const handleTouchMove = (e) => {
      if (!isDragging) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      
      // Calculate and set new position
      element.style.left = `${initialLeft + deltaX}px`;
      element.style.top = `${initialTop + deltaY}px`;
      
      e.preventDefault();
    };
    
    const handleTouchEnd = () => {
      isDragging = false;
    };
    
    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    
    // Add visual indicator
    element.style.cursor = 'grab';
  };

  positionWebampInViewport = () => {
    try {
      const mainWindow = document.getElementById('webamp');
      const visualizerWindow = document.querySelector('.milkdrop-window');

      if (mainWindow && visualizerWindow) {
        const mainRect = mainWindow.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Position visualizer relative to main window
        let leftPosition = mainRect.left + mainRect.width + 20;
        let topPosition = mainRect.top + 40;
        
        // Ensure visualizer stays on screen
        if (leftPosition + 300 > viewportWidth) {
          leftPosition = Math.max(0, viewportWidth - 320);
        }
        
        if (topPosition + 200 > viewportHeight) {
          topPosition = Math.max(0, viewportHeight - 220);
        }
        
        // Set position
        visualizerWindow.style.position = 'absolute';
        visualizerWindow.style.top = `${topPosition}px`;
        visualizerWindow.style.left = `${leftPosition}px`;
        visualizerWindow.style.zIndex = '99999';
        
        // Force visualizer to be visible
        visualizerWindow.style.visibility = 'visible';
        visualizerWindow.style.display = 'block';
        
        // Ensure canvas is visible
        const canvas = visualizerWindow.querySelector('canvas');
        if (canvas) {
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          canvas.style.visibility = 'visible';
          canvas.style.display = 'block';
        }
      }
    } catch (e) {
      console.error("Error positioning Webamp:", e);
    }
  };

  componentWillUnmount() {
    window.removeEventListener('resize', this.positionWebampInViewport);
    
    if (this.webampInstance) {
      try {
        this.webampInstance.dispose();
        this.webampInstance = null;
      } catch (error) {
        console.error('Error disposing Webamp:', error);
      }
    }
    
    removeWebampContainer(this.containerId);
  }

  retryLoading = () => {
    this.setState({ error: null });
    this.initializeWebamp();
  };

  render() {
    const { props } = this;
    const { isLoading, isWebampReady, error } = this.state;

    const menuOptions = buildMenu({
      ...props,
      componentType: 'MusicPlayer',
      showHelp: this.showHelp,
      options: {},
    });

    return (
      <div
        ref={this.containerRef}
        className="music-player-container"
      >
        {isLoading ? (
          <div>Loading Webamp...</div>
        ) : error ? (
          <div className="webamp-error">
            <div>Error: {error}</div>
            <button
              onClick={this.retryLoading}
              style={{
                padding: '8px 16px',
                margin: '10px',
                backgroundColor: '#d3d3d3',
                border: '1px solid #999',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        ) : isWebampReady ? (
          <div>
            <div>Webamp is running with visualizer.</div>
            {this.state.isMobileDevice && (
              <div style={{ marginTop: '10px', color: '#ff6600' }}>
                <strong>Tip: Tap and drag the player or visualizer window to move them.</strong>
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  }
}

export default MusicPlayer;