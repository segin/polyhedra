import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { performance } from "perf_hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const srcPath = path.join(rootDir, "src/frontend/PrimitiveManager.js");
const tempPath = path.join(__dirname, "temp_PrimitiveManager.mjs");

console.log("Reading PrimitiveManager.js...");
let content = fs.readFileSync(srcPath, "utf8");

// Replace imports
content = content.replace(
  /import \* as THREE from 'three';/g,
  "import * as THREE from './mock_three.mjs';",
);
content = content.replace(
  /import { TeapotGeometry } from 'three\/examples\/jsm\/geometries\/TeapotGeometry\.js';/g,
  "import { TeapotGeometry } from './mock_three_examples.mjs';",
);
content = content.replace(
  /import { FontLoader } from 'three\/examples\/jsm\/loaders\/FontLoader\.js';/g,
  "import { FontLoader } from './mock_three_examples.mjs';",
);
content = content.replace(
  /import { TextGeometry } from 'three\/examples\/jsm\/geometries\/TextGeometry\.js';/g,
  "import { TextGeometry } from './mock_three_examples.mjs';",
);

console.log("Writing temp_PrimitiveManager.mjs...");
fs.writeFileSync(tempPath, content);

async function runBenchmark() {
  try {
    const { PrimitiveManager } = await import("./temp_PrimitiveManager.mjs");
    const { Scene } = await import("./mock_three.mjs");

    const scene = new Scene();
    const manager = new PrimitiveManager(scene);

    console.log("Running benchmark: addCube() x 10000");

    global.gc && global.gc();
    const startMem = process.memoryUsage().heapUsed;
    const start = performance.now();

    const meshes = [];
    for (let i = 0; i < 10000; i++) {
      meshes.push(manager.addCube());
    }

    const end = performance.now();
    const endMem = process.memoryUsage().heapUsed;

    const uniqueGeometries = new Set(meshes.map((m) => m.geometry.uuid));
    console.log(`Time: ${(end - start).toFixed(2)}ms`);
    console.log(`Unique Geometries: ${uniqueGeometries.size}`);
    console.log(`Total Meshes: ${meshes.length}`);
    console.log(
      `Memory Delta: ${((endMem - startMem) / 1024 / 1024).toFixed(2)} MB`,
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
