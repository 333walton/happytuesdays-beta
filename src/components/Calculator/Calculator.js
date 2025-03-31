import React, { Component } from "react";
import Display from "./Display";
import DeleteButtonRow from "./DeleteButtonRow";
import MainButtonsGrid from "./MainButtonsGrid";
import "./Calculator.scss"; // Ensure this imports any additional custom styles

class Calculator extends Component {
  render() {
    return (
      <div className="window calculator">
        <div className="title-bar">
          <div className="title-bar-text">Calculator</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize"></button>
            <button aria-label="Maximize"></button>
            <button aria-label="Close"></button>
          </div>
        </div>
        <div className="window-body">
          <Display display={this.props.display} />
          <DeleteButtonRow
            clearDisplay={this.props.clearDisplay}
            backSpace={this.props.backSpace}
          />
          <MainButtonsGrid {...this.props} />
        </div>
      </div>
    );
  }
}

export default Calculator;
