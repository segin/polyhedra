import * as THREE from "three";
import { Pointer } from "../src/frontend/Pointer.js";
import EventBus from "../src/frontend/EventBus.js";

describe("Pointer", () => {
  let camera;
  let scene;
  let renderer;
  let eventBus;
  let pointer;

  beforeEach(() => {
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    scene = new THREE.Scene();
    renderer = {
      domElement: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 200,
          height: 100,
          x: 0,
          y: 0,
          right: 200,
          bottom: 100,
        }),
      },
      get size() {
        return { width: 100, height: 100 };
      },
    };
    eventBus = EventBus;

    // Reset EventBus subscribers
    EventBus.events = {};

    global.window = {
      innerWidth: 200,
      innerHeight: 100,
    };

    pointer = new Pointer(camera, scene, renderer, eventBus);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should dispatch a `selectionChange` event when an object is selected", () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    scene.add(mesh);

    const callback = jest.fn();
    EventBus.subscribe("selectionChange", callback);

    jest
      .spyOn(pointer.raycaster, "intersectObjects")
      .mockReturnValue([{ object: mesh }]);

    const event = { clientX: 50, clientY: 50, target: renderer.domElement };
    pointer.onPointerDown(event);

    expect(callback).toHaveBeenCalledWith(mesh);
    expect(pointer.selectedObject).toBe(mesh);
  });

  it("should dispatch `selectionChange` with a null payload on deselection", () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    scene.add(mesh);

    // Select first
    jest
      .spyOn(pointer.raycaster, "intersectObjects")
      .mockReturnValue([{ object: mesh }]);
    pointer.onPointerDown({
      clientX: 50,
      clientY: 50,
      target: renderer.domElement,
    });

    const callback = jest.fn();
    EventBus.subscribe("selectionChange", callback);

    // Deselect
    jest.spyOn(pointer.raycaster, "intersectObjects").mockReturnValue([]);
    pointer.onPointerDown({
      clientX: 100,
      clientY: 100,
      target: renderer.domElement,
    });

    expect(callback).toHaveBeenCalledWith(null);
    expect(pointer.selectedObject).toBeNull();
  });

  it("should correctly apply an outline to a selected object", () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    scene.add(mesh);

    jest
      .spyOn(pointer.raycaster, "intersectObjects")
      .mockReturnValue([{ object: mesh }]);
    pointer.onPointerDown({
      clientX: 50,
      clientY: 50,
      target: renderer.domElement,
    });

    expect(pointer.outline).toBeDefined();
    expect(pointer.outline.type).toBe("LineSegments");
    expect(mesh.children).toContain(pointer.outline);
  });

  it("should correctly remove the outline from a deselected object", () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    scene.add(mesh);

    jest
      .spyOn(pointer.raycaster, "intersectObjects")
      .mockReturnValue([{ object: mesh }]);
    pointer.onPointerDown({
      clientX: 50,
      clientY: 50,
      target: renderer.domElement,
    });

    jest.spyOn(pointer.raycaster, "intersectObjects").mockReturnValue([]);
    pointer.onPointerDown({
      clientX: 100,
      clientY: 100,
      target: renderer.domElement,
    });

    expect(pointer.outline).toBeNull();
  });

  it("should remove the outline from a previous selection when a new object is selected", () => {
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

    jest
      .spyOn(pointer.raycaster, "intersectObjects")
      .mockReturnValue([{ object: mesh1 }]);
    pointer.onPointerDown({
      clientX: 50,
      clientY: 50,
      target: renderer.domElement,
    });
    const oldOutline = pointer.outline;

    jest
      .spyOn(pointer.raycaster, "intersectObjects")
      .mockReturnValue([{ object: mesh2 }]);
    pointer.onPointerDown({
      clientX: 60,
      clientY: 60,
      target: renderer.domElement,
    });

    expect(pointer.selectedObject).toBe(mesh2);
    expect(mesh1.children).not.toContain(oldOutline);
  });

  it("`isDragging` flag should be true on `pointerdown` and false on `pointerup`", () => {
    expect(pointer.isDragging).toBe(false);
    pointer.onPointerDown({
      clientX: 50,
      clientY: 50,
      target: renderer.domElement,
    });
    expect(pointer.isDragging).toBe(true);
    pointer.onPointerUp();
    expect(pointer.isDragging).toBe(false);
  });

  it("Raycaster should be correctly updated on move", () => {
    const setFromCameraSpy = jest.spyOn(pointer.raycaster, "setFromCamera");
    pointer.onPointerMove({ clientX: 150, clientY: 75 });
    expect(setFromCameraSpy).toHaveBeenCalled();
  });

  it("Should not select an object if the pointer event started on a UI element", () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    scene.add(mesh);

    const callback = jest.fn();
    EventBus.subscribe("selectionChange", callback);

    const uiElement = document.createElement("div");
    uiElement.id = "ui-element";
    const mockEvent = { clientX: 50, clientY: 50, target: uiElement };

    pointer.onPointerDown(mockEvent);

    expect(callback).not.toHaveBeenCalled();
    expect(pointer.selectedObject).toBeNull();
  });

  it("`removeOutline` should not throw an error if called when no outline exists", () => {
    pointer.outline = null;
    expect(() => {
      pointer.removeOutline();
    }).not.toThrow();
  });

  it("Raycasting should correctly identify the front-most object", () => {
    const meshFront = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    const meshBack = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial(),
    );
    scene.add(meshFront);
    scene.add(meshBack);

    jest.spyOn(pointer.raycaster, "intersectObjects").mockReturnValue([
      { object: meshFront, distance: 1 },
      { object: meshBack, distance: 3 },
    ]);

    pointer.onPointerDown({
      clientX: 50,
      clientY: 50,
      target: renderer.domElement,
    });

    expect(pointer.selectedObject).toBe(meshFront);
  });
});
