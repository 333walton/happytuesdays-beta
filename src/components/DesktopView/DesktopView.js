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
    // Example: highlight/select icons, not open Feeds.
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

  const handleFeedsDoubleClick = (option) => {
    navigate("/feeds");
  };

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
            onDoubleClick={
              option.title === "Feeds"
                ? () => handleFeedsDoubleClick(option)
                : undefined
            }
            className={`ExplorerIcon icon ${isRecycle ? "recycle-icon" : ""}`}
          />
        );
      })}
    </ExplorerView>
  );
};

export default DesktopView;
