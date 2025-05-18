import React, { useContext } from "react";
import { ProgramContext } from "../../contexts";
import * as icons from "../../icons";
import ClippyAssistant from "./ClippyAssistant";

/**
 * Desktop icon component to launch the Office Assistant THIS DOESNT SEEM TO EVEN WORK
 */
const ClippyIcon = ({ position = { x: 150, y: 220 } }) => {
  // Get program context
  const programContext = useContext(ProgramContext);

  // Launch the Office Assistant
  const handleLaunchClipper = () => {
    // Find the appropriate method to launch
    if (programContext.onOpen) {
      programContext.onOpen({
        id: "clippy-assistant",
        title: "Office Assistant",
        component: ClippyAssistant,
        icon: icons.textchat32,
      });
    } else if (programContext.openProgram) {
      programContext.openProgram("ClippyAssistant");
    } else if (programContext.addProgram) {
      programContext.addProgram({
        id: "clippy-assistant",
        title: "Office Assistant",
        component: ClippyAssistant,
        icon: icons.textchat32,
      });
    } else {
      console.error("Cannot find method to launch Office Assistant");
    }
  };

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
        src={icons.textchat32}
        alt="Office Assistant"
        style={{
          width: "32px",
          height: "32px",
          marginBottom: "5px",
        }}
      />
      <div className="icon-label">Office Assistant</div>

      <style jsx>{`
        .desktop-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 5px;
          border: 1px solid transparent;
          background-color: transparent;
        }

        .desktop-icon:hover {
          background-color: rgba(0, 0, 255, 0.1);
          border: 1px dotted rgba(255, 255, 255, 0.5);
        }

        .icon-label {
          color: white;
          text-shadow: 1px 1px 1px black;
          font-family: "MS Sans Serif", Arial, sans-serif;
          font-size: 11px;
          margin-top: 4px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default ClippyIcon;
