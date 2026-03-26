import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(currentDir, '..');
const vendorDir = path.join(rootDir, 'src', 'frontend', 'vendor');

// Create vendor directory if it doesn't exist
if (!fs.existsSync(vendorDir)) {
  fs.mkdirSync(vendorDir, { recursive: true });
}

const filesToCopy = [
  { src: 'three/build/three.module.js', dest: 'three.js' },
  { src: 'three/examples/jsm/controls/OrbitControls.js', dest: 'OrbitControls.js' },
  { src: 'three/examples/jsm/loaders/OBJLoader.js', dest: 'OBJLoader.js' },
  { src: 'three/examples/jsm/loaders/GLTFLoader.js', dest: 'GLTFLoader.js' },
  { src: 'three/examples/jsm/utils/BufferGeometryUtils.js', dest: 'BufferGeometryUtils.js' },
  { src: 'three/examples/jsm/controls/TransformControls.js', dest: 'TransformControls.js' },
  { src: 'dat.gui/build/dat.gui.module.js', dest: 'dat.gui.js' },
  { src: 'jszip/dist/jszip.min.js', dest: 'jszip.js' },
  { src: 'three/build/three.module.min.js', dest: 'three.min.js' },
  { src: 'loglevel/dist/loglevel.min.js', dest: 'loglevel.js' },
  { src: 'cannon-es/dist/cannon-es.js', dest: 'cannon-es.js' },
  { src: 'three-csg-ts/lib/esm/index.js', dest: 'three-csg-ts.js' },
  { src: 'three/examples/jsm/geometries/TeapotGeometry.js', dest: 'TeapotGeometry.js' },
  { src: 'three/examples/jsm/loaders/FontLoader.js', dest: 'FontLoader.js' },
  { src: 'three/examples/jsm/geometries/TextGeometry.js', dest: 'TextGeometry.js' },
  { src: 'ccapture.js/build/CCapture.all.min.js', dest: 'CCapture.all.min.js' }
];

for (const file of filesToCopy) {
  const srcPath = path.join(rootDir, 'node_modules', ...file.src.split('/'));
  const destPath = path.join(vendorDir, file.dest);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file.src} to vendor/${file.dest}`);
  } else {
    console.error(`Source file not found: ${srcPath}`);
  }
}

console.log('Vendor files copied successfully.');
