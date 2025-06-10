// SIMPLE AGENT TEST - No Import Issues
// Copy & Paste into Browser Console
// ===================================

console.log("🎭 Simple Agent Test - Fixed for Compilation");

// Test if agent switching works
const quickTest = (agentName) => {
  console.log(`🔄 Testing: ${agentName}`);
  
  if (window.setCurrentAgent) {
    window.setCurrentAgent(agentName);
    console.log(`✅ Switched to ${agentName}`);
    
    // Show welcome message
    setTimeout(() => {
      if (window.showClippyCustomBalloon) {
        window.showClippyCustomBalloon(`Hello! I'm ${agentName}!`);
      }
    }, 1000);
  } else {
    console.log("❌ setCurrentAgent not available");
  }
};

// All 10 agents
const ALL_AGENTS = [
  "Clippy", "Bonzi", "F1", "Genie", "Genius", 
  "Links", "Merlin", "Peedy", "Rocky", "Rover"
];

// Simple commands
window.test = {
  // Test individual agents
  genius: () => quickTest("Genius"),
  f1: () => quickTest("F1"),
  peedy: () => quickTest("Peedy"), 
  rocky: () => quickTest("Rocky"),
  clippy: () => quickTest("Clippy"),
  
  // Test all
  all: () => {
    console.log("🚀 Testing all 10 agents...");
    ALL_AGENTS.forEach((agent, i) => {
      setTimeout(() => quickTest(agent), i * 2500);
    });
  },
  
  // Test new ones only
  new: () => {
    console.log("🆕 Testing new agents...");
    ["Genius", "F1", "Peedy", "Rocky"].forEach((agent, i) => {
      setTimeout(() => quickTest(agent), i * 2000);
    });
  },
  
  // Open context menu
  menu: () => {
    if (window.showClippyContextMenu) {
      window.showClippyContextMenu(400, 300);
    } else if (window.forceShowContextMenu) {
      window.forceShowContextMenu();
    }
  }
};

console.log("💡 Available Tests:");
console.log("test.genius() - Test Genius agent");
console.log("test.f1() - Test F1 robot");
console.log("test.peedy() - Test Peedy parrot");
console.log("test.rocky() - Test Rocky dog");
console.log("test.new() - Test all 4 new agents");
console.log("test.all() - Test all 10 agents");
console.log("test.menu() - Open context menu");

// Quick check
if (window.setCurrentAgent) {
  console.log("✅ Ready! Try: test.genius()");
} else {
  console.log("⏳ Waiting for app to load...");
}