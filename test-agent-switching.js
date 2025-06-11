#!/usr/bin/env node

// Simple test to verify agent switching functionality
// This script can be run in the browser console to test agent changes

const testAgentSwitching = () => {
  console.log("🧪 TESTING AGENT SWITCHING FUNCTIONALITY\n");
  
  // Test 1: Check if diagnostic function exists
  console.log("Test 1: Checking if diagnostic functions are available...");
  if (typeof window.diagnoseAgentSwitching === 'function') {
    console.log("✅ window.diagnoseAgentSwitching is available");
    window.diagnoseAgentSwitching();
  } else {
    console.log("❌ window.diagnoseAgentSwitching is NOT available");
  }
  
  console.log("\n" + "=".repeat(50) + "\n");
  
  // Test 2: Check current agent
  console.log("Test 2: Checking current agent...");
  if (typeof window.getCurrentAgent === 'function') {
    const currentAgent = window.getCurrentAgent();
    console.log(`✅ Current agent: ${currentAgent}`);
  } else {
    console.log("❌ window.getCurrentAgent is NOT available");
  }
  
  console.log("\n" + "=".repeat(50) + "\n");
  
  // Test 3: Try switching to Merlin
  console.log("Test 3: Attempting to switch to Merlin...");
  if (typeof window.setCurrentAgent === 'function') {
    const result = window.setCurrentAgent('Merlin');
    console.log(`Agent switch result: ${result ? '✅ Success' : '❌ Failed'}`);
    
    // Wait 3 seconds and check current agent
    setTimeout(() => {
      console.log("After 3 seconds...");
      if (typeof window.getCurrentAgent === 'function') {
        const newAgent = window.getCurrentAgent();
        console.log(`Current agent is now: ${newAgent}`);
        
        // Check DOM for visual confirmation
        const clippyEl = document.querySelector('.clippy');
        if (clippyEl) {
          const dataAgent = clippyEl.getAttribute('data-agent');
          console.log(`DOM data-agent attribute: ${dataAgent}`);
          console.log(`Visual verification: ${dataAgent === 'Merlin' ? '✅ Success' : '❌ Failed'}`);
        }
      }
    }, 3000);
  } else {
    console.log("❌ window.setCurrentAgent is NOT available");
  }
  
  console.log("\n" + "=".repeat(50) + "\n");
  
  // Test 4: List available agents
  console.log("Test 4: Listing available agents...");
  if (typeof window.listAvailableAgents === 'function') {
    window.listAvailableAgents();
  } else {
    console.log("❌ window.listAvailableAgents is NOT available");
  }
  
  console.log("\n🎯 TEST COMPLETE - Check results above");
  console.log("💡 To manually test other agents, use: window.setCurrentAgent('AgentName')");
  console.log("🔄 Available agents: Clippy, Links, Bonzi, Genie, Genius, Merlin, F1, Peedy, Rocky, Rover");
};

// Instructions for use
console.log("🔧 Agent Switching Test Script Loaded!");
console.log("Run: testAgentSwitching() to test the functionality");

// Export for browser console use
if (typeof window !== 'undefined') {
  window.testAgentSwitching = testAgentSwitching;
}

// Export for module use
if (typeof module !== 'undefined') {
  module.exports = { testAgentSwitching };
}