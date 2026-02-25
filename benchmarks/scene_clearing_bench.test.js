jest.unmock('three'); // Use real Three.js for accurate benchmarking

import * as THREE from 'three';
import { SceneStorage } from '../src/frontend/SceneStorage.js';
import { JSDOM } from 'jsdom';
import JSZip from 'jszip';

jest.mock('jszip');

// Setup JSDOM for window/document
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true
});
global.window = dom.window;
global.document = dom.window.document;

if (typeof URL.createObjectURL === 'undefined') {
    Object.defineProperty(URL, 'createObjectURL', { value: jest.fn() });
    Object.defineProperty(URL, 'revokeObjectURL', { value: jest.fn() });
}

// Mock Worker
class MockWorker {
    constructor() {
        this.onmessage = null;
    }
    addEventListener(type, listener) {
        if (type === 'message') this.onmessage = listener;
    }
    removeEventListener() {}
    postMessage(msg) {
        // Immediately reply to deserialize
        if (msg.type === 'deserialize') {
             if (this.onmessage) {
                 this.onmessage({ data: { type: 'deserialize_complete', data: { metadata: { version: 4.5, type: 'Object', generator: 'Object3D.toJSON' }, geometries: [], materials: [], object: { uuid: 'scene-uuid', type: 'Scene', layers: 1, matrix: [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1], children: [] } } } });
             }
        }
    }
    terminate() {}
}
global.Worker = MockWorker;

// Mock JSZip
JSZip.mockImplementation(() => ({
    loadAsync: () => {
        return Promise.resolve({
            file: (name) => {
                if (name === 'scene.json') return { async: () => Promise.resolve('{}') };
                if (name === 'buffers.json') return { async: () => Promise.resolve('[]') }; // No buffers
                return null;
            }
        });
    }
}));

// Mock EventBus
const mockEventBus = { publish: jest.fn(), subscribe: jest.fn() };

// Mock logger
jest.mock('../src/frontend/logger.js', () => ({
    __esModule: true,
    default: { error: jest.fn(), info: jest.fn() }
}));


describe('Scene Clearing Performance', () => {
    let scene;
    let sceneStorage;

    beforeEach(() => {
        scene = new THREE.Scene();
        sceneStorage = new SceneStorage(scene, mockEventBus);
    });

    const runBenchmark = async (count) => {
        // Populate scene
        for (let i = 0; i < count; i++) {
            const geom = new THREE.BoxGeometry();
            const mat = new THREE.MeshBasicMaterial();
            const mesh = new THREE.Mesh(geom, mat);
            scene.add(mesh);
        }

        const start = performance.now();
        await sceneStorage.loadScene(new Blob([''])); // Trigger clearing
        const end = performance.now();
        return end - start;
    };

    test('Benchmark: 1000 objects', async () => {
        const time = await runBenchmark(1000);
        console.log(`[BENCHMARK] Clearing 1000 objects: ${time.toFixed(2)}ms`);
    });

    test('Benchmark: 5000 objects', async () => {
        const time = await runBenchmark(5000);
        console.log(`[BENCHMARK] Clearing 5000 objects: ${time.toFixed(2)}ms`);
    });

    test('Benchmark: 10000 objects', async () => {
        const time = await runBenchmark(10000);
        console.log(`[BENCHMARK] Clearing 10000 objects: ${time.toFixed(2)}ms`);
    });
});
