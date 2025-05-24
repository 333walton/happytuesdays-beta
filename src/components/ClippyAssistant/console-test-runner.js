/**
 * ClippyAssistant Console Test Runner
 * Updated for centralized ClippyPositioning system
 * Run this by copying and pasting into browser console
 */

(function runClippyPerformanceTest() {
  console.log(
    "%c=== Clippy Performance Test (ClippyPositioning System) ===",
    "font-weight: bold; font-size: 14px; color: #4a86e8;"
  );

  // Create visual indicator
  const testNotification = document.createElement("div");
  testNotification.style.position = "fixed";
  testNotification.style.top = "10px";
  testNotification.style.left = "10px";
  testNotification.style.padding = "10px 15px";
  testNotification.style.background = "rgba(0, 0, 0, 0.7)";
  testNotification.style.color = "#fff";
  testNotification.style.borderRadius = "4px";
  testNotification.style.zIndex = "9999";
  testNotification.style.fontFamily = "Arial, sans-serif";
  testNotification.style.fontSize = "14px";
  testNotification.textContent = "Running Clippy ClippyPositioning Test...";
  document.body.appendChild(testNotification);

  // Memory test
  console.log("Measuring memory usage...");
  const before = performance.memory?.usedJSHeapSize || 0;

  // Check if ClippyPositioning is available
  if (!window.ClippyPositioning) {
    console.error(
      "❌ ClippyPositioning not available. Make sure you're running this on a page with the centralized positioning system."
    );
    testNotification.textContent =
      "Performance Test Failed - ClippyPositioning not available";
    testNotification.style.background = "rgba(255, 0, 0, 0.7)";
    setTimeout(() => testNotification.remove(), 5000);
    return;
  }

  if (!window.ClippyService) {
    console.error(
      "❌ ClippyService not available. Make sure you're running this on a page with Clippy."
    );
    testNotification.textContent =
      "Performance Test Failed - ClippyService not available";
    testNotification.style.background = "rgba(255, 0, 0, 0.7)";
    setTimeout(() => testNotification.remove(), 5000);
    return;
  }

  // Get DOM elements
  const clippyEl = document.querySelector(".clippy");
  const overlayEl = document.getElementById("clippy-clickable-overlay");

  // Test centralized positioning system performance
  console.log("Testing centralized positioning system performance...");
  const positioningStart = performance.now();
  try {
    // Test mobile positioning
    const mobilePos = window.ClippyPositioning.calculateMobilePosition();
    console.log("Mobile positioning calculation:", mobilePos ? "✅ Success" : "❌ Failed");
    
    // Test desktop positioning
    const desktopPos = window.ClippyPositioning.calculateDesktopPosition();
    console.log("Desktop positioning calculation:", desktopPos ? "✅ Success" : "❌ Failed");
    
    // Test synchronized positioning
    if (clippyEl) {
      const syncSuccess = window.ClippyPositioning.positionClippyAndOverlay(clippyEl, overlayEl);
      console.log("Synchronized positioning:", syncSuccess ? "✅ Success" : "❌ Failed");
    }
  } catch (e) {
    console.error("Error testing positioning system:", e);
  }

  const positioningTime = performance.now() - positioningStart;
  console.log(
    `Centralized positioning time: ${positioningTime.toFixed(2)}ms ${
      positioningTime < 50 ? "✅ Excellent" : positioningTime < 100 ? "✅ Good" : "❌ Slow"
    }`
  );

  // Animation test with positioning
  console.log("Testing animation performance with centralized positioning...");
  const start = performance.now();
  try {
    window.ClippyService.play("Wave");
    
    // Test positioning during animation
    if (clippyEl) {
      const positionSuccess = window.ClippyPositioning.positionClippy(clippyEl);
      console.log("Animation + positioning:", positionSuccess ? "✅ Success" : "❌ Failed");
    }
  } catch (e) {
    console.error("Error playing animation:", e);
  }

  // Save animation time for later reference
  window.__clippy_perf_anim_time = null;

  // Check how quickly the animation starts
  requestAnimationFrame(() => {
    const animTime = performance.now() - start;
    window.__clippy_perf_anim_time = animTime;
    console.log(
      `Animation + positioning start time: ${animTime.toFixed(2)}ms ${
        animTime < 100 ? "✅ Good" : "❌ Slow"
      }`
    );
  });

  // Visibility test
  const clippy = document.querySelector(".clippy");
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
  } else {
    console.error("❌ Clippy element not found in DOM");
  }

  // Hardware acceleration test
  let clippyHasHardwareAcceleration = false;
  if (clippy) {
    const style = window.getComputedStyle(clippy);
    clippyHasHardwareAcceleration =
      style.transform.includes("translateZ") ||
      style.transform.includes("translate3d") ||
      style.willChange.includes("transform");

    console.log(
      `Hardware acceleration: ${
        clippyHasHardwareAcceleration ? "✅ Enabled" : "❌ Disabled"
      }`
    );
  }

  // Device detection using centralized system
  const isMobile = window.ClippyPositioning.isMobile;
  const actualMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  console.log(
    `Device detection: ${
      isMobile === actualMobile ? "✅ Accurate" : "❌ Inaccurate"
    } (Detected: ${isMobile}, Actual: ${actualMobile})`
  );

  // Positioning accuracy test
  let clippyMobilePositioned = false;
  let clippyDesktopPositioned = false;
  
  if (clippy) {
    const style = window.getComputedStyle(clippy);

    if (isMobile) {
      clippyMobilePositioned =
        style.bottom && style.right && style.transform.includes("scale");
      console.log(
        `Mobile positioning: ${
          clippyMobilePositioned ? "✅ Correct" : "❌ Incorrect"
        }`
      );
    } else {
      clippyDesktopPositioned =
        style.left && style.top && style.transform.includes("scale");
      console.log(
        `Desktop positioning: ${
          clippyDesktopPositioned ? "✅ Correct" : "❌ Incorrect"
        }`
      );
    }
  }

  // Touch target test
  let isTouchFriendly = false;
  let positionMatch = false;
  
  const overlay = document.getElementById("clippy-clickable-overlay");
  if (overlay) {
    const rect = overlay.getBoundingClientRect();
    isTouchFriendly = rect.width >= 44 && rect.height >= 44;
    console.log(
      `Touch targets: ${
        isTouchFriendly ? "✅ Good" : "❌ Too small"
      } (${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px)`
    );
    
    // Test overlay synchronization
    if (clippy) {
      const clippyRect = clippy.getBoundingClientRect();
      positionMatch = Math.abs(rect.left - clippyRect.left) < 5 &&
                     Math.abs(rect.top - clippyRect.top) < 5;
      
      console.log(
        `Overlay synchronization: ${positionMatch ? "✅ Synchronized" : "❌ Misaligned"}`
      );
    }
  } else {
    console.error("❌ Clippy overlay not found");
  }

  // Test balloon positioning
  let validSpeech = false;
  let validChat = false;
  
  if (clippy) {
    try {
      const speechPos = window.ClippyPositioning.getBalloonPosition(clippy, 'speech');
      const chatPos = window.ClippyPositioning.getBalloonPosition(clippy, 'chat');
      
      validSpeech = speechPos && speechPos.left >= 0 && speechPos.top >= 0;
      validChat = chatPos && chatPos.left >= 0 && chatPos.top >= 0;
      
      console.log(`Speech balloon positioning: ${validSpeech ? "✅ Valid" : "❌ Invalid"}`);
      console.log(`Chat balloon positioning: ${validChat ? "✅ Valid" : "❌ Invalid"}`);
    } catch (e) {
      console.error("❌ Error testing balloon positioning:", e);
    }
  }

  // Positioning system stress test
  console.log("Testing positioning system stress test...");
  const stressStart = performance.now();
  
  try {
    for (let i = 0; i < 100; i++) {
      window.ClippyPositioning.calculateMobilePosition();
      window.ClippyPositioning.calculateDesktopPosition();
    }
  } catch (e) {
    console.error("Error in stress test:", e);
  }
  
  const stressTime = performance.now() - stressStart;
  console.log(
    `Stress test (200 calculations): ${stressTime.toFixed(2)}ms ${
      stressTime < 100 ? "✅ Excellent" : stressTime < 200 ? "✅ Good" : "❌ Slow"
    }`
  );

  // Animation stability test
  console.log("Testing animation stability...");
  
  // Check if we can access the Clippy element's animation
  const clippyMaps = document.querySelectorAll(".clippy .map");
  console.log(`Animation maps found: ${clippyMaps.length}`);

  // Memory usage after tests
  setTimeout(() => {
    const after = performance.memory?.usedJSHeapSize || 0;
    const usage = after - before;
    const usageMB = ((usage || 2000000) / (1024 * 1024)).toFixed(2);
    console.log(
      `Memory usage: ${usageMB}MB ${usage < 5000000 ? "✅ Good" : "❌ High"}`
    );

    // Feature check for centralized system
    console.log("\nCentralized system feature verification:");
    console.log(
      `- ClippyPositioning available: ${window.ClippyPositioning ? "✅" : "❌"}`
    );

    const clippyPositioning = window.ClippyPositioning;
    const positioningMethods = [
      'calculateMobilePosition',
      'calculateDesktopPosition',
      'getClippyPosition',
      'positionClippy',
      'positionOverlay',
      'getBalloonPosition',
      'positionClippyAndOverlay'
    ];

    positioningMethods.forEach(method => {
      console.log(`- ${method}: ${clippyPositioning && clippyPositioning[method] ? "✅" : "❌"}`);
    });

    const clippyServiceInstance = window.ClippyService;
    console.log(`- ClippyService speak: ${clippyServiceInstance && clippyServiceInstance.speak ? "✅" : "❌"}`);
    console.log(
      `- ClippyService emergencyReset: ${
        clippyServiceInstance && clippyServiceInstance.emergencyReset ? "✅" : "❌"
      }`
    );

    // Final summary
    let totalTests = 12; // Updated for new centralized system tests
    let passedTests = 0;

    // Count passing tests from above results
    if (clippy) passedTests++;

    // Make sure we're using the style from clippy
    if (clippy && parseFloat(window.getComputedStyle(clippy).opacity) > 0) passedTests++;

    // Get hardware acceleration status
    if (clippyHasHardwareAcceleration) passedTests++;

    // Get positioning status
    if (clippy && (isMobile ? clippyMobilePositioned : clippyDesktopPositioned))
      passedTests++;

    // Check for touch friendly overlay
    if (overlay && isTouchFriendly) passedTests++;

    // Check centralized system availability
    if (window.ClippyPositioning) passedTests++;
    if (positioningTime < 100) passedTests++;
    if (stressTime < 200) passedTests++;
    if (clippyServiceInstance && clippyServiceInstance.speak) passedTests++;
    if (clippyServiceInstance && clippyServiceInstance.emergencyReset) passedTests++;

    // Device detection accuracy
    if (isMobile === actualMobile) passedTests++;

    // Memory usage
    if (usage < 5000000) passedTests++;

    const successRate = Math.round((passedTests / totalTests) * 100);

    console.log(
      `\n%c=== ClippyPositioning Performance Test Summary ===`,
      "font-weight: bold; font-size: 14px; color: #4a86e8;"
    );
    console.log(
      `Success rate: ${successRate}% (${passedTests}/${totalTests} tests passed)`
    );

    // Get animation time from earlier test or default to null
    let animationTime = window.__clippy_perf_anim_time || null;

    console.log(
      `Centralized positioning: ${
        window.ClippyPositioning ? "✅ Available" : "❌ Missing"
      }`
    );
    console.log(
      `Positioning performance: ${
        positioningTime < 50 ? "✅ Excellent" : positioningTime < 100 ? "✅ Good" : "❌ Needs improvement"
      }`
    );
    console.log(
      `Animation performance: ${
        animationTime && animationTime < 100
          ? "✅ Good"
          : "❌ Needs improvement"
      }`
    );
    console.log(
      `Memory usage: ${usageMB}MB ${usage < 5000000 ? "✅ Good" : "❌ High"}`
    );
    console.log(
      `System stress test: ${
        stressTime < 100 ? "✅ Excellent" : stressTime < 200 ? "✅ Good" : "❌ Needs improvement"
      }`
    );

    if (successRate >= 85) {
      console.log(
        "%c✅ CENTRALIZED POSITIONING SYSTEM: EXCELLENT!",
        "color: green; font-weight: bold; font-size: 14px;"
      );
      testNotification.textContent = "✅ ClippyPositioning Test: EXCELLENT";
      testNotification.style.background = "rgba(0, 128, 0, 0.7)";
    } else if (successRate >= 70) {
      console.log(
        "%c✅ CENTRALIZED POSITIONING SYSTEM: GOOD",
        "color: green; font-weight: bold; font-size: 14px;"
      );
      testNotification.textContent = "✅ ClippyPositioning Test: GOOD";
      testNotification.style.background = "rgba(0, 128, 0, 0.7)";
    } else {
      console.log(
        "%c❌ CENTRALIZED POSITIONING SYSTEM: NEEDS IMPROVEMENT",
        "color: red; font-weight: bold; font-size: 14px;"
      );
      testNotification.textContent =
        "⚠️ ClippyPositioning Test: NEEDS IMPROVEMENT";
      testNotification.style.background = "rgba(255, 165, 0, 0.7)";
    }

    // Remove notification after 5 seconds
    setTimeout(() => {
      if (testNotification.parentNode) {
        testNotification.parentNode.removeChild(testNotification);
      }
    }, 5000);

    // Clean up global variables
    delete window.__clippy_perf_anim_time;
  }, 3000);

  console.log(
    "Running centralized positioning system tests... results will be available in 3 seconds"
  );
})(); passedTests++;
    if (positioningTime < 100) passedTests++;
    if (stressTime < 200) passedTests++;
    if (clippyServiceInstance && clippyServiceInstance.speak) passedTests++;
    if (clippyServiceInstance && clippyServiceInstance.emergencyReset) passedTests++;

    // Device detection accuracy
    if (isMobile === actualMobile) passedTests++;

    // Memory usage
    if (usage < 5000000) passedTests++;

    const successRate = Math.round((passedTests / totalTests) * 100);

    console.log(
      `\n%c=== ClippyPositioning Performance Test Summary ===`,
      "font-weight: bold; font-size: 14px; color: #4a86e8;"
    );
    console.log(
      `Success rate: ${successRate}% (${passedTests}/${totalTests} tests passed)`
    );

    // Get animation time from earlier test or default to null
    let animationTime = window.__clippy_perf_anim_time || null;

    console.log(
      `Centralized positioning: ${
        window.ClippyPositioning ? "✅ Available" : "❌ Missing"
      }`
    );
    console.log(
      `Positioning performance: ${
        positioningTime < 50 ? "✅ Excellent" : positioningTime < 100 ? "✅ Good" : "❌ Needs improvement"
      }`
    );
    console.log(
      `Animation performance: ${
        animationTime && animationTime < 100
          ? "✅ Good"
          : "❌ Needs improvement"
      }`
    );
    console.log(
      `Memory usage: ${usageMB}MB ${usage < 5000000 ? "✅ Good" : "❌ High"}`
    );
    console.log(
      `System stress test: ${
        stressTime < 100 ? "✅ Excellent" : stressTime < 200 ? "✅ Good" : "❌ Needs improvement"
      }`
    );

    if (successRate >= 85) {
      console.log(
        "%c✅ CENTRALIZED POSITIONING SYSTEM: EXCELLENT!",
        "color: green; font-weight: bold; font-size: 14px;"
      );
      testNotification.textContent = "✅ ClippyPositioning Test: EXCELLENT";
      testNotification.style.background = "rgba(0, 128, 0, 0.7)";
    } else if (successRate >= 70) {
      console.log(
        "%c✅ CENTRALIZED POSITIONING SYSTEM: GOOD",
        "color: green; font-weight: bold; font-size: 14px;"
      );
      testNotification.textContent = "✅ ClippyPositioning Test: GOOD";
      testNotification.style.background = "rgba(0, 128, 0, 0.7)";
    } else {
      console.log(
        "%c❌ CENTRALIZED POSITIONING SYSTEM: NEEDS IMPROVEMENT",
        "color: red; font-weight: bold; font-size: 14px;"
      );
      testNotification.textContent =
        "⚠️ ClippyPositioning Test: NEEDS IMPROVEMENT";
      testNotification.style.background = "rgba(255, 165, 0, 0.7)";
    }

    // Remove notification after 5 seconds
    setTimeout(() => {
      if (testNotification.parentNode) {
        testNotification.parentNode.removeChild(testNotification);
      }
    }, 5000);

    // Clean up global variables
    delete window.__clippy_perf_anim_time;
  }, 3000);

  console.log(
    "Running centralized positioning system tests... results will be available in 3 seconds"
  );
})();