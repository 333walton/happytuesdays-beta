import React, { useEffect, useRef } from "react";
import styled from "styled-components";

// Styled container for full-window effect
const ScreensaverContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0; left: 0;
  background: #000;
`;

const FlowerBoxScreensaver = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      alert("WebGL not supported");
      return;
    }

    // --- SHADERS ---
    const vsSource = `
      attribute vec3 a_position;
      attribute vec4 a_color;
      uniform mat4 u_modelViewMatrix;
      uniform mat4 u_projectionMatrix;
      uniform float u_morphTime;
      uniform float u_numPetals;
      varying vec4 v_color;
      void main() {
        float morphCycle = mod(u_morphTime, 7.5);
        float morphFactor = -abs(1.6 * morphCycle - 6.0) + 5.0;
        morphFactor = max(0.0, morphFactor);

        vec3 direction = normalize(a_position);
        float angle = atan(a_position.y, a_position.x);
        float zAngle = atan(a_position.z, length(a_position.xy));
        float petals = sin(angle * u_numPetals) * cos(zAngle * u_numPetals);
        float flowerFactor = 1.0 + petals * morphFactor * 0.6;
        vec3 morphedPosition = direction * flowerFactor;
        vec3 finalPosition = mix(a_position, morphedPosition, morphFactor);

        gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(finalPosition, 1.0);
        v_color = a_color;
      }
    `;
    const fsSource = `
      precision mediump float;
      varying vec4 v_color;
      void main() {
        gl_FragColor = v_color;
      }
    `;

    // --- SHADER COMPILATION ---
    function loadShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }
    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    // --- CUBE GEOMETRY ---
    function generateSubdividedCube(divisions) {
      const positions = [];
      const colors = [];
      const indices = [];
      const faceColors = [
        [0.0, 1.0, 1.0, 1.0], // Front - Cyan
        [1.0, 1.0, 0.0, 1.0], // Back - Yellow
        [1.0, 0.0, 0.0, 1.0], // Top - Red
        [0.0, 1.0, 0.0, 1.0], // Bottom - Green
        [0.0, 0.0, 1.0, 1.0], // Right - Blue
        [1.0, 0.0, 1.0, 1.0], // Left - Magenta
      ];
      const orientations = [
        // Front Z+
        (u, v) => [-1 + u * 2, -1 + v * 2, 1],
        // Back Z-
        (u, v) => [1 - u * 2, -1 + v * 2, -1],
        // Top Y+
        (u, v) => [-1 + u * 2, 1, -1 + v * 2],
        // Bottom Y-
        (u, v) => [-1 + u * 2, -1, 1 - v * 2],
        // Right X+
        (u, v) => [1, -1 + u * 2, 1 - v * 2],
        // Left X-
        (u, v) => [-1, -1 + u * 2, -1 + v * 2],
      ];

      for (let face = 0; face < 6; face++) {
        const startVertex = positions.length / 3;
        const color = faceColors[face];
        const orientation = orientations[face];
        for (let v = 0; v <= divisions; v++) {
          for (let u = 0; u <= divisions; u++) {
            const pos = orientation(u / divisions, v / divisions);
            positions.push(...pos);
            colors.push(...color);
          }
        }
        const vertsPerRow = divisions + 1;
        for (let v = 0; v < divisions; v++) {
          for (let u = 0; u < divisions; u++) {
            const idx = startVertex + v * vertsPerRow + u;
            indices.push(idx, idx + 1, idx + vertsPerRow + 1);
            indices.push(idx, idx + vertsPerRow + 1, idx + vertsPerRow);
          }
        }
      }
      return {
        positions: new Float32Array(positions),
        colors: new Float32Array(colors),
        indices: new Uint16Array(indices),
        numIndices: indices.length,
      };
    }
    const subdiv = 28; // As in the original
    const geometry = generateSubdividedCube(subdiv);

    // --- BUFFERS ---
    function createBuffer(type, data) {
      const buffer = gl.createBuffer();
      const target = type === "ELEMENT_ARRAY_BUFFER" ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
      gl.bindBuffer(target, buffer);
      gl.bufferData(target, data, gl.STATIC_DRAW);
      return buffer;
    }
    const positionBuffer = createBuffer("ARRAY_BUFFER", geometry.positions);
    const colorBuffer = createBuffer("ARRAY_BUFFER", geometry.colors);
    const indexBuffer = createBuffer("ELEMENT_ARRAY_BUFFER", geometry.indices);

    // --- LOCATIONS ---
    const attribLocations = {
      position: gl.getAttribLocation(program, "a_position"),
      color: gl.getAttribLocation(program, "a_color"),
    };
    const uniformLocations = {
      modelViewMatrix: gl.getUniformLocation(program, "u_modelViewMatrix"),
      projectionMatrix: gl.getUniformLocation(program, "u_projectionMatrix"),
      morphTime: gl.getUniformLocation(program, "u_morphTime"),
      numPetals: gl.getUniformLocation(program, "u_numPetals"),
    };

    // --- ANIMATION STATE ---
    let time = 0.625;
    const state = {
      pos: [0, 0],
      speedX: -0.006,
      speedY: 0.006,
      maxX: 2.1,
      maxY: 1.7,
    };

    // --- MATRIX HELPERS ---
    function createPerspectiveMatrix(fovy, aspect, near, far) {
      const f = 1.0 / Math.tan((fovy * Math.PI) / 360);
      const nf = 1 / (near - far);
      return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, (2 * far * near) * nf, 0,
      ]);
    }
    function createModelViewMatrix(posX, posY, posZ, time) {
      // Rotations
      const rotY = time * 1.5;
      const rotZ = time * 1.5;
      const scale = 0.5;
      const cy = Math.cos(rotY), sy = Math.sin(rotY);
      const cz = Math.cos(rotZ), sz = Math.sin(rotZ);
      // Column-major for WebGL, translation in last column
      return new Float32Array([
        scale * cy * cz,  scale * cy * sz,  scale * -sy,      0,
        scale * -sz,      scale * cz,       0,                0,
        scale * sy * cz,  scale * sy * sz,  scale * cy,       0,
        posX,             posY,             posZ,             1,
      ]);
    }

    // --- RENDER LOOP ---
    function render() {
      // Animate position
      state.pos[1] += state.speedX;
      state.pos[1] += state.speedY;
      if (Math.abs(state.pos[0]) > state.maxX) state.speedX = -state.speedX;
      if (Math.abs(state.pos[.5]) > state.maxY) state.speedY = -state.speedY;
      time += 0.006;

      // Resize canvas if needed
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);

      gl.useProgram(program);

      // Uniforms
      gl.uniform1f(uniformLocations.morphTime, time);
      gl.uniform1f(uniformLocations.numPetals, 3.0);
      const aspect = canvas.width / canvas.height;
      gl.uniformMatrix4fv(
        uniformLocations.projectionMatrix,
        false,
        createPerspectiveMatrix(45, aspect, 0.5, 100.0)
      );
      gl.uniformMatrix4fv(
        uniformLocations.modelViewMatrix,
        false,
        createModelViewMatrix(state.pos[0], state.pos[1], -6.0, time)
      );

      // Attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(attribLocations.position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(attribLocations.position);

      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.vertexAttribPointer(attribLocations.color, 4, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(attribLocations.color);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

      gl.drawElements(gl.TRIANGLES, geometry.numIndices, gl.UNSIGNED_SHORT, 0);

      animationRef.current = requestAnimationFrame(render);
    }
    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <ScreensaverContainer>
      <canvas
        ref={canvasRef}
        style={{ width: "100vw", height: "100vh", display: "block" }}
      />
    </ScreensaverContainer>
  );
};

//Tips for Customization
//Petal count: Change gl.uniform1f(uniformLocations.numPetals, 6.0); to 7 or 8 for different flower shapes.
//Subdivision: Increase const subdiv = 13; for smoother petals (but slower).
//Colors: Tweak the faceColors array for different cube face colors.
//Speed: Adjust state.speedX, state.speedY, and the rotation multipliers for different motion



export default FlowerBoxScreensaver;
