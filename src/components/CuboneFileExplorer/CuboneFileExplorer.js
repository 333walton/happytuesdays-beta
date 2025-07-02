// Updated CuboneFileExplorer.js with fixes

import React, { Component } from "react";
import { WindowExplorer, ExplorerIcon } from "packard-belle";
import Window from "../tools/Window";
import * as icons from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

class CuboneFileExplorer extends Component {
  constructor(props) {
    super(props);
    this.viewsButtonRef = React.createRef();

    const fileSystem = props.data?.fileSystem || this.getDefaultFileSystem();
    const initialPath = props.data?.initialPath || "C:/My Documents";
    const currentFolder = this.navigateToPath(fileSystem, initialPath);

    this.state = {
      currentPath: initialPath,
      currentFolder: currentFolder,
      fileSystem: fileSystem,
      selectedFiles: [],
      viewMode: "icons", // icons, list, details, smallIcons, tiles
      history: [initialPath],
      historyIndex: 0,
      expandedFolders: { "/": true, "/C:": true },
      draggedFile: null,
    };
  }

  // Default file system (same as before)
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

  // Navigate to path (same as before)
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

  // FIXED: Handle navigation with proper history management
  handleBack = () => {
    if (this.state.historyIndex > 0) {
      const newIndex = this.state.historyIndex - 1;
      const newPath = this.state.history[newIndex];
      const newFolder = this.navigateToPath(this.state.fileSystem, newPath);

      this.setState({
        historyIndex: newIndex,
        currentPath: newPath,
        currentFolder: newFolder,
      });
    }
  };

  handleForward = () => {
    if (this.state.historyIndex < this.state.history.length - 1) {
      const newIndex = this.state.historyIndex + 1;
      const newPath = this.state.history[newIndex];
      const newFolder = this.navigateToPath(this.state.fileSystem, newPath);

      this.setState({
        historyIndex: newIndex,
        currentPath: newPath,
        currentFolder: newFolder,
      });
    }
  };

  handleUp = () => {
    const pathParts = this.state.currentPath.split("/").filter(Boolean);
    if (pathParts.length > 1) {
      pathParts.pop();
      const newPath = pathParts.join("/");
      this.navigateTo(newPath);
    } else if (pathParts.length === 1) {
      this.navigateTo("/");
    }
  };

  navigateTo = (newPath) => {
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

  // Toggle folder expansion
  toggleFolder = (path) => {
    this.setState((prevState) => ({
      expandedFolders: {
        ...prevState.expandedFolders,
        [path]: !prevState.expandedFolders[path],
      },
    }));
  };

  // NEW: Handle views button with dropdown menu
  handleViewsClick = (e) => {
    // Prevent event bubbling
    e.stopPropagation();

    // Get button position from the toolbar
    const toolbar = document.querySelector(
      ".CuboneFileExplorer .StandardToolbar"
    );
    const buttons = toolbar?.querySelectorAll("button");
    const viewsButton = buttons?.[buttons.length - 1]; // Views is last button

    if (viewsButton) {
      const rect = viewsButton.getBoundingClientRect();
      this.setState({
        showViewsMenu: true,
        viewsMenuPosition: {
          top: rect.bottom + 2,
          left: rect.left,
        },
      });
    }
  };

  // NEW: Change view mode
  changeViewMode = (mode) => {
    this.setState({
      viewMode: mode,
      showViewsMenu: false,
    });
  };

  // NEW: Drag and drop handlers
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

    // Create drag image
    const dragImage = new Image();
    dragImage.src = icons[fileData.icon] || icons.notepadFile16;
    e.dataTransfer.setDragImage(dragImage, 16, 16);
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
      // Move file to folder
      console.log(`Moving ${this.state.draggedFile.name} to ${targetName}`);
      // Implement actual file move logic here
    }
  };

  // Render tree node (same as before with minor adjustments)
  renderTreeNode = (name, item, path) => {
    const isExpanded = this.state.expandedFolders[path];
    const isCurrentPath = path === this.state.currentPath;

    if (item.type === "folder") {
      let folderIcon;
      if (name === "C:") {
        folderIcon = icons.hdd32 || icons.hdd32 || icons.folder32; // Multiple fallbacks
      } else {
        folderIcon = isExpanded
          ? icons.folder16 || icons.folderOpen24 || icons.folder16
          : icons.folder16 || icons.folder16;
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

  // NEW: Render views dropdown menu
  renderViewsMenu = () => {
    if (!this.state.showViewsMenu) return null;

    const viewOptions = [
      { mode: "icons", label: "Large Icons" },
      { mode: "smallIcons", label: "Small Icons" },
      { mode: "list", label: "List" },
      { mode: "details", label: "Details" },
      { mode: "tiles", label: "Tiles" },
    ];

    return (
      <div
        className="views-dropdown"
        style={{
          position: "fixed",
          top: this.state.viewsMenuPosition?.top || 0,
          left: this.state.viewsMenuPosition?.left || 0,
          zIndex: 1000,
        }}
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
      </div>
    );
  };

  render() {
    const { props, state } = this;

    // FIXED: Build explorer options with Views button
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
      { icon: icons.upDir, title: "Up", onClick: this.handleUp },
      { icon: icons.cut, title: "Cut", onClick: () => {} },
      { icon: icons.copy, title: "Copy", onClick: () => {} },
      { icon: icons.paste, title: "Paste", onClick: () => {} },
      { icon: icons.delete, title: "Delete", onClick: () => {} },
      { icon: icons.properties, title: "Properties", onClick: () => {} },
      {
        icon: icons.views || icons.views || icons.folder16, // Try multiple icon names
        title: "Views",
        onClick: this.handleViewsClick,
      },
    ];

    return (
      <>
        <Window
          {...props}
          title={`${state.currentPath} - File Explorer`}
          icon={icons.windowsExplorer16 || icons.folder16}
          Component={WindowExplorer}
          initialWidth={Math.min(500, window.innerWidth * 0.8)} // 80% of viewport width
          initialHeight={Math.min(350, window.innerHeight * 0.7)} // 70% of viewport height
          initialX={20} // Position 20px from left
          initialY={40} // Position 40px from top (below desktop icons)
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

        {/* Click outside to close views menu */}
        {state.showViewsMenu && (
          <div
            className="menu-overlay"
            onClick={() => this.setState({ showViewsMenu: false })}
          />
        )}
      </>
    );
  }
}

export default CuboneFileExplorer;
