import React, { useState, useRef, useEffect } from "react";

/**
 * Interactive chat balloon component for Clippy
 */
const ChatBalloon = ({ initialMessage, position, onClose, onSendMessage }) => {
  const [messages, setMessages] = useState([
    { text: initialMessage, sender: "clippy" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messageEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const balloonStyle = {
    position: "fixed",
    zIndex: 9999,
    backgroundColor: "#fffcde",
    border: "1px solid #000",
    borderRadius: "5px",
    padding: "8px",
    width: "220px",
    height: "180px",
    boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
    fontFamily: "Tahoma, Arial, sans-serif",
    fontSize: "12px",
    left: `${position.left}px`,
    top: `${position.top}px`,
    display: "flex",
    flexDirection: "column",
    transition: "none",
    animation: "none",
    visibility: "visible",
    opacity: 1,
  };

  const messageContainerStyle = {
    flex: 1,
    overflowY: "auto",
    marginBottom: "5px",
    padding: "5px",
  };

  const inputContainerStyle = {
    display: "flex",
    borderTop: "1px solid #ccc",
    padding: "5px 0 0 0",
  };

  const inputStyle = {
    flex: 1,
    border: "1px solid #999",
    padding: "4px",
    fontSize: "12px",
    fontFamily: "Tahoma, Arial, sans-serif",
    borderRadius: "3px",
    marginRight: "5px",
  };

  const buttonStyle = {
    background: "#d4d0c8",
    border: "1px solid #888",
    padding: "2px 8px",
    borderRadius: "2px",
    fontFamily: "Tahoma, Arial, sans-serif",
    fontSize: "12px",
    cursor: "pointer",
  };

  const closeButtonStyle = {
    position: "absolute",
    top: "2px",
    right: "2px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
    background: "none",
    border: "none",
    padding: "2px 5px",
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

  return (
    <div style={balloonStyle} className="custom-clippy-chat-balloon">
      <button style={closeButtonStyle} onClick={onClose}>
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
