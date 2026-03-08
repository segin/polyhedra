import * as THREE from "three";
import { performance } from "perf_hooks";

// Generate a large scene
function createLargeScene(objectCount = 10000) {
  const scene = new THREE.Scene();
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  for (let i = 0; i < objectCount; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      Math.random() * 100,
      Math.random() * 100,
      Math.random() * 100,
    );
    mesh.name = `Object_${i}`;
    scene.add(mesh);
  }
  return scene;
}

console.log("Generating scene with 10,000 objects...");
const scene = createLargeScene(10000);
console.log("Serializing scene to JSON string...");
const sceneJson = scene.toJSON();
const jsonString = JSON.stringify(sceneJson);
console.log(
  `JSON string size: ${(jsonString.length / 1024 / 1024).toFixed(2)} MB`,
);

// Measure JSON.parse
console.log("Measuring JSON.parse...");
const startParse = performance.now();
const parsedObject = JSON.parse(jsonString);
const endParse = performance.now();
const parseTime = endParse - startParse;
console.log(`JSON.parse time: ${parseTime.toFixed(2)} ms`);

// Measure ObjectLoader.parse
console.log("Measuring ObjectLoader.parse...");
const loader = new THREE.ObjectLoader();
const startLoad = performance.now();
const loadedScene = loader.parse(parsedObject);
const endLoad = performance.now();
const loadTime = endLoad - startLoad;
console.log(`ObjectLoader.parse time: ${loadTime.toFixed(2)} ms`);

console.log("--- Summary ---");
console.log(
  `Worker Task (JSON.parse): ${parseTime.toFixed(2)} ms (Offloaded from Main Thread)`,
);
console.log(`Main Thread Task (ObjectLoader): ${loadTime.toFixed(2)} ms`);
