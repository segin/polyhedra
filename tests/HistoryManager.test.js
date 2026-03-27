
/**
 * @jest-environment node
 */
import { HistoryManager } from '../src/frontend/HistoryManager.js';
import { Events } from '../src/frontend/constants.js';
import * as THREE from 'three';

// Mock THREE
jest.mock('three', () => {
    const actual = jest.requireActual('three');
    return {
        ...actual,
        Color: jest.fn().mockImplementation(() => ({
            clone: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            equals: jest.fn(() => true)
        })),
        Vector3: jest.fn().mockImplementation((x, y, z) => ({
            x, y, z,
            clone: jest.fn().mockReturnThis(),
            copy: jest.fn().mockReturnThis(),
            equals: jest.fn(() => true)
        })),
        Euler: jest.fn().mockImplementation((x, y, z) => ({
            x, y, z,
            clone: jest.fn().mockReturnThis(),
            copy: jest.fn().mockReturnThis(),
            equals: jest.fn(() => true)
        }))
    };
});

describe('HistoryManager', () => {
    let container;
    let eventBus;
    let historyManager;

    beforeEach(() => {
        eventBus = {
            publish: jest.fn(),
            subscribe: jest.fn()
        };

        container = {
            get: jest.fn((name) => {
                if (name === 'EventBus') return eventBus;
                if (name === 'StateManager') return { subscribe: jest.fn() };
                if (name === 'Scene') return { remove: jest.fn() };
                if (name === 'ObjectManager') return { deleteObject: jest.fn(), addPrimitive: jest.fn() };
                return {};
            })
        };

        historyManager = new HistoryManager(container);
    });

    test('should initialize correctly', () => {
        expect(historyManager).toBeDefined();
        expect(historyManager.history).toEqual([]);
        expect(historyManager.historyIndex).toBe(-1);
    });

    test('saveState should add to history', () => {
        const objects = [
            { 
                uuid: '1', 
                name: 'Box', 
                position: new THREE.Vector3(), 
                rotation: new THREE.Euler(), 
                scale: new THREE.Vector3(1, 1, 1),
                visible: true,
                material: { color: new THREE.Color(), emissive: new THREE.Color() }
            }
        ];

        historyManager.saveState(objects, null, 'Add Box');
        expect(historyManager.history.length).toBe(1);
        expect(historyManager.historyIndex).toBe(0);
        expect(historyManager.history[0].description).toBe('Add Box');
        expect(eventBus.publish).toHaveBeenCalledWith(Events.HISTORY_CHANGED, expect.any(Object));
    });

    test('undo/redo should move history index', async () => {
        const objects = [];
        const callbacks = {
            getObjects: () => [],
            setObjects: jest.fn(),
            selectObject: jest.fn(),
            deselectObject: jest.fn(),
            updateSceneGraph: jest.fn()
        };

        historyManager.saveState(objects, null, 'State 1');
        historyManager.saveState(objects, null, 'State 2');

        expect(historyManager.historyIndex).toBe(1);

        await historyManager.undo(callbacks);
        expect(historyManager.historyIndex).toBe(0);

        await historyManager.redo(callbacks);
        expect(historyManager.historyIndex).toBe(1);
    });

    test('structural sharing: saveState should reuse object state if unchanged', () => {
        const obj = { 
            uuid: '1', 
            name: 'Box', 
            position: new THREE.Vector3(), 
            rotation: new THREE.Euler(), 
            scale: new THREE.Vector3(1, 1, 1),
            visible: true,
            material: { color: new THREE.Color(), emissive: new THREE.Color() }
        };
        const objects = [obj];

        historyManager.saveState(objects, null, 'State 1');
        const firstStateObj = historyManager.history[0].objects[0];

        historyManager.saveState(objects, null, 'State 2');
        const secondStateObj = historyManager.history[1].objects[0];

        expect(firstStateObj).toBe(secondStateObj);
    });
});
