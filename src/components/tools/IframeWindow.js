import React, { useState } from "react";
import Window from "./Window";

const IframeWindow = ({ data, ...props }) => {
  const { src, title } = data || {};
  const [iframeError, setIframeError] = useState(false);

  const handleIframeError = () => {
    setIframeError(true);
  };

  return (
    <Window {...props} title={title || "Iframe Viewer"}>
      {iframeError || !src ? (
        <div style={{ padding: "10px", textAlign: "center" }}>
          <p>The website cannot be displayed in an iframe.</p>
          {src ? (
            <a href={src} target="_blank" rel="noopener noreferrer">
              Open in a new tab
            </a>
          ) : (
            <p>Invalid URL provided.</p>
          )}
        </div>
      ) : (
        <iframe
          src={typeof src === "string" ? src : ""}
          title={title}
          style={{ width: "100%", height: "100%", border: "none" }}
          onError={handleIframeError}
        />
      )}
    </Window>
  );
};

export default IframeWindow;
