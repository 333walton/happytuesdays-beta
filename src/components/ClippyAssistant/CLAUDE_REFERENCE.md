# ClippyAssistant - Claude Reference

Reference guide for working with Claude on the ClippyAssistant component folder.

## 📝 Git Commit Messages & Reference Updates

**Always request 3 commit message variations:**

```
Please provide 3 git commit message variations:
- Simple: [brief, basic description]
- Concise: [technical, precise wording]
- Bug-fix focused: [emphasizes problem solved]
```

**Keep this reference updated by adding:**

```
Update the CLAUDE_REFERENCE.md and howclippyworks.txt with any new patterns from this change.
Also provide 3 git commit variations: simple, concise, and bug-fix focused.
```

### Testing & Verification

```
Run updated tests to verify real-time resize handling:
- console-test-runner.js - Tests real-time resize positioning performance
- performanceTest.js - Tests ClippyPositioning system performance
- verification-test.js - Verifies all centralized system methods

All tests now validate:
- Real-time resize event handling (no throttling)
- Anchored positioning accuracy during window resize
- Position stability (no drift during active resize)
- CSS performance optimizations for real-time updates
- Mobile/desktop positioning calculations
- Synchronized overlay positioning
```

## 🎯 ClippyAssistant Component Rules

### Positioning System

- **ALL positioning logic** goes in `ClippyPositioning.js` (single source of truth)
- **Mobile**: `bottom: 120px, right: 11px` with responsive calculations
- **Desktop**: Anchored to desktop viewport with percentage-based scaling
- **Real-time resize**: Uses `requestAnimationFrame` monitoring for instant updates
- **Never** add positioning logic to CSS or other JS files

### Real-time Resize Handling

- **No throttling/debouncing** - updates happen every frame during resize
- **Anchored positioning** - Clippy stays locked to desktop viewport percentage
- **CSS optimizations** - All transitions removed during resize for instant updates
- **Performance monitoring** - Real-time drift detection and performance metrics

### File Structure

- `ClippyPositioning.js` - All positioning calculations + real-time resize handling
- `ClippyProvider.js` - Main state management and global functions
- `ClippyService.js` - API for external components
- `ClippyAssistant.js` - UI component
- Custom balloons and utilities in separate files

### Key Principles

- Mobile-first development
- Real-time visual stability during window resize
- Crash resistance (always include error handling)
- Performance optimization (especially mobile)
- Centralized logic to avoid scattered code

---

## 🔧 Common Error Fixes

### ✅ Real-time Resize Drift (LATEST FIX)

**Issue:** Clippy drifts toward bottom-right during active window resizing, only snaps back when resize stops.

**Root Cause:** Throttled/debounced resize events caused delayed position updates during active resize.

**Solution Applied:**

```javascript
// ❌ Before: Throttled resize handling
handleResize() {
  if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
  this.resizeTimeout = setTimeout(() => {
    this.notifyListeners("resize", data);
  }, isMobile ? 150 : 100); // Delayed updates
}

// ✅ After: Real-time monitoring with requestAnimationFrame
checkForResize() {
  const currentWidth = window.innerWidth;
  const currentHeight = window.innerHeight;

  if (currentWidth !== this.lastWidth || currentHeight !== this.lastHeight) {
    // Immediate notification for real-time updates
    this.notifyListeners("realtime-resize", data);
    this.lastWidth = currentWidth;
    this.lastHeight = currentHeight;
  }

  this.animationFrameId = requestAnimationFrame(this.checkForResize);
}
```

**Key Changes:**

- Replaced throttled setTimeout with requestAnimationFrame loop
- Added percentage-based anchor positioning for better scaling
- Removed all CSS transitions during resize for instant visual updates
- Added `clippy-anchored` CSS class for performance optimizations

### ✅ CSS Performance Optimizations (LATEST)

**Applied optimizations for real-time resize:**

```scss
// Remove all transitions during resize
.clippy {
  transition: none !important;
}

// Special anchored state for maximum performance
.clippy.clippy-anchored {
  transform-style: preserve-3d !important;
  contain: layout style paint !important;
  isolation: isolate !important;
  transition: none !important;
  animation: none !important;
}
```

### ✅ React Hook Dependency Warnings (FIXED)

**Issues Fixed:**

- Missing dependencies in useEffect arrays
- Ref cleanup timing warnings
- tapTimeoutRef access violations

**Solutions Applied:**

```javascript
// ❌ Before: Missing dependencies
useEffect(() => {
  // Uses clippyInstanceRef, overlayRef, tapTimeoutRef
}, [clippy, visible]);

// ✅ After: Complete dependencies
useEffect(() => {
  const currentTapTimeout = tapTimeoutRef.current; // Copy ref value

  return () => {
    if (currentTapTimeout) {
      // Use copied value
      clearTimeout(currentTapTimeout);
    }
  };
}, [clippy, visible, clippyInstanceRef, overlayRef, tapTimeoutRef]);
```

### ✅ Test File Syntax Errors (FIXED)

**Issues Fixed:**

- Undefined variables in test files
- Missing variable declarations
- Browser API availability checks
- Duplicate code sections

**Solutions Applied:**

```javascript
// ❌ Before: Undefined variables
if (hasValidPosition) passedTests++; // Error

// ✅ After: Proper declarations
let hasValidPosition = false;
let overlayPosition = null;
let animationSuccess = false;
// Then use them safely
```

---

## 📱 Mobile Requirements

### Always ensure:

- Touch targets ≥ 44px (iOS standard)
- iOS Safari compatibility
- Touch event handling with `{ passive: false }`
- Hardware acceleration for smooth performance
- Proper z-index hierarchy
- Real-time responsive positioning during orientation changes

### Testing checklist:

- [ ] iOS Safari interaction works
- [ ] Android Chrome interaction works
- [ ] Balloons stay within viewport
- [ ] No crashes on mobile devices
- [ ] Real-time resize handling works smoothly
- [ ] Position remains stable during window resize
- [ ] Test files run without syntax errors
- [ ] React Hook warnings resolved

---

## 🔧 Common Commands

### Real-time Resize Issues

```
Fix Clippy drifting during window resize by implementing real-time positioning:
- Replace throttled resize events with requestAnimationFrame monitoring
- Use percentage-based anchor positioning for better scaling
- Remove CSS transitions during resize for instant visual updates
- Add performance optimizations for smooth real-time updates
```

### Positioning Changes

```
Update ClippyPositioning.js to change [mobile/desktop] position to [values].
Ensure real-time resize handling maintains position stability.
Verify balloons and overlays remain synchronized during resize.
```

### Mobile Optimization

```
Make this mobile-friendly with:
- Larger touch targets
- iOS Safari compatibility
- Performance optimization
- Proper viewport handling
- Real-time responsive positioning
```

### Error Handling

```
Add crash-resistant error handling with:
- Try-catch blocks
- Safe DOM queries
- Cleanup on unmount
- Emergency reset functions
```

### Test File Fixes

```
Fix test file syntax errors:
- Declare all variables with let/const
- Add try-catch around error-prone operations
- Use proper window object checks for browser APIs
- Remove duplicate code sections
- Add real-time resize testing
```

### React Hook Fixes

```
Fix React Hook warnings:
- Add missing dependencies to useEffect arrays
- Copy ref.current values to variables before cleanup
- Include all referenced variables in dependency arrays
```

---

## 🚨 Critical Don'ts

- ❌ Don't add positioning CSS (use ClippyPositioning.js)
- ❌ Don't create multiple RAF loops
- ❌ Don't forget mobile touch event handling
- ❌ Don't skip error handling in DOM operations
- ❌ Don't position balloons without viewport checks
- ❌ Don't use undeclared variables in test files
- ❌ Don't ignore React Hook dependency warnings
- ❌ Don't use browser-only APIs without checking availability
- ❌ **NEW:** Don't throttle/debounce resize events for positioning updates
- ❌ **NEW:** Don't add CSS transitions that interfere with real-time positioning
- ❌ **NEW:** Don't use static pixel positioning for desktop - use percentage-based anchoring

---

## 🏗️ Component Architecture

### ClippyProvider Pattern

```
State Management → Global Functions → Component Controller → DOM Manipulation → Real-time Resize Monitoring
```

### Real-time Positioning Flow

```
Window Resize → requestAnimationFrame Monitor → Immediate Position Update → Synchronized Overlay → Visual Stability
```

### Positioning Flow

```
ClippyPositioning.js → Calculate Anchored Position → Apply to Element → Update Overlay → Position Balloons → Monitor Resize
```

### Error Recovery

```
Standard Error → Emergency Reset → Nuclear Reset → Page Refresh
```

### Test File Structure

```
Core Systems Check → Real-time Resize Tests → Position Stability Tests → Performance Tests → Summary
```

---

## 📋 Quick Checklist

When making changes, ensure:

- [ ] Positioning logic in ClippyPositioning.js only
- [ ] Real-time resize handling maintains visual stability
- [ ] No CSS transitions interfere with positioning updates
- [ ] Mobile and desktop both work smoothly
- [ ] Error handling included
- [ ] Performance optimized for real-time updates
- [ ] Balloons positioned correctly during resize
- [ ] No memory leaks or cleanup issues
- [ ] Test files run without errors
- [ ] React Hook warnings resolved
- [ ] All variables declared before use
- [ ] Browser API checks included
- [ ] Position stability verified during window resize

---

## 🐛 Recent Fixes Applied

### Real-time Resize Handling (LATEST)

**Problem:** Clippy drifted during active window resizing instead of staying visually anchored.

**Solution:**

- **Replaced throttled resize events** with `requestAnimationFrame` monitoring for instant updates
- **Implemented percentage-based anchor positioning** for better scaling during resize
- **Removed all CSS transitions** during resize for instant visual updates
- **Added performance optimizations** with `clippy-anchored` CSS class
- **Updated test suite** to validate real-time positioning stability

**Files Updated:**

- `ClippyPositioning.js` - Added `RealTimeResizeHandler` class with `requestAnimationFrame` monitoring
- `_styles.scss` - Added performance optimizations and transition removal for anchored state
- `console-test-runner.js` - Added real-time resize testing and position stability checks

### Test File Syntax Errors (FIXED)

- **Fixed undefined variables** in performanceTest.js and verification-test.js
- **Removed duplicate code** in console-test-runner.js
- **Added proper variable declarations** with let/const
- **Fixed browser API checks** for getEventListeners

### React Hook Warnings (FIXED)

- **Added missing dependencies** to useEffect arrays
- **Fixed ref cleanup warnings** by copying ref values to variables
- **Resolved tapTimeoutRef warning** in ClippyProvider

These patterns should be applied to any future similar issues.

---

## Emergency Recovery Options

### Level 1: Standard Reset

```javascript
window.resetClippy();
```

### Level 2: Emergency Reset

```javascript
window.ClippyService.emergencyReset();
```

### Level 3: Nuclear Option

```javascript
window.killClippy();
// Followed by page refresh
```

### Level 4: Real-time Positioning Reset

```javascript
// Force repositioning and anchor recalculation
window.ClippyPositioning.triggerRepositioning();
// Or restart resize handling
const clippyEl = document.querySelector(".clippy");
const overlayEl = document.getElementById("clippy-clickable-overlay");
window.ClippyPositioning.stopResizeHandling(clippyEl);
window.ClippyPositioning.startResizeHandling(clippyEl, overlayEl);
```

---

**The design now prioritizes real-time visual stability during window resize through immediate positioning updates, percentage-based anchor positioning, and optimized CSS performance. The centralized ClippyPositioning system ensures consistent, crash-resistant behavior across all devices while maintaining smooth real-time responsiveness during active window resizing.**
