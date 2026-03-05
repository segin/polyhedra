import { PhysicsManager } from "../src/frontend/PhysicsManager.js";
import * as THREE from "three";
import * as CANNON from "cannon-es";

// Mock dependencies if needed, but we can use real CANNON/THREE logic if possible
// However, JSDOM environment issues might affect 'logger'.
// PhysicsManager imports logger.js.
// logger.js is safe in Node.

describe("PhysicsManager update() correctness", () => {
  let physicsManager;
  let scene;

  beforeEach(() => {
    scene = { add: jest.fn(), remove: jest.fn() };
    physicsManager = new PhysicsManager(scene);
    physicsManager.world.gravity.set(0, 0, 0);
  });

  test("update() correctly synchronizes mesh position with body position", () => {
    // 1. Create a mock mesh
    const mesh = {
      position: new THREE.Vector3(0, 0, 0),
      quaternion: new THREE.Quaternion(0, 0, 0, 1),
      geometry: {
        parameters: { width: 1, height: 1, depth: 1 },
      },
      scale: { x: 1, y: 1, z: 1 },
    };

    // 2. Add body
    // This creates a CANNON body and adds it to the world
    const body = physicsManager.addBody(mesh);

    // 3. Move the body directly (simulate physics simulation step)
    body.position.set(10, 20, 30);
    body.quaternion.set(0, 0.707, 0, 0.707); // 90 deg rotation around Y

    // 4. Call play and update()
    physicsManager.play();
    physicsManager.update(16);

    // 5. Verify mesh updated
    expect(mesh.position.x).toBe(10);
    expect(mesh.position.y).toBe(20);
    expect(mesh.position.z).toBe(30);

    expect(mesh.quaternion.x).toBeCloseTo(0);
    expect(mesh.quaternion.y).toBeCloseTo(0.707);
    expect(mesh.quaternion.z).toBeCloseTo(0);
    expect(mesh.quaternion.w).toBeCloseTo(0.707);
  });

  test("update() handles multiple bodies", () => {
    const mesh1 = {
      position: new THREE.Vector3(0, 0, 0),
      quaternion: new THREE.Quaternion(),
      geometry: { parameters: { width: 1, height: 1, depth: 1 } },
      scale: { x: 1, y: 1, z: 1 },
    };
    const mesh2 = {
      position: new THREE.Vector3(0, 0, 0),
      quaternion: new THREE.Quaternion(),
      geometry: { parameters: { width: 1, height: 1, depth: 1 } },
      scale: { x: 1, y: 1, z: 1 },
    };

    const body1 = physicsManager.addBody(mesh1);
    const body2 = physicsManager.addBody(mesh2);

    body1.position.set(1, 2, 3);
    body2.position.set(4, 5, 6);

    physicsManager.play();
    physicsManager.update(16);

    expect(mesh1.position.x).toBe(1);
    expect(mesh2.position.x).toBe(4);
  });
});
