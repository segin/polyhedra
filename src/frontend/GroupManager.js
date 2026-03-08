import * as THREE from "three";
import log from "./logger.js";
import { Events } from "./constants.js";

export class GroupManager {
  constructor(scene, eventBus) {
    this.scene = scene;
    this.eventBus = eventBus;
  }

  groupObjects(objects) {
    if (objects.length < 2) {
      log.warn("Select at least two objects to group.");
      return null;
    }

    const group = new THREE.Group();
    group.name = "Group";

    const center = new THREE.Vector3();
    for (const object of objects) {
      center.add(object.position);
    }
    center.divideScalar(objects.length);

    group.position.copy(center);

    for (const object of objects) {
      this.scene.remove(object);
      group.add(object);
      object.position.sub(center);
    }

    this.scene.add(group);
    this.eventBus.publish(Events.GROUP_ADDED, group); // Emit event
    return group;
  }

  ungroupObjects(group) {
    if (!group || !(group instanceof THREE.Group)) {
      log.warn("Invalid group provided for ungrouping.");
      return [];
    }

    const ungroupedObjects = [];
    const groupPosition = group.position.clone();

    while (group.children.length > 0) {
      const object = group.children[0];
      group.remove(object);
      this.scene.add(object);
      object.position.add(groupPosition);
      ungroupedObjects.push(object);
    }

    this.scene.remove(group);
    this.eventBus.publish(Events.GROUP_REMOVED, group); // Emit event
    return ungroupedObjects;
  }
}
