// SIMPLE AGENT TESTING - Copy & Paste into Browser Console
// ========================================================

console.log("🎭 Simple Agent Testing Started");

// Test if agent switching works
const testAgent = (agentName) => {
  console.log(`\n🔄 Testing: ${agentName}`);
  
  if (window.setCurrentAgent) {
    window.setCurrentAgent(agentName);
    console.log(`✅ Switched to ${agentName}`);
    
    // Show a balloon if available
    setTimeout(() => {
      if (window.showClippyCustomBalloon) {
        window.showClippyCustomBalloon(`Hello! I'm ${agentName}!`);
      }
    }, 1000);
  } else {
    console.log("❌ setCurrentAgent function not found");
  }
};

// Quick test commands
window.test = {
  clippy: () => testAgent("Clippy"),
  bonzi: () => testAgent("Bonzi"),
  genius: () => testAgent("Genius"),
  f1: () => testAgent("F1"),
  peedy: () => testAgent("Peedy"),
  rocky: () => testAgent("Rocky"),
  links: () => testAgent("Links"),
  merlin: () => testAgent("Merlin"),
  genie: () => testAgent("Genie"),
  rover: () => testAgent("Rover"),
  
  all: () => {
    console.log("🚀 Testing all agents...");
    const agents = ["Clippy", "Bonzi", "Genius", "F1", "Peedy", "Rocky", "Links", "Merlin", "Genie", "Rover"];
    agents.forEach((agent, i) => {
      setTimeout(() => testAgent(agent), i * 3000);
    });
  },
  
  menu: () => {
    console.log("🎯 Opening context menu...");
    if (window.showClippyContextMenu) {
      window.showClippyContextMenu(400, 300);
    } else if (window.forceShowContextMenu) {
      window.forceShowContextMenu();
    }
  }
};

console.log("\n💡 Available Commands:");
console.log("test.genius() - Switch to Genius");
console.log("test.f1() - Switch to F1"); 
console.log("test.peedy() - Switch to Peedy");
console.log("test.rocky() - Switch to Rocky");
console.log("test.all() - Test all agents");
console.log("test.menu() - Open context menu");

// Quick check
console.log(`\n🔍 Quick Check:`);
console.log(`setCurrentAgent available: ${!!window.setCurrentAgent}`);
console.log(`Clippy element found: ${!!document.querySelector('.clippy')}`);
console.log(`Context menu function: ${!!window.showClippyContextMenu}`);

console.log(`\n🎯 Try: test.genius() or test.all()`);