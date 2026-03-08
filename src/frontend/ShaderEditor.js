// @ts-check
import * as THREE from "three";

/**
 * Editor for creating and modifying shaders.
 */
export class ShaderEditor {
  /**
   * @param {import('dat.gui').GUI} gui
   * @param {THREE.WebGLRenderer} renderer
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   * @param {any} eventBus
   */
  constructor(gui, renderer, scene, camera, eventBus) {
    this.eventBus = eventBus;
    this.gui = gui;
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    /** @type {THREE.ShaderMaterial|null} */
    this.shaderMaterial = null;
    /** @type {THREE.Mesh|null} */
    this.shaderMesh = null;
    this.uniforms = {};
    /** @type {import('dat.gui').GUI|null} */
    this.editorFolder = null;
    /** @type {import('dat.gui').GUI|null} */
    this.uniformsFolder = null;

    this.initGUI();
  }

  initGUI() {
    this.editorFolder = this.gui.addFolder("Shader Editor");
    this.editorFolder
      .add(
        {
          createShader: () => this.createShader(),
        },
        "createShader",
      )
      .name("Create New Shader");
    this.editorFolder.open();
  }

  createShader() {
    if (this.shaderMaterial) {
      this.shaderMaterial.dispose();
    }
    if (this.shaderMesh) {
      this.scene.remove(this.shaderMesh);
      if (this.shaderMesh.geometry) this.shaderMesh.geometry.dispose();
    }

    if (this.uniformsFolder && this.editorFolder) {
      try {
        this.editorFolder.removeFolder(this.uniformsFolder);
      } catch (e) {
        // ignore
      }
      this.uniformsFolder = null;
    }

    const vertexShader = `
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

    const fragmentShader = `
            void main() {
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            }
        `;

    this.uniforms = {};

    this.shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: this.uniforms,
    });

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      this.shaderMaterial,
    );
    mesh.name = "ShaderMesh";
    this.shaderMesh = mesh;
    this.scene.add(mesh);

    if (this.eventBus) {
      this.eventBus.publish("objectAdded", mesh);
    }

    this.addShaderControls();

    return mesh;
  }

  addShaderControls() {
    if (!this.editorFolder || !this.shaderMaterial) return;

    if (this.uniformsFolder) {
      try {
        this.editorFolder.removeFolder(this.uniformsFolder);
      } catch (e) {
        // ignore
      }
    }
    this.uniformsFolder = this.editorFolder.addFolder("Uniforms");

    // Example: Add a color uniform
    this.uniforms.myColor = { value: new THREE.Color(0xff0000) };
    this.uniformsFolder
      .addColor(this.uniforms.myColor, "value")
      .name("Color")
      .onChange(() => {
        // @ts-ignore
        if (this.shaderMaterial) this.shaderMaterial.needsUpdate = true;
      });

    // Example: Add a float uniform
    this.uniforms.myFloat = { value: 0.5 };
    this.uniformsFolder
      .add(this.uniforms.myFloat, "value", 0, 1)
      .name("Float")
      .onChange(() => {
        // @ts-ignore
        if (this.shaderMaterial) this.shaderMaterial.needsUpdate = true;
      });

    this.uniformsFolder.open();
  }
}
