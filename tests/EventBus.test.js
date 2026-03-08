// tests/EventBus.test.js

import EventBus from "../src/frontend/EventBus";

describe("EventBus", () => {
  let callback;

  beforeEach(() => {
    callback = jest.fn();
    // Reset the event bus before each test
    EventBus.events = {};
  });

  test("should subscribe to an event", () => {
    EventBus.subscribe("testEvent", callback);
    EventBus.publish("testEvent", "testData");
    expect(callback).toHaveBeenCalledWith("testData");
  });

  test("should unsubscribe from an event", () => {
    EventBus.subscribe("testEvent", callback);
    EventBus.unsubscribe("testEvent", callback);
    EventBus.publish("testEvent", "testData");
    expect(callback).not.toHaveBeenCalled();
  });

  test("should publish an event to multiple subscribers", () => {
    const callback2 = jest.fn();
    EventBus.subscribe("testEvent", callback);
    EventBus.subscribe("testEvent", callback2);
    EventBus.publish("testEvent", "testData");
    expect(callback).toHaveBeenCalledWith("testData");
    expect(callback2).toHaveBeenCalledWith("testData");
  });

  test("should not fail when publishing an event with no subscribers", () => {
    expect(() =>
      EventBus.publish("nonExistentEvent", "testData"),
    ).not.toThrow();
  });

  test("should not fail when unsubscribing from an event that does not exist", () => {
    expect(() =>
      EventBus.unsubscribe("nonExistentEvent", callback),
    ).not.toThrow();
  });
});
