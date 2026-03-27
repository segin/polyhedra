
/**
 * @jest-environment node
 */
import { PrimitiveFactory } from '../src/frontend/PrimitiveFactory.js';
import * as THREE from 'three';

// Mock Dependencies
jest.mock('three', () => {
  const actual = jest.requireActual('three');
  return {
    ...actual,
    MeshStandardMaterial: jest.fn(),
    Mesh: jest.fn((geo, mat) => ({ 
        geometry: geo, 
        material: mat, 
        userData: {}, 
        castShadow: false, 
        receiveShadow: false, 
        position: { set: jest.fn() }, 
        add: jest.fn(),
        children: []
    })),
    BoxGeometry: jest.fn(),
    SphereGeometry: jest.fn(),
    CylinderGeometry: jest.fn(),
    TorusGeometry: jest.fn(),
    PlaneGeometry: jest.fn(),
    LatheGeometry: jest.fn(),
    TubeGeometry: jest.fn(),
    ExtrudeGeometry: jest.fn(),
    Group: class { 
        constructor() { 
            this.add = jest.fn((child) => this.children.push(child)); 
            this.position = { set: jest.fn() }; 
            this.children = [];
            this.userData = {};
        } 
    },
  };
});

jest.mock('../src/frontend/logger.js', () => ({
  default: {
      error: jest.fn(),
      info: jest.fn()
  }
}));

import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry.js';

// ... (rest of imports)

describe('Specialized Geometry Caching', () => {
  let factory;

  beforeEach(() => {
    factory = new PrimitiveFactory();
    // Clear mocks
    THREE.TubeGeometry.mockClear();
    THREE.ExtrudeGeometry.mockClear();
    TeapotGeometry.mockClear();
  });

  test('Tube geometry should be cached and reused', async () => {
    const options = { radius: 0.5 };
    const mesh1 = await factory.createPrimitive('Tube', options);
    const mesh2 = await factory.createPrimitive('Tube', options);

    expect(THREE.TubeGeometry).toHaveBeenCalledTimes(1);
    expect(mesh1.geometry).toBe(mesh2.geometry);
  });

  test('Extrude geometry should be cached and reused', async () => {
    const options = { depth: 1 };
    const mesh1 = await factory.createPrimitive('Extrude', options);
    const mesh2 = await factory.createPrimitive('Extrude', options);

    expect(THREE.ExtrudeGeometry).toHaveBeenCalledTimes(1);
    expect(mesh1.geometry).toBe(mesh2.geometry);
  });

  test('Teapot geometry should be cached and reused', async () => {
    const options = { size: 0.5 };
    const mesh1 = await factory.createPrimitive('Teapot', options);
    const mesh2 = await factory.createPrimitive('Teapot', options);

    expect(TeapotGeometry).toHaveBeenCalledTimes(1);
    expect(mesh1.geometry).toBe(mesh2.geometry);
  });
});
