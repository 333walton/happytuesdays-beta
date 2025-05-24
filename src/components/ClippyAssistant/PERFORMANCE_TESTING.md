# ClippyAssistant Performance Testing

This directory contains tools for testing the performance of the ClippyAssistant component after the migration. These tools help verify that the improvements made to the component meet the performance goals outlined in the migration plan.

## Available Testing Methods

There are three ways to run the performance tests:

### 1. Browser Console (Recommended)

The easiest way to test the performance of the ClippyAssistant component is to copy and paste the contents of `console-test-runner.js` into your browser's console while the application is running.

**Steps:**

1. Start your application with `npm start`
2. Open browser developer tools (F12 or right-click → Inspect)
3. Navigate to the Console tab
4. Copy the entire contents of `console-test-runner.js`
5. Paste into the console and press Enter

A notification will appear in the top-left corner of the screen while the test is running, and results will be displayed in the console.

### 2. Test Runner HTML Page

For a more visual experience, you can open the `test-runner.html` file in your browser:

**Steps:**

1. Open `test-runner.html` in your browser
2. Click the "Run Performance Test" button
3. View the results in the output area

Note: This method uses a simulated environment and may not accurately reflect the real-world performance of the component in your application.

### 3. Integrated Test Runner

For automated testing during development, you can use the integrated test runner:

**Steps:**

1. Import the test module in your code:
   ```javascript
   import runTest from "./components/ClippyAssistant/run-performance-test";
   ```
2. Call the function when appropriate, such as after the component has mounted.

## Performance Metrics

The tests measure several important metrics:

1. **Animation Performance**: How quickly animations start and execute. A good score is under 100ms.
2. **Memory Usage**: How much memory is used by the ClippyAssistant. A good score is under 5MB.
3. **Visibility and Display**: Checks if the Clippy element is correctly visible.
4. **Hardware Acceleration**: Verifies that hardware acceleration is enabled for better performance.
5. **Mobile Optimization**: Tests if the component is properly optimized for mobile devices.
6. **Touch Target Size**: Ensures that clickable areas are at least 44x44 pixels for touch devices.
7. **Feature Availability**: Confirms that all required methods are available in the ClippyService.

## Success Criteria

The test produces a success rate percentage based on the number of tests passed. The migration is considered successful if:

- The success rate is 80% or higher
- Animation performance is good (< 100ms)
- Memory usage is reasonable (< 5MB)
- Mobile optimization passes all checks

## Troubleshooting

If the tests fail or show poor performance:

1. **Animation Performance Issues**:

   - Check for excessive DOM manipulation in animation code
   - Ensure hardware acceleration is properly configured
   - Verify that only one animation loop is running

2. **Memory Usage Problems**:

   - Look for memory leaks in event listeners
   - Check for proper cleanup in component unmount
   - Reduce the number of DOM elements created

3. **Mobile Issues**:
   - Verify mobile-specific styles are applied correctly
   - Ensure touch targets are large enough
   - Check positioning logic for mobile devices

## Emergency Reset

If Clippy causes performance issues or crashes, you can use the emergency reset function:

```javascript
window.ClippyService.emergencyReset();
```

This will immediately hide all Clippy-related elements and restore normal operation.
