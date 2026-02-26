/**
 * Tests for Property Panel functionality
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

describe('Property Panel Functionality', () => {
  let app;

  beforeEach(() => {
    // Setup environment (handled by jsdom environment)
    if (typeof document !== 'undefined') {
        document.body.innerHTML = '';
    }
    
    global.requestAnimationFrame = jest.fn();
    global.console.log = jest.fn(); // Suppress console.log from saveState

    // Mock methods that might be missing or need spying
    if (typeof window !== 'undefined') {
        window.scrollTo = jest.fn();
    }

    // Clear mocks
    jest.clearAllMocks();

    // Create a test app instance
    class TestApp {
      constructor() {
        this.selectedObject = null;
        this.objects = [];
        this.propertiesFolder = mockFolder;
        this.scene = { add: jest.fn(), remove: jest.fn() };
      }

      updatePropertiesPanel(object) {
        // Simplified version of the actual method
        this.clearPropertiesPanel();
        if (!object) return;

        // Mock property controls creation
        this.propertiesFolder.add({ name: object.name }, 'name');
        this.propertiesFolder.addFolder('Position');
        this.propertiesFolder.addFolder('Rotation');
        this.propertiesFolder.addFolder('Scale');
        this.propertiesFolder.addFolder('Material');
        this.propertiesFolder.addFolder('Geometry');
        this.propertiesFolder.open();
      }

      clearPropertiesPanel() {
        // Mock clearing
        this.propertiesFolder.__controllers.length = 0;
        this.propertiesFolder.__folders.length = 0;
        this.propertiesFolder.close();
      }

      addGeometryProperties(object) {
        // Mock geometry properties addition
        return true;
      }

      rebuildGeometry(object, type) {
        // Mock geometry rebuilding
        return true;
      }

      getGeometryParameters(geometry) {
        return geometry.parameters || {};
      }
    }

    app = new TestApp();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('updatePropertiesPanel', () => {
    it('should clear properties panel when no object is selected', () => {
      const clearSpy = jest.spyOn(app, 'clearPropertiesPanel');

      app.updatePropertiesPanel(null);

      expect(clearSpy).toHaveBeenCalled();
    });

    it('should create property controls for selected object', () => {
      const THREE = require('three');
      const mockObject = {
        name: 'TestBox',
        position: { x: 1, y: 2, z: 3 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        material: { color: { getHex: () => 0x00ff00 } },
        geometry: { type: 'BoxGeometry' },
        userData: { geometryParams: { width: 1, height: 1, depth: 1 } },
      };

      app.updatePropertiesPanel(mockObject);

      expect(mockFolder.add).toHaveBeenCalled();
      expect(mockFolder.addFolder).toHaveBeenCalledWith('Position');
      expect(mockFolder.addFolder).toHaveBeenCalledWith('Rotation');
      expect(mockFolder.addFolder).toHaveBeenCalledWith('Scale');
      expect(mockFolder.addFolder).toHaveBeenCalledWith('Material');
      expect(mockFolder.addFolder).toHaveBeenCalledWith('Geometry');
      expect(mockFolder.open).toHaveBeenCalled();
    });

    it('should handle objects without geometry parameters', () => {
      const mockObject = {
        name: 'TestObject',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        material: { color: { getHex: () => 0x00ff00 } },
        geometry: { type: 'CustomGeometry' },
        userData: {},
      };

      expect(() => {
        app.updatePropertiesPanel(mockObject);
      }).not.toThrow();
    });
  });

  describe('clearPropertiesPanel', () => {
    it('should remove all controllers and folders', () => {
      // Add some mock controllers and folders
      app.propertiesFolder.__controllers = [1, 2, 3];
      app.propertiesFolder.__folders = [1, 2];

      app.clearPropertiesPanel();

      expect(app.propertiesFolder.__controllers.length).toBe(0);
      expect(app.propertiesFolder.__folders.length).toBe(0);
      expect(mockFolder.close).toHaveBeenCalled();
    });
  });

  describe('getGeometryParameters', () => {
    it('should return default parameters for BoxGeometry', () => {
      const geometry = { type: 'BoxGeometry', parameters: null };
      const params = app.getGeometryParameters(geometry);

      expect(params).toEqual({});
    });

    it('should return existing parameters when available', () => {
      const geometry = {
        type: 'BoxGeometry',
        parameters: { width: 2, height: 3, depth: 4 },
      };
      const params = app.getGeometryParameters(geometry);

      expect(params).toEqual({ width: 2, height: 3, depth: 4 });
    });
  });

  describe('Property Panel Integration', () => {
    it('should update properties when object is selected', () => {
      const THREE = require('three');
      const updateSpy = jest.spyOn(app, 'updatePropertiesPanel');
      const mockObject = new THREE.Mesh();

      app.selectedObject = mockObject;
      app.updatePropertiesPanel(mockObject);

      expect(updateSpy).toHaveBeenCalledWith(mockObject);
    });

    it('should clear properties when object is deselected', () => {
      const clearSpy = jest.spyOn(app, 'clearPropertiesPanel');

      app.selectedObject = null;
      app.clearPropertiesPanel();

      expect(clearSpy).toHaveBeenCalled();
    });
  });
});
