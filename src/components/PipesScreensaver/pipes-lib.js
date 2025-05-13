// src/pipes-lib.js
/**
 * Simplified implementation of the classic Windows 98 pipes screensaver
 * This file serves as both the pipes implementation and adapter
 */

// Main Pipes class
export class Pipes {
    constructor(options = {}) {
      // Default options
      this.options = {
        canvas: null,
        pipeSize: 15,
        speed: 2,
        maxPipes: 20,
        colorScheme: 'classic', // classic, rainbow
        joinChance: 0.25,
        clearBg: true,
        startingPoints: 'random',
        ...options
      };
  
      // Validate required options
      if (!this.options.canvas) {
        throw new Error('Pipes requires a canvas element');
      }
  
      // Initialize properties
      this.canvas = this.options.canvas;
      this.ctx = this.canvas.getContext('2d');
      this.pipes = [];
      this.running = false;
      this.animationFrameId = null;
      this.lastFrameTime = 0;
      
      // Pipe directions: up, right, down, left
      this.directions = [
        { dx: 0, dy: -1 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 }
      ];
      
      // Set colors based on scheme
      this.setColorScheme(this.options.colorScheme);
    }
    
    // Set color scheme
    setColorScheme(scheme) {
      switch (scheme) {
        case 'rainbow':
          this.pipeColors = [
            '#FF0000', // Red
            '#FF7F00', // Orange
            '#FFFF00', // Yellow
            '#00FF00', // Green
            '#0000FF', // Blue
            '#4B0082', // Indigo
            '#9400D3'  // Violet
          ];
          this.bgColor = '#000000';
          this.gridColor = '#1A1A1A';
          break;
        case 'classic':
        default:
          // Classic Windows 98 blue pipes
          this.pipeColors = ['#008BEF'];
          this.bgColor = '#000000';
          this.gridColor = '#000F3B';
          break;
      }
    }
    
    // Create a new pipe
    createPipe() {
      const gridSize = this.options.pipeSize;
      const cols = Math.floor(this.canvas.width / gridSize);
      const rows = Math.floor(this.canvas.height / gridSize);
      
      // Randomize starting point based on startingPoints option
      let x, y;
      
      if (this.options.startingPoints === 'edges') {
        // Start from an edge
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
          case 0: // Top
            x = Math.floor(Math.random() * cols) * gridSize;
            y = 0;
            break;
          case 1: // Right
            x = (cols - 1) * gridSize;
            y = Math.floor(Math.random() * rows) * gridSize;
            break;
          case 2: // Bottom
            x = Math.floor(Math.random() * cols) * gridSize;
            y = (rows - 1) * gridSize;
            break;
          case 3: // Left
            x = 0;
            y = Math.floor(Math.random() * rows) * gridSize;
            break;
        }
      } else {
        // Random starting point
        x = Math.floor(Math.random() * cols) * gridSize;
        y = Math.floor(Math.random() * rows) * gridSize;
      }
      
      // Random direction (0 = up, 1 = right, 2 = down, 3 = left)
      const direction = Math.floor(Math.random() * 4);
      
      // Random color
      const colorIndex = Math.floor(Math.random() * this.pipeColors.length);
      const color = this.pipeColors[colorIndex];
      
      return {
        x,
        y,
        direction,
        color,
        length: 0,
        maxLength: Math.floor(Math.random() * 20) + 10, // Random length
        growing: true,
        path: [],
        turns: []
      };
    }
    
    // Draw a single pipe
    drawPipe(pipe) {
      const gridSize = this.options.pipeSize;
      
      this.ctx.strokeStyle = pipe.color;
      this.ctx.lineWidth = Math.floor(gridSize * 0.6);
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      
      // Start a new path
      this.ctx.beginPath();
      
      // Move to starting position
      let startX = pipe.x + gridSize / 2;
      let startY = pipe.y + gridSize / 2;
      this.ctx.moveTo(startX, startY);
      
      // Draw each segment
      for (let i = 0; i < pipe.path.length; i++) {
        const { x, y } = pipe.path[i];
        const endX = x + gridSize / 2;
        const endY = y + gridSize / 2;
        this.ctx.lineTo(endX, endY);
      }
      
      // Stroke the path
      this.ctx.stroke();
      
      // Draw elbow joints
      this.ctx.fillStyle = pipe.color;
      for (let i = 0; i < pipe.turns.length; i++) {
        const { x, y } = pipe.turns[i];
        const centerX = x + gridSize / 2;
        const centerY = y + gridSize / 2;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, Math.floor(gridSize * 0.4), 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    
    // Update pipe position
    updatePipe(pipe) {
      const gridSize = this.options.pipeSize;
      const { dx, dy } = this.directions[pipe.direction];
      
      // If growing, add to the path
      if (pipe.growing) {
        // Add current position to path
        pipe.path.push({ x: pipe.x, y: pipe.y });
        
        // Move to new position
        pipe.x += dx * gridSize;
        pipe.y += dy * gridSize;
        
        // Increment length
        pipe.length++;
        
        // Check if pipe should stop growing
        if (pipe.length >= pipe.maxLength) {
          pipe.growing = false;
        }
        
        // Check if out of bounds
        if (
          pipe.x < 0 || 
          pipe.x >= this.canvas.width || 
          pipe.y < 0 || 
          pipe.y >= this.canvas.height
        ) {
          pipe.growing = false;
        }
        
        // Randomly change direction
        if (Math.random() < 0.2 && pipe.growing) {
          // Prefer turns that don't go back the way we came
          const currentDir = pipe.direction;
          const oppositeDir = (currentDir + 2) % 4;
          
          let newDir;
          do {
            newDir = Math.floor(Math.random() * 4);
          } while (newDir === oppositeDir);
          
          // Record turn position
          if (newDir !== currentDir) {
            pipe.turns.push({ x: pipe.x, y: pipe.y });
          }
          
          pipe.direction = newDir;
        }
        
        // Check for joining with other pipes
        if (this.options.joinChance > 0 && Math.random() < this.options.joinChance) {
          // TODO: Implement pipe joining logic
        }
      } else {
        // If not growing, remove from the beginning
        if (pipe.path.length > 0) {
          pipe.path.shift();
        }
        
        // If turns array isn't empty and the first turn corresponds to the removed path segment
        if (pipe.turns.length > 0 && pipe.turns[0] && pipe.path.length > 0) {
          const firstPoint = pipe.path[0];
          const firstTurn = pipe.turns[0];
          
          // If the first point is now past the first turn, remove the turn
          if (
            (firstPoint.x !== firstTurn.x) || 
            (firstPoint.y !== firstTurn.y)
          ) {
            pipe.turns.shift();
          }
        }
      }
      
      // Return true if pipe still exists
      return pipe.path.length > 0;
    }
    
    // Draw the background grid
    drawGrid() {
      const gridSize = this.options.pipeSize;
      const cols = Math.floor(this.canvas.width / gridSize);
      const rows = Math.floor(this.canvas.height / gridSize);
      
      this.ctx.strokeStyle = this.gridColor;
      this.ctx.lineWidth = 1;
      
      // Draw vertical lines
      for (let i = 0; i <= cols; i++) {
        const x = i * gridSize;
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.canvas.height);
        this.ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let i = 0; i <= rows; i++) {
        const y = i * gridSize;
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
      }
    }
    
    // Animation loop
    animate(timestamp) {
      if (!this.running) return;
      
      // Calculate delta time for smooth animation
      const deltaTime = timestamp - this.lastFrameTime;
      this.lastFrameTime = timestamp;
      
      // Skip frames for speed control
      if (deltaTime < 1000 / (60 * this.options.speed)) {
        // Use a safer binding approach to avoid circular references
        const animateFrame = (nextTimestamp) => {
          if (!this.running) return;
          this.animate(nextTimestamp);
        };
        
        this.animationFrameId = requestAnimationFrame(animateFrame);
        return;
      }
      
      // Clear canvas
      if (this.options.clearBg) {
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
      
      // Draw grid
      this.drawGrid();
      
      // Update and draw existing pipes
      this.pipes = this.pipes.filter(pipe => {
        const exists = this.updatePipe(pipe);
        if (exists) {
          this.drawPipe(pipe);
        }
        return exists;
      });
      
      // Add new pipes if needed
      if (this.pipes.length < this.options.maxPipes) {
        if (Math.random() < 0.1) {
          this.pipes.push(this.createPipe());
        }
      }
      
      // Schedule next frame with safer binding
      const animateFrame = (nextTimestamp) => {
        if (!this.running) return;
        this.animate(nextTimestamp);
      };
      
      this.animationFrameId = requestAnimationFrame(animateFrame);
    }
    
    // Start animation
    start() {
      if (this.running) return;
      
      this.running = true;
      this.lastFrameTime = performance.now();
      
      // Initialize canvas if needed
      if (this.canvas.width === 0) {
        this.canvas.width = this.canvas.clientWidth;
      }
      if (this.canvas.height === 0) {
        this.canvas.height = this.canvas.clientHeight;
      }
      
      // Clear existing pipes
      this.pipes = [];
      
      // Start with a few pipes
      for (let i = 0; i < 5; i++) {
        this.pipes.push(this.createPipe());
      }
      
      // Use a safer binding approach to avoid circular references
      const animateFrame = (timestamp) => {
        if (!this.running) return;
        this.animate(timestamp);
      };
      
      // Start animation loop
      this.animationFrameId = requestAnimationFrame(animateFrame);
    }
    
    // Stop animation
    stop() {
      this.running = false;
      
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }
    
    // Resize handler
    resize(width, height) {
      // Update canvas dimensions
      this.canvas.width = width || this.canvas.clientWidth;
      this.canvas.height = height || this.canvas.clientHeight;
      
      // Adjust pipe size if needed
      // this.options.pipeSize = Math.max(10, Math.floor(Math.min(this.canvas.width, this.canvas.height) / 30));
      
      // Clear pipes and restart
      this.pipes = [];
      
      // Restart if running
      if (this.running) {
        this.stop();
        this.start();
      }
    }
    
    // Reset the animation
    reset() {
      this.pipes = [];
      
      if (this.running) {
        this.stop();
        this.start();
      }
    }
  }
  
  // Export the Pipes class as default
  export default Pipes;