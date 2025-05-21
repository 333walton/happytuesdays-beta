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
      showInitMessage: false,
      colorToggled: false, // track if background color has been toggled
    };

    this.marqueeLinkRefs = new Map();
    this.maxHamsters = 15;
    this.originalHamsterGif = null;
  }

  componentDidMount() {
    setTimeout(() => {
      this.setupMarquee();
      this.setupHamster();
    }, 800);

    // Prevent iOS Safari bounce and improve touch responsiveness
    document.body.style.overscrollBehavior = "none";
    document.body.style.touchAction = "manipulation";
  }

  componentWillUnmount() {
    this.state.hamsterWindows.forEach((window) => {
      if (window.timeoutId) clearTimeout(window.timeoutId);
    });

    this.marqueeLinkRefs.forEach((originalHref, link) => {
      if (link) {
        link.href = originalHref;
        link.removeEventListener("click", this.handleMarqueeLinkClick);
      }
    });

    const marquee = document.getElementById("scrollMarquee");
    if (marquee) {
      marquee.removeEventListener("click", this.handleMarqueeBackgroundClick);
    }
  }

  setupMarquee = () => {
    const marquee = document.getElementById("scrollMarquee");
    if (!marquee) {
      setTimeout(this.setupMarquee, 500);
      return;
    }

    this.setState({ originalScrollAmount: marquee.scrollAmount });

    const links = marquee.querySelectorAll(".marquee-link");
    links.forEach((link) => {
      const originalHref = link.href;
      this.marqueeLinkRefs.set(link, originalHref);

      link.href = "javascript:void(0)";
      link.addEventListener("click", (e) =>
        this.handleMarqueeLinkClick(e, link, originalHref)
      );
    });

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

    this.originalHamsterGif = hamsterGif;

    hamsterGif.classList.add("hamster-gif");
    hamsterGif.style.cursor = "pointer";
    hamsterGif.setAttribute("title", "Click me to unleash hamster madness!");
    hamsterGif.addEventListener("click", this.createHamsterWindow);
  };

  handleMarqueeLinkClick = (e, link, originalHref) => {
    e.preventDefault();
    e.stopPropagation();

    const marquee = document.getElementById("scrollMarquee");
    if (!marquee) return;

    if (this.state.marqueeIsPaused) {
      window.location.href = originalHref;
    } else {
      this.setState({ marqueeIsPaused: true });
      marquee.scrollAmount = 0;

      setTimeout(() => {
        if (marquee) {
          marquee.scrollAmount = this.state.originalScrollAmount;
          this.setState({ marqueeIsPaused: false });
        }
      }, 2000);
    }
  };

  handleMarqueeBackgroundClick = (e) => {
    if (e.target.tagName === "A") return;

    const marquee = document.getElementById("scrollMarquee");
    if (!marquee || this.state.marqueeIsPaused) return;

    this.setState({ marqueeIsPaused: true });
    marquee.scrollAmount = 0;

    setTimeout(() => {
      if (marquee) {
        marquee.scrollAmount = this.state.originalScrollAmount;
        this.setState({ marqueeIsPaused: false });
      }
    }, 2000);
  };

  createHamsterWindow = (e) => {
    if (e) e.stopPropagation();

    if (!this.state.showInitMessage) {
      this.setState({ showInitMessage: true });
      setTimeout(() => this.setState({ showInitMessage: false }), 12000);
    }

    if (this.state.hamsterWindows.length >= this.maxHamsters) return;

    const isMobile = window.innerWidth <= 768;
    const padding = 20;
    const availWidth = Math.max(200, window.innerWidth - 100);
    const availHeight = Math.max(200, window.innerHeight - 120);

    const posX = Math.floor(
      padding + Math.random() * (availWidth - padding * 2)
    );
    const posY = Math.floor(
      padding + Math.random() * (availHeight - padding * 2)
    );

    const newWindow = {
      id: `hamster-${Date.now()}-${Math.floor(Math.random() * 12000)}`,
      x: posX,
      y: posY,
      zIndex: 9999999 + this.state.hamsterWindows.length,
      closeAttempts: 0, // <--- new field
    };

    const timeoutId = setTimeout(() => {
      this.removeHamsterWindow(newWindow.id);
    }, 12000);

    newWindow.timeoutId = timeoutId;

    // Toggle background color after every 2nd click
    this.setState((prevState) => {
      const newColorToggled = prevState.colorToggled ? false : true; // toggle the color
      return {
        hamsterWindows: [...prevState.hamsterWindows, newWindow],
        colorToggled: newColorToggled, // update the state
      };
    });
  };

  removeHamsterWindow = (id) => {
    this.setState((prevState) => ({
      hamsterWindows: prevState.hamsterWindows.map((window) =>
        window.id === id ? { ...window, removing: true } : window
      ),
    }));

    setTimeout(() => {
      this.setState((prevState) => ({
        hamsterWindows: prevState.hamsterWindows.filter(
          (window) => window.id !== id
        ),
      }));
    }, 500);
  };

  handleCloseClick = (id) => {
    const padding = 20;
    const availWidth = Math.max(200, window.innerWidth - 100);
    const availHeight = Math.max(200, window.innerHeight - 120);

    this.setState((prevState) => {
      return {
        hamsterWindows: prevState.hamsterWindows.flatMap((window) => {
          if (window.id !== id) return [window];

          const newAttempts = (window.closeAttempts || 0) + 1;

          // First click: Change button color to red and clone the window
          if (newAttempts === 1) {
            const updatedWindow = {
              ...window,
              closeAttempts: newAttempts,
              backgroundColor: "#ff4c4c", // Red color after the first click
            };

            const clonedWindow = {
              ...window,
              id: `hamster-${Date.now()}-${Math.floor(Math.random() * 12000)}`,
              x: Math.floor(
                padding + Math.random() * (availWidth - padding * 2)
              ),
              y: Math.floor(
                padding + Math.random() * (availHeight - padding * 2)
              ),
              closeAttempts: 0,
              zIndex: window.zIndex + 1,
            };

            const timeoutId = setTimeout(() => {
              this.removeHamsterWindow(clonedWindow.id);
            }, 12000);

            clonedWindow.timeoutId = timeoutId;

            return [updatedWindow, clonedWindow]; // Clone the window
          }

          // Second click: Revert background color and clone the window again
          if (newAttempts === 2) {
            const updatedWindow = {
              ...window,
              closeAttempts: newAttempts,
              backgroundColor: undefined, // Revert to original color
            };

            const clonedWindow = {
              ...window,
              id: `hamster-${Date.now()}-${Math.floor(Math.random() * 12000)}`,
              x: Math.floor(
                padding + Math.random() * (availWidth - padding * 2)
              ),
              y: Math.floor(
                padding + Math.random() * (availHeight - padding * 2)
              ),
              closeAttempts: 0,
              zIndex: window.zIndex + 1,
            };

            const timeoutId = setTimeout(() => {
              this.removeHamsterWindow(clonedWindow.id);
            }, 12000);

            clonedWindow.timeoutId = timeoutId;

            return [updatedWindow, clonedWindow]; // Clone the window again
          }

          // Third click: Remove the window (no more cloning)
          if (newAttempts === 3) {
            this.removeHamsterWindow(window.id);
            return []; // Do not clone or change anything, just remove the window
          }

          // Continue to increment for the first and second click
          return [{ ...window, closeAttempts: newAttempts }];
        }),
      };
    });
  };

  startDrag = (e, id) => {
    e.preventDefault();

    this.setState((prevState) => ({
      hamsterWindows: prevState.hamsterWindows.map((window) =>
        window.id === id
          ? { ...window, zIndex: 9999999 + prevState.hamsterWindows.length }
          : window
      ),
    }));

    const targetWindow = this.state.hamsterWindows.find((w) => w.id === id);
    if (!targetWindow) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = targetWindow.x;
    const startTop = targetWindow.y;

    const isMobile = window.innerWidth <= 768;

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let newX = startLeft + dx;
      let newY = startTop + dy;

      if (isMobile) {
        const padding = 10;
        newX = Math.max(padding, Math.min(window.innerWidth - 120, newX));
        newY = Math.max(padding, Math.min(window.innerHeight - 120, newY));
      } else {
        newX = Math.max(-60, Math.min(document.body.clientWidth - 60, newX));
        newY = Math.max(-10, Math.min(document.body.clientHeight - 40, newY));
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
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    };

    const handleTouchMove = (touchEvent) => {
      const touch = touchEvent.touches[0];
      const moveEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
      };
      handleMouseMove(moveEvent);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleMouseUp);
  };

  startTouchDrag = (e, id) => {
    const touch = e.touches[0];
    const touchEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => e.preventDefault(),
    };
    this.startDrag(touchEvent, id);
  };

  render() {
    return (
      <>
        {this.state.showInitMessage &&
          this.originalHamsterGif &&
          ReactDOM.createPortal(
            <div className="hamster-init-message">
              hamster.exe initiating<span className="dots"></span>
            </div>,
            this.originalHamsterGif.parentElement
          )}

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
                  transform: "translateZ(0)", // <-- added
                }}
              >
                <WindowHeader
                  style={{
                    padding: "5px 1px",
                    //margin: "0px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: "22px",
                    cursor: "grab",
                    touchAction: "none",
                  }}
                  onMouseDown={(e) => this.startDrag(e, window.id)}
                  onTouchStart={(e) => this.startTouchDrag(e, window.id)}
                >
                  <span style={{ fontSize: "12px", marginLeft: "5px" }}>
                    {" "}
                    hamster.exe
                  </span>
                  <Button
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "18px",
                      height: "16px",
                      padding: 0,
                      margin: 0,
                      marginLeft: "8px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      lineHeight: "10px",
                      paddingBottom: "8px",
                      backgroundColor:
                        window.closeAttempts === 1 ? "#ff4c4c" : undefined, // Red color only after the first click
                    }}
                    onClick={() => this.handleCloseClick(window.id)}
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
                      cursor: "pointer",
                    }}
                    onClick={this.createHamsterWindow}
                  />
                </WindowContent>
              </Window>
            </ThemeProvider>,
            document.body
          )
        )}
      </>
    );
  }
}

export default HamsterCreator;
