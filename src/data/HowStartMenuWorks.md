Last Update: 7/8/25

# How the Start Menu Works

This document explains how the start menu system works in the Hydra98 Windows 98 clone project.

## Overview

The start menu is a hierarchical menu system that displays programs, documents, and system options. It's built using the **packard-belle** library and integrates with the project's program management system.

## Architecture

### 1. Data Structure (`src/data/start.js`)

The start menu data is defined in `src/data/start.js` and exported as `startMenuData`. This file contains:

- **Main menu categories**: Programs, Favorites, Documents, Games, Artifacts
- **Menu items**: Individual applications and options
- **Submenus**: Nested menu structures
- **Icons**: References to icon files
- **Component mappings**: Links to React components

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
  type: "ExternalLink" // For special link types
}
```

### 2. Program Context (`src/contexts/programs.js`)

The `ProgramProvider` class manages the start menu state and integrates it with the program management system:

- **Initializes** the start menu with data from `start.js`
- **Handles** menu item clicks and program launching
- **Manages** program instances and window states
- **Integrates** with the desktop and taskbar

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

## Customization Options

### 1. Modify Menu Data

Edit `src/data/start.js` to:

- Add/remove menu items
- Change icons and titles
- Modify submenu structures
- Add new categories

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

- Some menu items are hidden on mobile
- Touch interactions are handled differently
- Responsive design considerations

## Troubleshooting

### Common Issues

1. **Submenus not appearing** - Check CSS positioning
2. **Menu items not responding** - Verify onClick handlers
3. **Icons not displaying** - Check icon import paths
4. **Mobile issues** - Review mobile-specific logic

### Debugging

- Check browser console for errors
- Inspect CSS classes and positioning
- Verify data structure in `start.js`
- Test hover and click interactions

## File Structure

```
src/
├── data/
│   └── start.js                 # Menu data definition
├── contexts/
│   └── programs.js              # Program management
├── components/
│   └── TaskBar/
│       ├── TaskBar.js           # Main component
│       └── _styles.scss         # Custom styling
└── icons/                       # Icon definitions

node_modules/packard-belle/src/
├── components/
│   ├── TaskBar/                 # Library taskbar
│   ├── StartMenu/               # Library start menu
│   ├── StandardMenu/            # Menu rendering
│   └── StandardMenuHOC/         # Menu logic
└── _scss/w98/
    └── _menu.scss               # Menu styling
```

## Related Components

- **DesktopView** - Desktop icons and context menus
- **WindowManager** - Window management system
- **ProgramProvider** - Program lifecycle management
- **Settings** - System configuration

---

_This document provides a comprehensive overview of the start menu system. For specific implementation details, refer to the individual component files and the packard-belle library documentation._
