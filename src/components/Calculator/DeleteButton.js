import React from "react";

const DeleteButton = ({ value, keyFunction }) => (
  <button className="main-button delete-button" onClick={keyFunction}>
    {value}
  </button>
);

export default DeleteButton;
