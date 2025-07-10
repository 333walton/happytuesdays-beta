import React, { useEffect, useState } from "react";
import handPointerIcon from "../../../icons/HandPointer16-min.png";
import "../styles/FloatingHandPointer.scss";

const FloatingHandPointer = ({ duration = 8000, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after duration
    const hideTimeout = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, duration);

    return () => {
      clearTimeout(hideTimeout);
    };
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <div className="floating-hand-pointer">
      <img src={handPointerIcon} alt="Pointer" />
    </div>
  );
};

export default FloatingHandPointer;
