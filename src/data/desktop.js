import * as icons from "../icons";
import readme from "./textFiles/readme";

const desktopData = [
  
  {
    title: "Computer",
    icon: icons.computer32,
    component: "ExplorerWindow",
    data: {
      content: [
        {
          title: "(C:)",
          icon: "cd32",
          failState: {
            message:
              "This is a React App, there is no CD drive, your laptop probably doesn't have one either",
            loadTime: 4000
          }
        },
        {
          title: "(D:)",
          icon: "hdd32",
          failState: {
            message: "This is a React App, there is no hard drive",
            loadTime: 1000
          }
        },
        {
          title: "3 1/2 Floppy (A:)",
          icon: "floppy32",
          failState: {
            message:
              "Did everyone else's computer take ages to load the 'no floppy disc inserted' message or was that just mine?",
            loadTime: 8000
          }
        }
      ]
    }
  },
  {
    title: "Read Me",
    icon: icons.htmlFile32,
    component: "InternetExplorer",
    data: {
      __html: readme
    }
  },
  {
    title: "DOOM",
    icon: icons.doom32,
    component: "Doom",
  },
  {
    title: "Paint",
    icon: icons.paint32,
    component: "IframeWindow",
    data: { src: "https://jspaint.app/", creator: "https://github.com/1j01" },
    multiInstance: true,
  },
  {
    title: "Recycle",
    icon: icons.recycleempty32, // Default icon (This will be overridden in the component using state)
    component: "RecycleBin",
    className: "recycle-icon" // Apply the CSS class
  },
  {
    title: "Video Player",
    icon: icons.doom32,
    component: "VideoPlayer",
  },

];

export default desktopData;
