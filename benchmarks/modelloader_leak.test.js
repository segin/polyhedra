/* eslint-env jest */
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ModelLoader } from '../src/frontend/ModelLoader.js';

// Mock Three.js - keep this as we need Box3 and Vector3 for ModelLoader logic
jest.mock('three', () => ({
  Box3: class {
    setFromObject() { return this; }
    getSize(v) { v.set(1, 1, 1); return v; }
  },
  Vector3: class { set() { return this; } },
  MeshStandardMaterial: class {},
  MeshPhysicalMaterial: class {},
}));

describe('ModelLoader Resource Management Benchmark', () => {
  let modelLoader;
  let revokeSpy;

  beforeEach(() => {
    // Use existing global mocks from jest.setup.cjs if available
    if (!global.URL.revokeObjectURL) {
        global.URL.revokeObjectURL = jest.fn();
    }
    revokeSpy = global.URL.revokeObjectURL;
    revokeSpy.mockClear();

    global.URL.createObjectURL = jest.fn(file => `blob:${file.name}`);

    // Mock scene
    const mockScene = { add: jest.fn() };
    modelLoader = new ModelLoader(mockScene);

    // Spy on loaders to inject errors
    if (OBJLoader && OBJLoader.prototype) {
        jest.spyOn(OBJLoader.prototype, 'load').mockImplementation((url, onLoad, onProgress, onError) => {
          if (url.includes('error')) {
            setTimeout(() => onError(new Error('Simulated Load Error')), 0);
          } else {
            setTimeout(() => onLoad({ traverse: () => {}, scale: { setScalar: () => {} }, position: {} }), 0);
          }
        });
    }

    if (GLTFLoader && GLTFLoader.prototype) {
        jest.spyOn(GLTFLoader.prototype, 'load').mockImplementation((url, onLoad, onProgress, onError) => {
            if (url.includes('error')) {
                setTimeout(() => onError(new Error('Simulated Load Error')), 0);
            } else {
                 setTimeout(() => onLoad({ scene: { traverse: () => {}, scale: { setScalar: () => {} }, position: {} } }), 0);
            }
        });
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should revoke object URL on successful load (BASELINE check)', async () => {
    const file = { name: 'test.obj' };
    await modelLoader.loadModel(file);
    expect(revokeSpy).toHaveBeenCalledWith('blob:test.obj');
  });

  test('should revoke object URL on load error (LEAK check)', async () => {
    const file = { name: 'error.obj' };

    try {
      await modelLoader.loadModel(file);
    } catch (_e) {
      // Expected error
    }

    // This should FAIL if leak exists
    expect(revokeSpy).toHaveBeenCalledWith('blob:error.obj');
  });

  test('should revoke object URL on unsupported extension (LEAK check)', async () => {
    const file = { name: 'test.txt' }; // Unsupported extension

    try {
        await modelLoader.loadModel(file);
    } catch (_e) {
        // Expected error
    }

    // This should FAIL if leak exists
    expect(revokeSpy).toHaveBeenCalledWith('blob:test.txt');
  });
});
