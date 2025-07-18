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
    // When window becomes active, ensure CSS class is properly applied
    if (!prevProps.isActive && this.props.isActive) {
      const windowElement = this.windowRef.current;
      if (windowElement) {
        void windowElement.offsetHeight;
        windowElement.classList.add("Window--active");
        windowElement.style.filter = "";
        windowElement.style.webkitFilter = "";
      }
    }

    // Handle activation nonce changes
    if (
      this.props.activationNonce !== prevProps.activationNonce &&
      this.props.isActive
    ) {
      this.forceUpdate(() => {
        const windowElement = this.windowRef.current;
        if (windowElement) {
          void windowElement.offsetHeight;
          windowElement.classList.add("Window--active");
        }
      });
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

  handleProgramClose = (prog) => {
    // Close the program using context
    if (this.context.onClose) {
      this.context.onClose(prog);
    }

    // --- ROUTING LOGIC: When closing Feeds, go to homepage ---
    if (
      prog &&
      (prog.title === "Feeds" ||
        prog.component === "HappyTuesdayNewsFeed" ||
        (prog.data &&
          (prog.data.component === "HappyTuesdayNewsFeed" ||
            prog.data.type === "happy-tuesday-feed" ||
            (typeof prog.data.title === "string" &&
              prog.data.title.toLowerCase().includes("happy tuesday")))))
    ) {
      if (this.props.navigate) {
        this.props.navigate("/");
      }
    }

    // Check if this program has a parent explorer
    if (prog && prog.parentExplorerId) {
      Promise.resolve().then(() => {
        if (this.context.moveToTop) {
          this.context.moveToTop(prog.parentExplorerId);
        }
      });
    }
  };

  render() {
    return (
      <>
        {Object.keys(this.context.activePrograms).map((progId) => {
          const prog = this.context.activePrograms[progId];
          const Application = Applications[prog.component];
          if (!Application) return null;
          const isActive = prog.id === this.context.activeId;

          return (
            <Application
              {...prog}
              save={this.context.save}
              key={progId}
              onClose={() => this.handleProgramClose(prog)}
              onOpen={this.context.onOpen}
              onMinimize={this.context.onMinimize}
              moveToTop={this.context.moveToTop}
              isActive={isActive}
              activationNonce={this.context.activationNonce}
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
