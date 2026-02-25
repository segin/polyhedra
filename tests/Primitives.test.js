/**
 * Tests for all 13 3D Primitives
 */
import { JSDOM } from "jsdom";
import { App } from "../src/frontend/main.js";

describe("3D Primitives Functionality", () => {
  let dom, app;

  beforeEach(() => {
    // Setup DOM
    dom = new JSDOM(
      '<!DOCTYPE html><html><body><div id="objects-list"></div><div id="scene-graph-panel"></div></body></html>',
    );
    global.document = dom.window.document;
    global.window = dom.window;
    global.navigator = dom.window.navigator;
    global.requestAnimationFrame = jest.fn();
    global.console.log = jest.fn();

    // Instantiate App
    app = new App();

    // Clear all mocks to ensure isolated counts
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (dom) {
      dom.window.close();
    }
  });

  describe("Basic Primitive Creation", () => {
    const primitives = [
      { name: "Box", method: "addBox", expectedGeometry: "BoxGeometry" },
      {
        name: "Sphere",
        method: "addSphere",
        expectedGeometry: "SphereGeometry",
      },
      {
        name: "Cylinder",
        method: "addCylinder",
        expectedGeometry: "CylinderGeometry",
      },
      { name: "Cone", method: "addCone", expectedGeometry: "ConeGeometry" },
      { name: "Torus", method: "addTorus", expectedGeometry: "TorusGeometry" },
      {
        name: "TorusKnot",
        method: "addTorusKnot",
        expectedGeometry: "TorusKnotGeometry",
      },
      {
        name: "Tetrahedron",
        method: "addTetrahedron",
        expectedGeometry: "TetrahedronGeometry",
      },
      {
        name: "Icosahedron",
        method: "addIcosahedron",
        expectedGeometry: "IcosahedronGeometry",
      },
      {
        name: "Dodecahedron",
        method: "addDodecahedron",
        expectedGeometry: "DodecahedronGeometry",
      },
      {
        name: "Octahedron",
        method: "addOctahedron",
        expectedGeometry: "OctahedronGeometry",
      },
      { name: "Plane", method: "addPlane", expectedGeometry: "PlaneGeometry" },
      { name: "Tube", method: "addTube", expectedGeometry: "TubeGeometry" },
    ];

    primitives.forEach((primitive) => {
      it(`should create ${primitive.name} with correct properties`, async () => {
        const mesh = await app[primitive.method]();

        expect(mesh).toBeDefined();
        expect(mesh.name).toContain(primitive.name);
        expect(mesh.castShadow).toBe(true);
        expect(mesh.receiveShadow).toBe(true);
        expect(app.objects).toContain(mesh);
        expect(app.selectedObject).toBe(mesh);
        expect(app.scene.add).toHaveBeenCalledWith(mesh);
      });
    });

    it("should create Teapot as a Group with multiple components", async () => {
      const THREE = require("three");
      const OriginalGroup = THREE.Group;
      const groupSpy = jest.fn().mockImplementation(() => new OriginalGroup());
      THREE.Group = groupSpy;

      try {
        const teapot = await app.addTeapot();

        expect(teapot).toBeDefined();
        expect(teapot.name).toContain("Teapot");
        expect(THREE.Group).toHaveBeenCalled();
        expect(teapot.add).toHaveBeenCalledTimes(5); // body, spout, handle, lid, knob
        expect(app.objects).toContain(teapot);
        expect(app.selectedObject).toBe(teapot);
      } finally {
        THREE.Group = OriginalGroup;
      }
    });
  });

  describe("Geometry Parameters", () => {
    it("should create Box with correct dimensions", async () => {
      const THREE = require("three");
      await app.addBox();

      expect(THREE.BoxGeometry).toHaveBeenCalledWith(1, 1, 1);
    });

    it("should create Sphere with correct radius and segments", async () => {
      const THREE = require("three");
      await app.addSphere();

      expect(THREE.SphereGeometry).toHaveBeenCalledWith(0.5, 32, 32);
    });

    it("should create Sphere with correct radius and segments", () => {
      const THREE = require("three");
      app.addSphere();
      expect(THREE.SphereGeometry).toHaveBeenCalledWith(0.5, 32, 32);
    });

    it("should create Cylinder with correct parameters", () => {
      const THREE = require("three");
      app.addCylinder();
      expect(THREE.CylinderGeometry).toHaveBeenCalledWith(0.5, 0.5, 1, 32);
    });

    it("should create Cone with correct radius and height", () => {
      const THREE = require("three");
      app.addCone();
      expect(THREE.ConeGeometry).toHaveBeenCalledWith(0.5, 1, 32);
    });

    it("should create Torus with correct major and minor radius", () => {
      const THREE = require("three");
      app.addTorus();
      expect(THREE.TorusGeometry).toHaveBeenCalledWith(0.4, 0.2, 16, 100);
    });

    it("should create TorusKnot with correct parameters", () => {
      const THREE = require("three");
      app.addTorusKnot();
      expect(THREE.TorusKnotGeometry).toHaveBeenCalledWith(0.4, 0.15, 100, 16);
    });

    it("should create polyhedrons with correct radius", () => {
      const THREE = require("three");
      app.addTetrahedron();
      expect(THREE.TetrahedronGeometry).toHaveBeenCalledWith(0.6);
      app.addIcosahedron();
      expect(THREE.IcosahedronGeometry).toHaveBeenCalledWith(0.6);
      app.addDodecahedron();
      expect(THREE.DodecahedronGeometry).toHaveBeenCalledWith(0.6);
      app.addOctahedron();
      expect(THREE.OctahedronGeometry).toHaveBeenCalledWith(0.6);
    });

    it("should create Plane with correct dimensions and double-sided material", () => {
      const THREE = require("three");
      app.addPlane();
      expect(THREE.PlaneGeometry).toHaveBeenCalledWith(2, 2);
      // Primitives use Lambert in this version of the app
      expect(THREE.MeshPhongMaterial).toHaveBeenCalledWith(
        expect.objectContaining({
          color: 0x00ffff,
          side: THREE.DoubleSide,
        }),
      );
    });

    it("should create Tube with curve and correct parameters", () => {
      const THREE = require("three");
      app.addTube();
      expect(THREE.CatmullRomCurve3).toHaveBeenCalled();
      expect(THREE.TubeGeometry).toHaveBeenCalled();
    });
  });

  describe("Object Naming and Counting", () => {
    it("should name objects with incremental counters", async () => {
      const box1 = await app.addBox();
      const box2 = await app.addBox();
      const sphere1 = await app.addSphere();

      expect(box1.name).toBe("Box_1");
      expect(box2.name).toBe("Box_2");
      expect(sphere1.name).toBe("Sphere_3");
    });

    it("should maintain correct object count", async () => {
      expect(app.objects.length).toBe(0);

      await app.addBox();
      expect(app.objects.length).toBe(1);

      await app.addSphere();
      expect(app.objects.length).toBe(2);

      await app.addCylinder();
      expect(app.objects.length).toBe(3);
    });
  });

  describe("Material Properties", () => {
    it("should assign unique colors to different primitives", () => {
      const THREE = require("three");

      app.addBox();
      expect(THREE.MeshPhongMaterial).toHaveBeenCalledWith({
        color: 0x00ff00,
        side: 0,
      });

      app.addSphere();
      expect(THREE.MeshPhongMaterial).toHaveBeenCalledWith({
        color: 0xff0000,
        side: 0,
      });

      app.addCylinder();
      expect(THREE.MeshPhongMaterial).toHaveBeenCalledWith({
        color: 0x0000ff,
        side: 0,
      });
    });

    it("should create materials for all primitive types", () => {
      const THREE = require("three");
      const materialCalls = THREE.MeshPhongMaterial.mock.calls.length;

      // Add all primitives
      app.addBox();
      app.addSphere();
      app.addCylinder();
      app.addCone();
      app.addTorus();
      app.addTorusKnot();
      app.addTetrahedron();
      app.addIcosahedron();
      app.addDodecahedron();
      app.addOctahedron();
      app.addPlane();
      app.addTube();
      app.addTeapot();

      // Should have created materials for all primitives (teapot creates multiple materials)
      expect(THREE.MeshPhongMaterial.mock.calls.length).toBeGreaterThan(
        materialCalls + 12,
      );
    });
  });

  describe("Scene Integration", () => {
    it("should add all primitives to the scene", async () => {
      const sceneAddSpy = jest.spyOn(app.scene, "add");
      sceneAddSpy.mockClear();

      await app.addBox();
      await app.addSphere();
      await app.addTetrahedron();
      await app.addTeapot();

      expect(sceneAddSpy).toHaveBeenCalledTimes(4);
    });

    it("should select newly created objects", async () => {
      const box = await app.addBox();
      expect(app.selectedObject).toBe(box);

      const sphere = await app.addSphere();
      expect(app.selectedObject).toBe(sphere);
    });

    it("should call saveState for each primitive creation", async () => {
      const saveStateSpy = jest.spyOn(app, "saveState");

      await app.addBox();
      expect(saveStateSpy).toHaveBeenCalledWith("Add Box");

      await app.addSphere();
      expect(saveStateSpy).toHaveBeenCalledWith("Add Sphere");

      await app.addTeapot();
      expect(saveStateSpy).toHaveBeenCalledWith("Add Teapot");
    });

    it("should update scene graph for each primitive creation", async () => {
      const updateSpy = jest.spyOn(app, "updateSceneGraph");

      await app.addCone();
      expect(updateSpy).toHaveBeenCalled();

      await app.addTorus();
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  describe("Shadow Properties", () => {
    it("should enable shadows for all primitives", async () => {
      const primitives = await Promise.all([
        app.addBox(),
        app.addSphere(),
        app.addCylinder(),
        app.addCone(),
        app.addTorus(),
        app.addTorusKnot(),
        app.addTetrahedron(),
        app.addIcosahedron(),
        app.addDodecahedron(),
        app.addOctahedron(),
        app.addPlane(),
        app.addTube(),
      ]);

      primitives.forEach((primitive) => {
        expect(primitive.castShadow).toBe(true);
        expect(primitive.receiveShadow).toBe(true);
      });
    });
  });

  describe("Complex Primitives", () => {
    it("should create Tube with proper curve definition", async () => {
      const THREE = require("three");
      await app.addTube();

      // Verify curve points were created
      expect(THREE.Vector3).toHaveBeenCalledWith(-0.5, 0, 0);
      expect(THREE.Vector3).toHaveBeenCalledWith(0, 0.5, 0);
      expect(THREE.Vector3).toHaveBeenCalledWith(0.5, 0, 0);
      expect(THREE.Vector3).toHaveBeenCalledWith(0, -0.5, 0);
    });

    it("should create Teapot with all components positioned correctly", async () => {
      const THREE = require("three");
      const teapot = await app.addTeapot();

      // Verify all geometries were created for teapot components
      expect(THREE.SphereGeometry).toHaveBeenCalledWith(0.4, 32, 32); // body
      expect(THREE.CylinderGeometry).toHaveBeenCalledWith(0.05, 0.08, 0.3, 8); // spout
      expect(THREE.TorusGeometry).toHaveBeenCalledWith(0.15, 0.03, 8, 16); // handle
      expect(THREE.CylinderGeometry).toHaveBeenCalledWith(0.35, 0.4, 0.05, 32); // lid
      expect(THREE.SphereGeometry).toHaveBeenCalledWith(0.08, 16, 16); // knob
    });
  });
});
