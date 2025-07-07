// DEBUG GREEN SCREEN ISSUE
// Copy & Paste into Browser Console
// =================================

console.log("🐛 Green Screen Debug Started");

// Check what elements are rendered
const checkElements = () => {
  console.log("\n📋 Element Check:");

  const elements = [
    ".desktop",
    ".desktop.screen",
    ".w98",
    ".MonitorView",
    ".monitor-container",
    ".black-overlay",
    ".BIOSWrapper",
    ".WindowsLaunchWrapper",
    ".clippy",
    "#clippy-clickable-overlay",
  ];

  elements.forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      console.log(`✅ ${selector}:`, {
        width: rect.width,
        height: rect.height,
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        zIndex: styles.zIndex,
      });
    } else {
      console.log(`❌ ${selector}: Not found`);
    }
  });
};

// Check React app mounting
const checkReactApp = () => {
  console.log("\n⚛️ React App Check:");

  const root = document.getElementById("root");
  if (root) {
    console.log(`✅ Root element found`);
    console.log(`   Children: ${root.children.length}`);
    console.log(`   innerHTML length: ${root.innerHTML.length}`);

    if (root.children.length > 0) {
      console.log(`   First child:`, root.children[0].className);
    }
  } else {
    console.log(`❌ Root element not found`);
  }
};

// Check for JavaScript errors
const checkErrors = () => {
  console.log("\n🚨 Console Error Check:");

  // Override console.error to catch errors
  const originalError = console.error;
  let errorCount = 0;

  console.error = function (...args) {
    errorCount++;
    console.log(`🔴 Error ${errorCount}:`, ...args);
    originalError.apply(console, args);
  };

  console.log("Error monitoring active - any new errors will be logged");
};

// Check CSS and styles
const checkStyles = () => {
  console.log("\n🎨 Style Check:");

  const body = document.body;
  const html = document.documentElement;

  console.log("Body styles:", {
    backgroundColor: window.getComputedStyle(body).backgroundColor,
    overflow: window.getComputedStyle(body).overflow,
    margin: window.getComputedStyle(body).margin,
    padding: window.getComputedStyle(body).padding,
  });

  console.log("HTML styles:", {
    backgroundColor: window.getComputedStyle(html).backgroundColor,
    height: window.getComputedStyle(html).height,
    width: window.getComputedStyle(html).width,
  });
};

// Check if components are loading
const checkComponentLoading = () => {
  console.log("\n⏳ Component Loading Check:");

  // Check for loading states
  const loadingElements = document.querySelectorAll(
    "[data-loading], .loading, .spinner"
  );
  console.log(`Loading elements found: ${loadingElements.length}`);

  // Check for React error boundaries
  const errorBoundaries = document.querySelectorAll(
    "[data-react-error], .react-error"
  );
  console.log(`Error boundaries found: ${errorBoundaries.length}`);

  // Check for Happy Tuesdays specific elements
  const happyTuesdaysElements = document.querySelectorAll(
    '[class*="happy-tuesdays"], [class*="w98"], [class*="desktop"]'
  );
  console.log(
    `Happy Tuesdays/W98 elements found: ${happyTuesdaysElements.length}`
  );
};

// Try to fix green screen
const tryFix = () => {
  console.log("\n🔧 Attempting Green Screen Fix:");

  // Force desktop to render
  const root = document.getElementById("root");
  if (root && root.innerHTML.length < 100) {
    console.log("Root element seems empty, might be rendering issue");
  }

  // Check if it's a CSS issue
  const body = document.body;
  if (
    body.style.backgroundColor === "green" ||
    window.getComputedStyle(body).backgroundColor === "rgb(0, 128, 0)"
  ) {
    console.log("🎯 Found green background! Removing...");
    body.style.backgroundColor = "";
    body.style.background = "";
  }

  // Force re-render attempt
  if (window.React && window.ReactDOM) {
    console.log("React detected, but can't force re-render safely");
  }

  // Check for CRT mode or screen effects
  const crtElements = document.querySelectorAll(
    ".crt, .screen-effect, .monitor-effect"
  );
  if (crtElements.length > 0) {
    console.log(`🖥️ Found ${crtElements.length} CRT/screen effect elements`);
  }
};

// Run all diagnostics
const runDiagnostics = () => {
  console.log("🚀 Running Full Green Screen Diagnostics...");
  checkReactApp();
  checkElements();
  checkStyles();
  checkComponentLoading();
  checkErrors();

  console.log("\n💡 Manual Checks:");
  console.log("1. Check browser dev tools for React errors");
  console.log("2. Try refreshing the page");
  console.log("3. Check if it's a CSS issue");
  console.log("4. Run tryFix() to attempt automatic fix");
};

// Create global debug object
window.debug = {
  check: runDiagnostics,
  elements: checkElements,
  react: checkReactApp,
  errors: checkErrors,
  styles: checkStyles,
  components: checkComponentLoading,
  fix: tryFix,

  help: () => {
    console.log("🆘 Green Screen Debug Commands:");
    console.log("debug.check() - Run full diagnostics");
    console.log("debug.elements() - Check DOM elements");
    console.log("debug.react() - Check React app");
    console.log("debug.styles() - Check CSS styles");
    console.log("debug.fix() - Try to fix green screen");
  },
};

// Auto-run diagnostics
console.log("🎯 Green screen debug loaded!");
console.log("Type 'debug.check()' for full diagnostics");
console.log("Type 'debug.fix()' to try fixing");

// Quick initial check
setTimeout(() => {
  const root = document.getElementById("root");
  if (!root || root.innerHTML.length < 100) {
    console.log("⚠️  Possible React rendering issue detected");
    console.log("   Try: debug.check()");
  } else {
    console.log("ℹ️  React app seems to be rendered");
    checkElements();
  }
}, 1000);
