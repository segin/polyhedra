import { Logger } from './utils/Logger.js';

export class StateManager {
  constructor() {
    this._state = {
      selection: [],
      toolMode: 'select',
      clipboard: null,
      isDragging: false,
      sceneDirty: false,
    };

    this._listeners = new Map();
  }

  /**
   * Returns a read-only copy of the current state.
   * @returns {object} Frozen state object.
   */
  getState() {
    // We return a shallow copy frozen to prevent direct modification.
    // Deep cloning complex objects like Three.js meshes in 'selection' is not feasible/desired here.
    return Object.freeze({ ...this._state });
  }

  /**
   * Updates the state and notifies listeners.
   * @param {object} partialState - Object containing state updates.
   */
  setState(partialState) {
    const oldState = this._state;
    const newState = { ...oldState, ...partialState };

    // Determine changed keys
    const changedKeys = [];
    for (const key in partialState) {
      if (oldState[key] !== partialState[key]) {
        changedKeys.push(key);
      }
    }

    if (changedKeys.length > 0) {
      this._state = newState;
      this._notifyListeners(changedKeys, newState);
    }
  }

  /**
   * Subscribes to changes of a specific state key.
   * @param {string} key - The state key to listen for.
   * @param {function} callback - Function called with (newValue, fullState).
   * @returns {function} Unsubscribe function.
   */
  subscribe(key, callback) {
    if (!this._listeners.has(key)) {
      this._listeners.set(key, new Set());
    }
    this._listeners.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this._listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this._listeners.delete(key);
        }
      }
    };
  }

  _notifyListeners(changedKeys, newState) {
    changedKeys.forEach((key) => {
      if (this._listeners.has(key)) {
        this._listeners.get(key).forEach((callback) => {
          try {
            callback(newState[key], newState);
          } catch (error) {
            Logger.error(`Error in StateManager listener for key '${key}':`, error);
          }
        });
      }
    });
  }
}
