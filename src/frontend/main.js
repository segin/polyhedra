// @ts-check
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { SceneStorage } from './SceneStorage.js';
import { ServiceContainer } from './utils/ServiceContainer.js';
import { StateManager } from './StateManager.js';
import EventBus from './EventBus.js';
import { ObjectManager } from './ObjectManager.js';
import { SceneManager } from './SceneManager.js';
import { InputManager } from './InputManager.js';
import { Events } from './constants.js';
import { PhysicsManager } from './PhysicsManager.js';
import { PrimitiveFactory } from './PrimitiveFactory.js';
import { ObjectFactory } from './ObjectFactory.js';
import { ObjectPropertyUpdater } from './ObjectPropertyUpdater.js';
import { ToastManager } from './ToastManager.js';
import { LightManager } from './LightManager.js';
import { Logger } from './utils/Logger.js';
import { ModelLoader } from './ModelLoader.js';
import { AnimationManager } from './AnimationManager.js';
import { TimelineUI } from './TimelineUI.js';
import { ExportManager } from './ExportManager.js';
import { ErrorHandler } from './ErrorHandler.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ViewCube } from './ViewCube.js';
import { CSG } from 'three-csg-ts';
import { UIManager } from './UIManager.js';
import { HistoryManager } from './HistoryManager.js';

/**
 * Simple 3D modeling application with basic primitives and transform controls
 */
export class App {
  constructor() {
    // Initialize Core Utilities
    this.toastManager = new ToastManager();
    this.container = new ServiceContainer();
    this.container.register('ToastManager', this.toastManager);
    
    ErrorHandler.init(this.toastManager);
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
    const canvas = document.querySelector('#c');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

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
    this.initPostProcessing();

    this.inputManager = new InputManager(EventBus, this.renderer.domElement);
    this.container.register('InputManager', this.inputManager);

    this.physicsManager = new PhysicsManager(this.scene);
    this.container.register('PhysicsManager', this.physicsManager);

    this.animationManager = new AnimationManager();
    this.container.register('AnimationManager', this.animationManager);

    this.exportManager = new ExportManager(this.renderer, this.scene, this.camera);
    this.container.register('ExportManager', this.exportManager);

    this.timelineUI = new TimelineUI(document.body, this.animationManager, EventBus, this.exportManager);

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

    this.lightManager = new LightManager(this.scene, EventBus);
    this.container.register('LightManager', this.lightManager);

    this.uiManager = new UIManager(this.container);
    this.historyManager = new HistoryManager(this.container);

    // App State
    this.selectedObject = null;
    this.objects = [];
    this.primitiveCounter = 0;
    
    // Continue initialization
    this.setupControls();
    
    // Use UI Manager for UI setup
    this.uiManager.setupSceneGraph();
    this.uiManager.setupToolbar({
        setTransformMode: (mode) => this.transformControls.setMode(mode),
        undo: () => this.undo(),
        redo: () => this.redo(),
        deleteSelected: () => this.deleteSelectedObject()
    });
    this.uiManager.setupGUI();
    this.uiManager.setupMenu({
        newScene: () => this.newScene(),
        saveScene: () => this.saveScene(),
        loadScene: (f) => this.loadScene(f),
        importModel: (f) => this.importModel(f),
        toggleFullscreen: () => this.toggleFullscreen(),
        undo: () => this.undo(),
        redo: () => this.redo(),
        deleteSelected: () => this.deleteSelectedObject(),
        duplicateSelected: () => this.duplicateSelectedObject(),
        addBox: () => this.addBox(),
        addSphere: () => this.addSphere(),
        addCylinder: () => this.addCylinder(),
        addCone: () => this.addCone(),
        addTorus: () => this.addTorus(),
        addPlane: () => this.addPlane(),
        addTeapot: () => this.addTeapot(),
        addLight: (type) => this.addLight(type)
    });

    this.setupLighting();
    this.setupHelpers();
    this.setupMobileOptimizations();

    this.sceneStorage = new SceneStorage(this.scene, EventBus);

    // Initialize Model Loader
    this.modelLoader = new ModelLoader(this.scene, EventBus);
    this.container.register('ModelLoader', this.modelLoader);

    // Bind animation loop
    this.animate = this.animate.bind(this);
    this.animate();

    // Initialize ViewCube
    this.viewCube = new ViewCube(this.camera, this.sceneManager.controls, document.body);

    // Subscribe to selection changes
    if (this.stateManager) {
      this.stateManager.subscribe('selection', (selection) => {
        if (selection && selection.length > 0) {
          this.selectedObject = selection[0];
          this.transformControls.attach(this.selectedObject);
          this.updatePropertiesPanel(this.selectedObject);
          if (this.timelineUI) this.timelineUI.setSelectedObject(this.selectedObject);
        } else {
          this.selectedObject = null;
          this.transformControls.detach();
          this.clearPropertiesPanel();
          if (this.timelineUI) this.timelineUI.setSelectedObject(null);
        }
        this.updateSceneGraph();
      });

      EventBus.subscribe(Events.FOCUS_OBJECT, () => {
        if (this.selectedObject) {
           this.sceneManager.focusOnObject(this.selectedObject);
        }
      });
      
      EventBus.subscribe(Events.UPDATE_GRID, (params) => {
          if (this.gridHelper) this.scene.remove(this.gridHelper);
          if (params.showGrid) {
              this.gridHelper = new THREE.GridHelper(params.gridSize, params.gridDivisions);
              this.scene.add(this.gridHelper);
          }
          this.saveState('Update Grid Settings');
      });

      EventBus.subscribe(Events.TOGGLE_AXES, (val) => {
          if (this.axesHelper) this.axesHelper.visible = val;
      });

      EventBus.subscribe(Events.SET_TRANSFORM_MODE, (mode) => {
          if (this.transformControls) this.transformControls.setMode(mode);
      });

      EventBus.subscribe(Events.DELETE_OBJECT, () => {
          this.deleteSelectedObject();
      });

      EventBus.subscribe(Events.UNDO, () => this.undo());
      EventBus.subscribe(Events.REDO, () => this.redo());
    }

    // Save initial state
    this.saveState('Initial State');
  }

  initRenderer() {
    const container = this.renderer.domElement.parentElement || document.body;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    if (!this.renderer.domElement.parentElement) {
      document.body.appendChild(this.renderer.domElement);
    }

    this.camera.aspect = width / height;
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);

    window.addEventListener('resize', () => {
      const newContainer = this.renderer.domElement.parentElement || document.body;
      const newWidth = newContainer.clientWidth || window.innerWidth;
      const newHeight = newContainer.clientHeight || window.innerHeight;
      
      this.camera.aspect = newWidth / newHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(newWidth, newHeight);
      if (this.composer) {
        this.composer.setSize(newWidth, newHeight);
      }
    });
  }

  initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const container = this.renderer.domElement.parentElement || document.body;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.outlinePass = new OutlinePass(
        new THREE.Vector2(width, height),
        this.scene,
        this.camera
    );

    this.outlinePass.edgeStrength = 4.0;
    this.outlinePass.edgeGlow = 1.0;
    this.outlinePass.edgeThickness = 2.0;
    this.outlinePass.pulsePeriod = 2.0;
    this.outlinePass.visibleEdgeColor.set('#00ffff'); 
    this.outlinePass.hiddenEdgeColor.set('#190a05');
    
    this.composer.addPass(this.outlinePass);
  }

  setupControls() {
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.addEventListener('dragging-changed', (event) => {
      if (this.sceneManager && this.sceneManager.controls) {
        this.sceneManager.controls.enabled = !event.value;
      }
      if (!event.value && this.selectedObject) {
        this.saveState('Transform object');
      }
    });
    this.scene.add(this.transformControls);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.renderer.domElement.addEventListener('click', (event) => {
      if (this.transformControls.dragging) return;

      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.objects);

      if (intersects.length > 0) {
        this.selectObject(intersects[0].object);
      } else {
        this.deselectObject();
      }
    });

    // Old keydown listener moved to InputManager
  }

  setupLighting() {
    // Handled by LightManager now
  }

  setupHelpers() {
    this.gridHelper = new THREE.GridHelper(10, 10);
    this.scene.add(this.gridHelper);

    this.axesHelper = new THREE.AxesHelper(5);
    this.scene.add(this.axesHelper);
  }

  setupMobileOptimizations() {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
      if (this.sceneManager && this.sceneManager.controls) {
        this.sceneManager.controls.enableKeys = false;
        this.sceneManager.controls.touches = {
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        };
      }
      document.body.classList.add('mobile-optimized');
    }
  }

  // Compatibility proxies for tests
  get objectsList() { return this.uiManager ? this.uiManager.objectsList : null; }
  set objectsList(val) { if (this.uiManager) this.uiManager.objectsList = val; }
  get sceneGraphItemMap() { return this.uiManager ? this.uiManager.sceneGraphItemMap : new Map(); }
  set sceneGraphItemMap(val) { if (this.uiManager) this.uiManager.sceneGraphItemMap = val; }

  setupGUI() { if (this.uiManager) this.uiManager.setupGUI(); }
  setupToolbar(callbacks) { if (this.uiManager) this.uiManager.setupToolbar(callbacks || {
      setTransformMode: (mode) => this.transformControls.setMode(mode),
      undo: () => this.undo(),
      redo: () => this.redo(),
      deleteSelected: () => this.deleteSelectedObject()
  }); }
  setupMenu(callbacks) { if (this.uiManager) this.uiManager.setupMenu(callbacks || {
      newScene: () => this.newScene(),
      saveScene: () => this.saveScene(),
      loadScene: (f) => this.loadScene(f),
      importModel: (f) => this.importModel(f),
      toggleFullscreen: () => this.toggleFullscreen()
  }); }
  setupSceneGraph() { if (this.uiManager) this.uiManager.setupSceneGraph(); }
  triggerTextureUpload(object, mapType) { 
    if (this.uiManager) {
        this.uiManager.triggerTextureUpload(object, mapType, { 
            saveState: (desc) => this.saveState(desc) 
        }); 
    }
  }

  newScene() {
    this.objects.forEach(obj => this.scene.remove(obj));
    this.objects = [];
    this.deselectObject();
    this.updateSceneGraph();
    this.saveState('New Scene');
  }

  saveState(description = 'Action') {
    this.historyManager.saveState(this.objects, this.selectedObject, description);
  }

  async undo() {
    await this.historyManager.undo({
        getObjects: () => this.objects,
        setObjects: (objs) => { this.objects = objs; },
        selectObject: (obj) => this.selectObject(obj),
        deselectObject: () => this.deselectObject(),
        updateSceneGraph: () => this.updateSceneGraph()
    });
  }

  async redo() {
    await this.historyManager.redo({
        getObjects: () => this.objects,
        setObjects: (objs) => { this.objects = objs; },
        selectObject: (obj) => this.selectObject(obj),
        deselectObject: () => this.deselectObject(),
        updateSceneGraph: () => this.updateSceneGraph()
    });
  }

  async restoreState(state) {
    await this.historyManager.restoreState(state, {
        getObjects: () => this.objects,
        setObjects: (objs) => { this.objects = objs; },
        selectObject: (obj) => this.selectObject(obj),
        deselectObject: () => this.deselectObject(),
        updateSceneGraph: () => this.updateSceneGraph()
    });
  }

  selectObject(object) {
    this.selectedObject = object; 
    this.objectManager.selectObject(object);
    this.updatePropertiesPanel(object);
    this.updateSceneGraph();
    
    if (this.outlinePass) {
        this.outlinePass.selectedObjects = object ? [object] : [];
    }
  }

  deselectObject() {
    this.selectedObject = null;
    this.objectManager.deselectObject();
    this.updatePropertiesPanel(null);
    this.updateSceneGraph();
    
    if (this.outlinePass) {
        this.outlinePass.selectedObjects = [];
    }
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

  performCSG(baseObject, targetUuid, operation) {
    if (!baseObject || !targetUuid) return;
    const targetObject = this.objects.find(o => o.uuid === targetUuid);
    if (!targetObject) {
      Logger.warn('CSG Target not found');
      return;
    }

    try {
      baseObject.updateMatrixWorld(true);
      targetObject.updateMatrixWorld(true);

      let resultMesh;
      if (operation === 'union') resultMesh = CSG.union(baseObject, targetObject);
      else if (operation === 'subtract') resultMesh = CSG.subtract(baseObject, targetObject);
      else if (operation === 'intersect') resultMesh = CSG.intersect(baseObject, targetObject);

      if (resultMesh) {
        resultMesh.name = `${baseObject.name}_${operation}_${targetObject.name}`;
        resultMesh.castShadow = true;
        resultMesh.receiveShadow = true;
        if (baseObject.material) {
          resultMesh.material = Array.isArray(baseObject.material) 
            ? baseObject.material.map(m => m.clone()) 
            : baseObject.material.clone();
        }
        
        this.deleteObject(baseObject);
        this.deleteObject(targetObject);
        
        this.scene.add(resultMesh);
        this.objects.push(resultMesh);
        this.selectObject(resultMesh);
        
        this.updateSceneGraph();
        this.saveState(`CSG ${operation}`);
        this.toastManager.show(`CSG ${operation} successful!`, 'success');
      }
    } catch (err) {
      Logger.error(`CSG ${operation} failed:`, err);
      this.toastManager.show(`CSG failed: ${err.message}`, 'error');
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

  addLight(type) {
    const light = this.lightManager.addLight(type, 0xffffff, 1, new THREE.Vector3(0, 5, 0));
    if (light) {
        this.saveState(`Add ${type}`);
        this.toastManager.show(`${type} added`, 'success');
    }
    return light;
  }

  async addPrimitive(type, options) {
    const meshOrPromise = this.objectManager.addPrimitive(type, options);
    
    const setup = (mesh) => {
      if (mesh) {
        this.primitiveCounter++;
        mesh.name = `${type}_${this.primitiveCounter}`;
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

  async importModel(file) {
      try {
          const object = await this.modelLoader.loadModel(file);
          this.objects.push(object);
          this.selectObject(object);
          this.updateSceneGraph();
          this.saveState('Import Model');
          this.toastManager.show(`Imported ${file.name}`, 'success');
      } catch (error) {
          Logger.error('Import failed:', error);
          this.toastManager.show('Import failed: ' + error.message, 'error');
      }
  }

  async saveScene() {
    try {
      await this.sceneStorage.saveScene();
      this.toastManager.show('Scene saved', 'success');
    } catch (e) {
      Logger.error('Save failed', e);
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
      Logger.error('Load failed', e);
      this.toastManager.show('Load failed', 'error');
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        Logger.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  updatePropertiesPanel(object) {
    this.uiManager.updatePropertiesPanel(object, {
        saveState: (desc) => this.saveState(desc)
    });
  }

  clearPropertiesPanel() {
    this.uiManager.clearPropertiesPanel();
  }

  updateSceneGraph() {
    this.uiManager.updateSceneGraph(this.objects, this.selectedObject, {
        updateSceneGraph: () => this.updateSceneGraph(),
        deleteObject: (obj) => this.deleteObject(obj),
        selectObject: (obj) => this.selectObject(obj),
        reorderObjects: (d, t, a) => this.reorderObjects(d, t, a)
    });
  }

  reorderObjects(draggedUuid, targetUuid, isAfter) {
    const draggedIdx = this.objects.findIndex(o => o.uuid === draggedUuid);
    let targetIdx = this.objects.findIndex(o => o.uuid === targetUuid);

    if (draggedIdx !== -1 && targetIdx !== -1) {
      const [draggedObj] = this.objects.splice(draggedIdx, 1);
      targetIdx = this.objects.findIndex(o => o.uuid === targetUuid);
      const insertIdx = isAfter ? targetIdx + 1 : targetIdx;
      this.objects.splice(insertIdx, 0, draggedObj);
      this.updateSceneGraph();
      this.saveState('Reorder objects');
      this.toastManager.show('Hierarchy reordered', 'success');
    }
  }

  animate() {
    requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();

    TWEEN.update();
    if (this.viewCube) this.viewCube.update();
    if (this.physicsManager) this.physicsManager.update(delta);
    if (this.animationManager) this.animationManager.update(delta, this.scene);
    if (this.timelineUI) this.timelineUI.update();
    if (this.sceneManager && this.sceneManager.controls) {
        this.sceneManager.controls.update();
    }
    
    if (this.exportManager) this.exportManager.capture();

    if (this.composer) {
        this.composer.render();
    } else {
        this.renderer.render(this.scene, this.camera);
    }
  }
}
