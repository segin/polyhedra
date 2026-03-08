import { performance } from "perf_hooks";

class TestClass {
  constructor() {
    this.value = 0;
    this.animateBound = this.animate.bind(this);
  }

  animate() {
    this.value++;
  }
}

const N = 10000000; // 10 million iterations to make it measurable
const instance = new TestClass();

function scheduler(callback) {
  // Simulate requestAnimationFrame accepting a callback
  return callback;
}

console.log(`Running benchmark with N = ${N} iterations...`);

// Measure Baseline: creating a bind every time
const startA = performance.now();
for (let i = 0; i < N; i++) {
  scheduler(instance.animate.bind(instance));
}
const endA = performance.now();
const timeA = endA - startA;

// Measure Optimization: reusing bound method
const startB = performance.now();
for (let i = 0; i < N; i++) {
  scheduler(instance.animateBound);
}
const endB = performance.now();
const timeB = endB - startB;

console.log(`Baseline (bind every frame): ${timeA.toFixed(2)}ms`);
console.log(`Optimized (pre-bound):      ${timeB.toFixed(2)}ms`);
console.log(`Speedup:                    ${(timeA / timeB).toFixed(2)}x`);

if (timeB < timeA) {
  console.log("✅ Optimization confirmed: Pre-binding is faster.");
} else {
  console.log("⚠️ Optimization not significant in this micro-benchmark.");
}
