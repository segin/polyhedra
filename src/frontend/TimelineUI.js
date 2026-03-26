export class TimelineUI {
  constructor(container, animationManager, eventBus) {
    this.container = container;
    this.animationManager = animationManager;
    this.eventBus = eventBus;
    this.selectedObject = null;

    this.init();
  }

  init() {
    const timelineContainer = document.createElement('div');
    timelineContainer.className = 'timeline-ui';
    timelineContainer.style.position = 'fixed';
    timelineContainer.style.bottom = '20px';
    timelineContainer.style.left = '20px';
    timelineContainer.style.right = '20px';
    timelineContainer.style.zIndex = '1000';
    timelineContainer.style.backgroundColor = 'rgba(0,0,0,0.7)';
    timelineContainer.style.padding = '10px';
    timelineContainer.style.borderRadius = '8px';
    timelineContainer.style.display = 'flex';
    timelineContainer.style.alignItems = 'center';
    timelineContainer.style.gap = '10px';
    timelineContainer.style.color = 'white';

    this.playPauseBtn = document.createElement('button');
    this.playPauseBtn.className = 'play-pause-btn';
    this.playPauseBtn.textContent = 'Play';
    this.playPauseBtn.style.padding = '5px 15px';
    this.playPauseBtn.addEventListener('click', () => this.togglePlay());

    this.slider = document.createElement('input');
    this.slider.type = 'range';
    this.slider.min = '0';
    this.slider.max = '10';
    this.slider.step = '0.01';
    this.slider.value = '0';
    this.slider.style.flex = '1';
    this.slider.addEventListener('input', () => {
      this.animationManager.seek(parseFloat(this.slider.value));
    });

    this.addKeyframeBtn = document.createElement('button');
    this.addKeyframeBtn.className = 'add-keyframe-btn';
    this.addKeyframeBtn.textContent = 'Key+';
    this.addKeyframeBtn.title = 'Add Keyframe';
    this.addKeyframeBtn.style.padding = '5px 10px';
    this.addKeyframeBtn.addEventListener('click', () => this.addKeyframe());

    timelineContainer.appendChild(this.playPauseBtn);
    timelineContainer.appendChild(this.slider);
    timelineContainer.appendChild(this.addKeyframeBtn);

    this.container.appendChild(timelineContainer);
  }

  togglePlay() {
    if (this.animationManager.isPlaying) {
      this.animationManager.pause();
      this.playPauseBtn.textContent = 'Play';
    } else {
      this.animationManager.play();
      this.playPauseBtn.textContent = 'Pause';
    }
  }

  addKeyframe() {
    if (!this.selectedObject) {
      return;
    }

    const time = this.animationManager.currentTime;
    const obj = this.selectedObject;

    // Support position, rotation, scale
    if (obj.position) {
      this.animationManager.addKeyframe(obj.uuid, 'position.x', time, obj.position.x);
      this.animationManager.addKeyframe(obj.uuid, 'position.y', time, obj.position.y);
      this.animationManager.addKeyframe(obj.uuid, 'position.z', time, obj.position.z);
    }

    if (obj.rotation) {
      this.animationManager.addKeyframe(obj.uuid, 'rotation.x', time, obj.rotation.x);
      this.animationManager.addKeyframe(obj.uuid, 'rotation.y', time, obj.rotation.y);
      this.animationManager.addKeyframe(obj.uuid, 'rotation.z', time, obj.rotation.z);
    }

    if (obj.scale) {
      this.animationManager.addKeyframe(obj.uuid, 'scale.x', time, obj.scale.x);
      this.animationManager.addKeyframe(obj.uuid, 'scale.y', time, obj.scale.y);
      this.animationManager.addKeyframe(obj.uuid, 'scale.z', time, obj.scale.z);
    }
  }

  setSelectedObject(object) {
    this.selectedObject = object;
  }

  update() {
    if (this.animationManager.isPlaying) {
      this.slider.value = this.animationManager.currentTime.toString();
      
      // Handle loop or end of playback
      if (this.animationManager.currentTime >= parseFloat(this.slider.max)) {
          this.animationManager.seek(0);
      }
    }
  }
}
