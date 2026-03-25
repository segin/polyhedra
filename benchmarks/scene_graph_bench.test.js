
// Mock dependencies handled below

// Mock dat.gui
const createChainableMock = () => {
    const obj = {
        name: jest.fn().mockReturnThis(),
        onChange: jest.fn().mockReturnThis(),
        onFinishChange: jest.fn().mockReturnThis(),
        min: jest.fn().mockReturnThis(),
        max: jest.fn().mockReturnThis(),
        step: jest.fn().mockReturnThis(),
        listen: jest.fn().mockReturnThis(),
        remove: jest.fn().mockReturnThis(),
        open: jest.fn().mockReturnThis(),
        close: jest.fn().mockReturnThis(),
        addColor: jest.fn(() => createChainableMock()),
        add: jest.fn(() => createChainableMock()),
        addFolder: jest.fn(() => createChainableMock()),
        removeFolder: jest.fn().mockReturnThis(),
        __controllers: [],
        __folders: {},
    };
    return obj;
};

jest.mock('dat.gui', () => ({
    GUI: jest.fn().mockImplementation(() => createChainableMock()),
}));


// Mock internal dependencies
jest.mock('../src/frontend/SceneStorage.js', () => ({ SceneStorage: jest.fn() }));
jest.mock('../src/frontend/utils/ServiceContainer.js', () => ({ ServiceContainer: jest.fn(() => ({ register: jest.fn() })) }));
jest.mock('../src/frontend/StateManager.js', () => ({ StateManager: jest.fn(() => ({ subscribe: jest.fn() })) }));
jest.mock('../src/frontend/EventBus.js', () => ({ subscribe: jest.fn(), publish: jest.fn() }));
jest.mock('../src/frontend/ObjectManager.js', () => ({ ObjectManager: jest.fn() }));
jest.mock('../src/frontend/SceneManager.js', () => ({ SceneManager: jest.fn() }));
jest.mock('../src/frontend/InputManager.js', () => ({ InputManager: jest.fn() }));
jest.mock('../src/frontend/PhysicsManager.js', () => ({ PhysicsManager: jest.fn(() => ({ update: jest.fn() })) }));
jest.mock('../src/frontend/PrimitiveFactory.js', () => ({ PrimitiveFactory: jest.fn() }));
jest.mock('../src/frontend/ObjectFactory.js', () => ({ ObjectFactory: jest.fn() }));
jest.mock('../src/frontend/ObjectPropertyUpdater.js', () => ({ ObjectPropertyUpdater: jest.fn() }));

describe('SceneGraph Performance', () => {
    let App;

    beforeEach(async () => {
        // Setup environment (handled by jsdom environment)
        if (typeof document !== 'undefined') {
            document.body.innerHTML = '<div id="scene-graph"></div>';
        }
        
        global.requestAnimationFrame = jest.fn();
        global.console = { ...console, log: jest.fn() }; // Mock console.log but keep others
        
        // Mock canvas behavior
        const originalAppendChild = document.body.appendChild;
        jest.spyOn(document.body, 'appendChild').mockImplementation((node) => {
            if (node.tagName === 'CANVAS') {
                return node;
            }
            return originalAppendChild.call(document.body, node);
        });

        // Use dynamic import to ensure mocks are applied
        const module = await import('../src/frontend/main.js');
        App = module.App;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('updateSceneGraph performance with 1000 objects', () => {
        const app = new App();

        // Ensure objectsList is available (setupSceneGraph should have created it)
        expect(app.objectsList).toBeDefined();

        // Create 1000 mock objects
        const objects = [];
        for (let i = 0; i < 1000; i++) {
            objects.push({
                name: `Object_${i}`,
                uuid: `uuid-${i}`,
                geometry: { type: 'BoxGeometry' },
                visible: true,
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                material: { color: { getHex: () => 0xffffff }, emissive: { setHex: () => {} } },
                userData: {}
            });
        }
        app.objects = objects;

        // Measure time
        const start = performance.now();
        app.updateSceneGraph();
        const end = performance.now();

        console.log(`Time taken for updateSceneGraph with 1000 objects: ${(end - start).toFixed(2)}ms`);

        // Verify list size
        expect(app.objectsList.children.length).toBe(1000);

        // Measure update time (simulating a small change - toggle visibility of one object)
        app.objects[0].visible = !app.objects[0].visible;

        const start2 = performance.now();
        app.updateSceneGraph();
        const end2 = performance.now();
        console.log(`Time taken for second updateSceneGraph: ${(end2 - start2).toFixed(2)}ms`);

        expect(app.objectsList.children.length).toBe(1000);
    });
});
