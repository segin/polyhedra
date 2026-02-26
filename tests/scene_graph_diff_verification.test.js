
import { jest } from '@jest/globals';

// Mock everything needed for App to instantiate
jest.mock('three', () => ({
    Scene: jest.fn(() => ({ add: jest.fn(), remove: jest.fn() })),
    PerspectiveCamera: jest.fn(),
    WebGLRenderer: jest.fn(() => ({
        domElement: { addEventListener: jest.fn(), parentElement: { appendChild: jest.fn() } },
        setSize: jest.fn(),
        setPixelRatio: jest.fn(),
        shadowMap: { enabled: false, type: null }
    })),
    Clock: jest.fn(() => ({
        getDelta: jest.fn(() => 0.016),
        getElapsedTime: jest.fn(() => 0)
    })),
    Vector2: jest.fn(() => ({ x: 0, y: 0, set: jest.fn() })),
    Vector3: jest.fn(() => ({
        x: 0, y: 0, z: 0,
        set: jest.fn(function(x,y,z) { this.x=x; this.y=y; this.z=z; return this; }),
        normalize: jest.fn(function() { return this; }),
        copy: jest.fn(function(v) { this.x=v.x; this.y=v.y; this.z=v.z; return this; }),
        clone: jest.fn(function() { return { ...this }; })
    })),
    Raycaster: jest.fn(),
    AmbientLight: jest.fn(),
    DirectionalLight: jest.fn(() => ({ shadow: { mapSize: {} } })),
    GridHelper: jest.fn(),
    AxesHelper: jest.fn(),
    PCFSoftShadowMap: 'PCFSoftShadowMap',
    DoubleSide: 'DoubleSide',
    TOUCH: { ROTATE: 1, DOLLY_PAN: 2 }
}));

jest.mock('three/examples/jsm/controls/OrbitControls.js', () => ({ OrbitControls: jest.fn(() => ({ update: jest.fn() })) }));
jest.mock('three/examples/jsm/controls/TransformControls.js', () => ({
    TransformControls: jest.fn(() => ({
        addEventListener: jest.fn(),
        attach: jest.fn(),
        detach: jest.fn()
    }))
}));
jest.mock('dat.gui', () => ({
    GUI: jest.fn(() => ({
        addFolder: jest.fn(() => ({
            add: jest.fn(() => ({ name: jest.fn(() => ({ onChange: jest.fn() })) })),
            addColor: jest.fn(() => ({ name: jest.fn(() => ({ onChange: jest.fn() })) })),
            open: jest.fn(),
            close: jest.fn()
        }))
    }))
}));

// Mock local modules
jest.mock('../src/frontend/utils/ServiceContainer.js', () => ({ ServiceContainer: jest.fn(() => ({ register: jest.fn() })) }));
jest.mock('../src/frontend/StateManager.js', () => ({ StateManager: jest.fn(() => ({ subscribe: jest.fn() })) }));
jest.mock('../src/frontend/EventBus.js', () => ({ subscribe: jest.fn(), publish: jest.fn() }));
jest.mock('../src/frontend/ObjectManager.js', () => ({ ObjectManager: jest.fn() }));
jest.mock('../src/frontend/SceneManager.js', () => ({ SceneManager: jest.fn() }));
jest.mock('../src/frontend/InputManager.js', () => ({ InputManager: jest.fn() }));
jest.mock('../src/frontend/PhysicsManager.js', () => ({ PhysicsManager: jest.fn() }));
jest.mock('../src/frontend/PrimitiveFactory.js', () => ({ PrimitiveFactory: jest.fn() }));
jest.mock('../src/frontend/ObjectFactory.js', () => ({ ObjectFactory: jest.fn() }));
jest.mock('../src/frontend/ObjectPropertyUpdater.js', () => ({ ObjectPropertyUpdater: jest.fn() }));
jest.mock('../src/frontend/SceneStorage.js', () => ({ SceneStorage: jest.fn() }));

import { App } from '../src/frontend/main.js';

describe('Scene Graph Diff Verification', () => {
    let app;

    beforeEach(() => {
        document.body.innerHTML = '';

        // Mock initRenderer to avoid DOM issues
        App.prototype.initRenderer = jest.fn();
        App.prototype.setupLighting = jest.fn();
        App.prototype.setupHelpers = jest.fn();
        App.prototype.setupControls = jest.fn();
        App.prototype.setupGUI = jest.fn();
        App.prototype.setupMobileOptimizations = jest.fn();
        App.prototype.saveState = jest.fn();
        App.prototype.animate = jest.fn();

        app = new App();
        app.objectsList = document.createElement('ul');
        app.objects = [];
        // Ensure map is initialized
        if (!app.sceneGraphItemMap) app.sceneGraphItemMap = new Map();
    });

    test('reuses DOM elements when updating properties', () => {
        const obj1 = { uuid: '1', name: 'Object 1', visible: true, position: { clone: jest.fn() } };
        app.objects.push(obj1);
        app.updateSceneGraph();

        const li1 = app.objectsList.children[0];
        expect(li1).toBeDefined();

        // Modify object
        obj1.name = 'Object 1 Modified';
        app.updateSceneGraph();

        const li2 = app.objectsList.children[0];
        expect(li2).toBe(li1); // Should be same instance
        expect(li2.querySelector('.object-name').textContent).toBe('Object 1 Modified');
    });

    test('creates new element for new object', () => {
        const obj1 = { uuid: '1', name: 'Object 1', visible: true };
        app.objects.push(obj1);
        app.updateSceneGraph();

        const li1 = app.objectsList.children[0];

        const obj2 = { uuid: '2', name: 'Object 2', visible: true };
        app.objects.push(obj2);
        app.updateSceneGraph();

        expect(app.objectsList.children.length).toBe(2);
        expect(app.objectsList.children[0]).toBe(li1); // obj1 stays
        expect(app.objectsList.children[1]).not.toBe(li1); // new obj
    });

    test('handles object removal and cleanup', () => {
        const obj1 = { uuid: '1', name: 'Object 1', visible: true };
        app.objects.push(obj1);
        app.updateSceneGraph();

        expect(app.sceneGraphItemMap.has('1')).toBe(true);

        app.objects = [];
        app.updateSceneGraph();

        expect(app.objectsList.children[0].textContent).toBe('No objects in scene');
        expect(app.sceneGraphItemMap.has('1')).toBe(false); // Should be cleaned up
    });

    test('handles object replacement (same UUID, new instance)', () => {
        const obj1 = { uuid: '1', name: 'Object 1', visible: true };
        app.objects.push(obj1);
        app.updateSceneGraph();

        const li1 = app.objectsList.children[0];

        // Replace with new instance
        const obj1New = { uuid: '1', name: 'Object 1 New', visible: true };
        app.objects = [obj1New];

        app.updateSceneGraph();

        const li2 = app.objectsList.children[0];
        expect(li2).not.toBe(li1); // Should be re-created
        expect(li2.querySelector('.object-name').textContent).toBe('Object 1 New');
        // @ts-ignore
        expect(li2._boundObject).toBe(obj1New);
    });
});
