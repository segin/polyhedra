import { performance } from "perf_hooks";

const count = 10000;
const testObjects = Array.from({ length: count }, (_, i) => ({ id: i }));

function benchmarkArray() {
    const arr = [...testObjects];
    const start = performance.now();
    for (let i = 0; i < count; i++) {
        const index = arr.indexOf(testObjects[i]);
        if (index > -1) arr.splice(index, 1);
    }
    const end = performance.now();
    return end - start;
}

function benchmarkSet() {
    const set = new Set(testObjects);
    const start = performance.now();
    for (let i = 0; i < count; i++) {
        set.delete(testObjects[i]);
    }
    const end = performance.now();
    return end - start;
}

function benchmarkSetWithConversion() {
    const set = new Set(testObjects);
    const start = performance.now();
    // Simulate some operations that need array
    const arr = [...set];
    // removal
    set.delete(testObjects[0]);
    const end = performance.now();
    return end - start;
}

console.log(`Running benchmark with ${count} objects...`);

const arrayTime = benchmarkArray();
console.log(`Array indexOf + splice: ${arrayTime.toFixed(4)} ms`);

const setTime = benchmarkSet();
console.log(`Set delete: ${setTime.toFixed(4)} ms`);

const conversionTime = benchmarkSetWithConversion();
console.log(`Set conversion to Array ([...set]): ${conversionTime.toFixed(4)} ms`);

const totalSetTime = setTime + conversionTime;
console.log(`Set total (delete + conversion): ${totalSetTime.toFixed(4)} ms`);

const improvement = (arrayTime / totalSetTime).toFixed(2);
console.log(`Improvement factor: ${improvement}x`);
