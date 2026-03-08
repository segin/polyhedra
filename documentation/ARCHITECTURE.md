# Polyhedra Architecture

## Overview

**Polyhedra** is a web-based 3D modeling application that leverages **Node.js** for the backend and **Three.js** (WebGL) for the frontend. It is designed to be a lightweight, responsive, and mobile-optimized tool for creating and manipulating 3D primitives directly in the browser.

## Core Technology Stack

- **Frontend**:
  - **Three.js**: The core 3D rendering engine.
  - **WebGL**: Underlying graphics API.
  - **Vanilla JavaScript**: ES6+ modules for application logic.
  - **CSS3**: Styling for the UI (property panels, scene graph, etc.).
- **Backend**:
  - **Node.js**: Serves the application and static assets.
  - **Express** (implied/likely): Web server framework.
- **Storage**:
  - **JSZip**: Used for creating custom `.polyhedra` project files.
  - **JSON**: Scene graph and metadata serialization.
  - **Binary Buffers**: Efficient storage for geometry attributes (vertices, normals, UVs).

## System Components

### 1. Frontend Architecture (`src/frontend/`)

The frontend is built using a modular service-based architecture.

#### **Core Services**

- **`App` (`main.js`)**: The main entry point. Initializes the dependency injection container, core services, and application state.
- **`ServiceContainer` (`utils/ServiceContainer.js`)**: A simple Dependency Injection (DI) container that manages the lifecycle and retrieval of services (e.g., `Scene`, `Camera`, `EventBus`).
- **`EventBus` (`EventBus.js`)**: A singleton event aggregator used for decoupled communication between components (e.g., triggering `scene_loaded` or `selection_changed` events).
- **`StateManager` (`StateManager.js`)**: Manages global application state.

#### **Managers**

- **`ObjectManager`**: Centralizes the creation, deletion, and management of 3D objects. Handles `addPrimitive` calls.
- **`SceneManager`**: Manages scene-level operations like rendering loops, camera resizing, and background settings.
- **`PhysicsManager`**: Integrates **Cannon.js** for physics simulations (gravity, collisions).
- **`InputManager`**: Handles user input (keyboard shortcuts, mouse interactions).
- **`ToastManager`**: Displays non-intrusive notifications to the user.
- **`LightManager`**: Manages scene lighting setup.

#### **features**

- **`ShaderEditor`**: Provides an in-browser editor for modifying GLSL shaders on objects.
- **`SceneStorage`**: Handles serialization (save) and deserialization (load) of the scene using a Web Worker (`worker.js`) to prevent UI freezing.
- **`SceneGraphOutliner`**: A UI component that lists all objects in the scene, allowing for selection and visibility toggling.
- **`ObjectPropertyUpdater`**: Updates 3D object properties (geometry parameters, material colors) in real-time based on UI input.
- **`PrimitiveFactory`**: Factory pattern for generating Three.js geometries (Box, Sphere, etc.).
- **`Pointer`**: Handles raycasting for object selection and interaction.

### 2. Backend Architecture (`src/backend/`)

- **`server.js`**: A lightweight Node.js server responsible for serving the static frontend files. It ensures the application is accessible via a browser (typically `http://localhost:3000`).

## Data Formats

### **.polyhedra File Format**

The application uses a custom ZIP-based container for project files.

- **`scene.json`**: Contains the scene hierarchy, object metadata, and material properties.
- **`buffers.json`**: A mapping file that correlates geometry attributes to binary files.
- **`buffers/bin_*.bin`**: Raw binary data for geometry attributes (positions, normals), optimizing load times and file size.

## Testing Strategy

- **Framework**: **Jest** is the primary testing framework.
- **Environment**: **JSDOM** is used to simulate the browser environment for unit tests.
- **Mocking**: Extensive mocking of **Three.js** and **Cannon.js** is implemented (see `tests/__mocks__/`) to ensure fast, isolated unit tests without requiring a real WebGL context.
