# Implementation Plan: Codebase Optimization and Modularization

## Phase 1: Specialized Geometry Caching
Focus: Implement caching for Teapot, Tube, and Extrude geometries in `PrimitiveFactory.js`.

- [ ] Task: Write benchmark/test to verify current regeneration of specialized geometries
- [ ] Task: Implement `Teapot` caching in `PrimitiveFactory.js`
- [ ] Task: Implement `Tube` caching in `PrimitiveFactory.js`
- [ ] Task: Implement `Extrude` caching in `PrimitiveFactory.js`
- [ ] Task: Verify performance improvements with benchmarks
- [ ] Task: Conductor - User Manual Verification 'Specialized Geometry Caching' (Protocol in workflow.md)

## Phase 2: Strategic Modularization of main.js
Focus: Extract core responsibilities from `main.js` into independent, testable modules.

- [ ] Task: Write failing integration tests for the new `UIManager`
- [ ] Task: Extract UI/DOM management to `src/frontend/UIManager.js`
- [ ] Task: Write failing unit tests for the new `HistoryManager`
- [ ] Task: Extract undo/redo logic to `src/frontend/HistoryManager.js`
- [ ] Task: Write failing unit tests for the new `InputManager`
- [ ] Task: Extract input handling to `src/frontend/InputManager.js`
- [ ] Task: Refactor `src/frontend/main.js` to integrate the new managers and reduce its line count
- [ ] Task: Verify all existing tests pass after the refactor
- [ ] Task: Conductor - User Manual Verification 'Strategic Modularization' (Protocol in workflow.md)

## Phase 3: Audit Tooling Enhancement
Focus: Improve the accuracy and depth of the automated audit scripts.

- [ ] Task: Write test cases for complex code structures that the current metrics script fails to analyze correctly
- [ ] Task: Implement AST-based (or improved regex) complexity analysis in `scripts/audit_metrics.cjs`
- [ ] Task: Update `scripts/audit_secrets.cjs` with expanded patterns and better exclusion handling
- [ ] Task: Standardize the output format of all audit scripts
- [ ] Task: Verify the new audit scripts against the current codebase
- [ ] Task: Conductor - User Manual Verification 'Audit Tooling' (Protocol in workflow.md)
