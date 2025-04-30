import React, { Component } from 'react';
import { WindowProgram } from 'packard-belle';
import cx from 'classnames';
import buildMenu from '../../helpers/menuBuilder';
import {
  loadWebamp,
  createWebampInstance,
  createWebampContainer,
  removeWebampContainer
} from './webampLoader';
import './_styles.scss';

class MusicPlayer extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      isLoading: true,
      isWebampReady: false,
      error: null
    };
    
    this.containerRef = React.createRef();
    this.webampInstance = null;
    this.containerId = 'webamp-container-' + Math.floor(Math.random() * 1000000);
  }
  
  componentDidMount() {
    this.initializeWebamp();
  }
  
  initializeWebamp = async () => {
    try {
      this.setState({ isLoading: true });
      
      // Create a container for Webamp
      const container = createWebampContainer(this.containerId);
      
      // Default tracks configuration
      const tracks = this.props.initialTracks || [{
        metaData: {
          artist: "Hydra98",
          title: "VAST Inspector & Video Ad Tag Tester",
        },
        url: "https://github.com/captbaritone/webamp/raw/master/mp3/llama-2.91.mp3",
      }];
      
      // Configure Webamp with proper options
      const options = {
        initialTracks: tracks,
        zIndex: this.props.zIndex || 5,
        initialWindowLayout: {
          main: { position: { x: 50, y: 50 } }
        }
      };
      
      // Add skin if provided
      if (this.props.initialSkin) {
        options.initialSkin = this.props.initialSkin;
      }
      
      // Create Webamp instance
      this.webampInstance = await createWebampInstance(options);
      
      // Add event handlers
      if (this.props.onClose) {
        this.webampInstance.onClose(this.props.onClose);
      }
      
      // Render Webamp when ready
      await this.webampInstance.renderWhenReady(container);
      
      // Update state
      this.setState({ 
        isLoading: false,
        isWebampReady: true 
      });
      
      // Position Webamp within the viewport
      setTimeout(() => {
        this.positionWebampInViewport();
      }, 0);
      
      // Add resize listener
      window.addEventListener('resize', this.positionWebampInViewport);
    } catch (error) {
      console.error('Error initializing Webamp:', error);
      this.setState({ 
        isLoading: false,
        error: error.message || 'Error initializing Webamp' 
      });
    }
  };
  
  positionWebampInViewport = () => {
    if (!this.webampInstance) return;
    
    try {
      // Find the Webamp elements
      const webampMain = document.getElementById('webamp');
      if (!webampMain) return;
      
      // Get webamp dimensions
      const webampRect = webampMain.getBoundingClientRect();
      const webampWidth = webampRect.width;
      const webampHeight = webampRect.height;
      
      // Calculate a good position within the viewport
      // Position it in the top half of the screen, in the center
      const posX = 850;
      const posY = -330;
      //initialX={.2} // Align to the top-left corner
      //initialY={.2} // Align to the top-left corner
      
      // Apply the position
      webampMain.style.position = 'absolute';
      webampMain.style.top = `${posY}px`;
      webampMain.style.left = `${posX}px`;
      webampMain.style.zIndex = this.props.zIndex || 9999;
      
      // Position other Webamp windows if they exist
      const webampEqualizer = document.querySelector('#webamp .equalizer-window');
      if (webampEqualizer) {
        webampEqualizer.style.position = 'absolute';
        webampEqualizer.style.top = `${posY + webampHeight + 10}px`;
        webampEqualizer.style.left = `${posX}px`;
        webampEqualizer.style.zIndex = this.props.zIndex || 9999;
      }
      
      const webampPlaylist = document.querySelector('#webamp .playlist-window');
      if (webampPlaylist) {
        webampPlaylist.style.position = 'absolute';
        webampPlaylist.style.top = `${posY}px`;
        webampPlaylist.style.left = `${posX + webampWidth + 10}px`;
        webampPlaylist.style.zIndex = this.props.zIndex || 9999;
      }
    } catch (error) {
      console.error('Error positioning Webamp:', error);
    }
  };
  
  componentWillUnmount() {
    // Remove resize listener
    window.removeEventListener('resize', this.positionWebampInViewport);
    
    // Clean up Webamp instance
    if (this.webampInstance) {
      try {
        this.webampInstance.dispose();
        this.webampInstance = null;
      } catch (error) {
        console.error('Error disposing Webamp:', error);
      }
    }
    
    // Remove container
    removeWebampContainer(this.containerId);
  }
  
  showHelp = () => {
    alert('Webamp Help is not implemented yet.');
  };
  
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
      <loadWebamp
        {...props}
        Component={WindowProgram}
        title="Winamp Music Player"
        menuOptions={menuOptions}
        className={cx('music-player-window', props.className)}
        initialWidth={348}
        initialHeight={232}
        resizable={false}
        style={{ zIndex: 9, top: '50px', ...props.style }}
        initialX={.2} // Align to the top-left corner
        initialY={.2} // Align to the top-left corner
      >
        <div 
          ref={this.containerRef}
          className="music-player-container"
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            backgroundColor: '#D1D1D1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '20px',
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
            <div>Webamp is running outside this window.</div>
          ) : null}
        </div>
      </loadWebamp>
    );
  }
}

export default MusicPlayer;