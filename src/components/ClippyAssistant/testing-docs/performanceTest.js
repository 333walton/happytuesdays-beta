/**
 * ClippyAssistant Performance Test Script
 * Updated for centralized ClippyPositioning system
 */

const testClippyPerformance = () => {
  console.log(
    "%c=== Clippy Performance Test (Updated for ClippyPositioning) ===",
    "font-weight: bold; font-size: 14px; color: #4a86e8;"
  );

  // Memory test
  console.log("Measuring memory usage...");
  const before = performance.memory?.usedJSHeapSize || 0;

  // Check if ClippyPositioning is available
  if (!window.ClippyPositioning) {
    console.error(
      "❌ ClippyPositioning not available. Make sure the centralized positioning system is loaded."
    );
    return;
  }

  if (!window.ClippyService) {
    console.error(
      "❌ ClippyService not available. Make sure you're running this on a page with Clippy."
    );
    return;
  }

  // Test ClippyPositioning system performance
  console.log("Testing ClippyPositioning system performance...");
  const positioningStart = performance.now();

  // Test mobile positioning calculation
  let mobilePosition = null;
  let desktopPosition = null;

  try {
    mobilePosition = window.ClippyPositioning.calculateMobilePosition();
    console.log("Mobile position calculated:", mobilePosition);
  } catch (e) {
    console.error("Error calculating mobile position:", e);
  }

  // Test desktop positioning calculation
  try {
    desktopPosition = window.ClippyPositioning.calculateDesktopPosition();
    console.log("Desktop position calculated:", desktopPosition);
  } catch (e) {
    console.error("Error calculating desktop position:", e);
  }

  const positioningTime = performance.now() - positioningStart;
  console.log(
    `Positioning calculation time: ${positioningTime.toFixed(2)}ms ${
      positioningTime < 50
        ? "✅ Excellent"
        : positioningTime < 100
        ? "✅ Good"
        : "❌ Slow"
    }`
  );

  // Animation test with centralized system
  console.log("Testing animation performance with centralized positioning...");
  const animStart = performance.now();
  let animationSuccess = false;
  let positionSuccess = false;

  try {
    animationSuccess = window.ClippyService.play("Wave");

    // Test positioning during animation
    const clippyEl = document.querySelector(".clippy");
    if (clippyEl) {
      positionSuccess = window.ClippyPositioning.positionClippy(clippyEl);
      console.log(
        `Positioning during animation: ${
          positionSuccess ? "✅ Success" : "❌ Failed"
        }`
      );
    }
  } catch (e) {
    console.error("Error during animation test:", e);
  }

  const animTime = performance.now() - animStart;
  console.log(
    `Animation + positioning time: ${animTime.toFixed(2)}ms ${
      animTime < 100 ? "✅ Good" : "❌ Slow"
    }`
  );

  // Visibility and positioning test
  const clippy = document.querySelector(".clippy");
  let hasValidPosition = false;

  if (clippy) {
    const style = window.getComputedStyle(clippy);
    console.log(
      `Visibility: ${
        style.visibility === "visible" ? "✅ Visible" : "❌ Hidden"
      }`
    );
    console.log(
      `Display: ${style.display !== "none" ? "✅ Shown" : "❌ Hidden"}`
    );
    console.log(
      `Opacity: ${
        parseFloat(style.opacity) > 0 ? "✅ Visible" : "❌ Transparent"
      }`
    );

    // Test centralized positioning system
    console.log("Testing centralized positioning system...");
    let currentPosition = null;
    let expectedDimensions = null;

    try {
      currentPosition = window.ClippyPositioning.getClippyPosition();
      expectedDimensions =
        window.ClippyPositioning.getExpectedClippyDimensions();
    } catch (e) {
      console.error("Error getting position info:", e);
    }

    console.log("Current position config:", currentPosition);
    console.log("Expected dimensions:", expectedDimensions);

    // Test if positioning is consistent
    hasValidPosition =
      currentPosition &&
      (currentPosition.left || currentPosition.right) &&
      (currentPosition.top || currentPosition.bottom);

    console.log(
      `Positioning system: ${hasValidPosition ? "✅ Valid" : "❌ Invalid"}`
    );
  } else {
    console.error("❌ Clippy element not found in DOM");
  }

  // Hardware acceleration test
  let hasHardwareAcceleration = false;
  if (clippy) {
    const style = window.getComputedStyle(clippy);
    hasHardwareAcceleration =
      style.transform.includes("translateZ") ||
      style.transform.includes("translate3d") ||
      style.willChange.includes("transform");

    console.log(
      `Hardware acceleration: ${
        hasHardwareAcceleration ? "✅ Enabled" : "❌ Disabled"
      }`
    );
  }

  // Device detection test using centralized system
  const isMobileDetected = window.ClippyPositioning.isMobile;
  const actualIsMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;

  console.log(
    `Mobile detection: ${
      isMobileDetected === actualIsMobile ? "✅ Accurate" : "❌ Inaccurate"
    } (Detected: ${isMobileDetected}, Actual: ${actualIsMobile})`
  );

  // Test synchronized overlay positioning
  console.log("Testing synchronized overlay positioning...");
  const overlay = document.getElementById("clippy-clickable-overlay");
  let overlayPosition = null;
  let positionMatch = false;
  let touchFriendly = false;

  if (overlay && clippy) {
    try {
      overlayPosition = window.ClippyPositioning.getOverlayPosition(clippy);
    } catch (e) {
      console.error("Error getting overlay position:", e);
    }

    const overlayRect = overlay.getBoundingClientRect();
    const clippyRect = clippy.getBoundingClientRect();

    positionMatch =
      Math.abs(overlayRect.left - clippyRect.left) < 5 &&
      Math.abs(overlayRect.top - clippyRect.top) < 5;

    console.log(
      `Overlay synchronization: ${
        positionMatch ? "✅ Synchronized" : "❌ Misaligned"
      }`
    );

    // Test touch target size
    touchFriendly = overlayRect.width >= 44 && overlayRect.height >= 44;
    console.log(
      `Touch targets: ${
        touchFriendly ? "✅ Good" : "❌ Too small"
      } (${overlayRect.width.toFixed(0)}x${overlayRect.height.toFixed(0)}px)`
    );
  } else {
    console.error("❌ Clippy overlay not found or not synchronized");
  }

  // Test balloon positioning system
  console.log("Testing balloon positioning system...");
  let validSpeechPos = false;
  let validChatPos = false;

  if (clippy) {
    try {
      const speechBalloonPos = window.ClippyPositioning.getBalloonPosition(
        clippy,
        "speech"
      );
      const chatBalloonPos = window.ClippyPositioning.getBalloonPosition(
        clippy,
        "chat"
      );

      console.log("Speech balloon position:", speechBalloonPos);
      console.log("Chat balloon position:", chatBalloonPos);

      validSpeechPos =
        speechBalloonPos &&
        speechBalloonPos.left >= 0 &&
        speechBalloonPos.top >= 0;
      validChatPos =
        chatBalloonPos && chatBalloonPos.left >= 0 && chatBalloonPos.top >= 0;

      console.log(
        `Balloon positioning: ${
          validSpeechPos && validChatPos ? "✅ Valid" : "❌ Invalid"
        }`
      );
    } catch (e) {
      console.error("Error testing balloon positioning:", e);
    }
  }

  // Test positioning system stress test
  console.log("Performing positioning system stress test...");
  const stressStart = performance.now();

  for (let i = 0; i < 100; i++) {
    try {
      window.ClippyPositioning.calculateMobilePosition();
      window.ClippyPositioning.calculateDesktopPosition();
    } catch (e) {
      console.error("Error in stress test iteration:", e);
      break;
    }
  }

  const stressTime = performance.now() - stressStart;
  console.log(
    `Stress test (200 calculations): ${stressTime.toFixed(2)}ms ${
      stressTime < 100
        ? "✅ Excellent"
        : stressTime < 200
        ? "✅ Good"
        : "❌ Slow"
    }`
  );

  // Memory usage after tests
  setTimeout(() => {
    const after = performance.memory?.usedJSHeapSize || 0;
    const usage = after - before;
    const usageMB = (usage / (1024 * 1024)).toFixed(2);
    console.log(
      `Memory usage: ${usageMB}MB ${usage < 5000000 ? "✅ Good" : "❌ High"}`
    );

    // Feature verification for centralized system
    console.log("\nCentralized system feature verification:");

    const features = {
      "ClippyPositioning available": !!window.ClippyPositioning,
      calculateMobilePosition:
        !!window.ClippyPositioning?.calculateMobilePosition,
      calculateDesktopPosition:
        !!window.ClippyPositioning?.calculateDesktopPosition,
      positionClippy: !!window.ClippyPositioning?.positionClippy,
      positionOverlay: !!window.ClippyPositioning?.positionOverlay,
      getBalloonPosition: !!window.ClippyPositioning?.getBalloonPosition,
      positionClippyAndOverlay:
        !!window.ClippyPositioning?.positionClippyAndOverlay,
      getExpectedClippyDimensions:
        !!window.ClippyPositioning?.getExpectedClippyDimensions,
      "ClippyService available": !!window.ClippyService,
      "ClippyService.speak": !!window.ClippyService?.speak,
      "ClippyService.emergencyReset": !!window.ClippyService?.emergencyReset,
    };

    Object.entries(features).forEach(([feature, available]) => {
      console.log(`- ${feature}: ${available ? "✅" : "❌"}`);
    });

    // Calculate success rate
    const totalTests = 15; // Updated for new tests
    let passedTests = 0;

    // Count passing tests
    if (clippy) passedTests++;
    if (clippy && parseFloat(window.getComputedStyle(clippy).opacity) > 0)
      passedTests++;
    if (hasValidPosition) passedTests++;
    if (isMobileDetected === actualIsMobile) passedTests++;
    if (positioningTime < 100) passedTests++;
    if (animTime < 100) passedTests++;
    if (stressTime < 200) passedTests++;
    if (usage < 5000000) passedTests++;

    // Count available features
    const availableFeatures = Object.values(features).filter(Boolean).length;
    passedTests += Math.floor(availableFeatures * 0.7); // Weight feature availability

    const successRate = Math.round((passedTests / totalTests) * 100);

    console.log(
      `\n%c=== ClippyPositioning Performance Test Summary ===`,
      "font-weight: bold; font-size: 14px; color: #4a86e8;"
    );
    console.log(
      `Success rate: ${successRate}% (${passedTests}/${totalTests} tests passed)`
    );
    console.log(
      `Positioning performance: ${
        positioningTime < 50
          ? "✅ Excellent"
          : positioningTime < 100
          ? "✅ Good"
          : "❌ Needs improvement"
      }`
    );
    console.log(
      `Animation performance: ${
        animTime < 100 ? "✅ Good" : "❌ Needs improvement"
      }`
    );
    console.log(
      `Memory usage: ${usageMB}MB ${usage < 5000000 ? "✅ Good" : "❌ High"}`
    );
    console.log(
      `System stress test: ${
        stressTime < 100
          ? "✅ Excellent"
          : stressTime < 200
          ? "✅ Good"
          : "❌ Needs improvement"
      }`
    );

    if (successRate >= 85) {
      console.log(
        "%c✅ CENTRALIZED POSITIONING SYSTEM: EXCELLENT PERFORMANCE!",
        "color: green; font-weight: bold; font-size: 14px;"
      );
    } else if (successRate >= 70) {
      console.log(
        "%c✅ CENTRALIZED POSITIONING SYSTEM: GOOD PERFORMANCE",
        "color: green; font-weight: bold; font-size: 14px;"
      );
    } else {
      console.log(
        "%c❌ CENTRALIZED POSITIONING SYSTEM: NEEDS IMPROVEMENT",
        "color: red; font-weight: bold; font-size: 14px;"
      );
    }
  }, 3000);

  console.log(
    "Running centralized positioning system tests... results will be available in 3 seconds"
  );
};

// Export the function for use in browser console
if (typeof window !== "undefined") {
  window.testClippyPerformance = testClippyPerformance;
}

// Auto-run test in development mode
if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
  console.log(
    "Auto-running ClippyPositioning performance test in development mode"
  );
  setTimeout(testClippyPerformance, 5000);
}

export default testClippyPerformance;
