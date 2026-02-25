// @ts-check
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GUI } from 'dat.gui';
import { SceneStorage } from './SceneStorage.js';
import { ServiceContainer } from './utils/ServiceContainer.js';
import { StateManager } from './StateManager.js';
import EventBus from './EventBus.js';
import { ObjectManager } from './ObjectManager.js';
import { SceneManager } from './SceneManager.js';
import { InputManager } from './InputManager.js';
import { PhysicsManager } from './PhysicsManager.js';
import { PrimitiveFactory } from './PrimitiveFactory.js';
import { ObjectFactory } from './ObjectFactory.js';
import { ObjectPropertyUpdater } from './ObjectPropertyUpdater.js';
import log from './logger.js';
import { ToastManager } from './ToastManager.js';
import { LightManager } from './LightManager.js';
import { ModelLoader } from './ModelLoader.js';

/**
 * Simple 3D modeling application with basic primitives and transform controls
 */
export class App {
  constructor() {
    // Initialize Core Utilities
    this.toastManager = new ToastManager();
    this.container = new ServiceContainer();
    this.clock = new THREE.Clock();

    // Register Core Services
    this.container.register('EventBus', EventBus);
    
    this.stateManager = new StateManager();
    this.container.register('StateManager', this.stateManager);

    // Initialize Three.js Core
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    // Register Three.js Core objects
    this.container.register('Scene', this.scene);
    this.container.register('Camera', this.camera);
    this.container.register('Renderer', this.renderer);

    // Initialize Managers
    this.primitiveFactory = new PrimitiveFactory();
    this.container.register('PrimitiveFactory', this.primitiveFactory);

    this.objectFactory = new ObjectFactory(this.scene, this.primitiveFactory, EventBus);
    this.container.register('ObjectFactory', this.objectFactory);

    this.objectPropertyUpdater = new ObjectPropertyUpdater(this.primitiveFactory);
    this.container.register('ObjectPropertyUpdater', this.objectPropertyUpdater);

    this.initRenderer();

    this.inputManager = new InputManager(EventBus, this.renderer.domElement);
    this.container.register('InputManager', this.inputManager);

    this.physicsManager = new PhysicsManager(this.scene);
    this.container.register('PhysicsManager', this.physicsManager);

    this.sceneManager = new SceneManager(this.renderer, this.camera, this.inputManager, this.scene);
    this.container.register('SceneManager', this.sceneManager);

    this.objectManager = new ObjectManager(
      this.scene,
      EventBus,
      this.physicsManager,
      this.primitiveFactory,
      this.objectFactory,
      this.objectPropertyUpdater,
      this.stateManager,
    );
    this.container.register('ObjectManager', this.objectManager);

    // App State
    this.selectedObject = null;
    this.objects = [];
    this.sceneGraphItemMap = new Map();

    // History system for undo/redo
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = 50;

    this.primitiveCounter = 0;
    
    // Continue initialization
    this.setupControls();
    this.setupSceneGraph();
    this.setupGUI();
    this.setupLighting();
    this.setupHelpers();
    this.setupMobileOptimizations();

    // Initialize scene storage
    this.sceneStorage = new SceneStorage(this.scene, EventBus);

    // Bind animation loop
    this.animate = this.animate.bind(this);
    this.animate();

    // Subscribe to selection changes
    if (this.stateManager) {
      this.stateManager.subscribe('selection', (selection) => {
        if (selection && selection.length > 0) {
          this.selectedObject = selection[0];
          this.transformControls.attach(this.selectedObject);
          this.updatePropertiesPanel(this.selectedObject);
        } else {
          this.selectedObject = null;
          this.transformControls.detach();
          this.clearPropertiesPanel();
        }
        this.updateSceneGraph();
      });
    }

    // Save initial state
    this.saveState('Initial State');
  }

  /**
   * Helper to apply state data to a mesh
   * @param {THREE.Mesh|THREE.Object3D} mesh
   * @param {Object} data
   */
  _applyStateToMesh(mesh, data) {
    if (!mesh) return;
    mesh.uuid = data.uuid;
    mesh.name = data.name;
    if (data.visible !== undefined) mesh.visible = data.visible;
    mesh.position.copy(data.position);
    mesh.rotation.copy(data.rotation);
    mesh.scale.copy(data.scale);
    // @ts-ignore
    if (mesh.material && data.material) {
        // @ts-ignore
        if (mesh.material.color && data.material.color) mesh.material.color.copy(data.material.color);
        // @ts-ignore
        if (mesh.material.emissive && data.material.emissive) mesh.material.emissive.copy(data.material.emissive);
    }
  }

  /**
   * Helper to check if a saved state object matches the current object state.
   * This allows for structural sharing in the history stack.
   * @param {Object} stateObj - The object state from history
   * @param {THREE.Object3D} currentObj - The live Three.js object
   * @returns {boolean}
   */
  _areObjectsEqual(stateObj, currentObj) {
    if (!stateObj || !currentObj) return false;
    if (stateObj.uuid !== currentObj.uuid) return false;
    if (stateObj.name !== currentObj.name) return false;
    if (stateObj.visible !== currentObj.visible) return false;

    // Type check (using primitiveType if available)
    const currentType = currentObj.userData && currentObj.userData.primitiveType
        ? currentObj.userData.primitiveType
        : (currentObj.geometry ? currentObj.geometry.type : currentObj.type);

    if (stateObj.type !== currentType) return false;

    // Transform comparison
    if (!stateObj.position.equals(currentObj.position)) return false;
    if (!stateObj.rotation.equals(currentObj.rotation)) return false;
    if (!stateObj.scale.equals(currentObj.scale)) return false;

    // Material comparison
    // @ts-ignore
    if (stateObj.material && currentObj.material) {
      // @ts-ignore
      if (!stateObj.material.color.equals(currentObj.material.color)) return false;
      // @ts-ignore
      if (stateObj.material.emissive && currentObj.material.emissive) {
         // @ts-ignore
         if (!stateObj.material.emissive.equals(currentObj.material.emissive)) return false;
      }
    } else if (!!stateObj.material !== !!currentObj.material) {
      return false;
    }

    // Geometry params comparison
    const currentParams = (currentObj.userData && currentObj.userData.primitiveOptions) ? currentObj.userData.primitiveOptions : (currentObj.userData ? currentObj.userData.geometryParams : null);
    if (JSON.stringify(stateObj.geometryParams) !== JSON.stringify(currentParams)) return false;

    return true;
  }

  initRemaining() {
    // Satisfy tests that expect this method to exist
    // Setup scene graph UI
    this.setupSceneGraph();

    // Setup toolbar
    this.setupToolbar();

    // Initialize scene storage
    this.sceneStorage = new SceneStorage(this.scene, null); // EventBus not needed for basic save/load

    // Initialize Model Loader
    this.modelLoader = new ModelLoader(this.scene, EventBus);
    this.container.register('ModelLoader', this.modelLoader);

    // Mobile touch optimizations
    this.setupMobileOptimizations();
  }

  // Add this method to handle model import
  async importModel(file) {
      try {
          const object = await this.modelLoader.loadModel(file);
          this.objects.push(object);
          this.selectObject(object);
          this.updateSceneGraph();
          this.saveState('Import Model');
          this.toastManager.show(`Imported ${file.name}`, 'success');
      } catch (error) {
          console.error('Import failed:', error);
          this.toastManager.show('Import failed: ' + error.message, 'error');
      }
  }

  initRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (!this.renderer.domElement.parentElement) {
        document.body.appendChild(this.renderer.domElement);
    }

    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  setupLighting() {
    this.lighting = new LightManager(this.scene, EventBus);
  }

  setupHelpers() {
    this.gridHelper = new THREE.GridHelper(10, 10);
    this.scene.add(this.gridHelper);
    this.axesHelper = new THREE.AxesHelper(5);
    this.scene.add(this.axesHelper);
  }

  setupSceneGraph() {
    this.sceneGraphPanel = document.getElementById('scene-graph-panel');
    if (!this.sceneGraphPanel) {
      this.sceneGraphPanel = document.createElement('div');
      this.sceneGraphPanel.id = 'scene-graph-panel';
      document.body.appendChild(this.sceneGraphPanel);
    }
    
    this.sceneGraphPanel.style.cssText = `
      position: fixed;
      top: 70px;
      left: 10px;
      width: 250px;
      max-height: 400px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      overflow-y: auto;
      z-index: 1000;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Scene Graph';
    title.style.margin = '0 0 10px 0';

    this.objectsList = document.getElementById('objects-list');
    if (!this.objectsList) {
      this.objectsList = document.createElement('ul');
      this.objectsList.id = 'objects-list';
    }
    this.objectsList.style.cssText = `
      list-style: none;
      margin: 0;
      padding: 0;
    `;

    if (!title.parentElement) this.sceneGraphPanel.appendChild(title);
    if (!this.objectsList.parentElement) this.sceneGraphPanel.appendChild(this.objectsList);
    if (!this.sceneGraphPanel.parentElement) document.body.appendChild(this.sceneGraphPanel);
    
    this.updateSceneGraph();
  }

  setupToolbar() {
    const tools = [
      {
        id: 'translate-btn',
        icon: '✥',
        title: 'Translate (G)',
        action: () => this.transformControls.setMode('translate'),
      },
      {
        id: 'rotate-btn',
        icon: '↻',
        title: 'Rotate (R)',
        action: () => this.transformControls.setMode('rotate'),
      },
      {
        id: 'scale-btn',
        icon: '⤢',
        title: 'Scale (S)',
        action: () => this.transformControls.setMode('scale'),
      },
      {
        id: 'undo-btn',
        icon: '↶',
        title: 'Undo (Ctrl+Z)',
        action: () => this.undo(),
      },
      {
        id: 'redo-btn',
        icon: '↷',
        title: 'Redo (Ctrl+Y)',
        action: () => this.redo(),
      },
      {
        id: 'delete-btn',
        icon: '🗑',
        title: 'Delete (Del)',
        action: () => this.deleteSelectedObject(),
      },
    ];

    const container = document.getElementById('ui');
    if (!container) return;

    tools.forEach((tool) => {
      const btn = document.createElement('button');
      btn.id = tool.id;
      btn.textContent = tool.icon;
      btn.title = tool.title;
      btn.setAttribute('aria-label', tool.title);
      btn.onclick = () => {
        tool.action();
        if (['translate', 'rotate', 'scale'].includes(tool.id.split('-')[0])) {
          container.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
        }
      };
      container.appendChild(btn);
    });
  }

  setupControls() {
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;

    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.addEventListener('change', () => {
      this.renderer.render(this.scene, this.camera);
    });
    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.orbitControls.enabled = !event.value;
      if (!event.value && this.selectedObject) {
        this.saveState('Transform object');
      }
    });
    this.scene.add(this.transformControls);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.renderer.domElement.addEventListener('click', (event) => {
      if (this.transformControls.dragging) return;

      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.objects);

      if (intersects.length > 0) {
        this.selectObject(intersects[0].object);
      } else {
        this.deselectObject();
      }
    });

    window.addEventListener('keydown', (event) => {
      if (event.target instanceof HTMLInputElement) return;

      switch (event.key.toLowerCase()) {
        case 'g': this.transformControls.setMode('translate'); break;
        case 'r': this.transformControls.setMode('rotate'); break;
        case 's': this.transformControls.setMode('scale'); break;
        case 'delete':
        case 'backspace':
          if (this.selectedObject) this.deleteObject(this.selectedObject);
          break;
        case 'z':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (event.shiftKey) this.redo();
            else this.undo();
          }
          break;
      }
    });

    const fullscreenButton = document.getElementById('fullscreen');
    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', () => this.toggleFullscreen());
    }

    const saveButton = document.getElementById('save-scene');
    if (saveButton) {
      saveButton.addEventListener('click', async () => {
        const originalText = saveButton.textContent;
        saveButton.textContent = 'Saving...';
        // @ts-ignore
        saveButton.disabled = true;
        saveButton.style.cursor = 'wait';

        try {
          await this.saveScene();
        } finally {
          saveButton.textContent = originalText;
          // @ts-ignore
          saveButton.disabled = false;
          saveButton.style.cursor = '';
        }
      });
    }
    
    const loadButton = document.getElementById('load-scene');
    const loadInput = document.getElementById('file-input');

    if (loadInput) {
      if (loadButton) {
          loadButton.addEventListener('click', () => {
              loadInput.click();
          });
      }

      loadInput.addEventListener('change', async (e) => {
        // @ts-ignore
        const file = e.target.files[0];
        if (file) {
            if (loadButton) {
                const originalText = loadButton.textContent;
                loadButton.textContent = 'Loading...';
                // @ts-ignore
                loadButton.disabled = true;
                loadButton.style.cursor = 'wait';
                try {
                  await this.loadScene(file);
                } finally {
                  loadButton.textContent = originalText;
                  // @ts-ignore
                  loadButton.disabled = false;
                  loadButton.style.cursor = '';
                }
            } else {
                await this.loadScene(file);
            }
        }
        // Reset input value so same file can be loaded again if needed
        // @ts-ignore
        e.target.value = '';
      });
    }
  }

  setupGUI() {
    this.gui = new GUI();

    const primitiveFolder = this.gui.addFolder('Add Primitives');
    primitiveFolder.add(this, 'addBox').name('Add Box');
    primitiveFolder.add(this, 'addSphere').name('Add Sphere');
    primitiveFolder.add(this, 'addCylinder').name('Add Cylinder');
    primitiveFolder.add(this, 'addCone').name('Add Cone');
    primitiveFolder.add(this, 'addTorus').name('Add Torus');
    primitiveFolder.add(this, 'addTorusKnot').name('Add Torus Knot');
    primitiveFolder.add(this, 'addTetrahedron').name('Add Tetrahedron');
    primitiveFolder.add(this, 'addIcosahedron').name('Add Icosahedron');
    primitiveFolder.add(this, 'addDodecahedron').name('Add Dodecahedron');
    primitiveFolder.add(this, 'addOctahedron').name('Add Octahedron');
    primitiveFolder.add(this, 'addPlane').name('Add Plane');
    primitiveFolder.add(this, 'addTube').name('Add Tube');
    primitiveFolder.add(this, 'addTeapot').name('Add Teapot');
    primitiveFolder.open();

    const transformFolder = this.gui.addFolder('Transform');
    const transformModes = { mode: 'translate' };
    transformFolder
      .add(transformModes, 'mode', ['translate', 'rotate', 'scale'])
      .onChange((value) => this.transformControls.setMode(value));
    transformFolder.open();

    const objectFolder = this.gui.addFolder('Object');
    objectFolder.add(this, 'deleteSelectedObject').name('Delete Selected');
    objectFolder.add(this, 'duplicateSelectedObject').name('Duplicate Selected');
    
    // Add Import Model button
    const fileFolder = this.gui.addFolder('File');
    const fileParams = {
        importModel: () => {
             const input = document.createElement('input');
             input.type = 'file';
             input.accept = '.obj,.glb,.gltf';
             input.onchange = (e) => {
                 // @ts-ignore
                 if (e.target.files && e.target.files[0]) {
                     // @ts-ignore
                     this.importModel(e.target.files[0]);
                 }
             };
             input.click();
        }
    };
    fileFolder.add(fileParams, 'importModel').name('Import Model (OBJ/GLTF)');
    fileFolder.open();

    objectFolder.open();

    const historyFolder = this.gui.addFolder('History');
    historyFolder.add(this, 'undo').name('Undo');
    historyFolder.add(this, 'redo').name('Redo');
    historyFolder.open();

    this.propertiesFolder = this.gui.addFolder('Properties');
    this.propertiesFolder.open();
  }

  setupMobileOptimizations() {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
      this.orbitControls.enableKeys = false;
      this.orbitControls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };
      document.body.classList.add('mobile-optimized');
    }
  }

  selectObject(object) {
    this.objectManager.selectObject(object);
  }

  deselectObject() {
    this.objectManager.deselectObject();
  }

  deleteObject(object) {
    if (object) {
      this.objectManager.deleteObject(object);
      const index = this.objects.indexOf(object);
      if (index > -1) this.objects.splice(index, 1);
      this.saveState('Delete object');
    }
  }

  deleteSelectedObject() {
    if (this.selectedObject) this.deleteObject(this.selectedObject);
  }

  duplicateSelectedObject() {
    if (this.selectedObject) {
      const mesh = this.objectManager.duplicateObject(this.selectedObject);
      if (mesh) {
        mesh.position.x += 1;
        this.scene.add(mesh);
        this.objects.push(mesh);
        this.selectObject(mesh);
        this.saveState('Duplicate object');
      }
    }
  }

  async addBox() { return await this.addPrimitive('Box'); }
  async addSphere() { return await this.addPrimitive('Sphere'); }
  async addCylinder() { return await this.addPrimitive('Cylinder'); }
  async addCone() { return await this.addPrimitive('Cone'); }
  async addTorus() { return await this.addPrimitive('Torus'); }
  async addTorusKnot() { return await this.addPrimitive('TorusKnot'); }
  async addTetrahedron() { return await this.addPrimitive('Tetrahedron'); }
  async addIcosahedron() { return await this.addPrimitive('Icosahedron'); }
  async addDodecahedron() { return await this.addPrimitive('Dodecahedron'); }
  async addOctahedron() { return await this.addPrimitive('Octahedron'); }
  async addPlane() { return await this.addPrimitive('Plane'); }
  async addTube() { return await this.addPrimitive('Tube'); }
  async addTeapot() { return await this.addPrimitive('Teapot'); }
  async addLathe() { return await this.addPrimitive('Lathe'); }
  async addExtrude() { return await this.addPrimitive('Extrude'); }
  async addText(text, options) { return await this.addPrimitive('Text', { text, ...options }); }

  async addPrimitive(type, options) {
    const meshOrPromise = this.objectManager.addPrimitive(type, options);
    
    const setup = (mesh) => {
      if (mesh) {
        this.primitiveCounter++;
        mesh.name = `${type}_${this.primitiveCounter}`;
        // scene.add is already called by ObjectFactory
        this.objects.push(mesh);
        this.selectObject(mesh);
        this.updateSceneGraph();
        this.saveState(`Add ${type}`);
      }
      return mesh;
    };

    if (meshOrPromise instanceof Promise) {
      return meshOrPromise.then(setup);
    } else {
      return setup(meshOrPromise);
    }
  }

  updatePropertiesPanel(object) {
    this.clearPropertiesPanel();
    if (!object) return;

    this.propertiesFolder.add(object, 'name').name('Name');
    
    const pos = this.propertiesFolder.addFolder('Position');
    pos.add(object.position, 'x', -10, 10).name('X');
    pos.add(object.position, 'y', -10, 10).name('Y');
    pos.add(object.position, 'z', -10, 10).name('Z');
    
    const rot = this.propertiesFolder.addFolder('Rotation');
    rot.add(object.rotation, 'x', -Math.PI, Math.PI).name('X');
    rot.add(object.rotation, 'y', -Math.PI, Math.PI).name('Y');
    rot.add(object.rotation, 'z', -Math.PI, Math.PI).name('Z');

    const sca = this.propertiesFolder.addFolder('Scale');
    sca.add(object.scale, 'x', 0.1, 5).name('X');
    sca.add(object.scale, 'y', 0.1, 5).name('Y');
    sca.add(object.scale, 'z', 0.1, 5).name('Z');

    // @ts-ignore
    if (object.material) {
      const mat = this.propertiesFolder.addFolder('Material');
      const materialData = {
        // @ts-ignore
        color: '#' + object.material.color.getHexString()
      };
      mat.addColor(materialData, 'color').name('Color').onChange((val) => {
        // @ts-ignore
        object.material.color.set(val);
      });
    }
  }

  clearPropertiesPanel() {
    const controllers = [...this.propertiesFolder.__controllers];
    controllers.forEach(c => this.propertiesFolder.remove(c));
    if (this.propertiesFolder.__folders) {
      Object.values(this.propertiesFolder.__folders).forEach(f => this.propertiesFolder.removeFolder(f));
    }
  }

  updateSceneGraph() {
    if (!this.objectsList) return;

    // Handle Empty List Case
    if (this.objects.length === 0) {
      this.objectsList.innerHTML = '';
      const li = document.createElement('li');
      li.setAttribute('role', 'listitem');
      li.textContent = 'No objects in scene';
      li.style.color = '#888';
      li.style.fontStyle = 'italic';
      li.style.textAlign = 'center';
      li.style.padding = '10px';
      this.objectsList.appendChild(li);
      this.sceneGraphItemMap.clear();
      return;
    }

    // Clear "No objects" if present
    if (
      this.objectsList.children.length > 0 &&
      this.objectsList.children[0].textContent === 'No objects in scene'
    ) {
      this.objectsList.innerHTML = '';
    }

    let currentDom = this.objectsList.firstElementChild;

    this.objects.forEach((obj, idx) => {
      let li = this.sceneGraphItemMap.get(obj.uuid);

      // Check if stale (bound to old object instance)
      // @ts-ignore
      if (li && li._boundObject !== obj) {
        li.remove();
        if (li === currentDom) {
          currentDom = currentDom.nextElementSibling;
        }
        this.sceneGraphItemMap.delete(obj.uuid);
        li = undefined;
      }

      if (!li) {
        li = this.createSceneGraphItem(obj);
        this.sceneGraphItemMap.set(obj.uuid, li);
      }

      this.updateSceneGraphItem(li, obj, idx);

      // Placement
      if (currentDom === li) {
        currentDom = currentDom.nextElementSibling;
      } else {
        this.objectsList.insertBefore(li, currentDom);
      }
    });

    // Remove remaining (stale) nodes
    while (currentDom) {
      const next = currentDom.nextElementSibling;
      currentDom.remove();
      currentDom = next;
    }

    // Cleanup Map
    if (this.sceneGraphItemMap.size > this.objects.length) {
      const activeUuids = new Set(this.objects.map((o) => o.uuid));
      for (const uuid of this.sceneGraphItemMap.keys()) {
        if (!activeUuids.has(uuid)) {
          this.sceneGraphItemMap.delete(uuid);
        }
      }
    }
  }

  createSceneGraphItem(obj) {
    const li = document.createElement('li');
    li.setAttribute('role', 'listitem');
    li.style.cssText = `
      padding: 5px;
      margin: 2px 0;
      border-radius: 3px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
    `;
    // @ts-ignore
    li._boundObject = obj;

    const name = document.createElement('span');
    name.className = 'object-name';
    li.appendChild(name);
    // @ts-ignore
    li._nameSpan = name;

    const controls = document.createElement('div');

    const visibilityBtn = document.createElement('button');
    visibilityBtn.className = 'visibility-btn';
    visibilityBtn.onclick = (e) => {
      e.stopPropagation();
      obj.visible = !obj.visible;
      this.updateSceneGraph();
    };
    controls.appendChild(visibilityBtn);
    // @ts-ignore
    li._visibilityBtn = visibilityBtn;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.setAttribute('aria-label', 'Delete object');
    deleteBtn.textContent = '🗑️';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      this.deleteObject(obj);
    };
    controls.appendChild(deleteBtn);

    li.appendChild(controls);

    li.onclick = () => this.selectObject(obj);

    return li;
  }

  updateSceneGraphItem(li, obj, idx) {
    // Update Selection Style
    const isSelected = this.selectedObject === obj;
    const expectedBg = isSelected ? '#444' : '#222';
    if (li.style.background !== expectedBg) { // Only update if changed (prevents style recalc if same)
        // Note: style.background returns empty string if not set, or computed value.
        // But setting it works.
        // Ideally checking specific property `backgroundColor` is better but `background` shorthand is used.
        // Let's just set it if we suspect change, or cache it?
        // Checking style string might be flaky.
        // But let's trust simple check.
        // Actually, let's just set it. Setting same value is cheap in JS, browser handles DOM.
        li.style.background = expectedBg;
    }

    // Update Name
    // @ts-ignore
    const nameSpan = li._nameSpan;
    const expectedName = obj.name || `Object ${idx + 1}`;
    if (nameSpan.textContent !== expectedName) {
      nameSpan.textContent = expectedName;
    }

    // Update Visibility Button
    // @ts-ignore
    const visibilityBtn = li._visibilityBtn;
    const expectedVisLabel = obj.visible ? 'Hide object' : 'Show object';
    const expectedVisIcon = obj.visible ? '👁️' : '🚫';

    if (visibilityBtn.getAttribute('aria-label') !== expectedVisLabel) {
        visibilityBtn.setAttribute('aria-label', expectedVisLabel);
    }
    if (visibilityBtn.textContent !== expectedVisIcon) {
        visibilityBtn.textContent = expectedVisIcon;
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  async saveScene() {
    try {
      await this.sceneStorage.saveScene();
      this.toastManager.show('Scene saved', 'success');
    } catch (e) {
      console.error('Save failed', e);
      this.toastManager.show('Save failed', 'error');
    }
  }

  async loadScene(file) {
    try {
      const loadedScene = await this.sceneStorage.loadScene(file);
      this.objects.forEach(obj => this.scene.remove(obj));
      this.objects = [];
      
      loadedScene.traverse(child => {
        // @ts-ignore
        if (child.isMesh) {
          this.objects.push(child);
          this.scene.add(child);
        }
      });
      
      this.updateSceneGraph();
      this.saveState('Load Scene');
      this.toastManager.show('Scene loaded', 'success');
    } catch (e) {
      console.error('Load failed', e);
      this.toastManager.show('Load failed', 'error');
    }
  }

  saveState(description = 'Action') {
    // Structural sharing implementation
    const lastState = this.history[this.historyIndex];

    // Create map for faster lookup if history grows large, but linear scan for current objects is fine
    // However, objects array order might change? Usually append only.
    // We can map UUID to last state object.
    const lastStateMap = new Map();
    if (lastState && lastState.objects) {
        lastState.objects.forEach(obj => lastStateMap.set(obj.uuid, obj));
    }

    const stateObjects = this.objects.map(obj => {
        const lastObjState = lastStateMap.get(obj.uuid);

        // If object hasn't changed, reuse the state object (Structural Sharing)
        if (lastObjState && this._areObjectsEqual(lastObjState, obj)) {
            return lastObjState;
        }

        // Create new state object
        return {
            uuid: obj.uuid,
            name: obj.name,
            visible: obj.visible !== undefined ? obj.visible : true,
            // Use primitiveType if available (from userData), otherwise fallback to geometry type
            type: (obj.userData && obj.userData.primitiveType) ? obj.userData.primitiveType : (obj.geometry ? obj.geometry.type : obj.type),
            position: obj.position.clone(),
            rotation: obj.rotation.clone(),
            scale: obj.scale.clone(),
            material: obj.material ? {
                // @ts-ignore
                color: obj.material.color ? obj.material.color.clone() : new THREE.Color(0xffffff),
                // @ts-ignore
                emissive: obj.material.emissive ? obj.material.emissive.clone() : new THREE.Color(0x000000)
            } : null,
            // Use primitiveOptions if available, otherwise geometryParams
            geometryParams: (obj.userData && obj.userData.primitiveOptions) ? obj.userData.primitiveOptions : (obj.userData ? obj.userData.geometryParams : null)
        };
    });

    const state = {
      description,
      timestamp: Date.now(),
      objects: stateObjects,
      selectedUuid: this.selectedObject ? this.selectedObject.uuid : null
    };

    if (this.historyIndex < this.history.length - 1) {
      this.history.splice(this.historyIndex + 1);
    }

    this.history.push(state);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  async undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      await this.restoreState(this.history[this.historyIndex]);
    }
  }

  async redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      await this.restoreState(this.history[this.historyIndex]);
    }
  }

  async restoreState(state) {
    const currentObjectsMap = new Map();
    this.objects.forEach(obj => currentObjectsMap.set(obj.uuid, obj));

    // Set of UUIDs that are in the new state
    const newStateUuids = new Set();
    const newObjects = [];
    const promises = [];

    // Update existing objects or create new ones
    for (const data of state.objects) {
        newStateUuids.add(data.uuid);
        const existingObj = currentObjectsMap.get(data.uuid);

        if (existingObj) {
            // Check if geometry needs update (primitiveType or params changed)
            const currentType = existingObj.userData && existingObj.userData.primitiveType
                ? existingObj.userData.primitiveType
                : (existingObj.geometry ? existingObj.geometry.type : existingObj.type);

            const currentParams = (existingObj.userData && existingObj.userData.primitiveOptions)
                ? existingObj.userData.primitiveOptions
                : (existingObj.userData ? existingObj.userData.geometryParams : null);

            const typeChanged = data.type !== currentType;
            const paramsChanged = JSON.stringify(data.geometryParams) !== JSON.stringify(currentParams);

            if (typeChanged || paramsChanged) {
                 // Recreate object
                 // Remove old
                 this.scene.remove(existingObj);
                 this.objectManager.deleteObject(existingObj);

                 // Create new
                 promises.push((async () => {
                     const mesh = await this.objectManager.addPrimitive(data.type, data.geometryParams);
                     if (mesh) {
                        this._applyStateToMesh(mesh, data);
                        // scene.add is handled by objectManager usually, but let's ensure it's in our list
                        if (!newObjects.includes(mesh)) newObjects.push(mesh);
                     }
                     return mesh;
                 })());
            } else {
                // Update existing object properties
                this._applyStateToMesh(existingObj, data);
                newObjects.push(existingObj);
            }
        } else {
            // Create new object
            promises.push((async () => {
                const mesh = await this.objectManager.addPrimitive(data.type, data.geometryParams);
                if (mesh) {
                    this._applyStateToMesh(mesh, data);
                    // scene.add is handled by objectManager usually, but let's ensure it's in our list
                    if (!newObjects.includes(mesh)) newObjects.push(mesh);
                }
                return mesh;
            })());
        }
    }

    // Remove objects not in new state
    this.objects.forEach(obj => {
        if (!newStateUuids.has(obj.uuid)) {
            // We use deleteObject but we need to be careful not to trigger history save or recursive issues
            // objectManager.deleteObject handles scene removal and disposal
            this.objectManager.deleteObject(obj);
        }
    });

    await Promise.all(promises);

    // Update objects array
    this.objects = newObjects;
    // Sort objects to match state order? state.objects order is preserved in loop
    // But async creation might mess order if we just push.
    // We should re-sort based on state order.
    const objMap = new Map();
    this.objects.forEach(o => objMap.set(o.uuid, o));
    this.objects = state.objects.map(d => objMap.get(d.uuid)).filter(o => o);

    if (state.selectedUuid) {
      const selected = this.objects.find(o => o.uuid === state.selectedUuid);
      if (selected) this.selectObject(selected);
    } else {
      this.deselectObject();
    }
    
    this.updateSceneGraph();
  }

  animate() {
    requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    if (this.physicsManager) this.physicsManager.update(delta);
    this.orbitControls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
