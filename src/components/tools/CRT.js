import React, { useEffect, useState } from "react";
import "./_crt.scss";

const CRTOverlay = props => {
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Effect to check if zoomed and hide CRT effect when zoomed
  useEffect(() => {
    // Function to check zoom state
    const checkZoomState = () => {
      // Multiple ways to detect zoom:
      // 1. Check data-zoom attribute on body
      const bodyZoom = document.body.getAttribute('data-zoom');
      // 2. Check for zoomed class on monitor container
      const monitorContainer = document.querySelector('.monitor-container');
      const hasZoomedClass = monitorContainer?.classList.contains('zoomed');
      // 3. Check if monitor container has transform style
      const hasTransform = monitorContainer?.style.transform.includes('scale');
      
      // If any of these are true, we're zoomed
      setIsZoomed(bodyZoom === '1' || bodyZoom === '2' || hasZoomedClass || hasTransform);
    };
    
    // Initial check
    checkZoomState();
    
    // Set up mutation observer to detect changes to relevant elements
    const observer = new MutationObserver(checkZoomState);
    
    // Observe body for attribute changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-zoom']
    });
    
    // Observe monitor container for class and style changes
    const monitorContainer = document.querySelector('.monitor-container');
    if (monitorContainer) {
      observer.observe(monitorContainer, {
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    }
    
    // Also set up event listener for zoom changes
    window.addEventListener('zoom-change', checkZoomState);
    
    // Clean up
    return () => {
      observer.disconnect();
      window.removeEventListener('zoom-change', checkZoomState);
    };
  }, []);
  
  // If zoomed, don't render CRT effect
  if (isZoomed) {
    return null;
  }
  
  return (
    <div className="container" id="crt-overlay">
      <div className="screen" />
    </div>
  );
};

export default CRTOverlay;