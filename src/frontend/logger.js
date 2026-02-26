// @ts-check
import { ToastManager } from './ToastManager.js';

let log;

if (typeof window !== 'undefined' && window.log) {
    log = window.log;
} else if (typeof window !== 'undefined' && window.loglevel) {
    log = window.loglevel;
} else {
    // Fallback for tests or if script failed to load
    log = {
        trace: console.trace,
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
        setLevel: () => {},
        setDefaultLevel: () => {},
        enableAll: () => {},
        disableAll: () => {},
        methodFactory: () => {},
        getLogger: () => log,
    };
}

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
