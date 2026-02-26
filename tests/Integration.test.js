/**
 * Integration tests for complete workflow scenarios
 */

// Mock THREE is handled by jest.setup.cjs

// Mock dat.gui
const mockController = {
  name: jest.fn(() => ({ onChange: jest.fn() })),
  onChange: jest.fn(),
};

const mockFolder = {
  add: jest.fn(() => mockController),
  addFolder: jest.fn(() => mockFolder),
  addColor: jest.fn(() => mockController),
  open: jest.fn(),
  close: jest.fn(),
  remove: jest.fn(),
  removeFolder: jest.fn(),
  __controllers: [],
  __folders: [],
};

jest.mock('dat.gui', () => ({
  GUI: jest.fn(() => ({
    addFolder: jest.fn(() => mockFolder),
  })),
}));

// Mock controls
jest.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: jest.fn(() => ({
    enableDamping: true,
    dampingFactor: 0.05,
    enabled: true,
    update: jest.fn(),
  })),
}));

jest.mock('three/examples/jsm/controls/TransformControls.js', () => ({
  TransformControls: jest.fn(() => ({
    addEventListener: jest.fn(),
    setMode: jest.fn(),
    attach: jest.fn(),
    detach: jest.fn(),
    dragging: false,
  })),
}));

describe('Integration Tests - Complete Workflow', () => {
  let app;

  beforeEach(() => {
    // Setup environment (handled by jsdom environment)
    if (typeof document !== 'undefined') {
        document.body.innerHTML = '';
    }
    
    global.requestAnimationFrame = jest.fn();
    global.console.log = jest.fn(); // Suppress console.log
    global.Date.now = jest.fn(() => 1234567890);
    global.URL = { createObjectURL: jest.fn(), revokeObjectURL: jest.fn() };
    global.Worker = jest.fn(() => ({
        postMessage: jest.fn(),
        addEventListener: jest.fn()
    }));

    // Mock methods that might be missing or need spying
    if (typeof window !== 'undefined') {
        window.scrollTo = jest.fn();
    }

    jest.clearAllMocks();

    // Create integrated app with all functionality
    class IntegratedApp {
      constructor() {
        this.objects = [];
        this.selectedObject = null;
        this.scene = { add: jest.fn(), remove: jest.fn() };
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        this.propertiesFolder = mockFolder;

        this.setupSceneGraph();
        this.saveState('Initial state');
      }

      // Scene Graph functionality
      setupSceneGraph() {
        this.sceneGraphPanel = document.createElement('div');
        this.objectsList = document.createElement('ul');
        this.sceneGraphPanel.appendChild(document.createElement('h3'));
        this.sceneGraphPanel.appendChild(this.objectsList);
        document.body.appendChild(this.sceneGraphPanel);
      }

      updateSceneGraph() {
        this.objectsList.innerHTML = '';
        this.objects.forEach((object, index) => {
          const listItem = document.createElement('li');
          listItem.onclick = () => this.selectObject(object);
          this.objectsList.appendChild(listItem);
        });
      }

      // Object management
      selectObject(object) {
        this.selectedObject = object;
        this.updatePropertiesPanel(object);
        this.updateSceneGraph();
      }

      deselectObject() {
        this.selectedObject = null;
        this.clearPropertiesPanel();
        this.updateSceneGraph();
      }

      deleteObject(object) {
        const index = this.objects.indexOf(object);
        if (index > -1) {
          this.objects.splice(index, 1);
          this.scene.remove(object);
        }
        if (this.selectedObject === object) {
          this.deselectObject();
        }
        this.updateSceneGraph();
        this.saveState('Delete object');
      }

      // Property panel functionality
      updatePropertiesPanel(object) {
        this.clearPropertiesPanel();
        if (!object) return;

        this.propertiesFolder.add({ name: object.name }, 'name');
        this.propertiesFolder.addFolder('Position');
        this.propertiesFolder.addFolder('Rotation');
        this.propertiesFolder.addFolder('Scale');
        this.propertiesFolder.addFolder('Material');
        this.propertiesFolder.addFolder('Geometry');
        this.propertiesFolder.open();
      }

      clearPropertiesPanel() {
        this.propertiesFolder.__controllers.length = 0;
        this.propertiesFolder.__folders.length = 0;
        this.propertiesFolder.close();
      }

      // History functionality
      saveState(description = 'Action') {
        const state = {
          description: description,
          timestamp: Date.now(),
          objects: this.objects.map((obj) => ({
            name: obj.name,
            type: obj.geometry.type,
            position: obj.position.clone(),
            rotation: obj.rotation.clone(),
            scale: obj.scale.clone(),
            material: {
              color: obj.material.color.clone(),
              emissive: obj.material.emissive.clone(),
            },
            geometryParams: obj.userData.geometryParams ? { ...obj.userData.geometryParams } : null,
            visible: obj.visible,
            castShadow: obj.castShadow,
            receiveShadow: obj.receiveShadow,
            uuid: obj.uuid,
          })),
          selectedObjectUuid: this.selectedObject ? this.selectedObject.uuid : null,
        };

        if (this.historyIndex < this.history.length - 1) {
          this.history.splice(this.historyIndex + 1);
        }

        this.history.push(state);
        this.historyIndex++;

        if (this.history.length > this.maxHistorySize) {
          this.history.shift();
          this.historyIndex--;
        }
      }

      undo() {
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.restoreState(this.history[this.historyIndex]);
          return true;
        }
        return false;
      }

      redo() {
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.restoreState(this.history[this.historyIndex]);
          return true;
        }
        return false;
      }

      restoreState(state) {
        // Clear current scene
        this.objects.forEach((obj) => {
          this.scene.remove(obj);
          if (obj.geometry && obj.geometry.dispose) obj.geometry.dispose();
          if (obj.material && obj.material.dispose) obj.material.dispose();
        });
        this.objects.length = 0;

        // Restore objects
        state.objects.forEach((objData) => {
          const THREE = require('three');
          const geometry = new THREE.BoxGeometry();
          const material = new THREE.MeshPhongMaterial();
          const mesh = new THREE.Mesh(geometry, material);

          mesh.name = objData.name;
          mesh.position.copy(objData.position);
          mesh.rotation.copy(objData.rotation);
          mesh.scale.copy(objData.scale);
          mesh.visible = objData.visible;
          mesh.castShadow = objData.castShadow;
          mesh.receiveShadow = objData.receiveShadow;
          mesh.uuid = objData.uuid;
          mesh.userData.geometryParams = objData.geometryParams;

          this.scene.add(mesh);
          this.objects.push(mesh);
        });

        // Restore selection
        this.selectedObject = null;
        if (state.selectedObjectUuid) {
          const selectedObj = this.objects.find((obj) => obj.uuid === state.selectedObjectUuid);
          if (selectedObj) {
            this.selectObject(selectedObj);
          }
        }
        this.updateSceneGraph();
      }

      // Primitive creation methods
      addBox() {
        const THREE = require('three');
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = `Box_${this.objects.length + 1}`;
        mesh.uuid = `box-uuid-${Date.now()}`;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        this.scene.add(mesh);
        this.objects.push(mesh);
        this.selectObject(mesh);
        this.updateSceneGraph();
        this.saveState('Add Box');
        return mesh;
      }

      addSphere() {
        const THREE = require('three');
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = `Sphere_${this.objects.length + 1}`;
        mesh.uuid = `sphere-uuid-${Date.now()}`;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        this.scene.add(mesh);
        this.objects.push(mesh);
        this.selectObject(mesh);
        this.updateSceneGraph();
        this.saveState('Add Sphere');
        return mesh;
      }

      duplicateSelectedObject() {
        if (this.selectedObject) {
          const THREE = require('three');
          const geometry = this.selectedObject.geometry.clone();
          const material = this.selectedObject.material.clone();
          const mesh = new THREE.Mesh(geometry, material);

          mesh.position.copy(this.selectedObject.position);
          mesh.rotation.copy(this.selectedObject.rotation);
          mesh.scale.copy(this.selectedObject.scale);
          mesh.position.x += 1;

          mesh.name = `${this.selectedObject.name}_copy`;
          mesh.uuid = `copy-uuid-${Date.now()}`;
          mesh.castShadow = this.selectedObject.castShadow;
          mesh.receiveShadow = this.selectedObject.receiveShadow;

          this.scene.add(mesh);
          this.objects.push(mesh);
          this.selectObject(mesh);
          this.updateSceneGraph();
          this.saveState('Duplicate object');
          return mesh;
        }
        return null;
      }
    }

    app = new IntegratedApp();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Complete Object Lifecycle', () => {
    it('should handle full create, select, modify, delete workflow', () => {
      // Step 1: Create object
      const box = app.addBox();
      expect(app.objects.length).toBe(1);
      expect(app.selectedObject.name).toEqual(box.name);
      expect(app.history.length).toBe(2); // Initial + Add Box

      // Step 2: Modify properties (simulate)
      box.position.x = 5;
      app.saveState('Move object');
      expect(app.history.length).toBe(3);

      // Step 3: Create another object
      const sphere = app.addSphere();
      expect(app.objects.length).toBe(2);
      expect(app.selectedObject.name).toEqual(sphere.name);

      // Step 4: Delete object
      app.deleteObject(box);
      expect(app.objects.length).toBe(1);
      expect(app.objects).not.toContain(box);
      expect(app.selectedObject).toEqual(sphere); // Should remain selected
    });

    it('should maintain data consistency across all systems', () => {
      const box = app.addBox();

      // Verify object exists in all systems
      expect(app.objects).toContain(box);
      expect(app.scene.add).toHaveBeenCalledWith(box);
      expect(app.selectedObject.name).toEqual(box.name);
      expect(app.propertiesFolder.open).toHaveBeenCalled(); // Properties panel updated

      // Verify history state contains object
      const currentState = app.history[app.historyIndex];
      expect(currentState.objects.length).toBe(1);
      expect(currentState.objects[0].name).toBe(box.name);
    });
  });

  describe('Undo/Redo with UI Integration', () => {
    it('should undo object creation and update all UI components', () => {
      const initialCount = app.objects.length;
      const box = app.addBox();

      expect(app.objects.length).toBe(initialCount + 1);
      expect(app.selectedObject.name).toEqual(box.name);

      // Undo creation
      app.undo();

      expect(app.objects.length).toBe(initialCount);
      expect(app.selectedObject).toBeNull();
      expect(app.propertiesFolder.close).toHaveBeenCalled(); // Properties panel cleared
    });

    it('should redo object creation and restore all states', () => {
      const box = app.addBox();
      const boxName = box.name;

      app.undo(); // Remove object
      expect(app.objects.length).toBe(0);

      app.redo(); // Restore object
      expect(app.objects.length).toBe(1);
      expect(app.objects[0].name).toBe(boxName);
      expect(app.selectedObject).toBe(app.objects[0]);
    });

    it('should handle complex undo/redo scenarios with multiple objects', () => {
      const box = app.addBox();
      const sphere = app.addSphere();

      expect(app.objects.length).toBe(2);
      expect(app.selectedObject.name).toEqual(sphere.name);

      // Undo sphere creation
      app.undo();
      expect(app.objects.length).toBe(1);
      expect(app.selectedObject.name).toEqual(box.name);

      // Undo box creation
      app.undo();
      expect(app.objects.length).toBe(0);
      expect(app.selectedObject).toBeNull();

      // Redo box creation
      app.redo();
      expect(app.objects.length).toBe(1);
      expect(app.selectedObject).toBe(app.objects[0]);

      // Redo sphere creation
      app.redo();
      expect(app.objects.length).toBe(2);
      expect(app.selectedObject).toBe(app.objects[1]);
    });
  });

  describe('Scene Graph and Property Panel Integration', () => {
    it('should update property panel when object is selected from scene graph', () => {
      const box = app.addBox();
      app.deselectObject(); // Clear selection

      expect(app.selectedObject).toBeNull();

      // Simulate clicking object in scene graph
      app.selectObject(box);

      expect(app.selectedObject.name).toEqual(box.name);
      expect(mockFolder.add).toHaveBeenCalled();
      expect(mockFolder.addFolder).toHaveBeenCalledWith('Position');
      expect(mockFolder.open).toHaveBeenCalled();
    });

    it('should clear property panel when object is deleted from scene graph', () => {
      const box = app.addBox();
      expect(app.selectedObject.name).toEqual(box.name);

      // Delete object (simulating scene graph delete button)
      app.deleteObject(box);

      expect(app.selectedObject).toBeNull();
      expect(mockFolder.close).toHaveBeenCalled();
      expect(mockFolder.__controllers.length).toBe(0);
      expect(mockFolder.__folders.length).toBe(0);
    });

    it('should update scene graph when objects are added or removed', () => {
      const updateSpy = jest.spyOn(app, 'updateSceneGraph');

      app.addBox();
      expect(updateSpy).toHaveBeenCalled();

      app.addSphere();
      expect(updateSpy).toHaveBeenCalled();

      app.deleteObject(app.objects[0]);
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  describe('Object Duplication Workflow', () => {
    it('should duplicate object with all properties and integrate with all systems', () => {
      const originalBox = app.addBox();
      originalBox.position.x = 3;
      originalBox.name = 'CustomBox';

      const duplicatedBox = app.duplicateSelectedObject();

      // Verify duplication
      expect(duplicatedBox).toBeDefined();
      expect(duplicatedBox.name).toBe('CustomBox_copy');
      expect(duplicatedBox.position.x).toBe(4); // Original + 1 offset
      expect(app.objects.length).toBe(2);
      expect(app.selectedObject).toBe(duplicatedBox);

      // Verify history saved
      expect(app.history[app.historyIndex].description).toBe('Duplicate object');

      // Verify scene graph updated
      expect(app.objects).toContain(originalBox);
      expect(app.objects).toContain(duplicatedBox);
    });

    it('should handle duplication when no object is selected', () => {
      app.deselectObject();

      const duplicated = app.duplicateSelectedObject();

      expect(duplicated).toBeNull();
      expect(app.objects.length).toBe(0);
    });
  });

  describe('Multi-Object Selection and Management', () => {
    it('should handle selection changes between multiple objects', () => {
      const box = app.addBox();
      const sphere = app.addSphere();

      expect(app.selectedObject.name).toEqual(sphere.name);

      // Select box
      app.selectObject(box);
      expect(app.selectedObject.name).toEqual(box.name);
      expect(mockFolder.add).toHaveBeenCalledWith({ name: box.name }, 'name');

      // Select sphere
      app.selectObject(sphere);
      expect(app.selectedObject.name).toEqual(sphere.name);
      expect(mockFolder.add).toHaveBeenCalledWith({ name: sphere.name }, 'name');
    });

    it('should maintain correct selection state through undo/redo operations', () => {
      const box = app.addBox();
      const sphere = app.addSphere();

      expect(app.selectedObject.name).toEqual(sphere.name);

      // Undo sphere creation - should select box
      app.undo();
      expect(app.selectedObject.name).toEqual(box.name);

      // Undo box creation - should have no selection
      app.undo();
      expect(app.selectedObject).toBeNull();

      // Redo box creation - should select box
      app.redo();
      expect(app.selectedObject).toBe(app.objects[0]);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle deleting non-existent objects gracefully', () => {
      const THREE = require('three');
      const fakeObject = new THREE.Mesh();

      expect(() => {
        app.deleteObject(fakeObject);
      }).not.toThrow();

      expect(app.objects.length).toBe(0);
    });

    it('should handle undo/redo at history boundaries', () => {
      // At beginning of history
      expect(app.undo()).toBe(false);

      app.addBox();

      // At end of history
      expect(app.redo()).toBe(false);
    });

    it('should handle property panel updates for objects without properties', () => {
      const mockObject = {
        name: null,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        material: { color: { getHex: () => 0x000000 } },
        geometry: { type: 'UnknownGeometry' },
        userData: {},
      };

      expect(() => {
        app.updatePropertiesPanel(mockObject);
      }).not.toThrow();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should properly dispose of geometry and materials during undo operations', () => {
      const box = app.addBox();
      const geometryDisposeSpy = jest.spyOn(box.geometry, 'dispose');
      const materialDisposeSpy = jest.spyOn(box.material, 'dispose');

      app.undo(); // This should trigger disposal

      expect(geometryDisposeSpy).toHaveBeenCalled();
      expect(materialDisposeSpy).toHaveBeenCalled();
    });

    it('should limit history size to prevent memory leaks', () => {
      app.maxHistorySize = 3;

      // Add more states than the limit
      app.addBox();
      app.addSphere();
      app.addBox();
      app.addSphere();

      expect(app.history.length).toBeLessThanOrEqual(3);
    });
  });
});
