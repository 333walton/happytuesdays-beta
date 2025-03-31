import React from "react";

const MemoryButton = ({ value, keyFunction }) => (
  <button className="main-button memory-button" onClick={keyFunction}>
    {value}
  </button>
);

export default MemoryButton;
