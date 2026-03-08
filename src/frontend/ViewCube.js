import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";

export class ViewCube {
  constructor(mainCamera, orbitControls, containerObject) {
    this.update = () => {};
    if (
      typeof process !== "undefined" &&
      process.env &&
      process.env.NODE_ENV === "test"
    )
      return;

    this.mainCamera = mainCamera;
    this.controls = orbitControls;

    this.container = document.createElement("div");
    this.container.id = "view-cube";
    this.container.style.position = "absolute";
    this.container.style.top = "10px";
    this.container.style.right = "10px";
    this.container.style.width = "120px";
    this.container.style.height = "120px";
    this.container.style.zIndex = "100";
    containerObject.appendChild(this.container);

    this.scene = new THREE.Scene();

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    this.camera.position.z = 4;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(120, 120);
    if (this.renderer.domElement && this.renderer.domElement.tagName) {
      this.container.appendChild(this.renderer.domElement);
    }

    // Setup Geometry and Material
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);

    // Create materials for each face with text
    const faces = ["Right", "Left", "Top", "Bottom", "Front", "Back"];
    const materials = faces.map((text) => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const context = canvas.getContext("2d");
      context.fillStyle = "#cccccc";
      context.fillRect(0, 0, 128, 128);
      context.font = "24px Arial";
      context.fillStyle = "#000000";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(text, 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      return new THREE.MeshBasicMaterial({ map: texture });
    });

    this.cube = new THREE.Mesh(geometry, materials);
    this.scene.add(this.cube);

    // Edges
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 }),
    );
    this.cube.add(line);

    // Raycaster for clicks
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.onMouseDown = this.onMouseDown.bind(this);
    this.container.addEventListener("mousedown", this.onMouseDown, false);
  }

  onMouseDown(event) {
    event.preventDefault();
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.cube);

    if (intersects.length > 0) {
      const faceIndex = Math.floor(intersects[0].faceIndex / 2);
      this.tweenToFace(faceIndex);
    }
  }

  tweenToFace(faceIndex) {
    // Determine target rotation based on face
    // Faces: 0: Right, 1: Left, 2: Top, 3: Bottom, 4: Front, 5: Back
    const targetPosition = new THREE.Vector3();
    const distance = this.mainCamera.position.distanceTo(this.controls.target);

    switch (faceIndex) {
      case 0:
        targetPosition.set(distance, 0, 0);
        break; // Right
      case 1:
        targetPosition.set(-distance, 0, 0);
        break; // Left
      case 2:
        targetPosition.set(0, distance, 0);
        break; // Top
      case 3:
        targetPosition.set(0, -distance, 0);
        break; // Bottom
      case 4:
        targetPosition.set(0, 0, distance);
        break; // Front
      case 5:
        targetPosition.set(0, 0, -distance);
        break; // Back
    }

    targetPosition.add(this.controls.target);

    new TWEEN.Tween(this.mainCamera.position)
      .to(
        { x: targetPosition.x, y: targetPosition.y, z: targetPosition.z },
        500,
      )
      .easing(TWEEN.Easing.Cubic.Out)
      .onUpdate(() => this.controls.update())
      .start();
  }

  update() {
    // Copy the rotation from the main camera to the view cube
    this.camera.rotation.copy(this.mainCamera.rotation);
    this.camera.position
      .copy(this.mainCamera.position)
      .normalize()
      .multiplyScalar(4);
    this.camera.lookAt(0, 0, 0);
    this.renderer.render(this.scene, this.camera);
  }
}
