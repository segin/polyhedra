import * as THREE from 'three';
import { SceneStorage } from '../src/frontend/SceneStorage.js';
import EventBus from '../src/frontend/EventBus.js';
import { ObjectManager } from '../src/frontend/ObjectManager.js';
import './__mocks__/three-dat.gui.js';

jest.mock('three');
jest.mock('../src/frontend/logger.js', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    setLevel: jest.fn(),
    default: { error: jest.fn() }
}));

jest.mock('../src/frontend/ObjectManager.js', () => {
    const THREE = jest.requireActual('three');
    return {
        ObjectManager: jest.fn().mockImplementation(() => ({
            addPrimitive: jest.fn((type) => {
                const mockMesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
                mockMesh.name = `Mock${type}`;
                mockMesh.uuid = `mock-${type}-uuid`;
                mockMesh.position.set(0, 0, 0);
                mockMesh.rotation.set(0, 0, 0);
                mockMesh.scale.set(1, 1, 1);
                return mockMesh;
            }),
            updateMaterial: jest.fn(),
        })),
    };
});

jest.mock('../src/frontend/PrimitiveFactory.js', () => {
    return {
        PrimitiveFactory: jest.fn().mockImplementation(() => ({
            createPrimitive: jest.fn()
        }))
    };
});

// Mock the worker
class MockWorker {
    constructor() {
        this.onmessage = null;
        this.onerror = null;
        this.listeners = { message: [] };
        this.terminate = jest.fn();
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
        setTimeout(() => {
            const dispatch = (data) => {
                const event = { data };
                if (this.onmessage) this.onmessage(event);
                if (this.listeners.message) this.listeners.message.forEach(l => l(event));
            };

            if (message.type === 'serialize') {
                dispatch({
                    type: 'serialize_complete',
                    data: JSON.stringify(message.data),
                    buffers: []
                });
            } else if (message.type === 'deserialize') {
                try {
                    const buffers = message.buffers || [];
                    const parsedData = JSON.parse(message.data, (key, value) => {
                        if (value && value.__type === 'TypedArray') {
                            const buffer = buffers[value.id];
                            if (buffer) {
                                return new Float32Array(buffer); // Mock TypedArray reconstruction
                            }
                        }
                        return value;
                    });
                    dispatch({ type: 'deserialize_complete', data: parsedData });
                } catch (e) {
                    dispatch({ type: 'error', message: e.message, error: e.toString() });
                }
            }
        }, 0);
    }
}
global.Worker = MockWorker;

global.URL = {
    createObjectURL: jest.fn(() => 'blob:mockurl'),
    revokeObjectURL: jest.fn(),
};

describe('SceneStorage', () => {
    let scene;
    let sceneStorage;
    let objectManager;
    let eventBus;
    let mockJSZipInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        const MockScene = jest.requireActual('three').Scene;
        scene = new MockScene();
        eventBus = EventBus;

        mockJSZipInstance = {
            file: jest.fn((name, content) => {
                if (content) return;
                if (name === 'scene.json') {
                    return { async: jest.fn().mockResolvedValue('{}') };
                }
                if (name === 'buffers.json') {
                    return { async: jest.fn().mockResolvedValue('[]') };
                }
                if (name.startsWith('buffers/bin_')) {
                     return { async: jest.fn().mockResolvedValue(new ArrayBuffer(8)) };
                }
                return null;
            }),
            generateAsync: jest.fn().mockResolvedValue(new Blob()),
            loadAsync: jest.fn().mockResolvedValue({
                file: jest.fn((name) => {
                    if (name === 'scene.json') {
                        return { async: jest.fn().mockResolvedValue('{}') };
                    }
                    if (name === 'buffers.json') {
                        return { async: jest.fn().mockResolvedValue('[]') };
                    }
                    if (name.startsWith('buffers/bin_')) {
                        return { async: jest.fn().mockResolvedValue(new ArrayBuffer(8)) };
                    }
                    return null;
                })
            })
        };

        global.JSZip = jest.fn(() => mockJSZipInstance);
        
        // Ensure window.JSZip matches global.JSZip for the test
        if (typeof window !== 'undefined') {
            window.JSZip = global.JSZip;
        }

        sceneStorage = new SceneStorage(scene, eventBus);
        objectManager = new ObjectManager(scene, null, eventBus);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should initialize correctly', () => {
        expect(sceneStorage).toBeDefined();
        expect(sceneStorage.worker).toBeDefined();
    });

    it('should save the scene', async () => {
        const publishSpy = jest.spyOn(EventBus, 'publish');
        await sceneStorage.saveScene();
        
        expect(global.URL.createObjectURL).toHaveBeenCalled();
        expect(publishSpy).toHaveBeenCalledWith('scene_saved', expect.any(Object));
        
        // Verify JSZip usage
        const zipInstance = global.JSZip.mock.results[0].value;
        expect(zipInstance.file).toHaveBeenCalledWith('scene.json', expect.any(String));
        expect(zipInstance.file).toHaveBeenCalledWith('buffers.json', expect.any(String));
    });

    it('should load the scene', async () => {
        const mockFile = new Blob(['mock data'], { type: 'application/zip' });
        const publishSpy = jest.spyOn(EventBus, 'publish');
        
        await sceneStorage.loadScene(mockFile);
        
        expect(publishSpy).toHaveBeenCalledWith('scene_loaded');
    });
});
