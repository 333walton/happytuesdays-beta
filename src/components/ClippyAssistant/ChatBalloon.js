import React, { useState, useRef, useEffect } from "react";

// Mobile detection
const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

/**
 * Interactive chat balloon component for Clippy
 * Optimized for mobile devices
 */
const ChatBalloon = ({ initialMessage, position, onClose, onSendMessage }) => {
  const [messages, setMessages] = useState([
    { text: initialMessage, sender: "clippy" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messageEndRef = useRef(null);
  const balloonRef = useRef(null);
  const positioningRafRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle positioning with requestAnimationFrame for better performance
  useEffect(() => {
    if (balloonRef.current) {
      const positionBalloon = () => {
        // Apply position from props
        if (position) {
          balloonRef.current.style.left = `${position.left}px`;
          balloonRef.current.style.top = `${position.top}px`;
        } else {
          // Position relative to Clippy if no position provided
          const clippyElement = document.querySelector(".clippy");
          if (clippyElement) {
            const rect = clippyElement.getBoundingClientRect();
            const left = rect.left + rect.width / 2 - 110; // Center 220px wide balloon
            const top = rect.top - 200; // Well above Clippy
            balloonRef.current.style.left = `${left}px`;
            balloonRef.current.style.top = `${top}px`;
          }
        }
      };

      // Initial positioning
      positionBalloon();

      // Set up continuous positioning with requestAnimationFrame
      // Use less frequent updates on mobile
      let lastUpdateTime = 0;
      const updateInterval = isMobile ? 500 : 100;

      const updatePosition = (timestamp) => {
        if (timestamp - lastUpdateTime >= updateInterval) {
          positionBalloon();
          lastUpdateTime = timestamp;
        }
        positioningRafRef.current = requestAnimationFrame(updatePosition);
      };

      positioningRafRef.current = requestAnimationFrame(updatePosition);

      return () => {
        if (positioningRafRef.current) {
          cancelAnimationFrame(positioningRafRef.current);
        }
      };
    }
  }, [position]);

  const handleSend = () => {
    if (inputValue.trim() === "") return;

    // Add user message
    setMessages([...messages, { text: inputValue, sender: "user" }]);

    // Send to parent handler for processing
    if (onSendMessage) {
      onSendMessage(inputValue, (response) => {
        // Add clippy response when it comes back
        setMessages((prev) => [...prev, { text: response, sender: "clippy" }]);
      });
    }

    setInputValue("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Optimized balloon style for mobile
  const balloonStyle = {
    position: "fixed",
    zIndex: 9999,
    backgroundColor: "#fffcde",
    border: "1px solid #000",
    borderRadius: "5px",
    padding: isMobile ? "10px" : "8px",
    width: isMobile ? "260px" : "220px",
    height: isMobile ? "220px" : "180px",
    boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
    fontFamily: "Tahoma, Arial, sans-serif",
    fontSize: isMobile ? "14px" : "12px",
    left: `${position.left}px`,
    top: `${position.top}px`,
    display: "flex",
    flexDirection: "column",
    transition: "none",
    animation: "none",
    visibility: "visible",
    opacity: 1,
    // Fix for iOS rendering
    WebkitBackfaceVisibility: "hidden",
    backfaceVisibility: "hidden",
  };

  const messageContainerStyle = {
    flex: 1,
    overflowY: "auto",
    marginBottom: "5px",
    padding: "5px",
    WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
  };

  const inputContainerStyle = {
    display: "flex",
    borderTop: "1px solid #ccc",
    padding: "5px 0 0 0",
  };

  const inputStyle = {
    flex: 1,
    border: "1px solid #999",
    padding: isMobile ? "6px" : "4px",
    fontSize: isMobile ? "14px" : "12px",
    fontFamily: "Tahoma, Arial, sans-serif",
    borderRadius: "3px",
    marginRight: "5px",
  };

  const buttonStyle = {
    background: "#d4d0c8",
    border: "1px solid #888",
    padding: isMobile ? "4px 10px" : "2px 8px",
    borderRadius: "3px",
    fontFamily: "Tahoma, Arial, sans-serif",
    fontSize: isMobile ? "14px" : "12px",
    cursor: "pointer",
    minWidth: isMobile ? "60px" : "auto", // Larger touch target on mobile
  };

  const closeButtonStyle = {
    position: "absolute",
    top: "2px",
    right: "2px",
    cursor: "pointer",
    fontSize: isMobile ? "20px" : "12px",
    fontWeight: "bold",
    background: "none",
    border: "none",
    padding: isMobile ? "5px 8px" : "2px 5px",
  };

  const clippyMessageStyle = {
    background: "#ffffcc",
    padding: "4px 8px",
    borderRadius: "8px 8px 8px 0",
    marginBottom: "6px",
    maxWidth: "80%",
    alignSelf: "flex-start",
  };

  const userMessageStyle = {
    background: "#d4d0c8",
    padding: "4px 8px",
    borderRadius: "8px 8px 0 8px",
    marginBottom: "6px",
    maxWidth: "80%",
    alignSelf: "flex-end",
    textAlign: "right",
  };

  // Add a triangle tip at the bottom
  const tipStyle = {
    position: "absolute",
    bottom: "-10px",
    left: "20px",
    width: "0",
    height: "0",
    borderLeft: "10px solid transparent",
    borderRight: "10px solid transparent",
    borderTop: "10px solid #fffcde",
    zIndex: 9998,
  };

  const tipBorderStyle = {
    position: "absolute",
    bottom: "-11px",
    left: "19px",
    width: "0",
    height: "0",
    borderLeft: "11px solid transparent",
    borderRight: "11px solid transparent",
    borderTop: "11px solid #000",
    zIndex: 9997,
  };

  const handleClose = () => {
    // Clean up animation frame
    if (positioningRafRef.current) {
      cancelAnimationFrame(positioningRafRef.current);
    }

    // Call onClose handler
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      ref={balloonRef}
      style={balloonStyle}
      className="custom-clippy-chat-balloon"
    >
      <button style={closeButtonStyle} onClick={handleClose}>
        ×
      </button>

      <div style={messageContainerStyle}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={
                msg.sender === "user" ? userMessageStyle : clippyMessageStyle
              }
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div style={inputContainerStyle}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          style={inputStyle}
          placeholder="Type your message..."
        />
        <button onClick={handleSend} style={buttonStyle}>
          Send
        </button>
      </div>

      <div style={tipBorderStyle}></div>
      <div style={tipStyle}></div>
    </div>
  );
};

export default ChatBalloon;
