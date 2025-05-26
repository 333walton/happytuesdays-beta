import { useLayoutEffect, useRef, useCallback } from "react";

/**
 * Custom hook that synchronizes layout effects with CSS transform completion
 * Solves the race condition between React state updates and browser layout
 */
export function useSynchronizedLayout(effect, deps = []) {
  const frameRef = useRef();
  const timeoutRef = useRef();

  useLayoutEffect(() => {
    // Cancel any pending operations
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Schedule the effect for after layout completion
    frameRef.current = requestAnimationFrame(() => {
      effect();
    });

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, deps);
}

/**
 * Enhanced hook specifically for zoom-level changes
 * Waits for CSS transforms to be applied before executing effect
 */
export function useZoomSynchronizedEffect(effect, zoomLevel, options = {}) {
  const {
    maxWaitMs = 500,
    monitorSelector = ".monitor-container",
    debugMode = false,
  } = options;

  const effectRef = useRef(effect);
  const frameRef = useRef();
  const timeoutRef = useRef();

  // Update effect ref when effect changes
  effectRef.current = effect;

  useLayoutEffect(() => {
    // Cancel any pending operations
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const monitorContainer = document.querySelector(monitorSelector);

    if (!monitorContainer) {
      if (debugMode) {
        console.warn(`Monitor container not found: ${monitorSelector}`);
      }
      // Run effect immediately if container not found
      effectRef.current();
      return;
    }

    let attempts = 0;
    const maxAttempts = Math.ceil(maxWaitMs / 16); // ~60fps checking

    const checkTransformAndExecute = () => {
      attempts++;

      const currentStyle = window.getComputedStyle(monitorContainer);
      const transform = currentStyle.transform;

      // Determine if transform matches expected zoom level
      let transformCorrect = false;

      switch (zoomLevel) {
        case 0:
          transformCorrect = transform === "none";
          break;
        case 1:
          transformCorrect =
            transform !== "none" &&
            (transform.includes("1.1") || transform.includes("matrix(1.1"));
          break;
        case 2:
          transformCorrect =
            transform !== "none" &&
            (transform.includes("1.25") || transform.includes("matrix(1.25"));
          break;
        default:
          transformCorrect = true; // Unknown zoom level, proceed
      }

      if (debugMode) {
        console.log(
          `🔍 Transform check (attempt ${attempts}/${maxAttempts}): 
           zoom=${zoomLevel}, transform="${transform}", correct=${transformCorrect}`
        );
      }

      if (transformCorrect || attempts >= maxAttempts) {
        if (debugMode && attempts >= maxAttempts) {
          console.warn(`⏰ Transform sync timeout after ${attempts} attempts`);
        }

        // Execute the effect
        effectRef.current();
      } else {
        // Continue checking on next frame
        frameRef.current = requestAnimationFrame(checkTransformAndExecute);
      }
    };

    // Start checking after initial frame
    frameRef.current = requestAnimationFrame(checkTransformAndExecute);

    // Fallback timeout
    timeoutRef.current = setTimeout(() => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (debugMode) {
        console.warn(
          `⏰ Zoom sync fallback timeout triggered after ${maxWaitMs}ms`
        );
      }
      effectRef.current();
    }, maxWaitMs);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [zoomLevel, maxWaitMs, monitorSelector, debugMode]);
}

/**
 * Hook for monitoring CSS transition completion
 * Executes effect when specified CSS property transition completes
 */
export function useTransitionSynchronizedEffect(
  targetSelector,
  property,
  effect,
  deps = []
) {
  const effectRef = useRef(effect);
  effectRef.current = effect;

  useLayoutEffect(() => {
    const target = document.querySelector(targetSelector);

    if (!target) {
      console.warn(`Transition target not found: ${targetSelector}`);
      return;
    }

    const handleTransitionEnd = (event) => {
      if (event.target === target && event.propertyName === property) {
        effectRef.current();
      }
    };

    target.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      target.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, deps);
}

/**
 * Usage example for ClippyProvider zoom handling
 */
export function useClippyZoomHandling(
  zoomLevel,
  clippyElement,
  overlayElement
) {
  useZoomSynchronizedEffect(
    () => {
      if (!clippyElement) return;

      console.log(
        `🎯 Executing zoom-synchronized Clippy positioning for level ${zoomLevel}`
      );

      if (window.ClippyPositioning) {
        // Use the enhanced validation method
        window.ClippyPositioning.synchronizedBatchPositioning(
          clippyElement,
          overlayElement,
          zoomLevel
        );
      }
    },
    zoomLevel,
    {
      maxWaitMs: 300,
      debugMode: process.env.NODE_ENV === "development",
    }
  );
}

export default useSynchronizedLayout;
