// Simple Agent Testing & Debugging Script
// Copy and paste this into the browser console

console.log("🔍 Clippy Agent Debugging Script");
console.log("================================");

// Check if required functions exist
const checkGlobals = () => {
  console.log("\n📋 Checking Global Functions:");
  
  const globals = [
    'setCurrentAgent',
    'showClippyCustomBalloon', 
    'showClippyContextMenu',
    'getClippyInstance',
    'clippy'
  ];
  
  globals.forEach(func => {
    const exists = window[func] !== undefined;
    console.log(`  ${exists ? '✅' : '❌'} window.${func}: ${exists ? 'Available' : 'Missing'}`);
  });
};

// Check current agent state
const checkCurrentState = () => {
  console.log("\n🎭 Current Agent State:");
  
  // Check Clippy element
  const clippyEl = document.querySelector('.clippy');
  if (clippyEl) {
    console.log(`  ✅ Clippy element found`);
    console.log(`  📍 Data-agent: ${clippyEl.getAttribute('data-agent') || 'None set'}`);
  } else {
    console.log(`  ❌ No Clippy element found`);
  }
  
  // Check global clippy instance
  if (window.clippy) {
    console.log(`  ✅ Global clippy instance available`);
  } else {
    console.log(`  ❌ No global clippy instance`);
  }
  
  // Check selected agent
  if (window.selectedAIAgent) {
    console.log(`  ✅ Selected agent: ${window.selectedAIAgent}`);
  } else {
    console.log(`  ❌ No selectedAIAgent set`);
  }
};

// Test agent switching
const testAgentSwitch = (agentName) => {
  console.log(`\n🔄 Testing switch to: ${agentName}`);
  
  if (window.setCurrentAgent) {
    try {
      const result = window.setCurrentAgent(agentName);
      console.log(`  📤 Switch result: ${result}`);
      
      // Wait and check if it worked
      setTimeout(() => {
        const clippyEl = document.querySelector('.clippy');
        if (clippyEl) {
          const currentAgent = clippyEl.getAttribute('data-agent');
          console.log(`  📥 Current agent after switch: ${currentAgent}`);
          if (currentAgent === agentName) {
            console.log(`  ✅ Switch successful!`);
          } else {
            console.log(`  ❌ Switch failed - expected ${agentName}, got ${currentAgent}`);
          }
        }
      }, 2000);
      
    } catch (error) {
      console.error(`  ❌ Switch error:`, error);
    }
  } else {
    console.log(`  ❌ setCurrentAgent function not available`);
  }
};

// Quick tests for the new agents
const testNewAgents = () => {
  console.log("\n🆕 Testing New Agents:");
  
  const newAgents = ['Genius', 'F1', 'Peedy', 'Rocky'];
  
  newAgents.forEach((agent, index) => {
    setTimeout(() => {
      testAgentSwitch(agent);
    }, index * 3000);
  });
  
  // Switch back to Clippy at the end
  setTimeout(() => {
    testAgentSwitch('Clippy');
  }, newAgents.length * 3000);
};

// Check React95 library
const checkReact95 = () => {
  console.log("\n📚 Checking React95 Library:");
  
  // Check if we can access the AGENTS constant
  try {
    // Try to find React95 in various locations
    const possiblePaths = [
      'window.React95',
      'window.clippy',
      'document.querySelector(".clippy")'
    ];
    
    possiblePaths.forEach(path => {
      try {
        const result = eval(path);
        console.log(`  ${result ? '✅' : '❌'} ${path}: ${result ? 'Found' : 'Not found'}`);
      } catch (e) {
        console.log(`  ❌ ${path}: Error - ${e.message}`);
      }
    });
    
  } catch (error) {
    console.log(`  ❌ React95 check failed:`, error);
  }
};

// Force context menu open
const openContextMenu = () => {
  console.log("\n🎯 Opening Context Menu:");
  
  if (window.showClippyContextMenu) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    window.showClippyContextMenu(centerX, centerY);
    console.log(`  ✅ Context menu opened at center (${centerX}, ${centerY})`);
  } else if (window.forceShowContextMenu) {
    window.forceShowContextMenu();
    console.log(`  ✅ Context menu forced open`);
  } else {
    console.log(`  ❌ No context menu functions available`);
  }
};

// Run all diagnostics
const runDiagnostics = () => {
  console.log("🚀 Running Full Diagnostics...");
  checkGlobals();
  checkCurrentState();
  checkReact95();
  
  console.log("\n💡 Manual Tests:");
  console.log("1. Try: testAgentSwitch('Genius')");
  console.log("2. Try: testNewAgents()");
  console.log("3. Try: openContextMenu()");
  console.log("4. Right-click Clippy and check agent list");
};

// Create simple test commands
window.debug_agents = {
  check: runDiagnostics,
  state: checkCurrentState,
  globals: checkGlobals,
  switch: testAgentSwitch,
  newAgents: testNewAgents,
  menu: openContextMenu,
  
  // Quick switches
  genius: () => testAgentSwitch('Genius'),
  f1: () => testAgentSwitch('F1'),
  peedy: () => testAgentSwitch('Peedy'),
  rocky: () => testAgentSwitch('Rocky'),
  
  help: () => {
    console.log("\n🆘 Debug Commands:");
    console.log("debug_agents.check() - Run full diagnostics");
    console.log("debug_agents.state() - Check current state");
    console.log("debug_agents.switch('AgentName') - Test switching");
    console.log("debug_agents.newAgents() - Test all new agents");
    console.log("debug_agents.menu() - Open context menu");
    console.log("debug_agents.genius() - Quick switch to Genius");
    console.log("debug_agents.f1() - Quick switch to F1");
    console.log("debug_agents.peedy() - Quick switch to Peedy");
    console.log("debug_agents.rocky() - Quick switch to Rocky");
  }
};

// Auto-run initial check
console.log("🎯 Agent debugging loaded! Try these commands:");
console.log("• debug_agents.check() - Run diagnostics");
console.log("• debug_agents.help() - Show all commands");
console.log("• debug_agents.genius() - Test Genius agent");

// Run initial diagnostics
runDiagnostics();