import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import "./_styles.scss";

// Import React95 components
import { Tabs, Tab, TabBody, GroupBox, Button } from "react95";

// Import icons
import { groupbox1, groupbox2a, groupbox2b, groupbox2c } from "../../icons";

// Styled components (keeping existing styles...)
const StyledGroupBox = styled(GroupBox)`
  margin-top: 6px;
  margin-bottom: 8px;
  padding: 8px 6px 8px 8px;
  width: 100%;

  /* Fix font size for group box labels */
  & > legend {
    font-size: 11px !important;
    font-weight: bold;
    padding: 0 2px;
  }
`;

const AnimatedControlsContainer = styled.div`
  max-height: ${(props) => (props.visible ? "64px" : "0")};
  opacity: ${(props) => (props.visible ? "1" : "0")};
  overflow: visible;
  transform: translateY(${(props) => (props.visible ? "0" : "-10px")});
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out,
    transform 0.3s ease-out;
  margin-left: 20px;
  width: calc(100% - 45px);
`;

// Compact button row for icon buttons
const ButtonRow = styled.div`
  display: flex;
  gap: 4px;
  margin: 2px 0;
`;

// Custom styled buttons
const IconButton = styled(Button)`
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 20px;
    height: 20px;
  }

  &:focus,
  &:active {
    outline: none;
  }
`;

// View options container with transparent background
const ViewOption = styled.div`
  margin: 4px 0;
  display: flex;
  align-items: center;
  background-color: transparent;
`;

// Slider container with proper spacing - updated with alignment
const SliderContainer = styled.div`
  margin: 0px 0 8px 15px;
  width: calc(100% - 30px);
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
`;

// Color preview square that matches rocket icon size
const ColorPreview = styled.div`
  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
  margin-left: -15px;
  background-color: ${(props) => props.color || "#2F4F4F"};
  border: 1px solid black;
  border-right: 3px;
  border-top-color: #808080;
  border-left-color: #808080;
  border-right-color: white;
  border-bottom-color: white;
  box-shadow: inset 1px 1px 0 #404040, inset -1px -1px 0 #ffffff;
`;

// Custom slider component to fix the thumb styling and behavior
const CustomSlider = styled.input.attrs({
  type: "range",
})`
  -webkit-appearance: none;
  width: 100%;
  height: 20px;
  background-color: #c0c0c0;
  border: 2px inset #a0a0a0;
  margin: 0;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 20px;
    background-color: #c0c0c0;
    border: 2px outset #ffffff;
    border-right-color: #808080;
    border-bottom-color: #808080;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 14px;
    height: 20px;
    background-color: #c0c0c0;
    border: 2px outset #ffffff;
    border-right-color: #808080;
    border-bottom-color: #808080;
    cursor: pointer;
  }

  &:focus {
    outline: none;
  }
`;

// Styled tooltip for slider
const SliderTooltip = styled.div`
  position: absolute;
  top: -22px;
  transform: translateX(-50%);
  background-color: #ffffcc;
  border: 1px solid black;
  padding: 2px 4px;
  font-size: 10px;
  white-space: nowrap;
  z-index: 1000;
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const TooltipColorPreview = styled.div`
  width: 8px;
  height: 8px;
  border: 1px solid black;
  margin-right: 4px;
  background-color: ${(props) => props.color || "transparent"};
`;

const TooltipText = styled.span`
  font-family: sans-serif;
`;

// Styled custom checkbox component
const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 4px;
`;

const CheckboxBox = styled.div`
  width: 13px;
  height: 13px;
  background-color: white;
  border: 1px solid #000000;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset -1px -1px #ffffff, inset 1px 1px #808080;
`;

const CheckboxMark = styled.span`
  position: absolute;
  left: 50%;
  top: 43%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  line-height: 0.7;
  font-weight: bold;
  color: black;
  font-family: sans-serif;
`;

const CheckboxLabel = styled.span`
  margin-left: 5px;
  font-size: 12px;
  background-color: transparent;
  font-family: sans-serif;
`;

// Custom Checkbox Component with Win98 styling
const CustomCheckboxComponent = ({
  label,
  checked,
  onChange,
  onClick = null,
}) => (
  <CheckboxContainer
    onClick={(e) => {
      onChange();
      if (onClick) onClick(e);
    }}
  >
    <CheckboxBox>{checked && <CheckboxMark>✓</CheckboxMark>}</CheckboxBox>
    <CheckboxLabel>{label}</CheckboxLabel>
  </CheckboxContainer>
);

const CollapsibleContent = styled.div`
  max-height: ${(props) => (props.collapsed ? "0" : "500px")};
  overflow: visible;
  opacity: ${(props) => (props.collapsed ? "1" : "1")};
  transition: max-height 0.2s ease-out, opacity 0.2s ease-out;
  margin-bottom: 0;
  padding-bottom: 0;
`;

const TabsWrapper = styled.div`
  padding: 4px;
  background-color: #c0c0c0;
  margin-bottom: 0;

  /* Adjust tab styles */
  & > div > button {
    font-size: 11px !important;
  }

  /* Fix tab body padding */
  & > div:last-child {
    padding: 4px 4px 8px 4px; // Reduced top padding, increased bottom padding
    display: flex;
    flex-direction: column;
  }
`;

// Styled container for animated controls with proper dropdown positioning
const AnimatedControlsRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0;
  margin-left: -15px;
  position: relative;
`;

/**
 * Monitor Controls Panel Component
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
  setViewframeColor,
}) => {
  // State for window collapse and active viewframe
  const [isCollapsed, setIsCollapsed] = useState(false);

  // State for active tab - defaults to Info (tab 1)
  const [state, setState] = useState({
    activeTab: 1,
  });

  // State for tracking which category is active
  const [activeViewframeCategory, setActiveViewframeCategory] = useState(
    isScreensaverActive ? "animated" : "static"
  );

  // Reference to the root element and active color
  const rootRef = useRef(null);
  const activeColorRef = useRef("#2F4F4F");
  const lastColorRef = useRef("#2F4F4F");
  const colorClickCountRef = useRef(0);
  const colorClickTimerRef = useRef(null);

  // Refs for custom cursor
  const cursorRef = useRef(null);

  // State for tracking the current color name tooltip for the slider
  const [sliderTooltip, setSliderTooltip] = useState(null);

  // Initialize default screensaver if not set
  useEffect(() => {
    if (!activeScreensaver) {
      setActiveScreensaver("default");
    }
  }, [activeScreensaver, setActiveScreensaver]);

  // Initialize color and find root element
  useEffect(() => {
    if (!viewframeColor) {
      setViewframeColor("#2F4F4F");
    }

    activeColorRef.current = viewframeColor;
    lastColorRef.current = viewframeColor;
    rootRef.current = document.getElementById("root");
  }, [setViewframeColor, viewframeColor]);

  // Apply color to root element when active category is static
  useEffect(() => {
    if (rootRef.current && viewframeColor) {
      activeColorRef.current = viewframeColor;
      lastColorRef.current = viewframeColor;

      if (activeViewframeCategory === "static") {
        rootRef.current.style.backgroundColor = viewframeColor;
      }
    }
  }, [viewframeColor, activeViewframeCategory]);

  // Ensure color persists when monitor toggled
  useEffect(() => {
    if (rootRef.current && activeViewframeCategory === "static") {
      rootRef.current.style.backgroundColor = activeColorRef.current;
    }
  }, [showMonitor]);

  // Update the active category when screensaver state changes
  useEffect(() => {
    setActiveViewframeCategory(isScreensaverActive ? "animated" : "static");

    // If switching back to static, restore the last color
    if (!isScreensaverActive && rootRef.current) {
      rootRef.current.style.backgroundColor = lastColorRef.current;
    }
  }, [isScreensaverActive]);

  // Create and manage custom cursor for rocket mode
  useEffect(() => {
    // Create cursor element if it doesn't exist
    if (!cursorRef.current) {
      const cursor = document.createElement("div");
      cursor.id = "rocket-cursor";
      cursor.style.position = "fixed";
      cursor.style.pointerEvents = "none";
      cursor.style.borderRadius = "50%";
      cursor.style.width = "40px";
      cursor.style.height = "40px";
      cursor.style.border = "2px solid rgba(255, 255, 255, 0.4)";
      cursor.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
      cursor.style.transform = "translate(-50%, -50%)";
      cursor.style.zIndex = "10000";
      cursor.style.opacity = "0";
      cursor.style.transition = "opacity 0.2s ease";
      cursor.style.animation = "pulse 1.5s infinite";

      const hintText = document.createElement("div");
      hintText.id = "rocket-cursor-hint";
      hintText.style.position = "absolute";
      hintText.style.top = "45px";
      hintText.style.left = "50%";
      hintText.style.transform = "translateX(-50%)";
      hintText.style.color = "white";
      hintText.style.fontSize = "10px";
      hintText.style.whiteSpace = "nowrap";
      hintText.style.textShadow = "0 0 3px rgba(0,0,0,0.7)";
      hintText.textContent = "hold click";

      cursor.appendChild(hintText);
      document.body.appendChild(cursor);
      cursorRef.current = cursor;

      const style = document.createElement("style");
      style.textContent = `
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
        }
      `;
      document.head.appendChild(style);
    }

    // Add mouse event listeners when rocket mode is active
    if (isRocketActive) {
      // Set to Info tab when rocket mode is activated
      setState({ activeTab: 1 });

      // Add style to completely hide the default cursor except on the monitor controls panel
      const styleTag = document.createElement("style");
      styleTag.id = "rocket-cursor-style";
      styleTag.textContent = `
        html, body, div, span, p, a, canvas, img {
          cursor: none !important;
        }
        
        /* Explicit exception for the controls container */
        .monitor-controls-container {
          cursor: default !important;
        }
        
        .monitor-controls-container * {
          cursor: default !important;
        }
        
        /* The custom cursor will be hidden within the controls container */
        .monitor-controls-container:hover #rocket-cursor {
          display: none !important;
        }
      `;
      document.head.appendChild(styleTag);

      const handleMouseDown = () => {
        if (cursorRef.current) {
          cursorRef.current.style.opacity = "1";
          cursorRef.current.style.backgroundColor = "rgba(255, 255, 255, 0.3)";

          // Hide the hint text when clicking - access element directly
          const hintElem = cursorRef.current.querySelector(
            "#rocket-cursor-hint"
          );
          if (hintElem) {
            hintElem.style.display = "none";
          }
        }
      };

      const handleMouseUp = () => {
        if (cursorRef.current) {
          cursorRef.current.style.opacity = "0.5";
          cursorRef.current.style.backgroundColor = "rgba(255, 255, 255, 0.1)";

          // Show the hint text again when releasing click - access element directly
          const hintElem = cursorRef.current.querySelector(
            "#rocket-cursor-hint"
          );
          if (hintElem) {
            hintElem.style.display = "block";
          }
        }
      };

      const handleMouseMove = (e) => {
        if (cursorRef.current) {
          // Get the element under the cursor
          const elemUnderCursor = document.elementFromPoint(
            e.clientX,
            e.clientY
          );

          // Check if the cursor is over the monitor controls panel
          const isOverControlPanel =
            elemUnderCursor &&
            elemUnderCursor.closest(".monitor-controls-container") !== null;

          // Only show the custom cursor if NOT over the control panel
          if (!isOverControlPanel) {
            cursorRef.current.style.left = `${e.clientX}px`;
            cursorRef.current.style.top = `${e.clientY}px`;
            cursorRef.current.style.opacity = "0.5";
            cursorRef.current.style.display = "block";
          } else {
            cursorRef.current.style.display = "none";
          }
        }
      };

      window.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("mousemove", handleMouseMove);

        // Remove the style tag when component unmounts
        const styleElement = document.getElementById("rocket-cursor-style");
        if (styleElement) {
          styleElement.remove();
        }
      };
    } else {
      // Remove the style tag when rocket mode is off
      const styleElement = document.getElementById("rocket-cursor-style");
      if (styleElement) {
        styleElement.remove();
      }

      // Hide cursor when rocket mode is deactivated
      if (cursorRef.current) {
        cursorRef.current.style.opacity = "0";
        cursorRef.current.style.display = "none";
      }
    }
  }, [isRocketActive]);

  // Color options array
  const colorOptions = [
    "#1A1A1A",
    "#2F2F2F",
    "#2F4F4F",
    "#3C3F41",
    "#4B3B47",
    "#4B5320",
    "#4D4D4D",
    "#5F5F5F",
    "#556B2F",
    "#5C5845",
    "#5C5C8A",
    "#5D6A75",
    "#666666",
    "#696969",
    "#6B4226",
    "#6E7B8B",
    "#708090",
    "#7A6F9B",
    "#778899",
    "#7F8C8D",
    "#8A795D",
    "#8B8589",
    "#A0522D",
    "#C0C0C0",
    "#CDD9C4",
  ];

  // Color names for tooltip
  const colorNames = [
    "Charcoal",
    "Graphite",
    "Dark Slate",
    "Eclipse",
    "Raisin",
    "Army Green",
    "Dim Gray",
    "Medium Gray",
    "Olive",
    "Dark Khaki",
    "Moody Violet",
    "Win98 Steel",
    "System Gray",
    "Dark Gray",
    "Saddle Brown",
    "Cadet Slate",
    "Slate Gray",
    "Retro Lavender",
    "Light Slate",
    "Blue Gray",
    "Dusty Olive",
    "Control Gray",
    "Sienna",
    "Silver",
    "Pastel Olive",
  ];

  // Find the index of the current color
  const currentColorIndex = colorOptions.findIndex(
    (color) => color === viewframeColor
  );
  const initialColorIndex = currentColorIndex !== -1 ? currentColorIndex : 2;

  // ENHANCED ZOOM LEVEL HANDLER - THIS IS THE KEY FIX
  // FIXED ZOOM LEVEL HANDLER - Use centralized positioning system
  const handleZoomLevelChange = (newZoomLevel) => {
    console.log(
      `📏 MonitorControlsPanel: Zoom button clicked: ${zoomLevel} → ${newZoomLevel}`
    );

    // 1. Update the zoom level state
    setZoomLevel(newZoomLevel);

    // 2. Update the data-zoom attribute on body
    document.body.setAttribute("data-zoom", newZoomLevel.toString());

    // 3. Get elements
    const clippyElement = document.querySelector(".clippy");
    const overlayElement = document.getElementById("clippy-clickable-overlay");

    if (!clippyElement) {
      console.warn("⚠️ Clippy element not found for zoom change");
      return;
    }

    // 4. USE CENTRALIZED POSITIONING SYSTEM (key fix)
    if (window.ClippyPositioning) {
      console.log(
        `⚡ Using centralized positioning for zoom level ${newZoomLevel}`
      );

      // Force immediate zoom positioning using the centralized system
      const positioned = window.ClippyPositioning.forceImmediateZoomPositioning(
        clippyElement,
        newZoomLevel
      );

      if (positioned) {
        // Update overlay using centralized system
        if (overlayElement) {
          window.ClippyPositioning.positionOverlay(
            overlayElement,
            clippyElement
          );
        }
        console.log(
          `✅ Centralized zoom positioning completed for level ${newZoomLevel}`
        );
      } else {
        console.warn("⚠️ Centralized positioning failed, trying fallback");

        // Fallback: Use the combined positioning method
        const fallbackPositioned =
          window.ClippyPositioning.positionClippyAndOverlay(
            clippyElement,
            overlayElement,
            null
          );

        console.log(
          `🔄 Fallback positioning: ${
            fallbackPositioned ? "success" : "failed"
          }`
        );
      }
    } else {
      console.error("❌ ClippyPositioning not available");
      return;
    }

    // 5. Dispatch event for other components
    window.dispatchEvent(
      new CustomEvent("zoomLevelChanged", {
        detail: {
          oldZoomLevel: zoomLevel,
          newZoomLevel: newZoomLevel,
          source: "monitor-controls-centralized",
          immediate: true,
        },
      })
    );

    console.log(`✅ Zoom change completed using centralized system`);
  };

  // Handle color slider change
  const handleColorChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setViewframeColor(colorOptions[value]);
  };

  // Handle slider mouse movement for tooltip display
  const handleSliderMove = (e) => {
    const slider = e.target;
    const rect = slider.getBoundingClientRect();
    const position = e.clientX - rect.left;
    const percentage = position / rect.width;
    const index = Math.min(
      Math.max(Math.round(percentage * (colorOptions.length - 1)), 0),
      colorOptions.length - 1
    );

    setSliderTooltip({
      name: colorNames[index],
      color: colorOptions[index],
      left: `${percentage * 100}%`,
    });
  };

  // Clear slider tooltip when mouse leaves
  const handleSliderLeave = () => {
    setSliderTooltip(null);
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
      setViewframeColor("#2F4F4F"); // Reset to dark-slate-gray
      colorClickCountRef.current = 0;
    } else {
      // Set timer to reset click count after 500ms
      colorClickTimerRef.current = setTimeout(() => {
        colorClickCountRef.current = 0;
      }, 500);
    }
  };

  // Toggle the category - modified to handle exclusive checkbox behavior
  const toggleCategory = (category) => {
    // Only proceed if changing category
    if (category !== activeViewframeCategory) {
      // If we're switching from rocket mode to static, force monitor to show
      if (isRocketActive && category === "static") {
        // Call toggleRocket first to disable rocket mode
        toggleRocket();
      }

      setActiveViewframeCategory(category);

      // If switching to animated, enable screensaver
      if (category === "animated" && !isScreensaverActive) {
        // Save the current color before switching
        lastColorRef.current = viewframeColor;
        toggleScreensaver();
      }
      // If switching to static, disable screensaver
      else if (category === "static" && isScreensaverActive) {
        toggleScreensaver();

        // Restore the color when switching back to static
        if (rootRef.current) {
          rootRef.current.style.backgroundColor = lastColorRef.current;
        }
      }
    } else {
      // If clicking the same category button again, allow toggling off animated
      if (category === "animated" && isScreensaverActive) {
        setActiveViewframeCategory("static");
        toggleScreensaver();

        // Restore the color when switching back to static
        if (rootRef.current) {
          rootRef.current.style.backgroundColor = lastColorRef.current;
        }
      }
    }
  };

  // Handle tab change
  const handleChange = (value) => {
    setState({ activeTab: value });
  };

  // Extract activeTab from state
  const { activeTab } = state;

  return (
    <div
      className="monitor-controls-container"
      style={{
        position: "fixed",
        top: "5px",
        left: "5px",
        width: "240px",
        border: "2px outset #c0c0c0",
        backgroundColor: "#c0c0c0",
        zIndex: 9999,
      }}
    >
      {/* Header Bar - Entire bar is clickable for collapse */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          background: "navy",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          padding: "0px 3px",
          fontSize: "11px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        <span>Monitor Controls</span>
        <button
          onClick={(e) => {
            // Stop propagation to prevent double toggling
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
          style={{
            width: "16px",
            height: "16px",
            fontSize: "10px",
            backgroundColor: "#c0c0c0",
            border: "0px solid",
            borderTopColor: "#ffffff",
            borderLeftColor: "#ffffff",
            borderRightColor: "#404040",
            borderBottomColor: "#404040",
            padding: 0,
            marginLeft: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            outlineColor: "transparent",
          }}
        >
          {isCollapsed ? "▼" : "▲"}
        </button>
      </div>

      {/* Content Area - Conditionally rendered */}
      {!isCollapsed && (
        <div>
          <style>
            {`
            /* This targets the React95 tab components */
            .react95__tab:focus, 
            .react95__tab:active, 
            .react95__tab[aria-selected="true"] {
              outline: 0.5px dotted #c0c0c0 !important;
              outline-offset: -1px !important;
              box-shadow: none !important;
            }
          `}
          </style>

          <TabsWrapper>
            <Tabs
              value={activeTab}
              onChange={handleChange}
              style={{
                height: 22,
                top: 0,
                left: 0,
                padding: 0,
                outlineColor: "transparent",
                overflow: "visible",
              }}
            >
              {/* Tab 0 */}
              <Tab
                value={0}
                style={{
                  height: 22,
                  width: 75,
                  top: 0,
                  padding: 0,
                  overflow: "visible",
                  fontSize: "11px",
                  fontWeight: activeTab === 0 ? "bold" : "normal",
                  outlineColor: "transparent",
                }}
              >
                Controls
              </Tab>
              {/* Tab 1 */}
              <Tab
                value={1}
                style={{
                  height: 22,
                  width: 65,
                  top: 0,
                  left: 0,
                  overflow: "visible",
                  fontSize: "11px",
                  fontWeight: activeTab === 1 ? "bold" : "normal",
                  outlineColor: "transparent",
                }}
              >
                Info
              </Tab>
              {/* Tab 2 */}
              <Tab
                value={2}
                style={{
                  height: 22,
                  width: 65,
                  top: 0,
                  left: 0,
                  overflow: "visible",
                  fontSize: "11px",
                  fontWeight: activeTab === 2 ? "bold" : "normal",
                  outlineColor: "transparent",
                }}
              >
                More
              </Tab>
            </Tabs>

            <TabBody>
              {activeTab === 0 && (
                <>
                  {/* Monitor Mode */}
                  <StyledGroupBox label="Monitor Mode">
                    <ButtonRow>
                      <IconButton
                        onClick={toggleMonitorView}
                        active={!showMonitor}
                      >
                        {!showMonitor ? (
                          <div
                            style={{
                              width: "16px",
                              height: "16px",
                              backgroundColor: "black",
                            }}
                          ></div>
                        ) : (
                          <img src={groupbox1} alt="Monitor mode" />
                        )}
                      </IconButton>
                    </ButtonRow>
                  </StyledGroupBox>

                  {/* Zoom Options - UPDATED TO USE NEW HANDLER */}
                  <StyledGroupBox label="Zoom Options">
                    <ButtonRow>
                      <IconButton
                        onClick={() => handleZoomLevelChange(0)}
                        active={zoomLevel === 0}
                      >
                        <img src={groupbox2a} alt="Default zoom" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleZoomLevelChange(1)}
                        active={zoomLevel === 1}
                      >
                        <img src={groupbox2b} alt="110% zoom" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleZoomLevelChange(2)}
                        active={zoomLevel === 2}
                      >
                        <img src={groupbox2c} alt="125% zoom" />
                      </IconButton>
                    </ButtonRow>
                  </StyledGroupBox>

                  {/* Viewframe Options */}
                  <StyledGroupBox label="Viewframe Options">
                    {/* Static Option with custom checkbox */}
                    <ViewOption>
                      <CustomCheckboxComponent
                        label="Static"
                        checked={activeViewframeCategory === "static"}
                        onChange={() => toggleCategory("static")}
                        onClick={handleStaticColorClick}
                      />
                    </ViewOption>

                    {/* Slider for Static Option */}
                    {activeViewframeCategory === "static" && (
                      <SliderContainer>
                        <ColorPreview color={viewframeColor} />
                        <CustomSlider
                          value={initialColorIndex}
                          onChange={handleColorChange}
                          onMouseMove={handleSliderMove}
                          onMouseLeave={handleSliderLeave}
                          min={0}
                          max={colorOptions.length - 1}
                          step={1}
                        />

                        {/* Tooltip for slider */}
                        {sliderTooltip && (
                          <SliderTooltip style={{ left: sliderTooltip.left }}>
                            <TooltipColorPreview color={sliderTooltip.color} />
                            <TooltipText>{sliderTooltip.name}</TooltipText>
                          </SliderTooltip>
                        )}
                      </SliderContainer>
                    )}

                    {/* Animated Option with custom checkbox */}
                    <ViewOption style={{ marginTop: "6px" }}>
                      <CustomCheckboxComponent
                        label="Animated"
                        checked={activeViewframeCategory === "animated"}
                        onChange={() => toggleCategory("animated")}
                      />
                    </ViewOption>

                    {/* Animation Controls - Using the animated container */}
                    <AnimatedControlsContainer
                      visible={activeViewframeCategory === "animated"}
                    >
                      <AnimatedControlsRow>
                        {/* Adjusted rocket button to match ColorPreview size and position */}
                        <IconButton
                          onClick={toggleRocket}
                          active={isRocketActive}
                          style={{
                            opacity: 1,
                            cursor: "pointer",
                            outlineColor: "transparent",
                            width: "24px",
                            height: "24px",
                            minWidth: "24px",
                            minHeight: "24px",
                            padding: 0,
                            marginLeft: "-6px",
                            marginRight: "9px",
                            marginBottom: "4px",
                          }}
                        >
                          <span
                            role="img"
                            aria-label="Rocket"
                            style={{ fontSize: "12px" }}
                          >
                            🚀
                          </span>
                        </IconButton>

                        {/* Transparent select overlay implementation - aligned to match slider */}
                        <div
                          style={{
                            position: "relative",
                            width: "calc(100% - 14px)",
                            marginBottom: "4px",
                            marginLeft: 0,
                          }}
                          className="win98-select-container"
                        >
                          {/* Add styles for button-active state */}
                          <style>
                            {`
                              .win98-button-visual.active {
                                border-top-color: #808080 !important;
                                border-left-color: #808080 !important;
                                border-right-color: #ffffff !important;
                                border-bottom-color: #ffffff !important;
                                background-color: #b0b0b0 !important;
                                transform: translateY(1px);
                             }
                           `}
                          </style>

                          {/* Hidden native select - this gives us native functionality */}
                          <select
                            value={activeScreensaver}
                            onChange={(e) => {
                              if (!isRocketActive) {
                                console.log("Selected:", e.target.value);
                                setActiveScreensaver(e.target.value);
                              }
                            }}
                            onMouseDown={(e) => {
                              // Find coordinates relative to select element
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              const x = e.clientX - rect.left;

                              // If click is in the button area (right side)
                              if (x > rect.width - 20) {
                                // Find the visual button element and add active class
                                const buttonVisual =
                                  e.currentTarget.parentNode.querySelector(
                                    ".win98-button-visual"
                                  );
                                if (buttonVisual) {
                                  buttonVisual.classList.add("active");
                                }
                              }
                            }}
                            onMouseUp={() => {
                              // Remove active class from button visual on mouse up
                              const buttonVisual = document.querySelector(
                                ".win98-button-visual"
                              );
                              if (buttonVisual) {
                                buttonVisual.classList.remove("active");
                              }
                            }}
                            onMouseLeave={() => {
                              // Remove active class from button visual if mouse leaves
                              const buttonVisual = document.querySelector(
                                ".win98-button-visual"
                              );
                              if (buttonVisual) {
                                buttonVisual.classList.remove("active");
                              }
                            }}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              opacity: 0,
                              cursor: isRocketActive ? "not-allowed" : "default",
                              zIndex: 2, // Higher than the visual elements
                            }}
                            disabled={isRocketActive}
                          >
                            <option value="default">Space</option>
                            <option value="bouncyballs">Bouncy Balls</option>
                            <option value="flowerbox">FlowerBox</option>
                            <option value="pipes">Pipes</option>
                          </select>

                          {/* Visual display (non-functional, just for appearance) */}
                          <div
                            style={{
                              width: "100%",
                              height: 24,
                              backgroundColor: "#ffffff",
                              border: "1px solid",
                              borderTopColor: "#999999",
                              borderLeftColor: "#999999",
                              borderRightColor: "#ffffff",
                              borderBottomColor: "#ffffff",
                              boxShadow: "inset 1px 1px 0px rgba(0, 0, 0, 0.2)",
                              fontSize: 11,
                              padding: "2px 20px 2px 3px",
                              fontFamily:
                                '"ms_sans_serif", "ms sans serif", "Microsoft Sans Serif", sans-serif',
                              color:
                                activeScreensaver === "default" && isRocketActive
                                  ? "#888888"
                                  : "#000000",
                              display: "flex",
                              alignItems: "center",
                              pointerEvents: "none", // Don't capture pointer events
                            }}
                          >
                            {/* Display the current value */}
                            {activeScreensaver === "default"
                              ? "Space"
                              : activeScreensaver === "bouncyballs"
                              ? "Bouncy Balls"
                              : activeScreensaver === "flowerbox"
                              ? "FlowerBox"
                              : "Pipes"}
                          </div>

                          {/* Button - purely visual, clicks pass through to select */}
                          <div
                            className="win98-button-visual"
                            style={{
                              position: "absolute",
                              width: 17,
                              height: 21.5,
                              top: 1,
                              right: 1,
                              backgroundColor: "#c0c0c0",
                              border: "1px solid",
                              borderTopColor: "#ffffff",
                              borderLeftColor: "#ffffff",
                              borderRightColor: "#000000",
                              borderBottomColor: "#000000",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: 0,
                              pointerEvents: "none", // Don't capture pointer events
                              transition: "background-color 0.05s ease", // Smooth transition for pressed state
                            }}
                          >
                            <div
                              style={{
                                width: 0,
                                height: 0,
                                borderLeft: "3px solid transparent",
                                borderRight: "3px solid transparent",
                                borderTop: "3px solid black",
                                marginTop: 1,
                                pointerEvents: "none",
                              }}
                            />
                          </div>
                        </div>
                      </AnimatedControlsRow>
                    </AnimatedControlsContainer>
                  </StyledGroupBox>
                </>
              )}

              {activeTab === 1 && (
                <div
                  style={{
                    textAlign: "center", // Center content vertically
                    padding: "2px 0px", // Reduced top/bottom padding
                    fontFamily: "monospace",
                    //minHeight: '80px',  // Ensure consistent height
                    //display: 'flex',
                  }}
                >
                  {isRocketActive ? (
                    <p
                      style={{
                        fontFamily: "monospace",
                        fontSize: "13px",
                        //whiteSpace: 'nowrap',
                        margin: "7px 0", // Consistent margin
                      }}
                    >
                      {`> turbo mode initialized... `}
                      <span className="blinker">|</span>
                    </p>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "3px 0",
                        fontFamily: "monospace",
                      }}
                    >
                      {/* First line */}
                      <div
                        style={{
                          fontSize: "11px",
                          lineHeight: "16px",
                          height: "16px",
                        }}
                      >
                        <span
                          style={{
                            color: "black",
                            fontFamily: "monospace",
                            fontSize: "11px",
                          }}
                        >
                          <span style={{ fontWeight: "bold" }}>Hydra98</span> is a
                          Windows 98 desktop
                        </span>
                      </div>

                      {/* Second line */}
                      <div
                        style={{
                          fontSize: "11px",
                          lineHeight: "16px",
                          height: "15px",
                          marginBottom: "8px", // Preserve your original bottom margin
                        }}
                      >
                        <span
                          style={{
                            color: "black",
                            fontFamily: "monospace",
                            fontSize: "11px",
                          }}
                        >
                          emulator for the web.
                        </span>
                      </div>

                      {/* Third line */}
                      <div
                        style={{
                          fontSize: "11px",
                          lineHeight: "16px",
                          height: "15px",
                          //marginBottom: '2px'  // Preserve your original bottom margin
                        }}
                      >
                        <span
                          style={{
                            color: "black",
                            fontFamily: "monospace",
                            fontSize: "11px",
                          }}
                        >
                          Use the{" "}
                          <span style={{ fontWeight: "bold" }}>controls</span> to
                          customize your
                        </span>
                      </div>
                      {/* Fourth line */}
                      <div
                        style={{
                          fontSize: "11px",
                          lineHeight: "16px",
                          height: "15px",
                          //marginBottom: '0px'  // Preserve your original bottom margin
                        }}
                      >
                        <span
                          style={{
                            color: "black",
                            fontFamily: "monospace",
                            fontSize: "11px",
                          }}
                        >
                          experience.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 2 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2px 0",
                    fontFamily: "monospace",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      lineHeight: "20px",
                      height: "20px",
                    }}
                  >
                    <span
                      style={{
                        color: "black",
                        fontFamily: "monospace",
                        fontSize: "11px",
                      }}
                    >
                      Version 0.9.1 beta
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      lineHeight: "20px",
                      height: "20px",
                    }}
                  >
                    <span
                      style={{
                        color: "black",
                        fontFamily: "monospace",
                        fontSize: "11px",
                      }}
                    >
                      Built with ReactJS and ❤️
                    </span>
                  </div>
                </div>
              )}
            </TabBody>
          </TabsWrapper>
        </div>
      )}
    </div>
  );
};

export default MonitorControlsPanel;
