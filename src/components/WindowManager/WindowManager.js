import React, { Component } from "react";
import * as Applications from "../Applications";
import { ProgramContext } from "../../contexts";
import * as icons from "../../icons";

class WindowManager extends Component {
  static contextType = ProgramContext;

  state = {
    doomOpened: false,
    burnOpened: false,
  };

  componentDidMount() {
    this.checkSpecialURLs();
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.checkSpecialURLs();
    }
  }

  checkSpecialURLs() {
    const pathname = window.location.pathname;

    // Check for Doom URL
    if (pathname === "/doom" && !this.state.doomOpened) {
      const hasDoom = Object.values(this.context.activePrograms).some(
        (prog) => prog.component === "Doom"
      );
      if (!hasDoom && this.context.onOpen) {
        this.context.onOpen({
          component: "Doom",
          title: "DOOM",
          icon: icons.doom32,
        });
        this.setState({ doomOpened: true });
      }
    } else if (pathname !== "/doom") {
      this.setState({ doomOpened: false });
    }

    // Check for Burn URL
    if (pathname === "/burn" && !this.state.burnOpened) {
      const hasBurn = Object.values(this.context.activePrograms).some(
        (prog) => prog.component === "Burn"
      );
      if (!hasBurn && this.context.onOpen) {
        this.context.onOpen({
          component: "Burn",
          title: "Burn",
          icon: icons.burn32,
        });
        this.setState({ burnOpened: true });
      }
    } else if (pathname !== "/burn") {
      this.setState({ burnOpened: false });
    }
  }

  handleProgramClose = (progId, progProps) => {
    if (this.context.onClose) {
      this.context.onClose(progId, progProps);
    }
    if (progProps && progProps.parentExplorerId) {
      setTimeout(() => {
        if (this.context.moveToTop) {
          this.context.moveToTop(progProps.parentExplorerId);
        }
      }, 0);
    }
  };

  render() {
    return (
      <>
        {Object.keys(this.context.activePrograms).map((progId) => {
          const prog = this.context.activePrograms[progId];
          const Application = Applications[prog.component];
          if (!Application) return null;
          return (
            <Application
              {...prog}
              save={this.context.save}
              key={progId}
              onClose={(...args) => this.handleProgramClose(...args)}
              onOpen={this.context.onOpen}
              onMinimize={this.context.onMinimize}
              moveToTop={this.context.moveToTop}
              isActive={prog.id === this.context.activeId}
              program={prog}
              zIndex={this.context.zIndexes.indexOf(progId) + 5}
            />
          );
        })}
      </>
    );
  }
}

export default WindowManager;
