/* eslint-disable no-undef */
import { jest } from "@jest/globals";
import { ModelLoader } from "../src/frontend/ModelLoader.js";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Mock log to avoid console spam
jest.mock("../src/frontend/logger.js", () => ({
  error: jest.fn(),
  log: jest.fn(),
}));

describe("ModelLoader Memory Leak", () => {
  let modelLoader;
  let scene;
  let eventBus;

  beforeEach(() => {
    scene = new THREE.Scene();
    eventBus = { publish: jest.fn() };

    // Ensure prototypes are spyable
    if (!OBJLoader.prototype.load) OBJLoader.prototype.load = jest.fn();
    if (!GLTFLoader.prototype.load) GLTFLoader.prototype.load = jest.fn();

    modelLoader = new ModelLoader(scene, eventBus);

    global.URL.createObjectURL = jest.fn(() => "blob:test");
    global.URL.revokeObjectURL = jest.fn();

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should revoke URL when loading fails (OBJ)", async () => {
    // Mock failure
    const spy = jest
      .spyOn(OBJLoader.prototype, "load")
      .mockImplementation((url, onLoad, onProgress, onError) => {
        if (onError) onError(new Error("Load failed"));
      });

    const file = new File([""], "test.obj", { type: "text/plain" });

    await expect(modelLoader.loadModel(file)).rejects.toThrow("Load failed");

    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:test");
    spy.mockRestore();
  });

  it("should revoke URL when loading fails (GLTF)", async () => {
    const spy = jest
      .spyOn(GLTFLoader.prototype, "load")
      .mockImplementation((url, onLoad, onProgress, onError) => {
        if (onError) onError(new Error("Load failed"));
      });

    const file = new File([""], "test.glb", { type: "model/gltf-binary" });

    await expect(modelLoader.loadModel(file)).rejects.toThrow("Load failed");
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:test");
    spy.mockRestore();
  });

  it("should revoke URL when file type is unsupported", async () => {
    const file = new File([""], "test.txt", { type: "text/plain" });

    await expect(modelLoader.loadModel(file)).rejects.toThrow(
      "Unsupported file format",
    );
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:test");
  });
});
