import * as THREE from 'three';
import log from './logger.js';

export class SceneStorage {
  /**
   * @param {THREE.Scene} scene
   * @param {any} eventBus
   */
  constructor(scene, eventBus) {
    this.eventBus = eventBus;
    this.scene = scene;
    this.worker = new Worker('./worker.js');
    this.worker.onmessage = this.handleWorkerMessage.bind(this);
  }

  /**
   * Handles messages from the Web Worker.
   * @param {MessageEvent} event
   */
  handleWorkerMessage(event) {
    // Local listeners in saveScene/loadScene handle specific responses.
    // This global handler catches unhandled errors or specific broadcast messages.
    const { type, message, error } = event.data;
    if (type === 'error') {
        // We log here only if it might not be caught by local listeners (generic errors)
        // But local listeners also listen for 'error'.
        // To avoid duplicate logging, we might check if it was handled?
        // For now, minimal logging.
        // log.error('Worker global error:', message, error);
    }
  }

  /**
   * Saves the scene to a .nodist3d zip file.
   */
  async saveScene() {
    // @ts-ignore
    const JSZip = window.JSZip;
    if (!JSZip) {
      throw new Error('JSZip not loaded');
    }

    const zip = new JSZip();

    // Optimization: avoid standard Array conversion for TypedArrays
    const originalToJSON = THREE.BufferAttribute.prototype.toJSON;
    THREE.BufferAttribute.prototype.toJSON = function() {
      return {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: this.array, // TypedArray will be efficiently cloned/replaced in worker
        normalized: this.normalized
      };
    };

    let sceneData;
    try {
      sceneData = this.scene.toJSON();
    } finally {
      THREE.BufferAttribute.prototype.toJSON = originalToJSON;
    }

    // Serialize the scene using the worker
    let serializationResult;
    try {
        serializationResult = await new Promise((resolve, reject) => {
            const handleMessage = (event) => {
                if (event.data.type === 'serialize_complete') {
                    this.worker.removeEventListener('message', handleMessage);
                    resolve(event.data);
                } else if (event.data.type === 'error') {
                    this.worker.removeEventListener('message', handleMessage);
                    reject(new Error(event.data.message + ': ' + event.data.error));
                }
            };

            this.worker.addEventListener('message', handleMessage);

            // Send data to worker. We rely on structured cloning to copy buffers efficiently.
            this.worker.postMessage({ type: 'serialize', data: sceneData });
        });
    } catch (error) {
        log.error("Worker serialization failed:", error);
        throw error;
    }

    const { data: sceneJson, buffers } = serializationResult;

    // Process buffers to handle shared buffers and avoid duplication in ZIP
    // Identify unique buffers
    const uniqueBuffers = [...new Set(buffers)];
    const bufferMap = new Map(uniqueBuffers.map((b, i) => [b, i]));

    // Create a mapping array: original index -> unique buffer index
    const bufferMapping = buffers.map(b => bufferMap.get(b));

    // Add files to ZIP
    zip.file('scene.json', sceneJson);
    zip.file('buffers.json', JSON.stringify(bufferMapping));

    // Add unique binary buffers to ZIP
    uniqueBuffers.forEach((buffer, index) => {
        zip.file(`buffers/bin_${index}.bin`, buffer);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scene.nodist3d';
    a.click();
    URL.revokeObjectURL(url);
    this.eventBus.publish('scene_saved', { name: 'scene.nodist3d', size: content.size });
  }

  /**
   * Loads a scene from a .nodist3d zip file.
   * @param {File} file
   */
  async loadScene(file) {
    try {
      // @ts-ignore
      const JSZip = window.JSZip;
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);

      const sceneJsonFile = loadedZip.file('scene.json');
      if (!sceneJsonFile) {
        throw new Error('scene.json not found in the zip file.');
      }
      const sceneJson = await sceneJsonFile.async('string');

      // Check for buffers
      let buffers = [];
      const mappingFile = loadedZip.file('buffers.json');
      if (mappingFile) {
          const mappingJson = await mappingFile.async('string');
          const bufferMapping = JSON.parse(mappingJson);

          // Load all unique binary files
          // We can infer count from mapping max index or just check files
          const uniqueBufferCount = Math.max(...bufferMapping, -1) + 1;
          const uniqueBuffers = await Promise.all(
              Array.from({ length: uniqueBufferCount }).map(async (_, i) => {
                  const binFile = loadedZip.file(`buffers/bin_${i}.bin`);
                  if (!binFile) throw new Error(`Buffer file bin_${i}.bin missing`);
                  return binFile.async('arraybuffer');
              })
          );

          // Reconstruct the buffers array for the worker
          buffers = bufferMapping.map(index => uniqueBuffers[index]);
      }

      // Clear existing objects from the scene.
      // We iterate backwards and use pop() to achieve O(N) complexity,
      // avoiding the O(N^2) overhead of repeated remove(child[0]) calls.
      while (this.scene.children.length > 0) {
        const object = this.scene.children.pop();

        // Mimic scene.remove(object) logic without the O(N) indexOf search
        if (object.parent === this.scene) {
          object.parent = null;
          object.dispatchEvent({ type: 'removed' });
          this.scene.dispatchEvent({ type: 'childremoved', child: object });
        }

        // @ts-ignore
        if (object.geometry) object.geometry.dispose();
        // @ts-ignore
        if (object.material) {
          // @ts-ignore
          if (Array.isArray(object.material)) {
            // @ts-ignore
            object.material.forEach((material) => material.dispose());
          } else {
            // @ts-ignore
            object.material.dispose();
          }
        }
      }

      // Deserialize the scene using the worker
      return new Promise((resolve, reject) => {
        const handleMessage = (event) => {
             if (event.data.type === 'deserialize_complete') {
                 this.worker.removeEventListener('message', handleMessage);

                 const loadedScene = event.data.data;
                 const loader = new THREE.ObjectLoader();
                 // Parse the reconstructed object into Three.js objects
                 const scene = loader.parse(loadedScene);

                 // Add loaded objects back to the scene
                 while (scene.children.length > 0) {
                     this.scene.add(scene.children[0]);
                 }
                 this.eventBus.publish('scene_loaded');
                 resolve(scene);

             } else if (event.data.type === 'error') {
                 this.worker.removeEventListener('message', handleMessage);
                 reject(new Error(event.data.message + ': ' + event.data.error));
             }
        };

        this.worker.addEventListener('message', handleMessage);

        // Transfer buffers to worker for reconstruction
        // Note: buffers array contains ArrayBuffers. We transfer unique ones.
        const uniqueTransferables = [...new Set(buffers)];

        this.worker.postMessage({
            type: 'deserialize',
            data: sceneJson,
            buffers: buffers
        }, uniqueTransferables);
      });

    } catch (error) {
      log.error('Error loading scene:', error);
      return Promise.reject(error);
    }
  }
}
