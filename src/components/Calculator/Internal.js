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
      pressedButtons: new Set()
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

  // Button press handling functions
  handleMouseDown = (id) => {
    const { pressedButtons } = this.state;
    pressedButtons.add(id);
    this.setState({ pressedButtons });
  }
  
  handleMouseUp = (id) => {
    const { pressedButtons } = this.state;
    pressedButtons.delete(id);
    this.setState({ pressedButtons });
  }

  renderDisplay() {
    return (
      <div className="display-container" style={displayContainerStyle}>
        <div className="windows98-display" style={displayStyle}>{this.state.display}</div>
      </div>
    );
  }

  renderDeleteButtonRow() {
    return (
      <div className="delete-button-row" style={deleteButtonRowStyle}>
        <span className="empty-box" style={emptyBoxStyle}></span>
        {this.renderDeleteButton(this.backSpace, "Backspace", false, 2)}
        {this.renderDeleteButton(this.backSpace, "CE", false, 2)}
        {this.renderDeleteButton(this.clearDisplay, "C")}
      </div>
    );
  }

  renderDeleteButton(fn, val) {
    const buttonId = `delete-${val}`;
    const isPressed = this.state.pressedButtons.has(buttonId);
    const style = {
      ...(isPressed ? pressedButtonStyle : buttonStyle),
      width: '100%'
    };
    
    return (
      <button 
        onClick={fn} 
        className="main-button delete-button" 
        style={style}
        onMouseDown={() => this.handleMouseDown(buttonId)}
        onMouseUp={() => this.handleMouseUp(buttonId)}
        onMouseLeave={() => this.handleMouseUp(buttonId)}
      >
        <span style={{ color: "red" }}>{val}</span>
      </button>
    );
  }

  renderNumberButton(val) {
    const buttonId = `number-${val}`;
    const isPressed = this.state.pressedButtons.has(buttonId);
    const style = {
      ...(isPressed ? pressedButtonStyle : buttonStyle),
      width: '100%'
    };
    return (
      <button 
        onClick={() => this.printNumber(val)} 
        className="main-button" 
        style={style}
        onMouseDown={() => this.handleMouseDown(buttonId)}
        onMouseUp={() => this.handleMouseUp(buttonId)}
        onMouseLeave={() => this.handleMouseUp(buttonId)}
      >
        {val}
      </button>
    );
  }

  renderFunctionButton(fn, val) {
    const isOp = ["+", "-", "*", "/", "="].includes(val);
    const buttonId = `function-${val}`;
    const isPressed = this.state.pressedButtons.has(buttonId);
    const style = {
      ...(isPressed ? pressedButtonStyle : buttonStyle),
      width: '100%'
    };
    return (
      <button 
        onClick={fn} 
        className="main-button" 
        style={style}
        onMouseDown={() => this.handleMouseDown(buttonId)}
        onMouseUp={() => this.handleMouseUp(buttonId)}
        onMouseLeave={() => this.handleMouseUp(buttonId)}
      >
        <span style={{ color: isOp ? "blue" : "black" }}>{val}</span>
      </button>
    );
  }

  renderMemoryButton(fn, val) {
    const buttonId = `memory-${val}`;
    const isPressed = this.state.pressedButtons.has(buttonId);
    const style = {
      ...(isPressed ? pressedButtonStyle : buttonStyle),
      width: '100%'
    };
    
    return (
      <button 
        onClick={fn} 
        className="memory-button main-button" 
        style={style}
        onMouseDown={() => this.handleMouseDown(buttonId)}
        onMouseUp={() => this.handleMouseUp(buttonId)}
        onMouseLeave={() => this.handleMouseUp(buttonId)}
      >
        <span style={{ color: "red" }}>{val}</span>
      </button>
    );
  }

  renderMainButtonsGrid() {
    return (
      <div className="main-grid" style={gridStyle}>
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

  renderCalculator() {
    return (
      <div className="calculator-grid" style={calculatorGridStyle}>
        {/* Row 1: MC, 7, 8, 9, /, sqrt */}
        <div className="calc-row" style={calcRowStyle}>
          <div style={{flex: '1', marginRight: '8px'}}>
            {this.renderMemoryButton(this.clearMemoryStore, "MC")}
          </div>
          <div style={{flex: '5', display: 'flex', gap: '4px'}}>
            {this.renderNumberButton(7)}
            {this.renderNumberButton(8)}
            {this.renderNumberButton(9)}
            {this.renderFunctionButton(this.division, "/")}
            {this.renderFunctionButton(this.squareRoot, "sqrt")}
          </div>
        </div>
        
        {/* Row 2: MR, 4, 5, 6, *, % */}
        <div className="calc-row" style={calcRowStyle}>
          <div style={{flex: '1', marginRight: '8px'}}>
            {this.renderMemoryButton(this.retrieveMemoryStore, "MR")}
          </div>
          <div style={{flex: '5', display: 'flex', gap: '4px'}}>
            {this.renderNumberButton(4)}
            {this.renderNumberButton(5)}
            {this.renderNumberButton(6)}
            {this.renderFunctionButton(this.multiplication, "*")}
            {this.renderFunctionButton(this.percent, "%")}
          </div>
        </div>
        
        {/* Row 3: MS, 1, 2, 3, -, 1/x */}
        <div className="calc-row" style={calcRowStyle}>
          <div style={{flex: '1', marginRight: '8px'}}>
            {this.renderMemoryButton(this.addToMemoryStore, "MS")}
          </div>
          <div style={{flex: '5', display: 'flex', gap: '4px'}}>
            {this.renderNumberButton(1)}
            {this.renderNumberButton(2)}
            {this.renderNumberButton(3)}
            {this.renderFunctionButton(this.subtraction, "-")}
            {this.renderFunctionButton(this.reciprocal, "1/x")}
          </div>
        </div>
        
        {/* Row 4: M+, 0, +/-, ., +, = */}
        <div className="calc-row" style={calcRowStyle}>
          <div style={{flex: '1', marginRight: '8px'}}>
            {this.renderMemoryButton(this.addToCurrentMemoryStore, "M+")}
          </div>
          <div style={{flex: '5', display: 'flex', gap: '4px'}}>
            {this.renderNumberButton(0)}
            {this.renderFunctionButton(this.toggleNegative, "+/-")}
            {this.renderFunctionButton(this.addDecimal, ".")}
            {this.renderFunctionButton(this.addition, "+")}
            {this.renderFunctionButton(this.compute, "=")}
          </div>
        </div>
      </div>
    );
  }
  
  renderTopRow() {
    return (
      <div className="top-row" style={topRowStyle}>
        <div style={{flex: '1', marginRight: '8px'}}>
          <div className="empty-box" style={{
            width: '100%',
            height: '32px',
            backgroundColor: '#bbc3c4',
            boxSizing: 'border-box'
          }}></div>
        </div>
        <div style={{flex: '5', display: 'flex', gap: '4px'}}>
          <div style={{flex: '2'}}>
            {this.renderDeleteButton(this.backSpace, "Backspace")}
          </div>
          <div style={{flex: '2'}}>
            {this.renderDeleteButton(this.backSpace, "CE")}
          </div>
          <div style={{flex: '1'}}>
            {this.renderDeleteButton(this.clearDisplay, "C")}
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="windows98-calculator" style={calculatorStyle}>
        {this.renderDisplay()}
        {this.renderTopRow()}
        {this.renderCalculator()}
      </div>
    );
  }
}

// Windows 98 style constants - IMPROVED FOR PERFECT ALIGNMENT
const calculatorGridStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '4px'
};

const calcRowStyle = {
  display: 'flex',
  width: '100%',
  gap: '0px', // Removed gap here as we're controlling it in the inner containers
  marginBottom: '4px'
};

const topRowStyle = {
  display: 'flex',
  width: '100%',
  gap: '4px',
  marginBottom: '4px'
};
const calculatorStyle = {
  backgroundColor: '#bbc3c4',
  padding: '8px',
  border: '2px solid',
  borderColor: '#ffffff #808080 #808080 #ffffff',
  fontFamily: '"MS Sans Serif", Arial, sans-serif',
  boxSizing: 'border-box',
  width: '360px', // Fixed width instead of fit-content
  maxWidth: '100%', // Ensures responsiveness
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column'
};

// New style for delete button row to ensure proper layout
const deleteButtonRowStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: '4px',
  marginBottom: '4px',
  width: '100%'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: '4px',
  alignItems: 'stretch',
  width: '100%'
};

const displayContainerStyle = {
  marginBottom: '10px'
};

const displayStyle = {
  backgroundColor: '#ffffff',
  border: '2px solid',
  borderColor: '#808080 #ffffff #ffffff #808080',
  boxShadow: 'inset 1px 1px 0px #000000',
  padding: '5px 8px',
  textAlign: 'right',
  fontFamily: 'Digital, monospace',
  fontSize: '16px',
  height: '25px',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  overflow: 'hidden',  // Prevent text overflow
  whiteSpace: 'nowrap' // Keep text on one line
};

// Style for the empty box in top row
const emptyBoxStyle = {
  display: 'block',
  flex: '1',
  height: '28px',
  backgroundColor: '#bbc3c4',
  boxSizing: 'border-box',
  border: '2px solid transparent'
};

// Common button styles - with consistent dimensions and proper box-sizing
const baseButtonStyle = {
  boxSizing: 'border-box',
  fontFamily: '"MS Sans Serif", Arial, sans-serif',
  fontSize: '13px',
  textAlign: 'center',
  cursor: 'pointer',
  position: 'relative',
  outline: 'none',
  height: '32px',
  padding: '4px'
};

const buttonStyle = {
  ...baseButtonStyle,
  border: '2px solid',
  borderColor: '#ffffff #808080 #808080 #ffffff',
  boxShadow: '1px 1px 0px #000000',
  backgroundColor: '#bbc3c4',
  flex: '1'
};

// Style for pressed buttons
const pressedButtonStyle = {
  ...baseButtonStyle,
  border: '2px solid',
  borderColor: '#808080 #ffffff #ffffff #808080',
  boxShadow: 'inset 1px 1px 0px #000000',
  backgroundColor: '#bbc3c4',
  transform: 'translateY(1px) translateX(1px)',
  flex: '1'
};

// Style for buttons that need full height alignment
const fullHeightButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default Windows98Calculator;