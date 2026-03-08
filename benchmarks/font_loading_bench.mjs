import { performance } from "perf_hooks";
import fs from "fs";
import path from "path";

// Define mocks globally for eval context
global.THREE = {
  MeshPhongMaterial: class {
    constructor() {}
  },
  Mesh: class {
    constructor() {}
  },
  BoxGeometry: class {
    constructor() {}
  },
  SphereGeometry: class {
    constructor() {}
  },
  CylinderGeometry: class {
    constructor() {}
  },
  ConeGeometry: class {
    constructor() {}
  },
  TorusGeometry: class {
    constructor() {}
  },
  TorusKnotGeometry: class {
    constructor() {}
  },
  IcosahedronGeometry: class {
    constructor() {}
  },
  DodecahedronGeometry: class {
    constructor() {}
  },
  OctahedronGeometry: class {
    constructor() {}
  },
  PlaneGeometry: class {
    constructor() {}
  },
  TubeGeometry: class {
    constructor() {}
  },
  LatheGeometry: class {
    constructor() {}
  },
  ExtrudeGeometry: class {
    constructor() {}
  },
  Vector2: class {
    constructor() {}
  },
  Vector3: class {
    constructor() {}
  },
  CatmullRomCurve3: class {
    constructor() {}
  },
  Shape: class {
    constructor() {
      this.moveTo = () => {};
      this.bezierCurveTo = () => {};
    }
  },
  DoubleSide: 2,
  FrontSide: 0,
};

global.TeapotGeometry = class {
  constructor() {}
};
global.TextGeometry = class {
  constructor() {}
  center() {}
};

global.FontLoader = class {
  load(url, onLoad) {
    global.mockLoad(url, onLoad);
  }
};

const primitiveManagerPath = "src/frontend/PrimitiveManager.js";
let primitiveManagerCode = fs.readFileSync(primitiveManagerPath, "utf8");

// Strip imports
primitiveManagerCode = primitiveManagerCode.replace(/import .* from .*/g, "");
primitiveManagerCode = primitiveManagerCode.replace(
  /export class PrimitiveManager/,
  "class PrimitiveManager",
);

const wrappedCode = `
(() => {
    ${primitiveManagerCode}
    global.PrimitiveManager = PrimitiveManager;
})();
`;

try {
  eval(wrappedCode);
} catch (e) {
  console.error("Error evaluating PrimitiveManager:", e);
  process.exit(1);
}

async function runBenchmark() {
  console.log("Starting Font Loading Benchmark...");

  // Test 1: Sequential Calls
  console.log("\n--- Test 1: Sequential Calls ---");
  let loadCallCount = 0;
  global.mockLoad = (url, onLoad) => {
    loadCallCount++;
    setTimeout(() => {
      if (onLoad) onLoad({ type: "Font" });
    }, 50);
  };

  let scene = { add: () => {} };
  let pm = new global.PrimitiveManager(scene);

  let start = performance.now();
  await pm.addText("Seq 1");
  await pm.addText("Seq 2");
  await pm.addText("Seq 3");
  let end = performance.now();

  console.log(`Total time: ${(end - start).toFixed(2)}ms`);
  console.log(`FontLoader.load called ${loadCallCount} times`);

  if (loadCallCount === 1) {
    console.log("PASS: Font loaded once (sequential).");
  } else {
    console.log("FAIL: Font loaded multiple times (sequential).");
  }

  // Test 2: Concurrent Calls
  console.log("\n--- Test 2: Concurrent Calls ---");
  loadCallCount = 0; // Reset count
  // Reset PrimitiveManager instance to clear cache
  pm = new global.PrimitiveManager(scene);

  start = performance.now();
  await Promise.all([
    pm.addText("Conc 1"),
    pm.addText("Conc 2"),
    pm.addText("Conc 3"),
  ]);
  end = performance.now();

  console.log(`Total time: ${(end - start).toFixed(2)}ms`);
  console.log(`FontLoader.load called ${loadCallCount} times`);

  if (loadCallCount === 1) {
    console.log("PASS: Font loaded once (concurrent).");
  } else {
    console.log("FAIL: Font loaded multiple times (concurrent).");
  }
}

runBenchmark();
