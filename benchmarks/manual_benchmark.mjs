import { JSDOM } from "jsdom";

// 1. Setup Environment
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost/",
  pretendToBeVisual: true,
  resources: "usable",
});

global.window = dom.window;
global.document = dom.window.document;
// global.navigator = dom.window.navigator; // This throws error
Object.defineProperty(global, "navigator", {
  value: dom.window.navigator,
  writable: true,
});
global.HTMLElement = dom.window.HTMLElement;
global.HTMLInputElement = dom.window.HTMLInputElement; // Added for App
global.File = dom.window.File;
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.self = global.window; // For worker-like environments if needed
global.localStorage = dom.window.localStorage;
global.sessionStorage = dom.window.sessionStorage;
global.getComputedStyle = dom.window.getComputedStyle;

// Mock Request to allow relative URLs
const originalRequest = global.Request;
global.Request = class MockRequest {
  constructor(input, init) {
    this.url = input;
    this.method = init?.method || "GET";
    this.headers = new Headers(init?.headers);
    // ...
  }
};

// Mock fetch
global.fetch = async (url) => {
  // console.log('Fetch called for:', url);
  if (url.toString().includes("typeface.json")) {
    return {
      ok: true,
      json: async () => ({ glyphs: {} }), // Dummy font
      arrayBuffer: async () => new ArrayBuffer(0),
      text: async () => "{}",
    };
  }
  return { ok: false, status: 404 };
};

// Mock Canvas for Three.js
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
// Simple mock for getContext to avoid "Error: Not implemented: HTMLCanvasElement.prototype.getContext"
// if three.js tries to use it.
const originalGetContext = global.HTMLCanvasElement.prototype.getContext;
global.HTMLCanvasElement.prototype.getContext = function (type) {
  if (type === "webgl" || type === "webgl2") {
    const context = {
      VERSION: 7938,
      VENDOR: 7936,
      RENDERER: 7937,
      MAX_COMBINED_TEXTURE_IMAGE_UNITS: 35661,
      canvas: this,
      getExtension: () => null,
      getParameter: (p) => {
        if (p === 7938) return "WebGL 1.0"; // VERSION
        if (p === 7936) return "WebGL"; // VENDOR
        if (p === 7937) return "WebKit"; // RENDERER
        if (p === 35661) return 8; // MAX_COMBINED_TEXTURE_IMAGE_UNITS
        return 0;
      },
      createTexture: () => ({}),
      createShader: () => ({}),
      createProgram: () => ({}),
      createBuffer: () => ({}),
      getShaderPrecisionFormat: () => ({
        rangeMin: 1,
        rangeMax: 1,
        precision: 1,
      }),
      getShaderParameter: () => true,
      getProgramParameter: () => true,
      getShaderInfoLog: () => "",
      getProgramInfoLog: () => "",
    };

    // Proxy to handle all other WebGL methods
    return new Proxy(context, {
      get: (target, prop) => {
        if (prop in target) return target[prop];
        if (typeof prop === "string" && prop !== "then") {
          // console.log(`Called missing WebGL method: ${prop}`);
          return () => {};
        }
        return undefined;
      },
    });
  }
  return originalGetContext ? originalGetContext.apply(this, arguments) : null;
};
global.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({
  top: 0,
  left: 0,
  width: 800,
  height: 600,
  right: 800,
  bottom: 600,
});

// Mock URL
const originalURL = global.URL;
global.URL = class MockURL extends originalURL {
  static createObjectURL() {
    return "blob:mock";
  }
  static revokeObjectURL() {}
};

// Mock Worker
global.Worker = class Worker {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = null;
  }
  postMessage(msg) {}
  terminate() {}
  addEventListener() {}
};

// 2. Import App dynamically
async function runBenchmark() {
  try {
    // We need to mock dat.gui if it fails inside App (it's imported statically).
    // If dat.gui is imported as side-effect, window must be ready (which it is now).

    // Also mock three/examples/jsm/libs/stats.module.js if used, but it's not.

    // Import THREE and patch WebGLRenderer
    const THREE = await import("three");
    // console.log('Patching THREE.WebGLRenderer...', typeof THREE.WebGLRenderer);
    // if (THREE.WebGLRenderer) {
    //     THREE.WebGLRenderer.prototype.render = function() { console.log('Mock render called'); };
    //     console.log('Verify patch:', THREE.WebGLRenderer.prototype.render.toString());
    // }
    THREE.WebGLRenderer.prototype.setSize = function () {};
    THREE.WebGLRenderer.prototype.setPixelRatio = function () {};

    // Patch updateSceneGraph to avoid DOM slowness in benchmark
    // But verify it's called
    // We can just spy on it?
    // Or replace with console.log?

    // Patch TransformControls to avoid render loop
    // Since TransformControls is imported in main.js, we need to patch it on the prototype via THREE examples?
    // main.js imports it from 'three/examples/jsm/controls/TransformControls.js'.
    // We can't easily patch that module.
    // But we can patch app.transformControls.dispatchEvent which is what triggers the listener.

    const { App } = await import("../src/frontend/main.js");

    console.log("App imported successfully.");

    // 3. Setup Benchmark
    class TestApp extends App {
      constructor() {
        super();
      }

      // Override animate to prevent rendering loop
      animate() {
        // console.log('animate skipped');
      }

      updateSceneGraph() {
        // Skip DOM update to isolate state restoration performance from JSDOM UI overhead
      }

      updatePropertiesPanel() {
        // Skip GUI update to isolate state restoration performance from JSDOM UI overhead
      }
    }

    const app = new TestApp();

    // Silence TransformControls render calls
    if (app.transformControls) {
      app.transformControls.dispatchEvent = () => {};
      app.transformControls.addEventListener = () => {};
    }

    // Wait for initialization if needed (App constructor is sync mostly)

    const objectCount = 20;
    console.log(`Creating ${objectCount} objects...`);

    // Suppress console logs during creation to keep output clean
    const originalLog = console.log;
    // console.log = () => {};

    const startCreation = performance.now();
    for (let i = 0; i < objectCount; i++) {
      await app.addBox();
    }
    const endCreation = performance.now();
    // console.log = originalLog;
    console.log(`Creation took ${(endCreation - startCreation).toFixed(2)}ms`);

    // Verify initial state
    if (app.objects.length !== objectCount) {
      throw new Error(
        `Expected ${objectCount} objects, got ${app.objects.length}`,
      );
    }

    // Measure saveState overhead (Baseline)
    const startSave = performance.now();
    app.saveState("Baseline");
    const endSave = performance.now();
    console.log(`Initial saveState took ${(endSave - startSave).toFixed(2)}ms`);

    // Modify one object
    const obj = app.objects[0];
    obj.position.x += 10;

    // Save modified state
    const startSave2 = performance.now();
    app.saveState("Modified");
    const endSave2 = performance.now();
    console.log(
      `Second saveState took ${(endSave2 - startSave2).toFixed(2)}ms`,
    );

    // Measure undo (restoreState)
    console.log("Measuring undo (restoreState)...");

    // Mock or Spy on object creation to count instances
    // Since we can't easily spy on THREE constructors here without mocking the module before import,
    // we will rely on timing. Or we can check app.objects UUIDs?
    // If objects are recreated, UUIDs might be preserved if we restore them from state,
    // but the object *instances* will be different.

    const obj0_before = app.objects[0];

    const startUndo = performance.now();
    await app.undo();
    const endUndo = performance.now();

    const obj0_after = app.objects[0];

    console.log(`Undo took ${(endUndo - startUndo).toFixed(2)}ms`);

    const isSameInstance = obj0_before === obj0_after;
    console.log(`Object instance preserved: ${isSameInstance}`);

    if (!isSameInstance) {
      console.log(
        "FAIL: Objects were recreated (expected for baseline, bad for optimization).",
      );
    } else {
      console.log("SUCCESS: Objects were reused!");
    }
  } catch (err) {
    console.error("Benchmark failed:", err);
    process.exit(1);
  }
}

runBenchmark();
