import React from "react";

const Display = ({ display }) => {
  return (
    <input
      id="display"
      type="text"
      value={display}
      readOnly
    />
  );
};

export default Display;
