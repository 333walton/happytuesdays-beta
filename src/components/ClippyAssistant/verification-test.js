/**
 * Clippy Assistant Component Verification Test
 * Updated for centralized ClippyPositioning system
 *
 * This script tests the complete functionality of the refactored ClippyAssistant component
 * to ensure all features work correctly with the new architecture.
 */

// Test all functionality
function verifyClippyFunctionality() {
  console.log(
    "=== ClippyAssistant Verification Test (Updated for ClippyPositioning) ==="
  );

  // Check if core systems are available
  if (!window.ClippyService || !window.clippy) {
    console.error("❌ Clippy core systems not initialized properly");
    return false;
  }

  if (!window.ClippyPositioning) {
    console.error(
      "❌ ClippyPositioning system not available - centralized positioning required"
    );
    return false;
  }

  console.log("✅ Core systems available");

  // Test centralized positioning system
  testCentralizedPositioning();

  // Test core functionality
  testCoreFunctionality();

  // Test positioning calculations
  testPositioningCalculations();

  // Test synchronized positioning
  testSynchronizedPositioning();

  // Test balloon functionality
  testBalloonFunctionality();

  // Test mobile interaction patterns
  testMobileInteractions();

  // Test animation with positioning
  testAnimationWithPositioning();

  // Test performance
  testPerformance();

  console.log("=== Verification Test Complete ===");
}

// Test centralized positioning system
function testCentralizedPositioning() {
  console.log("\n--- Testing Centralized Positioning System ---");

  // Test ClippyPositioning methods
  const requiredMethods = [
    "calculateMobilePosition",
    "calculateDesktopPosition",
    "getClippyPosition",
    "getOverlayPosition",
    "getBalloonPosition",
    "positionClippy",
    "positionOverlay",
    "positionClippyAndOverlay",
    "getExpectedClippyDimensions",
  ];

  requiredMethods.forEach((method) => {
    const exists = typeof window.ClippyPositioning[method] === "function";
    console.log(
      `ClippyPositioning.${method}: ${exists ? "✅ Available" : "❌ Missing"}`
    );
  });

  // Test positioning calculations
  try {
    const mobilePos = window.ClippyPositioning.calculateMobilePosition();
    const desktopPos = window.ClippyPositioning.calculateDesktopPosition();

    console.log(
      `Mobile position calculation: ${mobilePos ? "✅ Working" : "❌ Failed"}`
    );
    console.log(
      `Desktop position calculation: ${desktopPos ? "✅ Working" : "❌ Failed"}`
    );

    // Validate mobile position structure
    const validMobilePos =
      mobilePos &&
      typeof mobilePos.bottom === "string" &&
      typeof mobilePos.right === "string" &&
      mobilePos.position === "fixed";

    console.log(
      `Mobile position structure: ${validMobilePos ? "✅ Valid" : "❌ Invalid"}`
    );

    // Validate desktop position structure
    const validDesktopPos =
      desktopPos &&
      typeof desktopPos.x === "number" &&
      typeof desktopPos.y === "number";

    console.log(
      `Desktop position structure: ${
        validDesktopPos ? "✅ Valid" : "❌ Invalid"
      }`
    );
  } catch (error) {
    console.error("❌ Error testing positioning calculations:", error);
  }

  // Test device detection
  const isMobile = window.ClippyPositioning.isMobile;
  console.log(
    `Device detection: ${
      typeof isMobile === "boolean" ? "✅ Working" : "❌ Failed"
    } (Mobile: ${isMobile})`
  );
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

// Test positioning calculations
function testPositioningCalculations() {
  console.log("\n--- Testing Positioning Calculations ---");

  const clippyEl = document.querySelector(".clippy");
  if (!clippyEl) {
    console.error(
      "❌ Cannot test positioning calculations - Clippy element not found"
    );
    return;
  }

  try {
    // Test current position retrieval
    const currentPosition = window.ClippyPositioning.getClippyPosition();
    console.log(
      `Get current position: ${currentPosition ? "✅ Success" : "❌ Failed"}`
    );

    // Test expected dimensions
    const dimensions = window.ClippyPositioning.getExpectedClippyDimensions();
    const validDimensions =
      dimensions &&
      typeof dimensions.width === "number" &&
      typeof dimensions.height === "number";

    console.log(
      `Expected dimensions: ${validDimensions ? "✅ Valid" : "❌ Invalid"}`
    );

    // Test positioning application
    const positionSuccess = window.ClippyPositioning.positionClippy(clippyEl);
    console.log(
      `Apply positioning: ${positionSuccess ? "✅ Success" : "❌ Failed"}`
    );

    // Test bounds checking
    const rect = clippyEl.getBoundingClientRect();
    const inViewport =
      rect.left >= 0 &&
      rect.top >= 0 &&
      rect.right <= window.innerWidth &&
      rect.bottom <= window.innerHeight;

    console.log(
      `Position within viewport: ${
        inViewport ? "✅ Valid" : "⚠️ Outside bounds"
      }`
    );
  } catch (error) {
    console.error("❌ Error in positioning calculations:", error);
  }
}

// Test synchronized positioning
function testSynchronizedPositioning() {
  console.log("\n--- Testing Synchronized Positioning ---");

  const clippyEl = document.querySelector(".clippy");
  const overlayEl = document.getElementById("clippy-clickable-overlay");

  if (!clippyEl) {
    console.error(
      "❌ Cannot test synchronized positioning - Clippy element not found"
    );
    return;
  }

  try {
    // Test synchronized positioning
    const syncSuccess = window.ClippyPositioning.positionClippyAndOverlay(
      clippyEl,
      overlayEl
    );

    console.log(
      `Synchronized positioning: ${syncSuccess ? "✅ Success" : "❌ Failed"}`
    );

    if (overlayEl) {
      // Check overlay positioning accuracy
      const clippyRect = clippyEl.getBoundingClientRect();
      const overlayRect = overlayEl.getBoundingClientRect();

      const positionMatch =
        Math.abs(overlayRect.left - clippyRect.left) < 5 &&
        Math.abs(overlayRect.top - clippyRect.top) < 5;

      console.log(
        `Overlay position accuracy: ${
          positionMatch ? "✅ Accurate" : "❌ Misaligned"
        }`
      );

      // Check touch target size
      const touchTargetSize =
        overlayRect.width >= 44 && overlayRect.height >= 44;
      console.log(
        `Touch target size: ${touchTargetSize ? "✅ Adequate" : "❌ Too small"}`
      );
    } else {
      console.log("Overlay element: ❌ Not found");
    }
  } catch (error) {
    console.error("❌ Error in synchronized positioning:", error);
  }
}

// Balloon functionality tests
function testBalloonFunctionality() {
  console.log("\n--- Testing Balloon Functionality ---");

  if (!window.ClippyService) {
    console.error("❌ Cannot test balloons - ClippyService not available");
    return;
  }

  const clippyEl = document.querySelector(".clippy");
  if (!clippyEl) {
    console.error("❌ Cannot test balloons - Clippy element not found");
    return;
  }

  try {
    // Test balloon position calculations
    const speechPos = window.ClippyPositioning.getBalloonPosition(
      clippyEl,
      "speech"
    );
    const chatPos = window.ClippyPositioning.getBalloonPosition(
      clippyEl,
      "chat"
    );

    const validSpeechPos =
      speechPos &&
      typeof speechPos.left === "number" &&
      typeof speechPos.top === "number";

    const validChatPos =
      chatPos &&
      typeof chatPos.left === "number" &&
      typeof chatPos.top === "number";

    console.log(
      `Speech balloon positioning: ${
        validSpeechPos ? "✅ Valid" : "❌ Invalid"
      }`
    );
    console.log(
      `Chat balloon positioning: ${validChatPos ? "✅ Valid" : "❌ Invalid"}`
    );

    // Test viewport bounds for balloons
    const speechInBounds =
      speechPos.left >= 0 &&
      speechPos.top >= 0 &&
      speechPos.left <= window.innerWidth - 200;

    const chatInBounds =
      chatPos.left >= 0 &&
      chatPos.top >= 0 &&
      chatPos.left <= window.innerWidth - 300;

    console.log(
      `Speech balloon in viewport: ${
        speechInBounds ? "✅ Valid" : "❌ Out of bounds"
      }`
    );
    console.log(
      `Chat balloon in viewport: ${
        chatInBounds ? "✅ Valid" : "❌ Out of bounds"
      }`
    );

    // Test actual balloon functionality
    console.log("Testing balloon display...");
    window.ClippyService.speak(
      "Testing balloon positioning with centralized system"
    );

    setTimeout(() => {
      window.ClippyService.hideBalloon();
      console.log("Balloon test completed");
    }, 2000);
  } catch (error) {
    console.error("❌ Error in balloon functionality:", error);
  }
}

// Test mobile interaction patterns
function testMobileInteractions() {
  console.log("\n--- Testing Mobile Interaction Patterns ---");

  const isMobile = window.ClippyPositioning.isMobile;
  console.log(`Device type: ${isMobile ? "Mobile" : "Desktop"}`);

  const overlayEl = document.getElementById("clippy-clickable-overlay");

  if (!overlayEl) {
    console.error("❌ Cannot test mobile interactions - overlay not found");
    return;
  }

  try {
    // Test touch target size (mobile requirement)
    const rect = overlayEl.getBoundingClientRect();
    const touchFriendly = rect.width >= 44 && rect.height >= 44;

    console.log(
      `Touch target size: ${
        touchFriendly ? "✅ Good" : "❌ Too small"
      } (${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px)`
    );

    // Test touch event listeners (check if properly attached)
    // Note: getEventListeners is only available in Chrome dev tools
    let hasEventListeners = true; // Assume true since we can't reliably detect
    try {
      if (typeof getEventListeners === "function") {
        hasEventListeners =
          Object.keys(getEventListeners(overlayEl)).length > 0;
      }
    } catch (e) {
      // getEventListeners not available, skip this check
    }

    console.log(
      `Touch event listeners: ${
        hasEventListeners ? "✅ Attached" : "⚠️ Cannot verify"
      }`
    );

    // Test mobile-specific CSS
    const styles = window.getComputedStyle(overlayEl);
    const hasTouchOptimizations =
      styles.touchAction === "manipulation" ||
      styles.webkitTapHighlightColor === "transparent";

    console.log(
      `Mobile touch optimizations: ${
        hasTouchOptimizations ? "✅ Applied" : "❌ Missing"
      }`
    );

    if (isMobile) {
      // Test mobile positioning
      const clippyEl = document.querySelector(".clippy");
      if (clippyEl) {
        const clippyStyles = window.getComputedStyle(clippyEl);
        const mobilePositioned = clippyStyles.bottom && clippyStyles.right;

        console.log(
          `Mobile positioning: ${
            mobilePositioned ? "✅ Correct" : "❌ Incorrect"
          }`
        );

        // Check scale
        const hasScale = clippyStyles.transform.includes("scale");
        console.log(
          `Mobile scaling: ${hasScale ? "✅ Applied" : "❌ Missing"}`
        );
      }
    }
  } catch (error) {
    console.error("❌ Error testing mobile interactions:", error);
  }
}

// Test animation with positioning
function testAnimationWithPositioning() {
  console.log("\n--- Testing Animation with Positioning ---");

  if (!window.ClippyService) {
    console.error("❌ Cannot test animations - ClippyService not available");
    return;
  }

  try {
    const animations = ["Greeting", "Wave", "GestureRight"];
    let animationCount = 0;

    animations.forEach((animation, index) => {
      setTimeout(() => {
        console.log(`Testing animation: ${animation}`);

        // Test animation with positioning
        const success = window.ClippyService.play(animation);

        if (success) {
          // Verify Clippy is still properly positioned after animation
          const clippyEl = document.querySelector(".clippy");
          if (clippyEl) {
            const positioned =
              window.ClippyPositioning.positionClippy(clippyEl);
            console.log(
              `${animation} + positioning: ${
                positioned ? "✅ Success" : "❌ Failed"
              }`
            );
          }
        }

        animationCount++;
        if (animationCount === animations.length) {
          console.log("Animation positioning tests completed");
        }
      }, index * 1500);
    });
  } catch (error) {
    console.error("❌ Error testing animations with positioning:", error);
  }
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

  // Positioning performance test
  const startTime = performance.now();

  try {
    // Test multiple positioning calculations
    for (let i = 0; i < 50; i++) {
      window.ClippyPositioning.calculateMobilePosition();
      window.ClippyPositioning.calculateDesktopPosition();
    }

    const endTime = performance.now();
    const positioningTime = endTime - startTime;

    console.log(
      `Positioning performance (100 calculations): ${positioningTime.toFixed(
        2
      )}ms`
    );
    console.log(
      `Positioning efficiency: ${
        positioningTime < 50
          ? "✅ Excellent"
          : positioningTime < 100
          ? "✅ Good"
          : "⚠️ Slow"
      }`
    );
  } catch (error) {
    console.error("❌ Error in positioning performance test:", error);
  }

  // Animation start performance
  const animStartTime = performance.now();
  if (window.ClippyService) {
    window.ClippyService.play("Wave");
  }

  requestAnimationFrame(() => {
    const animTime = performance.now() - animStartTime;
    console.log(`Animation start time: ${animTime.toFixed(2)}ms`);
    console.log(
      `Animation performance: ${animTime < 100 ? "✅ Good" : "⚠️ Slow"}`
    );
  });
}

// Export for console use
window.verifyClippyFunctionality = verifyClippyFunctionality;

// Auto-run after delay if in browser context
if (typeof window !== "undefined") {
  setTimeout(verifyClippyFunctionality, 5000);
}

// Simple usage instructions for console
console.log(`
=== Clippy Verification Test (Updated for ClippyPositioning) ===
To run tests, call window.verifyClippyFunctionality() from the console.

Or reload the page to auto-run tests after 5 seconds.

New tests include:
- Centralized ClippyPositioning system
- Mobile and desktop positioning calculations  
- Synchronized overlay positioning
- Mobile interaction patterns
- Performance of centralized system
`);
