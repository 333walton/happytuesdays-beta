import React, { useEffect, useState } from "react";
import figlet from "figlet";

const FigletText = ({ text, font = "Standard", onAsciiGenerated, ...props }) => {
  const [ascii, setAscii] = useState("");

  useEffect(() => {
    const loadFont = async () => {
      try {
        const module = await import(`figlet/importable-fonts/${font}.js`);
        figlet.parseFont(font, module.default);

        figlet.text(text.toUpperCase(), { font }, (err, result) => {
          if (err) {
            console.error("Figlet error:", err);
            setAscii("Error generating ASCII");
            return;
          }
          setAscii(result);
          if (onAsciiGenerated) onAsciiGenerated(result);
        });
      } catch (err) {
        console.error(`Failed to load font "${font}"`, err);
        setAscii("Font not available.");
      }
    };

    loadFont();
  }, [text, font, onAsciiGenerated]);

  return (
    <pre
      {...props}
      style={{
        fontFamily: "monospace",
        fontSize: "13px",
        whiteSpace: "pre",
        lineHeight: "1.1",
        margin: 0,
        padding: 0,
        color: "#00FF00",
        background: "black",
        overflowX: "auto",
      }}
    >
      {ascii}
    </pre>
  );
};

export default FigletText;