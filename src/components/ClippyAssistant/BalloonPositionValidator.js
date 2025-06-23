// BalloonPositionValidator.js - Comprehensive validation script for balloon positioning
// Tests all balloon types against all agents to ensure consistent 1px gap positioning

/**
 * Comprehensive Balloon Position Validation System
 * Tests all balloon types against all agents for consistent positioning
 */
class BalloonPositionValidator {
  constructor() {
    this.agents = ["Clippy", "Links", "Bonzi", "Genius", "Merlin", "F1"];
    this.balloonTypes = {
      welcome: () => window.showWelcomeBalloon?.(),
      help: () => window.showHelpBalloon?.(),
      error: () => window.showErrorBalloon?.("Test error message"),
      tips: () => window.showTipsBalloon?.(),
      statement1: () => window.showStatementBalloon1?.(),
      statement2: () => window.showStatementBalloon2?.(),
      statement3: () => window.showStatementBalloon3?.(),
      statement4: () => window.showStatementBalloon4?.(),
      observation: () => window.showObservationBalloon?.("idle"),
      tip: () => window.showTipBalloon?.("dragClippy"),
      custom: () => window.showCustomBalloon?.("Test custom balloon", 5000),
    };
    this.validationResults = [];
    this.isValidating = false;
  }

  /**
   * Test all balloon types against all agents
   */
  async testAllBalloonPositioning() {
    if (this.isValidating) {
      console.warn("🔍 Validation already in progress. Please wait...");
      return;
    }

    this.isValidating = true;
    this.validationResults = [];

    console.group(`🎈 COMPREHENSIVE BALLOON POSITIONING VALIDATION`);
    console.log(
      `Testing ${Object.keys(this.balloonTypes).length} balloon types across ${
        this.agents.length
      } agents`
    );
    console.log(
      `Expected result: All balloons should appear 1px above agent overlay`
    );
    console.log("═".repeat(80));

    try {
      for (const agent of this.agents) {
        console.group(`🤖 Testing Agent: ${agent}`);

        // Switch to agent first
        await this.switchToAgent(agent);
        await this.waitForAgentSwitch(agent);

        for (const [balloonType, balloonFunction] of Object.entries(
          this.balloonTypes
        )) {
          const result = await this.testBalloonType(
            balloonType,
            agent,
            balloonFunction
          );
          this.validationResults.push(result);

          // Log individual result
          const status = result.isValid ? "✅" : "❌";
          const gap =
            result.gap !== null ? `${result.gap.toFixed(1)}px` : "N/A";
          const expected = result.isValid ? "CORRECT" : "INCORRECT";

          console.log(
            `${status} ${balloonType} balloon: ${gap} gap - ${expected}`
          );

          if (!result.isValid && result.error) {
            console.warn(`   ⚠️  ${result.error}`);
          }

          // Close any open balloons before next test
          await this.closeBalloons();
          await this.wait(200); // Brief pause between tests
        }

        console.groupEnd();
        await this.wait(500); // Pause between agents
      }

      // Generate summary report
      this.generateSummaryReport();
    } catch (error) {
      console.error("❌ Validation failed:", error);
    } finally {
      this.isValidating = false;
      console.groupEnd();
    }
  }

  /**
   * Test specific balloon type with specific agent
   */
  async testBalloonType(balloonType, agentName, balloonFunction) {
    const result = {
      balloonType,
      agentName,
      isValid: false,
      gap: null,
      error: null,
      timestamp: Date.now(),
    };

    try {
      // Ensure agent is active
      const agentElement = document.querySelector(".clippy");
      const overlayElement = document.getElementById(
        "clippy-clickable-overlay"
      );

      if (!agentElement || !overlayElement) {
        result.error = "Agent or overlay element not found";
        return result;
      }

      // Show the balloon
      const balloonShown = balloonFunction();
      if (!balloonShown) {
        result.error = "Balloon function failed to show balloon";
        return result;
      }

      // Wait for balloon to appear
      await this.wait(300);

      // Find the balloon element
      const balloonElement = document.querySelector(".custom-clippy-balloon");
      if (!balloonElement) {
        result.error = "Balloon element not found in DOM";
        return result;
      }

      // Calculate positioning gap
      const gap = this.calculatePositioningGap(balloonElement, overlayElement);
      result.gap = gap;

      // Validate the gap (should be 1px ± 2px tolerance)
      const tolerance = 2;
      const expectedGap = 1;
      result.isValid = Math.abs(gap - expectedGap) <= tolerance;

      if (!result.isValid) {
        if (gap > expectedGap + tolerance) {
          result.error = `Gap too large: ${gap.toFixed(1)}px (expected ~1px)`;
        } else if (gap < expectedGap - tolerance) {
          result.error = `Gap too small: ${gap.toFixed(1)}px (expected ~1px)`;
        }
      }
    } catch (error) {
      result.error = `Exception during test: ${error.message}`;
    }

    return result;
  }

  /**
   * Calculate gap between balloon bottom and overlay top
   */
  calculatePositioningGap(balloonElement, overlayElement) {
    const balloonRect = balloonElement.getBoundingClientRect();
    const overlayRect = overlayElement.getBoundingClientRect();

    // Gap = overlay top - balloon bottom
    const gap = overlayRect.top - balloonRect.bottom;
    return gap;
  }

  /**
   * Switch to specific agent
   */
  async switchToAgent(agentName) {
    try {
      // Try multiple methods to switch agent
      if (window.switchToAgent) {
        window.switchToAgent(agentName);
      } else if (window.clippy && window.clippy.switchAgent) {
        window.clippy.switchAgent(agentName);
      } else {
        // Manual agent switching via DOM
        const agentElement = document.querySelector(".clippy");
        if (agentElement) {
          agentElement.setAttribute("data-agent", agentName);

          // Trigger agent change event if available
          if (window.selectedAIAgent !== undefined) {
            window.selectedAIAgent = agentName;
          }

          // Dispatch custom event
          window.dispatchEvent(
            new CustomEvent("agentChanged", {
              detail: { agent: agentName },
            })
          );
        }
      }
    } catch (error) {
      console.warn(
        `⚠️  Could not switch to agent ${agentName}:`,
        error.message
      );
    }
  }

  /**
   * Wait for agent switch to complete
   */
  async waitForAgentSwitch(expectedAgent) {
    const maxWait = 2000; // 2 seconds max
    const checkInterval = 100; // Check every 100ms
    let elapsed = 0;

    while (elapsed < maxWait) {
      const agentElement = document.querySelector(".clippy");
      const currentAgent =
        agentElement?.getAttribute("data-agent") ||
        window.selectedAIAgent ||
        "Clippy";

      if (currentAgent === expectedAgent) {
        return true;
      }

      await this.wait(checkInterval);
      elapsed += checkInterval;
    }

    console.warn(`⚠️  Agent switch to ${expectedAgent} may not have completed`);
    return false;
  }

  /**
   * Close any open balloons
   */
  async closeBalloons() {
    // Close custom balloons
    if (window.hideCustomBalloon) {
      window.hideCustomBalloon();
    }

    // Close chat balloons
    if (window.hideChatBalloon) {
      window.hideChatBalloon();
    }

    // Force remove any balloon elements
    const balloons = document.querySelectorAll(
      ".custom-clippy-balloon, .custom-clippy-chat-balloon"
    );
    balloons.forEach((balloon) => balloon.remove());
  }

  /**
   * Generate comprehensive summary report
   */
  generateSummaryReport() {
    console.log("═".repeat(80));
    console.group(`📊 VALIDATION SUMMARY REPORT`);

    const totalTests = this.validationResults.length;
    const passedTests = this.validationResults.filter((r) => r.isValid).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(`📈 Overall Results:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} ✅`);
    console.log(`   Failed: ${failedTests} ❌`);
    console.log(`   Success Rate: ${successRate}%`);
    console.log("");

    // Group results by agent
    const byAgent = {};
    this.validationResults.forEach((result) => {
      if (!byAgent[result.agentName]) {
        byAgent[result.agentName] = { passed: 0, failed: 0, total: 0 };
      }
      byAgent[result.agentName].total++;
      if (result.isValid) {
        byAgent[result.agentName].passed++;
      } else {
        byAgent[result.agentName].failed++;
      }
    });

    console.log(`🤖 Results by Agent:`);
    Object.entries(byAgent).forEach(([agent, stats]) => {
      const rate = ((stats.passed / stats.total) * 100).toFixed(1);
      const status = stats.failed === 0 ? "✅" : "❌";
      console.log(
        `   ${status} ${agent}: ${stats.passed}/${stats.total} (${rate}%)`
      );
    });
    console.log("");

    // Group results by balloon type
    const byBalloon = {};
    this.validationResults.forEach((result) => {
      if (!byBalloon[result.balloonType]) {
        byBalloon[result.balloonType] = { passed: 0, failed: 0, total: 0 };
      }
      byBalloon[result.balloonType].total++;
      if (result.isValid) {
        byBalloon[result.balloonType].passed++;
      } else {
        byBalloon[result.balloonType].failed++;
      }
    });

    console.log(`🎈 Results by Balloon Type:`);
    Object.entries(byBalloon).forEach(([balloon, stats]) => {
      const rate = ((stats.passed / stats.total) * 100).toFixed(1);
      const status = stats.failed === 0 ? "✅" : "❌";
      console.log(
        `   ${status} ${balloon}: ${stats.passed}/${stats.total} (${rate}%)`
      );
    });
    console.log("");

    // Show detailed failures
    const failures = this.validationResults.filter((r) => !r.isValid);
    if (failures.length > 0) {
      console.log(`❌ Detailed Failures:`);
      failures.forEach((failure) => {
        console.log(
          `   • ${failure.balloonType} + ${failure.agentName}: ${failure.error}`
        );
      });
    } else {
      console.log(
        `🎉 No failures detected! All balloons positioned correctly.`
      );
    }

    console.groupEnd();
  }

  /**
   * Test specific balloon with specific agent (individual test)
   */
  async testBalloonAgent(balloonType, agentName) {
    if (!this.balloonTypes[balloonType]) {
      console.error(`❌ Unknown balloon type: ${balloonType}`);
      console.log(
        `Available types: ${Object.keys(this.balloonTypes).join(", ")}`
      );
      return;
    }

    if (!this.agents.includes(agentName)) {
      console.error(`❌ Unknown agent: ${agentName}`);
      console.log(`Available agents: ${this.agents.join(", ")}`);
      return;
    }

    console.group(`🔍 Testing ${balloonType} balloon with ${agentName} agent`);

    await this.switchToAgent(agentName);
    await this.waitForAgentSwitch(agentName);

    const result = await this.testBalloonType(
      balloonType,
      agentName,
      this.balloonTypes[balloonType]
    );

    const status = result.isValid ? "✅ PASS" : "❌ FAIL";
    const gap = result.gap !== null ? `${result.gap.toFixed(1)}px` : "N/A";

    console.log(`Result: ${status}`);
    console.log(`Gap: ${gap} (expected: ~1px)`);
    if (!result.isValid && result.error) {
      console.log(`Error: ${result.error}`);
    }

    console.groupEnd();

    await this.closeBalloons();
    return result;
  }

  /**
   * Validate all balloons are using consistent gap measurements
   */
  async validateBalloonGaps() {
    console.group(`📏 BALLOON GAP CONSISTENCY CHECK`);
    console.log("Testing gap measurements across different balloon types...");

    const testBalloons = ["welcome", "help", "custom"];
    const testAgent = "Clippy"; // Use Clippy as baseline

    await this.switchToAgent(testAgent);
    await this.waitForAgentSwitch(testAgent);

    const gaps = [];

    for (const balloonType of testBalloons) {
      const result = await this.testBalloonType(
        balloonType,
        testAgent,
        this.balloonTypes[balloonType]
      );
      if (result.gap !== null) {
        gaps.push({ type: balloonType, gap: result.gap });
        console.log(`${balloonType}: ${result.gap.toFixed(1)}px gap`);
      }
      await this.closeBalloons();
      await this.wait(200);
    }

    // Check consistency
    if (gaps.length > 1) {
      const avgGap =
        gaps.reduce((sum, item) => sum + item.gap, 0) / gaps.length;
      const maxDeviation = Math.max(
        ...gaps.map((item) => Math.abs(item.gap - avgGap))
      );

      console.log("");
      console.log(`Average gap: ${avgGap.toFixed(1)}px`);
      console.log(`Max deviation: ${maxDeviation.toFixed(1)}px`);

      if (maxDeviation <= 2) {
        console.log("✅ Gap consistency: GOOD (deviation ≤ 2px)");
      } else {
        console.log("❌ Gap consistency: POOR (deviation > 2px)");
      }
    }

    console.groupEnd();
  }

  /**
   * Utility: Wait for specified milliseconds
   */
  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get validation results
   */
  getResults() {
    return this.validationResults;
  }

  /**
   * Clear validation results
   */
  clearResults() {
    this.validationResults = [];
  }
}

// Create global instance and expose functions
const balloonValidator = new BalloonPositionValidator();

// Export validation functions to global scope
window.testAllBalloonPositioning = () =>
  balloonValidator.testAllBalloonPositioning();
window.testBalloonType = (balloonType, agentName) =>
  balloonValidator.testBalloonAgent(balloonType, agentName);
window.validateBalloonGaps = () => balloonValidator.validateBalloonGaps();
window.getBalloonValidationResults = () => balloonValidator.getResults();
window.clearBalloonValidationResults = () => balloonValidator.clearResults();

// Quick test functions for common scenarios
window.quickTestWelcomeBalloons = async () => {
  console.group("🚀 Quick Test: Welcome Balloons Across All Agents");
  for (const agent of balloonValidator.agents) {
    await balloonValidator.testBalloonAgent("welcome", agent);
    await balloonValidator.wait(500);
  }
  console.groupEnd();
};

window.quickTestHelpBalloons = async () => {
  console.group("🚀 Quick Test: Help Balloons Across All Agents");
  for (const agent of balloonValidator.agents) {
    await balloonValidator.testBalloonAgent("help", agent);
    await balloonValidator.wait(500);
  }
  console.groupEnd();
};

// Log availability
console.log(`
🎈 Balloon Position Validator loaded!

Available functions:
• testAllBalloonPositioning()           - Test all combinations
• testBalloonType(type, agent)          - Test specific balloon+agent
• validateBalloonGaps()                 - Check gap consistency
• quickTestWelcomeBalloons()            - Test welcome across all agents
• quickTestHelpBalloons()               - Test help across all agents
• getBalloonValidationResults()         - Get results
• clearBalloonValidationResults()       - Clear results

Balloon types: ${Object.keys(balloonValidator.balloonTypes).join(", ")}
Agents: ${balloonValidator.agents.join(", ")}

Example usage:
testBalloonType('welcome', 'Bonzi')
testAllBalloonPositioning()
`);

export default balloonValidator;
