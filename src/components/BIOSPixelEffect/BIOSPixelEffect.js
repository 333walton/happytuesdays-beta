import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./BIOSPixelEffect.scss";

// Vertex shader for the pixel grid
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader for the pixel effect overlay
const fragmentShader = `
  uniform float time;
  uniform vec2 mouse;
  uniform float clickIntensity;
  uniform vec2 resolution;
  varying vec2 vUv;
  
  // Simplex noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  void main() {
    vec2 uv = vUv;
    vec2 pixelSize = vec2(4.0) / resolution; // Base pixel size
    
    // Distance from mouse
    float dist = distance(uv, mouse);
    float mouseInfluence = 1.0 - smoothstep(0.0, 0.5, dist);
    
    // Dynamic pixel size based on mouse distance
    float dynamicSize = mix(8.0, 2.0, mouseInfluence + clickIntensity * 0.5);
    pixelSize = vec2(dynamicSize) / resolution;
    
    // Pixelate coordinates
    vec2 pixelatedUV = floor(uv / pixelSize) * pixelSize;
    
    // Noise-based displacement
    float noise = snoise(pixelatedUV * 15.0 + time * 0.3) * (mouseInfluence + clickIntensity);
    vec2 displacedUV = pixelatedUV + noise * 0.02;
    
    // Create pixel grid pattern
    vec2 pixelCenter = pixelatedUV + pixelSize * 0.5;
    float pixelDist = length(uv - pixelCenter);
    float pixelMask = 1.0 - smoothstep(0.3, 0.5, pixelDist / length(pixelSize));
    
    // Rainbow/holographic color effect
    vec3 rainbow = vec3(
      sin(displacedUV.x * 30.0 + time * 2.0 + noise * 5.0) * 0.5 + 0.5,
      sin(displacedUV.y * 30.0 + time * 2.5 - noise * 5.0) * 0.5 + 0.5,
      sin((displacedUV.x + displacedUV.y) * 20.0 + time * 3.0) * 0.5 + 0.5
    );
    
    // Chromatic aberration effect
    float aberration = (mouseInfluence * 0.5 + clickIntensity) * 0.02;
    vec3 color = vec3(
      rainbow.r * sin(uv.x * resolution.x * 0.1 + time),
      rainbow.g * sin(uv.y * resolution.y * 0.1 + time * 1.1),
      rainbow.b * sin((uv.x + uv.y) * resolution.x * 0.1 + time * 0.9)
    );
    
    // Glitch lines
    float glitchLine = step(0.98, sin(uv.y * resolution.y * 0.5 + time * 10.0)) * (mouseInfluence + clickIntensity);
    color += vec3(glitchLine);
    
    // Scanning line effect
    float scanline = sin(uv.y * resolution.y * 2.0 - time * 5.0) * 0.04;
    color += scanline;
    
    // Grid overlay
    float gridX = step(0.95, sin(uv.x * resolution.x * 0.1));
    float gridY = step(0.95, sin(uv.y * resolution.y * 0.1));
    float grid = max(gridX, gridY) * 0.2;
    color += grid;
    
    // Combine effects with pixel mask
    color *= pixelMask;
    
    // Fade based on mouse distance and intensity
    float intensity = (0.3 + mouseInfluence * 0.4 + clickIntensity * 0.3) * 0.8;
    
    gl_FragColor = vec4(color, intensity);
  }
`;

const BIOSPixelEffect = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const materialRef = useRef(null);
  const frameId = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const clickRef = useRef(0);
  const viewportBoundsRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get desktop viewport bounds
  const getViewportBounds = () => {
    if (isMobile) {
      return {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }

    // For desktop, find the actual BIOS/desktop viewport
    const bios = document.querySelector(".BIOS");
    const desktop = document.querySelector(".desktop");
    const biosWrapper = document.querySelector(".BIOSWrapper");

    // Try BIOS first, then desktop
    const targetElement = bios || desktop || biosWrapper;

    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();

      // For BIOS, we need to account for the actual content area
      if (bios) {
        return {
          left: rect.left,
          top: rect.top,
          width: Math.min(rect.width, 642),
          height: Math.min(rect.height, 481),
        };
      }

      return {
        left: rect.left,
        top: rect.top,
        width: Math.min(rect.width, 640),
        height: Math.min(rect.height, 480),
      };
    }

    // Fallback to centered 640x480
    return {
      left: (window.innerWidth - 640) / 2,
      top: (window.innerHeight - 480) / 2,
      width: 640,
      height: 480,
    };
  };

  useEffect(() => {
    // Immediate check on mount
    const immediateCheck = () => {
      const biosWrapper = document.querySelector(".BIOSWrapper");
      if (biosWrapper) {
        const isHidden = biosWrapper.classList.contains("hidden");
        const computedStyle = window.getComputedStyle(biosWrapper);
        const isVisible =
          !isHidden &&
          computedStyle.display !== "none" &&
          computedStyle.visibility !== "hidden" &&
          computedStyle.opacity !== "0";

        if (isVisible) {
          console.log("BIOS is visible on mount, activating pixel effect");
          setIsVisible(true);
          viewportBoundsRef.current = getViewportBounds();
        }
      }
    };

    // Check immediately
    immediateCheck();
    setTimeout(immediateCheck, 100);

    // Monitor for changes
    const observer = new MutationObserver(() => {
      const biosWrapper = document.querySelector(".BIOSWrapper");
      if (biosWrapper) {
        const isHidden = biosWrapper.classList.contains("hidden");
        const computedStyle = window.getComputedStyle(biosWrapper);
        const isCurrentlyVisible =
          !isHidden &&
          computedStyle.display !== "none" &&
          computedStyle.visibility !== "hidden" &&
          computedStyle.opacity !== "0";

        setIsVisible(isCurrentlyVisible);
        if (isCurrentlyVisible) {
          viewportBoundsRef.current = getViewportBounds();
        }
      }
    });

    const biosWrapper = document.querySelector(".BIOSWrapper");
    if (biosWrapper) {
      observer.observe(biosWrapper, {
        attributes: true,
        attributeFilter: ["class", "style"],
        subtree: true,
      });
    }

    // Listen for events
    const handleShutdownChange = (e) => {
      if (e.detail.isActive) {
        setIsVisible(false);
      }
    };

    const handleBiosComplete = () => {
      console.log("BIOS sequence completed, hiding pixel effect");
      setIsVisible(false);
    };

    window.addEventListener("shutdownStateChanged", handleShutdownChange);
    window.addEventListener("biosSequenceCompleted", handleBiosComplete);

    return () => {
      observer.disconnect();
      window.removeEventListener("shutdownStateChanged", handleShutdownChange);
      window.removeEventListener("biosSequenceCompleted", handleBiosComplete);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!isVisible || !mountRef.current) return;

    console.log("Initializing BIOS pixel effect");
    const bounds = getViewportBounds();
    viewportBoundsRef.current = bounds;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Create shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mouse: { value: new THREE.Vector2(0.5, 0.5) },
        clickIntensity: { value: 0 },
        resolution: { value: new THREE.Vector2(bounds.width, bounds.height) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    materialRef.current = material;

    // Create plane geometry that covers the viewport
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Set size and position
    renderer.setSize(bounds.width, bounds.height);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.left = `${bounds.left}px`;
    renderer.domElement.style.top = `${bounds.top}px`;

    // Add to DOM
    mountRef.current.appendChild(renderer.domElement);

    // Handle resize
    const handleResize = () => {
      const newBounds = getViewportBounds();
      viewportBoundsRef.current = newBounds;

      renderer.setSize(newBounds.width, newBounds.height);
      material.uniforms.resolution.value.set(newBounds.width, newBounds.height);

      renderer.domElement.style.left = `${newBounds.left}px`;
      renderer.domElement.style.top = `${newBounds.top}px`;
    };

    // Mouse/touch handling
    const handlePointerMove = (e) => {
      const bounds = viewportBoundsRef.current;
      if (!bounds) return;

      const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const relativeX = (x - bounds.left) / bounds.width;
      const relativeY = (y - bounds.top) / bounds.height;

      if (
        relativeX >= 0 &&
        relativeX <= 1 &&
        relativeY >= 0 &&
        relativeY <= 1
      ) {
        material.uniforms.mouse.value.set(relativeX, relativeY);
      }
    };

    const handlePointerDown = (e) => {
      const bounds = viewportBoundsRef.current;
      if (!bounds) return;

      const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      if (
        x >= bounds.left &&
        x <= bounds.left + bounds.width &&
        y >= bounds.top &&
        y <= bounds.top + bounds.height
      ) {
        clickRef.current = 1;
      }
    };

    // Animation loop
    const clock = new THREE.Clock();

    const animate = () => {
      frameId.current = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      if (material) {
        material.uniforms.time.value = time;
        material.uniforms.clickIntensity.value = clickRef.current;
        clickRef.current *= 0.95;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Event listeners
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove);
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("touchstart", handlePointerDown);

    return () => {
      console.log("Cleaning up BIOS pixel effect");
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("touchstart", handlePointerDown);

      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }

      if (renderer.domElement && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isVisible, isMobile]);

  if (!isVisible) return null;

  return <div ref={mountRef} className="bios-pixel-effect" />;
};

export default BIOSPixelEffect;
