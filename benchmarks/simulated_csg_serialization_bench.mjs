import { performance } from "perf_hooks";

// Mock THREE-like structure
const createMockMesh = (vertexCount) => {
  const positionArray = new Float32Array(vertexCount * 3);
  const normalArray = new Float32Array(vertexCount * 3);
  const uvArray = new Float32Array(vertexCount * 2);
  const indexArray = new Uint16Array(vertexCount); // Assuming indexed

  // Fill with random data
  for (let i = 0; i < positionArray.length; i++)
    positionArray[i] = Math.random();
  for (let i = 0; i < normalArray.length; i++) normalArray[i] = Math.random();
  for (let i = 0; i < uvArray.length; i++) uvArray[i] = Math.random();
  for (let i = 0; i < indexArray.length; i++) indexArray[i] = i % 65535;

  return {
    geometry: {
      attributes: {
        position: { array: positionArray, count: vertexCount },
        normal: { array: normalArray, count: vertexCount },
        uv: { array: uvArray, count: vertexCount },
      },
      index: { array: indexArray },
    },
    matrix: {
      toArray: () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    },
  };
};

function serializeMeshOld(mesh) {
  const geometry = mesh.geometry;
  const attributes = {};
  const transferBuffers = [];

  if (geometry.attributes.position) {
    const array = geometry.attributes.position.array;
    attributes.position = array.slice();
    transferBuffers.push(attributes.position.buffer);
  }
  if (geometry.attributes.normal) {
    const array = geometry.attributes.normal.array;
    attributes.normal = array.slice();
    transferBuffers.push(attributes.normal.buffer);
  }
  if (geometry.attributes.uv) {
    const array = geometry.attributes.uv.array;
    attributes.uv = array.slice();
    transferBuffers.push(attributes.uv.buffer);
  }

  let index = null;
  if (geometry.index) {
    const array = geometry.index.array;
    index = array.slice();
    transferBuffers.push(index.buffer);
  }

  const matrix = mesh.matrix.toArray();

  return {
    attributes,
    index,
    matrix,
    _transferBuffers: transferBuffers,
  };
}

function serializeMeshNew(mesh) {
  const geometry = mesh.geometry;
  const attributes = {};
  const transferBuffers = [];

  // Optimization: Remove .slice() to avoid copy.
  if (geometry.attributes.position) {
    const array = geometry.attributes.position.array;
    attributes.position = array;
    transferBuffers.push(attributes.position.buffer);
  }
  if (geometry.attributes.normal) {
    const array = geometry.attributes.normal.array;
    attributes.normal = array;
    transferBuffers.push(attributes.normal.buffer);
  }
  if (geometry.attributes.uv) {
    const array = geometry.attributes.uv.array;
    attributes.uv = array;
    transferBuffers.push(attributes.uv.buffer);
  }

  let index = null;
  if (geometry.index) {
    const array = geometry.index.array;
    index = array;
    transferBuffers.push(index.buffer);
  }

  const matrix = mesh.matrix.toArray();

  return {
    attributes,
    index,
    matrix,
    _transferBuffers: transferBuffers,
  };
}

// 100k vertices ~ 1.2MB for position
const vertexCount = 100000;
const mesh = createMockMesh(vertexCount);

console.log(`Vertex count: ${vertexCount}`);
console.log(
  `Buffer size (position): ${(mesh.geometry.attributes.position.array.byteLength / 1024 / 1024).toFixed(2)} MB`,
);

const iterations = 100;

// Warmup
for (let i = 0; i < 5; i++) serializeMeshOld(mesh);

const startOld = performance.now();
for (let i = 0; i < iterations; i++) {
  serializeMeshOld(mesh);
}
const endOld = performance.now();
const timeOld = endOld - startOld;

console.log(`Old Implementation (100 iterations): ${timeOld.toFixed(2)}ms`);
console.log(`Average per call: ${(timeOld / iterations).toFixed(2)}ms`);

// Warmup
for (let i = 0; i < 5; i++) serializeMeshNew(mesh);

const startNew = performance.now();
for (let i = 0; i < iterations; i++) {
  serializeMeshNew(mesh);
}
const endNew = performance.now();
const timeNew = endNew - startNew;

console.log(`New Implementation (100 iterations): ${timeNew.toFixed(2)}ms`);
console.log(`Average per call: ${(timeNew / iterations).toFixed(2)}ms`);

console.log(
  `Improvement: ${(((timeOld - timeNew) / timeOld) * 100).toFixed(2)}%`,
);
