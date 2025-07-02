import * as icons from "../icons";
// Remove these imports to avoid circular dependencies
// import commits from "./textFiles/commits";
// import faq from "./textFiles/faq";
import clippyFaq from "./textFiles/clippyFaq";
import FileBrowser from "../components/FileBrowser/FileBrowser";

// At the top of the file, add the agent change handler
window.onAgentChange = (newAgent) => {
  console.log(`🎯 Start Menu: Changing agent to ${newAgent}`);

  // Use the same logic as ClippyContextMenu
  if (window.setCurrentAgent) {
    window.setCurrentAgent(newAgent);
  }

  // Update global state
  window.currentAgent = newAgent;

  // Trigger menu refresh
  window.dispatchEvent(
    new CustomEvent("agentChanged", { detail: { agent: newAgent } })
  );

  // Hide any open balloons during transition
  if (window.hideClippyCustomBalloon) {
    window.hideClippyCustomBalloon();
  }
  if (window.hideChatBalloon) {
    window.hideChatBalloon();
  }

  // Play welcome animation
  if (window.clippy?.play) {
    setTimeout(() => {
      window.clippy.play("Wave");
      if (window.showClippyCustomBalloon) {
        setTimeout(() => {
          window.showClippyCustomBalloon(
            `Hello! I'm ${newAgent} now. How can I help you?`
          );
        }, 800);
      }
    }, 200);
  }

  // Special handling for Genius
  if (newAgent === "Genius") {
    window.geniusShouldAutoOpenChat = true;
  }
};

// Utility function to detect mobile devices
const isMobile = () =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Function to get current agent from global state
const getCurrentAgent = () => {
  return window.currentAgent || "Clippy";
};

// Function to create AI Assistants menu with dynamic checkmarks
const createAIAssistants = () => {
  const currentAgent = getCurrentAgent();

  // Helper to generate onClick for each agent
  const selectAgent = (agentName) => () => {
    window.currentAgent = agentName;
    if (window.onAgentChange) window.onAgentChange(agentName);
    // Dispatch event to trigger start menu refresh
    window.dispatchEvent(new Event("agentChanged"));
  };

  return [
    {
      title: "What Are These?",
      icon: icons.help16,
      component: "Notepad",
      isDisabled: false,
      data: {
        content: clippyFaq,
        wrap: true,
        readOnly: true,
        enableHtml: true,
      },
    },
    {
      title: currentAgent === "Clippy" ? "✓ Clippy GPT" : "Clippy GPT",
      tooltip: "Site Guide",
      icon: icons.vid16,
      component: "",
      isDisabled: false,
      onClick: selectAgent("Clippy"),
    },
    {
      title: currentAgent === "F1" ? "✓ F1 GPT" : "F1 GPT",
      tooltip: "Tech Workshop",
      icon: icons.vid16,
      component: "",
      isDisabled: false,
      onClick: selectAgent("F1"),
    },
    {
      title: currentAgent === "Genius" ? "✓ Genius GPT" : "Genius GPT",
      tooltip: "Motivation Station",
      icon: icons.vid16,
      component: "",
      isDisabled: false,
      onClick: selectAgent("Genius"),
    },
    {
      title: currentAgent === "Merlin" ? "✓ Merlin GPT" : "Merlin GPT",
      tooltip: "Art Gallery",
      icon: icons.vid16,
      component: "",
      isDisabled: false,
      onClick: selectAgent("Merlin"),
    },
    {
      title: currentAgent === "Bonzi" ? "✓ Bonzi GPT" : "Bonzi GPT",
      tooltip: "Gaming Hub",
      icon: icons.vid16,
      component: "",
      isDisabled: false,
      onClick: selectAgent("Bonzi"),
    },
  ];
};

// Use a function to get aiAssistants dynamically
const getAIAssistants = () => createAIAssistants();

const accessories = [
  {
    title: "Calculator",
    icon: icons.calculator16,
    component: "Calculator",
    multiInstance: true,
    isDisabled: false,
  },
  {
    title: "Notepad",
    icon: icons.notepad16,
    component: "Notepad",
    multiInstance: true,
  },
];

// Modify programs to use dynamic AI assistants
const getPrograms = () => [
  {
    title: "AI Assistants",
    icon: icons.folderProgram16,
    options: getAIAssistants(), // Call function to get current state
  },
  {
    title: "Accessories",
    icon: icons.folderProgram16,
    options: accessories,
  },
  {
    title: "Online Services",
    icon: icons.folderProgram16,
    options: [
      {
        title: "AOL",
        icon: icons.aol16,
        isDisabled: true,
      },
      {
        title: "Outlook98 (soon)",
        icon: icons.outlook16,
        isDisabled: false,
        component: "Outlook98",
      },
    ],
  },
  {
    title: "Entertainment",
    icon: icons.folderProgram16,
    options: [
      {
        title: "Movie Player",
        icon: icons.camera16,
        component: "VideoPlayerTest",
        data: {
          src: "",
          style: {
            marginBottom: 4,
            height: "100%",
            width: "100%",
            objectFit: "contain",
          },
        },
      },
      {
        title: "Music Player",
        icon: icons.mediacd16,
        component: "MusicPlayer",
        isDisabled: false,
      },
    ],
  },
  {
    title: "Internet Explorer",
    icon: icons.internetExplorer16,
    component: "TestExplorer",
    data: {
      src: "https://myspace.windows93.net/",
      title: "Internet Explorer",
    },
    multiInstance: true,
  },
];

const myFavorites = [
  {
    title: "Start Menu Builder™",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
  {
    title: "Chat Bot Preferences",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
  {
    title: "Newsletter Preferences",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
];

const communityFavorites = [
  // Placeholder for community favorites
];

const favorites = [
  {
    title: "My Favorites",
    icon: icons.folderFavorites24,
    options: myFavorites,
  },
  {
    title: "Community Favorites",
    icon: icons.folder16,
    options: communityFavorites,
  },
];

const newsFeeds = [
  {
    title: "Tech Feed",
    icon: icons.newsletter16,
    component: "",
    isDisabled: true,
  },
  {
    title: "Builders Feed",
    icon: icons.newsletter16,
    component: "",
    isDisabled: true,
  },
  {
    title: "Art/Design Feed",
    icon: icons.newsletter16,
    component: "",
    isDisabled: true,
  },
  {
    title: "Gaming Feed",
    icon: icons.newsletter16,
    component: "",
    isDisabled: true,
  },
];

const marketingTools = [
  {
    title: "UTM Tracker",
    icon: icons.utm24,
    isDisabled: false,
    component: "UTMTool",
  },
  {
    title: "Pre-roll Toolkit",
    icon: icons.vid16,
    component: "VideoPlayerMobile",
    multiInstance: true,
    isDisabled: false,
    data: {
      src: "",
    },
  },
  {
    title: "Newsletter Prompt",
    icon: icons.newsletter16,
    href: "",
    isDisabled: true,
  },
];

const aiUtilities = [
  {
    title: "Open Router Ranks",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
  {
    title: "Should I automate it?",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
];

const builderTools = [
  {
    title: "Project Management",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
  {
    title: "AI Utilities",
    icon: icons.folder16,
    options: aiUtilities,
  },
];

const doodleOptions = [
  {
    title: "Paint Doodles",
    icon: icons.paint16,
    component: "IframeWindow",
    data: {
      src: "https://paint-normal.vercel.app/#vertical-color-box-mode",
      disableAlert: true,
      style: {
        width: "100%",
        height: "100%",
      },
    },
  },
  {
    title: "Pixel Doodles",
    icon: icons.wangimg32,
    component: "IframeWindow",
    isDisabled: false,
    data: {
      src: "https://paint-doodle-pixel.vercel.app/#vertical-color-box-mode",
      disableAlert: true,
      style: {
        width: "100%",
        height: "100%",
      },
    },
  },
  {
    title: "ASCII Banners",
    icon: icons.asciibanner16,
    component: "ASCIIText",
    isDisabled: false,
    data: {},
  },
  ...(!isMobile()
    ? [
        {
          title: "ASCII Doodles",
          icon: icons.loaderbat16,
          component: "IframeWindow",
          isDisabled: true,
          data: {
            src: "https://example.com/ascii-doodes",
            creator: "https://github.com/example",
          },
        },
      ]
    : []),
];

const artDesignTools = [
  {
    title: "Art Gallery Finder",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
  {
    title: "Doodles",
    icon: icons.folder16,
    options: doodleOptions,
  },
  {
    title: "Design Trends Tracker",
    icon: icons.chart16,
    component: "",
    isDisabled: true,
  },
];

const tools = [
  {
    title: "News Feeds",
    icon: icons.folder16,
    options: newsFeeds,
  },
  {
    title: "Marketing Tools",
    icon: icons.folder16,
    options: marketingTools,
  },
  {
    title: "Builder Tools",
    icon: icons.folder16,
    options: builderTools,
  },
  {
    title: "Art/Design Tools",
    icon: icons.folder16,
    options: artDesignTools,
  },
];

const myDocs = [
  {
    title: "File Manager",
    icon: icons.computer32,
    component: "CuboneFileExplorer",
    multiInstance: true,
    data: {
      initialPath: "C:/My Documents",
      fileSystem: {
        "/": {
          "C:": {
            type: "folder",
            icon: "hardDrive",
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
                        icon: "notepadFile",
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
                        icon: "notepadFile",
                        content:
                          "Welcome to Hydra98 File Manager!\n\nThis is a demonstration of the integrated file management system.",
                        size: "2 KB",
                      },
                    },
                  },
                },
              },
              "My Documents": {
                type: "folder",
                icon: "myDocuments",
                children: {
                  "ASCII Art": {
                    type: "folder",
                    icon: "folder32",
                    children: {
                      "flames.txt": {
                        type: "file",
                        icon: "notepadFile",
                        size: "1 KB",
                        component: "Burn",
                        content: "Double-click to see ASCII flames animation",
                      },
                      "pipes.txt": {
                        type: "file",
                        icon: "notepadFile",
                        size: "1 KB",
                        component: "Pipes",
                        content: "Double-click to see ASCII pipes animation",
                      },
                      "hourglass.txt": {
                        type: "file",
                        icon: "notepadFile",
                        size: "1 KB",
                        component: "Sand",
                        content:
                          "Double-click to see ASCII hourglass animation",
                      },
                    },
                  },
                  "sample.txt": {
                    type: "file",
                    icon: "notepadFile",
                    content:
                      "This is a sample text file in the Hydra98 file system.",
                    size: "1 KB",
                  },
                  "image.jpg": {
                    type: "file",
                    icon: "paint16",
                    size: "256 KB",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  {
    title: "My Videos",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
  {
    title: "My Music",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
];

const techDocs = [
  {
    title: "Trend Reports",
    icon: icons.chart16,
    component: "",
    isDisabled: true,
  },
];

const motivation = [
  {
    title: "Jack Butcher",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
];

const builderDocs = [
  {
    title: "Builder Resources",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
  {
    title: "Motivation",
    icon: icons.folder16,
    options: motivation,
  },
];

const artDesignDocs = [
  {
    title: "Color Theory",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
];

const documents = [
  {
    title: "My Docs",
    icon: icons.folderOpen24,
    options: myDocs,
  },
  {
    title: "Tech Docs",
    icon: icons.folderOpen24,
    options: techDocs,
  },
  {
    title: "Builder Docs",
    icon: icons.folderOpen24,
    options: builderDocs,
  },
  {
    title: "Art/Design Docs",
    icon: icons.folderOpen24,
    options: artDesignDocs,
  },
];

const dosGames = [
  {
    title: "DOOM",
    icon: icons.doom16,
    component: "Doom",
    multiInstance: true,
  },
  {
    title: "DOS Mods",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
];

const classicGames = [
  {
    title: "Minesweeper",
    icon: icons.minesweeper16,
    component: "Minesweeper",
    multiInstance: true,
  },
  {
    title: "Minesweeper2",
    icon: icons.minesweeper16,
    component: "MinesweeperWithHelp",
    multiInstance: true,
  },
  {
    title: "Solitaire",
    icon: icons.soli16,
    component: "",
    multiInstance: true,
    isDisabled: true,
  },
  {
    title: "Space Cadet Pinball",
    icon: icons.spacecadet16,
    component: "",
    multiInstance: true,
    isDisabled: true,
  },
];

const miscGames = [
  {
    title: "ASCII Maze",
    icon: icons.maze16,
    component: "ASCIIMaze",
    multiInstance: true,
  },
  ...(!isMobile()
    ? [
        {
          title: "GliderPro",
          icon: icons.glider16,
          component: "Glider",
          multiInstance: true,
        },
        {
          title: "Retro City",
          icon: icons.retrocity32,
          component: "",
          isDisabled: true,
          multiInstance: true,
        },
        {
          title: "Rampage World Tour",
          icon: icons.rampage16,
          component: "",
          isDisabled: true,
          multiInstance: false,
        },
      ]
    : []),
];

const games = [
  {
    title: "DOS Games",
    icon: icons.folder16,
    options: dosGames,
  },
  {
    title: "Classic Games",
    icon: icons.folder16,
    options: classicGames,
  },
  {
    title: "Misc.",
    icon: icons.folder16,
    options: miscGames,
  },
];

const asciiArt = [
  {
    title: "Flames",
    icon: icons.burn16,
    component: "Burn",
    multiInstance: true,
  },
  {
    title: "Pipes",
    icon: icons.pipes16,
    component: "Pipes",
    multiInstance: true,
  },
  {
    title: "Hourglass",
    icon: icons.sand16,
    component: "Sand",
    multiInstance: true,
  },
  {
    title: "See More...",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
];

const demoscenes = [
  {
    title: "GleEst",
    type: "ExternalLink",
    icon: icons.htmlFile16,
    href: "https://demozoo.org/productions/288839/",
  },
  {
    title: "Micro1k",
    type: "ExternalLink",
    icon: icons.htmlFile16,
    href: "https://demozoo.org/productions/128900/",
  },
  {
    title: "Kishkoid",
    type: "ExternalLink",
    icon: icons.htmlFile16,
    href: "https://demozoo.org/productions/13245/",
  },
];

const animated = [
  {
    title: "Pixel Art",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
  {
    title: "Demoscenes",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
];

const stillFrames = [
  {
    title: "Pixel Art",
    icon: icons.folder16,
    isDisabled: true,
  },
  {
    title: "ASCII Art",
    icon: icons.folder16,
    isDisabled: true,
  },
  {
    title: "3D Rendered",
    icon: icons.folder16,
    isDisabled: true,
  },
];

const interactive = [
  {
    title: "WebGL Experiments",
    icon: icons.folder16,
    component: "FileBrowser",
    /* options: [
      {
        title: "Rain Physics",
        icon: icons.webglwindow32,
        component: "TestExplorer",
        data: {
          src: "https://loklok-volume.vercel.app/gpu",
          title: "Internet Explorer",
        },
        multiInstance: false,
      },
      {
        title: "Instance Points",
        icon: icons.webglwindow32,
        component: "TestExplorer",
        data: {
          src: "https://threejs.org/examples/webgpu_instance_points.html",
          title: "Internet Explorer",
        },
        multiInstance: false,
      },
      {
        title: "Minecraft Sim",
        icon: icons.webglwindow32,
        component: "TestExplorer",
        data: {
          src: "https://threejs.org/examples/webgl_geometry_minecraft.html",
          title: "Internet Explorer",
        },
        multiInstance: false,
      },
      {
        title: "See More...",
        icon: icons.vid16,
        component: "",
        isDisabled: true,
      },
    ],*/
  },
  {
    title: "ASCII Art",
    icon: icons.folder16,
    options: asciiArt,
  },
  {
    title: "Randomize",
    icon: icons.kodak16,
    component: "",
    isDisabled: true,
  },
];

const fileManagement = [
  {
    title: "File Manager",
    icon: icons.computer32,
    component: "CuboneFileExplorer",
    multiInstance: true,
    data: {
      initialPath: "/C:/My Documents",
      fileSystem: {
        "/": {
          "C:": {
            type: "folder",
            icon: "hardDrive",
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
                        icon: "notepadFile",
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
                        icon: "notepadFile",
                        content:
                          "Welcome to Hydra98 File Manager!\n\nThis is a demonstration of the integrated file management system.",
                        size: "2 KB",
                      },
                    },
                  },
                },
              },
              "My Documents": {
                type: "folder",
                icon: "myDocuments",
                children: {
                  "sample.txt": {
                    type: "file",
                    icon: "notepadFile",
                    content:
                      "This is a sample text file in the Hydra98 file system.",
                    size: "1 KB",
                  },
                  "image.jpg": {
                    type: "file",
                    icon: "paint16",
                    size: "256 KB",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  {
    title: "My Computer",
    icon: icons.windowsExplorer16,
    component: "ExplorerWindow",
    data: {
      content: [
        {
          title: "C: Drive",
          icon: "hardDrive",
          onDoubleClick: () => console.log("Opening C: Drive"),
        },
        {
          title: "Floppy (A:)",
          icon: "floppy16",
          failState: {
            message: "Please insert a disk into drive A:",
            loadTime: 1500,
          },
        },
      ],
    },
  },
];

const gallery = [
  {
    title: "What is this?",
    icon: icons.faq16,
    component: "",
    isDisabled: true,
  },
  {
    title: "Main Gallery",
    icon: icons.doodlegallery32,
    component: "",
    isDisabled: true,
  },
  {
    title: "Community Gallery",
    icon: icons.prompt16,
    component: "",
    isDisabled: true,
  },
  {
    title: "Submit Your Art",
    icon: icons.cookie16,
    component: "DoodleSubmission",
    isDisabled: false,
  },
];

const artifacts = [
  {
    title: "Gallery",
    icon: icons.folder16,
    options: gallery,
  },
  {
    title: "Interactive",
    icon: icons.folder16,
    options: interactive,
  },
  {
    title: "Animated",
    icon: icons.folder16,
    options: animated,
  },
  {
    title: "Still Frames",
    icon: icons.folder16,
    options: stillFrames,
  },
];

export const find = [
  {
    title: "Files or Folders...",
    icon: icons.findFiles16,
    isDisabled: true,
  },
  {
    title: "Computer...",
    icon: icons.findComputer16,
    isDisabled: true,
  },
  {
    title: "On the Internet...",
    icon: icons.findOnline16,
    type: "ExternalLink",
    href: "https://google.com",
  },
  {
    title: "People...",
    icon: icons.findPeople16,
    type: "ExternalLink",
    href: "https://facebook.com",
  },
];

// Export function to generate menu data dynamically
const getStartMenuData = () => [
  {
    title: "Programs",
    icon: icons.folderProgram24,
    options: getPrograms(), // Use dynamic programs
  },
  {
    title: "Favorites",
    icon: icons.folderFavorites24,
    options: favorites,
  },
  {
    title: "Tools",
    icon: icons.folderProgram24,
    options: tools,
  },
  {
    title: "Documents",
    icon: icons.folderOpen24,
    options: documents,
  },
  {
    title: "Games",
    icon: icons.joystick24,
    options: games,
  },
  {
    title: "Artifacts",
    icon: icons.ascii24,
    options: artifacts,
  },
];

// Export as a function instead of static data
export default getStartMenuData;
