// Fixed CuboneFileExplorer.js with mobile and desktop improvements

import React, { Component } from "react";
import ReactDOM from "react-dom";
import { WindowExplorer, ExplorerIcon } from "packard-belle";
import Window from "../tools/Window";
import * as icons from "../../icons";
import buildMenu from "../../helpers/menuBuilder";
import "./_styles.scss";

class CuboneFileExplorer extends Component {
  // Handle row click/tap: always select on first click/tap, open on double tap (mobile) or double click (desktop)
  handleRowClick = (name, item, e) => {
    console.log("handleRowClick called:", {
      name,
      item,
      event: e,
      isMobile: this.state.isMobile,
    });
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }
    // Always select on first click/tap
    if (!this.state.selectedFiles.includes(name)) {
      this.setState({ selectedFiles: [name] });
      return;
    }
    // On mobile, second tap opens
    if (this.state.isMobile) {
      this.handleDoubleClick(name, item);
    }
    // On desktop, do nothing (double click will open)
  };
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
      viewMode: "list", // Default view mode
      history: [initialPath],
      historyIndex: 0,
      expandedFolders: { "/": true, "/C:": true },
      draggedFile: null,
      showViewsMenu: false,
      viewsMenuPosition: null,
      isMobile: window.innerWidth <= 600,
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

    // Mobile button handlers (without cut/copy/paste)
    this.mobileButtonHandlers = {
      0: this.handleBack,
      1: this.handleForward,
      2: this.handleUp,
      3: () => console.log("Properties clicked"),
      4: this.handleViewsClick,
    };

    // Observer to watch for toolbar rendering
    this.toolbarObserver = null;
  }

  componentDidMount() {
    console.log("CuboneFileExplorer mounted, isMobile:", this.state.isMobile);

    // Set up MutationObserver to watch for toolbar
    this.setupToolbarObserver();

    // Add global click handler
    document.addEventListener("click", this.handleGlobalClick);

    // Add resize listener for mobile detection
    window.addEventListener("resize", this.handleResize);

    // Try to attach handlers after a delay
    setTimeout(() => this.attachToolbarHandlers(), 100);
    setTimeout(() => this.attachToolbarHandlers(), 500);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleGlobalClick);
    window.removeEventListener("resize", this.handleResize);

    if (this.toolbarObserver) {
      this.toolbarObserver.disconnect();
    }
  }

  handleResize = () => {
    const isMobile = window.innerWidth <= 600;
    if (isMobile !== this.state.isMobile) {
      this.setState({ isMobile }, () => {
        // Re-attach handlers after state update
        setTimeout(() => this.attachToolbarHandlers(), 100);
      });
    }
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

    console.log("Attaching toolbar handlers, mobile:", this.state.isMobile);
    toolbar._handlersAttached = true;

    // Get all buttons
    const buttons = toolbar.querySelectorAll("button");
    console.log(`Found ${buttons.length} toolbar buttons`);

    // Choose handlers based on mobile/desktop
    const handlers = this.state.isMobile
      ? this.mobileButtonHandlers
      : this.buttonHandlers;

    // Attach click handlers to each button
    buttons.forEach((button, index) => {
      // Clone the button to remove existing event listeners
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);

      // Debug: Log button info
      console.log(
        `Button ${index}: ${newButton.title || newButton.textContent}`
      );

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
        const handler = handlers[index];
        if (handler) {
          handler.call(this, e);
        }
      });

      // Special handling for Views button
      const isViewsButton = this.state.isMobile ? index === 4 : index === 7;
      if (isViewsButton) {
        newButton.classList.add("views-button-with-dropdown");
        newButton.classList.add("views-button");
        console.log("Views button found at index:", index);

        // Additional mobile debug
        if (this.state.isMobile) {
          console.log("Mobile Views button setup complete");
          console.log("Button classes:", newButton.className);
          console.log("Button title:", newButton.title);
        }
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

    // Re-attach handlers if mobile state changed
    if (prevState.isMobile !== this.state.isMobile) {
      const toolbar = document.querySelector(
        ".WindowExplorer__options .OptionsList__large-icons"
      );
      if (toolbar) {
        toolbar._handlersAttached = false;
      }
      this.attachToolbarHandlers();
    }

    // Re-attach handlers if needed
    const toolbar = document.querySelector(
      ".WindowExplorer__options .OptionsList__large-icons"
    );
    if (toolbar && !toolbar._handlersAttached) {
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
              icon: "folderWindows",
              children: {
                System32: {
                  type: "folder",
                  icon: "folderProgram",
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
              icon: "folderProgram",
              children: {
                Hydra98: {
                  type: "folder",
                  icon: "folderProgram",
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
              icon: "myDocuments",
              children: {
                "My Videos": {
                  type: "folder",
                  icon: "folder16",
                  children: {
                    "sample_video.mp4": {
                      type: "file",
                      icon: "vid16",
                      size: "15 MB",
                    },
                    "tutorial.mp4": {
                      type: "file",
                      icon: "vid16",
                      size: "8 MB",
                    },
                  },
                },
                "My Music": {
                  type: "folder",
                  icon: "folder16",
                  children: {
                    "sample_song.mp3": {
                      type: "file",
                      icon: "mediacd16",
                      size: "3.5 MB",
                    },
                    "playlist.m3u": {
                      type: "file",
                      icon: "notepadFile16",
                      size: "1 KB",
                    },
                  },
                },
                "My Notes": {
                  type: "folder",
                  icon: "folder16",
                  children: {
                    "meeting_notes.txt": {
                      type: "file",
                      icon: "notepadFile16",
                      content: "Meeting notes go here...",
                      size: "2 KB",
                      component: "Notepad",
                    },
                    "ideas.txt": {
                      type: "file",
                      icon: "notepadFile16",
                      content: "Project ideas and brainstorming...",
                      size: "1 KB",
                      component: "Notepad",
                    },
                  },
                },
                "Saved Games": {
                  type: "folder",
                  icon: "folder16",
                  children: {
                    "doom_savegame.sav": {
                      type: "file",
                      icon: "doom16",
                      size: "256 KB",
                    },
                    "minesweeper_scores.dat": {
                      type: "file",
                      icon: "minesweeper16",
                      size: "4 KB",
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
              },
            },
            Documents: {
              type: "folder",
              icon: "folderOpen32",
              children: {
                "Tech Docs": {
                  type: "folder",
                  icon: "folder16",
                  children: {
                    APIs: {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "rest_api_guide.pdf": {
                          type: "file",
                          icon: "notepadFile16",
                          size: "450 KB",
                        },
                        "graphql_tutorial.txt": {
                          type: "file",
                          icon: "notepadFile16",
                          size: "25 KB",
                          component: "Notepad",
                        },
                      },
                    },
                    "Trend Reports": {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "ai_trends_2024.txt": {
                          type: "file",
                          icon: "notepadFile16",
                          size: "15 KB",
                          component: "Notepad",
                        },
                        "web3_report.txt": {
                          type: "file",
                          icon: "notepadFile16",
                          size: "20 KB",
                          component: "Notepad",
                        },
                      },
                    },
                  },
                },
                "Builder Docs": {
                  type: "folder",
                  icon: "folder16",
                  children: {
                    Motivation: {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "daily_quotes.txt": {
                          type: "file",
                          icon: "notepadFile16",
                          content: "Daily motivational quotes for builders...",
                          size: "5 KB",
                          component: "Notepad",
                        },
                        "success_stories.txt": {
                          type: "file",
                          icon: "notepadFile16",
                          content:
                            "Inspiring success stories from the community...",
                          size: "12 KB",
                          component: "Notepad",
                        },
                      },
                    },
                    Resources: {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "starter_templates.txt": {
                          type: "file",
                          icon: "notepadFile16",
                          size: "8 KB",
                          component: "Notepad",
                        },
                        "tools_list.txt": {
                          type: "file",
                          icon: "notepadFile16",
                          size: "6 KB",
                          component: "Notepad",
                        },
                      },
                    },
                  },
                },
                "Art Design Docs": {
                  type: "folder",
                  icon: "folder16",
                  children: {
                    "Color Theory": {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "color_basics.txt": {
                          type: "file",
                          icon: "notepadFile16",
                          size: "10 KB",
                          component: "Notepad",
                        },
                        "palette_generator.txt": {
                          type: "file",
                          icon: "notepadFile16",
                          size: "4 KB",
                          component: "Notepad",
                        },
                      },
                    },
                    Typography: {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "font_pairing.txt": {
                          type: "file",
                          icon: "notepadFile16",
                          size: "7 KB",
                          component: "Notepad",
                        },
                        "readability_guide.txt": {
                          type: "file",
                          icon: "notepadFile16",
                          size: "5 KB",
                          component: "Notepad",
                        },
                      },
                    },
                  },
                },
              },
            },
            Tools: {
              type: "folder",
              icon: "folderProgram",
              children: {
                "Creative Tools": {
                  type: "folder",
                  icon: "folder16",
                  children: {
                    Native: {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "svg_trace.exe": {
                          type: "file",
                          icon: "vid16",
                          size: "2.5 MB",
                        },
                        "pixel_doodles.exe": {
                          type: "file",
                          icon: "wangimg32",
                          size: "1.8 MB",
                          component: "IframeWindow",
                          data: {
                            src: "https://paint-doodle-pixel.vercel.app/#vertical-color-box-mode",
                          },
                        },
                        "paint_doodles.exe": {
                          type: "file",
                          icon: "paint16",
                          size: "1.5 MB",
                          component: "IframeWindow",
                          data: {
                            src: "https://paint-normal.vercel.app/#vertical-color-box-mode",
                          },
                        },
                      },
                    },
                    "3rd Party": {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "photoshop_link.url": {
                          type: "file",
                          icon: "internetExplorer16",
                          size: "1 KB",
                        },
                        "figma_link.url": {
                          type: "file",
                          icon: "internetExplorer16",
                          size: "1 KB",
                        },
                      },
                    },
                  },
                },
                "Marketing Tools": {
                  type: "folder",
                  icon: "folder16",
                  children: {
                    Native: {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "utm_tracker.exe": {
                          type: "file",
                          icon: "utm24",
                          size: "856 KB",
                          component: "UTMTool",
                        },
                        "preroll_toolkit.exe": {
                          type: "file",
                          icon: "vid16",
                          size: "3.2 MB",
                          component: "VideoPlayerMobile",
                        },
                        "newsletter_prompt.exe": {
                          type: "file",
                          icon: "newsletter16",
                          size: "512 KB",
                        },
                      },
                    },
                    "3rd Party": {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "mailchimp_link.url": {
                          type: "file",
                          icon: "internetExplorer16",
                          size: "1 KB",
                        },
                        "hubspot_link.url": {
                          type: "file",
                          icon: "internetExplorer16",
                          size: "1 KB",
                        },
                      },
                    },
                  },
                },
                "Builder Tools": {
                  type: "folder",
                  icon: "folder16",
                  children: {
                    Native: {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "project_manager.exe": {
                          type: "file",
                          icon: "vid16",
                          size: "2.1 MB",
                        },
                        "openrouter_ranks.exe": {
                          type: "file",
                          icon: "vid16",
                          size: "1.5 MB",
                        },
                        "automation_checker.exe": {
                          type: "file",
                          icon: "vid16",
                          size: "980 KB",
                        },
                      },
                    },
                    "3rd Party": {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "github_link.url": {
                          type: "file",
                          icon: "internetExplorer16",
                          size: "1 KB",
                        },
                        "vercel_link.url": {
                          type: "file",
                          icon: "internetExplorer16",
                          size: "1 KB",
                        },
                      },
                    },
                  },
                },
                "Art Design Tools": {
                  type: "folder",
                  icon: "folder16",
                  children: {
                    Native: {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "gallery_finder.exe": {
                          type: "file",
                          icon: "vid16",
                          size: "1.2 MB",
                        },
                        "ascii_banners.exe": {
                          type: "file",
                          icon: "asciibanner16",
                          size: "456 KB",
                          component: "ASCIIText",
                        },
                        "trends_tracker.exe": {
                          type: "file",
                          icon: "chart16",
                          size: "1.8 MB",
                        },
                      },
                    },
                    "3rd Party": {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "behance_link.url": {
                          type: "file",
                          icon: "internetExplorer16",
                          size: "1 KB",
                        },
                        "dribbble_link.url": {
                          type: "file",
                          icon: "internetExplorer16",
                          size: "1 KB",
                        },
                      },
                    },
                  },
                },
              },
            },
            Artifacts: {
              type: "folder",
              icon: "ascii24",
              children: {
                "Still Frames": {
                  type: "folder",
                  icon: "folder16",
                  children: {
                    "Pixel Art": {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "retro_sprite.png": {
                          type: "file",
                          icon: "wangimg32",
                          size: "24 KB",
                        },
                        "8bit_landscape.png": {
                          type: "file",
                          icon: "wangimg32",
                          size: "32 KB",
                        },
                      },
                    },
                    "ASCII Art": {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "dragon.txt": {
                          type: "file",
                          icon: "notepadFile16",
                          content: "ASCII art dragon...",
                          size: "8 KB",
                          component: "Notepad",
                        },
                        "castle.txt": {
                          type: "file",
                          icon: "notepadFile16",
                          content: "ASCII art castle...",
                          size: "12 KB",
                          component: "Notepad",
                        },
                      },
                    },
                    "3D Rendered": {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "cube_render.png": {
                          type: "file",
                          icon: "wangimg32",
                          size: "156 KB",
                        },
                        "sphere_demo.png": {
                          type: "file",
                          icon: "wangimg32",
                          size: "178 KB",
                        },
                      },
                    },
                  },
                },
                Animated: {
                  type: "folder",
                  icon: "folder16",
                  children: {
                    "Pixel Art": {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "walking_sprite.gif": {
                          type: "file",
                          icon: "wangimg32",
                          size: "45 KB",
                        },
                        "fire_animation.gif": {
                          type: "file",
                          icon: "wangimg32",
                          size: "38 KB",
                        },
                      },
                    },
                    Demoscenes: {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "tunnel_effect.exe": {
                          type: "file",
                          icon: "vid16",
                          size: "256 KB",
                        },
                        "plasma_demo.exe": {
                          type: "file",
                          icon: "vid16",
                          size: "312 KB",
                        },
                      },
                    },
                  },
                },
                Interactive: {
                  type: "folder",
                  icon: "folder16",
                  children: {
                    "WebGL Experiments": {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "particle_system.html": {
                          type: "file",
                          icon: "internetExplorer16",
                          size: "45 KB",
                        },
                        "3d_visualizer.html": {
                          type: "file",
                          icon: "internetExplorer16",
                          size: "62 KB",
                        },
                      },
                    },
                    "ASCII Art": {
                      type: "folder",
                      icon: "folder16",
                      children: {
                        "flames.exe": {
                          type: "file",
                          icon: "burn16",
                          size: "128 KB",
                          component: "Burn",
                        },
                        "pipes.exe": {
                          type: "file",
                          icon: "pipes16",
                          size: "96 KB",
                          component: "Pipes",
                        },
                        "hourglass.exe": {
                          type: "file",
                          icon: "sand16",
                          size: "112 KB",
                          component: "Sand",
                        },
                      },
                    },
                  },
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

  // Handle back navigation - Fixed for mobile
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

  // Handle forward navigation - Fixed for mobile
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

  // Handle views button click - Fixed for mobile
  handleViewsClick = (e) => {
    console.log("handleViewsClick called");

    // Prevent default to avoid mobile issues
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Get button position
    const button = e
      ? e.currentTarget || e.target
      : document.querySelector(".views-button-with-dropdown");
    if (button) {
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
    }
  };

  // Change view mode
  changeViewMode = (mode) => {
    console.log("Changing view mode to:", mode);
    // Only update if different
    if (this.state.viewMode !== mode) {
      this.setState({
        viewMode: mode,
        showViewsMenu: false,
      });
    } else {
      // Always close the menu even if the same option is clicked
      this.setState({ showViewsMenu: false });
    }
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
    // Add a key to force re-render when viewMode changes
    return ReactDOM.createPortal(
      <div
        className="views-dropdown"
        key={this.state.viewMode}
        style={{
          position: "fixed",
          top: this.state.viewsMenuPosition.top,
          left: this.state.viewsMenuPosition.left,
          zIndex: 10000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {viewOptions.map((option) => {
          const isSelected = this.state.viewMode === option.mode;
          if (isSelected) {
            console.log("Selected view option:", option.mode);
          }
          return (
            <div
              key={option.mode}
              className={`view-option${isSelected ? " selected" : ""}`}
              onClick={() => this.changeViewMode(option.mode)}
            >
              {option.label}
            </div>
          );
        })}
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

    // Build explorer options based on mobile/desktop
    const explorerOptions = state.isMobile
      ? [
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
            icon: icons.properties,
            title: "Properties",
            onClick: () => console.log("Properties clicked"),
          },
          {
            icon: icons.views || icons.folder16,
            title: "Views",
            onClick: this.handleViewsClick,
            className: "views-button-with-dropdown views-button",
          },
        ]
      : [
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
            className: "views-button-with-dropdown views-button",
          },
        ];

    return (
      <>
        <Window
          {...props}
          title={state.currentPath}
          icon={icons.windowsExplorer16 || icons.folder16}
          Component={WindowExplorer}
          initialWidth={
            state.isMobile
              ? Math.min(450, window.innerWidth * 0.95)
              : Math.min(500, window.innerWidth * 0.8)
          }
          initialHeight={
            state.isMobile
              ? Math.min(300, window.innerHeight * 0.6)
              : Math.min(350, window.innerHeight * 0.7)
          }
          initialX={state.isMobile ? 10 : 20}
          initialY={state.isMobile ? 30 : 40}
          className="CuboneFileExplorer"
          resizable={true}
          minWidth={state.isMobile ? 350 : 162}
          forceNoMobileMax={true} // Prevent auto-maximize on mobile
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
                    {Object.entries(state.currentFolder).map(([name, item]) => {
                      // Attach only onClick for desktop, only onTouchEnd for mobile
                      const rowProps = {
                        key: name,
                        draggable: true,
                        onDragStart: (e) => this.handleDragStart(e, name, item),
                        onDragEnd: this.handleDragEnd,
                        onDoubleClick: () => this.handleDoubleClick(name, item),
                        className: `file-row${
                          state.selectedFiles.includes(name) ? " selected" : ""
                        }`,
                      };
                      if (state.isMobile) {
                        rowProps.onTouchEnd = (e) =>
                          this.handleRowClick(name, item, e);
                      } else {
                        rowProps.onClick = (e) =>
                          this.handleRowClick(name, item, e);
                      }
                      return (
                        <tr {...rowProps}>
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
                            {item.size ||
                              (item.type === "folder" ? "" : "0 KB")}
                          </td>
                          <td>
                            {item.type === "folder" ? "File Folder" : "File"}
                          </td>
                          {state.viewMode === "details" && (
                            <td>{item.modified || "12/25/2024"}</td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="icon-grid">
                  {Object.entries(state.currentFolder).map(([name, item]) => {
                    const iconWrapperProps = {
                      key: name,
                      draggable: true,
                      onDragStart: (e) => this.handleDragStart(e, name, item),
                      onDragEnd: this.handleDragEnd,
                      onDragOver: (e) => {
                        if (item.type === "folder") {
                          this.handleDragOver(e);
                          e.currentTarget.classList.add("drag-over");
                        }
                      },
                      onDragLeave: (e) => {
                        e.currentTarget.classList.remove("drag-over");
                      },
                      onDrop: (e) => {
                        e.currentTarget.classList.remove("drag-over");
                        if (item.type === "folder") {
                          this.handleDrop(e, name, item);
                        }
                      },
                      className: `file-item-wrapper${
                        item.type === "folder" ? " drop-target" : ""
                      }${
                        state.selectedFiles.includes(name) ? " selected" : ""
                      }`,
                    };
                    // Attach handlers to both wrapper and icon for reliability
                    const explorerIconProps = {
                      title: name,
                      icon:
                        icons[item.icon] ||
                        (item.type === "folder"
                          ? icons.folder32
                          : icons.notepadFile32),
                      onDoubleClick: () => this.handleDoubleClick(name, item),
                      className: state.viewMode,
                    };
                    if (state.isMobile) {
                      iconWrapperProps.onTouchEnd = (e) =>
                        this.handleRowClick(name, item, e);
                      explorerIconProps.onTouchEnd = (e) =>
                        this.handleRowClick(name, item, e);
                    } else {
                      iconWrapperProps.onClick = (e) =>
                        this.handleRowClick(name, item, e);
                      explorerIconProps.onClick = (e) =>
                        this.handleRowClick(name, item, e);
                    }
                    return (
                      <div {...iconWrapperProps}>
                        <ExplorerIcon {...explorerIconProps} />
                      </div>
                    );
                  })}
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
