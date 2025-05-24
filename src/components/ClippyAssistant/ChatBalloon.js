import React, { useState, useEffect, useRef } from "react";

/**
 * Interactive chat balloon for Clippy assistant
 * Allows for two-way communication with the assistant
 */
const ChatBalloon = ({ initialMessage, position, onClose, onSendMessage }) => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Add initial message and focus input field when mounted
  useEffect(() => {
    if (initialMessage) {
      setMessages([{ text: initialMessage, sender: "clippy" }]);
    }

    // Animation timing
    const showTimer = setTimeout(() => {
      setVisible(true);

      // Focus input after animation completes
      const focusTimer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);

      return () => clearTimeout(focusTimer);
    }, 50);

    return () => clearTimeout(showTimer);
  }, [initialMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() === "" || loading) return;

    // Add user message
    const userMessage = inputValue.trim();
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setInputValue("");
    setLoading(true);

    // Get response from Clippy
    if (onSendMessage) {
      onSendMessage(userMessage, (response) => {
        setMessages((prev) => [...prev, { text: response, sender: "clippy" }]);
        setLoading(false);
      });
    } else {
      // Fallback response if no handler provided
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: "I'm not sure how to respond to that.", sender: "clippy" },
        ]);
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div
      className="custom-clippy-chat-balloon"
      style={{
        position: "fixed",
        left: `${position.left}px`,
        top: `${position.top}px`,
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : "10px"})`,
        transition: "opacity 0.3s, transform 0.3s",
        zIndex: 2100,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Close button */}
      <button
        className="custom-clippy-balloon-close"
        onClick={onClose}
        aria-label="Close chat"
      >
        ×
      </button>

      {/* Messages container */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "4px",
          marginBottom: "4px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: "8px",
              textAlign: msg.sender === "user" ? "right" : "left",
              color: msg.sender === "user" ? "#000080" : "#000000",
            }}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div style={{ textAlign: "left", color: "#666" }}>Thinking...</div>
        )}

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "4px",
          marginTop: "auto",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          className="clippy-input"
          style={{
            flex: 1,
            padding: "4px",
          }}
          disabled={loading}
        />
        <button
          type="submit"
          className="clippy-option-button"
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBalloon;
