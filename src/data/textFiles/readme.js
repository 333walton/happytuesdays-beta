const generateRows = () => {
  const rows = [
    {
      title: "Intro",
      image: "https://appstickers-cdn.appadvice.com/1164831016/819286823/18ab4614722102b2a0def24dda1ea4bd-1.gif",
      content: `
        Hydra98 is a web-based Windows 98-style desktop and creative sandbox, built with React and modern web technologies. It’s a fun experiment blending classic computing nostalgia with modern interactivity, featuring apps, customization, ASCII art, and DOS-style gaming.
        <br><br>
        Future updates will bring web3 integrations, more mini apps, and a clippy-style help-bot. Stay tuned!
      `
    },
    {
      title: "Features",
      image: "http://clipart-library.com/image_gallery/91835.jpg",
      content: `
        <ul>
          <li>Windows 98 UI with authentic styling</li>
          <li>Boot & Shutdown Screens for immersion</li>
          <li>CRT Flicker Effect (toggleable in control panel)</li>
          <li>Resizable Windows & Desktop Interface</li>
          <li>Apps: Notepad, Paint, DOOM, IE, ASCII</li>
          <li>Customization: Add wallpapers & change themes</li>
          <li>File Saving: Save Game and Notepad files for later</li>
          <li>Runs Doom</li>
        </ul>
      `
    },
    {
      title: "FAQ",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRX6w3EFRXeOcn6IvxIHNU8S7NU-HNKLtJd8CBYvAiuWZzbu0xNDvBFubV",
      content: `
        <ul>
          <li>Why does the screen flicker?<br> → That’s a CRT effect to make it feel like an old-school monitor! If you feel a seizure coming on, you can adjust it in Control Panel settings.</li>
          <li>Why is the screen size weird?<br> → Because monitors were square (4:3 aspect ratio) in the 90s. Start > Settings > Control Panel to adjust.</li>
          <li>Can I delete files?<br> → Not yet! But if you’re really determined, you can clear your browser’s local storage and pretend you’re a 90s IT pro.</li>
          <li>The launch screen was cool, can I play it again?<br> → Yes, just go through the shutdown sequence, and you’ll see it again on refresh.</li>
        </ul>
      `
    },
    {
      title: "Technical stuff",
      image: "https://i.imgur.com/PcmaUvV.png",
      content: `
        <ul>
          <li>Built with React & Context API for state management</li>
          <li>Dynamic window management via React-RND</li>
          <li>In-browser gaming via WebAssembly</li>
          <li>Data persistence via LocalStorage for saving files and preferences</li>
        </ul>
      `
    },
    {
      title: "Goals",
      image: "http://clipart-library.com/img/1577254.png",
      content: `
        <ul>
          <li>To the moon</li>
        </ul>
      `
    }
  ];

  return rows
    .map(
      r => `
        <tr>
          <td bgcolor="black" width="80px" align="right">
            <font color="white" id="introduction">
              ${r.title}<br/>
              <img src="${r.image}" width="60px" />
            </font>
          </td>
          <td bgcolor="lightgrey">
            ${r.content}
          </td>
        </tr>
      `
    )
    .join("");
};

const marqueeGen = () =>
  [
    {
      href: "https://www.google.com",
      title: "Source Code"
    },
    {
      href: "https://www.npmjs.com/package/packard-belle",
      title: "Component Library"
    },
    {
      href: "https://www.google.com",
      title: "LinkedIn"
    },
    { href: "https://www.buymeacoffee.com", title: "$$$?" },
    {
      href: "https://www.google.com",
      title: "Similar projects"
    }
  ]
    .map(
      l =>
        `<a href="${l.href}" target="_blank" norel="noopen noreferrer">${l.title}</a>`
    )
    .join(" | ");

const readmeHTML = `
<style>
font * {font-family: 'Comic Sans MS' !important;}
blink {
  -webkit-animation: 1s linear infinite condemned_blink_effect; // for android
  animation: 1s linear infinite condemned_blink_effect;
}
@-webkit-keyframes condemned_blink_effect { // for android
  0% {
      visibility: hidden;
  }
  50% {
      visibility: hidden;
  }
  100% {
      visibility: visible;
  }
}
@keyframes condemned_blink_effect {
  0% {
      visibility: hidden;
  }
  50% {
      visibility: hidden;
  }
  100% {
      visibility: visible;
  }
}
</style>
<font size="4" >
  <marquee bgcolor="red" color="white">
    ${marqueeGen()}
  </marquee>
  <table bgcolor="grey" width="100%">
    <thead>
      <tr>
        <td colspan="2" valign="center">
          <font size="7"><b>README</b></font>
        </td>
      </tr>
    </thead>
    <tbody valign="top">
      ${generateRows()}
    </tbody>
    <tfoot valign="top">
      <tr><td>(c)2025</td>
      <td>
      <blink>
      <img align="right" width="200px" src="" />
      </blink>
      </td></tr>
    </tfoot>
  </table>
 </font>
`;

export default readmeHTML;
