import React, { Component } from "react";
import Calculator from "./Calculator";
import Header from "./Header";
import Options from "./Options";
import { calculator16 } from "../../icons";
import { WindowProgram } from "packard-belle";
import Window from "../tools/Window";
import "./Calculator.scss";

class Win98Calculator extends Component {
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

  render() {
    return (
      <Window
        {...this.props}
        icon={calculator16}
        title="Calculator"
        className="calculator-window"
        Component={WindowProgram}
        resizable={false}
        initialWidth={300}
        initialHeight={360}
      >
        <div className="calculator-inner">
          <Header />
          <Options />
          <Calculator
            display={this.state.display}
            printNumber={this.printNumber}
            clearDisplay={this.clearDisplay}
            backSpace={this.backSpace}
            addDecimal={this.addDecimal}
            compute={this.compute}
            addition={this.addition}
            subtraction={this.subtraction}
            multiplication={this.multiplication}
            division={this.division}
            squareRoot={this.squareRoot}
            percent={this.percent}
            reciprocal={this.reciprocal}
            toggleNegative={this.toggleNegative}
            addToMemoryStore={this.addToMemoryStore}
            addToCurrentMemoryStore={this.addToCurrentMemoryStore}
            clearMemoryStore={this.clearMemoryStore}
            retrieveMemoryStore={this.retrieveMemoryStore}
          />
        </div>
      </Window>
    );
  }

  // --- Functional logic for calculator buttons ---
  addToMemoryStore = () => {
    const expression = this.state.expression;
    const last = expression[expression.length - 1];
    if (
      this.operators.includes(last) ||
      last === "" ||
      this.state.memory !== ""
    ) return;
    this.setState({ memory: eval(expression.join("")).toString() });
  };

  addToCurrentMemoryStore = () => {
    const expression = this.state.expression;
    const last = expression[expression.length - 1];
    if (this.state.memory === "" || this.operators.includes(last)) return;
    this.setState((prevState) => ({
      memory: eval(
        `${prevState.memory} + ${eval(expression.join(""))}`
      ).toString(),
    }));
  };

  retrieveMemoryStore = () => {
    if (this.state.memory === "") return;
    this.printNumber(this.state.memory);
    this.checkNumberType();
  };

  clearMemoryStore = () => this.setState({ memory: "" });

  setFloatState = () => this.setState({ int: false, float: true });
  setIntState = () => this.setState({ int: true, float: false });

  toggleNumberType = () => {
    if (this.state.expression.join("").includes(".")) {
      this.setFloatState();
    } else {
      this.setIntState();
    }
  };

  checkNumberType = () => {
    if (typeof this.state.display === "number") {
      const strNum = this.state.display.toString();
      this.setState({ display: strNum }, () => this.toggleNumberType());
    } else {
      this.toggleNumberType();
    }
  };

  clearDisplay = () => {
    this.setState({ display: "0." });
    this.clearExpression();
    this.setIntState();
  };

  backSpaceExpression = () => {
    const { expression } = this.state;
    const last = expression[expression.length - 1];
    if (last.length === 1 || (last.length === 2 && last[0] === "-")) {
      expression.pop();
      if (expression.length === 0) return this.clearExpression();
    } else {
      expression[expression.length - 1] = last.slice(0, -1);
    }
    this.setState({ expression });
  };

  backSpaceDisplay = () => {
    if (["0.", "Error"].includes(this.state.display)) return;
    const newDisplay = this.state.display.slice(0, -1) || "0.";
    this.setState({ display: newDisplay }, () => {
      if (newDisplay !== "0.") this.checkNumberType();
    });
    return newDisplay;
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
    this.setState((prevState) => ({
      display:
        prevState.display === "0." || prevState.display === "0"
          ? `${num}`
          : `${prevState.display}${num}`,
    }));
  };

  updateExpression = (str) => {
    const { expression } = this.state;
    str = String(str);
    if (
      this.operators.includes(str) ||
      this.operators.includes(this.state.display.slice(-1))
    ) {
      expression.push(str);
    } else {
      expression[expression.length - 1] += str;
    }
    this.setState({ expression });
  };

  clearExpression = (newExp = "") => {
    this.setState({ expression: [String(newExp)] });
  };

  compute = () => {
    const { expression } = this.state;
    if (this.operators.includes(expression.at(-1))) return;
    const result = eval(expression.join(""));
    if (isNaN(result)) {
      this.setState({ display: "Error" });
      return this.clearExpression();
    }
    this.setState({ display: result }, () => {
      this.clearExpression(result);
      this.checkNumberType();
    });
  };

  addOperator = (operator) => {
    if (this.state.expression.at(-1) === "") return;
    this.setState((prevState) => ({
      display: `${prevState.display}${operator}`,
    }));
    this.updateExpression(operator);
  };

  addDecimal = () => this.addOperator(".");
  addition = () => this.addOperator("+");
  subtraction = () => this.addOperator("-");
  multiplication = () => this.addOperator("*");
  division = () => this.addOperator("/");

  percent = () => {
    this.setState((prevState) => ({
      display: `${prevState.display}%`,
    }));
    this.updateExpression("%");
    this.computePercent();
  };

  computePercent = () => {
    const { expression } = this.state;
    if (expression.includes("%")) {
      const idx = expression.lastIndexOf("%");
      const second = expression[idx - 1];
      const first = expression[idx - 3];
      const percentage = eval((second / 100) * first).toString();
      expression.splice(idx - 1, 2, percentage);
      this.setState({ expression });
    }
  };

  squareRoot = () => {
    const sqrt = Math.sqrt(eval(this.state.expression.join("")));
    this.setState({ display: sqrt }, () => {
      this.clearExpression(sqrt);
      this.checkNumberType();
    });
  };

  reciprocal = () => {
    const exp = this.state.expression.join("");
    const recip = eval(`1/(${eval(exp)})`);
    this.setState({ display: recip }, () => {
      this.clearExpression(recip);
      this.checkNumberType();
    });
  };

  toggleNegative = () => {
    const { expression } = this.state;
    const last = expression.at(-1);
    if (this.operators.includes(last) || last === "" || last === "0") return;
    const newNum = last < 0
      ? Math.abs(last).toString()
      : (-1 * last).toString();
    expression.splice(expression.length - 1, 1, newNum);
    this.setState({ expression, display: expression.join("") });
  };
}

export default Win98Calculator;
