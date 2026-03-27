import Hammer from 'hammerjs';
import { Events } from './constants.js';

export class InputManager {
  constructor(eventBus, domElement) {
    this.eventBus = eventBus;
    this.domElement = domElement || window;

    // Keyboard Listeners
    (this.domElement.ownerDocument || window).addEventListener(
      'keydown',
      this.onKeyDown.bind(this),
    );

    // Hammer.js Touch Listeners
    if (typeof window !== 'undefined' && this.domElement !== window) {
      this.setupTouchGestures();
    }
  }

  setupTouchGestures() {
    this.hammer = new Hammer.Manager(this.domElement);
    
    // Add Recognizers
    this.hammer.add(new Hammer.Pinch());
    this.hammer.add(new Hammer.Pan({ threshold: 10, pointers: 2 }));
    this.hammer.add(new Hammer.Press({ time: 500 })); // 500ms for long press
    this.hammer.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));

    // Pinch (Zoom)
    this.hammer.on('pinchstart', () => {
      this.eventBus.publish(Events.TOUCH_PINCH_START);
    });

    this.hammer.on('pinchmove', (e) => {
      this.eventBus.publish(Events.TOUCH_PINCH, e.scale);
    });


    // Two-finger Pan
    this.hammer.on('panmove', (e) => {
      if (e.pointers.length === 2) {
        this.eventBus.publish(Events.TOUCH_PAN, { x: e.deltaX, y: e.deltaY });
      }
    });

    // Long Press (Context Menu or special selection)
    this.hammer.on('press', (e) => {
      this.eventBus.publish(Events.TOUCH_LONG_PRESS, { x: e.center.x, y: e.center.y });
    });

    // Double Tap (Focus)
    this.hammer.on('doubletap', () => {
      this.eventBus.publish(Events.FOCUS_OBJECT);
    });
  }

  onKeyDown(event) {
    if (event.target instanceof HTMLInputElement) return;

    switch (event.key.toLowerCase()) {
      case 'g':
        this.eventBus.publish(Events.SET_TRANSFORM_MODE, 'translate');
        break;
      case 'r':
        this.eventBus.publish(Events.SET_TRANSFORM_MODE, 'rotate');
        break;
      case 's':
        this.eventBus.publish(Events.SET_TRANSFORM_MODE, 'scale');
        break;
      case 'z':
        if (event.ctrlKey || event.metaKey) {
          if (event.shiftKey) this.eventBus.publish(Events.REDO);
          else this.eventBus.publish(Events.UNDO);
        }
        break;
      case 'y':
        if (event.ctrlKey || event.metaKey) {
          this.eventBus.publish(Events.REDO);
        }
        break;
      case 'delete':
      case 'backspace':
        this.eventBus.publish(Events.DELETE_OBJECT);
        break;
      case 'f':
        this.eventBus.publish(Events.FOCUS_OBJECT);
        break;
    }
  }
}

