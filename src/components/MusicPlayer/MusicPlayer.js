import React, { Component } from 'react';
import cx from 'classnames';
import { WindowProgram } from 'packard-belle';
import buildMenu from '../../helpers/menuBuilder';
import {
  loadWebamp,
  loadButterchurn,
  loadButterchurnPresets,
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
      error: null,
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
      const butterchurn = await loadButterchurn();
      const presets = await loadButterchurnPresets();

      const options = {
        initialTracks: tracks,
        zIndex: this.props.zIndex || 0.1,
        initialWindowLayout: {
          main: { position: { x: 0, y: 0 } }
        },
        __butterchurnOptions: {
          butterchurn,
          getPresets: () => Promise.resolve(presets)
        }
      };

      if (this.props.initialSkin) {
        options.initialSkin = this.props.initialSkin;
      }

      this.webampInstance = new Webamp(options);

      if (this.props.onClose) {
        this.webampInstance.onClose(this.props.onClose);
      }

      await this.webampInstance.renderWhenReady(container);

      // ✅ Set window visibility states before drawing UI
      this.webampInstance.store.dispatch({
        type: "WINDOW_VISIBILITY_CHANGED",
        payload: { windowId: "equalizer", hidden: false }
      });
      this.webampInstance.store.dispatch({
        type: "WINDOW_VISIBILITY_CHANGED",
        payload: { windowId: "playlist", hidden: false }
      });
      this.webampInstance.store.dispatch({
        type: "WINDOW_VISIBILITY_CHANGED",
        payload: { windowId: "milkdrop", hidden: false }
      });

      // Delay position call after window is mounted
      setTimeout(() => {
        this.positionWebampInViewport();
      }, 300);

      this.setState({ isLoading: false, isWebampReady: true });

      window.addEventListener('resize', this.positionWebampInViewport);
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
      visualizerWindow.style.zIndex = 10;
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
          <div>Webamp is running with visualizer.</div>
        ) : null}
      </div>
    );
  }
}

export default MusicPlayer;
