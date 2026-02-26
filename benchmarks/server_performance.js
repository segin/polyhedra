import http from 'http';
import { app } from '../src/backend/server.js';
import { performance } from 'perf_hooks';

const PORT = 3001;
let server;

async function startServer() {
  return new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      resolve();
    });
  });
}

async function runBenchmark() {
  await startServer();

  const numRequests = 1000;
  const concurrentRequests = 10;
  let completed = 0;
  let totalTime = 0;

  console.log(`Starting benchmark with ${numRequests} requests...`);
  const startTime = performance.now();

  const makeRequest = () => {
    return new Promise((resolve, reject) => {
      const reqStart = performance.now();
      http.get(`http://localhost:${PORT}/`, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          const reqEnd = performance.now();
          totalTime += (reqEnd - reqStart);
          resolve();
        });
      }).on('error', reject);
    });
  };

  const pool = [];
  for (let i = 0; i < concurrentRequests; i++) {
    pool.push(Promise.resolve());
  }

  let index = 0;
  async function worker() {
    while (index < numRequests) {
      index++;
      await makeRequest();
      completed++;
      if (completed % 100 === 0) {
        process.stdout.write(`Completed ${completed}/${numRequests}\r`);
      }
    }
  }

  await Promise.all(Array(concurrentRequests).fill(0).map(worker));

  const endTime = performance.now();
  const duration = endTime - startTime;
  const avgTime = totalTime / numRequests;
  const rps = numRequests / (duration / 1000);

  console.log('\nBenchmark Results:');
  console.log(`Total Requests: ${numRequests}`);
  console.log(`Total Time: ${duration.toFixed(2)}ms`);
  console.log(`Average Request Time: ${avgTime.toFixed(2)}ms`);
  console.log(`Requests Per Second: ${rps.toFixed(2)}`);

  server.close();
  process.exit(0);
}

runBenchmark().catch(err => {
  console.error(err);
  process.exit(1);
});
