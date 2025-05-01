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
      isMobileDevice: false
    };
    this.containerRef = React.createRef();
    this.webampInstance = null;
    this.containerId = 'webamp-container-' + Math.floor(Math.random() * 1000000);
  }
  
  // Method to unlock audio on iOS devices
  unlockAudioForIOS = () => {
    // Create and play a silent audio element to unlock audio
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // iOS requires user interaction to start audio
    document.addEventListener('touchstart', () => {
      // Create silent buffer
      const buffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
      
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    }, { once: true });
  }

  componentDidMount() {
    // Check if mobile device
    this.checkIfMobileDevice();
    this.initializeWebamp();
  }
  
  checkIfMobileDevice = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    this.setState({ isMobileDevice: isMobile });
  }

  initializeWebamp = async () => {
    try {
      this.setState({ isLoading: true });
      
      // iOS-specific audio unlock
      this.unlockAudioForIOS();
      
      const container = createWebampContainer(this.containerId);

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
          metaData: { title: "DJ BORING", artist: "Winona" },
          url: "/music/Winona.mp3"
        },
        {
          metaData: { title: "A.L.I.S.O.N", artist: "Space Echo" },
          url: "/music/Space Echo.mp3"
        },
        {
          metaData: { title: "Voyage", artist: "Paradise" },
          url: "/music/Paradise.mp3"
        },
        {
          metaData: { title: "A.L.I.S.O.N & Hotel Pools", artist: "Murmurs" },
          url: "/music/Murmurs.mp3"
        },
        {
          metaData: { title: "Hotel Pools", artist: "Drift" },
          url: "/music/Drift.mp3"
        },
        {
          metaData: { title: "oDDling", artist: "Ascend" },
          url: "/music/Ascend.mp3"
        },
        {
          metaData: { title: "Xtract", artist: "Audiotool Day 2016" },
          url: "/music/Audiotool Day 2016.mp3"
        },
        {
          metaData: { title: "Ross From Friends", artist: "Lies" },
          url: "/music/Lies.mp3"
        },
        {
          metaData: { title: "Hotel Pools", artist: "Solitude" },
          url: "/music/Solitude.mp3"
        },
        {
          metaData: { title: "Hotel Pools", artist: "Eclipse" },
          url: "/music/Eclipse.mp3"
        },
        {
          metaData: { title: "Hotel Pools, VIQ", artist: "Splash" },
          url: "/music/Splash.mp3"
        },
        {
          metaData: { title: "DreamStation1986", artist: "Pylon" },
          url: "/music/Pylon.mp3"
        },
        {
          metaData: { title: "Hotel Pools", artist: "Beginning" },
          url: "/music/Beginning.mp3"
        },
        {
          metaData: { title: "COMPUTER DATA", artist: "Healing" },
          url: "/music/Healing.mp3"
        },
        {
          metaData: { title: "The Midnight", artist: "Night Skies (Instrumental)" },
          url: "/music/Night Skies (Instrumental).mp3"
        },
        {
          metaData: { title: "oDDling & Hotel Pools", artist: "Remain" },
          url: "/music/Remain.mp3"
        },
        {
          metaData: { title: "Krosia", artist: "Azur" },
          url: "/music/Azur.mp3"
        },
        {
          metaData: { title: "Hotel Pools", artist: "Coast" },
          url: "/music/Coast.mp3"
        },
        {
          metaData: { title: "Eagle Eyed Tiger & Hotel Pools", artist: "Hold" },
          url: "/music/Hold.mp3"
        },
        {
          metaData: { title: "Emil Rottmayer", artist: "Evade" },
          url: "/music/Evade.mp3"
        },
        {
          metaData: { title: "Zane Alexander", artist: "Float" },
          url: "/music/Float.mp3"
        },
        {
          metaData: { title: "Ax14", artist: "Water Race" },
          url: "/music/Water Race.mp3"
        },
        {
          metaData: { title: "Voyager", artist: "Intelestellar" },
          url: "/music/Intelestellar.mp3"
        },
        {
          metaData: { title: "Hotel Pools", artist: "Sequence" },
          url: "/music/Sequence.mp3"
        },
        {
          metaData: { title: "oDDling & Forhill", artist: "Supernal" },
          url: "/music/Supernal.mp3"
        },
        {
          metaData: { title: "Hotel Pools", artist: "Time" },
          url: "/music/Time.mp3"
        },
        {
          metaData: { title: "oDDling", artist: "Aurora" },
          url: "/music/Aurora.mp3"
        }
      ];

      const Webamp = await loadWebamp();

      // Load Butterchurn + presets
      const Butterchurn = await import(/* webpackIgnore: true */ 'https://unpkg.com/butterchurn@2.6.7/lib/butterchurn.min.js');
      const butterchurnPresets = await import(/* webpackIgnore: true */ 'https://unpkg.com/butterchurn-presets@2.4.7/lib/butterchurnPresets.min.js');

      // Define your available skins
      const availableSkins = [
        { name: "Windows 98", url: "/skins/Windows98.wsz" },
        { name: "CuteAmp", url: "/skins/CuteAmp.wsz" },
        { name: "NES Edition", url: "/skins/NES Edition.wsz" },
        { name: "Matrix 001", url: "/skins/Matrix 001.zip" },
        { name: "Shrek 001", url: "/skins/Shrek001.wsz" },
        { name: "Super Mario Bros 3", url: "/skins/Super_Mario_Bros_3.wsz" }, //remove?
        { name: "Ascii Amp 3.7", url: "/skins/ascii_amp3.7.wsz" }, //remove?
        { name: "Windows Classic", url: "/skins/Windows-clarre.wsz" }, //remove?
      ];

      // Configure options differently for mobile
      const options = {
        initialTracks: tracks,
        zIndex: this.props.zIndex || 99, // Higher zIndex for iOS
        initialWindowLayout: {
          main: { position: { x: 0, y: 0 } }
        },
        initialSkin: {
          url: availableSkins[0].url
        },
        __butterchurnOptions: {
          butterchurn: Butterchurn,
          getPresets: () => Promise.resolve(butterchurnPresets.default),
          // Improve visualizer performance for mobile
          butterchurnOptions: {
            meshWidth: 32, // Lower mesh resolution for better performance
            meshHeight: 24,
            pixelRatio: window.devicePixelRatio || 1
          }
        }
      };

      this.webampInstance = new Webamp(options);

      if (this.props.onClose) {
        this.webampInstance.onClose(this.props.onClose);
      }

      await this.webampInstance.renderWhenReady(container);

      // ✅ Inject skins for Webamp's built-in context menu
      this.webampInstance.store.dispatch({
        type: "SET_AVAILABLE_SKINS",
        skins: availableSkins
      });

      // Open visualizer window
      this.webampInstance.store.dispatch({
        type: "TOGGLE_VISUALIZER_WINDOW"
      });
      
      // Setup touch-friendly behaviors for iOS
      if (this.state.isMobileDevice) {
        // Force the visualizer to be visible
        setTimeout(() => {
          // For iOS specific behavior
          const milkdropWindow = document.querySelector('.milkdrop-window');
          if (milkdropWindow) {
            // Force visualizer to be visible and properly sized
            milkdropWindow.style.visibility = 'visible';
            milkdropWindow.style.width = '300px';
            milkdropWindow.style.height = '200px';
            
            // Make visualizer draggable via touch
            this.setupTouchDragging(milkdropWindow);
            
            // Force render the visualizer
            this.webampInstance.store.dispatch({
              type: "TOGGLE_MILKDROP_DESKTOP"
            });
          }
        }, 1000);
      }

      // Initial EQ Settings
      this.webampInstance.store.dispatch({
        type: "SET_EQ",
        value: {
          preamp: 0.0476,
          bands: [
            0.4286, // hz60
            0.3333, // hz170
            0.0476, // hz310
           -0.2698, // hz600
           -0.2381, // hz1000
            0.0476, // hz3000
            0.4286, // hz6000
            0.5238, // hz12000
            0.5238, // hz14000
            0.4921  // hz16000
          ],
          on: true
        }
      });
      
      // Set up Techno preset for Milkdrop visualizer
      try {
        const presets = butterchurnPresets.default;
        
        // Find the Techno preset
        // First try to find one explicitly named "Techno"
        let technoPresetName = Object.keys(presets).find(name => 
          name.toLowerCase() === 'techno');
        
        // If not found, look for any preset containing "techno" in the name
        if (!technoPresetName) {
          technoPresetName = Object.keys(presets).find(name => 
            name.toLowerCase().includes('techno'));
        }
        
        if (technoPresetName) {
          console.log("Found Techno preset:", technoPresetName);
          
          // Get the preset data
          const technoPreset = presets[technoPresetName];
          
          // Set the preset as active
          this.webampInstance.store.dispatch({
            type: "SET_MILKDROP_DESKTOP_VISUALIZER_PRESET",
            presetName: technoPresetName,
            preset: technoPreset
          });
          
          // Set EQ Settings optimized for Techno preset
          this.webampInstance.store.dispatch({
            type: "SET_EQ",
            value: {
              preamp: 0.6, // Boosted preamp for stronger response
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
          
          // Enable auto EQ mode (optional)
          this.webampInstance.store.dispatch({
            type: "SET_EQ_AUTO",
            value: true
          });
        } else {
          console.warn("Techno preset not found in available presets");
        }
      } catch (presetError) {
        console.error("Error setting up Techno preset:", presetError);
      }

      this.setState({
        isLoading: false,
        isWebampReady: true
      });

      setTimeout(() => {
        this.positionWebampInViewport();
      }, 0);

      window.addEventListener("resize", this.positionWebampInViewport);
    } catch (error) {
      console.error("Error initializing Webamp:", error);
      this.setState({
        isLoading: false,
        error: error.message || "Error initializing Webamp"
      });
    }
  };

  positionWebampInViewport = () => {
    const mainWindow = document.getElementById('webamp');
    const visualizerWindow = document.querySelector('#webamp .milkdrop-window');

    if (mainWindow && visualizerWindow) {
      const mainRect = mainWindow.getBoundingClientRect();
      
      visualizerWindow.style.position = 'absolute';
      visualizerWindow.style.top = `${mainRect.top + 40}px`;
      visualizerWindow.style.left = `${mainRect.left + mainRect.width + 20}px`;
      visualizerWindow.style.zIndex = 100; // Higher zIndex for iOS
      
      // Ensure visualizer is visible
      visualizerWindow.style.visibility = 'visible';
      visualizerWindow.style.display = 'block';
      
      // Force render for iOS
      if (this.state.isMobileDevice) {
        // Add specific iOS styles for better visibility
        visualizerWindow.style.width = '300px';
        visualizerWindow.style.height = '200px';
        visualizerWindow.style.overflow = 'visible';
        
        // Get the canvas element and ensure it's visible
        const canvas = visualizerWindow.querySelector('canvas');
        if (canvas) {
          canvas.style.visibility = 'visible';
          canvas.style.display = 'block';
          canvas.style.width = '100%';
          canvas.style.height = '100%';
        }
      }
    }
  };
  
  // Add touch dragging support for iOS
  setupTouchDragging = (element) => {
    if (!element) return;
    
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    // Touch event handlers
    element.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startLeft = parseInt(element.style.left) || 0;
      startTop = parseInt(element.style.top) || 0;
      e.preventDefault();
    }, { passive: false });
    
    element.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      const deltaX = e.touches[0].clientX - startX;
      const deltaY = e.touches[0].clientY - startY;
      
      element.style.left = `${startLeft + deltaX}px`;
      element.style.top = `${startTop + deltaY}px`;
      e.preventDefault();
    }, { passive: false });
    
    element.addEventListener('touchend', () => {
      isDragging = false;
    });
    
    // Apply styles to make it obvious the element is draggable
    element.style.cursor = 'move';
    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';
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
          <div>Webamp is running with Techno visualizer preset.</div>
        ) : null}
      </div>
    );
  }
}

export default MusicPlayer;