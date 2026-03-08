/**
 * Accessibility tests for the 3D modeling application
 */
import * as THREE from "three";
import { App } from "../src/frontend/main.js";

jest.mock("cannon-es", () => ({
  World: jest.fn().mockImplementation(() => ({
    gravity: { set: jest.fn(), x: 0, y: -9.82, z: 0 },
    addBody: jest.fn(),
    removeBody: jest.fn(),
    step: jest.fn(),
  })),
  Vec3: jest
    .fn()
    .mockImplementation((x, y, z) => ({ x, y, z, set: jest.fn() })),
  Box: jest.fn(),
  Sphere: jest.fn(),
  Cylinder: jest.fn(),
  Body: jest.fn().mockImplementation((options) => ({
    position: options.position || { x: 0, y: 0, z: 0 },
    quaternion: options.quaternion || { x: 0, y: 0, z: 0, w: 1 },
    mass: options.mass || 0,
    addShape: jest.fn(),
  })),
  Quaternion: jest
    .fn()
    .mockImplementation((x, y, z, w) => ({ x, y, z, w, set: jest.fn() })),
}));

describe("Scene Graph Accessibility", () => {
  let app;

  beforeEach(() => {
    // Setup DOM environment
    document.body.innerHTML = `
            <div id="scene-graph-panel">
                <ul id="objects-list"></ul>
            </div>
            <div id="inspector-panel"></div>
        `;

    // Spy on requestAnimationFrame to prevent recursion
    jest.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);

    app = new App();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("Scene graph list items should have accessibility attributes", async () => {
    await app.addBox();
    const listItems = document.querySelectorAll("#objects-list li");
    expect(listItems.length).toBeGreaterThan(0);

    listItems.forEach((item) => {
      // These attributes should be present for better accessibility
      expect(item.getAttribute("role")).toBe("button");
      expect(item.getAttribute("tabindex")).toBe("0");
    });
  });

  it("Visibility and Delete buttons should have ARIA labels", async () => {
    await app.addBox();
    const firstItem = document.querySelector("#objects-list li");
    const visibilityBtn = firstItem.querySelector(".visibility-btn");
    const deleteBtn = firstItem.querySelector(".delete-btn");

    expect(visibilityBtn.getAttribute("aria-label")).toBeDefined();
    expect(deleteBtn.getAttribute("aria-label")).toBeDefined();
  });
});
