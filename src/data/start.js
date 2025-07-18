import * as icons from "../icons";
import clippyFaq from "./textFiles/clippyFaq";

// Agent change handler
window.onAgentChange = (newAgent) => {
  console.log(`🎯 Start Menu: Changing agent to ${newAgent}`);

  if (window.setCurrentAgent) {
    window.setCurrentAgent(newAgent);
  }

  window.currentAgent = newAgent;

  window.dispatchEvent(
    new CustomEvent("agentChanged", { detail: { agent: newAgent } })
  );

  if (window.hideClippyCustomBalloon) {
    window.hideClippyCustomBalloon();
  }
  if (window.hideChatBalloon) {
    window.hideChatBalloon();
  }

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

  if (newAgent === "Genius") {
    window.geniusShouldAutoOpenChat = true;
  }
};

// Utility functions
const isMobile = () =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const getCurrentAgent = () => {
  return window.currentAgent || "Clippy";
};

// AI Assistants menu with dynamic checkmarks
const createAIAssistants = () => {
  const currentAgent = getCurrentAgent();

  const selectAgent = (agentName) => () => {
    window.currentAgent = agentName;
    if (window.onAgentChange) window.onAgentChange(agentName);
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
      onClick: selectAgent("Clippy"),
    },
    {
      title: currentAgent === "F1" ? "✓ F1 GPT" : "F1 GPT",
      tooltip: "Tech",
      icon: icons.vid16,
      onClick: selectAgent("F1"),
    },
    {
      title: currentAgent === "Genius" ? "✓ Genius GPT" : "Genius GPT",
      tooltip: "Building & Productivity",
      icon: icons.vid16,
      onClick: selectAgent("Genius"),
    },
    {
      title: currentAgent === "Merlin" ? "✓ Merlin GPT" : "Merlin GPT",
      tooltip: "Art & Design",
      icon: icons.vid16,

      onClick: selectAgent("Merlin"),
    },
    {
      title: currentAgent === "Bonzi" ? "✓ Bonzi GPT" : "Bonzi GPT",
      tooltip: "Gaming",
      icon: icons.vid16,

      onClick: selectAgent("Bonzi"),
    },
  ];
};

const getAIAssistants = () => createAIAssistants();

// Programs section
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

const getPrograms = () => [
  {
    title: "AI Assistants",
    icon: icons.folderProgram16,
    className: "submenu-align-bottom-ai-assistants-programs",
    options: getAIAssistants(),
  },
  {
    title: "Accessories",
    icon: icons.folderProgram16,
    className: "submenu-align-bottom-accessories-programs",
    options: accessories,
  },
  {
    title: "Online Services",
    icon: icons.folderProgram16,
    className: "submenu-align-bottom-online-services-programs",
    options: [
      {
        title: "AOL",
        icon: icons.aol16,
        isDisabled: true,
      },
      {
        title: "Outlook98 (soon™)",
        icon: icons.outlook16,
        isDisabled: false,
        component: "Outlook98",
      },
    ],
  },
  {
    title: "Entertainment",
    icon: icons.folderProgram16,
    className: "submenu-align-bottom-entertainment-programs",
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

// Favorites section
const myFavorites = [
  {
    title: "Start Menu Builder",
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
  {
    title: (
      <span
        style={{
          //fontFamily: '"Perfect DOS VGA 437", "MS Sans Serif", monospace',
          //fontSize: '12px',
          color: "#808080",
          //fontStyle: 'italic',
          pointerEvents: "none",
          userSelect: "none",
          display: "inline-block",
          //opacity: '2',
        }}
      >
        Soon™
      </span>
    ),
    isDisabled: true,
  },
];

const favorites = [
  {
    title: "My Favorites",
    icon: icons.folderFavorites24,
    //options: myFavorites,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/My Favorites",
    },
  },
  {
    title: "Community Favorites",
    icon: icons.folder16,
    className: "submenu-align-bottom-community-favorites",
    options: communityFavorites,
  },
];

// Tools section - Updated structure
const newsFeeds = [
  {
    title: "Tech Feed",
    icon: icons.newsletter16,
    component: "InternetExplorer",
    isDisabled: false,
    data: {
      component: "HappyTuesdayNewsFeed",
      type: "happy-tuesday-feed",
      tab: "tech",
      title: "News Feed",
    },
  },
  {
    title: "Builders Feed",
    icon: icons.newsletter16,
    component: "InternetExplorer",
    isDisabled: false,
    data: {
      component: "HappyTuesdayNewsFeed",
      type: "happy-tuesday-feed",
      tab: "builder",
      title: "News Feed",
    },
  },
  {
    title: "Art/Design Feed",
    icon: icons.newsletter16,
    component: "InternetExplorer",
    isDisabled: false,
    data: {
      component: "HappyTuesdayNewsFeed",
      type: "happy-tuesday-feed",
      tab: "art",
      title: "News Feed",
    },
  },
  {
    title: "Gaming Feed",
    icon: icons.newsletter16,
    component: "InternetExplorer",
    isDisabled: false,
    data: {
      component: "HappyTuesdayNewsFeed",
      type: "happy-tuesday-feed",
      tab: "gaming",
      title: "News Feed",
    },
  },
  {
    type: "divider",
    className: "divider divider--group-0-end",
    title: "",
    isDisabled: true,
  },
  {
    title: "My Feed",
    icon: icons.newsletter16,
    component: "InternetExplorer",
    tooltip: "Log in to access",
    isDisabled: true,
    data: {
      component: "HappyTuesdayNewsFeed",
      type: "happy-tuesday-feed",
      tab: "",
      title: "News Feed",
    },
  },
];

const productivityTools = [
  {
    title: "Enhanced Notes",
    icon: icons.winrep16,
    component: "",
    isDisabled: true,
  },
  {
    title: "To-do List",
    icon: icons.list32,
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
    title: "Routine Tracker",
    icon: icons.desktop16,
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
    title: "View Catalogue",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Tools/Productivity Tools/Catalogue",
    },
  },
  {
    type: "divider",
    className: "divider divider--group-0-end",
    title: "",
    isDisabled: true,
  },
  {
    title: "Native Tools",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Tools/Productivity Tools/Native",
    },
  },
];

// Creative Tools - showing 3 tools + View Catalogue
/*const creativeTools = [
  {
    title: "SVG Trace",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
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
    type: "divider",
    className: "divider divider--group-0-end",
    title: "",
  },
  {
    title: "Native Tools",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Tools/Productivity Tools/Native",
    },
  },
  {
    title: "View Catalogue",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Tools/Productivity Tools/Catalogue",
    },
  }
];*/

// Marketing Tools - showing 3 tools + View Catalogue
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
  {
    title: "View Catalogue",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Tools/Marketing Tools/Catalogue",
    },
  },
  {
    type: "divider",
    title: "",
    isDisabled: true,
  },
  {
    title: "Native Tools",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Tools/Marketing Tools/Native",
    },
  },
];

// Builder Tools - showing 3 tools + View Catalogue
const builderTools = [
  {
    title: "Kanban Boards",
    icon: icons.bricks32,
    component: "",
    isDisabled: true,
  },
  {
    title: "Openrouter Ranks",
    icon: icons.bricks32,
    component: "",
    isDisabled: true,
  },
  {
    title: "Automation Audit",
    icon: icons.bricks32,
    component: "",
    isDisabled: true,
  },
  {
    title: "View Catalogue",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Tools/Builder Tools/Catalogue",
    },
  },
  {
    type: "divider",
    className: "divider divider--group-0-end",
    title: "",
    isDisabled: true,
  },
  {
    title: "Native Tools",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Tools/Builder Tools/Native",
    },
  },
];

// Art/Design Tools - showing 3 tools + View Catalogue
const artDesignTools = [
  {
    title: "Art Gallery Finder",
    icon: icons.iesearch,
    component: "",
    isDisabled: true,
  },
  {
    title: "ASCII Banners",
    icon: icons.asciibanner16,
    component: "ASCIIText",
    isDisabled: false,
    data: {},
  },
  {
    title: "Design Trends",
    icon: icons.chart16,
    component: "",
    isDisabled: true,
  },
  {
    title: "View Catalogue",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Tools/Art Design Tools/Catalogue",
    },
  },
  {
    type: "divider",
    className: "divider divider--group-0-end",
    title: "",
    isDisabled: true,
  },
  {
    title: "Native Tools",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Tools/Art Design Tools/Native",
    },
  },
];

const tools = [
  {
    title: "News Feeds",
    icon: icons.folder16,
    className: "submenu-align-bottom-news-feeds-tools",
    options: newsFeeds,
  },
  {
    type: "divider",
    className: "divider divider--group-0-end",
    title: "",
    isDisabled: true,
  },
  {
    title: "Productivity Tools",
    icon: icons.folder16,
    options: productivityTools,
    className: "submenu-align-bottom-creative",
  },
  {
    title: "Builder Tools",
    icon: icons.folder16,
    options: builderTools,
    className: "submenu-align-bottom-builder",
  },
  {
    title: "Art/Design Tools",
    icon: icons.folder16,
    options: artDesignTools,
    className: "submenu-align-bottom-artdesign",
  },
  {
    title: "Marketing Tools",
    icon: icons.folder16,
    options: marketingTools,
    className: "submenu-align-bottom-marketing",
  },
];

tools.className = "tools-menu";

// Documents section - Updated structure
const myDocs = [
  {
    title: "My Notes",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/My Documents/My Notes",
    },
  },
  {
    title: "My Doodles",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/My Documents/My Doodles",
    },
  },
  {
    title: "Saved Games",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/My Documents/Saved Games",
    },
  },
  {
    title: "View All",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/My Documents",
    },
  },
];

const techDocs = [
  {
    title: "APIs",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Member Docs/Tech Docs/APIs",
    },
  },
  {
    title: "Trend Reports",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Member Docs/Tech Docs/Trend Reports",
    },
  },
  {
    title: "View All",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Member Docs/Tech Docs",
    },
  },
];

const builderDocs = [
  {
    title: "Motivation",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Member Docs/Builder Docs/Motivation",
    },
  },
  {
    title: "Resources",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Member Docs/Builder Docs/Resources",
    },
  },
  {
    title: "View All",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Member Docs/Builder Docs",
    },
  },
];

const artDesignDocs = [
  {
    title: "Color Theory",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Member Docs/Art Design Docs/Color Theory",
    },
  },
  {
    title: "Typography",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Member Docs/Art Design Docs/Typography",
    },
  },
  {
    title: "View All",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Member Docs/Art Design Docs",
    },
  },
];

const documents = [
  {
    title: "My Docs",
    icon: icons.folderOpen24,
    className: "submenu-align-bottom-my-docs",
    options: myDocs,
  },
  {
    title: "Tech Docs",
    icon: icons.folderOpen24,
    className: "submenu-align-bottom-tech-docs",
    options: techDocs,
  },
  {
    title: "Builder Docs",
    icon: icons.folderOpen24,
    className: "submenu-align-bottom-builder-docs",
    options: builderDocs,
  },
  {
    title: "Art/Design Docs",
    icon: icons.folderOpen24,
    className: "submenu-align-bottom-art-design-docs",
    options: artDesignDocs,
  },
];

// Games section
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
    className: "submenu-align-bottom-dos-games",
    options: dosGames,
  },
  {
    title: "Classic Games",
    icon: icons.folder16,
    className: "submenu-align-bottom-classic-games",
    options: classicGames,
  },
  {
    title: "Misc.",
    icon: icons.folder16,
    className: "submenu-align-bottom-misc-games",
    options: miscGames,
  },
];

// Artifacts section - Updated structure
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

// Still Frames - converted to folders
const stillFrames = [
  {
    title: "Pixel Art",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Artifacts/Still Frames/Pixel Art",
    },
  },
  {
    title: "ASCII Art",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Artifacts/Still Frames/ASCII Art",
    },
  },
  {
    title: "3D Rendered",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Artifacts/Still Frames/3D Rendered",
    },
  },
  {
    title: "View All",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Artifacts/Still Frames",
    },
  },
];

// Animated - converted to folders
const animated = [
  {
    title: "Pixel Art",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Artifacts/Animated/Pixel Art",
    },
  },
  {
    title: "Demoscenes",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Artifacts/Animated/Demoscenes",
    },
  },
  {
    title: "View All",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Artifacts/Animated",
    },
  },
];

const interactive = [
  {
    title: "WebGL Experiments",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Artifacts/Interactive/WebGL Experiments",
    },
  },
  {
    title: "ASCII Art",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Artifacts/Interactive/ASCII Art",
    },
  },
  {
    title: "View All",
    icon: icons.folder16,
    component: "CuboneFileExplorer",
    data: {
      initialPath: "C:/Artifacts/Interactive",
    },
  },
];

const artifacts = [
  {
    title: "Gallery",
    icon: icons.folder16,
    className: "submenu-align-bottom-gallery-artifacts",
    options: gallery,
  },
  {
    title: "Interactive",
    icon: icons.folder16,
    className: "submenu-align-bottom-interactive-artifacts",
    options: interactive,
  },
  {
    title: "Animated",
    icon: icons.folder16,
    className: "submenu-align-bottom-animated-artifacts",
    options: animated,
  },
  {
    title: "Still Frames",
    icon: icons.folder16,
    className: "submenu-align-bottom-still-frame-artifacts",
    options: stillFrames,
  },
];

// Find section
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
    options: getPrograms(),
  },
  {
    title: "Favorites",
    icon: icons.folderFavorites24,
    options: favorites,
  },
  {
    title: "Tools",
    icon: icons.directoryFolderOptions16,
    options: tools,
  },
  {
    title: "Documents",
    icon: icons.folderOpen24,
    options: documents,
  },
  {
    title: "Artifacts",
    icon: icons.ascii24,
    options: artifacts,
  },
  {
    title: "Games",
    icon: icons.joystick24,
    options: games,
  },
];

export default getStartMenuData;
