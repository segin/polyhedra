import { jest } from '@jest/globals';

class MockWorker {
    constructor(url) {
        this.url = url;
        this.onmessage = null;
        this.onerror = null;
        this.listeners = { message: [] };
        this.terminate = jest.fn();
    }
    addEventListener(type, listener) {
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type].push(listener);
    }
    removeEventListener(type, listener) {
        if (!this.listeners[type]) return;
        this.listeners[type] = this.listeners[type].filter(l => l !== listener);
    }
    postMessage(message) {
        // Mock async response
        setTimeout(() => {
            if (this.onmessage) this.onmessage({ data: { type: 'complete' } });
            if (this.listeners.message) {
                this.listeners.message.forEach(l => l({ data: { type: 'complete' } }));
            }
        }, 0);
    }
}

global.Worker = MockWorker;
global.window = {
    JSZip: jest.fn(),
    location: { hostname: 'localhost' }
};
global.URL = {
    createObjectURL: jest.fn(() => 'blob:mock'),
    revokeObjectURL: jest.fn()
};
global.document = {
    createElement: jest.fn(() => ({
        click: jest.fn(),
        setAttribute: jest.fn(),
        style: {}
    }))
};
global.Blob = class Blob {
    constructor(content, options) {
        this.content = content;
        this.options = options;
        this.size = content.reduce((acc, curr) => acc + (curr.length || 0), 0);
    }
};
