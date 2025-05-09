import React, { useRef, useState, useMemo } from 'react';
//import { Canvas, useFrame } from '@react-three/fiber';
//import { PerspectiveCamera } from '@react-three/drei';
//import * as THREE from 'three';

const MAZE_SIZE = 10;
const CELL_SIZE = 2;

function generateMaze(size) {
  const maze = Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => ({
      x,
      y,
      visited: false,
      walls: [true, true, true, true],
    }))
  );

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function carve(x, y) {
    maze[y][x].visited = true;
    for (const [dx, dy, wall, oppWall] of shuffle([
      [0, -1, 0, 2],
      [1, 0, 1, 3],
      [0, 1, 2, 0],
      [-1, 0, 3, 1],
    ])) {
      const nx = x + dx;
      const ny = y + dy;
      if (ny >= 0 && ny < size && nx >= 0 && nx < size && !maze[ny][nx].visited) {
        maze[y][x].walls[wall] = false;
        maze[ny][nx].walls[oppWall] = false;
        carve(nx, ny);
      }
    }
  }

  carve(0, 0);
  return maze;
}

function Wall({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[2, 2, 0.1]} />
      <meshStandardMaterial color="lightgray" />
    </mesh>
  );
}

function Maze({ maze }) {
  const walls = [];
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      const cell = maze[y][x];
      const cx = x * CELL_SIZE;
      const cz = y * CELL_SIZE;
      if (cell.walls[0]) walls.push(<Wall key={`top-${x}-${y}`} position={[cx, 1, cz - CELL_SIZE / 2]} rotation={[0, 0, 0]} />);
      if (cell.walls[1]) walls.push(<Wall key={`right-${x}-${y}`} position={[cx + CELL_SIZE / 2, 1, cz]} rotation={[0, Math.PI / 2, 0]} />);
      if (cell.walls[2]) walls.push(<Wall key={`bottom-${x}-${y}`} position={[cx, 1, cz + CELL_SIZE / 2]} rotation={[0, 0, 0]} />);
      if (cell.walls[3]) walls.push(<Wall key={`left-${x}-${y}`} position={[cx - CELL_SIZE / 2, 1, cz]} rotation={[0, Math.PI / 2, 0]} />);
    }
  }
  return <>{walls}</>;
}

function CameraMover({ path }) {
  const cam = useRef();
  const [index, setIndex] = useState(0);

  useFrame(() => {
    if (index < path.length - 1) {
      const [x, z] = path[index];
      const target = new THREE.Vector3(x, 1.5, z);
      cam.current.position.lerp(target, 0.05);
      if (cam.current.position.distanceTo(target) < 0.2) {
        setIndex(index + 1);
      }
    }
  });

  return <PerspectiveCamera ref={cam} makeDefault fov={75} position={[0, 1.5, 0]} />;
}

export default function Maze3D() {
  const maze = useMemo(() => generateMaze(MAZE_SIZE), []);
  const path = useMemo(() => maze.flatMap((row, y) => row.map((cell, x) => [x * CELL_SIZE, y * CELL_SIZE])), []);

  return (
    <Canvas shadows>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} castShadow />
      <Maze maze={maze} />
      <CameraMover path={path} />
    </Canvas>
  );
}
