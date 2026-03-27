import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { ShaderEditor } from './ShaderEditor.js';
import { Logger } from './utils/Logger.js';
import { Events } from './constants.js';

/**
 * Manages the User Interface of the application.
 */
export class UIManager {
  /**
   * @param {import('./utils/ServiceContainer.js').ServiceContainer} container
   */
  constructor(container) {
    this.container = container;
    this.eventBus = container && typeof container.get === 'function' ? container.get('EventBus') : null;
    this.stateManager = container && typeof container.get === 'function' ? container.get('StateManager') : null;
    
    // UI Elements
    this.gui = null;
    this.propertiesFolder = null;
    try {
        this.objectsList = document.getElementById('objects-list');
        if (!this.objectsList) {
            this.objectsList = document.createElement('ul');
            this.objectsList.id = 'objects-list';
            // We don't necessarily append it to body here, just ensure it exists
        }
    } catch (_e) {
        this.objectsList = document.createElement('ul');
    }
    this.sceneGraphItemMap = new Map();

    // Dependencies that might be registered later
    this._resolveDependencies();
  }

  _resolveDependencies() {
    if (!this.container || typeof this.container.get !== 'function') return;
    try {
      this.primitiveFactory = this.container.get('PrimitiveFactory');
      this.objectManager = this.container.get('ObjectManager');
      this.objectPropertyUpdater = this.container.get('ObjectPropertyUpdater');
      this.physicsManager = this.container.get('PhysicsManager');
      this.sceneManager = this.container.get('SceneManager');
      this.exportManager = this.container.get('ExportManager');
      this.scene = this.container.get('Scene');
      this.renderer = this.container.get('Renderer');
      this.camera = this.container.get('Camera');
    } catch (_e) {
      // Some dependencies might not be registered yet during construction
    }
  }

  /**
   * Lazy resolve dependencies if needed
   */
  _ensureDependencies() {
    if (!this.primitiveFactory) this._resolveDependencies();
  }

  setupToolbar(callbacks) {
    const tools = [
      {
        id: 'translate-btn',
        icon: '✥',
        title: 'Translate (G)',
        action: () => callbacks.setTransformMode('translate'),
      },
      {
        id: 'rotate-btn',
        icon: '↻',
        title: 'Rotate (R)',
        action: () => callbacks.setTransformMode('rotate'),
      },
      {
        id: 'scale-btn',
        icon: '⤢',
        title: 'Scale (S)',
        action: () => callbacks.setTransformMode('scale'),
      },
      {
        id: 'undo-btn',
        icon: '↶',
        title: 'Undo (Ctrl+Z)',
        action: () => callbacks.undo(),
      },
      {
        id: 'redo-btn',
        icon: '↷',
        title: 'Redo (Ctrl+Y)',
        action: () => callbacks.redo(),
      },
      {
        id: 'delete-btn',
        icon: '🗑',
        title: 'Delete (Del)',
        action: () => callbacks.deleteSelected(),
      },
      {
        id: 'save-image-btn',
        icon: '📷',
        title: 'Save Image',
        action: () => this.container.get('ExportManager').saveImage(),
      },
    ];

    let container = document.getElementById('toolbar');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toolbar';
      document.body.appendChild(container);
    }

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

  setupGUI() {
    this._ensureDependencies();
    this.gui = new GUI({ autoPlace: false });
    const propsPanel = document.getElementById('properties-panel');
    if (propsPanel && this.gui.domElement) {
        try {
            propsPanel.appendChild(this.gui.domElement);
        } catch(err) {
            void err;
        }
    }

    const cameraFolder = this.gui.addFolder('Camera Settings');
    cameraFolder.add(this.sceneManager, 'dampingEnabled').name('Enable Damping').onChange(() => this.sceneManager.controls.update());
    cameraFolder.add(this.sceneManager, 'dampingFactor', 0.01, 1.0).name('Damping Factor');

    const toastManager = this.container && typeof this.container.get === 'function' ? this.container.get('ToastManager') : null;
    new ShaderEditor(this.gui, this.renderer, this.scene, this.camera, this.eventBus, toastManager);

    if (this.physicsManager) {
        const physicsFolder = this.gui.addFolder('Physics Controls');
        const physicsParams = {
            play: () => this.physicsManager.play(),
            pause: () => this.physicsManager.pause(),
            reset: () => this.physicsManager.reset()
        };
        physicsFolder.add(physicsParams, 'play').name('Play Simulation');
        physicsFolder.add(physicsParams, 'pause').name('Pause Simulation');
        physicsFolder.add(physicsParams, 'reset').name('Reset Simulation');
    }

    this.propertiesFolder = this.gui.addFolder('Properties');
    this.propertiesFolder.open();

    const viewFolder = this.gui.addFolder('View Settings');
    const viewParams = {
        showGrid: true,
        gridSize: 10,
        gridDivisions: 10,
        showAxes: true
    };
    
    const updateGrid = () => {
        if (this.eventBus) this.eventBus.publish(Events.UPDATE_GRID, viewParams);
    };
    
    viewFolder.add(viewParams, 'showGrid').name('Show Grid').onChange(updateGrid);
    
    const sizeCtrl = viewFolder.add(viewParams, 'gridSize', 1, 100).name('Grid Size');
    if (sizeCtrl.onFinishChange) sizeCtrl.onFinishChange(updateGrid);
    else sizeCtrl.onChange(updateGrid);

    const divCtrl = viewFolder.add(viewParams, 'gridDivisions', 1, 100, 1).name('Divisions');
    if (divCtrl.onFinishChange) divCtrl.onFinishChange(updateGrid);
    else divCtrl.onChange(updateGrid);

    viewFolder.add(viewParams, 'showAxes').name('Show Axes').onChange((val) => {
        if (this.eventBus) this.eventBus.publish(Events.TOGGLE_AXES, val);
    });
  }

  setupMenu(callbacks) {
    const handlers = {
        // File
        'menu-file-load': () => {
            const input = document.getElementById('file-input');
            if (input) input.click();
        },
        'menu-file-save': () => callbacks.saveScene(),
        'menu-file-import': () => {
            const input = document.getElementById('model-import-input');
            if (input) input.click();
        },
        // Edit
        'menu-edit-undo': () => callbacks.undo(),
        'menu-edit-redo': () => callbacks.redo(),
        'menu-edit-delete': () => callbacks.deleteSelected(),
        'menu-edit-duplicate': () => callbacks.duplicateSelected(),
        // Add
        'menu-add-box': () => callbacks.addBox(),
        'menu-add-sphere': () => callbacks.addSphere(),
        'menu-add-cylinder': () => callbacks.addCylinder(),
        'menu-add-cone': () => callbacks.addCone(),
        'menu-add-torus': () => callbacks.addTorus(),
        'menu-add-plane': () => callbacks.addPlane(),
        'menu-add-teapot': () => callbacks.addTeapot(),
        'menu-add-ambient-light': () => callbacks.addLight('AmbientLight'),
        'menu-add-directional-light': () => callbacks.addLight('DirectionalLight'),
        'menu-add-point-light': () => callbacks.addLight('PointLight'),
        // View
        'menu-view-fullscreen': () => callbacks.toggleFullscreen()
    };

    Object.entries(handlers).forEach(([id, handler]) => {
        const btn = document.getElementById(id);
        if (btn) btn.onclick = (e) => {
            e.preventDefault();
            handler();
        };
    });

    // Handle file input changes (Legacy support)
    const loadInput = document.getElementById('file-input');
    if (loadInput) {
      loadInput.onchange = async (e) => {
        // @ts-ignore
        const file = e.target.files[0];
        if (file) {
          try {
            await callbacks.loadScene(file);
          } catch (err) {
            Logger.error('Failed to load scene', err);
          }
        }
        // @ts-ignore
        e.target.value = '';
      };
    }

    const importInput = document.getElementById('model-import-input');
    if (importInput) {
        importInput.onchange = (e) => {
            // @ts-ignore
            if (e.target.files && e.target.files[0]) {
                // @ts-ignore
                callbacks.importModel(e.target.files[0]);
            }
            // @ts-ignore
            e.target.value = '';
        };
    }
  }

  _triggerFilePicker(callback, accept = '') {
    const input = document.createElement('input');
    input.type = 'file';
    if (accept) input.accept = accept;
    input.onchange = (e) => {
        // @ts-ignore
        const file = e.target.files[0];
        if (file) callback(file);
    };
    input.click();
  }

  setupSceneGraph() {
    this.objectsList = document.getElementById('objects-list');
  }

  updatePropertiesPanel(object, callbacks) {
    this._ensureDependencies();
    this.clearPropertiesPanel();
    if (!object || !this.propertiesFolder) return;

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
        color: '#' + object.material.color.getHexString(),
        // @ts-ignore
        emissive: object.material.emissive ? '#' + object.material.emissive.getHexString() : '#000000'
      };
      mat.addColor(materialData, 'color').name('Color').onChange((val) => {
        // @ts-ignore
        object.material.color.set(val);
      }).onFinishChange(() => callbacks.saveState('Change Color'));

      // @ts-ignore
      if (object.material.emissive !== undefined) {
        mat.addColor(materialData, 'emissive').name('Emissive').onChange((val) => {
          // @ts-ignore
          object.material.emissive.set(val);
        }).onFinishChange(() => callbacks.saveState('Change Emissive'));
      }

      // @ts-ignore
      if (object.material.roughness !== undefined) {
        // @ts-ignore
        mat.add(object.material, 'roughness', 0, 1).name('Roughness').onFinishChange(() => callbacks.saveState('Change Roughness'));
      }
      
      // @ts-ignore
      if (object.material.metalness !== undefined) {
        // @ts-ignore
        mat.add(object.material, 'metalness', 0, 1).name('Metalness').onFinishChange(() => callbacks.saveState('Change Metalness'));
      }

      // @ts-ignore
      if (object.material.wireframe !== undefined) {
        // @ts-ignore
        mat.add(object.material, 'wireframe').name('Wireframe').onFinishChange(() => callbacks.saveState('Toggle Wireframe'));
      }

      // Texture Support
      const textureOptions = {
        uploadMap: () => this.triggerTextureUpload(object, 'map', callbacks),
        uploadNormalMap: () => this.triggerTextureUpload(object, 'normalMap', callbacks),
        uploadRoughnessMap: () => this.triggerTextureUpload(object, 'roughnessMap', callbacks)
      };
      mat.add(textureOptions, 'uploadMap').name('Set Albedo Map');
      mat.add(textureOptions, 'uploadNormalMap').name('Set Normal Map');
      mat.add(textureOptions, 'uploadRoughnessMap').name('Set Rough. Map');
    }

    if (object.userData && object.userData.primitiveType === 'Extrude') {
      const g = this.propertiesFolder.addFolder('Extrude Settings');
      const opts = object.userData.primitiveOptions || {};
      const params = {
        depth: opts.depth !== undefined ? opts.depth : 0.2,
        steps: opts.steps !== undefined ? opts.steps : 2,
        bevelEnabled: opts.bevelEnabled !== undefined ? opts.bevelEnabled : true,
        bevelThickness: opts.bevelThickness !== undefined ? opts.bevelThickness : 0.1,
        bevelSize: opts.bevelSize !== undefined ? opts.bevelSize : 0.1,
        bevelSegments: opts.bevelSegments !== undefined ? opts.bevelSegments : 1,
      };
      const updateExtrude = () => {
        object.userData.primitiveOptions = { ...opts, ...params };
        this.objectPropertyUpdater.updatePrimitive(object, object.userData.primitiveOptions);
      };
      const finishChange = () => callbacks.saveState('Change Extrude');
      g.add(params, 'depth', 0.1, 10).name('Depth').onChange(updateExtrude).onFinishChange(finishChange);
      g.add(params, 'steps', 1, 20, 1).name('Steps').onChange(updateExtrude).onFinishChange(finishChange);
      g.add(params, 'bevelEnabled').name('Bevel').onChange(updateExtrude).onFinishChange(finishChange);
      g.add(params, 'bevelThickness', 0, 2).name('Bevel Thick').onChange(updateExtrude).onFinishChange(finishChange);
      g.add(params, 'bevelSize', 0, 2).name('Bevel Size').onChange(updateExtrude).onFinishChange(finishChange);
      g.add(params, 'bevelSegments', 1, 10, 1).name('Bevel Segs').onChange(updateExtrude).onFinishChange(finishChange);
    }

    // CSG Operations
    this.eventBus.publish(Events.UI_UPDATE_PROPERTIES, { object, folder: this.propertiesFolder, callbacks });

    // Physics Settings (Per Object)
    if (this.physicsManager) {
        const physFolder = this.propertiesFolder.addFolder('Physics');
        const hasBody = this.physicsManager.meshToBodyMap.has(object);
        const currentBody = hasBody ? this.physicsManager.meshToBodyMap.get(object) : null;
        
        let initialShapeType = 'box';
        if (currentBody && currentBody.shapes.length > 0) {
            const cannonShape = currentBody.shapes[0];
            if (cannonShape.type === 1) initialShapeType = 'sphere'; 
            else if (cannonShape.type === 4) initialShapeType = 'box'; 
            else if (cannonShape.type === 8) initialShapeType = 'cylinder'; 
        }

        const physParams = {
            enabled: hasBody,
            mass: currentBody ? currentBody.mass : 1,
            shape: initialShapeType
        };

        const updatePhysics = () => {
            if (physParams.enabled) {
                this.physicsManager.removeObject(object);
                this.physicsManager.addBody(object, physParams.mass, physParams.shape);
            } else {
                this.physicsManager.removeObject(object);
            }
            callbacks.saveState('Update Physics');
        };

        physFolder.add(physParams, 'enabled').name('Enable Physics').onChange(updatePhysics);
        physFolder.add(physParams, 'mass', 0, 100).name('Mass (0=Static)').onFinishChange(updatePhysics);
        physFolder.add(physParams, 'shape', ['box', 'sphere', 'cylinder']).name('Collision Shape').onChange(updatePhysics);
    }

    this.applyScrubbingToFolder(this.propertiesFolder);
  }

  applyScrubbingToFolder(folder) {
    folder.__controllers.forEach(c => this.applyScrubbing(c));
    if (folder.__folders) {
      Object.values(folder.__folders).forEach(f => this.applyScrubbingToFolder(f));
    }
  }

  applyScrubbing(controller) {
    if (typeof controller.getValue() !== 'number') return;
    
    const container = controller.domElement.closest('li');
    if (!container) return;
    
    const label = container.querySelector('.property-name');
    if (!label || label.dataset.scrubbingInitialized) return;

    label.style.cursor = 'ew-resize';
    label.style.userSelect = 'none';
    label.dataset.scrubbingInitialized = 'true';

    let startX = 0;
    let startValue = 0;

    const onMouseMove = (e) => {
      const delta = e.clientX - startX;
      let sensitivity = 0.01;
      if (e.shiftKey) sensitivity = 0.001;
      if (e.altKey) sensitivity = 0.1;
      
      const newValue = startValue + delta * sensitivity;
      controller.setValue(newValue);
      if (controller.__onChange) {
          controller.__onChange.call(controller, newValue);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (controller.__onFinishChange) {
          controller.__onFinishChange.call(controller, controller.getValue());
      }
      document.body.style.cursor = '';
    };

    label.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      startValue = controller.getValue();
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'ew-resize';
      e.preventDefault();
    });
  }

  triggerTextureUpload(object, mapType, callbacks) {
    this._triggerFilePicker((file) => {
        const reader = new window.FileReader();
        reader.onload = (event) => {
          const textureLoader = new THREE.TextureLoader();
          // @ts-ignore
          textureLoader.load(event.target.result, (texture) => {
            // @ts-ignore
            if (object.material) {
                // @ts-ignore
                object.material[mapType] = texture;
                // @ts-ignore
                object.material.needsUpdate = true;
                callbacks.saveState(`Upload ${mapType}`);
                this.container.get('ToastManager').show('Texture applied!', 'success');
            }
          });
        };
        reader.readAsDataURL(file);
    }, 'image/*');
  }

  clearPropertiesPanel() {
    if (!this.propertiesFolder) return;
    const controllers = [...this.propertiesFolder.__controllers];
    controllers.forEach(c => this.propertiesFolder.remove(c));
    if (this.propertiesFolder.__folders) {
      Object.values(this.propertiesFolder.__folders).forEach(f => this.propertiesFolder.removeFolder(f));
    }
  }

  updateSceneGraph(objects, selectedObject, callbacks) {
    if (!this.objectsList) return;

    if (objects.length === 0) {
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

    if (
      this.objectsList.children.length > 0 &&
      this.objectsList.children[0].textContent === 'No objects in scene'
    ) {
      this.objectsList.innerHTML = '';
    }

    let currentDom = this.objectsList.firstElementChild;

    objects.forEach((obj, idx) => {
      let li = this.sceneGraphItemMap.get(obj.uuid);

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
        li = this.createSceneGraphItem(obj, callbacks);
        this.sceneGraphItemMap.set(obj.uuid, li);
      }

      this.updateSceneGraphItem(li, obj, idx, selectedObject);

      if (currentDom === li) {
        currentDom = currentDom.nextElementSibling;
      } else {
        this.objectsList.insertBefore(li, currentDom);
      }
    });

    while (currentDom) {
      const next = currentDom.nextElementSibling;
      currentDom.remove();
      currentDom = next;
    }

    if (this.sceneGraphItemMap.size > objects.length) {
      const activeUuids = new Set(objects.map((o) => o.uuid));
      for (const uuid of this.sceneGraphItemMap.keys()) {
        if (!activeUuids.has(uuid)) {
          this.sceneGraphItemMap.delete(uuid);
        }
      }
    }
  }

  createSceneGraphItem(obj, callbacks) {
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
    visibilityBtn.setAttribute('aria-label', obj.visible ? 'Hide object' : 'Show object');
    visibilityBtn.setAttribute('title', obj.visible ? 'Hide object' : 'Show object');
    visibilityBtn.onclick = (e) => {
      e.stopPropagation();
      obj.visible = !obj.visible;
      callbacks.updateSceneGraph();
    };
    controls.appendChild(visibilityBtn);
    // @ts-ignore
    li._visibilityBtn = visibilityBtn;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.setAttribute('aria-label', 'Delete object');
    deleteBtn.setAttribute('title', 'Delete object');
    deleteBtn.textContent = '🗑️';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      callbacks.deleteObject(obj);
    };
    controls.appendChild(deleteBtn);

    li.appendChild(controls);

    li.onclick = () => callbacks.selectObject(obj);

    // Drag and Drop
    li.draggable = true;
    li.addEventListener('dragstart', (e) => {
      // @ts-ignore
      e.dataTransfer.setData('text/plain', obj.uuid);
      // @ts-ignore
      e.dataTransfer.effectAllowed = 'move';
      li.style.opacity = '0.5';
    });

    li.addEventListener('dragend', () => {
      li.style.opacity = '1';
      const items = this.objectsList.querySelectorAll('li');
      items.forEach(item => {
        // @ts-ignore
        item.style.borderTop = '';
        // @ts-ignore
        item.style.borderBottom = '';
      });
    });

    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      // @ts-ignore
      e.dataTransfer.dropEffect = 'move';
      
      const rect = li.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      if (e.clientY < midpoint) {
        li.style.borderTop = '2px solid var(--accent)';
        li.style.borderBottom = '';
      } else {
        li.style.borderTop = '';
        li.style.borderBottom = '2px solid var(--accent)';
      }
    });

    li.addEventListener('dragleave', () => {
      li.style.borderTop = '';
      li.style.borderBottom = '';
    });

    li.addEventListener('drop', (e) => {
      e.preventDefault();
      li.style.borderTop = '';
      li.style.borderBottom = '';
      // @ts-ignore
      const draggedUuid = e.dataTransfer.getData('text/plain');
      if (draggedUuid !== obj.uuid) {
        const rect = li.getBoundingClientRect();
        const isAfter = e.clientY > (rect.top + rect.height / 2);
        callbacks.reorderObjects(draggedUuid, obj.uuid, isAfter);
      }
    });

    return li;
  }

  updateSceneGraphItem(li, obj, idx, selectedObject) {
    const isSelected = selectedObject === obj;
    const expectedBg = isSelected ? '#444' : '#222';
    if (li.style.background !== expectedBg) {
        li.style.background = expectedBg;
    }

    // @ts-ignore
    const nameSpan = li._nameSpan;
    const expectedName = obj.name || `Object ${idx + 1}`;
    if (nameSpan.textContent !== expectedName) {
      nameSpan.textContent = expectedName;
    }

    // @ts-ignore
    const visibilityBtn = li._visibilityBtn;
    const expectedVisLabel = obj.visible ? 'Hide object' : 'Show object';
    const expectedVisIcon = obj.visible ? '👁️' : '🚫';

    if (visibilityBtn.getAttribute('aria-label') !== expectedVisLabel) {
        visibilityBtn.setAttribute('aria-label', expectedVisLabel);
    }
    if (visibilityBtn.getAttribute('title') !== expectedVisLabel) {
        visibilityBtn.setAttribute('title', expectedVisLabel);
    }
    if (visibilityBtn.textContent !== expectedVisIcon) {
        visibilityBtn.textContent = expectedVisIcon;
    }
  }
}
