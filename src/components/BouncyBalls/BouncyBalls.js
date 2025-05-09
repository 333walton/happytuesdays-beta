import React, { useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import BouncyBallsScreensaver from '../BouncyBalls';

// Global styles based on the provided CSS
const GlobalStyle = createGlobalStyle`
  /* These styles will only apply within the screensaver container */
  .screensaver-container {
    margin: 0;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    height: 100%;
    overflow: hidden;
  }
  
  .screensaver-container h1 {
    font-size: 2rem;
    letter-spacing: -1px;
    position: absolute;
    margin: 0;
    top: 20px;
    left: 75px;
    color: white;
    z-index: 10;
  }
  
  .screensaver-container canvas {
    width: 100%;
    height: 100%;
  }
`;

// Styled container for the screensaver
const ScreensaverContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background-color: rgba(8, 8, 8, 0.658);
`;

/**
 * Maze3DContainerV2 component - Bounce Effect screensaver
 * Based on the original implementation from nfolkman/Bounce-Effect
 */
const BouncyBalls = () => {
  // Refs for canvas and animation frame
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const ballsRef = useRef([]);
  
  // Initialize canvas and start animation
  useEffect(() => {
    // Initialize canvas when component mounts
    initCanvas();
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
  
  // Handle resize event
  const handleResize = () => {
    if (canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      
      // Update canvas dimensions
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
      
      // Re-initialize balls to stay within new boundaries
      initBalls();
    }
  };
  
  // Initialize canvas
  const initCanvas = () => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = containerRef.current.clientWidth;
    canvas.height = containerRef.current.clientHeight;
    
    // Initialize balls
    initBalls();
    
    // Start animation loop
    startAnimation();
  };
  
  // Function to generate random number between min and max
  const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  // Function to generate random RGB color
  const randomRGB = () => {
    return `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`;
  };
  
  // Ball class definition (following the original implementation)
  class Ball {
    constructor(x, y, velX, velY, color, size) {
      this.x = x;
      this.y = y;
      this.velX = velX;
      this.velY = velY;
      this.color = color;
      this.size = size;
    }
    
    draw(ctx) {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    update(width, height) {
      // Reverse if ball will hit right side
      if ((this.x + this.size) >= width) {
        this.velX = -(this.velX);
      }
      
      // Reverse if ball will hit left side
      if ((this.x - this.size) <= 0) {
        this.velX = -(this.velX);
      }
      
      // Reverse if ball will hit bottom
      if ((this.y + this.size) >= height) {
        this.velY = -(this.velY);
      }
      
      // Reverse if ball will hit top
      if ((this.y - this.size) <= 0) {
        this.velY = -(this.velY);
      }
      
      // Update position
      this.x += this.velX;
      this.y += this.velY;
    }
    
    collisionDetect(balls) {
      for (const ball of balls) {
        if (!(this === ball)) {
          const dx = this.x - ball.x;
          const dy = this.y - ball.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < this.size + ball.size) {
            ball.color = this.color = randomRGB();
          }
        }
      }
    }
  }
  
  // Initialize balls
  const initBalls = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear previous balls
    ballsRef.current = [];
    
    // Create new balls
    while (ballsRef.current.length < 15) {
      const size = random(10, 20);
      // Calculate velocities, increased by 10% from original
      const velX = random(1, 7) * 1.1;
      const velY = random(1, 7) * 1.1;
      
      const ball = new Ball(
        random(0 + size, width - size),   // x-coordinate
        random(0 + size, height - size),  // y-coordinate
        velX,                             // vel-X (sped up by 10%)
        velY,                             // vel-Y (sped up by 10%)
        randomRGB(),                      // random RGB color
        size                              // size
      );
      
      ballsRef.current.push(ball);
    }
  };
  
  // Start animation loop
  const startAnimation = () => {
    const loop = () => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      // Semi-transparent fill to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(0, 0, width, height);
      
      // Update and draw balls
      for (const ball of ballsRef.current) {
        ball.draw(ctx);
        ball.update(width, height);
        ball.collisionDetect(ballsRef.current);
      }
      
      // Continue animation
      requestRef.current = requestAnimationFrame(loop);
    };
    
    // Start the loop
    requestRef.current = requestAnimationFrame(loop);
  };
  
  return (
    <ScreensaverContainer ref={containerRef} className="screensaver-container">
      <GlobalStyle />
      <h1></h1>
      <canvas ref={canvasRef} />
    </ScreensaverContainer>
  );
};

export default BouncyBallsScreensaver;