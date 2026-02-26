
import { performance } from 'perf_hooks';

const size = 1000 * 1000 * 3; // 3M floats
const array = new Float32Array(size);

const start = performance.now();
const result = Array.from(array);
const end = performance.now();

console.log(`Array.from(Float32Array(${size})): ${end - start}ms`);
console.log(`Result length: ${result.length}`);
