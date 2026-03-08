import { Scene, Mesh, BoxGeometry, MeshBasicMaterial } from "three";
import { PhysicsManager } from "../src/frontend/PhysicsManager.js";
import * as CANNON from "cannon-es";

jest.mock("../src/frontend/PrimitiveFactory.js", () => ({
  PrimitiveFactory: jest.fn(),
}));

describe("PhysicsManager Benchmark", () => {
  let scene;
  let physicsManager;

  beforeEach(() => {
    scene = new Scene();
    physicsManager = new PhysicsManager(scene);
  });

  test("benchmark removeBody performance", () => {
    const numBodies = 5000; // Reduced to 5000 for faster iteration but still significant
    const iterations = 5;
    let totalTime = 0;

    for (let run = 0; run < iterations; run++) {
      // Reset manager for each run
      physicsManager = new PhysicsManager(new Scene());
      const bodies = [];

      const geometry = new BoxGeometry(1, 1, 1);
      geometry.parameters = { width: 1, height: 1, depth: 1 };
      const material = new MeshBasicMaterial();

      for (let i = 0; i < numBodies; i++) {
        const mesh = new Mesh(geometry, material);
        mesh.position.set(i, 0, 0);
        const body = physicsManager.addBody(mesh, 1, "box");
        bodies.push(body);
      }

      const startTime = performance.now();
      for (let i = 0; i < numBodies; i++) {
        physicsManager.removeBody(bodies[i]);
      }
      const endTime = performance.now();
      totalTime += endTime - startTime;
    }

    const avgTime = totalTime / iterations;
    console.log(
      `Average time to remove ${numBodies} bodies over ${iterations} runs: ${avgTime.toFixed(2)}ms`,
    );
  });
});
