// @ts-check
import { Events } from './constants.js';

const TEXTURE_KEYS = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'alphaMap', 'aoMap'];

/**
 * Manages 3D objects in the scene.
 */
export class ObjectManager {
    /**
     * @param {import('three').Scene} scene
     * @param {any} eventBus
     * @param {any} physicsManager
     * @param {import('./PrimitiveFactory.js').PrimitiveFactory} primitiveFactory
     * @param {import('./ObjectFactory.js').ObjectFactory} objectFactory
     * @param {import('./ObjectPropertyUpdater.js').ObjectPropertyUpdater} objectPropertyUpdater
     * @param {import('./StateManager.js').StateManager} stateManager
     */
    constructor(scene, eventBus, physicsManager, primitiveFactory, objectFactory, objectPropertyUpdater, stateManager) {
        this.scene = scene;
        this.eventBus = eventBus;
        this.physicsManager = physicsManager;
        this.primitiveFactory = primitiveFactory;
        this.objectFactory = objectFactory;
        this.objectPropertyUpdater = objectPropertyUpdater;
        this.stateManager = stateManager;
    }

    /**
     * Selects an object.
     * @param {import('three').Object3D} object
     */
    selectObject(object) {
        if (this.stateManager) {
            this.stateManager.setState({ selection: [object] });
        }
        this.eventBus.publish(Events.OBJECT_SELECTED, object);
    }

    /**
     * Deselects the currently selected object.
     */
    deselectObject() {
        if (this.stateManager) {
            this.stateManager.setState({ selection: [] });
        }
        this.eventBus.publish(Events.OBJECT_DESELECTED);
    }

    /**
     * Adds a primitive to the scene.
     * @param {string} type
     * @param {object} [options]
     * @returns {Promise<THREE.Object3D> | THREE.Object3D | null}
     */
    addPrimitive(type, options) {
        if (this.objectFactory) {
            return this.objectFactory.addPrimitive(type, options);
        }

        // Fallback logic
        const object = this.primitiveFactory.createPrimitive(type, options);
        if (object && !(object instanceof Promise)) {
            this.scene.add(object);
            this.eventBus.publish(Events.OBJECT_ADDED, object);
        }
        return object;
    }

    /**
     * Duplicates an object.
     * @param {import('three').Object3D} object
     * @returns {Promise<import('three').Object3D> | import('three').Object3D | null}
     */
    duplicateObject(object) {
        if (this.objectFactory) {
            return this.objectFactory.duplicateObject(object);
        }
        return null;
    }

    /**
     * Updates object material properties.
     * @param {import('three').Object3D} object
     * @param {object} properties
     */
    updateMaterial(object, properties) {
        if (this.objectPropertyUpdater) {
            this.objectPropertyUpdater.updateMaterial(object, properties);
        }
    }

    /**
     * Adds a texture to an object.
     * @param {import('three').Object3D} object
     * @param {File} file
     * @param {string} type
     */
    addTexture(object, file, type) {
        if (this.objectPropertyUpdater) {
            this.objectPropertyUpdater.addTexture(object, file, type);
        }
    }

    /**
     * Deletes an object from the scene.
     * @param {import('three').Object3D} object
     * @param {boolean} [detachFromParent=true]
     */
    deleteObject(object, detachFromParent = true) {
        if (object) {
            if (object.children && object.children.length > 0) {
                // Recursively delete children backwards to avoid array copy and index shifts
                // Pass false to detachFromParent to avoid O(N^2) removal operations
                for (let i = object.children.length - 1; i >= 0; i--) {
                    const child = object.children[i];
                    this.deleteObject(child, false);
                    if (child) child.parent = null;
                }
                object.children.length = 0;
            }

            // Dispose of geometry
            // @ts-ignore
            if (object.geometry) {
                // @ts-ignore
                object.geometry.dispose();
            }

            // Dispose of material(s)
            // @ts-ignore
            if (object.material) {
                // @ts-ignore
                const materialOrArray = object.material;
                if (Array.isArray(materialOrArray)) {
                    for (let i = 0; i < materialOrArray.length; i++) {
                        this._disposeMaterial(materialOrArray[i]);
                    }
                } else {
                    this._disposeMaterial(materialOrArray);
                }
            }

            // Remove from physics if manager exists
            if (this.physicsManager && this.physicsManager.removeObject) {
                this.physicsManager.removeObject(object);
            }

            // Remove the object from its parent (scene or group)
            if (detachFromParent) {
                if (object.parent) {
                    object.parent.remove(object);
                } else {
                    this.scene.remove(object);
                }
            }
            this.eventBus.publish(Events.OBJECT_REMOVED, object);
        }
    }

    /**
     * @param {any} material
     * @private
     */
    _disposeMaterial(material) {
        if (!material) return;

        // Dispose textures
        for (let i = 0; i < TEXTURE_KEYS.length; i++) {
            const key = TEXTURE_KEYS[i];
            if (material[key] && material[key].dispose) {
                material[key].dispose();
            }
        }
        material.dispose();
    }
}
