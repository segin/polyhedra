// benchmarks/csg_bench.test.js
import * as THREE from "three";
import { CSGManager } from "../src/frontend/CSGManager.js";
import { CSG } from "three-csg-ts";

// Mock EventBus
const mockEventBus = {
  publish: jest.fn(),
  subscribe: jest.fn(),
};

// Mock Scene
const mockScene = new THREE.Scene();

// Mock Worker that actually performs CSG (simulating the worker)
class MockCSGWorker {
  constructor(url) {
    this.onmessage = null;
  }
  postMessage(eventData) {
    const { id, meshA, meshB, operation } = eventData;

    // Simulate async delay
    setTimeout(() => {
      try {
        const objectA = this.createMesh(meshA);
        const objectB = this.createMesh(meshB);

        objectA.updateMatrixWorld();
        objectB.updateMatrixWorld();

        // Manually apply matrices from data because updateMatrixWorld might not suffice
        // if the mesh was just created and not added to a scene with updates.
        if (meshA.matrix) objectA.matrix.fromArray(meshA.matrix);
        if (meshB.matrix) objectB.matrix.fromArray(meshB.matrix);
        objectA.matrixAutoUpdate = false;
        objectB.matrixAutoUpdate = false;

        const bspA = CSG.fromMesh(objectA);
        const bspB = CSG.fromMesh(objectB);

        let resultBsp;
        switch (operation) {
          case "union":
            resultBsp = bspA.union(bspB);
            break;
          case "subtract":
            resultBsp = bspA.subtract(bspB);
            break;
          case "intersect":
            resultBsp = bspA.intersect(bspB);
            break;
        }

        const resultMesh = CSG.toMesh(resultBsp, objectA.matrix);
        const geometry = resultMesh.geometry;

        const resultData = {
          attributes: {
            position: geometry.attributes.position
              ? Array.from(geometry.attributes.position.array)
              : null,
            normal: geometry.attributes.normal
              ? Array.from(geometry.attributes.normal.array)
              : null,
            uv: geometry.attributes.uv
              ? Array.from(geometry.attributes.uv.array)
              : null,
          },
          index: geometry.index ? Array.from(geometry.index.array) : null,
        };

        if (this.onmessage) {
          this.onmessage({ data: { type: "result", id, data: resultData } });
        }
      } catch (e) {
        console.log("Worker Error:", e);
        if (this.onmessage) {
          this.onmessage({ data: { type: "error", id, message: e.message } });
        }
      }
    }, 10); // 10ms delay to simulate worker startup/message overhead
  }

  createMesh(data) {
    const geometry = new THREE.BufferGeometry();
    if (data.attributes.position) {
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(data.attributes.position, 3),
      );
    } else {
      console.warn("createMesh: Missing position attribute");
    }
    if (data.attributes.normal)
      geometry.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(data.attributes.normal, 3),
      );
    if (data.attributes.uv)
      geometry.setAttribute(
        "uv",
        new THREE.Float32BufferAttribute(data.attributes.uv, 2),
      );

    if (data.index) {
      geometry.setIndex(new THREE.BufferAttribute(data.index, 1));
    }
    return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  }
}

global.Worker = MockCSGWorker;

describe("CSGManager Benchmark", () => {
  let csgManager;

  beforeEach(() => {
    csgManager = new CSGManager(mockScene, mockEventBus);
    jest.clearAllMocks();
  });

  test("CSG Performance Benchmark (Async Worker)", async () => {
    // Create complex meshes
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    const boxGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(0.5, 0, 0);

    sphere.updateMatrixWorld();
    box.updateMatrixWorld();

    console.log("Starting CSG Benchmark (Async Union)...");

    // Measure time to initiate (main thread blocking time)
    const startInitTime = performance.now();
    const resultPromise = csgManager.performCSG(sphere, box, "union");
    const endInitTime = performance.now();

    const initDuration = endInitTime - startInitTime;
    console.log(
      `CSG Initiation (Main Thread Blocking): ${initDuration.toFixed(2)} ms`,
    );

    // Measure total time
    const result = await resultPromise;
    const endTotalTime = performance.now();
    const totalDuration = endTotalTime - startInitTime;

    console.log(`CSG Total Duration (Async): ${totalDuration.toFixed(2)} ms`);

    expect(result).toBeDefined();
    expect(result.isMesh).toBe(true);
    expect(initDuration).toBeLessThan(50); // Should be very fast (just serialization)
  });
});
