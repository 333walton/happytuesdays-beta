import React, { Component } from "react";
import Window from "../tools/Window";
import cx from "classnames";
import { notepad16 } from "../../icons";
import "./_styles.scss";
import { WindowProgram } from "packard-belle";
import buildMenu from "../../helpers/menuBuilder";
import FileManager from "../tools/FileManager";

class Notepad extends Component {
  static defaultProps = {
    data: {},
  };
  state = {
    wrap: this.props.data?.wrap || false, // FIXED: Use wrap from props if provided
    data: {
      content: "",
      ...this.props.data,
    },
    saveScreen: false,
    newFilename: "",
  };

  toggleWrap = () => this.setState((state) => ({ wrap: !state.wrap }));
  setText = (e) => {
    e.persist();
    this.setState((state) => ({
      data: {
        ...state.data,
        content: e && e.target && e.target.value,
      },
    }));
  };
  toggleSavescreen = (saveAction) =>
    this.setState((state) => ({
      saveScreen: !state.saveScreen,
      actionName: saveAction,
    }));

  save = () => {
    this.toggleSavescreen();
  };
  quickSave = () => {
    this.props.save(
      this.props.program,
      this.state.data,
      this.props.program.title
    );
  };
  open = (prog) => {
    this.toggleSavescreen();
  };

  render() {
    const { props, toggleWrap, toggleSavescreen, setText, state } = this;
    return (
      <>
        <Window
          {...props}
          icon={notepad16}
          footer={[
            { text: "needs 100% width height" },
            { text: "overflow control" },
          ]}
          menuOptions={buildMenu(
            {
              ...props,
              multiInstance: true,
              onSave: !this.props.data.readOnly ? this.quickSave : undefined,
              onSaveAs: () => toggleSavescreen("save"),
              onOpenSearch: () => toggleSavescreen("open"),
              readOnly: props.data.readOnly,
            },
            {
              edit: [
                {
                  title: "Wrap",
                  onClick: () => toggleWrap(!state.wrap),
                  className: state.wrap ? "checked" : undefined,
                },
              ],
            }
          )}
          className={cx("Notepad", props.className, {
            "Notepad--wrap": state.wrap,
            "Window--blocked": state.saveScreen,
          })}
          title={`${
            props.title !== "Notepad" ? props.title : "Untitled"
          } - Notepad${props.data.readOnly ? "" : ""}`}
          Component={WindowProgram}
          maximizeOnOpen={false} // Prevent maximizing on open
          forceNoMobileMax={true} // Prevent maximization on mobile devices
          initialWidth={390} // Set the initial width of the window
          initialHeight={300} // Set the initial height of the window
          initialX={10} // Set the initial X position of the window
          initialY={2} // Set the initial Y position of the window
          position={{ x: 10, y: 2 }} // Explicitly set the position
        >
          <div className="Notepad__textarea">
            {props.data?.readOnly && props.data?.enableHtml ? (
              <div 
                className="text rich-text"
                style={{
                  fontFamily: "FixedSys, Courier New, Courier, monospace",
                  whiteSpace: "pre-wrap",
                  padding: "2px",
                  minHeight: "100%",
                  backgroundColor: "white",
                  border: "none",
                  overflow: "auto",
                  lineHeight: "1.2"
                }}
                dangerouslySetInnerHTML={{ __html: state.data.content }}
              />
            ) : (
              <textarea
                className="text"
                onChange={setText}
                value={state.data.content}
                spellCheck={false}
                readOnly={props.data?.readOnly || false}
              />
            )}
          </div>
        </Window>
        {state.saveScreen && (
          <FileManager
            type="Text"
            action={state.actionName}
            location="desktop"
            onCancel={() => this.toggleSavescreen()}
            onAction={this[state.actionName]}
            actionName={state.actionName}
            instance={props.program}
            data={state.data}
          />
        )}
      </>
    );
  }
}

export default Notepad;
