import { PhysicsManager } from "../src/frontend/PhysicsManager.js";
import * as THREE from "three";
import { performance } from "perf_hooks";

// Mock Scene
const mockScene = {
  add: () => {},
  remove: () => {},
};

// Instantiate PhysicsManager
const pm = new PhysicsManager(mockScene);

// Mock World step to isolate loop performance
pm.world.step = () => {};

// Populate with mock bodies
const NUM_BODIES = 10000;
const ITERATIONS = 20000;

console.log(`Setting up benchmark with ${NUM_BODIES} bodies...`);

for (let i = 0; i < NUM_BODIES; i++) {
  const mockBody = {
    position: { x: Math.random(), y: Math.random(), z: Math.random() },
    quaternion: { x: 0, y: 0, z: 0, w: 1 },
  };

  const mockMesh = {
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    geometry: { parameters: { width: 1, height: 1, depth: 1 } },
    scale: { x: 1, y: 1, z: 1 },
  };

  pm.bodies.push({ mesh: mockMesh, body: mockBody });
}

console.log(`Running benchmark for ${ITERATIONS} iterations...`);

const start = performance.now();

for (let i = 0; i < ITERATIONS; i++) {
  pm.update(16);
}

const end = performance.now();
const totalTime = end - start;
const avgTime = totalTime / ITERATIONS;

console.log(`Total time: ${totalTime.toFixed(2)}ms`);
console.log(`Average time per frame: ${avgTime.toFixed(4)}ms`);
console.log(`FPS (loop only): ${(1000 / avgTime).toFixed(2)}`);
