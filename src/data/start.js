import * as icons from "../icons";
import google1999 from "./textFiles/google1999";
import squirtel from "./textFiles/squirtel";
import rollin from "./textFiles/rollin";
import allStarTabs from "./textFiles/allStarTabs";

const accessories = [
  { title: "Calculator", icon: icons.calculator16, isDisabled: true },
  
  {
    title: "Notepad",
    icon: icons.notepad16,
    component: "Notepad",
    multiInstance: true
  },
  {
    title: "Paint",
    icon: icons.paint16,
    component: "IframeWindow",
    data: { src: "https://jspaint.app/", creator: "https://github.com/1j01" },
    multiInstance: true
  },
  
];

const programs = [
  { title: "Accessories", icon: icons.folderProgram16, options: accessories },
  {
    title: "Online Services", icon: icons.folderProgram16, options: [
    {
        title: "AOL",
        icon: icons.aol16,
        isDisabled: true
    },
      {
        title: "Outlook Express",
        icon: icons.outlook16,
        isDisabled: true
      },
  ] },
  {
    title: "Entertainment", icon: icons.folderProgram16, options: [
      {
        title: "Movie Player",
        icon: icons.mediavid16,
        isDisabled: true
      },
      {
        title: "CD Player",
        icon: icons.mediacd16,
        isDisabled: true
      }
  ] },
  {
    title: "Internet Explorer",
    icon: icons.internetExplorere16,
    component: "InternetExplorer",
    data: { __html: google1999 }
  },
  {
    title: "JS-DOS Prompt",
    icon: icons.msDos16,
    component: "JSDos",
    multiInstance: true
  },
  {
    title: "Promo (IIGA Test)",
    icon: icons.mediavid16,
    component: "VideoPlayer",
    data: {},
    multiInstance: true
  },
  { title: "Hydra Explorer", icon: icons.windowsExplorer16, isDisabled: true }
];

const favorites = [
  {
    title: "Media",
    icon: icons.folder16,
    options: [
      {
        title: "Warpcast",
        type: "ExternalLink",
        icon: icons.htmlFile16,
        href: "https://warpcast.com/333walton"
      },
      {
        title: "Good Movies",
        type: "ExternalLink",
        icon: icons.htmlFile16,
        href: "https://boxd.it/9UyaN"
      },
      {
        title: "Good Techno",
        type: "ExternalLink",
        icon: icons.htmlFile16,
        href: "https://soundcloud.com/southbound_music/sets/best-techno?utm_source=good_techno&utm_medium=startmenu&utm_campaign=hydra98"
      }
    ]
  },
  {
    title: "WebGL",
    icon: icons.folder16,
    options: [
      {
        title: "Minecraft Sim",
        type: "ExternalLink",
        icon: icons.htmlFile16,
        href:
          "https://threejs.org/examples/webgl_geometry_minecraft.html"
      },
      {
        title: "ASCII Ball",
        type: "ExternalLink",
        icon: icons.htmlFile16,
        href:
          "https://threejs.org/examples/webgl_effects_ascii.html"
      },
      {
        title: "Blobmixer",
        type: "ExternalLink",
        icon: icons.htmlFile16,
        href:
          "https://blobmixer.14islands.com/remix"
      },
      {
        title: "Rain Physics",
        type: "ExternalLink",
        icon: icons.htmlFile16,
        href:
          "https://loklok-volume.vercel.app/gpu"
      },
      {
        title: "Instance Points",
        type: "ExternalLink",
        icon: icons.htmlFile16,
        href:
          "https://threejs.org/examples/webgpu_instance_points.html"
      },
      {
        title: "2.5D UI",
        type: "ExternalLink",
        icon: icons.htmlFile16,
        href:
          "https://yanlinma.co/flat-ui-and-a-half/"
      },
    ],
  },
  {
    title: "Demoscenes",
    icon: icons.folder16,
    options: [
      {
        title: "Gallery",
        type: "ExternalLink",
        icon: icons.htmlFile16,
        href:
          "https://nanogems.demozoo.org/"
      },
      {
        title: "GleEst",
        type: "ExternalLink",
        icon: icons.htmlFile16,
        href:
          "https://demozoo.org/productions/288839/"
      },
      {
        title: "Videoram",
        type: "ExternalLink",
        icon: icons.htmlFile16,
        href:
          "https://demozoo.org/productions/296642/"
      },
      {
        title: "Micro1k",
        type: "ExternalLink",
        icon: icons.htmlFile16,
        href:
          "https://demozoo.org/productions/128900/"
      },
      {
        title: "Kishkoid",
        type: "ExternalLink",
        icon: icons.htmlFile16,
        href:
          "https://demozoo.org/productions/13245/"
      }
    ]
  },
  {
    title: "Links",
    icon: icons.folder16,
    options: [
      {
        title: "CoinGecko",
        type: "ExternalLink",
        icon: icons.htmlFile16,
        href:
          "https://www.coingecko.com/"
      }
    ]
  }
];

export const find = [
  { title: "Files or Folders...", icon: icons.findFiles16, isDisabled: true },
  {
    title: "Computer...",
    icon: icons.findComputer16,
    isDisabled: true
  },
  {
    title: "On the Internet...",
    icon: icons.findOnline16,
    type: "ExternalLink",
    href: "https://google.com"
  },
  {
    title: "People...",
    icon: icons.findPeople16,
    type: "ExternalLink",
    href: "https://facebook.com"
  }
];

const games = [
  {
    title: "MS Classics",
    icon: icons.folder16,
    options: [
      {
        title: "Minesweeper",
        icon: icons.minesweeper16,
        component: "Minesweeper2",
        multiInstance: true
      },
      {
      title: "Solitaire",
      icon: icons.soli16,
      component: "",
      multiInstance: true,
      isDisabled: true
      },
      {
      title: "SkiFree",
      icon: icons.skifree,   
      component: "",
      multiInstance: true,
      isDisabled: true
      },
      {
      title: "Space Cadet Pinball",
      icon: icons.spacecadet16,
      component: "",
      multiInstance: true,
      isDisabled: true
      }
    ]
  },
  {
    title: "DOS Games",
    icon: icons.folder16,
    options: [
      {
        title: "DOOM",
        icon: icons.doom16,
        component: "Doom",
        multiInstance: true
      }
    ]
  },
  {
    title: "Doom Wads",
    icon: icons.folder16,
    options: [
      {
        title: "coming soon...",
        icon: icons.loaderbat16,
        isDisabled: true
      }
    ]
  },
  {
    title: "HydraBurn",
    icon: icons.burn16,
    component: "Burn",
    multiInstance: true
  },
];

const ASCII = [
  {
    title: "Flames",
    icon: icons.burn16,
    component: "Burn",
    multiInstance: true
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
    title: "Squirtel",
    icon: icons.notepadFile32,
    component: "Notepad",
    data: {
      content: squirtel
    }
  },
];

const startMenuData = [
  {
    title: "Programs",
    icon: icons.folderProgram24,
    options: programs
  },
  {
    title: "Favorites",
    icon: icons.folderFavorites24,
    options: favorites,
  },
  {
    title: "Documents",
    icon: icons.folderOpen24,
    options: [
      {
        title: "Help",
        icon: icons.help16,
        options: [
          {
            title: "FAQ",
            icon: icons.faq32,
            component: "Notepad",
            multiInstance: true
          },
          {
            title: "Change Log",
            icon: icons.notepadFile32,
            component: "Notepad",
            multiInstance: true
          }
        ],
      },
      {
        title: "Doodle Gallery",
        icon: icons.folder16,
        options: [
          {
            title: "Submit Here",
            type: "ExternalLink",
            icon: icons.htmlFile16,
            href:
              ""
          },
          {
        title: "placeholder",
        type: "Notepad",
        icon: icons.paint32,
        component: "Notepad",
        isDisabled: true
          }
        ],
      },
      {
        title: "Guitar Tabs",
        options: [
          {
            title: "Rollin",
            icon: icons.notepadFile32,
            component: "Notepad",
            data: {
              content: rollin
            }
          },
          {
            title: "All Star",
            icon: icons.notepadFile32,
            component: "Notepad",
            data: {
              content: allStarTabs
            }
          }
        ],
        icon: icons.folder16
      }
    ]
  },
  {
    title: "Games",
    icon: icons.joystick24,
    options: games,
  },
  {
    title: "ASCII Art",
    icon: icons.ascii24,
    options: ASCII,
  },
];

export default startMenuData;
