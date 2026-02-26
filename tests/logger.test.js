import log from "../src/backend/logger.js";

describe("Logger", () => {
  // Mock console methods to verify output without printing
  const originalConsoleInfo = console.info;
  const originalConsoleError = console.error;
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.fn();
    console.info = consoleSpy;
    console.error = consoleSpy;
    log.setLevel("info");
  });

  afterEach(() => {
    console.info = originalConsoleInfo;
    console.error = originalConsoleError;
  });

  test("should log simple object correctly", () => {
    const obj = { foo: "bar" };
    log.info("test", obj);
    expect(consoleSpy).toHaveBeenCalled();
    const args = consoleSpy.mock.calls[0][0]; // JSON string
    const parsed = JSON.parse(args);
    expect(parsed.message).toBe("test");
    expect(parsed.extra[0]).toEqual(obj);
  });

  test("should handle circular references without crashing", () => {
    const obj = { a: 1 };
    obj.self = obj;

    expect(() => {
      log.info("circular", obj);
    }).not.toThrow();

    expect(consoleSpy).toHaveBeenCalled();
    const args = consoleSpy.mock.calls[0][0]; // JSON string
    const parsed = JSON.parse(args);
    expect(parsed.message).toBe("circular");
    // Verify circular ref
    // extra is an array of args. extra[0] is obj.
    // obj.self should be "[Circular]"
    expect(parsed.extra[0].self).toBe("[Circular]");
  });
});
