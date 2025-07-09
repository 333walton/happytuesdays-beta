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
          title: "Contact",
          icon: icons.outlook16,
          component: "",
          isDisabled: true,
          multiInstance: true,
        },
      ],
    },
    {
      title: "Control Panel",
      onClick: toggleSettings,
      icon: icons.controlPanel16,
    },
    {
      title: "CMD.exe",
      icon: icons.command16,
      component: "JSDos",
      multiInstance: true,
    },
    {
      title: "Task Manager",
      onClick: toggleTaskManager, // Use the handler directly
      icon: icons.folderProgram16,
    },
    {
      title: "Account Settings",
      icon: icons.account32,
      component: "",
      isDisabled: true,
      multiInstance: false,
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
      options: settings([], toggleSettings, toggleTaskManager),
    },
  ],
  {
    title: "Sign Up / Sign In",
    icon: icons.logOff24,
    isDisabled: true,
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
      addIdsToData(
        getStartMenuData()
      )
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

    // Set initial startMenu with correct method binding
    this.setState({
      startMenu: initialize(
        (p) => this.open(p),
        addIdsToData(
          // In componentDidMount and refreshStartMenu:
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
    };
  }

  componentWillUnmount() {
    window.removeEventListener("agentChanged", this.refreshStartMenu);
  }

  refreshStartMenu = () => {
    this.setState({
      startMenu: initialize(
        (p) => this.open(p),
        addIdsToData(
          // In componentDidMount and refreshStartMenu:
          startMenu(
            this.props.getStartMenuData(),
            this.toggleSettings,
            this.toggleTaskManager,
            this.toggleShutDownMenu
          )
        )
      ),
    });
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
