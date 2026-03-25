// @ts-check
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Engine {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {any} physicsManager
     * @param {any} transformControls
     * @param {any} animationManager
     */
    constructor(canvas, physicsManager, transformControls, animationManager) {
        this.canvas = canvas;
        this.physicsManager = physicsManager;
        this.transformControls = transformControls;
        this.animationManager = animationManager;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, powerPreference: "high-performance" });
        this.camera = new THREE.PerspectiveCamera(75, 2, 0.1, 5);
        this.camera.position.z = 2;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // an animation loop is required when damping is enabled
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

        this.clock = new THREE.Clock();

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        this.onWindowResize();

        this.animate = this.animate.bind(this);
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
    }

    animate() {
        const deltaTime = this.clock.getDelta();
        if (this.physicsManager) this.physicsManager.update(deltaTime);
        if (this.animationManager) this.animationManager.update(deltaTime, this.scene);
        if (this.transformControls) this.transformControls.update();
        if (this.controls) this.controls.update();
        this.render();
        requestAnimationFrame(this.animate);
    }

    start() {
        this.animate();
    }
}
