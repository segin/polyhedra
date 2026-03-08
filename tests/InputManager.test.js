/* eslint-env browser */
import { InputManager } from '../src/frontend/InputManager.js';
import { Events } from '../src/frontend/constants.js';
import Hammer from 'hammerjs';

jest.mock('hammerjs', () => {
  const mockHammer = {
    add: jest.fn(),
    on: jest.fn(),
  };
  return {
    Manager: jest.fn(() => mockHammer),
    Pinch: jest.fn(),
    Pan: jest.fn(),
    Press: jest.fn(),
    Tap: jest.fn(),
  };
});

describe('InputManager', () => {
  let eventBus;
  let domElement;
  let inputManager;

  beforeEach(() => {
    eventBus = {
      publish: jest.fn(),
      subscribe: jest.fn(),
    };
    domElement = document.createElement('div');
    inputManager = new InputManager(eventBus, domElement);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize Hammer.Manager on domElement', () => {
    expect(Hammer.Manager).toHaveBeenCalledWith(domElement);
  });

  it('should add recognizers for pinch, pan, and press', () => {
    expect(Hammer.Pinch).toHaveBeenCalled();
    expect(Hammer.Pan).toHaveBeenCalledWith(expect.objectContaining({ pointers: 2 }));
    expect(Hammer.Press).toHaveBeenCalled();
  });

  it('should publish TOUCH_PINCH when pinchmove occurs', () => {
    const hammerInstance = Hammer.Manager.mock.results[0].value;
    const pinchMoveHandler = hammerInstance.on.mock.calls.find(call => call[0] === 'pinchmove')[1];
    
    pinchMoveHandler({ scale: 1.5 });
    
    expect(eventBus.publish).toHaveBeenCalledWith(Events.TOUCH_PINCH, 1.5);
  });

  it('should publish TOUCH_PAN when panmove occurs with 2 pointers', () => {
    const hammerInstance = Hammer.Manager.mock.results[0].value;
    const panMoveHandler = hammerInstance.on.mock.calls.find(call => call[0] === 'panmove')[1];
    
    panMoveHandler({ pointers: [{}, {}], deltaX: 10, deltaY: 20 });
    
    expect(eventBus.publish).toHaveBeenCalledWith(Events.TOUCH_PAN, { x: 10, y: 20 });
  });

  it('should publish TOUCH_LONG_PRESS when press occurs', () => {
    const hammerInstance = Hammer.Manager.mock.results[0].value;
    const pressHandler = hammerInstance.on.mock.calls.find(call => call[0] === 'press')[1];
    
    pressHandler({ center: { x: 100, y: 200 } });
    
    expect(eventBus.publish).toHaveBeenCalledWith(Events.TOUCH_LONG_PRESS, { x: 100, y: 200 });
  });

  it('should publish UNDO on Ctrl+Z', () => {
    const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true });
    // Since inputManager listens to domElement.ownerDocument || window
    (domElement.ownerDocument || window).dispatchEvent(event);
    expect(eventBus.publish).toHaveBeenCalledWith(Events.UNDO);
  });
});

