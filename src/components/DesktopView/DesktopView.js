import React, { useContext } from "react";
import { ExplorerView, ExplorerIcon } from "packard-belle";
import { ProgramContext } from "../../contexts";
import * as icons from "../../icons";
import './_styles.scss';

const DesktopView = () => {
  const {
    desktop,
    recycleEmpty = true,
    setRecycleBinFull
  } = useContext(ProgramContext);

  const handleClick = (option) => {
    if (option.title === "Recycle") {
      setRecycleBinFull(recycleEmpty); // 🔄 Toggle full ⇄ empty
    }

    if (option.onClick) {
      option.onClick(option);
    }
  };

  return (
    <ExplorerView>
      {desktop.map(option => {
        const isRecycle = option.title === "Recycle";
        const icon = isRecycle
          ? recycleEmpty ? icons.recycleempty32 : icons.recyclefull32
          : option.icon;

        return (
          <ExplorerIcon
            key={option.id || option.title}
            {...option}
            icon={icon}
            onClick={() => handleClick(option)}
            className={`ExplorerIcon icon ${isRecycle ? 'recycle-icon' : ''}`}
          />
        );
      })}
    </ExplorerView>
  );
};

export default DesktopView;