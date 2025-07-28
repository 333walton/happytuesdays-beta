import React, { useState, useEffect, useContext, useRef } from "react";
import { ProgramContext } from "../../contexts";
import AOLNewsletterFunnel from "./AOLNewsletterFunnel";

const NewsletterFunnelManager = ({ children }) => {
  const [showFunnel, setShowFunnel] = useState(false);
  // Remove session restriction state variables
  // const [hasShownThisSession, setHasShownThisSession] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(null);
  const programContext = useContext(ProgramContext);

  // Debug log
  console.log("NewsletterFunnelManager state:", {
    showFunnel,
    // hasShownThisSession,
  });

  // Remove session storage check
  // useEffect(() => {
  //   const sessionStatus = sessionStorage.getItem("newsletterFunnelStatus");
  //   console.log("Session status from storage:", sessionStatus);
  //   if (
  //     sessionStatus === "shown" ||
  //     sessionStatus === "declined" ||
  //     sessionStatus === "completed"
  //   ) {
  //     setHasShownThisSession(true);
  //   }
  // }, []);

  // Set up 2-minute timer (no session restriction)
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerFunnel("session_duration");
    }, 2 * 60 * 1000); // 2 minutes

    setSessionTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []); // Remove hasShownThisSession dependency

  // Listen for Feeds window close event (no session restriction)
  useEffect(() => {
    const handleFeedsClose = (event) => {
      if (event.detail && event.detail.programTitle === "Feeds") {
        triggerFunnel("feeds_closed");
      }
    };

    window.addEventListener("programClosed", handleFeedsClose);
    return () => window.removeEventListener("programClosed", handleFeedsClose);
  }, []); // Remove hasShownThisSession dependency

  // Listen for "You've Got Mail" click (no session restriction)
  useEffect(() => {
    const handleMailClick = (event) => {
      console.log(
        "📧 NewsletterFunnelManager - startMenuAction event received:",
        event
      );
      console.log("📧 Event detail:", event.detail);

      if (event.detail && event.detail.action === "youve_got_mail") {
        console.log("📧 Mail action detected, triggering funnel");
        console.log("📧 Setting showFunnel to true");
        setShowFunnel(true);

        // Clear the timer if it exists
        if (sessionTimer) {
          clearTimeout(sessionTimer);
        }

        // Focus the window after a short delay
        setTimeout(() => {
          const funnelWindow = document.querySelector(
            ".Window.AOLNewsletterFunnel"
          );
          if (funnelWindow) {
            funnelWindow.click(); // Simulate click to bring to front
            const titleBar = funnelWindow.querySelector(".Window__heading");
            if (titleBar) {
              titleBar.click(); // Click title bar to ensure focus
            }
          }
        }, 100);
      }
    };

    window.addEventListener("startMenuAction", handleMailClick);
    console.log("📧 NewsletterFunnelManager - Event listener attached");

    return () => {
      window.removeEventListener("startMenuAction", handleMailClick);
      console.log("📧 NewsletterFunnelManager - Event listener removed");
    };
  }, []);

  // Central trigger function (no suppression check)
  const triggerFunnel = (source) => {
    console.log(`📧 Newsletter funnel triggered by: ${source}`);
    console.log("📧 Current state before trigger:", {
      showFunnel,
    });

    console.log("📧 Setting showFunnel to true");
    setShowFunnel(true);

    // Clear the timer if it exists
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }

    // Focus the window after a short delay
    setTimeout(() => {
      const funnelWindow = document.querySelector(
        ".Window.AOLNewsletterFunnel"
      );
      if (funnelWindow) {
        funnelWindow.click(); // Simulate click to bring to front
        const titleBar = funnelWindow.querySelector(".Window__heading");
        if (titleBar) {
          titleBar.click(); // Click title bar to ensure focus
        }
      }
    }, 100);
  };

  // Handle funnel close (still track completion for analytics if needed)
  const handleFunnelClose = (completed) => {
    setShowFunnel(false);

    if (!completed) {
      // User declined or closed without completing
      // Optional: still store for analytics but don't use for restriction
      // sessionStorage.setItem("newsletterFunnelStatus", "declined");
    } else {
      // User completed signup
      // Optional: still store for analytics but don't use for restriction
      // sessionStorage.setItem("newsletterFunnelStatus", "completed");
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
  }, []);

  return (
    <>
      {children}
      {showFunnel && (
        <AOLNewsletterFunnel
          onClose={handleFunnelClose}
          onComplete={handleFunnelComplete}
          isActive={true}
          minimized={false}
        />
      )}
      {/* Debug button - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <button
          onClick={() => {
            console.log("Debug: Force showing funnel");
            setShowFunnel(true);
            // Focus the window after a short delay
            setTimeout(() => {
              const funnelWindow = document.querySelector(
                ".Window.AOLNewsletterFunnel"
              );
              if (funnelWindow) {
                funnelWindow.click();
                const titleBar = funnelWindow.querySelector(".Window__heading");
                if (titleBar) {
                  titleBar.click();
                }
              }
            }, 100);
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
