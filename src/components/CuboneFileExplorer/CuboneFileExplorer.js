// Final working version of CuboneFileExplorer.js with toolbar fixes

import React, { Component } from "react";
import ReactDOM from "react-dom";
import { WindowExplorer, ExplorerIcon } from "packard-belle";
import Window from "../tools/Window";
import * as icons from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

class CuboneFileExplorer extends Component {
  constructor(props) {
    super(props);

    const fileSystem = props.data?.fileSystem || this.getDefaultFileSystem();
    const initialPath = props.data?.initialPath || "C:/My Documents";
    const currentFolder = this.navigateToPath(fileSystem, initialPath);

    this.state = {
      currentPath: initialPath,
      currentFolder: currentFolder,
      fileSystem: fileSystem,
      selectedFiles: [],
      viewMode: "smallIcons",
      history: [initialPath],
      historyIndex: 0,
      expandedFolders: { "/": true, "/C:": true },
      draggedFile: null,
      showViewsMenu: false,
      viewsMenuPosition: null,
    };

    // Store button handlers for easy access
    this.buttonHandlers = {
      0: this.handleBack,
      1: this.handleForward,
      2: this.handleUp,
      3: () => console.log("Cut clicked"),
      4: () => console.log("Copy clicked"),
      5: () => console.log("Paste clicked"),
      6: () => console.log("Properties clicked"),
      7: this.handleViewsClick,
    };

    // Observer to watch for toolbar rendering
    this.toolbarObserver = null;
  }

  componentDidMount() {
    console.log("CuboneFileExplorer mounted");

    // Set up MutationObserver to watch for toolbar
    this.setupToolbarObserver();

    // Add global click handler
    document.addEventListener("click", this.handleGlobalClick);

    // Try to attach handlers after a delay
    setTimeout(() => this.attachToolbarHandlers(), 100);
    setTimeout(() => this.attachToolbarHandlers(), 500);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleGlobalClick);

    if (this.toolbarObserver) {
      this.toolbarObserver.disconnect();
    }
  }

  // Set up MutationObserver to watch for toolbar
  setupToolbarObserver = () => {
    this.toolbarObserver = new MutationObserver((mutations) => {
      // Check if toolbar was added
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const toolbar = document.querySelector(
            ".WindowExplorer__options .OptionsList__large-icons"
          );
          if (toolbar) {
            console.log("Toolbar detected by MutationObserver");
            this.attachToolbarHandlers();
          }
        }
      }
    });

    // Start observing the entire window for changes
    const windowElement = document.querySelector(".CuboneFileExplorer");
    if (windowElement) {
      this.toolbarObserver.observe(windowElement, {
        childList: true,
        subtree: true,
      });
    }
  };

  // Attach event handlers directly to toolbar buttons
  attachToolbarHandlers = () => {
    const toolbar = document.querySelector(
      ".CuboneFileExplorer .WindowExplorer__options .OptionsList__large-icons"
    );

    if (!toolbar) {
      console.log("Toolbar not found");
      return;
    }

    // Remove any existing delegation
    if (toolbar._handlersAttached) {
      return;
    }

    console.log("Attaching toolbar handlers");
    toolbar._handlersAttached = true;

    // Get all buttons
    const buttons = toolbar.querySelectorAll("button");
    console.log(`Found ${buttons.length} toolbar buttons`);

    // Attach click handlers to each button
    buttons.forEach((button, index) => {
      // Clone the button to remove existing event listeners
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);

      // Add our click handler
      newButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log(`Toolbar button ${index} clicked`);

        // Check if button is disabled
        if (newButton.disabled) {
          console.log(`Button ${index} is disabled`);
          return;
        }

        // Call the appropriate handler
        const handler = this.buttonHandlers[index];
        if (handler) {
          handler.call(this, e);
        }
      });

      // Special handling for Views button
      if (index === 7) {
        newButton.classList.add("views-button-with-dropdown");
      }
    });

    // Update disabled states
    this.updateButtonStates();
  };

  // Update button disabled states
  updateButtonStates = () => {
    const buttons = document.querySelectorAll(
      ".CuboneFileExplorer .WindowExplorer__options .OptionsList__large-icons button"
    );

    if (buttons.length > 0) {
      // Back button
      buttons[0].disabled = this.state.historyIndex === 0;

      // Forward button
      buttons[1].disabled =
        this.state.historyIndex >= this.state.history.length - 1;
    }
  };

  componentDidUpdate(prevProps, prevState) {
    // Update button states when history changes
    if (
      prevState.historyIndex !== this.state.historyIndex ||
      prevState.history.length !== this.state.history.length
    ) {
      this.updateButtonStates();
    }

    // Re-attach handlers if needed
    if (
      !document.querySelector(
        ".WindowExplorer__options .OptionsList__large-icons"
      )._handlersAttached
    ) {
      this.attachToolbarHandlers();
    }
  }

  handleGlobalClick = (e) => {
    // Close views menu if clicking outside
    if (
      this.state.showViewsMenu &&
      !e.target.closest(".views-dropdown") &&
      !e.target.closest(".views-button-with-dropdown")
    ) {
      this.setState({ showViewsMenu: false });
    }
  };

  // Default file system
  getDefaultFileSystem() {
    return {
      "/": {
        "C:": {
          type: "folder",
          icon: "hdd32",
          children: {
            Windows: {
              type: "folder",
              icon: "folder32",
              children: {
                System32: {
                  type: "folder",
                  icon: "folder32",
                  children: {
                    "notepad.exe": {
                      type: "file",
                      icon: "notepad16",
                      size: "64 KB",
                      component: "Notepad",
                    },
                  },
                },
              },
            },
            "Program Files": {
              type: "folder",
              icon: "folder32",
              children: {
                Hydra98: {
                  type: "folder",
                  icon: "folder32",
                  children: {
                    "readme.txt": {
                      type: "file",
                      icon: "notepadFile16",
                      content: "Welcome to Hydra98 File Manager!",
                      size: "2 KB",
                      component: "Notepad",
                    },
                  },
                },
              },
            },
            "My Documents": {
              type: "folder",
              icon: "folderOpen32",
              children: {
                "ASCII Art": {
                  type: "folder",
                  icon: "folder32",
                  children: {
                    "flames.txt": {
                      type: "file",
                      icon: "notepadFile16",
                      size: "1 KB",
                      component: "Burn",
                    },
                    "pipes.txt": {
                      type: "file",
                      icon: "notepadFile16",
                      size: "1 KB",
                      component: "Pipes",
                    },
                  },
                },
                "sample.txt": {
                  type: "file",
                  icon: "notepadFile16",
                  content: "Sample text file",
                  size: "1 KB",
                  component: "Notepad",
                },
              },
            },
          },
        },
      },
    };
  }

  // Navigate to path
  navigateToPath(fileSystem, path) {
    if (path === "/" || path === "") {
      return fileSystem["/"] || {};
    }

    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    const pathParts = cleanPath.split("/").filter(Boolean);
    let current = fileSystem["/"];

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (current && current[part]) {
        if (current[part].children) {
          current = current[part].children;
        } else {
          return current;
        }
      } else {
        return {};
      }
    }

    return current || {};
  }

  // Handle back navigation
  handleBack = () => {
    console.log("handleBack called", {
      historyIndex: this.state.historyIndex,
      history: this.state.history,
    });

    if (this.state.historyIndex > 0) {
      const newIndex = this.state.historyIndex - 1;
      const newPath = this.state.history[newIndex];
      const newFolder = this.navigateToPath(this.state.fileSystem, newPath);

      console.log("Navigating back to:", newPath);

      this.setState({
        historyIndex: newIndex,
        currentPath: newPath,
        currentFolder: newFolder,
      });
    }
  };

  // Handle forward navigation
  handleForward = () => {
    console.log("handleForward called");

    if (this.state.historyIndex < this.state.history.length - 1) {
      const newIndex = this.state.historyIndex + 1;
      const newPath = this.state.history[newIndex];
      const newFolder = this.navigateToPath(this.state.fileSystem, newPath);

      console.log("Navigating forward to:", newPath);

      this.setState({
        historyIndex: newIndex,
        currentPath: newPath,
        currentFolder: newFolder,
      });
    }
  };

  // Handle up navigation
  handleUp = () => {
    console.log("handleUp called");
    const pathParts = this.state.currentPath.split("/").filter(Boolean);
    if (pathParts.length > 1) {
      pathParts.pop();
      const newPath = pathParts.join("/");
      this.navigateTo(newPath);
    } else if (pathParts.length === 1) {
      this.navigateTo("/");
    }
  };

  // Navigate to a specific path
  navigateTo = (newPath) => {
    console.log("NavigateTo called with path:", newPath);

    const newFolder = this.navigateToPath(this.state.fileSystem, newPath);
    const newHistory = [
      ...this.state.history.slice(0, this.state.historyIndex + 1),
      newPath,
    ];

    this.setState({
      currentPath: newPath,
      currentFolder: newFolder,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  };

  // Handle views button click
  handleViewsClick = (e) => {
    console.log("handleViewsClick called");

    // Get button position
    const button = e.currentTarget || e.target;
    const rect = button.getBoundingClientRect();

    this.setState((prevState) => ({
      showViewsMenu: !prevState.showViewsMenu,
      viewsMenuPosition: !prevState.showViewsMenu
        ? {
            top: rect.bottom + 2,
            left: rect.left,
          }
        : null,
    }));
  };

  // Change view mode
  changeViewMode = (mode) => {
    console.log("Changing view mode to:", mode);
    this.setState({
      viewMode: mode,
      showViewsMenu: false,
    });
  };

  // Toggle folder expansion
  toggleFolder = (path) => {
    this.setState((prevState) => ({
      expandedFolders: {
        ...prevState.expandedFolders,
        [path]: !prevState.expandedFolders[path],
      },
    }));
  };

  // Render tree node
  renderTreeNode = (name, item, path) => {
    const isExpanded = this.state.expandedFolders[path];
    const isCurrentPath = path === this.state.currentPath;

    if (item.type === "folder") {
      let folderIcon;
      if (name === "C:") {
        folderIcon = icons.hdd32 || icons.folder32;
      } else {
        folderIcon = isExpanded
          ? icons.folderOpen24 || icons.folder16
          : icons.folder16;
      }

      return (
        <div key={path} className="tree-node">
          <div
            className={`tree-item ${isCurrentPath ? "selected" : ""}`}
            onClick={() => {
              this.toggleFolder(path);
              this.navigateTo(path);
            }}
          >
            <img src={folderIcon} alt="" className="tree-icon" />
            <span className="tree-label">{name}</span>
          </div>
          {isExpanded && item.children && (
            <div className="tree-children">
              {Object.entries(item.children).map(([childName, childItem]) =>
                this.renderTreeNode(
                  childName,
                  childItem,
                  `${path}/${childName}`
                )
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Render tree view
  renderTreeView = () => {
    const root = this.state.fileSystem["/"];
    return (
      <div className="tree-view">
        {Object.entries(root).map(([name, item]) =>
          this.renderTreeNode(name, item, `/${name}`)
        )}
      </div>
    );
  };

  // Handle double-click
  handleDoubleClick = (name, item) => {
    if (item.type === "folder") {
      const separator = this.state.currentPath === "/" ? "" : "/";
      const newPath = this.state.currentPath + separator + name;
      this.navigateTo(newPath);
    } else if (item.type === "file") {
      this.openFile(name, item);
    }
  };

  // Open file
  openFile = (fileName, fileData) => {
    if (this.props.onOpen && fileData.component) {
      const iconMap = {
        Notepad: icons.notepad16,
        Burn: icons.burn16,
        Pipes: icons.pipes16,
        Sand: icons.sand16,
        ImageWindow: icons.paint16,
      };

      this.props.onOpen({
        component: fileData.component,
        title: fileName,
        icon: iconMap[fileData.component] || icons.notepadFile16,
        multiInstance: true,
        data:
          fileData.component === "Notepad"
            ? { content: fileData.content || "" }
            : {},
      });
    }
  };

  // Render views dropdown menu
  renderViewsMenu = () => {
    if (!this.state.showViewsMenu || !this.state.viewsMenuPosition) return null;

    const viewOptions = [
      { mode: "icons", label: "Large Icons" },
      { mode: "smallIcons", label: "Small Icons" },
      { mode: "list", label: "List" },
      { mode: "details", label: "Details" },
      { mode: "tiles", label: "Tiles" },
    ];

    // Render as a portal to ensure it's on top
    return ReactDOM.createPortal(
      <div
        className="views-dropdown"
        style={{
          position: "fixed",
          top: this.state.viewsMenuPosition.top,
          left: this.state.viewsMenuPosition.left,
          zIndex: 10000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {viewOptions.map((option) => (
          <div
            key={option.mode}
            className={`view-option ${
              this.state.viewMode === option.mode ? "selected" : ""
            }`}
            onClick={() => this.changeViewMode(option.mode)}
          >
            {this.state.viewMode === option.mode && "• "}
            {option.label}
          </div>
        ))}
      </div>,
      document.body
    );
  };

  // Drag handlers
  handleDragStart = (e, fileName, fileData) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", fileName);
    this.setState({
      draggedFile: {
        name: fileName,
        data: fileData,
        sourcePath: this.state.currentPath,
      },
    });
  };

  handleDragEnd = () => {
    this.setState({ draggedFile: null });
  };

  handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  handleDrop = (e, targetName, targetData) => {
    e.preventDefault();
    e.stopPropagation();
    if (targetData.type === "folder" && this.state.draggedFile) {
      console.log(`Moving ${this.state.draggedFile.name} to ${targetName}`);
    }
  };

  render() {
    const { props, state } = this;

    // Build explorer options (even though they might not work with packard-belle)
    const explorerOptions = [
      {
        icon: icons.back,
        title: "Back",
        onClick: this.handleBack,
        disabled: state.historyIndex === 0,
      },
      {
        icon: icons.forward,
        title: "Forward",
        onClick: this.handleForward,
        disabled: state.historyIndex >= state.history.length - 1,
      },
      {
        icon: icons.upDir,
        title: "Up",
        onClick: this.handleUp,
      },
      {
        icon: icons.cut,
        title: "Cut",
        onClick: () => console.log("Cut clicked"),
      },
      {
        icon: icons.copy,
        title: "Copy",
        onClick: () => console.log("Copy clicked"),
      },
      {
        icon: icons.paste,
        title: "Paste",
        onClick: () => console.log("Paste clicked"),
      },
      {
        icon: icons.properties,
        title: "Properties",
        onClick: () => console.log("Properties clicked"),
      },
      {
        icon: icons.views || icons.folder16,
        title: "Views",
        onClick: this.handleViewsClick,
        className: "views-button-with-dropdown",
      },
    ];

    return (
      <>
        <Window
          {...props}
          title={`${state.currentPath} - File Explorer`}
          icon={icons.windowsExplorer16 || icons.folder16}
          Component={WindowExplorer}
          initialWidth={Math.min(500, window.innerWidth * 0.8)}
          initialHeight={Math.min(350, window.innerHeight * 0.7)}
          initialX={20}
          initialY={40}
          className="CuboneFileExplorer"
          resizable={true}
          address={state.currentPath.replace(/\//g, "\\")}
          explorerOptions={explorerOptions}
          menuOptions={buildMenu(
            {
              ...props,
              componentType: "Explorer",
            },
            {
              View: [
                {
                  title: "Large Icons",
                  onClick: () => this.changeViewMode("icons"),
                },
                {
                  title: "Small Icons",
                  onClick: () => this.changeViewMode("smallIcons"),
                },
                {
                  title: "List",
                  onClick: () => this.changeViewMode("list"),
                },
                {
                  title: "Details",
                  onClick: () => this.changeViewMode("details"),
                },
                {
                  title: "Tiles",
                  onClick: () => this.changeViewMode("tiles"),
                },
              ],
            }
          )}
        >
          <div className="file-explorer-content">
            {/* Tree view panel */}
            <div className="tree-panel">
              <div className="tree-header">Folders</div>
              {this.renderTreeView()}
            </div>

            {/* File list panel */}
            <div className={`file-panel ${state.viewMode}`}>
              {Object.keys(state.currentFolder).length === 0 ? (
                <div className="empty-folder">
                  <p>This folder is empty</p>
                </div>
              ) : state.viewMode === "list" || state.viewMode === "details" ? (
                <table className="file-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Size</th>
                      <th>Type</th>
                      {state.viewMode === "details" && <th>Modified</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(state.currentFolder).map(([name, item]) => (
                      <tr
                        key={name}
                        draggable
                        onDragStart={(e) => this.handleDragStart(e, name, item)}
                        onDragEnd={this.handleDragEnd}
                        onDoubleClick={() => this.handleDoubleClick(name, item)}
                        className="file-row"
                      >
                        <td>
                          <img
                            src={
                              icons[item.icon] ||
                              (item.type === "folder"
                                ? icons.folder16
                                : icons.notepadFile16)
                            }
                            alt=""
                            className="file-icon"
                          />
                          {name}
                        </td>
                        <td>
                          {item.size || (item.type === "folder" ? "" : "0 KB")}
                        </td>
                        <td>
                          {item.type === "folder" ? "File Folder" : "File"}
                        </td>
                        {state.viewMode === "details" && (
                          <td>{item.modified || "12/25/2024"}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="icon-grid">
                  {Object.entries(state.currentFolder).map(([name, item]) => (
                    <div
                      key={name}
                      draggable
                      onDragStart={(e) => this.handleDragStart(e, name, item)}
                      onDragEnd={this.handleDragEnd}
                      onDragOver={(e) => {
                        if (item.type === "folder") {
                          this.handleDragOver(e);
                          e.currentTarget.classList.add("drag-over");
                        }
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove("drag-over");
                      }}
                      onDrop={(e) => {
                        e.currentTarget.classList.remove("drag-over");
                        if (item.type === "folder") {
                          this.handleDrop(e, name, item);
                        }
                      }}
                      className={`file-item-wrapper ${
                        item.type === "folder" ? "drop-target" : ""
                      }`}
                    >
                      <ExplorerIcon
                        title={name}
                        icon={
                          icons[item.icon] ||
                          (item.type === "folder"
                            ? icons.folder32
                            : icons.notepadFile32)
                        }
                        onDoubleClick={() => this.handleDoubleClick(name, item)}
                        className={state.viewMode}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Window>

        {/* Views dropdown menu */}
        {this.renderViewsMenu()}
      </>
    );
  }
}

export default CuboneFileExplorer;
