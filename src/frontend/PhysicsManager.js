import * as CANNON from "cannon-es";
import log from "./logger.js";

export class PhysicsManager {
  constructor(scene) {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0); // m/s^2
    this.scene = scene;
    this.bodies = [];
    // Map to store body -> index for O(1) removal
    this.bodyToIndexMap = new Map();
    // Map to store mesh -> body for O(1) lookup
    this.meshToBodyMap = new Map();

    // Check if simulation is paused
    this.paused = true;

    // Store initial transforms to allow resetting the simulation
    this.initialStates = new Map();
  }

  addBody(mesh, mass = 1, shapeType = "box") {
    if (!mesh.geometry.parameters) {
      log.warn(
        "Unsupported geometry for physics body. Geometry has no parameters.",
      );
      return null;
    }
    let shape;
    switch (shapeType) {
      case "box": {
        const halfExtents = new CANNON.Vec3(
          (mesh.geometry.parameters.width / 2) * mesh.scale.x,
          (mesh.geometry.parameters.height / 2) * mesh.scale.y,
          (mesh.geometry.parameters.depth / 2) * mesh.scale.z,
        );
        shape = new CANNON.Box(halfExtents);
        break;
      }
      case "sphere": {
        shape = new CANNON.Sphere(
          mesh.geometry.parameters.radius * mesh.scale.x,
        );
        break;
      }
      case "cylinder": {
        shape = new CANNON.Cylinder(
          mesh.geometry.parameters.radiusTop * mesh.scale.x,
          mesh.geometry.parameters.radiusBottom * mesh.scale.x,
          mesh.geometry.parameters.height * mesh.scale.y,
          mesh.geometry.parameters.radialSegments,
        );
        break;
      }
      default: {
        log.warn("Unsupported shape type for physics body:", shapeType);
        return null;
      }
    }

    const body = new CANNON.Body({
      mass: mass,
      position: new CANNON.Vec3(
        mesh.position.x,
        mesh.position.y,
        mesh.position.z,
      ),
      quaternion: new CANNON.Quaternion(
        mesh.quaternion.x,
        mesh.quaternion.y,
        mesh.quaternion.z,
        mesh.quaternion.w,
      ),
      shape: shape,
    });
    this.world.addBody(body);

    // Store body and mesh linkage
    const index = this.bodies.length;
    this.bodies.push({ mesh, body });
    this.bodyToIndexMap.set(body, index);
    this.meshToBodyMap.set(mesh, body);

    this.initialStates.set(body, {
      position: new CANNON.Vec3(
        mesh.position.x,
        mesh.position.y,
        mesh.position.z,
      ),
      quaternion: new CANNON.Quaternion(
        mesh.quaternion.x,
        mesh.quaternion.y,
        mesh.quaternion.z,
        mesh.quaternion.w,
      ),
    });

    return body;
  }

  /**
   * Removes physics body associated with a mesh.
   * @param {THREE.Object3D} mesh
   */
  removeObject(mesh) {
    const body = this.meshToBodyMap.get(mesh);
    if (body) {
      this.removeBody(body);
      this.meshToBodyMap.delete(mesh);
    }
  }

  removeBody(bodyToRemove) {
    this.world.removeBody(bodyToRemove);
    const index = this.bodyToIndexMap.get(bodyToRemove);

    if (index !== undefined) {
      const lastIndex = this.bodies.length - 1;
      const itemToRemove = this.bodies[index];

      // Optimization: Swap-Pop strategy (O(1))
      if (index !== lastIndex) {
        const lastItem = this.bodies[lastIndex];
        // Swap with the last element
        this.bodies[index] = lastItem;
        // Update the index of the swapped element in the map
        this.bodyToIndexMap.set(lastItem.body, index);
      }

      // Remove the last element
      this.bodies.pop();
      this.bodyToIndexMap.delete(bodyToRemove);
      this.initialStates.delete(bodyToRemove);
      if (itemToRemove && itemToRemove.mesh) {
        this.meshToBodyMap.delete(itemToRemove.mesh);
      }
    }
  }

  update(deltaTime) {
    if (this.paused) return;

    // Use a fixed time step of 1/60 seconds, with a maximum of 10 substeps to catch up
    this.world.step(1 / 60, deltaTime, 10);

    const bodies = this.bodies;
    const len = bodies.length;
    for (let i = 0; i < len; i++) {
      const item = bodies[i];
      item.mesh.position.copy(item.body.position);
      item.mesh.quaternion.copy(item.body.quaternion);
    }
  }

  play() {
    this.paused = false;
  }

  pause() {
    this.paused = true;
  }

  reset() {
    this.paused = true;

    // Restore all bodies to their initial positions and velocities
    const bodies = this.bodies;
    const len = bodies.length;
    for (let i = 0; i < len; i++) {
      const item = bodies[i];
      const initial = this.initialStates.get(item.body);
      if (initial) {
        item.body.position.copy(initial.position);
        item.body.quaternion.copy(initial.quaternion);

        // Reset velocities
        item.body.velocity.set(0, 0, 0);
        item.body.angularVelocity.set(0, 0, 0);
        item.body.force.set(0, 0, 0);
        item.body.torque.set(0, 0, 0);

        // Sync mesh instantly
        item.mesh.position.copy(initial.position);
        item.mesh.quaternion.copy(initial.quaternion);
      }
    }
  }
}
