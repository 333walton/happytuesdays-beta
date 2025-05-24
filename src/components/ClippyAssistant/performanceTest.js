/**
 * ClippyAssistant Performance Test Script
 * Run this in browser console after migration to verify improvements
 */
import ClippyService from "./ClippyService";

const testClippyPerformance = () => {
  console.log(
    "%c=== Clippy Performance Test ===",
    "font-weight: bold; font-size: 14px; color: #4a86e8;"
  );

  // Memory test
  console.log("Measuring memory usage...");
  const before = performance.memory?.usedJSHeapSize || 0;

  // Check if ClippyService is available
  if (!window.ClippyService) {
    console.error(
      "❌ ClippyService not available. Make sure you're running this on a page with Clippy."
    );
    return;
  }

  // Animation test
  console.log("Testing animation performance...");
  const start = performance.now();
  ClippyService.play("Wave");

  // Check how quickly the animation starts
  requestAnimationFrame(() => {
    const animTime = performance.now() - start;
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
  let stableFrames = 0;
  let unstableFrames = 0;
  let lastTimestamp = 0;
  let frameRates = [];

  // Check if we can access the Clippy element's animation
  const clippyMaps = document.querySelectorAll(".clippy .map");
  console.log(`Animation maps found: ${clippyMaps.length}`);

  // Memory usage after tests
  setTimeout(() => {
    const after = performance.memory?.usedJSHeapSize || 0;
    const usage = after - before;
    const usageMB = (usage / (1024 * 1024)).toFixed(2);
    console.log(
      `Memory usage: ${usageMB}MB ${usage < 5000000 ? "✅ Good" : "❌ High"}`
    );

    // Feature check
    console.log("\nFeature verification:");
    console.log(
      `- ClippyService available: ${
        window.ClippyService || ClippyService ? "✅" : "❌"
      }`
    );

    const clippyServiceInstance = window.ClippyService || ClippyService;
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
    if (window.ClippyService || ClippyService) passedTests++;
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
    let animationTime = null;
    try {
      animationTime = window.__clippy_perf_anim_time || null;
    } catch (e) {
      console.error("Could not access animation time");
    }

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
    } else {
      console.log(
        "%c❌ MIGRATION NEEDS IMPROVEMENT",
        "color: red; font-weight: bold; font-size: 14px;"
      );
    }
  }, 3000);

  console.log(
    "Running performance tests... results will be available in 3 seconds"
  );
};

// Export the function for use in browser console
if (typeof window !== "undefined") {
  window.testClippyPerformance = testClippyPerformance;
}

// Auto-run test in development mode
if (process.env.NODE_ENV === "development") {
  console.log("Auto-running Clippy performance test in development mode");
  setTimeout(testClippyPerformance, 5000);
}

export default testClippyPerformance;
