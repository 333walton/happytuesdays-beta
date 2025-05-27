import React, { useState, useEffect, useRef } from "react";

/**
 * Interactive chat balloon for Clippy assistant
 * Updated to match working console implementation
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

  // Handle message submission - updated to match console logic
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() === "" || loading) return;

    // Add user message
    const userMessage = inputValue.trim();
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setInputValue("");
    setLoading(true);

    // Add thinking indicator
    setMessages((prev) => [
      ...prev,
      { text: "Clippy is thinking...", sender: "thinking" },
    ]);

    // Generate response after delay - using same logic as console
    setTimeout(() => {
      setLoading(false);

      // Remove thinking message and add response
      setMessages((prev) => {
        const withoutThinking = prev.filter((msg) => msg.sender !== "thinking");

        // Simple response logic matching console implementation
        const responses = {
          hello: "Hello there! How can I assist you today?",
          help: "I can help with many things! Try asking me about Hydra98 or just chat with me.",
          hydra:
            "Hydra98 is an amazing Windows 98 desktop emulator! What do you think of it?",
          thanks:
            "You're very welcome! Is there anything else I can help you with?",
          bye: "Goodbye! Click the X to close this chat anytime.",
          default:
            "That's interesting! Tell me more, or ask me something else.",
        };

        const lowerText = userMessage.toLowerCase();
        let response = responses.default;

        for (const [key, value] of Object.entries(responses)) {
          if (lowerText.includes(key)) {
            response = value;
            break;
          }
        }

        return [...withoutThinking, { text: response, sender: "clippy" }];
      });
    }, 1500);
  };

  return (
    <div
      className="custom-clippy-chat-balloon"
      style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s, transform 0.3s",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",

        // Styling to match console implementation
        background: "#fffcde",
        border: "3px solid #000",
        borderRadius: "8px",
        padding: "20px",
        fontFamily: "Tahoma, sans-serif",
        fontSize: "14px",
        width: "350px",
        height: "300px",
        color: "#000",
        WebkitTextFillColor: "#000", // iOS Safari fix
        boxShadow: "4px 4px 8px rgba(0,0,0,0.3)",
      }}
    >
      {/* Close button */}
      <button
        className="custom-clippy-balloon-close"
        onClick={onClose}
        aria-label="Close chat"
        style={{
          position: "absolute",
          top: "8px",
          right: "12px",
          background: "none",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
          color: "#666",
          WebkitTextFillColor: "#666", // iOS Safari fix
          padding: "4px 8px",
          minWidth: "32px",
          minHeight: "32px",
        }}
      >
        ×
      </button>

      {/* Title */}
      <div
        style={{
          marginBottom: "12px",
          fontWeight: "bold",
          fontSize: "16px",
          color: "#000",
        }}
      >
        💬 Chat with Clippy
      </div>

      {/* Messages container */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          border: "2px inset #ccc",
          background: "white",
          padding: "8px",
          marginBottom: "12px",
          color: "#000",
          minHeight: "180px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              margin: "8px 0",
              color:
                msg.sender === "user"
                  ? "#000080"
                  : msg.sender === "thinking"
                  ? "#666"
                  : "#000",
              WebkitTextFillColor:
                msg.sender === "user"
                  ? "#000080"
                  : msg.sender === "thinking"
                  ? "#666"
                  : "#000", // iOS Safari fix
              textAlign: msg.sender === "user" ? "right" : "left",
              fontStyle: msg.sender === "thinking" ? "italic" : "normal",
            }}
          >
            {msg.sender === "thinking" ? (
              msg.text
            ) : (
              <>
                <strong>{msg.sender === "user" ? "You" : "Clippy"}:</strong>{" "}
                {msg.text}
              </>
            )}
          </div>
        ))}

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "8px",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "8px",
            border: "2px inset #ccc",
            fontSize: "14px",
            color: "#000",
            WebkitTextFillColor: "#000", // iOS Safari fix
            fontFamily: "Tahoma, sans-serif",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: "#c0c0c0",
            border: "2px outset #c0c0c0",
            fontSize: "14px",
            cursor: "pointer",
            color: "#000",
            WebkitTextFillColor: "#000", // iOS Safari fix
            fontFamily: "Tahoma, sans-serif",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBalloon;
