import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import CustomWindow from "../CustomWindow";
import { minesweeper16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "../Minesweeper/_styles.scss";
import "./_styles.scss"; // Add specific styles for scrollbar removal

// Optimization: Extract help dialog to a separate component to reduce re-renders
const HelpDialog = React.memo(({ onClose }) => (
  <div 
    className="help-window" 
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#c0c0c0",
      border: "2px solid",
      borderTopColor: "#dfdfdf",
      borderLeftColor: "#dfdfdf",
      borderRightColor: "#808080",
      borderBottomColor: "#808080",
      boxShadow: "1px 1px 0 #000000, -1px -1px 0 #ffffff",
      padding: "10px",
      zIndex: 10,
      width: "80%",
    }}
  >
    <h3 style={{ 
      fontSize: "12px", 
      margin: "0 0 8px 0", 
      fontWeight: "bold",
      fontFamily: "Microsoft Sans Serif, Tahoma, sans-serif"
    }}>
      Minesweeper Help
    </h3>
    <p style={{ 
      margin: "6px 0", 
      fontSize: "11px",
      fontFamily: "Microsoft Sans Serif, Tahoma, sans-serif"
    }}>
      Left click: Uncover a square
    </p>
    <p style={{ 
      margin: "6px 0", 
      fontSize: "11px",
      fontFamily: "Microsoft Sans Serif, Tahoma, sans-serif" 
    }}>
      Right click: Flag a mine
    </p>
    <p style={{ 
      margin: "6px 0", 
      fontSize: "11px",
      fontFamily: "Microsoft Sans Serif, Tahoma, sans-serif" 
    }}>
      Clear all non-mine squares to win!
    </p>
    <button
      onClick={onClose}
      style={{
        marginTop: "8px",
        padding: "2px 8px",
        fontSize: "11px",
        border: "1px solid",
        borderTopColor: "#dfdfdf",
        borderLeftColor: "#dfdfdf",
        borderRightColor: "#808080",
        borderBottomColor: "#808080",
        backgroundColor: "#c0c0c0",
        boxShadow: "1px 1px 0 #ffffff inset, -1px -1px 0 #707070 inset",
        fontFamily: "Microsoft Sans Serif, Tahoma, sans-serif",
        //cursor: "pointer"
      }}
    >
      OK
    </button>
  </div>
));

class MinesweeperWithHelp extends Component {
  constructor(props) {
    super(props);
    // Optimization: Only track dialog state, keep it minimal
    this.state = {
      showHelpDialog: false
    };
  }

  // Optimization: Use arrow functions for methods to avoid binding
  showHelp = () => {
    this.setState({ showHelpDialog: true });
  };
  
  hideHelp = () => {
    this.setState({ showHelpDialog: false });
  };
  
  // Optimization: Create menu options once and memoize them
  getMenuOptions = () => {
    const { props } = this;
    return buildMenu({
      ...props,
      componentType: "MinesweeperWithHelp",
      showHelp: this.showHelp,
      options: {
        // Minimal menu options
        help: [
          { label: "How to Play", onClick: this.showHelp }
        ]
      }
    });
  };

  render() {
    const { props } = this;
    const { showHelpDialog } = this.state;
    
    // Optimization: Create menu options outside render to avoid recreation
    const menuOptions = this.getMenuOptions();
    
    return (
      <CustomWindow
        {...props}
        title="Minesweeper"
        icon={minesweeper16}
        menuOptions={menuOptions}
        Component={WindowProgram}
        initialHeight={232}
        initialWidth={160}
        resizable={false}
        onMaximize={null}
        // Key prop for help functionality
        onHelp={this.showHelp}
        // Add class for scrollbar removal
        className={cx("Minesweeper", "no-scrollbars", props.className)}
      >
        {/* Optimization: Only render help dialog when needed */}
        {showHelpDialog && <HelpDialog onClose={this.hideHelp} />}
        
        {/* Use a wrapper div to fully control iframe and prevent scrollbars */}
        <div className="minesweeper-iframe-container">
          <iframe
            src="/dist/minesweeper222.html"
            title="Minesweeper"
            width="100%"
            height="100%"
            loading="eager"
            style={{
              border: "none",
              left: "-1px",
              // Add hardware acceleration for smoother performance
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              // Remove scrollbar
              overflow: "hidden"
            }}
            frameBorder="0"
            scrolling="no"
          />
        </div>
      </CustomWindow>
    );
  }
}

// Performance optimization: Use React.memo to prevent unnecessary re-renders
export default React.memo(MinesweeperWithHelp);