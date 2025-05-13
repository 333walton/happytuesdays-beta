import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

// Container for the screensaver
const ScreensaverContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000000;
`;

// Canvas element with explicit dimensions
const ScreensaverCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  image-rendering: pixelated;
`;

/**
 * Windows 98 Pipes Screensaver with customization options
 * Based on 1j01/pipes with slower animation
 */
const PipesScreensaver = ({ 
  // Customization props with defaults
  colorScheme = "links",   // classic, rainbow, links, warm, greyscale
  pipeSize = 16,             // Larger = fewer, thicker pipes
  pipeSpeed = 0.75,           // Very slow (original is ~2.0)
  maxPipes = 125,             // Number of simultaneous pipes
  connectionChance = 0.45,   // Chance of pipes connecting (0-1)
  showGrid = true,           // Show background grid
  gridOpacity = 0,         // Grid opacity
  rotatePipes = true,       // Allow diagonal pipes
  debug = false              // Show debug info
}) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Color schemes based on 1j01/pipes
  const colorSchemes = {
    classic: {
      pipe: "#0066FF",       // Windows 98 blue
      background: "#000000", // Black
      grid: "#000A26",       // Very dark blue
    },
    rainbow: {
      pipe: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"],
      background: "#000000",
      grid: "#1A1A1A",
    },
    links: {
      pipe: ["#00A900", "#5555FF", "#FF5555", "#AA00AA"],
      background: "#000000",
      grid: "#1A1A1A",
    },
    warm: {
      pipe: ["#FF0000", "#FF7F00", "#FFFF00", "#FF00FF", "#FF7FFF"],
      background: "#000000",
      grid: "#1A1A1A",
    },
    greyscale: {
      pipe: ["#FFFFFF", "#AAAAAA", "#777777"],
      background: "#000000",
      grid: "#333333",
    }
  };
  
  // Animation state using ref to avoid re-renders
  const stateRef = useRef({
    pipes: [],
    gridSize: pipeSize,
    pipeWidth: Math.floor(pipeSize * 0.6),
    maxPipes: maxPipes,
    speed: pipeSpeed,
    connectionChance: connectionChance,
    rotate: rotatePipes,
    colors: colorSchemes[colorScheme] || colorSchemes.classic,
    showGrid: showGrid,
    gridOpacity: gridOpacity,
    lastFrameTime: 0,
    frameCount: 0,
    fps: 0
  });
  
  // Simple Pipe class
  class Pipe {
    constructor(canvas, startPosition = null) {
      const { gridSize } = stateRef.current;
      const cols = Math.floor(canvas.width / gridSize);
      const rows = Math.floor(canvas.height / gridSize);
      
      // Use provided start position or random position
      if (startPosition) {
        this.x = startPosition.x;
        this.y = startPosition.y;
      } else {
        // Random starting position
        this.x = Math.floor(Math.random() * cols) * gridSize;
        this.y = Math.floor(Math.random() * rows) * gridSize;
      }
      
      // Direction (0=up, 1=up-right, 2=right, etc.)
      this.direction = stateRef.current.rotate ? 
        Math.floor(Math.random() * 8) : 
        Math.floor(Math.random() * 4) * 2; // Only cardinal directions
      
      // Track segments and turns
      this.segments = [];
      this.turns = [];
      this.length = 0;
      this.maxLength = Math.floor(Math.random() * 25) + 10;
      this.growing = true;
      this.progress = 0; // For slow animation
      
      // Choose color from scheme
      const { colors } = stateRef.current;
      if (Array.isArray(colors.pipe)) {
        this.color = colors.pipe[Math.floor(Math.random() * colors.pipe.length)];
      } else {
        this.color = colors.pipe;
      }
      
      // Add starting point
      this.segments.push({ x: this.x, y: this.y });
    }
    
    // Direction vectors (including diagonals)
    getDirectionVector() {
      // 8 directions: N, NE, E, SE, S, SW, W, NW
      const vectors = [
        { dx: 0, dy: -1 },   // N
        { dx: 1, dy: -1 },   // NE
        { dx: 1, dy: 0 },    // E
        { dx: 1, dy: 1 },    // SE
        { dx: 0, dy: 1 },    // S
        { dx: -1, dy: 1 },   // SW
        { dx: -1, dy: 0 },   // W
        { dx: -1, dy: -1 }   // NW
      ];
      
      return vectors[this.direction];
    }
    
    // Check if position has an existing pipe
    static hasPipeAt(pipes, x, y) {
      return pipes.some(pipe => 
        pipe.segments.some(seg => seg.x === x && seg.y === y)
      );
    }
    
    // Try to connect to another pipe
    tryConnect(pipes, canvas) {
      if (Math.random() > stateRef.current.connectionChance) return false;
      
      const { gridSize } = stateRef.current;
      const { dx, dy } = this.getDirectionVector();
      
      // Look ahead to see if a pipe is in front of us
      const aheadX = this.x + dx * gridSize;
      const aheadY = this.y + dy * gridSize;
      
      // Find a pipe at this position that isn't us
      const targetPipe = pipes.find(p => 
        p !== this && 
        p.segments.some(seg => seg.x === aheadX && seg.y === aheadY)
      );
      
      if (targetPipe) {
        // Connected! Stop growing
        this.growing = false;
        return true;
      }
      
      return false;
    }
    
    // Move the pipe
    update(pipes, canvas, deltaTime) {
      const { speed, gridSize } = stateRef.current;
      
      // Progress for slow movement
      this.progress += speed * deltaTime / 16.67;
      
      if (this.progress < 1) {
        return true; // Still waiting to move
      }
      
      // Reset progress
      this.progress = 0;
      
      if (this.growing) {
        // Try to connect to another pipe
        if (this.tryConnect(pipes, canvas)) {
          return true; // Connected and still exists
        }
        
        // Get current direction vector
        const { dx, dy } = this.getDirectionVector();
        
        // Move to next position
        this.x += dx * gridSize;
        this.y += dy * gridSize;
        
        // Check if out of bounds
        if ((this.x < 0) || (this.x >= canvas.width) || (this.y < 0) || (this.y >= canvas.height)) {
          this.growing = false;
          return true; // Still exists
        }
        
        // Check if we hit an existing pipe (including ourselves)
        if (Pipe.hasPipeAt(pipes, this.x, this.y)) {
          // We hit a pipe, stop growing
          this.growing = false;
          return true;
        }
        
        // Add new segment
        this.segments.push({ x: this.x, y: this.y });
        this.length++;
        
        // Check if we've reached max length
        if (this.length >= this.maxLength) {
          this.growing = false;
          return true; // Still exists
        }
        
        // Random chance to change direction
        if (Math.random() < 0.15) {
          // Don't go backwards (opposite direction)
          let newDir;
          
          if (stateRef.current.rotate) {
            // With rotation, just don't go directly backwards
            const oppositeDir = (this.direction + 4) % 8;
            do {
              newDir = Math.floor(Math.random() * 8);
            } while (newDir === oppositeDir);
          } else {
            // Without rotation, stick to cardinal directions
            const oldDir = this.direction;
            const possibleDirs = [0, 2, 4, 6]; // N, E, S, W
            const oppositeIndex = (possibleDirs.indexOf(oldDir) + 2) % 4;
            const validDirs = possibleDirs.filter((_, i) => i !== oppositeIndex);
            newDir = validDirs[Math.floor(Math.random() * validDirs.length)];
          }
          
          // Only record turn if direction actually changed
          if (newDir !== this.direction) {
            this.direction = newDir;
            this.turns.push({ x: this.x, y: this.y });
          }
        }
        
        return true; // Still exists
      } else {
        // Wait longer before shrinking
        this.progress += speed * 0.5; // Shrink slower than growth
        
        if (this.progress < 1) {
          return true; // Still waiting to shrink
        }
        this.progress = 0;
        
        // Shrink by removing oldest segment
        if (this.segments.length > 0) {
          this.segments.shift();
          
          // Remove turns that are no longer in the pipe
          while (
            this.turns.length > 0 && 
            this.segments.length > 0 && 
            !this.segments.some(s => s.x === this.turns[0].x && s.y === this.turns[0].y)
          ) {
            this.turns.shift();
          }
          
          return this.segments.length > 0; // Exists if has segments
        }
        return false; // Pipe is gone
      }
    }
    
    draw(ctx) {
      const { gridSize, pipeWidth } = stateRef.current;
      
      // Nothing to draw
      if (this.segments.length === 0) return;
      
      // Draw pipe segments
      ctx.strokeStyle = this.color;
      ctx.lineWidth = pipeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      
      // Start at first segment center
      const first = this.segments[0];
      ctx.moveTo(first.x + gridSize/2, first.y + gridSize/2);
      
      // Draw line to each segment
      for (let i = 1; i < this.segments.length; i++) {
        const segment = this.segments[i];
        ctx.lineTo(segment.x + gridSize/2, segment.y + gridSize/2);
      }
      
      ctx.stroke();
      
      // Draw turns as circles (slightly brighter than the pipe)
      ctx.fillStyle = this.lightenColor(this.color, 20);
      for (const turn of this.turns) {
        ctx.beginPath();
        ctx.arc(
          turn.x + gridSize/2,
          turn.y + gridSize/2,
          pipeWidth * 0.7,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
    
    // Helper to lighten a color
    lightenColor(color, percent) {
      const num = parseInt(color.replace("#", ""), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.min(255, (num >> 16) + amt);
      const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
      const B = Math.min(255, (num & 0x0000FF) + amt);
      return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }
  }
  
  // Draw everything
  const draw = (timestamp) => {
    const state = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Calculate delta time
    const deltaTime = timestamp - state.lastFrameTime;
    state.lastFrameTime = timestamp;
    
    // Update FPS calculation every second
    state.frameCount++;
    if (timestamp - state.lastFpsUpdate > 1000) {
      state.fps = Math.round((state.frameCount * 1000) / (timestamp - state.lastFpsUpdate));
      state.lastFpsUpdate = timestamp;
      state.frameCount = 0;
    }
    
    // Clear canvas
    ctx.fillStyle = state.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    if (state.showGrid) {
      ctx.strokeStyle = state.colors.grid;
      ctx.lineWidth = 1;
      ctx.globalAlpha = state.gridOpacity;
      
      const cols = Math.floor(canvas.width / state.gridSize) + 1;
      const rows = Math.floor(canvas.height / state.gridSize) + 1;
      
      // Draw vertical lines
      for (let i = 0; i <= cols; i++) {
        const x = i * state.gridSize - 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let i = 0; i <= rows; i++) {
        const y = i * state.gridSize - 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1.0;
    }
    
    // Update pipes
    state.pipes = state.pipes.filter(pipe => {
      const exists = pipe.update(state.pipes, canvas, deltaTime);
      if (exists) {
        pipe.draw(ctx);
      }
      return exists;
    });
    
    // Add new pipes if needed - slower spawn rate for a cleaner look
    if (state.pipes.length < state.maxPipes && Math.random() < 0.03) {
      state.pipes.push(new Pipe(canvas));
    }
    
    // Draw debug info
    if (debug) {
      ctx.fillStyle = "#00FF00";
      ctx.font = "12px monospace";
      ctx.fillText(`Pipes: ${state.pipes.length}/${state.maxPipes}`, 10, 20);
      ctx.fillText(`FPS: ${state.fps}`, 10, 40);
      ctx.fillText(`Speed: ${state.speed.toFixed(2)}`, 10, 60);
    }
    
    // Schedule next frame
    requestRef.current = requestAnimationFrame(draw);
  };
  
  // Initialize the canvas and start animation
  const initialize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set actual dimensions
    canvas.width = canvas.clientWidth || window.innerWidth;
    canvas.height = canvas.clientHeight || window.innerHeight;
    
    console.log("Canvas initialized:", canvas.width, "x", canvas.height);
    
    // Update state with props
    stateRef.current = {
      ...stateRef.current,
      gridSize: pipeSize,
      pipeWidth: Math.floor(pipeSize * 0.6),
      maxPipes: maxPipes,
      speed: pipeSpeed,
      connectionChance: connectionChance,
      rotate: rotatePipes,
      colors: colorSchemes[colorScheme] || colorSchemes.classic,
      showGrid: showGrid,
      gridOpacity: gridOpacity,
      pipes: [],
      lastFrameTime: performance.now(),
      lastFpsUpdate: performance.now(),
      frameCount: 0,
      fps: 0
    };
    
    // Create initial pipes
    for (let i = 0; i < Math.min(3, maxPipes); i++) {
      stateRef.current.pipes.push(new Pipe(canvas));
    }
    
    setIsInitialized(true);
    
    // Start animation
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    requestRef.current = requestAnimationFrame(draw);
  };
  
  // Handle resize
  const handleResize = () => {
    // Reset and reinitialize
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    
    initialize();
  };
  
  // Initialize and start animation
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      initialize();
    }, 100);
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      clearTimeout(initTimeout);
      window.removeEventListener('resize', handleResize);
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [
    // Re-initialize if these props change
    colorScheme, pipeSize, pipeSpeed, maxPipes, 
    connectionChance, showGrid, gridOpacity, rotatePipes
  ]);
  
  return (
    <ScreensaverContainer>
      <ScreensaverCanvas ref={canvasRef} />
      {!isInitialized && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontFamily: "MS Sans Serif, Arial, sans-serif"
        }}>
          Loading Pipes Screensaver...
        </div>
      )}
    </ScreensaverContainer>
  );
};

export default PipesScreensaver;