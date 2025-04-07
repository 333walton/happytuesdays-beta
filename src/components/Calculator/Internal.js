import React, { Component } from "react";

class Windows98Calculator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      display: "0.",
      expression: [""],
      memory: "",
      int: true,
      float: false,
    };
    this.operators = ["+", "-", "/", "*", "%"];
  }

  safeEval = (expression) => {
    try {
      return Function('"use strict"; return (' + expression + ')')();
    } catch {
      return NaN;
    }
  };

  addToMemoryStore = () => {
    const { expression, memory } = this.state;
    const last = expression[expression.length - 1];
    if (this.operators.includes(last) || last === "" || memory !== "") return;
    this.setState({ memory: this.safeEval(expression.join("")).toString() });
  };

  addToCurrentMemoryStore = () => {
    const { expression, memory } = this.state;
    const last = expression[expression.length - 1];
    if (memory === "" || this.operators.includes(last)) return;
    const newMemory = parseFloat(memory) + this.safeEval(expression.join(""));
    this.setState({ memory: newMemory.toString() });
  };

  retrieveMemoryStore = () => {
    if (!this.state.memory) return;
    this.printNumber(this.state.memory);
    this.checkNumberType();
  };

  clearMemoryStore = () => this.setState({ memory: "" });
  setFloatState = () => this.setState({ int: false, float: true });
  setIntState = () => this.setState({ int: true, float: false });

  toggleNumberType = () => {
    this.state.expression.join("").includes(".") ? this.setFloatState() : this.setIntState();
  };

  checkNumberType = () => {
    const { display } = this.state;
    typeof display === "number"
      ? this.setState({ display: display.toString() }, this.toggleNumberType)
      : this.toggleNumberType();
  };

  clearDisplay = () => {
    this.setState({ display: "0." });
    this.clearExpression();
    this.setIntState();
  };

  backSpaceExpression = () => {
    const { expression } = this.state;
    let last = expression[expression.length - 1];
    if (last.length === 1 || (last.length === 2 && last[0] === "-")) {
      expression.length === 1 ? this.clearExpression() : expression.pop();
    } else {
      last = last.slice(0, -1);
      expression[expression.length - 1] = last;
    }
    this.setState({ expression });
  };

  backSpaceDisplay = () => {
    let { display } = this.state;
    if (display === "0." || display === "Error") return;
    display = display.length === 1 ? "0." : display.slice(0, -1);
    this.setState({ display }, () => {
      if (display !== "0.") this.checkNumberType();
    });
    return display;
  };

  backSpace = () => {
    const newDisplay = this.backSpaceDisplay();
    this.clearExpression(newDisplay);
    this.backSpaceExpression();
  };

  printNumber = (num) => {
    if (this.state.display === "Error") this.setState({ display: "" });
    this.updateExpression(num);
    if (this.state.display.length >= 40) {
      this.clearExpression();
      return this.setState({ display: "Error" });
    }
    this.setState(prev => ({
      display: prev.display === "0." || prev.display === "0" ? `${num}` : `${prev.display}${num}`
    }));
  };

  updateExpression = (str) => {
    const { expression } = this.state;
    str = str.toString();
    if (this.operators.includes(str) || this.operators.includes(this.state.display.slice(-1))) expression.push(str);
    else expression[expression.length - 1] += str;
    this.setState({ expression });
  };

  clearExpression = (newExp = "") => this.setState({ expression: [newExp.toString()] });

  compute = () => {
    const { expression } = this.state;
    if (this.operators.includes(expression[expression.length - 1])) return;
    const result = this.safeEval(expression.join(""));
    if (isNaN(result)) return this.setState({ display: "Error" }, this.clearExpression);
    this.setState({ display: result }, () => {
      this.clearExpression(result);
      this.checkNumberType();
    });
  };

  addOperator = (op) => {
    if (this.state.expression[this.state.expression.length - 1] === "") return;
    this.setState(prev => ({ display: `${prev.display}${op}` }));
    this.updateExpression(op);
  };

  addDecimal = () => this.addOperator(".");
  addition = () => this.addOperator("+");
  subtraction = () => this.addOperator("-");
  multiplication = () => this.addOperator("*");
  division = () => this.addOperator("/");

  percent = () => {
    this.setState(prev => ({ display: `${prev.display}%` }));
    this.updateExpression("%");
    this.computePercent();
  };

  computePercent = () => {
    if (this.state.expression.includes("%")) {
      const { expression } = this.state;
      const idx = expression.lastIndexOf("%");
      const second = expression[idx - 1], first = expression[idx - 3];
      const pct = ((parseFloat(second) / 100) * parseFloat(first)).toString();
      expression.splice(idx - 1, 1, pct);
      expression.splice(idx, 1);
      this.setState({ expression });
    }
  };

  squareRoot = () => {
    const val = Math.sqrt(this.safeEval(this.state.expression.join("")));
    this.setState({ display: val }, () => {
      this.clearExpression(val);
      this.checkNumberType();
    });
  };

  reciprocal = () => {
    const val = this.safeEval(this.state.expression.join(""));
    if (val === 0) return this.setState({ display: "Error" }, this.clearExpression);
    const recip = 1 / val;
    this.setState({ display: recip }, () => {
      this.clearExpression(recip);
      this.checkNumberType();
    });
  };

  toggleNegative = () => {
    const { expression } = this.state;
    const last = expression[expression.length - 1];
    if (this.operators.includes(last) || last === "" || last === "0") return;
    const neg = parseFloat(last) < 0 ? Math.abs(parseFloat(last)) : -parseFloat(last);
    expression[expression.length - 1] = neg.toString();
    this.setState({ expression, display: expression.join("") });
  };

  renderDisplay() {
    return (
      <div className="display-container">
        <div className="windows98-display">{this.state.display}</div>
      </div>
    );
  }

  renderDeleteButtonRow() {
    return (
      <div className="delete-button-row">
        <span className="empty-box"></span>
        {this.renderDeleteButton(this.backSpace, "Backspace")}
        {this.renderDeleteButton(this.backSpace, "CE")}
        {this.renderDeleteButton(this.clearDisplay, "C")}
      </div>
    );
  }

  renderDeleteButton(fn, val) {
    return (
      <button onClick={fn} className="main-button delete-button">
        <span style={{ color: "red" }}>{val}</span>
      </button>
    );
  }

  renderNumberButton(val) {
    return <button onClick={() => this.printNumber(val)} className="main-button">{val}</button>;
  }

  renderFunctionButton(fn, val) {
    const isOp = ["+", "-", "*", "/", "="].includes(val);
    return (
      <button onClick={fn} className="main-button">
        <span style={{ color: isOp ? "blue" : "black" }}>{val}</span>
      </button>
    );
  }

  renderMemoryButton(fn, val) {
    return (
      <button onClick={fn} className="memory-button main-button">
        <span style={{ color: "red" }}>{val}</span>
      </button>
    );
  }

  renderMainButtonsGrid() {
    return (
      <div className="main-grid">
        {this.renderMemoryButton(this.clearMemoryStore, "MC")}
        {this.renderNumberButton(7)}
        {this.renderNumberButton(8)}
        {this.renderNumberButton(9)}
        {this.renderFunctionButton(this.division, "/")}
        {this.renderFunctionButton(this.squareRoot, "sqrt")}

        {this.renderMemoryButton(this.retrieveMemoryStore, "MR")}
        {this.renderNumberButton(4)}
        {this.renderNumberButton(5)}
        {this.renderNumberButton(6)}
        {this.renderFunctionButton(this.multiplication, "*")}
        {this.renderFunctionButton(this.percent, "%")}

        {this.renderMemoryButton(this.addToMemoryStore, "MS")}
        {this.renderNumberButton(1)}
        {this.renderNumberButton(2)}
        {this.renderNumberButton(3)}
        {this.renderFunctionButton(this.subtraction, "-")}
        {this.renderFunctionButton(this.reciprocal, "1/x")}

        {this.renderMemoryButton(this.addToCurrentMemoryStore, "M+")}
        {this.renderNumberButton(0)}
        {this.renderFunctionButton(this.toggleNegative, "+/-")}
        {this.renderFunctionButton(this.addDecimal, ".")}
        {this.renderFunctionButton(this.addition, "+")}
        {this.renderFunctionButton(this.compute, "=")}
      </div>
    );
  }

  render() {
    return (
      <div className="windows98-calculator">
        {this.renderDisplay()}
        {this.renderDeleteButtonRow()}
        {this.renderMainButtonsGrid()}
      </div>
    );
  }
}

export default Windows98Calculator;