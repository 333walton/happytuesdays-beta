````markdown
---
version: 1.0
backup_date: 2024-01-24
status: reference_only
---

## Adding Additional Agents

### Strategy 1: Configuration Object Approach

#### 1. Create Configuration File

```javascript
// src/config/agentsConfig.js
const agents = {
  clippyGPT: {
    name: "Clippy GPT",
  },
  agent2: {
    name: "Agent 2",
  },
  agent3: {
    name: "Agent 3",
  },
};

export default agents;
```

#### 2. Update ClippyProvider

```javascript
import agents from "../config/agentsConfig";

const ClippyProvider = ({ defaultAgentKey }) => {
  const defaultAgent = agents[defaultAgentKey];
  // Use defaultAgent.name or other properties as needed
};
```

#### 3. Usage in App.js

```javascript
<ClippyProvider defaultAgentKey="clippyGPT" />
```

### Strategy 2: Context for Dynamic Agent Management

#### 1. Create Context

```javascript
import React, { createContext, useState } from "react";
import agents from "../config/agentsConfig";

const ClippyContext = createContext();

const ClippyProvider = ({ children }) => {
  const [currentAgent, setCurrentAgent] = useState(agents.clippyGPT);

  const switchAgent = (agentKey) => {
    setCurrentAgent(agents[agentKey]);
  };

  return (
    <ClippyContext.Provider value={{ currentAgent, switchAgent }}>
      {children}
    </ClippyContext.Provider>
  );
};

export { ClippyContext, ClippyProvider };
```

#### 2. Implementation in Components

```javascript
import { useContext } from "react";
import { ClippyContext } from "../context/ClippyContext";

const SomeComponent = () => {
  const { currentAgent } = useContext(ClippyContext);
  // Use currentAgent.name or other properties
};
```

### Benefits

- Centralized management
- Dynamic flexibility
- Reduced code changes
- Easier maintenance

---

## Multi-Agent System Architecture

### Overview

This section describes how to implement and manage multiple assistant agents (like Clippy) within the same application while maintaining consistent positioning and behavior.

### Core Architecture Components

#### 1. Agent Positioning Service

Handles the unified positioning logic for all agents:

```javascript
class AgentPositioningService {
  calculatePosition(agent, viewport) {
    // Shared positioning logic for all agents
    return {
      x: this.calculateXPosition(agent, viewport),
      y: this.calculateYPosition(agent, viewport),
    };
  }
}
```

#### 2. Agent State Management

Central system for managing multiple active agents:

```javascript
const AgentStateManager = {
  activeAgents: new Map(),

  registerAgent(agentId, config) {
    this.activeAgents.set(agentId, {
      id: agentId,
      type: config.type,
      position: null,
      scale: config.scale || 1,
      zIndex: this.calculateZIndex(agentId),
    });
  },
};
```

### Implementation Requirements

#### 1. Position Inheritance

All agents must inherit from base positioning logic:

- Use shared coordinate calculation
- Maintain consistent scaling rules
- Follow viewport boundaries

#### 2. Agent-Specific Customization

Allow for individual agent adjustments:

```javascript
const agentCustomization = {
  clippy: {
```

## Additional Considerations

### 1. Device-Specific Adjustments

- Account for iOS vs. Android differences
- Handle touch events and viewport resizing

### 2. Zoom Levels

- Ensure consistent calculations across zoom levels
- Test zoom in/out behavior

### 3. Error Handling

- Implement robust error handling in related files
- Prevent crashes and unexpected behavior

### 4. Testing Across Devices

- Test on various screen sizes and operating systems
- Verify behavior on tablets and phones

### 5. Performance Considerations

- Monitor mobile performance
- Ensure smooth animations and transitions
````
