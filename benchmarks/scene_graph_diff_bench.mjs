
import { performance } from 'node:perf_hooks';

// --- Manual DOM Mock ---

class Node {
    constructor() {
        this.parentNode = null;
        this.children = [];
    }

    appendChild(child) {
        if (child.parentNode) {
            child.parentNode.removeChild(child);
        }
        if (child instanceof DocumentFragment) {
            // Move all fragment children to this node
            const fragmentChildren = [...child.children];
            for (const fragChild of fragmentChildren) {
                this.appendChild(fragChild);
            }
            child.children = []; // Clear fragment
        } else {
            child.parentNode = this;
            this.children.push(child);
        }
        return child;
    }

    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
            child.parentNode = null;
        }
        return child;
    }
}

class HTMLElement extends Node {
    constructor(tagName) {
        super();
        this.tagName = tagName;
        this.style = {};
        this.classList = new Set();
        this._textContent = '';
        this.attributes = new Map();
        this._onclick = null;
    }

    set textContent(value) {
        this._textContent = value;
        this.children = [];
    }

    get textContent() {
        return this._textContent;
    }

    set innerHTML(value) {
        if (value === '') {
            this.children = [];
            this._textContent = '';
        }
    }

    setAttribute(name, value) {
        this.attributes.set(name, value);
    }

    set className(value) {
        this.classList = new Set(value.split(' '));
    }

    get className() {
        return Array.from(this.classList).join(' ');
    }

    set onclick(fn) {
        this._onclick = fn;
    }
}

class DocumentFragment extends Node {
    constructor() {
        super();
    }
}

const document = {
    createDocumentFragment: () => new DocumentFragment(),
    createElement: (tagName) => new HTMLElement(tagName),
    getElementById: (id) => new HTMLElement('div')
};

// --- Benchmark Logic ---

const appMock = {
    objectsList: document.createElement('ul'),
    objects: [],
    sceneGraphItemMap: new Map(),
    selectedObject: null,
    deleteObject: () => {},
    selectObject: () => {},

    updateSceneGraph_Baseline: function() {
        if (!this.objectsList) return;

        const fragment = document.createDocumentFragment();

        if (this.objects.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No objects';
            fragment.appendChild(li);
        } else {
            this.objects.forEach((obj, idx) => {
                const li = document.createElement('li');

                li.style.cssText = `padding: 5px; background: ${this.selectedObject === obj ? '#444' : '#222'};`;

                const name = document.createElement('span');
                name.className = 'object-name';
                name.textContent = obj.name || `Object ${idx + 1}`;
                li.appendChild(name);

                const controls = document.createElement('div');
                const visibilityBtn = document.createElement('button');
                visibilityBtn.textContent = obj.visible ? '👁️' : '🚫';
                controls.appendChild(visibilityBtn);
                li.appendChild(controls);

                li.onclick = () => this.selectObject(obj);
                fragment.appendChild(li);
            });
        }

        this.objectsList.innerHTML = '';
        this.objectsList.appendChild(fragment);
    },

    updateSceneGraph_Optimized: function() {
        if (!this.objectsList) return;

        if (this.objects.length === 0) {
            this.objectsList.innerHTML = '';
            this.sceneGraphItemMap.clear();
            const li = document.createElement('li');
            li.textContent = 'No objects';
            this.objectsList.appendChild(li);
            return;
        }

        const fragment = document.createDocumentFragment();
        const currentUuids = new Set();

        this.objects.forEach((obj, idx) => {
            currentUuids.add(obj.uuid);
            let li = this.sceneGraphItemMap.get(obj.uuid);
            let nameSpan, visibilityBtn;

            if (!li) {
                li = document.createElement('li');
                li.setAttribute('role', 'listitem');

                nameSpan = document.createElement('span');
                nameSpan.className = 'object-name';
                li.appendChild(nameSpan);

                const controls = document.createElement('div');
                visibilityBtn = document.createElement('button');
                visibilityBtn.className = 'visibility-btn';
                controls.appendChild(visibilityBtn);
                li.appendChild(controls);

                // Cache references for fast updates
                li._nameSpan = nameSpan;
                li._visibilityBtn = visibilityBtn;

                this.sceneGraphItemMap.set(obj.uuid, li);
            } else {
                 nameSpan = li._nameSpan;
                 visibilityBtn = li._visibilityBtn;
            }

            const isSelected = this.selectedObject === obj;
            const bg = isSelected ? '#444' : '#222';
            if (li.style.background !== bg) {
                li.style.background = bg;
            }

            const nameText = obj.name || `Object ${idx + 1}`;
            if (nameSpan.textContent !== nameText) nameSpan.textContent = nameText;

            const visText = obj.visible ? '👁️' : '🚫';
            if (visibilityBtn.textContent !== visText) visibilityBtn.textContent = visText;

            li.onclick = () => this.selectObject(obj);
            visibilityBtn.onclick = (e) => {
                 obj.visible = !obj.visible;
                 this.updateSceneGraph_Optimized();
            };

            fragment.appendChild(li);
        });

        for (const [uuid, li] of this.sceneGraphItemMap) {
            if (!currentUuids.has(uuid)) {
                if (li.parentNode) li.parentNode.removeChild(li);
                this.sceneGraphItemMap.delete(uuid);
            }
        }

        this.objectsList.appendChild(fragment);
    }
};

const createObjects = (count) => {
    const objects = [];
    for (let i = 0; i < count; i++) {
        objects.push({
            uuid: `uuid-${i}`,
            name: `Object ${i}`,
            visible: true
        });
    }
    return objects;
};

const runBenchmark = (name, fn) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(3)} ms`);
};

const OBJECT_COUNT = 20000; // Increased count
appMock.objects = createObjects(OBJECT_COUNT);

console.log(`--- Benchmark: ${OBJECT_COUNT} Objects ---`);

// 1. Initial Render
appMock.objectsList.innerHTML = '';
appMock.sceneGraphItemMap.clear();
runBenchmark('Baseline: Initial Render', () => appMock.updateSceneGraph_Baseline());

appMock.objectsList.innerHTML = '';
appMock.sceneGraphItemMap.clear();
runBenchmark('Optimized: Initial Render', () => appMock.updateSceneGraph_Optimized());

// 2. Update Selection
appMock.selectedObject = appMock.objects[Math.floor(OBJECT_COUNT / 2)];

// Reset state for baseline
runBenchmark('Baseline: Update Selection', () => appMock.updateSceneGraph_Baseline());

// Setup state for optimized
appMock.objectsList.innerHTML = '';
appMock.sceneGraphItemMap.clear();
appMock.updateSceneGraph_Optimized(); // Pre-populate
runBenchmark('Optimized: Update Selection', () => appMock.updateSceneGraph_Optimized());
