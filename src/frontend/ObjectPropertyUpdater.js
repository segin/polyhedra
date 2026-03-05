// @ts-check
import * as THREE from 'three';
import { Logger } from './utils/Logger.js';

/**
 * Handles updating of object properties like materials, textures, and geometry.
 */
export class ObjectPropertyUpdater {
  /**
   * @param {any} primitiveFactory
   */
  constructor(primitiveFactory) {
    this.primitiveFactory = primitiveFactory;
  }

  /**
   * Updates the material properties of an object.
   * @param {THREE.Object3D} object
   * @param {object} properties
   */
  updateMaterial(object, properties) {
    // @ts-ignore
    if (object && object.material) {
      // @ts-ignore
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        for (const key in properties) {
          if (Object.prototype.hasOwnProperty.call(properties, key)) {
            if (key === 'color' || key === 'emissive') {
              if (typeof properties[key] === 'string') {
                material[key].set(properties[key]);
              } else {
                material[key].setHex(properties[key]);
              }
            } else if (material[key] !== undefined) {
              material[key] = properties[key];
            }
          }
        }
        material.needsUpdate = true;
      });
    }
  }

  /**
   * Adds a texture to an object.
   * @param {THREE.Object3D} object
   * @param {File} file
   * @param {string} [type='map']
   */
  addTexture(object, file, type = 'map') {
    // @ts-ignore
    if (!object.material) return;

    const loader = new THREE.TextureLoader();
    const url = URL.createObjectURL(file);
    loader.load(
      url,
      (texture) => {
        // @ts-ignore
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(material => {
          material[type] = texture;
          material.needsUpdate = true;
        });
        URL.revokeObjectURL(url);
      },
      undefined,
      (error) => {
        Logger.warn('Error loading texture:', error);
        URL.revokeObjectURL(url);
      },
    );
  }

  /**
   * Updates the primitive geometry of an object.
   * @param {THREE.Object3D} object
   * @param {object} parameters
   */
  updatePrimitive(object, parameters) {
    // @ts-ignore
    if (object && object.geometry) {
      const type = object.geometry.type.replace('Geometry', '');
      const tempMeshOrPromise = this.primitiveFactory.createPrimitive(type, parameters);

      const updateGeo = (tempMesh) => {
        if (tempMesh && tempMesh.geometry) {
          // @ts-ignore
          object.geometry.dispose();
          // @ts-ignore
          object.geometry = tempMesh.geometry;
        }
      };

      if (tempMeshOrPromise instanceof Promise) {
        tempMeshOrPromise.then(updateGeo);
      } else {
        updateGeo(tempMeshOrPromise);
      }
    }
  }
}
