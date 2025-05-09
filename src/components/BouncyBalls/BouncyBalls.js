import React, { useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  .screensaver-container {
    margin: 0;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    height: 100%;
    overflow: hidden;
  }
  .screensaver-container canvas {
    width: 100%;
    height: 100%;
  }
`;

const ScreensaverContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background-color: rgba(8, 8, 8, 0.658);
`;

const BouncyBallsScreensaver = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const ballsRef = useRef([]);

  useEffect(() => {
    const initCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      initBalls();
      startAnimation();
    };

    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      initBalls();
    };

    const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomRGB = () =>
      `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`;

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
        if (this.x + this.size >= width || this.x - this.size <= 0) {
          this.velX = -this.velX;
        }
        if (this.y + this.size >= height || this.y - this.size <= 0) {
          this.velY = -this.velY;
        }

        this.x += this.velX;
        this.y += this.velY;
      }

      collisionDetect(balls) {
        for (const ball of balls) {
          if (ball !== this) {
            const dx = this.x - ball.x;
            const dy = this.y - ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.size + ball.size) {
              this.color = ball.color = randomRGB();
            }
          }
        }
      }
    }

    const initBalls = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const width = canvas.width;
      const height = canvas.height;
      ballsRef.current = [];

      while (ballsRef.current.length < 15) {
        const size = random(10, 20);
        const ball = new Ball(
          random(size, width - size),
          random(size, height - size),
          random(1, 7) * 1.1,
          random(1, 7) * 1.1,
          randomRGB(),
          size
        );
        ballsRef.current.push(ball);
      }
    };

    const startAnimation = () => {
      const loop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(0, 0, width, height);

        for (const ball of ballsRef.current) {
          ball.draw(ctx);
          ball.update(width, height);
          ball.collisionDetect(ballsRef.current);
        }

        requestRef.current = requestAnimationFrame(loop);
      };

      requestRef.current = requestAnimationFrame(loop);
    };

    initCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <ScreensaverContainer ref={containerRef} className="screensaver-container">
      <GlobalStyle />
      <canvas ref={canvasRef} />
    </ScreensaverContainer>
  );
};

export default BouncyBallsScreensaver;
