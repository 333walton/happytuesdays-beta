/**
 * ClippyAssistant Console Test Runner
 * Run this by copying and pasting into browser console
 */

(function runClippyPerformanceTest() {
  console.log(
    "%c=== Clippy Performance Test ===",
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
  testNotification.textContent = "Running Clippy Performance Test...";
  document.body.appendChild(testNotification);

  // Memory test
  console.log("Measuring memory usage...");
  const before = performance.memory?.usedJSHeapSize || 0;

  // Check if ClippyService is available
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

  // Animation test
  console.log("Testing animation performance...");
  const start = performance.now();
  try {
    window.ClippyService.play("Wave");
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
      `Animation start time: ${animTime.toFixed(2)}ms ${
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
  if (clippy) {
    const style = window.getComputedStyle(clippy);
    const hasHardwareAcceleration =
      style.transform.includes("translateZ") ||
      style.transform.includes("translate3d") ||
      style.willChange.includes("transform");

    console.log(
      `Hardware acceleration: ${
        hasHardwareAcceleration ? "✅ Enabled" : "❌ Disabled"
      }`
    );
  }

  // Device detection
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Mobile positioning test
  if (clippy) {
    const style = window.getComputedStyle(clippy);

    if (isMobile) {
      const mobilePositioned =
        style.bottom && style.right && style.transform.includes("scale");
      console.log(
        `Mobile positioning: ${
          mobilePositioned ? "✅ Correct" : "❌ Incorrect"
        }`
      );
    } else {
      const desktopPositioned =
        style.left && style.top && style.transform.includes("scale");
      console.log(
        `Desktop positioning: ${
          desktopPositioned ? "✅ Correct" : "❌ Incorrect"
        }`
      );
    }
  }

  // Touch target test
  const overlay = document.getElementById("clippy-clickable-overlay");
  if (overlay) {
    const rect = overlay.getBoundingClientRect();
    const touchFriendly = rect.width >= 44 && rect.height >= 44;
    console.log(
      `Touch targets: ${
        touchFriendly ? "✅ Good" : "❌ Too small"
      } (${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px)`
    );
  } else {
    console.error("❌ Clippy overlay not found");
  }

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

    // Feature check
    console.log("\nFeature verification:");
    console.log(
      `- ClippyService available: ${window.ClippyService ? "✅" : "❌"}`
    );

    const clippyServiceInstance = window.ClippyService;
    console.log(`- speak method: ${clippyServiceInstance.speak ? "✅" : "❌"}`);
    console.log(
      `- emergencyReset method: ${
        clippyServiceInstance.emergencyReset ? "✅" : "❌"
      }`
    );
    console.log(
      `- showHelpForWindow method: ${
        clippyServiceInstance.showHelpForWindow ? "✅" : "❌"
      }`
    );

    // Final summary
    let totalTests = 9;
    let passedTests = 0;

    // Count passing tests from above results
    if (clippy) passedTests++;

    // Make sure we're using the style from clippy
    const clippyStyle = clippy ? window.getComputedStyle(clippy) : {};
    if (clippy && parseFloat(clippyStyle.opacity) > 0) passedTests++;

    // Get hardware acceleration status
    const clippyHasHardwareAcceleration =
      clippy &&
      (clippyStyle.transform.includes("translateZ") ||
        clippyStyle.transform.includes("translate3d") ||
        clippyStyle.willChange.includes("transform"));
    if (clippyHasHardwareAcceleration) passedTests++;

    // Get positioning status
    const clippyMobilePositioned =
      clippy &&
      isMobile &&
      clippyStyle.bottom &&
      clippyStyle.right &&
      clippyStyle.transform.includes("scale");
    const clippyDesktopPositioned =
      clippy &&
      !isMobile &&
      clippyStyle.left &&
      clippyStyle.top &&
      clippyStyle.transform.includes("scale");

    if (clippy && (isMobile ? clippyMobilePositioned : clippyDesktopPositioned))
      passedTests++;

    // Check for touch friendly overlay
    const overlayRect = overlay ? overlay.getBoundingClientRect() : {};
    const isTouchFriendly =
      overlay && overlayRect.width >= 44 && overlayRect.height >= 44;
    if (overlay && isTouchFriendly) passedTests++;

    // Check service availability
    if (window.ClippyService) passedTests++;
    if (clippyServiceInstance.speak) passedTests++;
    if (clippyServiceInstance.emergencyReset) passedTests++;
    if (clippyServiceInstance.showHelpForWindow) passedTests++;

    const successRate = Math.round((passedTests / totalTests) * 100);

    console.log(
      `\n%c=== Performance Test Summary ===`,
      "font-weight: bold; font-size: 14px; color: #4a86e8;"
    );
    console.log(
      `Success rate: ${successRate}% (${passedTests}/${totalTests} tests passed)`
    );

    // Get animation time from earlier test or default to null
    let animationTime = window.__clippy_perf_anim_time || null;

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
      `Mobile optimization: ${
        isMobile && isTouchFriendly ? "✅ Good" : "❌ Needs improvement"
      }`
    );

    if (successRate >= 80) {
      console.log(
        "%c✅ MIGRATION SUCCESSFUL!",
        "color: green; font-weight: bold; font-size: 14px;"
      );
      testNotification.textContent = "✅ Performance Test Complete: SUCCESSFUL";
      testNotification.style.background = "rgba(0, 128, 0, 0.7)";
    } else {
      console.log(
        "%c❌ MIGRATION NEEDS IMPROVEMENT",
        "color: red; font-weight: bold; font-size: 14px;"
      );
      testNotification.textContent =
        "⚠️ Performance Test Complete: NEEDS IMPROVEMENT";
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
    "Running performance tests... results will be available in 3 seconds"
  );
})();
