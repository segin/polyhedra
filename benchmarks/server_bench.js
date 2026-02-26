import http from 'http';
import { app } from '../src/backend/server.js';

// Start server on a random port
const server = app.listen(0, 'localhost', () => {
  const address = server.address();
  const port = address.port;
  console.log(`Benchmark server listening on port ${port}`);

  runBenchmark(port);
});

async function runBenchmark(port) {
  const numRequests = 50; // Keep under rate limit (100)
  const concurrency = 10;

  const times = [];

  console.log(`Starting benchmark: ${numRequests} requests, concurrency ${concurrency}`);

  const startTotal = performance.now();

  async function makeRequest() {
    return new Promise((resolve, reject) => {
      const start = performance.now();
      const req = http.get(`http://localhost:${port}/`, (res) => {
        // Read body to complete request
        res.on('data', () => {});
        res.on('end', () => {
          const end = performance.now();
          times.push(end - start);
          resolve();
        });
      });
      req.on('error', reject);
    });
  }

  // To strictly control number of requests:
  const tasks = Array.from({ length: numRequests }, () => makeRequest);

  // Batch of 10.
  for (let i = 0; i < numRequests; i += concurrency) {
      const batch = tasks.slice(i, i + concurrency).map(fn => fn());
      await Promise.all(batch);
  }

  const endTotal = performance.now();

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const max = Math.max(...times);
  const min = Math.min(...times);

  console.log(`Benchmark complete.`);
  console.log(`Total time: ${(endTotal - startTotal).toFixed(2)}ms`);
  console.log(`Requests: ${times.length}`);
  console.log(`Average latency: ${avg.toFixed(2)}ms`);
  console.log(`Min latency: ${min.toFixed(2)}ms`);
  console.log(`Max latency: ${max.toFixed(2)}ms`);
  console.log(`Throughput (approx): ${(times.length / ((endTotal - startTotal) / 1000)).toFixed(2)} req/sec`);

  server.close();
  process.exit(0);
}
