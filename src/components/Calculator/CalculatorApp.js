import React from "react";
import Win98Calculator from "./Win98Calculator";
import Window from "../tools/Window";
import * as icons from "../../icons";

const CalculatorApp = (props) => {
  return (
    <Window
      {...props}
      title="Calculator"
      icon={icons.calculator16}
      initialHeight={400}
      initialWidth={300}
    >
      <Win98Calculator />
    </Window>
  );
};

export default CalculatorApp;
