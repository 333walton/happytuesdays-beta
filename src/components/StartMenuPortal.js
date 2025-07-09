import React, { useEffect } from "react";
import ReactDOM from "react-dom";

export default function StartMenuPortal({ children }) {
  const isMobile =
    typeof window !== "undefined" &&
    (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.innerWidth <= 768);

    
    useEffect(() => {
  const portal = document.querySelector('.StartMenuPortal');
  if (portal) {
    const btn = portal.querySelector('.btn.StartButton');
    if (btn) btn.classList.add('portaled-start-btn');
  }
}, []);
    
  console.log("StartMenuPortal rendered. isMobile:", isMobile, "window.innerWidth:", window.innerWidth, "userAgent:", navigator.userAgent);

  if (isMobile) {
    return ReactDOM.createPortal(children, document.body);
  }
  return children;
}