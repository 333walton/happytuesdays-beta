import React from "react";
import { TaskBar as TaskBarComponent } from "packard-belle";
import { ProgramContext } from "../../contexts";

const TaskBar = () => (
  <ProgramContext.Consumer>
    {context => (
      <TaskBarComponent
        options={context.startMenu}
        quickLaunch={context.quickLaunch.map(item => ({
          ...item,
          isActive: item.active,
          dataActive: item.active ? "true" : "false"
        }))}
        openWindows={context.openOrder.map(windowId => {
          const { activePrograms } = context;
          const isActive = windowId === context.activeId;
          const onClick = isActive ? context.onMinimize : context.moveToTop;
          const { title, icon } = activePrograms[windowId];
          return {
            id: windowId,
            title,
            icon,
            isActive,
            onClick: () => onClick(windowId)
          };
        })}
      />
    )}
  </ProgramContext.Consumer>
);

export default TaskBar;
