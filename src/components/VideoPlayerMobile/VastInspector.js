// src/components/VideoPlayerMobile/VastInspector.js
import React, { useState } from "react";

const VastInspector = () => {
  const [vastInput, setVastInput] = useState("");
  const [mediaSrc, setMediaSrc] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  const handleValidate = () => {
    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(vastInput, "text/xml");

      const mediaFile = xml.querySelector("MediaFile");
      const impression = xml.querySelector("Impression");
      const errorUrl = xml.querySelector("Error");
      const clickThrough = xml.querySelector("ClickThrough");

      setMediaSrc(mediaFile?.textContent || null);

      setValidationResult({
        mediaFile: mediaFile?.textContent || "Not found",
        impression: impression?.textContent || "Not found",
        errorUrl: errorUrl?.textContent || "Not found",
        clickThrough: clickThrough?.textContent || "Not found",
      });
    } catch (err) {
      setValidationResult({ error: "Invalid XML format." });
      setMediaSrc(null);
    }
  };

  return (
    <div style={{ padding: "6px", fontSize: "11px", fontFamily: "monospace" }}>
      <textarea
        rows="3"
        value={vastInput}
        onChange={(e) => setVastInput(e.target.value)}
        placeholder="Paste VAST XML here"
        style={{
          width: "100%",
          background: "black",
          color: "#00ff00",
          fontSize: "11px",
          resize: "none",
          border: "1px solid #444",
          padding: "4px",
        }}
      />
      <button
        onClick={handleValidate}
        style={{
          marginTop: "4px",
          padding: "2px 8px",
          fontSize: "11px",
          backgroundColor: "#222",
          color: "#fff",
          border: "1px solid #555",
          cursor: "pointer",
        }}
      >
        Validate Tag
      </button>

      {validationResult && (
        <div style={{ marginTop: "8px", color: "#fff" }}>
          {validationResult.error ? (
            <div style={{ color: "red" }}>{validationResult.error}</div>
          ) : (
            <ul style={{ paddingLeft: "14px" }}>
              <li><strong>MediaFile:</strong> {validationResult.mediaFile}</li>
              <li><strong>Impression:</strong> {validationResult.impression}</li>
              <li><strong>Error URL:</strong> {validationResult.errorUrl}</li>
              <li><strong>ClickThrough:</strong> {validationResult.clickThrough}</li>
            </ul>
          )}
        </div>
      )}

      {mediaSrc && (
        <div style={{ marginTop: "8px" }}>
          <video
            src={mediaSrc}
            controls
            width="100%"
            style={{ maxHeight: "160px", border: "1px solid #333" }}
          />
        </div>
      )}
    </div>
  );
};

export default VastInspector;
