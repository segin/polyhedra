// tests/benchmark_serialization.test.js

describe("Benchmark Serialization Performance", () => {
  // Generate a large dummy scene object with TypedArrays
  const generateSceneData = (numVertices) => {
    const vertices = new Float32Array(numVertices * 3);
    for (let i = 0; i < vertices.length; i++) {
      vertices[i] = Math.random();
    }

    // Create a structure mimicking THREE.Scene.toJSON() output with patched BufferAttribute
    return {
      metadata: { version: 4.5, type: "Object", generator: "Object3D.toJSON" },
      geometries: [
        {
          uuid: "geo-1",
          type: "BufferGeometry",
          data: {
            attributes: {
              position: {
                itemSize: 3,
                type: "Float32Array",
                array: vertices, // Raw TypedArray
                normalized: false,
              },
              normal: {
                itemSize: 3,
                type: "Float32Array",
                array: new Float32Array(numVertices * 3),
                normalized: false,
              },
            },
          },
        },
      ],
      object: {
        uuid: "root",
        type: "Scene",
        children: [],
      },
    };
  };

  test("Benchmark: JSON.stringify with Array.from vs Buffer Extraction", () => {
    const numVertices = 100000; // 100k vertices -> 300k floats -> ~1.2MB binary
    const sceneData = generateSceneData(numVertices);

    console.log(`Benchmarking with ${numVertices} vertices...`);

    // --- Current Method: Array.from ---
    const startCurrent = performance.now();
    const jsonCurrent = JSON.stringify(sceneData, (key, value) => {
      if (
        value &&
        value.buffer instanceof ArrayBuffer &&
        value.byteLength !== undefined
      ) {
        return Array.from(value);
      }
      return value;
    });
    const endCurrent = performance.now();
    const timeCurrent = endCurrent - startCurrent;
    console.log(`Current Method Time: ${timeCurrent.toFixed(2)}ms`);
    console.log(
      `Current JSON Length: ${(jsonCurrent.length / 1024 / 1024).toFixed(2)} MB`,
    );

    // --- Optimized Method: Buffer Extraction ---
    const startOptimized = performance.now();

    const buffers = [];
    const jsonOptimized = JSON.stringify(sceneData, (key, value) => {
      if (
        value &&
        value.buffer instanceof ArrayBuffer &&
        value.byteLength !== undefined
      ) {
        buffers.push(value);
        return {
          __type: "TypedArray",
          id: buffers.length - 1,
          ctor: value.constructor.name,
        };
      }
      return value;
    });

    const endOptimized = performance.now();
    const timeOptimized = endOptimized - startOptimized;

    console.log(`Optimized Method Time: ${timeOptimized.toFixed(2)}ms`);
    console.log(
      `Optimized JSON Length: ${(jsonOptimized.length / 1024 / 1024).toFixed(2)} MB`,
    );
    console.log(`Extracted Buffers: ${buffers.length}`);

    // Validation
    expect(buffers.length).toBeGreaterThan(0);
    expect(jsonOptimized.length).toBeLessThan(jsonCurrent.length);

    // We expect significant improvement (at least 2x faster, often 10x)
    if (timeOptimized > timeCurrent) {
      console.warn("Optimized method was SLOWER. Check implementation.");
    } else {
      const speedup = timeCurrent / timeOptimized;
      console.log(`Speedup: ${speedup.toFixed(2)}x`);
    }
  });
});
