jest.unmock("three"); // Use real Three.js for accurate benchmarking

import * as THREE from "three";

// Mock Worker and JSZip locally since global mocks might be minimal
class MockWorker {
  constructor() {
    this.onmessage = null;
  }
  addEventListener(type, listener) {
    if (type === "message") this.onmessage = listener;
  }
  removeEventListener() {}
  postMessage(msg) {
    // Immediately reply to deserialize
    if (msg.type === "deserialize") {
      if (this.onmessage) {
        this.onmessage({
          data: {
            type: "deserialize_complete",
            data: {
              metadata: {
                version: 4.5,
                type: "Object",
                generator: "Object3D.toJSON",
              },
              geometries: [],
              materials: [],
              object: {
                uuid: "scene-uuid",
                type: "Scene",
                layers: 1,
                matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                children: [],
              },
            },
          },
        });
      }
    }
  }
  terminate() {}
}

const MockJSZip = class JSZip {
  loadAsync() {
    return Promise.resolve({
      file: (name) => {
        if (name === "scene.json")
          return { async: () => Promise.resolve("{}") };
        if (name === "buffers.json")
          return { async: () => Promise.resolve("[]") }; // No buffers
        return null;
      },
    });
  }
};

// Mock EventBus
const mockEventBus = { publish: jest.fn(), subscribe: jest.fn() };

// Mock logger
jest.mock("../src/frontend/logger.js", () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn() },
}));

describe("Scene Clearing Performance", () => {
  let SceneStorage;
  let scene;
  let sceneStorage;

  beforeEach(async () => {
    // Setup environment (handled by jsdom environment)
    if (typeof document !== "undefined") {
      document.body.innerHTML = "";
    }

    global.Worker = MockWorker;
    global.JSZip = MockJSZip;
    global.window.JSZip = MockJSZip;

    global.URL = {
      createObjectURL: jest.fn(),
      revokeObjectURL: jest.fn(),
    };

    const module = await import("../src/frontend/SceneStorage.js");
    SceneStorage = module.SceneStorage;

    scene = new THREE.Scene();
    sceneStorage = new SceneStorage(scene, mockEventBus);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const runBenchmark = async (count) => {
    // Populate scene
    for (let i = 0; i < count; i++) {
      const geom = new THREE.BoxGeometry();
      const mat = new THREE.MeshBasicMaterial();
      const mesh = new THREE.Mesh(geom, mat);
      scene.add(mesh);
    }

    const start = performance.now();
    await sceneStorage.loadScene(new Blob([""])); // Trigger clearing
    const end = performance.now();
    return end - start;
  };

  test("Benchmark: 1000 objects", async () => {
    const time = await runBenchmark(1000);
    console.log(`[BENCHMARK] Clearing 1000 objects: ${time.toFixed(2)}ms`);
  });

  test("Benchmark: 5000 objects", async () => {
    const time = await runBenchmark(5000);
    console.log(`[BENCHMARK] Clearing 5000 objects: ${time.toFixed(2)}ms`);
  });

  test("Benchmark: 10000 objects", async () => {
    const time = await runBenchmark(10000);
    console.log(`[BENCHMARK] Clearing 10000 objects: ${time.toFixed(2)}ms`);
  });
});
