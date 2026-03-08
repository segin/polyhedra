# Polyhedra Code Audit Report

**Date:** 2026-02-11
**Status:** In Progress
**Auditor:** Antigravity

---

## 🛡️ Security Audit

### 1. Dependency Vulnerabilities

`npm audit` identified several vulnerabilities in core dependencies.

- **[CRITICAL]** `form-data`: Unsafe random function in выбирание boundaries.
- **[HIGH]** `qs` / `body-parser` / `express`: Memory exhaustion DoS via bracket notation.
- **[MODERATE]** `js-yaml`: Prototype pollution.

> [!IMPORTANT]
> **Recommendation:** Run `npm audit fix` and upgrade `express` to its latest secure version (>= 4.19.2).

### 2. Server Security Headers

- **Content Security Policy (CSP):** Well-implemented with per-request nonces. Nonces are correctly injected into script/style tags.
- **Rate Limiting:** `express-rate-limit` is correctly configured with a window of 15 minutes and 100 requests per IP.
- **Helmet:** Used effectively for general security headers.

---

## ⚡ Performance & Resource Management

### 1. Zombie Physics Bodies (Critical Leak)

There is a critical API mismatch between `ObjectManager` and `PhysicsManager`.

- **Finding:** `ObjectManager.deleteObject` calls `physicsManager.removeObject(object)`, but `PhysicsManager` only implements `removeBody(bodyToRemove)`.
- **Impact:** Physics bodies associated with deleted meshes are **never removed** from the CANNON.js world. This leads to a memory leak and invisible physical collisions that persist after object deletion.

### 2. Geometry Caching

- **Finding:** `PrimitiveFactory` creates a new instance of `THREE.Geometry` (BufferGeometry) for every 3D object, even for identical shapes.
- **Impact:** Increased memory footprint and slower instantiation for complex geometries (e.g., Teapot, Text).
- **Recommendation:** Implement a geometry cache by type/options in `PrimitiveFactory`.

### 3. Light Disposal

- **Finding:** `LightManager.removeLight` removes the light from the scene and internal array but does not call `.dispose()`.
- **Impact:** Minor GPU resource leak when repeatedly adding/removing lights.

---

## 🛠️ Code Quality & Consistency

### 1. API Consistency

- **Finding:** Mismatch in object removal naming (`removeObject` vs `removeBody`).
- **Recommendation:** Rename `removeBody` to `removeObject` in `PhysicsManager` or provide a wrapper/lookup by mesh.

### 2. History System

- **Finding:** Implements structural sharing (good!), but `_areObjectsEqual` performs manual comparison of complex Three.js objects.
- **Note:** This is currently stable but should be updated if more complex object types are added.

---

## 🚀 Priority Checklist for Fixes

1. [ ] Fix `PhysicsManager` API mismatch to stop resource leaks.
2. [ ] Update dependencies via `npm audit fix`.
3. [ ] Implement light disposal in `LightManager`.
4. [ ] Implement geometry caching in `PrimitiveFactory`.
