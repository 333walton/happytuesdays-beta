# Clippy Balloon Positioning System

## Overview

The Clippy Assistant uses two types of balloons:

- **Custom Balloons** (Speech balloons) - Simple messages and interactive buttons
- **Chat Balloons** - Interactive chat interfaces with input fields

Both balloon types use sophisticated positioning algorithms to ensure optimal placement relative to Clippy and within viewport boundaries.

## Architecture

### Core Files

- `CustomBalloon.js` - Handles speech balloons and interactive message balloons
- `ChatBalloon.js` - Handles interactive chat balloons with resize functionality
- `ClippyPositioning.js` - Provides positioning utilities and viewport detection

### Key Classes

- `CustomBalloonManager` - Singleton for managing speech balloons
- `ChatBalloonManager` - Singleton for managing chat balloons

## Positioning Strategy

### Desktop Positioning

#### Custom Balloons (Speech)

```javascript
// Base dimensions
const balloonWidth = 252; // Reduced from 280 by 10%
const balloonHeight = 108; // Reduced from 120 by 10%
const safeMargin = 18; // Reduced from 20 by 10%
const clippyMargin = 45; // Reduced from 50 by 10%

// Primary position: Above Clippy
let left = clippyRect.left + clippyRect.width / 2 - dynamicWidth / 2;
let top = effectiveTop - balloonHeight - clippyMargin;

// Fallback positions if above doesn't fit:
// 1. Left side: left = clippyRect.left - dynamicWidth - 30
// 2. Right side: left = clippyRect.right + 30
// 3. Top center: left = viewportLeft + (viewportWidth - dynamicWidth) / 2
```

#### Chat Balloons

```javascript
// Base dimensions
const chatWidth = Math.min(
  maxWidth,
  Math.max(minWidth, viewportWidth - safeMargin * 2)
);
const chatHeight = Math.min(
  maxHeight,
  Math.max(minHeight, viewportHeight - 200)
);

// Primary position: Above and centered on Clippy
let left = clippyRect.left + clippyRect.width / 2 - chatWidth / 2;
let top = overlayRect.top - chatHeight - 1; // 1px above overlay

// Enhanced message balloon gets special positioning:
left = clippyRect.left + clippyRect.width / 2 - chatWidth / 2 + 140; // Shift 140px right
top = effectiveTop - chatHeight - (chatMargin + 80); // Move higher above
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

// Constrain to viewport
left = Math.max(
  safeMargin,
  Math.min(left, viewportWidth - balloonWidth - safeMargin)
);

// Fallback positions:
// 1. Side placement if top doesn't fit
// 2. Center screen as last resort
```

#### Chat Balloons

```javascript
// Mobile-specific dimensions
const chatWidth = Math.min(330, viewportWidth - safeMargin * 2); // 10% increase
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

// Applied to all agents: Clippy, Links, Bonzi, Genie, Genius, Merlin, F1
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

  // Mobile: Bottom-anchored resize (bottom stays fixed)
  if (isMobile) {
    const originalBottom = parseInt(container.dataset.originalBottom);
    let newTop = originalBottom - constrainedHeight;

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

## Future Enhancement Areas

1. **Adaptive Positioning**: Balloons could learn user preferences for positioning
2. **Multi-Monitor Support**: Better handling of multi-monitor desktop setups
3. **Accessibility**: Enhanced positioning for screen readers and high contrast modes
4. **Animation Easing**: Smooth position transitions during window resize
5. **Content-Based Sizing**: Dynamic balloon sizing based on content length
6. **Collision Detection**: Advanced algorithm to avoid overlapping with other UI elements

## Testing Considerations

- Test on various screen sizes (320px to 4K+)
- Verify behavior with browser zoom (50% to 500%)
- Test with mobile keyboards (iOS Safari, Chrome, etc.)
- Validate positioning in embedded iframes
- Check behavior during window resize events
- Test with multiple monitor configurations
- Verify accessibility with screen readers
