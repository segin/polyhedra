/**
 * Verification test for Accessibility
 */

// Mock cannon-es is handled by jest.setup.cjs

describe("Accessibility Verification", () => {
  beforeEach(() => {
    // Setup environment (handled by jsdom environment)
    if (typeof document !== "undefined") {
      document.body.innerHTML =
        '<div id="scene-graph-panel"><ul id="objects-list"></ul></div><div id="scene-graph"></div><button id="fullscreen"></button><button id="save-scene"></button><button id="load-scene"></button><input type="file" id="file-input">';
    }

    global.requestAnimationFrame = jest.fn();
    global.URL = { createObjectURL: jest.fn(), revokeObjectURL: jest.fn() };
    global.Worker = jest.fn(() => ({
      postMessage: jest.fn(),
      addEventListener: jest.fn(),
    }));

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should create scene graph buttons with accessibility attributes", async () => {
    // Use App from src
    const { App } = await import("../src/frontend/main.js");
    const appInstance = new App();

    // Add a box to populate scene graph
    await appInstance.addBox();

    // Find the scene graph panel
    const panel = document.getElementById("scene-graph-panel");
    expect(panel).not.toBeNull();

    // Find the list items
    const listItems = panel.querySelectorAll("li");
    expect(listItems.length).toBeGreaterThan(0);

    const firstItem = listItems[0];

    // Check for buttons inside
    const buttons = firstItem.querySelectorAll("button");
    expect(buttons.length).toBe(2);

    const visibilityBtn = buttons[0];
    const deleteBtn = buttons[1];

    // Assert Accessibility Attributes
    expect(visibilityBtn.getAttribute("aria-label")).toBeTruthy();
    expect(visibilityBtn.getAttribute("title")).toBeTruthy();

    expect(deleteBtn.getAttribute("aria-label")).toBeTruthy();
    expect(deleteBtn.getAttribute("title")).toBeTruthy();
  });
});
