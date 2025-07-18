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

  // Single click does nothing (or highlight/select if you want)
  const handleClick = (option) => {
    // Optional: handle selection/focus here, but do NOT open apps/windows
    if (option.title === "Recycle") {
      setRecycleBinFull(recycleEmpty);
    }
    if (option.onClick) {
      option.onClick(option);
    }
    // Intentionally do NOT open any windows/programs here!
  };

  // Double-click: always opens the window/program
  const handleDoubleClick = (option) => {
    if (option.title === "Feeds") {
      navigate("/feeds");
    }
    tryOpenProgram(option);
  };

  // Typical "open" logic
  const tryOpenProgram = (option) => {
    if (programContext.onOpen) {
      programContext.onOpen(option);
    } else if (programContext.openProgram) {
      programContext.openProgram(option.component);
    }
  };

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
            onDoubleClick={() => handleDoubleClick(option)}
            className={`ExplorerIcon icon ${isRecycle ? "recycle-icon" : ""}`}
          />
        );
      })}
    </ExplorerView>
  );
};

export default DesktopView;
