# Specification: Codebase Optimization and Modularization

## Overview
This track addresses performance bottlenecks, code maintainability risks, and tooling limitations identified during the March 2026 codebase audit. The primary focus is on expanding geometry caching, refactoring the monolithic `main.js`, and enhancing automated audit scripts.

## Objectives
- **Performance:** Eliminate redundant geometry regeneration for specialized primitives.
- **Maintainability:** Reduce the complexity of the frontend entry point through a strategic structural overhaul.
- **Observability:** Improve the depth and accuracy of automated code quality and security audits.

## Scope

### 1. Geometry Caching Enhancement
- Update `PrimitiveFactory.js` to include caching for `Teapot`, `Tube`, and `Extrude` primitives.
- Implement robust cache key generation for these complex types (e.g., serializing path points or font parameters).
- Ensure memory is managed appropriately (disposal of unused cached geometries if necessary).

### 2. Strategic Modularization of main.js
- Break down the 1500+ line `src/frontend/main.js` into focused, independent modules.
- Potential new modules include:
    - `UIManager`: Handles DOM interaction, `dat.gui` setup, and toolbar management.
    - `HistoryManager`: Encapsulates undo/redo logic and state snapshots.
    - `CommandManager` or `InputHandler`: Separates input processing from application state management.
- Re-integrate these modules into a leaner `App` or `Engine` entry point.

### 3. Audit Tooling Improvements
- Enhance `scripts/audit_metrics.cjs` to use AST-based complexity analysis (or improved regex) rather than simple line/branch counts.
- Improve `scripts/audit_secrets.cjs` with more comprehensive pattern matching and exclusion lists.
- Standardize the audit report format for better automated parsing.

## Functional Requirements
- The application must maintain all existing functionality throughout and after the refactor.
- Specialized primitives must load visibly faster or with lower memory overhead in repeated creation scenarios.
- The UI must remain fully responsive and correctly wired to the modularized backend.

## Non-Functional Requirements
- **Performance:** Measurable reduction in geometry creation time for complex primitives.
- **Maintainability:** `main.js` should ideally be reduced by at least 50% in line count.
- **Test Integrity:** 100% of existing tests must pass; new tests must be added for all new modules.
- **Code Coverage:** Maintain a minimum of 96% code coverage across all modified modules.

## Acceptance Criteria
- [ ] Benchmarks for specialized primitives show significant reuse of cached geometries.
- [ ] `src/frontend/main.js` is refactored into at least 3 new modular files.
- [ ] Automated audit scripts provide more detailed and accurate reports.
- [ ] `npm test` passes with no regressions.
- [ ] All code follows established style guides and architectural patterns.

## Out of Scope
- Adding new 3D features or primitives.
- Major UI/UX redesign (beyond functional parity in the refactor).
- Replacing the core physics or rendering engines.
