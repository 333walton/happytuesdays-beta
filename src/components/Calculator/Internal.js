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

  /**
   * Safely evaluate a mathematical expression
   * @param {String} expression - The expression to evaluate
   * @returns {Number} - The result of the evaluation
   */
  safeEval = (expression) => {
    try {
      // Simple expression evaluator
      return Function('"use strict"; return (' + expression + ')')();
    } catch (error) {
      console.error('Error evaluating expression:', error);
      return NaN;
    }
  };

  /**
   * Add number or expression to memory
   * MS button
   */
  addToMemoryStore = () => {
    const expression = this.state.expression,
      last = expression[expression.length - 1];
    if (
      this.operators.includes(last) ||
      last === "" ||
      this.state.memory !== ""
    ) {
      return;
    }
    this.setState({
      memory: this.safeEval(expression.join("")).toString(),
    });
  };

  /**
   * Add a number to the current value in memory store
   * M+ button
   */
  addToCurrentMemoryStore = () => {
    const expression = this.state.expression,
      last = expression[expression.length - 1];
    if (this.state.memory === "" || this.operators.includes(last)) return;
    
    const currentMemory = parseFloat(this.state.memory);
    const exprValue = this.safeEval(expression.join(""));
    const newMemory = currentMemory + exprValue;
    
    this.setState({
      memory: newMemory.toString(),
    });
  };

  /**
   * Retrieve and print value in memory store
   * MR button
   */
  retrieveMemoryStore = () => {
    if (this.state.memory === "") return;
    this.printNumber(this.state.memory);
    this.checkNumberType();
  };

  /**
   * Clear memory store
   * MC button
   */
  clearMemoryStore = () => {
    this.setState({ memory: "" });
  };

  /**
   * Set the state of the application to handle floats
   * Used when the user clicks the "." (decimal) button
   */
  setFloatState = () => {
    this.setState({
      int: false,
      float: true,
    });
  };

  /**
   * Set application state to handle integers
   */
  setIntState = () => {
    this.setState({
      int: true,
      float: false,
    });
  };

  /**
   * Set int or float depending on whether contains a decimal
   */
  toggleNumberType = () => {
    if (this.state.expression.join("").includes(".")) {
      this.setFloatState();
    } else {
      this.setIntState();
    }
  };

  /**
   * Check if display is a number type and if so convert to string
   * Call toggleNumberType to set application state accordingly
   * This is necessary as the application uses strings rather than numbers
   * for convenience as strings are easier to manipulate
   */
  checkNumberType = () => {
    if (typeof this.state.display == "number") {
      const strNum = this.state.display.toString();
      this.setState({ display: strNum }, () => this.toggleNumberType());
    } else {
      this.toggleNumberType();
    }
  };

  /**
   * Clear the display
   */
  clearDisplay = () => {
    this.setState({ display: "0." });
    this.clearExpression();
    this.setIntState();
  };

  /**
   * Backspace last entry to the current expression
   */
  backSpaceExpression = () => {
    const { expression } = this.state,
      lastEntered = expression[expression.length - 1];
    if (lastEntered.length === 1) {
      if (expression.length === 1) {
        return this.clearExpression();
      } else {
        expression.pop();
        return this.setState({ expression: expression });
      }
    } else if (lastEntered.length === 2 && lastEntered[0] === "-") {
      if (expression.length === 1) {
        return this.clearExpression();
      } else {
        expression.pop();
      }
    } else if (lastEntered.length > 1) {
      let newLast = lastEntered.split("");
      newLast.pop();
      newLast = newLast.join("");
      expression.pop();
      expression.push(newLast);
    }
    this.setState({ expression: expression });
  };

  /**
   * Backspace the calculator display
   * @return {String} newDisplay - new string to be displayed
   * return value used by clearExpression
   */
  backSpaceDisplay = () => {
    if (this.state.display === "0." || this.state.display === "Error") return;
    let newDisplay;
    if (this.state.display.length === 1) {
      newDisplay = "0.";
    } else {
      newDisplay = this.state.display.substr(0, this.state.display.length - 1);
    }
    this.setState({ display: `${newDisplay}` }, () => {
      if (this.state.display !== "0.") {
        this.checkNumberType();
      }
    });
    return newDisplay;
  };

  /**
   * Backspace last entry
   */
  backSpace = () => {
    const newDisplay = this.backSpaceDisplay();
    this.clearExpression(newDisplay);
    this.backSpaceExpression();
  };

  /**
   * Add a number to the display
   * If state.display > 40 the number cannot fit and will display "Error"
   * @param {String} num - the number string passed to update display
   */
  printNumber = (num) => {
    if (this.state.display === "Error") {
      this.setState({ display: "" });
    }
    this.updateExpression(num);
    if (this.state.display.length >= 40) {
      this.clearExpression();
      return this.setState({ display: "Error" });
    }
    if (this.state.display == "0." || this.state.display == "0") {
      this.setState((prevState) => ({
        display: `${num}`,
      }));
    } else {
      this.setState((prevState) => ({
        display: `${prevState.display}${num}`,
      }));
    }
  };

  /**
   * Add number or operator to expression array in state
   * @param {String} str - number or character to be added to current expression
   */
  updateExpression = (str) => {
    const { expression } = this.state;
    if (typeof str === "number") str = str.toString();
    if (
      this.operators.includes(str) ||
      this.operators.includes(this.state.display[this.state.display.length - 1])
    ) {
      expression.push(str);
    } else {
      expression[expression.length - 1] += str;
    }
    this.setState({ expression: expression });
  };

  /**
   * Reset expression state array
   * @param {String} newExp - string to replace old expression
   */
  clearExpression = (newExp = "") => {
    if (typeof newExp === "number") newExp = newExp.toString();
    this.setState((prevState) => ({
      expression: [newExp],
    }));
  };

  /**
   * Evaluate arithmetic expression and display result
   */
  compute = () => {
    if (
      this.operators.includes(
        this.state.expression[this.state.expression.length - 1]
      )
    )
      return;
      
    const result = this.safeEval(this.state.expression.join(""));
    
    if (isNaN(result)) {
      this.setState({ display: "Error" });
      return this.clearExpression();
    }
    
    this.setState(
      {
        display: result,
      },
      () => {
        this.clearExpression(result);
        this.checkNumberType();
      }
    );
  };

  /**
   * Add passed operator to the current expression
   * @param {String} operator 
   */
  addOperator = (operator) => {
    if (this.state.expression[this.state.expression.length - 1] === "") return;
    this.setState((prevState) => ({
      display: `${prevState.display}${operator}`,
    }));
    this.updateExpression(operator);
  };

  /**
   * Add the decimal operator to display
   */
  addDecimal = () => {
    this.addOperator(".");
  };

  /**
   * Add the addition operator to display
   */
  addition = () => {
    this.addOperator("+");
  };

  /**
   * Add the subtraction operator to display
   */
  subtraction = () => {
    this.addOperator("-");
  };

  /**
   * Add the multiplication operator to display
   */
  multiplication = () => {
    this.addOperator("*");
  };

  /**
   * Add the division operator to display
   */
  division = () => {
    this.addOperator("/");
  };

  /**
   * Add the percent operator to display
   */
  percent = () => {
    this.setState((prevState) => ({
      display: `${prevState.display}%`,
    }));
    this.updateExpression("%");
    this.computePercent();
  };

  /**
   * Process an expression string containing percentages
   * Called when the user adds a percent sign
   */
  computePercent = () => {
    if (this.state.expression.includes("%")) {
      const { expression } = this.state,
        percentOperatorIndex = expression.lastIndexOf("%"),
        secondNum = expression[percentOperatorIndex - 1],
        secondNumIndex = expression.indexOf(secondNum),
        firstNum = expression[percentOperatorIndex - 3],
        percentage = ((parseFloat(secondNum) / 100) * parseFloat(firstNum)).toString();
      
      expression.splice(secondNumIndex, 1, percentage);
      expression.splice(percentOperatorIndex, 1);
      this.setState({ expression: expression });
    }
  };

  /**
   * Compute the square root of the current expression
   */
  squareRoot = () => {
    const expressionValue = this.safeEval(this.state.expression.join(""));
    const sqrt = Math.sqrt(expressionValue);
    
    this.setState({ display: sqrt }, () => {
      this.clearExpression(sqrt);
      this.checkNumberType();
    });
  };

  /**
   * Compute the reciprocal of the current expression
   */
  reciprocal = () => {
    const expressionValue = this.safeEval(this.state.expression.join(""));
    
    // Check for division by zero
    if (expressionValue === 0) {
      this.setState({ display: "Error" });
      return this.clearExpression();
    }
    
    const recip = 1 / expressionValue;
    
    this.setState({ display: recip }, () => {
      this.clearExpression(recip);
      this.checkNumberType();
    });
  };

  /**
   * Invert the last number in the current expression
   */
  toggleNegative = () => {
    const { expression } = this.state,
      lastNum = expression[expression.length - 1];
    let newNum;
    if (this.operators.includes(lastNum) || lastNum === "" || lastNum === "0")
      return;
    if (parseFloat(lastNum) < 0) {
      newNum = Math.abs(parseFloat(lastNum)).toString();
    } else if (parseFloat(lastNum) > 0) {
      newNum = (-1 * parseFloat(lastNum)).toString();
    }
    expression.splice(expression.length - 1, 1, newNum);
    this.setState({ expression: expression });
    this.setState({ display: expression.join("") });
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

  renderDeleteButton(keyFunction, value) {
    return (
      <button onClick={keyFunction} className="delete-button">
        <span style={{ color: 'red' }}>{value}</span>
      </button>
    );
  }

  renderNumberButton(value) {
    return (
      <button
        data-number={value}
        className="main-button"
        onClick={() => this.printNumber(value)}
      >
        {value}
      </button>
    );
  }

  renderFunctionButton(keyFunction, value) {
    const isOperator = ["+", "-", "*", "/", "="].includes(value);
    return (
      <button onClick={keyFunction} className="main-button">
        <span style={{ color: isOperator ? 'blue' : 'black' }}>{value}</span>
      </button>
    );
  }

  renderMemoryButton(keyFunction, value) {
    return (
      <button onClick={keyFunction} className="memory-button main-button">
        <span style={{ color: 'red' }}>{value}</span>
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
      <div className="calculator-container">
        <div className="window">
          <div className="window-body">
            {this.renderDisplay()}
            {this.renderDeleteButtonRow()}
            {this.renderMainButtonsGrid()}
          </div>
        </div>
        <style>{`
          .calculator-container {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0px;
            font-family: Arial;
            font-size: 12px;
          }
          
          /* Windows 98 specific styles */
          .window {
            background: #c0c0c0;
            border: 1px solid;
            border-color: #fff #808080 #808080 #fff;
            padding: 5px;
            width: 230px;
            margin: 0;
            display: inline-block;
          }
          
          .window-body {
            margin: 3px;
            background-color: #c0c0c0;
            padding: 3px;
          }
          
          .display-container {
            margin-bottom: 0px;
            width: 100%;
          }
          
          .windows98-display {
            height: 25px;
            background-color: white;
            border: 1px solid;
            border-color: #808080 #fff #fff #808080;
            padding: 1px 5px;
            text-align: right;
            font-family: 'Arial', sans-serif;
            font-size: 16px;
            line-height: 25px;
            overflow: hidden;
            white-space: nowrap;
            color: black;
          }
          
          .delete-button-row {
            display: grid;
            grid-template-columns: 1fr 2fr 1fr 1fr;
            grid-gap: 3px;
            margin-bottom: 5px;
            margin-top: 10px;
          }
          
          .empty-box {
            width: 100%;
            height: 25px;
            border: 1px solid;
            border-style: inset;
            background-color: #c0c0c0;
          }
          
          .delete-button {
            padding: 0;
            color: red;
            font-size: 11px;
            height: 25px;
            margin: 0;
          }
          
          .main-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            grid-gap: 3px;
            margin-top: 5px;
          }
          
          button {
            border: 1px solid;
            border-color: #fff #808080 #808080 #fff;
            background-color: #c0c0c0;
            box-sizing: border-box;
            min-width: 35px;
            min-height: 25px;
            padding: 0;
            margin: 0;
            font-size: 11px;
          }
          
          button:active {
            border-color: #808080 #fff #fff #808080;
          }
          
          .main-button {
            min-width: 30px;
            min-height: 25px;
            width: 100%;
            height: 25px;
            font-family: Arial, sans-serif;
            font-size: 11px;
            margin: 0;
            padding: 0;
          }
          
          .memory-button {
            text-align: center;
            color: red;
            font-weight: normal;
            font-size: 11px;
          }
        `}</style>
      </div>
    );
  }
}

export default Windows98Calculator;