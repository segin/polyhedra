# Implementation Plan: Animation and Rendering Export

## Phase 1: Core Animation Engine
- [x] Task: Create animation state manager. [d9bf112]
    - [x] Write unit tests for `AnimationManager` (state, keyframe interpolation).
    - [x] Implement `AnimationManager` to manage keyframes and playback.
- [x] Task: Integrate animation with `SceneGraph`. [1829468]
    - [x] Write tests for property updates via animation loop.
    - [x] Update `Engine.js` or `SceneManager.js` to support animated property updates.
- [x] Task: Conductor - User Manual Verification 'Core Animation Engine' (Protocol in workflow.md)

## Phase 2: User Interface & Timeline
- [x] Task: Develop animation timeline UI. [91a2ce8]
    - [x] Write tests for timeline interaction (scrubbing, adding keyframes).
    - [x] Implement a mobile-friendly timeline component.
- [x] Task: Conductor - User Manual Verification 'User Interface & Timeline' (Protocol in workflow.md)

## Phase 3: Rendering Export
- [ ] Task: Static image export.
    - [ ] Write tests for capturing current frame as PNG/JPG.
    - [ ] Implement "Save Image" button and backend/client-side download logic.
- [ ] Task: Animated rendering export.
    - [ ] Write tests for frame-by-frame rendering and encoding.
    - [ ] Integrate a library for video/GIF generation.
- [ ] Task: Conductor - User Manual Verification 'Rendering Export' (Protocol in workflow.md)

---
[checkpoint: ]