import React, { Component } from "react";
import cx from "classnames";
import nanoid from "nanoid";
import * as icons from "../../icons";
import "./_styles.scss"; // your SCSS
import { WindowExplorer } from "packard-belle";
import Window from "../tools/Window";
import buildMenu from "../../helpers/menuBuilder";
import HamsterCreator from "../HamsterCreator/HamsterCreator";
import HappyTuesdayNewsFeed from "../HappyTuesdayNewsFeed/HappyTuesdayNewsFeed";

const noop = () => {};

const canAccessIframe = (id) => {
  const iframe = document && document.querySelector(`.${id}`);
  const canAccess =
    iframe &&
    iframe.contentDocument &&
    iframe.contentDocument.body &&
    iframe.contentDocument.body.scrollHeight;
  if (canAccess) {
    return {
      height: iframe.contentDocument.body.scrollHeight,
      width: iframe.contentDocument.body.scrollWidth,
    };
  }
};

class InternetExplorer extends Component {
  id = "b".concat(nanoid()).replace("-", "");
  overlayNode = null;

  state = {
    dimensions: { width: 800, height: 400 },
    currentUrl:
      window.location.host +
      window.location.pathname +
      window.location.search +
      window.location.hash,
    isRefreshing: false,
    refreshKey: 0,
  };

  // Store button handlers for easy access - accounting for grouped buttons
  buttonHandlers = {
    0: () => {}, // Back
    1: () => {}, // Forward
    2: () => {}, // Stop
    3: this.handleRefresh,
    4: () => {}, // Home
    5: () => {}, // Mail
    6: () => {}, // Print
  };

  // Observer to watch for toolbar rendering
  toolbarObserver = null;

  componentDidMount() {
    setTimeout(this.getIframeDimension, 3000);
    window.addEventListener("popstate", this.handleUrlChange, false);
    window.addEventListener("hashchange", this.handleUrlChange, false);
    this._patchHistory();
    this._injectOverlay();
    window.addEventListener("resize", this._injectOverlay);

    // Set up MutationObserver to watch for toolbar
    this.setupToolbarObserver();

    // Try to attach handlers after a delay
    setTimeout(() => this.attachToolbarHandlers(), 100);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentUrl !== this.state.currentUrl) {
      this._injectOverlay();
    } else {
      this._injectOverlay();
    }

    // Ensure handlers are always attached
    const toolbar = document.querySelector(
      ".InternetExplorer .WindowExplorer__options .OptionsList__large-icons"
    );
    if (toolbar && !toolbar._handlersAttached) {
      this.attachToolbarHandlers();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", this.handleUrlChange, false);
    window.removeEventListener("hashchange", this.handleUrlChange, false);
    this._unpatchHistory();
    window.removeEventListener("resize", this._injectOverlay);

    // Safely remove overlay node
    if (this.overlayNode && this.overlayNode.parentNode) {
      try {
        this.overlayNode.parentNode.removeChild(this.overlayNode);
      } catch (e) {
        // Node might have already been removed
      }
    }

    if (this.toolbarObserver) {
      this.toolbarObserver.disconnect();
    }

    // Clean up button references
    if (this._buttonReferences) {
      // Remove event listeners
      const toolbar = document.querySelector(
        ".InternetExplorer .WindowExplorer__options .OptionsList__large-icons"
      );
      if (toolbar) {
        const buttons = toolbar.querySelectorAll("button");
        buttons.forEach((button) => {
          const handler = this._buttonReferences.get(button);
          if (handler) {
            button.removeEventListener("click", handler);
          }
        });
      }
      this._buttonReferences = null;
    }
  }

  _patchHistory = () => {
    this._origPushState = window.history.pushState;
    this._origReplaceState = window.history.replaceState;
    const self = this;
    window.history.pushState = function (...args) {
      const rv = self._origPushState.apply(window.history, args);
      self.handleUrlChange();
      return rv;
    };
    window.history.replaceState = function (...args) {
      const rv = self._origReplaceState.apply(window.history, args);
      self.handleUrlChange();
      return rv;
    };
  };
  _unpatchHistory = () => {
    if (this._origPushState) window.history.pushState = this._origPushState;
    if (this._origReplaceState)
      window.history.replaceState = this._origReplaceState;
  };

  // Set up MutationObserver to watch for toolbar
  setupToolbarObserver = () => {
    this.toolbarObserver = new MutationObserver((mutations) => {
      // Check if toolbar was added
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const toolbar = document.querySelector(
            ".WindowExplorer__options .OptionsList__large-icons"
          );
          if (toolbar && !toolbar._handlersAttached) {
            this.attachToolbarHandlers();
          }
        }
      }
    });

    // Start observing the entire window for changes
    const windowElement = document.querySelector(".InternetExplorer");
    if (windowElement) {
      this.toolbarObserver.observe(windowElement, {
        childList: true,
        subtree: true,
      });
    }
  };

  // Attach event handlers directly to toolbar buttons
  attachToolbarHandlers = () => {
    // Try multiple selectors to find the toolbar
    let toolbar = document.querySelector(
      ".InternetExplorer .WindowExplorer__options .OptionsList__large-icons"
    );

    if (!toolbar) {
      toolbar = document.querySelector(
        ".WindowExplorer__options .OptionsList__large-icons"
      );
    }

    if (!toolbar) {
      // Try to find it within the current component's DOM
      const ieWindow = document.querySelector(".InternetExplorer");
      if (ieWindow) {
        toolbar = ieWindow.querySelector(".OptionsList__large-icons");
      }
    }

    if (!toolbar) {
      return;
    }

    // Remove any existing delegation
    if (toolbar._handlersAttached) {
      return;
    }

    toolbar._handlersAttached = true;

    // Get all buttons
    const buttons = toolbar.querySelectorAll("button");

    // Map of button text to handlers
    const buttonMap = {
      Back: () => {},
      Forward: () => {},
      Stop: () => {},
      Refresh: this.handleRefresh,
      Home: () => {},
      Search: () => {},
      Favorites: () => {},
      History: () => {},
      Mail: () => {},
      Print: () => {},
    };

    // Store references to cloned buttons to avoid removeChild errors
    if (!this._buttonReferences) {
      this._buttonReferences = new WeakMap();
    }

    // Attach click handlers to each button
    buttons.forEach((button, index) => {
      // Skip if we've already processed this button
      if (this._buttonReferences.has(button)) {
        return;
      }

      // Get button text from the nested structure
      const textElement = button.querySelector(".ButtonIconLarge__text");
      const buttonText = textElement ? textElement.textContent.trim() : "";

      // Add our click handler without cloning to avoid removeChild errors
      const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Check if button is disabled
        if (button.disabled) {
          return;
        }

        // Find the handler by text
        const handler = buttonMap[buttonText];
        if (handler) {
          handler.call(this, e);
        } else {
          // Also try by index as fallback
          const indexHandler = this.buttonHandlers[index];
          if (indexHandler) {
            indexHandler.call(this, e);
          }
        }
      };

      button.addEventListener("click", clickHandler);

      // Store reference to avoid reprocessing
      this._buttonReferences.set(button, clickHandler);
    });
  };

  handleUrlChange = () => {
    const url =
      window.location.host +
      window.location.pathname +
      window.location.search +
      window.location.hash;
    this.setState({ currentUrl: url });
  };

  getIframeDimension = () => {
    const iframeDimensions = canAccessIframe(this.id);
    if (
      iframeDimensions &&
      (iframeDimensions.height !== this.state.dimensions.height ||
        iframeDimensions.width !== this.state.dimensions.width)
    ) {
      this.setState({ dimensions: iframeDimensions });
    }
  };

  _injectOverlay = () => {
    // Target this IE instance by window id if possible
    const rootNode =
      document.querySelector(
        `.InternetExplorer[data-window-id="${this.props.id}"]`
      ) || document.querySelector(".InternetExplorer");
    if (!rootNode) return;

    const addressNode = rootNode.querySelector(".FakeSelect__children");
    if (addressNode) {
      // Sibling element overlay
      if (!this.overlayNode || !this.overlayNode.parentNode) {
        // Create overlay if it doesn't exist
        this.overlayNode = document.createElement("div");
        this.overlayNode.className = "current-url-absolute";
        // Only left/top are allowed here (for dynamic movement)
        this.overlayNode.style.position = "absolute";
        addressNode.parentNode.appendChild(this.overlayNode);
      }
      // Dynamically update position (must be JS for fixed layout)
      this.overlayNode.style.left = addressNode.offsetLeft + "px";
      // Vertically center relative to the address label or adjust as needed:
      const offsetTop =
        addressNode.offsetTop + addressNode.offsetHeight / 2 - 5;
      this.overlayNode.style.top = offsetTop + "px";
      // Content updates with the URL:
      this.overlayNode.textContent = this.state.currentUrl;
      // Show it
      this.overlayNode.style.display = "block";
    } else if (this.overlayNode) {
      this.overlayNode.style.display = "none";
    }
  };

  handleRefresh = () => {
    // Trigger refresh animation
    this.setState({ isRefreshing: true });

    // Simulate loading time with retro feel
    setTimeout(() => {
      this.setState({ isRefreshing: false });

      // Handle different content types
      const isHappyTuesdayFeed =
        this.props.data &&
        (this.props.data.component === "HappyTuesdayNewsFeed" ||
          this.props.data.type === "happy-tuesday-feed" ||
          (this.props.data.title &&
            this.props.data.title.toLowerCase().includes("happy tuesday")));

      if (isHappyTuesdayFeed) {
        // For Happy Tuesday feed, scroll to top without remounting
        this.scrollToTopComprehensive();
      } else if (this.props.data?.__html) {
        // For HTML content, increment refreshKey to reload content
        this.setState((prevState) => ({
          refreshKey: prevState.refreshKey + 1,
        }));

        // Scroll to top after content reloads
        setTimeout(() => this.scrollToTopComprehensive(), 100);
        setTimeout(() => this.scrollToTopComprehensive(), 300);
      } else {
        // For iframe content, reload and scroll to top
        const iframe = document.querySelector(`.${this.id}`);
        if (iframe && iframe.src) {
          const currentSrc = iframe.src;
          iframe.src = "about:blank"; // Clear first
          setTimeout(() => {
            iframe.src = currentSrc; // Reload

            // After iframe reloads, scroll to top
            iframe.onload = () => {
              this.scrollToTopComprehensive();

              // Try to scroll iframe content if accessible
              try {
                if (iframe.contentWindow) {
                  iframe.contentWindow.scrollTo(0, 0);
                }
                if (iframe.contentDocument) {
                  iframe.contentDocument.documentElement.scrollTop = 0;
                  iframe.contentDocument.body.scrollTop = 0;
                }
              } catch (e) {
                // Cross-origin restrictions may prevent this
                console.log(
                  "Cannot scroll iframe content due to cross-origin restrictions"
                );
              }
              iframe.onload = null; // Clean up
            };
          }, 50);
        } else {
          // Fallback scroll for non-iframe content
          this.scrollToTopComprehensive();
        }
      }
    }, 800 + Math.random() * 400); // Random delay between 800-1200ms for authenticity
  };

  // Comprehensive scroll to top function
  scrollToTopComprehensive = () => {
    // Function to perform comprehensive scrolling
    const scrollToTop = () => {
      // 1. Scroll the main IE content wrapper
      const wrapper = document.querySelector(".ie-content-wrapper");
      if (wrapper) {
        wrapper.scrollTop = 0;
        wrapper.scrollLeft = 0;
      }

      // 2. Scroll the Internet Explorer window itself
      const ieWindow = document.querySelector(
        ".InternetExplorer .WindowExplorer__view"
      );
      if (ieWindow) {
        ieWindow.scrollTop = 0;
        ieWindow.scrollLeft = 0;
      }

      // 3. Scroll any WindowExplorer view containers
      const windowViews = document.querySelectorAll(".WindowExplorer__view");
      windowViews.forEach((view) => {
        view.scrollTop = 0;
        view.scrollLeft = 0;
      });

      // 4. Scroll the HappyTuesdayNewsFeed container if present
      const feedContent = document.querySelector(".HappyTuesdayNewsFeed");
      if (feedContent) {
        feedContent.scrollTop = 0;
        feedContent.scrollLeft = 0;
      }

      // 5. Scroll any direct child containers of the feed
      const feedChildren = document.querySelectorAll(
        ".HappyTuesdayNewsFeed > div"
      );
      feedChildren.forEach((child) => {
        if (typeof child.scrollTop === "number") {
          child.scrollTop = 0;
          child.scrollLeft = 0;
        }
      });

      // 6. Find and scroll all potentially scrollable elements
      const scrollableSelectors = [
        // By style attributes
        '[style*="overflow-y: auto"]',
        '[style*="overflow: auto"]',
        '[style*="overflow-y: scroll"]',
        '[style*="overflow: scroll"]',
        '[style*="max-height"]',
        // By common class names and elements
        ".scrollable",
        ".scroll-container",
        ".content-area",
        ".feed-content",
        ".tab-content",
        ".main-content",
        ".page-content",
        ".article-content",
        ".blog-content",
        "main",
        "section",
        "article",
        'div[role="main"]',
        'div[role="region"]',
        // Specific to your app
        ".ie-content",
        ".WindowExplorer__content",
        "div[dangerouslySetInnerHTML]",
      ];

      // Apply scrolling to all matching elements within IE
      scrollableSelectors.forEach((selector) => {
        try {
          const elements = document.querySelectorAll(
            `.InternetExplorer ${selector}, .ie-content-wrapper ${selector}`
          );
          elements.forEach((el) => {
            if (el && typeof el.scrollTop === "number") {
              el.scrollTop = 0;
              el.scrollLeft = 0;
            }
          });
        } catch (e) {
          // Continue if selector fails
        }
      });

      // 7. Force scroll on the document itself if possible
      try {
        if (window && window.scrollTo) {
          window.scrollTo(0, 0);
        }
        if (document && document.documentElement) {
          document.documentElement.scrollTop = 0;
          document.documentElement.scrollLeft = 0;
        }
        if (document && document.body) {
          document.body.scrollTop = 0;
          document.body.scrollLeft = 0;
        }
      } catch (e) {
        // Ignore errors
      }

      // 8. Special handling for any React components that might maintain their own scroll state
      // Dispatch a custom event that components can listen to
      try {
        const scrollResetEvent = new CustomEvent("ieRefreshScrollReset", {
          detail: { timestamp: Date.now() },
        });
        window.dispatchEvent(scrollResetEvent);
      } catch (e) {
        // Ignore if CustomEvent is not supported
      }
    };

    // Call scrollToTop immediately and with delays to catch all scenarios
    scrollToTop();
    setTimeout(() => scrollToTop(), 50);
    setTimeout(() => scrollToTop(), 150);
    setTimeout(() => scrollToTop(), 300);
    setTimeout(() => scrollToTop(), 500);
  };

  render() {
    const { props } = this;

    const isReadme =
      props.data &&
      props.data.__html &&
      props.data.__html.includes("hamster-gif");

    const isHappyTuesdayFeed =
      props.data &&
      (props.data.component === "HappyTuesdayNewsFeed" ||
        props.data.type === "happy-tuesday-feed" ||
        (props.data.title &&
          props.data.title.toLowerCase().includes("happy tuesday")));

    const tab = props.data?.tab;

    return (
      <Window
        {...props}
        Component={WindowExplorer}
        data-window-id={props.id}
        className={cx("InternetExplorer", props.className)}
        resizable={true}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        title={`${
          props.data.title || props.title !== "Internet Explorer"
            ? `${props.data.title || props.title} - `
            : ""
        }Internet Explorer`}
        menuOptions={buildMenu(props)}
        minHeight={300}
        minWidth={300}
        maxHeight={window.innerHeight - 50}
        maxWidth={window.innerWidth - 50}
        // Replace the explorerOptions array in your render method with this:
        explorerOptions={[
          {
            icon: icons.back,
            title: "Back",
            onClick: noop,
            closeOnClick: true,
          },
          {
            icon: icons.forward,
            title: "Forward",
            onClick: noop,
            closeOnClick: true,
          },
          {
            icon: icons.ieStop,
            title: "Stop",
            onClick: noop,
            closeOnClick: true,
          },
          {
            icon: icons.ieRefresh,
            title: "Refresh",
            onClick: noop,
            closeOnClick: true,
          },
          {
            icon: icons.ieHome,
            title: "Home",
            onClick: noop,
            closeOnClick: true,
          },
          [
            {
              icon: icons.ieSearch,
              title: "Search",
              onClick: noop,
              closeOnClick: true,
            },
            {
              icon: icons.ieFavorites,
              title: "Favorites",
              onClick: noop,
              closeOnClick: true,
            },
            {
              icon: icons.ieHistory,
              title: "History",
              onClick: noop,
              closeOnClick: true,
            },
          ],
          {
            icon: icons.ieMail,
            title: "Mail",
            onClick: noop,
            closeOnClick: true,
          },
          {
            icon: icons.iePrint,
            title: "Print",
            onClick: noop,
            closeOnClick: true,
          },
        ]}
        maximizeOnOpen
      >
        <div
          className="ie-content-wrapper"
          style={{ width: "100%", height: "100%" }}
          key={this.state.refreshKey}
        >
          {this.state.isRefreshing && (
            <div className="ie-refresh-overlay">
              <div className="ie-refresh-content">
                <div className="ie-refresh-spinner"></div>
                <div className="ie-refresh-text">Loading...</div>
                <div className="ie-refresh-progress">
                  <div className="ie-refresh-progress-bar"></div>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              opacity: this.state.isRefreshing ? 0.3 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {isHappyTuesdayFeed && (
              <div
                style={{ width: "100%", height: "100%", position: "relative" }}
              >
                <HappyTuesdayNewsFeed
                  inIE={true}
                  initialTab={props.data.initialTab || "blog"}
                  initialSubTab={props.data.initialSubTab}
                />
              </div>
            )}

            {!isHappyTuesdayFeed && props.data?.__html && (
              <div
                style={{
                  margin: "2px 1px 0px 2px",
                  minHeight: "calc(100% - 4px)",
                }}
                dangerouslySetInnerHTML={props.data}
              />
            )}

            {isReadme && <HamsterCreator />}

            {props.children}

            {!isHappyTuesdayFeed &&
              props.data &&
              !props.data.html &&
              props.data.src &&
              (this.state.dimensions ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  <iframe
                    className={this.id}
                    frameBorder="0"
                    src={props.data.src}
                    title={props.data.src}
                    importance="low"
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                    }}
                  />
                </div>
              ) : (
                <iframe
                  className={this.id}
                  frameBorder="0"
                  src={props.data.src}
                  title={props.data.src}
                  importance="low"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                />
              ))}
          </div>
        </div>
      </Window>
    );
  }
}

export default InternetExplorer;
