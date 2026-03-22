// Standalone mock of THREE and other requirements to test SceneStorage logic
const THREE = {
    Scene: class {
        constructor() {
            this.children = [];
        }
    },
    ObjectLoader: class {
        parse() {
            return { children: [] };
        }
    }
};

// Setup Mock Worker
class MockWorker {
    constructor(url) {
        this.onmessage = null;
        this.listeners = { message: [] };
    }
    addEventListener(type, listener) {
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type].push(listener);
    }
    removeEventListener(type, listener) {
        if (!this.listeners[type]) return;
        this.listeners[type] = this.listeners[type].filter(l => l !== listener);
    }
    postMessage(message) {
        if (message.type === 'serialize') {
            setTimeout(() => {
                const event = { data: { type: 'serialize_complete', data: '{}', buffers: [] } };
                if (this.onmessage) this.onmessage(event);
                if (this.listeners.message) this.listeners.message.forEach(l => l(event));
            }, 0);
        } else if (message.type === 'deserialize') {
            setTimeout(() => {
                const event = { data: { type: 'deserialize_complete', data: {} } };
                if (this.onmessage) this.onmessage(event);
                if (this.listeners.message) this.listeners.message.forEach(l => l(event));
            }, 0);
        }
    }
}
global.Worker = MockWorker;

// Mock JSZip
const mockJSZipInstance = {
    file: (name, content) => {
        if (content) return;
        if (name === 'scene.json') {
            return { async: () => Promise.resolve('{}') };
        }
        if (name === 'buffers.json') {
            return { async: () => Promise.resolve('[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]') };
        }
        if (name.startsWith('buffers/bin_')) {
            return { async: () => Promise.resolve(new ArrayBuffer(8)) };
        }
        return null;
    },
    generateAsync: () => Promise.resolve(new Uint8Array([])),
    loadAsync: (file) => Promise.resolve({
        file: (name) => mockJSZipInstance.file(name)
    })
};
global.window = {
    JSZip: function() { return mockJSZipInstance; }
};
global.URL = {
    createObjectURL: () => 'blob:mock',
    revokeObjectURL: () => {}
};
global.document = {
    createElement: () => ({ click: () => {} })
};

// Mock dependencies of SceneStorage.js
global.THREE = THREE;
const safeJSONParse = (str) => JSON.parse(str);
const log = { error: console.error };

// Minimal SceneStorage class with ONLY the loadScene logic to test chunking
class SceneStorageMock {
  constructor(scene, eventBus) {
    this.eventBus = eventBus;
    this.scene = scene;
    this.worker = new MockWorker();
  }

  async loadScene(file) {
      const JSZip = global.window.JSZip;
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);

      const sceneJsonFile = loadedZip.file('scene.json');
      const sceneJson = await sceneJsonFile.async('string');

      let buffers = [];
      const mappingFile = loadedZip.file('buffers.json');
      if (mappingFile) {
          const mappingJson = await mappingFile.async('string');
          const bufferMapping = safeJSONParse(mappingJson);

          const uniqueBufferCount = Math.max(...bufferMapping, -1) + 1;
          const uniqueBuffers = [];
          const concurrencyLimit = 10;
          console.log(`Loading ${uniqueBufferCount} buffers with concurrency limit of ${concurrencyLimit}...`);

          for (let i = 0; i < uniqueBufferCount; i += concurrencyLimit) {
              console.log(`Processing chunk starting at index ${i}...`);
              const chunk = Array.from({ length: Math.min(concurrencyLimit, uniqueBufferCount - i) }).map(async (_, j) => {
                  const index = i + j;
                  const binFile = loadedZip.file(`buffers/bin_${index}.bin`);
                  if (!binFile) throw new Error(`Buffer file bin_${index}.bin missing`);
                  return binFile.async('arraybuffer');
              });
              uniqueBuffers.push(...(await Promise.all(chunk)));
          }
          buffers = bufferMapping.map(index => uniqueBuffers[index]);
      }
      this.eventBus.publish('scene_loaded');
      return buffers;
  }
}

async function runFunctionalTest() {
    console.log('--- SceneStorage Chunked Loading Functional Test ---');
    const scene = new THREE.Scene();
    const mockEventBus = { publish: (type) => console.log('Event published:', type), subscribe: () => {} };
    const sceneStorage = new SceneStorageMock(scene, mockEventBus);

    try {
        const mockFile = new Uint8Array([0, 1, 2, 3]);
        const buffers = await sceneStorage.loadScene(mockFile);
        console.log(`SUCCESS: Loaded ${buffers.length} buffers successfully.`);
        if (buffers.length === 12) {
            console.log('Verified: Correct number of buffers reconstructed.');
        } else {
            throw new Error(`Expected 12 buffers, got ${buffers.length}`);
        }
    } catch (error) {
        console.error('FAILURE: Functional test failed with error:', error);
        process.exit(1);
    }
}

runFunctionalTest();
