import { performance } from 'perf_hooks';

// --- Global Mocks ---
global.window = {
    innerWidth: 800,
    innerHeight: 600,
    devicePixelRatio: 1,
    addEventListener: () => {},
    location: { href: '' },
    navigator: { maxTouchPoints: 0 },
    requestAnimationFrame: (cb) => setTimeout(cb, 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
    JSZip: class { loadAsync(){ return Promise.resolve(); } },
    URL: { createObjectURL: () => 'blob:foo', revokeObjectURL: () => {} }
};
global.self = global.window;
global.requestAnimationFrame = global.window.requestAnimationFrame;
global.cancelAnimationFrame = global.window.cancelAnimationFrame;

// DOM Node Mock
class MockNode {
    constructor(tag) {
        this.tagName = tag ? tag.toUpperCase() : 'DIV';
        this.style = {};
        this._classes = new Set();
        this.classList = {
            add: (...args) => args.forEach(a => this._classes.add(a)),
            remove: (...args) => args.forEach(a => this._classes.delete(a)),
            contains: (c) => this._classes.has(c)
        };
        this.children = [];
        this.childNodes = []; // Alias
        this.parentNode = null;
        this._html = '';
        this._text = '';
        this.attributes = {};
    }
    set className(val) {
        this._classes.clear();
        if (val) val.split(' ').forEach(c => c && this._classes.add(c));
    }
    get className() { return Array.from(this._classes).join(' '); }

    setAttribute(k, v) { this.attributes[k] = v; }
    appendChild(child) {
        if (child instanceof MockFragment) {
            child.children.forEach(c => {
                this.children.push(c);
                c.parentNode = this;
            });
            child.children = []; // Fragment empties
        } else {
            this.children.push(child);
            child.parentNode = this;
        }
    }
    removeChild(child) {
        const idx = this.children.indexOf(child);
        if (idx > -1) {
            this.children.splice(idx, 1);
            child.parentNode = null;
        }
    }
    insertBefore(newNode, refNode) {
        const idx = this.children.indexOf(refNode);
        if (idx > -1) {
            this.children.splice(idx, 0, newNode);
            newNode.parentNode = this;
        } else {
            this.appendChild(newNode);
        }
    }
    set innerHTML(val) {
        this._html = val;
        if (val === '') {
            this.children = [];
            this.childNodes = this.children;
        }
    }
    get innerHTML() { return this._html; }
    set textContent(val) { this._text = val; }
    get textContent() { return this._text; }
    get firstChild() { return this.children[0]; }
    get firstElementChild() { return this.children[0]; }
    addEventListener() {}
    removeEventListener() {}
    querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
    querySelectorAll(sel) {
        const res = [];
        const traverse = (node) => {
            if (sel.startsWith('.')) {
                if (node.classList.contains(sel.substring(1))) res.push(node);
            } else {
                if (node.tagName === sel.toUpperCase()) res.push(node);
            }
            node.children.forEach(traverse);
        }
        this.children.forEach(traverse);
        return res;
    }
}

class MockFragment {
    constructor() {
        this.children = [];
        this.childNodes = this.children;
    }
    appendChild(child) {
        this.children.push(child);
        child.parentNode = this;
    }
}

global.document = {
    body: new MockNode('BODY'),
    createElement: (tag) => new MockNode(tag),
    getElementById: (id) => {
        if (!global._mockElements) global._mockElements = {};
        if (!global._mockElements[id]) {
             const el = new MockNode('DIV');
             el.id = id;
             global._mockElements[id] = el;
        }
        return global._mockElements[id];
    },
    createDocumentFragment: () => new MockFragment(),
    documentElement: { requestFullscreen: async () => {} },
    exitFullscreen: () => {},
    fullscreenElement: null
};

global.HTMLElement = MockNode;
global.HTMLInputElement = class extends MockNode {};
global.Image = class {};
global.Worker = class { constructor() { this.addEventListener=()=>{}; } postMessage(){} };
global.URL = global.window.URL;

// --- Run Benchmark ---

async function runBenchmark() {
    console.log('Starting benchmark...');
    try {
        const { App } = await import('../src/frontend/main.js');
        console.log('App imported.');

        // Disable animation loop
        App.prototype.animate = function() {};

        // Initialize App
        const app = new App();

        // Setup test data
        const objectCount = 5000;
        console.log(`Creating ${objectCount} objects...`);

        const objects = [];
        for (let i = 0; i < objectCount; i++) {
            objects.push({
                uuid: `uuid-${i}`,
                name: `Object ${i}`,
                visible: true,
                type: 'Mesh',
                geometry: { type: 'BoxGeometry' },
                position: { x: 0, y: 0, z: 0, clone: () => ({ equals: () => true }) },
                rotation: { x: 0, y: 0, z: 0, clone: () => ({ equals: () => true }) },
                scale: { x: 1, y: 1, z: 1, clone: () => ({ equals: () => true }) },
                material: {
                    color: { getHexString: () => 'ffffff', clone: () => ({ equals: () => true }) },
                    emissive: { clone: () => ({ equals: () => true }) }
                },
                userData: {}
            });
        }
        app.objects = objects;

        // Ensure map is clean
        if (app.sceneGraphItemMap) app.sceneGraphItemMap.clear();

        // Measure Initial Load
        const startLoad = performance.now();
        app.updateSceneGraph();
        const endLoad = performance.now();
        console.log(`[Benchmark] Initial updateSceneGraph: ${(endLoad - startLoad).toFixed(3)} ms`);

        // Measure Update (Single Change)
        // Baseline will be slow (rebuild all)
        app.objects[0].visible = !app.objects[0].visible;

        const startUpdate = performance.now();
        app.updateSceneGraph();
        const endUpdate = performance.now();
        console.log(`[Benchmark] Subsequent updateSceneGraph (1 change): ${(endUpdate - startUpdate).toFixed(3)} ms`);

        // Verify functionality: Click Handler Update
        console.log('Verifying click handler update...');
        // Mock selectObject
        let selectedObj = null;
        app.selectObject = (o) => { selectedObj = o; };

        // Get the li for object 0
        const li = app.sceneGraphItemMap.get(objects[0].uuid);
        if (!li) throw new Error('li not found for object 0');

        // Simulate click
        li.onclick();

        if (selectedObj !== objects[0]) {
            throw new Error('Click handler selected wrong object');
        }
        console.log('Click handler verified: Selected correct object.');

        // Verify Delete Button Handler
        console.log('Verifying delete button handler...');
        let deletedObj = null;
        app.deleteObject = (o) => { deletedObj = o; };

        // Simulate delete button click
        // Assuming delete button is the second button in controls div (visibility is first)
        // My MockNode structure: li -> [name, controls -> [visBtn, delBtn]]
        const controls = li.children[1];
        // We now store _deleteBtn on li, but let's check structure too or use reference
        // @ts-ignore
        const delBtn = li._deleteBtn;

        if (!delBtn) throw new Error('_deleteBtn not found on li');

        delBtn.onclick({ stopPropagation: () => {} });

        if (deletedObj !== objects[0]) {
            throw new Error('Delete button handler selected wrong object');
        }
        console.log('Delete button handler verified: Deleted correct object.');

    } catch (err) {
        console.error('Benchmark error:', err);
        process.exit(1);
    }
}

runBenchmark();
