// FIXED AGENT TESTING - Uses proper AGENTS constants
// Copy & Paste into Browser Console
// ===================================================

console.log("🎭 Fixed Agent Testing - Using AGENTS Constants");

// All agent constants (these match React95 library)
const AGENT_NAMES = {
  CLIPPY: "Clippy",
  BONZI: "Bonzi", 
  F1: "F1",
  GENIE: "Genie",
  GENIUS: "Genius",
  LINKS: "Links",
  MERLIN: "Merlin",
  PEEDY: "Peedy",
  ROCKY: "Rocky",
  ROVER: "Rover"
};

// Test individual agent
const testAgent = (agentName) => {
  console.log(`🔄 Testing: ${agentName}`);
  
  if (window.setCurrentAgent) {
    try {
      window.setCurrentAgent(agentName);
      console.log(`✅ Switched to ${agentName}`);
      
      // Show welcome balloon
      setTimeout(() => {
        if (window.showClippyCustomBalloon) {
          window.showClippyCustomBalloon(`Hello! I'm ${agentName}!`);
        }
      }, 1000);
      
      return true;
    } catch (error) {
      console.error(`❌ Error switching to ${agentName}:`, error);
      return false;
    }
  } else {
    console.log("❌ setCurrentAgent function not available");
    return false;
  }
};

// Check current state
const checkState = () => {
  console.log("\n🔍 Current State:");
  console.log(`• setCurrentAgent: ${!!window.setCurrentAgent ? '✅' : '❌'}`);
  console.log(`• Clippy element: ${!!document.querySelector('.clippy') ? '✅' : '❌'}`);
  console.log(`• Context menu: ${!!window.showClippyContextMenu ? '✅' : '❌'}`);
  
  const clippyEl = document.querySelector('.clippy');
  if (clippyEl) {
    const currentAgent = clippyEl.getAttribute('data-agent');
    console.log(`• Current agent: ${currentAgent || 'None set'}`);
  }
};

// Quick test commands - using proper agent names
window.agents = {
  // Individual tests
  clippy: () => testAgent(AGENT_NAMES.CLIPPY),
  bonzi: () => testAgent(AGENT_NAMES.BONZI),
  f1: () => testAgent(AGENT_NAMES.F1),
  genie: () => testAgent(AGENT_NAMES.GENIE),
  genius: () => testAgent(AGENT_NAMES.GENIUS),
  links: () => testAgent(AGENT_NAMES.LINKS),
  merlin: () => testAgent(AGENT_NAMES.MERLIN),
  peedy: () => testAgent(AGENT_NAMES.PEEDY),
  rocky: () => testAgent(AGENT_NAMES.ROCKY),
  rover: () => testAgent(AGENT_NAMES.ROVER),
  
  // Test all agents
  all: () => {
    console.log("🚀 Testing all 10 agents...");
    const allAgents = Object.values(AGENT_NAMES);
    allAgents.forEach((agent, i) => {
      setTimeout(() => testAgent(agent), i * 3000);
    });
  },
  
  // Test new agents only
  newOnes: () => {
    console.log("🆕 Testing new agents: Genius, F1, Peedy, Rocky");
    const newAgents = [AGENT_NAMES.GENIUS, AGENT_NAMES.F1, AGENT_NAMES.PEEDY, AGENT_NAMES.ROCKY];
    newAgents.forEach((agent, i) => {
      setTimeout(() => testAgent(agent), i * 2500);
    });
  },
  
  // Open context menu
  menu: () => {
    console.log("🎯 Opening context menu...");
    if (window.showClippyContextMenu) {
      window.showClippyContextMenu(400, 300);
    } else if (window.forceShowContextMenu) {
      window.forceShowContextMenu();
    } else {
      console.log("❌ No context menu function available");
    }
  },
  
  // Check current state  
  check: checkState,
  
  // Help
  help: () => {
    console.log("\n🆘 Available Commands:");
    console.log("agents.genius() - Test Genius (Einstein)");
    console.log("agents.f1() - Test F1 (Robot)");
    console.log("agents.peedy() - Test Peedy (Parrot)");
    console.log("agents.rocky() - Test Rocky (Dog)");
    console.log("agents.all() - Test all 10 agents");
    console.log("agents.newOnes() - Test just the 4 new agents");
    console.log("agents.menu() - Open context menu");
    console.log("agents.check() - Check current state");
  }
};

// Initial check
checkState();

console.log("\n💡 Quick Start:");
console.log("• agents.genius() - Test Genius agent");
console.log("• agents.newOnes() - Test all new agents");
console.log("• agents.all() - Test all 10 agents");
console.log("• agents.help() - Show all commands");

// Test if everything is working
setTimeout(() => {
  console.log("\n🧪 Running quick compatibility test...");
  if (window.setCurrentAgent) {
    console.log("✅ Ready to test agents!");
    console.log("Try: agents.genius()");
  } else {
    console.log("⏳ Waiting for app to fully load...");
    console.log("Try running this script again in a few seconds");
  }
}, 1000);