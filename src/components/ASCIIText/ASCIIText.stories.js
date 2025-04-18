
import React from "react";
import ASCIIText from "./ASCIIText";

// Normal themed story (wrapped by global decorators)
export default {
  title: "Components/ASCIIText",
  component: ASCIIText,
};

// Normal, with packard-belle theme
export const Themed = () => <ASCIIText />;

