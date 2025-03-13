import * as icons from "../icons";
import google1999 from "./textFiles/google1999";
import squirtel from "./textFiles/squirtel";
import rollin from "./textFiles/rollin";
import allStarTabs from "./textFiles/allStarTabs";
import blue from "./textFiles/blue"; // Ensure this line is correct
import blueLyrics from "./textFiles/blue";
import allstarLyrics from "./textFiles/allStar";

const accessories = [
  { title: "Entertainment", icon: icons.folderProgram16, options: [] },
  { title: "Internet Tools", icon: icons.folderProgram16, options: [] },
  { title: "System Tools", icon: icons.folderProgram16, options: [] },
  { title: "Calculator", icon: icons.calculator16, isDisabled: true },
  {
    title: "Minesweeper",
    icon: icons.minesweeper16,
    component: "Minesweeper",
    multiInstance: true,
    isDisabled: true
  },
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
  {
    title: "Doom",
    icon: icons.doom16,
    component: "Doom",
    // data: {
    //   src: "https://basicallydan.github.io/skifree.js/"
    // },
    multiInstance: false
  }
];

const programs = [
  { title: "Accessories", icon: icons.folderProgram16, options: accessories },
  { title: "Online Services", icon: icons.folderProgram16, options: [] },
  { title: "StartUp", icon: icons.folderProgram16, options: [] },
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
  { title: "Outlook Express", icon: icons.outlook16, isDisabled: true },
  { title: "Hydra Explorer", icon: icons.windowsExplorer16, isDisabled: true }
];

const favorites = [
  {
    title: "Channels",
    options: [],
    icon: icons.folder16
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
  },
  {
    title: "Media",
    icon: icons.folder16,
    options: [
      {
        title: "My Big List of Films",
        type: "ExternalLink",
        icon: icons.htmlFile16,
        href: "https://boxd.it/9UyaN"
      }
    ]
  },
  {
    title: "Warpcast",
    type: "ExternalLink",
    icon: icons.htmlFile16,
    href: "https://warpcast.com/333walton"
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
        title: "ASCII Art",
        options: [
          {
            title: "SOON",
            icon: icons.burn16,
            component: "Burn",
            // data: {
            //   content: facepalm
            // }
          },
          {
            title: "Squirtel",
            icon: icons.notepadFile32,
            component: "Notepad",
            data: {
              content: squirtel
            }
          }
        ],
        icon: icons.folder16
      },
      {
        title: "Lyrics",
        options: [
          {
            title: "Blue (Da Ba Dee)",
            icon: icons.notepadFile32,
            component: "Notepad",
            data: {
              content: blueLyrics // Ensure this line is correct
            }
          },
          {
            title: "All Star",
            icon: icons.notepadFile32,
            component: "Notepad",
            data: {
              content: allstarLyrics
            }
          }
        ],
        icon: icons.folder16
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
  }
];

export default startMenuData;
