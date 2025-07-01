import React, { Component } from "react";
import { WindowProgram } from "packard-belle";
import cx from "classnames";
import Window from "../tools/Window";
import { command16 } from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

const lineStart = "C:\\TUESDAYS>";

class JSDos extends Component {
  state = {
    value: "",
    content: [],
  };
  input = React.createRef();

  focusInput = () => {
    this.input.current.focus();
  };

  onInputBlur = () => {
    console.log("Input blurred");
  };

  onInputChange = (e) => {
    this.setState({ value: e.target.value });
  };

  handleCommand = (command) => {
    const trimmed = command.trim().toLowerCase();

    switch (trimmed) {
      case "help":
        return "Available commands: help, clear, time, about";

      case "clear":
        this.setState({ content: [] });
        return null;

      case "time":
        return new Date().toLocaleString();

      case "about":
        return "Happy Tuesdays simulated terminal. Created by based dev.";

      default:
        return `Unknown command: "${command}". Try 'help'`;
    }
  };

  processEntry = (e) => {
    e.preventDefault();

    const input = this.state.value;
    const output = this.handleCommand(input);

    this.setState((state) => ({
      value: "",
      content:
        output !== null
          ? [...state.content, `${lineStart}${input}`, output]
          : state.content, // If output is null (e.g. for 'clear')
    }));
  };

  render() {
    const { props } = this;
    const isMobile = window.innerWidth <= 768;

    return (
      <Window
        {...props}
        title="Command Prompt"
        icon={command16}
        menuOptions={buildMenu(props)}
        Component={WindowProgram}
        initialHeight={200}
        initialWidth={400}
        initialX={isMobile ? 1 : 1}
        initialY={isMobile ? 1 : 1}
        forceNoMobileMax={true}
        onMaximize={window.innerWidth <= 768 ? null : undefined}
        className={cx("JSDos", props.className)}
      >
        <form name="hiddenForm" onSubmit={this.processEntry}>
          <input
            type="text"
            value={this.state.value}
            ref={this.input}
            onChange={this.onInputChange}
            onBlur={this.onInputBlur}
          />
        </form>
        <div className="terminal" onClick={this.focusInput}>
          <div>Happy Tuesdays</div>
          <div style={{ marginLeft: "12px", marginBottom: "6px" }}>
            (C)Copyright Tuesdays Media Corp 1991–2025.
          </div>
          <div className="terminal__content">
            {this.state.content.map((entry, i) => (
              <div key={i}>{entry}</div>
            ))}
            {lineStart}
            <span>{this.state.value}</span>
          </div>
        </div>
      </Window>
    );
  }
}

export default JSDos;
