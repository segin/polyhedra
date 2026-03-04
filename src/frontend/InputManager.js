import { Events } from './constants.js';

export class InputManager {
  constructor(eventBus, domElement) {
    this.eventBus = eventBus;
    this.domElement = domElement || window; // Fallback to window if not provided
    // Spec says "Constructor should accept domElement".
    // Usually we attach listeners to domElement (like canvas) for mouse, but for keydown usually window/document.
    // However, to be specific:
    (this.domElement.ownerDocument || window).addEventListener(
      'keydown',
      this.onKeyDown.bind(this),
    );
  }

  onKeyDown(event) {
    switch (event.key) {
      case 'z':
        if (event.ctrlKey || event.metaKey) {
          this.eventBus.publish(Events.UNDO);
        }
        break;
      case 'y':
        if (event.ctrlKey || event.metaKey) {
          this.eventBus.publish(Events.REDO);
        }
        break;
      case 'Delete':
      case 'Backspace':
        this.eventBus.publish(Events.DELETE_OBJECT);
        break;
      case 'f':
      case 'F':
        this.eventBus.publish(Events.FOCUS_OBJECT);
        break;
    }
  }
}
