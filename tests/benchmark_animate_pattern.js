const ITERATIONS = 10000000; // 10 million

function runBenchmark() {
  console.log(`Running benchmark with ${ITERATIONS} iterations...`);

  // Mock RAF queue
  const queue = [];
  function mockRAF(cb) {
    queue.push(cb);
  }

  // Case 1: Closure
  if (global.gc) global.gc();
  const startClosure = process.hrtime.bigint();
  const startMemClosure = process.memoryUsage().heapUsed;

  let count1 = 0;
  const appClosure = {
    animate: function () {
      count1++;
      if (count1 < ITERATIONS) {
        // Allocation happens here: () => this.animate()
        mockRAF(() => this.animate());
      }
    },
  };

  appClosure.animate();

  while (queue.length > 0) {
    const cb = queue.pop();
    cb();
  }

  const endClosure = process.hrtime.bigint();
  const endMemClosure = process.memoryUsage().heapUsed;
  const durationClosure = Number(endClosure - startClosure) / 1e6; // ms

  console.log(
    `Closure Pattern: ${durationClosure.toFixed(2)}ms, Heap Delta: ${((endMemClosure - startMemClosure) / 1024).toFixed(2)} KB`,
  );

  // Case 2: Bound
  if (global.gc) global.gc();
  const startBound = process.hrtime.bigint();
  const startMemBound = process.memoryUsage().heapUsed;

  let count2 = 0;
  const appBound = {
    animate: function () {
      count2++;
      if (count2 < ITERATIONS) {
        mockRAF(this.animate);
      }
    },
  };
  // Bind once
  appBound.animate = appBound.animate.bind(appBound);

  appBound.animate();

  while (queue.length > 0) {
    const cb = queue.pop();
    cb();
  }

  const endBound = process.hrtime.bigint();
  const endMemBound = process.memoryUsage().heapUsed;
  const durationBound = Number(endBound - startBound) / 1e6; // ms

  console.log(
    `Bound Pattern:   ${durationBound.toFixed(2)}ms, Heap Delta: ${((endMemBound - startMemBound) / 1024).toFixed(2)} KB`,
  );

  const speedup = (durationClosure / durationBound).toFixed(2);
  console.log(`Speedup: ${speedup}x`);
}

runBenchmark();
