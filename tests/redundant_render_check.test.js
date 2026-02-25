
import { jest } from '@jest/globals';
import * as THREE from 'three';
import { App } from '../src/frontend/main.js';

// 1. Mocks for Three.js
jest.mock('three', () => {
    return {
        Scene: jest.fn(),
        WebGLRenderer: jest.fn(),
        PerspectiveCamera: jest.fn(),
        Clock: jest.fn(),
        GridHelper: jest.fn(),
        AxesHelper: jest.fn(),
        Raycaster: jest.fn(),
        Vector2: jest.fn(),
        Vector3: jest.fn(),
        Color: jest.fn(),
        PCFSoftShadowMap: 1,
        BufferAttribute: jest.fn(),
        BufferGeometry: jest.fn(),
        Mesh: jest.fn(),
        Group: jest.fn(),
        TOUCH: {
            ROTATE: 1,
            DOLLY_PAN: 2
        },
        MOUSE: {
            LEFT: 0,
            MIDDLE: 1,
            RIGHT: 2
        }
    };
});

// 2. Mock the mapped module for examples
// This handles OrbitControls, TransformControls, etc.
jest.mock('./__mocks__/three-examples.js', () => {
    return {
        OrbitControls: jest.fn(),
        TransformControls: jest.fn(),
        TeapotGeometry: jest.fn(),
        FontLoader: jest.fn(),
        TextGeometry: jest.fn(),
        GLTFLoader: jest.fn(),
        OBJExporter: jest.fn(),
        STLExporter: jest.fn()
    };
});

// 3. Mock internal modules
jest.mock('../src/frontend/SceneStorage.js');
jest.mock('../src/frontend/utils/ServiceContainer.js');
jest.mock('../src/frontend/StateManager.js');
jest.mock('../src/frontend/EventBus.js', () => ({
    subscribe: jest.fn(),
    publish: jest.fn()
}));
jest.mock('../src/frontend/ObjectManager.js');
jest.mock('../src/frontend/SceneManager.js');
jest.mock('../src/frontend/InputManager.js');
jest.mock('../src/frontend/PhysicsManager.js', () => ({
    PhysicsManager: jest.fn(() => ({
        update: jest.fn()
    }))
}));
jest.mock('../src/frontend/PrimitiveFactory.js');
jest.mock('../src/frontend/ObjectFactory.js');
jest.mock('../src/frontend/ObjectPropertyUpdater.js');
jest.mock('../src/frontend/logger.js', () => ({
    __esModule: true,
    default: {
        log: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }
}));
jest.mock('../src/frontend/ToastManager.js');
jest.mock('../src/frontend/LightManager.js');
jest.mock('../src/frontend/ModelLoader.js');

describe('Redundant Render Check', () => {
    let app;
    let renderSpy;
    let transformControlsInstance;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup Implementations
        THREE.Scene.mockImplementation(() => ({
            add: jest.fn(),
            remove: jest.fn(),
            traverse: jest.fn()
        }));

        renderSpy = jest.fn();
        THREE.WebGLRenderer.mockImplementation(() => ({
            setSize: jest.fn(),
            setPixelRatio: jest.fn(),
            render: renderSpy,
            domElement: document.createElement('canvas'),
            shadowMap: { enabled: false, type: null }
        }));

        THREE.PerspectiveCamera.mockImplementation(() => ({
            position: {
                set: jest.fn(),
                copy: jest.fn(),
                clone: jest.fn(() => ({ copy: jest.fn() })),
                equals: jest.fn(() => true)
            },
            lookAt: jest.fn(),
            updateProjectionMatrix: jest.fn(),
            rotation: {
                copy: jest.fn(),
                clone: jest.fn(() => ({ copy: jest.fn() })),
                equals: jest.fn(() => true)
            },
            scale: {
                copy: jest.fn(),
                clone: jest.fn(() => ({ copy: jest.fn() })),
                equals: jest.fn(() => true)
            }
        }));

        THREE.Vector3.mockImplementation(() => ({
            clone: jest.fn(() => ({ copy: jest.fn() })),
            copy: jest.fn(),
            equals: jest.fn(() => true)
        }));

        THREE.Clock.mockImplementation(() => ({
             getDelta: jest.fn(() => 0.016)
        }));

        // Import the mock module to set implementations
        // Note: we import from the MAPPED path or the file path?
        // Since we mocked the file path, we should require the file path.
        const ThreeExamples = jest.requireMock('./__mocks__/three-examples.js');

        ThreeExamples.OrbitControls.mockImplementation(() => ({
            enableDamping: true,
            update: jest.fn(),
            target: { clone: jest.fn(), copy: jest.fn() },
            touches: {}
        }));

        ThreeExamples.TransformControls.mockImplementation(() => {
            const listeners = {};
            const instance = {
                addEventListener: jest.fn((event, cb) => {
                    if (!listeners[event]) listeners[event] = [];
                    listeners[event].push(cb);
                }),
                dispatchEvent: (event) => {
                    const type = event.type;
                    if (listeners[type]) {
                        listeners[type].forEach(cb => cb(event));
                    }
                },
                attach: jest.fn(),
                detach: jest.fn(),
                setMode: jest.fn(),
                dragging: false
            };
            return instance;
        });

        // Mock document elements
        document.getElementById = jest.fn((id) => {
            if (id === 'scene-graph-panel') return null; // Force creation
            if (id === 'objects-list') return null;
            if (id === 'ui') return document.createElement('div');
            return document.createElement('div');
        });

        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => {});
    });

    test('should NOT call renderer.render when TransformControls changes (after fix)', () => {
        // Instantiate App
        app = new App();

        const ThreeExamples = jest.requireMock('./__mocks__/three-examples.js');
        expect(ThreeExamples.TransformControls).toHaveBeenCalled();
        // Use results[0].value to get the returned instance from constructor mock
        transformControlsInstance = ThreeExamples.TransformControls.mock.results[0].value;
        // console.log('Instance:', transformControlsInstance);

        // Check initialization
        expect(renderSpy).toHaveBeenCalled(); // Once from constructor -> animate()

        // Clear render mock to reset count
        renderSpy.mockClear();

        // Trigger 'change' event
        transformControlsInstance.dispatchEvent({ type: 'change' });

        // ASSERTION
        // After fix: expected to be called 0 times (redundant call removed)
        expect(renderSpy).not.toHaveBeenCalled();
    });
});
