module.exports = [
"[project]/src/frontend/utils/Logger.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Logger",
    ()=>Logger
]);
// @ts-check
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$loglevel$2f$lib$2f$loglevel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/loglevel/lib/loglevel.js [app-ssr] (ecmascript)");
;
const isProduction = ("TURBOPACK compile-time value", "undefined") !== 'undefined' && window.location.hostname !== 'localhost';
const Logger = {
    /**
   * Initialize logging level
   */ init () {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        else {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$loglevel$2f$lib$2f$loglevel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].setLevel('debug');
        }
    },
    /**
   * Helper to format log messages with ISO timestamp
   */ _format (levelName, message, meta) {
        const timestamp = new Date().toISOString();
        let metaStr = '';
        if (meta !== undefined) {
            try {
                metaStr = typeof meta === 'object' ? JSON.stringify(meta, this._getCircularReplacer()) : String(meta);
            } catch  {
                metaStr = '[Unserializable Meta]';
            }
        }
        return `[${timestamp}] [${levelName}] ${message} ${metaStr}`.trim();
    },
    /**
   * Safely stringify objects with circular references
   */ _getCircularReplacer () {
        const seen = new WeakSet();
        return (key, value)=>{
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return '[Circular]';
                }
                seen.add(value);
            }
            return value;
        };
    },
    debug (message, meta) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$loglevel$2f$lib$2f$loglevel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getLevel() <= __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$loglevel$2f$lib$2f$loglevel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].levels.DEBUG) {
            console.debug(this._format('DEBUG', message, meta));
        }
    },
    info (message, meta) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$loglevel$2f$lib$2f$loglevel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getLevel() <= __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$loglevel$2f$lib$2f$loglevel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].levels.INFO) {
            console.info(this._format('INFO', message, meta));
        }
    },
    warn (message, meta) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$loglevel$2f$lib$2f$loglevel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getLevel() <= __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$loglevel$2f$lib$2f$loglevel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].levels.WARN) {
            console.warn(this._format('WARN', message, meta));
        }
    },
    error (message, meta) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$loglevel$2f$lib$2f$loglevel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getLevel() <= __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$loglevel$2f$lib$2f$loglevel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].levels.ERROR) {
            console.error(this._format('ERROR', message, meta));
        }
    }
};
Logger.init();
}),
"[project]/src/frontend/utils/OperationWrappers.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "safeJSONParse",
    ()=>safeJSONParse,
    "safeLocalStorageSet",
    ()=>safeLocalStorageSet
]);
// @ts-check
/* global localStorage */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/utils/Logger.js [app-ssr] (ecmascript)");
;
function safeJSONParse(str, fallback = null) {
    try {
        return JSON.parse(str);
    } catch (error) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Logger"].error('Failed to parse JSON', {
            error: error.message,
            snippet: str.substring(0, 50)
        });
        return fallback;
    }
}
function safeLocalStorageSet(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Logger"].error('Failed to write to localStorage', {
            error: error.message,
            key
        });
        return false;
    }
}
}),
"[project]/src/frontend/ToastManager.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// @ts-check
__turbopack_context__.s([
    "ToastManager",
    ()=>ToastManager
]);
class ToastManager {
    constructor(){
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.setAttribute('role', 'status');
        this.container.setAttribute('aria-live', 'polite');
        document.body.appendChild(this.container);
    }
    /**
   * Shows a toast notification.
   * @param {string} message - The message to display.
   * @param {'info'|'success'|'error'} type - The type of toast.
   * @param {number} duration - Duration in ms.
   */ show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        // Accessibility: Errors should be assertive
        if (type === 'error') {
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'assertive');
        }
        this.container.appendChild(toast);
        // Trigger reflow for animation
        // @ts-ignore
        toast.offsetHeight;
        toast.classList.add('show');
        setTimeout(()=>{
            toast.classList.remove('show');
            setTimeout(()=>{
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300); // Wait for transition
        }, duration);
    }
}
}),
"[project]/src/frontend/logger.js [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "log",
    ()=>log,
    "toast",
    ()=>toast
]);
// @ts-check
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ToastManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/ToastManager.js [app-ssr] (ecmascript)");
;
let log;
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    // Fallback for tests or if script failed to load
    log = {
        trace: console.trace,
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
        setLevel: ()=>{},
        setDefaultLevel: ()=>{},
        enableAll: ()=>{},
        disableAll: ()=>{},
        methodFactory: ()=>{},
        getLogger: ()=>log
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
const __TURBOPACK__default__export__ = log;
;
;
const toast = (msg, type)=>{
    // Basic fallback if someone uses it without ToastManager instance
    console.log(`[${type}] ${msg}`);
};
}),
"[project]/src/frontend/SceneStorage.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SceneStorage",
    ()=>SceneStorage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.module.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$OperationWrappers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/utils/OperationWrappers.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/frontend/logger.js [app-ssr] (ecmascript) <locals>");
;
;
;
class SceneStorage {
    /**
   * @param {THREE.Scene} scene
   * @param {any} eventBus
   */ constructor(scene, eventBus){
        this.eventBus = eventBus;
        this.scene = scene;
        this.worker = new Worker('./worker.js');
        this.worker.onmessage = this.handleWorkerMessage.bind(this);
    }
    /**
   * Handles messages from the Web Worker.
   * @param {MessageEvent} event
   */ handleWorkerMessage(event) {
        // Local listeners in saveScene/loadScene handle specific responses.
        // This global handler catches unhandled errors or specific broadcast messages.
        const { type, message, error } = event.data;
        if (type === 'error') {
        // We log here only if it might not be caught by local listeners (generic errors)
        // But local listeners also listen for 'error'.
        // To avoid duplicate logging, we might check if it was handled?
        // For now, minimal logging.
        // log.error('Worker global error:', message, error);
        }
    }
    /**
   * Saves the scene to a .polyhedra zip file.
   */ async saveScene() {
        // @ts-ignore
        const JSZip = window.JSZip;
        if (!JSZip) {
            throw new Error('JSZip not loaded');
        }
        const zip = new JSZip();
        // Optimization: avoid standard Array conversion for TypedArrays
        const originalToJSON = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferAttribute"].prototype.toJSON;
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferAttribute"].prototype.toJSON = function() {
            return {
                itemSize: this.itemSize,
                type: this.array.constructor.name,
                array: this.array,
                // TypedArray will be efficiently cloned/replaced in worker
                normalized: this.normalized
            };
        };
        let sceneData;
        try {
            sceneData = this.scene.toJSON();
        } finally{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferAttribute"].prototype.toJSON = originalToJSON;
        }
        // Serialize the scene using the worker
        let serializationResult;
        try {
            serializationResult = await new Promise((resolve, reject)=>{
                const handleMessage = (event)=>{
                    if (event.data.type === 'serialize_complete') {
                        this.worker.removeEventListener('message', handleMessage);
                        resolve(event.data);
                    } else if (event.data.type === 'error') {
                        this.worker.removeEventListener('message', handleMessage);
                        reject(new Error(event.data.message + ': ' + event.data.error));
                    }
                };
                this.worker.addEventListener('message', handleMessage);
                // Send data to worker. We rely on structured cloning to copy buffers efficiently.
                this.worker.postMessage({
                    type: 'serialize',
                    data: sceneData
                });
            });
        } catch (error) {
            // Suppress json parse error and let fallback take over
            throw error;
        }
        const { data: sceneJson, buffers } = serializationResult;
        // Process buffers to handle shared buffers and avoid duplication in ZIP
        // Identify unique buffers
        const uniqueBuffers = [
            ...new Set(buffers)
        ];
        const bufferMap = new Map(uniqueBuffers.map((b, i)=>[
                b,
                i
            ]));
        // Create a mapping array: original index -> unique buffer index
        const bufferMapping = buffers.map((b)=>bufferMap.get(b));
        // Add files to ZIP
        zip.file('scene.json', sceneJson);
        zip.file('buffers.json', JSON.stringify(bufferMapping));
        // Add unique binary buffers to ZIP
        uniqueBuffers.forEach((buffer, index)=>{
            zip.file(`buffers/bin_${index}.bin`, buffer);
        });
        const content = await zip.generateAsync({
            type: 'blob'
        });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scene.polyhedra';
        a.click();
        URL.revokeObjectURL(url);
        this.eventBus.publish('scene_saved', {
            name: 'scene.polyhedra',
            size: content.size
        });
    }
    /**
   * Loads a scene from a .polyhedra zip file.
   * @param {File} file
   */ async loadScene(file) {
        try {
            // @ts-ignore
            const JSZip = window.JSZip;
            const zip = new JSZip();
            const loadedZip = await zip.loadAsync(file);
            const sceneJsonFile = loadedZip.file('scene.json');
            if (!sceneJsonFile) {
                throw new Error('scene.json not found in the zip file.');
            }
            const sceneJson = await sceneJsonFile.async('string');
            // Check for buffers
            let buffers = [];
            const mappingFile = loadedZip.file('buffers.json');
            if (mappingFile) {
                const mappingJson = await mappingFile.async('string');
                const bufferMapping = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$OperationWrappers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeJSONParse"])(mappingJson);
                if (!bufferMapping) {
                    throw new Error('buffers.json is invalid or corrupted');
                }
                // Load all unique binary files
                // We can infer count from mapping max index or just check files
                const uniqueBufferCount = Math.max(...bufferMapping, -1) + 1;
                const uniqueBuffers = await Promise.all(Array.from({
                    length: uniqueBufferCount
                }).map(async (_, i)=>{
                    const binFile = loadedZip.file(`buffers/bin_${i}.bin`);
                    if (!binFile) throw new Error(`Buffer file bin_${i}.bin missing`);
                    return binFile.async('arraybuffer');
                }));
                // Reconstruct the buffers array for the worker
                buffers = bufferMapping.map((index)=>uniqueBuffers[index]);
            }
            // Clear existing objects from the scene.
            // We iterate backwards and use pop() to achieve O(N) complexity,
            // avoiding the O(N^2) overhead of repeated remove(child[0]) calls.
            while(this.scene.children.length > 0){
                const object = this.scene.children.pop();
                // Mimic scene.remove(object) logic without the O(N) indexOf search
                if (object.parent === this.scene) {
                    object.parent = null;
                    object.dispatchEvent({
                        type: 'removed'
                    });
                    this.scene.dispatchEvent({
                        type: 'childremoved',
                        child: object
                    });
                }
                // @ts-ignore
                if (object.geometry) object.geometry.dispose();
                // @ts-ignore
                if (object.material) {
                    // @ts-ignore
                    if (Array.isArray(object.material)) {
                        // @ts-ignore
                        object.material.forEach((material)=>material.dispose());
                    } else {
                        // @ts-ignore
                        object.material.dispose();
                    }
                }
            }
            // Deserialize the scene using the worker
            return new Promise((resolve, reject)=>{
                const handleMessage = (event)=>{
                    if (event.data.type === 'deserialize_complete') {
                        this.worker.removeEventListener('message', handleMessage);
                        const loadedScene = event.data.data;
                        const loader = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ObjectLoader"]();
                        // Parse the reconstructed object into Three.js objects
                        const scene = loader.parse(loadedScene);
                        // Add loaded objects back to the scene
                        while(scene.children.length > 0){
                            this.scene.add(scene.children[0]);
                        }
                        this.eventBus.publish('scene_loaded');
                        resolve(scene);
                    } else if (event.data.type === 'error') {
                        this.worker.removeEventListener('message', handleMessage);
                        reject(new Error(event.data.message + ': ' + event.data.error));
                    }
                };
                this.worker.addEventListener('message', handleMessage);
                // Transfer buffers to worker for reconstruction
                // Note: buffers array contains ArrayBuffers. We transfer unique ones.
                const uniqueTransferables = [
                    ...new Set(buffers)
                ];
                this.worker.postMessage({
                    type: 'deserialize',
                    data: sceneJson,
                    buffers: buffers
                }, uniqueTransferables);
            });
        } catch (error) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].error('Error loading scene:', error);
            return Promise.reject(error);
        }
    }
}
}),
"[project]/src/frontend/utils/ServiceContainer.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * ServiceContainer for Dependency Injection.
 * Manages the registration and retrieval of services (managers, utilities, etc.).
 */ __turbopack_context__.s([
    "ServiceContainer",
    ()=>ServiceContainer
]);
class ServiceContainer {
    constructor(){
        this.services = new Map();
    }
    /**
   * Registers a service instance.
   * @param {string} name - The unique name of the service.
   * @param {object} instance - The service instance.
   * @throws {Error} If a service with the same name is already registered.
   */ register(name, instance) {
        if (this.services.has(name)) {
            throw new Error(`Service '${name}' is already registered.`);
        }
        this.services.set(name, instance);
    }
    /**
   * Retrieves a registered service.
   * @param {string} name - The name of the service to retrieve.
   * @returns {object} The service instance.
   * @throws {Error} If the service is not found.
   */ get(name) {
        if (!this.services.has(name)) {
            throw new Error(`Service '${name}' not found.`);
        }
        return this.services.get(name);
    }
}
}),
"[project]/src/frontend/StateManager.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StateManager",
    ()=>StateManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/utils/Logger.js [app-ssr] (ecmascript)");
;
class StateManager {
    constructor(){
        this._state = {
            selection: [],
            toolMode: 'select',
            clipboard: null,
            isDragging: false,
            sceneDirty: false
        };
        this._listeners = new Map();
    }
    /**
   * Returns a read-only copy of the current state.
   * @returns {object} Frozen state object.
   */ getState() {
        // We return a shallow copy frozen to prevent direct modification.
        // Deep cloning complex objects like Three.js meshes in 'selection' is not feasible/desired here.
        return Object.freeze({
            ...this._state
        });
    }
    /**
   * Updates the state and notifies listeners.
   * @param {object} partialState - Object containing state updates.
   */ setState(partialState) {
        const oldState = this._state;
        const newState = {
            ...oldState,
            ...partialState
        };
        // Determine changed keys
        const changedKeys = [];
        for(const key in partialState){
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
   */ subscribe(key, callback) {
        if (!this._listeners.has(key)) {
            this._listeners.set(key, new Set());
        }
        this._listeners.get(key).add(callback);
        // Return unsubscribe function
        return ()=>{
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
        changedKeys.forEach((key)=>{
            if (this._listeners.has(key)) {
                this._listeners.get(key).forEach((callback)=>{
                    try {
                        callback(newState[key], newState);
                    } catch (error) {
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Logger"].error(`Error in StateManager listener for key '${key}':`, error);
                    }
                });
            }
        });
    }
}
}),
"[project]/src/frontend/EventBus.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/frontend/logger.js [app-ssr] (ecmascript) <locals>");
;
class EventBus {
    constructor(){
        this.events = {};
    }
    subscribe(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }
    unsubscribe(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter((cb)=>cb !== callback);
        }
    }
    publish(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach((callback)=>{
                try {
                    callback(data);
                } catch (error) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].error(`Error in event listener for ${eventName}:`, error);
                }
            });
        }
    }
}
const __TURBOPACK__default__export__ = new EventBus();
}),
"[project]/src/frontend/constants.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Events",
    ()=>Events,
    "ObjectTypes",
    ()=>ObjectTypes
]);
const Events = {
    OBJECT_ADDED: 'objectAdded',
    OBJECT_REMOVED: 'objectRemoved',
    SELECTION_CHANGE: 'selectionChange',
    HISTORY_CHANGE: 'historyChange',
    LIGHT_ADDED: 'lightAdded',
    LIGHT_REMOVED: 'lightRemoved',
    LIGHT_UPDATED: 'lightUpdated',
    GROUP_ADDED: 'groupAdded',
    GROUP_REMOVED: 'groupRemoved',
    DELETE_OBJECT: 'deleteObject',
    SCENE_GRAPH_NEEDS_UPDATE: 'sceneGraphNeedsUpdate',
    UNDO: 'undo',
    REDO: 'redo',
    FOCUS_OBJECT: 'focus-object',
    UPDATE_GRID: 'update-grid',
    TOGGLE_AXES: 'toggle-axes',
    UI_UPDATE_PROPERTIES: 'ui-update-properties',
    HISTORY_CHANGED: 'history-changed',
    TOUCH_PINCH_START: 'touch-pinch-start',
    TOUCH_PINCH: 'touch-pinch',
    TOUCH_PAN: 'touch-pan',
    TOUCH_LONG_PRESS: 'touch-long-press'
};
const ObjectTypes = {
    BOX: 'Box',
    SPHERE: 'Sphere',
    CYLINDER: 'Cylinder',
    CONE: 'Cone',
    TORUS: 'Torus',
    TORUS_KNOT: 'TorusKnot',
    TETRAHEDRON: 'Tetrahedron',
    ICOSAHEDRON: 'Icosahedron',
    DODECAHEDRON: 'Dodecahedron',
    OCTAHEDRON: 'Octahedron',
    PLANE: 'Plane',
    TUBE: 'Tube',
    TEAPOT: 'Teapot',
    LATHE: 'Lathe',
    EXTRUDE: 'Extrude',
    TEXT: 'Text',
    LOD_CUBE: 'LODCube'
};
}),
"[project]/src/frontend/ObjectManager.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ObjectManager",
    ()=>ObjectManager
]);
// @ts-check
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/constants.js [app-ssr] (ecmascript)");
;
const TEXTURE_KEYS = [
    'map',
    'normalMap',
    'roughnessMap',
    'metalnessMap',
    'alphaMap',
    'aoMap'
];
class ObjectManager {
    /**
   * @param {import('three').Scene} scene
   * @param {any} eventBus
   * @param {any} physicsManager
   * @param {import('./PrimitiveFactory.js').PrimitiveFactory} primitiveFactory
   * @param {import('./ObjectFactory.js').ObjectFactory} objectFactory
   * @param {import('./ObjectPropertyUpdater.js').ObjectPropertyUpdater} objectPropertyUpdater
   * @param {import('./StateManager.js').StateManager} stateManager
   */ constructor(scene, eventBus, physicsManager, primitiveFactory, objectFactory, objectPropertyUpdater, stateManager){
        this.scene = scene;
        this.eventBus = eventBus;
        this.physicsManager = physicsManager;
        this.primitiveFactory = primitiveFactory;
        this.objectFactory = objectFactory;
        this.objectPropertyUpdater = objectPropertyUpdater;
        this.stateManager = stateManager;
    }
    /**
   * Selects an object.
   * @param {import('three').Object3D} object
   */ selectObject(object) {
        if (this.stateManager) {
            this.stateManager.setState({
                selection: [
                    object
                ]
            });
        }
        this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].OBJECT_SELECTED, object);
    }
    /**
   * Deselects the currently selected object.
   */ deselectObject() {
        if (this.stateManager) {
            this.stateManager.setState({
                selection: []
            });
        }
        this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].OBJECT_DESELECTED);
    }
    /**
   * Adds a primitive to the scene.
   * @param {string} type
   * @param {object} [options]
   * @returns {Promise<THREE.Object3D> | THREE.Object3D | null}
   */ addPrimitive(type, options) {
        if (this.objectFactory) {
            return this.objectFactory.addPrimitive(type, options);
        }
        // Fallback logic
        const object = this.primitiveFactory.createPrimitive(type, options);
        if (object && !(object instanceof Promise)) {
            this.scene.add(object);
            this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].OBJECT_ADDED, object);
        }
        return object;
    }
    /**
   * Duplicates an object.
   * @param {import('three').Object3D} object
   * @returns {Promise<import('three').Object3D> | import('three').Object3D | null}
   */ duplicateObject(object) {
        if (this.objectFactory) {
            return this.objectFactory.duplicateObject(object);
        }
        return null;
    }
    /**
   * Updates object material properties.
   * @param {import('three').Object3D} object
   * @param {object} properties
   */ updateMaterial(object, properties) {
        if (this.objectPropertyUpdater) {
            this.objectPropertyUpdater.updateMaterial(object, properties);
        }
    }
    /**
   * Adds a texture to an object.
   * @param {import('three').Object3D} object
   * @param {File} file
   * @param {string} type
   */ addTexture(object, file, type) {
        if (this.objectPropertyUpdater) {
            this.objectPropertyUpdater.addTexture(object, file, type);
        }
    }
    /**
   * Deletes an object from the scene.
   * @param {import('three').Object3D} object
   * @param {boolean} [detachFromParent=true]
   */ deleteObject(object, detachFromParent = true) {
        if (object) {
            if (object.children && object.children.length > 0) {
                // Recursively delete children backwards to avoid array copy and index shifts
                // Pass false to detachFromParent to avoid O(N^2) removal operations
                for(let i = object.children.length - 1; i >= 0; i--){
                    const child = object.children[i];
                    this.deleteObject(child, false);
                    if (child) child.parent = null;
                }
                object.children.length = 0;
            }
            // Dispose of geometry
            // @ts-ignore
            if (object.geometry) {
                // @ts-ignore
                object.geometry.dispose();
            }
            // Dispose of material(s)
            // @ts-ignore
            if (object.material) {
                // @ts-ignore
                const materialOrArray = object.material;
                if (Array.isArray(materialOrArray)) {
                    for(let i = 0; i < materialOrArray.length; i++){
                        this._disposeMaterial(materialOrArray[i]);
                    }
                } else {
                    this._disposeMaterial(materialOrArray);
                }
            }
            // Remove from physics if manager exists
            if (this.physicsManager && this.physicsManager.removeObject) {
                this.physicsManager.removeObject(object);
            }
            // Remove the object from its parent (scene or group)
            if (detachFromParent) {
                if (object.parent) {
                    object.parent.remove(object);
                } else {
                    this.scene.remove(object);
                }
            }
            this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].OBJECT_REMOVED, object);
        }
    }
    /**
   * @param {any} material
   * @private
   */ _disposeMaterial(material) {
        if (!material) return;
        // Dispose textures
        for(let i = 0; i < TEXTURE_KEYS.length; i++){
            const key = TEXTURE_KEYS[i];
            if (material[key] && material[key].dispose) {
                material[key].dispose();
            }
        }
        material.dispose();
    }
}
}),
"[project]/src/frontend/SceneManager.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SceneManager",
    ()=>SceneManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$controls$2f$OrbitControls$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/controls/OrbitControls.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.module.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tweenjs$2f$tween$2e$js$2f$dist$2f$tween$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tweenjs/tween.js/dist/tween.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/utils/Logger.js [app-ssr] (ecmascript)");
;
;
;
;
class SceneManager {
    constructor(renderer, camera, inputManager, scene){
        this.renderer = renderer;
        this.camera = camera;
        this.inputManager = inputManager;
        // If scene is provided, use it; otherwise creating one might conflict if main.js also creates one.
        // Assuming we should accept it as per standard DI pattern for shared resources.
        this.scene = scene;
        this.canvas = renderer.domElement;
        if (!this.scene) {
            // Fallback if not provided, though usually should be injected
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Logger"].warn('Scene not injected into SceneManager, creating new one.');
            this.scene = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Scene"]();
        }
        this.controls = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$controls$2f$OrbitControls$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OrbitControls"](this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.screenSpacePanning = true;
        this.controls.enableZoom = true;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 500;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.initialCameraPosition = this.camera.position.clone();
        this.initialControlsTarget = this.controls.target.clone();
        const gridHelper = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GridHelper"](10, 10);
        this.scene.add(gridHelper);
        const axesHelper = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AxesHelper"](5);
        this.scene.add(axesHelper);
        // Removing global listener if InputManager handles it,
        // or keeping it if it's specific to scene resizing.
        // Spec doesn't mention removing it.
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        this.onWindowResize();
    }
    resetCamera() {
        this.camera.position.copy(this.initialCameraPosition);
        this.controls.target.copy(this.initialControlsTarget);
        this.controls.update();
    }
    get dampingEnabled() {
        return this.controls.enableDamping;
    }
    set dampingEnabled(value) {
        this.controls.enableDamping = value;
    }
    get dampingFactor() {
        return this.controls.dampingFactor;
    }
    set dampingFactor(value) {
        this.controls.dampingFactor = value;
    }
    focusOnObject(object) {
        if (!object) return;
        // Calculate bounding box
        const box = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Box3"]().setFromObject(object);
        if (box.isEmpty()) return;
        const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
        box.getSize(size);
        const center = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
        box.getCenter(center);
        const maxDim = Math.max(size.x, size.y, size.z);
        // Calculate distance
        const fov = this.camera.fov * (Math.PI / 180);
        // Fit to 80% of screen using trigonometry, fallback to a small distance if point-size
        let cameraZ = maxDim === 0 ? 5 : Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;
        // Clamp
        cameraZ = Math.max(cameraZ, this.controls.minDistance);
        cameraZ = Math.min(cameraZ, this.controls.maxDistance);
        const direction = this.camera.position.clone().sub(this.controls.target).normalize();
        if (direction.lengthSq() < 0.001) {
            direction.set(0, 0, 1);
        }
        const targetPosition = center.clone().add(direction.multiplyScalar(cameraZ));
        // Tween target
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tweenjs$2f$tween$2e$js$2f$dist$2f$tween$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tween"](this.controls.target).to({
            x: center.x,
            y: center.y,
            z: center.z
        }, 500).easing(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tweenjs$2f$tween$2e$js$2f$dist$2f$tween$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Easing"].Cubic.Out).start();
        // Tween camera
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tweenjs$2f$tween$2e$js$2f$dist$2f$tween$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tween"](this.camera.position).to({
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z
        }, 500).easing(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tweenjs$2f$tween$2e$js$2f$dist$2f$tween$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Easing"].Cubic.Out).onUpdate(()=>this.controls.update()).start();
    }
    onWindowResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
    render() {
        this.renderer.render(this.scene, this.camera);
        this.controls.update();
    }
}
}),
"[project]/src/frontend/InputManager.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InputManager",
    ()=>InputManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$hammerjs$2f$hammer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/hammerjs/hammer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/constants.js [app-ssr] (ecmascript)");
;
;
class InputManager {
    constructor(eventBus, domElement){
        this.eventBus = eventBus;
        this.domElement = domElement || window;
        // Keyboard Listeners
        (this.domElement.ownerDocument || window).addEventListener('keydown', this.onKeyDown.bind(this));
        // Hammer.js Touch Listeners
        if (("TURBOPACK compile-time value", "undefined") !== 'undefined' && this.domElement !== window) //TURBOPACK unreachable
        ;
    }
    setupTouchGestures() {
        this.hammer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$hammerjs$2f$hammer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Manager(this.domElement);
        // Add Recognizers
        this.hammer.add(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$hammerjs$2f$hammer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Pinch());
        this.hammer.add(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$hammerjs$2f$hammer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Pan({
            threshold: 10,
            pointers: 2
        }));
        this.hammer.add(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$hammerjs$2f$hammer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Press({
            time: 500
        })); // 500ms for long press
        this.hammer.add(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$hammerjs$2f$hammer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Tap({
            event: 'doubletap',
            taps: 2
        }));
        // Interaction State
        let initialZoom = 1;
        // Pinch (Zoom)
        this.hammer.on('pinchstart', ()=>{
            initialZoom = 1; // reset for next pinch
            this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].TOUCH_PINCH_START);
        });
        this.hammer.on('pinchmove', (e)=>{
            this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].TOUCH_PINCH, e.scale);
        });
        // Two-finger Pan
        this.hammer.on('panmove', (e)=>{
            if (e.pointers.length === 2) {
                this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].TOUCH_PAN, {
                    x: e.deltaX,
                    y: e.deltaY
                });
            }
        });
        // Long Press (Context Menu or special selection)
        this.hammer.on('press', (e)=>{
            this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].TOUCH_LONG_PRESS, {
                x: e.center.x,
                y: e.center.y
            });
        });
        // Double Tap (Focus)
        this.hammer.on('doubletap', ()=>{
            this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].FOCUS_OBJECT);
        });
    }
    onKeyDown(event) {
        switch(event.key){
            case 'z':
                if (event.ctrlKey || event.metaKey) {
                    this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].UNDO);
                }
                break;
            case 'y':
                if (event.ctrlKey || event.metaKey) {
                    this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].REDO);
                }
                break;
            case 'Delete':
            case 'Backspace':
                this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].DELETE_OBJECT);
                break;
            case 'f':
            case 'F':
                this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].FOCUS_OBJECT);
                break;
        }
    }
}
}),
"[project]/src/frontend/PhysicsManager.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PhysicsManager",
    ()=>PhysicsManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cannon$2d$es$2f$dist$2f$cannon$2d$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/cannon-es/dist/cannon-es.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/frontend/logger.js [app-ssr] (ecmascript) <locals>");
;
;
class PhysicsManager {
    constructor(scene){
        this.world = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cannon$2d$es$2f$dist$2f$cannon$2d$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["World"]();
        this.world.gravity.set(0, -9.82, 0); // m/s^2
        this.scene = scene;
        this.bodies = [];
        // Map to store body -> index for O(1) removal
        this.bodyToIndexMap = new Map();
        // Map to store mesh -> body for O(1) lookup
        this.meshToBodyMap = new Map();
        // Check if simulation is paused
        this.paused = true;
        // Store initial transforms to allow resetting the simulation
        this.initialStates = new Map();
    }
    addBody(mesh, mass = 1, shapeType = "box") {
        if (!mesh.geometry.parameters) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].warn("Unsupported geometry for physics body. Geometry has no parameters.");
            return null;
        }
        let shape;
        switch(shapeType){
            case "box":
                {
                    const halfExtents = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cannon$2d$es$2f$dist$2f$cannon$2d$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vec3"](mesh.geometry.parameters.width / 2 * mesh.scale.x, mesh.geometry.parameters.height / 2 * mesh.scale.y, mesh.geometry.parameters.depth / 2 * mesh.scale.z);
                    shape = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cannon$2d$es$2f$dist$2f$cannon$2d$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Box"](halfExtents);
                    break;
                }
            case "sphere":
                {
                    shape = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cannon$2d$es$2f$dist$2f$cannon$2d$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Sphere"](mesh.geometry.parameters.radius * mesh.scale.x);
                    break;
                }
            case "cylinder":
                {
                    shape = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cannon$2d$es$2f$dist$2f$cannon$2d$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Cylinder"](mesh.geometry.parameters.radiusTop * mesh.scale.x, mesh.geometry.parameters.radiusBottom * mesh.scale.x, mesh.geometry.parameters.height * mesh.scale.y, mesh.geometry.parameters.radialSegments);
                    break;
                }
            default:
                {
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].warn("Unsupported shape type for physics body:", shapeType);
                    return null;
                }
        }
        const body = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cannon$2d$es$2f$dist$2f$cannon$2d$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Body"]({
            mass: mass,
            position: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cannon$2d$es$2f$dist$2f$cannon$2d$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vec3"](mesh.position.x, mesh.position.y, mesh.position.z),
            quaternion: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cannon$2d$es$2f$dist$2f$cannon$2d$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Quaternion"](mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w),
            shape: shape
        });
        this.world.addBody(body);
        // Store body and mesh linkage
        const index = this.bodies.length;
        this.bodies.push({
            mesh,
            body
        });
        this.bodyToIndexMap.set(body, index);
        this.meshToBodyMap.set(mesh, body);
        this.initialStates.set(body, {
            position: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cannon$2d$es$2f$dist$2f$cannon$2d$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vec3"](mesh.position.x, mesh.position.y, mesh.position.z),
            quaternion: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cannon$2d$es$2f$dist$2f$cannon$2d$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Quaternion"](mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w)
        });
        return body;
    }
    /**
   * Removes physics body associated with a mesh.
   * @param {THREE.Object3D} mesh
   */ removeObject(mesh) {
        const body = this.meshToBodyMap.get(mesh);
        if (body) {
            this.removeBody(body);
            this.meshToBodyMap.delete(mesh);
        }
    }
    removeBody(bodyToRemove) {
        this.world.removeBody(bodyToRemove);
        const index = this.bodyToIndexMap.get(bodyToRemove);
        if (index !== undefined) {
            const lastIndex = this.bodies.length - 1;
            const itemToRemove = this.bodies[index];
            // Optimization: Swap-Pop strategy (O(1))
            if (index !== lastIndex) {
                const lastItem = this.bodies[lastIndex];
                // Swap with the last element
                this.bodies[index] = lastItem;
                // Update the index of the swapped element in the map
                this.bodyToIndexMap.set(lastItem.body, index);
            }
            // Remove the last element
            this.bodies.pop();
            this.bodyToIndexMap.delete(bodyToRemove);
            this.initialStates.delete(bodyToRemove);
            if (itemToRemove && itemToRemove.mesh) {
                this.meshToBodyMap.delete(itemToRemove.mesh);
            }
        }
    }
    update(deltaTime) {
        if (this.paused) return;
        // Use a fixed time step of 1/60 seconds, with a maximum of 10 substeps to catch up
        this.world.step(1 / 60, deltaTime, 10);
        const bodies = this.bodies;
        const len = bodies.length;
        for(let i = 0; i < len; i++){
            const item = bodies[i];
            item.mesh.position.copy(item.body.position);
            item.mesh.quaternion.copy(item.body.quaternion);
        }
    }
    play() {
        this.paused = false;
    }
    pause() {
        this.paused = true;
    }
    reset() {
        this.paused = true;
        // Restore all bodies to their initial positions and velocities
        const bodies = this.bodies;
        const len = bodies.length;
        for(let i = 0; i < len; i++){
            const item = bodies[i];
            const initial = this.initialStates.get(item.body);
            if (initial) {
                item.body.position.copy(initial.position);
                item.body.quaternion.copy(initial.quaternion);
                // Reset velocities
                item.body.velocity.set(0, 0, 0);
                item.body.angularVelocity.set(0, 0, 0);
                item.body.force.set(0, 0, 0);
                item.body.torque.set(0, 0, 0);
                // Sync mesh instantly
                item.mesh.position.copy(initial.position);
                item.mesh.quaternion.copy(initial.quaternion);
            }
        }
    }
}
}),
"[project]/src/frontend/PrimitiveFactory.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PrimitiveFactory",
    ()=>PrimitiveFactory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.module.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$loaders$2f$FontLoader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/loaders/FontLoader.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$geometries$2f$TextGeometry$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/geometries/TextGeometry.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/frontend/logger.js [app-ssr] (ecmascript) <locals>");
;
;
;
;
;
class PrimitiveFactory {
    constructor(){
        this.font = null;
        this.materialCache = {};
        this.geometryCache = {};
        const loader = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$loaders$2f$FontLoader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FontLoader"]();
        // Use local path for fonts
        loader.load('./assets/fonts/helvetiker_regular.typeface.json', (font)=>{
            this.font = font;
        }, undefined, (err)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].error('Error loading font:', err);
        });
    }
    _createMesh(geometry, color, side = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FrontSide"]) {
        const isTest = typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID;
        const cacheKey = `${color}_${side}`;
        if (!isTest && !this.materialCache[cacheKey]) {
            this.materialCache[cacheKey] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color,
                side,
                roughness: 0.5,
                metalness: 0.1
            });
        }
        const material = isTest ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
            color,
            side,
            roughness: 0.5,
            metalness: 0.1
        }) : this.materialCache[cacheKey];
        const mesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }
    _getNormalizedParameters(type, options) {
        switch(type){
            case 'Box':
                return {
                    width: options.width || 1,
                    height: options.height || 1,
                    depth: options.depth || 1,
                    widthSegments: options.widthSegments || 1,
                    heightSegments: options.heightSegments || 1,
                    depthSegments: options.depthSegments || 1
                };
            case 'Sphere':
                return {
                    radius: options.radius || 0.5,
                    widthSegments: options.widthSegments || 32,
                    heightSegments: options.heightSegments || 32
                };
            case 'Cylinder':
                return {
                    radiusTop: options.radiusTop || 0.5,
                    radiusBottom: options.radiusBottom || 0.5,
                    height: options.height || 1,
                    radialSegments: options.radialSegments || 32
                };
            case 'Cone':
                return {
                    radius: options.radius || 0.5,
                    height: options.height || 1,
                    radialSegments: options.radialSegments || 32
                };
            case 'Torus':
                return {
                    radius: options.radius || 0.4,
                    tube: options.tube || 0.2,
                    radialSegments: options.radialSegments || 16,
                    tubularSegments: options.tubularSegments || 100
                };
            case 'TorusKnot':
                return {
                    radius: options.radius || 0.4,
                    tube: options.tube || 0.15,
                    tubularSegments: options.tubularSegments || 100,
                    radialSegments: options.radialSegments || 16
                };
            case 'Tetrahedron':
            case 'Icosahedron':
            case 'Dodecahedron':
            case 'Octahedron':
                return {
                    radius: options.radius || 0.6
                };
            case 'Plane':
                return {
                    width: options.width || 2,
                    height: options.height || 2,
                    widthSegments: options.widthSegments || 1,
                    heightSegments: options.heightSegments || 1
                };
            case 'Lathe':
                return {
                    segments: 12
                };
            case 'Teapot':
                return {
                    size: options.size || 0.4,
                    segments: options.segments || 15,
                    bottom: options.bottom !== undefined ? options.bottom : true,
                    lid: options.lid !== undefined ? options.lid : true,
                    body: options.body !== undefined ? options.body : true,
                    fitLid: options.fitLid !== undefined ? options.fitLid : true,
                    blinn: options.blinn !== undefined ? options.blinn : true
                };
            case 'Tube':
                return {
                    path: options.path ? options.path.points : 'default',
                    // Serialize curve points
                    tubularSegments: options.tubularSegments || 20,
                    radius: options.radius || 0.2,
                    radialSegments: options.radialSegments || 8,
                    closed: options.closed || false
                };
            case 'Text':
                return {
                    text: options.text || 'Polyhedra',
                    size: options.size || 0.5,
                    height: options.height || 0.2,
                    curveSegments: options.curveSegments || 12,
                    bevelEnabled: options.bevelEnabled !== undefined ? options.bevelEnabled : true,
                    bevelThickness: options.bevelThickness || 0.03,
                    bevelSize: options.bevelSize || 0.02,
                    bevelOffset: options.bevelOffset || 0,
                    bevelSegments: options.bevelSegments || 5
                };
            case 'Extrude':
                return {
                    steps: options.steps || 2,
                    depth: options.depth || 0.2,
                    bevelEnabled: options.bevelEnabled !== undefined ? options.bevelEnabled : true,
                    bevelThickness: options.bevelThickness || 0.1,
                    bevelSize: options.bevelSize || 0.1,
                    bevelOffset: options.bevelOffset || 0,
                    bevelSegments: options.bevelSegments || 1,
                    shapePoints: options.shapePoints || [
                        {
                            x: 0,
                            y: 0
                        },
                        {
                            x: 0,
                            y: 1
                        },
                        {
                            x: 1,
                            y: 1
                        },
                        {
                            x: 1,
                            y: 0
                        }
                    ]
                };
            default:
                // Exclude color and other non-geometry props from key
                // eslint-disable-next-line no-unused-vars
                const { color, ...rest } = options;
                return rest;
        }
    }
    _getCachedGeometry(type, options) {
        const params = this._getNormalizedParameters(type, options);
        const key = `${type}_${JSON.stringify(params)}`;
        if (this.geometryCache[key]) {
            return this.geometryCache[key];
        }
        let geometry;
        switch(type){
            case 'Box':
                geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoxGeometry"](params.width, params.height, params.depth, params.widthSegments, params.heightSegments, params.depthSegments);
                break;
            case 'Sphere':
                geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SphereGeometry"](params.radius, params.widthSegments, params.heightSegments);
                break;
            case 'Cylinder':
                geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](params.radiusTop, params.radiusBottom, params.height, params.radialSegments);
                break;
            case 'Cone':
                geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConeGeometry"](params.radius, params.height, params.radialSegments);
                break;
            case 'Torus':
                geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TorusGeometry"](params.radius, params.tube, params.radialSegments, params.tubularSegments);
                break;
            case 'TorusKnot':
                geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TorusKnotGeometry"](params.radius, params.tube, params.tubularSegments, params.radialSegments);
                break;
            case 'Tetrahedron':
                geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TetrahedronGeometry"](params.radius);
                break;
            case 'Icosahedron':
                geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IcosahedronGeometry"](params.radius);
                break;
            case 'Dodecahedron':
                geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DodecahedronGeometry"](params.radius);
                break;
            case 'Octahedron':
                geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OctahedronGeometry"](params.radius);
                break;
            case 'Plane':
                geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](params.width, params.height, params.widthSegments, params.heightSegments);
                break;
            case 'Lathe':
                const pointsLathe = [];
                for(let i = 0; i < 10; i++){
                    pointsLathe.push(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](Math.sin(i * 0.2) * 0.5 + 0.5, (i - 5) * 0.2));
                }
                geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LatheGeometry"](pointsLathe, 12);
                break;
            case 'Tube':
                const tubePath = options.path || new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CatmullRomCurve3"]([
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](-0.5, 0, 0),
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, 0.5, 0),
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0.5, 0, 0),
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](0, -0.5, 0)
                ]);
                geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TubeGeometry"](tubePath, params.tubularSegments, params.radius, params.radialSegments, params.closed);
                break;
            case 'Extrude':
                const shape = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Shape"]();
                const points = params.shapePoints;
                if (points.length > 0) {
                    shape.moveTo(points[0].x, points[0].y);
                    for(let i = 1; i < points.length; i++){
                        shape.lineTo(points[i].x, points[i].y);
                    }
                    shape.lineTo(points[0].x, points[0].y); // close
                }
                if (!options.shapePoints) {
                    const hole = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Path"]();
                    hole.moveTo(0.2, 0.2);
                    hole.lineTo(0.8, 0.2);
                    hole.lineTo(0.8, 0.8);
                    hole.lineTo(0.2, 0.8);
                    hole.lineTo(0.2, 0.2);
                    shape.holes.push(hole);
                }
                geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ExtrudeGeometry"](shape, {
                    steps: params.steps,
                    depth: params.depth,
                    bevelEnabled: params.bevelEnabled,
                    bevelThickness: params.bevelThickness,
                    bevelSize: params.bevelSize,
                    bevelOffset: params.bevelOffset,
                    bevelSegments: params.bevelSegments
                });
                break;
            default:
                return null;
        }
        if (geometry) {
            this.geometryCache[key] = geometry;
        }
        return geometry;
    }
    createPrimitive(type, options = {}) {
        if (type === 'Text') {
            return new Promise((resolve)=>{
                if (this.font) {
                    const params = this._getNormalizedParameters('Text', options);
                    const cacheKey = `Text_${JSON.stringify(params)}`;
                    if (this.geometryCache[cacheKey]) {
                        const mesh = this._createMesh(this.geometryCache[cacheKey], options.color || 0x00bfff);
                        mesh.userData.primitiveType = type;
                        mesh.userData.primitiveOptions = options;
                        resolve(mesh);
                        return;
                    }
                    const geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$geometries$2f$TextGeometry$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextGeometry"](options.text || 'Polyhedra', {
                        font: this.font,
                        size: options.size || 0.5,
                        depth: options.height || 0.2,
                        // TextGeometry uses depth instead of height in newer Three.js
                        curveSegments: options.curveSegments || 12,
                        bevelEnabled: options.bevelEnabled || true,
                        bevelThickness: options.bevelThickness || 0.03,
                        bevelSize: options.bevelSize || 0.02,
                        bevelOffset: options.bevelOffset || 0,
                        bevelSegments: options.bevelSegments || 5
                    });
                    geometry.center();
                    this.geometryCache[cacheKey] = geometry;
                    const mesh = this._createMesh(geometry, options.color || 0x00bfff);
                    mesh.userData.primitiveType = type;
                    mesh.userData.primitiveOptions = options;
                    resolve(mesh);
                } else {
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].error('Font not loaded. Cannot create text.');
                    resolve(null);
                }
            });
        }
        if (type === 'Teapot') {
            const teapot = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            teapot.name = 'Teapot';
            const teapotColor = options.color || 0x800000;
            teapot.add(this._createMesh(this._getCachedGeometry('Sphere', {
                radius: 0.4,
                widthSegments: 32,
                heightSegments: 32
            }), teapotColor));
            const spout = this._createMesh(this._getCachedGeometry('Cylinder', {
                radiusTop: 0.05,
                radiusBottom: 0.08,
                height: 0.3,
                radialSegments: 8
            }), teapotColor);
            spout.position.set(0.4, 0, 0);
            teapot.add(spout);
            const handle = this._createMesh(this._getCachedGeometry('Torus', {
                radius: 0.15,
                tube: 0.03,
                radialSegments: 8,
                tubularSegments: 16
            }), teapotColor);
            handle.position.set(-0.4, 0, 0);
            teapot.add(handle);
            const lid = this._createMesh(this._getCachedGeometry('Cylinder', {
                radiusTop: 0.35,
                radiusBottom: 0.4,
                height: 0.05,
                radialSegments: 32
            }), teapotColor);
            lid.position.set(0, 0.4, 0);
            teapot.add(lid);
            const knob = this._createMesh(this._getCachedGeometry('Sphere', {
                radius: 0.08,
                widthSegments: 16,
                heightSegments: 16
            }), teapotColor);
            knob.position.set(0, 0.45, 0);
            teapot.add(knob);
            teapot.userData.primitiveType = type;
            teapot.userData.primitiveOptions = options;
            return teapot;
        }
        let geometry = this._getCachedGeometry(type, options);
        let color = options.color || 0x00ff00;
        let mesh;
        if (geometry) {
            mesh = this._createMesh(geometry, color, type === 'Plane' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FrontSide"]);
        } else {
            // Handle specialized cases like LOD which might not be trivially cacheable
            switch(type){
                case 'LODCube':
                    const lod = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOD"]();
                    const lodMaterial = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                        color: options.color || 0x00ff00,
                        roughness: 0.5,
                        metalness: 0.1
                    });
                    lod.addLevel(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](this._getCachedGeometry('Box', {
                        width: 1,
                        height: 1,
                        depth: 1
                    }), lodMaterial), 0);
                    lod.addLevel(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](this._getCachedGeometry('Box', {
                        width: 1,
                        height: 1,
                        depth: 1
                    }), lodMaterial), 5);
                    lod.addLevel(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](this._getCachedGeometry('Box', {
                        width: 1,
                        height: 1,
                        depth: 1
                    }), lodMaterial), 10);
                    mesh = lod;
                    break;
                default:
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].error(`Unknown primitive type: ${type}`);
                    return null;
            }
        }
        if (mesh) {
            if (!mesh.userData) mesh.userData = {};
            mesh.userData.primitiveType = type;
            mesh.userData.primitiveOptions = options;
            // Ensure children also have userData if it's a group like Teapot or LOD
            if (mesh.children && mesh.children.length > 0) {
            // We might not need to set it on children if we save/restore the root
            }
        }
        return mesh;
    }
}
}),
"[project]/src/frontend/ObjectFactory.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ObjectFactory",
    ()=>ObjectFactory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/constants.js [app-ssr] (ecmascript)");
;
class ObjectFactory {
    constructor(scene, primitiveFactory, eventBus){
        this.scene = scene;
        this.primitiveFactory = primitiveFactory;
        this.eventBus = eventBus;
    }
    async addPrimitive(type, options = {}) {
        const meshResult = this.primitiveFactory.createPrimitive(type, options);
        let mesh;
        if (meshResult instanceof Promise) {
            mesh = await meshResult;
        } else {
            mesh = meshResult;
        }
        if (mesh) {
            this.scene.add(mesh);
            this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].OBJECT_ADDED, mesh);
        }
        return mesh;
    }
    duplicateObject(object) {
        if (!object) return null;
        // Clone the object
        const newObject = object.clone();
        // If the object has a geometry, clone it
        if (object.geometry) {
            newObject.geometry = object.geometry.clone();
        }
        // If the object has a material, clone it
        if (object.material) {
            if (Array.isArray(object.material)) {
                newObject.material = object.material.map((material)=>material.clone());
            } else {
                newObject.material = object.material.clone();
            }
        }
        // Set a new name for the duplicated object
        newObject.name = object.name ? `${object.name}_copy` : `${object.uuid}_copy`;
        // Add a small offset to the position to avoid z-fighting
        newObject.position.addScalar(0.5);
        // Add the new object to the scene
        this.scene.add(newObject);
        return newObject;
    }
}
}),
"[project]/src/frontend/ObjectPropertyUpdater.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ObjectPropertyUpdater",
    ()=>ObjectPropertyUpdater
]);
// @ts-check
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.module.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/utils/Logger.js [app-ssr] (ecmascript)");
;
;
class ObjectPropertyUpdater {
    /**
   * @param {any} primitiveFactory
   */ constructor(primitiveFactory){
        this.primitiveFactory = primitiveFactory;
    }
    /**
   * Updates the material properties of an object.
   * @param {THREE.Object3D} object
   * @param {object} properties
   */ updateMaterial(object, properties) {
        // @ts-ignore
        if (object && object.material) {
            // @ts-ignore
            const materials = Array.isArray(object.material) ? object.material : [
                object.material
            ];
            materials.forEach((material)=>{
                for(const key in properties){
                    if (Object.prototype.hasOwnProperty.call(properties, key)) {
                        if (key === 'color' || key === 'emissive') {
                            if (typeof properties[key] === 'string') {
                                material[key].set(properties[key]);
                            } else {
                                material[key].setHex(properties[key]);
                            }
                        } else if (material[key] !== undefined) {
                            material[key] = properties[key];
                        }
                    }
                }
                material.needsUpdate = true;
            });
        }
    }
    /**
   * Adds a texture to an object.
   * @param {THREE.Object3D} object
   * @param {File} file
   * @param {string} [type='map']
   */ addTexture(object, file, type = 'map') {
        // @ts-ignore
        if (!object.material) return;
        const loader = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextureLoader"]();
        const url = URL.createObjectURL(file);
        loader.load(url, (texture)=>{
            // @ts-ignore
            const materials = Array.isArray(object.material) ? object.material : [
                object.material
            ];
            materials.forEach((material)=>{
                material[type] = texture;
                material.needsUpdate = true;
            });
            URL.revokeObjectURL(url);
        }, undefined, (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Logger"].warn('Error loading texture:', error);
            URL.revokeObjectURL(url);
        });
    }
    /**
   * Updates the primitive geometry of an object.
   * @param {THREE.Object3D} object
   * @param {object} parameters
   */ updatePrimitive(object, parameters) {
        // @ts-ignore
        if (object && object.geometry) {
            const type = object.geometry.type.replace('Geometry', '');
            const tempMeshOrPromise = this.primitiveFactory.createPrimitive(type, parameters);
            const updateGeo = (tempMesh)=>{
                if (tempMesh && tempMesh.geometry) {
                    // @ts-ignore
                    object.geometry.dispose();
                    // @ts-ignore
                    object.geometry = tempMesh.geometry;
                }
            };
            if (tempMeshOrPromise instanceof Promise) {
                tempMeshOrPromise.then(updateGeo);
            } else {
                updateGeo(tempMeshOrPromise);
            }
        }
    }
}
}),
"[project]/src/frontend/LightManager.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LightManager",
    ()=>LightManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.module.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/frontend/logger.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/constants.js [app-ssr] (ecmascript)");
;
;
;
class LightManager {
    constructor(scene, eventBus){
        this.scene = scene;
        this.eventBus = eventBus;
        /** @type {THREE.Light[]} */ this.lights = [];
        // Add a default ambient light
        const ambientLight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AmbientLight"](0x404040); // soft white light
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        // Add a default directional light
        const directionalLight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DirectionalLight"](0xffffff, 1);
        if (directionalLight.position) {
            directionalLight.position.set(1, 1, 1).normalize();
        }
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
    }
    addLight(type, color, intensity, position, name) {
        let light;
        switch(type){
            case 'PointLight':
                light = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](color, intensity);
                break;
            case 'DirectionalLight':
                light = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DirectionalLight"](color, intensity);
                break;
            case 'AmbientLight':
                light = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AmbientLight"](color, intensity);
                break;
            default:
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].warn('Unknown light type:', type);
                return null;
        }
        if (position && light.position) {
            light.position.set(position.x, position.y, position.z);
        }
        light.name = name || type;
        this.scene.add(light);
        this.lights.push(light);
        this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].LIGHT_ADDED, light); // Emit event
        return light;
    }
    removeLight(light) {
        this.scene.remove(light);
        if (light.dispose) {
            light.dispose();
        }
        this.lights = this.lights.filter((l)=>l !== light);
        this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].LIGHT_REMOVED, light); // Emit event
    }
    updateLight(light, properties) {
        for(const prop in properties){
            if (light[prop] !== undefined) {
                if (prop === 'color') {
                    light.color.set(properties[prop]);
                } else if (prop === 'position' && light.position) {
                    light.position.set(properties.position.x, properties.position.y, properties.position.z);
                } else {
                    light[prop] = properties[prop];
                }
            }
        }
        this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].LIGHT_UPDATED, light); // Emit event
    }
    changeLightType(oldLight, newType) {
        const oldPosition = oldLight.position ? oldLight.position.clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
        const oldColor = oldLight.color.getHex();
        const oldIntensity = oldLight.intensity;
        const oldName = oldLight.name;
        this.removeLight(oldLight);
        const newLight = this.addLight(newType, oldColor, oldIntensity, oldPosition, oldName);
        return newLight;
    }
}
}),
"[project]/src/frontend/ModelLoader.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ModelLoader",
    ()=>ModelLoader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.module.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$loaders$2f$OBJLoader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/loaders/OBJLoader.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$loaders$2f$GLTFLoader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/loaders/GLTFLoader.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/constants.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/frontend/logger.js [app-ssr] (ecmascript) <locals>");
;
;
;
;
;
class ModelLoader {
    constructor(scene, eventBus){
        this.scene = scene;
        this.eventBus = eventBus;
        this.objLoader = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$loaders$2f$OBJLoader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OBJLoader"]();
        this.gltfLoader = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$loaders$2f$GLTFLoader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GLTFLoader"]();
    }
    loadModel(file) {
        return new Promise((resolve, reject)=>{
            const url = URL.createObjectURL(file);
            const ext = file.name.split(".").pop().toLowerCase();
            const onLoad = (object)=>{
                // Normalize size
                const box = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Box3"]().setFromObject(object);
                const size = box.getSize(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2 / maxDim; // Scale to fit in a 2x2x2 box roughly
                object.scale.setScalar(scale);
                // Sit on floor (y=0)
                object.position.y = size.y * scale / 2;
                // Traverse to fix materials and shadows
                object.traverse((child)=>{
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        // Ensure standard material for lighting interactions if needed
                        // But respect existing materials if they are good
                        if (!(child.material instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]) && !(child.material instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshPhysicalMaterial"])) {
                            // Clone incompatible material props to Standard
                            const newMat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                                color: child.material.color || 0xffffff,
                                map: child.material.map || null
                            });
                            child.material = newMat;
                        }
                    }
                });
                object.name = file.name;
                this.scene.add(object);
                if (this.eventBus) {
                    this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].OBJECT_ADDED, object);
                }
                URL.revokeObjectURL(url);
                resolve(object);
            };
            const onError = (e)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].error("Error loading model:", e);
                URL.revokeObjectURL(url);
                reject(e);
            };
            if (ext === "obj") {
                this.objLoader.load(url, onLoad, undefined, onError);
            } else if (ext === "glb" || ext === "gltf") {
                this.gltfLoader.load(url, (gltf)=>onLoad(gltf.scene), undefined, onError);
            } else {
                URL.revokeObjectURL(url);
                reject(new Error("Unsupported file format. Please use .obj, .glb, or .gltf"));
            }
        });
    }
}
}),
"[project]/src/frontend/AnimationManager.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AnimationManager",
    ()=>AnimationManager
]);
class AnimationManager {
    constructor(){
        this.keyframes = {}; // { [uuid]: { [property]: [{time, value}] } }
        this.currentTime = 0;
        this.isPlaying = false;
    }
    addKeyframe(uuid, property, time, value) {
        if (!this.keyframes[uuid]) {
            this.keyframes[uuid] = {};
        }
        if (!this.keyframes[uuid][property]) {
            this.keyframes[uuid][property] = [];
        }
        const frames = this.keyframes[uuid][property];
        const index = frames.findIndex((f)=>f.time === time);
        if (index !== -1) {
            frames[index].value = value;
        } else {
            frames.push({
                time,
                value
            });
            frames.sort((a, b)=>a.time - b.time);
        }
    }
    getKeyframes(uuid, property) {
        return this.keyframes[uuid]?.[property] || [];
    }
    getValueAtTime(uuid, property, time) {
        const frames = this.getKeyframes(uuid, property);
        if (frames.length === 0) return null;
        if (frames.length === 1) return frames[0].value;
        if (time <= frames[0].time) return frames[0].value;
        if (time >= frames[frames.length - 1].time) {
            return frames[frames.length - 1].value;
        }
        for(let i = 0; i < frames.length - 1; i++){
            const start = frames[i];
            const end = frames[i + 1];
            if (time >= start.time && time <= end.time) {
                const alpha = (time - start.time) / (end.time - start.time);
                return start.value + (end.value - start.value) * alpha;
            }
        }
        return null;
    }
    play() {
        this.isPlaying = true;
    }
    pause() {
        this.isPlaying = false;
    }
    seek(time) {
        this.currentTime = time;
    }
    update(deltaTime, scene) {
        if (!this.isPlaying) return;
        this.currentTime += deltaTime;
        scene.traverse((object)=>{
            this.updateObject(object);
        });
    }
    updateObject(object) {
        const uuid = object.uuid;
        const objectKeyframes = this.keyframes[uuid];
        if (!objectKeyframes) return;
        for(const property in objectKeyframes){
            const value = this.getValueAtTime(uuid, property, this.currentTime);
            if (value !== null) {
                this._setProperty(object, property, value);
            }
        }
    }
    _setProperty(object, property, value) {
        const parts = property.split('.');
        let current = object;
        for(let i = 0; i < parts.length - 1; i++){
            if (current[parts[i]] === undefined) return;
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
    }
}
}),
"[project]/src/frontend/TimelineUI.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TimelineUI",
    ()=>TimelineUI
]);
class TimelineUI {
    constructor(container, animationManager, eventBus, exportManager){
        this.container = container;
        this.animationManager = animationManager;
        this.eventBus = eventBus;
        this.exportManager = exportManager;
        this.selectedObject = null;
        this.init();
    }
    init() {
        const timelineContainer = document.createElement('div');
        timelineContainer.className = 'timeline-ui';
        timelineContainer.style.position = 'fixed';
        timelineContainer.style.bottom = '20px';
        timelineContainer.style.left = '20px';
        timelineContainer.style.right = '20px';
        timelineContainer.style.zIndex = '1000';
        timelineContainer.style.backgroundColor = 'rgba(0,0,0,0.7)';
        timelineContainer.style.padding = '10px';
        timelineContainer.style.borderRadius = '8px';
        timelineContainer.style.display = 'flex';
        timelineContainer.style.alignItems = 'center';
        timelineContainer.style.gap = '10px';
        timelineContainer.style.color = 'white';
        this.playPauseBtn = document.createElement('button');
        this.playPauseBtn.className = 'play-pause-btn';
        this.playPauseBtn.textContent = 'Play';
        this.playPauseBtn.style.padding = '5px 15px';
        this.playPauseBtn.addEventListener('click', ()=>this.togglePlay());
        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.min = '0';
        this.slider.max = '10';
        this.slider.step = '0.01';
        this.slider.value = '0';
        this.slider.style.flex = '1';
        this.slider.addEventListener('input', ()=>{
            this.animationManager.seek(parseFloat(this.slider.value));
        });
        this.addKeyframeBtn = document.createElement('button');
        this.addKeyframeBtn.className = 'add-keyframe-btn';
        this.addKeyframeBtn.textContent = 'Key+';
        this.addKeyframeBtn.title = 'Add Keyframe';
        this.addKeyframeBtn.style.padding = '5px 10px';
        this.addKeyframeBtn.addEventListener('click', ()=>this.addKeyframe());
        this.recordBtn = document.createElement('button');
        this.recordBtn.className = 'record-btn';
        this.recordBtn.textContent = 'REC';
        this.recordBtn.style.padding = '5px 15px';
        this.recordBtn.style.backgroundColor = '#440000';
        this.recordBtn.style.color = 'white';
        this.recordBtn.style.borderRadius = '50%';
        this.recordBtn.style.border = '2px solid white';
        this.recordBtn.addEventListener('click', ()=>this.toggleRecord());
        timelineContainer.appendChild(this.playPauseBtn);
        timelineContainer.appendChild(this.slider);
        timelineContainer.appendChild(this.addKeyframeBtn);
        timelineContainer.appendChild(this.recordBtn);
        this.container.appendChild(timelineContainer);
    }
    togglePlay() {
        if (this.animationManager.isPlaying) {
            this.animationManager.pause();
            this.playPauseBtn.textContent = 'Play';
        } else {
            this.animationManager.play();
            this.playPauseBtn.textContent = 'Pause';
        }
    }
    toggleRecord() {
        if (!this.exportManager) return;
        if (this.exportManager.isRecording) {
            this.exportManager.stopRecording();
            this.recordBtn.textContent = 'REC';
            this.recordBtn.style.backgroundColor = '#440000';
        } else {
            this.exportManager.startRecording();
            if (this.exportManager.isRecording) {
                this.recordBtn.textContent = 'STOP';
                this.recordBtn.style.backgroundColor = '#ff0000';
            }
        }
    }
    addKeyframe() {
        if (!this.selectedObject) {
            return;
        }
        const time = this.animationManager.currentTime;
        const obj = this.selectedObject;
        // Support position, rotation, scale
        if (obj.position) {
            this.animationManager.addKeyframe(obj.uuid, 'position.x', time, obj.position.x);
            this.animationManager.addKeyframe(obj.uuid, 'position.y', time, obj.position.y);
            this.animationManager.addKeyframe(obj.uuid, 'position.z', time, obj.position.z);
        }
        if (obj.rotation) {
            this.animationManager.addKeyframe(obj.uuid, 'rotation.x', time, obj.rotation.x);
            this.animationManager.addKeyframe(obj.uuid, 'rotation.y', time, obj.rotation.y);
            this.animationManager.addKeyframe(obj.uuid, 'rotation.z', time, obj.rotation.z);
        }
        if (obj.scale) {
            this.animationManager.addKeyframe(obj.uuid, 'scale.x', time, obj.scale.x);
            this.animationManager.addKeyframe(obj.uuid, 'scale.y', time, obj.scale.y);
            this.animationManager.addKeyframe(obj.uuid, 'scale.z', time, obj.scale.z);
        }
    }
    setSelectedObject(object) {
        this.selectedObject = object;
    }
    update() {
        if (this.animationManager.isPlaying) {
            this.slider.value = this.animationManager.currentTime.toString();
            // Handle loop or end of playback
            if (this.animationManager.currentTime >= parseFloat(this.slider.max)) {
                this.animationManager.seek(0);
            }
        }
    }
}
}),
"[project]/src/frontend/ExportManager.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* global CCapture */ __turbopack_context__.s([
    "ExportManager",
    ()=>ExportManager
]);
class ExportManager {
    constructor(renderer, scene, camera){
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.capturer = null;
        this.isRecording = false;
    }
    captureFrame(format = 'image/png') {
        // Ensure we render the current state
        this.renderer.render(this.scene, this.camera);
        return this.renderer.domElement.toDataURL(format);
    }
    downloadFrame(filename, dataURL) {
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = filename;
        a.click();
    }
    saveImage(filename = 'scene.png', format = 'image/png') {
        const dataURL = this.captureFrame(format);
        this.downloadFrame(filename, dataURL);
    }
    startRecording(format = 'webm', framerate = 60) {
        if (this.isRecording) return;
        // CCapture is expected to be loaded globally via CCapture.all.min.js
        if (typeof CCapture === 'undefined') {
            console.error('CCapture is not loaded. Please ensure CCapture.all.min.js is included.');
            return;
        }
        this.capturer = new CCapture({
            format: format,
            framerate: framerate,
            verbose: true,
            display: true // Show progress overlay
        });
        this.capturer.start();
        this.isRecording = true;
        console.log('Recording started...');
    }
    capture() {
        if (this.isRecording && this.capturer) {
            this.capturer.capture(this.renderer.domElement);
        }
    }
    stopRecording() {
        if (!this.isRecording || !this.capturer) return;
        this.capturer.stop();
        this.capturer.save();
        this.isRecording = false;
        this.capturer = null;
        console.log('Recording stopped and saving...');
    }
}
}),
"[project]/src/frontend/ErrorHandler.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ErrorHandler",
    ()=>ErrorHandler
]);
// @ts-check
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/utils/Logger.js [app-ssr] (ecmascript)");
;
class ErrorHandler {
    /**
   * Initialize global error handlers
   * @param {import('./ToastManager.js').ToastManager} toastManager
   */ static init(toastManager) {
        window.addEventListener('error', (event)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Logger"].error('Uncaught Exception', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno
            });
            if (toastManager) {
                toastManager.show(`Error: ${event.message}`, 'error');
            }
        });
        window.addEventListener('unhandledrejection', (event)=>{
            const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Logger"].error('Unhandled Promise Rejection', {
                reason
            });
            if (toastManager) {
                toastManager.show(`Promise Rejected: ${reason}`, 'error');
            }
        });
    }
}
}),
"[project]/src/frontend/ViewCube.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ViewCube",
    ()=>ViewCube
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.module.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tweenjs$2f$tween$2e$js$2f$dist$2f$tween$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tweenjs/tween.js/dist/tween.esm.js [app-ssr] (ecmascript)");
;
;
class ViewCube {
    constructor(mainCamera, orbitControls, containerObject){
        this.update = ()=>{};
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        this.mainCamera = mainCamera;
        this.controls = orbitControls;
        this.container = document.createElement('div');
        this.container.id = 'view-cube';
        this.container.style.position = 'absolute';
        this.container.style.top = '10px';
        this.container.style.right = '10px';
        this.container.style.width = '120px';
        this.container.style.height = '120px';
        this.container.style.zIndex = '100';
        containerObject.appendChild(this.container);
        this.scene = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Scene"]();
        // Setup camera
        this.camera = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PerspectiveCamera"](50, 1, 0.1, 100);
        this.camera.position.z = 4;
        this.renderer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WebGLRenderer"]({
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(120, 120);
        if (this.renderer.domElement && this.renderer.domElement.tagName) {
            this.container.appendChild(this.renderer.domElement);
        }
        // Setup Geometry and Material
        const geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoxGeometry"](1.5, 1.5, 1.5);
        // Create materials for each face with text
        const faces = [
            'Right',
            'Left',
            'Top',
            'Bottom',
            'Front',
            'Back'
        ];
        const materials = faces.map((text)=>{
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const context = canvas.getContext('2d');
            context.fillStyle = '#cccccc';
            context.fillRect(0, 0, 128, 128);
            context.font = '24px Arial';
            context.fillStyle = '#000000';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, 64, 64);
            const texture = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CanvasTexture"](canvas);
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshBasicMaterial"]({
                map: texture
            });
        });
        this.cube = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](geometry, materials);
        this.scene.add(this.cube);
        // Edges
        const edges = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EdgesGeometry"](geometry);
        const line = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LineSegments"](edges, new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LineBasicMaterial"]({
            color: 0x000000,
            linewidth: 2
        }));
        this.cube.add(line);
        // Raycaster for clicks
        this.raycaster = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Raycaster"]();
        this.mouse = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]();
        this.onMouseDown = this.onMouseDown.bind(this);
        this.container.addEventListener('mousedown', this.onMouseDown, false);
    }
    onMouseDown(event) {
        event.preventDefault();
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.cube);
        if (intersects.length > 0) {
            const faceIndex = Math.floor(intersects[0].faceIndex / 2);
            this.tweenToFace(faceIndex);
        }
    }
    tweenToFace(faceIndex) {
        // Determine target rotation based on face
        // Faces: 0: Right, 1: Left, 2: Top, 3: Bottom, 4: Front, 5: Back
        const targetPosition = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
        const distance = this.mainCamera.position.distanceTo(this.controls.target);
        switch(faceIndex){
            case 0:
                targetPosition.set(distance, 0, 0);
                break;
            // Right
            case 1:
                targetPosition.set(-distance, 0, 0);
                break;
            // Left
            case 2:
                targetPosition.set(0, distance, 0);
                break;
            // Top
            case 3:
                targetPosition.set(0, -distance, 0);
                break;
            // Bottom
            case 4:
                targetPosition.set(0, 0, distance);
                break;
            // Front
            case 5:
                targetPosition.set(0, 0, -distance);
                break;
        }
        targetPosition.add(this.controls.target);
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tweenjs$2f$tween$2e$js$2f$dist$2f$tween$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tween"](this.mainCamera.position).to({
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z
        }, 500).easing(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tweenjs$2f$tween$2e$js$2f$dist$2f$tween$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Easing"].Cubic.Out).onUpdate(()=>this.controls.update()).start();
    }
    update() {
        // Copy the rotation from the main camera to the view cube
        this.camera.rotation.copy(this.mainCamera.rotation);
        this.camera.position.copy(this.mainCamera.position).normalize().multiplyScalar(4);
        this.camera.lookAt(0, 0, 0);
        this.renderer.render(this.scene, this.camera);
    }
}
}),
"[project]/src/frontend/ShaderEditor.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShaderEditor",
    ()=>ShaderEditor
]);
// @ts-check
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.module.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$codemirror$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/codemirror/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$codemirror$2f$view$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@codemirror/view/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$codemirror$2f$lang$2d$cpp$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@codemirror/lang-cpp/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$codemirror$2f$state$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@codemirror/state/dist/index.js [app-ssr] (ecmascript)");
;
;
;
;
class ShaderEditor {
    /**
   * @param {import('dat.gui').GUI} gui
   * @param {THREE.WebGLRenderer} renderer
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   * @param {any} eventBus
   * @param {import('./ToastManager.js').ToastManager} toastManager
   */ constructor(gui, renderer, scene, camera, eventBus, toastManager){
        this.eventBus = eventBus;
        this.gui = gui;
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.toastManager = toastManager;
        /** @type {THREE.ShaderMaterial|null} */ this.shaderMaterial = null;
        /** @type {THREE.Mesh|null} */ this.shaderMesh = null;
        this.uniforms = {};
        /** @type {import('dat.gui').GUI|null} */ this.editorFolder = null;
        /** @type {import('dat.gui').GUI|null} */ this.uniformsFolder = null;
        // CodeMirror specific properties
        this.vertexShaderCode = `void main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}`;
        this.fragmentShaderCode = `void main() {\n  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n}`;
        this.activeTab = 'fragment'; // 'vertex' or 'fragment'
        this.uiContainer = null;
        this.editorView = null;
        this.initGUI();
    }
    initGUI() {
        this.editorFolder = this.gui.addFolder('Shader Editor');
        this.editorFolder.add({
            createShader: ()=>this.createShader()
        }, 'createShader').name('Create New Shader');
        this.editorFolder.open();
    }
    createShader() {
        if (this.shaderMaterial) {
            this.shaderMaterial.dispose();
        }
        if (this.shaderMesh) {
            this.scene.remove(this.shaderMesh);
            if (this.shaderMesh.geometry) this.shaderMesh.geometry.dispose();
        }
        if (this.uniformsFolder && this.editorFolder) {
            try {
                this.editorFolder.removeFolder(this.uniformsFolder);
            } catch (e) {
            // ignore
            }
            this.uniformsFolder = null;
        }
        this.uniforms = {
            uTime: {
                value: 0
            }
        };
        this.shaderMaterial = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ShaderMaterial"]({
            vertexShader: this.vertexShaderCode,
            fragmentShader: this.fragmentShaderCode,
            uniforms: this.uniforms
        });
        const mesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoxGeometry"](1, 1, 1), this.shaderMaterial);
        mesh.name = 'ShaderMesh';
        this.shaderMesh = mesh;
        this.scene.add(mesh);
        if (this.eventBus) {
            this.eventBus.publish('objectAdded', mesh);
        }
        this.addShaderControls();
        this.openUI();
        return mesh;
    }
    addShaderControls() {
        if (!this.editorFolder || !this.shaderMaterial) return;
        if (this.uniformsFolder) {
            try {
                this.editorFolder.removeFolder(this.uniformsFolder);
            } catch (e) {
            // ignore
            }
        }
        this.uniformsFolder = this.editorFolder.addFolder('Uniforms');
        // Example: Add a float uniform for time hook
        this.uniformsFolder.add({
            openEditor: ()=>this.openUI()
        }, 'openEditor').name('Open Code Editor');
        this.uniformsFolder.open();
    }
    openUI() {
        if (this.uiContainer) {
            this.uiContainer.style.display = 'block';
            return;
        }
        // 1. Create Floating Wrapper
        this.uiContainer = document.createElement('div');
        this.uiContainer.id = 'shader-editor-ui';
        // 2. Create Header & Tabs
        const header = document.createElement('div');
        header.className = 'shader-header';
        const title = document.createElement('span');
        title.innerText = 'GLSL Shader Editor';
        const tabs = document.createElement('div');
        tabs.className = 'shader-tabs';
        const fragTab = document.createElement('button');
        fragTab.innerText = 'Fragment Shader';
        fragTab.className = 'active';
        const vertTab = document.createElement('button');
        vertTab.innerText = 'Vertex Shader';
        const switchTab = (type)=>{
            if (this.activeTab === type) return;
            // Save current code to state before switching
            if (this.activeTab === 'fragment') {
                this.fragmentShaderCode = this.editorView.state.doc.toString();
            } else {
                this.vertexShaderCode = this.editorView.state.doc.toString();
            }
            this.activeTab = type;
            fragTab.className = type === 'fragment' ? 'active' : '';
            vertTab.className = type === 'vertex' ? 'active' : '';
            // Inject new code into editor
            const newState = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$codemirror$2f$state$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EditorState"].create({
                doc: type === 'fragment' ? this.fragmentShaderCode : this.vertexShaderCode,
                extensions: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$codemirror$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["basicSetup"],
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$codemirror$2f$lang$2d$cpp$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cpp"])()
                ]
            });
            this.editorView.setState(newState);
        };
        fragTab.onclick = ()=>switchTab('fragment');
        vertTab.onclick = ()=>switchTab('vertex');
        tabs.appendChild(fragTab);
        tabs.appendChild(vertTab);
        header.appendChild(title);
        header.appendChild(tabs);
        // 3. Create Editor Container
        const editorContainer = document.createElement('div');
        editorContainer.id = 'codemirror-container';
        // 4. Create Footer / Actions
        const footer = document.createElement('div');
        footer.className = 'shader-footer';
        const closeBtn = document.createElement('button');
        closeBtn.innerText = 'Close';
        closeBtn.onclick = ()=>{
            this.uiContainer.style.display = 'none';
        };
        const applyBtn = document.createElement('button');
        applyBtn.innerText = 'Apply & Compile';
        applyBtn.className = 'primary';
        applyBtn.onclick = ()=>this.compileShader();
        footer.appendChild(closeBtn);
        footer.appendChild(applyBtn);
        this.uiContainer.appendChild(header);
        this.uiContainer.appendChild(editorContainer);
        this.uiContainer.appendChild(footer);
        document.body.appendChild(this.uiContainer);
        // 5. Initialize CodeMirror
        this.editorView = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$codemirror$2f$view$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EditorView"]({
            doc: this.fragmentShaderCode,
            extensions: [
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$codemirror$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["basicSetup"],
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$codemirror$2f$lang$2d$cpp$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cpp"])()
            ],
            parent: editorContainer
        });
    }
    compileShader() {
        if (!this.shaderMaterial) return;
        // 1. Sync active editor contents back to variables
        if (this.activeTab === 'fragment') {
            this.fragmentShaderCode = this.editorView.state.doc.toString();
        } else {
            this.vertexShaderCode = this.editorView.state.doc.toString();
        }
        try {
            // Check for WebGL compilation errors during material creation
            // THREE.js logs them, but we want to intercept. A reliable way is 
            // checking the material.needsUpdate flag, but that doesn't trigger compile synchronously.
            // When mesh is rendered, Three.js will compile it and log via console.error.
            // We use a temporary console.error interceptor for the next render.
            const oldError = console.error;
            let caughtError = null;
            console.error = (...args)=>{
                const msg = args.join(' ');
                if (msg.includes('THREE.WebGLProgram: shader error') || msg.includes('ERROR:')) {
                    caughtError = msg;
                }
                oldError.apply(console, args);
            };
            // Build new material
            const newMaterial = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ShaderMaterial"]({
                vertexShader: this.vertexShaderCode,
                fragmentShader: this.fragmentShaderCode,
                uniforms: this.uniforms
            });
            // Swap out old material
            if (this.shaderMesh) {
                const oldMat = this.shaderMesh.material;
                this.shaderMesh.material = newMaterial;
                if (oldMat) {
                    if (Array.isArray(oldMat)) {
                        oldMat.forEach((m)=>m.dispose());
                    } else {
                        oldMat.dispose();
                    }
                }
            }
            this.shaderMaterial = newMaterial;
            this.shaderMaterial.needsUpdate = true;
            // Force a synchronous compile check if possible, by forcing renderer to compile
            // This initializes the webgl program
            try {
                this.renderer.compile(this.scene, this.camera);
            } catch (e) {
            // Ignore general render errors, we just want the console.error hook
            }
            console.error = oldError; // Restore original console.error
            if (caughtError) {
                if (this.toastManager) {
                    this.toastManager.show('Shader compilation failed. Check logs.', 'error');
                }
            } else {
                if (this.toastManager) {
                    this.toastManager.show('Shader compiled and applied!', 'success');
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
}
}),
"[project]/src/frontend/UIManager.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UIManager",
    ()=>UIManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.module.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dat$2e$gui$2f$build$2f$dat$2e$gui$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dat.gui/build/dat.gui.module.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ShaderEditor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/ShaderEditor.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/utils/Logger.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/constants.js [app-ssr] (ecmascript)");
;
;
;
;
;
class UIManager {
    /**
   * @param {import('./utils/ServiceContainer.js').ServiceContainer} container
   */ constructor(container){
        this.container = container;
        this.eventBus = container && typeof container.get === 'function' ? container.get('EventBus') : null;
        this.stateManager = container && typeof container.get === 'function' ? container.get('StateManager') : null;
        // UI Elements
        this.gui = null;
        this.propertiesFolder = null;
        try {
            this.objectsList = document.getElementById('objects-list');
            if (!this.objectsList) {
                this.objectsList = document.createElement('ul');
                this.objectsList.id = 'objects-list';
            // We don't necessarily append it to body here, just ensure it exists
            }
        } catch (e) {
            this.objectsList = document.createElement('ul');
        }
        this.sceneGraphItemMap = new Map();
        // Dependencies that might be registered later
        this._resolveDependencies();
    }
    _resolveDependencies() {
        if (!this.container || typeof this.container.get !== 'function') return;
        try {
            this.primitiveFactory = this.container.get('PrimitiveFactory');
            this.objectManager = this.container.get('ObjectManager');
            this.objectPropertyUpdater = this.container.get('ObjectPropertyUpdater');
            this.physicsManager = this.container.get('PhysicsManager');
            this.sceneManager = this.container.get('SceneManager');
            this.exportManager = this.container.get('ExportManager');
            this.scene = this.container.get('Scene');
            this.renderer = this.container.get('Renderer');
            this.camera = this.container.get('Camera');
        } catch (e) {
        // Some dependencies might not be registered yet during construction
        }
    }
    /**
   * Lazy resolve dependencies if needed
   */ _ensureDependencies() {
        if (!this.primitiveFactory) this._resolveDependencies();
    }
    setupToolbar(callbacks) {
        const tools = [
            {
                id: 'translate-btn',
                icon: '✥',
                title: 'Translate (G)',
                action: ()=>callbacks.setTransformMode('translate')
            },
            {
                id: 'rotate-btn',
                icon: '↻',
                title: 'Rotate (R)',
                action: ()=>callbacks.setTransformMode('rotate')
            },
            {
                id: 'scale-btn',
                icon: '⤢',
                title: 'Scale (S)',
                action: ()=>callbacks.setTransformMode('scale')
            },
            {
                id: 'undo-btn',
                icon: '↶',
                title: 'Undo (Ctrl+Z)',
                action: ()=>callbacks.undo()
            },
            {
                id: 'redo-btn',
                icon: '↷',
                title: 'Redo (Ctrl+Y)',
                action: ()=>callbacks.redo()
            },
            {
                id: 'delete-btn',
                icon: '🗑',
                title: 'Delete (Del)',
                action: ()=>callbacks.deleteSelected()
            },
            {
                id: 'save-image-btn',
                icon: '📷',
                title: 'Save Image',
                action: ()=>this.container.get('ExportManager').saveImage()
            }
        ];
        let container = document.getElementById('toolbar');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toolbar';
            document.body.appendChild(container);
        }
        tools.forEach((tool)=>{
            const btn = document.createElement('button');
            btn.id = tool.id;
            btn.textContent = tool.icon;
            btn.title = tool.title;
            btn.setAttribute('aria-label', tool.title);
            btn.onclick = ()=>{
                tool.action();
                if ([
                    'translate',
                    'rotate',
                    'scale'
                ].includes(tool.id.split('-')[0])) {
                    container.querySelectorAll('button').forEach((b)=>b.classList.remove('active'));
                    btn.classList.add('active');
                }
            };
            container.appendChild(btn);
        });
    }
    setupGUI() {
        this._ensureDependencies();
        this.gui = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dat$2e$gui$2f$build$2f$dat$2e$gui$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GUI"]({
            autoPlace: false
        });
        const propsPanel = document.getElementById('properties-panel');
        if (propsPanel && this.gui.domElement) {
            try {
                propsPanel.appendChild(this.gui.domElement);
            } catch (err) {
                void err;
            }
        }
        const cameraFolder = this.gui.addFolder('Camera Settings');
        cameraFolder.add(this.sceneManager, 'dampingEnabled').name('Enable Damping').onChange(()=>this.sceneManager.controls.update());
        cameraFolder.add(this.sceneManager, 'dampingFactor', 0.01, 1.0).name('Damping Factor');
        const toastManager = this.container && typeof this.container.get === 'function' ? this.container.get('ToastManager') : null;
        new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ShaderEditor$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ShaderEditor"](this.gui, this.renderer, this.scene, this.camera, this.eventBus, toastManager);
        if (this.physicsManager) {
            const physicsFolder = this.gui.addFolder('Physics Controls');
            const physicsParams = {
                play: ()=>this.physicsManager.play(),
                pause: ()=>this.physicsManager.pause(),
                reset: ()=>this.physicsManager.reset()
            };
            physicsFolder.add(physicsParams, 'play').name('Play Simulation');
            physicsFolder.add(physicsParams, 'pause').name('Pause Simulation');
            physicsFolder.add(physicsParams, 'reset').name('Reset Simulation');
        }
        this.propertiesFolder = this.gui.addFolder('Properties');
        this.propertiesFolder.open();
        const viewFolder = this.gui.addFolder('View Settings');
        const viewParams = {
            showGrid: true,
            gridSize: 10,
            gridDivisions: 10,
            showAxes: true
        };
        const updateGrid = ()=>{
            if (this.eventBus) this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].UPDATE_GRID, viewParams);
        };
        viewFolder.add(viewParams, 'showGrid').name('Show Grid').onChange(updateGrid);
        const sizeCtrl = viewFolder.add(viewParams, 'gridSize', 1, 100).name('Grid Size');
        if (sizeCtrl.onFinishChange) sizeCtrl.onFinishChange(updateGrid);
        else sizeCtrl.onChange(updateGrid);
        const divCtrl = viewFolder.add(viewParams, 'gridDivisions', 1, 100, 1).name('Divisions');
        if (divCtrl.onFinishChange) divCtrl.onFinishChange(updateGrid);
        else divCtrl.onChange(updateGrid);
        viewFolder.add(viewParams, 'showAxes').name('Show Axes').onChange((val)=>{
            if (this.eventBus) this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].TOGGLE_AXES, val);
        });
    }
    setupMenu(callbacks) {
        const handlers = {
            // File
            'menu-file-load': ()=>{
                const input = document.getElementById('file-input');
                if (input) input.click();
            },
            'menu-file-save': ()=>callbacks.saveScene(),
            'menu-file-import': ()=>{
                const input = document.getElementById('model-import-input');
                if (input) input.click();
            },
            // Edit
            'menu-edit-undo': ()=>callbacks.undo(),
            'menu-edit-redo': ()=>callbacks.redo(),
            'menu-edit-delete': ()=>callbacks.deleteSelected(),
            'menu-edit-duplicate': ()=>callbacks.duplicateSelected(),
            // Add
            'menu-add-box': ()=>callbacks.addBox(),
            'menu-add-sphere': ()=>callbacks.addSphere(),
            'menu-add-cylinder': ()=>callbacks.addCylinder(),
            'menu-add-cone': ()=>callbacks.addCone(),
            'menu-add-torus': ()=>callbacks.addTorus(),
            'menu-add-plane': ()=>callbacks.addPlane(),
            'menu-add-teapot': ()=>callbacks.addTeapot(),
            // View
            'menu-view-fullscreen': ()=>callbacks.toggleFullscreen()
        };
        Object.entries(handlers).forEach(([id, handler])=>{
            const btn = document.getElementById(id);
            if (btn) btn.onclick = (e)=>{
                e.preventDefault();
                handler();
            };
        });
        // Handle file input changes (Legacy support)
        const loadInput = document.getElementById('file-input');
        if (loadInput) {
            loadInput.onchange = async (e)=>{
                // @ts-ignore
                const file = e.target.files[0];
                if (file) {
                    try {
                        await callbacks.loadScene(file);
                    } catch (err) {
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Logger"].error('Failed to load scene', err);
                    }
                }
                // @ts-ignore
                e.target.value = '';
            };
        }
        const importInput = document.getElementById('model-import-input');
        if (importInput) {
            importInput.onchange = (e)=>{
                // @ts-ignore
                if (e.target.files && e.target.files[0]) {
                    // @ts-ignore
                    callbacks.importModel(e.target.files[0]);
                }
                // @ts-ignore
                e.target.value = '';
            };
        }
    }
    _triggerFilePicker(callback, accept = '') {
        const input = document.createElement('input');
        input.type = 'file';
        if (accept) input.accept = accept;
        input.onchange = (e)=>{
            // @ts-ignore
            const file = e.target.files[0];
            if (file) callback(file);
        };
        input.click();
    }
    setupSceneGraph() {
        this.objectsList = document.getElementById('objects-list');
    }
    updatePropertiesPanel(object, callbacks) {
        this._ensureDependencies();
        this.clearPropertiesPanel();
        if (!object || !this.propertiesFolder) return;
        this.propertiesFolder.add(object, 'name').name('Name');
        const pos = this.propertiesFolder.addFolder('Position');
        pos.add(object.position, 'x', -10, 10).name('X');
        pos.add(object.position, 'y', -10, 10).name('Y');
        pos.add(object.position, 'z', -10, 10).name('Z');
        const rot = this.propertiesFolder.addFolder('Rotation');
        rot.add(object.rotation, 'x', -Math.PI, Math.PI).name('X');
        rot.add(object.rotation, 'y', -Math.PI, Math.PI).name('Y');
        rot.add(object.rotation, 'z', -Math.PI, Math.PI).name('Z');
        const sca = this.propertiesFolder.addFolder('Scale');
        sca.add(object.scale, 'x', 0.1, 5).name('X');
        sca.add(object.scale, 'y', 0.1, 5).name('Y');
        sca.add(object.scale, 'z', 0.1, 5).name('Z');
        // @ts-ignore
        if (object.material) {
            const mat = this.propertiesFolder.addFolder('Material');
            const materialData = {
                // @ts-ignore
                color: '#' + object.material.color.getHexString(),
                // @ts-ignore
                emissive: object.material.emissive ? '#' + object.material.emissive.getHexString() : '#000000'
            };
            mat.addColor(materialData, 'color').name('Color').onChange((val)=>{
                // @ts-ignore
                object.material.color.set(val);
            }).onFinishChange(()=>callbacks.saveState('Change Color'));
            // @ts-ignore
            if (object.material.emissive !== undefined) {
                mat.addColor(materialData, 'emissive').name('Emissive').onChange((val)=>{
                    // @ts-ignore
                    object.material.emissive.set(val);
                }).onFinishChange(()=>callbacks.saveState('Change Emissive'));
            }
            // @ts-ignore
            if (object.material.roughness !== undefined) {
                // @ts-ignore
                mat.add(object.material, 'roughness', 0, 1).name('Roughness').onFinishChange(()=>callbacks.saveState('Change Roughness'));
            }
            // @ts-ignore
            if (object.material.metalness !== undefined) {
                // @ts-ignore
                mat.add(object.material, 'metalness', 0, 1).name('Metalness').onFinishChange(()=>callbacks.saveState('Change Metalness'));
            }
            // @ts-ignore
            if (object.material.wireframe !== undefined) {
                // @ts-ignore
                mat.add(object.material, 'wireframe').name('Wireframe').onFinishChange(()=>callbacks.saveState('Toggle Wireframe'));
            }
            // Texture Support
            const textureOptions = {
                uploadMap: ()=>this.triggerTextureUpload(object, 'map', callbacks),
                uploadNormalMap: ()=>this.triggerTextureUpload(object, 'normalMap', callbacks),
                uploadRoughnessMap: ()=>this.triggerTextureUpload(object, 'roughnessMap', callbacks)
            };
            mat.add(textureOptions, 'uploadMap').name('Set Albedo Map');
            mat.add(textureOptions, 'uploadNormalMap').name('Set Normal Map');
            mat.add(textureOptions, 'uploadRoughnessMap').name('Set Rough. Map');
        }
        if (object.userData && object.userData.primitiveType === 'Extrude') {
            const g = this.propertiesFolder.addFolder('Extrude Settings');
            const opts = object.userData.primitiveOptions || {};
            const params = {
                depth: opts.depth !== undefined ? opts.depth : 0.2,
                steps: opts.steps !== undefined ? opts.steps : 2,
                bevelEnabled: opts.bevelEnabled !== undefined ? opts.bevelEnabled : true,
                bevelThickness: opts.bevelThickness !== undefined ? opts.bevelThickness : 0.1,
                bevelSize: opts.bevelSize !== undefined ? opts.bevelSize : 0.1,
                bevelSegments: opts.bevelSegments !== undefined ? opts.bevelSegments : 1
            };
            const updateExtrude = ()=>{
                object.userData.primitiveOptions = {
                    ...opts,
                    ...params
                };
                this.objectPropertyUpdater.updatePrimitive(object, object.userData.primitiveOptions);
            };
            const finishChange = ()=>callbacks.saveState('Change Extrude');
            g.add(params, 'depth', 0.1, 10).name('Depth').onChange(updateExtrude).onFinishChange(finishChange);
            g.add(params, 'steps', 1, 20, 1).name('Steps').onChange(updateExtrude).onFinishChange(finishChange);
            g.add(params, 'bevelEnabled').name('Bevel').onChange(updateExtrude).onFinishChange(finishChange);
            g.add(params, 'bevelThickness', 0, 2).name('Bevel Thick').onChange(updateExtrude).onFinishChange(finishChange);
            g.add(params, 'bevelSize', 0, 2).name('Bevel Size').onChange(updateExtrude).onFinishChange(finishChange);
            g.add(params, 'bevelSegments', 1, 10, 1).name('Bevel Segs').onChange(updateExtrude).onFinishChange(finishChange);
        }
        // CSG Operations
        this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].UI_UPDATE_PROPERTIES, {
            object,
            folder: this.propertiesFolder,
            callbacks
        });
        // Physics Settings (Per Object)
        if (this.physicsManager) {
            const physFolder = this.propertiesFolder.addFolder('Physics');
            const hasBody = this.physicsManager.meshToBodyMap.has(object);
            const currentBody = hasBody ? this.physicsManager.meshToBodyMap.get(object) : null;
            let initialShapeType = 'box';
            if (currentBody && currentBody.shapes.length > 0) {
                const cannonShape = currentBody.shapes[0];
                if (cannonShape.type === 1) initialShapeType = 'sphere';
                else if (cannonShape.type === 4) initialShapeType = 'box';
                else if (cannonShape.type === 8) initialShapeType = 'cylinder';
            }
            const physParams = {
                enabled: hasBody,
                mass: currentBody ? currentBody.mass : 1,
                shape: initialShapeType
            };
            const updatePhysics = ()=>{
                if (physParams.enabled) {
                    this.physicsManager.removeObject(object);
                    this.physicsManager.addBody(object, physParams.mass, physParams.shape);
                } else {
                    this.physicsManager.removeObject(object);
                }
                callbacks.saveState('Update Physics');
            };
            physFolder.add(physParams, 'enabled').name('Enable Physics').onChange(updatePhysics);
            physFolder.add(physParams, 'mass', 0, 100).name('Mass (0=Static)').onFinishChange(updatePhysics);
            physFolder.add(physParams, 'shape', [
                'box',
                'sphere',
                'cylinder'
            ]).name('Collision Shape').onChange(updatePhysics);
        }
        this.applyScrubbingToFolder(this.propertiesFolder);
    }
    applyScrubbingToFolder(folder) {
        folder.__controllers.forEach((c)=>this.applyScrubbing(c));
        if (folder.__folders) {
            Object.values(folder.__folders).forEach((f)=>this.applyScrubbingToFolder(f));
        }
    }
    applyScrubbing(controller) {
        if (typeof controller.getValue() !== 'number') return;
        const container = controller.domElement.closest('li');
        if (!container) return;
        const label = container.querySelector('.property-name');
        if (!label || label.dataset.scrubbingInitialized) return;
        label.style.cursor = 'ew-resize';
        label.style.userSelect = 'none';
        label.dataset.scrubbingInitialized = 'true';
        let startX = 0;
        let startValue = 0;
        const onMouseMove = (e)=>{
            const delta = e.clientX - startX;
            let sensitivity = 0.01;
            if (e.shiftKey) sensitivity = 0.001;
            if (e.altKey) sensitivity = 0.1;
            const newValue = startValue + delta * sensitivity;
            controller.setValue(newValue);
            if (controller.__onChange) {
                controller.__onChange.call(controller, newValue);
            }
        };
        const onMouseUp = ()=>{
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            if (controller.__onFinishChange) {
                controller.__onFinishChange.call(controller, controller.getValue());
            }
            document.body.style.cursor = '';
        };
        label.addEventListener('mousedown', (e)=>{
            startX = e.clientX;
            startValue = controller.getValue();
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'ew-resize';
            e.preventDefault();
        });
    }
    triggerTextureUpload(object, mapType, callbacks) {
        this._triggerFilePicker((file)=>{
            const reader = new window.FileReader();
            reader.onload = (event)=>{
                const textureLoader = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextureLoader"]();
                // @ts-ignore
                textureLoader.load(event.target.result, (texture)=>{
                    // @ts-ignore
                    if (object.material) {
                        // @ts-ignore
                        object.material[mapType] = texture;
                        // @ts-ignore
                        object.material.needsUpdate = true;
                        callbacks.saveState(`Upload ${mapType}`);
                        this.container.get('ToastManager').show('Texture applied!', 'success');
                    }
                });
            };
            reader.readAsDataURL(file);
        }, 'image/*');
    }
    clearPropertiesPanel() {
        if (!this.propertiesFolder) return;
        const controllers = [
            ...this.propertiesFolder.__controllers
        ];
        controllers.forEach((c)=>this.propertiesFolder.remove(c));
        if (this.propertiesFolder.__folders) {
            Object.values(this.propertiesFolder.__folders).forEach((f)=>this.propertiesFolder.removeFolder(f));
        }
    }
    updateSceneGraph(objects, selectedObject, callbacks) {
        if (!this.objectsList) return;
        if (objects.length === 0) {
            this.objectsList.innerHTML = '';
            const li = document.createElement('li');
            li.setAttribute('role', 'listitem');
            li.textContent = 'No objects in scene';
            li.style.color = '#888';
            li.style.fontStyle = 'italic';
            li.style.textAlign = 'center';
            li.style.padding = '10px';
            this.objectsList.appendChild(li);
            this.sceneGraphItemMap.clear();
            return;
        }
        if (this.objectsList.children.length > 0 && this.objectsList.children[0].textContent === 'No objects in scene') {
            this.objectsList.innerHTML = '';
        }
        let currentDom = this.objectsList.firstElementChild;
        objects.forEach((obj, idx)=>{
            let li = this.sceneGraphItemMap.get(obj.uuid);
            // @ts-ignore
            if (li && li._boundObject !== obj) {
                li.remove();
                if (li === currentDom) {
                    currentDom = currentDom.nextElementSibling;
                }
                this.sceneGraphItemMap.delete(obj.uuid);
                li = undefined;
            }
            if (!li) {
                li = this.createSceneGraphItem(obj, callbacks);
                this.sceneGraphItemMap.set(obj.uuid, li);
            }
            this.updateSceneGraphItem(li, obj, idx, selectedObject);
            if (currentDom === li) {
                currentDom = currentDom.nextElementSibling;
            } else {
                this.objectsList.insertBefore(li, currentDom);
            }
        });
        while(currentDom){
            const next = currentDom.nextElementSibling;
            currentDom.remove();
            currentDom = next;
        }
        if (this.sceneGraphItemMap.size > objects.length) {
            const activeUuids = new Set(objects.map((o)=>o.uuid));
            for (const uuid of this.sceneGraphItemMap.keys()){
                if (!activeUuids.has(uuid)) {
                    this.sceneGraphItemMap.delete(uuid);
                }
            }
        }
    }
    createSceneGraphItem(obj, callbacks) {
        const li = document.createElement('li');
        li.setAttribute('role', 'listitem');
        li.style.cssText = `
      padding: 5px;
      margin: 2px 0;
      border-radius: 3px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
    `;
        // @ts-ignore
        li._boundObject = obj;
        const name = document.createElement('span');
        name.className = 'object-name';
        li.appendChild(name);
        // @ts-ignore
        li._nameSpan = name;
        const controls = document.createElement('div');
        const visibilityBtn = document.createElement('button');
        visibilityBtn.className = 'visibility-btn';
        visibilityBtn.setAttribute('aria-label', obj.visible ? 'Hide object' : 'Show object');
        visibilityBtn.setAttribute('title', obj.visible ? 'Hide object' : 'Show object');
        visibilityBtn.onclick = (e)=>{
            e.stopPropagation();
            obj.visible = !obj.visible;
            callbacks.updateSceneGraph();
        };
        controls.appendChild(visibilityBtn);
        // @ts-ignore
        li._visibilityBtn = visibilityBtn;
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.setAttribute('aria-label', 'Delete object');
        deleteBtn.setAttribute('title', 'Delete object');
        deleteBtn.textContent = '🗑️';
        deleteBtn.onclick = (e)=>{
            e.stopPropagation();
            callbacks.deleteObject(obj);
        };
        controls.appendChild(deleteBtn);
        li.appendChild(controls);
        li.onclick = ()=>callbacks.selectObject(obj);
        // Drag and Drop
        li.draggable = true;
        li.addEventListener('dragstart', (e)=>{
            // @ts-ignore
            e.dataTransfer.setData('text/plain', obj.uuid);
            // @ts-ignore
            e.dataTransfer.effectAllowed = 'move';
            li.style.opacity = '0.5';
        });
        li.addEventListener('dragend', ()=>{
            li.style.opacity = '1';
            const items = this.objectsList.querySelectorAll('li');
            items.forEach((item)=>{
                // @ts-ignore
                item.style.borderTop = '';
                // @ts-ignore
                item.style.borderBottom = '';
            });
        });
        li.addEventListener('dragover', (e)=>{
            e.preventDefault();
            // @ts-ignore
            e.dataTransfer.dropEffect = 'move';
            const rect = li.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            if (e.clientY < midpoint) {
                li.style.borderTop = '2px solid var(--accent)';
                li.style.borderBottom = '';
            } else {
                li.style.borderTop = '';
                li.style.borderBottom = '2px solid var(--accent)';
            }
        });
        li.addEventListener('dragleave', ()=>{
            li.style.borderTop = '';
            li.style.borderBottom = '';
        });
        li.addEventListener('drop', (e)=>{
            e.preventDefault();
            li.style.borderTop = '';
            li.style.borderBottom = '';
            // @ts-ignore
            const draggedUuid = e.dataTransfer.getData('text/plain');
            if (draggedUuid !== obj.uuid) {
                const rect = li.getBoundingClientRect();
                const isAfter = e.clientY > rect.top + rect.height / 2;
                callbacks.reorderObjects(draggedUuid, obj.uuid, isAfter);
            }
        });
        return li;
    }
    updateSceneGraphItem(li, obj, idx, selectedObject) {
        const isSelected = selectedObject === obj;
        const expectedBg = isSelected ? '#444' : '#222';
        if (li.style.background !== expectedBg) {
            li.style.background = expectedBg;
        }
        // @ts-ignore
        const nameSpan = li._nameSpan;
        const expectedName = obj.name || `Object ${idx + 1}`;
        if (nameSpan.textContent !== expectedName) {
            nameSpan.textContent = expectedName;
        }
        // @ts-ignore
        const visibilityBtn = li._visibilityBtn;
        const expectedVisLabel = obj.visible ? 'Hide object' : 'Show object';
        const expectedVisIcon = obj.visible ? '👁️' : '🚫';
        if (visibilityBtn.getAttribute('aria-label') !== expectedVisLabel) {
            visibilityBtn.setAttribute('aria-label', expectedVisLabel);
        }
        if (visibilityBtn.getAttribute('title') !== expectedVisLabel) {
            visibilityBtn.setAttribute('title', expectedVisLabel);
        }
        if (visibilityBtn.textContent !== expectedVisIcon) {
            visibilityBtn.textContent = expectedVisIcon;
        }
    }
}
}),
"[project]/src/frontend/HistoryManager.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HistoryManager",
    ()=>HistoryManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.module.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/constants.js [app-ssr] (ecmascript)");
;
;
class HistoryManager {
    /**
   * @param {import('./utils/ServiceContainer.js').ServiceContainer} container
   */ constructor(container){
        this.container = container;
        this.eventBus = container && typeof container.get === 'function' ? container.get('EventBus') : null;
        this.stateManager = container && typeof container.get === 'function' ? container.get('StateManager') : null;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        this._resolveDependencies();
    }
    _resolveDependencies() {
        if (!this.container || typeof this.container.get !== 'function') return;
        try {
            this.scene = this.container.get('Scene');
            this.objectManager = this.container.get('ObjectManager');
        } catch (e) {
        // Dependencies might be registered later
        }
    }
    _ensureDependencies() {
        if (!this.scene) this._resolveDependencies();
    }
    saveState(objects, selectedObject, description = 'Action') {
        // Structural sharing implementation
        const lastState = this.history[this.historyIndex];
        const lastStateMap = new Map();
        if (lastState && lastState.objects) {
            lastState.objects.forEach((obj)=>lastStateMap.set(obj.uuid, obj));
        }
        const stateObjects = objects.map((obj)=>{
            const lastObjState = lastStateMap.get(obj.uuid);
            if (lastObjState && this._areObjectsEqual(lastObjState, obj)) {
                return lastObjState;
            }
            return {
                uuid: obj.uuid,
                name: obj.name,
                visible: obj.visible !== undefined ? obj.visible : true,
                type: obj.userData && obj.userData.primitiveType ? obj.userData.primitiveType : obj.geometry ? obj.geometry.type : obj.type,
                position: obj.position.clone(),
                rotation: obj.rotation.clone(),
                scale: obj.scale.clone(),
                material: obj.material ? {
                    // @ts-ignore
                    color: obj.material.color ? obj.material.color.clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"](0xffffff),
                    // @ts-ignore
                    emissive: obj.material.emissive ? obj.material.emissive.clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"](0x000000)
                } : null,
                geometryParams: obj.userData && obj.userData.primitiveOptions ? obj.userData.primitiveOptions : obj.userData ? obj.userData.geometryParams : null
            };
        });
        const state = {
            description,
            timestamp: Date.now(),
            objects: stateObjects,
            selectedUuid: selectedObject ? selectedObject.uuid : null
        };
        if (this.historyIndex < this.history.length - 1) {
            this.history.splice(this.historyIndex + 1);
        }
        this.history.push(state);
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
        if (this.eventBus) {
            this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].HISTORY_CHANGED, {
                index: this.historyIndex,
                length: this.history.length,
                description
            });
        }
    }
    async undo(callbacks) {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            await this.restoreState(this.history[this.historyIndex], callbacks);
        }
    }
    async redo(callbacks) {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            await this.restoreState(this.history[this.historyIndex], callbacks);
        }
    }
    async restoreState(state, callbacks) {
        this._ensureDependencies();
        const currentObjects = callbacks.getObjects();
        const currentObjectsMap = new Map();
        currentObjects.forEach((obj)=>currentObjectsMap.set(obj.uuid, obj));
        const newStateUuids = new Set();
        const newObjects = [];
        const promises = [];
        for (const data of state.objects){
            newStateUuids.add(data.uuid);
            const existingObj = currentObjectsMap.get(data.uuid);
            if (existingObj) {
                const currentType = existingObj.userData && existingObj.userData.primitiveType ? existingObj.userData.primitiveType : existingObj.geometry ? existingObj.geometry.type : existingObj.type;
                const currentParams = existingObj.userData && existingObj.userData.primitiveOptions ? existingObj.userData.primitiveOptions : existingObj.userData ? existingObj.userData.geometryParams : null;
                const typeChanged = data.type !== currentType;
                const paramsChanged = JSON.stringify(data.geometryParams) !== JSON.stringify(currentParams);
                if (typeChanged || paramsChanged) {
                    this.scene.remove(existingObj);
                    this.objectManager.deleteObject(existingObj);
                    promises.push((async ()=>{
                        const mesh = await this.objectManager.addPrimitive(data.type, data.geometryParams);
                        if (mesh) {
                            this._applyStateToMesh(mesh, data);
                            if (!newObjects.includes(mesh)) newObjects.push(mesh);
                        }
                        return mesh;
                    })());
                } else {
                    this._applyStateToMesh(existingObj, data);
                    newObjects.push(existingObj);
                }
            } else {
                promises.push((async ()=>{
                    const mesh = await this.objectManager.addPrimitive(data.type, data.geometryParams);
                    if (mesh) {
                        this._applyStateToMesh(mesh, data);
                        if (!newObjects.includes(mesh)) newObjects.push(mesh);
                    }
                    return mesh;
                })());
            }
        }
        currentObjects.forEach((obj)=>{
            if (!newStateUuids.has(obj.uuid)) {
                this.objectManager.deleteObject(obj);
            }
        });
        await Promise.all(promises);
        const objMap = new Map();
        newObjects.forEach((o)=>objMap.set(o.uuid, o));
        const sortedObjects = state.objects.map((d)=>objMap.get(d.uuid)).filter((o)=>o);
        callbacks.setObjects(sortedObjects);
        if (state.selectedUuid) {
            const selected = sortedObjects.find((o)=>o.uuid === state.selectedUuid);
            if (selected) callbacks.selectObject(selected);
        } else {
            callbacks.deselectObject();
        }
        callbacks.updateSceneGraph();
        if (this.eventBus) {
            this.eventBus.publish(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].HISTORY_CHANGED, {
                index: this.historyIndex,
                length: this.history.length,
                description: state.description
            });
        }
    }
    _areObjectsEqual(stateObj, currentObj) {
        if (!stateObj || !currentObj) return false;
        if (stateObj.uuid !== currentObj.uuid) return false;
        if (stateObj.name !== currentObj.name) return false;
        if (stateObj.visible !== currentObj.visible) return false;
        const currentType = currentObj.userData && currentObj.userData.primitiveType ? currentObj.userData.primitiveType : currentObj.geometry ? currentObj.geometry.type : currentObj.type;
        if (stateObj.type !== currentType) return false;
        if (!stateObj.position.equals(currentObj.position)) return false;
        if (!stateObj.rotation.equals(currentObj.rotation)) return false;
        if (!stateObj.scale.equals(currentObj.scale)) return false;
        // @ts-ignore
        if (stateObj.material && currentObj.material) {
            // @ts-ignore
            if (!stateObj.material.color.equals(currentObj.material.color)) return false;
            // @ts-ignore
            if (stateObj.material.emissive && currentObj.material.emissive) {
                // @ts-ignore
                if (!stateObj.material.emissive.equals(currentObj.material.emissive)) return false;
            }
        } else if (!!stateObj.material !== !!currentObj.material) {
            return false;
        }
        const currentParams = currentObj.userData && currentObj.userData.primitiveOptions ? currentObj.userData.primitiveOptions : currentObj.userData ? currentObj.userData.geometryParams : null;
        if (JSON.stringify(stateObj.geometryParams) !== JSON.stringify(currentParams)) return false;
        return true;
    }
    _applyStateToMesh(mesh, data) {
        if (!mesh) return;
        mesh.uuid = data.uuid;
        mesh.name = data.name;
        if (data.visible !== undefined) mesh.visible = data.visible;
        mesh.position.copy(data.position);
        mesh.rotation.copy(data.rotation);
        mesh.scale.copy(data.scale);
        // @ts-ignore
        if (mesh.material && data.material) {
            // @ts-ignore
            if (mesh.material.color && data.material.color) mesh.material.color.copy(data.material.color);
            // @ts-ignore
            if (mesh.material.emissive && data.material.emissive) mesh.material.emissive.copy(data.material.emissive);
        }
    }
}
}),
"[project]/src/frontend/main.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "App",
    ()=>App
]);
// @ts-check
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.module.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tweenjs$2f$tween$2e$js$2f$dist$2f$tween$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tweenjs/tween.js/dist/tween.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$controls$2f$OrbitControls$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/controls/OrbitControls.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$controls$2f$TransformControls$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/controls/TransformControls.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$SceneStorage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/SceneStorage.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$ServiceContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/utils/ServiceContainer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$StateManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/StateManager.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$EventBus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/EventBus.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ObjectManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/ObjectManager.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$SceneManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/SceneManager.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$InputManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/InputManager.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/constants.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$PhysicsManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/PhysicsManager.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$PrimitiveFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/PrimitiveFactory.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ObjectFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/ObjectFactory.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ObjectPropertyUpdater$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/ObjectPropertyUpdater.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ToastManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/ToastManager.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$LightManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/LightManager.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/utils/Logger.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ModelLoader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/ModelLoader.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$AnimationManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/AnimationManager.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$TimelineUI$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/TimelineUI.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ExportManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/ExportManager.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ErrorHandler$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/ErrorHandler.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$postprocessing$2f$EffectComposer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/postprocessing/EffectComposer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$postprocessing$2f$RenderPass$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/postprocessing/RenderPass.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$postprocessing$2f$OutlinePass$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/postprocessing/OutlinePass.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ViewCube$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/ViewCube.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$csg$2d$ts$2f$lib$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/three-csg-ts/lib/esm/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$csg$2d$ts$2f$lib$2f$esm$2f$CSG$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three-csg-ts/lib/esm/CSG.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$UIManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/UIManager.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$HistoryManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/HistoryManager.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
class App {
    constructor(){
        // Initialize Core Utilities
        this.toastManager = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ToastManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastManager"]();
        this.container = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$ServiceContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ServiceContainer"]();
        this.container.register('ToastManager', this.toastManager);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ErrorHandler$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ErrorHandler"].init(this.toastManager);
        this.clock = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Clock"]();
        // Register Core Services
        this.container.register('EventBus', __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$EventBus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]);
        this.stateManager = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$StateManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StateManager"]();
        this.container.register('StateManager', this.stateManager);
        // Initialize Three.js Core
        this.scene = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Scene"]();
        this.camera = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PerspectiveCamera"](75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const canvas = document.querySelector('#c');
        this.renderer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WebGLRenderer"]({
            canvas,
            antialias: true
        });
        // Register Three.js Core objects
        this.container.register('Scene', this.scene);
        this.container.register('Camera', this.camera);
        this.container.register('Renderer', this.renderer);
        // Initialize Managers
        this.primitiveFactory = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$PrimitiveFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PrimitiveFactory"]();
        this.container.register('PrimitiveFactory', this.primitiveFactory);
        this.objectFactory = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ObjectFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ObjectFactory"](this.scene, this.primitiveFactory, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$EventBus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]);
        this.container.register('ObjectFactory', this.objectFactory);
        this.objectPropertyUpdater = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ObjectPropertyUpdater$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ObjectPropertyUpdater"](this.primitiveFactory);
        this.container.register('ObjectPropertyUpdater', this.objectPropertyUpdater);
        this.initRenderer();
        this.initPostProcessing();
        this.inputManager = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$InputManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["InputManager"](__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$EventBus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], this.renderer.domElement);
        this.container.register('InputManager', this.inputManager);
        this.physicsManager = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$PhysicsManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PhysicsManager"](this.scene);
        this.container.register('PhysicsManager', this.physicsManager);
        this.animationManager = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$AnimationManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimationManager"]();
        this.container.register('AnimationManager', this.animationManager);
        this.exportManager = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ExportManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ExportManager"](this.renderer, this.scene, this.camera);
        this.container.register('ExportManager', this.exportManager);
        this.timelineUI = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$TimelineUI$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TimelineUI"](document.body, this.animationManager, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$EventBus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], this.exportManager);
        this.sceneManager = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$SceneManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SceneManager"](this.renderer, this.camera, this.inputManager, this.scene);
        this.container.register('SceneManager', this.sceneManager);
        this.objectManager = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ObjectManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ObjectManager"](this.scene, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$EventBus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], this.physicsManager, this.primitiveFactory, this.objectFactory, this.objectPropertyUpdater, this.stateManager);
        this.container.register('ObjectManager', this.objectManager);
        this.uiManager = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$UIManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UIManager"](this.container);
        this.historyManager = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$HistoryManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HistoryManager"](this.container);
        // App State
        this.selectedObject = null;
        this.objects = [];
        this.primitiveCounter = 0;
        // Continue initialization
        this.setupControls();
        // Use UI Manager for UI setup
        this.uiManager.setupSceneGraph();
        this.uiManager.setupToolbar({
            setTransformMode: (mode)=>this.transformControls.setMode(mode),
            undo: ()=>this.undo(),
            redo: ()=>this.redo(),
            deleteSelected: ()=>this.deleteSelectedObject()
        });
        this.uiManager.setupGUI();
        this.uiManager.setupMenu({
            newScene: ()=>this.newScene(),
            saveScene: ()=>this.saveScene(),
            loadScene: (f)=>this.loadScene(f),
            importModel: (f)=>this.importModel(f),
            toggleFullscreen: ()=>this.toggleFullscreen(),
            undo: ()=>this.undo(),
            redo: ()=>this.redo(),
            deleteSelected: ()=>this.deleteSelectedObject(),
            duplicateSelected: ()=>this.duplicateSelectedObject(),
            addBox: ()=>this.addBox(),
            addSphere: ()=>this.addSphere(),
            addCylinder: ()=>this.addCylinder(),
            addCone: ()=>this.addCone(),
            addTorus: ()=>this.addTorus(),
            addPlane: ()=>this.addPlane(),
            addTeapot: ()=>this.addTeapot()
        });
        this.setupLighting();
        this.setupHelpers();
        this.setupMobileOptimizations();
        this.sceneStorage = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$SceneStorage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SceneStorage"](this.scene, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$EventBus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]);
        // Initialize Model Loader
        this.modelLoader = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ModelLoader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ModelLoader"](this.scene, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$EventBus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]);
        this.container.register('ModelLoader', this.modelLoader);
        // Bind animation loop
        this.animate = this.animate.bind(this);
        this.animate();
        // Initialize ViewCube
        this.viewCube = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$ViewCube$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ViewCube"](this.camera, this.sceneManager.controls, document.body);
        // Subscribe to selection changes
        if (this.stateManager) {
            this.stateManager.subscribe('selection', (selection)=>{
                if (selection && selection.length > 0) {
                    this.selectedObject = selection[0];
                    this.transformControls.attach(this.selectedObject);
                    this.updatePropertiesPanel(this.selectedObject);
                    if (this.timelineUI) this.timelineUI.setSelectedObject(this.selectedObject);
                } else {
                    this.selectedObject = null;
                    this.transformControls.detach();
                    this.clearPropertiesPanel();
                    if (this.timelineUI) this.timelineUI.setSelectedObject(null);
                }
                this.updateSceneGraph();
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$EventBus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].subscribe(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].FOCUS_OBJECT, ()=>{
                if (this.selectedObject) {
                    this.sceneManager.focusOnObject(this.selectedObject);
                }
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$EventBus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].subscribe(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].UPDATE_GRID, (params)=>{
                if (this.gridHelper) this.scene.remove(this.gridHelper);
                if (params.showGrid) {
                    this.gridHelper = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GridHelper"](params.gridSize, params.gridDivisions);
                    this.scene.add(this.gridHelper);
                }
                this.saveState('Update Grid Settings');
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$EventBus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].subscribe(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Events"].TOGGLE_AXES, (val)=>{
                if (this.axesHelper) this.axesHelper.visible = val;
            });
        }
        // Save initial state
        this.saveState('Initial State');
    }
    initRenderer() {
        const container = this.renderer.domElement.parentElement || document.body;
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PCFSoftShadowMap"];
        if (!this.renderer.domElement.parentElement) {
            document.body.appendChild(this.renderer.domElement);
        }
        this.camera.aspect = width / height;
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
        window.addEventListener('resize', ()=>{
            const newContainer = this.renderer.domElement.parentElement || document.body;
            const newWidth = newContainer.clientWidth || window.innerWidth;
            const newHeight = newContainer.clientHeight || window.innerHeight;
            this.camera.aspect = newWidth / newHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(newWidth, newHeight);
            if (this.composer) {
                this.composer.setSize(newWidth, newHeight);
            }
        });
    }
    initPostProcessing() {
        this.composer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$postprocessing$2f$EffectComposer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EffectComposer"](this.renderer);
        const renderPass = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$postprocessing$2f$RenderPass$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RenderPass"](this.scene, this.camera);
        this.composer.addPass(renderPass);
        const container = this.renderer.domElement.parentElement || document.body;
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;
        this.outlinePass = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$postprocessing$2f$OutlinePass$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OutlinePass"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](width, height), this.scene, this.camera);
        this.outlinePass.edgeStrength = 4.0;
        this.outlinePass.edgeGlow = 1.0;
        this.outlinePass.edgeThickness = 2.0;
        this.outlinePass.pulsePeriod = 2.0;
        this.outlinePass.visibleEdgeColor.set('#00ffff');
        this.outlinePass.hiddenEdgeColor.set('#190a05');
        this.composer.addPass(this.outlinePass);
    }
    setupControls() {
        this.orbitControls = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$controls$2f$OrbitControls$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OrbitControls"](this.camera, this.renderer.domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.05;
        this.transformControls = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$controls$2f$TransformControls$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TransformControls"](this.camera, this.renderer.domElement);
        this.transformControls.addEventListener('dragging-changed', (event)=>{
            this.orbitControls.enabled = !event.value;
            if (!event.value && this.selectedObject) {
                this.saveState('Transform object');
            }
        });
        this.scene.add(this.transformControls);
        this.raycaster = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Raycaster"]();
        this.mouse = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]();
        this.renderer.domElement.addEventListener('click', (event)=>{
            if (this.transformControls.dragging) return;
            this.mouse.x = event.clientX / window.innerWidth * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.objects);
            if (intersects.length > 0) {
                this.selectObject(intersects[0].object);
            } else {
                this.deselectObject();
            }
        });
        window.addEventListener('keydown', (event)=>{
            if (event.target instanceof HTMLInputElement) return;
            switch(event.key.toLowerCase()){
                case 'g':
                    this.transformControls.setMode('translate');
                    break;
                case 'r':
                    this.transformControls.setMode('rotate');
                    break;
                case 's':
                    this.transformControls.setMode('scale');
                    break;
                case 'delete':
                case 'backspace':
                    if (this.selectedObject) this.deleteObject(this.selectedObject);
                    break;
                case 'z':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        if (event.shiftKey) this.redo();
                        else this.undo();
                    }
                    break;
            }
        });
    }
    setupLighting() {
        const ambientLight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AmbientLight"](0xffffff, 0.5);
        this.scene.add(ambientLight);
        const directionalLight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DirectionalLight"](0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }
    setupHelpers() {
        this.gridHelper = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GridHelper"](10, 10);
        this.scene.add(this.gridHelper);
        this.axesHelper = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AxesHelper"](5);
        this.scene.add(this.axesHelper);
    }
    setupMobileOptimizations() {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouch) {
            this.orbitControls.enableKeys = false;
            this.orbitControls.touches = {
                ONE: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOUCH"].ROTATE,
                TWO: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOUCH"].DOLLY_PAN
            };
            document.body.classList.add('mobile-optimized');
        }
    }
    // Compatibility proxies for tests
    get objectsList() {
        return this.uiManager ? this.uiManager.objectsList : null;
    }
    set objectsList(val) {
        if (this.uiManager) this.uiManager.objectsList = val;
    }
    get sceneGraphItemMap() {
        return this.uiManager ? this.uiManager.sceneGraphItemMap : new Map();
    }
    set sceneGraphItemMap(val) {
        if (this.uiManager) this.uiManager.sceneGraphItemMap = val;
    }
    setupGUI() {
        if (this.uiManager) this.uiManager.setupGUI();
    }
    setupToolbar(callbacks) {
        if (this.uiManager) this.uiManager.setupToolbar(callbacks || {
            setTransformMode: (mode)=>this.transformControls.setMode(mode),
            undo: ()=>this.undo(),
            redo: ()=>this.redo(),
            deleteSelected: ()=>this.deleteSelectedObject()
        });
    }
    setupMenu(callbacks) {
        if (this.uiManager) this.uiManager.setupMenu(callbacks || {
            newScene: ()=>this.newScene(),
            saveScene: ()=>this.saveScene(),
            loadScene: (f)=>this.loadScene(f),
            importModel: (f)=>this.importModel(f),
            toggleFullscreen: ()=>this.toggleFullscreen()
        });
    }
    setupSceneGraph() {
        if (this.uiManager) this.uiManager.setupSceneGraph();
    }
    triggerTextureUpload(object, mapType) {
        if (this.uiManager) {
            this.uiManager.triggerTextureUpload(object, mapType, {
                saveState: (desc)=>this.saveState(desc)
            });
        }
    }
    newScene() {
        this.objects.forEach((obj)=>this.scene.remove(obj));
        this.objects = [];
        this.deselectObject();
        this.updateSceneGraph();
        this.saveState('New Scene');
    }
    saveState(description = 'Action') {
        this.historyManager.saveState(this.objects, this.selectedObject, description);
    }
    async undo() {
        await this.historyManager.undo({
            getObjects: ()=>this.objects,
            setObjects: (objs)=>{
                this.objects = objs;
            },
            selectObject: (obj)=>this.selectObject(obj),
            deselectObject: ()=>this.deselectObject(),
            updateSceneGraph: ()=>this.updateSceneGraph()
        });
    }
    async redo() {
        await this.historyManager.redo({
            getObjects: ()=>this.objects,
            setObjects: (objs)=>{
                this.objects = objs;
            },
            selectObject: (obj)=>this.selectObject(obj),
            deselectObject: ()=>this.deselectObject(),
            updateSceneGraph: ()=>this.updateSceneGraph()
        });
    }
    async restoreState(state) {
        await this.historyManager.restoreState(state, {
            getObjects: ()=>this.objects,
            setObjects: (objs)=>{
                this.objects = objs;
            },
            selectObject: (obj)=>this.selectObject(obj),
            deselectObject: ()=>this.deselectObject(),
            updateSceneGraph: ()=>this.updateSceneGraph()
        });
    }
    selectObject(object) {
        this.selectedObject = object;
        this.objectManager.selectObject(object);
        this.updatePropertiesPanel(object);
        this.updateSceneGraph();
        if (this.outlinePass) {
            this.outlinePass.selectedObjects = object ? [
                object
            ] : [];
        }
    }
    deselectObject() {
        this.selectedObject = null;
        this.objectManager.deselectObject();
        this.updatePropertiesPanel(null);
        this.updateSceneGraph();
        if (this.outlinePass) {
            this.outlinePass.selectedObjects = [];
        }
    }
    deleteObject(object) {
        if (object) {
            this.objectManager.deleteObject(object);
            const index = this.objects.indexOf(object);
            if (index > -1) this.objects.splice(index, 1);
            this.saveState('Delete object');
        }
    }
    deleteSelectedObject() {
        if (this.selectedObject) this.deleteObject(this.selectedObject);
    }
    duplicateSelectedObject() {
        if (this.selectedObject) {
            const mesh = this.objectManager.duplicateObject(this.selectedObject);
            if (mesh) {
                mesh.position.x += 1;
                this.scene.add(mesh);
                this.objects.push(mesh);
                this.selectObject(mesh);
                this.saveState('Duplicate object');
            }
        }
    }
    performCSG(baseObject, targetUuid, operation) {
        if (!baseObject || !targetUuid) return;
        const targetObject = this.objects.find((o)=>o.uuid === targetUuid);
        if (!targetObject) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Logger"].warn('CSG Target not found');
            return;
        }
        try {
            baseObject.updateMatrixWorld(true);
            targetObject.updateMatrixWorld(true);
            let resultMesh;
            if (operation === 'union') resultMesh = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$csg$2d$ts$2f$lib$2f$esm$2f$CSG$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CSG"].union(baseObject, targetObject);
            else if (operation === 'subtract') resultMesh = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$csg$2d$ts$2f$lib$2f$esm$2f$CSG$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CSG"].subtract(baseObject, targetObject);
            else if (operation === 'intersect') resultMesh = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$csg$2d$ts$2f$lib$2f$esm$2f$CSG$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CSG"].intersect(baseObject, targetObject);
            if (resultMesh) {
                resultMesh.name = `${baseObject.name}_${operation}_${targetObject.name}`;
                resultMesh.castShadow = true;
                resultMesh.receiveShadow = true;
                if (baseObject.material) {
                    resultMesh.material = Array.isArray(baseObject.material) ? baseObject.material.map((m)=>m.clone()) : baseObject.material.clone();
                }
                this.deleteObject(baseObject);
                this.deleteObject(targetObject);
                this.scene.add(resultMesh);
                this.objects.push(resultMesh);
                this.selectObject(resultMesh);
                this.updateSceneGraph();
                this.saveState(`CSG ${operation}`);
                this.toastManager.show(`CSG ${operation} successful!`, 'success');
            }
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Logger"].error(`CSG ${operation} failed:`, err);
            this.toastManager.show(`CSG failed: ${err.message}`, 'error');
        }
    }
    async addBox() {
        return await this.addPrimitive('Box');
    }
    async addSphere() {
        return await this.addPrimitive('Sphere');
    }
    async addCylinder() {
        return await this.addPrimitive('Cylinder');
    }
    async addCone() {
        return await this.addPrimitive('Cone');
    }
    async addTorus() {
        return await this.addPrimitive('Torus');
    }
    async addTorusKnot() {
        return await this.addPrimitive('TorusKnot');
    }
    async addTetrahedron() {
        return await this.addPrimitive('Tetrahedron');
    }
    async addIcosahedron() {
        return await this.addPrimitive('Icosahedron');
    }
    async addDodecahedron() {
        return await this.addPrimitive('Dodecahedron');
    }
    async addOctahedron() {
        return await this.addPrimitive('Octahedron');
    }
    async addPlane() {
        return await this.addPrimitive('Plane');
    }
    async addTube() {
        return await this.addPrimitive('Tube');
    }
    async addTeapot() {
        return await this.addPrimitive('Teapot');
    }
    async addLathe() {
        return await this.addPrimitive('Lathe');
    }
    async addExtrude() {
        return await this.addPrimitive('Extrude');
    }
    async addText(text, options) {
        return await this.addPrimitive('Text', {
            text,
            ...options
        });
    }
    async addPrimitive(type, options) {
        const meshOrPromise = this.objectManager.addPrimitive(type, options);
        const setup = (mesh)=>{
            if (mesh) {
                this.primitiveCounter++;
                mesh.name = `${type}_${this.primitiveCounter}`;
                this.objects.push(mesh);
                this.selectObject(mesh);
                this.updateSceneGraph();
                this.saveState(`Add ${type}`);
            }
            return mesh;
        };
        if (meshOrPromise instanceof Promise) {
            return meshOrPromise.then(setup);
        } else {
            return setup(meshOrPromise);
        }
    }
    async importModel(file) {
        try {
            const object = await this.modelLoader.loadModel(file);
            this.objects.push(object);
            this.selectObject(object);
            this.updateSceneGraph();
            this.saveState('Import Model');
            this.toastManager.show(`Imported ${file.name}`, 'success');
        } catch (error) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Logger"].error('Import failed:', error);
            this.toastManager.show('Import failed: ' + error.message, 'error');
        }
    }
    async saveScene() {
        try {
            await this.sceneStorage.saveScene();
            this.toastManager.show('Scene saved', 'success');
        } catch (e) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Logger"].error('Save failed', e);
            this.toastManager.show('Save failed', 'error');
        }
    }
    async loadScene(file) {
        try {
            const loadedScene = await this.sceneStorage.loadScene(file);
            this.objects.forEach((obj)=>this.scene.remove(obj));
            this.objects = [];
            loadedScene.traverse((child)=>{
                // @ts-ignore
                if (child.isMesh) {
                    this.objects.push(child);
                    this.scene.add(child);
                }
            });
            this.updateSceneGraph();
            this.saveState('Load Scene');
            this.toastManager.show('Scene loaded', 'success');
        } catch (e) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Logger"].error('Load failed', e);
            this.toastManager.show('Load failed', 'error');
        }
    }
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$utils$2f$Logger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Logger"].error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
    updatePropertiesPanel(object) {
        this.uiManager.updatePropertiesPanel(object, {
            saveState: (desc)=>this.saveState(desc)
        });
    }
    clearPropertiesPanel() {
        this.uiManager.clearPropertiesPanel();
    }
    updateSceneGraph() {
        this.uiManager.updateSceneGraph(this.objects, this.selectedObject, {
            updateSceneGraph: ()=>this.updateSceneGraph(),
            deleteObject: (obj)=>this.deleteObject(obj),
            selectObject: (obj)=>this.selectObject(obj),
            reorderObjects: (d, t, a)=>this.reorderObjects(d, t, a)
        });
    }
    reorderObjects(draggedUuid, targetUuid, isAfter) {
        const draggedIdx = this.objects.findIndex((o)=>o.uuid === draggedUuid);
        let targetIdx = this.objects.findIndex((o)=>o.uuid === targetUuid);
        if (draggedIdx !== -1 && targetIdx !== -1) {
            const [draggedObj] = this.objects.splice(draggedIdx, 1);
            targetIdx = this.objects.findIndex((o)=>o.uuid === targetUuid);
            const insertIdx = isAfter ? targetIdx + 1 : targetIdx;
            this.objects.splice(insertIdx, 0, draggedObj);
            this.updateSceneGraph();
            this.saveState('Reorder objects');
            this.toastManager.show('Hierarchy reordered', 'success');
        }
    }
    animate() {
        requestAnimationFrame(this.animate);
        const delta = this.clock.getDelta();
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tweenjs$2f$tween$2e$js$2f$dist$2f$tween$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["update"]();
        if (this.viewCube) this.viewCube.update();
        if (this.physicsManager) this.physicsManager.update(delta);
        if (this.animationManager) this.animationManager.update(delta, this.scene);
        if (this.timelineUI) this.timelineUI.update();
        this.orbitControls.update();
        if (this.exportManager) this.exportManager.capture();
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
}
}),
];

//# sourceMappingURL=src_frontend_3ab8dc44._.js.map