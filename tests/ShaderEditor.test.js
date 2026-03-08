import { ShaderEditor } from "../src/frontend/ShaderEditor.js";
import EventBus from "../src/frontend/EventBus.js";

jest.mock("../src/frontend/EventBus.js", () => ({
  __esModule: true,
  default: {
    subscribe: jest.fn(),
    publish: jest.fn(),
  },
}));

// Mock THREE.js
jest.mock("three", () => {
  return {
    ShaderMaterial: jest.fn(() => ({
      vertexShader: "original vertex shader",
      fragmentShader: "original fragment shader",
      uniforms: {
        uColor: { value: { r: 1, g: 0, b: 0 } },
        uTime: { value: 0 },
      },
      needsUpdate: false,
      dispose: jest.fn(),
    })),
    BufferGeometry: jest.fn(() => ({
      setAttribute: jest.fn(),
      dispose: jest.fn(),
    })),
    BoxGeometry: jest.fn(() => ({
      dispose: jest.fn(),
    })),
    Mesh: jest.fn(() => ({
      isMesh: true,
      material: {},
      geometry: { dispose: jest.fn() },
    })),
    WebGLRenderer: jest.fn(() => ({
      domElement: { addEventListener: jest.fn() },
    })),
    Scene: jest.fn(() => ({
      add: jest.fn(),
      remove: jest.fn(),
    })),
    PerspectiveCamera: jest.fn(() => ({
      aspect: 1,
      updateProjectionMatrix: jest.fn(),
    })),
    Color: jest.fn(),
  };
});

// Mock dat.gui
const mockController = {
  name: jest.fn().mockReturnThis(),
  onChange: jest.fn().mockReturnThis(),
  listen: jest.fn().mockReturnThis(),
  setValue: jest.fn(),
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

jest.mock("dat.gui", () => ({
  GUI: jest.fn(() => ({
    addFolder: jest.fn(() => mockFolder),
  })),
}));

describe("ShaderEditor", () => {
  let gui;
  let renderer;
  let scene;
  let camera;
  let shaderEditor;
  let eventBus;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Import GUI and create a mock instance
    const { GUI } = require("dat.gui");
    gui = new GUI();

    const THREE = require("three");
    renderer = new THREE.WebGLRenderer();
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera();
    eventBus = EventBus;
    shaderEditor = new ShaderEditor(gui, renderer, scene, camera, eventBus);
  });

  it('should initialize and create the "Shader Editor" folder in the GUI', () => {
    expect(gui.addFolder).toHaveBeenCalledWith("Shader Editor");
    const editorFolder = gui.addFolder.mock.results[0].value;
    expect(editorFolder.add).toHaveBeenCalledWith(
      expect.any(Object),
      "createShader",
    );
  });

  describe("createShader", () => {
    it("should create a mesh with a ShaderMaterial and add it to the scene", () => {
      const THREE = require("three");
      shaderEditor.createShader();

      expect(THREE.ShaderMaterial).toHaveBeenCalled();
      expect(scene.add).toHaveBeenCalled();
      // const addedMesh = scene.add.mock.calls[0][0];
      // expect(addedMesh.isMesh).toBe(true);
    });

    it("should dispose of the old material and remove the mesh if a shader already exists", () => {
      shaderEditor.createShader();
      const firstMaterial = shaderEditor.shaderMaterial;
      const firstMesh = shaderEditor.shaderMesh;

      shaderEditor.createShader();

      expect(firstMaterial.dispose).toHaveBeenCalled();
      expect(scene.remove).toHaveBeenCalledWith(firstMesh);
    });

    it("should create new shader controls", () => {
      shaderEditor.createShader();
      // The implementation details of how folders are added might vary,
      // but we expect addFolder to be called for uniforms and add/addColor to be called.
      // Based on implementation: editorFolder.addFolder('Uniforms')

      // We can inspect the mock calls to verify
      // gui.addFolder -> editorFolder
      // editorFolder.addFolder -> uniformsFolder

      // Since we reuse mockFolder, it's a bit circular, but we can check calls count
      expect(mockFolder.addFolder).toHaveBeenCalledWith("Uniforms");
      expect(mockFolder.addColor).toHaveBeenCalled();
      expect(mockFolder.add).toHaveBeenCalled();
    });
  });
});
