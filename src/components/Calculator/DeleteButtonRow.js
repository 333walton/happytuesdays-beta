import React from "react";

const DeleteButton = ({ keyFunction, value }) => {
  return (
    <button className="button" onClick={keyFunction}>
      {value}
    </button>
  );
};

export default DeleteButton;



