import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { performance } from "perf_hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const srcPath = path.join(rootDir, "src/frontend/PrimitiveFactory.js");
const tempPath = path.join(__dirname, "temp_PrimitiveFactory_bench.mjs");

let content = fs.readFileSync(srcPath, "utf8");

// Replace imports with mocks
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

content = content.replace(
  /import log from '.\/logger.js';/g,
  "const log = { error: () => {}, info: () => {} };",
);

fs.writeFileSync(tempPath, content);

async function runBenchmark() {
  try {
    const { PrimitiveFactory } = await import("./temp_PrimitiveFactory_bench.mjs");
    const factory = new PrimitiveFactory();

    const types = ['Teapot', 'Tube', 'Extrude', 'Lathe'];
    const iterations = 1000;

    for (const type of types) {
        console.log(`\nBenchmarking ${type} x ${iterations}`);
        
        global.gc && global.gc();
        const startMem = process.memoryUsage().heapUsed;
        const start = performance.now();

        const geometries = [];
        for (let i = 0; i < iterations; i++) {
            // Using same params to trigger caching
            const geo = factory._getCachedGeometry(type, {});
            geometries.push(geo);
        }

        const end = performance.now();
        const endMem = process.memoryUsage().heapUsed;

        const uniqueUuids = new Set(geometries.filter(g => g).map(g => g.uuid));
        
        console.log(`Time: ${(end - start).toFixed(2)}ms`);
        console.log(`Unique Geometries: ${uniqueUuids.size}`);
        console.log(`Memory Delta: ${((endMem - startMem) / 1024 / 1024).toFixed(2)} MB`);
        
        if (uniqueUuids.size !== 1) {
            console.error(`FAILED: ${type} is NOT being cached correctly (Expected 1 unique geometry, got ${uniqueUuids.size})`);
        } else {
            console.log(`SUCCESS: ${type} caching verified.`);
        }
    }

  } catch (err) {
    console.error(err);
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
}

runBenchmark();
