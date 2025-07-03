# Clippy Balloon Positioning System

## Updated: 7/3/25

## Overview

The Clippy Assistant uses two types of balloons:

- **Custom Balloons** (Speech balloons) - Simple messages and interactive buttons
- **Chat Balloons** - Interactive chat interfaces with input fields

Both balloon types use sophisticated positioning algorithms to ensure optimal placement relative to Clippy and within viewport boundaries.

## Architecture

### Core Files

- `chat/balloons/CustomBalloon.js` - Handles speech balloons and interactive message balloons
- `chat/legacy/ChatBalloon.js` - Handles interactive chat balloons with resize functionality
- `core/ClippyPositioning.js` - Provides positioning utilities and viewport detection

### Key Classes

- `CustomBalloonManager` - Singleton for managing speech balloons
- `ChatBalloonManager` - Singleton for managing chat balloons

## Positioning Strategy

### Desktop Positioning

#### Custom Balloons (Speech)

```javascript
// Base dimensions (10% reduction applied)
const balloonWidth = 252; // Reduced from 280
const balloonHeight = 108; // Reduced from 120
const safeMargin = 18; // Reduced from 20
const clippyMargin = 45; // Reduced from 50

// Primary position: 1px above Clippy overlay
const tailHeight = 12; // Height of ::after pseudo-element
let left = clippyRect.left + clippyRect.width / 2 - dynamicWidth / 2;
let top = overlayRect.top - balloonHeight - tailHeight - 1;

// Fallback positions if above doesn't fit:
// 1. Left side: left = clippyRect.left - dynamicWidth - 30
// 2. Right side: left = clippyRect.right + 30
// 3. Top center: left = viewportLeft + (viewportWidth - dynamicWidth) / 2
```

#### Chat Balloons

```javascript
// Base dimensions (10% increase applied)
const maxWidth = 330; // Increased from 300
const minWidth = 260;
const maxHeight = 200;
const minHeight = 140; // Reduced from 200 to eliminate empty space

// Primary position: 1px above Clippy overlay
let left = clippyRect.left + clippyRect.width / 2 - chatWidth / 2;
let top = overlayRect.top - chatHeight - 1;

// Mobile: Right-aligned
if (isMobile) {
  left = viewportLeft + viewportWidth - chatWidth - 14; // 14px from right edge
}
```

### Mobile Positioning

#### Custom Balloons (Speech)

```javascript
// Responsive dimensions
const balloonWidth = Math.min(260, viewportWidth - 40);
const balloonHeight = 100;
const safeMargin = 15;

// Primary position: Above Clippy, centered
let left = clippyRect.left + clippyRect.width / 2 - balloonWidth / 2;
let top = effectiveClippyTop - balloonHeight - 30;

// Welcome balloon gets special mobile positioning
if (isMobile && isWelcomeBalloon) {
  // Place balloon above and to the right of Clippy's head
  left = rect.left + rect.width * 0.7; // 70% to the right
  top = rect.top - 90; // 90px above Clippy
}
```

#### Chat Balloons

```javascript
// Mobile-specific dimensions
const chatWidth = Math.min(330, viewportWidth - safeMargin * 2);
const chatHeight = Math.min(200, viewportHeight - 150);

// Mobile positioning rules:
// - Right edge: 14px from viewport edge
// - Top: 1px above Clippy overlay
let left = viewportLeft + viewportWidth - chatWidth - 14;
let top = overlayRect.top - chatHeight - 1;

// Keyboard handling (iOS Safari)
if (window.visualViewport?.height < window.innerHeight) {
  // Position at bottom when keyboard open
  top = viewportTop + viewportHeight - chatHeight - safeMargin;
}
```

## Viewport Detection

### Desktop Viewport

```javascript
const getDesktopViewport = () => {
  const desktop =
    document.querySelector(".desktop.screen") ||
    document.querySelector(".desktop") ||
    document.querySelector(".w98");

  if (desktop) {
    const rect = desktop.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    };
  }

  // Fallback to window viewport
  return {
    left: 0,
    top: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
  };
};
```

### Mobile Viewport

```javascript
// Uses window viewport with visual viewport support
if (isMobile) {
  viewportWidth = window.visualViewport?.width || window.innerWidth;
  viewportHeight = window.visualViewport?.height || window.innerHeight;
  viewportLeft = window.visualViewport?.offsetLeft || 0;
  viewportTop = window.visualViewport?.offsetTop || 0;
}
```

## Agent Scale Standardization

### Universal Scale Rules

**All agents now use standardized scales for consistent sizing:**

```javascript
// Universal agent scale configuration
const STANDARD_SCALES = {
  desktop: 0.95, // All agents on desktop
  mobile: 1.0, // All agents on mobile
};

// Applied to all agents: Clippy, Links, Bonzi, Genius, Merlin, F1
const agentScale = isMobile ? 1.0 : 0.95;
```

**Benefits:**

- ✅ Consistent visual appearance across all agents
- ✅ Simplified positioning calculations
- ✅ Uniform balloon positioning offsets
- ✅ Predictable overlay synchronization

## Clippy Detection

### Finding Clippy Elements

```javascript
const clippyEl = document.querySelector(".clippy");
const overlayEl = document.getElementById("clippy-clickable-overlay");

// Use overlay rect for more accurate positioning
const clippyRect = clippyEl.getBoundingClientRect();
const overlayRect = overlayEl ? overlayEl.getBoundingClientRect() : clippyRect;

// Calculate effective height (max of both elements)
const effectiveClippyHeight = Math.max(clippyRect.height, overlayRect.height);
const effectiveTop = Math.min(clippyRect.top, overlayRect.top);
```

## Boundary Constraints

### Horizontal Constraints

```javascript
// Desktop
left = Math.max(
  viewportLeft + safeMargin,
  Math.min(left, viewportLeft + viewportWidth - balloonWidth - safeMargin)
);

// Mobile (tighter margins)
left = Math.max(
  safeMargin,
  Math.min(left, viewportWidth - balloonWidth - safeMargin)
);
```

### Vertical Constraints

```javascript
// Prevent balloons from going above viewport
if (top < viewportTop + safeMargin) {
  // Try side placement
  top = effectiveTop + 10;
  left = clippyRect.left - balloonWidth - 30; // Left side

  if (left < viewportLeft + safeMargin) {
    left = clippyRect.right + 30; // Right side

    if (left + balloonWidth > viewportRight - safeMargin) {
      // Last resort: top center
      left = viewportLeft + (viewportWidth - balloonWidth) / 2;
      top = viewportTop + safeMargin;
    }
  }
}
```

## Dynamic Repositioning

### Resize Event Handling

```javascript
// Both balloon types support dynamic repositioning
this._addDynamicRepositioning = (options) => {
  this._resizeHandler = () => {
    if (!this.currentBalloon) return;
    const position = this.calculatePosition(options?.position);
    this.currentBalloon.style.setProperty(
      "left",
      `${position.left}px`,
      "important"
    );
    this.currentBalloon.style.setProperty(
      "top",
      `${position.top}px`,
      "important"
    );
  };

  window.addEventListener("resize", this._resizeHandler);
  window.addEventListener("clippyRepositioned", this._resizeHandler);
};
```

### Mobile Keyboard Handling

```javascript
// Visual viewport resize handler for mobile keyboard
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    if (this.currentChatBalloon) {
      const position = this.calculatePosition();
      this.currentChatBalloon.style.left = `${position.left}px`;
      this.currentChatBalloon.style.top = `${position.top}px`;
    }
  });
}
```

## Chat Balloon Resizing

### Vertical Resize System

```javascript
// Chat balloons support vertical resizing
const startResize = (e) => {
  const currentY = e.clientY || e.touches[0].clientY;
  const deltaY = startY - currentY; // Positive when dragging up

  // Bottom-anchored resize (bottom stays fixed)
  const overlayEl = document.getElementById("clippy-clickable-overlay");
  if (overlayEl) {
    const overlayRect = overlayEl.getBoundingClientRect();
    const fixedBottom = overlayRect.top - 1; // Always 1px above Clippy
    let newTop = fixedBottom - constrainedHeight;

    // Prevent viewport boundary violations
    if (newTop < minTop) {
      return; // Stop resize to prevent bottom shift
    }
  }
};
```

## Platform-Specific Behaviors

### iOS Safari Optimizations

```javascript
// iOS Safari text rendering fixes
color: #000000 !important;
-webkit-text-fill-color: #000000 !important;

// Touch optimizations
touch-action: manipulation !important;
-webkit-tap-highlight-color: transparent !important;
-webkit-touch-callout: none !important;
```

### Mobile Input Handling

```javascript
// Prevent iOS zoom on input focus
.chat-input {
  font-size: 16px !important; /* Prevents iOS zoom */
  min-height: 28px !important;
}
```

## Balloon Coordination

### Mutual Exclusion

```javascript
// Only one balloon type can be open at a time
const existingBalloons = document.querySelectorAll(
  ".custom-clippy-balloon, .custom-clippy-chat-balloon"
);

if (existingBalloons.length > 0) {
  console.log("Balloon creation blocked - another balloon is already open");
  return false;
}
```

### Z-Index Management

```javascript
// Balloon z-index hierarchy
.custom-clippy-balloon,
.custom-clippy-chat-balloon {
  z-index: 9999 !important; // Above all other content
}

// Context menus get highest priority
.clippy-context-menu {
  z-index: 2147483647 !important; // Maximum z-index
}
```

## Special Positioning Cases

### Welcome Balloon

The welcome balloon receives special positioning on mobile to ensure visibility:

```javascript
if (isMobile) {
  const clippyEl = document.querySelector(".clippy");
  if (clippyEl) {
    const rect = clippyEl.getBoundingClientRect();
    // Place balloon above and to the right of Clippy's head
    mobilePosition = {
      left: rect.left + rect.width * 0.7, // 70% to the right of Clippy
      top: rect.top - 90, // 90px above Clippy
    };
  }
}
```

### Agent Change Positioning

When switching agents, balloons wait for the new agent to stabilize:

```javascript
// Wait for overlay to stabilize after agent changes
await this.waitForStableOverlay(800);

// Different agents have different heights
const checkStability = () => {
  const currentHeight = overlayEl.getBoundingClientRect().height;
  if (Math.abs(currentHeight - lastHeight) < 1) {
    stableCount++;
    if (stableCount >= requiredStableCount) {
      resolve(true); // Agent has stabilized
    }
  }
};
```

## Error Handling

### Safe Positioning

```javascript
const safeExecute = (action, fallbackReturn = false) => {
  try {
    if (typeof window === "undefined") return fallbackReturn;
    return action();
  } catch (error) {
    console.error("Balloon positioning error:", error);
    return fallbackReturn;
  }
};
```

### Fallback Positioning

```javascript
// If all positioning fails, use safe defaults
return {
  left: viewportLeft + (viewportWidth - balloonWidth) / 2,
  top: viewportTop + safeMargin,
  maxWidth: viewportWidth - safeMargin * 2,
};
```

## Configuration Constants

### Sizing Constants

```javascript
// Custom Balloon (10% reduction applied)
const CUSTOM_BALLOON = {
  width: 252, // was 280
  height: 108, // was 120
  safeMargin: 18, // was 20
  clippyMargin: 45, // was 50
  tailHeight: 12, // Height of ::after pseudo-element
};

// Chat Balloon (10% increase applied)
const CHAT_BALLOON = {
  maxWidth: 330, // was 300
  minWidth: 260,
  maxHeight: 200,
  minHeight: 140, // was 200, reduced to eliminate empty space
};
```

### Mobile Specific

```javascript
const MOBILE_CONFIG = {
  rightEdgeGap: 14, // Fixed distance from right edge
  keyboardMargin: 100, // Space when keyboard is open
  touchExpansion: 30, // Extended touch area
  bottomGap: 1, // 1px above Clippy overlay
};
```

## Positioning Priority

1. **Primary**: 1px above Clippy overlay (both balloon types)
2. **Fallback 1**: Left side of Clippy
3. **Fallback 2**: Right side of Clippy
4. **Fallback 3**: Top center of viewport

## Performance Considerations

- Position calculations are cached during resize operations
- RequestAnimationFrame used for smooth repositioning
- DOM operations minimized by using direct style manipulation
- Balloon reuse instead of recreation where possible

## Testing Balloon Positioning

```javascript
// Test balloon positioning at different viewport sizes
const testPositions = () => {
  // Test speech balloon
  window.showClippyCustomBalloon("Test speech balloon");

  // Test chat balloon
  setTimeout(() => {
    window.showClippyChatBalloon("Test chat balloon");
  }, 2000);

  // Test with window resize
  setTimeout(() => {
    window.dispatchEvent(new Event("resize"));
  }, 3000);
};

// Validate balloon position
const validateBalloonPosition = () => {
  const balloon = document.querySelector(
    ".custom-clippy-balloon, .custom-clippy-chat-balloon"
  );
  const clippy = document.querySelector(".clippy");

  if (balloon && clippy) {
    const balloonRect = balloon.getBoundingClientRect();
    const clippyRect = clippy.getBoundingClientRect();

    console.log("Balloon bottom:", balloonRect.bottom);
    console.log("Clippy top:", clippyRect.top);
    console.log("Gap:", clippyRect.top - balloonRect.bottom);
  }
};
```

## Future Enhancement Areas

1. **Smart Positioning**: Learn from user preferences and adjust default positions
2. **Multi-Balloon Support**: Allow multiple balloons with intelligent stacking
3. **Animation Transitions**: Smooth transitions when repositioning
4. **Collision Detection**: Avoid overlapping with other UI elements
5. **Responsive Sizing**: Dynamic balloon sizing based on content length
6. **Accessibility**: Enhanced positioning for screen readers and high contrast modes
