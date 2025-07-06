This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# 💾 Happy Tuesdays: A Web-Based Windows 98 Sandbox

Happy Tuesdays is a web-based Windows 98-style desktop, built with React and modern web technologies. It blends classic computing nostalgia with modern interactivity, featuring apps, customization, and DOS-style gaming, including DOOM.

## 🖥️ What Can Happy Tuesdays Do?

→ **Windows 98 UI recreation** with resizable, draggable windows<br>
→ **Emulates classic Windows** 'Start' & 'Shutdown' sequences<br>
→ **Customizable desktop** (change wallpapers, save files, and tweak settings)<br>
→ **Notepad recreation** with original font + file saving<br>
→ **Basic MS-DOS simulator** (very, very basic)<br>
→ **Persistent storage via LocalStorage** for saving backgrounds, files, and settings<br>
→ **iFrames for external recreations** (easy expansion possibilities)<br>
→ **Somewhat mobile-friendly**, with touch-friendly interactions

## 🔧 How Do I…?

→ **See the launch screen again?** | Clear LocalStorage or go through the shutdown process<br>
→ **Delete files?** | Not yet, but tweaking LocalStorage can help<br>
→ **Tweak settings or remove CRT flicker?** | Check Start > Settings > Control Panel

## 🚀 Future Goals & Improvements

### 🔹 Core Refinements

- [x] Improve **launch speed** by handling the boot sequence in vanilla JS
- [x] Convert stored data to **easily editable JSON**
- [ ] Expand the **folder system & improve state handling**
- [ ] Improve **mobile support & UI flexibility**
- [ ] Implement **Cypress testing for key features**

### 🌀 Novel Features

- [x] **"My Computer" folder** with a floppy disk that “freezes” before telling you there’s no floppy inserted
- [ ] **BSOD on crashes**, because nostalgia
- [ ] **Minesweeper** with difficulty settings
- [ ] **Napster simulator** (I never used Napster, so this might suck)
- [ ] **Image viewer & dedicated images** folder
- [ ] **IE Navigation that works internally** (with questionable innerHTML practices)
- [ ] **Windows XP skin option**

### 🧪 Proof of Concepts & Experimental Features

- [ ] Happy Tuesdays as **an exportable, customizable React component**
- [ ] Background apps (AIM?) that **run persistently**
- [ ] **Basic user accounts & server-side file storage**

## 🎖️ Credits & Shoutouts

_This project wouldn’t be possible without:_

→ **[Packard Belle](https://www.npmjs.com/package/packard-belle)** – for icons and UI elements  
→ **[JS Paint](https://github.com/1j01/jspaint)** – for the legendary Paint clone  
→ **[React95](https://github.com/react95/react95)** – also for UI elements and icons  
→ **[Oldschool PC Fonts](https://int10h.org/oldschool-pc-fonts/fontlist/)** – for the boot screen font  
→ **[CRT Effect](https://codepen.io/lbebber/pen/XJRdrV)** – for the classic monitor glow  
→ **[SkiFree.js](https://basicallydan.github.io/skifree.js/)** – because SkiFree deserves to live on  
→ _And everyone else I forgot_

## 📢 Final Note

Happy Tuesdays is an **ongoing experiment**, mixing old-school computing with modern web tech. Expect **bugs, weird quirks, and plenty of updates.**

Stay tuned...
