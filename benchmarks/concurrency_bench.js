import { performance } from 'perf_hooks';

async function runBenchmark() {
    const totalFiles = 200;
    const fileLoadTime = 10; // ms per "file" (simulated)
    const concurrencyLimit = 10;

    async function mockFileAsync(i) {
        // Simulate heavy work or decompression delay
        await new Promise(resolve => setTimeout(resolve, fileLoadTime));
        return new ArrayBuffer(1024 * 1024); // 1MB
    }

    console.log(`--- Benchmark Configuration ---`);
    console.log(`Total Files: ${totalFiles}`);
    console.log(`Simulated Load Time per File: ${fileLoadTime}ms`);
    console.log(`Concurrency Limit (Optimized): ${concurrencyLimit}`);
    console.log('-------------------------------\n');

    console.log('Running Baseline (Unlimited Concurrency)...');
    const start1 = performance.now();
    const baselineResults = await Promise.all(
        Array.from({ length: totalFiles }).map((_, i) => mockFileAsync(i))
    );
    const end1 = performance.now();
    const baselineTime = end1 - start1;
    console.log(`Baseline Total Time: ${baselineTime.toFixed(2)}ms`);

    console.log('\nRunning Optimized (Limited Concurrency)...');
    const start2 = performance.now();
    const optimizedResults = [];
    for (let i = 0; i < totalFiles; i += concurrencyLimit) {
        const chunk = Array.from({ length: Math.min(concurrencyLimit, totalFiles - i) }).map((_, j) => {
            return mockFileAsync(i + j);
        });
        optimizedResults.push(...(await Promise.all(chunk)));
    }
    const end2 = performance.now();
    const optimizedTime = end2 - start2;
    console.log(`Optimized Total Time: ${optimizedTime.toFixed(2)}ms`);

    console.log('\n--- Results Analysis ---');
    console.log(`Time Change: ${((optimizedTime / baselineTime - 1) * 100).toFixed(2)}%`);
    console.log(`Note: In a pure simulated environment with sufficient CPU/IO, limited concurrency is expected to be slower.`);
    console.log(`The actual benefit in a browser is reduced peak memory and improved main thread responsiveness.`);
}

runBenchmark();
