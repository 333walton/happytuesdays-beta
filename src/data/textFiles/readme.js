const generateRows = () => {
  const rows = [
    {
      title: "Intro",
      image: "https://appstickers-cdn.appadvice.com/1164831016/819286823/18ab4614722102b2a0def24dda1ea4bd-1.gif",
      content: `
        Hydra98 is a web-based Windows 98-style desktop and creative sandbox, built with React and modern web technologies. It's a fun experiment blending classic computing nostalgia with modern interactivity, featuring apps, customization, ASCII art, and DOS-style gaming.
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
          <li>Classic Windows 'start' & 'shutdown' sequences</li>
          <li>Control Panel settings for screen sizes, themes, and more</li>
          <li>Resizable Windows & Desktop Interface</li>
          <li><b>Apps:</b> Notepad, Paint, DOOM, IE, ASCII</li>
          <li><b>Customization:</b> Add wallpapers & change themes</li>
          <li><b>File Saving:</b> Save Game, Paint and Notepad files for later</li>
          <li>Runs Doom</li>
        </ul>
      `
    },
    {
      title: "FAQ",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRX6w3EFRXeOcn6IvxIHNU8S7NU-HNKLtJd8CBYvAiuWZzbu0xNDvBFubV",
      content: `
        <ul>
          <li><b>Why does the screen flicker?</b><br> → That's a CRT effect to make it feel like an old-school monitor! If you feel a seizure coming on, you can adjust it in Control Panel settings.</li>
          <li><b>Why is the screen size weird?</b><br> → Because monitors were square (4:3 aspect ratio) in the 90s. Start > Settings > Control Panel to adjust.</li>
          <li><b>Can I delete files?</b><br> → Not yet! But if you're really determined, you can clear your browser's local storage and pretend you're a 90s IT pro.</li>
          <li><b>Can I play the launch screen again?</b><br> → Yes, just go through the shutdown sequence, and you'll see it again on refresh.</li>
        </ul>
      `
    },
    {
      title: "Technical Stuff",
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
        <ul style="margin-bottom: 0;">
          <li>To the moon</li>
        </ul><pre style="font-family: 'Courier New', monospace; margin-top: 0;"><code>
                               🌕
                         🚀
                     .
                 .
              .   
           .
         .
       .
      .   
     .
    .
 💥
        </code></pre>
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
      href: "https://www.w3schools.com/code/tryit.asp?filename=GL3DXQD5BRPJ",
      title: "Source Code"
    },
    {
      href: "https://react95.github.io/React95",
      title: "Component Library"
    },
    {
      href: "https://www.muse.place/moonwalkervault-steven",
      title: "HQ"
    },
    {
      href: "https://buymeacoffee.com/",
      title: "Coffee?"
    },
  ]
    .map(
      l =>
        `<a href="${l.href}" target="_blank" class="marquee-link">${l.title}</a>`
    )
    .join(" | ");

const readmeHTML = `
<style>
/* Import Comic Neue for mobile devices */
@import url('https://fonts.googleapis.com/css2?family=Comic+Neue&display=swap');

/* Base font styles */
font * {
  font-family: 'Comic Sans MS', 'Comic Sans', cursive !important;
}

/* Mobile-specific font override */
@media (max-width: 768px) {
  font *, .marquee-link {
    font-family: 'Comic Neue', cursive !important;
  }
}

blink {
  -webkit-animation: 1s linear infinite condemned_blink_effect;
  animation: 1s linear infinite condemned_blink_effect;
}
@-webkit-keyframes condemned_blink_effect {
  0%, 50% { visibility: hidden; }
  100% { visibility: visible; }
}
@keyframes condemned_blink_effect {
  0%, 50% { visibility: hidden; }
  100% { visibility: visible; }
}

/* Styles for the marquee container with border at bottom */
.marquee-container {
  position: relative;
  width: 100%;
  padding-bottom: 2px; /* Space for the border */
}

/* Black border below the marquee */
.marquee-container:after {
  content: "";
  display: block;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3.5px;
  background-color: black;
}

/* Styles for the marquee and links */
marquee {
  display: block;
  width: 100%;
  overflow: hidden;
  background-color: red;
  color: white;
  padding: 4px 0;
}

/* Improved marquee behavior - enable CSS-based animation as a fallback */
@supports (animation: marquee 15s linear infinite) {
  marquee:not(.native-marquee) {
    white-space: nowrap;
    overflow: hidden;
  }
  
  marquee:not(.native-marquee) > span {
    display: inline-block;
    padding-left: 100%;
    animation: marquee 15s linear infinite;
    white-space: nowrap;
  }
  
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-100%); }
  }
}

/* Mobile-specific adjustments for smoother scrolling */
@media (max-width: 768px) {
  marquee {
    transform: translateZ(0); /* Force hardware acceleration */
    -webkit-transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    -webkit-perspective: 1000;
  }
}

.marquee-link {
  font-size: 17px !important;
  font-weight: bold !important;
  text-decoration: none;
  color: white;
  cursor: pointer !important;
  padding: 0 10px;
}

/* Add hover pause functionality */
marquee:hover {
  -webkit-animation-play-state: paused;
  animation-play-state: paused;
  scroll-behavior: auto;
}

.marquee-link:hover {
  text-decoration: underline;
}
</style>

<font size="4">
  <div class="marquee-container">
    <marquee class="native-marquee" bgcolor="red" behavior="scroll" direction="left" scrollamount="4.4" onmouseover="this.stop();" onmouseout="this.start();">
      <span>
        ${marqueeGen()}
      </span>
    </marquee>
  </div>

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