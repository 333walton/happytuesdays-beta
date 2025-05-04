import React, { useEffect, useState } from "react";
import figlet from "figlet";

const FigletText = React.forwardRef(({ text, font = "Standard", onAsciiGenerated, textColor = "green", ...props }, ref) => {
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
      ref={ref}
      {...props}
      style={{
        fontFamily: "monospace",
        fontSize: "10.5px",
        whiteSpace: "pre",
        lineHeight: "1.1",
        margin: 0,
        width: "auto",
        height: "auto",
        padding: 0,
        paddingTop: "7px",
        paddingBottom: "7px",
        color: textColor === "white" ? "#FFFFFF" : "#00FF00",
        background: "black",
        overflowX: "auto",
        transform: "scale(0.9)",
        transformOrigin: "center", // Keeps the content aligned to center
      }}
    >
      {ascii}
    </pre>
  );
});

export default FigletText;