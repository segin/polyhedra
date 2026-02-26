import { JSDOM } from 'jsdom';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

// 1. Setup Environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.self = global.window;
global.HTMLElement = dom.window.HTMLElement;

// Mock TextEncoder/Decoder for Three.js
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Patch FontLoader to avoid network request
FontLoader.prototype.load = function(url, onLoad, onProgress, onError) {
    // console.log(`Mock loading font: ${url}`);
    if (onLoad) {
        // Return a dummy font object
        onLoad({
            data: { glyphs: {} },
            generateShapes: () => []
        });
    }
};

// 2. Import PrimitiveFactory
import { PrimitiveFactory } from '../src/frontend/PrimitiveFactory.js';

async function runBenchmark() {
  console.log('Starting Geometry Cache Benchmark...');

  const factory = new PrimitiveFactory();
  const iterations = 1000;
  // We expect 1 geometry in cache if optimized, but currently it will be 1000.
  const uniqueGeometries = 1;

  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    // Create box with same dimensions but different color
    const options = {
      width: 1,
      height: 1,
      depth: 1,
      color: Math.floor(Math.random() * 0xffffff)
    };
    factory.createPrimitive('Box', options);
  }

  const end = performance.now();
  const cacheSize = Object.keys(factory.geometryCache).length;

  console.log(`Created ${iterations} primitives.`);
  console.log(`Time taken: ${(end - start).toFixed(2)}ms`);
  console.log(`Geometry Cache Size: ${cacheSize}`);

  if (cacheSize > uniqueGeometries) {
    console.log(`❌ FAIL: Cache size (${cacheSize}) is larger than unique geometries (${uniqueGeometries}). Optimization needed.`);
  } else {
    console.log(`✅ SUCCESS: Cache size (${cacheSize}) matches unique geometries.`);
  }
}

runBenchmark().catch(err => {
  console.error(err);
  process.exit(1);
});
