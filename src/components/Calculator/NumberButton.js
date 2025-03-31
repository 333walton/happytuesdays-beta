import React from "react";

const NumberButton = ({ value, printNumber }) => (
  <button className="main-button" onClick={() => printNumber(value)}>
    {value}
  </button>
);

export default NumberButton;
