// webampLoader.js
// Utility functions for loading Webamp and its dependencies

// Constants for action types
export const SET_EQ_AUTO = "SET_EQ_AUTO";

// Load Webamp from CDN
export function loadWebamp() {
  return new Promise((resolve, reject) => {
    if (window.Webamp) {
      resolve(window.Webamp);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/webamp@1.4.2/built/webamp.bundle.min.js';
    script.async = true;
    script.onload = () => {
      if (window.Webamp) {
        resolve(window.Webamp);
      } else {
        reject(new Error('Webamp failed to load'));
      }
    };
    script.onerror = () => {
      reject(new Error('Error loading Webamp from CDN'));
    };
    document.head.appendChild(script);
  });
}

// Improved Butterchurn loader with more robust error handling and fallbacks
export function loadButterchurn() {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.butterchurn) {
      console.log("Butterchurn already loaded, using existing instance");
      resolve(window.butterchurn);
      return;
    }

    console.log("Loading Butterchurn from CDN...");
    
    // Try loading from multiple CDNs for reliability
    const cdnUrls = [
      'https://unpkg.com/butterchurn@2.6.7/lib/butterchurn.min.js',
      'https://cdn.jsdelivr.net/npm/butterchurn@2.6.7/lib/butterchurn.min.js'
    ];
    
    let loaded = false;
    let errors = [];
    
    // Try each URL
    const tryLoadFromUrl = (index) => {
      if (index >= cdnUrls.length) {
        // All URLs failed
        reject(new Error(`Failed to load Butterchurn. Errors: ${errors.join(', ')}`));
        return;
      }
      
      const url = cdnUrls[index];
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      
      script.onload = () => {
        if (window.butterchurn) {
          console.log(`Butterchurn loaded successfully from ${url}`);
          loaded = true;
          resolve(window.butterchurn);
        } else {
          console.warn(`Script loaded from ${url} but butterchurn not found on window`);
          errors.push(`Script loaded but no butterchurn object from ${url}`);
          // Try next URL
          tryLoadFromUrl(index + 1);
        }
      };
      
      script.onerror = (e) => {
        console.warn(`Error loading Butterchurn from ${url}`, e);
        errors.push(`Failed to load from ${url}`);
        // Try next URL
        tryLoadFromUrl(index + 1);
      };
      
      document.head.appendChild(script);
    };
    
    // Start trying URLs
    tryLoadFromUrl(0);
    
    // Set a timeout for fallback resolution in case script loading hangs
    setTimeout(() => {
      if (!loaded) {
        console.warn("Butterchurn load timed out, providing fallback object");
        // Provide a minimal fallback object to prevent errors
        window.butterchurn = window.butterchurn || {
          createVisualizer: () => ({
            connectAudio: () => {},
            setRendererSize: () => {},
            loadPreset: () => {},
            render: () => {}
          })
        };
        resolve(window.butterchurn);
      }
    }, 10000);
  });
}

// Improved Butterchurn presets loader
export function loadButterchurnPresets() {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.butterchurnPresets) {
      console.log("Butterchurn presets already loaded, using existing instance");
      resolve(window.butterchurnPresets);
      return;
    }
    
    console.log("Loading Butterchurn presets from CDN...");
    
    // Try loading from multiple CDNs for reliability
    const cdnUrls = [
      'https://unpkg.com/butterchurn-presets@2.4.7/lib/butterchurnPresets.min.js',
      'https://cdn.jsdelivr.net/npm/butterchurn-presets@2.4.7/lib/butterchurnPresets.min.js'
    ];
    
    let loaded = false;
    let errors = [];
    
    // Try each URL
    const tryLoadFromUrl = (index) => {
      if (index >= cdnUrls.length) {
        // All URLs failed
        reject(new Error(`Failed to load Butterchurn presets. Errors: ${errors.join(', ')}`));
        return;
      }
      
      const url = cdnUrls[index];
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      
      script.onload = () => {
        if (window.butterchurnPresets) {
          console.log(`Butterchurn presets loaded successfully from ${url}`);
          loaded = true;
          
          // Handle different presets formats
          if (typeof window.butterchurnPresets.getPresets === 'function') {
            resolve(window.butterchurnPresets.getPresets());
          } else {
            resolve(window.butterchurnPresets);
          }
        } else {
          console.warn(`Script loaded from ${url} but butterchurnPresets not found on window`);
          errors.push(`Script loaded but no butterchurnPresets object from ${url}`);
          // Try next URL
          tryLoadFromUrl(index + 1);
        }
      };
      
      script.onerror = (e) => {
        console.warn(`Error loading Butterchurn presets from ${url}`, e);
        errors.push(`Failed to load from ${url}`);
        // Try next URL
        tryLoadFromUrl(index + 1);
      };
      
      document.head.appendChild(script);
    };
    
    // Start trying URLs
    tryLoadFromUrl(0);
    
    // Set a timeout for fallback resolution
    setTimeout(() => {
      if (!loaded) {
        console.warn("Butterchurn presets load timed out, providing fallback object");
        // Provide a minimal fallback object
        window.butterchurnPresets = window.butterchurnPresets || {
          // Include at least one preset so we don't get empty preset errors
          'Fallback Preset': {
            name: 'Fallback Preset',
            baseVals: {},
            waves: [],
            init_eqs: '',
            per_frame_eqs: '',
            per_pixel_eqs: '',
            warp: '',
            comp: ''
          }
        };
        resolve(window.butterchurnPresets);
      }
    }, 10000);
  });
}

// Create a container for Webamp
export function createWebampContainer(containerId) {
  // Remove any existing container with this ID
  removeWebampContainer(containerId);
  
  // Create a new container
  const container = document.createElement('div');
  container.id = containerId;
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none'; // Let clicks pass through to underlying elements
  
  // Add container to the DOM
  document.body.appendChild(container);
  
  return container;
}

// Remove a Webamp container
export function removeWebampContainer(containerId) {
  const existingContainer = document.getElementById(containerId);
  if (existingContainer) {
    existingContainer.remove();
  }
}

// Check if butterchurn is supported in the current browser
export function isButterchurnSupported() {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/butterchurn@2.6.7/lib/isSupported.min.js';
    script.async = true;
    script.onload = () => {
      if (window.isButterchurnSupported) {
        resolve(window.isButterchurnSupported());
      } else {
        // Fallback: assume support if the function isn't available
        resolve(true);
      }
    };
    script.onerror = () => {
      // Fallback in case of error
      resolve(false);
    };
    document.head.appendChild(script);
  });
}