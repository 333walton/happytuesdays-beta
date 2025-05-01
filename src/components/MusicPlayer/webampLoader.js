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
 */
export function loadWebamp() {
  if (window.Webamp) {
    isInitialized = true;
    return Promise.resolve(window.Webamp);
  }
  if (isLoading && initPromise) return initPromise;

  initPromise = new Promise((resolve, reject) => {
    isLoading = true;
    const script = document.createElement('script');
    script.id = 'webamp-script';
    script.src = 'https://unpkg.com/webamp@1.4.0/built/webamp.bundle.min.js';
    script.async = true;
    script.onload = () => {
      isLoading = false;
      if (window.Webamp) {
        isInitialized = true;
        resolve(window.Webamp);
      } else {
        reject(new Error('Webamp loaded but not available in window object'));
      }
    };
    script.onerror = (error) => {
      isLoading = false;
      reject(new Error('Failed to load Webamp: ' + (error.message || 'Unknown error')));
    };
    document.head.appendChild(script);
  });
  return initPromise;
}

/**
 * Load Butterchurn visualizer library
 */
export function loadButterchurn() {
  return new Promise((resolve, reject) => {
    if (window.butterchurn) return resolve(window.butterchurn);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/butterchurn@2.6.7/lib/butterchurn.min.js';
    script.async = true;
    script.onload = () => resolve(window.butterchurn);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Load Butterchurn presets
 */
export function loadButterchurnPresets() {
  return new Promise((resolve, reject) => {
    if (window.butterchurnPresets) return resolve(window.butterchurnPresets.presets);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/butterchurn-presets@2.4.7/lib/butterchurnPresets.min.js';
    script.async = true;
    script.onload = () => resolve(window.butterchurnPresets.presets);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function createWebampContainer(id = 'webamp-container') {
  let container = document.getElementById(id);
  if (!container) {
    container = document.createElement('div');
    container.id = id;
    container.style.position = 'absolute';
    container.style.zIndex = '.1';
    container.style.left = '850px';
    container.style.top = '400px';
    container.style.width = '0';
    container.style.height = '0';
    document.body.appendChild(container);
  }
  return container;
}

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
createWebampContainer,
removeWebampContainer
};