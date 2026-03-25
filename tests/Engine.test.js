
import { jest } from '@jest/globals';
import { Engine } from '../src/frontend/Engine.js';

// Inline mock for Three.js
jest.mock('three', () => {
    return {
        Scene: jest.fn().mockImplementation(() => ({
            add: jest.fn(),
            remove: jest.fn()
        })),
        WebGLRenderer: jest.fn().mockImplementation(() => ({
            setSize: jest.fn(),
            render: jest.fn(),
            domElement: {
                parentElement: null
            }
        })),
        PerspectiveCamera: jest.fn().mockImplementation(() => ({
            position: {
                z: 0,
                clone: jest.fn(() => ({ copy: jest.fn() })),
                copy: jest.fn()
            },
            aspect: 1,
            updateProjectionMatrix: jest.fn()
        })),
        GridHelper: jest.fn(),
        AxesHelper: jest.fn(),
        Clock: jest.fn().mockImplementation(() => ({
            getDelta: jest.fn(() => 0.016)
        })),
        Vector3: jest.fn().mockImplementation(() => ({
            clone: jest.fn(),
            copy: jest.fn()
        })),
        WebGLRenderTarget: jest.fn().mockImplementation(() => ({
            setSize: jest.fn(),
            clone: jest.fn(),
            dispose: jest.fn(),
            texture: {}
        })),
        BufferGeometry: jest.fn().mockImplementation(() => ({
            dispose: jest.fn(),
            setAttribute: jest.fn(),
            getAttribute: jest.fn()
        })),
        Float32BufferAttribute: jest.fn(),
        Uint32BufferAttribute: jest.fn(),
        OrthographicCamera: jest.fn().mockImplementation(() => ({
            position: { clone: jest.fn(), copy: jest.fn() },
            updateProjectionMatrix: jest.fn()
        })),
        ShaderMaterial: jest.fn(),
        PCFSoftShadowMap: 2,
        DoubleSide: 2,
        FrontSide: 0
    };
});

jest.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
    OrbitControls: jest.fn().mockImplementation(() => ({
        target: { clone: jest.fn(), copy: jest.fn() },
        enableDamping: true,
        update: jest.fn()
    }))
}));

describe('Engine', () => {
    let canvas;
    let physicsManager;
    let transformControls;
    let animationManager;
    let engine;

    beforeEach(() => {
        // Mock canvas
        canvas = document.createElement('canvas');
        Object.defineProperty(canvas, 'clientWidth', { value: 800, configurable: true });
        Object.defineProperty(canvas, 'clientHeight', { value: 600, configurable: true });

        physicsManager = { update: jest.fn() };
        transformControls = { update: jest.fn() };
        animationManager = { update: jest.fn() };

        // Mock requestAnimationFrame
        global.requestAnimationFrame = jest.fn();

        engine = new Engine(canvas, physicsManager, transformControls, animationManager);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should initialize correctly', () => {
        expect(engine.scene).toBeDefined();
        expect(engine.renderer).toBeDefined();
        expect(engine.camera).toBeDefined();
        expect(engine.controls).toBeDefined();
    });

    test('animate should call updates and request next frame', () => {
        engine.animate();

        expect(physicsManager.update).toHaveBeenCalled();
        expect(animationManager.update).toHaveBeenCalledWith(expect.any(Number), engine.scene);
        expect(transformControls.update).toHaveBeenCalled();
        expect(engine.controls.update).toHaveBeenCalled();
        expect(engine.renderer.render).toHaveBeenCalled();

        expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    test('start should begin animation loop', () => {
        const animateSpy = jest.spyOn(engine, 'animate');
        engine.start();
        expect(animateSpy).toHaveBeenCalled();
    });
});
