import * as icons from "../icons";
import squirtel from "./textFiles/squirtel";
import rollin from "./textFiles/rollin";
import allStarTabs from "./textFiles/allStarTabs";
import commits from "./textFiles/commits"; // Added import for commits
import faq from "./textFiles/faq"; // Moved to programs.js
// import clippyFaq from "./textFiles/clippyFaq"; // Uncomment when file is available

// Utility function to detect mobile devices
const isMobile = () =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

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

const aiAssistants = [
  {
    title: "What Are These?",
    icon: icons.faq16,
    component: "",
    isDisabled: true,
    // data: {
    //   content: clippyFaq, // Link to clippyFaq.js when available
    // },
  },
  {
    title: "Clippy GPT",
    tooltip: "Site Guide",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
  {
    title: "F1 GPT",
    tooltip: "Tech Workshop",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
  {
    title: "Genius GPT",
    tooltip: "Motivation Station",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
  {
    title: "Merlin GPT",
    tooltip: "Art Gallery",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
  {
    title: "Bonzi GPT",
    tooltip: "Gaming Hub",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
];

const programs = [
  {
    title: "AI Assistants",
    icon: icons.folderProgram16,
    options: aiAssistants,
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
    icon: icons.chart24,
    options: communityFavorites,
  },
];

// Moved WebGL items to Artifacts > Experiential
// const webGLOptions = [
//   {
//     title: "Rain Physics",
//     icon: icons.webglwindow32,
//     component: "TestExplorer",
//     data: {
//       src: "https://loklok-volume.vercel.app/gpu",
//       title: "Internet Explorer",
//     },
//     multiInstance: false,
//   },
//   {
//     title: "Instance Points",
//     icon: icons.webglwindow32,
//     component: "TestExplorer",
//     data: {
//       src: "https://threejs.org/examples/webgpu_instance_points.html",
//       title: "Internet Explorer",
//     },
//     multiInstance: false,
//   },
//   ...(!isMobile()
//     ? [
//         {
//           title: "Minecraft Sim",
//           icon: icons.webglwindow32,
//           component: "TestExplorer",
//           data: {
//             src: "https://threejs.org/examples/webgl_geometry_minecraft.html",
//             title: "Internet Explorer",
//           },
//           multiInstance: false,
//         },
//       ]
//     : []),
// ];

// Commented out old Media options
// const mediaOptions = [
//   {
//     title: "Good Music",
//     type: "ExternalLink",
//     icon: icons.mediacd16,
//     isDisabled: true,
//     href: "https://soundcloud.com/southbound_music/sets/best-techno?utm_source=good_techno&utm_medium=startmenu&utm_campaign=hydra98",
//   },
//   {
//     title: "Good Movies",
//     type: "ExternalLink",
//     icon: icons.htmlFile16,
//     href: "https://boxd.it/9UyaN",
//   },
//   {
//     title: "Warpcast",
//     type: "ExternalLink",
//     icon: icons.htmlFile16,
//     href: "https://warpcast.com/333walton",
//   },
// ];

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
    icon: icons.logOff24,
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
  // Commented out from Ad Tools
  // {
  //   title: "Cookie Consent",
  //   icon: icons.cookie16,
  //   href: "",
  //   isDisabled: true,
  // },
  // {
  //   title: "Hookscore Heatmap",
  //   icon: icons.vid16,
  //   component: "HookScoreHeatmap",
  //   multiInstance: true,
  //   isDisabled: true,
  //   data: {
  //     src: "",
  //   },
  // },
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
    icon: icons.vid16,
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
    icon: icons.vid16,
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
  // Commented out old documents structure
  // {
  //   title: "Ad Tools",
  //   icon: icons.faq32,
  //   options: [...],
  // },
  // {
  //   title: "Guitar Tabs",
  //   options: [
  //     {
  //       title: "Rollin",
  //       icon: icons.notepadFile16,
  //       component: "Notepad",
  //       data: {
  //         content: rollin,
  //       },
  //     },
  //     {
  //       title: "All Star",
  //       icon: icons.notepadFile16,
  //       component: "Notepad",
  //       data: {
  //         content: allStarTabs,
  //       },
  //     },
  //   ],
  //   icon: icons.folder16,
  // },
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
  // Moved HydraBurn to ASCII Art section
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
  // Moved Squirtel to "See More..."
  // {
  //   title: "Squirtel",
  //   icon: icons.notepad16,
  //   component: "Notepad",
  //   data: {
  //     content: squirtel,
  //   },
  // },
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

const pixelArt = [
  {
    title: "See More...",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
];

const interactive = [
  {
    title: "ASCII Art",
    icon: icons.folder16,
    data: {
      src: "",
      title: "",
    },
    multiInstance: false,
  },
  {
    title: "WebGL Experiments",
    icon: icons.folder16,
    data: {
      src: "",
      title: "",
    },
    multiInstance: false,
  },
  //{
  //title: "Rain Physics",
  //icon: icons.webglwindow32,
  //component: "TestExplorer",
  //data: {
  //src: "https://loklok-volume.vercel.app/gpu",
  //title: "Internet Explorer",
  //},
  //multiInstance: false,
  //},
  //{
  //title: "Instance Points",
  //icon: icons.webglwindow32,
  //component: "TestExplorer",
  //data: {
  //src: "https://threejs.org/examples/webgpu_instance_points.html",
  //title: "Internet Explorer",
  //},
  //multiInstance: false,
  //},
  //{
  //title: "Minecraft Sim",
  //icon: icons.webglwindow32,
  //component: "TestExplorer",
  //data: {
  //src: "https://threejs.org/examples/webgl_geometry_minecraft.html",
  //title: "Internet Explorer",
  //},
  //multiInstance: false,
  //},
  {
    title: "Randomize",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
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
  // Moved from old Doodle Gallery
  // {
  //   title: "Enter Gallery",
  //   icon: icons.doodlegallery32,
  //   component: "",
  //   isDisabled: true,
  // },
  // {
  //   title: "All Doodles",
  //   icon: icons.folderOpen24,
  //   component: "ExplorerWindow",
  //   isDisabled: false,
  //   data: {
  //     content: [...],
  //   },
  // },
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
    title: "ASCII Art",
    icon: icons.folder16,
    options: asciiArt,
  },
  {
    title: "Pixel Art",
    icon: icons.folder16,
    options: pixelArt,
  },
  {
    title: "Demoscenes",
    icon: icons.folder16,
    options: demoscenes,
  },
];

const helpOptions = [
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
    icon: icons.camera16,
    component: isMobile ? "VideoPlayerMobile" : "VideoPlayerMobile",
    multiInstance: true,
    isDisabled: true,
    data: {},
  },
  {
    title: "Contact",
    icon: icons.vid16,
    component: "",
    isDisabled: true,
  },
  {
    title: "Change Log",
    icon: icons.notepadFile16,
    component: "Notepad",
    data: {
      content: commits,
    },
  },
  // Commented out Office Assistant
  // {
  //   title: "Office Assistant",
  //   icon: icons.textchat32,
  //   component: "Clippy",
  //   id: "clippy-assistant",
  // },
];

// Make sure faq and commits are imported or defined above, e.g.:
// import faq from "./textFiles/faq";
// import commits from "./textFiles/commits";

const startMenuData = [
  {
    title: "Programs",
    icon: icons.folderProgram24,
    options: programs,
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

export default startMenuData;
