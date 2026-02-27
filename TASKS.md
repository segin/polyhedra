# nodist3d Master Task List

This document is the single source of truth for all tasks, specifications, suggestions, and audit findings for the **nodist3d** project.

---

## I. Original Context & Ideas (from CONTEXT.md)
# nodist3d Project Context

## Current Status
- **Test Stability**: achieved 100% pass rate for critical suites (Primitives, Accessibility, Benchmark).
- **Architecture**: stabilized Three.js mocks using class-based structures in `jest.setup.cjs`.
- **Logic**: refactored `main.js` and `PrimitiveFactory.js` for asynchronous operations and parameter alignment.

## Working Notes
- **Recent Success**: Resolved the `TypeError` and `ReferenceError` avalanche by standardizing global mocks. 
- **Next Steps**: Monitor for regressions during further feature development (e.g., Physics, CSG).

## Ideas
- Integrate `cannon-es` more deeply for object interaction.
- Implement Boolean operations using `three-bvh-csg`.
- Add a material library/palette for easier styling.

---

## II. Audit Report (from AUDIT_REPORT.md)
# Codebase Audit Report: Nodist3d
**Date:** 2024-05-24
**Commit SHA:** (Current HEAD)
**Branch:** main (assumed)
**Auditor:** Jules (AI Agent)

## 1. Executive Summary
*   **Overall Health Score:** 45/100 (High Risk)
*   **Top Risks:**
    1.  **Broken Test Suite:** 27% of tests (45/165) failed, with critical worker crashes preventing full execution.
    2.  **Security Misconfiguration:** Content Security Policy (CSP) enables `'unsafe-inline'` for scripts and styles, increasing XSS risk.
    3.  **Maintainability:** High cyclomatic complexity in `src/frontend/main.js` (Complexity: 130) indicates a "God Class" anti-pattern.
    4.  **Inefficient Rendering Updates:** The Scene Graph UI performs full DOM rebuilding on every update, posing a performance risk for large scenes.
    5.  **Unmanaged Globals:** Reliance on global `THREE` and `JSZip` objects in some modules complicates testing and modularity.

## 2. Full Findings

### Security Findings
- [ ] **SEC-001** (High): CSP allows `unsafe-inline` for scripts and styles. (`src/backend/server.js:15-16`) -> Remediation: Use a cryptographic nonce or hash for inline scripts (Import Maps).
- [ ] **SEC-002** (Medium): No rate limiting configured on the Express server. (`src/backend/server.js`) -> Remediation: Implement `express-rate-limit` middleware.
- [ ] **SEC-003** (Low): Static files served from `node_modules`. (`src/backend/server.js`) -> Remediation: Bundle assets during build or copy to `public/vendor`.

### Code Quality & Maintainability
- [ ] **MAINT-001** (High): Monolithic `App` class handles UI, State, Scene, and Input. (`src/frontend/main.js`) -> Remediation: Refactor `App` into `UIManager`, `InputController`, etc.
- [ ] **MAINT-002** (High): Cyclomatic Complexity hotspot (130). (`src/frontend/main.js`) -> Remediation: Extract methods, implement Command pattern for actions.
- [ ] **MAINT-003** (Medium): Duplicate code in `add*` primitive methods. (`src/frontend/main.js`) -> Remediation: Create a data-driven `PrimitiveFactory` or helper method.
- [ ] **MAINT-004** (Medium): No Linting Configuration found (created during audit). (Root) -> Remediation: Commit `eslint.config.mjs` and enforce in CI.

### Performance
- [ ] **PERF-001** (Medium): `updateSceneGraph` clears `innerHTML` and rebuilds DOM. (`src/frontend/main.js`) -> Remediation: Implement Virtual DOM or fine-grained DOM updates.
- [ ] **PERF-002** (Medium): `restoreState` disposes and recreates all meshes. (`src/frontend/main.js`) -> Remediation: Implement object pooling or diff-based state restoration.

### Correctness & Testing
- [ ] **TEST-001** (Critical): Jest Worker crashes due to circular JSON serialization. (Tests (General)) -> Remediation: Ensure tests do not return/log circular Three.js objects.
- [ ] **TEST-002** (High): Mocking failures (`eventBus.subscribe`, `three` imports). (`tests/SceneGraph.test.js`) -> Remediation: Fix Jest mocks to match module structure.

## 3. Metrics
*   **Total LOC:** 9341
*   **Top Complexity:** `src/frontend/main.js` (130)
*   **Vulnerabilities (SCA):** 0 found (via `pnpm audit`).
*   **Secrets:** 0 found.
*   **Test Pass Rate:** 72.7% (120 passed / 45 failed).

## 4. Evidence Bundle
*   **Tool Output:** `eslint_report.json` (Generated)
*   **Tool Output:** `test_results.json` (Generated)
*   **Custom Scans:** `scripts/audit_secrets.cjs`, `scripts/audit_metrics.cjs`

---

## III. Development Specification (from SPECIFICATION.md)
# Comprehensive Development Specification for nodist3d

This specification document aggregates and massively expands upon all roadmap items, todo lists, testing requirements, and code improvement suggestions found in `README.md`, `SUGGESTIONS.md`, and `TESTING_TODO.md`. It serves as the granular master plan for the continued development of **nodist3d**.

---

## Phase 1: Architecture, Refactoring & Code Quality

This phase focuses on solidifying the codebase foundation, ensuring maintainability, scalability, and robustness before adding complex new features.

### 1.1. Module System & Dependency Management

**Goal**: Transition to a fully modular, decoupled architecture using modern standards.

- **1.1.1. Standardize on ES Modules**
  - _Context_: The project currently mixes CommonJS (`require`) and ES Modules (`import`), which causes tooling friction.
  - **Action Items**:
    - [x] **Update `package.json`**: Add `"type": "module"` property to the root object.
    - [x] **Refactor Backend (`src/backend/server.js`)**:
      - [x] Replace `const express = require('express')` with `import express from 'express'`.
      - [x] Replace all `require` calls with static `import` statements where possible.
      - [x] For conditional imports, use `await import()`.
      - [x] Replace `__dirname` (undefined in ESM) with `import { fileURLToPath } from 'url'; import { dirname } from 'path'; const __dirname = dirname(fileURLToPath(import.meta.url));`.
    - [x] **Refactor Frontend Imports**:
      - [x] Audit all frontend files (`src/frontend/**/*.js`).
    # Final Cleanup
- [x] Delete all local and remote branches except `main`
- [x] Update documentation

# Code Audit
- [x] Perform security audit (CSP, rate limiting, dependency vulnerabilities)
- [x] Perform performance audit (bottlenecks, memory leaks, brute force loops)
- [x] Perform code quality audit (consistency, modularity, technical debt)
- [x] Generate comprehensive `audit_report.md`
- [/] Implement critical fixes
    - [/] Fix `PhysicsManager` API mismatch (zombie bodies)
    - [ ] Update dependency vulnerabilities
    - [ ] Implement light disposal
    - [ ] Implement geometry caching
      - [x] Ensure all local imports include the `.js` extension (e.g., `import { x } from './utils.js'`), which is mandatory for browser-native ESM.
      - [x] Verify that `three` and other dependencies are imported via their ESM entry points or mapped correctly if using an import map.
  - **Verification & Testing**:
    - [x] Run `npm start` and ensure the server boots without "require is not defined" errors.
    - [x] Open the browser application and check the console for "Module not found" errors.
    - [x] Run `npm test` (after updating test config) to ensure the test runner handles ESM correctly.

- **1.1.2. Implement Dependency Injection (DI) Container**
  - _Context_: Managers currently access each other via global variables or direct instantiation, leading to tight coupling and making unit testing difficult.
  - **Action Items**:
    - [x] **Create `ServiceContainer` class**:
      - [x] Implement a `services` Map to store instances.
      - [x] Implement `register(name, instance)`: Throws if name already exists.
      - [x] Implement `get(name)`: Throws error if service not found (fail fast).
    - [x] **Refactor Manager Classes**:
      - [x] **ObjectManager**: Constructor should accept `scene`, `eventBus`, `physicsManager`. Remove internal `new` calls.
      - [x] **SceneManager**: Constructor should accept `renderer`, `camera`, `inputManager`.
      - [x] **InputManager**: Constructor should accept `domElement`.
    - [x] **Update Entry Point (`main.js`)**:
      - [x] Create a single instance of `ServiceContainer`.
      - [x] Instantiate `EventBus` first and register it.
      - [x] Instantiate other managers in dependency order, passing the container or specific services.
  - **Verification & Testing**:
    - [x] **Unit Test**: Create `ServiceContainer.test.js`. verify `register` stores and `get` retrieves. Verify error on missing service.
    - [x] **Integration Test**: Verify that `ObjectManager` can successfully emit events via the injected `EventBus`.

- **1.1.3. Centralized State Management**
  - _Context_: Application state (e.g., "is user dragging?", "current color") is scattered across DOM elements and Manager instance properties.
  - **Action Items**:
    - [x] **Create `StateManager` class**:
      - [x] Define initial state schema: `{ selection: [], toolMode: 'select', clipboard: null, isDragging: false, sceneDirty: false }`.
      - [x] use `Proxy` or a simple setter pattern to detect changes.
    - [x] **Implement State Accessors**:
      - [x] `getState()`: Returns a read-only copy (frozen) of the state.
      - [x] `setState(partialState)`: Merges updates and notifies listeners.
      - [x] `subscribe(key, callback)`: specific listener for property changes.
    - [x] **Refactor Consumers**:
      - [x] **ObjectManager**: When selecting, call `stateManager.setState({ selection: [obj] })` instead of setting `this.selected`.
      - [x] **PropertiesPanel**: Subscribe to `selection` changes to auto-update the UI.
  - **Verification & Testing**:
    - [x] **Unit Test**: Test `setState` merges correctly and fires callbacks.
    - [x] **Unit Test**: Test that subscribers to irrelevant keys are _not_ fired.
    - [x] **Integration**: Change selection in 3D view -> Verify Properties Panel updates.

### 1.2. Code Quality & Standards

**Goal**: Enforce consistent coding standards, documentation, and type safety to prevent regression.

- **1.2.1. Linting and Formatting Setup**
  - **Action Items**:
    - [x] **Install Tools**: `npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-promise eslint-plugin-unicorn eslint-plugin-import`.
    - [x] **Configure ESLint (`.eslintrc.json`)**:
      - [x] `env`: `{ browser: true, node: true, es2022: true }`.
      - [x] `rules`: Enforce `eqeqeq`, `no-var`, `prefer-const`, `no-console` (warn), `promise/always-return`.
    - [x] **Configure Prettier (`.prettierrc`)**:
      - [x] `{ "semi": true, "singleQuote": true, "tabWidth": 2, "printWidth": 100 }`.
    - [x] **Setup Husky**:
      - [x] `npx husky install`.
      - [x] Add `pre-commit` hook: `npx lint-staged`.
      - [x] Configure `lint-staged` in package.json to run `eslint --fix` on `*.js` files.
  - **Verification & Testing**:
    - [x] Deliberately introduce a lint error (e.g., `var x = 1;`). Verify commit fails.
    - [x] Run `npm run lint`. Verify it catches issues.

- **1.2.2. Documentation & Type Safety**
  - **Action Items**:
    - [ ] **JSDoc Implementation**:
      - [ ] Go through every file in `src/`.
      - [ ] Add `/** ... */` blocks to every class, method, and exported function.
      - [ ] Explicitly define `@param {Type} name` and `@returns {Type}`.
    - [ ] **TypeScript Migration (Phase 1)**:
      - [ ] Create `tsconfig.json` with `{ "allowJs": true, "checkJs": true, "noEmit": true }`.
      - [ ] Add `// @ts-check` to the top of `main.js` and `ObjectManager.js`.
      - [ ] Fix all resulting type errors (mostly by adding JSDoc).
      - [ ] Create `src/types.d.ts` to define global interfaces like `SceneObject`, `SerializedScene`, `ManagerInterface`.
  - **Verification & Testing**:
    - [ ] Run `npx tsc`. Expect zero errors in checked files.

### 1.3. Error Handling & Logging

**Goal**: Improve application stability and provide visibility into runtime issues.

- **1.3.1. Centralized Logging**
  - **Action Items**:
    - [ ] **Create `Logger` utility (`src/utils/Logger.js`)**:
      - [ ] Implement levels: `DEBUG`, `INFO`, `WARN`, `ERROR`.
      - [ ] Method `log(level, message, meta)`.
      - [ ] Include timestamp ISO string in every log.
      - [ ] In `production` mode (env var), suppress `DEBUG` logs.
    - [ ] **Replace console calls**:
      - [ ] `grep` for `console.log` and replace with `Logger.info`.
      - [ ] `grep` for `console.error` and replace with `Logger.error`.
  - **Verification & Testing**:
    - [ ] Run app. Verify logs appear with timestamps.
    - [ ] Set `NODE_ENV=production`. Verify debug logs disappear.

- **1.3.2. Robust Error Boundaries**
  - **Action Items**:
    - [ ] **Global Error Handler**:
      - [ ] Add `window.addEventListener('error', ...)` to catch unhandled exceptions.
      - [ ] Add `window.addEventListener('unhandledrejection', ...)` for Promises.
      - [ ] Log these to `Logger.error`.
    - [ ] **Operation Wrappers**:
      - [ ] Wrap `JSON.parse` in a utility `safeJSONParse(str, fallback)`. Use this in SceneStorage.
      - [ ] Wrap `localStorage.setItem` in `try...catch` to handle quota limits.
    - [ ] **UI Feedback**:
      - [ ] Create `ToastManager`.
      - [ ] When an error occurs (e.g., "Save Failed"), spawn a red toast notification instead of crashing or staying silent.
  - **Verification & Testing**:
    - [ ] **Manual Test**: Disconnect network, try to save (if cloud save exists). Check for toast.
    - [ ] **Manual Test**: Manually corrupt `localStorage` entry, try to load. Check for safe failure.

---

## Phase 2: Comprehensive Testing Suite

This phase specifically implements the 150+ test cases defined in `TESTING_TODO.md`.

### 2.1. Unit Testing Framework Setup

- **Action Items**:
  - [ ] **Jest Config**: Ensure `jest.config.js` is set up for ESM (`transform: {}`) and JSDOM.
  - [ ] **Mocking Strategy**:
    - [ ] Create `__mocks__/three.js`. Mock `Mesh`, `Scene`, `WebGLRenderer`, `Camera`.
    - [ ] Ensure mocks record calls (e.g., `scene.add = jest.fn()`) so we can verify interactions.

### 2.2. Implementing Test Categories

Each category below corresponds to a specific file or feature set.

- **2.2.1. ObjectManager Tests (Detailed)**
  - **Action Items**: Write tests for:
    - [ ] `addPrimitive(type)`: Verifies correct geometry/material creation.
    - [ ] `duplicate(obj)`: Verifies deep cloning of properties, unique name generation, and position offset.
    - [ ] `delete(obj)`: Verifies removal from scene, disposal of resources (geometry/material), and event emission.
    - [ ] `updateProperty(obj, prop, val)`: Verifies `object.position.x` updates correctly.
  - **Verification**: Run `npm test src/tests/ObjectManager.test.js`.

- **2.2.2. History/Undo-Redo Tests (Detailed)**
  - **Action Items**: Write tests for:
    - [ ] `undo()` with empty stack (no-op).
    - [ ] `addState()` pushes to stack and clears redo stack.
    - [ ] `undo()` restores previous JSON state.
    - [ ] `redo()` restores next JSON state.
    - [ ] Circular buffer limit (ensure stack doesn't grow infinitely).
  - **Verification**: Run `npm test src/tests/History.test.js`.

- **2.2.3. GroupManager Tests (Detailed)**
  - **Action Items**: Write tests for:
    - [ ] `groupObjects([a, b])`: Creates new `Group`, adds a/b, centers group pivot.
    - [ ] `ungroup(group)`: Removes group, re-adds children to scene, preserves world transforms.
    - [ ] Nested grouping (Group C contains Group A).
  - **Verification**: Run `npm test src/tests/GroupManager.test.js`.

- **2.2.4. Integration Tests**
  - **Action Items**: Write tests for:
    - [ ] **Full Flow**: Add Cube -> Move Cube -> Undo -> Cube moves back.
    - [ ] **Save/Load**: Add Sphere -> Save to JSON string -> Clear Scene -> Load JSON -> Sphere exists.
  - **Verification**: Run `npm test src/tests/Integration.test.js`.

---

## Phase 3: Core Feature Implementation

Refining and expanding the 3D capabilities.

### 3.1. Advanced Camera Controls

- **Goal**: Provide professional-grade navigation.
- **Action Items**:
  - [ ] **Enhance OrbitControls**:
    - [ ] Enable `damping` (inertia) for smooth movement.
    - [ ] Add UI config for `dampingFactor`.
  - [ ] **Implement View Cube**:
    - [ ] Create a clickable interactive cube in the corner.
    - [ ] On click 'Front', tween camera to `(0, 0, z)`.
    - [ ] On click 'Top', tween camera to `(0, y, 0)`.
  - [ ] **Focus Selection**:
    - [ ] Implement hotkey 'F'.
    - [ ] Calculate bounding box of selection.
    - [ ] Tween camera to fit bounding box on screen.
- **Verification & Testing**:
  - [ ] **Manual**: Click "Front" on view cube. Verify camera aligns perfectly.
  - [ ] **Unit**: Test `calculateBoundingBox` returns correct dimensions for a group of objects.

### 3.2. Material Editing System

- **Goal**: Allow users to create realistic surfaces.
- **Action Items**:
  - [ ] **Texture Loading UI**:
    - [ ] Add `<input type="file">` for Map, NormalMap, RoughnessMap.
    - [ ] On file select, read as DataURL, load `THREE.Texture`, apply to material.
  - [ ] **Material Parameters**:
    - [ ] Add sliders for `roughness`, `metalness`.
    - [ ] Add toggle for `wireframe`.
    - [ ] Add color picker for `emissive` color.
- **Verification & Testing**:
  - [ ] **Unit**: Test `loadTexture` handles invalid file types gracefully.
  - [ ] **Integration**: Load a normal map. Check `material.normalMap` is not null.

### 3.3. Complex Primitives & Geometry

- **Goal**: Expand modeling capabilities beyond basic shapes.
- **Action Items**:
  - [ ] **ExtrudeGeometry**:
    - [ ] Create a "Sketch Mode" canvas overlay.
    - [ ] Allow user to draw a polygon (click points).
    - [ ] Generate `THREE.Shape` from points.
    - [ ] Apply `THREE.ExtrudeGeometry` with user-defined depth.
  - [ ] **Constructive Solid Geometry (CSG)**:
    - [ ] Install `three-csg-ts`.
    - [ ] Create `BooleanManager`.
    - [ ] Implement `subtract(objA, objB)`: Return `Mesh` that is A minus B.
    - [ ] Implement `union(objA, objB)`: Return combined mesh.
- **Verification & Testing**:
  - [ ] **Unit**: Test CSG subtract of two overlapping cubes. Verify vertex count of result is < sum of parts.
  - [ ] **Manual**: Draw a triangle in sketch mode, extrude it. Verify 3D prism appears.

### 3.4. Physics Engine Integration

- **Goal**: Enable dynamic simulations.
- **Action Items**:
  - [ ] **Integrate Cannon-es**:
    - [ ] `npm install cannon-es`.
    - [ ] Initialize `canonn.World` in `PhysicsManager`.
  - [ ] **Body Mapping**:
    - [ ] Maintain a Map: `UUID -> Cannon.Body`.
    - [ ] On `scene.update`: Copy position/quaternion from Body to Mesh.
  - [ ] **UI Controls**:
    - [ ] Add "Play/Pause" simulation buttons.
    - [ ] Add "Reset" button to restore initial positions.
- **Verification & Testing**:
  - [ ] **Unit**: Test `update` loop copies coordinates correctly.
  - [ ] **Manual**: Lift a cube, press Play. Verify it falls.

### 3.5. Shader Editor

- **Goal**: Allow low-level visual customization.
- **Action Items**:
  - [ ] **UI Integration**:
    - [ ] Use `codemirror` or `monaco-editor` for syntax highlighting.
    - [ ] Create a floating panel with "Vertex Shader" and "Fragment Shader" tabs.
  - [ ] **Hot Reloading**:
    - [ ] On 'Ctrl+S' or auto-save:
    - [ ] Compile string to `THREE.ShaderMaterial`.
    - [ ] Catch compilation errors (`gl.getShaderInfoLog`) and display line numbers in editor.
- **Verification & Testing**:
  - [ ] **Manual**: Type a syntax error. Verify red error message appears in UI.
  - [ ] **Manual**: Change color to `vec4(1.0, 0.0, 0.0, 1.0)`. Verify object turns red.

---

## Phase 4: UI/UX & Mobile Optimization

Enhancing the user interface for usability and accessibility.

### 4.1. Responsive Layout & Mobile First

- **Action Items**:
  - [ ] **CSS Grid Layout**:
    - [ ] Define grid areas: `header`, `viewport`, `sidebar`, `footer`.
    - [ ] On mobile: Stack sidebar below viewport or make it a slide-out drawer.
  - [ ] **Touch Gestures**:
    - [ ] Detect "Pinch" event on canvas -> Update Camera Zoom.
    - [ ] Detect "Two-finger Pan" -> Pan Camera.
    - [ ] Detect "Long Press" -> Open Context Menu.
  - [ ] **Tap Targets**:
    - [ ] Ensure all buttons have `min-height: 44px` and `min-width: 44px`.
    - [ ] Add `padding` to small icons.
- **Verification & Testing**:
  - [ ] **Manual (Device)**: Load on iPhone/Android. Verify buttons are clickable without zooming.
  - [ ] **Manual**: Pinch to zoom. Verify it works smoothly.

### 4.2. Scene Graph & Property Panel Improvements

- **Action Items**:
  - [ ] **Draggable Hierarchy**:
    - [ ] Implement HTML5 Drag and Drop API for the Scene Graph list.
    - [ ] On drop: Call `ObjectManager.reparent(child, newParent)`.
  - [ ] **Scrubbable Inputs**:
    - [ ] Implement a custom Input component.
    - [ ] On `mousedown` on label: Lock pointer.
    - [ ] On `mousemove`: Update numeric value based on delta X.
- **Verification & Testing**:
  - [ ] **Unit**: Test `reparent` logic updates both Three.js scene graph and internal lists.
  - [ ] **Manual**: Drag a Sphere into a Box in the list. Move Box. Verify Sphere moves with it.

### 4.3. Visual Feedback

- **Action Items**:
  - [ ] **Selection Halo**:
    - [ ] Setup `EffectComposer`, `RenderPass`, `OutlinePass`.
    - [ ] When object selected, add to `OutlinePass.selectedObjects`.
  - [ ] **Grid/Axis Customization**:
    - [ ] Add UI toggle for "Show Grid", "Show Axes".
    - [ ] Allow changing Grid size and density.
- **Verification & Testing**:
  - [ ] **Manual**: Select object. Verify glowing outline appears.

---

## Phase 5: Backend, Security & DevOps

Hardening the server and deployment pipeline.

### 5.1. Server Security

- **Action Items**:
  - [ ] **Helmet Middleware**:
    - [ ] `npm install helmet`.
    - [ ] `app.use(helmet())`.
    - [ ] Configure CSP to allow blob: and data: URIs (needed for Three.js/WebWorkers).
  - [ ] **Rate Limiting**:
    - [ ] `npm install express-rate-limit`.
    - [ ] Limit JSON upload endpoint to 10 requests/minute/IP.
  - [ ] **Sanitization**:
    - [ ] Sanitize filenames in `SceneStorage` to prevent directory traversal (`../`).
- **Verification & Testing**:
  - [ ] **Security Scan**: Run `npm audit`.
  - [ ] **Manual**: Try to upload a file named `../../etc/passwd`. Verify rejection.

### 5.2. Build & Deployment

- **Action Items**:
  - [ ] **Vite Integration**:
    - [ ] `npm install vite`.
    - [ ] Move `index.html` to root.
    - [ ] Update entry script references.
    - [ ] Create `vite.config.js`.
  - [ ] **Dockerization**:
    - [ ] Write `Dockerfile`: Multi-stage build (Build frontend -> Serve with Nginx or Node).
    - [ ] Write `docker-compose.yml`: Service for app, volume for persistence.
  - [ ] **GitHub Actions**:
    - [ ] Workflow `test.yml`: Runs `npm install`, `npm test`, `npm run lint`.
    - [ ] Workflow `deploy.yml`: Builds Docker image and pushes to registry (optional).
- **Verification & Testing**:
  - [ ] **Manual**: Run `docker-compose up`. Verify app accessible at `localhost:3000`.
  - [ ] **Manual**: Push a commit. Check GitHub Actions tab for green checkmark.

---

## Phase 6: Advanced Features (Future Roadmap)

Items from the "Roadmap" section in README.

### 6.1. Cloud Integration

- **Action Items**:
  - [ ] **Google Drive API**:
    - [ ] Register GCP Project.
    - [ ] Implement `GoogleAuth` client in frontend.
    - [ ] Map `.nodist3d` MIME type to app.
- **Verification**:
  - [ ] **Manual**: "Save to Drive" button opens Google Picker.

### 6.2. Collaborative Editing

- **Action Items**:
  - [ ] **WebSocket Rooms**:
    - [ ] Implement `socket.io` rooms.
    - [ ] Broadcast `OBJECT_MOVED` events to room.
  - [ ] **Interpolation**:
    - [ ] Other users' cursors should interpolate smoothly between updates.
- **Verification**:
  - [ ] **Manual**: Open two browser windows. Move object in one. Watch it move in other.

### 6.3. Performance Optimization

- **Action Items**:
  - [ ] **InstancedMesh System**:
    - [ ] Scan scene for identical geometries/materials.
    - [ ] Auto-convert to `InstancedMesh` rendering.
  - [ ] **Texture Compression**:
    - [ ] Use `basis_universal` transcoder.
    - [ ] Convert uploaded PNGs to `.ktx2` in WebWorker.
- **Verification**:
  - [ ] **Benchmark**: Create scene with 10,000 cubes. Measure FPS before/after InstancedMesh.

---

## IV. Testing Todo List (from TESTING_TODO.md)
# Expanded Unit Test Suite for nodist3d

## Original 50 Tests

### ObjectManager.js Tests

- [ ] 1. should return null when duplicating a non-existent object.
- [ ] 2. should successfully add a texture to an object's material map.
- [ ] 3. should successfully add a texture to an object's normal map.
- [ ] 4. should successfully add a texture to an object's roughness map.
- [ ] 5. should handle adding a texture to an object with no material.
- [ ] 6. should properly dispose of an object's geometry and material on deletion.
- [ ] 7. should handle the deletion of an already deleted object.
- [ ] 8. should create a unique name for a duplicated object that has no original name.
- [ ] 9. should successfully update an object's material color.
- [ ] 10. should handle updating a material property that does not exist.
- [ ] 11. should successfully create a text object when the font is loaded.
- [ ] 12. should handle a request to create a text object when the font has not yet loaded.

### LightManager.js Tests

- [ ] 13. should add a PointLight to the scene.
- [ ] 14. should add a DirectionalLight to the scene.
- [ ] 15. should add an AmbientLight to the scene.
- [ ] 16. should remove a specified light from the scene.
- [ ] 17. should update a light's color property.
- [ ] 18. should update a light's intensity property.
- [ ] 19. should update a light's position property.
- [ ] 20. should successfully change the type of an existing light.

### PhysicsManager.js Tests

- [ ] 21. should add a box-shaped physics body to the world.
- [ ] 22. should add a sphere-shaped physics body to the world.
- [ ] 23. should add a cylinder-shaped physics body to the world.
- [ ] 24. should return null when trying to add a physics body with an unsupported shape.
- [ ] 25. should update the corresponding mesh position and quaternion after a physics world step.

### GroupManager.js Tests

- [ ] 26. should successfully group two or more objects.
- [ ] 27. should refuse to create a group with fewer than two objects.
- [ ] 28. should correctly calculate the center of the grouped objects for the group's position.
- [ ] 29. should successfully ungroup a group of objects.
- [ ] 30. should place ungrouped objects back into the scene at the correct world positions.
- [ ] 31. should handle a request to ungroup an object that is not a group.

### SceneStorage.js Tests

- [ ] 32. should correctly serialize scene data into the expected JSON format.
- [ ] 33. should ignore non-mesh objects when saving a scene.
- [ ] 34. should successfully load a scene from a valid scene file.
- [ ] 35. should clear all existing objects from the scene before loading a new one.
- [ ] 36. should correctly reconstruct objects with their properties (position, rotation, scale, color) from a save file.
- [ ] 37. should preserve the UUID of objects when loading a scene.

### History.js Tests

- [ ] 38. should save the initial state of the scene.
- [ ] 39. should successfully undo the last action.
- [ ] 40. should successfully redo a previously undone action.
- [ ] 41. should not allow redo if a new action has been performed after an undo.
- [ ] 42. should handle an undo request when there is no history.
- [ ] 43. should handle a redo request when at the most recent state.

### SceneGraph.js Tests

- [ ] 44. should display all mesh and light objects from the scene in the UI.
- [ ] 45. should not display objects other than meshes and lights.
- [ ] 46. should correctly rename an object in the scene.
- [ ] 47. should attach the transform controls when an object is clicked in the scene graph.
- [ ] 48. should delete an object from the scene when the delete button is clicked.

### General/Integration Tests

- [ ] 49. should ensure a duplicated object is a deep clone, not a reference.
- [ ] 50. should ensure that deleting a group also removes all its children from the scene.

## Additional 100 Tests

### ObjectManager.js Extended Tests

- [ ] 51. should resolve the promise when `addText` is called and font is available.
- [ ] 52. should correctly set the material `side` property for planes (`THREE.DoubleSide`).
- [ ] 53. should call `URL.revokeObjectURL` after a texture has been loaded to free memory.
- [ ] 54. should handle `updateMaterial` for an object with an array of materials.
- [ ] 55. should correctly clone an object's material properties when duplicating.
- [ ] 56. should handle duplication of an object with no geometry or material.
- [ ] 57. should update `metalness` property correctly via `updateMaterial`.
- [ ] 58. should update `roughness` property correctly via `updateMaterial`.
- [ ] 59. should correctly add a TeapotGeometry object.
- [ ] 60. should correctly add an ExtrudeGeometry object.
- [ ] 61. should correctly add a LatheGeometry object.
- [ ] 62. should not add a deleted object back to the scene if it's part of an undo operation.
- [ ] 63. should correctly dispose of textures when an object with textures is deleted.
- [ ] 64. should return a new object with a position offset when duplicating.
- [ ] 65. should handle adding a texture of an unsupported type gracefully.

### LightManager.js Extended Tests

- [ ] 66. should assign a default name to a new light if no name is provided.
- [ ] 67. should not throw an error when attempting to remove a light that is not in the scene.
- [ ] 68. should preserve light properties (color, intensity) when changing light type.
- [ ] 69. should handle updating a light with an invalid or non-existent property.
- [ ] 70. should ensure ambient lights do not have a position property that can be updated.

### PhysicsManager.js Extended Tests

- [ ] 71. should create a static body when mass is set to 0.
- [ ] 72. should correctly scale the physics shape when the associated mesh is scaled.
- [ ] 73. should correctly orient the physics shape when the associated mesh is rotated.
- [ ] 74. should correctly remove a physics body from the world.
- [ ] 75. should not affect other bodies when one is removed.
- [ ] 76. should synchronize the physics body's position with its mesh's position upon creation.
- [ ] 77. should handle meshes with geometries that have no size parameters (e.g., a custom BufferGeometry).
- [ ] 78. should apply world gravity to dynamic bodies correctly over time.
- [ ] 79. should allow adding the same mesh to the physics world multiple times without error.
- [ ] 80. should ensure `update` method correctly steps the physics world with the provided `deltaTime`.

### GroupManager.js Extended Tests

- [ ] 81. should allow grouping a group with another object.
- [ ] 82. should correctly handle ungrouping a nested group, restoring all objects to the scene.
- [ ] 83. should maintain the world-space transforms of objects when they are grouped.
- [ ] 84. should return an empty array when trying to ungroup a non-group object.
- [ ] 85. should correctly group objects that have different parents.
- [ ] 86. `ungroupObjects` should return an array containing all the former children.
- [ ] 87. Grouping should remove the original objects from the scene and add the new group.
- [ ] 88. An empty group should be removable from the scene.
- [ ] 89. Grouping objects with existing animations should continue to work.
- [ ] 90. A group's name should be settable and reflected in the Scene Graph.

### SceneStorage.js Extended Tests

- [ ] 91. should correctly save and load a scene containing lights with their properties.
- [ ] 92. should correctly save and load a scene containing nested groups.
- [ ] 93. should handle loading a file that is not a valid zip archive.
- [ ] 94. should handle loading a zip file that is missing 'scene.json'.
- [ ] 95. should correctly save and load material properties like roughness and metalness.
- [ ] 96. should successfully save and load a scene with no objects (an empty scene).
- [ ] 97. should handle JSON parsing errors from a corrupted 'scene.json'.
- [ ] 98. should restore object names correctly from a loaded scene.
- [ ] 99. should restore lights to their correct types and positions.
- [ ] 100. The load process should trigger an update in the SceneGraph.

### History.js Extended Tests

- [ ] 101. should correctly undo/redo the creation of a group.
- [ ] 102. should correctly undo/redo an ungrouping operation.
- [ ] 103. `restoreState` should correctly dispose of old geometries and materials to prevent memory leaks.
- [ ] 104. Saving a new state should clear the "redo" history.
- [ ] 105. Restoring a state should correctly re-render the scene.
- [ ] 106. Undo should detach transform controls from any selected object.
- [ ] 107. `saveState` should not add a new state if it's identical to the current one.
- [ ] 108. The history stack should handle a long series of actions correctly.
- [ ] 109. Undo/redo should correctly restore object visibility states.
- [ ] 110. Restoring a state should also restore the camera position and rotation if saved.

### Pointer.js Tests

- [ ] 111. should dispatch a `selectionChange` event when an object is selected.
- [ ] 112. should dispatch `selectionChange` with a `null` payload on deselection.
- [ ] 113. should correctly apply an outline to a selected object.
- [ ] 114. should correctly remove the outline from a deselected object.
- [ ] 115. should remove the outline from a previous selection when a new object is selected.
- [ ] 116. `isDragging` flag should be true on `pointerdown` and false on `pointerup`.
- [ ] 117. Raycaster should be correctly updated with camera and pointer coordinates on move.
- [ ] 118. Should not select an object if the pointer event started on a UI element.
- [ ] 119. `removeOutline` should not throw an error if called when no outline exists.
- [ ] 120. Raycasting should correctly identify the front-most object if multiple are overlapping.

### SceneManager.js Tests

- [ ] 121. `onWindowResize` should update the renderer size and camera aspect ratio.
- [ ] 122. `resetCamera` should restore the camera's initial position and target.
- [ ] 123. OrbitControls `damping` should be enabled.
- [ ] 124. The scene should contain a GridHelper and an AxesHelper on initialization.
- [ ] 125. The renderer's DOM element should be the same as the canvas provided in the constructor.

### ShaderEditor.js Tests

- [ ] 126. `createShader` should add a mesh with a `ShaderMaterial` to the scene.
- [ ] 127. `initGUI` should create a "Shader Editor" folder in the GUI.
- [ ] 128. Updating a uniform value should set `needsUpdate` on the material to true.
- [ ] 129. Editing GLSL code in the GUI should update the material's `vertexShader` or `fragmentShader`.
- [ ] 130. Creating a new shader should dispose of the previous shader material if it exists.

### Integration Tests (main.js)

- [ ] 131. Clicking the "Translate" button should set `transformControls` mode to "translate".
- [ ] 132. Clicking the "Rotate" button should set `transformControls` mode to "rotate".
- [ ] 133. Clicking the "Scale" button should set `transformControls` mode to "scale".
- [ ] 134. Clicking the "Save as Image" button should trigger a PNG download.
- [ ] 135. Using the transform gizmo and releasing the mouse should create one new history state.
- [ ] 136. The dat.gui properties panel should be cleared when no object is selected.
- [ ] 137. Changing a property in the dat.gui panel should update the object in real-time.
- [ ] 138. The "Snap Translation" checkbox should toggle `transformControls.translationSnap`.
- [ ] 139. The "Snap Rotation" checkbox should toggle `transformControls.rotationSnap`.
- [ ] 140. The "Snap Scale" checkbox should toggle `transformControls.scaleSnap`.
- [ ] 141. Clicking the "Duplicate Selected" should create a new object and select it.
- [ ] 142. The "Add Point Light" button should add a new point light and update the scene graph.
- [ ] 143. Importing a GLTF file should correctly add its contents to the scene.
- [ ] 144. Exporting to GLTF should trigger a download with valid GLTF JSON content.
- [ ] 145. Deleting an object from the Scene Graph UI should remove it from the 3D scene.
- [ ] 146. Selecting an object in the Scene Graph should also select it in the 3D viewport.
- [ ] 147. Clicking the physics button should add a physics body to the selected object.
- [ ] 148. The "Reset View" button should correctly reset the camera controls.
- [ ] 149. Loading a scene file should correctly populate the Scene Graph UI.
- [ ] 150. After an undo operation, the UI panels should be cleared or updated to reflect no selection.

---

## V. Code Improvement Suggestions (from SUGGESTIONS.md)
# Exhaustive Code Improvement Suggestions for nodist3d (300+ Items)

This document provides a detailed list of over 300 suggested improvements for the nodist3d repository. The suggestions are categorized to cover architecture, backend, frontend logic, UI/UX, testing, tooling, and many advanced concepts.

---

## Part 1: Original 211 Suggestions

---

### I. Architecture & General Improvements

- [ ] **Dependency Injection**: Instead of managers accessing each other globally, use a central container or dependency injection (DI) to manage class instances. This will decouple your modules and make them easier to test.
- [ ] **Centralized State Management**: The application state is currently scattered across various managers and DOM elements. Centralize it in a main `App` class or a dedicated state management object to improve predictability and simplify data flow.
- [ ] **Externalize Configuration**: Move hardcoded values like the server port (`3000`), WebSocket URL, and history size into a separate configuration file or use environment variables.
- [ ] **Consistent Module System**: The project mixes CommonJS (`require` in `server.js`) and ES Modules (`import`). Standardize on ES Modules by adding `"type": "module"` to `package.json` and updating `server.js` syntax.
- [ ] **Comprehensive Error Handling**: Add `try...catch` blocks for operations that can fail, such as `localStorage` access, WebSocket connections, and data parsing.
- [ ] **Use a Logger**: Replace all `console.log()` calls with a proper logging library (e.g., `loglevel` on the frontend) that allows for different log levels (debug, info, warn, error).
- [ ] **Add JSDoc Comments**: Document all classes and public methods using JSDoc comments. This will improve code clarity and enable automatic documentation generation.
- [ ] **Define Constants**: Create a `constants.js` file for "magic strings" like event names (`'object-added'`), object types (`'box'`), and UI IDs to prevent typos and improve maintainability.
- [ ] **State Machine for Application Modes**: Implement a finite state machine (FSM) to manage application modes (e.g., `IDLE`, `TRANSFORMING_OBJECT`, `EDITING_MATERIAL`) instead of using boolean flags.
- [ ] **Service Locator Pattern**: As an alternative to DI, implement a Service Locator to provide access to shared services like managers, reducing the need for global variables. (Note: The current DI implementation is clean and effective, so this is not a priority.)
- [ ] **Single Responsibility Principle**: Break down large manager classes. For example, `ObjectManager` could be split into `ObjectFactory`, `ObjectSelector`, and `ObjectPropertyUpdater`.
- [ ] **Command Pattern for History**: Refactor `History.js` to use the Command pattern. Each action (add, remove, transform) becomes a command object with `execute()` and `undo()` methods, simplifying the history logic.
- [ ] **Data-Oriented Design for Properties**: Instead of storing properties directly on Three.js objects, maintain a separate data structure (e.g., a map of UUIDs to property objects). This separates app state from view state. (Note: The current approach of using `userData` is sufficient for now and this would be a major refactoring for little benefit at this stage.)
- [ ] **Create a Core `Engine` Class**: Encapsulate the `renderer`, `scene`, and `camera` setup and the animation loop inside a main `Engine` class to abstract Three.js boilerplate from `main.js`.
- [ ] **Decouple UI from Logic**: `SceneGraph.js` currently mixes logic with direct DOM manipulation. Refactor it to emit events like `sceneGraphNeedsUpdate` with data, and have a separate `UIRenderer` class handle the DOM changes.
- [ ] **Abstract WebSocket Communication**: Create a `NetworkManager` class that wraps the WebSocket instance, providing methods like `send(type, payload)` and handling connection/reconnection logic internally. (Note: The application does not currently use WebSockets.)
- [ ] **Modularize Managers**: Convert manager classes into true ES modules that do not create their own instances. Instantiation should be handled by a single top-level script (`main.js`).
- [ ] **Avoid `instanceof` Checks**: Replace `instanceof` checks (e.g., to see if an object is a `Mesh` or `Light`) with a component-based approach or by checking for properties/methods (duck typing).

### II. Backend (`src/backend/server.js`)

- [ ] **Robust File Paths**: Use `path.join(__dirname, ...)` to construct the static file path. This prevents path issues across different operating systems.
- [ ] **Add Security Middleware**: Use `helmet` in your Express server to set secure HTTP headers and protect against common web vulnerabilities.
- [ ] **Enable CORS**: Implement the `cors` middleware to handle cross-origin requests, which will be necessary if the API and frontend are served on different ports or domains.
- [ ] **Handle WebSocket Errors**: Add an `'error'` event listener to each WebSocket connection to log errors and prevent the server from crashing due to unhandled exceptions. (Note: The application does not currently use WebSockets.)
- [ ] **Use Environment Variables for Port**: Read the server port from `process.env.PORT` with a fallback to `3000` to make deployment easier.
- [ ] **Refactor WebSocket Broadcasting**: The current broadcast iterates through all clients. For better performance, consider implementing a room-based system if you need to send messages to specific client groups. (Note: The application does not currently use WebSockets.)
- [ ] **Graceful Server Shutdown**: Implement logic to gracefully shut down the server, closing all WebSocket connections and saving any necessary state.
- [ ] **Structured Logging**: Log server events as structured JSON objects instead of plain text for easier querying and analysis in log management systems.
- [ ] **Implement WebSocket Heartbeat**: Add a ping/pong mechanism to detect and close dead WebSocket connections. (Note: The application does not currently use WebSockets.)
- [ ] **Add a Health Check Endpoint**: Create a simple HTTP endpoint (e.g., `/healthz`) that returns a `200 OK` status, useful for deployment environments.
- [ ] **WebSocket Message Versioning**: Include a version number in your WebSocket message protocol to allow for backward-compatible changes in the future. (Note: The application does not currently use WebSockets.)
- [ ] **Centralized Error Handling in Express**: Use a dedicated Express error-handling middleware to catch all unhandled route errors.

### III. Frontend - JavaScript & Logic

- [ ] **Refactor WebSocket Message Handling**: The large `if/else if` block in `main.js`'s `ws.onmessage` handler is inefficient. Refactor it into a `switch` statement or, even better, a handler map object (`const messageHandlers = { 'type': handlerFunc, ... }`). (Note: The application does not currently use WebSockets.)
- [ ] **Create an Input Manager**: Centralize all mouse and keyboard event listeners (`mousedown`, `keyup`, etc.) into a dedicated `InputManager` class instead of attaching them directly to the `window` or `document` in `main.js`.
- [ ] **Leverage Modern JavaScript**: Use modern ES6+ features like optional chaining (`?.`), nullish coalescing (`??`), and `async/await` to write more concise and readable code.
- [ ] **Implement Placeholder Files**: The files `PhysicsManager.js` and `ShaderEditor.js` are empty. Either implement their functionality or remove them from the project.
- [ ] **Cache and Reuse Materials**: In `ObjectManager`, instead of creating a `new THREE.MeshStandardMaterial()` every time, cache materials based on their properties and reuse them to reduce draw calls and improve performance.
- [ ] **Improve `Pointer.js` Decoupling**: While `Pointer.js` uses custom events (good!), it still seems to rely on global state. Refactor it to receive necessary state (like the list of selectable objects) via its methods.
- [ ] **Clean up `main.js` Event Listeners**: Organize all UI event listeners from `main.js` into a separate `UIMediator` or similar class that handles interactions between the DOM and the 3D scene managers.
- [ ] **Use Class Private Fields**: Adopt `#privateField` syntax for class properties and methods that are not meant to be accessed from outside the class.
- [ ] **Avoid Default Exports**: Prefer named exports to improve discoverability and refactoring.
- [ ] **Use Object Destructuring**: Use destructuring in function parameters and variable assignments to make code more concise (e.g., `const { position, rotation } = selectedObject;`).
- [ ] **Adopt `async/await` for Promises**: Refactor any `.then().catch()` chains to the more readable `async/await` syntax.
- [ ] **Immutable Data Structures**: For state management, consider using immutable data structures (or libraries like Immer) to prevent accidental state mutation and simplify change detection.
- [ ] **Null-safe Property Access**: In `updatePropertiesPanel`, use optional chaining (`?.`) to safely access properties of a potentially null `selectedObject`.
- [ ] **Enforce Stricter ESLint Rules**: Add plugins like `eslint-plugin-promise` and `eslint-plugin-unicorn` for more advanced linting rules.
- [ ] **Remove Dead Code**: Systematically identify and remove unused variables, functions, and commented-out code blocks.
- [ ] **Use Template Literals for DOM Strings**: When creating HTML strings (like in `SceneGraph.js`), use template literals instead of string concatenation for better readability and multiline support.
- [ ] **Avoid `for...in` for Arrays**: Never use `for...in` to iterate over arrays. Use `for...of` or array methods like `forEach`.
- [ ] **Explicit Type Coercion**: Avoid implicit type coercion by using `===` and `!==` instead of `==` and `!=`.

### IV. Frontend - Three.js & Scene Management

- [ ] **Use Built-in Scene Serialization**: Replace your custom `sceneManager.toJSON` and `fromJSON` logic. Use the robust built-in `scene.toJSON()` and `THREE.ObjectLoader` to handle scene serialization and parsing.
- [ ] **Ensure Complete Resource Disposal**: Perform an audit to ensure all Three.js objects (geometries, materials, textures) are properly disposed of with `.dispose()` when they are removed from the scene to prevent memory leaks.
- [ ] **Manage Control Toggling**: When `TransformControls` are activated, explicitly disable `OrbitControls` (`orbitControls.enabled = false;`) to prevent the two from interfering with each other.
- [ ] **Set Device Pixel Ratio**: Call `renderer.setPixelRatio(window.devicePixelRatio)` to ensure your scene renders crisply on HiDPI (Retina) displays.
- [ ] **Abstract `SceneGraph.js` DOM Manipulation**: The `SceneGraph.js` module directly manipulates the DOM heavily. Abstract this into smaller functions and use template literals to build HTML strings instead of `document.createElement`. This makes the code much cleaner.
- [ ] **Use Instanced Rendering**: If you need to render many copies of the same object, use `THREE.InstancedMesh` for a massive performance boost.
- [ ] **Implement Post-Processing**: Add a post-processing pipeline using `EffectComposer` to add effects like bloom, depth of field, or custom shaders.
- [ ] **Support Orthographic Cameras**: Add a toggle between `PerspectiveCamera` and `OrthographicCamera` for different modeling styles.
- [ ] **Add Scene Fog**: Add `scene.fog` for atmospheric effect and to obscure distant objects.
- [ ] **Integrate a Real Physics Engine**: Fully implement `PhysicsManager.js` using a library like `Cannon-es` or `Rapier` to enable dynamic simulations.
- [ ] **Custom Shaders in `ShaderEditor.js`**: Implement the `ShaderEditor.js` to allow users to write and apply custom GLSL vertex and fragment shaders to objects.
- [ ] **Support GLTF Model Loading**: Add functionality to import and handle complex 3D models in `gltf` or `glb` format.
- [ ] **Environment Maps**: Implement environment maps for realistic reflections on `MeshStandardMaterial` or `MeshPhysicalMaterial`.

### V. Frontend - HTML & CSS

- [ ] **Use Semantic HTML**: In `index.html`, replace layout tables (`<table id="properties-panel-table">`) and excessive `div`s with semantic HTML5 elements (`<main>`, `<section>`, `<aside>`) and use modern CSS for layout.
- [ ] **Remove Inline Styles & Event Handlers**: Move all `style="..."` attributes to `style.css` and replace all `onclick="..."` attributes with `addEventListener` calls in your JavaScript.
- [ ] **Make the Layout Responsive**: Replace fixed-pixel widths and `position: absolute` in `style.css` with a flexible, responsive design using Flexbox, Grid, and media queries.
- [ ] **Use CSS Classes Over IDs**: Prioritize styling with classes instead of IDs in `style.css`. This reduces specificity and makes styles more reusable.
- [ ] **Introduce CSS Variables**: Use CSS Custom Properties (variables) for common values like colors, fonts, and spacing to make theming and maintenance easier.
- [ ] **Adopt a CSS Naming Convention**: Use a structured naming convention like BEM (`.block__element--modifier`) for your CSS classes to improve readability and avoid style conflicts.
- [ ] **Remove `!important`**: Refactor the CSS to remove all uses of `!important`, as this is often a sign of underlying specificity issues.
- [ ] **Improve Accessibility (A11y)**: Add `aria-` attributes, use `<button>` elements for buttons, provide labels for inputs, and ensure all UI is navigable via keyboard.

### VI. Testing & Tooling

- [ ] **Increase Test Coverage**: The existing tests are minimal. Write comprehensive unit tests for all public methods in your manager classes, covering both success and failure cases.
- [ ] **Mock Dependencies in Tests**: Use Jest's mocking capabilities (`jest.mock()`) to properly isolate the units you are testing. For example, `ObjectManager` tests should use a mocked `SceneManager`.
- [ ] **Test the Backend Logic**: Expand `backend.test.js` to test the WebSocket connection and message broadcasting logic, not just that the server starts.
- [ ] **Add End-to-End (E2E) Tests**: Use a framework like Cypress or Playwright to create E2E tests that simulate user workflows from the browser.
- [ ] **Use a Bundler**: Integrate a modern bundler like Vite or Webpack. This will automate module bundling, minification, and provide a better development server experience.
- [ ] **Install a Linter and Formatter**: Add ESLint and Prettier to your project to enforce a consistent code style and catch common errors early.
- [ ] **Use Pre-commit Hooks**: Use Husky and lint-staged to automatically run the linter on your code before every commit, ensuring code quality.
- [ ] **Update Dependencies**: Run `npm outdated` to check for stale packages and update them to their latest stable versions for security and performance benefits.
- [ ] **Specify Node Version**: Add an `engines` field to `package.json` to specify the Node.js version your project requires.
- [ ] **Snapshot Testing for UI**: Use Jest snapshot testing to track changes to the HTML structure generated by `SceneGraph.js`.
- [ ] **Visual Regression Testing**: Implement visual regression testing with a tool like Percy or Storybook to catch unintended visual changes in the 3D canvas or UI.
- [ ] **Measure Test Coverage**: Configure Jest to generate a test coverage report and set coverage thresholds to enforce testing standards.
- [ ] **Cross-Browser Testing**: Set up an automated pipeline using a service like BrowserStack or Sauce Labs to run your tests on different browsers and operating systems.
- [ ] **Test `History.js` Edge Cases**: Write specific tests for undo/redo logic, such as what happens when you undo everything and then perform a new action.
- [ ] **Test Raycasting Logic**: Write tests for `Pointer.js` to ensure it correctly identifies objects under the cursor and handles empty clicks.
- [ ] **Fuzz Testing**: Send random or malformed data through the WebSocket connection and property panels to uncover unexpected errors.
- [ ] **Performance Testing**: Create benchmark tests to measure key metrics like scene load time and frames per second (FPS) under specific conditions.

### VII. Documentation & UX

- [ ] **Enhance the README**: Update `README.md` with a clear project description, detailed setup instructions, an architectural overview, and instructions for running tests.
- [ ] **Provide User Feedback**: Add loading indicators, visual feedback on button clicks, and clear status messages (e.g., "Scene saved!").
- [ ] **Improve UI Layout**: Re-evaluate the UI layout for better ergonomics. Group related controls and ensure property panels are easy to read and interact with.
- [ ] **Graceful `localStorage` Failure**: Wrap `localStorage` calls in `try...catch` blocks to handle cases where storage is disabled (e.g., in private browsing) or full, and inform the user gracefully.
- [ ] **Clearer Variable Naming**: Improve the clarity of variable names where appropriate. For example, rename the generic `object` variable to `selectedObject` in contexts where an object is selected.
- [ ] **Implement Keyboard Shortcuts**: Add keyboard shortcuts for common actions (e.g., `Ctrl+S` for Save, `Ctrl+Z`/`Y` for Undo/Redo, `G` for Group, `Delete` for remove).
- [ ] **Visual Cues for Hover vs. Select**: Use different visual indicators (e.g., a subtle outline for hover, a strong outline or gizmo for selection) to make the state clearer.
- [ ] **Custom Confirmation Modals**: Replace native browser `confirm()` dialogs with custom, non-blocking modal windows for a better user experience.
- [ ] **Add Tooltips**: Provide tooltips for all toolbar icons and property fields to explain their function.
- [ ] **Implement a Color Picker**: Replace the text input for color properties with a proper visual color picker component.
- [ ] **Numeric Input Steppers**: For numeric properties like position and scale, use input fields with stepper arrows to allow for incremental changes.
- [ ] **Snapping and Alignment Tools**: Add options for grid snapping or axis alignment while transforming objects.
- [ ] **A 'Welcome' or 'Help' Modal**: Create a modal that explains the basic controls and UI for first-time users.
- [ ] **Draggable UI Panels**: Allow the user to reposition UI panels like the properties editor and scene graph.
- [ ] **Progress Indicators for Slow Operations**: Show a spinner or progress bar when loading or saving large scenes.
- [ ] **Search/Filter in Scene Graph**: Add a search bar to filter the object list in the `SceneGraph` UI.
- [ ] **Context Menus**: Implement right-click context menus on objects in the viewport and in the scene graph for quick access to actions.

### VIII. Security Hardening

- [ ] **DOM Input Sanitization**: Sanitiz all user input in property panels before using it to update object properties or the DOM to prevent XSS attacks.
- [ ] **WebSocket Message Validation**: On the server, validate the structure and content of incoming WebSocket messages with a schema before processing them.
- [ ] **Add a Content Security Policy (CSP)**: Implement a restrictive CSP via meta tags or HTTP headers to mitigate injection attacks.
- [ ] **Dependency Vulnerability Scanning**: Integrate `npm audit` into your CI pipeline to automatically check for known vulnerabilities in dependencies.
- [ ] **Secure `target="_blank"` Links**: Ensure any links that open in a new tab have `rel="noopener noreferrer"` to prevent tab-nabbing.
- [ ] **Rate Limiting on Server**: Implement rate limiting on the WebSocket server to protect against denial-of-service (DoS) attacks or spam.
- [ ] **JSON Serialization Security**: Be aware of prototype poisoning vulnerabilities when parsing JSON from untrusted sources. Use `JSON.parse` safely.

### IX. Build Process & Tooling Improvements

- [ ] **Separate Dev/Prod Builds**: Create distinct build configurations in your bundler for development (with source maps, hot reloading) and production (minified, optimized).
- [ ] **Generate Source Maps**: Ensure source maps are generated for production builds to make debugging errors in the wild easier.
- [ ] **Implement a CI/CD Pipeline**: Use GitHub Actions, GitLab CI, or Jenkins to automate the process of running tests, linting, and deploying the application.
- [ ] **Containerize with Docker**: Create a `Dockerfile` and `docker-compose.yml` to define a consistent, reproducible environment for development and deployment.
- [ ] **Enable Tree Shaking**: Ensure your bundler is configured to perform tree shaking to eliminate unused code from the final bundle, especially from large libraries like Three.js.
- [ ] **Implement Code Splitting**: Split your application code into smaller chunks (e.g., by route or feature) that can be loaded on demand to improve initial load time.
- [ ] **Automate Dependency Updates**: Use a service like Dependabot or Renovate to automatically create pull requests for updating outdated dependencies.

### X. Documentation & Project Management

- [ ] **Create an Architectural Decision Record (ADR)**: Maintain a log of important architectural decisions, why they were made, and their consequences.
- [ ] **Document the WebSocket API**: Create a clear document defining the WebSocket message types, their payloads, and their purpose.
- [ ] **Add a `CONTRIBUTING.md` File**: If the project is open source, add a file that outlines how others can contribute, including coding standards and the pull request process.
- [ ] **Generate Documentation from JSDoc**: Use a tool like `JSDoc` or `TypeDoc` to automatically generate an HTML documentation website from your code comments.
- [ ] **Set up Project Boards**: Use GitHub Projects or a similar tool to organize tasks, track bugs, and plan future features.
- [ ] **Create a `changelog.md`**: Maintain a log of changes, bug fixes, and new features for each version release.
- [ ] **Add inline comments for complex logic**: Beyond JSDoc, add comments inside complex functions to explain _why_ the code is written a certain way, not just _what_ it does.
- [ ] **Document Build and Deployment Steps**: Add a section to the `README.md` that clearly explains how to build the project for production and deploy it.

### XI. TypeScript Migration & Static Analysis

- [ ] **Incremental TypeScript Adoption**: Begin migrating to TypeScript file-by-file, starting with utility functions and constants, using `// @ts-check` in JS files to catch early errors.
- [ ] **Define Core Types**: Create `types.ts` (or similar) to define shared interfaces for core concepts like `SceneObject`, `MaterialProperties`, and `UserAction`.
- [ ] **Use Mapped Types for UI**: Create types for UI state that are derived from your core data types, ensuring consistency.
- [ ] **Strict Type Checking**: Enable all `strict` mode options in `tsconfig.json` (`strictNullChecks`, `noImplicitAny`, etc.) for maximum type safety.
- [ ] **Use Utility Types**: Leverage TypeScript's built-in utility types like `Partial<T>`, `Readonly<T>`, and `Pick<T, K>` to create flexible and robust types.
- [ ] **Type Guard Functions**: Implement type guard functions (e.g., `isMesh(obj): obj is THREE.Mesh`) to narrow types within conditional blocks, replacing `instanceof` checks.
- [ ] **Typed Event Bus**: If implementing an event bus, make it type-safe so that `publish('eventName', payload)` validates that the payload matches the event's expected type.
- [ ] **Generate Types from Schemas**: If using a schema validation library for WebSocket messages, use it to automatically generate TypeScript types.
- [ ] **Lint for TypeScript Best Practices**: Use ` @typescript-eslint/eslint-plugin` to enforce best practices specific to TypeScript.
- [ ] **Use `unknown` Instead of `any`**: Prefer `unknown` for values with a truly unknown type and perform explicit type checking before use.
- [ ] **Define Enums for Categories**: Use string enums for categorical data like object types (`ObjectType.BOX`, `ObjectType.SPHERE`) to prevent typos and provide autocompletion.

### XII. Advanced State & Data Management

- [ ] **Use State Management Library**: Adopt a dedicated state management library like Redux Toolkit, Zustand, or Jotai to handle complex state interactions, especially if the UI becomes more reactive.
- [ ] **Selectors for Derived Data**: Use memoized selectors (like with `reselect`) to compute derived data from your state, preventing unnecessary recalculations.
- [ ] **State Normalization**: Normalize nested or relational data in your state store. Instead of arrays of objects, use an "entities" object keyed by ID for faster lookups.
- [ ] **Separate UI State from Domain State**: Keep transient UI state (e.g., "is this panel open?") separate from the core application/domain state (the scene data).
- [ ] **Optimistic UI Updates**: For network actions, update the UI immediately as if the action succeeded, then roll back only if the server returns an error. This improves perceived performance.
- [ ] **Conflict-Free Replicated Data Types (CRDTs)**: For real-time collaboration, investigate CRDTs to merge changes from different users without conflicts.
- [ ] **IndexedDB for Large-Scale Storage**: If scenes or assets become very large, migrate from `localStorage` to IndexedDB for its larger storage capacity and asynchronous API.
- [ ] **Data Schema Versioning and Migration**: Implement a versioning system for your saved scene format (`.json` or `localStorage`) and write migration scripts to handle loading older versions.

### XIII. Collaboration & Real-Time Features

- [ ] **User Presence Indicators**: Show a list of currently active users in a session.
- [ ] **Live Cursors**: Display the cursors of other users moving around the 2D UI or 3D space.
- [ ] **Component Locking**: Allow a user to "lock" an object they are editing to prevent other users from modifying it simultaneously.
- [ ] **Live Chat/Annotations**: Add a chat panel or the ability for users to drop 3D annotations into the scene.
- [ ] **Operational Transformation (OT)**: As an alternative to CRDTs, implement OT for synchronizing user edits, which is well-suited for structured data like a scene graph.
- [ ] **Session Management**: Allow users to create named sessions/rooms that others can join via a URL.
- [ ] **Backend State Persistence**: Persist the state of a collaborative scene on the backend (e.g., in a Redis or in-memory database) so it can be re-joined later.
- [ ] **Permissions/Roles**: Introduce user roles (e.g., editor, viewer) to control who can make changes in a shared session.

### XIV. User Experience & Interface Polish

- [ ] **Drag-to-Adjust Numeric Inputs**: Allow users to click and drag horizontally on a number input label to quickly scrub through values.
- [ ] **Customizable UI Themes**: Add light and dark mode themes, and potentially allow users to customize theme colors.
- [ ] **Command Palette**: Implement a command palette (like in VS Code) that can be opened with a keyboard shortcut (`Ctrl+P` or `Cmd+P`) to quickly access any action.
- [ ] **Marquee (Box) Selection**: Allow users to drag a rectangle on the screen to select multiple objects at once.
- [ ] **In-Viewport Property Display**: Briefly show key properties (like an object's name) next to it in the viewport upon selection.
- [ ] **Accessible Color Palettes**: Ensure that default colors and UI themes have sufficient contrast ratios to meet WCAG AA or AAA standards.
- [ ] **UI State in URL**: Store some UI state (like the active panel or selected object ID) in the URL hash, so refreshing the page restores the user's context.
- [ ] **Empty States**: Design helpful "empty state" messages for panels like the scene graph (e.g., "No objects in scene. Click 'Add' to get started!").
- [ ] **Micro-interactions**: Add subtle animations and transitions to UI elements to provide feedback and make the interface feel more dynamic.
- [ ] **Multi-Select Property Editing**: When multiple objects are selected, the properties panel should show common editable properties (e.g., `visible`) and indicate mixed states for differing ones.
- [ ] **Save/Dirty Indicator**: Show a visual indicator (e.g., an asterisk in the title) when the scene has unsaved changes.

### XV. Asset & Resource Management

- [ ] **Asset Browser UI**: Create a dedicated UI panel for managing imported assets like textures, models, and materials.
- [ ] **Drag-and-Drop Asset Import**: Allow users to drag files (e.g., `.png`, `.gltf`) directly into the browser window to import them.
- [ ] **Texture Compression**: Use a library like `KTX-Software` to compress textures into GPU-friendly formats (like KTX2 / Basis Universal) for faster loading and lower memory usage.
- [ ] **Reference Counting for Assets**: Implement reference counting for assets so that textures or materials are only unloaded from memory when no objects are using them.
- [ ] **Lazy Loading for Assets**: Only load the data for heavy assets (like high-res textures) when they are actually needed in the scene.
- [ ] **Asset Preloading**: Preload critical assets while showing a loading screen to ensure they are available immediately when the main application starts.

### XVI. Accessibility (A11y) Deep Dive

- [ ] **Focus Management**: Ensure that when modals open, focus is trapped inside them, and when they close, focus returns to the element that triggered them.
- [ ] **Live Regions for Notifications**: Use ARIA live regions (`aria-live="polite"`) for status messages so screen readers announce them automatically.
- [ ] **Full Keyboard Navigation for 3D Viewport**: Implement keyboard controls for orbiting, panning, and zooming the 3D camera.
- [ ] **Accessible `canvas` Element**: Provide a fallback text description inside the `<canvas>` element and use a hidden list of scene objects that a screen reader can announce.
- [ ] **High Contrast Mode**: Implement a specific high-contrast UI theme that overrides other color settings for users who need it.
- [ ] **Reduce Motion Setting**: Respect the `prefers-reduced-motion` media query to disable non-essential animations and transitions.
- [ ] **Screen Reader Text for Icons**: For icon-only buttons, use a visually hidden `<span>` with descriptive text inside the `<button>` for screen readers.

### XVII. Code & Project Structure Refinements

- [ ] **Feature-Based Directory Structure**: Organize files by feature (e.g., `/features/scene-graph`, `/features/properties-panel`) instead of by type (`/managers`, `/ui`).
- [ ] **Barrel Files (`index.js`)**: Use `index.js` or `index.ts` files to create a clean public API for each feature directory, simplifying imports.
- [ ] **Separate Public/Internal APIs**: Clearly distinguish between a module's public API and its internal implementation details, possibly using an `internal` subdirectory.
- [ ] **Monorepo Structure**: If the project grows, consider a monorepo structure (using `npm workspaces`, `pnpm`, or `Nx`) to manage the backend, frontend, and shared libraries in one repository.
- [ ] **`.editorconfig` File**: Add an `.editorconfig` file to the root of the project to enforce consistent basic editor settings (indentation, line endings) across different IDEs.
- [ ] **Path Aliases**: Configure path aliases (e.g., ` @/components/*`) in your bundler and `tsconfig.json` to avoid long relative import paths (`../../..`).

### XVIII. Advanced Rendering & Graphics

- [ ] **Physically Based Rendering (PBR) Materials**: Fully utilize `MeshPhysicalMaterial` by adding support for its properties like clearcoat, transmission, and sheen.
- [ ] **Custom Render Passes**: Create custom render passes for effects like outlines on selected objects, which is more robust than adding extra geometry to the scene.
- [ ] **Gamma Correction Workflow**: Ensure you are using a correct color workflow by setting the renderer's output encoding (`renderer.outputEncoding = THREE.sRGBEncoding;`) and correctly encoding texture colors.
- [ ] **Anti-Aliasing Techniques**: Offer different anti-aliasing options beyond the default, such as SMAA or FXAA, implemented via post-processing.
- [ ] **Support for Multiple Viewports**: Add the ability to split the screen into multiple viewports (e.g., top, front, side, and perspective).
- [ ] **Vertex Snapping in Shaders**: For grid snapping, consider implementing it in the vertex shader for perfect precision.

### XIX. Developer Experience (DevEx)

- [ ] **Component Storybook**: Set up Storybook to develop and document UI components in isolation.
- [ ] **Hot Module Replacement (HMR)**: Ensure your development server is configured for HMR to see changes instantly without a full page reload.
- [ ] **Meaningful Git Commit Messages**: Enforce a convention for Git commit messages (e.g., Conventional Commits) to make the project history more readable and automate changelog generation.
- [ ] **Pluggable Architecture**: Refactor the core to allow new tools and object types to be added as plugins, without modifying the core manager classes.
- [ ] **Browser DevTools Integration**: Create a custom panel in the browser's developer tools for inspecting the application's state or the Three.js scene graph.
- [ ] **Automate Release Process**: Use a tool like `semantic-release` to fully automate versioning, changelog generation, and package publishing based on commit messages.
- [ ] **Feature Flags**: Implement a system for feature flags to enable or disable new, unfinished features in production without requiring a separate branch.

### XX. Internationalization (i18n) & Localization (l10n)

- [ ] **i18n Library Integration**: Integrate a robust internationalization library like `i18next` or `react-i18next` to manage translations.
- [ ] **Extract All UI Strings**: Move every user-facing string from the codebase into locale-specific JSON resource files (e.g., `en.json`, `es.json`).
- [ ] **Locale-based Number Formatting**: Use the `Intl.NumberFormat` API to format all numbers displayed in the UI according to the user's locale (e.g., `1,234.56` vs `1.234,56`).
- [ ] **Locale-based Date/Time Formatting**: Use the `Intl.DateTimeFormat` API for any dates or timestamps to ensure they are displayed in a familiar format.
- [ ] **Pluralization Rules**: Handle pluralization correctly using your i18n library's features, as rules differ significantly between languages (e.g., for "1 object" vs. "2 objects").
- [ ] **Right-to-Left (RTL) Layout Support**: Add CSS rules using logical properties (e.g., `margin-inline-start` instead of `margin-left`) and a `[dir="rtl"]` selector to correctly mirror the UI for languages like Arabic or Hebrew.
- [ ] **Language Selector UI**: Add a dropdown or menu in the application's settings to allow users to manually switch the language.
- [ ] **Browser Locale Detection**: Automatically detect the user's preferred language from the browser (`navigator.language`) as the initial default.
- [ ] **Font Support for Different Character Sets**: Ensure your chosen UI fonts include the necessary glyphs for all supported languages or implement a strategy for loading different font files per locale.

### XXI. Extensibility & Plugin Architecture

- [ ] **Define Clear Extension Points**: Formalize a list of specific extension points in your core engine, such as `registerTool`, `registerPanel`, `registerObjectType`, `registerShaderPass`.
- [ ] **Plugin Lifecycle Hooks**: Create a well-defined lifecycle for plugins, including `onActivate`, `onDeactivate`, and `onStateSave` methods that the core application calls.
- [ ] **Sandboxed Plugin Execution**: Load plugins into a sandboxed environment (e.g., a Web Worker or an iframe) to isolate their execution and prevent a faulty plugin from crashing the main application.
- [ ] **Plugin Scoped CSS**: Implement a mechanism to scope CSS from plugins (e.g., by automatically namespacing their CSS classes) to prevent them from interfering with core UI styles.
- [ ] **Plugin API Versioning**: Version your plugin API so the core application can check for compatibility and gracefully handle plugins designed for older or newer versions.
- [ ] **Plugin Manager UI**: Create a UI panel where users can view, enable, disable, and configure installed plugins.
- [ ] **Lazy Loading for Plugins**: Only load a plugin's code when it is activated by the user to reduce initial application load time.
- [ ] **Expose a Read-Only API**: Provide plugins with a safe, read-only version of the core application state and a limited set of mutation methods to prevent uncontrolled state changes.

### XXII. Analytics, Monitoring & Observability

- [ ] **Frontend Error Tracking**: Integrate a service like Sentry, Bugsnag, or Rollbar to automatically capture, report, and aggregate frontend exceptions that occur in the wild.
- [ ] **Frontend Performance Monitoring**: Track Core Web Vitals (LCP, FID, CLS) and other performance metrics (e.g., time to first byte) to understand and improve real-user performance.
- [ ] **User Behavior Analytics**: Add privacy-focused analytics (e.g., Plausible, Umami) or Google Analytics to understand which features are most used, identify user drop-off points, and guide development priorities.
- [ ] **Backend Performance Monitoring (APM)**: Use an APM tool to monitor the backend Node.js server's response times, error rates, and resource utilization.
- [ ] **Frontend Structured Logging**: Send structured logs from the frontend to a logging service to debug complex user sessions and workflows.
- [ ] **WebGL Context Loss Tracking**: Specifically track and report when a user's browser loses the WebGL context, as this is a critical failure mode.
- [ ] **Feature Flag Adoption Metrics**: If using feature flags, track how many users are enabling or using a new feature to validate its usefulness before a full rollout.
- [ ] **Session Replay Tools**: Consider using a tool like LogRocket or FullStory (with user consent) to replay user sessions for debugging complex UI bugs.

### XXIII. Mobile Experience & Progressive Web App (PWA)

- [ ] **Web App Manifest**: Add a `manifest.json` file to make the application installable to the user's home screen.
- [ ] **Service Worker for Offline Caching**: Implement a service worker to cache application assets, allowing it to load instantly on subsequent visits and work offline.
- [ ] **Touch-Friendly Camera Controls**: Implement intuitive touch gestures for 3D navigation, such as one-finger drag to orbit, two-finger pinch to zoom, and two-finger pan.
- [ ] **Larger UI Tap Targets**: Ensure all buttons, icons, and interactive elements meet mobile accessibility guidelines for minimum tap target size (e.g., 44x44 CSS pixels).
- [ ] **Handle Mobile Viewport Resizing**: Properly handle the mobile viewport, which can resize when the virtual keyboard appears.
- [ ] **Screen Wake Lock API**: Use the Screen Wake Lock API to prevent the device from going to sleep during active use, which is crucial for a 3D application.
- [ ] **Conditional Rendering for Mobile**: Conditionally reduce rendering quality on mobile devices (e.g., disable post-processing, lower shadow resolution) to maintain a smooth frame rate.
- [ ] **Haptic Feedback**: Use the `navigator.vibrate()` API to provide subtle haptic feedback for key actions on supported mobile devices.

### XXIV. Advanced Physics & Simulation

- [ ] **Physics Debug Renderer**: Implement a debug view that renders the invisible physics collision shapes as wireframes on top of the visual geometry, which is essential for debugging.
- [ ] **Physics Constraints & Joints**: Add support for different types of physics constraints, such as Hinge, Lock, and Slider joints, to connect multiple physics bodies.
- [ ] **Soft Body and Cloth Physics**: Integrate a library that supports soft body dynamics to simulate deformable objects or cloth.
- [ ] **Raycast Vehicle Simulation**: Use the physics engine's raycasting capabilities to build a simple vehicle simulation with realistic wheel suspension.
- [ ] **Deterministic Physics Engine**: For multiplayer synchronization, consider using a deterministic physics engine to ensure simulations run identically on all clients given the same inputs.
- [ ] **Physics Materials**: Allow users to define physics material properties like friction and restitution (bounciness) for objects.

### XXV. WebAssembly (WASM) & High-Performance Computing

- [ ] **Rewrite Critical Logic in Rust/C++**: Identify performance bottlenecks in JavaScript (e.g., complex mesh manipulation, pathfinding algorithms) and rewrite them in a language like Rust or C++ to be compiled to WebAssembly.
- [ ] **Efficient JS/WASM Memory Management**: Implement a careful strategy for sharing and copying memory between the JavaScript main thread and your WASM module to avoid performance cliffs.
- [ ] **Use WASM for Physics**: Instead of a JavaScript-based physics engine, use one compiled to WebAssembly (like `Rapier`) for near-native performance.
- [ ] **WASM SIMD for Parallelism**: Utilize the WebAssembly SIMD (Single Instruction, Multiple Data) feature for highly parallelizable computations, such as matrix math or particle simulations.

### XXVI. Legal, Compliance & Business Logic

- [ ] **User Authentication**: Implement a full authentication system (e.g., via Firebase Auth, Auth0, or custom) with options for email/password and social logins (Google, GitHub).
- [ ] **Add a Privacy Policy**: Create and link to a clear Privacy Policy page explaining what data is collected and how it is used.
- [ ] **Add Terms of Service**: Create and require users to agree to a Terms of Service document before using the application.
- [ ] **Cookie Consent Banner**: Implement a cookie consent mechanism that complies with regulations like GDPR and CCPA.
- [ ] **Subscription & Payment Integration**: Integrate with a payment provider like Stripe or Lemon Squeezy to handle user subscriptions for "pro" features.
- [ ] **Tiered Feature Access**: Architect the application to enable or disable specific features based on a user's subscription tier.
- [ ] **Usage Quotas**: Implement backend logic to enforce quotas for free-tier users, such as the number of private scenes or total asset storage.
- [ ] **Administrative Dashboard**: Build a separate, secure administrative interface for managing users, subscriptions, and viewing application-wide statistics.

### XXVII. Final Polish, Edge Cases & Robustness

- [ ] **Handle WebGL Context Loss**: Listen for the `webglcontextlost` and `webglcontextrestored` events on the canvas and implement logic to gracefully re-create the renderer and all GPU resources.
- [ ] **Handle Browser Tab Inactivity**: Listen for the `visibilitychange` event and pause the rendering loop and any intensive processes when the tab is not visible to save battery and CPU.
- [ ] **Configurable History Limit**: Make the undo/redo history stack limit a configurable user setting to balance memory usage with convenience.
- [ ] **Custom 404 Page**: Provide a custom, user-friendly 404 "Not Found" page for any invalid URLs.
- [ ] **Comprehensive Favicon Set**: Generate a full set of favicons for all modern browsers and devices (e.g., using a service like RealFaviconGenerator).
- [ ] **`robots.txt` Configuration**: Add a `robots.txt` file to control how search engine crawlers index the site.
- [ ] **XML Sitemap Generation**: Automatically generate and submit an `sitemap.xml` file to help search engines discover application pages.
- [ ] **Export/Import User Preferences**: Allow users to export their UI settings (panel layouts, theme, keybindings) to a file and import them on another device.
- [ ] **URL-based Scene Loading**: Allow a scene to be loaded directly by passing a URL to a raw JSON file as a query parameter.
- [ ] **Input Validation for Property Panels**: Add robust validation to all property panel inputs, preventing non-numeric characters in number fields or out-of-range values.
- [ ] **Handle High-Frequency Input Devices**: Ensure smooth interaction with high-polling-rate mice by correctly handling the high frequency of `mousemove` events.
- [ ] **Camera Clipping Plane Adjustment**: Allow the user to adjust the camera's near and far clipping planes to handle very large or very small scenes without rendering artifacts.
- [ ] **Prevent Accidental Page Exit**: Use the `beforeunload` event to prompt the user if they try to close the tab with unsaved changes.
- [ ] **Clipboard Integration**: Allow users to copy and paste objects within the scene graph or even between browser tabs (by serializing to a JSON string).
- [ ] **API Request Retries**: For critical network requests (like saving), implement an exponential backoff retry strategy in case of transient network failures.
- [ ] **Unit Conversion**: Add a user setting for units (e.g., meters, feet) and automatically convert and display values in the UI accordingly.
- [ ] **Safe Area Insets for Mobile UI**: On mobile devices with notches, use CSS environment variables (`env(safe-area-inset-top)`) to prevent UI elements from being obscured.
- [ ] **Memory Usage Profiling**: Periodically use the browser's memory profiler to hunt for detached DOM nodes and other sources of memory leaks.
- [ ] **GPU Usage Profiling**: Use the browser's developer tools or extensions to profile GPU usage and identify unexpectedly expensive shaders or draw calls.
- [ ] **Grid and Helper Customization**: Allow the user to customize the appearance of the 3D grid, axes helpers, and other visual aids (e.g., color, size, divisions).
- [ ] **Recursive `dispose` Helper**: Write a utility function that recursively traverses a Three.js object and calls `.dispose()` on all its geometries, materials, and textures to prevent memory leaks when removing complex objects.
- [ ] **Transform Space Toggling**: Add a UI toggle to switch the transform gizmo between "local" and "world" space.
- [ ] **Locking Object Properties**: Add toggles in the properties panel to lock an object's position, rotation, or scale to prevent accidental changes.
- [ ] **Isolate Object Mode**: Implement a feature to temporarily hide all other objects except for the selected one(s), making them easier to edit in a complex scene.
- [ ] **Camera Bookmarks**: Allow users to save and quickly jump back to specific camera positions and angles.
- [ ] **Undo/Redo for Camera Movements**: Optionally add camera movements to the history stack so they can be undone.
- [ ] **Work with FileSystem Access API**: For supported browsers, use the FileSystem Access API to allow the application to directly open and save files to the user's local disk for a more desktop-like experience.
- [ ] **WebXR for VR/AR Support**: Integrate the WebXR API to allow users to view and interact with their scenes in virtual or augmented reality.
- [ ] **Conditional Polyfills**: Only load polyfills for older browsers if they are actually needed by detecting feature support first.
- [ ] **CSP Nonce for Inline Scripts**: If inline scripts are absolutely necessary, improve security by using a nonce-based Content Security Policy.
- [ ] **Bundle Analysis**: Use a tool like `webpack-bundle-analyzer` to visually inspect the contents of your final JavaScript bundle and identify opportunities to reduce its size.
- [ ] **Error Boundaries in UI**: If using a component-based framework (or adopting one), wrap key parts of the UI in error boundaries to prevent a crash in one panel from taking down the entire application.
- [ ] **Dependency License Checker**: Add a build step that automatically checks the licenses of all third-party dependencies to ensure compliance with your project's legal requirements.
- [ ] **CSS Containment**: Use the CSS `contain` property on self-contained UI components to improve rendering performance by telling the browser it doesn't need to recalculate layout or style for the rest of the page when that component changes.
- [ ] **Image Lazy Loading in UI**: For any images in the UI (e.g., asset thumbnails), use `loading="lazy"` to defer their loading until they are about to be scrolled into view.
- [ ] **Keyboard Focus Visualization**: Enhance the default focus outline (`:focus-visible`) to make it clearer which element has keyboard focus, improving accessibility.
- [ ] **Test for Race Conditions**: Write specific tests to identify potential race conditions, especially in asynchronous code involving network requests and state updates.
- [ ] **Scripting via Console**: Expose a clean API to the `window` object (for development builds only) to allow for scripting and debugging the scene directly from the browser console.
- [ ] **Automatic Scene Backups**: Periodically save a backup of the current scene to `localStorage` or `IndexedDB` so work isn't lost if the browser crashes.
