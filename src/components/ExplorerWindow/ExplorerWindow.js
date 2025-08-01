import React, { Component } from "react";
import cx from "classnames"; // Added this import
import { WindowExplorer, ExplorerIcon, WindowAlert } from "packard-belle";
import * as icons from "../../icons";
import Window from "../tools/Window";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";
import "../../icons/icons.scss";

const noop = () => {};

class Explorer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      viewMode: props.title === "All Doodles" ? "list" : "icons",
      message: null,
    };
  }

  handleClick = (entry) => {
    if (entry.failState) {
      this.toggleLoading();
      setTimeout(() => {
        this.setState({
          loading: false,
          title: entry.title,
          message: entry.failState.message,
          icon: entry.icon,
        });
      }, entry.failState.loadTime || 2000);
    } else if (entry.onDoubleClick) {
      entry.onDoubleClick();
    }
  };

  toggleLoading = () => this.setState((state) => ({ loading: !state.loading }));
  dismissMessage = () => this.setState({ message: null });

  toggleViewMode = () => {
    this.setState((state) => ({
      viewMode: state.viewMode === "icons" ? "list" : "icons",
    }));
  };

  render() {
    const { props, state } = this;

    // Dynamically set dimensions based on the title and screen size
    const dimensions = (() => {
      const isMobile = window.innerWidth < 600; // Define mobile breakpoint
      switch (props.title) {
        case "All Doodles":
          return isMobile
            ? { initialWidth: 374, initialHeight: 193 } // Mobile size
            : { initialWidth: 381, initialHeight: 252 }; // Desktop size
        case "My Computer":
          return isMobile
            ? { initialWidth: 180, initialHeight: 229 } // Mobile size, optional even smaller
            : { initialWidth: 200, initialHeight: 230 }; // Desktop size, reduced width!
        default:
          return isMobile
            ? { initialWidth: 271, initialHeight: 229 } // Mobile size
            : { initialWidth: 381, initialHeight: 252 }; // Desktop size
      }
    })();

    return (
      <>
        <Window
          {...props}
          title={props.title || "Explorer"}
          initialWidth={dimensions.initialWidth}
          initialHeight={dimensions.initialHeight}
          minWidth={200}
          minHeight={150}
          maxHeight={window.innerHeight - 50}
          maxWidth={window.innerWidth - 50}
          maximizeOnOpen={false}
          forceNoMobileMax={true}
          resizable={true}
          //disableMaximize={props.title === "Computer"}
          Component={WindowExplorer}
          className={cx(state.loading && "wait wait2", "Explorer", {
            "Explorer--computer": props.title === "Computer",
          })}
          explorerOptions={[
            { icon: icons.back, title: "Back", onClick: noop },
            { icon: icons.forward, title: "Forward", onClick: noop },
            { icon: icons.upDir, title: "Up", onClick: noop },
            { icon: icons.cut, title: "Cut", onClick: noop },
            { icon: icons.copy, title: "Copy", onClick: noop },
            { icon: icons.delete, title: "Delete", onClick: noop },
            { icon: icons.properties, title: "Properties", onClick: noop },
          ]}
          menuOptions={buildMenu(
            {
              ...props,
              componentType: "Explorer",
            },
            {
              View: [
                {
                  title: "Toggle View Mode",
                  onClick: this.toggleViewMode,
                },
              ],
            }
          )}
        >
          <div className="explorer-options">
            {/* Render explorer options here */}
          </div>
          <div
            className={`doodle-container ${
              state.viewMode === "icons" ? "icons-view" : "list-view"
            }`}
          >
            {props.data?.content &&
              (state.viewMode === "list" ? (
                <ul className="doodle-listing">
                  {props.data.content.map((entry) => (
                    <li
                      key={entry.title}
                      className="doodle-row"
                      onDoubleClick={
                        !state.loading
                          ? () => this.handleClick(entry)
                          : undefined
                      }
                    >
                      <span className="file-icon">
                        {icons[entry.icon] && (
                          <img src={icons[entry.icon]} alt="" />
                        )}
                      </span>
                      <span className="file-name">{entry.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                props.data.content.map((entry) => (
                  <ExplorerIcon
                    key={entry.title}
                    title={entry.title}
                    icon={icons[entry.icon]}
                    className={entry.icon}
                    onDoubleClick={
                      !state.loading ? () => this.handleClick(entry) : undefined
                    }
                  />
                ))
              ))}
          </div>
        </Window>

        {state.message && (
          <WindowAlert
            title={state.title}
            icon={icons.ieStop}
            onOK={this.dismissMessage}
            className="Window--active"
          >
            {state.message}
          </WindowAlert>
        )}
      </>
    );
  }
}

export default Explorer;
