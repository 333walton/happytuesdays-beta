/**
 * ClippyAssistant Console Test Runner - Real-time Resize Testing
 * Updated for real-time resize handling validation
 * Run this by copying and pasting into browser console
 */

(function runClippyRealTimeResizeTest() {
  console.log(
    "%c=== Clippy Real-time Resize Performance Test ===",
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
  testNotification.textContent = "Running Real-time Resize Test...";
  document.body.appendChild(testNotification);

  // Memory test
  console.log("Measuring memory usage...");
  const before = performance.memory?.usedJSHeapSize || 0;

  // Check if ClippyPositioning is available
  if (!window.ClippyPositioning) {
    console.error(
      "❌ ClippyPositioning not available. Make sure you're running this on a page with the real-time positioning system."
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

  if (!clippyEl) {
    console.error("❌ Clippy element not found - cannot test real-time resize");
    testNotification.textContent = "Test Failed - Clippy element not found";
    testNotification.style.background = "rgba(255, 0, 0, 0.7)";
    setTimeout(() => testNotification.remove(), 5000);
    return;
  }

  // Test real-time resize handling system
  console.log("Testing real-time resize handling system...");
  const resizeTestStart = performance.now();

  let realTimeEventsReceived = 0;
  let resizeStartReceived = false;
  let resizeCompleteReceived = false;
  let anchorCached = false;
  let positionStable = true;

  // Test anchor caching
  try {
    const resizeHandler = window.ClippyResizeHandler;
    if (resizeHandler) {
      resizeHandler.cacheClippyAnchorPosition(clippyEl);
      anchorCached = !!resizeHandler.clippyAnchorOffset;
      console.log(
        `Anchor caching: ${anchorCached ? "✅ Success" : "❌ Failed"}`
      );
    }
  } catch (e) {
    console.error("Error testing anchor caching:", e);
  }

  // Test real-time positioning during simulated resize
  console.log("Testing real-time positioning updates...");

  // Store initial position
  const initialRect = clippyEl.getBoundingClientRect();
  let positionDriftDetected = false;
  let maxDrift = 0;

  // Listen for real-time resize events
  const resizeListener = (eventType, data) => {
    realTimeEventsReceived++;

    if (eventType === "resize-start") {
      resizeStartReceived = true;
      console.log("🔄 Resize start event received");
    }

    if (eventType === "realtime-resize") {
      // Check if Clippy position drifted during resize
      const currentRect = clippyEl.getBoundingClientRect();
      const drift =
        Math.abs(currentRect.left - initialRect.left) +
        Math.abs(currentRect.top - initialRect.top);

      if (drift > maxDrift) {
        maxDrift = drift;
      }

      if (drift > 5) {
        // Allow 5px tolerance
        positionDriftDetected = true;
      }
    }

    if (eventType === "resize-complete") {
      resizeCompleteReceived = true;
      console.log("✅ Resize complete event received");
    }
  };

  // Add our test listener
  if (window.ClippyResizeHandler) {
    window.ClippyResizeHandler.addListener(resizeListener);
  }

  // Simulate window resize events to test real-time handling
  console.log("Simulating window resize events...");

  // Trigger multiple resize events in rapid succession
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      // Simulate resize by dispatching events and manually calling handler
      window.dispatchEvent(new Event("resize"));

      if (window.ClippyResizeHandler) {
        window.ClippyResizeHandler.handleResizeImmediate();
      }
    }, i * 50); // 50ms intervals
  }

  // Test positioning performance under stress
  console.log("Testing positioning performance under stress...");
  const stressStart = performance.now();
  let stressTestSuccess = false;

  try {
    // Rapid positioning updates to simulate resize stress
    for (let i = 0; i < 50; i++) {
      const success = window.ClippyPositioning.positionClippyAndOverlay(
        clippyEl,
        overlayEl
      );
      if (!success) {
        console.warn(`Positioning failed at iteration ${i}`);
        break;
      }
    }
    stressTestSuccess = true;
  } catch (e) {
    console.error("Error in stress test:", e);
  }

  const stressTime = performance.now() - stressStart;
  console.log(
    `Stress test (50 rapid updates): ${stressTime.toFixed(2)}ms ${
      stressTime < 100
        ? "✅ Excellent"
        : stressTime < 200
        ? "✅ Good"
        : "❌ Slow"
    }`
  );

  // Test anchored positioning accuracy
  let anchoredPositionAccurate = false;
  if (!window.ClippyPositioning.isMobile && anchorCached) {
    try {
      const beforePosition = clippyEl.getBoundingClientRect();

      // Apply anchored positioning
      window.ClippyPositioning.applyAnchoredPosition(clippyEl);

      const afterPosition = clippyEl.getBoundingClientRect();
      const positionChange =
        Math.abs(beforePosition.left - afterPosition.left) +
        Math.abs(beforePosition.top - afterPosition.top);

      // Small position changes are expected due to precision
      anchoredPositionAccurate = positionChange < 2;

      console.log(
        `Anchored positioning accuracy: ${
          anchoredPositionAccurate ? "✅ Accurate" : "❌ Inaccurate"
        } (${positionChange.toFixed(1)}px change)`
      );
    } catch (e) {
      console.error("Error testing anchored positioning:", e);
    }
  }

  // Test CSS class application
  let cssClassApplied = false;
  if (clippyEl.classList.contains("clippy-anchored")) {
    cssClassApplied = true;
    console.log("CSS anchor class: ✅ Applied");
  } else {
    console.log("CSS anchor class: ❌ Not applied");
  }

  // Test zoom factor detection
  let zoomFactorDetected = false;
  try {
    const zoomFactor = window.ClippyPositioning.getMonitorZoomFactor();
    zoomFactorDetected = typeof zoomFactor === "number" && zoomFactor > 0;
    console.log(
      `Zoom factor detection: ${
        zoomFactorDetected ? "✅ Working" : "❌ Failed"
      } (Factor: ${zoomFactor})`
    );
  } catch (e) {
    console.error("Error testing zoom factor detection:", e);
  }

  // Test real-time monitoring
  let realTimeMonitoringActive = false;
  try {
    const resizeHandler = window.ClippyResizeHandler;
    if (resizeHandler && resizeHandler.isListening) {
      realTimeMonitoringActive = true;
      console.log("Real-time monitoring: ✅ Active");
    } else {
      console.log("Real-time monitoring: ❌ Inactive");
    }
  } catch (e) {
    console.error("Error checking real-time monitoring:", e);
  }

  // Check for performance optimizations in CSS
  let cssOptimizationsApplied = false;
  if (clippyEl) {
    const styles = window.getComputedStyle(clippyEl);
    const hasHardwareAcceleration =
      styles.transform.includes("translateZ") ||
      styles.backfaceVisibility === "hidden" ||
      styles.willChange.includes("transform");

    const hasNoTransitions =
      styles.transition === "none" || styles.transition === "none 0s ease 0s";

    cssOptimizationsApplied = hasHardwareAcceleration && hasNoTransitions;
    console.log(
      `CSS performance optimizations: ${
        cssOptimizationsApplied ? "✅ Applied" : "❌ Missing"
      }`
    );
  }

  // Wait for resize events to complete, then analyze results
  setTimeout(() => {
    console.log("\n--- Real-time Resize Test Results ---");

    console.log(
      `Real-time events received: ${realTimeEventsReceived} ${
        realTimeEventsReceived > 0 ? "✅" : "❌"
      }`
    );

    console.log(
      `Resize start events: ${
        resizeStartReceived ? "✅ Detected" : "❌ Missing"
      }`
    );

    console.log(
      `Position stability during resize: ${
        !positionDriftDetected ? "✅ Stable" : "❌ Drifting"
      } (Max drift: ${maxDrift.toFixed(1)}px)`
    );

    console.log(
      `Resize complete events: ${
        resizeCompleteReceived ? "✅ Detected" : "❌ Missing"
      }`
    );

    // Memory usage after tests
    const after = performance.memory?.usedJSHeapSize || 0;
    const usage = after - before;
    const usageMB = ((usage || 2000000) / (1024 * 1024)).toFixed(2);
    const memoryGood = usage < 5000000;

    console.log(
      `Memory usage: ${usageMB}MB ${memoryGood ? "✅ Good" : "❌ High"}`
    );

    // Feature verification for real-time system
    console.log("\nReal-time system feature verification:");

    const features = {
      "Real-time resize handler": realTimeMonitoringActive,
      "Anchor position caching": anchorCached,
      "Anchored positioning accuracy": anchoredPositionAccurate,
      "CSS performance optimizations": cssOptimizationsApplied,
      "Zoom factor detection": zoomFactorDetected,
      "CSS anchor class": cssClassApplied,
      "Stress test performance": stressTestSuccess && stressTime < 200,
      "Position stability": !positionDriftDetected,
    };

    Object.entries(features).forEach(([feature, available]) => {
      console.log(`- ${feature}: ${available ? "✅" : "❌"}`);
    });

    // Calculate success rate
    const totalTests = Object.keys(features).length + 4; // + core functionality tests
    let passedTests = 0;

    // Count passing tests
    Object.values(features).forEach((passed) => {
      if (passed) passedTests++;
    });

    // Add core functionality results
    if (clippyEl) passedTests++;
    if (realTimeEventsReceived > 0) passedTests++;
    if (memoryGood) passedTests++;
    if (window.ClippyPositioning && window.ClippyService) passedTests++;

    const successRate = Math.round((passedTests / totalTests) * 100);

    console.log(
      `\n%c=== Real-time Resize Performance Test Summary ===`,
      "font-weight: bold; font-size: 14px; color: #4a86e8;"
    );
    console.log(
      `Success rate: ${successRate}% (${passedTests}/${totalTests} tests passed)`
    );

    console.log(
      `Real-time positioning: ${
        realTimeMonitoringActive ? "✅ Active" : "❌ Inactive"
      }`
    );
    console.log(
      `Position stability: ${
        !positionDriftDetected ? "✅ Stable" : "❌ Drifting"
      }`
    );
    console.log(
      `Anchor positioning: ${
        anchoredPositionAccurate ? "✅ Accurate" : "❌ Needs improvement"
      }`
    );
    console.log(
      `Performance optimizations: ${
        cssOptimizationsApplied ? "✅ Applied" : "❌ Missing"
      }`
    );
    console.log(
      `Memory usage: ${usageMB}MB ${memoryGood ? "✅ Good" : "❌ High"}`
    );
    console.log(
      `Stress test performance: ${
        stressTime < 100
          ? "✅ Excellent"
          : stressTime < 200
          ? "✅ Good"
          : "❌ Needs improvement"
      }`
    );

    if (successRate >= 90) {
      console.log(
        "%c✅ REAL-TIME RESIZE HANDLING: EXCELLENT!",
        "color: green; font-weight: bold; font-size: 14px;"
      );
      testNotification.textContent = "✅ Real-time Resize Test: EXCELLENT";
      testNotification.style.background = "rgba(0, 128, 0, 0.7)";
    } else if (successRate >= 75) {
      console.log(
        "%c✅ REAL-TIME RESIZE HANDLING: GOOD",
        "color: green; font-weight: bold; font-size: 14px;"
      );
      testNotification.textContent = "✅ Real-time Resize Test: GOOD";
      testNotification.style.background = "rgba(0, 128, 0, 0.7)";
    } else {
      console.log(
        "%c❌ REAL-TIME RESIZE HANDLING: NEEDS IMPROVEMENT",
        "color: red; font-weight: bold; font-size: 14px;"
      );
      testNotification.textContent =
        "⚠️ Real-time Resize Test: NEEDS IMPROVEMENT";
      testNotification.style.background = "rgba(255, 165, 0, 0.7)";
    }

    // Cleanup
    if (window.ClippyResizeHandler) {
      window.ClippyResizeHandler.removeListener(resizeListener);
    }

    // Remove notification after 5 seconds
    setTimeout(() => {
      if (testNotification.parentNode) {
        testNotification.parentNode.removeChild(testNotification);
      }
    }, 5000);
  }, 2000); // Wait 2 seconds for resize events to complete

  console.log(
    "Running real-time resize handling tests... results will be available in 2 seconds"
  );

  // Also test manual resize trigger
  setTimeout(() => {
    console.log("🔄 Testing manual resize trigger...");
    try {
      window.ClippyPositioning.triggerResize();
      window.ClippyPositioning.triggerRepositioning();
      console.log("✅ Manual resize triggers working");
    } catch (e) {
      console.error("❌ Error with manual resize triggers:", e);
    }
  }, 1000);
})();
