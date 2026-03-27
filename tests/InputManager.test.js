
/**
 * @jest-environment jsdom
 */
import { InputManager } from '../src/frontend/InputManager.js';
import { Events } from '../src/frontend/constants.js';

// Mock Hammer.js
jest.mock('hammerjs', () => {
    return {
        Manager: jest.fn().mockImplementation(() => ({
            add: jest.fn(),
            on: jest.fn()
        })),
        Pinch: jest.fn(),
        Pan: jest.fn(),
        Press: jest.fn(),
        Tap: jest.fn()
    };
});

describe('InputManager', () => {
    let eventBus;
    let inputManager;

    beforeEach(() => {
        eventBus = {
            publish: jest.fn(),
            subscribe: jest.fn()
        };

        inputManager = new InputManager(eventBus, document.createElement('div'));
    });

    test('should initialize correctly', () => {
        expect(inputManager).toBeDefined();
    });

    test('onKeyDown should publish undo/redo events', () => {
        const undoEvent = new window.KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
        const redoEvent = new window.KeyboardEvent('keydown', { key: 'y', ctrlKey: true });

        inputManager.onKeyDown(undoEvent);
        expect(eventBus.publish).toHaveBeenCalledWith(Events.UNDO);

        inputManager.onKeyDown(redoEvent);
        expect(eventBus.publish).toHaveBeenCalledWith(Events.REDO);
    });

    test('onKeyDown should publish delete event', () => {
        const deleteEvent = new window.KeyboardEvent('keydown', { key: 'Delete' });

        inputManager.onKeyDown(deleteEvent);
        expect(eventBus.publish).toHaveBeenCalledWith(Events.DELETE_OBJECT);
    });

    test('onKeyDown should publish focus event', () => {
        const focusEvent = new window.KeyboardEvent('keydown', { key: 'f' });

        inputManager.onKeyDown(focusEvent);
        expect(eventBus.publish).toHaveBeenCalledWith(Events.FOCUS_OBJECT);
    });
});
