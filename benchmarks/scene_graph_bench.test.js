import { JSDOM } from "jsdom";
import * as THREE from "three";

// Mock dependencies BEFORE importing App
jest.mock("three", () => {
  const mockElement = {
    tagName: "CANVAS",
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getBoundingClientRect: jest.fn(() => ({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
    })),
  };

  const mockMesh = {
    position: {
      x: 0,
      y: 0,
      z: 0,
      copy: jest.fn(),
      clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      copy: jest.fn(),
      clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
    },
    scale: {
      x: 1,
      y: 1,
      z: 1,
      copy: jest.fn(),
      clone: jest.fn(() => ({ x: 1, y: 1, z: 1 })),
    },
    material: {
      emissive: {
        setHex: jest.fn(),
        clone: jest.fn(() => ({ setHex: jest.fn() })),
      },
      color: { getHex: jest.fn(), setHex: jest.fn(), clone: jest.fn() },
      clone: jest.fn(() => ({
        emissive: { setHex: jest.fn(), clone: jest.fn() },
        color: { getHex: jest.fn(), clone: jest.fn() },
      })),
    },
    geometry: {
      clone: jest.fn(),
      dispose: jest.fn(),
      type: "BoxGeometry",
      parameters: {},
    },
    castShadow: false,
    receiveShadow: false,
    visible: true,
    userData: {},
  };

  return {
    Scene: jest.fn(() => ({
      add: jest.fn(),
      remove: jest.fn(),
      traverse: jest.fn(),
    })),
    PerspectiveCamera: jest.fn(() => ({
      position: { set: jest.fn(), clone: jest.fn() },
      lookAt: jest.fn(),
      aspect: 1,
      updateProjectionMatrix: jest.fn(),
    })),
    WebGLRenderer: jest.fn(() => ({
      setSize: jest.fn(),
      setPixelRatio: jest.fn(),
      render: jest.fn(),
      shadowMap: { enabled: false, type: null },
      domElement: mockElement,
    })),
    Clock: jest.fn(() => ({
      getDelta: jest.fn(() => 0.016),
      getElapsedTime: jest.fn(() => 0),
    })),
    Mesh: jest.fn(() => mockMesh),
    BoxGeometry: jest.fn(() => ({
      type: "BoxGeometry",
      parameters: {},
      dispose: jest.fn(),
    })),
    SphereGeometry: jest.fn(),
    CylinderGeometry: jest.fn(),
    ConeGeometry: jest.fn(),
    TorusGeometry: jest.fn(),
    PlaneGeometry: jest.fn(),
    MeshLambertMaterial: jest.fn(() => ({
      emissive: { setHex: jest.fn(), clone: jest.fn() },
      color: { getHex: jest.fn(), setHex: jest.fn(), clone: jest.fn() },
      clone: jest.fn(() => ({
        emissive: { setHex: jest.fn() },
        color: { getHex: jest.fn() },
      })),
    })),
    AmbientLight: jest.fn(),
    DirectionalLight: jest.fn(() => ({
      position: {
        set: function () {
          return this;
        },
        normalize: function () {
          return this;
        },
      },
      castShadow: false,
      shadow: { mapSize: { width: 0, height: 0 } },
    })),
    PointLight: jest.fn(() => ({
      position: {
        set: function () {
          return this;
        },
        normalize: function () {
          return this;
        },
      },
      castShadow: false,
    })),
    GridHelper: jest.fn(),
    AxesHelper: jest.fn(),
    Raycaster: jest.fn(() => ({
      setFromCamera: jest.fn(),
      intersectObjects: jest.fn(() => []),
    })),
    Vector2: jest.fn(),
    Vector3: jest.fn(() => ({
      x: 0,
      y: 0,
      z: 0,
      set: function () {
        return this;
      },
      normalize: function () {
        return this;
      },
      copy: function () {
        return this;
      },
      clone: () => ({
        x: 0,
        y: 0,
        z: 0,
        set: () => {},
        normalize: () => {},
        copy: () => {},
      }),
    })),
    PCFSoftShadowMap: "PCFSoftShadowMap",
    DoubleSide: "DoubleSide",
    TOUCH: { ROTATE: 0, DOLLY_PAN: 1 },
  };
});

jest.mock("dat.gui", () => ({
  GUI: jest.fn(() => ({
    addFolder: jest.fn(() => ({
      add: jest.fn(() => ({
        name: jest.fn(() => ({ onChange: jest.fn() })),
        onChange: jest.fn(),
      })),
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

/*
jest.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
    __esModule: true,
    OrbitControls: jest.fn(() => ({
        enableDamping: true,
        dampingFactor: 0.05,
        enabled: true,
        update: jest.fn(),
        touches: {}
    }))
}));
*/

/*
jest.mock('three/examples/jsm/controls/TransformControls.js', () => ({
    __esModule: true,
    TransformControls: jest.fn(() => ({
        addEventListener: jest.fn(),
        setMode: jest.fn(),
        attach: jest.fn(),
        detach: jest.fn(),
        dragging: false
    }))
}));
*/

// Mock internal dependencies
jest.mock("../src/frontend/SceneStorage.js", () => ({
  SceneStorage: jest.fn(),
}));
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
  PhysicsManager: jest.fn(() => ({ update: jest.fn() })),
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

// Now import App
import { App } from "../src/frontend/main.js";

describe("SceneGraph Performance", () => {
  let dom;

  beforeEach(() => {
    // Setup JSDOM
    dom = new JSDOM(
      '<!DOCTYPE html><html><body><div id="scene-graph"></div></body></html>',
      {
        url: "http://localhost/",
        pretendToBeVisual: true,
      },
    );

    global.document = dom.window.document;
    global.window = dom.window;
    global.navigator = dom.window.navigator;
    global.requestAnimationFrame = jest.fn();
    global.HTMLElement = dom.window.HTMLElement;
    global.console = console;

    // Mock document.body.appendChild to handle our fake canvas but call original for others
    const originalAppendChild = document.body.appendChild;
    jest.spyOn(document.body, "appendChild").mockImplementation((node) => {
      if (node.tagName === "CANVAS" && !node.nodeType) {
        // It's our fake canvas, do nothing
        return node;
      }
      return originalAppendChild.call(document.body, node);
    });
  });

  afterEach(() => {
    if (dom) dom.window.close();
    jest.clearAllMocks();
  });

  test("updateSceneGraph performance with 1000 objects", () => {
    const app = new App();

    // Ensure objectsList is available (setupSceneGraph should have created it)
    expect(app.objectsList).toBeDefined();

    // Create 1000 mock objects
    const objects = [];
    for (let i = 0; i < 1000; i++) {
      objects.push({
        name: `Object_${i}`,
        uuid: `uuid-${i}`,
        geometry: { type: "BoxGeometry" },
        visible: true,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        material: {
          color: { getHex: () => 0xffffff },
          emissive: { setHex: () => {} },
        },
        userData: {},
      });
    }
    app.objects = objects;

    // Measure time
    const start = performance.now();
    app.updateSceneGraph();
    const end = performance.now();

    console.log(
      `Time taken for updateSceneGraph with 1000 objects: ${(end - start).toFixed(2)}ms`,
    );

    // Verify list size
    expect(app.objectsList.children.length).toBe(1000);

    // Measure update time (simulating a small change - toggle visibility of one object)
    app.objects[0].visible = !app.objects[0].visible;

    const start2 = performance.now();
    app.updateSceneGraph();
    const end2 = performance.now();
    console.log(
      `Time taken for second updateSceneGraph: ${(end2 - start2).toFixed(2)}ms`,
    );

    expect(app.objectsList.children.length).toBe(1000);
  });
});
