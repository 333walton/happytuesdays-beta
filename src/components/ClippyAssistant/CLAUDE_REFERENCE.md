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

---

## 🚨 Critical Don'ts

- ❌ Don't add positioning CSS (use ClippyPositioning.js)
- ❌ Don't create multiple RAF loops
- ❌ Don't forget mobile touch event handling
- ❌ Don't skip error handling in DOM operations
- ❌ Don't position balloons without viewport checks

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

---

## 📋 Quick Checklist

When making changes, ensure:

- [ ] Positioning logic in ClippyPositioning.js only
- [ ] Mobile and desktop both work
- [ ] Error handling included
- [ ] Performance optimized
- [ ] Balloons positioned correctly
- [ ] No memory leaks or cleanup issues

---

_Keep this file updated as the ClippyAssistant component evolves._
