
import { performance } from "perf_hooks";

// Mocking dependencies
const Events = {
    OBJECT_SELECTED: 'OBJECT_SELECTED',
    OBJECT_DESELECTED: 'OBJECT_DESELECTED',
    OBJECT_ADDED: 'OBJECT_ADDED',
    OBJECT_REMOVED: 'OBJECT_REMOVED',
    FOCUS_OBJECT: 'FOCUS_OBJECT'
};

class EventBus {
    static publish(event, data) {}
    static subscribe(event, callback) {}
}

class THREE {
    static Vector2 = class { constructor(x,y) { this.x=x; this.y=y; } };
    static Color = class {
        constructor(c) { this.c = c; }
        clone() { return new THREE.Color(this.c); }
        equals(other) { return this.c === other.c; }
        getHexString() { return this.c.toString(16); }
        set(v) { this.c = v; }
    };
}

class App {
    constructor() {
        this.objects = new Set();
        this.selectedObject = null;
        this.objectManager = {
            deleteObject: () => {},
            selectObject: (obj) => { this.selectedObject = obj; },
            deselectObject: () => { this.selectedObject = null; }
        };
        this.stateManager = {
            saveState: () => {},
            subscribe: () => {}
        };
    }

    saveState(msg) {}

    // Optimized version using Set
    deleteObject(object) {
        if (object) {
            this.objectManager.deleteObject(object);
            this.objects.delete(object);
            this.saveState('Delete object');
        }
    }

    addPrimitive(obj) {
        this.objects.add(obj);
    }
}

function runVerification() {
    const app = new App();
    const objs = Array.from({ length: 100 }, (_, i) => ({ uuid: `uuid-${i}`, name: `obj-${i}` }));

    // Test Add
    objs.forEach(o => app.addPrimitive(o));
    if (app.objects.size !== 100) throw new Error("Add failed");
    console.log("✅ Addition verified");

    // Test Delete
    const toDelete = objs[50];
    app.deleteObject(toDelete);
    if (app.objects.size !== 99) throw new Error("Delete failed: size mismatch");
    if (app.objects.has(toDelete)) throw new Error("Delete failed: object still in set");
    console.log("✅ Deletion verified");

    // Test iteration order (Sets preserve it)
    const currentObjects = [...app.objects];
    if (currentObjects[0] !== objs[0]) throw new Error("Order mismatch at 0");
    if (currentObjects[49] !== objs[49]) throw new Error("Order mismatch at 49");
    if (currentObjects[50] !== objs[51]) throw new Error("Order mismatch at 50 (after deletion of 50)");
    console.log("✅ Insertion order preservation verified");

    // Test multiple deletions
    for(let i=0; i<10; i++) app.deleteObject(objs[i]);
    if (app.objects.size !== 89) throw new Error("Bulk delete failed");
    console.log("✅ Bulk deletion verified");
}

try {
    runVerification();
    console.log("All verifications passed!");
} catch (e) {
    console.error("Verification failed:", e.message);
    process.exit(1);
}
