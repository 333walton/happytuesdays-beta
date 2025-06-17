import React from "react";
import MonitorControls from "./MonitorControls";

/**
 * Component that renders the monitor frame and screen
 */
const MonitorFrame = ({
  showMonitor,
  isScreenPoweredOn,
  toggleScreenPower,
  handleCRTToggle,
  isCRTActive,
  showScreensaver,
  viewframeColor,
  zoomLevel,
  children,
  monitorFrameRef,
}) => {
  return (
    <div
      ref={monitorFrameRef}
      className="monitor-frame"
      style={{
        position: "relative",
        width: "800px",
        height: "700px",
      }}
    >
      {/* Desktop viewport / screen area */}
      <div
        className="monitor-screen"
        style={{
          position: "absolute",
          top: 109, // Fixed position to match original
          left: 78,
          width: 643,
          height: 482,
          backgroundColor: showScreensaver ? "transparent" : viewframeColor,
          zIndex: 98,
          overflow: "hidden",
          transition: "background-color 0.3s ease !important",
          borderRadius: "2px",
        }}
      >
        {/* This div allows us to properly pass mouse events to desktop content */}
        <div
          className="desktop-content-wrapper"
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            // Don't block desktop interaction when power is on
            pointerEvents: isScreenPoweredOn ? "auto" : "none",
          }}
        >
          {/* CRT effect for when zoomed in */}
          {isCRTActive && zoomLevel > 0 && (
            <div
              className="crt-effect"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)",
                backgroundSize: "100% 4px",
                zIndex: 200,
                pointerEvents: "none",
                opacity: 0.75, // Only rendered when zoomed
              }}
            />
          )}

          {/* Children will be rendered here (desktop content) */}
          {children}
        </div>

        {/* Black overlay when screen is powered off */}
        <div
          className={`black-overlay ${
            isScreenPoweredOn ? "black-overlay-on" : "black-overlay-off"
          }`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "black",
            zIndex: 1000, // High z-index to cover everything
            pointerEvents: "none",
            opacity: isScreenPoweredOn ? 0 : 1,
            transition: "opacity 0.4s ease",
            visibility: isScreenPoweredOn ? "hidden" : "visible",
            transitionDelay: isScreenPoweredOn ? "0s, 0.4s" : "0s",
            transitionProperty: "opacity, visibility",
          }}
        />
      </div>

      {/* Monitor image */}
      {showMonitor && (
        <img
          className="monitor-image"
          src="/static/monitor3.png"
          alt="Windows 98 Monitor"
          style={{
            position: "absolute",
            top: -116.5,
            left: -155,
            transform: "scale(0.766, 0.752)",
            transformOrigin: "center center",
            zIndex: 998,
            userSelect: "none", // Prevent selection
            pointerEvents: "none", // Don't interfere with mouse events
            borderRadius: "12px",
          }}
        />
      )}

      {/* Monitor controls */}
      {showMonitor && (
        <MonitorControls
          isScreenPoweredOn={isScreenPoweredOn}
          toggleScreenPower={toggleScreenPower}
          handleCRTToggle={handleCRTToggle}
          isCRTActive={isCRTActive}
        />
      )}
    </div>
  );
};

export default MonitorFrame;
