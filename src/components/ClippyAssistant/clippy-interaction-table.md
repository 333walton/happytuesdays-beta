# Clippy Interaction Rules Directory

## Mobile Interactions

| Action         | Trigger             | Animation         | Balloon Type         | Notes                                      |
|----------------|--------------------|-------------------|----------------------|--------------------------------------------|
| **Single Tap** | One touch          | Yes (75% chance)   | Speech (25% chance)  | Animation OR speech balloon, never chat    |
| **Double Tap** | Two quick taps     | No                | Context Menu         | Opens context menu ONLY                    |
| **Long Press** | 800ms hold         | No                | Chat                 | Opens chat balloon ONLY                    |
| **Drag**       | Long press + move  | Scale +5%         | None                 | Only when position unlocked                |

## Desktop Interactions

| Action           | Trigger            | Animation         | Balloon Type         | Notes                                      |
|------------------|-------------------|-------------------|----------------------|--------------------------------------------|
| **Single Click** | Mouse click        | Yes (75% chance)   | Speech (25% chance)  | Animation OR speech balloon, never both    |
| **Double Click** | Mouse double-click | No                | Chat                 | Opens chat balloon ONLY                    |
| **Right Click**  | Context menu      | No                | Context Menu         | Shows agent/animation options              |

## Balloon Persistence Rules

| Balloon Type | Auto-Close | Manual Close Required | Persistence Trigger                |
|--------------|------------|----------------------|------------------------------------|
| **Speech**   | 6 seconds  | No                   | N/A                                |
| **Chat**     | Never*     | Yes                  | User interaction (typing/clicking) |

*Chat balloons become persistent once user interacts (types, clicks input, sends message)

## Interaction Frequency Rules

| Interaction Type | Animation Probability | Speech Balloon | Chat Balloon                |
|------------------|----------------------|----------------|-----------------------------|
| **Single Tap/Click** | 75%                | 25%            | Never                       |
| **Double Tap**    | 0%                   | 0%             | Context Menu Only           |
| **Double Click**  | 0%                   | 0%             | Chat Balloon Only           |
| **Long Press**    | 0%                   | 0%             | Chat Balloon Only           |

## Cooldown & Blocking Rules

| Condition                | Cooldown Period | Action Blocked         |
|--------------------------|----------------|------------------------|
| **Any interaction**      | 1.5 seconds    | All new interactions   |
| **Animation playing**    | Until complete | All interactions       |
| **Balloon open**         | Until closed   | All new balloons       |
| **Persistent chat open** | Until manual close | All new interactions |

## Mobile-Specific Rules

| Feature           | Behavior           | Implementation         |
|-------------------|-------------------|------------------------|
| **Position Lock** | Default: Locked   | Toggle via lock button |
| **Drag Unlock**   | Long press unlocks| Auto-locks on drop     |
| **Touch Targets** | ≥44px minimum     | iOS compliance         |
| **Zoom Prevention** | 16px font inputs| Prevents iOS zoom      |

## Device Detection & Positioning

| Browser/Device      | Position Adjustment | Scale                | Notes                       |
|---------------------|--------------------|----------------------|-----------------------------|
| **iOS Safari**      | Standard mobile    | 1.0                  | Reference position          |
| **Google iOS App**  | +40px higher       | 1.0                  | Matches Safari visually     |
| **Other Mobile**    | Standard mobile    | 1.0                  | Responsive                  |
| **Desktop**         | Zoom-aware anchoring | 0.95 * zoomFactor   | Real-time resize handling   |

## Context Menu Features

| Feature               | Mobile Behavior    | Desktop Behavior     | Notes                       |
|-----------------------|-------------------|----------------------|-----------------------------|
| **Dynamic Text**      | "Drag [Agent]"    | "Drag [Agent]"       | Shows current agent name    |
| **Touch Highlighting** | Blue bg/white text | Hover highlight     | Mobile touch feedback       |
| **Animation Delay**   | 2s for Hide       | 2s for Hide          | Hide animation has delay    |

## App-Specific Features

| Application     | Trigger         | Balloon Chance | Message Type           |
|-----------------|----------------|----------------|------------------------|
| **Read Me**     | App open       | 25%            | Documentation help     |
| **FAQ**         | App open       | 25%            | FAQ guidance           |
| **Change Log**  | App open       | 25%            | Update information     |

## State Management

| State               | Description                | Duration   | Reset Trigger         |
|---------------------|---------------------------|------------|----------------------|
| **Cooldown**        | Prevents rapid interactions | 1.5s     | Timer expiry         |
| **Animation**       | Playing animation         | ~2s        | Animation complete   |
| **Dragging**        | Position unlocked         | Until drop | Drop or lock button  |
| **Chat Persistent** | User actively chatting    | Until manual close | X button click |

---

## Balloon Types (Current as of Latest ClippyAssistant)

- **Speech Balloon** (`custom-clippy-balloon`):  
  - Used for close-ended statements, tips, errors, and welcome messages.
  - May include buttons for help, tips, or error actions.
  - The "How may I help you?" enhanced message balloon with 4 buttons has been fully removed and will not appear.

- **Chat Balloon** (`custom-clippy-chat-balloon`):  
  - Used for interactive chat with Clippy.
  - Becomes persistent after user interaction.

---

## Notes

- The enhanced message balloon ("How may I help you?" with 4 options) is **fully removed** and cannot be triggered.
- All other speech balloons and chat balloons remain as described above.
- Only one balloon (speech or chat) can be open at a time.
- All positioning and device detection is handled by the latest `ClippyPositioning` logic.