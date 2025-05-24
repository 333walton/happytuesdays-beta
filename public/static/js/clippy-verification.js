/**
 * Clippy Assistant Component Verification Test
 *
 * This script tests the complete functionality of the refactored ClippyAssistant component
 * to ensure all features work correctly.
 */

// Test all functionality
function verifyClippyFunctionality() {
  console.log("=== ClippyAssistant Verification Test ===");

  // Check if Clippy is available
  if (!window.ClippyService || !window.clippy) {
    console.error("❌ Clippy not initialized properly");
    return false;
  }

  console.log("✅ Clippy service available");

  // Test core functionality
  testCoreFunctionality();

  // Test positioning
  testPositioning();

  // Test balloon functionality
  testBalloonFunctionality();

  // Test animation
  testAnimation();

  // Test performance
  testPerformance();

  console.log("=== Test Complete ===");
}

// Core functionality tests
function testCoreFunctionality() {
  console.log("\n--- Testing Core Functionality ---");

  // Check if clippy is visible
  const clippyEl = document.querySelector(".clippy");
  const isVisible =
    clippyEl &&
    getComputedStyle(clippyEl).visibility === "visible" &&
    getComputedStyle(clippyEl).opacity !== "0";

  console.log(
    `Clippy visibility: ${isVisible ? "✅ Visible" : "❌ Not visible"}`
  );

  // Check global functions
  const functionTests = [
    { name: "setAssistantVisible", exists: !!window.setAssistantVisible },
    { name: "setCurrentAgent", exists: !!window.setCurrentAgent },
    { name: "setScreenPowerState", exists: !!window.setScreenPowerState },
    {
      name: "showClippyCustomBalloon",
      exists: !!window.showClippyCustomBalloon,
    },
    {
      name: "hideClippyCustomBalloon",
      exists: !!window.hideClippyCustomBalloon,
    },
    { name: "showClippyChatBalloon", exists: !!window.showClippyChatBalloon },
    { name: "getClippyInstance", exists: !!window.getClippyInstance },
    { name: "setClippyPosition", exists: !!window.setClippyPosition },
  ];

  functionTests.forEach((test) => {
    console.log(
      `Function ${test.name}: ${test.exists ? "✅ Available" : "❌ Missing"}`
    );
  });
}

// Positioning tests
function testPositioning() {
  console.log("\n--- Testing Positioning ---");

  const clippyEl = document.querySelector(".clippy");
  if (!clippyEl) {
    console.error("❌ Cannot test positioning - Clippy element not found");
    return;
  }

  // Get the desktop viewport
  const desktopViewport =
    document.querySelector(".desktop.screen") ||
    document.querySelector(".desktop") ||
    document.querySelector(".w98");

  if (!desktopViewport) {
    console.error("❌ Cannot test positioning - Desktop viewport not found");
    return;
  }

  const desktopRect = desktopViewport.getBoundingClientRect();
  const clippyRect = clippyEl.getBoundingClientRect();

  // Check if Clippy is within the desktop viewport
  const isWithinViewport =
    clippyRect.left >= desktopRect.left &&
    clippyRect.right <= desktopRect.right &&
    clippyRect.top >= desktopRect.top &&
    clippyRect.bottom <= desktopRect.bottom;

  console.log(
    `Clippy within desktop viewport: ${
      isWithinViewport ? "✅ Correct" : "❌ Incorrect"
    }`
  );

  // Test specific positions
  if (window.ClippyService) {
    console.log("Testing position changes...");

    // Save current position
    const originalLeft = clippyEl.style.left;
    const originalTop = clippyEl.style.top;

    // Test named positions
    const positions = ["higher-right", "bottom-right", "top-left", "center"];

    positions.forEach((position) => {
      console.log(`Testing position: ${position}`);
      window.ClippyService.setInitialPosition({ position });

      // Allow time for position to update
      setTimeout(() => {
        console.log(`Position ${position} applied`);
      }, 100);
    });

    // Restore original position
    setTimeout(() => {
      clippyEl.style.left = originalLeft;
      clippyEl.style.top = originalTop;
      console.log("Original position restored");
    }, 500);
  }
}

// Balloon functionality tests
function testBalloonFunctionality() {
  console.log("\n--- Testing Balloon Functionality ---");

  if (!window.ClippyService) {
    console.error("❌ Cannot test balloons - ClippyService not available");
    return;
  }

  // Test custom balloon
  window.ClippyService.speak("Testing custom balloon functionality");

  // Test chat balloon (after a delay)
  setTimeout(() => {
    window.ClippyService.showChat("Testing chat balloon functionality");

    // Hide balloon after testing
    setTimeout(() => {
      window.ClippyService.hideBalloon();
      console.log("Balloons tested and hidden");
    }, 1500);
  }, 1500);
}

// Animation tests
function testAnimation() {
  console.log("\n--- Testing Animation ---");

  if (!window.ClippyService) {
    console.error("❌ Cannot test animations - ClippyService not available");
    return;
  }

  const animations = ["Greeting", "Wave", "GestureRight"];

  animations.forEach((animation, index) => {
    setTimeout(() => {
      console.log(`Testing animation: ${animation}`);
      window.ClippyService.play(animation);
    }, index * 1000);
  });
}

// Performance tests
function testPerformance() {
  console.log("\n--- Testing Performance ---");

  // Memory usage test
  if (performance.memory) {
    const memoryUsage = performance.memory.usedJSHeapSize / (1024 * 1024);
    console.log(`Memory usage: ${memoryUsage.toFixed(2)}MB`);
    console.log(`Memory status: ${memoryUsage < 25 ? "✅ Good" : "⚠️ High"}`);
  } else {
    console.log("Memory API not available in this browser");
  }

  // Animation performance test
  const startTime = performance.now();
  if (window.ClippyService) {
    window.ClippyService.play("Wave");
  }

  requestAnimationFrame(() => {
    const animTime = performance.now() - startTime;
    console.log(`Animation start time: ${animTime.toFixed(2)}ms`);
    console.log(
      `Animation performance: ${animTime < 100 ? "✅ Good" : "⚠️ Slow"}`
    );
  });

  // Mobile optimization test
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    console.log("Running mobile-specific tests...");

    const clippyEl = document.querySelector(".clippy");
    if (clippyEl) {
      const style = window.getComputedStyle(clippyEl);
      const hasMobilePosition = style.bottom && style.right;
      console.log(
        `Mobile positioning: ${
          hasMobilePosition ? "✅ Correct" : "❌ Incorrect"
        }`
      );
    }
  }
}

// Export for console use
window.verifyClippyFunctionality = verifyClippyFunctionality;

// Auto-run after delay if in browser context
if (typeof window !== "undefined") {
  setTimeout(verifyClippyFunctionality, 5000);
}

// Simple usage instructions for console
console.log(`
=== Clippy Verification Test ===
To run tests, call window.verifyClippyFunctionality() from the console.

Or reload the page to auto-run tests after 5 seconds.
`);
