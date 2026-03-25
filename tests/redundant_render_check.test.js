
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
        Vector2: jest.fn((x = 0, y = 0) => {
            const v = {
                x, y,
                set: jest.fn(function(nx, ny) { this.x = nx; this.y = ny; return this; }),
                copy: jest.fn(function(ov) { this.x = ov.x; this.y = ov.y; return this; }),
                clone: jest.fn(function() { return { ...this }; })
            };
            Object.defineProperty(v, 'width', {
                get: function() { return this.x; },
                set: function(val) { this.x = val; },
                configurable: true,
                enumerable: true
            });
            Object.defineProperty(v, 'height', {
                get: function() { return this.y; },
                set: function(val) { this.y = val; },
                configurable: true,
                enumerable: true
            });
            return v;
        }),
        Vector3: jest.fn(),
        Color: jest.fn(),
        PCFSoftShadowMap: 'PCFSoftShadowMap',
        DoubleSide: 'DoubleSide',
        FrontSide: 'FrontSide',
        BufferAttribute: jest.fn(),
        BufferGeometry: jest.fn(() => ({ dispose: jest.fn(), setAttribute: jest.fn(), getAttribute: jest.fn(), computeVertexNormals: jest.fn() })),
        Float32BufferAttribute: jest.fn(function(array, itemSize) {
            this.array = array;
            this.itemSize = itemSize;
            this.count = array ? array.length / itemSize : 0;
        }),
        Uint32BufferAttribute: jest.fn(function(array, itemSize) {
            this.array = array;
            this.itemSize = itemSize;
            this.count = array ? array.length / itemSize : 0;
        }),
        OrthographicCamera: jest.fn(() => ({ position: { set: jest.fn() }, updateProjectionMatrix: jest.fn(), quaternion: { set: jest.fn() } })),
        ShaderMaterial: jest.fn(() => ({ dispose: jest.fn(), uniforms: {} })),
        WebGLRenderTarget: jest.fn(() => ({ setSize: jest.fn(), dispose: jest.fn(), clone: jest.fn().mockReturnThis(), texture: { dispose: jest.fn() } })),
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
// Exporters and Loaders mock removed since jest.setup.cjs handles them.

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

jest.mock('three/examples/jsm/postprocessing/EffectComposer.js', () => ({
    __esModule: true,
    EffectComposer: jest.fn().mockImplementation(() => ({
        addPass: jest.fn(),
        render: jest.fn(),
        setSize: jest.fn(),
        setPixelRatio: jest.fn(),
    })),
}), { virtual: true });

jest.mock('three/examples/jsm/postprocessing/RenderPass.js', () => ({
    __esModule: true,
    RenderPass: jest.fn(),
}), { virtual: true });

jest.mock('three/examples/jsm/postprocessing/OutlinePass.js', () => ({
    __esModule: true,
    OutlinePass: jest.fn().mockImplementation(() => ({
        render: jest.fn(),
        selectedObjects: [],
        visibleEdgeColor: { set: jest.fn() },
        hiddenEdgeColor: { set: jest.fn() },
    })),
}), { virtual: true });

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
            getPixelRatio: jest.fn(() => 1),
            getSize: jest.fn((v) => {
                if (v && typeof v.set === 'function') v.set(800, 600);
                if (v) {
                    v.x = 800;
                    v.y = 600;
                    v.width = 800;
                    v.height = 600;
                }
                return v;
            }),
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

        // Import the actual modules that were mocked globally
        const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls.js');
        const { TransformControls } = require('three/examples/jsm/controls/TransformControls.js');

        OrbitControls.mockImplementation(() => ({
            enableDamping: true,
            update: jest.fn(),
            target: { clone: jest.fn(), copy: jest.fn() },
            touches: {}
        }));

        TransformControls.mockImplementation(() => {
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

        const { TransformControls } = require('three/examples/jsm/controls/TransformControls.js');
        expect(TransformControls).toHaveBeenCalled();
        // Use results[0].value to get the returned instance from constructor mock
        transformControlsInstance = TransformControls.mock.results[0].value;
        // console.log('Instance:', transformControlsInstance);

        // Check initialization
        const { EffectComposer } = require('three/examples/jsm/postprocessing/EffectComposer.js');
        const composerRenderSpy = EffectComposer.mock.results[0].value.render;
        expect(renderSpy.mock.calls.length + composerRenderSpy.mock.calls.length).toBeGreaterThanOrEqual(1);

        // Clear render mocks to reset count
        renderSpy.mockClear();
        composerRenderSpy.mockClear();

        // Trigger 'change' event
        transformControlsInstance.dispatchEvent({ type: 'change' });

        // ASSERTION
        // After fix: expected to be called 0 times (redundant call removed)
        expect(renderSpy).not.toHaveBeenCalled();
        expect(composerRenderSpy).not.toHaveBeenCalled();
    });
});
