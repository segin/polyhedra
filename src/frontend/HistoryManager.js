import * as THREE from 'three';
import { Events } from './constants.js';

/**
 * Manages the application's undo/redo history.
 */
export class HistoryManager {
  /**
   * @param {import('./utils/ServiceContainer.js').ServiceContainer} container
   */
  constructor(container) {
    this.container = container;
    this.eventBus = container && typeof container.get === 'function' ? container.get('EventBus') : null;
    this.stateManager = container && typeof container.get === 'function' ? container.get('StateManager') : null;

    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = 50;

    this._resolveDependencies();
  }

  _resolveDependencies() {
    if (!this.container || typeof this.container.get !== 'function') return;
    try {
        this.scene = this.container.get('Scene');
        this.objectManager = this.container.get('ObjectManager');
    } catch (_e) {
        // Dependencies might be registered later
    }
  }

  _ensureDependencies() {
    if (!this.scene) this._resolveDependencies();
  }

  saveState(objects, selectedObject, description = 'Action') {
    // Structural sharing implementation
    const lastState = this.history[this.historyIndex];
    const lastStateMap = new Map();
    if (lastState && lastState.objects) {
        lastState.objects.forEach(obj => lastStateMap.set(obj.uuid, obj));
    }

    const stateObjects = objects.map(obj => {
        const lastObjState = lastStateMap.get(obj.uuid);

        if (lastObjState && this._areObjectsEqual(lastObjState, obj)) {
            return lastObjState;
        }

        return {
            uuid: obj.uuid,
            name: obj.name,
            visible: obj.visible !== undefined ? obj.visible : true,
            type: (obj.userData && obj.userData.primitiveType) ? obj.userData.primitiveType : (obj.geometry ? obj.geometry.type : obj.type),
            position: obj.position.clone(),
            rotation: obj.rotation.clone(),
            scale: obj.scale.clone(),
            material: obj.material ? {
                // @ts-ignore
                color: obj.material.color ? obj.material.color.clone() : new THREE.Color(0xffffff),
                // @ts-ignore
                emissive: obj.material.emissive ? obj.material.emissive.clone() : new THREE.Color(0x000000)
            } : null,
            geometryParams: (obj.userData && obj.userData.primitiveOptions) ? obj.userData.primitiveOptions : (obj.userData ? obj.userData.geometryParams : null)
        };
    });

    const state = {
      description,
      timestamp: Date.now(),
      objects: stateObjects,
      selectedUuid: selectedObject ? selectedObject.uuid : null
    };

    if (this.historyIndex < this.history.length - 1) {
      this.history.splice(this.historyIndex + 1);
    }

    this.history.push(state);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
    
    if (this.eventBus) {
        this.eventBus.publish(Events.HISTORY_CHANGED, { 
            index: this.historyIndex, 
            length: this.history.length,
            description 
        });
    }
  }

  async undo(callbacks) {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      await this.restoreState(this.history[this.historyIndex], callbacks);
    }
  }

  async redo(callbacks) {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      await this.restoreState(this.history[this.historyIndex], callbacks);
    }
  }

  async restoreState(state, callbacks) {
    this._ensureDependencies();
    const currentObjects = callbacks.getObjects();
    const currentObjectsMap = new Map();
    currentObjects.forEach(obj => currentObjectsMap.set(obj.uuid, obj));

    const newStateUuids = new Set();
    const newObjects = [];
    const promises = [];

    for (const data of state.objects) {
        newStateUuids.add(data.uuid);
        const existingObj = currentObjectsMap.get(data.uuid);

        if (existingObj) {
            const currentType = existingObj.userData && existingObj.userData.primitiveType
                ? existingObj.userData.primitiveType
                : (existingObj.geometry ? existingObj.geometry.type : existingObj.type);

            const currentParams = (existingObj.userData && existingObj.userData.primitiveOptions)
                ? existingObj.userData.primitiveOptions
                : (existingObj.userData ? existingObj.userData.geometryParams : null);

            const typeChanged = data.type !== currentType;
            const paramsChanged = JSON.stringify(data.geometryParams) !== JSON.stringify(currentParams);

            if (typeChanged || paramsChanged) {
                 this.scene.remove(existingObj);
                 this.objectManager.deleteObject(existingObj);

                 promises.push((async () => {
                     const mesh = await this.objectManager.addPrimitive(data.type, data.geometryParams);
                     if (mesh) {
                        this._applyStateToMesh(mesh, data);
                        if (!newObjects.includes(mesh)) newObjects.push(mesh);
                     }
                     return mesh;
                 })());
            } else {
                this._applyStateToMesh(existingObj, data);
                newObjects.push(existingObj);
            }
        } else {
            promises.push((async () => {
                const mesh = await this.objectManager.addPrimitive(data.type, data.geometryParams);
                if (mesh) {
                    this._applyStateToMesh(mesh, data);
                    if (!newObjects.includes(mesh)) newObjects.push(mesh);
                }
                return mesh;
            })());
        }
    }

    currentObjects.forEach(obj => {
        if (!newStateUuids.has(obj.uuid)) {
            this.objectManager.deleteObject(obj);
        }
    });

    await Promise.all(promises);

    const objMap = new Map();
    newObjects.forEach(o => objMap.set(o.uuid, o));
    const sortedObjects = state.objects.map(d => objMap.get(d.uuid)).filter(o => o);

    callbacks.setObjects(sortedObjects);

    if (state.selectedUuid) {
      const selected = sortedObjects.find(o => o.uuid === state.selectedUuid);
      if (selected) callbacks.selectObject(selected);
    } else {
      callbacks.deselectObject();
    }
    
    callbacks.updateSceneGraph();
    if (this.eventBus) {
        this.eventBus.publish(Events.HISTORY_CHANGED, { 
            index: this.historyIndex, 
            length: this.history.length,
            description: state.description
        });
    }
  }

  _areObjectsEqual(stateObj, currentObj) {
    if (!stateObj || !currentObj) return false;
    if (stateObj.uuid !== currentObj.uuid) return false;
    if (stateObj.name !== currentObj.name) return false;
    if (stateObj.visible !== currentObj.visible) return false;

    const currentType = currentObj.userData && currentObj.userData.primitiveType
        ? currentObj.userData.primitiveType
        : (currentObj.geometry ? currentObj.geometry.type : currentObj.type);

    if (stateObj.type !== currentType) return false;

    if (!stateObj.position.equals(currentObj.position)) return false;
    if (!stateObj.rotation.equals(currentObj.rotation)) return false;
    if (!stateObj.scale.equals(currentObj.scale)) return false;

    // @ts-ignore
    if (stateObj.material && currentObj.material) {
      // @ts-ignore
      if (!stateObj.material.color.equals(currentObj.material.color)) return false;
      // @ts-ignore
      if (stateObj.material.emissive && currentObj.material.emissive) {
         // @ts-ignore
         if (!stateObj.material.emissive.equals(currentObj.material.emissive)) return false;
      }
    } else if (!!stateObj.material !== !!currentObj.material) {
      return false;
    }

    const currentParams = (currentObj.userData && currentObj.userData.primitiveOptions) ? currentObj.userData.primitiveOptions : (currentObj.userData ? currentObj.userData.geometryParams : null);
    if (JSON.stringify(stateObj.geometryParams) !== JSON.stringify(currentParams)) return false;

    return true;
  }

  _applyStateToMesh(mesh, data) {
    if (!mesh) return;
    mesh.uuid = data.uuid;
    mesh.name = data.name;
    if (data.visible !== undefined) mesh.visible = data.visible;
    mesh.position.copy(data.position);
    mesh.rotation.copy(data.rotation);
    mesh.scale.copy(data.scale);
    // @ts-ignore
    if (mesh.material && data.material) {
        // @ts-ignore
        if (mesh.material.color && data.material.color) mesh.material.color.copy(data.material.color);
        // @ts-ignore
        if (mesh.material.emissive && data.material.emissive) mesh.material.emissive.copy(data.material.emissive);
    }
  }
}
