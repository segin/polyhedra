
jest.unmock('three');
import * as THREE from 'three';

describe('Serialization Optimization Benchmark', () => {
    const createLargeScene = (boxCount) => {
        const scene = new THREE.Scene();
        for (let i = 0; i < boxCount; i++) {
            // High segments to create large TypedArrays
            const geom = new THREE.BoxGeometry(1, 1, 1, 20, 20, 20);
            const mat = new THREE.MeshBasicMaterial();
            const mesh = new THREE.Mesh(geom, mat);
            scene.add(mesh);
        }
        return scene;
    };

    const serializeNaive = (scene) => {
        const originalToJSON = THREE.BufferAttribute.prototype.toJSON;
        THREE.BufferAttribute.prototype.toJSON = function() {
            return {
                itemSize: this.itemSize,
                type: this.array.constructor.name,
                array: Array.from(this.array),
                normalized: this.normalized
            };
        };
        try {
            return scene.toJSON();
        } finally {
            THREE.BufferAttribute.prototype.toJSON = originalToJSON;
        }
    };

    const serializeOptimized = (scene) => {
        const originalToJSON = THREE.BufferAttribute.prototype.toJSON;
        THREE.BufferAttribute.prototype.toJSON = function() {
            return {
                itemSize: this.itemSize,
                type: this.array.constructor.name,
                array: this.array,
                normalized: this.normalized
            };
        };
        try {
            return scene.toJSON();
        } finally {
            THREE.BufferAttribute.prototype.toJSON = originalToJSON;
        }
    };

    const workerSerialize = (data) => {
      const buffers = [];
      const json = JSON.stringify(data, (key, value) => {
        if (value && ArrayBuffer.isView(value) && !(value instanceof DataView)) {
            buffers.push(value.buffer);
            return {
                __type: 'TypedArray',
                id: buffers.length - 1,
                ctor: value.constructor.name,
                byteOffset: value.byteOffset,
                length: value.length
            };
        }
        return value;
      });
      return { json, buffers };
    };

    test('Benchmark: Full serialization pipeline', () => {
        const boxCount = 50;
        console.log(`[BENCHMARK] Creating scene with ${boxCount} high-poly boxes...`);
        const scene = createLargeScene(boxCount);

        console.log('[BENCHMARK] Starting Naive Pipeline...');
        const startNaive = performance.now();
        const sceneDataNaive = serializeNaive(scene);
        const workerResultNaive = workerSerialize(sceneDataNaive);
        const endNaive = performance.now();
        const totalNaive = endNaive - startNaive;
        console.log(`[BENCHMARK] Naive Total: ${totalNaive.toFixed(2)}ms`);
        console.log(`[BENCHMARK] Naive JSON size: ${(workerResultNaive.json.length / 1024 / 1024).toFixed(2)} MB`);
        console.log(`[BENCHMARK] Naive Buffers count: ${workerResultNaive.buffers.length}`);

        console.log('[BENCHMARK] Starting Optimized Pipeline...');
        const startOptimized = performance.now();
        const sceneDataOptimized = serializeOptimized(scene);
        const workerResultOptimized = workerSerialize(sceneDataOptimized);
        const endOptimized = performance.now();
        const totalOptimized = endOptimized - startOptimized;
        console.log(`[BENCHMARK] Optimized Total: ${totalOptimized.toFixed(2)}ms`);
        console.log(`[BENCHMARK] Optimized JSON size: ${(workerResultOptimized.json.length / 1024 / 1024).toFixed(2)} MB`);
        console.log(`[BENCHMARK] Optimized Buffers count: ${workerResultOptimized.buffers.length}`);

        expect(totalOptimized).toBeLessThan(totalNaive);
        expect(workerResultOptimized.json.length).toBeLessThan(workerResultNaive.json.length);
        expect(workerResultOptimized.buffers.length).toBeGreaterThan(0);
        expect(workerResultNaive.buffers.length).toBe(0);
    });
});
