import React, { useState, useEffect, useContext } from "react";
import { ProgramContext } from "../../contexts";
import AOLNewsletterFunnel from "./AOLNewsletterFunnel";

const NewsletterFunnelManager = ({ children }) => {
  const [showFunnel, setShowFunnel] = useState(false);
  const [hasShownThisSession, setHasShownThisSession] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(null);
  const programContext = useContext(ProgramContext);

  // Debug log
  console.log("NewsletterFunnelManager state:", {
    showFunnel,
    hasShownThisSession,
  });

  // Check if funnel was already shown/declined this session
  useEffect(() => {
    const sessionStatus = sessionStorage.getItem("newsletterFunnelStatus");
    console.log("Session status from storage:", sessionStatus);
    if (
      sessionStatus === "shown" ||
      sessionStatus === "declined" ||
      sessionStatus === "completed"
    ) {
      setHasShownThisSession(true);
    }
  }, []);

  // Set up 2-minute timer
  useEffect(() => {
    if (!hasShownThisSession) {
      const timer = setTimeout(() => {
        triggerFunnel("session_duration");
      }, 2 * 60 * 1000); // 2 minutes

      setSessionTimer(timer);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [hasShownThisSession]);

  // Listen for Feeds window close event
  useEffect(() => {
    const handleFeedsClose = (event) => {
      if (event.detail && event.detail.programTitle === "Feeds") {
        triggerFunnel("feeds_closed");
      }
    };

    window.addEventListener("programClosed", handleFeedsClose);
    return () => window.removeEventListener("programClosed", handleFeedsClose);
  }, [hasShownThisSession]);

  // Listen for "You've Got Mail" click
  useEffect(() => {
    const handleMailClick = (event) => {
      if (event.detail && event.detail.action === "youve_got_mail") {
        triggerFunnel("mail_clicked");
      }
    };

    window.addEventListener("startMenuAction", handleMailClick);
    return () => window.removeEventListener("startMenuAction", handleMailClick);
  }, [hasShownThisSession]);

  // Central trigger function with suppression check
  const triggerFunnel = (source) => {
    console.log(`Newsletter funnel triggered by: ${source}`);
    console.log("Current state before trigger:", {
      hasShownThisSession,
      showFunnel,
    });

    if (!hasShownThisSession) {
      console.log("Setting showFunnel to true");
      setShowFunnel(true);
      setHasShownThisSession(true);
      sessionStorage.setItem("newsletterFunnelStatus", "shown");

      // Clear the timer if it exists
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
    } else {
      console.log("Funnel already shown this session, skipping");
    }
  };

  // Handle funnel close
  const handleFunnelClose = (completed) => {
    setShowFunnel(false);

    if (!completed) {
      // User declined or closed without completing
      sessionStorage.setItem("newsletterFunnelStatus", "declined");
    } else {
      // User completed signup
      sessionStorage.setItem("newsletterFunnelStatus", "completed");

      // Store signup data for future use
      // This will be implemented in Part 3
    }
  };

  // Handle successful signup
  const handleFunnelComplete = (formData) => {
    console.log("Newsletter signup completed:", formData);

    // Store the signup data
    localStorage.setItem(
      "newsletterSignup",
      JSON.stringify({
        ...formData,
        signupDate: new Date().toISOString(),
      })
    );

    // You can dispatch events or update context here
    window.dispatchEvent(
      new CustomEvent("newsletterSignupComplete", {
        detail: formData,
      })
    );
  };

  // Expose trigger function globally for manual triggering
  useEffect(() => {
    window.triggerNewsletterFunnel = () => triggerFunnel("manual");

    return () => {
      delete window.triggerNewsletterFunnel;
    };
  }, [hasShownThisSession]);

  return (
    <>
      {children}
      {showFunnel && (
        <AOLNewsletterFunnel
          onClose={handleFunnelClose}
          onComplete={handleFunnelComplete}
        />
      )}
      {/* Debug button - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <button
          onClick={() => {
            console.log("Debug: Force showing funnel");
            setShowFunnel(true);
          }}
          style={{
            position: "fixed",
            bottom: "50px",
            right: "10px",
            zIndex: 99998,
            background: "red",
            color: "white",
            padding: "5px 10px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Debug: Show Funnel
        </button>
      )}
    </>
  );
};

export default NewsletterFunnelManager;
