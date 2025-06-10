// EMERGENCY APP FIX
// Copy & Paste into Browser Console
// =================================

console.log("🚑 Emergency App Fix - Attempting to restart React");

// Method 1: Force page reload
const forceReload = () => {
  console.log("🔄 Method 1: Force reload");
  window.location.reload(true);
};

// Method 2: Clear browser cache and reload
const clearAndReload = () => {
  console.log("🧹 Method 2: Clear cache and reload");
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
      window.location.reload(true);
    });
  } else {
    window.location.reload(true);
  }
};

// Method 3: Try to manually restart React (if possible)
const tryManualRestart = () => {
  console.log("⚛️ Method 3: Manual React restart");
  
  const root = document.getElementById('root');
  if (root) {
    // Clear the root
    root.innerHTML = '<div style="padding: 20px; text-align: center;">Restarting app...</div>';
    
    // Try to find React and restart
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
};

// Method 4: Check for specific errors
const checkSpecificErrors = () => {
  console.log("🔍 Method 4: Checking for specific errors");
  
  // Check for common React errors
  const scripts = Array.from(document.scripts);
  console.log(`Scripts loaded: ${scripts.length}`);
  
  // Check for hydration errors
  const hydrationErrors = scripts.some(script => 
    script.src.includes('react') || script.src.includes('hydra')
  );
  
  console.log(`React scripts found: ${hydrationErrors}`);
  
  // Check for CSS blocking
  const stylesheets = Array.from(document.styleSheets);
  console.log(`Stylesheets loaded: ${stylesheets.length}`);
  
  return {
    scripts: scripts.length,
    stylesheets: stylesheets.length,
    rootEmpty: document.getElementById('root').innerHTML.length === 0
  };
};

// Quick fix attempts
const quickFixes = () => {
  console.log("⚡ Quick fixes:");
  
  // Remove any blocking CSS
  const problematicStyles = document.querySelectorAll('style[data-styled]');
  if (problematicStyles.length > 0) {
    console.log(`Removing ${problematicStyles.length} styled-components styles`);
    problematicStyles.forEach(style => style.remove());
  }
  
  // Remove service worker if present
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
        console.log("Service worker unregistered");
      });
    });
  }
  
  // Clear local storage that might interfere
  try {
    localStorage.removeItem('react-dev-tools');
    localStorage.removeItem('debug');
    console.log("Cleared potentially problematic localStorage items");
  } catch (e) {
    console.log("localStorage clear failed (might not be available)");
  }
};

// Create fix object
window.fix = {
  reload: forceReload,
  clearCache: clearAndReload,
  restart: tryManualRestart,
  check: checkSpecificErrors,
  quick: quickFixes,
  
  // Emergency nuclear option
  nuclear: () => {
    console.log("☢️ NUCLEAR OPTION: Complete reset");
    quickFixes();
    setTimeout(() => {
      clearAndReload();
    }, 1000);
  },
  
  help: () => {
    console.log("🆘 Fix Commands:");
    console.log("fix.reload() - Simple page reload");
    console.log("fix.clearCache() - Clear cache and reload");
    console.log("fix.restart() - Try manual React restart");
    console.log("fix.check() - Check for specific errors");
    console.log("fix.quick() - Apply quick fixes");
    console.log("fix.nuclear() - Complete reset (last resort)");
  }
};

// Auto-diagnose
const autoDiagnose = () => {
  const diagnosis = checkSpecificErrors();
  
  if (diagnosis.rootEmpty) {
    console.log("🎯 DIAGNOSIS: React app failed to render");
    console.log("💡 RECOMMENDED: Try fix.reload() first");
    console.log("💡 IF THAT FAILS: Try fix.clearCache()");
  } else {
    console.log("🤔 App seems to be rendered, might be a different issue");
  }
};

console.log("🚑 Emergency fix loaded!");
console.log("Type 'fix.help()' for all options");
console.log("Type 'fix.reload()' for quick fix");

autoDiagnose();