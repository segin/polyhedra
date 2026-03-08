import { App } from "../src/frontend/main.js";
import * as THREE from "three";

// Mock THREE.js
describe("Performance Benchmark: restoreState", () => {
  let app;

  beforeEach(() => {
    // Setup environment (handled by jsdom environment)
    if (typeof document !== "undefined") {
      document.body.innerHTML =
        '<div id="objects-list"></div><div id="scene-graph-panel"></div><div id="scene-graph"></div><button id="fullscreen"></button><button id="save-scene"></button><button id="load-scene"></button><input type="file" id="file-input">';
    }

    global.requestAnimationFrame = jest.fn();
    global.console.log = jest.fn();
    global.URL = { createObjectURL: jest.fn(), revokeObjectURL: jest.fn() };
    global.Worker = jest.fn(() => ({
      postMessage: jest.fn(),
      addEventListener: jest.fn(),
    }));

    app = new App();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Benchmark: restoreState with 100 objects", async () => {
    // 1. Populate scene with 100 objects
    const objectCount = 100;
    for (let i = 0; i < objectCount; i++) {
      await app.addBox();
    }

    // Verify object count
    expect(app.objects.length).toBe(objectCount);

    // 2. Save baseline state
    app.saveState("Baseline");

    // 3. Modify one object
    const obj = app.objects[0];
    obj.position.x += 10;
    app.saveState("Modified");

    // Reset counters for dispose
    const THREE = require("three");
    // We need to access the mock instances to check calls.
    // Since we can't easily access all created instances, we can check the class method mocks if possible,
    // OR we can assume that app.objects[i].geometry.dispose is the spy.

    // Let's rely on checking the first object's geometry dispose, or better,
    // we can check how many times the geometry constructor was called during restore.
    // But re-instantiation is what we want to avoid.

    const initialGeometryInstances = THREE.BoxGeometry.mock.instances.length;
    const initialMaterialInstances =
      THREE.MeshPhongMaterial.mock.instances.length;

    // 4. Measure restoreState (Undo)
    const startTime = performance.now();
    await app.undo(); // This calls restoreState
    const endTime = performance.now();

    const duration = endTime - startTime;
    process.stdout.write(
      `restoreState time for ${objectCount} objects: ${duration.toFixed(3)}ms\n`,
    );

    // 5. Verify metrics
    const finalGeometryInstances = THREE.BoxGeometry.mock.instances.length;
    const finalMaterialInstances =
      THREE.MeshPhongMaterial.mock.instances.length;

    const createdGeometries = finalGeometryInstances - initialGeometryInstances;
    const createdMaterials = finalMaterialInstances - initialMaterialInstances;

    process.stdout.write(
      `Created Geometries during restore: ${createdGeometries}\n`,
    );
    process.stdout.write(
      `Created Materials during restore: ${createdMaterials}\n`,
    );

    // Current implementation destroys and recreates everything.
    // So createdGeometries should be roughly objectCount.
    // With optimization, this should be 0 (or very low).

    // Assertions for Baseline (Current inefficient behavior)
    // These assertions will FAIL when optimization is implemented, which is good.
    // For now, let's just log them or make soft assertions.

    // We return the metrics to be used in the PR description
    // return {
    //     duration,
    //     createdGeometries,
    //     createdMaterials
    // };
  });
});
