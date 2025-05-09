import React, { Component } from 'react';
import { mat4, vec3 } from 'gl-matrix'; // Direct import of gl-matrix functions
import './_styles.scss';


/**
 * 3D Maze Screensaver Component inspired by Windows 95
 * This container integrates the 3D Maze screensaver functionality
 */
class Maze3DContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mazeGenerated: false,
      initialized: false,
      loading: true, // Track loading state for textures
      error: null
    };

    console.log("Maze3DContainer constructor executed");

    // Reference to the canvas element
    this.canvasRef = React.createRef();
    
    // WebGL contexts
    this.gl = null;
    
    // Shader program
    this.program = null;
    
    // Animation frame ID for cleanup
    this.animationFrameId = null;
    
    // Maze properties
    this.maze = null;
    this.mazeSize = 12; // Default maze size
    this.cellSize = 1.0; // Size of each cell in the maze
    this.wallHeight = 1.0; // Height of maze walls
    
    // Camera properties
    this.camera = {
      position: [1.5, 0.5, 1.5], // Starting position (x, y, z)
      direction: [0, 0, 1],      // Initial direction (looking forward)
      up: [0, 1, 0],             // Up vector
      speed: 0.02,               // Movement speed
      turnSpeed: 0.05,           // Rotation speed
      isMoving: false,           // Flag to track if camera is moving
      isTurning: false,          // Flag to track if camera is turning
      targetPosition: null,      // Target position for movement
      targetDirection: null,     // Target direction for turning
      fov: 60 * Math.PI / 180,   // Field of view in radians
      aspect: 1,                 // Aspect ratio (will be set based on canvas)
      near: 0.1,                 // Near clipping plane
      far: 100.0                 // Far clipping plane
    };
    
    // Texture objects
    this.textures = {
      wall: null,
      floor: null,
      ceiling: null
    };
    
    // Buffer objects
    this.buffers = {
      walls: null,
      floor: null,
      ceiling: null
    };
    
    // Timing
    this.lastTime = 0;
    this.elapsedTime = 0;
    
    // Direction constants
    this.NORTH = 0;
    this.EAST = 1;
    this.SOUTH = 2;
    this.WEST = 3;
    
    // Vertex and fragment shader source code
    this.vertexShaderSource = `
      attribute vec4 aVertexPosition;
      attribute vec2 aTextureCoord;
      
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      
      varying highp vec2 vTextureCoord;
      
      void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTextureCoord = aTextureCoord;
      }
    `;
    
    this.fragmentShaderSource = `
      precision mediump float;
      
      varying highp vec2 vTextureCoord;
      
      uniform sampler2D uSampler;
      
      void main() {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
      }
    `;
  }

  componentDidMount() {
    console.log("Maze3DContainer componentDidMount");
    console.log("Matrix utilities check:", {
      mat4: typeof mat4,
      vec3: typeof vec3,
      perspectiveFunc: typeof mat4.perspective
    });

    if (typeof mat4 !== 'object' || typeof vec3 !== 'object' || typeof mat4.perspective !== 'function') {
      console.error("Matrix utilities not available or not properly initialized. Check gl-matrix import.");
      this.setState({
        error: "Matrix utilities not available. Check console for details.",
        loading: false
      });
      return;
    }

    // Try rendering with 2D context first to verify canvas is working
    this.tryBasic2DRendering();
    
    // Set up canvas dimensions
    this.resizeCanvas();
    
    // Add window resize listener
    window.addEventListener('resize', this.resizeCanvas);
    
    // Initialize WebGL context
    this.initializeWebGL();
    
    // Only proceed if WebGL initialization was successful
    if (this.gl) {
      // Load textures
      this.loadTextures().then(() => {
        // Generate the maze
        this.generateMaze();
        
        // Create maze geometry
        this.createMazeGeometry();
        
        // Start the rendering loop
        this.startRenderLoop();
        
        // Mark as loaded
        this.setState({ 
          loading: false,
          mazeGenerated: true
        });
        
        console.log('Maze3DContainer initialized and ready');
      }).catch(error => {
        console.error('Error loading textures:', error);
        this.setState({ 
          loading: false,
          error: 'Failed to load textures: ' + error.message
        });
      });
    }
  }

  // Try basic 2D rendering to test if canvas works at all
  tryBasic2DRendering = () => {
    const canvas = this.canvasRef.current;
    if (!canvas) {
      console.error("Canvas reference not found");
      return;
    }

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error("Failed to get 2D context");
        return;
      }

      // Draw a simple colored background
      ctx.fillStyle = 'blue';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw some text
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText('Testing Canvas - 2D Rendering', 20, 30);
      
      console.log("Basic 2D rendering successful");
    } catch (error) {
      console.error("Error in 2D rendering:", error);
    }
  }

  componentWillUnmount() {
    console.log("Maze3DContainer componentWillUnmount");
    
    // Cancel animation frame to prevent memory leaks
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Remove window resize listener
    window.removeEventListener('resize', this.resizeCanvas);
  }
  
  /**
   * Resize canvas to match window dimensions
   */
  resizeCanvas = () => {
    const canvas = this.canvasRef.current;
    if (!canvas) {
      console.error("Canvas ref is null in resizeCanvas");
      return;
    }
    
    console.log("Resizing canvas", {
      width: window.innerWidth,
      height: window.innerHeight
    });
    
    // Set canvas size to match window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Update camera aspect ratio
    this.camera.aspect = canvas.width / canvas.height;
    
    // Update WebGL viewport if initialized
    if (this.gl) {
      this.gl.viewport(0, 0, canvas.width, canvas.height);
    }
  };
  
  /**
   * Initialize WebGL context and set up shaders, buffers, etc.
   */
  initializeWebGL = () => {
    console.log("Initializing WebGL");
    const canvas = this.canvasRef.current;
    if (!canvas) {
      console.error('Canvas element not found');
      this.setState({
        error: 'Canvas element not found',
        loading: false
      });
      return;
    }
    
    try {
      // Initialize WebGL context
      this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!this.gl) {
        console.error('WebGL is not supported by your browser');
        this.setState({ 
          error: 'WebGL not supported by your browser',
          loading: false
        });
        return;
      }
      
      console.log("WebGL context created successfully");
      
      // Set up viewport
      this.gl.viewport(0, 0, canvas.width, canvas.height);
      
      // Set clear color (black background)
      this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
      
      // Enable depth testing
      this.gl.enable(this.gl.DEPTH_TEST);
      
      // Initialize shaders
      const shaderProgram = this.initializeShaders();
      if (!shaderProgram) {
        this.setState({ 
          error: 'Failed to initialize shaders',
          loading: false
        });
        return;
      }
      
      this.program = shaderProgram;
      
      // Mark as initialized
      this.setState({ initialized: true });
      
    } catch (error) {
      console.error('Error initializing WebGL:', error);
      this.setState({ 
        error: `WebGL initialization error: ${error.message}`,
        loading: false
      });
    }
  };
  
  /**
   * Initialize WebGL shaders
   */
  initializeShaders = () => {
    console.log("Initializing shaders");
    const gl = this.gl;
    
    // Create vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, this.vertexShaderSource);
    gl.compileShader(vertexShader);
    
    // Check if vertex shader compiled successfully
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('Vertex shader compilation error:', gl.getShaderInfoLog(vertexShader));
      gl.deleteShader(vertexShader);
      return null;
    }
    
    console.log("Vertex shader compiled successfully");
    
    // Create fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, this.fragmentShaderSource);
    gl.compileShader(fragmentShader);
    
    // Check if fragment shader compiled successfully
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader compilation error:', gl.getShaderInfoLog(fragmentShader));
      gl.deleteShader(fragmentShader);
      gl.deleteShader(vertexShader);
      return null;
    }
    
    console.log("Fragment shader compiled successfully");
    
    // Create shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    // Check if program linked successfully
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('Shader program linking error:', gl.getProgramInfoLog(shaderProgram));
      gl.deleteProgram(shaderProgram);
      gl.deleteShader(fragmentShader);
      gl.deleteShader(vertexShader);
      return null;
    }
    
    console.log("Shader program linked successfully");
    
    // Get attribute and uniform locations
    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        sampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
      },
    };
    
    // Store program info
    this.programInfo = programInfo;
    
    return shaderProgram;
  };
  
  /**
   * Load textures for maze walls, floor, and ceiling
   */
  loadTextures = async () => {
    console.log("Loading textures");
    // In a real implementation, we would load actual textures here
    // For this example, we'll create simple placeholder textures
    
    const gl = this.gl;
    
    // Create a simple red brick texture for walls
    const wallTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, wallTexture);
    
    // Fill with a simple red color for now
    const wallPixels = new Uint8Array([
      255, 0, 0, 255,   // Red pixel
      200, 0, 0, 255,   // Darker red
      200, 0, 0, 255,   // Darker red
      255, 0, 0, 255,   // Red pixel
    ]);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, wallPixels
    );
    
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    // Create a simple floor texture (gray)
    const floorTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, floorTexture);
    
    // Fill with a simple gray color for now
    const floorPixels = new Uint8Array([
      100, 100, 100, 255,   // Gray pixel
      150, 150, 150, 255,   // Lighter gray
      150, 150, 150, 255,   // Lighter gray
      100, 100, 100, 255,   // Gray pixel
    ]);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, floorPixels
    );
    
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    // Create a simple ceiling texture (light gray)
    const ceilingTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, ceilingTexture);
    
    // Fill with a simple light gray color for now
    const ceilingPixels = new Uint8Array([
      200, 200, 200, 255,   // Light gray pixel
      180, 180, 180, 255,   // Slightly darker
      180, 180, 180, 255,   // Slightly darker
      200, 200, 200, 255,   // Light gray pixel
    ]);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, ceilingPixels
    );
    
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    // Store textures
    this.textures = {
      wall: wallTexture,
      floor: floorTexture,
      ceiling: ceilingTexture
    };
    
    console.log("Textures loaded successfully");
    return true;
  };

  /**
   * Generate a random maze using recursive backtracking algorithm
   */
  generateMaze = () => {
    console.log("Generating maze");
    const size = this.mazeSize;
    
    // Initialize maze grid with all walls intact
    // Each cell has four walls: [north, east, south, west]
    // 1 = wall present, 0 = opening
    this.maze = Array(size).fill().map(() => 
      Array(size).fill().map(() => [1, 1, 1, 1])
    );
    
    // Recursive backtracking algorithm to generate the maze
    const visited = Array(size).fill().map(() => Array(size).fill(false));
    
    // Helper function to get unvisited neighbors
    const getUnvisitedNeighbors = (x, y) => {
      const neighbors = [];
      
      // Check north
      if (y > 0 && !visited[y-1][x]) neighbors.push({x, y: y-1, dir: this.NORTH, opposite: this.SOUTH});
      
      // Check east
      if (x < size-1 && !visited[y][x+1]) neighbors.push({x: x+1, y, dir: this.EAST, opposite: this.WEST});
      
      // Check south
      if (y < size-1 && !visited[y+1][x]) neighbors.push({x, y: y+1, dir: this.SOUTH, opposite: this.NORTH});
      
      // Check west
      if (x > 0 && !visited[y][x-1]) neighbors.push({x: x-1, y, dir: this.WEST, opposite: this.EAST});
      
      return neighbors;
    };
    
    // Recursive function to visit cells and carve passages
    const carvePassages = (x, y) => {
      // Mark current cell as visited
      visited[y][x] = true;
      
      // Get unvisited neighbors
      let neighbors = getUnvisitedNeighbors(x, y);
      
      // While there are unvisited neighbors
      while (neighbors.length > 0) {
        // Pick a random neighbor
        const randomIndex = Math.floor(Math.random() * neighbors.length);
        const neighbor = neighbors[randomIndex];
        
        // Remove walls between current cell and chosen neighbor
        this.maze[y][x][neighbor.dir] = 0;
        this.maze[neighbor.y][neighbor.x][neighbor.opposite] = 0;
        
        // Recursively visit the chosen neighbor
        carvePassages(neighbor.x, neighbor.y);
        
        // Update neighbors list (in case we need to try another neighbor)
        neighbors = getUnvisitedNeighbors(x, y);
      }
    };
    
    // Start maze generation from a random cell
    const startX = Math.floor(Math.random() * size);
    const startY = Math.floor(Math.random() * size);
    carvePassages(startX, startY);
    
    console.log('Maze generated with size:', size);
  };
  
  /**
   * Create geometry for the maze walls, floor, and ceiling
   */
  createMazeGeometry = () => {
    console.log("Creating maze geometry");
    const gl = this.gl;
    const size = this.mazeSize;
    const cellSize = this.cellSize;
    const wallHeight = this.wallHeight;
    
    // Create wall vertices and texture coordinates
    const wallVertices = [];
    const wallTexCoords = [];
    const wallIndices = [];
    
    // Create floor vertices and texture coordinates
    const floorVertices = [];
    const floorTexCoords = [];
    const floorIndices = [];
    
    // Create ceiling vertices and texture coordinates
    const ceilingVertices = [];
    const ceilingTexCoords = [];
    const ceilingIndices = [];
    
    // Iterate through each cell in the maze
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const cell = this.maze[y][x];
        const baseX = x * cellSize;
        const baseY = 0;  // Floor level
        const baseZ = y * cellSize;
        
        // For each wall in the cell
        for (let i = 0; i < 4; i++) {
          // If wall exists
          if (cell[i] === 1) {
            let wallBaseIndex = wallVertices.length / 3;
            
            // Create vertices for this wall based on direction
            switch (i) {
              case this.NORTH:
                // North wall
                wallVertices.push(
                  baseX, baseY, baseZ,                    // Bottom left
                  baseX + cellSize, baseY, baseZ,         // Bottom right
                  baseX + cellSize, baseY + wallHeight, baseZ,  // Top right
                  baseX, baseY + wallHeight, baseZ        // Top left
                );
                break;
              case this.EAST:
                // East wall
                wallVertices.push(
                  baseX + cellSize, baseY, baseZ,                 // Bottom left
                  baseX + cellSize, baseY, baseZ + cellSize,      // Bottom right
                  baseX + cellSize, baseY + wallHeight, baseZ + cellSize,  // Top right
                  baseX + cellSize, baseY + wallHeight, baseZ     // Top left
                );
                break;
              case this.SOUTH:
                // South wall
                wallVertices.push(
                  baseX + cellSize, baseY, baseZ + cellSize,      // Bottom left
                  baseX, baseY, baseZ + cellSize,                 // Bottom right
                  baseX, baseY + wallHeight, baseZ + cellSize,    // Top right
                  baseX + cellSize, baseY + wallHeight, baseZ + cellSize  // Top left
                );
                break;
              case this.WEST:
                // West wall
                wallVertices.push(
                  baseX, baseY, baseZ + cellSize,                 // Bottom left
                  baseX, baseY, baseZ,                            // Bottom right
                  baseX, baseY + wallHeight, baseZ,               // Top right
                  baseX, baseY + wallHeight, baseZ + cellSize     // Top left
                );
                break;
              default:
                // This should never happen as we only have 4 directions (0-3)
                console.warn(`Unexpected direction value: ${i}`);
                break;
            }
            
            // Add texture coordinates for this wall
            wallTexCoords.push(
              0.0, 0.0,  // Bottom left
              1.0, 0.0,  // Bottom right
              1.0, 1.0,  // Top right
              0.0, 1.0   // Top left
            );
            
            // Add indices for this wall (two triangles)
            wallIndices.push(
              wallBaseIndex, wallBaseIndex + 1, wallBaseIndex + 2,
              wallBaseIndex, wallBaseIndex + 2, wallBaseIndex + 3
            );
          }
        }
        
        // Add floor for this cell
        let floorBaseIndex = floorVertices.length / 3;
        
        floorVertices.push(
          baseX, baseY, baseZ,                      // Bottom left
          baseX + cellSize, baseY, baseZ,           // Bottom right
          baseX + cellSize, baseY, baseZ + cellSize,// Top right
          baseX, baseY, baseZ + cellSize            // Top left
        );
        
        floorTexCoords.push(
          0.0, 0.0,  // Bottom left
          1.0, 0.0,  // Bottom right
          1.0, 1.0,  // Top right
          0.0, 1.0   // Top left
        );
        
        floorIndices.push(
          floorBaseIndex, floorBaseIndex + 1, floorBaseIndex + 2,
          floorBaseIndex, floorBaseIndex + 2, floorBaseIndex + 3
        );
        
        // Add ceiling for this cell
        let ceilingBaseIndex = ceilingVertices.length / 3;
        
        ceilingVertices.push(
          baseX, baseY + wallHeight, baseZ,                      // Bottom left
          baseX + cellSize, baseY + wallHeight, baseZ,           // Bottom right
          baseX + cellSize, baseY + wallHeight, baseZ + cellSize,// Top right
          baseX, baseY + wallHeight, baseZ + cellSize            // Top left
        );
        
        ceilingTexCoords.push(
          0.0, 0.0,  // Bottom left
          1.0, 0.0,  // Bottom right
          1.0, 1.0,  // Top right
          0.0, 1.0   // Top left
        );
        
        ceilingIndices.push(
          ceilingBaseIndex, ceilingBaseIndex + 2, ceilingBaseIndex + 1,
          ceilingBaseIndex, ceilingBaseIndex + 3, ceilingBaseIndex + 2
        );
      }
    }
    
    // Create and bind buffer for wall vertices
    const wallVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, wallVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(wallVertices), gl.STATIC_DRAW);
    
    // Create and bind buffer for wall texture coordinates
    const wallTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, wallTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(wallTexCoords), gl.STATIC_DRAW);
    
    // Create and bind buffer for wall indices
    const wallIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wallIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(wallIndices), gl.STATIC_DRAW);
    
    // Create and bind buffer for floor vertices
    const floorVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorVertices), gl.STATIC_DRAW);
    
    // Create and bind buffer for floor texture coordinates
    const floorTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, floorTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorTexCoords), gl.STATIC_DRAW);
    
    // Create and bind buffer for floor indices
    const floorIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorIndices), gl.STATIC_DRAW);
    
    // Create and bind buffer for ceiling vertices
    const ceilingVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ceilingVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ceilingVertices), gl.STATIC_DRAW);
    
    // Create and bind buffer for ceiling texture coordinates
    const ceilingTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ceilingTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ceilingTexCoords), gl.STATIC_DRAW);
    
    // Create and bind buffer for ceiling indices
    const ceilingIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ceilingIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ceilingIndices), gl.STATIC_DRAW);
    
    // Store buffer objects for rendering
    this.buffers = {
      walls: {
        vertex: wallVertexBuffer,
        textureCoord: wallTexCoordBuffer,
        indices: wallIndexBuffer,
        count: wallIndices.length
      },
      floor: {
        vertex: floorVertexBuffer,
        textureCoord: floorTexCoordBuffer,
        indices: floorIndexBuffer,
        count: floorIndices.length
      },
      ceiling: {
        vertex: ceilingVertexBuffer,
        textureCoord: ceilingTexCoordBuffer,
        indices: ceilingIndexBuffer,
        count: ceilingIndices.length
      }
    };
    
    console.log("Maze geometry created");
  };
  
  /**
   * Update camera position and rotation for maze traversal
   * @param {number} deltaTime - Time since last update in milliseconds
   */
  updateCamera = (deltaTime) => {
    // Simple movement logic for now - continuous forward movement
    const speed = this.camera.speed * deltaTime;
    
    // Update camera position in the direction it's facing
    this.camera.position[0] += this.camera.direction[0] * speed;
    this.camera.position[2] += this.camera.direction[2] * speed;
    
    // Simple turning - periodically change direction
    this.elapsedTime += deltaTime;
    if (this.elapsedTime > 3000) { // Turn every 3 seconds
      // Randomly turn left or right
      const turnAngle = (Math.random() > 0.5) ? Math.PI / 2 : -Math.PI / 2;
      
      // Apply rotation matrix to direction vector
      const cos = Math.cos(turnAngle);
      const sin = Math.sin(turnAngle);
      const newDirX = this.camera.direction[0] * cos - this.camera.direction[2] * sin;
      const newDirZ = this.camera.direction[0] * sin + this.camera.direction[2] * cos;
      
      this.camera.direction[0] = newDirX;
      this.camera.direction[2] = newDirZ;
      
      this.elapsedTime = 0;
    }
    
    // In a real implementation, we would have collision detection and wall-following logic
  };
  
  /**
   * Create a projection matrix for the camera
   */
  createProjectionMatrix = () => {
    const fieldOfView = this.camera.fov;
    const aspect = this.camera.aspect;
    const zNear = this.camera.near;
    const zFar = this.camera.far;
    
    // Create perspective projection matrix
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    
    return projectionMatrix;
  };
  
  /**
   * Create a view matrix for the camera
   */
  createViewMatrix = () => {
    const viewMatrix = mat4.create();
    
    // Create a lookAt matrix for the camera
    const eye = vec3.fromValues(
      this.camera.position[0],
      this.camera.position[1],
      this.camera.position[2]
    );
    
    const center = vec3.fromValues(
      this.camera.position[0] + this.camera.direction[0],
      this.camera.position[1] + this.camera.direction[1],
      this.camera.position[2] + this.camera.direction[2]
    );
    
    const up = vec3.fromValues(
      this.camera.up[0],
      this.camera.up[1],
      this.camera.up[2]
    );
    
    mat4.lookAt(viewMatrix, eye, center, up);
    
    return viewMatrix;
  };
  
  /**
   * Render the maze
   * @param {number} time - Current time in milliseconds
   */
  renderMaze = (time) => {
    try {
      // Calculate delta time
      const deltaTime = this.lastTime ? time - this.lastTime : 0;
      this.lastTime = time;
      
      const gl = this.gl;
      if (!gl) {
        console.error("WebGL context is null in renderMaze");
        return;
      }
      
      // Clear the canvas
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
      // Update camera
      this.updateCamera(deltaTime);
      
      // Create projection and view matrices
      const projectionMatrix = this.createProjectionMatrix();
      const viewMatrix = this.createViewMatrix();
      
      // Use shader program
      gl.useProgram(this.programInfo.program);
      
      // Set projection and view matrices
      gl.uniformMatrix4fv(
        this.programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
      );
      
      gl.uniformMatrix4fv(
        this.programInfo.uniformLocations.modelViewMatrix,
        false,
        viewMatrix
      );
      
      // Render walls
      this.renderWalls();
      
      // Render floor
      this.renderFloor();
      
      // Render ceiling
      this.renderCeiling();
    } catch (error) {
      console.error("Error in renderMaze:", error);
      // Stop the render loop in case of error
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      
      this.setState({ error: `Render error: ${error.message}` });
    }
  };
  
  /**
   * Render the maze walls
   */
  renderWalls = () => {
    const gl = this.gl;
    
    // Bind wall vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.walls.vertex);
    gl.vertexAttribPointer(
      this.programInfo.attribLocations.vertexPosition,
      3,          // 3 components per vertex (x, y, z)
      gl.FLOAT,   // Type of the data
      false,      // Don't normalize
      0,          // Stride (0 = use type and size)
      0           // Offset
    );
    gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
    
    // Bind wall texture coordinate buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.walls.textureCoord);
    gl.vertexAttribPointer(
      this.programInfo.attribLocations.textureCoord,
      2,          // 2 components per vertex (s, t)
      gl.FLOAT,   // Type of the data
      false,      // Don't normalize
      0,          // Stride (0 = use type and size)
      0           // Offset
    );
    gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);
    
    // Bind wall index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.walls.indices);
    
    // Bind wall texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.wall);
    gl.uniform1i(this.programInfo.uniformLocations.sampler, 0);
    
    // Draw walls
    gl.drawElements(
      gl.TRIANGLES,
      this.buffers.walls.count,
      gl.UNSIGNED_SHORT,
      0
    );
  };
  
  /**
   * Render the maze floor
   */
  renderFloor = () => {
    const gl = this.gl;
    
    // Bind floor vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.floor.vertex);
    gl.vertexAttribPointer(
      this.programInfo.attribLocations.vertexPosition,
      3,          // 3 components per vertex (x, y, z)
      gl.FLOAT,   // Type of the data
      false,      // Don't normalize
      0,          // Stride (0 = use type and size)
      0           // Offset
    );
    gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
    
    // Bind floor texture coordinate buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.floor.textureCoord);
    gl.vertexAttribPointer(
      this.programInfo.attribLocations.textureCoord,
      2,          // 2 components per vertex (s, t)
      gl.FLOAT,   // Type of the data
      false,      // Don't normalize
      0,          // Stride (0 = use type and size)
      0           // Offset
    );
    gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);
    
    // Bind floor index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.floor.indices);
    
    // Bind floor texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.floor);
    gl.uniform1i(this.programInfo.uniformLocations.sampler, 0);
    
    // Draw floor
    gl.drawElements(
      gl.TRIANGLES,
      this.buffers.floor.count,
      gl.UNSIGNED_SHORT,
      0
    );
  };
  
  /**
   * Render the maze ceiling
   */
  renderCeiling = () => {
    const gl = this.gl;
    
    // Bind ceiling vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.ceiling.vertex);
    gl.vertexAttribPointer(
      this.programInfo.attribLocations.vertexPosition,
      3,          // 3 components per vertex (x, y, z)
      gl.FLOAT,   // Type of the data
      false,      // Don't normalize
      0,          // Stride (0 = use type and size)
      0           // Offset
    );
    gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
    
    // Bind ceiling texture coordinate buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.ceiling.textureCoord);
    gl.vertexAttribPointer(
      this.programInfo.attribLocations.textureCoord,
      2,          // 2 components per vertex (s, t)
      gl.FLOAT,   // Type of the data
      false,      // Don't normalize
      0,          // Stride (0 = use type and size)
      0           // Offset
    );
    gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);
    
    // Bind ceiling index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.ceiling.indices);
    
    // Bind ceiling texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.ceiling);
    gl.uniform1i(this.programInfo.uniformLocations.sampler, 0);
    
    // Draw ceiling
    gl.drawElements(
      gl.TRIANGLES,
      this.buffers.ceiling.count,
      gl.UNSIGNED_SHORT,
      0
    );
  };
  
  /**
   * Start the rendering loop
   */
  startRenderLoop = () => {
    console.log("Starting render loop");
    
    const animate = (time) => {
      try {
        // Render the maze
        this.renderMaze(time);
        
        // Request next frame
        this.animationFrameId = requestAnimationFrame(animate);
      } catch (error) {
        console.error('Error in render loop:', error);
        cancelAnimationFrame(this.animationFrameId);
        this.setState({ error: `Render error: ${error.message}` });
      }
    };
    
    // Start the animation loop
    this.animationFrameId = requestAnimationFrame(animate);
  };

  render() {
    console.log("Maze3DContainer rendering");
    return (
      <div className="maze3d-container" style={{ backgroundColor: 'green', minHeight: '100vh' }}>
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          zIndex: 100
        }}>
          3D MAZE
        </div>
        
        {this.state.loading && (
          <div className="maze3d-loading">
            <div className="maze3d-loading-text">Loading 3D Maze...</div>
          </div>
        )}
        
        {this.state.error && (
          <div className="maze3d-error">
            <div className="maze3d-error-text">
              Error: {this.state.error}
            </div>
          </div>
        )}
        
        <canvas 
          ref={this.canvasRef}
          width={800}
          height={600}
          style={{
            width: '100%',
            height: '100%',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 90,
            border: '5px solid yellow' // Very visible border for debugging
          }}
        />
      </div>
    );
  }
}

export default Maze3DContainer;