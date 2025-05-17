import React, { useContext } from "react";
import { ProgramContext } from "../../contexts";
import * as icons from "../../icons";

// Desktop icon component to launch Clippy
const ClippyIcon = ({ position = { x: 150, y: 220 } }) => {
  // Extract the onOpen method from your ProgramContext
  const programContext = useContext(ProgramContext);

  // Debugging info to better understand what's available
  console.log("Program Context:", programContext);

  const handleLaunchClipper = () => {
    // Try different methods of opening based on what's in your context
    if (programContext.onOpen) {
      // If onOpen is available (likely for desktop icons)
      programContext.onOpen({
        id: "clippy-assistant",
        title: "Office Assistant",
        component: "Clippy", // Use string name that matches Applications.js export
        icon: icons.textchat32,
      });
    } else if (programContext.openProgram) {
      // Alternative method that might be available
      programContext.openProgram("Clippy");
    } else if (programContext.addProgram) {
      // If addProgram is the right method
      import("../ClippyAssistant").then((module) => {
        const ClippyAssistant = module.default;
        programContext.addProgram({
          id: "clippy-assistant",
          title: "Office Assistant",
          component: ClippyAssistant,
          icon: icons.textchat32,
        });
      });
    } else {
      // If all else fails, log what's available
      console.error(
        "No suitable method found to open Clippy. Available context:",
        programContext
      );
      alert("Cannot open Office Assistant - see console for details");
    }
  };

  // Use the textchat32 icon
  const iconSrc = icons.textchat32;

  return (
    <div
      className="desktop-icon"
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "75px",
        textAlign: "center",
        cursor: "pointer",
      }}
      onClick={handleLaunchClipper}
      onDoubleClick={handleLaunchClipper}
    >
      <img
        src={iconSrc}
        alt="Office Assistant"
        style={{
          width: "32px",
          height: "32px",
          marginBottom: "5px",
        }}
      />
      <div className="icon-label">Office Assistant</div>
    </div>
  );
};

export default ClippyIcon;
