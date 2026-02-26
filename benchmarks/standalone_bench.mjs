import * as THREE from 'three';
import { performance } from 'perf_hooks';

// Simulate SceneStorage logic
const originalToJSON = THREE.BufferAttribute.prototype.toJSON;

function enableInefficient() {
    THREE.BufferAttribute.prototype.toJSON = function() {
      return {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: Array.from(this.array),
        normalized: this.normalized
      };
    };
}

function enableOptimized() {
    THREE.BufferAttribute.prototype.toJSON = function() {
      return {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: this.array,
        normalized: this.normalized
      };
    };
}

function restoreOriginal() {
    THREE.BufferAttribute.prototype.toJSON = originalToJSON;
}

async function runBenchmark(tubularSegments) {
    const scene = new THREE.Scene();

    // Create heavy geometry
    const radialSegments = Math.floor(tubularSegments / 2);
    const knot = new THREE.TorusKnotGeometry(10, 3, tubularSegments, radialSegments);

    // Convert to plain BufferGeometry to force attribute serialization
    // (Standard geometries serialize parameters, not attributes)
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', knot.getAttribute('position'));
    // Also include normals to increase data size
    if (knot.getAttribute('normal')) {
        geom.setAttribute('normal', knot.getAttribute('normal'));
    }

    knot.dispose();

    const mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial());
    scene.add(mesh);

    // Warmup JIT (reduced count for heavy ops)
    for(let i=0; i<2; i++) {
        enableInefficient(); scene.toJSON();
        enableOptimized(); scene.toJSON();
    }

    // Measure Inefficient
    enableInefficient();
    const start1 = performance.now();
    for(let i=0; i<5; i++) scene.toJSON(); // Average over 5 runs
    const end1 = performance.now();
    const time1 = (end1 - start1) / 5;

    // Measure Optimized
    enableOptimized();
    const start2 = performance.now();
    for(let i=0; i<5; i++) scene.toJSON();
    const end2 = performance.now();
    const time2 = (end2 - start2) / 5;

    restoreOriginal();

    console.log(`Segments: ${tubularSegments}, Vertices: ${geom.attributes.position.count}`);
    console.log(`  Inefficient: ${time1.toFixed(2)}ms`);
    console.log(`  Optimized:   ${time2.toFixed(2)}ms`);
    console.log(`  Speedup:     ${(time1 / time2).toFixed(2)}x`);

    geom.dispose();
}

(async () => {
    console.log("Running Standalone Benchmark...");
    try {
        await runBenchmark(500);
        await runBenchmark(1000);
        // 2000 might OOM or take too long if Inefficient is really slow
        await runBenchmark(2000);
    } catch (e) {
        console.error(e);
    }
})();
