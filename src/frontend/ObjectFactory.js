import { Events } from "./constants.js";

export class ObjectFactory {
  constructor(scene, primitiveFactory, eventBus) {
    this.scene = scene;
    this.primitiveFactory = primitiveFactory;
    this.eventBus = eventBus;
  }

  async addPrimitive(type, options = {}) {
    const meshResult = this.primitiveFactory.createPrimitive(type, options);

    let mesh;
    if (meshResult instanceof Promise) {
      mesh = await meshResult;
    } else {
      mesh = meshResult;
    }

    if (mesh) {
      this.scene.add(mesh);
      this.eventBus.publish(Events.OBJECT_ADDED, mesh);
    }
    return mesh;
  }

  duplicateObject(object) {
    if (!object) return null;

    // Clone the object
    const newObject = object.clone();

    // If the object has a geometry, clone it
    if (object.geometry) {
      newObject.geometry = object.geometry.clone();
    }

    // If the object has a material, clone it
    if (object.material) {
      if (Array.isArray(object.material)) {
        newObject.material = object.material.map((material) =>
          material.clone(),
        );
      } else {
        newObject.material = object.material.clone();
      }
    }

    // Set a new name for the duplicated object
    newObject.name = object.name
      ? `${object.name}_copy`
      : `${object.uuid}_copy`;

    // Add a small offset to the position to avoid z-fighting
    newObject.position.addScalar(0.5);

    // Add the new object to the scene
    this.scene.add(newObject);

    return newObject;
  }
}
