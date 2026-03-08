# Architecture Overview

This document serves as a critical, living template designed to equip agents and developers with a rapid and comprehensive understanding of the **Polyhedra** codebase's architecture, enabling efficient navigation and effective contribution from day one. Update this document as the codebase evolves.

## 1. Project Structure

This section provides a high-level overview of the project's directory and file structure, categorized by architectural layer or major functional area.

```text
polyhedra/
├── src/
│   ├── backend/          # Node.js server to host the application
│   │   └── server.js     # Express server handling static files, CSP, and rate limiting
│   └── frontend/         # Client-side 3D application
│       ├── vendor/       # Local copies of vendored dependencies (Three.js, etc.)
│       ├── utils/        # Utility functions and helpers
│       ├── main.js       # Main application entry point (App class)
│       ├── ObjectManager.js
│       ├── PrimitiveFactory.js
│       ├── SceneManager.js
│       ├── SceneStorage.js # Local storage and .polyhedra zip file handling
│       ├── index.html    # Main HTML entry point
│       └── style.css     # Vanilla CSS styling
├── tests/                # Unit and integration tests (Jest)
├── scripts/              # Build and utility scripts (copy-vendor.js, etc.)
├── benchmarks/           # Performance benchmarking scripts
├── documentation/        # Additional project documentation
├── package.json          # Node dependencies and npm scripts
├── jest.config.cjs       # Jest test configuration
└── ARCHITECTURE.md       # This document
```

## 2. High-Level System Diagram

The architecture is currently a client-heavy web application with a lightweight Express backend serving static physical files and providing basic security headers. Data is persisted client-side or as downloaded files.

```text
[User] <--> [Browser Interface (HTML/CSS/JS + WebGL Canvas)] <--> [Express Backend Server]
                  |
                  v
       [Local Storage / .polyhedra Zip Files]
```

## 3. Core Components

### 3.1. Frontend Web App

- **Name:** Polyhedra Web Editor
- **Description:** The main user interface for interacting with the 3D scene, creating primitives, manipulating objects, managing history, and saving/loading projects.
- **Technologies:** Vanilla HTML/CSS/JavaScript, Three.js (WebGL), dat.gui (UI controls), cannon-es (Physics).
- **Deployment:** Served statically via the backend, but can be deployed to any static host (Netlify, Vercel, GitHub Pages).

### 3.2. Backend Services

#### 3.2.1. Static File Server

- **Name:** Polyhedra Express Server
- **Description:** Handles static file serving for the frontend application, injects generated CSP nonces for security, and implements basic rate limiting to prevent abuse.
- **Technologies:** Node.js, Express, Helmet, express-rate-limit.
- **Deployment:** Docker container, local Node.js runtime, or standard PaaS environments.

## 4. Data Stores

### 4.1. Browser Target Storage

- **Name:** Key-Value Store & Filesystem Downloads
- **Type:** Browser `localStorage` / Custom `.polyhedra` ZIP files.
- **Purpose:**
  - `localStorage` is used to persist the user's workspace temporarily between page reloads.
  - `.polyhedra` files use `JSZip` to store `scene.json` and associated resources for sharing and durable storage.

## 5. External Integrations / APIs

Currently, there are no mandatory external 3rd-party API integrations. The application runs entirely locally or self-hosted and does not rely on external cloud telemetry or payment services.

## 6. Deployment & Infrastructure

- **Cloud Provider:** Agnostic (Can be run anywhere Node.js or Docker runs)
- **Key Services Used:** Simple HTTP servers.
- **CI/CD Pipeline:** Husky pre-commit hooks (lint-staged). Tested via GitHub Actions organically.
- **Monitoring & Logging:** `loglevel` used on the frontend; standard Node console logging on the backend.

## 7. Security Considerations

- **Authentication/Authorization:** None required (local single-user tool).
- **Content Security Policy (CSP):** Strict CSP enforced via `helmet`. Uses dynamic nonces to allow safe inline scripts and styles while blocking external malicious injections.
- **Rate Limiting:** IP-based rate limiting on the Express server to mitigate simple denial-of-service attempts.

## 8. Development & Testing Environment

- **Local Setup Instructions:** Run `npm install`, then `npm start`. App will be served on `localhost:3000`.
- **Testing Frameworks:** Jest (with `jest-environment-jsdom` and `jest-canvas-mock`).
- **Code Quality Tools:** ESLint, Prettier, Husky.

## 9. Future Considerations / Roadmap

- Migrate monolithic elements into a more structured modular format where possible.
- Improve test mocking to avoid circular JSON serialization issues with Three.js objects.
- Expand Constructive Solid Geometry (CSG) capabilities.

## 10. Project Identification

- **Project Name:** Polyhedra
- **Repository URL:** https://github.com/segin/polyhedra
- **Primary Contact/Team:** Kirn Gill II
- **Date of Last Update:** 2026-03-03

## 11. Glossary / Acronyms

- **CSG:** Constructive Solid Geometry (Boolean operations on 3D meshes).
- **CSP:** Content Security Policy.
- **Polyhedra:** The project name, referring to three-dimensional solid figures with flat polygonal faces.
