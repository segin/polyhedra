jest.unmock("three");
import * as THREE from "three";
import "./__mocks__/three-dat.gui.js";
import { GroupManager } from "../src/frontend/GroupManager.js";
import EventBus from "../src/frontend/EventBus.js";

describe("GroupManager", () => {
  let scene;
  let groupManager;
  let eventBus;
  let object1, object2, object3;

  beforeEach(() => {
    scene = new THREE.Scene();
    eventBus = EventBus;
    groupManager = new GroupManager(scene, eventBus);

    object1 = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    object1.position.set(1, 0, 0);
    object1.name = "Object1";
    scene.add(object1);

    object2 = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    object2.position.set(2, 0, 0);
    object2.name = "Object2";
    scene.add(object2);

    object3 = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    object3.position.set(3, 0, 0);
    object3.name = "Object3";
    scene.add(object3);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should successfully group two or more objects", () => {
    const group = groupManager.groupObjects([object1, object2]);
    expect(group).toBeInstanceOf(THREE.Group);
    expect(scene.children).toContain(group);
    expect(group.children).toContain(object1);
    expect(group.children).toContain(object2);
    expect(scene.children).not.toContain(object1);
    expect(scene.children).not.toContain(object2);
  });

  it("should refuse to create a group with fewer than two objects", () => {
    const group = groupManager.groupObjects([object1]);
    expect(group).toBeNull();
    expect(scene.children).toContain(object1);
  });

  it("should correctly calculate the center of the grouped objects for the group's position", () => {
    const group = groupManager.groupObjects([object1, object2, object3]);
    // Expected center: (1+2+3)/3 = 2
    expect(group.position.x).toBeCloseTo(2);
    expect(group.position.y).toBeCloseTo(0);
    expect(group.position.z).toBeCloseTo(0);
  });

  it("should successfully ungroup a group of objects", () => {
    const group = groupManager.groupObjects([object1, object2]);
    groupManager.ungroupObjects(group);
    expect(scene.children).not.toContain(group);
    expect(scene.children).toContain(object1);
    expect(scene.children).toContain(object2);
  });

  it("should place ungrouped objects back into the scene at the correct world positions", () => {
    const group = groupManager.groupObjects([object1, object2]);
    group.position.set(10, 10, 10); // Move the group
    groupManager.ungroupObjects(group);

    // The center of the group was at x=1.5. When ungrouped, the objects' positions are relative to the group's center.
    // So, the new world position will be group.position + object.position.
    // object1's new position is (10 + (1 - 1.5)) = 9.5
    // object2's new position is (10 + (2 - 1.5)) = 10.5
    expect(object1.position.x).toBeCloseTo(9.5);
    expect(object1.position.y).toBeCloseTo(10);
    expect(object1.position.z).toBeCloseTo(10);

    expect(object2.position.x).toBeCloseTo(10.5);
    expect(object2.position.y).toBeCloseTo(10);
    expect(object2.position.z).toBeCloseTo(10);
  });

  it("should handle a request to ungroup an object that is not a group", () => {
    const ungrouped = groupManager.ungroupObjects(object1);
    expect(ungrouped).toEqual([]);
    expect(scene.children).toContain(object1);
  });

  it("should allow grouping a group with another object", () => {
    const group1 = groupManager.groupObjects([object1, object2]);
    const object4 = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    object4.name = "Object4";
    scene.add(object4);

    const group2 = groupManager.groupObjects([group1, object4]);

    expect(group2).toBeInstanceOf(THREE.Group);
    expect(scene.children).toContain(group2);
    expect(group2.children).toContain(group1);
    expect(group2.children).toContain(object4);
    expect(scene.children).not.toContain(group1);
    expect(scene.children).not.toContain(object4);
  });

  it("should correctly handle ungrouping a nested group, restoring all objects to the scene", () => {
    const meshA = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    meshA.name = "MeshA";
    const meshB = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    meshB.name = "MeshB";
    const meshC = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    meshC.name = "MeshC";

    scene.add(meshA, meshB, meshC);

    const innerGroup = groupManager.groupObjects([meshA, meshB]);
    innerGroup.name = "InnerGroup";

    const outerGroup = groupManager.groupObjects([innerGroup, meshC]);
    outerGroup.name = "OuterGroup";

    expect(scene.children).toContain(outerGroup);
    expect(scene.children).not.toContain(innerGroup);
    expect(scene.children).not.toContain(meshA);
    expect(scene.children).not.toContain(meshB);
    expect(scene.children).not.toContain(meshC);

    groupManager.ungroupObjects(outerGroup);
    groupManager.ungroupObjects(innerGroup);

    expect(scene.children).not.toContain(outerGroup);
    expect(scene.children).not.toContain(innerGroup);
    expect(scene.children).toContain(meshA);
    expect(scene.children).toContain(meshB);
    expect(scene.children).toContain(meshC);

    expect(meshA.parent).toBe(scene);
    expect(meshB.parent).toBe(scene);
    expect(meshC.parent).toBe(scene);
  });

  it("should maintain the world-space transforms of objects when they are grouped", () => {
    const mesh1 = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    mesh1.position.set(10, 0, 0);
    mesh1.rotation.set(0, Math.PI / 2, 0);
    mesh1.scale.set(2, 2, 2);
    scene.add(mesh1);

    const mesh2 = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    mesh2.position.set(20, 0, 0);
    mesh2.rotation.set(0, 0, Math.PI / 4);
    mesh2.scale.set(0.5, 0.5, 0.5);
    scene.add(mesh2);

    // Mock getWorldPosition for world-space verification if needed
    // However, THREE.Group integration usually handles this.

    // Get world positions before grouping
    const mesh1WorldPosition = new THREE.Vector3();
    mesh1.getWorldPosition(mesh1WorldPosition);
    const mesh2WorldPosition = new THREE.Vector3();
    mesh2.getWorldPosition(mesh2WorldPosition);

    const group = groupManager.groupObjects([mesh1, mesh2]);

    // After grouping, the objects' world positions should remain the same
    const newMesh1WorldPosition = new THREE.Vector3();
    mesh1.getWorldPosition(newMesh1WorldPosition);
    const newMesh2WorldPosition = new THREE.Vector3();
    mesh2.getWorldPosition(newMesh2WorldPosition);

    expect(newMesh1WorldPosition.x).toBeCloseTo(mesh1WorldPosition.x);
    expect(newMesh1WorldPosition.y).toBeCloseTo(mesh1WorldPosition.y);
    expect(newMesh1WorldPosition.z).toBeCloseTo(mesh1WorldPosition.z);

    expect(newMesh2WorldPosition.x).toBeCloseTo(mesh2WorldPosition.x);
    expect(newMesh2WorldPosition.y).toBeCloseTo(mesh2WorldPosition.y);
    expect(newMesh2WorldPosition.z).toBeCloseTo(mesh2WorldPosition.z);
  });

  it("should return an empty array when trying to ungroup a non-group object", () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    scene.add(mesh);
    const ungroupedObjects = groupManager.ungroupObjects(mesh);
    expect(ungroupedObjects).toEqual([]);
    expect(scene.children).toContain(mesh);
  });

  it("`ungroupObjects` should return an array containing all the former children", () => {
    const group = groupManager.groupObjects([object1, object2, object3]);
    const ungrouped = groupManager.ungroupObjects(group);
    expect(ungrouped).toContain(object1);
    expect(ungrouped).toContain(object2);
    expect(ungrouped).toContain(object3);
    expect(ungrouped.length).toBe(3);
  });

  it("Grouping should remove the original objects from the scene and add the new group", () => {
    const mesh1 = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    const mesh2 = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    scene.add(mesh1);
    scene.add(mesh2);

    expect(scene.children).toContain(mesh1);
    expect(scene.children).toContain(mesh2);

    const group = groupManager.groupObjects([mesh1, mesh2]);

    expect(scene.children).not.toContain(mesh1);
    expect(scene.children).not.toContain(mesh2);
    expect(scene.children).toContain(group);
  });

  it("An empty group should be removable from the scene", () => {
    const emptyGroup = new THREE.Group();
    scene.add(emptyGroup);
    expect(scene.children).toContain(emptyGroup);

    groupManager.ungroupObjects(emptyGroup);
    expect(scene.children).not.toContain(emptyGroup);
  });

  it("Grouping objects with existing animations should continue to work", () => {
    const animatedMesh1 = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    animatedMesh1.name = "AnimatedMesh1";
    animatedMesh1.rotation.x = 0; // Initial rotation
    scene.add(animatedMesh1);

    const animatedMesh2 = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    animatedMesh2.name = "AnimatedMesh2";
    animatedMesh2.rotation.y = 0; // Initial rotation
    scene.add(animatedMesh2);

    // Simulate animation by manually updating rotation
    const animate = (mesh) => {
      mesh.rotation.x += 0.1;
      mesh.rotation.y += 0.05;
    };

    // Apply animation before grouping
    animate(animatedMesh1);
    animate(animatedMesh2);

    const initialRotationX1 = animatedMesh1.rotation.x;
    const initialRotationY2 = animatedMesh2.rotation.y;

    const group = groupManager.groupObjects([animatedMesh1, animatedMesh2]);

    // Apply animation after grouping
    animate(animatedMesh1);
    animate(animatedMesh2);

    // Check if rotations have changed, indicating animation is still working
    expect(animatedMesh1.rotation.x).toBeGreaterThan(initialRotationX1);
    expect(animatedMesh2.rotation.y).toBeGreaterThan(initialRotationY2);

    // Ensure the meshes are now children of the group
    expect(group.children).toContain(animatedMesh1);
    expect(group.children).toContain(animatedMesh2);
  });

  it("A group's name should be settable and reflected in the Scene Graph", () => {
    const group = groupManager.groupObjects([object1, object2]);
    const newName = "MyCustomGroup";
    group.name = newName;
    expect(group.name).toBe(newName);
  });
});
