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

describe("Scene Graph Behavior Verification", () => {
  let app;

  beforeEach(() => {
    document.body.innerHTML = "";

    // Mock methods
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
    jest.spyOn(App.prototype, "deleteObject").mockImplementation(() => {}); // Mock deleteObject to avoid side effects

    app = new App();
    app.objectsList = document.createElement("ul");
    app.objects = [];
  });

  test("updates reflect changes correctly", () => {
    // 1. Add object
    const obj = {
      uuid: "uuid-1",
      name: "Box",
      visible: true,
      geometry: { type: "BoxGeometry" },
      position: { x: 0, y: 0, z: 0, toFixed: () => "0.00" },
      material: { emissive: { setHex: jest.fn() } },
    };
    app.objects.push(obj);
    app.updateSceneGraph();

    expect(app.objectsList.children.length).toBe(1);
    const item = app.objectsList.children[0];
    expect(item.querySelector(".object-name").textContent).toBe("Box");

    // 2. Update name
    obj.name = "Renamed Box";
    app.updateSceneGraph();
    expect(
      app.objectsList.children[0].querySelector(".object-name").textContent,
    ).toBe("Renamed Box");

    // 3. Update visibility
    obj.visible = false;
    app.updateSceneGraph();
    expect(
      app.objectsList.children[0].querySelector(".visibility-btn").textContent,
    ).toBe("🚫");

    // 4. Update selection
    app.selectedObject = obj;
    app.updateSceneGraph();
    // Check background color (rgb(68, 68, 68) is #444)
    expect(app.objectsList.children[0].style.background).toBe(
      "rgb(68, 68, 68)",
    );

    // 5. Deselect
    app.selectedObject = null;
    app.updateSceneGraph();
    // Check background color (rgb(34, 34, 34) is #222)
    expect(app.objectsList.children[0].style.background).toBe(
      "rgb(34, 34, 34)",
    );

    // 6. Remove object
    app.objects.pop();
    app.updateSceneGraph();

    // Should have "No objects in scene" message or empty
    expect(app.objectsList.children.length).toBe(1);
    expect(app.objectsList.children[0].textContent).toBe("No objects in scene");
  });

  test("handles reordering", () => {
    const obj1 = {
      uuid: "1",
      name: "1",
      visible: true,
      geometry: { type: "Box" },
      position: { x: 0, y: 0, z: 0, toFixed: () => "0" },
    };
    const obj2 = {
      uuid: "2",
      name: "2",
      visible: true,
      geometry: { type: "Box" },
      position: { x: 0, y: 0, z: 0, toFixed: () => "0" },
    };

    app.objects.push(obj1, obj2);
    app.updateSceneGraph();

    expect(
      app.objectsList.children[0].querySelector(".object-name").textContent,
    ).toBe("1");
    expect(
      app.objectsList.children[1].querySelector(".object-name").textContent,
    ).toBe("2");

    // Swap
    app.objects = [obj2, obj1];
    app.updateSceneGraph();

    expect(
      app.objectsList.children[0].querySelector(".object-name").textContent,
    ).toBe("2");
    expect(
      app.objectsList.children[1].querySelector(".object-name").textContent,
    ).toBe("1");
  });
});
