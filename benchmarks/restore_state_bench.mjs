
import { performance } from 'node:perf_hooks';

// Mocking necessary parts
class MockObjectManager {
    async addPrimitive(type, params) {
        return {
            uuid: Math.random().toString(36).substring(2, 9),
            type: type,
            geometryParams: params,
            position: { copy: () => {} },
            rotation: { copy: () => {} },
            scale: { copy: () => {} },
            userData: {}
        };
    }
    deleteObject(obj) {}
}

class MockApp {
    constructor() {
        this.objectManager = new MockObjectManager();
        this.objects = [];
        this.scene = { remove: () => {} };
    }

    _applyStateToMesh(mesh, data) {
        mesh.uuid = data.uuid;
    }

    async restoreState_Baseline(state) {
        const newObjects = [];
        const promises = [];

        for (const data of state.objects) {
            promises.push((async () => {
                const mesh = await this.objectManager.addPrimitive(data.type, data.geometryParams);
                if (mesh) {
                    this._applyStateToMesh(mesh, data);
                    if (!newObjects.includes(mesh)) newObjects.push(mesh);
                }
                return mesh;
            })());
        }

        await Promise.all(promises);
        this.objects = newObjects;
    }

    async restoreState_Optimized(state) {
        const newObjects = [];
        const newObjectsSet = new Set();
        const promises = [];

        for (const data of state.objects) {
            promises.push((async () => {
                const mesh = await this.objectManager.addPrimitive(data.type, data.geometryParams);
                if (mesh) {
                    this._applyStateToMesh(mesh, data);
                    if (!newObjectsSet.has(mesh)) {
                        newObjectsSet.add(mesh);
                        newObjects.push(mesh);
                    }
                }
                return mesh;
            })());
        }

        await Promise.all(promises);
        this.objects = newObjects;
    }
}

async function runBenchmark() {
    const count = 20000;
    const state = {
        objects: Array.from({ length: count }, (_, i) => ({
            uuid: `uuid-${i}`,
            type: 'Box',
            geometryParams: {}
        }))
    };

    console.log(`Running benchmark with ${count} objects...`);

    const appBaseline = new MockApp();
    const startBaseline = performance.now();
    await appBaseline.restoreState_Baseline(state);
    const endBaseline = performance.now();
    console.log(`Baseline: ${(endBaseline - startBaseline).toFixed(3)} ms`);

    const appOptimized = new MockApp();
    const startOptimized = performance.now();
    await appOptimized.restoreState_Optimized(state);
    const endOptimized = performance.now();
    console.log(`Optimized: ${(endOptimized - startOptimized).toFixed(3)} ms`);
}

runBenchmark();
