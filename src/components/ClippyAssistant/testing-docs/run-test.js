#!/usr/bin/env node

/**
 * Command-line runner for the ClippyAssistant performance test
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const os = require("os");

console.log(
  "\x1b[36m%s\x1b[0m",
  "=== ClippyAssistant Performance Test Runner ==="
);
console.log(
  "This script helps you run the performance tests for the ClippyAssistant component."
);

// Check if the application is running
console.log("\nChecking if development server is running...");

// Different commands based on OS
const isWindows = os.platform() === "win32";
const checkServerCmd = isWindows
  ? "netstat -ano | findstr :3000"
  : "lsof -i :3000";

exec(checkServerCmd, (error, stdout) => {
  const serverRunning = !error && stdout.trim() !== "";

  if (serverRunning) {
    console.log("\x1b[32m%s\x1b[0m", "✓ Development server is running");
    console.log("\nThere are 3 ways to run the performance test:");

    console.log("\n1. \x1b[33mBrowser Console Method (Recommended)\x1b[0m");
    console.log(
      "   Open your browser's console (F12) and paste the console-test-runner.js content"
    );

    try {
      const consoleRunnerPath = path.join(__dirname, "console-test-runner.js");
      const consoleRunnerContent = fs.readFileSync(consoleRunnerPath, "utf8");

      console.log(
        "\n   Console script ready! Open http://localhost:3000 in your browser,"
      );
      console.log(
        "   open developer tools (F12), go to Console tab, and paste the script content."
      );

      // Attempt to copy to clipboard based on OS
      if (isWindows) {
        const tempFile = path.join(os.tmpdir(), "clippy-test-runner.js");
        fs.writeFileSync(tempFile, consoleRunnerContent);
        exec(`type "${tempFile}" | clip`, (err) => {
          if (!err) {
            console.log(
              "\n   \x1b[32m✓ Script copied to clipboard!\x1b[0m You can now paste it in the browser console."
            );
          }
        });
      } else if (os.platform() === "darwin") {
        // macOS
        const tempFile = path.join(os.tmpdir(), "clippy-test-runner.js");
        fs.writeFileSync(tempFile, consoleRunnerContent);
        exec(`cat "${tempFile}" | pbcopy`, (err) => {
          if (!err) {
            console.log(
              "\n   \x1b[32m✓ Script copied to clipboard!\x1b[0m You can now paste it in the browser console."
            );
          }
        });
      } else {
        console.log(
          "\n   Note: On Linux, you'll need to manually copy the content of console-test-runner.js"
        );
      }
    } catch (err) {
      console.error(
        "\x1b[31mError reading console-test-runner.js:\x1b[0m",
        err.message
      );
    }

    console.log("\n2. \x1b[33mTest Runner HTML Page\x1b[0m");
    console.log(
      '   Open test-runner.html in your browser and click "Run Performance Test"'
    );

    // Attempt to open the HTML file
    const htmlPath = path.join(__dirname, "test-runner.html");
    if (fs.existsSync(htmlPath)) {
      const openCmd = isWindows
        ? "start"
        : os.platform() === "darwin"
        ? "open"
        : "xdg-open";
      console.log(`\n   To open the test page, run: ${openCmd} "${htmlPath}"`);
      console.log("   Or use: npm run open:test-page");
    } else {
      console.error("\x1b[31mError: test-runner.html not found\x1b[0m");
    }

    console.log("\n3. \x1b[33mIntegrated Test Runner\x1b[0m");
    console.log(
      "   This method runs the test from your React application code."
    );
    console.log(
      "   Import the run-performance-test.js module and use it in your app."
    );
    console.log("   Example:");
    console.log("   ```javascript");
    console.log(
      '   import runTest from "./components/ClippyAssistant/run-performance-test";'
    );
    console.log(
      "   // Call this when appropriate, such as after component mount"
    );
    console.log("   ```");
  } else {
    console.log("\x1b[33m%s\x1b[0m", "⚠ Development server is not running");
    console.log(
      "Start the development server with npm start before running tests."
    );
    console.log(
      "This will allow you to use the Browser Console Method (recommended)."
    );

    console.log(
      "\nAlternatively, you can use the standalone Test Runner HTML Page:"
    );
    const htmlPath = path.join(__dirname, "test-runner.html");
    if (fs.existsSync(htmlPath)) {
      const openCmd = isWindows
        ? "start"
        : os.platform() === "darwin"
        ? "open"
        : "xdg-open";
      console.log(`Run: ${openCmd} "${htmlPath}"`);
      console.log("Or use: npm run open:test-page");
    }
  }

  console.log("\n\x1b[36m%s\x1b[0m", "=== Additional Information ===");
  console.log("For more details, see PERFORMANCE_TESTING.md");
});
