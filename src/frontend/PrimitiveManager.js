import * as THREE from "three";
import { TeapotGeometry } from "three/examples/jsm/geometries/TeapotGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

export class PrimitiveManager {
  constructor(scene) {
    this.scene = scene;
    this.geometryCache = new Map();
    this.fontCache = null;
    this.fontLoaderPromise = null;
  }

  /**
   * @param {string} type
   * @param {object} params
   * @param {Function} createFn
   * @returns {THREE.BufferGeometry}
   */
  _getCachedGeometry(type, params, createFn) {
    const key = `${type}_${JSON.stringify(params)}`;
    if (!this.geometryCache.has(key)) {
      this.geometryCache.set(key, createFn());
    }
    return this.geometryCache.get(key);
  }

  /**
   * @param {THREE.BufferGeometry} geometry
   * @param {number} color
   * @param {THREE.Side} [side]
   */
  _createMesh(geometry, color, side = THREE.FrontSide) {
    const material = new THREE.MeshPhongMaterial({ color, side });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    return mesh;
  }

  addCube() {
    const params = { width: 1, height: 1, depth: 1 };
    const geometry = this._getCachedGeometry(
      "Box",
      params,
      () => new THREE.BoxGeometry(params.width, params.height, params.depth),
    );
    return this._createMesh(geometry, 0x44aa88);
  }

  addSphere() {
    const params = { radius: 0.75, widthSegments: 32, heightSegments: 16 };
    const geometry = this._getCachedGeometry(
      "Sphere",
      params,
      () =>
        new THREE.SphereGeometry(
          params.radius,
          params.widthSegments,
          params.heightSegments,
        ),
    );
    return this._createMesh(geometry, 0xff0000); // Red color for sphere
  }

  addCylinder() {
    const params = {
      radiusTop: 0.5,
      radiusBottom: 0.5,
      height: 1,
      radialSegments: 32,
    };
    const geometry = this._getCachedGeometry(
      "Cylinder",
      params,
      () =>
        new THREE.CylinderGeometry(
          params.radiusTop,
          params.radiusBottom,
          params.height,
          params.radialSegments,
        ),
    );
    return this._createMesh(geometry, 0x0000ff); // Blue color for cylinder
  }

  addCone() {
    const params = { radius: 0.5, height: 1, radialSegments: 32 };
    const geometry = this._getCachedGeometry(
      "Cone",
      params,
      () =>
        new THREE.ConeGeometry(
          params.radius,
          params.height,
          params.radialSegments,
        ),
    );
    return this._createMesh(geometry, 0xffff00); // Yellow color for cone
  }

  addTorus() {
    const params = {
      radius: 0.4,
      tube: 0.2,
      radialSegments: 16,
      tubularSegments: 100,
    };
    const geometry = this._getCachedGeometry(
      "Torus",
      params,
      () =>
        new THREE.TorusGeometry(
          params.radius,
          params.tube,
          params.radialSegments,
          params.tubularSegments,
        ),
    );
    return this._createMesh(geometry, 0x800080); // Purple color for torus
  }

  addTorusKnot() {
    const params = {
      radius: 0.4,
      tube: 0.1,
      tubularSegments: 64,
      radialSegments: 8,
      p: 2,
      q: 3,
    };
    const geometry = this._getCachedGeometry(
      "TorusKnot",
      params,
      () =>
        new THREE.TorusKnotGeometry(
          params.radius,
          params.tube,
          params.tubularSegments,
          params.radialSegments,
          params.p,
          params.q,
        ),
    );
    return this._createMesh(geometry, 0xffa500); // Orange color for torus knot
  }

  addTetrahedron() {
    const params = { radius: 0.7, detail: 0 };
    const geometry = this._getCachedGeometry(
      "Tetrahedron",
      params,
      () => new THREE.IcosahedronGeometry(params.radius, params.detail),
    );
    return this._createMesh(geometry, 0x00ff00); // Green color for tetrahedron
  }

  addIcosahedron() {
    const params = { radius: 0.7, detail: 0 };
    const geometry = this._getCachedGeometry(
      "Icosahedron",
      params,
      () => new THREE.IcosahedronGeometry(params.radius, params.detail),
    );
    return this._createMesh(geometry, 0x00ffff); // Cyan color for icosahedron
  }

  addDodecahedron() {
    const params = { radius: 0.7, detail: 0 };
    const geometry = this._getCachedGeometry(
      "Dodecahedron",
      params,
      () => new THREE.DodecahedronGeometry(params.radius, params.detail),
    );
    return this._createMesh(geometry, 0xff00ff); // Magenta color for dodecahedron
  }

  addOctahedron() {
    const params = { radius: 0.7, detail: 0 };
    const geometry = this._getCachedGeometry(
      "Octahedron",
      params,
      () => new THREE.OctahedronGeometry(params.radius, params.detail),
    );
    return this._createMesh(geometry, 0x008080); // Teal color for octahedron
  }

  addPlane() {
    const params = { width: 1, height: 1 };
    const geometry = this._getCachedGeometry(
      "Plane",
      params,
      () => new THREE.PlaneGeometry(params.width, params.height),
    );
    return this._createMesh(geometry, 0x808080, THREE.DoubleSide); // Gray color for plane
  }

  addTube() {
    // Tube relies on path which is an object. JSON.stringify might not be enough if path changes,
    // but here the path is hardcoded.
    const params = {
      pathPoints: [
        { x: -1, y: -1, z: 0 },
        { x: -0.5, y: 1, z: 0 },
        { x: 0.5, y: -1, z: 0 },
        { x: 1, y: 1, z: 0 },
      ],
      tubularSegments: 20,
      radius: 0.2,
      radialSegments: 8,
      closed: false,
    };

    const geometry = this._getCachedGeometry("Tube", params, () => {
      const path = new THREE.CatmullRomCurve3(
        params.pathPoints.map((p) => new THREE.Vector3(p.x, p.y, p.z)),
      );
      return new THREE.TubeGeometry(
        path,
        params.tubularSegments,
        params.radius,
        params.radialSegments,
        params.closed,
      );
    });

    return this._createMesh(geometry, 0xffc0cb); // Pink color for tube
  }

  addTeapot() {
    const params = {
      size: 0.5,
      segments: 10,
      bottom: true,
      lid: true,
      body: true,
      fitLid: false,
      blinn: true,
    };
    const geometry = this._getCachedGeometry(
      "Teapot",
      params,
      () =>
        new TeapotGeometry(
          params.size,
          params.segments,
          params.bottom,
          params.lid,
          params.body,
          params.fitLid,
          params.blinn,
        ),
    );
    return this._createMesh(geometry, 0x800000); // Maroon color for teapot
  }

  addLathe() {
    // Lathe points are generated algorithmically but are deterministic.
    const params = { pointsCount: 10 };
    // We rely on the fact that points are hardcoded based on the loop.

    const geometry = this._getCachedGeometry("Lathe", params, () => {
      const points = [];
      for (let i = 0; i < params.pointsCount; i++) {
        points.push(
          new THREE.Vector2(Math.sin(i * 0.2) * 0.5 + 0.5, (i - 5) * 0.2),
        );
      }
      return new THREE.LatheGeometry(points);
    });

    return this._createMesh(geometry, 0x00ff80); // Spring Green for Lathe
  }

  addExtrude() {
    // Extrude shape is hardcoded.
    const params = { type: "hardcoded_shape_1" };

    const geometry = this._getCachedGeometry("Extrude", params, () => {
      const shape = new THREE.Shape();
      const x = 0,
        y = 0;
      shape.moveTo(x + 0.5, y + 0.5);
      shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
      shape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
      shape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.5, x + 0.5, y + 1.9);
      shape.bezierCurveTo(x + 1.3, y + 1.5, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
      shape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
      shape.bezierCurveTo(x + 0.85, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

      const extrudeSettings = {
        steps: 2,
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelOffset: 0,
        bevelSegments: 1,
      };
      return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    });

    return this._createMesh(geometry, 0xff6347); // Tomato for Extrude
  }

  addText(text = "nodist3d") {
    // Use cached font loader promise if available
    if (!this.fontLoaderPromise) {
      const loader = new FontLoader();
      this.fontLoaderPromise = new Promise((resolve, reject) => {
        loader.load(
          "./node_modules/three/examples/fonts/helvetiker_regular.typeface.json",
          (font) => {
            this.fontCache = font;
            resolve(font);
          },
          undefined,
          (err) => reject(err),
        );
      });
    }

    return this.fontLoaderPromise.then((font) => {
      const params = {
        text,
        size: 0.5,
        depth: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5,
      };

      const geometry = this._getCachedGeometry("Text", params, () => {
        const geo = new TextGeometry(text, {
          font: font,
          ...params,
        });
        geo.center();
        return geo;
      });

      return this._createMesh(geometry, 0x00bfff);
    });
  }
}
