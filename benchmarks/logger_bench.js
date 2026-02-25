import log from '../src/backend/logger.js';
import { performance } from 'perf_hooks';

const ITERATIONS = 10000;

const simpleObject = { message: 'hello', value: 123 };
const complexObject = {
  nested: {
    array: [1, 2, 3, { deep: 'value' }],
    date: new Date(),
    buffer: Buffer.from('test'),
  },
  meta: {
    id: 1,
    tags: ['a', 'b', 'c'],
  }
};

// Silence console output to measure execution time more accurately
const originalConsoleInfo = console.info;
console.info = () => {};

console.log('Benchmarking logger...');

const startSimple = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  log.info('test simple', simpleObject);
}
const endSimple = performance.now();

const startComplex = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  log.info('test complex', complexObject);
}
const endComplex = performance.now();

// Restore console
console.info = originalConsoleInfo;

console.log(`Simple object (x${ITERATIONS}): ${(endSimple - startSimple).toFixed(2)}ms`);
console.log(`Complex object (x${ITERATIONS}): ${(endComplex - startComplex).toFixed(2)}ms`);
