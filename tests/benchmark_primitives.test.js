import { App } from "../src/frontend/main.js";
import * as THREE from "three";

// Use manual mock from tests/__mocks__/three.js
jest.mock("three");

// Mock requestAnimationFrame to prevent infinite loop in App constructor -> animate
global.requestAnimationFrame = jest.fn();

// Mock dat.gui
jest.mock("dat.gui", () => ({
  GUI: jest.fn(() => ({
    addFolder: jest.fn(() => ({
      add: jest.fn(() => ({
        name: jest.fn(() => ({ onChange: jest.fn() })),
        onChange: jest.fn(),
      })),
      addColor: jest.fn(() => ({
        name: jest.fn(() => ({ onChange: jest.fn() })),
        onChange: jest.fn(),
      })),
      open: jest.fn(),
      close: jest.fn(),
      remove: jest.fn(),
      removeFolder: jest.fn(),
      __controllers: [],
      __folders: [],
    })),
  })),
}));

// Mock controls
/*
jest.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
    OrbitControls: jest.fn(() => ({
        enableDamping: true,
        dampingFactor: 0.05,
        update: jest.fn(),
        target: { clone: jest.fn(() => ({ copy: jest.fn() })) },
        touches: { ONE: 1, TWO: 2 }
    }))
}));
*/

/*
jest.mock('three/examples/jsm/controls/TransformControls.js', () => ({
    TransformControls: jest.fn(() => ({
        addEventListener: jest.fn(),
        setMode: jest.fn(),
        attach: jest.fn(),
        detach: jest.fn(),
        dragging: false
    }))
}));
*/

describe("Primitive Creation Benchmark", () => {
  let app;

  beforeEach(() => {
    // Clear mocks and reset DOM
    jest.clearAllMocks();
    document.body.innerHTML = "";
    app = new App();
  });

  test("Benchmark: addBox 1000 times", async () => {
    const ITERATIONS = 1000;

    // Mock saveState to isolate material/geometry creation performance
    app.saveState = jest.fn();
    // Mock updateSceneGraph to isolate DOM operations
    app.updateSceneGraph = jest.fn();
    // Mock setupMobileOptimizations to avoid OrbitControls errors
    app.setupMobileOptimizations = jest.fn();

    const startHeap = process.memoryUsage().heapUsed;
    const startTime = performance.now();

    for (let i = 0; i < ITERATIONS; i++) {
      await app.addBox();
    }

    const endTime = performance.now();
    const endHeap = process.memoryUsage().heapUsed;

    const duration = endTime - startTime;
    const memoryDelta = endHeap - startHeap;

    console.log(`\n--- BENCHMARK RESULTS ---`);
    console.log(`Operation: addBox x ${ITERATIONS}`);
    console.log(`Time: ${duration.toFixed(2)} ms`);
    console.log(`Memory Delta: ${(memoryDelta / 1024 / 1024).toFixed(2)} MB`);
    console.log(`-------------------------\n`);

    // Basic assertion to ensure it actually ran
    expect(app.objects.length).toBe(ITERATIONS);
  });
});
