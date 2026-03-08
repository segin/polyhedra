import * as THREE from "three";
import { ObjectManager } from "../src/frontend/ObjectManager.js";
import { PrimitiveFactory } from "../src/frontend/PrimitiveFactory.js";
import { ObjectFactory } from "../src/frontend/ObjectFactory.js";
import { ObjectPropertyUpdater } from "../src/frontend/ObjectPropertyUpdater.js";
import EventBus from "../src/frontend/EventBus.js";

// Mock FontLoader
jest.mock("three/examples/jsm/loaders/FontLoader.js", () => ({
  FontLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn((url, onLoad) => {
      onLoad({
        isFont: true,
        data: {},
        generateShapes: jest.fn(() => []),
      });
    }),
  })),
}));

describe("ObjectManager Deletion Benchmark", () => {
  let scene;
  let objectManager;
  let primitiveFactory;
  let objectFactory;
  let objectPropertyUpdater;
  let eventBus;

  beforeEach(() => {
    scene = new THREE.Scene();
    eventBus = EventBus;
    primitiveFactory = new PrimitiveFactory();

    // Mock createPrimitive
    jest
      .spyOn(primitiveFactory, "createPrimitive")
      .mockImplementation(function (type) {
        const geometry = new THREE.BoxGeometry();
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
        mesh.name = type;
        return mesh;
      });

    objectFactory = new ObjectFactory(scene, primitiveFactory, eventBus);
    objectPropertyUpdater = new ObjectPropertyUpdater(primitiveFactory);

    objectManager = new ObjectManager(
      scene,
      eventBus,
      null,
      primitiveFactory,
      objectFactory,
      objectPropertyUpdater,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Benchmark: Deleting a group with many children", () => {
    const group = new THREE.Group();
    scene.add(group);

    // Create a deep and wide hierarchy
    // 1000 children, simple flat structure first to test the O(N^2) vs O(N) issue directly on array removal
    const childCount = 10000;
    for (let i = 0; i < childCount; i++) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshBasicMaterial(),
      );
      group.add(mesh);
    }

    const start = performance.now();
    objectManager.deleteObject(group);
    const end = performance.now();

    console.log(
      `Deleting group with ${childCount} children took ${(end - start).toFixed(4)} ms`,
    );

    expect(scene.children).not.toContain(group);
    expect(group.children.length).toBe(0);
  });
});
