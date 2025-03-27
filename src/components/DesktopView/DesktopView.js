import React, { useState } from "react";
import { ExplorerView, ExplorerIcon } from "packard-belle";
import { ProgramContext } from "../../contexts";
import * as icons from "../../icons";

const DesktopView = () => {
  const [isRecycleEmpty, setRecycleEmpty] = useState(true);

  const handleClick = (option) => {
    if (option.title === "Recycle") {
      setRecycleEmpty(prev => !prev);
    }
    if (option.onClick) {
      option.onClick(option);
    }
  };

  return (
    <ProgramContext.Consumer>
      {context => (
        <ExplorerView>
          {context.desktop.map(option => {
            const icon = option.title === "Recycle"
              ? isRecycleEmpty ? icons.recycleempty32 : icons.recyclefull32
              : option.icon;

            return (
              <ExplorerIcon
                key={option.id || option.title}
                {...option}
                icon={icon}
                onClick={() => handleClick(option)}
              />
            );
          })}
        </ExplorerView>
      )}
    </ProgramContext.Consumer>
  );
};

export default DesktopView;
