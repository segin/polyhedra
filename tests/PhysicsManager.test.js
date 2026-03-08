import * as THREE from "three";
import { PhysicsManager } from "../src/frontend/PhysicsManager.js";

jest.mock("cannon-es", () => {
  const bodies = [];
  const gravity = { set: jest.fn(), x: 0, y: -9.82, z: 0 };
  return {
    World: jest.fn().mockImplementation(() => ({
      gravity: gravity,
      addBody: jest.fn((body) => bodies.push(body)),
      removeBody: jest.fn((body) => {
        const idx = bodies.indexOf(body);
        if (idx !== -1) bodies.splice(idx, 1);
      }),
      step: jest.fn((dt, timeSinceLastCalled) => {
        const stepDt = timeSinceLastCalled || dt;
        bodies.forEach((body) => {
          if (body.mass > 0) {
            body.position.y += gravity.y * stepDt;
          }
        });
      }),
      bodies: bodies,
    })),
    Vec3: jest
      .fn()
      .mockImplementation((x, y, z) => ({ x, y, z, set: jest.fn() })),
    Box: jest.fn(),
    Sphere: jest.fn(),
    Cylinder: jest.fn(),
    Body: jest.fn().mockImplementation((options) => ({
      position: options.position || { x: 0, y: 0, z: 0, set: jest.fn() },
      quaternion: options.quaternion || {
        x: 0,
        y: 0,
        z: 0,
        w: 1,
        set: jest.fn(),
      },
      mass: options.mass || 0,
      addShape: jest.fn(),
    })),
    Quaternion: jest
      .fn()
      .mockImplementation((x, y, z, w) => ({ x, y, z, w, set: jest.fn() })),
  };
});

describe("PhysicsManager", () => {
  let scene;
  let physicsManager;

  beforeEach(() => {
    scene = new THREE.Scene();
    physicsManager = new PhysicsManager(scene);
  });

  it("should initialize with a world and gravity", () => {
    expect(physicsManager.world).toBeDefined();
    expect(physicsManager.world.gravity.y).toBe(-9.82);
  });

  it("should add a box body to the world", () => {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshPhongMaterial(),
    );
    cube.geometry.parameters = { width: 1, height: 1, depth: 1 };
    physicsManager.addBody(cube, 1, "box");
    expect(physicsManager.world.addBody).toHaveBeenCalled();
    expect(physicsManager.bodies.length).toBe(1);
  });

  it("should update the corresponding mesh position and quaternion after a physics world step", () => {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshPhongMaterial(),
    );
    cube.geometry.parameters = { width: 1, height: 1, depth: 1 };
    physicsManager.addBody(cube, 1, "box");
    const body = physicsManager.bodies[0].body;

    body.position.x = 10;
    body.position.y = 10;
    body.position.z = 10;
    body.quaternion.x = 0.5;
    body.quaternion.y = 0.5;
    body.quaternion.z = 0.5;
    body.quaternion.w = 0.5;

    physicsManager.play();
    physicsManager.update(1 / 60);

    expect(cube.position.x).toBeCloseTo(body.position.x);
    expect(cube.position.y).toBeCloseTo(body.position.y);
    expect(cube.position.z).toBeCloseTo(body.position.z);
    expect(cube.quaternion.x).toBeCloseTo(body.quaternion.x);
    expect(cube.quaternion.y).toBeCloseTo(body.quaternion.y);
    expect(cube.quaternion.z).toBeCloseTo(body.quaternion.z);
    expect(cube.quaternion.w).toBeCloseTo(body.quaternion.w);
  });

  it("should remove a body from the world and manager", () => {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshPhongMaterial(),
    );
    cube.geometry.parameters = { width: 1, height: 1, depth: 1 };
    const body = physicsManager.addBody(cube, 1, "box");
    physicsManager.removeBody(body);
    expect(physicsManager.world.removeBody).toHaveBeenCalled();
    expect(physicsManager.bodies.length).toBe(0);
  });

  it("should handle adding a sphere body", () => {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1),
      new THREE.MeshPhongMaterial(),
    );
    sphere.geometry.parameters = { radius: 1 };
    physicsManager.addBody(sphere, 1, "sphere");
    expect(physicsManager.bodies.length).toBe(1);
  });

  it("should handle adding a plane body (not supported directly in addBody switch yet, returns null and warns)", () => {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshPhongMaterial(),
    );
    const body = physicsManager.addBody(plane, 0, "plane");
    expect(body).toBeNull();
  });

  it("should apply world gravity to dynamic bodies correctly over time", () => {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshPhongMaterial(),
    );
    cube.geometry.parameters = { width: 1, height: 1, depth: 1 };
    const mass = 1.0;
    physicsManager.addBody(cube, mass, "box");

    const initialY = 10;
    cube.position.y = initialY;
    physicsManager.bodies[0].body.position.y = initialY;

    const deltaTime = 1.0;
    physicsManager.play();
    physicsManager.update(deltaTime);

    const expectedY = initialY + physicsManager.world.gravity.y * deltaTime;

    expect(cube.position.y).toBeLessThan(initialY);
    expect(cube.position.y).toBeCloseTo(expectedY);
  });
});
