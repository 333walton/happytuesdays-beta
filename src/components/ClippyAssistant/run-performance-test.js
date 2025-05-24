/**
 * ClippyAssistant Performance Test Runner
 *
 * This script injects the performance test into the running application
 * and executes it, capturing the results.
 */

// Import the test module
import testClippyPerformance from "./performanceTest";

// Wait for the application to fully load before running the test
setTimeout(() => {
  console.log("=== Running ClippyAssistant Performance Test ===");

  // Create a visual indicator in the UI
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

  // Store the original console.log function
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  // Capture test results
  const testResults = [];

  // Override console.log to capture test output
  console.log = function () {
    // Call the original console.log
    originalConsoleLog.apply(console, arguments);

    // Capture the output
    const args = Array.from(arguments);
    const output = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg) : String(arg)
      )
      .join(" ");

    testResults.push({ type: "log", message: output });
  };

  console.error = function () {
    // Call the original console.error
    originalConsoleError.apply(console, arguments);

    // Capture the output
    const args = Array.from(arguments);
    const output = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg) : String(arg)
      )
      .join(" ");

    testResults.push({ type: "error", message: output });
  };

  // Run the test
  try {
    testClippyPerformance();

    // After the test completes (assuming the test takes about 3 seconds)
    setTimeout(() => {
      // Restore original console functions
      console.log = originalConsoleLog;
      console.error = originalConsoleError;

      // Display test results in a more structured format
      console.log("=== ClippyAssistant Performance Test Results ===");
      testResults.forEach((result) => {
        if (result.type === "error") {
          console.error(result.message);
        } else {
          console.log(result.message);
        }
      });

      // Update the notification
      testNotification.textContent = "Performance Test Complete - See Console";
      testNotification.style.background = "rgba(0, 128, 0, 0.7)";

      // Remove the notification after 5 seconds
      setTimeout(() => {
        if (testNotification.parentNode) {
          testNotification.parentNode.removeChild(testNotification);
        }
      }, 5000);
    }, 4000);
  } catch (error) {
    console.error("Error running performance test:", error);

    // Restore original console functions
    console.log = originalConsoleLog;
    console.error = originalConsoleError;

    // Update the notification
    testNotification.textContent = "Performance Test Failed - See Console";
    testNotification.style.background = "rgba(255, 0, 0, 0.7)";

    // Remove the notification after 5 seconds
    setTimeout(() => {
      if (testNotification.parentNode) {
        testNotification.parentNode.removeChild(testNotification);
      }
    }, 5000);
  }
}, 2000);

export default {};
