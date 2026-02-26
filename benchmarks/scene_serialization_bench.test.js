
import { jest } from '@jest/globals';
import * as THREE from 'three';
import { SceneStorage } from '../src/frontend/SceneStorage.js';
import { JSDOM } from 'jsdom';

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true
});
global.window = dom.window;
global.document = dom.window.document;
global.URL = {
    createObjectURL: jest.fn(),
    revokeObjectURL: jest.fn()
};

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
        if (msg.type === 'serialize') {
            // Simulate worker processing delay if needed, but for now immediate
            setTimeout(() => {
                 if (this.onmessage) {
                     this.onmessage({
                         data: {
                             type: 'serialize_complete',
                             data: '{}',
                             buffers: []
                         }
                     });
                 }
            }, 0);
        }
    }
    terminate() {}
}
global.Worker = MockWorker;

// Mock JSZip
global.JSZip = class JSZip {
    constructor() {
        this.files = {};
    }
    file(name, content) {
        this.files[name] = content;
    }
    generateAsync() {
        return Promise.resolve({ size: 100 });
    }
};
global.window.JSZip = global.JSZip;

// Mock EventBus
const mockEventBus = { publish: jest.fn(), subscribe: jest.fn() };

// Mock logger
jest.mock('../src/frontend/logger.js', () => ({
    __esModule: true,
    default: { error: jest.fn(), info: jest.fn() }
}));

describe('Scene Serialization Performance', () => {
    let scene;
    let sceneStorage;

    beforeEach(() => {
        scene = new THREE.Scene();
        sceneStorage = new SceneStorage(scene, mockEventBus);
    });

    const runBenchmark = async (segments) => {
        // Create a heavy geometry
        const geom = new THREE.SphereGeometry(1, segments, segments);
        const mat = new THREE.MeshBasicMaterial();
        const mesh = new THREE.Mesh(geom, mat);
        scene.add(mesh);

        const start = performance.now();
        await sceneStorage.saveScene();
        const end = performance.now();

        return end - start;
    };

    test('Benchmark: Sphere(100, 100) ~10k vertices', async () => {
        const time = await runBenchmark(100);
        console.log(`[BENCHMARK] Serialization (100 segments): ${time.toFixed(2)}ms`);
    });

    test('Benchmark: Sphere(300, 300) ~90k vertices', async () => {
        const time = await runBenchmark(300);
        console.log(`[BENCHMARK] Serialization (300 segments): ${time.toFixed(2)}ms`);
    });
});
