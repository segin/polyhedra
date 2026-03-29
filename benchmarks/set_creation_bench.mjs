import { performance } from 'node:perf_hooks';

const objectCount = 10000;
const iterations = 1000;
const objects = Array.from({ length: objectCount }, (_, i) => ({ uuid: `uuid-${i}` }));

console.log(`Benchmarking Set creation for ${objectCount} objects, ${iterations} iterations...`);

const start = performance.now();
for (let i = 0; i < iterations; i++) {
  const activeUuids = new Set(objects.map((o) => o.uuid));
}
const end = performance.now();

console.log(`Total time: ${(end - start).toFixed(2)}ms`);
console.log(`Average time per iteration: ${((end - start) / iterations).toFixed(4)}ms`);
