import React, { useContext } from "react";
import { ProgramContext } from "../../contexts";
import ClippyAssistant from "./ClippyAssistant";
import * as icons from "../../icons"; // Import icons

// This component is responsible for registering Clippy as a program
// and providing a way to launch it

const ClippyManager = () => {
  const { programs, addProgram, closeProgram } = useContext(ProgramContext);

  // Find Clippy program in the list if it exists - with proper check
  const clippyProgram = Array.isArray(programs)
    ? programs.find((p) => p.id === "clippy-assistant")
    : null;

  // Launch Clippy if not already running
  const launchClipper = () => {
    if (!clippyProgram) {
      addProgram({
        id: "clippy-assistant",
        title: "Office Assistant",
        component: ClippyAssistant,
        // Use the textchat32 icon
        icon: icons.textchat32,
      });
    }
  };

  // Close Clippy
  const closeClipper = () => {
    if (clippyProgram) {
      closeProgram(clippyProgram.id);
    }
  };

  return { launchClipper, closeClipper, isRunning: !!clippyProgram };
};

export default ClippyManager;
