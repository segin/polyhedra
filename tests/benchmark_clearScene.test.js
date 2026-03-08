const THREE = jest.requireActual("three");
const { Scene, Mesh, BoxGeometry, MeshBasicMaterial } = THREE;

describe("Scene Clearing Performance Benchmark", () => {
  // Use a large number of objects to make the difference obvious
  const OBJECT_COUNT = 20000;

  function createScene() {
    const scene = new Scene();
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial();
    for (let i = 0; i < OBJECT_COUNT; i++) {
      const mesh = new Mesh(geometry, material);
      scene.add(mesh);
    }
    return scene;
  }

  test("Benchmark: Clear scene using remove(children[0]) (Current Implementation)", () => {
    const scene = createScene();
    const start = performance.now();

    while (scene.children.length > 0) {
      const object = scene.children[0];
      scene.remove(object);
      // Simulate disposal logic (minimal overhead compared to remove)
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
    }

    const end = performance.now();
    console.log(
      `[Benchmark] Clear ${OBJECT_COUNT} objects using remove(children[0]): ${(end - start).toFixed(2)}ms`,
    );
  });

  test("Benchmark: Clear scene using pop() (Optimized Implementation)", () => {
    const scene = createScene();
    const start = performance.now();

    while (scene.children.length > 0) {
      const object = scene.children.pop();

      // Mimic Object3D.remove logic manually to avoid indexOf/splice overhead
      object.parent = null;
      object.dispatchEvent({ type: "removed" });
      scene.dispatchEvent({ type: "childremoved", child: object });

      // Simulate disposal logic
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
    }

    const end = performance.now();
    console.log(
      `[Benchmark] Clear ${OBJECT_COUNT} objects using pop(): ${(end - start).toFixed(2)}ms`,
    );
  });
});
