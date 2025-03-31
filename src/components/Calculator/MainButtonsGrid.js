import React, { Component } from "react";
import FunctionButton from "./FunctionButton";
import NumberButton from "./NumberButton";
import MemoryButton from "./MemoryButton";

class MainButtonsGrid extends Component {
  render() {
    const {
      printNumber,
      division,
      squareRoot,
      multiplication,
      percent,
      subtraction,
      reciprocal,
      addDecimal,
      addition,
      compute,
      addToMemoryStore,
      clearMemoryStore,
      addToCurrentMemoryStore,
      retrieveMemoryStore,
      toggleNegative,
    } = this.props;

    return (
      <div className="main-grid">
        <div className="button-row">
          <MemoryButton keyFunction={clearMemoryStore} value={"MC"} />
          <NumberButton printNumber={printNumber} value={7} />
          <NumberButton printNumber={printNumber} value={8} />
          <NumberButton printNumber={printNumber} value={9} />
          <FunctionButton keyFunction={division} value={"/"} />
          <FunctionButton keyFunction={squareRoot} value={"sqrt"} />
        </div>

        <div className="button-row">
          <MemoryButton keyFunction={retrieveMemoryStore} value={"MR"} />
          <NumberButton printNumber={printNumber} value={4} />
          <NumberButton printNumber={printNumber} value={5} />
          <NumberButton printNumber={printNumber} value={6} />
          <FunctionButton keyFunction={multiplication} value={"*"} />
          <FunctionButton keyFunction={percent} value={"%"} />
        </div>

        <div className="button-row">
          <MemoryButton keyFunction={addToMemoryStore} value={"MS"} />
          <NumberButton printNumber={printNumber} value={1} />
          <NumberButton printNumber={printNumber} value={2} />
          <NumberButton printNumber={printNumber} value={3} />
          <FunctionButton keyFunction={subtraction} value={"-"} />
          <FunctionButton keyFunction={reciprocal} value={"1/x"} />
        </div>

        <div className="button-row">
          <MemoryButton keyFunction={addToCurrentMemoryStore} value={"M+"} />
          <NumberButton printNumber={printNumber} value={0} />
          <FunctionButton keyFunction={toggleNegative} value={"+/-"} />
          <FunctionButton keyFunction={addDecimal} value={"."} />
          <FunctionButton keyFunction={addition} value={"+"} />
          <FunctionButton keyFunction={compute} value={"="} />
        </div>
      </div>
    );
  }
}

export default MainButtonsGrid;
