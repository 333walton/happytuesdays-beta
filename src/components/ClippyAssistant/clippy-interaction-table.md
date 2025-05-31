# Clippy Interaction Rules Directory

## Mobile Interactions

| Action | Trigger | Animation | Balloon Type | Notes |
|--------|---------|-----------|--------------|-------|
| **Single Tap** | One touch | Yes (2/3 times) | Speech (1/3 times) | Animation OR balloon, never both |
| **Double Tap** | Two quick taps | No | Chat | Always opens chat balloon |
| **Long Press** | 800ms hold | Scale +10% | None | Unlocks position for dragging |
| **Drag** | Long press + move | Scale +10% | None | Only when unlocked, auto-locks on drop |

## Desktop Interactions

| Action | Trigger | Animation | Balloon Type | Notes |
|--------|---------|-----------|--------------|-------|
| **Double Click** | Mouse double-click | Yes (2/3 times) | Speech (1/3 times) | Animation OR balloon, never both |
| **Right Click** | Context menu | No | Context Menu | Shows agent/animation options |

## Balloon Persistence Rules

| Balloon Type | Auto-Close | Manual Close Required | Persistence Trigger |
|--------------|------------|----------------------|-------------------|
| **Speech** | 6 seconds | No | N/A |
| **Chat** | Never* | Yes | User interaction (typing, clicking input, sending message) |

*Chat balloons become persistent once user interacts (types, clicks input, sends message)

## Interaction Frequency Rules

| Interaction Count | Animation Probability | Speech Balloon | Chat Balloon |
|-------------------|----------------------|----------------|--------------|
| **1, 3, 5, 7...** | 66% (2/3) | 33% (1/3) | Desktop: Double-tap only<br>Mobile: Double-tap only |
| **2, 4, 6, 8...** | 0% | 0% | 100% (even interactions) |

## Cooldown & Blocking Rules

| Condition | Cooldown Period | Action Blocked |
|-----------|----------------|----------------|
| **Any interaction** | 1.5 seconds | All new interactions |
| **Animation playing** | Until complete | All interactions |
| **Balloon open** | Until closed | All new balloons |
| **Persistent chat** | Until manually closed | All new interactions |

## Mobile-Specific Rules

| Feature | Behavior | Implementation |
|---------|----------|---------------|
| **Position Lock** | Default: Locked | Toggle via lock button |
| **Drag Unlock** | Long press unlocks | Auto-locks on drop |
| **Touch Targets** | ≥44px minimum | iOS compliance |
| **Zoom Prevention** | 16px font inputs | Prevents iOS zoom |

## Device Detection & Positioning

| Browser/Device | Position Adjustment | Scale | Notes |
|----------------|-------------------|-------|-------|
| **iOS Safari** | Standard mobile | 0.8 | Reference position |
| **Google iOS App** | +40px higher | 0.8 | Matches Safari visually |
| **Other Mobile** | Standard mobile | 0.8 | Responsive |
| **Desktop** | Zoom-aware anchoring | 0.9 * zoomFactor | Real-time resize handling |

## State Management

| State | Description | Duration | Reset Trigger |
|-------|-------------|----------|---------------|
| **Cooldown** | Prevents rapid interactions | 1.5s | Timer expiry |
| **Animation** | Playing animation | ~2s | Animation complete |
| **Dragging** | Position unlocked | Until drop | Drop or lock button |
| **Chat Persistent** | User actively chatting | Until manual close | X button click |