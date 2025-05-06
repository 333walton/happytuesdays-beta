import React, { Component } from 'react';

// Starfield animation class embedded directly in the file
class Starfield {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Configuration options with defaults
    this.options = {
      starsCount: options.starsCount || 300,
      speed: options.speed || 2,
      maxDepth: options.maxDepth || 300,
      color: options.color || '#FFFFFF',
      backgroundColor: options.backgroundColor || '#000000',
      starSize: options.starSize || 2
    };
    
    this.stars = [];
    this.animationFrame = null;
    this.isRunning = false;
    
    // Initialize the canvas
    this.resize();
    
    // Event listener for window resize
    window.addEventListener('resize', this.resize.bind(this));
    
    // Initialize stars
    this.initStars();
  }
  
  resize() {
    // Make canvas fullscreen
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Center coordinates
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
    
    // Reinitialize stars if they exist
    if (this.stars.length > 0) {
      this.initStars();
    }
  }
  
  initStars() {
    this.stars = [];
    
    // Create stars
    for (let i = 0; i < this.options.starsCount; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width - this.centerX,
        y: Math.random() * this.canvas.height - this.centerY,
        z: Math.random() * this.options.maxDepth
      });
    }
  }
  
  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }
  
  stop() {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  animate() {
    if (!this.isRunning) return;
    
    // Clear canvas
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw stars
    this.stars.forEach(star => {
      // Move star closer (decrease z)
      star.z -= this.options.speed;
      
      // Reset star to far away if it's too close
      if (star.z <= 0) {
        star.x = Math.random() * this.canvas.width - this.centerX;
        star.y = Math.random() * this.canvas.height - this.centerY;
        star.z = this.options.maxDepth;
      }
      
      // Project 3D coordinates to 2D screen
      const factor = this.options.maxDepth / star.z;
      const x = star.x * factor + this.centerX;
      const y = star.y * factor + this.centerY;
      
      // Don't draw stars that are outside the canvas
      if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) {
        return;
      }
      
      // Calculate size based on depth
      const size = Math.min(
        Math.max(this.options.starSize * factor, 0.1),
        3
      );
      
      // Calculate brightness based on depth
      const opacity = Math.min(1, 0.5 + factor * 0.5);
      
      // Draw star
      this.ctx.beginPath();
      this.ctx.fillStyle = this.options.color;
      this.ctx.globalAlpha = opacity;
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
    });
    
    // Continue animation
    this.animationFrame = requestAnimationFrame(this.animate.bind(this));
  }
}

// React component that uses the Starfield class
class StarfieldContainer extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.starfield = null;
  }

  componentDidMount() {
    // Initialize starfield when component mounts
    if (this.canvasRef.current) {
      this.starfield = new Starfield(this.canvasRef.current, {
        starsCount: 300,
        speed: 1.5,
        maxDepth: 300,
        starSize: 2,
        backgroundColor: '#000000',
        color: '#FFFFFF'
      });
      
      this.starfield.start();
    }
  }

  componentWillUnmount() {
    // Stop animation when component unmounts
    if (this.starfield) {
      this.starfield.stop();
      this.starfield = null;
    }
  }

  render() {
    return (
      <canvas
        ref={this.canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1, // Place below all content instead of just below monitor
          pointerEvents: 'none' // Still don't block clicks
        }}
      />
    );
  }
}

export default StarfieldContainer;