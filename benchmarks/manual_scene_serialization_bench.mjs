
import * as THREE from 'three';
import { SceneStorage } from '../src/frontend/SceneStorage.js';
import { JSDOM } from 'jsdom';
import { performance } from 'perf_hooks';

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true
});
global.window = dom.window;
global.document = dom.window.document;
global.URL = {
    createObjectURL: () => 'blob:url',
    revokeObjectURL: () => {}
};

// Mock createElement to avoid navigation issues
const originalCreateElement = global.document.createElement.bind(global.document);
global.document.createElement = (tagName) => {
    if (tagName === 'a') {
        return {
            href: '',
            download: '',
            click: () => {}, // Do nothing
            style: {},
            setAttribute: () => {}
        };
    }
    return originalCreateElement(tagName);
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
const mockEventBus = { publish: () => {}, subscribe: () => {} };

async function runBenchmark(segments) {
    const scene = new THREE.Scene();
    const sceneStorage = new SceneStorage(scene, mockEventBus);

    // Create a heavy BufferGeometry (not a SphereGeometry which uses parameters)
    const sphere = new THREE.SphereGeometry(1, segments, segments);
    const geom = new THREE.BufferGeometry();
    // Copy attributes to force BufferGeometry.toJSON to serialize them
    if (sphere.getAttribute('position')) geom.setAttribute('position', sphere.getAttribute('position'));
    if (sphere.getAttribute('normal')) geom.setAttribute('normal', sphere.getAttribute('normal'));
    if (sphere.getAttribute('uv')) geom.setAttribute('uv', sphere.getAttribute('uv'));
    // Also indices if any
    if (sphere.index) geom.setIndex(sphere.index);

    const mat = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);

    const start = performance.now();
    await sceneStorage.saveScene();
    const end = performance.now();

    return end - start;
}

async function main() {
    console.log('Running benchmark...');
    try {
        // Warmup
        await runBenchmark(10);

        console.log("Starting measurements...");

        // Medium load
        const time100 = await runBenchmark(100);
        console.log(`[BENCHMARK] Serialization (100 segments): ${time100.toFixed(2)}ms`);

        // Heavy load
        const time500 = await runBenchmark(500);
        console.log(`[BENCHMARK] Serialization (500 segments): ${time500.toFixed(2)}ms`);

        // Very heavy load
        // const time1000 = await runBenchmark(1000);
        // console.log(`[BENCHMARK] Serialization (1000 segments): ${time1000.toFixed(2)}ms`);

    } catch (e) {
        console.error(e);
    }
}

main();
