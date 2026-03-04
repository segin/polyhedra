import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
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

  get dampingEnabled() {
    return this.controls.enableDamping;
  }
  set dampingEnabled(value) {
    this.controls.enableDamping = value;
  }

  get dampingFactor() {
    return this.controls.dampingFactor;
  }
  set dampingFactor(value) {
    this.controls.dampingFactor = value;
  }

  focusOnObject(object) {
    if (!object) return;
    
    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) return;
    
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Calculate distance
    const fov = this.camera.fov * (Math.PI / 180);
    // Fit to 80% of screen using trigonometry, fallback to a small distance if point-size
    let cameraZ = maxDim === 0 ? 5 : Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;
    
    // Clamp
    cameraZ = Math.max(cameraZ, this.controls.minDistance);
    cameraZ = Math.min(cameraZ, this.controls.maxDistance);
    
    const direction = this.camera.position.clone().sub(this.controls.target).normalize();
    if (direction.lengthSq() < 0.001) {
      direction.set(0, 0, 1);
    }
    const targetPosition = center.clone().add(direction.multiplyScalar(cameraZ));

    // Tween target
    new TWEEN.Tween(this.controls.target)
      .to({ x: center.x, y: center.y, z: center.z }, 500)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();

    // Tween camera
    new TWEEN.Tween(this.camera.position)
      .to({ x: targetPosition.x, y: targetPosition.y, z: targetPosition.z }, 500)
      .easing(TWEEN.Easing.Cubic.Out)
      .onUpdate(() => this.controls.update())
      .start();
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
