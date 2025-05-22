// Helper function to fix Clippy context menu
export function fixClippyContextMenu() {
  console.log("Applying Clippy context menu fix");

  // Override the createContextMenu method to properly hide the assistant
  if (window.ClippyManager && window.ClippyManager.createContextMenu) {
    const originalCreateContextMenu = window.ClippyManager.createContextMenu;

    window.ClippyManager.createContextMenu = function (event) {
      // Simple DOM-based menu
      const menuEl = document.createElement("div");
      menuEl.style.position = "fixed";
      menuEl.className = "clippy-context-menu"; // Add class for targeting

      // Adjust position to stay within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const menuWidth = 150;
      const menuHeight = 150;

      let menuX = event.clientX;
      let menuY = event.clientY;

      if (menuX + menuWidth > viewportWidth) {
        menuX = viewportWidth - menuWidth - 10;
      }

      if (menuY + menuHeight > viewportHeight) {
        menuY = viewportHeight - menuHeight - 10;
      }

      menuEl.style.left = `${menuX}px`;
      menuEl.style.top = `${menuY}px`;
      menuEl.style.backgroundColor = "#c0c0c8";
      menuEl.style.border = "2px solid";
      menuEl.style.borderColor = "#ffffff #808080 #808080 #ffffff";
      menuEl.style.padding = "1px";
      menuEl.style.zIndex = "9999";
      menuEl.style.fontFamily = "'MS Sans Serif', sans-serif";
      menuEl.style.fontSize = "11px";

      // Add hide assistant item (using the nuclear option for guaranteed hiding)
      const hideItem = document.createElement("div");
      hideItem.innerText = "Hide Assistant";
      hideItem.style.padding = "1px 8px";
      hideItem.style.cursor = "default";
      hideItem.style.whiteSpace = "nowrap";

      hideItem.addEventListener("mouseover", () => {
        hideItem.style.backgroundColor = "#000080";
        hideItem.style.color = "white";
      });

      hideItem.addEventListener("mouseout", () => {
        hideItem.style.backgroundColor = "";
        hideItem.style.color = "black";
      });

      hideItem.addEventListener("click", () => {
        console.log(
          "Hide Assistant clicked - using nuclear option for reliable hiding"
        );

        // Use the nuclear option for guaranteed hide
        if (window.executeClippyNuclearOption) {
          window.executeClippyNuclearOption();
        } else if (window.DESTROY_CLIPPY) {
          window.DESTROY_CLIPPY();
        } else {
          // Fallback if nuclear option isn't available
          console.log("Nuclear option not available, using fallbacks");

          // Method 1: Use React state setter
          if (window.setAssistantVisible) {
            window.setAssistantVisible(false);
          }

          // Method 2: Use ClippyService API
          if (window.ClippyService && window.ClippyService.hide) {
            window.ClippyService.hide();
          }

          // Method 3: Direct DOM manipulation
          const clippyEl = document.querySelector(".clippy");
          if (clippyEl) {
            clippyEl.style.display = "none";
            clippyEl.style.visibility = "hidden";
            clippyEl.style.opacity = "0";
          }

          // Hide overlay
          const overlay = document.getElementById("clippy-clickable-overlay");
          if (overlay) {
            overlay.style.display = "none";
            overlay.style.visibility = "hidden";
            overlay.style.opacity = "0";
          }

          // Force hide with CSS
          const styleEl = document.createElement("style");
          styleEl.id = "clippy-hide-style";
          styleEl.textContent = `
            .clippy, #clippy-clickable-overlay, 
            .clippy-balloon, .custom-clippy-balloon {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
            }
          `;
          document.head.appendChild(styleEl);
        }

        // Remove the menu
        if (menuEl.parentNode) {
          menuEl.parentNode.removeChild(menuEl);
        }
      });

      menuEl.appendChild(hideItem);

      // Add separator
      const separator = document.createElement("div");
      separator.style.height = "1px";
      separator.style.margin = "1px 0";
      separator.style.backgroundColor = "#808080";
      separator.style.borderBottom = "1px solid #ffffff";
      menuEl.appendChild(separator);

      // Add alternate hide method (softer approach)
      const softHideItem = document.createElement("div");
      softHideItem.innerText = "Try Soft Hide";
      softHideItem.style.padding = "1px 8px";
      softHideItem.style.cursor = "default";
      softHideItem.style.whiteSpace = "nowrap";
      softHideItem.style.color = "#666";
      softHideItem.style.fontStyle = "italic";

      softHideItem.addEventListener("mouseover", () => {
        softHideItem.style.backgroundColor = "#000080";
        softHideItem.style.color = "white";
      });

      softHideItem.addEventListener("mouseout", () => {
        softHideItem.style.backgroundColor = "";
        softHideItem.style.color = "#666";
      });

      softHideItem.addEventListener("click", () => {
        console.log("Soft hide clicked - using React state approach");

        // Try the gentle approach - React state only
        if (window.setAssistantVisible) {
          window.setAssistantVisible(false);
        }

        // Remove the menu
        if (menuEl.parentNode) {
          menuEl.parentNode.removeChild(menuEl);
        }
      });

      menuEl.appendChild(softHideItem);

      // Add another separator
      const separator2 = document.createElement("div");
      separator2.style.height = "1px";
      separator2.style.margin = "1px 0";
      separator2.style.backgroundColor = "#808080";
      separator2.style.borderBottom = "1px solid #ffffff";
      menuEl.appendChild(separator2);

      // Add about item
      const aboutItem = document.createElement("div");
      aboutItem.innerText = "About";
      aboutItem.style.padding = "1px 8px";
      aboutItem.style.cursor = "default";
      aboutItem.style.whiteSpace = "nowrap";

      aboutItem.addEventListener("mouseover", () => {
        aboutItem.style.backgroundColor = "#000080";
        aboutItem.style.color = "white";
      });

      aboutItem.addEventListener("mouseout", () => {
        aboutItem.style.backgroundColor = "";
        aboutItem.style.color = "black";
      });

      aboutItem.addEventListener("click", () => {
        const currentAgent = window.currentAgent || "Clippy";
        const message = `I'm ${currentAgent}, ready to help!`;
        if (window.showClippyCustomBalloon) {
          window.showClippyCustomBalloon(message);
        } else if (this.showCustomBalloon) {
          this.showCustomBalloon(message);
        } else {
          alert(message);
        }

        // Remove the menu
        if (menuEl.parentNode) {
          menuEl.parentNode.removeChild(menuEl);
        }
      });

      menuEl.appendChild(aboutItem);
      document.body.appendChild(menuEl);

      // Close when clicking outside
      document.addEventListener("mousedown", function handleOutsideClick(evt) {
        if (!menuEl.contains(evt.target)) {
          if (menuEl.parentNode) {
            menuEl.parentNode.removeChild(menuEl);
          }
          document.removeEventListener("mousedown", handleOutsideClick);
        }
      });
    };

    console.log("Clippy context menu fix applied successfully");
  } else {
    console.warn("Could not find ClippyManager.createContextMenu to patch");

    // Alternative approach: Set up a global method to create the context menu
    window.clippyShowContextMenu = function (event) {
      console.log("Creating context menu via global method");

      // Create a simple DOM-based menu
      const menuEl = document.createElement("div");
      menuEl.style.position = "fixed";
      menuEl.style.left = `${event.clientX}px`;
      menuEl.style.top = `${event.clientY}px`;
      menuEl.style.backgroundColor = "#c0c0c8";
      menuEl.style.border = "2px solid";
      menuEl.style.borderColor = "#ffffff #808080 #808080 #ffffff";
      menuEl.style.padding = "1px";
      menuEl.style.zIndex = "9999";
      menuEl.style.fontFamily = "'MS Sans Serif', sans-serif";
      menuEl.style.fontSize = "11px";
      menuEl.className = "clippy-context-menu";

      // Add hide assistant item
      const hideItem = document.createElement("div");
      hideItem.innerText = "Hide Assistant";
      hideItem.style.padding = "1px 8px";
      hideItem.style.cursor = "default";
      hideItem.style.whiteSpace = "nowrap";

      hideItem.addEventListener("mouseover", () => {
        hideItem.style.backgroundColor = "#000080";
        hideItem.style.color = "white";
      });

      hideItem.addEventListener("mouseout", () => {
        hideItem.style.backgroundColor = "";
        hideItem.style.color = "black";
      });

      hideItem.addEventListener("click", () => {
        if (window.executeClippyNuclearOption) {
          window.executeClippyNuclearOption();
        } else if (window.DESTROY_CLIPPY) {
          window.DESTROY_CLIPPY();
        } else if (window.setAssistantVisible) {
          window.setAssistantVisible(false);
        }

        if (menuEl.parentNode) {
          menuEl.parentNode.removeChild(menuEl);
        }
      });

      menuEl.appendChild(hideItem);
      document.body.appendChild(menuEl);

      // Close when clicking outside
      document.addEventListener("mousedown", function handleOutsideClick(evt) {
        if (!menuEl.contains(evt.target)) {
          if (menuEl.parentNode) {
            menuEl.parentNode.removeChild(menuEl);
          }
          document.removeEventListener("mousedown", handleOutsideClick);
        }
      });
    };

    // Try to attach the context menu to the Clippy element
    setTimeout(() => {
      const clippyEl = document.querySelector(".clippy");
      const overlayEl = document.getElementById("clippy-clickable-overlay");

      if (clippyEl) {
        clippyEl.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          window.clippyShowContextMenu(e);
        });
      }

      if (overlayEl) {
        overlayEl.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          window.clippyShowContextMenu(e);
        });
      }
    }, 1000);
  }
}
