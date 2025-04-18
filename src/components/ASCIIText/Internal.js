import React, { useEffect, useState } from "react";
import figlet from "figlet";

import standard from "../../../node_modules/figlet/importable-fonts/Standard.js";
import slant from "../../../node_modules/figlet/importable-fonts/Slant.js";
import ghost from "../../../node_modules/figlet/importable-fonts/Ghost.js";
//import graffiti from "../../../node_modules/figlet/importable-fonts/Graffiti.js";
import subzero from "../../../node_modules/figlet/importable-fonts/Sub-Zero.js";
import smallFont from "../../../node_modules/figlet/importable-fonts/Small.js";

figlet.parseFont("Standard", standard);
figlet.parseFont("Slant", slant);
figlet.parseFont("Ghost", ghost);
//figlet.parseFont("Graffiti", graffiti);
figlet.parseFont("Sub-Zero", subzero);
figlet.parseFont("Small", smallFont);

const FigletText = ({ text, font = "Standard", ...props }) => {
  const [ascii, setAscii] = useState("");

  useEffect(() => {
    figlet.text(text.toUpperCase(), { font }, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      setAscii(result);
    });
  }, [text, font]);

  return (
  <pre
    {...props}
    style={{
      fontFamily: 'monospace',
      fontSize: '13px',
      whiteSpace: 'pre',
      lineHeight: '1.1',
      margin: 0,
      padding: 0,
      color: '#00FF00',       // or white
      background: 'black',    // classic terminal look
      overflowX: 'auto',
    }}
  >
    {ascii}
  </pre>
);
};

export default FigletText;