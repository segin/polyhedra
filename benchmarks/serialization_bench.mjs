import * as THREE from "three";
import { performance } from "node:perf_hooks";

console.log("Setting up benchmark...");

// Create a scene with a raw BufferGeometry to force attribute serialization
const scene = new THREE.Scene();

// 1 million float32s = ~4MB
const count = 1000000;
const positions = new Float32Array(count * 3);
for (let i = 0; i < positions.length; i++) {
  positions[i] = Math.random();
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

console.log(`Vertex count: ${geometry.attributes.position.count}`);

const originalToJSON = THREE.BufferAttribute.prototype.toJSON;

function runBenchmark(label, toJSONImplementation) {
  THREE.BufferAttribute.prototype.toJSON = toJSONImplementation;

  // Warmup
  try {
    scene.toJSON();
  } catch (e) {
    // Warmup might fail or succeed, we just want JIT to optimize
  }

  const start = performance.now();

  // 1. Serialization
  const data = scene.toJSON();

  // 2. Simulation of worker transfer (structured clone)
  // In browser: worker.postMessage(data) uses structured clone.
  const transfer = structuredClone(data);

  const end = performance.now();

  THREE.BufferAttribute.prototype.toJSON = originalToJSON;

  return {
    time: end - start,
    data: transfer,
  };
}

// Case 1: Current Implementation (Array.from)
// This matches the code in src/frontend/SceneStorage.js before optimization
const currentImpl = function () {
  return {
    itemSize: this.itemSize,
    type: this.array.constructor.name,
    array: Array.from(this.array),
    normalized: this.normalized,
  };
};

// Case 2: Optimized Implementation (TypedArray)
// This matches the code in src/frontend/SceneStorage.js after optimization
const optimizedImpl = function () {
  return {
    itemSize: this.itemSize,
    type: this.array.constructor.name,
    array: this.array,
    normalized: this.normalized,
  };
};

console.log("\n--- BENCHMARK RESULTS ---");
console.log("Running baseline (Array.from)...");
const baselineRes = runBenchmark("Baseline", currentImpl);
console.log(`Baseline: ${baselineRes.time.toFixed(2)}ms`);

console.log("Running optimized (TypedArray)...");
const optimizedRes = runBenchmark("Optimized", optimizedImpl);
console.log(`Optimized: ${optimizedRes.time.toFixed(2)}ms`);

const speedup = baselineRes.time / optimizedRes.time;
console.log(`Speedup: ${speedup.toFixed(2)}x`);

if (speedup < 2.0) {
  console.warn("WARNING: Significant speedup not detected!");
  process.exit(1);
}

// Verification
console.log("\n--- VERIFICATION ---");
const cloned = optimizedRes.data;
const geometries = cloned.geometries;

let verified = false;
if (geometries && geometries.length > 0) {
  const geom = geometries[0];
  if (geom.data && geom.data.attributes && geom.data.attributes.position) {
    const attr = geom.data.attributes.position;
    // Check if it is a TypedArray (or ArrayBuffer view)
    const isTypedArray =
      attr.array &&
      (attr.array instanceof Float32Array || ArrayBuffer.isView(attr.array));
    console.log(`Is TypedArray: ${isTypedArray}`);

    if (isTypedArray) {
      console.log(`Array type: ${attr.array.constructor.name}`);
      verified = true;
    } else {
      console.error(`ERROR: Expected TypedArray, got ${typeof attr.array}`);
    }
  }
}

if (!verified) {
  console.error("Verification failed!");
  process.exit(1);
}

console.log("Verification passed!");
