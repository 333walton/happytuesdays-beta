import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Window, WindowHeader, WindowContent, Button } from "react95";
import { ThemeProvider } from "styled-components";
import original from "react95/dist/themes/original";
import "./_styles.scss";

class HamsterCreator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hamsterWindows: [],
      marqueeIsPaused: false,
      originalScrollAmount: 4.4,
    };

    this.marqueeLinkRefs = new Map();
    this.maxHamsters = 10;
  }

  componentDidMount() {
    // Set up a delay to ensure DOM is ready
    setTimeout(() => {
      this.setupMarquee();
      this.setupHamster();
    }, 800); // Increased delay to ensure DOM is fully rendered
  }

  componentWillUnmount() {
    // Clean up hamster windows
    this.state.hamsterWindows.forEach((window) => {
      if (window.timeoutId) clearTimeout(window.timeoutId);
    });

    // Reset marquee links
    this.marqueeLinkRefs.forEach((originalHref, link) => {
      if (link) {
        link.href = originalHref;
        link.removeEventListener("click", this.handleMarqueeLinkClick);
      }
    });

    const marquee = document.getElementById("scrollMarquee");
    if (marquee) {
      marquee.removeEventListener("click", this.handleMarqueeClick);
    }
  }

  setupMarquee = () => {
    const marquee = document.getElementById("scrollMarquee");
    if (!marquee) {
      setTimeout(this.setupMarquee, 500);
      return;
    }

    // Store original scroll amount
    this.setState({ originalScrollAmount: marquee.scrollAmount });

    // Find all marquee links and store their hrefs
    const links = marquee.querySelectorAll(".marquee-link");
    links.forEach((link) => {
      // Store original href
      const originalHref = link.href;
      this.marqueeLinkRefs.set(link, originalHref);

      // Change href to prevent navigation and add our custom handler
      link.href = "javascript:void(0)";

      // Add click listener
      link.addEventListener("click", (e) =>
        this.handleMarqueeLinkClick(e, link, originalHref)
      );
    });

    // Add click listener to marquee itself
    marquee.addEventListener("click", this.handleMarqueeBackgroundClick);
  };

  setupHamster = () => {
    const hamsterGif =
      document.querySelector(".hamster-gif") ||
      document.querySelector(
        'img[src*="18ab4614722102b2a0def24dda1ea4bd-1.gif"]'
      ) ||
      document.querySelector("tr:first-of-type img");

    if (!hamsterGif) {
      console.log("Hamster GIF not found, retrying...");
      setTimeout(this.setupHamster, 500);
      return;
    }

    // Add class for styling and make the gif stand out
    hamsterGif.classList.add("hamster-gif");
    hamsterGif.style.cursor = "pointer";

    // Add a title attribute to provide a hint
    hamsterGif.setAttribute("title", "Click me to unleash hamster madness!");

    // Add click handler
    hamsterGif.addEventListener("click", this.createHamsterWindow);
  };

  handleMarqueeLinkClick = (e, link, originalHref) => {
    e.preventDefault();
    e.stopPropagation();

    const marquee = document.getElementById("scrollMarquee");
    if (!marquee) return;

    if (this.state.marqueeIsPaused) {
      // Second click - navigate
      window.location.href = originalHref;
    } else {
      // First click - pause
      this.setState({ marqueeIsPaused: true });
      marquee.scrollAmount = 0;

      // Resume after 2 seconds
      setTimeout(() => {
        if (marquee) {
          marquee.scrollAmount = this.state.originalScrollAmount;
          this.setState({ marqueeIsPaused: false });
        }
      }, 2000);
    }
  };

  handleMarqueeBackgroundClick = (e) => {
    // Only handle clicks directly on the marquee, not on links
    if (e.target.tagName === "A") return;

    const marquee = document.getElementById("scrollMarquee");
    if (!marquee || this.state.marqueeIsPaused) return;

    this.setState({ marqueeIsPaused: true });
    marquee.scrollAmount = 0;

    // Resume after 2 seconds
    setTimeout(() => {
      if (marquee) {
        marquee.scrollAmount = this.state.originalScrollAmount;
        this.setState({ marqueeIsPaused: false });
      }
    }, 2000);
  };

  createHamsterWindow = (e) => {
    if (e) {
      e.stopPropagation();
    }

    if (this.state.hamsterWindows.length >= this.maxHamsters) {
      console.log(
        "Maximum hamster count reached:",
        this.state.hamsterWindows.length
      );
      return;
    }

    // Check if it's a mobile device
    const isMobile = window.innerWidth <= 768;

    // Generate random position - ensure it's visible on screen
    // Use different calculations for mobile vs desktop
    let posX, posY;

    if (isMobile) {
      // For mobile, keep the hamsters more centered and visible
      const padding = 20;
      const availWidth = Math.max(200, window.innerWidth - 100);
      const availHeight = Math.max(200, window.innerHeight - 120);

      posX = Math.max(
        padding,
        Math.min(
          window.innerWidth - 150,
          Math.floor(padding + Math.random() * (availWidth - padding * 2))
        )
      );
      posY = Math.max(
        padding,
        Math.min(
          window.innerHeight - 150,
          Math.floor(padding + Math.random() * (availHeight - padding * 2))
        )
      );
    } else {
      // For desktop, use the full screen
      const margin = 20;
      const maxX = Math.max(50, window.innerWidth - 150);
      const maxY = Math.max(50, window.innerHeight - 150);

      posX = Math.floor(margin + Math.random() * (maxX - margin * 2));
      posY = Math.floor(margin + Math.random() * (maxY - margin * 2));
    }

    // Create new hamster window with a unique key
    const newWindow = {
      id: `hamster-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      x: posX,
      y: posY,
      zIndex: 9999999 + this.state.hamsterWindows.length,
    };

    // Add the new window to state
    this.setState((prevState) => ({
      hamsterWindows: [...prevState.hamsterWindows, newWindow],
    }));

    // Set a timeout to remove the window after 10 seconds
    const timeoutId = setTimeout(() => {
      this.removeHamsterWindow(newWindow.id);
    }, 10000);

    // Save the timeout ID for cleanup
    newWindow.timeoutId = timeoutId;
  };

  removeHamsterWindow = (id) => {
    // First mark the window for removal to trigger animation
    this.setState((prevState) => ({
      hamsterWindows: prevState.hamsterWindows.map((window) =>
        window.id === id ? { ...window, removing: true } : window
      ),
    }));

    // Then after animation completes, actually remove it
    setTimeout(() => {
      this.setState((prevState) => ({
        hamsterWindows: prevState.hamsterWindows.filter(
          (window) => window.id !== id
        ),
      }));
    }, 500); // Match this to the CSS animation duration
  };

  startDrag = (e, id) => {
    e.preventDefault();

    // Bring window to front
    this.setState((prevState) => ({
      hamsterWindows: prevState.hamsterWindows.map((window) =>
        window.id === id
          ? { ...window, zIndex: 9999999 + prevState.hamsterWindows.length }
          : window
      ),
    }));

    const window = this.state.hamsterWindows.find((w) => w.id === id);
    if (!window) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = window.x;
    const startTop = window.y;

    // Check if it's a mobile device
    const isMobile = window.innerWidth <= 768;

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      // Adjust bounds based on device type
      let newX, newY;

      if (isMobile) {
        // Keep the window fully visible on mobile
        const padding = 10;
        newX = Math.max(
          padding,
          Math.min(window.innerWidth - 120, startLeft + dx)
        );
        newY = Math.max(
          padding,
          Math.min(window.innerHeight - 120, startTop + dy)
        );
      } else {
        // Desktop can be a bit more flexible
        newX = Math.max(
          -60,
          Math.min(document.body.clientWidth - 60, startLeft + dx)
        );
        newY = Math.max(
          -10,
          Math.min(document.body.clientHeight - 40, startTop + dy)
        );
      }

      this.setState((prevState) => ({
        hamsterWindows: prevState.hamsterWindows.map((w) =>
          w.id === id ? { ...w, x: newX, y: newY } : w
        ),
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // For touch devices
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    };

    // Handle touch events for mobile
    const handleTouchMove = (touchEvent) => {
      const touch = touchEvent.touches[0];
      const moveEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
      };
      handleMouseMove(moveEvent);
    };

    // Set up mouse events for desktop
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Set up touch events for mobile
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleMouseUp);
  };

  render() {
    return (
      <>
        {this.state.hamsterWindows.map((window) =>
          ReactDOM.createPortal(
            <ThemeProvider theme={original}>
              <Window
                key={`hamster-window-${window.id}`}
                className={window.removing ? "window-removing" : ""}
                style={{
                  position: "fixed",
                  left: `${window.x}px`,
                  top: `${window.y}px`,
                  zIndex: window.zIndex,
                  padding: 0,
                  margin: 0,
                  width: "auto",
                  height: "auto",
                }}
              >
                <WindowHeader
                  style={{
                    padding: "5px 7px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: "22px", // Increased height
                    cursor: "default", // Normal cursor instead of pointer
                  }}
                  onMouseDown={(e) => this.startDrag(e, window.id)}
                >
                  <span style={{ fontSize: "12px" }}>Hamster.exe</span>
                  <Button
                    style={{
                      fontSize: "12px", // Larger font
                      fontWeight: "bold",
                      width: "18px", // Larger button
                      height: "16px", // Larger button
                      padding: 0,
                      margin: 0,
                      marginLeft: "4px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      lineHeight: "10px", // Lower line height to raise the X
                      paddingBottom: "2px", // Push the X up a bit more
                    }}
                    onClick={() => this.removeHamsterWindow(window.id)}
                  >
                    ×
                  </Button>
                </WindowHeader>
                <WindowContent
                  style={{
                    padding: "4px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src="//appstickers-cdn.appadvice.com/1164831016/819286823/18ab4614722102b2a0def24dda1ea4bd-1.gif"
                    alt="Dancing Hamster"
                    width="60"
                    style={{
                      display: "block",
                      border: "none",
                      margin: 0,
                      padding: 0,
                      cursor: "pointer", // Show pointer cursor on hover
                    }}
                    onClick={this.createHamsterWindow} // Same click handler as the original
                  />
                </WindowContent>
              </Window>
            </ThemeProvider>,
            document.body // Attach directly to document body
          )
        )}
      </>
    );
  }
}

export default HamsterCreator;
