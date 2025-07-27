import React, { Component } from "react";
import nanoid from "nanoid";
import * as icons from "../icons";
import * as Applications from "../components/Applications";
import getStartMenuData from "../data/start";
import desktopData from "../data/desktop";
import { ProgramContext } from ".";
import faq from "../data/textFiles/faq";
import commits from "../data/textFiles/commits";

// Utility function to detect mobile devices
const isMobile = () =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const transformLinks = (option) => ({
  ...option,
  onClick:
    option.href && !option.onClick
      ? (e) => {
          e.preventDefault();
          if (
            window.confirm(
              `This will open a new tab to ${option.href}, is that okay?`
            )
          ) {
            window.open(option.href);
          }
        }
      : option.onClick,
});

const settings = (injectedData = [], toggleSettings, toggleTaskManager) => [
  [
    ...injectedData,
    {
      title: "Help",
      icon: icons.help16,
      className: "submenu-align-bottom-help-settings",
      options: [
        {
          title: "FAQ",
          icon: icons.faq32,
          component: "Notepad",
          multiInstance: true,
          data: {
            content: faq.content,
            enableHtml: faq.enableHtml,
            readOnly: true,
          },
        },
        {
          title: "Demo",
          icon: icons.mediavid16,
          component: "",
          isDisabled: true,
          multiInstance: true,
        },
        {
          title: "Change Log",
          icon: icons.notepadFile16,
          component: "Notepad",
          data: {
            content: commits,
          },
        },
        {
          title: "Release Notes",
          icon: icons.postit16,
          component: "Notepad",
          //data: {
          //content: ,
          //},
        },
        {
          title: "Contact",
          icon: icons.mailbox32,
          component: "",
          isDisabled: true,
          multiInstance: true,
        },
      ],
    },
    {
      title: "Control Panel",
      icon: icons.controlPanel16,
      className: "submenu-align-bottom-control-panel-settings",
      options: [
        {
          title: "Cache Manager",
          icon: icons.floppy16,
          onClick: toggleTaskManager,
          multiInstance: true,
        },
        {
          title: "Display",
          icon: icons.display_properties16,
          onClick: toggleSettings,
          multiInstance: true,
        },
      ],
    },
    {
      title: "Command Prompt",
      icon: icons.command16,
      component: "JSDos",
      multiInstance: true,
    },
    {
      title: "Start Menu Builder",
      icon: icons.start_menu32,
      component: "Notepad",
      tooltip: "Log in to access",
      isDisabled: true,
      multiInstance: true,
      //customTooltip: true, // new
    },

    {
      title: "Account",
      icon: icons.account32,
      className: "submenu-align-bottom-account-settings",
      options: [
        {
          title: "General",
          icon: icons.account32,
          onClick: toggleSettings,
          component: "",
          isDisabled: true,
          multiInstance: true,
        },
        {
          title: "Newsletter/Feed",
          icon: icons.newsletter16,
          onClick: toggleSettings,
          multiInstance: true,
        },
        {
          title: "Chatbots",
          icon: icons.textchat32,
          onClick: toggleTaskManager,
          multiInstance: true,
        },
      ],
    },
  ],
];

const startMenu = (
  injectedData = [],
  toggleSettings,
  toggleTaskManager,
  shutDown
) => [
  [
    ...injectedData,
    {
      title: "Settings",
      icon: icons.settings24,
      className: "submenu-align-bottom-settings",
      options: settings([], toggleSettings, toggleTaskManager),
    },
  ],
  {
    title: (
      <span>
        <span style={{ fontSize: "11px" }}>Log In</span> •{" "}
        <span style={{ fontSize: "12px" }}>Join</span>
      </span>
    ),
    icon: icons.logOff24,
    isDisabled: true,
    tooltip: "soon",
  },
  {
    title: "Shut Down...",
    icon: icons.shutDown24,
    onClick: shutDown,
  },
];

export const addIdsToData = (data) =>
  Array.isArray(data)
    ? data.map((d) => {
        if (Array.isArray(d)) {
          return addIdsToData(d);
        }
        return {
          ...transformLinks(d),
          id: d.id || nanoid(),
          options: addIdsToData(d.options),
          // Preserve tooltip from original data
          tooltip: d.tooltip,
        };
      })
    : undefined;

const desktopWithIds = (desktopData = []) =>
  addIdsToData(desktopData).map((entry) => {
    const { onClick, ...data } = entry;
    return {
      ...data,
      onDoubleClick: onClick,
    };
  });

const mapActions = (open, doubleClick) => (entry) => {
  if (Array.isArray(entry)) {
    return initialize(open, entry);
  }
  const { onClick, ...nestedData } = entry;
  const onClickAction = !entry.options
    ? (...params) => {
        if (Applications[entry.component]) {
          open(entry);
        }
        if (entry.onClick) {
          entry.onClick(...params);
        }
        if (entry.onDoubleClick) {
          entry.onDoubleClick(...params);
        }
      }
    : undefined;
  return {
    ...nestedData,
    onClick: !doubleClick ? onClickAction : undefined,
    onDoubleClick: doubleClick ? onClick : undefined,
    options: initialize(open, entry.options),
    // Preserve tooltip
    tooltip: entry.tooltip,
  };
};

export const initialize = (open, data, doubleClick) => {
  const mapFunc = mapActions(open, doubleClick);
  return Array.isArray(data) ? data.map(mapFunc) : undefined;
};

const buildDesktop = (desktopData, open) => [
  ...initialize((p) => open()(p), desktopWithIds(desktopData)).map((entry) => {
    const { onClick, ...data } = entry;
    return {
      ...data,
      onDoubleClick: onClick,
    };
  }),
];

class ProgramProvider extends Component {
  static defaultProps = {
    getStartMenuData: getStartMenuData,
    desktopData,
  };

  state = {
    programs: Object.keys(Applications).reduce(
      (acc, p) => ({
        ...acc,
        [p]: { ...Applications[p], programId: nanoid() },
      }),
      {}
    ),
    recycleEmpty: true,
    desktop: buildDesktop(this.props.desktopData, () => this.open),
    startMenu: initialize(
      (p) => this.open(p),
      addIdsToData(getStartMenuData())
    ),
    quickLaunch: [
      {
        onClick: () => this.minimizeAll(),
        icon: icons.twitter16,
        title: "",
      },
      {
        onClick: () => {
          // Check if device is mobile
          const isMobile =
            window.innerWidth <= 768 ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              navigator.userAgent
            );

          if (isMobile) {
            // Click mobile controls button on mobile devices
            const mobileControlsButton = document.querySelector(
              ".mobile-controls-button"
            );
            if (mobileControlsButton) {
              mobileControlsButton.click();
            }
          } else {
            // Click desktop controls button on desktop
            const desktopControlsButton = document.querySelector(
              ".desktop-controls-button"
            );
            if (desktopControlsButton) {
              desktopControlsButton.click();
            }
          }

          // Toggle the state and border style
          this.setState((prevState) => {
            const isWhiteBorder = !prevState.isWhiteBorder;
            return {
              isWhiteBorder,
              quickLaunch: prevState.quickLaunch.map((item) =>
                item.title === "Show Clippy" || item.title === "Hide Clippy"
                  ? {
                      ...item,
                      title:
                        item.title === "Hide Clippy"
                          ? "Show Clippy"
                          : "Hide Clippy",
                      className: `quick-launch-button-clippy btn ButtonIconSmall ${
                        isWhiteBorder ? "white-border" : ""
                      }`,
                      tooltip:
                        item.title === "Hide Clippy"
                          ? "Show Clippy"
                          : "Hide Clippy",
                    }
                  : item
              ),
            };
          });
        },
        icon: icons.textchat32,
        title: "Hide Clippy",
        tooltip: "Hide Clippy",
        className: "quick-launch-button-clippy btn ButtonIconSmall",
      },
    ],
    activePrograms: {},
    openOrder: [],
    zIndexes: [],
    settingsDisplay: false,
    shutDownMenu: false,
    isWhiteBorder: false,
  };

  componentDidMount() {
    window.addEventListener("agentChanged", this.refreshStartMenu);

    // ADD THESE LINES - Listen for mail status changes
    window.addEventListener("mailStatusChanged", this.refreshStartMenu);
    window.addEventListener("startMenuUpdate", this.refreshStartMenu);
    window.addEventListener("forceRefresh", this.refreshStartMenu);
    window.addEventListener("forceMenuRefresh", this.refreshStartMenu);

    // Set initial startMenu with correct method binding
    this.setState({
      startMenu: initialize(
        (p) => this.open(p),
        addIdsToData(
          startMenu(
            this.props.getStartMenuData(),
            this.toggleSettings,
            this.toggleTaskManager,
            this.toggleShutDownMenu
          )
        )
      ),
    });

    const desktopSaved = JSON.parse(window.localStorage.getItem("desktop"));
    if (desktopSaved) {
      this.setState(() => ({
        desktop: buildDesktop(desktopSaved, () => this.open),
      }));
    }

    window.ProgramContext = {
      onOpen: this.open,
      onClose: this.close,
      setRecycleBinFull: this.setRecycleBinFull,
      toggleSettings: this.toggleSettings,
      refreshStartMenu: this.refreshStartMenu, // ADD THIS - make it globally accessible
    };
  }

  // UPDATE componentWillUnmount to remove all event listeners:
  componentWillUnmount() {
    window.removeEventListener("agentChanged", this.refreshStartMenu);
    // ADD THESE LINES
    window.removeEventListener("mailStatusChanged", this.refreshStartMenu);
    window.removeEventListener("startMenuUpdate", this.refreshStartMenu);
    window.removeEventListener("forceRefresh", this.refreshStartMenu);
    window.removeEventListener("forceMenuRefresh", this.refreshStartMenu);
  }

  refreshStartMenu = () => {
    console.log(
      "📧 ProgramProvider.refreshStartMenu called - regenerating start menu"
    );
    // Get fresh start menu data (this will call getStartMenuData() again)
    const freshStartMenuData = this.props.getStartMenuData();
    console.log("📧 Fresh start menu data generated:", freshStartMenuData);

    this.setState({
      startMenu: initialize(
        (p) => this.open(p),
        addIdsToData(
          startMenu(
            freshStartMenuData, // Use fresh data
            this.toggleSettings,
            this.toggleTaskManager,
            this.toggleShutDownMenu
          )
        )
      ),
    });

    console.log("📧 Start menu state updated");
  };

  toggleShutDownMenu = () =>
    this.setState((state) => ({ shutDownMenu: !state.shutDownMenu }));

  toggleTaskManager = () =>
    this.setState((state) => ({ taskManager: !state.taskManager }));

  toggleSettings = (val) =>
    this.setState((state) => ({
      settingsDisplay: val || !state.settingsDisplay,
    }));

  shutDown = () => {
    const desktop = document.querySelector(".desktop");
    if (desktop) {
      desktop.innerHTML = "";
      desktop.classList.add("windowsShuttingDown");
      setTimeout(() => {
        desktop.classList.replace(
          "windowsShuttingDown",
          "itIsNowSafeToTurnOffYourComputer"
        );
        window.localStorage.removeItem("loggedIn");
      }, 3000);
    }
  };

  isProgramActive = (programId) => this.state.activePrograms[programId];

  moveToTop = (windowId) => {
    this.setState(
      (prevState) => {
        const isAlreadyActive = prevState.activeId === windowId;

        // Always update the state to ensure re-render
        return {
          activePrograms: {
            ...prevState.activePrograms,
            [windowId]: {
              ...prevState.activePrograms[windowId],
              minimized: false,
            },
          },
          activeId: windowId,
          zIndexes: [
            ...prevState.zIndexes.filter((v) => v !== windowId),
            windowId,
          ],
          // Force a re-render by incrementing activation nonce
          activationNonce: (prevState.activationNonce || 0) + 1,
        };
      },
      () => {
        // After state update, ensure the window gets focus
        // This helps trigger any focus-based CSS updates
        setTimeout(() => {
          const windowElement = document.querySelector(
            `.Window[data-window-id="${windowId}"]`
          );
          if (windowElement) {
            // Find a focusable element within the window
            const focusableElement = windowElement.querySelector(
              'button, [tabindex="0"], input, select, textarea'
            );
            if (focusableElement) {
              focusableElement.focus();
            }
          }
        }, 0);
      }
    );
  };

  open = (program, options = {}) => {
    // Check if this is a News Feed item that needs navigation
    if (program?.data?.shouldNavigate && program.data.navigateTo) {
      // Navigate to the route
      if (window.location.pathname !== program.data.navigateTo) {
        // Use React Router navigate if available through a global reference
        if (window.__navigate) {
          window.__navigate(program.data.navigateTo);
        } else {
          // Fallback to updating the URL (less ideal)
          window.history.pushState({}, "", program.data.navigateTo);
          window.dispatchEvent(new PopStateEvent("popstate"));
        }
      }
      // Continue with normal window opening
    }

    const isBlockingProgramRunning = Object.values(
      this.state.activePrograms
    ).some((prog) => ["Doom", "JSDos"].includes(prog.component));

    if (
      isBlockingProgramRunning &&
      ["Doom", "JSDos"].includes(program.component)
    ) {
      return;
    }

    if (isBlockingProgramRunning) {
      return;
    }

    if (!Applications[program.component]) return;

    if (this.isProgramActive(program.id) && !program.multiInstance) {
      this.moveToTop(program.id);
      return;
    }

    const newProgram = {
      ...program,
      id: nanoid(),
      data: options.new ? {} : program.data,
      title: options.new ? program.component : program.title,
    };

    this.setState({
      activePrograms: {
        ...this.state.activePrograms,
        [newProgram.id]: newProgram,
      },
      openOrder: [...this.state.openOrder, newProgram.id],
      zIndexes: [...this.state.zIndexes, newProgram.id],
      activeId: newProgram.id,
    });

    // App-specific speech balloons with 33% chance
    const targetApps = ["Read Me", "FAQ", "Change Log"];
    if (targetApps.includes(program.title) && Math.random() < 0.33) {
      setTimeout(() => {
        if (window.showClippyCustomBalloon) {
          let message;
          switch (program.title) {
            case "Read Me":
              message =
                "I see you're checking out the Read Me! Let me know if you need any help understanding Happy Tuesdays!";
              break;
            case "FAQ":
              message =
                "Reading the FAQ is smart! I'm here if you have any other questions not covered there.";
              break;
            case "Change Log":
              message =
                "Checking out the latest changes? That's what I call staying informed! 📋";
              break;
            default:
              message =
                "Good choice reading the documentation! Knowledge is power! 📚";
          }
          window.showClippyCustomBalloon(message, 6000);
        }
      }, 1500); // 1.5 second delay after opening
    }
  };

  close = (program, exit) => {
    if (!this.isProgramActive(program.id)) return;

    const taskBar = this.state.openOrder.filter((p) => p !== program.id);
    this.setState({
      openOrder: taskBar,
      zIndexes: this.state.zIndexes.filter((p) => p !== program.id),
    });

    // Emit close event for Feeds program
    // Check multiple possible identifiers for the Feeds window
    const isFeedsWindow =
      program.title === "Feeds" ||
      program.title === "News Feed" ||
      program.component === "HappyTuesdayNewsFeed" ||
      (program.component === "InternetExplorer" &&
        program.data?.component === "HappyTuesdayNewsFeed");

    if (isFeedsWindow) {
      console.log("📧 Feeds window closed, emitting event");
      window.dispatchEvent(
        new CustomEvent("programClosed", {
          detail: {
            programTitle: "Feeds",
            programComponent: program.component,
            programId: program.id,
          },
        })
      );
    }

    if (!program.background || exit) {
      this.exit(program.id);
    }
  };

  exit = (programId) =>
    this.setState({
      activePrograms: Object.keys(this.state.activePrograms).reduce(
        (acc, val) => {
          if (programId !== val) {
            return {
              ...acc,
              [val]: this.state.activePrograms[val],
            };
          }
          return acc;
        },
        {}
      ),
      activeId: null,
    });

  minimize = (programId) => {
    if (!this.state.activePrograms[programId]) return;

    this.setState({
      activePrograms: {
        ...this.state.activePrograms,
        [programId]: {
          ...this.state.activePrograms[programId],
          minimized: true,
        },
      },
      activeId: null,
    });
  };

  minimizeAll = () =>
    this.setState((state) => ({
      activePrograms: Object.keys(state.activePrograms).reduce(
        (acc, val) => ({
          ...acc,
          [val]: {
            ...state.activePrograms[val],
            minimized: true,
          },
        }),
        {}
      ),
      activeId: null,
    }));

  save = (prog, data, title, location = "desktop") => {
    const mapFunc = mapActions(this.open, location === "desktop");
    const existing = this.state[location].find(
      (p) => p.title === title || p.id === prog.id
    );
    if (existing) {
      return this.setState(
        (state) => {
          const filtered = state[location].filter(
            (p) => p.title !== existing.title
          );
          const updated = {
            ...existing,
            data,
            updated: true,
          };
          return {
            [location]: [
              ...filtered,
              mapFunc({
                ...updated,
                onClick: () => this.open(updated),
              }),
            ],
          };
        },
        () => this.saveLocally(location)
      );
    } else {
      const newProg = {
        ...prog,
        data: {
          ...data,
          readOnly: false,
        },
        title,
        newFile: true,
        id: nanoid(),
        readOnly: false,
      };
      return this.setState(
        (state) => ({
          [location]: [
            ...state[location],
            {
              ...mapFunc({
                ...newProg,
                onClick: () => this.open(newProg),
              }),
            },
          ],
        }),
        () => this.saveLocally(location)
      );
    }
  };

  saveLocally = (loc) =>
    window.localStorage.setItem(loc, JSON.stringify(this.state[loc]));

  setRecycleBinFull = (isFull) => {
    this.setState({ recycleEmpty: !isFull });
  };

  render() {
    return (
      <ProgramContext.Provider
        value={{
          ...this.state,
          onOpen: this.open,
          onClose: this.close,
          moveToTop: this.moveToTop,
          toggleTaskManager: this.toggleTaskManager,
          toggleSettings: this.toggleSettings,
          toggleShutDownMenu: this.toggleShutDownMenu,
          shutDown: this.shutDown,
          onMinimize: this.minimize,
          save: this.save,
          setRecycleBinFull: this.setRecycleBinFull,
        }}
      >
        {this.props.children}
      </ProgramContext.Provider>
    );
  }
}

export default ProgramProvider;
