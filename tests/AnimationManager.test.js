import { AnimationManager } from '../src/frontend/AnimationManager.js';
import * as THREE from 'three';

describe('AnimationManager', () => {
  let animationManager;
  let mockObject;

  beforeEach(() => {
    animationManager = new AnimationManager();
    mockObject = new THREE.Object3D();
    mockObject.name = 'testObject';
  });

  it('should add a keyframe for a property', () => {
    animationManager.addKeyframe(mockObject.uuid, 'position.x', 0, 0); // time 0, value 0
    animationManager.addKeyframe(mockObject.uuid, 'position.x', 1, 10); // time 1, value 10
    
    const keyframes = animationManager.getKeyframes(mockObject.uuid, 'position.x');
    expect(keyframes).toHaveLength(2);
    expect(keyframes[0].time).toBe(0);
    expect(keyframes[0].value).toBe(0);
  });

  it('should interpolate values between keyframes', () => {
    animationManager.addKeyframe(mockObject.uuid, 'position.x', 0, 0);
    animationManager.addKeyframe(mockObject.uuid, 'position.x', 1, 10);
    
    const valueAtMidPoint = animationManager.getValueAtTime(mockObject.uuid, 'position.x', 0.5);
    expect(valueAtMidPoint).toBe(5);
  });

  it('should manage playback state', () => {
    expect(animationManager.isPlaying).toBe(false);
    animationManager.play();
    expect(animationManager.isPlaying).toBe(true);
    animationManager.pause();
    expect(animationManager.isPlaying).toBe(false);
  });

  it('should seek to a specific time', () => {
    animationManager.seek(0.5);
    expect(animationManager.currentTime).toBe(0.5);
  });

  it('should update object properties based on current time', () => {
    animationManager.addKeyframe(mockObject.uuid, 'position.x', 0, 0);
    animationManager.addKeyframe(mockObject.uuid, 'position.x', 1, 10);
    
    animationManager.seek(0.5);
    animationManager.updateObject(mockObject);
    
    expect(mockObject.position.x).toBe(5);
  });

  it('should update an existing keyframe', () => {
    animationManager.addKeyframe(mockObject.uuid, 'position.x', 0, 0);
    animationManager.addKeyframe(mockObject.uuid, 'position.x', 0, 5);
    
    const keyframes = animationManager.getKeyframes(mockObject.uuid, 'position.x');
    expect(keyframes).toHaveLength(1);
    expect(keyframes[0].value).toBe(5);
  });

  it('should return the single keyframe value', () => {
    animationManager.addKeyframe(mockObject.uuid, 'position.x', 0, 10);
    const valueAtAnyTime = animationManager.getValueAtTime(mockObject.uuid, 'position.x', 1);
    expect(valueAtAnyTime).toBe(10);
  });

  it('should handle invalid property paths gracefully', () => {
    animationManager.addKeyframe(mockObject.uuid, 'nonExistent.property', 0, 10);
    animationManager.seek(0);
    animationManager.updateObject(mockObject);
    // Should not throw, should just return early in _setProperty
  });

  it('should return the last keyframe value if time is beyond last frame', () => {
    animationManager.addKeyframe(mockObject.uuid, 'position.x', 0, 0);
    animationManager.addKeyframe(mockObject.uuid, 'position.x', 1, 10);
    const value = animationManager.getValueAtTime(mockObject.uuid, 'position.x', 2);
    expect(value).toBe(10);
  });

  it('should advance currentTime and update objects when playing', () => {
    const scene = new THREE.Scene();
    scene.add(mockObject);
    
    animationManager.addKeyframe(mockObject.uuid, 'position.x', 0, 0);
    animationManager.addKeyframe(mockObject.uuid, 'position.x', 1, 10);
    
    animationManager.play();
    animationManager.update(0.5, scene);
    
    expect(animationManager.currentTime).toBe(0.5);
    expect(mockObject.position.x).toBe(5);
  });
});
