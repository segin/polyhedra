import * as THREE from "three";
import { Events } from "./constants.js";
import log from "./logger.js";

export class CSGManager {
  constructor(scene, eventBus) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.worker = new Worker("/csg-worker.bundle.js");
    this.worker.onmessage = this.handleWorkerMessage.bind(this);
    this.callbacks = new Map();
    this.nextId = 0;
  }

  handleWorkerMessage(event) {
    const { type, id, data, message } = event.data;
    if (type === "result") {
      const callback = this.callbacks.get(id);
      if (callback) {
        callback.resolve(data);
        this.callbacks.delete(id);
      }
    } else if (type === "error") {
      const callback = this.callbacks.get(id);
      if (callback) {
        callback.reject(new Error(message));
        this.callbacks.delete(id);
      }
      log.error("CSG Worker error:", message);
    }
  }

  performCSG(objectA, objectB, operation) {
    // Hide objects immediately to prevent rendering detached buffers
    objectA.visible = false;
    objectB.visible = false;

    // Serialize objects (destructive to geometry buffers due to transfer)
    const meshAData = this.serializeMesh(objectA);
    const meshBData = this.serializeMesh(objectB);

    // Prepare transfer list (deduplicate buffers)
    const transferList = Array.from(
      new Set([...this.getBuffers(meshAData), ...this.getBuffers(meshBData)]),
    );

    const id = this.nextId++;

    return new Promise((resolve, reject) => {
      this.callbacks.set(id, {
        resolve: (data) => {
          try {
            // Reconstruct result mesh
            const geometry = new THREE.BufferGeometry();

            if (data.attributes.position) {
              geometry.setAttribute(
                "position",
                new THREE.Float32BufferAttribute(data.attributes.position, 3),
              );
            }
            if (data.attributes.normal) {
              geometry.setAttribute(
                "normal",
                new THREE.Float32BufferAttribute(data.attributes.normal, 3),
              );
            }
            if (data.attributes.uv) {
              geometry.setAttribute(
                "uv",
                new THREE.Float32BufferAttribute(data.attributes.uv, 2),
              );
            }

            if (data.index) {
              geometry.setIndex(new THREE.BufferAttribute(data.index, 1));
            }

            // Use original material
            const material = objectA.material; // Reuse material
            const resultMesh = new THREE.Mesh(geometry, material);

            // Update scene
            this.scene.remove(objectA);
            this.scene.remove(objectB);
            this.scene.add(resultMesh);

            this.eventBus.publish(Events.OBJECT_ADDED, resultMesh);
            this.eventBus.publish(Events.OBJECT_REMOVED, objectA);
            this.eventBus.publish(Events.OBJECT_REMOVED, objectB);

            resolve(resultMesh);
          } catch (e) {
            reject(e);
          }
        },
        reject,
      });

      this.worker.postMessage(
        {
          id,
          meshA: meshAData,
          meshB: meshBData,
          operation,
        },
        transferList,
      );
    });
  }

  serializeMesh(mesh) {
    const geometry = mesh.geometry;
    const attributes = {};
    const transferBuffers = [];

    // OPTIMIZATION: Transfer the original TypedArray buffers to avoid copying.
    // This detaches the buffers from the original geometry, making the mesh invalid on the main thread.
    // The mesh should be hidden or removed immediately.

    if (geometry.attributes.position) {
      const array = geometry.attributes.position.array;
      attributes.position = array;
      transferBuffers.push(attributes.position.buffer);
    }
    if (geometry.attributes.normal) {
      const array = geometry.attributes.normal.array;
      attributes.normal = array;
      transferBuffers.push(attributes.normal.buffer);
    }
    if (geometry.attributes.uv) {
      const array = geometry.attributes.uv.array;
      attributes.uv = array;
      transferBuffers.push(attributes.uv.buffer);
    }

    let index = null;
    if (geometry.index) {
      const array = geometry.index.array;
      index = array;
      transferBuffers.push(index.buffer);
    }

    // Matrix
    const matrix = mesh.matrix.toArray();

    // Use specific property to avoid sending transferBuffers in the message payload itself if we filter it
    // But structuredClone will clone the object.
    // We should return the data object separate from the buffers list if possible, or just ignore the extra prop.
    // The structured clone algorithm ignores properties not in the object? No.
    // We can just construct the object cleanly.

    return {
      attributes,
      index,
      matrix,
      _transferBuffers: transferBuffers, // internal use
    };
  }

  getBuffers(data) {
    return data._transferBuffers || [];
  }
}
