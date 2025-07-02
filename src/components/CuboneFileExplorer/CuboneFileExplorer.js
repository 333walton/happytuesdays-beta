import React, { Component } from "react";
import { WindowExplorer, ExplorerIcon } from "packard-belle";
import Window from "../tools/Window";
import * as icons from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

class CuboneFileExplorer extends Component {
  constructor(props) {
    super(props);

    // Initialize with the file system from props or default
    const fileSystem = props.data?.fileSystem || this.getDefaultFileSystem();
    const initialPath = props.data?.initialPath || "C:/My Documents";

    const currentFolder = this.navigateToPath(fileSystem, initialPath);

    this.state = {
      currentPath: initialPath,
      currentFolder: currentFolder,
      fileSystem: fileSystem,
      selectedFiles: [],
      viewMode: "icons", // icons or list
      history: [initialPath],
      historyIndex: 0,
      expandedFolders: { "/": true, "/C:": true }, // Track expanded folders in tree
    };
  }

  // Default file system with ASCII art files
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
                      content:
                        "Welcome to Hydra98 File Manager!\n\nThis is a demonstration of the integrated file management system.",
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
                      content: "Double-click to see ASCII flames animation",
                    },
                    "pipes.txt": {
                      type: "file",
                      icon: "notepadFile16",
                      size: "1 KB",
                      component: "Pipes",
                      content: "Double-click to see ASCII pipes animation",
                    },
                    "hourglass.txt": {
                      type: "file",
                      icon: "notepadFile16",
                      size: "1 KB",
                      component: "Sand",
                      content: "Double-click to see ASCII hourglass animation",
                    },
                  },
                },
                "sample.txt": {
                  type: "file",
                  icon: "notepadFile16",
                  content:
                    "This is a sample text file in the Hydra98 file system.",
                  size: "1 KB",
                  component: "Notepad",
                },
                "image.jpg": {
                  type: "file",
                  icon: "paint16",
                  size: "256 KB",
                  component: "ImageWindow",
                },
              },
            },
          },
        },
      },
    };
  }

  // Navigate to a specific path in the file system
  navigateToPath(fileSystem, path) {
    // Special case for root path
    if (path === "/" || path === "") {
      return fileSystem["/"] || {};
    }

    // Remove leading slash if present
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    const pathParts = cleanPath.split("/").filter(Boolean);

    // Start from root
    let current = fileSystem["/"];

    // Navigate through each part of the path
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];

      if (current && current[part]) {
        if (current[part].children) {
          current = current[part].children;
        } else {
          // It's a file, return parent directory
          return current;
        }
      } else {
        return {};
      }
    }

    return current || {};
  }

  // Handle navigation
  handleBack = () => {
    if (this.state.historyIndex > 0) {
      const newIndex = this.state.historyIndex - 1;
      const newPath = this.state.history[newIndex];
      this.setState({
        historyIndex: newIndex,
        currentPath: newPath,
        currentFolder: this.navigateToPath(this.state.fileSystem, newPath),
      });
    }
  };

  handleForward = () => {
    if (this.state.historyIndex < this.state.history.length - 1) {
      const newIndex = this.state.historyIndex + 1;
      const newPath = this.state.history[newIndex];
      this.setState({
        historyIndex: newIndex,
        currentPath: newPath,
        currentFolder: this.navigateToPath(this.state.fileSystem, newPath),
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
      // Go to root
      this.navigateTo("/");
    }
  };

  navigateTo = (newPath) => {
    const newHistory = [
      ...this.state.history.slice(0, this.state.historyIndex + 1),
      newPath,
    ];
    this.setState({
      currentPath: newPath,
      currentFolder: this.navigateToPath(this.state.fileSystem, newPath),
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  };

  // Toggle folder expansion in tree view
  toggleFolder = (path) => {
    this.setState((prevState) => ({
      expandedFolders: {
        ...prevState.expandedFolders,
        [path]: !prevState.expandedFolders[path],
      },
    }));
  };

  // Render tree view recursively
  renderTreeNode = (name, item, path) => {
    const isExpanded = this.state.expandedFolders[path];
    const isCurrentPath = path === this.state.currentPath;

    if (item.type === "folder") {
      // Special icon for C: drive
      let folderIcon;
      if (name === "C:") {
        folderIcon = icons.hdd32;
      } else if (item.icon && icons[item.icon]) {
        folderIcon = icons[item.icon];
      } else {
        folderIcon = isExpanded ? icons.folderOpen24 : icons.folder16;
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

  // Render the tree view
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

  // Handle file/folder double-click
  handleDoubleClick = (name, item) => {
    if (item.type === "folder") {
      // Navigate into folder
      const separator = this.state.currentPath === "/" ? "" : "/";
      const newPath = this.state.currentPath + separator + name;
      this.navigateTo(newPath);
    } else if (item.type === "file") {
      // Open file with appropriate app
      this.openFile(name, item);
    }
  };

  // Open file with appropriate Hydra98 app
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

  // Toggle view mode
  toggleViewMode = () => {
    this.setState((state) => ({
      viewMode: state.viewMode === "icons" ? "list" : "icons",
    }));
  };

  render() {
    const { props, state } = this;

    return (
      <Window
        {...props}
        title="File Explorer"
        icon={icons.windowsExplorer16}
        Component={WindowExplorer}
        initialWidth={600}
        initialHeight={400}
        className="CuboneFileExplorer"
        resizable={true}
        address={state.currentPath}
        explorerOptions={[
          { icon: icons.back, title: "Back", onClick: this.handleBack },
          {
            icon: icons.forward,
            title: "Forward",
            onClick: this.handleForward,
          },
          { icon: icons.upDir, title: "Up", onClick: this.handleUp },
          { icon: icons.cut, title: "Cut", onClick: () => {} },
          { icon: icons.copy, title: "Copy", onClick: () => {} },
          { icon: icons.paste, title: "Paste", onClick: () => {} },
          { icon: icons.delete, title: "Delete", onClick: () => {} },
          { icon: icons.properties, title: "Properties", onClick: () => {} },
        ]}
        menuOptions={buildMenu(
          {
            ...props,
            componentType: "Explorer",
          },
          {
            View: [
              {
                title: state.viewMode === "icons" ? "✓ Icons" : "Icons",
                onClick: () => this.setState({ viewMode: "icons" }),
              },
              {
                title: state.viewMode === "list" ? "✓ Details" : "Details",
                onClick: () => this.setState({ viewMode: "list" }),
              },
              {
                title: "✓ Tree View",
                onClick: () => {},
              },
            ],
          }
        )}
      >
        <div className="file-explorer-split">
          {/* Tree view panel */}
          <div className="tree-panel">
            <div className="tree-header">Folders</div>
            {this.renderTreeView()}
          </div>

          {/* File list panel */}
          <div className={`file-panel ${state.viewMode}`}>
            {Object.keys(state.currentFolder).length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center" }}>
                <p>This folder is empty</p>
              </div>
            ) : state.viewMode === "list" ? (
              <table className="file-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(state.currentFolder).map(([name, item]) => (
                    <tr
                      key={name}
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
                      <td>{item.type === "folder" ? "File Folder" : "File"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="icon-grid">
                {Object.entries(state.currentFolder).map(([name, item]) => (
                  <ExplorerIcon
                    key={name}
                    title={name}
                    icon={
                      icons[item.icon] ||
                      (item.type === "folder"
                        ? icons.folder32
                        : icons.notepadFile32)
                    }
                    onDoubleClick={() => this.handleDoubleClick(name, item)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Window>
    );
  }
}

export default CuboneFileExplorer;
