import React, { Component } from 'react';
import cx from 'classnames';
import { WindowProgram } from 'packard-belle'; // Ensure Window is imported
import Window from '../tools/Window';
import buildMenu from '../../helpers/menuBuilder';
import {
  loadWebamp,
  createWebampContainer,
  removeWebampContainer,
  SET_EQ_AUTO,
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
    
    // Store preset information
    this.presets = {};
    this.presetKeys = [];
    this.currentPresetIndex = 0;
  }

  componentDidMount() {
    this.detectDevice();
    this.loadExternalDependencies()
      .then(() => this.initializeWebamp())
      .catch(error => {
        console.error("Error loading dependencies:", error);
        this.setState({
          isLoading: false,
          error: error.message || "Error loading dependencies"
        });
      });
  }

  detectDevice = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.setState({ 
      isMobileDevice: isMobile,
      isSafari: isSafari
    });
  }

  loadExternalDependencies = () => {
    // Load required scripts directly to avoid import issues
    const scripts = [
      { src: 'https://unpkg.com/butterchurn@2.6.7/lib/butterchurn.min.js', id: 'butterchurn-script' },
      { src: 'https://unpkg.com/butterchurn-presets@2.4.7/lib/butterchurnPresets.min.js', id: 'butterchurn-presets-script' }
    ];
    
    const loadPromises = scripts.map(script => {
      return new Promise((resolve, reject) => {
        // Skip if already loaded
        if (document.getElementById(script.id)) {
          resolve();
          return;
        }
        
        const scriptElement = document.createElement('script');
        scriptElement.id = script.id;
        scriptElement.src = script.src;
        scriptElement.async = true;
        scriptElement.onload = () => resolve();
        scriptElement.onerror = () => reject(new Error(`Failed to load ${script.src}`));
        document.head.appendChild(scriptElement);
      });
    });
    
    return Promise.all(loadPromises);
  }

  initializeWebamp = async () => {
    try {
      this.setState({ isLoading: true });
      
      // Check if required dependencies are loaded
      if (!window.butterchurn || !window.butterchurnPresets) {
        throw new Error("Butterchurn libraries not properly loaded");
      }

      // Create container
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
          metaData: { title: "DJ BORING", artist: "Winona" },
          url: "/music/Winona.mp3"
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

      // Define skins
      const availableSkins = [
        { name: "Windows 98", url: "/skins/Windows98.wsz" },
        { name: "CuteAmp", url: "/skins/CuteAmp.wsz" },
        { name: "NES Edition", url: "/skins/NES Edition.wsz" },
        { name: "Matrix 001", url: "/skins/Matrix 001.zip" },
        { name: "Shrek 001", url: "/skins/Shrek001.wsz" }
      ];

      // Get presets for visualizer
      const butterchurnPresets = window.butterchurnPresets.getPresets ? 
        window.butterchurnPresets.getPresets() : 
        window.butterchurnPresets;
        
      // Store presets and preset keys for later use
      this.presets = butterchurnPresets;
      this.presetKeys = Object.keys(butterchurnPresets);
      this.currentPresetIndex = 0;

      // Configure Webamp with Butterchurn options
      const options = {
        initialTracks: tracks,
        // Use higher z-index to ensure visibility
        zIndex: 99999,
        initialSkin: {
          url: availableSkins[0].url
        },
        // Following the minimalMilkdrop example
        __butterchurnOptions: {
          importButterchurn: () => Promise.resolve(window.butterchurn),
          getPresets: () => {
            if (butterchurnPresets && Object.keys(butterchurnPresets).length > 0) {
              return Promise.resolve(butterchurnPresets);
            }
            // Fallback minimal preset if no presets found
            return Promise.resolve({
              "Default Preset": {
                name: "Default Preset",
                baseVals: {
                  decay: 0.98,
                  gammaadj: 2,
                  echo_zoom: 2,
                  echo_alpha: 0,
                  echo_orient: 0,
                  red_blue: 0,
                  brighten: 0,
                  darken: 0,
                  wrap: 1,
                  darken_center: 0,
                  solarize: 0,
                  invert: 0,
                  bmotionvectorson: 0,
                  fshader: 0,
                  b1n: 0,
                  b2n: 0,
                  b3n: 0,
                  b1x: 1,
                  b2x: 1,
                  b3x: 1,
                  b1ed: 0.25,
                  wave_mode: 0,
                  additivewave: 0,
                  wave_dots: 0,
                  wave_thick: 0,
                  wave_a: 0.8,
                  wave_scale: 1,
                  wave_smoothing: 0.75,
                  wave_mystery: 0,
                  modwavealphabyvolume: 0,
                  modwavealphastart: 0.75,
                  modwavealphaend: 0.95,
                  wave_r: 1,
                  wave_g: 1,
                  wave_b: 1,
                  wave_x: 0.5,
                  wave_y: 0.5,
                  wave_brighten: 1,
                  mv_x: 12,
                  mv_y: 9,
                  mv_dx: 0,
                  mv_dy: 0,
                  mv_l: 0.9,
                  mv_r: 1,
                  mv_g: 1,
                  mv_b: 1,
                  mv_a: 1,
                  warp: 1,
                  zoom: 1,
                  rot: 0,
                  cx: 0.5,
                  cy: 0.5,
                  dx: 0,
                  dy: 0,
                  warp_animate: 0,
                  warp_scale: 1,
                  wind_time: 0,
                  wind_speed: 0,
                  wind_size: 0.01,
                  wind_density: 0.1,
                  wind_turbulence: 0.5,
                  dx_r: 0,
                  dy_r: 0,
                  ob_size: 0.01,
                  ob_r: 0,
                  ob_g: 0,
                  ob_b: 0,
                  ob_a: 0,
                  ib_size: 0.01,
                  ib_r: 0.25,
                  ib_g: 0.25,
                  ib_b: 0.25,
                  ib_a: 0
                },
                waves: [],
                init_eqs: "",
                per_frame_eqs: "",
                per_pixel_eqs: "",
                warp: "float4 texsize;//x,y: inverse size, zw: size\nsamplerRECT sampler_pw_noise_lq;\nsamplerRECT sampler_pc_main;\n\nfloat4 fragForce(float2 pos: WPOS): COLOR {\n\n   float3 color= tex2D(sampler_pc_main, pos.xy);\n   return float4(color,1.0);\n}\n\n",
                comp: "float4 texsize;//x,y: inverse size, zw: size\nsamplerRECT sampler_pw_noise_lq;\nsamplerRECT sampler_pc_main;\nsamplerRECT sampler_fc_main;\n\nfloat4 fragForce(float2 pos: WPOS): COLOR {\n\n   float3 coef = float3(2.0, 3.0, 1.0); \n   float3 color= tex2D(sampler_fc_main, pos.xy).xyz;\n  \n   return float4(color,1.0);\n\n}\n\n"
              }
            });
          },
          butterchurnOptions: {
            width: this.state.isMobileDevice ? 300 : 600,
            height: this.state.isMobileDevice ? 200 : 400,
            pixelRatio: window.devicePixelRatio || 1,
            textureRatio: 1.0,
            meshWidth: this.state.isMobileDevice ? 32 : 48,
            meshHeight: this.state.isMobileDevice ? 24 : 36
          },
          butterchurnOpen: true,
        },
        __initialWindowLayout: {
          main: { position: { x: 0, y: 0 } },
          equalizer: { position: { x: 0, y: 116 } },
          playlist: { position: { x: 0, y: 231 }, size: [0, 1.5] },
          milkdrop: { position: { x: -200, y: -1 }, size: [-3, 1.5] },
        },
      };

      // Load Webamp
      const Webamp = await loadWebamp();
      
      // Initialize Webamp
      this.webampInstance = new Webamp(options);

      // Set close handler
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

      // Setup additional options after rendering
      setTimeout(() => {
        this.setupWebampAfterRender();
      }, 500);

      this.setState({
        isLoading: false,
        isWebampReady: true
      });

      // Add window resize handler
      window.addEventListener("resize", this.positionWebampInViewport);
    } catch (error) {
      console.error("Error initializing Webamp:", error);
      this.setState({
        isLoading: false,
        error: error.message || "Error initializing Webamp"
      });
    }
  };

  setupWebampAfterRender = () => {
    try {
      // Toggle visualizer window
      this.webampInstance.store.dispatch({
        type: "TOGGLE_VISUALIZER_WINDOW"
      });
      
      // Set EQ settings
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
        type: SET_EQ_AUTO,
        value: true
      });
      
      // Wait a bit then check/position visualizer
      setTimeout(() => {
        this.ensureVisualizerVisible();
        this.positionWebampInViewport();
        if (this.state.isMobileDevice) {
          this.setupMobileDragging();
        }

        // Add keyboard controls for preset cycling
        this.setupKeyboardControls();
        
        // Add our own UI controls if needed
        this.addPresetControls();
      }, 500);
    } catch (e) {
      console.error("Error setting up Webamp after render:", e);
    }
  };

  // Setup keyboard controls for preset cycling
  setupKeyboardControls = () => {
    // Add keyboard event listener
    document.addEventListener('keydown', this.handleKeyPress);
    
    console.log("Keyboard controls active: Arrow Left/Right to change presets");
  };

  // Handle keyboard events
  handleKeyPress = (e) => {
    // Only handle if Webamp is ready
    if (!this.webampInstance) return;
    
    switch (e.key) {
      case 'ArrowRight':
        this.nextPreset();
        break;
      case 'ArrowLeft':
        this.previousPreset();
        break;
      default:
        // Ignore other keys
        break;
    }
  };

  // Navigate to the next preset
  nextPreset = () => {
    try {
      if (!this.webampInstance || !this.presetKeys || this.presetKeys.length === 0) {
        console.warn("No presets available");
        return;
      }
      
      // Increment preset index
      this.currentPresetIndex = (this.currentPresetIndex + 1) % this.presetKeys.length;
      
      // Get the preset name and data
      const presetName = this.presetKeys[this.currentPresetIndex];
      const preset = this.presets[presetName];
      
      if (preset) {
        // Load the preset
        this.loadPreset(presetName, preset);
        console.log(`Loaded preset: ${presetName}`);
      }
    } catch (e) {
      console.error("Error loading next preset:", e);
    }
  };

  // Navigate to the previous preset
  previousPreset = () => {
    try {
      if (!this.webampInstance || !this.presetKeys || this.presetKeys.length === 0) {
        console.warn("No presets available");
        return;
      }
      
      // Decrement preset index with wrap-around
      this.currentPresetIndex = this.currentPresetIndex > 0 
        ? this.currentPresetIndex - 1 
        : this.presetKeys.length - 1;
      
      // Get the preset name and data
      const presetName = this.presetKeys[this.currentPresetIndex];
      const preset = this.presets[presetName];
      
      if (preset) {
        // Load the preset
        this.loadPreset(presetName, preset);
        console.log(`Loaded preset: ${presetName}`);
      }
    } catch (e) {
      console.error("Error loading previous preset:", e);
    }
  };

  // Load a specific preset
  loadPreset = (presetName, preset) => {
    try {
      if (!this.webampInstance || !preset) return;
      
      // Dispatch to Webamp to load the preset
      this.webampInstance.store.dispatch({
        type: "SET_MILKDROP_DESKTOP_VISUALIZER_PRESET",
        presetName,
        preset
      });
    } catch (e) {
      console.error(`Error loading preset ${presetName}:`, e);
    }
  };

  // Add UI controls to the visualizer window
  addPresetControls = () => {
    try {
      // Find milkdrop window to add controls to
      const milkdropWindow = document.querySelector('.milkdrop-window');
      if (!milkdropWindow) return;
      
      // Check if controls already exist
      if (document.querySelector('.milkdrop-preset-controls')) return;
      
      // Create controls container
      const controlsContainer = document.createElement('div');
      controlsContainer.className = 'milkdrop-preset-controls';
      controlsContainer.style.position = 'absolute';
      controlsContainer.style.bottom = '10px';
      controlsContainer.style.left = '10px';
      controlsContainer.style.zIndex = '100000';
      controlsContainer.style.display = 'flex';
      controlsContainer.style.gap = '5px';
      
      // Create previous button
      const prevButton = document.createElement('button');
      prevButton.textContent = '◀ Prev';
      prevButton.style.padding = '5px 10px';
      prevButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      prevButton.style.color = 'white';
      prevButton.style.border = '1px solid white';
      prevButton.style.borderRadius = '3px';
      prevButton.style.cursor = 'pointer';
      prevButton.onclick = this.previousPreset;
      
      // Create next button
      const nextButton = document.createElement('button');
      nextButton.textContent = 'Next ▶';
      nextButton.style.padding = '5px 10px';
      nextButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      nextButton.style.color = 'white';
      nextButton.style.border = '1px solid white';
      nextButton.style.borderRadius = '3px';
      nextButton.style.cursor = 'pointer';
      nextButton.onclick = this.nextPreset;
      
      // Add buttons to container
      controlsContainer.appendChild(prevButton);
      controlsContainer.appendChild(nextButton);
      
      // Add container to Milkdrop window
      milkdropWindow.appendChild(controlsContainer);
      
      console.log("Preset controls added to visualizer");
    } catch (e) {
      console.error("Error adding preset controls:", e);
    }
  };

  // Method to load custom presets from a ZIP file
  loadCustomPresets = async (zipFile) => {
    try {
      if (!this.webampInstance) {
        console.error("Missing webamp instance");
        return;
      }
      
      // Create file input for zip upload
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.zip';
      fileInput.style.display = 'none';
      
      // Handle file selection
      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
          // Load JSZip dynamically
          if (!window.JSZip) {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
          }
          
          if (!window.JSZip) {
            throw new Error("Failed to load JSZip library");
          }
          
          const JSZip = window.JSZip;
          const zip = new JSZip();
          
          // Read the ZIP file
          const content = await zip.loadAsync(file);
          
          // Store for new presets
          const newPresets = {};
          
          // Process each file in the ZIP
          for (const filename of Object.keys(content.files)) {
            // Skip directories
            if (content.files[filename].dir) continue;
            
            // Only process .milk or .json files
            if (!filename.toLowerCase().endsWith('.milk') && 
                !filename.toLowerCase().endsWith('.json')) {
              continue;
            }
            
            try {
              // Read file content
              const fileText = await content.files[filename].async('text');
              
              let preset;
              if (filename.toLowerCase().endsWith('.json')) {
                // Parse JSON preset
                preset = JSON.parse(fileText);
              } else {
                // For .milk files we would need to parse the file format
                // This is a placeholder - proper parsing would require butterchurn's parser
                console.log(`Milk file found: ${filename} - specialized parsing needed`);
                continue;
              }
              
              // Extract preset name from filename (remove extension)
              const presetName = filename.split('/').pop().replace(/\.(milk|json)$/i, '');
              
              // Add to our new presets
              newPresets[presetName] = preset;
              console.log(`Added preset: ${presetName}`);
            } catch (err) {
              console.error(`Error processing file ${filename}:`, err);
            }
          }
          
          // Add new presets to existing ones
          const presetCount = Object.keys(newPresets).length;
          if (presetCount > 0) {
            // Merge with existing presets
            this.presets = { ...this.presets, ...newPresets };
            this.presetKeys = Object.keys(this.presets);
            
            // Notify user
            alert(`Successfully loaded ${presetCount} presets from ZIP file`);
            
            // Try loading the first new preset
            const firstNewPreset = Object.keys(newPresets)[0];
            if (firstNewPreset) {
              this.loadPreset(firstNewPreset, newPresets[firstNewPreset]);
            }
          } else {
            alert("No valid presets found in the ZIP file");
          }
        } catch (error) {
          console.error("Error processing ZIP file:", error);
          alert(`Error loading presets: ${error.message}`);
        }
      };
      
      // Trigger file selection
      document.body.appendChild(fileInput);
      fileInput.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(fileInput);
      }, 5000);
    } catch (e) {
      console.error("Error setting up custom preset loader:", e);
    }
  };
  
  // Helper to load a script dynamically
  loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  ensureVisualizerVisible = () => {
    try {
      // Look for visualizer window
      const milkdropWindow = document.querySelector('.milkdrop-window');
      
      if (milkdropWindow) {
        console.log("Visualizer window found, ensuring visibility");
        
        // Ensure window is visible
        milkdropWindow.style.visibility = 'visible';
        milkdropWindow.style.display = 'block';
        milkdropWindow.style.width = this.state.isMobileDevice ? '300px' : '600px';
        milkdropWindow.style.height = this.state.isMobileDevice ? '200px' : '400px';
        milkdropWindow.style.zIndex = '99999';
        
        // Handle canvas
        const canvas = milkdropWindow.querySelector('canvas');
        if (canvas) {
          canvas.style.visibility = 'visible';
          canvas.style.display = 'block';
          canvas.style.width = '100%';
          canvas.style.height = '100%';
        }
      } else {
        console.warn("Visualizer window not found, trying to toggle again");
        
        // Try toggling visualizer again
        this.webampInstance.store.dispatch({
          type: "TOGGLE_VISUALIZER_WINDOW"
        });
        
        // Try alternate dispatch
        try {
          this.webampInstance.store.dispatch({
            type: "TOGGLE_MILKDROP_DESKTOP"
          });
        } catch (e) {
          console.warn("Error toggling desktop mode:", e);
        }
      }
    } catch (e) {
      console.error("Error ensuring visualizer visibility:", e);
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
      element.style.position = 'absolute';
      element.style.zIndex = '99999';
      
      e.preventDefault();
    };
    
    const handleTouchMove = (e) => {
      if (!isDragging) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      
      // Set new position
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
    
    // Add visual cue
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
        
        // Calculate position
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
        
        // Ensure visualizer is visible
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
    
    // Remove keyboard event listener
    document.removeEventListener('keydown', this.handleKeyPress);
    
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
    this.loadExternalDependencies()
      .then(() => this.initializeWebamp())
      .catch(error => {
        console.error("Error loading dependencies:", error);
        this.setState({
          isLoading: false,
          error: error.message || "Error loading dependencies"
        });
      });
  };

  render() {
    const { props } = this;
    const { isLoading, isWebampReady, error } = this.state;
  
    const menuOptions = buildMenu({
      ...props,
      componentType: 'MusicPlayer',
      showHelp: this.showHelp,
      options: {},
    }, {
      Help: {
        options: [
          { title: "Help Topics", onClick: () => alert("Music Player Help Topics"), isDisabled: true },
          //{ title: "About", onClick: () => alert("About Music Player"), isDisabled: false }
        ]
      }
    });
  
    return (
      <Window
        {...props}
        Component={WindowProgram}
        title="Winamp Music Player"
        menuOptions={menuOptions}
        className={cx('music-player', 'music-player-window', props.className)}
        minHeight={this.state.isMobileDevice ? '80px' : '80px'}
        minWidth={this.state.isMobileDevice ? '270px' : '270px'}
        initialWidth={this.state.isMobileDevice ? '270px' : '270px'}
        initialHeight={this.state.isMobileDevice ? '80px' : '80px'}
        resizable={false}
        initialX={this.state.isMobileDevice ? 10 : 2} // Adjust x position for mobile
        initialY={this.state.isMobileDevice ? 100 : 372} // Adjust y position for mobile
        style={{
          zIndex: 9,
          width: this.state.isMobileDevice ? '270px' : '270px',
          height: this.state.isMobileDevice ? '80px' : '80px',
          ...props.style,
        }}
      >
        <div 
          ref={this.containerRef}
          className="music-player-container"
          style={{
            width: '100%',
            height: '100%',
            minHeight: '100%',
            minWidth: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {isLoading ? (
            <div>Loading Webamp...</div>
          ) : error ? (
            <div className="webamp-error">
              <div>Error: {error}</div>
              <button 
                onClick={this.retryLoading}
                style={{
                  backgroundColor: '#d3d3d3',
                  border: '1px solid #999',
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          ) : isWebampReady ? (
            <div>Close me to exit the player</div>
          ) : null}
        </div>
      </Window>
    );
  }
}

export default MusicPlayer;