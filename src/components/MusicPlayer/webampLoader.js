/**
 * Webamp Loader - Utility to load and initialize Webamp
 * 
 * This file handles loading the Webamp library, either from a CDN
 * or by checking if it's already available globally through webpack.
 */

// Keep track of loading/initialization state
let isLoading = false;
let isInitialized = false;
let initPromise = null;

/**
 * Load Webamp from CDN if not already available
 * @returns {Promise} Promise that resolves when Webamp is loaded
 */
export function loadWebamp() {
  // If Webamp is already available globally, just use it
  if (window.Webamp) {
    isInitialized = true;
    return Promise.resolve(window.Webamp);
  }

  // If already loading, return the existing promise
  if (isLoading && initPromise) {
    return initPromise;
  }

  // Create a new promise to load the script
  initPromise = new Promise((resolve, reject) => {
    isLoading = true;
    
    // Create script element
    const script = document.createElement('script');
    script.id = 'webamp-script';
    script.src = 'https://unpkg.com/webamp@1.4.0/built/webamp.bundle.min.js';
    script.async = true;
    
    // Handle script load event
    script.onload = () => {
      isLoading = false;
      
      if (window.Webamp) {
        isInitialized = true;
        resolve(window.Webamp);
      } else {
        reject(new Error('Webamp loaded but not available in window object'));
      }
    };
    
    // Handle errors
    script.onerror = (error) => {
      isLoading = false;
      reject(new Error(`Failed to load Webamp: ${error.message || 'Unknown error'}`));
    };
    
    // Add script to document
    document.head.appendChild(script);
  });
  
  return initPromise;
}

/**
 * Create a Webamp instance with the given options
 * @param {Object} options - Webamp configuration options
 * @returns {Promise} Promise that resolves to the Webamp instance
 */
export function createWebampInstance(options = {}) {
  return loadWebamp()
    .then(Webamp => {
      // Check if browser is supported
      if (Webamp.browserIsSupported && !Webamp.browserIsSupported()) {
        throw new Error('This browser is not supported by Webamp');
      }
      
      // Create Webamp instance
      return new Webamp(options);
    });
}

/**
 * Check if Webamp is available
 * @returns {Boolean} Whether Webamp is loaded and initialized
 */
export function isWebampAvailable() {
  return isInitialized && window.Webamp !== undefined;
}

/**
 * Create a container for Webamp to render into
 * @param {String} id - ID for the container
 * @returns {HTMLElement} The created container element
 */
export function createWebampContainer(id = 'webamp-container') {
  // Check if container already exists
  let container = document.getElementById(id);
  
  if (!container) {
    // Create container
    container = document.createElement('div');
    container.id = id;
    container.style.position = 'absolute';
    container.style.zIndex = '9999';
    container.style.width = '0';
    container.style.height = '0';
    
    // Add to body
    document.body.appendChild(container);
  }
  
  return container;
}

/**
 * Remove Webamp container
 * @param {String} id - ID of the container to remove
 */
export function removeWebampContainer(id = 'webamp-container') {
  const container = document.getElementById(id);
  
  if (container && container.parentNode) {
    try {
      container.parentNode.removeChild(container);
    } catch (error) {
      console.error('Error removing Webamp container:', error);
    }
  }
}

export default {
  loadWebamp,
  createWebampInstance,
  isWebampAvailable,
  createWebampContainer,
  removeWebampContainer
};