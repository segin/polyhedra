# Tech Stack: Polyhedra

## Programming Languages
- **JavaScript (ES Modules):** The primary language for both frontend and backend development.
- **TypeScript:** Used for type-safe component and utility development where appropriate.

## Backend
- **Node.js:** The core JavaScript runtime environment.
- **Express.js:** Web server framework for managing API routes and serving the frontend.
- **Supertest:** Used for integration testing of the backend.

## Frontend
- **Three.js:** The primary 3D engine for rendering the modeling workspace.
- **React:** UI library for building the application's interface and property panels.
- **dat.gui:** A lightweight graphical user interface for changing variables in JavaScript.
- **cannon-es:** Physics engine for 3D simulations.
- **three-csg-ts:** Library for constructive solid geometry operations.

## Storage & Assets
- **JSZip:** Used to create and manage the custom `.polyhedra` zip format for scene storage.
- **Assorted 3D Formats:** Support for importing external models, including `.blend`, `.obj`, and `.gltf`.

## Testing & Quality Assurance
- **Jest:** The primary testing framework for unit and integration tests.
- **ESLint & Prettier:** Tools for linting and formatting code consistently.

## Architecture
- **Monorepo:** Organized with dedicated `backend` and `frontend` directories for clear separation of concerns.
