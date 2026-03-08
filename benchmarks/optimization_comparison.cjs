const { performance } = require("perf_hooks");

// Mock Three.js structures
class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  clone() {
    return new Vector3(this.x, this.y, this.z);
  }
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }
  equals(v) {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }
}

class Color {
  constructor(hex = 0xffffff) {
    this.hex = hex;
  }
  clone() {
    return new Color(this.hex);
  }
  copy(c) {
    this.hex = c.hex;
    return this;
  }
  getHex() {
    return this.hex;
  }
  equals(c) {
    return this.hex === c.hex;
  }
}

class Mesh {
  constructor(id) {
    this.name = `Mesh_${id}`;
    this.uuid = `uuid-${id}`;
    this.geometry = { type: "BoxGeometry" };
    this.position = new Vector3(Math.random(), Math.random(), Math.random());
    this.rotation = new Vector3(Math.random(), Math.random(), Math.random());
    this.scale = new Vector3(1, 1, 1);
    this.material = {
      color: new Color(0xff0000),
      emissive: new Color(0x000000),
    };
    this.userData = { geometryParams: { width: 1, height: 1, depth: 1 } };
    this.visible = true;
  }
}

class LegacyApp {
  constructor() {
    this.objects = [];
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = 50;
    this.selectedObject = null;
  }

  saveState(description = "Action") {
    const state = {
      description: description,
      timestamp: Date.now(),
      objects: this.objects.map((obj) => ({
        name: obj.name,
        type: obj.geometry.type,
        position: obj.position.clone(),
        rotation: obj.rotation.clone(),
        scale: obj.scale.clone(),
        material: {
          color: obj.material.color.clone(),
          emissive: obj.material.emissive.clone(),
        },
        geometryParams: obj.userData.geometryParams
          ? { ...obj.userData.geometryParams }
          : null,
        visible: obj.visible,
        uuid: obj.uuid,
      })),
      selectedObjectUuid: this.selectedObject ? this.selectedObject.uuid : null,
    };

    if (this.historyIndex < this.history.length - 1) {
      this.history.splice(this.historyIndex + 1);
    }
    this.history.push(state);
    this.historyIndex++;
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }
}

class OptimizedApp {
  constructor() {
    this.objects = [];
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = 50;
    this.selectedObject = null;
  }

  areObjectsEqual(liveObj, stateObj) {
    if (liveObj.name !== stateObj.name) return false;
    if (liveObj.visible !== stateObj.visible) return false;

    if (!liveObj.position.equals(stateObj.position)) return false;
    if (!liveObj.rotation.equals(stateObj.rotation)) return false;
    if (!liveObj.scale.equals(stateObj.scale)) return false;

    if (!liveObj.material.color.equals(stateObj.material.color)) return false;
    if (!liveObj.material.emissive.equals(stateObj.material.emissive))
      return false;

    const liveParams = liveObj.userData.geometryParams;
    const stateParams = stateObj.geometryParams;

    if (!liveParams && !stateParams) return true;
    if (!liveParams || !stateParams) return false;

    const keys1 = Object.keys(liveParams);
    const keys2 = Object.keys(stateParams);
    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (liveParams[key] !== stateParams[key]) return false;
    }

    return true;
  }

  saveState(description = "Action") {
    const timestamp = Date.now();
    const previousState = this.history[this.historyIndex];
    const previousObjectsMap = new Map();

    if (previousState) {
      previousState.objects.forEach((obj) => {
        previousObjectsMap.set(obj.uuid, obj);
      });
    }

    const objects = this.objects.map((obj) => {
      const prevObj = previousObjectsMap.get(obj.uuid);
      if (prevObj && this.areObjectsEqual(obj, prevObj)) {
        return prevObj;
      }

      return {
        name: obj.name,
        type: obj.geometry.type,
        position: obj.position.clone(),
        rotation: obj.rotation.clone(),
        scale: obj.scale.clone(),
        material: {
          color: obj.material.color.clone(),
          emissive: obj.material.emissive.clone(),
        },
        geometryParams: obj.userData.geometryParams
          ? { ...obj.userData.geometryParams }
          : null,
        visible: obj.visible,
        uuid: obj.uuid,
      };
    });

    const state = {
      description: description,
      timestamp: timestamp,
      objects: objects,
      selectedObjectUuid: this.selectedObject ? this.selectedObject.uuid : null,
    };

    if (this.historyIndex < this.history.length - 1) {
      this.history.splice(this.historyIndex + 1);
    }
    this.history.push(state);
    this.historyIndex++;
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }
}

function runBenchmark(AppClass, name, count, iterations) {
  if (global.gc) global.gc();
  const startHeap = process.memoryUsage().heapUsed;

  const app = new AppClass();

  // Create objects
  for (let i = 0; i < count; i++) {
    app.objects.push(new Mesh(i));
  }

  // Initial Save
  app.saveState("Initial");

  let totalTime = 0;
  for (let i = 0; i < iterations; i++) {
    // Modify one object
    const obj = app.objects[Math.floor(Math.random() * count)];
    obj.position.x += 0.1;

    const start = performance.now();
    app.saveState(`Action ${i}`);
    const end = performance.now();
    totalTime += end - start;
  }

  const endHeap = process.memoryUsage().heapUsed;
  const usedMB = (endHeap - startHeap) / 1024 / 1024;

  console.log(`[${name}] ${count} objs, ${iterations} iters:`);
  console.log(`  Time: ${(totalTime / iterations).toFixed(3)} ms/save`);
  console.log(`  Heap Growth: ${usedMB.toFixed(2)} MB`);
}

console.log("--- Optimization Comparison ---");
runBenchmark(LegacyApp, "Legacy", 3000, 50);
runBenchmark(OptimizedApp, "Optimized", 3000, 50);
