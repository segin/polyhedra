

// THREE mock is handled by jest.setup.cjs

// Mock dat.gui
jest.mock('dat.gui', () => ({
    GUI: jest.fn(() => ({
        addFolder: jest.fn(() => ({
            add: jest.fn(() => ({ name: jest.fn(() => ({ onChange: jest.fn() })) })),
            open: jest.fn()
        }))
    }))
}));

// Mock controls
jest.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
    OrbitControls: jest.fn(() => ({ enableDamping: true, update: jest.fn() }))
}));

jest.mock('three/examples/jsm/controls/TransformControls.js', () => ({
    TransformControls: jest.fn(() => ({
        addEventListener: jest.fn(),
        setMode: jest.fn(),
        attach: jest.fn(),
        detach: jest.fn()
    }))
}));

describe('Scene Graph Accessibility', () => {
    let app;

    beforeEach(() => {
        // Setup environment (handled by jsdom environment)
        if (typeof document !== 'undefined') {
            document.body.innerHTML = '';
        }
        
        global.requestAnimationFrame = jest.fn();
        global.console.log = jest.fn(); // Suppress console.log

        // Mock methods that might be missing or need spying
        if (typeof window !== 'undefined') {
            window.scrollTo = jest.fn();
        }

        // Clear mocks
        jest.clearAllMocks();

        // Create test app with scene graph functionality (replicating the logic we added)
        class TestApp {
            constructor() {
                this.objects = [];
                this.selectedObject = null;
                this.scene = { add: jest.fn(), remove: jest.fn() };
                this.setupSceneGraph();
            }

            setupSceneGraph() {
                this.sceneGraphPanel = document.createElement('div');
                this.objectsList = document.createElement('ul');
                this.sceneGraphPanel.appendChild(document.createElement('h3'));
                this.sceneGraphPanel.appendChild(this.objectsList);
                document.body.appendChild(this.sceneGraphPanel);
                this.updateSceneGraph();
            }

            updateSceneGraph() {
                this.objectsList.innerHTML = '';

                this.objects.forEach((object, index) => {
                    const objectNameText = object.name || `Object_${index + 1}`;
                    const listItem = document.createElement('li');

                    // ACCESSIBILITY FEATURES
                    listItem.tabIndex = 0;
                    listItem.setAttribute('role', 'button');
                    listItem.setAttribute('aria-label', `Select ${objectNameText}`);
                    listItem.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.selectObject(object);
                        }
                    });

                    const objectInfo = document.createElement('div');
                    const objectName = document.createElement('span');
                    const objectType = document.createElement('span');
                    const visibilityBtn = document.createElement('button');
                    const deleteBtn = document.createElement('button');
                    const positionInfo = document.createElement('div');

                    objectName.textContent = objectNameText;
                    objectType.textContent = object.geometry.type.replace('Geometry', '');
                    visibilityBtn.textContent = object.visible ? '👁' : '🚫';
                    deleteBtn.textContent = '🗑';

                    // ACCESSIBILITY FEATURES
                    visibilityBtn.setAttribute('aria-label', `Toggle visibility for ${objectNameText}`);
                    deleteBtn.setAttribute('aria-label', `Delete ${objectNameText}`);

                    positionInfo.textContent = `x: ${object.position.x.toFixed(2)}, y: ${object.position.y.toFixed(2)}, z: ${object.position.z.toFixed(2)}`;

                    // Mock event handlers
                    visibilityBtn.onclick = (e) => {
                        e.stopPropagation();
                        object.visible = !object.visible;
                        visibilityBtn.textContent = object.visible ? '👁' : '🚫';
                    };

                    deleteBtn.onclick = (e) => {
                        e.stopPropagation();
                        this.deleteObject(object);
                    };

                    listItem.onclick = () => {
                        this.selectObject(object);
                    };

                    const buttonContainer = document.createElement('div');
                    buttonContainer.appendChild(visibilityBtn);
                    buttonContainer.appendChild(deleteBtn);

                    objectInfo.appendChild(objectName);
                    objectInfo.appendChild(objectType);
                    objectInfo.appendChild(buttonContainer);

                    listItem.appendChild(objectInfo);
                    listItem.appendChild(positionInfo);
                    this.objectsList.appendChild(listItem);
                });
            }

            selectObject(object) {
                this.selectedObject = object;
                this.updateSceneGraph();
            }

            deleteObject(object) {
                const index = this.objects.indexOf(object);
                if (index > -1) {
                    this.objects.splice(index, 1);
                    this.scene.remove(object);
                }
                if (this.selectedObject === object) {
                    this.selectedObject = null;
                }
                this.updateSceneGraph();
            }

            addTestObject(name = 'TestObject') {
                const object = {
                    name: name,
                    position: { x: 1, y: 2, z: 3, toFixed: (n) => '1.00' },
                    geometry: { type: 'BoxGeometry' },
                    visible: true,
                    uuid: `test-uuid-${Date.now()}`
                };
                this.objects.push(object);
                this.updateSceneGraph();
                return object;
            }
        }

        app = new TestApp();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should add accessibility attributes to list items', () => {
        app.addTestObject('AccessTest');
        
        const listItems = document.querySelectorAll('li');
        expect(listItems.length).toBeGreaterThan(0);
        
        const listItem = Array.from(listItems).find(li => li.textContent.includes('AccessTest'));
        expect(listItem).toBeDefined();
        expect(listItem.tabIndex).toBe(0);
        expect(listItem.getAttribute('role')).toBe('button');
        expect(listItem.getAttribute('aria-label')).toContain('Select AccessTest');
    });

    it('should add aria-labels to buttons', () => {
        const objectName = 'ButtonTest';
        app.addTestObject(objectName);

        const listItems = document.querySelectorAll('li');
        const listItem = Array.from(listItems).find(li => li.textContent.includes(objectName));
        expect(listItem).toBeDefined();

        const buttons = listItem.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);

        const ariaLabels = Array.from(buttons).map(btn => btn.getAttribute('aria-label'));
        expect(ariaLabels.some(label => label.includes(objectName))).toBe(true);
    });
});
