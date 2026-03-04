# Polyhedra Project Specification

This document defines the functional and non-functional requirements for the **Polyhedra** project, a web-based 3D modeling environment. Requirements are formulated using the INCOSE/EARS (Easy Approach to Requirements Syntax) and organized by User Stories.

---

## 1. System Overview
Polyhedra is a browser-based 3D engine designed for rapid prototyping, featuring a custom physics engine, shader editor, and collaborative tools.

---

## 2. Phase 1: Architecture & Foundation

### 2.1. Module System & Dependency Management
**User Story:** As a developer, I want a standardized module system so that I can easily manage dependencies and ensure codebase consistency.

- **REQ-001 (Ubiquitous):** The system shall use ES Modules for both frontend and backend code.
- **REQ-002 (Ubiquitous):** All internal imports shall include the `.js` file extension.
- **REQ-003 (Ubiquitous):** The backend shall use `import` statements and handle `__dirname` using `fileURLToPath`.

**User Story:** As a developer, I want to use Dependency Injection so that I can decouple components and improve unit testability.

- **REQ-004 (Ubiquitous):** The system shall implement a `ServiceContainer` to manage singleton instances of managers.
- **REQ-005 (Event-driven):** When a service is requested via `get()`, if the service is not registered, the system shall throw a "Service not found" error.
- **REQ-006 (Ubiquitous):** Manager classes (ObjectManager, SceneManager, etc.) shall receive their dependencies via constructor injection.

### 2.2. State Management
**User Story:** As a developer, I want centralized state management so that the application state is predictable and easy to synchronize across UI components.

- **REQ-007 (Ubiquitous):** The system shall maintain a single source of truth for application state in a `StateManager`.
- **REQ-008 (State-driven):** While the state is being updated via `setState()`, the system shall notify all registered subscribers of the change.
- **REQ-009 (Ubiquitous):** The `getState()` method shall return a frozen, read-only copy of the state.

---

## 3. Phase 2: Comprehensive Testing

### 3.1. Unit Testing
**User Story:** As a developer, I want a robust test suite so that I can verify individual units of logic and prevent regressions.

- **REQ-010 (Ubiquitous):** The system shall use Jest and JSDOM for unit and integration testing.
- **REQ-011 (State-driven):** While running tests, the system shall use mocked versions of Three.js objects to isolate logic.
- **REQ-012 (Event-driven):** When a test is executed, the system shall verify both success and failure (edge-case) scenarios for the target method.

---

## 4. Phase 3: Core 3D Features

### 4.1. Object Manipulation
**User Story:** As a user, I want to add, duplicate, and delete 3D objects so that I can build complex scenes.

- **REQ-013 (Event-driven):** When a user requests to duplicate an object, the system shall create a deep clone with a unique name and a position offset.
- **REQ-014 (Event-driven):** When an object is deleted, the system shall dispose of its geometry and material resources to prevent memory leaks.

### 4.2. Physics Simulation
**User Story:** As a user, I want to apply physics to objects so that I can simulate realistic interactions.

- **REQ-015 (Ubiquitous):** The system shall integrate `cannon-es` as the primary physics engine.
- **REQ-016 (State-driven):** While the physics simulation is active, the system shall synchronize the position and orientation of Three.js meshes with their corresponding physics bodies.
- **REQ-017 (Event-driven):** When a mesh is scaled or rotated, the system shall update the corresponding physics shape accordingly.

### 4.3. Shader Editing
**User Story:** As a power user, I want to write custom GLSL shaders so that I can create unique visual effects.

- **REQ-018 (Ubiquitous):** The system shall provide a code editor for Vertex and Fragment shaders.
- **REQ-019 (Event-driven):** When a shader is saved, the system shall compile it into a `THREE.ShaderMaterial` and apply it to the selected object.
- **REQ-020 (Unwanted Behavior):** If shader compilation fails, the system shall display the error log with line numbers in the UI.

---

## 5. Phase 4: UI/UX & Interaction

### 5.1. Scene Graph & Properties
**User Story:** As a user, I want a scene hierarchy view so that I can easily navigate and organize my project.

- **REQ-021 (Ubiquitous):** The system shall display a hierarchical list of all objects in the scene.
- **REQ-022 (Event-driven):** When an object is selected in the Scene Graph, the system shall highlight it in the 3D viewport and vice versa.
- **REQ-023 (Event-driven):** When a property is changed in the UI, the system shall update the 3D object in real-time.

---

## 6. Phase 5: Backend & Security

### 6.1. Data Persistence
**User Story:** As a user, I want to save and load my projects so that I can work across multiple sessions.

- **REQ-024 (Ubiquitous):** The system shall serialize scene data into a JSON-based format.
- **REQ-025 (Event-driven):** When loading a scene, the system shall clear all existing objects before reconstructing the new state.

### 6.2. Security
**User Story:** As a site administrator, I want the system to be secure so that user data and the server are protected from attacks.

- **REQ-026 (Ubiquitous):** The server shall use `helmet` middleware to set secure HTTP headers.
- **REQ-027 (Unwanted Behavior):** If a file upload contains path traversal sequences (e.g., `../`), the system shall reject the request.
- **REQ-028 (Ubiquitous):** The system shall implement rate limiting on sensitive API endpoints.

---

## 7. Phase 6: Future Roadmap

### 7.1. Collaboration
**User Story:** As a user, I want to collaborate with others in real-time so that we can build scenes together.

- **REQ-029 (Ubiquitous):** The system shall support real-time synchronization of object transformations across multiple clients.
- **REQ-030 (State-driven):** While multiple users are in a session, the system shall display presence indicators (e.g., live cursors).
