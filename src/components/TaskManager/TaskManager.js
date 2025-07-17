import React, { Component } from "react";
import { ProgramContext } from "../../contexts";
import { WindowProgram, SelectBox, ButtonForm } from "packard-belle";
import Window from "../tools/Window";
import * as icons from "../../icons";

import "./_task-manager.scss";
import buildMenu from "../../helpers/menuBuilder";

// Helper to check mobile (could use your SettingsContext/isMobile if available)
function isMobile() {
  if (typeof window !== "undefined") {
    return window.innerWidth <= 768;
  }
  return false;
}

class TaskManager extends Component {
  static contextType = ProgramContext;
  state = {
    selected: null,
  };

  onSelect = (selected) => this.setState({ selected });

  exit = () => {
    if (this.state.selected) {
      const prog = this.context.activePrograms.find(
        (p) => p.id === this.state.selected
      );
      this.context.onClose(prog, true);
    }
  };

  moveToTop = () => {
    if (this.state.selected) {
      this.context.moveToTop(this.state.selected);
    }
  };

  render() {
    const { context, props } = this;

    // Determine initialX based on screen size (left-shift by 100px on mobile)
    const initialX = isMobile() ? 100 : 200;
    const initialY = 150;

    return context.taskManager ? (
      <Window
        {...props}
        resizable={false}
        initialX={initialX}
        initialY={initialY}
        initialWidth={240}
        initialHeight={200}
        Component={WindowProgram}
        title="Cache Manager"
        icon={icons.floppy16}
        className="TaskManager Window--active"
        onHelp={() => {}} // @todo
        onClose={context.toggleTaskManager}
        menuOptions={buildMenu({
          ...props,
          onClose: context.toggleTaskManager,
        })}
      >
        {/* No more shifting or margin tricks! */}
        <SelectBox
          onClick={this.onSelect}
          options={context.openOrder.map((pid) => {
            const prog = context.activePrograms.find((p) => p.id === pid);
            return {
              title: prog.title,
              value: prog.id,
            };
          })}
          selected={[this.state.selected]}
        />
        <div className="TaskManager__buttons">
          <ButtonForm onClick={this.exit}>End Task</ButtonForm>
          <ButtonForm onClick={this.moveToTop}>Switch To</ButtonForm>
          <ButtonForm isDisabled>New Task</ButtonForm>
        </div>
      </Window>
    ) : null;
  }
}

export default TaskManager;
