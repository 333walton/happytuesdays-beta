import React from "react";

const FunctionButton = ({ value, keyFunction }) => (
  <button className="main-button" onClick={keyFunction}>
    {value}
  </button>
);

export default FunctionButton;
