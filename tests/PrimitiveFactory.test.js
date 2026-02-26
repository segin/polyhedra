
/**
 * @jest-environment node
 */
import { PrimitiveFactory } from '../src/frontend/PrimitiveFactory.js';

// Mock Dependencies
jest.mock('three', () => ({
  MeshPhongMaterial: jest.fn(),
  Mesh: jest.fn(() => ({ userData: {}, castShadow: false, receiveShadow: false, position: { set: jest.fn() }, add: jest.fn() })),
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
  LatheGeometry: jest.fn(),
  Group: class { constructor() { this.add = jest.fn(); this.position = { set: jest.fn() }; } },
  Vector2: jest.fn(),
  Vector3: jest.fn(),
  FrontSide: 'FrontSide',
  DoubleSide: 'DoubleSide',
}));

// jest.mock calls for three/examples/jsm/... removed as they are handled by moduleNameMapper
jest.mock('../src/frontend/logger.js', () => ({
  default: {
      error: jest.fn(),
      info: jest.fn()
  }
}));

import * as MockExamples from './__mocks__/three-examples.js';
console.log('Mock Exports:', MockExamples);

describe('PrimitiveFactory Normalization', () => {
  let factory;

  beforeEach(() => {
    factory = new PrimitiveFactory();
  });

  test('normalizes Box parameters', () => {
    const params = factory._getNormalizedParameters('Box', { width: 10, color: 'red', extra: 123 });
    expect(params).toEqual({ width: 10, height: 1, depth: 1 });
    expect(params.color).toBeUndefined();
  });

  test('normalizes Sphere parameters', () => {
    const params = factory._getNormalizedParameters('Sphere', { radius: 5 });
    expect(params).toEqual({ radius: 5, widthSegments: 32, heightSegments: 32 });
  });

  test('normalizes Text parameters', () => {
    const params = factory._getNormalizedParameters('Text', { text: 'Hello', size: 2, bevelEnabled: false });
    expect(params).toEqual({
      text: 'Hello',
      size: 2,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: false, // Should be false
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5
    });
  });

  test('normalizes Text parameters with defaults', () => {
    const params = factory._getNormalizedParameters('Text', {});
    expect(params.text).toBe('nodist3d');
    expect(params.bevelEnabled).toBe(true);
  });

  test('caching uses normalized parameters', () => {
    // We can spy on _getNormalizedParameters or just check the cache key if we could access it.
    // Since geometryCache is public (in constructor), we can check it.

    // Call _getCachedGeometry
    factory._getCachedGeometry('Box', { width: 1, color: 'red' });
    const keys1 = Object.keys(factory.geometryCache);
    expect(keys1.length).toBe(1);

    // Call again with different color but same dims
    factory._getCachedGeometry('Box', { width: 1, color: 'blue' });
    const keys2 = Object.keys(factory.geometryCache);
    expect(keys2.length).toBe(1);
    expect(keys2[0]).toBe(keys1[0]);

    // Call with different dims
    factory._getCachedGeometry('Box', { width: 2 });
    const keys3 = Object.keys(factory.geometryCache);
    expect(keys3.length).toBe(2);
  });

});
