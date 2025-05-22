/**
 * ClippyNuclearFix.js
 *
 * A guaranteed solution to forcibly remove Clippy from the DOM
 * when the hide function is triggered.
 */

// Export a function to apply the fix
export function applyClippyNuclearFix() {
  console.log("🧨 Applying Clippy Nuclear Fix - guaranteed to remove Clippy");

  // Override the window.setAssistantVisible function
  if (typeof window !== "undefined") {
    // Store original function if it exists
    const originalSetVisible = window.setAssistantVisible;

    // Replace with our nuclear version
    window.setAssistantVisible = function (visible) {
      console.log(`🧨 Nuclear setAssistantVisible called with: ${visible}`);

      // Call original function if it exists
      if (originalSetVisible) {
        try {
          originalSetVisible(visible);
        } catch (e) {
          console.error("Error in original setAssistantVisible:", e);
        }
      }

      // If we're hiding Clippy, use the nuclear approach
      if (visible === false) {
        console.log("🧨 NUCLEAR OPTION: Forcibly removing Clippy from DOM");

        // 1. Find and remove all Clippy elements - multiple attempts
        function nukeClippy() {
          const removeElements = (selector) => {
            const elements = document.querySelectorAll(selector);
            console.log(
              `Found ${elements.length} elements matching: ${selector}`
            );
            elements.forEach((el) => {
              if (el && el.parentNode) {
                console.log(`Removing element: ${selector}`);
                el.parentNode.removeChild(el);
              }
            });
          };

          // Remove in order of specificity
          removeElements(".clippy");
          removeElements("#clippy-agent");
          removeElements("#clippy-clickable-overlay");
          removeElements(".clippy-balloon");
          removeElements(".custom-clippy-balloon");
          removeElements(".custom-clippy-chat-balloon");

          // Remove any other elements with clippy in the class or id
          document
            .querySelectorAll('[class*="clippy"], [id*="clippy"]')
            .forEach((el) => {
              if (el && el.parentNode) {
                console.log(
                  `Removing clippy-related element: ${el.tagName} ${
                    el.className || el.id
                  }`
                );
                el.parentNode.removeChild(el);
              }
            });
        }

        // 2. Remove all Clippy-related styles
        function nukeClippyStyles() {
          const styleElements = document.querySelectorAll(
            'style[id*="clippy"], style[data-clippy]'
          );
          styleElements.forEach((el) => {
            if (el && el.parentNode) {
              console.log(`Removing clippy style: ${el.id || "unnamed"}`);
              el.parentNode.removeChild(el);
            }
          });

          // Add a style to force hide anything we might have missed
          const forceHideStyle = document.createElement("style");
          forceHideStyle.id = "clippy-nuclear-hide";
          forceHideStyle.textContent = `
            .clippy, #clippy-agent, #clippy-clickable-overlay, 
            .clippy-balloon, .custom-clippy-balloon, .custom-clippy-chat-balloon,
            [class*="clippy-"], [id*="clippy-"] {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
              position: absolute !important;
              top: -9999px !important;
              left: -9999px !important;
              height: 0 !important;
              width: 0 !important;
              overflow: hidden !important;
              z-index: -9999 !important;
            }
          `;
          document.head.appendChild(forceHideStyle);
        }

        // 3. Execute the nuclear options
        try {
          nukeClippy();
          nukeClippyStyles();

          // 4. Run a second pass after a small delay to catch any dynamically created elements
          setTimeout(() => {
            nukeClippy();
          }, 100);

          console.log(
            "🧨 Nuclear option completed - Clippy should be completely removed"
          );

          // 5. Return false to React state to ensure it stays in sync
          return false;
        } catch (error) {
          console.error("Error during nuclear clippy removal:", error);
        }
      }

      // Return the visibility state for React
      return visible;
    };

    console.log(
      "🧨 Clippy Nuclear Fix applied - setAssistantVisible has been overridden"
    );

    // Also patch the direct hide function in ClippyService if it exists
    if (window.ClippyService && window.ClippyService.hide) {
      const originalHide = window.ClippyService.hide;
      window.ClippyService.hide = function () {
        // Call our nuclear hide function
        window.setAssistantVisible(false);

        // Call original for good measure
        try {
          return originalHide.apply(this, arguments);
        } catch (e) {
          console.error("Error in original ClippyService.hide:", e);
          return false;
        }
      };
      console.log("🧨 ClippyService.hide patched with nuclear option");
    }

    // Patch directly onto the clippy object if it exists
    if (window.clippy && typeof window.clippy === "object") {
      if (window.clippy.hide) {
        const originalClippyHide = window.clippy.hide;
        window.clippy.hide = function () {
          // Call our nuclear hide function
          window.setAssistantVisible(false);

          // Call original for good measure
          try {
            return originalClippyHide.apply(this, arguments);
          } catch (e) {
            console.error("Error in original clippy.hide:", e);
            return false;
          }
        };
        console.log("🧨 window.clippy.hide patched with nuclear option");
      } else {
        // Add hide method if it doesn't exist
        window.clippy.hide = function () {
          return window.setAssistantVisible(false);
        };
        console.log("🧨 window.clippy.hide method added");
      }
    }
  }

  return true;
}

// Function to register a MutationObserver to watch for new Clippy elements
// and instantly remove them if Clippy should be hidden
export function watchForClippyElements() {
  if (typeof window === "undefined" || !window.MutationObserver) return;

  // Flag to track if Clippy should be hidden
  window._clippy_should_be_hidden = false;

  // Observer config
  const config = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"],
  };

  // Callback function
  const callback = function (mutationsList, observer) {
    // Only process if Clippy should be hidden
    if (!window._clippy_should_be_hidden) return;

    let foundClippyElement = false;

    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        // Check added nodes for clippy elements
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Element node
            // Check if this is a clippy element
            if (
              (node.classList && node.classList.contains("clippy")) ||
              (node.id && node.id.includes("clippy")) ||
              (node.className &&
                typeof node.className === "string" &&
                node.className.includes("clippy"))
            ) {
              foundClippyElement = true;
              console.log(
                "🧨 Caught new clippy element being added while hidden - removing:",
                node
              );
              if (node.parentNode) {
                node.parentNode.removeChild(node);
              }
            }
          }
        });
      }
    }

    // If we found and removed a clippy element, run the nuclear option again
    if (foundClippyElement) {
      window.setAssistantVisible(false);
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the document
  observer.observe(document.documentElement, config);
  console.log("🧨 Now watching for new clippy elements");

  // Override setAssistantVisible to update our tracking flag
  const originalSetVisible = window.setAssistantVisible;
  if (originalSetVisible) {
    window.setAssistantVisible = function (visible) {
      // Update our tracking flag
      window._clippy_should_be_hidden = !visible;

      // Call the original (which might be our nuclear version)
      return originalSetVisible(visible);
    };
  }

  return observer;
}
