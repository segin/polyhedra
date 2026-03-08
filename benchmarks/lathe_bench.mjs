import { JSDOM } from "jsdom";

// 1. Setup Environment
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost/",
  pretendToBeVisual: true,
  resources: "usable",
});

global.window = dom.window;
global.document = dom.window.document;
// global.navigator = dom.window.navigator; // This throws error in some envs, let's use defineProperty
Object.defineProperty(global, "navigator", {
  value: dom.window.navigator,
  writable: true,
});
global.HTMLElement = dom.window.HTMLElement;
global.self = global.window;

// Mock Canvas for Three.js
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
// Simple mock for getContext
global.HTMLCanvasElement.prototype.getContext = function (type) {
  if (type === "webgl" || type === "webgl2") {
    return {
      getParameter: () => 0,
      createTexture: () => ({}),
      createShader: () => ({}),
      createProgram: () => ({}),
      createBuffer: () => ({}),
      getShaderPrecisionFormat: () => ({
        rangeMin: 1,
        rangeMax: 1,
        precision: 1,
      }),
      getExtension: () => null,
      canvas: this,
    };
  }
  return null;
};

// Mock URL
const originalURL = global.URL;
global.URL = class MockURL extends originalURL {
  static createObjectURL() {
    return "blob:mock";
  }
  static revokeObjectURL() {}
};

// 2. Import PrimitiveManager
// We need to import Three.js first to ensure it picks up the global window
import * as THREE from "three";
import { PrimitiveManager } from "../src/frontend/PrimitiveManager.js";

// 3. Run Benchmark
async function runBenchmark() {
  const scene = new THREE.Scene();
  // Mock scene.add to avoid overhead unrelated to geometry creation
  // However, _createMesh creates MeshPhongMaterial and Mesh, which have overhead.
  // We want to measure that too as it's part of the function call, but mainly the Vector creation overhead.
  // scene.add is just pushing to an array in Three.js, so it's fast.
  // Let's keep scene.add normal or mocked to be a no-op to isolate addLathe logic.
  scene.add = () => {};

  const primitiveManager = new PrimitiveManager(scene);

  const iterations = 10000;
  const warmup = 100;

  console.log(`Running benchmark with ${iterations} iterations...`);

  // Warmup
  for (let i = 0; i < warmup; i++) {
    primitiveManager.addLathe();
  }

  // Measure
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    primitiveManager.addLathe();
  }
  const end = performance.now();

  const totalTime = end - start;
  console.log(`Total time: ${totalTime.toFixed(2)}ms`);
  console.log(
    `Average time per call: ${(totalTime / iterations).toFixed(4)}ms`,
  );
}

runBenchmark();
