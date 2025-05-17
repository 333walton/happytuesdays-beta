import React, { useContext } from "react";
import { ExplorerView, ExplorerIcon } from "packard-belle";
import { ProgramContext } from "../../contexts";
import * as icons from "../../icons";
import "./_styles.scss";

const DesktopView = () => {
  // Get all context values at once at the component level
  const programContext = useContext(ProgramContext);
  const { desktop, recycleEmpty = true, setRecycleBinFull } = programContext;

  const handleClick = (option) => {
    if (option.title === "Recycle") {
      setRecycleBinFull(recycleEmpty); // 🔄 Toggle full ⇄ empty
    }

    if (option.onClick) {
      option.onClick(option);
    }

    // Try to handle opening programs directly
    if (option.component === "Clippy" || option.title === "Office Assistant") {
      console.log("Clicked Office Assistant");
      // Try different methods to open the program
      tryOpenProgram(option);
    }
  };

  // Function to try different methods of opening a program
  const tryOpenProgram = (option) => {
    console.log("Available methods:", Object.keys(programContext));

    // If we have a desktop array, let's also log a sample item structure
    if (desktop && desktop.length > 0) {
      console.log("Sample desktop item:", desktop[0]);
    }

    // Try standard methods that might be available
    if (programContext.onOpen) {
      programContext.onOpen(option);
    } else if (programContext.openProgram) {
      programContext.openProgram(option.component);
    } else {
      console.log("Could not find method to open program");
    }
  };

  // Create a custom Office Assistant option
  const officeAssistantOption = {
    title: "Office Assistant",
    icon: icons.textchat32,
    component: "Clippy",
    id: "clippy-assistant",
  };

  return (
    <ExplorerView>
      {/* Render existing desktop icons */}
      {desktop.map((option) => {
        const isRecycle = option.title === "Recycle";
        const icon = isRecycle
          ? recycleEmpty
            ? icons.recycleempty32
            : icons.recyclefull32
          : option.icon;

        return (
          <ExplorerIcon
            key={option.id || option.title}
            {...option}
            icon={icon}
            onClick={() => handleClick(option)}
            className={`ExplorerIcon icon ${isRecycle ? "recycle-icon" : ""}`}
          />
        );
      })}

      {/* Add Office Assistant as standalone styled div */}
      <div
        style={{
          position: "absolute",
          left: "545px",
          top: "385px",
          width: "75px",
          textAlign: "center",
          cursor: "pointer",
          zIndex: 5,
        }}
        onClick={() => handleClick(officeAssistantOption)}
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
        <div
          style={{
            color: "white",
            textShadow: "1px 1px 2px black",
            fontSize: "11px",
          }}
        >
          Office Assistant
        </div>
      </div>
    </ExplorerView>
  );
};

export default DesktopView;
