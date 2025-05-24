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
Run updated tests to verify centralized positioning system:
- performanceTest.js - Tests ClippyPositioning system performance
- verification-test.js - Verifies all centralized system methods
- console-test-runner.js - Browser console testing tool

All tests now validate:
- ClippyPositioning.js method functionality
- Mobile/desktop positioning calculations
- Synchronized overlay positioning
- Mobile interaction patterns
- Performance of centralized system
```

## 🎯 ClippyAssistant Component Rules

### Positioning System

- **ALL positioning logic** goes in `ClippyPositioning.js` (single source of truth)
- **Mobile**: `bottom: 100px, right: 35px` (15px more right than original)
- **Desktop**: `x: rect.width - 120px` (original position)
- **Never** add positioning logic to CSS or other JS files

### File Structure

- `ClippyPositioning.js` - All positioning calculations
- `ClippyProvider.js` - Main state management and global functions
- `ClippyService.js` - API for external components
- `ClippyAssistant.js` - UI component
- Custom balloons and utilities in separate files

### Key Principles

- Mobile-first development
- Crash resistance (always include error handling)
- Performance optimization (especially mobile)
- Centralized logic to avoid scattered code

---

## 🔧 Common Error Fixes

### **React Hook Dependency Warnings**

**Pattern: Missing dependencies in useEffect**

```javascript
// ❌ Wrong - Missing dependencies
useEffect(() => {
  // Uses clippyInstanceRef, overlayRef, tapTimeoutRef
}, [clippy, visible]);

// ✅ Correct - Include all dependencies
useEffect(() => {
  // Same code
}, [clippy, visible, clippyInstanceRef, overlayRef, tapTimeoutRef]);
```

**Pattern: Ref cleanup warnings**

```javascript
// ❌ Wrong - Using ref.current directly in cleanup
useEffect(() => {
  return () => {
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
  };
}, [deps]);

// ✅ Correct - Copy ref value to variable
useEffect(() => {
  const currentTapTimeout = tapTimeoutRef.current; // Before return

  return () => {
    if (currentTapTimeout) {
      clearTimeout(currentTapTimeout);
    }
  };
}, [deps]);
```

### **Test File Variable Declaration Issues**

**Pattern: Undefined variable errors**

```javascript
// ❌ Wrong - Using variables without declaration
if (hasValidPosition) passedTests++; // Error: hasValidPosition not defined

// ✅ Correct - Declare all variables
let hasValidPosition = false;
let overlayPosition = null;
let animationSuccess = false;
// ... then use them
```

**Pattern: Browser-only function calls**

```javascript
// ❌ Wrong - getEventListeners not available everywhere
if (typeof getEventListeners === "function") {

// ✅ Correct - Check window object first
if (typeof window !== "undefined" && typeof window.getEventListeners === "function") {
```

---

## 📱 Mobile Requirements

### Always ensure:

- Touch targets ≥ 44px (iOS standard)
- iOS Safari compatibility
- Touch event handling with `{ passive: false }`
- Hardware acceleration for smooth performance
- Proper z-index hierarchy

### Testing checklist:

- [ ] iOS Safari interaction works
- [ ] Android Chrome interaction works
- [ ] Balloons stay within viewport
- [ ] No crashes on mobile devices
- [ ] Test files run without syntax errors
- [ ] React Hook warnings resolved

---

## 🔧 Common Commands

### Positioning Changes

```
Update ClippyPositioning.js to change [mobile/desktop] position to [values].
Ensure balloons and overlays remain synchronized.
```

### Mobile Optimization

```
Make this mobile-friendly with:
- Larger touch targets
- iOS Safari compatibility
- Performance optimization
- Proper viewport handling
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

---

## 🏗️ Component Architecture

### ClippyProvider Pattern

```
State Management → Global Functions → Component Controller → DOM Manipulation
```

### Positioning Flow

```
ClippyPositioning.js → Calculate Position → Apply to Element → Update Overlay → Position Balloons
```

### Error Recovery

```
Standard Error → Emergency Reset → Nuclear Reset → Page Refresh
```

### Test File Structure

```
Core Systems Check → Positioning Tests → Mobile Tests → Performance Tests → Summary
```

---

## 📋 Quick Checklist

When making changes, ensure:

- [ ] Positioning logic in ClippyPositioning.js only
- [ ] Mobile and desktop both work
- [ ] Error handling included
- [ ] Performance optimized
- [ ] Balloons positioned correctly
- [ ] No memory leaks or cleanup issues
- [ ] Test files run without errors
- [ ] React Hook warnings resolved
- [ ] All variables declared before use
- [ ] Browser API checks included

---

## 🐛 Recent Fixes Applied

### Test File Syntax Errors (Latest)

- **Fixed undefined variables** in performanceTest.js and verification-test.js
- **Removed duplicate code** in console-test-runner.js
- **Added proper variable declarations** with let/const
- **Fixed browser API checks** for getEventListeners

### React Hook Warnings (Latest)

- **Added missing dependencies** to useEffect arrays
- **Fixed ref cleanup warnings** by copying ref values to variables
- **Resolved tapTimeoutRef warning** in ClippyProvider

These patterns should be applied to any future similar issues.

---

_Keep this file updated as the ClippyAssistant component evolves._
