// Windows 98 README Component
// This file contains a single clean export with no duplicated code

// Create README content objects
const readmeContent = {
  rows: [
    {
      title: "Intro",
      image:
        "//appstickers-cdn.appadvice.com/1164831016/819286823/18ab4614722102b2a0def24dda1ea4bd-1.gif",
      content: `
        <div class="intro-paragraph">
          Hydra98 is a React-based application that faithfully recreates the nostalgic Windows 98 desktop experience for the modern web. It's a fun experiment blending classic computing aesthetics with modern interactivity, featuring interactive windows, authentic styling, and retro applications.
          <br><br>
          This digital time capsule delivers an immersive computing experience that's both nostalgic and accessible across different devices. More features coming soon!
        </div>
      `,
    },
    {
      title: "Tech",
      image: "/static/cryptopunk.jpg",
      content: `
      <div class="intro-paragraph">
        <ul>
          <li>Built with React & Context API for state management</li>
          <li>Packard Belle & React95 UI libraries for authentic components</li>
          <li>CSS Modules & Styled Components for Windows 98 aesthetic</li>
          <li>react-rnd for window resizing and dragging functionality</li>
          <li>Organized component structure for maximum maintainability</li>
        </ul>
        </div>
      `,
    },
    {
      title: "Features",
      image: "/static/computer-01.gif", // Corrected image path
      content: `
      <div class="intro-paragraph">
        <ul>
          <li>Complete Windows 98 Desktop with authentic styling</li>
          <li>Window Management (open, close, minimize, maximize, resize)</li>
          <li>Classic Windows 'start' & 'shutdown' sequences</li>
          <li>Responsive design for desktop and mobile</li>
          <li><b>Apps:</b> Notepad, Paint, DOOM, Internet Explorer, Command Prompt</li>
          <li><b>Customization:</b> Wallpapers, themes, display settings</li>
          <li><b>File Saving:</b> LocalStorage persistence for your digital artifacts</li>
          <li>CRT Effect toggle for that authentic retro feel</li>
        </ul>
        </div>
      `,
    },
    {
      title: "FAQ",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRX6w3EFRXeOcn6IvxIHNU8S7NU-HNKLtJd8CBYvAiuWZzbu0xNDvBFubV",
      content: `
      <div class="intro-paragraph">
        <ul>
          <li><b>Why does the screen flicker?</b><br> → That's the CRT effect simulating an old-school monitor! You can adjust or disable it in the Control Panel settings.</li>
          <li><b>Why is the screen size weird?</b><br> → Monitors were square (4:3 aspect ratio) in the 90s. Visit Start > Settings > Control Panel to adjust scaling.</li>
          <li><b>Can I delete files?</b><br> → Not yet! But clearing your browser's local storage gives you that authentic "I just reinstalled Windows" feeling.</li>
          <li><b>Can I see the launch screen again?</b><br> → Just go through the shutdown sequence, and it'll appear on refresh.</li>
        </ul>
        </div>
      `,
    },
    {
      title: "About",
      image: "/static/goals.png",
      content: `
      <div class="intro-paragraph">
        <p>Developed with a thoughtful architecture emphasizing component reusability, authentic styling, and interactive window management. Created by a developer with a passion for merging past aesthetics with modern web capabilities.</p>
        <p>Perfect for nostalgic browsing or as a technical showcase of advanced UI/UX patterns in React.</p>
        <pre style="font-family: 'Courier New', monospace; margin-top: 0;"><code>
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
      </div>
      `,
    },
  ],

  marqueeLinks: [
    {
      href: "https://www.w3schools.com/code/tryit.asp?filename=GL3DXQD5BRPJ",
      title: "Source Code",
    },
    {
      href: "https://react95.github.io/React95",
      title: "Component Library",
    },
    {
      href: "https://www.muse.place/moonwalkervault-steven",
      title: "HQ",
    },
    {
      href: "https://buymeacoffee.com/",
      title: "Coffee?",
    },
  ],
};

// Helper function to generate HTML for rows
const generateTableRows = (rows) => {
  return rows
    .map(
      (r) => `
        <tr>
          <td bgcolor="black" width="80px" align="center" class="title-cell">
            <font color="white" id="introduction">
              <div style="margin-top: 3px; margin-bottom: ${
                ["Intro", "Features", "Tech", "FAQ", "About"].includes(r.title)
                  ? "11px"
                  : "0"
              };">
                ${r.title}
              </div>
              <img
                src="${r.image}"
                width="${r.title === "Features" ? "70px" : "60px"}"
                font color="#ff4d4d"
                class="${
                  r.title === "Intro"
                    ? "hamster-gif"
                    : r.title === "Features"
                    ? "computer-01"
                    : ""
                }"
              />
            </font>
          </td>
          <td bgcolor="lightgrey">
            ${r.content}
          </td>
        </tr>`
    )
    .join("");
};

// Helper function to generate marquee links
const generateMarqueeLinks = (links) => {
  return links
    .map(
      (l) =>
        `<a href="${l.href}" target="_blank" class="marquee-link">${l.title}</a>`
    )
    .join(" | ");
};

// Main function to generate the complete HTML
const generateReadmeHTML = () => {
  const tableRows = generateTableRows(readmeContent.rows);
  const marqueeLinks = generateMarqueeLinks(readmeContent.marqueeLinks);

  return `
<style>
/* Import Comic Neue for mobile devices */
@import url('https://fonts.googleapis.com/css2?family=Comic+Neue&display=swap');

/* Base font styles */
font * {
  font-family: 'Comic Sans MS', 'Comic Sans' !important;
}

/* Mobile-specific font override */
@media (max-width: 768px) {
  font *, .marquee-link {
    font-family: 'Comic Neue' !important;
    font-weight: bold;
  }
  
  /* Override only for .intro-paragraph */
  .intro-paragraph {
    font-stretch: condensed !important;
    font-size: 0.92em !important;
    line-height: 1.35 !important;
    letter-spacing: 0.03em !important;
    color: rgba(0, 0, 0, 0.83) !important;
  }
}

/* Explicit color overrides for all title text - especially for mobile and iOS Safari */
.title-text,
td[bgcolor="black"] font[color="white"],
td[bgcolor="black"] font[color="white"] div,
td[bgcolor="black"] font {
  color: white !important;
  -webkit-text-fill-color: white !important;
  text-shadow: 0 0 0 white !important;
  -webkit-text-stroke: 0 !important;
}

/* Force all text in black cells to be white on mobile devices */
@media (max-width: 768px) {
  td[bgcolor="black"] * {
    color: white !important;
    -webkit-text-fill-color: white !important;
  }
  
  /* Special iOS Safari targeting */
  @supports (-webkit-touch-callout: none) {
    td[bgcolor="black"] font,
    td[bgcolor="black"] div,
    .title-cell * {
      color: white !important;
      -webkit-text-fill-color: white !important;
    }
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
  padding: 4px 0;
}

/* Marquee links must be white on ALL devices */
.marquee-link {
  font-size: 17px !important;
  font-weight: 600 !important;
  text-decoration: none;
  color: white !important; /* Added !important to override any browser defaults */
  -webkit-text-fill-color: white !important; /* For iOS Safari */
  cursor: pointer !important;
  padding: 0 10px;
  text-shadow: 0 0 0 white !important; /* Additional override for stubborn browsers */
}

/* Force all links in the marquee to be white */
marquee a, 
#scrollMarquee a,
marquee a:link,
marquee a:visited {
  color: white !important;
  -webkit-text-fill-color: white !important;
}

/* Add back other marquee styles */
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
    <marquee id="scrollMarquee" class="native-marquee" bgcolor="red" behavior="scroll" direction="left" scrollamount="4.4" onmouseover="this.stop();" onmouseout="this.start();">
      <span style="color: white !important; -webkit-text-fill-color: white !important;">
        ${marqueeLinks}
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
      ${tableRows}
    </tbody>
    <tfoot valign="bottom">
      <tr>
        <td>&copy;2025</td>
        <td colspan="1" bgcolor="grey" height="18px" valign="middle">
          <div style="text-align: center;">
            <img id="constructionImg" src="/static/underconstruction.gif" alt="Soon" title="Soon™" style="width: 30px; vertical-align: middle;" />
          </div>
        </td>
      </tr>
    </tfoot>
  </table>
</font>
`;
};

// Generate the final HTML
const readmeHTML = generateReadmeHTML();

// Export a single default
export default readmeHTML;
