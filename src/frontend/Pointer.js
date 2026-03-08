import * as THREE from "three";
import { Events } from "./constants.js";

export class Pointer {
  constructor(camera, scene, renderer, eventBus) {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.eventBus = eventBus; // Inject EventBus
    this.outline = null; // To store the outline mesh
    this.selectedObject = null;
    this.isDragging = false;

    this.renderer.domElement.addEventListener(
      "pointerdown",
      this.onPointerDown.bind(this),
    );
    this.renderer.domElement.addEventListener(
      "pointermove",
      this.onPointerMove.bind(this),
    );
    this.renderer.domElement.addEventListener(
      "pointerup",
      this.onPointerUp.bind(this),
    );

    this.eventBus.subscribe(Events.SELECTION_CHANGE, (object) => {
      this.selectedObject = object;
      if (object) {
        this.addOutline(object);
      } else {
        this.removeOutline();
      }
    });
  }

  onPointerDown(event) {
    if (event.target !== this.renderer.domElement) return;

    this.isDragging = true;
    this.updatePointer(event);

    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if (intersects.length > 0) {
      this.selectedObject = intersects[0].object;
      this.eventBus.publish(Events.SELECTION_CHANGE, this.selectedObject);
    } else {
      this.selectedObject = null;
      this.eventBus.publish(Events.SELECTION_CHANGE, null);
    }
  }

  onPointerMove(event) {
    this.updatePointer(event);
    if (!this.isDragging) return;

    // For now, just log the movement. Actual drag logic will be in main.js with TransformControls.
    // console.log('Dragging object');
  }

  onPointerUp() {
    this.isDragging = false;
  }

  updatePointer(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  addOutline(object) {
    this.removeOutline(); // Remove any existing outline

    const geometry = new THREE.EdgesGeometry(object.geometry);
    const material = new THREE.LineBasicMaterial({
      color: 0xffff00,
      linewidth: 2,
    });
    this.outline = new THREE.LineSegments(geometry, material);
    this.outline.renderOrder = 1; // Render outline on top
    object.add(this.outline);
  }

  removeOutline() {
    if (this.outline) {
      if (this.outline.parent) {
        this.outline.parent.remove(this.outline);
      }
      this.outline.geometry.dispose();
      this.outline.material.dispose();
      this.outline = null;
    }
  }
}
