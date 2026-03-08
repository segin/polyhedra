import { StateManager } from "../frontend/StateManager.js";

describe("StateManager", () => {
  let stateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  test("initial state is correct", () => {
    const state = stateManager.getState();
    expect(state).toEqual({
      selection: [],
      toolMode: "select",
      clipboard: null,
      isDragging: false,
      sceneDirty: false,
    });
  });

  test("getState returns a frozen object", () => {
    const state = stateManager.getState();
    expect(Object.isFrozen(state)).toBe(true);

    // Attempting to modify should fail (in strict mode) or be ignored
    try {
      state.toolMode = "move";
    } catch (e) {
      // Expected in strict mode
    }
    expect(state.toolMode).toBe("select");
  });

  test("setState updates state correctly", () => {
    stateManager.setState({ toolMode: "move", isDragging: true });
    const state = stateManager.getState();
    expect(state.toolMode).toBe("move");
    expect(state.isDragging).toBe(true);
    expect(state.sceneDirty).toBe(false); // unchanged
  });

  test("subscribe fires callback on change", () => {
    const callback = jest.fn();
    stateManager.subscribe("toolMode", callback);

    stateManager.setState({ toolMode: "rotate" });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      "rotate",
      expect.objectContaining({ toolMode: "rotate" }),
    );
  });

  test("subscribe does not fire if value is unchanged", () => {
    const callback = jest.fn();
    stateManager.subscribe("toolMode", callback);

    stateManager.setState({ toolMode: "select" }); // Initial value is 'select'

    expect(callback).not.toHaveBeenCalled();
  });

  test("subscribe does not fire for irrelevant keys", () => {
    const callback = jest.fn();
    stateManager.subscribe("toolMode", callback);

    stateManager.setState({ isDragging: true });

    expect(callback).not.toHaveBeenCalled();
  });

  test("multiple updates fire multiple callbacks", () => {
    const toolModeCb = jest.fn();
    const draggingCb = jest.fn();

    stateManager.subscribe("toolMode", toolModeCb);
    stateManager.subscribe("isDragging", draggingCb);

    stateManager.setState({ toolMode: "scale", isDragging: true });

    expect(toolModeCb).toHaveBeenCalledTimes(1);
    expect(toolModeCb).toHaveBeenCalledWith("scale", expect.anything());
    expect(draggingCb).toHaveBeenCalledTimes(1);
    expect(draggingCb).toHaveBeenCalledWith(true, expect.anything());
  });

  test("unsubscribe works", () => {
    const callback = jest.fn();
    const unsubscribe = stateManager.subscribe("toolMode", callback);

    stateManager.setState({ toolMode: "move" });
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
    stateManager.setState({ toolMode: "select" });
    expect(callback).toHaveBeenCalledTimes(1); // Should not have been called again
  });
});
