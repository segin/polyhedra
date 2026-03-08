import * as THREE from "three";
import log from "./logger.js";
import { Events } from "./constants.js";

export class LightManager {
  constructor(scene, eventBus) {
    this.scene = scene;
    this.eventBus = eventBus;
    /** @type {THREE.Light[]} */
    this.lights = [];

    // Add a default ambient light
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // Add a default directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    if (directionalLight.position) {
      directionalLight.position.set(1, 1, 1).normalize();
    }
    this.scene.add(directionalLight);
    this.lights.push(directionalLight);
  }

  addLight(type, color, intensity, position, name) {
    let light;
    switch (type) {
      case "PointLight":
        light = new THREE.PointLight(color, intensity);
        break;
      case "DirectionalLight":
        light = new THREE.DirectionalLight(color, intensity);
        break;
      case "AmbientLight":
        light = new THREE.AmbientLight(color, intensity);
        break;
      default:
        log.warn("Unknown light type:", type);
        return null;
    }
    if (position && light.position) {
      light.position.set(position.x, position.y, position.z);
    }
    light.name = name || type;
    this.scene.add(light);
    this.lights.push(light);
    this.eventBus.publish(Events.LIGHT_ADDED, light); // Emit event
    return light;
  }

  removeLight(light) {
    this.scene.remove(light);
    if (light.dispose) {
      light.dispose();
    }
    this.lights = this.lights.filter((l) => l !== light);
    this.eventBus.publish(Events.LIGHT_REMOVED, light); // Emit event
  }

  updateLight(light, properties) {
    for (const prop in properties) {
      if (light[prop] !== undefined) {
        if (prop === "color") {
          light.color.set(properties[prop]);
        } else if (prop === "position" && light.position) {
          light.position.set(
            properties.position.x,
            properties.position.y,
            properties.position.z,
          );
        } else {
          light[prop] = properties[prop];
        }
      }
    }
    this.eventBus.publish(Events.LIGHT_UPDATED, light); // Emit event
  }

  changeLightType(oldLight, newType) {
    const oldPosition = oldLight.position
      ? oldLight.position.clone()
      : new THREE.Vector3();
    const oldColor = oldLight.color.getHex();
    const oldIntensity = oldLight.intensity;
    const oldName = oldLight.name;

    this.removeLight(oldLight);
    const newLight = this.addLight(
      newType,
      oldColor,
      oldIntensity,
      oldPosition,
      oldName,
    );
    return newLight;
  }
}
