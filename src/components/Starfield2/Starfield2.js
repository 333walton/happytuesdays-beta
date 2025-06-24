import React, { Component } from "react";

class Starfield2 extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.p5Instance = null;
    this.script = null;
  }

  componentDidMount() {
    // Load P5.js from CDN
    this.loadP5Js().then(() => {
      this.initializeP5Sketch();
    });
  }

  componentWillUnmount() {
    // Clean up P5.js instance if it exists
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }

    // Remove the script tag if it exists
    if (this.script && document.body.contains(this.script)) {
      document.body.removeChild(this.script);
    }
  }

  loadP5Js() {
    return new Promise((resolve, reject) => {
      // Check if P5.js is already loaded
      if (window.p5) {
        resolve();
        return;
      }

      // Create script element for P5.js
      this.script = document.createElement("script");
      this.script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js";
      this.script.async = true;
      this.script.onload = () => resolve();
      this.script.onerror = (error) => reject(error);

      // Append the script to the document
      document.body.appendChild(this.script);
    });
  }

  initializeP5Sketch() {
    const sketch = (p) => {
      let stars = [];
      let viewPoint;

      p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight);
        p.background(0, 0, 0);
        p.frameRate(30);
        setViewPoint(0, 0);
        resetStarfield();
      };

      function resetStarfield() {
        stars = [];
      }

      function setViewPoint(x, y) {
        viewPoint = p.createVector(
          p.map(x, 0, p.width, 0, 15),
          p.map(y, 0, p.height, 0, 15)
        );
      }

      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
        resetStarfield();
      };

      p.doubleClicked = () => {
        // Ignore clicks in the monitor controls area (top-left)
        if (p.mouseX < 250 && p.mouseY < 500) {
          return;
        }

        const fs = p.fullscreen();
        p.fullscreen(!fs);
      };

      p.mousePressed = () => {
        // Ignore clicks in the monitor controls area (top-left)
        if (p.mouseX < 250 && p.mouseY < 500) {
          return;
        }

        p.noCursor();
      };

      p.mouseReleased = () => {
        // Ignore clicks in the monitor controls area (top-left)
        if (p.mouseX < 250 && p.mouseY < 500) {
          return;
        }

        p.cursor();
      };

      p.draw = () => {
        // Space, the final frontier...
        p.clear();
        p.background(0, 0, 0);

        // Check if mouse is in the monitor controls area
        const isInControlsArea = p.mouseX < 250 && p.mouseY < 500;

        // Make it so!
        if (p.mouseIsPressed && !isInControlsArea) {
          setViewPoint(p.mouseX - p.width / 2, p.mouseY - p.height / 2);
          for (let i = 0; i < 20; i++) {
            let star = new Star(createVectorTunnel());
            stars.push(star);
          }
        } else {
          setViewPoint(0, 0);
        }

        // 1/4 impulse.
        for (let i = 0; i < 15; i++) {
          let star = new Star(createVectorField());
          stars.push(star);
        }

        // On the screen.
        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];
          if (star.isDead()) {
            stars.splice(i, 1);
          } else {
            star.draw();
          }
        }
      };

      function createVectorTunnel() {
        const radius = 50;
        const angle = p.random(0.0, 180.0);
        let x = p.width / 2 + radius * p.cos(angle);
        let y = p.height / 2 + radius * p.sin(angle);
        return p.createVector(x, y);
      }

      function createVectorField() {
        return p.createVector(p.random(0, p.width), p.random(0, p.height));
      }

      function Star(position) {
        this.color = 0;
        this.size = 2;
        this.position = position;
        this.vector = p.createVector(
          this.position.x - p.width / 2,
          this.position.y - p.height / 2
        );
        this.direction = this.vector.copy().normalize();

        this.draw = function () {
          p.noStroke();
          p.fill(p.map(this.color, 0, 100, 0, 254));
          this.direction.mult(p.random(1.07, 1.1));
          this.position.add(this.direction);
          this.position.add(viewPoint);
          p.ellipse(this.position.x, this.position.y, this.size);
          this.size += 0.05;
          if (this.color <= 100) {
            this.color += 3;
          }
        };

        this.isDead = function () {
          return (
            this.position.x < 0 ||
            this.position.y < 0 ||
            this.position.x > p.width ||
            this.position.y > p.height
          );
        };
      }
    };

    // Initialize the P5 instance with the canvas reference
    this.p5Instance = new window.p5(sketch, this.canvasRef.current);
  }

  render() {
    return (
      <div
        ref={this.canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 90, // Lower than monitor overlay (100)
          pointerEvents: "auto", // Allow mouse interactions for effect
        }}
      />
    );
  }
}

export default Starfield2;
