import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  useClippy,
  ClippyProvider as ReactClippyProvider,
} from "@react95/clippy";

// Import extracted components
import CustomBalloon from "./CustomBalloon";
import ChatBalloon from "./ChatBalloon";
import ClippyController from "./ClippyController";

import "./_styles.scss";

// CSS for improved Clippy styling
const improvedClippyStyles = `
    /* Reset clippy position styles */
    .clippy {
      position: absolute;
      transition: transform 0.2s ease;
      will-change: transform, left, top;
      z-index: 2000 !important;
    }
    
    /* Fix original balloon visibility */
    .clippy-balloon {
      opacity: 0 !important;
      visibility: hidden !important;
      display: none !important;
      pointer-events: none !important;
    }
    
    /* Custom balloon styles */
    .custom-clippy-balloon {
      position: fixed !important;
      z-index: 9999 !important;
      background-color: #fffcde !important;
      border: 1px solid #000 !important;
      border-radius: 5px !important;
      padding: 8px 12px !important;
      box-shadow: 2px 2px 4px rgba(0,0,0,0.2) !important;
      max-width: 250px !important;
      font-family: 'Tahoma', sans-serif !important;
      font-size: 13px !important;
      visibility: visible !important;
      display: block !important;
      opacity: 1 !important;
    }
    
    /* Ensure chat balloon is visible */
    .custom-clippy-chat-balloon {
      visibility: visible !important;
      opacity: 1 !important;
      display: block !important;
    }
    `;

// Create context
const ClippyContext = createContext(null);

/**
 * Provider component that makes Clippy available throughout the app
 */
const ClippyProvider = ({
  children,
  defaultAgent = "Clippy",
  fixedPosition = false,
}) => {
  const [assistantVisible, setAssistantVisible] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(defaultAgent);
  const [position, setPosition] = useState(() => ({
    x: 520,
    y: 360,
  }));
  const [userPositioned, setUserPositioned] = useState(false);
  const clippyInstanceRef = useRef(null);
  const desktopRectRef = useRef(null);
  const isMobileRef = useRef(false);

  // Custom balloon states
  const [customBalloonVisible, setCustomBalloonVisible] = useState(false);
  const [customBalloonMessage, setCustomBalloonMessage] = useState("");
  const [chatBalloonVisible, setChatBalloonVisible] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState("");
  const [balloonPosition, setBalloonPosition] = useState({ left: 0, top: 0 });

  // Reference to track initial position settings
  const relativePositionRef = useRef({
    xPercent: 0.81,
    yPercent: 0.75,
  });

  // Add improved styles
  useEffect(() => {
    if (document.getElementById("improved-clippy-styles")) return;

    const styleEl = document.createElement("style");
    styleEl.id = "improved-clippy-styles";
    styleEl.textContent = improvedClippyStyles;
    document.head.appendChild(styleEl);

    return () => {
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    };
  }, []);

  // Detect if the user is on mobile
  useEffect(() => {
    isMobileRef.current =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
  }, []);

  // Add debugging helper
  useEffect(() => {
    window.debugClippy = () => {
      console.log("Clippy Elements:", document.querySelectorAll(".clippy"));
      console.log(
        "Default Balloon:",
        document.querySelector(".clippy-balloon")
      );
      console.log(
        "Custom Balloon:",
        document.querySelector(".custom-clippy-balloon")
      );
      console.log(
        "Chat Balloon:",
        document.querySelector(".custom-clippy-chat-balloon")
      );

      // Test balloon display
      if (window.clippy && window.showClippyCustomBalloon) {
        window.showClippyCustomBalloon("Testing custom balloon visibility");
        return "Test balloon triggered";
      }
      return "Clippy or custom balloon not available";
    };

    return () => {
      delete window.debugClippy;
    };
  }, []);

  // Make context values available globally for ClippyService
  useEffect(() => {
    // These window globals are used by ClippyService to control the assistant
    window.setAssistantVisible = setAssistantVisible;
    window.setCurrentAgent = setCurrentAgent;
    window.setClippyPosition = (newPos) => {
      if (!fixedPosition) {
        setPosition(newPos);
        setUserPositioned(false);
      }
    };

    // Add new function for the simplified initial position setting
    window.setClippyInitialPosition = (percentPos) => {
      if (!fixedPosition) {
        relativePositionRef.current = {
          xPercent: percentPos.xPercent || 0.85,
          yPercent: percentPos.yPercent || 0.85,
        };

        // If we already have a desktop element, calculate and apply position now
        if (desktopRectRef.current) {
          const desktopRect = desktopRectRef.current;
          const newPos = {
            x: desktopRect.width * relativePositionRef.current.xPercent,
            y: desktopRect.height * relativePositionRef.current.yPercent,
          };
          setPosition(newPos);
          setUserPositioned(false);
        }
      }
    };

    // Add custom balloon functions
    window.showClippyCustomBalloon = (message) => {
      // Calculate position based on Clippy's position
      const clippyElement = document.querySelector(".clippy");
      if (clippyElement) {
        const rect = clippyElement.getBoundingClientRect();
        setBalloonPosition({
          left: rect.left - 50,
          top: rect.top - 100,
        });
      }

      setCustomBalloonMessage(message);
      setCustomBalloonVisible(true);
      setChatBalloonVisible(false); // Hide chat if visible

      // Auto-hide after 8 seconds - increased since there's no close button
      setTimeout(() => {
        setCustomBalloonVisible(false);
      }, 8000);

      return true;
    };

    window.hideClippyCustomBalloon = () => {
      setCustomBalloonVisible(false);
      setChatBalloonVisible(false);
      return true;
    };

    window.showClippyChatBalloon = (initialMessage) => {
      // Calculate position based on Clippy's position
      const clippyElement = document.querySelector(".clippy");
      if (clippyElement) {
        const rect = clippyElement.getBoundingClientRect();
        setBalloonPosition({
          left: rect.left - 100,
          top: rect.top - 200,
        });
      }

      setChatInitialMessage(initialMessage);
      setChatBalloonVisible(true);
      setCustomBalloonVisible(false); // Hide regular balloon if visible

      return true;
    };

    window.getClippyInstance = () => clippyInstanceRef.current;

    return () => {
      delete window.setAssistantVisible;
      delete window.setCurrentAgent;
      delete window.setClippyPosition;
      delete window.setClippyInitialPosition;
      delete window.getClippyInstance;
      delete window.showClippyCustomBalloon;
      delete window.hideClippyCustomBalloon;
      delete window.showClippyChatBalloon;
    };
  }, [fixedPosition, desktopRectRef]);

  // Handle chat messages
  const handleChatMessage = (message, callback) => {
    // Here you could integrate with a real AI service
    // For now, we'll just respond with some basic responses
    setTimeout(() => {
      let response;
      const lowercaseMsg = message.toLowerCase();

      if (lowercaseMsg.includes("hello") || lowercaseMsg.includes("hi")) {
        response = "Hello there! How can I assist you with Windows 98?";
      } else if (lowercaseMsg.includes("help")) {
        response =
          "I can help with many Windows tasks. What specifically do you need assistance with?";
      } else if (
        lowercaseMsg.includes("file") ||
        lowercaseMsg.includes("explorer")
      ) {
        response =
          "To manage your files, open Windows Explorer from the Start menu or double-click on My Computer.";
      } else if (
        lowercaseMsg.includes("internet") ||
        lowercaseMsg.includes("web")
      ) {
        response =
          "You can browse the web using Internet Explorer. Find it in the Start menu!";
      } else {
        response =
          "I'm not sure about that. Is there something specific about Windows 98 you'd like to know?";
      }

      callback(response);
    }, 1000);
  };

  // Gather all values for the context
  const contextValue = {
    assistantVisible,
    setAssistantVisible,
    currentAgent,
    setCurrentAgent,
    position,
    setPosition: fixedPosition ? () => {} : setPosition,
    userPositioned,
    setUserPositioned: fixedPosition ? () => {} : setUserPositioned,
    desktopRectRef,
    isMobileRef,
    fixedPosition,
    setClippyInstance: (instance) => {
      clippyInstanceRef.current = instance;
      window.clippy = instance;
    },
    getClippyInstance: () => clippyInstanceRef.current,
  };

  return (
    <ClippyContext.Provider value={contextValue}>
      <ReactClippyProvider agentName={currentAgent}>
        {children}

        <ClippyController
          visible={assistantVisible}
          position={position}
          userPositioned={userPositioned}
          setUserPositioned={setUserPositioned}
          setPosition={setPosition}
          desktopRectRef={desktopRectRef}
          isMobileRef={isMobileRef}
          fixedPosition={fixedPosition}
          relativePositionRef={relativePositionRef}
          currentAgent={currentAgent}
          setCurrentAgent={setCurrentAgent}
          setAssistantVisible={setAssistantVisible}
          setClippyInstance={(instance) => {
            clippyInstanceRef.current = instance;
            window.clippy = instance;
          }}
        />

        {/* Add custom balloon components */}
        {customBalloonVisible && (
          <CustomBalloon
            message={customBalloonMessage}
            position={balloonPosition}
          />
        )}

        {chatBalloonVisible && (
          <ChatBalloon
            initialMessage={chatInitialMessage}
            position={balloonPosition}
            onClose={() => setChatBalloonVisible(false)}
            onSendMessage={handleChatMessage}
          />
        )}
      </ReactClippyProvider>
    </ClippyContext.Provider>
  );
};

// Hook for using the clippy context
export const useClippyContext = () => useContext(ClippyContext);

export default ClippyProvider;
