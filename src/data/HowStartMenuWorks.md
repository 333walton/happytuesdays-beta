Last Update: 12/19/24

# How the Start Menu Works

This document explains how the start menu system works in the Hydra98 Windows 98 clone project.

## Overview

The start menu is a hierarchical menu system that displays programs, documents, and system options. It's built using the **packard-belle** library and integrates with the project's program management system. The menu features dynamic AI assistant selection, categorized tools, and a comprehensive file system integration.

## Current Start Menu Structure

### Main Menu Categories

```
┌─ Start Menu ──────────────────────────────────┐
│ Programs                                      │
│ Favorites                                     │
│ Tools                                         │
│ Documents                                     │
│ Games                                         │
│ Artifacts                                     │
└───────────────────────────────────────────────┘
```

### Detailed Menu Wireframe

```
┌─ Start Menu ──────────────────────────────────┐
│ ┌─ Programs ─────────────────────────────────┐ │
│ │ ┌─ AI Assistants ─────────────────────────┐ │ │
│ │ │ ✓ Clippy GPT (Site Guide)              │ │ │
│ │ │   F1 GPT (Tech Workshop)               │ │ │
│ │ │   Genius GPT (Motivation Station)      │ │ │
│ │ │   Merlin GPT (Art Gallery)             │ │ │
│ │ │   Bonzi GPT (Gaming Hub)               │ │ │
│ │ │ What Are These?                        │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │ ┌─ Accessories ───────────────────────────┐ │ │
│ │ │ Calculator                             │ │ │
│ │ │ Notepad                                │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │ ┌─ Online Services ───────────────────────┐ │ │
│ │ │ AOL (disabled)                         │ │ │
│ │ │ Outlook98 (soon)                       │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │ ┌─ Entertainment ─────────────────────────┐ │ │
│ │ │ Movie Player                           │ │ │
│ │ │ Music Player                           │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │ Internet Explorer                         │ │
│ └────────────────────────────────────────────┘ │
│ ┌─ Favorites ────────────────────────────────┐ │
│ │ ┌─ My Favorites ─────────────────────────┐ │ │
│ │ │ Start Menu Builder™ (disabled)         │ │ │
│ │ │ Chat Bot Preferences (disabled)        │ │ │
│ │ │ Newsletter Preferences (disabled)      │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │ ┌─ Community Favorites ───────────────────┐ │ │
│ │ │ (empty)                                │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────┘ │
│ ┌─ Tools ─────────────────────────────────────┐ │
│ │ ┌─ News Feeds ────────────────────────────┐ │ │
│ │ │ Tech Feed (disabled)                   │ │ │
│ │ │ Builders Feed (disabled)               │ │ │
│ │ │ Art/Design Feed (disabled)             │ │ │
│ │ │ Gaming Feed (disabled)                 │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │ ┌─ Creative Tools ────────────────────────┐ │ │
│ │ │ SVG Trace (disabled)                   │ │ │
│ │ │ Pixel Doodles                          │ │ │
│ │ │ Paint Doodles                          │ │ │
│ │ │ ─────────────────────────────────────── │ │
│ │ │ View Catalogue                          │ │ │
│ │ │ Native Tools                            │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │ ┌─ Marketing Tools ───────────────────────┐ │ │
│ │ │ UTM Tracker                             │ │ │
│ │ │ Pre-roll Toolkit                        │ │ │
│ │ │ Newsletter Prompt (disabled)            │ │ │
│ │ │ ─────────────────────────────────────── │ │
│ │ │ View Catalogue                          │ │ │
│ │ │ Native Tools                            │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │ ┌─ Builder Tools ─────────────────────────┐ │ │
│ │ │ Project Management (disabled)           │ │ │
│ │ │ Open Router Ranks (disabled)            │ │ │
│ │ │ Should I automate it? (disabled)        │ │ │
│ │ │ ─────────────────────────────────────── │ │
│ │ │ View Catalogue                          │ │ │
│ │ │ Native Tools                            │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │ ┌─ Art/Design Tools ──────────────────────┐ │ │
│ │ │ Art Gallery Finder (disabled)           │ │ │
│ │ │ ASCII Banners                           │ │ │
│ │ │ Design Trends Tracker (disabled)        │ │ │
│ │ │ ─────────────────────────────────────── │ │
│ │ │ View Catalogue                          │ │ │
│ │ │ Native Tools                            │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────┘ │
│ ┌─ Documents ─────────────────────────────────┐ │
│ │ ┌─ My Docs ───────────────────────────────┐ │ │
│ │ │ My Videos                               │ │ │
│ │ │ My Music                                │ │ │
│ │ │ My Notes                                │ │ │
│ │ │ Saved Games                             │ │ │
│ │ │ View All                                │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │ ┌─ Tech Docs ─────────────────────────────┐ │ │
│ │ │ APIs                                    │ │ │
│ │ │ Trend Reports                           │ │ │
│ │ │ View All                                │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │ ┌─ Builder Docs ──────────────────────────┐ │ │
│ │ │ Motivation                              │ │ │
│ │ │ Resources                               │ │ │
│ │ │ View All                                │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │ ┌─ Art/Design Docs ───────────────────────┐ │ │
│ │ │ Color Theory                            │ │ │
│ │ │ Typography                              │ │ │
│ │ │ View All                                │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────┘ │
│ ┌─ Games ─────────────────────────────────────┐ │
│ │ ┌─ DOS Games ─────────────────────────────┐ │ │
│ │ │ DOOM                                    │ │ │
│ │ │ DOS Mods (disabled)                     │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │ ┌─ Classic Games ─────────────────────────┐ │ │
│ │ │ Minesweeper                             │ │ │
│ │ │ Minesweeper2                            │ │ │
│ │ │ Solitaire (disabled)                    │ │ │
│ │ │ Space Cadet Pinball (disabled)          │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │ ┌─ Misc. ─────────────────────────────────┐ │ │
│ │ │ ASCII Maze                              │ │ │
│ │ │ GliderPro (desktop only)                │ │ │
│ │ │ Retro City (disabled)                   │ │ │
│ │ │ Rampage World Tour (disabled)           │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────┘ │
│ ┌─ Artifacts ─────────────────────────────────┐ │
│ │ ┌─ Gallery ───────────────────────────────┐ │ │
│ │ │ What is this? (disabled)                │ │ │
│ │ │ Main Gallery (disabled)                 │ │ │
│ │ │ Community Gallery (disabled)            │ │ │
│ │ │ Submit Your Art                         │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │ ┌─ Interactive ───────────────────────────┐ │ │
│ │ │ WebGL Experiments                       │ │ │
│ │ │ ASCII Art                               │ │ │
│ │ │ View All                                │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │ ┌─ Animated ──────────────────────────────┐ │ │
│ │ │ Pixel Art                              │ │ │
│ │ │ Demoscenes                             │ │ │
│ │ │ View All                               │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │ ┌─ Still Frames ──────────────────────────┐ │ │
│ │ │ Pixel Art                              │ │ │
│ │ │ ASCII Art                              │ │ │
│ │ │ 3D Rendered                            │ │ │
│ │ │ View All                               │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────┘ │
│ ┌─ System ────────────────────────────────────┐ │
│ │ Settings                                   │ │
│ │ Sign Up / Sign In (disabled)               │ │
│ │ Shut Down...                               │ │
│ └────────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

## Architecture

### 1. Data Structure (`src/data/start.js`)

The start menu data is defined in `src/data/start.js` and exported as `getStartMenuData()`. This file contains:

- **Dynamic AI Assistant Management**: Real-time agent switching with checkmarks
- **Main menu categories**: Programs, Favorites, Tools, Documents, Games, Artifacts
- **Menu items**: Individual applications and options
- **Submenus**: Nested menu structures with dividers
- **Icons**: References to icon files from `src/icons/`
- **Component mappings**: Links to React components
- **Mobile detection**: Conditional menu items based on device type

#### Menu Item Structure

```javascript
{
  title: "Calculator",
  icon: icons.calculator16,
  component: "Calculator",
  multiInstance: true,
  isDisabled: false,
  options: [], // For submenus
  data: {}, // Additional data for components
  href: "", // For external links
  type: "ExternalLink", // For special link types
  onClick: () => {}, // Custom click handlers
  tooltip: "Description" // Tooltip text
}
```

#### AI Assistant Integration

The menu includes dynamic AI assistant selection with real-time state management:

```javascript
const createAIAssistants = () => {
  const currentAgent = getCurrentAgent();

  const selectAgent = (agentName) => () => {
    window.currentAgent = agentName;
    if (window.onAgentChange) window.onAgentChange(agentName);
    window.dispatchEvent(new Event("agentChanged"));
  };

  return [
    {
      title: currentAgent === "Clippy" ? "✓ Clippy GPT" : "Clippy GPT",
      tooltip: "Site Guide",
      icon: icons.vid16,
      onClick: selectAgent("Clippy"),
    },
    // ... other agents
  ];
};
```

### 2. Program Context (`src/contexts/programs.js`)

The `ProgramProvider` class manages the start menu state and integrates it with the program management system:

- **Initializes** the start menu with data from `start.js`
- **Handles** menu item clicks and program launching
- **Manages** program instances and window states
- **Integrates** with the desktop and taskbar
- **Refreshes** menu on agent changes
- **Manages** quick launch buttons and open windows

#### Key Methods

```javascript
class ProgramProvider extends Component {
  refreshStartMenu = () => {
    // Refreshes menu when AI agent changes
  };

  open = (program) => {
    // Opens programs and manages window states
  };

  close = (program) => {
    // Closes programs and updates state
  };
}
```

### 3. TaskBar Component (`src/components/TaskBar/TaskBar.js`)

The TaskBar component renders the start menu using the packard-belle library:

```javascript
import { TaskBar as TaskBarComponent } from "packard-belle";

<TaskBarComponent
  options={context.startMenu}
  quickLaunch={context.quickLaunch}
  openWindows={context.openOrder}
/>;
```

#### Custom Features

- **Clippy Integration**: Custom tooltip and button handling
- **RSS Icon**: Added to notification area
- **Mobile Controls**: Responsive design considerations
- **Custom Styling**: Windows 98 button styling

## Packard-Belle Library Components

The start menu rendering is handled by the **packard-belle** library with these key components:

### 1. TaskBar (`packard-belle/src/components/TaskBar/TaskBar.jsx`)

- Contains the StartMenu component
- Manages quick launch buttons and open windows
- Integrates with the overall taskbar layout

### 2. StartMenu (`packard-belle/src/components/StartMenu/StartMenu.jsx`)

- Wraps ButtonStart with StandardMenuHOC
- Provides the main menu container

### 3. StandardMenuHOC (`packard-belle/src/components/StandardMenuHOC/StandardMenuHOC.jsx`)

- **Handles menu state management**
- **Manages hover interactions**
- **Controls menu opening/closing**
- **Handles blur events for menu dismissal**

### 4. StandardMenu (`packard-belle/src/components/StandardMenu/StandardMenu.jsx`)

- **Renders the actual menu items**
- **Processes menu data structure**
- **Handles dividers and grouping**

### 5. StandardMenuItem (`packard-belle/src/components/StandardMenu/StandardMenuItem.jsx`)

- **Renders individual menu items**
- **Handles submenu rendering**
- **Manages hover states and interactions**

## Submenu Positioning

Submenu positioning is controlled by CSS in `packard-belle/src/_scss/w98/_menu.scss`:

### Default Behavior

- Submenus appear to the **right** of parent items
- Positioned with `left: calc(100% - 3px)` and `top: -$windowPadding`
- Use CSS transitions for smooth appearance

### Positioning Options

The `@mixin onDisplay` function supports four directions:

- **Right** (default): `left: calc(100% - 3px)`
- **Left**: `left: -100%`
- **Top**: `bottom: calc(100% + $windowPadding)`
- **Bottom**: `top: calc(100% + $windowPadding)`

### CSS Classes

- `.StandardMenu` - Main menu container
- `.StandardMenuItem` - Individual menu items
- `.StandardMenuItem__child` - Submenu containers
- `.StandardMenuItem__button` - Menu item buttons

## Menu Interactions

### Hover Behavior

- Menu items highlight on hover
- Submenus appear automatically on hover
- Active states are managed by the StandardMenuHOC

### Click Handling

- Menu items without submenus trigger `onClick` handlers
- Submenu items don't trigger clicks (they expand on hover)
- External links open in new tabs with confirmation
- AI assistant selection updates global state

### Blur Handling

- Menus close when clicking outside
- Document-level event listeners manage dismissal
- State is reset when menus close

## Data Flow

1. **Data Definition** → `src/data/start.js`
2. **Context Integration** → `src/contexts/programs.js`
3. **Component Rendering** → `src/components/TaskBar/TaskBar.js`
4. **Library Processing** → packard-belle components
5. **User Interaction** → Event handlers and state updates

## Available Applications

The start menu integrates with these applications (from `src/components/Applications.js`):

### Core Applications

- **ExplorerWindow** - File system explorer
- **Calculator** - Windows 98 calculator
- **Notepad** - Text editor
- **InternetExplorer** - Web browser
- **TestExplorer** - Alternative browser

### Games

- **Doom** - Classic DOOM game
- **Minesweeper** - Classic minesweeper
- **MinesweeperWithHelp** - Minesweeper with help
- **ASCIIMaze** - ASCII maze game
- **Glider** - GliderPro game (desktop only)

### Creative Tools

- **ASCIIText** - ASCII banner generator
- **DoodleSubmission** - Art submission tool
- **VideoPlayer** - Video player
- **MusicPlayer** - Music player
- **W95MediaPlayer** - Windows 95 style media player

### Development Tools

- **JSDos** - DOS emulator
- **GraphExplorer** - Codebase explorer (dev only)
- **UTMTool** - UTM tracking tool

### Special Components

- **ClippyAssistant** - AI assistant system
- **HamsterCreator** - Hamster creation tool
- **MonitorView** - Monitor display component
- **StartMessage** - Welcome message

## Customization Options

### 1. Modify Menu Data

Edit `src/data/start.js` to:

- Add/remove menu items
- Change icons and titles
- Modify submenu structures
- Add new categories
- Implement dynamic content

### 2. Override CSS Styling

Create custom CSS to:

- Adjust submenu positioning
- Modify colors and appearance
- Change hover behaviors
- Customize transitions

### 3. Extend Functionality

Modify the TaskBar component to:

- Add custom menu behaviors
- Integrate with additional systems
- Override default interactions

## Mobile Considerations

The start menu includes mobile-specific logic:

```javascript
const isMobile = () =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
```

- Some menu items are hidden on mobile (e.g., GliderPro)
- Touch interactions are handled differently
- Responsive design considerations
- Mobile-specific window management

## Troubleshooting

### Common Issues

1. **Submenus not appearing** - Check CSS positioning
2. **Menu items not responding** - Verify onClick handlers
3. **Icons not displaying** - Check icon import paths
4. **Mobile issues** - Review mobile-specific logic
5. **AI assistant not switching** - Check agent change event handlers

### Debugging

- Check browser console for errors
- Inspect CSS classes and positioning
- Verify data structure in `start.js`
- Test hover and click interactions
- Monitor agent change events

## Complete File Structure

```
src/
├── data/
│   ├── start.js                    # Menu data definition
│   ├── desktop.js                  # Desktop icons data
│   └── textFiles/                  # Text content for menu items
│       └── clippyFaq.js           # AI assistant FAQ
├── contexts/
│   ├── programs.js                 # Program management
│   ├── settings.js                 # Settings management
│   └── index.js                    # Context exports
├── components/
│   ├── TaskBar/
│   │   ├── TaskBar.js              # Main taskbar component
│   │   ├── _styles.scss            # Custom styling
│   │   ├── index.js                # Component export
│   │   └── TaskBar.stories.js      # Storybook stories
│   ├── Applications.js             # All application exports
│   ├── DesktopView/                # Desktop view component
│   ├── WindowManager/              # Window management
│   ├── Settings/                   # Settings component
│   ├── TaskManager/                # Task manager component
│   ├── ShutDown/                   # Shutdown component
│   └── [Individual App Components] # All application components
├── icons/                          # Icon definitions
│   ├── index.js                    # Icon exports
│   └── icons.scss                  # Icon styles
├── helpers/
│   └── menuBuilder.js              # Menu building utilities
└── utils/
    └── isMobileDevice.js           # Mobile detection utility

node_modules/packard-belle/src/
├── components/
│   ├── TaskBar/                    # Library taskbar
│   ├── StartMenu/                  # Library start menu
│   ├── StandardMenu/               # Menu rendering
│   └── StandardMenuHOC/            # Menu logic
└── _scss/w98/
    └── _menu.scss                  # Menu styling
```

## Related Components

- **DesktopView** - Desktop icons and context menus
- **WindowManager** - Window management system
- **ProgramProvider** - Program lifecycle management
- **Settings** - System configuration
- **ClippyAssistant** - AI assistant integration
- **TaskManager** - Process management
- **ShutDown** - System shutdown dialog

## Key Features

### AI Assistant Integration

- Dynamic agent switching with visual feedback
- Real-time menu updates on agent changes
- Global state management for current agent
- Event-driven architecture for agent changes

### File System Integration

- Virtual file system with CuboneFileExplorer
- Organized document structure
- Tool categorization with catalogues
- Native and third-party tool separation

### Mobile Responsiveness

- Conditional menu items based on device type
- Touch-friendly interactions
- Responsive window management
- Mobile-specific styling

### Extensibility

- Modular component architecture
- Easy addition of new applications
- Configurable menu structure
- Custom styling support

---

_This document provides a comprehensive overview of the start menu system. For specific implementation details, refer to the individual component files and the packard-belle library documentation._

## Customizing Individual Submenu Positioning

### Overview

You can now precisely control the positioning of any individual submenu in the Start Menu (or any other menu) by assigning a custom class to the relevant menu item in your menu data and targeting it with CSS. This approach is robust, maintainable, and does not require editing any node_modules or library code.

### Step-by-Step Example: Aligning Tools Submenus to the Bottom

Suppose you want the submenus for "Creative Tools", "Marketing Tools", "Builder Tools", and "Art/Design Tools" (all under the Tools menu) to align their bottom edge with the bottom of the Tools menu, rather than the default top alignment.

#### 1. Assign a Custom Class in the Menu Data

In your `src/data/start.js`, add a unique `className` property to each relevant menu item:

```js
const tools = [
  {
    title: "Creative Tools",
    icon: icons.folder16,
    options: creativeTools,
    className: "submenu-align-bottom-creative",
  },
  {
    title: "Marketing Tools",
    icon: icons.folder16,
    options: marketingTools,
    className: "submenu-align-bottom-marketing",
  },
  {
    title: "Builder Tools",
    icon: icons.folder16,
    options: builderTools,
    className: "submenu-align-bottom-builder",
  },
  {
    title: "Art/Design Tools",
    icon: icons.folder16,
    options: artDesignTools,
    className: "submenu-align-bottom-artdesign",
  },
  // ... other items ...
];
```

#### 2. Add Targeted CSS for Each Submenu

In your `src/App.css`, add rules to:

- Remove `position: relative` from the parent menu item (so the submenu aligns to the Tools menu container)
- Set the submenu frame to align its bottom edge

```css
/* Remove position: relative for these specific menu items */
.submenu-align-bottom-creative,
.submenu-align-bottom-marketing,
.submenu-align-bottom-builder,
.submenu-align-bottom-artdesign {
  position: static !important;
}

/* Align the submenu frame for each */
.submenu-align-bottom-creative > .Frame.StandardMenu.StandardMenuItem__child,
.submenu-align-bottom-marketing > .Frame.StandardMenu.StandardMenuItem__child,
.submenu-align-bottom-builder > .Frame.StandardMenu.StandardMenuItem__child,
.submenu-align-bottom-artdesign > .Frame.StandardMenu.StandardMenuItem__child {
  top: auto !important;
  bottom: 0 !important;
  left: calc(100% - 3px) !important;
}
```

#### 3. Test and Adjust

- Reload your app and open the relevant submenus.
- The bottom edge of each targeted submenu should now align with the bottom of the parent menu (e.g., the Tools menu).
- You can use this pattern for any other submenu by assigning a unique class and targeting it in your CSS.

### Why This Works

- The custom class is only applied to the specific parent menu item you want to affect.
- The submenu container is always a direct child, so the selector is robust and easy to maintain.
- No fragile attribute selectors or browser compatibility issues.

### General Pattern for Custom Submenu Positioning

1. **Assign a unique `className` to the menu item in your menu data.**
2. **Target the parent and/or submenu container in your CSS using that class.**
3. **Adjust positioning, styling, or behavior as needed.**

---

_This method allows for precise, maintainable customization of any submenu in the Start Menu or elsewhere in your app._
