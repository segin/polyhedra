export class AnimationManager {
  constructor() {
    this.keyframes = {}; // { [uuid]: { [property]: [{time, value}] } }
    this.currentTime = 0;
    this.isPlaying = false;
  }

  addKeyframe(uuid, property, time, value) {
    if (!this.keyframes[uuid]) {
      this.keyframes[uuid] = {};
    }
    if (!this.keyframes[uuid][property]) {
      this.keyframes[uuid][property] = [];
    }

    const frames = this.keyframes[uuid][property];
    const index = frames.findIndex((f) => f.time === time);
    if (index !== -1) {
      frames[index].value = value;
    } else {
      frames.push({ time, value });
      frames.sort((a, b) => a.time - b.time);
    }
  }

  getKeyframes(uuid, property) {
    return this.keyframes[uuid]?.[property] || [];
  }

  getValueAtTime(uuid, property, time) {
    const frames = this.getKeyframes(uuid, property);
    if (frames.length === 0) return null;
    if (frames.length === 1) return frames[0].value;

    if (time <= frames[0].time) return frames[0].value;
    if (time >= frames[frames.length - 1].time) {
      return frames[frames.length - 1].value;
    }

    for (let i = 0; i < frames.length - 1; i++) {
      const start = frames[i];
      const end = frames[i + 1];
      if (time >= start.time && time <= end.time) {
        const alpha = (time - start.time) / (end.time - start.time);
        return start.value + (end.value - start.value) * alpha;
      }
    }
    return null;
  }

  play() {
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  seek(time) {
    this.currentTime = time;
  }

  update(deltaTime, scene) {
    if (!this.isPlaying) return;

    this.currentTime += deltaTime;

    scene.traverse((object) => {
      this.updateObject(object);
    });
  }

  updateObject(object) {
    const uuid = object.uuid;
    const objectKeyframes = this.keyframes[uuid];
    if (!objectKeyframes) return;

    for (const property in objectKeyframes) {
      const value = this.getValueAtTime(uuid, property, this.currentTime);
      if (value !== null) {
        this._setProperty(object, property, value);
      }
    }
  }

  _setProperty(object, property, value) {
    const parts = property.split('.');
    let current = object;
    for (let i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]] === undefined) return;
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }
}
