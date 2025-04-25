import React, { Component } from "react";
import * as Applications from "../Applications";
import { ProgramContext } from "../../contexts";
import * as icons from "../../icons";

class WindowManager extends Component {
  static contextType = ProgramContext;
  
  // Track whether we've already opened apps for special URLs
  state = {
    doomOpened: false,
    burnOpened: false
  };
  
  componentDidMount() {
    this.checkSpecialURLs();
  }
  
  componentDidUpdate(prevProps) {
    // Only check if the URL has changed or we haven't opened the apps yet
    if (prevProps !== this.props) {
      this.checkSpecialURLs();
    }
  }
  
  checkSpecialURLs() {
    const pathname = window.location.pathname;
    
    // Check for Doom URL
    if (pathname === "/doom" && !this.state.doomOpened) {
      const hasDoom = Object.values(this.context.activePrograms).some(
        prog => prog.component === "Doom"
      );
      
      if (!hasDoom && this.context.onOpen) {
        this.context.onOpen({
          component: "Doom",
          title: "DOOM",
          icon: icons.doom32,
        });
        
        // Mark that we've opened Doom for this URL
        this.setState({ doomOpened: true });
      }
    } else if (pathname !== "/doom") {
      // Reset the flag when we navigate away
      this.setState({ doomOpened: false });
    }
    
    // Check for Burn URL
    if (pathname === "/burn" && !this.state.burnOpened) {
      const hasBurn = Object.values(this.context.activePrograms).some(
        prog => prog.component === "Burn"
      );
      
      if (!hasBurn && this.context.onOpen) {
        this.context.onOpen({
          component: "Burn",
          title: "Burn",
          icon: icons.burn32, // Assuming there's a burn icon
        });
        
        // Mark that we've opened Burn for this URL
        this.setState({ burnOpened: true });
      }
    } else if (pathname !== "/burn") {
      // Reset the flag when we navigate away
      this.setState({ burnOpened: false });
    }
  }
  
  render() {
    return (
      <>
        {/* Render all active programs */}
        {Object.keys(this.context.activePrograms).map(progId => {
          const prog = this.context.activePrograms[progId];
          const Application = Applications[prog.component];
          console.log("🧠 Application lookup:", prog.component, Application);
          
          // Skip if application doesn't exist
          if (!Application) return null;
          
          console.log(`Rendering program: ${prog.title}, id: ${prog.id}, activeId: ${this.context.activeId}`);

          return (
            <Application
              {...prog}
              save={this.context.save}
              key={progId}
              onClose={this.context.onClose}
              onOpen={this.context.onOpen}
              onMinimize={this.context.onMinimize}
              moveToTop={this.context.moveToTop}
              isActive={prog.id === this.context.activeId} // Ensure this logic is correct
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
