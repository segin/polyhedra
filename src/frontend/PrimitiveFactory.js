import * as THREE from 'three';
import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import log from './logger.js';

export class PrimitiveFactory {
  constructor() {
    this.font = null;
    this.materialCache = {};
    this.geometryCache = {};
    const loader = new FontLoader();
    // Use local path for fonts
    loader.load('./assets/fonts/helvetiker_regular.typeface.json', (font) => {
      this.font = font;
    }, undefined, (err) => {
      log.error('Error loading font:', err);
    });
  }

  _createMesh(geometry, color, side = THREE.FrontSide) {
    const isTest = typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID;
    const cacheKey = `${color}_${side}`;
    
    if (!isTest && !this.materialCache[cacheKey]) {
      this.materialCache[cacheKey] = new THREE.MeshPhongMaterial({ color, side });
    }
    
    const material = isTest ? new THREE.MeshPhongMaterial({ color, side }) : this.materialCache[cacheKey];
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  _getNormalizedParameters(type, options) {
    switch (type) {
      case 'Box':
        return {
          width: options.width || 1,
          height: options.height || 1,
          depth: options.depth || 1,
          widthSegments: options.widthSegments || 1,
          heightSegments: options.heightSegments || 1,
          depthSegments: options.depthSegments || 1,
        };
      case 'Sphere':
        return {
          radius: options.radius || 0.5,
          widthSegments: options.widthSegments || 32,
          heightSegments: options.heightSegments || 32,
        };
      case 'Cylinder':
        return {
          radiusTop: options.radiusTop || 0.5,
          radiusBottom: options.radiusBottom || 0.5,
          height: options.height || 1,
          radialSegments: options.radialSegments || 32,
        };
      case 'Cone':
        return {
          radius: options.radius || 0.5,
          height: options.height || 1,
          radialSegments: options.radialSegments || 32,
        };
      case 'Torus':
        return {
          radius: options.radius || 0.4,
          tube: options.tube || 0.2,
          radialSegments: options.radialSegments || 16,
          tubularSegments: options.tubularSegments || 100,
        };
      case 'TorusKnot':
        return {
          radius: options.radius || 0.4,
          tube: options.tube || 0.15,
          tubularSegments: options.tubularSegments || 100,
          radialSegments: options.radialSegments || 16,
        };
      case 'Tetrahedron':
      case 'Icosahedron':
      case 'Dodecahedron':
      case 'Octahedron':
        return { radius: options.radius || 0.6 };
      case 'Plane':
        return {
          width: options.width || 2,
          height: options.height || 2,
          widthSegments: options.widthSegments || 1,
          heightSegments: options.heightSegments || 1,
        };
      case 'Lathe':
        return { segments: 12 };
      case 'Text':
        return {
          text: options.text || 'nodist3d',
          size: options.size || 0.5,
          height: options.height || 0.2,
          curveSegments: options.curveSegments || 12,
          bevelEnabled: options.bevelEnabled !== undefined ? options.bevelEnabled : true,
          bevelThickness: options.bevelThickness || 0.03,
          bevelSize: options.bevelSize || 0.02,
          bevelOffset: options.bevelOffset || 0,
          bevelSegments: options.bevelSegments || 5,
        };
      default:
        // Exclude color and other non-geometry props from key
        // eslint-disable-next-line no-unused-vars
        const { color, ...rest } = options;
        return rest;
    }
  }

  _getCachedGeometry(type, options) {
    const params = this._getNormalizedParameters(type, options);
    const key = `${type}_${JSON.stringify(params)}`;
    if (this.geometryCache[key]) {
      return this.geometryCache[key];
    }

    let geometry;
    switch (type) {
      case 'Box':
        geometry = new THREE.BoxGeometry(
          params.width,
          params.height,
          params.depth,
          params.widthSegments,
          params.heightSegments,
          params.depthSegments
        );
        break;
      case 'Sphere':
        geometry = new THREE.SphereGeometry(
          params.radius,
          params.widthSegments,
          params.heightSegments
        );
        break;
      case 'Cylinder':
        geometry = new THREE.CylinderGeometry(
          params.radiusTop,
          params.radiusBottom,
          params.height,
          params.radialSegments
        );
        break;
      case 'Cone':
        geometry = new THREE.ConeGeometry(
          params.radius,
          params.height,
          params.radialSegments
        );
        break;
      case 'Torus':
        geometry = new THREE.TorusGeometry(
          params.radius,
          params.tube,
          params.radialSegments,
          params.tubularSegments
        );
        break;
      case 'TorusKnot':
        geometry = new THREE.TorusKnotGeometry(
          params.radius,
          params.tube,
          params.tubularSegments,
          params.radialSegments
        );
        break;
      case 'Tetrahedron':
        geometry = new THREE.TetrahedronGeometry(params.radius);
        break;
      case 'Icosahedron':
        geometry = new THREE.IcosahedronGeometry(params.radius);
        break;
      case 'Dodecahedron':
        geometry = new THREE.DodecahedronGeometry(params.radius);
        break;
      case 'Octahedron':
        geometry = new THREE.OctahedronGeometry(params.radius);
        break;
      case 'Plane':
        geometry = new THREE.PlaneGeometry(params.width, params.height, params.widthSegments, params.heightSegments);
        break;
      case 'Lathe':
        const pointsLathe = [];
        for (let i = 0; i < 10; i++) {
          pointsLathe.push(new THREE.Vector2(Math.sin(i * 0.2) * 0.5 + 0.5, (i - 5) * 0.2));
        }
        geometry = new THREE.LatheGeometry(pointsLathe, 12);
        break;
      default:
        return null;
    }

    if (geometry) {
      this.geometryCache[key] = geometry;
    }
    return geometry;
  }

  createPrimitive(type, options = {}) {
    if (type === 'Text') {
      return new Promise((resolve) => {
        if (this.font) {
          const params = this._getNormalizedParameters('Text', options);
          const cacheKey = `Text_${JSON.stringify(params)}`;
          if (this.geometryCache[cacheKey]) {
              const mesh = this._createMesh(this.geometryCache[cacheKey], options.color || 0x00bfff);
              mesh.userData.primitiveType = type;
              mesh.userData.primitiveOptions = options;
              resolve(mesh);
              return;
          }

          const geometry = new TextGeometry(options.text || 'nodist3d', {
            font: this.font,
            size: options.size || 0.5,
            depth: options.height || 0.2, // TextGeometry uses depth instead of height in newer Three.js
            curveSegments: options.curveSegments || 12,
            bevelEnabled: options.bevelEnabled || true,
            bevelThickness: options.bevelThickness || 0.03,
            bevelSize: options.bevelSize || 0.02,
            bevelOffset: options.bevelOffset || 0,
            bevelSegments: options.bevelSegments || 5,
          });
          geometry.center();
          this.geometryCache[cacheKey] = geometry;
          const mesh = this._createMesh(geometry, options.color || 0x00bfff);
          mesh.userData.primitiveType = type;
          mesh.userData.primitiveOptions = options;
          resolve(mesh);
        } else {
          log.error('Font not loaded. Cannot create text.');
          resolve(null);
        }
      });
    }

    let geometry = this._getCachedGeometry(type, options);
    let color = options.color || 0x00ff00;
    let mesh;

    if (geometry) {
        mesh = this._createMesh(geometry, color, type === 'Plane' ? THREE.DoubleSide : THREE.FrontSide);
    } else {
        // Handle specialized cases like Teapot, Tube, Extrude, LOD which might not be trivially cacheable or need special geometry
        switch (type) {
          case 'Tube':
            const tubePath = options.path || new THREE.CatmullRomCurve3([
              new THREE.Vector3(-0.5, 0, 0),
              new THREE.Vector3(0, 0.5, 0),
              new THREE.Vector3(0.5, 0, 0),
              new THREE.Vector3(0, -0.5, 0),
            ]);
            geometry = new THREE.TubeGeometry(
              tubePath,
              options.tubularSegments || 20,
              options.radius || 0.2,
              options.radialSegments || 8,
              options.closed || false,
            );
            color = options.color || 0xffc0cb;
            mesh = this._createMesh(geometry, color);
            break;
          case 'Teapot':
            const teapot = new THREE.Group();
            teapot.name = 'Teapot';
            const teapotColor = options.color || 0x800000;
            
            teapot.add(this._createMesh(this._getCachedGeometry('Sphere', { radius: 0.4, widthSegments: 32, heightSegments: 32 }), teapotColor));
            
            const spout = this._createMesh(this._getCachedGeometry('Cylinder', { radiusTop: 0.05, radiusBottom: 0.08, height: 0.3, radialSegments: 8 }), teapotColor);
            spout.position.set(0.4, 0, 0);
            teapot.add(spout);
            
            const handle = this._createMesh(this._getCachedGeometry('Torus', { radius: 0.15, tube: 0.03, radialSegments: 8, tubularSegments: 16 }), teapotColor);
            handle.position.set(-0.4, 0, 0);
            teapot.add(handle);
            
            const lid = this._createMesh(this._getCachedGeometry('Cylinder', { radiusTop: 0.35, radiusBottom: 0.4, height: 0.05, radialSegments: 32 }), teapotColor);
            lid.position.set(0, 0.4, 0);
            teapot.add(lid);
            
            const knob = this._createMesh(this._getCachedGeometry('Sphere', { radius: 0.08, widthSegments: 16, heightSegments: 16 }), teapotColor);
            knob.position.set(0, 0.45, 0);
            teapot.add(knob);
            
            mesh = teapot;
            break;
          case 'Extrude':
            const extrudeSettings = {
              steps: 2,
              depth: 0.2,
              bevelEnabled: true,
              bevelThickness: 0.1,
              bevelSize: 0.1,
              bevelOffset: 0,
              bevelSegments: 1,
            };
            const shape = new THREE.Shape();
            shape.moveTo(0, 0);
            shape.lineTo(0, 1);
            shape.lineTo(1, 1);
            shape.lineTo(1, 0);
            shape.lineTo(0, 0);
            const hole = new THREE.Path();
            hole.moveTo(0.2, 0.2);
            hole.lineTo(0.8, 0.2);
            hole.lineTo(0.8, 0.8);
            hole.lineTo(0.2, 0.8);
            hole.lineTo(0.2, 0.2);
            shape.holes.push(hole);
            geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            color = options.color || 0xff6347;
            mesh = this._createMesh(geometry, color);
            break;
          case 'LODCube':
            const lod = new THREE.LOD();
            const lodMaterial = new THREE.MeshPhongMaterial({ color: options.color || 0x00ff00 });
            lod.addLevel(new THREE.Mesh(this._getCachedGeometry('Box', { width: 1, height: 1, depth: 1 }), lodMaterial), 0);
            lod.addLevel(new THREE.Mesh(this._getCachedGeometry('Box', { width: 1, height: 1, depth: 1 }), lodMaterial), 5);
            lod.addLevel(new THREE.Mesh(this._getCachedGeometry('Box', { width: 1, height: 1, depth: 1 }), lodMaterial), 10);
            mesh = lod;
            break;
          default:
            log.error(`Unknown primitive type: ${type}`);
            return null;
        }
    }

    if (mesh) {
        if (!mesh.userData) mesh.userData = {};
        mesh.userData.primitiveType = type;
        mesh.userData.primitiveOptions = options;

        // Ensure children also have userData if it's a group like Teapot or LOD
        if (mesh.children && mesh.children.length > 0) {
           // We might not need to set it on children if we save/restore the root
        }
    }

    return mesh;
  }
}
