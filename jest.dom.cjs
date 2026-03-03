const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Only setup JSDOM manually if not in a JSDOM environment (though Jest should handle this)
if (typeof window === 'undefined') {
    // If we are here, it means the environment isn't providing window/document
    // However, since we use jest-environment-jsdom, we should have them.
    // Let's rely on the environment and see if that fixes the issue.
    // If we really need JSDOM here, we might need to fix the ESM import issue.

    // Fix ESM import issue for jsdom by safely importing it dynamically and executing it.
    // In Jest, top-level await is generally not supported in CJS setup files, so we
    // try to load it sync. Since `jsdom` provides a CJS entry point, we can just require it.
    // But to handle potential strict ESM resolution issues in some Node versions due to `"type": "module"`,
    // dynamic import is an alternative if needed, but synchronous setup is better for Jest setup files.
    try {
        const { JSDOM } = require('jsdom');
        const dom = new JSDOM('<!DOCTYPE html><html><body><div id="objects-list"></div></body></html>', {
            url: 'http://localhost'
        });
        global.window = dom.window;
        global.document = dom.window.document;
        global.navigator = dom.window.navigator;

        // Ensure globals that rely on window are correctly assigned if missing
        global.HTMLElement = dom.window.HTMLElement;
        global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
        global.Node = dom.window.Node;
        global.self = dom.window;
    } catch (e) {
        console.warn('Failed to load JSDOM synchronously. ESM issue might be present:', e.message);
    }
}
