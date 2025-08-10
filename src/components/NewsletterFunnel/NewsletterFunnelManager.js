import React, { useState, useEffect, useContext, useRef } from "react";
import { createPortal } from "react-dom";
import { ProgramContext } from "../../contexts";
import AOLNewsletterFunnel from "./AOLNewsletterFunnel";

const NewsletterFunnelManager = ({ children }) => {
  const [showFunnel, setShowFunnel] = useState(false);
  const [feedsCloseCount, setFeedsCloseCount] = useState(0);
  const [hasCompletedThisSession, setHasCompletedThisSession] = useState(false);
  const programContext = useContext(ProgramContext);

  // Debug log
  console.log("NewsletterFunnelManager state:", {
    showFunnel,
    feedsCloseCount,
    hasCompletedThisSession,
  });

  // Check if signup was completed this session
  useEffect(() => {
    const sessionStatus = sessionStorage.getItem("newsletterCompleted");
    if (sessionStatus === "true") {
      setHasCompletedThisSession(true);
    }
  }, []);

  // Listen for Feeds window close event - open every other time (1 out of 2)
  useEffect(() => {
    const handleFeedsClose = (event) => {
      if (event.detail && event.detail.programTitle === "Feeds") {
        // Don't trigger if already completed this session
        if (hasCompletedThisSession) {
          console.log(
            "Newsletter already completed this session, skipping auto-trigger"
          );
          return;
        }

        // Increment the close count
        const newCount = feedsCloseCount + 1;
        setFeedsCloseCount(newCount);

        console.log(`Feeds closed ${newCount} time(s)`);

        // Trigger on every odd count (1st, 3rd, 5th close, etc.)
        if (newCount % 2 === 1) {
          console.log("Triggering funnel on Feeds close (odd count)");
          triggerFunnel("feeds_closed");
        }
      }
    };

    window.addEventListener("programClosed", handleFeedsClose);
    return () => window.removeEventListener("programClosed", handleFeedsClose);
  }, [feedsCloseCount, hasCompletedThisSession]);

  // Listen for "You've Got Mail" click (manual trigger - always allowed)
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

  // Central trigger function
  const triggerFunnel = (source) => {
    console.log(`📧 Newsletter funnel triggered by: ${source}`);
    console.log("📧 Current state before trigger:", {
      showFunnel,
      hasCompletedThisSession,
    });

    // Only block automatic triggers if completed this session
    if (source !== "manual" && hasCompletedThisSession) {
      console.log(
        "📧 Blocking automatic trigger - already completed this session"
      );
      return;
    }

    console.log("📧 Setting showFunnel to true");
    setShowFunnel(true);

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

  // Handle funnel close
  const handleFunnelClose = (completed) => {
    setShowFunnel(false);

    if (!completed) {
      console.log("User declined or closed without completing");
    } else {
      console.log("User completed signup");
    }
  };

  // Handle successful signup
  const handleFunnelComplete = (formData) => {
    console.log("Newsletter signup completed:", formData);

    // Mark as completed for this session
    setHasCompletedThisSession(true);
    sessionStorage.setItem("newsletterCompleted", "true");

    // Store the signup data
    localStorage.setItem(
      "newsletterSignup",
      JSON.stringify({
        ...formData,
        signupDate: new Date().toISOString(),
      })
    );

    // Dispatch event for other components
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
  }, [hasCompletedThisSession]);

  return (
    <>
      {children}
      {showFunnel &&
        createPortal(
          <AOLNewsletterFunnel
            onClose={handleFunnelClose}
            onComplete={handleFunnelComplete}
            isActive={true}
            minimized={false}
          />,
          document.querySelector(".desktop.screen") || document.body
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
