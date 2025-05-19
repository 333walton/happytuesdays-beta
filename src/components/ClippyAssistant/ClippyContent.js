/**
 * ClippyContent.js - Data and content for Clippy interactions
 */

// Collection of Clippy animations
export const animations = {
  greeting: ["Greeting", "Wave", "Congratulate"],
  thinking: ["GetTechy", "Thinking", "Processing"],
  attention: ["GetAttention", "Alert", "CheckingSomething"],
  writing: ["Writing", "GestureDown", "GestureLeft"],
};

// Collection of Clippy interactions (animationCategory used instead of hardcoded animations)
export const interactions = [
  {
    message: "Welcome to Hydra98! Please enjoy and don't break anything",
    animationCategory: "greeting",
    options: [
      {
        text: "Launch an application",
        response:
          "Double-click any desktop icon to open apps like Notepad, Paint, or UTM Tracker. Browse the Start menu for more.",
      },
      {
        text: "Customize my setup",
        response:
          "Go to Settings>Control Panel via the Start menu to change your theme, wallpaper, scale, or toggle the CRT effect.",
      },
      {
        text: "Just browsing",
        response:
          "Take your time! You can explore freely and click Start to see all installed apps.",
      },
    ],
  },
  {
    message: "Need help navigating Hydra98?",
    animationCategory: "attention",
    options: [
      {
        text: "How do I shut down?",
        response:
          "Click the Start button and choose 'Shut Down' to safely end your session with a classic shutdown animation.",
      },
      {
        text: "Where can I find my files?",
        response:
          "Your notepad and paint files are stored locally on the desktop via browser cache.",
      },
      {
        text: "I'm good, thanks",
        response: "No problem! I'm always here if you need me.",
      },
    ],
  },
  {
    message: "Looks like you're exploring. Want some tips?",
    animationCategory: "attention",
    options: [
      {
        text: "What is Hydra98?",
        response:
          "Hydra98 is a web-based Windows 98 sandbox built with predominantly ReactJS. It recreates the classic desktop experience with modern web tech.",
      },
      {
        text: "How can I manage windows?",
        response:
          "Double-click any icon to open an app. Windows can be moved, resized, minimized, or closed—just like the real Win98.",
      },
      {
        text: "Nah, I'm just vibing",
        response:
          "Awesome. Enjoy the nostalgia. Feel free to submit a doodle if you make one - it might get featured if its a true work of art.",
      },
    ],
  },
  {
    message: "Want to tweak or explore more settings?",
    animationCategory: "writing",
    options: [
      {
        text: "Change the look",
        response:
          "Head to Monitor Controls and Settings to change your theme, desktop wallpaper, or resolution scale (1x, 1.5x, 2x).",
      },
      {
        text: "CRT mode?",
        response:
          "Yep! Enable/Disable the CRT overlay in Settings to simulate an old-school monitor with scanlines.",
      },
      {
        text: "Ad Tools?",
        response:
          "Open Ad Tools from the Start menu to make your life easier if you're a digital marketer or advertiser.",
      },
    ],
  },
  {
    message: "Looking for fun or tools?",
    animationCategory: "thinking",
    options: [
      {
        text: "Games",
        response:
          "Check out classics like Minesweeper and DOOM. Find them all in the Start menu > Games.",
      },
      {
        text: "Productivity apps",
        response:
          "Open Notepad to jot things down, or Paint for a sketch. Save your work locally to your Hydra desktop to revisit later.",
      },
      {
        text: "Music player?",
        response:
          "Absolutely. Fire up Winamp from the Start menu and enjoy a vaporwave playlist with custom skins, an EQ and animations.",
      },
    ],
  },
];

// Chatbot responses for text input
export const chatResponses = {
  default:
    "I'm not sure about that. Is there something specific about Hydra98 you'd like to know?",
  greeting: "Hello there! How can I assist you with Hydra98?",
  help: "I can help with many tasks. What specifically do you need assistance with?",
  files:
    "To manage your files, open the File Explorer app or double-click on My Documents.",
  internet:
    "Hydra98 includes a simulated Internet Explorer for browsing. You’ll find it in the Start menu.",
  windows98:
    "Hydra98 recreates the Windows 98 desktop experience in your browser—complete with themes, classic apps, and CRT vibes.",
  programs:
    "Click Start, then select an application from the Programs list to open it.",
  shutdown: "To shut down Hydra98, click Start, then Shut Down.",
  restart:
    "Click Start > Shut Down, then choose Restart to reload your session.",
  error:
    "Encountering an error? Try closing and reopening the app. It might help!",
  minesweeper:
    "Minesweeper98 is a retro logic game. Avoid the mines and clear the grid!",
  solitaire:
    "Solitaire is a timeless card game that comes bundled with Hydra98. Give it a try!",
  paint:
    "Paint is a classic drawing app. You’ll find it in Start > Programs > Accessories.",
};
