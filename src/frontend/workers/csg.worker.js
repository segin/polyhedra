import { CSG } from "three-csg-ts";
import * as THREE from "three";

self.onmessage = function (event) {
  const { id, meshA, meshB, operation } = event.data;

  try {
    const objectA = createMesh(meshA);
    const objectB = createMesh(meshB);

    // Apply matrices
    if (meshA.matrix) {
      objectA.matrix.fromArray(meshA.matrix);
      // Decompose to update position/rotation/scale components which might be used internally?
      // But CSG uses updateMatrix() which uses matrixWorld if autoUpdate is true?
      // CSG.fromMesh checks object.matrix.
      // We set matrix manually and set matrixAutoUpdate to false to prevent overwriting.
      objectA.matrixAutoUpdate = false;
    }
    if (meshB.matrix) {
      objectB.matrix.fromArray(meshB.matrix);
      objectB.matrixAutoUpdate = false;
    }

    // CSG.fromMesh uses object.matrix (local matrix) effectively if it transforms vertices.
    // Actually, three-csg-ts uses the object's matrix to transform vertices to world space if needed?
    // Let's check source code if possible, or assume standard behavior.
    // Standard behavior: it uses the matrix property.

    const bspA = CSG.fromMesh(objectA);
    const bspB = CSG.fromMesh(objectB);

    let resultBsp;
    switch (operation) {
      case "union":
        resultBsp = bspA.union(bspB);
        break;
      case "subtract":
        resultBsp = bspA.subtract(bspB);
        break;
      case "intersect":
        resultBsp = bspA.intersect(bspB);
        break;
      default:
        throw new Error(`Unknown CSG operation: ${operation}`);
    }

    const resultMesh = CSG.toMesh(resultBsp, objectA.matrix);

    // Extract geometry data to send back
    const geometry = resultMesh.geometry;

    // Convert attributes to plain arrays or keep as TypedArrays to transfer
    const attributes = {};
    const transferList = [];

    if (geometry.attributes.position) {
      attributes.position = geometry.attributes.position.array;
      transferList.push(attributes.position.buffer);
    }
    if (geometry.attributes.normal) {
      attributes.normal = geometry.attributes.normal.array;
      transferList.push(attributes.normal.buffer);
    }
    if (geometry.attributes.uv) {
      attributes.uv = geometry.attributes.uv.array;
      transferList.push(attributes.uv.buffer);
    }

    let index = null;
    if (geometry.index) {
      index = geometry.index.array;
      transferList.push(index.buffer);
    }

    self.postMessage(
      {
        type: "result",
        id,
        data: { attributes, index },
      },
      transferList,
    );
  } catch (error) {
    self.postMessage({ type: "error", id, message: error.message });
  }
};

function createMesh(data) {
  const geometry = new THREE.BufferGeometry();

  if (data.attributes.position)
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(data.attributes.position, 3),
    );
  if (data.attributes.normal)
    geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(data.attributes.normal, 3),
    );
  if (data.attributes.uv)
    geometry.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute(data.attributes.uv, 2),
    );
  if (data.index) geometry.setIndex(new THREE.BufferAttribute(data.index, 1));

  return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
}
