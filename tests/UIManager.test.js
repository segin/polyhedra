
/**
 * @jest-environment jsdom
 */
import { UIManager } from '../src/frontend/UIManager.js';

// Mock dat.gui
const createChainableMock = () => {
    const mock = {
        addFolder: jest.fn(() => createChainableMock()),
        add: jest.fn(() => createChainableMock()),
        addColor: jest.fn(() => createChainableMock()),
        name: jest.fn().mockReturnThis(),
        min: jest.fn().mockReturnThis(),
        max: jest.fn().mockReturnThis(),
        step: jest.fn().mockReturnThis(),
        onChange: jest.fn().mockReturnThis(),
        onFinishChange: jest.fn().mockReturnThis(),
        open: jest.fn().mockReturnThis(),
        close: jest.fn().mockReturnThis(),
        remove: jest.fn().mockReturnThis(),
        removeFolder: jest.fn().mockReturnThis(),
        listen: jest.fn().mockReturnThis(),
        domElement: { appendChild: jest.fn() },
        __controllers: [],
        __folders: {}
    };
    return mock;
};

jest.mock('dat.gui', () => ({
    GUI: jest.fn().mockImplementation(() => createChainableMock())
}));

describe('UIManager', () => {
    let container;
    let eventBus;
    let uiManager;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="toolbar"></div>
            <div id="properties-panel"></div>
            <div id="objects-list"></div>
            <button id="menu-btn"></button>
            <div id="menu-content"></div>
            <button id="menu-file-load"></button>
            <button id="menu-file-save"></button>
            <input type="file" id="file-input">
        `;

        eventBus = {
            publish: jest.fn(),
            subscribe: jest.fn()
        };

        container = {
            get: jest.fn((name) => {
                if (name === 'EventBus') return eventBus;
                if (name === 'StateManager') return { subscribe: jest.fn() };
                if (name === 'ToastManager') return { show: jest.fn() };
                return {};
            })
        };

        uiManager = new UIManager(container);
    });

    test('should initialize correctly', () => {
        expect(uiManager).toBeDefined();
        expect(uiManager.objectsList).not.toBeNull();
    });

    test('setupToolbar should create tools', () => {
        const callbacks = {
            setTransformMode: jest.fn(),
            undo: jest.fn(),
            redo: jest.fn(),
            deleteSelected: jest.fn()
        };

        uiManager.setupToolbar(callbacks);
        const buttons = document.querySelectorAll('#toolbar button');
        expect(buttons.length).toBe(7);
    });

    test('updateSceneGraph should update DOM list', () => {
        const objects = [
            { uuid: '1', name: 'Box', visible: true },
            { uuid: '2', name: 'Sphere', visible: false }
        ];
        const callbacks = {
            updateSceneGraph: jest.fn(),
            deleteObject: jest.fn(),
            selectObject: jest.fn(),
            reorderObjects: jest.fn()
        };

        uiManager.updateSceneGraph(objects, null, callbacks);
        const listItems = document.querySelectorAll('#objects-list li');
        expect(listItems.length).toBe(2);
        expect(listItems[0].querySelector('.object-name').textContent).toBe('Box');
    });

    test('clearPropertiesPanel should remove controllers', () => {
        uiManager.setupGUI();
        uiManager.propertiesFolder = {
            __controllers: [{}, {}],
            __folders: {},
            remove: jest.fn()
        };

        uiManager.clearPropertiesPanel();
        expect(uiManager.propertiesFolder.remove).toHaveBeenCalledTimes(2);
    });
});
