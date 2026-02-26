const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Only setup JSDOM manually if not in a JSDOM environment (though Jest should handle this)
if (typeof window === 'undefined') {
    // If we are here, it means the environment isn't providing window/document
    // However, since we use jest-environment-jsdom, we should have them.
    // Let's rely on the environment and see if that fixes the issue.
    // If we really need JSDOM here, we might need to fix the ESM import issue.
}
