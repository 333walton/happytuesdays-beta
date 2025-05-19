import React from "react";
import MonitorButton from "./MonitorButton";

/**
 * Component to render the monitor controls (power button, CRT toggle, etc.)
 */
const MonitorControls = ({
  isScreenPoweredOn,
  toggleScreenPower,
  handleCRTToggle,
  isCRTActive,
}) => {
  return (
    <>
      {/* Monitor controls container */}
      <div
        className="monitor-controls"
        style={{
          position: "absolute",
          bottom: 32,
          right: 160,
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          pointerEvents: "auto",
        }}
      >
        {/* Power indicator light */}
        <div
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            left: -22,
            bottom: -5,
            borderRadius: "50%",
            backgroundColor: isScreenPoweredOn ? "#00ff00" : "#333333",
            boxShadow: isScreenPoweredOn
              ? "0 0 4px rgba(0, 255, 0, 0.8)"
              : "0 0 2px rgba(0, 0, 0, 0.5)",
            margin: "0 5px",
            transition: "background-color 0.2s ease, box-shadow 0.3s ease",
          }}
        />
      </div>

      {/* CRT Effect toggle button */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: 680,
          zIndex: 999,
          pointerEvents: "auto",
        }}
      >
        <MonitorButton
          onClick={handleCRTToggle}
          isActive={isCRTActive}
          style={{
            width: "40px",
            height: "17px",
            backgroundColor: isCRTActive ? "#d5cca1" : "#d5cca1",
            borderRadius: "0px",
            border: isCRTActive ? "inset 1px #888888" : "outset 1px #ffffff",
            boxShadow: isCRTActive
              ? "inset 1px 1px 1.5px rgba(0,0,0,0.5)"
              : "none",
            transform: isCRTActive
              ? "inset 0 1px 1.5px rgba(255, 255, 255, 0.3), 0 1px 1.5px rgba(0, 0, 0, 0.2)"
              : "inset 0 1px 1px rgba(0, 0, 0, 0.15)",
            color: isCRTActive ? "#5c5845" : "#fff7e6",
            transition: "all 0.17s ease-in-out",
            fontSize: "9px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer", // Ensure cursor is always pointer
          }}
        ></MonitorButton>
      </div>

      {/* Power button - positioned separately */}
      <div
        style={{
          position: "absolute",
          bottom: 1,
          right: 100,
          zIndex: 999,
          pointerEvents: "auto",
          transition:
            "background-color 0.4s ease, box-shadow 0.3s ease, border 0.3s ease, transform 0.3s ease, color 0.3s ease",
        }}
      >
        <MonitorButton
          onClick={toggleScreenPower}
          style={{
            width: "51px",
            height: "27px",
            backgroundColor: isScreenPoweredOn ? "#d5cca1" : "#d5cca1",
            borderRadius: "0px",
            border: isScreenPoweredOn
              ? "inset 1px #888888"
              : "outset 1px #ffffff",
            boxShadow: isScreenPoweredOn
              ? "inset 1px 1px 1.5px rgba(0,0,0,0.5)"
              : "none",
            transform: !isScreenPoweredOn
              ? "inset 0 1px 1.5px rgba(255, 255, 255, 0.3), 0 1px 1.5px rgba(0, 0, 0, 0.2)"
              : "inset 0 1px 1px rgba(0, 0, 0, 0.15)",
            color: isScreenPoweredOn ? "#5c5845" : "#fff7e6",
            transition: "background-color 0.4s ease, box-shadow 0.3s ease",
          }}
        >
          {isScreenPoweredOn ? "" : ""}
        </MonitorButton>
      </div>
    </>
  );
};

export default MonitorControls;
