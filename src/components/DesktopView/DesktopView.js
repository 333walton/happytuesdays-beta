import React, { useContext } from "react";
import { ExplorerView, ExplorerIcon } from "packard-belle";
import { ProgramContext } from "../../contexts";
import * as icons from "../../icons";
import "./_styles.scss";
import { useNavigate } from "react-router-dom";

const DesktopView = () => {
  const programContext = useContext(ProgramContext);
  const { desktop, recycleEmpty = true, setRecycleBinFull } = programContext;
  const navigate = useNavigate();

  const handleClick = (option) => {
    if (option.title === "Feeds") {
      navigate("/feeds");
      return; // Prevents duplicate window opening/actions for Feeds icon
    }
    if (option.title === "Recycle") {
      setRecycleBinFull(recycleEmpty);
    }
    if (option.onClick) {
      option.onClick(option);
    }
    if (option.component === "Clippy" || option.title === "Office Assistant") {
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
  //const officeAssistantOption = {
  //title: "Office Assistant",
  //icon: icons.textchat32,
  //component: "Clippy",
  //id: "clippy-assistant",
  //};

  return (
    <ExplorerView>
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

      {/* 
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
*/}
    </ExplorerView>
  );
};

export default DesktopView;
