import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import { Logger } from './utils/Logger.js';

export class SceneManager {
  constructor(renderer, camera, inputManager, scene) {
    this.renderer = renderer;
    this.camera = camera;
    this.inputManager = inputManager;
    // If scene is provided, use it; otherwise creating one might conflict if main.js also creates one.
    // Assuming we should accept it as per standard DI pattern for shared resources.
    this.scene = scene;
    this.canvas = renderer.domElement;

    if (!this.scene) {
      // Fallback if not provided, though usually should be injected
      Logger.warn('Scene not injected into SceneManager, creating new one.');
      this.scene = new THREE.Scene();
    }

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.screenSpacePanning = true;
    this.controls.enableZoom = true;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 500;
    this.controls.maxPolarAngle = Math.PI / 2;

    this.initialCameraPosition = this.camera.position.clone();
    this.initialControlsTarget = this.controls.target.clone();

    const gridHelper = new THREE.GridHelper(10, 10);
    this.scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // Removing global listener if InputManager handles it,
    // or keeping it if it's specific to scene resizing.
    // Spec doesn't mention removing it.
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    this.onWindowResize();
  }

  resetCamera() {
    this.camera.position.copy(this.initialCameraPosition);
    this.controls.target.copy(this.initialControlsTarget);
    this.controls.update();
  }

  onWindowResize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.controls.update();
  }
}
