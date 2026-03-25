import * as THREE from 'three';
import { LightManager } from '../src/frontend/LightManager.js';
import EventBus from '../src/frontend/EventBus.js';

// Mock Three.js
jest.mock('three', () => {
    const originalThree = jest.requireActual('three');
    return {
        ...originalThree,
        Scene: jest.fn(() => ({
            add: jest.fn(function(obj) { this.children = this.children || []; this.children.push(obj); }),
            remove: jest.fn(function(obj) { this.children = this.children || []; this.children = this.children.filter(c => c !== obj); }),
            children: []
        })),
        PointLight: jest.fn((color, intensity) => ({
            isPointLight: true,
            color: { getHex: () => color, set: (c) => { color = c; } },
            intensity: intensity,
            position: { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; }, clone: function() { return { ...this }; } },
            name: ''
        })),
        DirectionalLight: jest.fn((color, intensity) => ({
            isDirectionalLight: true,
            color: { getHex: () => color, set: (c) => { color = c; } },
            intensity: intensity,
            position: { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }, normalize: jest.fn(), clone: function() { return { ...this }; } },
            name: ''
        })),
        AmbientLight: jest.fn((color, intensity) => ({
            isAmbientLight: true,
            color: { getHex: () => color, set: (c) => { color = c; } },
            intensity: intensity,
            position: { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; }, clone: function() { return { ...this }; } },
            name: ''
        })),
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
        FrontSide: 0
    };
});

describe('LightManager', () => {
  let scene;
  let lightManager;
  let eventBus;

  beforeEach(() => {
    const { Scene } = require('three');
    scene = new Scene();
    eventBus = EventBus;
    lightManager = new LightManager(scene, eventBus);
  });

  it('should add a PointLight to the scene', () => {
    const light = lightManager.addLight('PointLight', 0xff0000, 1, { x: 1, y: 2, z: 3 });
    expect(scene.children).toContain(light);
    expect(light.isPointLight).toBe(true);
  });

  it('should add a DirectionalLight to the scene', () => {
    const light = lightManager.addLight('DirectionalLight', 0x00ff00, 0.5);
    expect(scene.children).toContain(light);
    expect(light.isDirectionalLight).toBe(true);
  });

  it('should add an AmbientLight to the scene', () => {
    const light = lightManager.addLight('AmbientLight', 0x0000ff, 0.8);
    expect(scene.children).toContain(light);
    expect(light.isAmbientLight).toBe(true);
  });

  it('should remove a specified light from the scene', () => {
    const light = lightManager.addLight('PointLight', 0xffffff, 1);
    expect(scene.children).toContain(light);
    lightManager.removeLight(light);
    expect(scene.children).not.toContain(light);
  });

  it("should update a light's color property", () => {
    const light = lightManager.addLight('PointLight', 0xffffff, 1);
    const newColor = 0x123456;
    lightManager.updateLight(light, { color: newColor });
    expect(light.color.getHex()).toBe(newColor);
  });

  it("should update a light's intensity property", () => {
    const light = lightManager.addLight('PointLight', 0xffffff, 1);
    const newIntensity = 0.75;
    lightManager.updateLight(light, { intensity: newIntensity });
    expect(light.intensity).toBe(newIntensity);
  });

  it("should update a light's position property", () => {
    const light = lightManager.addLight('PointLight', 0xffffff, 1);
    const newPosition = { x: 10, y: 20, z: 30 };
    lightManager.updateLight(light, { position: newPosition });
    expect(light.position.x).toBe(newPosition.x);
    expect(light.position.y).toBe(newPosition.y);
    expect(light.position.z).toBe(newPosition.z);
  });

  it('should successfully change the type of an existing light', () => {
    const oldLight = lightManager.addLight('PointLight', 0xffffff, 1, { x: 1, y: 2, z: 3 });
    const newLight = lightManager.changeLightType(oldLight, 'DirectionalLight');

    expect(scene.children).not.toContain(oldLight);
    expect(scene.children).toContain(newLight);
    expect(newLight.isDirectionalLight).toBe(true);
    expect(newLight.color.getHex()).toBe(oldLight.color.getHex());
    expect(newLight.intensity).toBe(oldLight.intensity);
    expect(newLight.position.x).toBe(oldLight.position.x);
    expect(newLight.position.y).toBe(oldLight.position.y);
    expect(newLight.position.z).toBe(oldLight.position.z);
  });

  it('should assign a default name to a new light if no name is provided', () => {
    const light = lightManager.addLight('PointLight', 0xffffff, 1);
    expect(light.name).toBe('PointLight');
  });

  it('should not throw an error when attempting to remove a light that is not in the scene', () => {
    const nonExistentLight = { uuid: 'non-existent-light' };
    expect(() => {
      lightManager.removeLight(nonExistentLight);
    }).not.toThrow();
  });

  it('should preserve light properties (color, intensity) when changing light type', () => {
    const oldLight = lightManager.addLight('PointLight', 0xabcdef, 0.7, { x: 5, y: 6, z: 7 });
    const newLight = lightManager.changeLightType(oldLight, 'DirectionalLight');

    expect(newLight.color.getHex()).toBe(0xabcdef);
    expect(newLight.intensity).toBe(0.7);
    expect(newLight.position.x).toBe(5);
    expect(newLight.position.y).toBe(6);
    expect(newLight.position.z).toBe(7);
  });

  it('should handle updating a light with an invalid or non-existent property', () => {
    const light = lightManager.addLight('PointLight', 0xffffff, 1);
    expect(() => {
      lightManager.updateLight(light, { nonExistentProperty: 'someValue' });
    }).not.toThrow();
  });

  it('should allow updating ambient light position without error, even if it has no effect', () => {
    const ambientLight = lightManager.addLight('AmbientLight', 0xffffff, 1);
    // AmbientLight technically has a position (inherits from Object3D), even if it doesn't affect rendering.
    // We verify that updating it doesn't throw.
    expect(() => {
      lightManager.updateLight(ambientLight, { position: { x: 10, y: 10, z: 10 } });
    }).not.toThrow();
    expect(ambientLight.position).toBeDefined();
    expect(ambientLight.position.x).toBe(10);
  });
});
