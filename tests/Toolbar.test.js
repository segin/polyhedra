import { jest } from '@jest/globals';
import { App } from '../src/frontend/main.js';

// Mocks for dependencies to allow App import
jest.mock('three', () => ({
  Scene: jest.fn(),
  PerspectiveCamera: jest.fn(),
  WebGLRenderer: jest.fn(),
  AmbientLight: jest.fn(),
  DirectionalLight: jest.fn(),
  GridHelper: jest.fn(),
  AxesHelper: jest.fn(),
  Vector2: jest.fn(),
  Raycaster: jest.fn(),
  BoxGeometry: jest.fn(),
  SphereGeometry: jest.fn(),
  CylinderGeometry: jest.fn(),
  ConeGeometry: jest.fn(),
  TorusGeometry: jest.fn(),
  TorusKnotGeometry: jest.fn(),
  TetrahedronGeometry: jest.fn(),
  IcosahedronGeometry: jest.fn(),
  DodecahedronGeometry: jest.fn(),
  OctahedronGeometry: jest.fn(),
  PlaneGeometry: jest.fn(),
  TubeGeometry: jest.fn(),
  MeshLambertMaterial: jest.fn(),
  Mesh: jest.fn(),
  Group: jest.fn(),
  CatmullRomCurve3: jest.fn(),
  WebGLRenderTarget: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    clone: jest.fn(),
    dispose: jest.fn(),
    texture: {}
  })),
  BufferGeometry: jest.fn().mockImplementation(() => ({
    dispose: jest.fn(),
    setAttribute: jest.fn(),
    getAttribute: jest.fn()
  })),
  Float32BufferAttribute: jest.fn(),
  Uint32BufferAttribute: jest.fn(),
  OrthographicCamera: jest.fn().mockImplementation(() => ({
    position: { clone: jest.fn(), copy: jest.fn() },
    updateProjectionMatrix: jest.fn()
  })),
  ShaderMaterial: jest.fn(),
  PCFSoftShadowMap: 2,
  DoubleSide: 2,
  FrontSide: 0,
}));

jest.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: jest.fn(),
}));

jest.mock('three/examples/jsm/controls/TransformControls.js', () => ({
  TransformControls: jest.fn(),
}));

jest.mock('three/examples/jsm/geometries/TeapotGeometry.js', () => ({
  TeapotGeometry: jest.fn(),
}));

jest.mock('three/examples/jsm/loaders/FontLoader.js', () => ({
  FontLoader: jest.fn(),
}));

jest.mock('three/examples/jsm/geometries/TextGeometry.js', () => ({
  TextGeometry: jest.fn(),
}));

jest.mock('dat.gui', () => ({
  GUI: jest.fn(),
}));

// Mock internal modules
jest.mock('../src/frontend/SceneStorage.js');
jest.mock('../src/frontend/utils/ServiceContainer.js');
jest.mock('../src/frontend/StateManager.js');
jest.mock('../src/frontend/EventBus.js');
jest.mock('../src/frontend/ObjectManager.js');
jest.mock('../src/frontend/SceneManager.js');
jest.mock('../src/frontend/InputManager.js');
jest.mock('../src/frontend/PhysicsManager.js');
jest.mock('../src/frontend/PrimitiveFactory.js');
jest.mock('../src/frontend/ObjectFactory.js');
jest.mock('../src/frontend/ObjectPropertyUpdater.js');
jest.mock('../src/frontend/ToastManager.js');

describe('Toolbar', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="toolbar"></div>';
  });

  test('setupToolbar creates buttons correctly', () => {
    // Create a mock app object with the necessary methods/properties
    const mockApp = {
      transformControls: { setMode: jest.fn() },
      undo: jest.fn(),
      redo: jest.fn(),
      deleteSelectedObject: jest.fn(),
      setupToolbar: App.prototype.setupToolbar,
    };

    // Run the method
    mockApp.setupToolbar();

    // Verify buttons exist
    const ui = document.getElementById('toolbar');
    expect(ui.querySelectorAll('button').length).toBe(7);

    const translateBtn = document.getElementById('translate-btn');
    expect(translateBtn).not.toBeNull();
    expect(translateBtn.getAttribute('aria-label')).toContain('Translate');
    expect(translateBtn.title).toContain('(G)');

    const rotateBtn = document.getElementById('rotate-btn');
    expect(rotateBtn).not.toBeNull();

    const scaleBtn = document.getElementById('scale-btn');
    expect(scaleBtn).not.toBeNull();

    const undoBtn = document.getElementById('undo-btn');
    expect(undoBtn).not.toBeNull();

    const redoBtn = document.getElementById('redo-btn');
    expect(redoBtn).not.toBeNull();

    const deleteBtn = document.getElementById('delete-btn');
    expect(deleteBtn).not.toBeNull();

    const saveImageBtn = document.getElementById('save-image-btn');
    expect(saveImageBtn).not.toBeNull();
  });

  test('clicking export buttons triggers actions', () => {
    const mockApp = {
      transformControls: { setMode: jest.fn() },
      exportManager: { saveImage: jest.fn() },
      setupToolbar: App.prototype.setupToolbar,
    };

    mockApp.setupToolbar();

    document.getElementById('save-image-btn').click();
    expect(mockApp.exportManager.saveImage).toHaveBeenCalled();
  });

  test('clicking buttons triggers actions and updates state', () => {
    const mockApp = {
      transformControls: { setMode: jest.fn() },
      undo: jest.fn(),
      redo: jest.fn(),
      deleteSelectedObject: jest.fn(),
      setupToolbar: App.prototype.setupToolbar,
    };

    mockApp.setupToolbar();

    const translateBtn = document.getElementById('translate-btn');
    const rotateBtn = document.getElementById('rotate-btn');

    // Test Translate click
    translateBtn.click();
    expect(mockApp.transformControls.setMode).toHaveBeenCalledWith('translate');
    expect(translateBtn.classList.contains('active')).toBe(true);
    expect(rotateBtn.classList.contains('active')).toBe(false);

    // Test Rotate click
    rotateBtn.click();
    expect(mockApp.transformControls.setMode).toHaveBeenCalledWith('rotate');
    expect(rotateBtn.classList.contains('active')).toBe(true);
    expect(translateBtn.classList.contains('active')).toBe(false);
  });

  test('edit operations trigger respective methods', () => {
    const mockApp = {
      transformControls: { setMode: jest.fn() },
      undo: jest.fn(),
      redo: jest.fn(),
      deleteSelectedObject: jest.fn(),
      setupToolbar: App.prototype.setupToolbar,
    };

    mockApp.setupToolbar();

    document.getElementById('undo-btn').click();
    expect(mockApp.undo).toHaveBeenCalled();

    document.getElementById('redo-btn').click();
    expect(mockApp.redo).toHaveBeenCalled();

    document.getElementById('delete-btn').click();
    expect(mockApp.deleteSelectedObject).toHaveBeenCalled();
  });
});
