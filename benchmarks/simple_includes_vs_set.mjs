
import { performance } from 'node:perf_hooks';

const count = 30000;
const arr = [];
const set = new Set();
const items = Array.from({ length: count }, () => ({}));

console.log(`Benchmarking ${count} items`);

let start = performance.now();
for (const item of items) {
    if (!arr.includes(item)) arr.push(item);
}
let end = performance.now();
console.log(`Array includes: ${(end - start).toFixed(3)} ms`);

start = performance.now();
for (const item of items) {
    if (!set.has(item)) {
        set.add(item);
    }
}
end = performance.now();
console.log(`Set has: ${(end - start).toFixed(3)} ms`);
