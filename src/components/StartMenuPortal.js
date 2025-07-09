import React from "react";
import ReactDOM from "react-dom";

export default function StartMenuPortal({ children }) {
  // Only portal on mobile devices
  const isMobile =
    typeof window !== "undefined" &&
    (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.innerWidth <= 768);

  if (isMobile) {
    return ReactDOM.createPortal(children, document.body);
  }
  return children;
}