const generateRows = () => {
  const rows = [
    {
      title: "Introduction",
      image:
        "https://appstickers-cdn.appadvice.com/1164831016/819286823/18ab4614722102b2a0def24dda1ea4bd-1.gif",
      content: `
      Hi, this is a small recreation of a Windows 98 Desktop.
      This project is just for fun to learn some react and web media stuff.<br/>
      More to come... Lemme know if you find any bugs!
      `
    },
    {
      title: "Features",
      image: "http://worldartsme.com/images/work-assignment-list-clipart-1.jpg",
      content: `
        <ul>
          <li>W98 UI</li>
          <li>CRT Flicker</li>
          <li>Launch and shut down screens</li>
          <li>Desktop interface</li>
          <li>StartMenu</li>
          <li>Resizable windows</li>
          <li>Notepad</li>
          <li>Paint</li>
          <li>DOOM</li>
          <li>DOOM Wads (wen?)</li>
          <li>ASCII Art</li>
          <li>Custom backgrounds (see Start -> Settings -> Control Panel)</li>
          <li>Save Notepad files for later, Save As new files</li>
        </ul>
      `
    },
    {
      title: "FAQ",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRX6w3EFRXeOcn6IvxIHNU8S7NU-HNKLtJd8CBYvAiuWZzbu0xNDvBFubV",
      content: `
        <ul>
          <li>What's that annoying flicker?<br> > I added a CRT effect, you can disable it via Start -> Settings -> Control Panel</li>
          <li>Why the weird screen size?<br>
            > Old monitors were like this! Basically everyone used a 4:3 resolution monitor with W98 back then (you can change this in the control panel).<br/>
            Better mobile compatibility, too. Some mobile browsers don't cooperate too well with the dragging and dropping.</li>
          <li>Can I delete files?<br /> > Not yet, unless you delete/clear your local storage</li>
          <li>The launch screen was cool, can I play it again?<br/> > Yep, you'll have to go through the shut down screen first though</li>
        </ul>
      `
    },
    {
      title: "Technical stuff",
      image: "http://clipart-library.com/image_gallery/91835.jpg",
      content: `
        <ul>
          <li>This site is built with React 16 (pre-hooks).</li>
          <li>State management is handled via React's Context API.</li>
          <li>'React-rnd' to manage windows.</li>
          <li>System storage is currently handled via localStorage</li>
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
        `<a href="${l.href}" target="_blank" norel="noopen noreferrer">${
          l.title
        }</a>`
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

      <img align="right" width="200px" src="https://unixtitan.net/images/give-clipart-thank-you-gift-7.gif" />
      </blink>
      </td></tr>
    </tfoot>
  </table>
 </font>
`;

export default readmeHTML;
