// @ts-check
import { ToastManager } from './ToastManager.js';
import log from 'loglevel';

// Set default level
try {
    if (log.setLevel) {
        log.setLevel('info');
    }
} catch (e) {
    console.warn('Failed to set log level:', e);
}

export default log;
export { log };

// Re-export ToastManager as expected by main.js
export { ToastManager };

// Export toast helper
export const toast = (msg, type) => {
    // Basic fallback if someone uses it without ToastManager instance
    console.log(`[${type}] ${msg}`);
};
