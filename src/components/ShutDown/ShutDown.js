import React, { Component } from "react";
import cx from "classnames";
import { Window, Radio, ButtonForm } from "packard-belle";
import { ProgramContext } from "../../contexts";
import { shutDown24 } from "../../icons";

import "./_styles.scss";

const OPTIONS = ["Shut Down", "Restart", "That third option I forget"];

class ShutDown extends Component {
  static contextType = ProgramContext;
  state = {
    selected: OPTIONS[0],
    display: this.context.shutDownMenu,
  };

  componentDidUpdate() {
    if (
      this.context.shutDownMenu &&
      this.context.shutDownMenu !== this.state.display
    ) {
      setTimeout(() => this.setState({ display: this.context.shutDownMenu }));
      return;
    }
  }

  process = () => {
    if (this.state.selected === OPTIONS[0]) {
      this.context.shutDown();
      return;
    }
    if (this.state.selected === OPTIONS[1]) {
      this.context.restart();
      return;
    }
  };

  handleHelp = () => {
    // Refresh the page when Help button is clicked
    window.location.reload();
  };

  render() {
    const { context, props } = this;
    return context.shutDownMenu ? (
      <div
        className={cx("ShutDown", props.className, {
          animation: this.state.display,
        })}
      >
        <Window
          className="ShutDown__window Window--active"
          title="Shut Down System"
          onClose={context.toggleShutDownMenu}
          resizable={false}
          isActive
        >
          <div className="ShutDown__content">
            <img src={shutDown24} alt="shut down" />
            <div>
              What do you want your computer to do?
              {OPTIONS.map((option) => (
                <div
                  key={option}
                  data-option={option}
                  className="radio-wrapper"
                >
                  <Radio
                    value={option}
                    label={option}
                    onChange={() => this.setState({ selected: option })}
                    checked={option === this.state.selected}
                  />
                </div>
              ))}
              <div className="ShutDown__buttons">
                <ButtonForm onClick={this.process}>OK</ButtonForm>
                <ButtonForm onClick={context.toggleShutDownMenu}>
                  Cancel
                </ButtonForm>
                <ButtonForm onClick={this.handleHelp}>Help</ButtonForm>
              </div>
            </div>
          </div>
        </Window>
      </div>
    ) : null;
  }
}

export default ShutDown;
