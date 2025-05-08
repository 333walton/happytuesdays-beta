import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  groupbox1,
  groupbox2a,
  groupbox2b,
  groupbox2c,
  groupbox3,
  groupbox4
} from '../../icons';

// Fun rocket animation
const rocketShake = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(5deg); }
  100% { transform: rotate(0deg); }
`;

const rocketGlow = keyframes`
  0% { text-shadow: 0 0 5px rgba(255,165,0,0); }
  50% { text-shadow: 0 0 10px rgba(255,165,0,0.7); }
  100% { text-shadow: 0 0 5px rgba(255,165,0,0); }
`;

// Styled components for layout
const ControlsContainer = styled.div`
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 101;
`;

const WindowContainer = styled.div`
  width: 200px;
  background-color: #c0c0c0;
  border: 2px solid;
  border-top-color: #ffffff;
  border-left-color: #ffffff;
  border-right-color: #000000;
  border-bottom-color: #000000;
  box-shadow: 1px 1px 0 #000000;
`;

// Make the whole title bar clickable for collapse functionality
const WindowTitle = styled.div`
  background-color: #000080;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 4px;
  font-size: 11px;
  cursor: pointer; /* Add cursor pointer to indicate clickable */
`;

// Fixed window content height to match screenshot
const WindowContent = styled.div`
  padding: 4px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const GroupBox = styled.div`
  margin-bottom: 2px;
  padding: 13px 5px 5px; /* Increased top padding by 3px to lower content */
  position: relative;
  border: 1px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-right-color: #ffffff;
  border-bottom-color: #ffffff;
`;

const GroupBoxLabel = styled.div`
  position: absolute;
  top: -5px; /* Keep the title at the original position */
  left: 6px;
  padding: 0 3px;
  background-color: #c0c0c0;
  font-size: 10px;
  font-weight: bold; // Bold category titles
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 5px;
  margin: 2px 0;
`;

// Standard button without tooltips
const Win98Button = styled.button`
  width: 25px;
  height: 25px;
  padding: 0;
  min-width: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  background-color: ${props => props.isActive ? '#b0b0b0' : '#c0c0c0'};
  border: 2px solid;
  border-top-color: ${props => props.isActive ? '#808080' : '#ffffff'};
  border-left-color: ${props => props.isActive ? '#808080' : '#ffffff'};
  border-right-color: ${props => props.isActive ? '#ffffff' : '#000000'};
  border-bottom-color: ${props => props.isActive ? '#ffffff' : '#000000'};
  cursor: pointer;
  opacity: ${props => props.disabled ? 0.6 : 1};
  position: relative;
  
  img {
    width: 18px;
    height: 18px;
  }
`;

// Button with tooltip capability - for zoom buttons only
const TooltipButton = styled(Win98Button)`
  /* Tooltip with longer delay */
  &::before {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 28px; // Position above button
    left: 50%;
    transform: translateX(-50%);
    background-color: #ffffcc;
    border: 1px solid #000;
    padding: 2px 4px;
    font-size: 10px;
    white-space: nowrap;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.4s, visibility 0.4s; /* Changed from 0.2s to 0.4s for longer delay */
    transition-delay: 0.5s; /* Added delay before showing tooltip */
  }
  
  &:hover::before {
    opacity: 1;
    visibility: visible;
  }
`;

// Special rocket button with animation but without tooltip
const RocketButton = styled.button`
  width: 25px;
  height: 25px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.isActive ? '#b0b0b0' : '#c0c0c0'};
  border: 2px solid;
  border-top-color: ${props => props.isActive ? '#808080' : '#ffffff'};
  border-left-color: ${props => props.isActive ? '#808080' : '#ffffff'};
  border-right-color: ${props => props.isActive ? '#ffffff' : '#000000'};
  border-bottom-color: ${props => props.isActive ? '#ffffff' : '#000000'};
  cursor: pointer;
  position: relative;
  margin-right: 4px;
  
  /* Special rocket animation on hover */
  & span {
    font-size: 14px;
    transition: all 0.2s ease;
  }
  
  &:hover span {
    animation: ${rocketShake} 0.5s infinite, ${rocketGlow} 1s infinite;
    transform-origin: center;
    font-size: 16px; // Grow slightly on hover
  }
`;

const TreeItem = styled.div`
  display: flex;
  align-items: center;
  margin: 2px 0; /* Reduced margin */
  padding-left: ${({ level }) => level * 12}px;
`;

const TreeItemContent = styled.div`
  margin-left: 8px;
  width: 100%;
  font-size: 10px;
`;

// Color preview with consistent yellow tooltip but longer delay - reduced size to 15px
const ColorPreview = styled.div`
  position: relative;
  width: 15px;
  height: 15px;
  border: 1px solid #000;
  margin-right: 8px;
  cursor: help;
  
  &::before {
    content: "${props => props.colorName}";
    position: absolute;
    bottom: 22px;
    left: 0;
    background-color: #ffffcc;
    border: 1px solid #000;
    padding: 2px 4px;
    font-size: 10px;
    white-space: nowrap;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.4s, visibility 0.4s; /* Changed from 0.2s to 0.4s for longer delay */
    transition-delay: 0.5s; /* Added delay before showing tooltip */
  }
  
  &:hover::before {
    opacity: 1;
    visibility: visible;
  }
`;

const StyledRangeInput = styled.input`
  width: 100%;
  height: 12px;
  -webkit-appearance: none;
  appearance: none;
  background: #ffffff;
  outline: none;
  border: 1px solid #868a8e;
  border-radius: 0;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 16px;
    background: #c0c0c0;
    cursor: pointer;
    border: 1px solid;
    border-top-color: #ffffff;
    border-left-color: #ffffff;
    border-right-color: #000000;
    border-bottom-color: #000000;
  }
`;

// Styled dropdown
const Win98Select = styled.select`
  width: 120px;
  height: 22px;
  background-color: white;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-right-color: white;
  border-bottom-color: white;
  font-size: 10px;
  padding: 1px;
  font-family: "Microsoft Sans Serif", Tahoma, sans-serif;
`;

/**
 * Monitor Controls Panel Component - Balanced version
 */
const MonitorControlsPanel = ({
  showMonitor,
  toggleMonitorView,
  zoomLevel,
  setZoomLevel,
  isScreensaverActive,
  toggleScreensaver,
  isRocketActive, 
  toggleRocket,
  activeScreensaver,
  setActiveScreensaver,
  viewframeColor,
  setViewframeColor
}) => {
  // State for window collapse and active viewframe
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // State for tracking which category is active
  const [activeViewframeCategory, setActiveViewframeCategory] = useState(
    isScreensaverActive ? 'animated' : 'static'
  );
  
  // Reference to the root element and active color
  const rootRef = useRef(null);
  const activeColorRef = useRef('#2F4F4F');
  const lastColorRef = useRef('#2F4F4F');
  const colorClickCountRef = useRef(0);
  const colorClickTimerRef = useRef(null);
  
  // Initialize color and find root element
  useEffect(() => {
    if (!viewframeColor) {
      setViewframeColor('#2F4F4F');
    }
    
    activeColorRef.current = viewframeColor;
    lastColorRef.current = viewframeColor;
    rootRef.current = document.getElementById('root');
  }, []);
  
  // Apply color to root element when active category is static
  useEffect(() => {
    if (rootRef.current && viewframeColor) {
      activeColorRef.current = viewframeColor;
      lastColorRef.current = viewframeColor;
      
      if (activeViewframeCategory === 'static') {
        rootRef.current.style.backgroundColor = viewframeColor;
      }
    }
  }, [viewframeColor, activeViewframeCategory]);
  
  // Ensure color persists when monitor toggled
  useEffect(() => {
    if (rootRef.current && activeViewframeCategory === 'static') {
      rootRef.current.style.backgroundColor = activeColorRef.current;
    }
  }, [showMonitor]);
  
  // Update the active category when screensaver state changes
  useEffect(() => {
    setActiveViewframeCategory(isScreensaverActive ? 'animated' : 'static');
    
    // If switching back to static, restore the last color
    if (!isScreensaverActive && rootRef.current) {
      rootRef.current.style.backgroundColor = lastColorRef.current;
    }
  }, [isScreensaverActive]);
  
  // Updated color options with the new colors in the specific order requested
  const colorOptions = [
    '#1A1A1A', // charcoal
    '#2F2F2F', // graphite
    '#2F4F4F', // dark-slate-gray (default color)
    '#3C3F41', // eclipse-gray
    '#4B3B47', // raisin-plum
    '#4B5320', // army-green
    '#4D4D4D', // dim-gray
    '#5F5F5F', // medium-gray
    '#556B2F', // olive-drab
    '#5C5845', // dark-khaki
    '#5C5C8A', // moody-violet
    '#5D6A75', // win98-steel
    '#666666', // system-gray
    '#696969', // dark-gray
    '#6B4226', // saddle-brown
    '#6E7B8B', // cadet-slate
    '#708090', // slate-gray
    '#7A6F9B', // retro-lavender
    '#778899', // light-slate-gray
    '#7F8C8D', // muted-blue-gray
    '#8A795D', // dusty-olive
    '#8B8589', // windows-control-gray
    '#A0522D', // sienna
    '#C0C0C0', // windows-silver
    '#CDD9C4'  // pastel-olive
  ];
  
  // Color names for tooltip - updated to match new color order
  const colorNames = [
    'Charcoal', 'Graphite', 'Dark Slate', 'Eclipse', 'Raisin',
    'Army Green', 'Dim Gray', 'Medium Gray', 'Olive', 'Dark Khaki',
    'Moody Violet', 'Win98 Steel', 'System Gray', 'Dark Gray', 'Saddle Brown',
    'Cadet Slate', 'Slate Gray', 'Retro Lavender', 'Light Slate', 'Blue Gray',
    'Dusty Olive', 'Control Gray', 'Sienna', 'Silver', 'Pastel Olive'
  ];
  
  // Screensaver options - removed 'Stars' option
  const screensaverOptions = [
    { value: 'default', label: 'Space' },
    { value: 'animation1', label: 'Animation 1' },
    { value: 'animation2', label: 'Animation 2' }
  ];
  
  // Find the index of the current color
  const currentColorIndex = colorOptions.findIndex(color => color === viewframeColor);
  const initialColorIndex = currentColorIndex !== -1 ? currentColorIndex : 2;
  
  // Handle color slider change
  const handleColorChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setViewframeColor(colorOptions[value]);
  };
  
  // Handle screensaver select change
  const handleScreensaverChange = (e) => {
    setActiveScreensaver(e.target.value);
  };
  
  // Handle triple-click on static color button to reset color
  const handleStaticColorClick = () => {
    colorClickCountRef.current += 1;
    
    // Clear existing timer
    if (colorClickTimerRef.current) {
      clearTimeout(colorClickTimerRef.current);
    }
    
    // If triple-click, reset to default color
    if (colorClickCountRef.current === 3) {
      setViewframeColor('#2F4F4F'); // Reset to dark-slate-gray
      colorClickCountRef.current = 0;
    } else {
      // Set timer to reset click count after 500ms
      colorClickTimerRef.current = setTimeout(() => {
        colorClickCountRef.current = 0;
      }, 500);
    }
  };
  
  // Toggle the category
  const toggleCategory = (category) => {
    // Important: If we're switching from rocket mode to static, force monitor to show
    if (isRocketActive && category === 'static') {
      // Call toggleRocket first to disable rocket mode
      toggleRocket();
      
      // Then proceed with regular category switching
      setActiveViewframeCategory('static');
      
      // If screensaver is active, disable it
      if (isScreensaverActive) {
        toggleScreensaver();
      }
      
      return; // Exit early to avoid duplicate toggles
    }
    
    // Only proceed if changing category
    if (category !== activeViewframeCategory) {
      setActiveViewframeCategory(category);
      
      // If switching to animated, enable screensaver
      if (category === 'animated' && !isScreensaverActive) {
        // Save the current color before switching
        lastColorRef.current = viewframeColor;
        toggleScreensaver();
      } 
      // If switching to static, disable screensaver
      else if (category === 'static' && isScreensaverActive) {
        toggleScreensaver();
        
        // Restore the color when switching back to static
        if (rootRef.current) {
          rootRef.current.style.backgroundColor = lastColorRef.current;
        }
      }
    } else {
      // If clicking the same category button again, allow toggling off animated
      if (category === 'animated' && isScreensaverActive) {
        setActiveViewframeCategory('static');
        toggleScreensaver();
        
        // Restore the color when switching back to static
        if (rootRef.current) {
          rootRef.current.style.backgroundColor = lastColorRef.current;
        }
      }
    }
  };
  
  // Handle click on title bar to toggle collapse
  const handleTitleClick = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  // Get the current color name for tooltip
  const getCurrentColorName = () => {
    const index = colorOptions.findIndex(color => color === viewframeColor);
    return index !== -1 ? colorNames[index] : 'Color';
  };
  
  return (
    <ControlsContainer>
      <WindowContainer>
        {/* Make entire title bar clickable */}
        <WindowTitle onClick={handleTitleClick}>
          <span>Monitor Controls</span>
          <button 
            style={{ 
              width: '14px', 
              height: '14px', 
              fontSize: '9px', 
              marginLeft: '3px', 
              padding: 0,
              backgroundColor: '#c0c0c0',
              border: '1px solid',
              borderTopColor: '#ffffff',
              borderLeftColor: '#ffffff',
              borderRightColor: '#000000',
              borderBottomColor: '#000000'
            }}
            onClick={(e) => {
              // Stop propagation to prevent double toggling
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        </WindowTitle>
        
        {!isCollapsed && (
          <WindowContent>
            {/* GroupBox 1: Monitor Mode */}
            <GroupBox>
              <GroupBoxLabel>Monitor Mode</GroupBoxLabel>
              <ButtonRow>
                {/* Using regular Win98Button without tooltip capability */}
                <Win98Button
                  isActive={showMonitor}
                  onClick={toggleMonitorView}
                >
                  <img src={groupbox1} alt="Monitor mode" style={{ width: '18px', height: '18px' }} />
                </Win98Button>
              </ButtonRow>
            </GroupBox>
            
            {/* GroupBox 2: Zoom Options */}
            <GroupBox>
              <GroupBoxLabel>Zoom Options</GroupBoxLabel>
              <ButtonRow>
                {/* Using TooltipButton component for zoom buttons only */}
                <TooltipButton
                  isActive={zoomLevel === 0}
                  onClick={() => setZoomLevel(0)}
                  data-tooltip="100%"
                >
                  <img src={groupbox2a} alt="Default zoom" style={{ width: '18px', height: '18px' }} />
                </TooltipButton>
                <TooltipButton
                  isActive={zoomLevel === 1}
                  onClick={() => setZoomLevel(1)}
                  data-tooltip="110%"
                >
                  <img src={groupbox2b} alt="110% zoom" style={{ width: '18px', height: '18px' }} />
                </TooltipButton>
                <TooltipButton
                  isActive={zoomLevel === 2}
                  onClick={() => setZoomLevel(2)}
                  data-tooltip="125%"
                >
                  <img src={groupbox2c} alt="125% zoom" style={{ width: '18px', height: '18px' }} />
                </TooltipButton>
              </ButtonRow>
            </GroupBox>
            
            {/* GroupBox 3: Viewframe Options */}
            <GroupBox>
              <GroupBoxLabel>Viewframe Options</GroupBoxLabel>
              <div>
                {/* Static Category - Using regular Win98Button without tooltip */}
                <TreeItem level={0}>
                  <Win98Button
                    isActive={activeViewframeCategory === 'static'}
                    onClick={() => toggleCategory('static')}
                    onClickCapture={handleStaticColorClick}
                  >
                    <img src={groupbox3} alt="Static viewframe" style={{ width: '18px', height: '18px' }} />
                  </Win98Button>
                  <TreeItemContent>
                    Static
                  </TreeItemContent>
                </TreeItem>
                
                {/* Static Category Content - Color Selection */}
                {activeViewframeCategory === 'static' && (
                  <TreeItem level={1}>
                    <TreeItemContent>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        height: '20px',
                        marginTop: '1px',
                        marginBottom: '1px'
                      }}>
                        <ColorPreview
                          style={{ backgroundColor: viewframeColor }}
                          colorName={getCurrentColorName()}
                        />
                        <StyledRangeInput
                          type="range"
                          value={initialColorIndex}
                          onChange={handleColorChange}
                          min={0}
                          max={colorOptions.length - 1}
                          step={1}
                        />
                      </div>
                    </TreeItemContent>
                  </TreeItem>
                )}
                
                {/* Animated Category - Using regular Win98Button without tooltip */}
                <TreeItem level={0}>
                  <Win98Button
                    isActive={activeViewframeCategory === 'animated'}
                    onClick={() => toggleCategory('animated')}
                  >
                    <img src={groupbox4} alt="Animated viewframe" style={{ width: '18px', height: '18px' }} />
                  </Win98Button>
                  <TreeItemContent>
                    Animated
                  </TreeItemContent>
                </TreeItem>
                
                {/* Animated Category Content */}
                {activeViewframeCategory === 'animated' && (
                  <TreeItem level={1}>
                    <TreeItemContent>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        marginTop: '1px',
                        marginBottom: '1px'
                      }}>
                        <RocketButton
                          isActive={isRocketActive}
                          onClick={toggleRocket}
                        >
                          <span role="img" aria-label="Rocket">🚀</span>
                        </RocketButton>
                        <Win98Select
                          value={activeScreensaver}
                          onChange={handleScreensaverChange}
                        >
                          {screensaverOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Win98Select>
                      </div>
                    </TreeItemContent>
                  </TreeItem>
                )}
              </div>
            </GroupBox>
          </WindowContent>
        )}
      </WindowContainer>
    </ControlsContainer>
  );
};

export default MonitorControlsPanel;