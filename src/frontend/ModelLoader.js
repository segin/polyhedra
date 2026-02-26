import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Events } from "./constants.js";
import log from "./logger.js";

export class ModelLoader {
  constructor(scene, eventBus) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.objLoader = new OBJLoader();
    this.gltfLoader = new GLTFLoader();
  }

  loadModel(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const ext = file.name.split(".").pop().toLowerCase();

      const onLoad = (object) => {
        // Normalize size
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim; // Scale to fit in a 2x2x2 box roughly
        object.scale.setScalar(scale);

        // Sit on floor (y=0)
        object.position.y = (size.y * scale) / 2;

        // Traverse to fix materials and shadows
        object.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Ensure standard material for lighting interactions if needed
            // But respect existing materials if they are good
            if (
              !(child.material instanceof THREE.MeshStandardMaterial) &&
              !(child.material instanceof THREE.MeshPhysicalMaterial)
            ) {
              // Clone incompatible material props to Standard
              const newMat = new THREE.MeshStandardMaterial({
                color: child.material.color || 0xffffff,
                map: child.material.map || null,
              });
              child.material = newMat;
            }
          }
        });

        object.name = file.name;
        this.scene.add(object);
        if (this.eventBus) {
          this.eventBus.publish(Events.OBJECT_ADDED, object);
        }

        URL.revokeObjectURL(url);
        resolve(object);
      };

      const onError = (e) => {
        log.error("Error loading model:", e);
        URL.revokeObjectURL(url);
        reject(e);
      };

      if (ext === "obj") {
        this.objLoader.load(url, onLoad, undefined, onError);
      } else if (ext === "glb" || ext === "gltf") {
        this.gltfLoader.load(
          url,
          (gltf) => onLoad(gltf.scene),
          undefined,
          onError,
        );
      } else {
        URL.revokeObjectURL(url);
        reject(
          new Error("Unsupported file format. Please use .obj, .glb, or .gltf"),
        );
      }
    });
  }
}
