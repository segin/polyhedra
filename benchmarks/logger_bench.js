// We need to mock console BEFORE importing logger because loglevel binds to console methods on import/initialization.
const originalConsoleInfo = console.info;
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.info = () => {};
console.log = () => {};
console.error = () => {};
console.warn = () => {};

// Use dynamic import
const { default: log } = await import("../src/backend/logger.js");

const iterations = 10000;
const simpleObject = { foo: "bar" };
const complexObject = {
  a: 1,
  b: "string",
  c: {
    d: [1, 2, 3],
    e: {
      f: "nested",
    },
  },
};

const circularObject = { ...complexObject };
circularObject.self = circularObject;

// Restore console.log specifically for our output (we keep others mocked to suppress logger)
// But wait, if I restore console.log, and the logger uses console.log (e.g. for .debug?), it might leak.
// log.info uses console.info.
// So I can restore console.log to print results.
console.log = originalConsoleLog;

console.log("Starting benchmark...");

// Warmup
for (let i = 0; i < 100; i++) {
  log.info("Warmup", i);
}

const startSimple = process.hrtime.bigint();
for (let i = 0; i < iterations; i++) {
  log.info("Simple message", i);
}
const endSimple = process.hrtime.bigint();

const startComplex = process.hrtime.bigint();
for (let i = 0; i < iterations; i++) {
  log.info("Complex message", complexObject);
}
const endComplex = process.hrtime.bigint();

console.log(`Simple logs: ${Number(endSimple - startSimple) / 1e6} ms`);
console.log(`Complex logs: ${Number(endComplex - startComplex) / 1e6} ms`);

try {
  log.info("Circular message", circularObject);
  console.log("Circular log: SUCCESS");
} catch (e) {
  console.log("Circular log: FAILED (" + e.message + ")");
}

// Restore all
console.info = originalConsoleInfo;
console.error = originalConsoleError;
console.warn = originalConsoleWarn;
