import { jest } from "@jest/globals";

// Mock THREE
jest.mock("three", () => {
  return {
    Scene: jest.fn(() => ({ add: jest.fn(), remove: jest.fn() })),
    PerspectiveCamera: jest.fn(),
    WebGLRenderer: jest.fn(() => ({
      domElement: { addEventListener: jest.fn() },
      setSize: jest.fn(),
      setPixelRatio: jest.fn(),
      shadowMap: { enabled: false, type: null },
    })),
    Clock: jest.fn(() => ({
      getDelta: jest.fn(() => 0.016),
      getElapsedTime: jest.fn(() => 0),
      start: jest.fn(),
      stop: jest.fn(),
    })),
    Vector2: jest.fn(() => ({ x: 0, y: 0, set: jest.fn() })),
    Vector3: jest.fn(() => ({
      x: 0,
      y: 0,
      z: 0,
      set: jest.fn(function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
      }),
      normalize: jest.fn(function () {
        return this;
      }),
      copy: jest.fn(function (v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
      }),
      clone: jest.fn(function () {
        return { ...this };
      }),
    })),
    Raycaster: jest.fn(),
    AmbientLight: jest.fn(),
    DirectionalLight: jest.fn(() => ({ shadow: { mapSize: {} } })),
    GridHelper: jest.fn(),
    AxesHelper: jest.fn(),
    PCFSoftShadowMap: "PCFSoftShadowMap",
    DoubleSide: "DoubleSide",
  };
});

jest.mock("three/examples/jsm/controls/OrbitControls.js", () => ({
  OrbitControls: jest.fn(() => ({ update: jest.fn() })),
}));
jest.mock("three/examples/jsm/controls/TransformControls.js", () => ({
  TransformControls: jest.fn(() => ({
    addEventListener: jest.fn(),
    attach: jest.fn(),
    detach: jest.fn(),
  })),
}));
jest.mock("dat.gui", () => ({
  GUI: jest.fn(() => ({
    addFolder: jest.fn(() => ({
      add: jest.fn(() => ({ name: jest.fn(() => ({ onChange: jest.fn() })) })),
      addColor: jest.fn(() => ({
        name: jest.fn(() => ({ onChange: jest.fn() })),
      })),
      open: jest.fn(),
      close: jest.fn(),
    })),
  })),
}));

// Mock local modules
jest.mock("../src/frontend/utils/ServiceContainer.js", () => ({
  ServiceContainer: jest.fn(() => ({ register: jest.fn() })),
}));
jest.mock("../src/frontend/StateManager.js", () => ({
  StateManager: jest.fn(() => ({ subscribe: jest.fn() })),
}));
jest.mock("../src/frontend/EventBus.js", () => ({
  subscribe: jest.fn(),
  publish: jest.fn(),
}));
jest.mock("../src/frontend/ObjectManager.js", () => ({
  ObjectManager: jest.fn(),
}));
jest.mock("../src/frontend/SceneManager.js", () => ({
  SceneManager: jest.fn(),
}));
jest.mock("../src/frontend/InputManager.js", () => ({
  InputManager: jest.fn(),
}));
jest.mock("../src/frontend/PhysicsManager.js", () => ({
  PhysicsManager: jest.fn(),
}));
jest.mock("../src/frontend/PrimitiveFactory.js", () => ({
  PrimitiveFactory: jest.fn(),
}));
jest.mock("../src/frontend/ObjectFactory.js", () => ({
  ObjectFactory: jest.fn(),
}));
jest.mock("../src/frontend/ObjectPropertyUpdater.js", () => ({
  ObjectPropertyUpdater: jest.fn(),
}));
jest.mock("../src/frontend/SceneStorage.js", () => ({
  SceneStorage: jest.fn(),
}));

import { App } from "../src/frontend/main.js";

describe("Benchmark updateSceneGraph", () => {
  let app;

  beforeEach(() => {
    // Setup simple DOM
    document.body.innerHTML = "";

    // Mock init methods to avoid complex setup
    jest.spyOn(App.prototype, "initRenderer").mockImplementation(function () {
      this.renderer = { domElement: document.createElement("div") };
      this.renderer.setSize = jest.fn();
      this.renderer.setPixelRatio = jest.fn();
      this.renderer.shadowMap = {};
      this.camera = {
        aspect: 1,
        updateProjectionMatrix: jest.fn(),
        position: { set: jest.fn(), lookAt: jest.fn() },
      };
    });
    // Mock methods that might interfere with tests
    jest.spyOn(App.prototype, "setupControls").mockImplementation(() => {});
    jest.spyOn(App.prototype, "setupGUI").mockImplementation(() => {});
    jest.spyOn(App.prototype, "setupLighting").mockImplementation(() => {});
    jest.spyOn(App.prototype, "setupHelpers").mockImplementation(() => {});
    jest
      .spyOn(App.prototype, "setupMobileOptimizations")
      .mockImplementation(() => {});
    jest.spyOn(App.prototype, "animate").mockImplementation(() => {});
    jest.spyOn(App.prototype, "saveState").mockImplementation(() => {});

    app = new App();

    // Setup manually what we skipped
    app.objectsList = document.createElement("ul");
    app.objects = [];
  });

  test("updateSceneGraph performance", () => {
    // Create 1000 dummy objects
    for (let i = 0; i < 1000; i++) {
      app.objects.push({
        name: `Object_${i}`,
        uuid: `uuid-${i}`,
        visible: true,
        geometry: { type: "BoxGeometry" },
        position: { x: 0, y: 0, z: 0, toFixed: (n) => "0.00" },
        material: { emissive: { setHex: jest.fn() } },
      });
    }

    // Initial run
    app.updateSceneGraph();

    const start = performance.now();
    const iterations = 50;

    for (let i = 0; i < iterations; i++) {
      app.updateSceneGraph();
    }

    const end = performance.now();
    const duration = end - start;

    console.log(
      `[Benchmark] updateSceneGraph x${iterations} with 1000 objects: ${duration.toFixed(2)}ms`,
    );
    console.log(
      `[Benchmark] Average per call: ${(duration / iterations).toFixed(2)}ms`,
    );
  });
});
