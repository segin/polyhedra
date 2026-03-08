import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { performance } from "perf_hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const srcPath = path.join(rootDir, "src/frontend/ObjectManager.js");
const tempPath = path.join(__dirname, "temp_ObjectManager.mjs");

console.log("Reading ObjectManager.js...");
let content = fs.readFileSync(srcPath, "utf8");

// Replace imports
content = content.replace(
  /import { Events } from '\.\/constants\.js';/g,
  "const Events = { OBJECT_REMOVED: 'objectRemoved' };",
);

console.log("Writing temp_ObjectManager.mjs...");
fs.writeFileSync(tempPath, content);

async function runBenchmark() {
  try {
    const { ObjectManager } = await import("./temp_ObjectManager.mjs");

    const eventBus = { publish: () => {} };
    const scene = { remove: () => {} };
    const objectManager = new ObjectManager(
      scene,
      eventBus,
      null,
      null,
      null,
      null,
      null,
    );

    console.log("Running benchmark: deleteObject() with many materials");

    const count = 100000;
    const parentGroup = {
      children: [],
      geometry: null,
      material: null,
      parent: null,
    };

    for (let i = 0; i < count; i++) {
      const material = {
        map: { dispose: () => {} },
        dispose: () => {},
      };
      const child = {
        children: [],
        geometry: { dispose: () => {} },
        material: material,
        parent: parentGroup,
      };
      parentGroup.children.push(child);
    }

    const start = performance.now();
    objectManager.deleteObject(parentGroup);
    const end = performance.now();

    console.log(
      `Deleting object with ${count} children took ${(end - start).toFixed(4)} ms`,
    );
  } catch (err) {
    console.error(err);
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
}

runBenchmark();
