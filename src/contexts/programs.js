import React, { Component } from "react";
import nanoid from "nanoid";
import * as icons from "../icons";
import * as Applications from "../components/Applications";
import startMenuData from "../data/start";
import desktopData from "../data/desktop";
import { ProgramContext } from ".";

// Utility function to detect mobile devices
// const isMobile = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const transformLinks = option => ({
  ...option,
  onClick:
    option.href && !option.onClick
      ? e => {
          e.preventDefault();
          if (
            window.confirm(
              `This will open a new tab to ${option.href}, is that okay?`
            )
          ) {
            window.open(option.href);
          }
        }
      : option.onClick
});

const settings = (injectedData = []) => [
  [
    ...injectedData,
    //{
    //  title: "Active Desktop",
    //  icon: icons.activeDesktop16,
    //  isDisabled: true
    //}
  ],
  {
    title: "Hydra Update...",
    icon: icons.windowsUpdate16,
    isDisabled: true
  }
];

const startMenu = (injectedData = [], set, shutDown) => [
  [
    ...injectedData,
    {
      title: "Settings",
      icon: icons.settings24,
      options: settings(set)
    }
  ],
  {
    title: "Connect Wallet",
    icon: icons.logOff24,
    isDisabled: true
  },
  {
    title: "Shut Down...",
    icon: icons.shutDown24,
    onClick: shutDown
  }
];

export const addIdsToData = data =>
  Array.isArray(data)
    ? data.map(d => {
        if (Array.isArray(d)) {
          return addIdsToData(d);
        }
        return {
          ...transformLinks(d),
          id: d.id || nanoid(),
          options: addIdsToData(d.options)
        };
      })
    : undefined;

const desktopWithIds = (desktopData = []) =>
  addIdsToData(desktopData).map(entry => {
    const { onClick, ...data } = entry;
    return {
      ...data,
      onDoubleClick: onClick
    };
  });

const mapActions = (open, doubleClick) => entry => {
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
    options: initialize(open, entry.options)
  };
};

export const initialize = (open, data, doubleClick) => {
  const mapFunc = mapActions(open, doubleClick);
  return Array.isArray(data) ? data.map(mapFunc) : undefined;
};

const buildDesktop = (desktopData, open) => [
  ...initialize(p => open()(p), desktopWithIds(desktopData)).map(entry => {
    const { onClick, ...data } = entry;
    return {
      ...data,
      onDoubleClick: onClick
    };
  })
];

class ProgramProvider extends Component {
  static defaultProps = {
    startMenuData,
    desktopData
  };

  state = {
    programs: Object.keys(Applications).reduce(
      (acc, p) => ({
        ...acc,
        [p]: { ...Applications[p], programId: nanoid() }
      }),
      {}
    ),
    recycleEmpty: true, // ✅ Added
    startMenu: initialize(
      p => this.open(p),
      addIdsToData(
        startMenu(
          this.props.startMenuData,
          [
            {
              title: "Control Panel",
              onClick: () => this.toggleSettings(),
              icon: icons.controlPanel16
            },
            {
              title: "CMD.exe",
              icon: icons.command16,
              component: "JSDos",
              multiInstance: true
            },
            {
              title: "Rebel CMD.exe",
              icon: icons.rebelcommand16,
              component: "StarWars",
              multiInstance: false,
            },
            {
              title: "Task Manager",
              onClick: () => this.toggleTaskManager(),
              icon: icons.folderProgram16
            },
          ],
          () => this.toggleShutDownMenu()
        )
      )
    ),
    desktop: buildDesktop(this.props.desktopData, () => this.open),
    quickLaunch: [
      {
        onClick: () => this.minimizeAll(),
        icon: icons.twitter16,
        title: ""
      }
    ],
    activePrograms: {},
    openOrder: [],
    zIndexes: [],
    settingsDisplay: false,
    shutDownMenu: false
  };

  componentDidMount() {
    const desktopSaved = JSON.parse(window.localStorage.getItem("desktop"));
    if (desktopSaved) {
      this.setState(() => ({
        desktop: buildDesktop(desktopSaved, () => this.open)
      }));
    }

    window.ProgramContext = {
      onOpen: this.open,
      onClose: this.close,
      setRecycleBinFull: this.setRecycleBinFull // ✅ add this line
    };

  }

  toggleShutDownMenu = () =>
    this.setState(state => ({ shutDownMenu: !state.shutDownMenu }));

  toggleTaskManager = () =>
    this.setState(state => ({ taskManager: !state.taskManager }));

  toggleSettings = val =>
    this.setState(state => ({
      settingsDisplay: val || !state.settingsDisplay
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

  isProgramActive = programId => this.state.activePrograms[programId];

  moveToTop = windowId => {
    this.setState({
      activePrograms: {
        ...this.state.activePrograms,
        [windowId]: {
          ...this.state.activePrograms[windowId],
          minimized: false
        }
      },
      activeId: windowId,
      zIndexes: [
        ...this.state.zIndexes.filter(v => v !== windowId),
        windowId
      ]
    });
  };

  open = (program, options = {}) => {
    const isBlockingProgramRunning = Object.values(this.state.activePrograms).some(
      prog => ['Doom', 'JSDos'].includes(prog.component)
    );

    if (isBlockingProgramRunning && ['Doom', 'JSDos'].includes(program.component)) {
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
      title: options.new ? program.component : program.title
    };

    this.setState({
      activePrograms: {
        ...this.state.activePrograms,
        [newProgram.id]: newProgram
      },
      openOrder: [...this.state.openOrder, newProgram.id],
      zIndexes: [...this.state.zIndexes, newProgram.id],
      activeId: newProgram.id
    });
  };

  close = (program, exit) => {
    if (!this.isProgramActive(program.id)) return;

    const taskBar = this.state.openOrder.filter(p => p !== program.id);
    this.setState({
      openOrder: taskBar,
      zIndexes: this.state.zIndexes.filter(p => p !== program.id)
    });

    if (!program.background || exit) {
      this.exit(program.id);
    }
  };

  exit = programId =>
    this.setState({
      activePrograms: Object.keys(this.state.activePrograms).reduce((acc, val) => {
        if (programId !== val) {
          return {
            ...acc,
            [val]: this.state.activePrograms[val]
          };
        }
        return acc;
      }, {}),
      activeId: null
    });

  minimize = programId => {
    if (!this.state.activePrograms[programId]) return;

    this.setState({
      activePrograms: {
        ...this.state.activePrograms,
        [programId]: {
          ...this.state.activePrograms[programId],
          minimized: true
        }
      },
      activeId: null
    });
  };

  minimizeAll = () =>
    this.setState(state => ({
      activePrograms: Object.keys(state.activePrograms).reduce((acc, val) => ({
        ...acc,
        [val]: {
          ...state.activePrograms[val],
          minimized: true
        }
      }), {}),
      activeId: null
    }));

  save = (prog, data, title, location = "desktop") => {
    const mapFunc = mapActions(this.open, location === "desktop");
    const existing = this.state[location].find(
      p => p.title === title || p.id === prog.id
    );
    if (existing) {
      return this.setState(
        state => {
          const filtered = state[location].filter(
            p => p.title !== existing.title
          );
          const updated = {
            ...existing,
            data,
            updated: true
          };
          return {
            [location]: [
              ...filtered,
              mapFunc({
                ...updated,
                onClick: () => this.open(updated)
              })
            ]
          };
        },
        () => this.saveLocally(location)
      );
    } else {
      const newProg = {
        ...prog,
        data: {
          ...data,
          readOnly: false
        },
        title,
        newFile: true,
        id: nanoid(),
        readOnly: false
      };
      return this.setState(
        state => ({
          [location]: [
            ...state[location],
            {
              ...mapFunc({
                ...newProg,
                onClick: () => this.open(newProg)
              })
            }
          ]
        }),
        () => this.saveLocally(location)
      );
    }
  };

  saveLocally = loc =>
    window.localStorage.setItem(loc, JSON.stringify(this.state[loc]));

  // ✅ ADDED: Controls the recycle icon state globally
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
          setRecycleBinFull: this.setRecycleBinFull // ✅ exposed here
        }}
      >
        {this.props.children}
      </ProgramContext.Provider>
    );
  }
}

export default ProgramProvider;
