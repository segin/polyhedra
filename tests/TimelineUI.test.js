import { TimelineUI } from '../src/frontend/TimelineUI.js';
import { AnimationManager } from '../src/frontend/AnimationManager.js';
import EventBus from '../src/frontend/EventBus.js';

/* global Event */

describe('TimelineUI', () => {
  let timelineUI;
  let animationManager;
  let uiContainer;

  beforeEach(() => {
    uiContainer = document.createElement('div');
    uiContainer.id = 'ui';
    document.body.appendChild(uiContainer);

    animationManager = new AnimationManager();
    timelineUI = new TimelineUI(uiContainer, animationManager, EventBus);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should create a timeline slider', () => {
    const slider = uiContainer.querySelector('input[type="range"]');
    expect(slider).not.toBeNull();
  });

  it('should update animationManager time when scrubbing', () => {
    const slider = uiContainer.querySelector('input[type="range"]');
    slider.value = 5;
    slider.dispatchEvent(new Event('input'));
    expect(animationManager.currentTime).toBe(5);
  });

  it('should play/pause animation', () => {
    const playBtn = uiContainer.querySelector('.play-pause-btn');
    expect(playBtn).not.toBeNull();
    
    playBtn.click();
    expect(animationManager.isPlaying).toBe(true);
    
    playBtn.click();
    expect(animationManager.isPlaying).toBe(false);
  });

  it('should add a keyframe via UI', () => {
    const addKeyframeBtn = uiContainer.querySelector('.add-keyframe-btn');
    expect(addKeyframeBtn).not.toBeNull();
    
    // Mock selected object
    const mockObject = { uuid: 'test-uuid', position: { x: 10, y: 0, z: 0 } };
    timelineUI.setSelectedObject(mockObject);
    
    animationManager.seek(2);
    addKeyframeBtn.click();
    
    const keyframes = animationManager.getKeyframes(mockObject.uuid, 'position.x');
    expect(keyframes.length).toBeGreaterThan(0);
    expect(keyframes[0].time).toBe(2);
    expect(keyframes[0].value).toBe(10);
  });

  it('should toggle recording via ExportManager', () => {
    const mockExportManager = {
      isRecording: false,
      startRecording: jest.fn(function() { this.isRecording = true; }),
      stopRecording: jest.fn(function() { this.isRecording = false; })
    };
    
    // Clear container from beforeEach
    uiContainer.innerHTML = '';
    
    // Re-instantiate with mock export manager
    timelineUI = new TimelineUI(uiContainer, animationManager, EventBus, mockExportManager);
    
    const recordBtn = uiContainer.querySelector('.record-btn');
    expect(recordBtn).not.toBeNull();
    
    recordBtn.click();
    expect(mockExportManager.startRecording).toHaveBeenCalled();
    expect(recordBtn.textContent).toBe('STOP');
    
    recordBtn.click();
    expect(mockExportManager.stopRecording).toHaveBeenCalled();
    expect(recordBtn.textContent).toBe('REC');
  });
});
