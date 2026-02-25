import { app } from '../src/backend/server.js';

const PORT = 3001;

function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      resolve(server);
    });
  });
}

async function runBenchmark() {
  console.log('Starting server for benchmark...');
  let server;
  try {
      server = await startServer();
  } catch (e) {
      console.error("Failed to start server:", e);
      process.exit(1);
  }

  const baseUrl = `http://localhost:${PORT}`;

  console.log('Fetching index...');
  const start = performance.now();

  // 1. Fetch index.html
  const indexRes = await fetch(baseUrl + '/');
  const indexHtml = await indexRes.text();

  // 2. Parse script src and link href
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/g;
  const linkRegex = /<link[^>]+href=["']([^"']+)["']/g;

  const resources = [];
  let match;
  while ((match = scriptRegex.exec(indexHtml)) !== null) {
    if (!match[1].startsWith('data:')) resources.push(match[1]);
  }
  while ((match = linkRegex.exec(indexHtml)) !== null) {
    if (!match[1].startsWith('data:')) resources.push(match[1]);
  }

  // 3. Fetch module imports (from importmap if present)
  const importMapRegex = /<script type="importmap">\s*({[\s\S]*?})\s*<\/script>/;
  const importMapMatch = importMapRegex.exec(indexHtml);
  if (importMapMatch) {
      try {
          const importMap = JSON.parse(importMapMatch[1]);
          if (importMap.imports) {
              Object.values(importMap.imports).forEach(url => {
                  if (url.startsWith('/')) resources.push(url);
              });
          }
      } catch (e) {
          console.error("Failed to parse importmap", e);
      }
  }

  // Deduplicate
  const uniqueResources = [...new Set(resources)];

  console.log(`Found ${uniqueResources.length} resources to fetch.`);

  // 4. Fetch all resources concurrently
  let size = 0;
  const resourcePromises = uniqueResources.map(url => {
      const fullUrl = url.startsWith('http') ? url : baseUrl + (url.startsWith('/') ? '' : '/') + url;
      return fetch(fullUrl).then(async res => {
          if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
          const buffer = await res.arrayBuffer();
          size += buffer.byteLength;
      });
  });

  await Promise.all(resourcePromises);

  const end = performance.now();
  const duration = end - start;

  console.log('--------------------------------------------------');
  console.log(`Total load time: ${duration.toFixed(2)}ms`);
  console.log(`Total requests: ${1 + uniqueResources.length}`); // Index + resources
  console.log(`Total size: ${(size / 1024).toFixed(2)} KB`);
  console.log('--------------------------------------------------');

  server.close();
}

runBenchmark().catch(console.error);
