import express from 'express';
import log from './logger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// AUDIT-SEC-002: Implement rate limiting to prevent abuse.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: 'draft-7', // combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// Generate nonce for each request
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
        styleSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`], // Removed 'unsafe-inline', added nonce
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
  }),
);

app.use(cors());

// Serve modules from node_modules with proper MIME types
app.get('/modules/three.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(
    path.join(__dirname, '..', '..', 'node_modules', 'three', 'build', 'three.module.js'),
  );
});

app.get('/modules/OrbitControls.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(
    path.join(
      __dirname,
      '..',
      '..',
      'node_modules',
      'three',
      'examples',
      'jsm',
      'controls',
      'OrbitControls.js',
    ),
  );
});

app.get('/modules/OBJLoader.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(
    path.join(
      __dirname,
      '..',
      '..',
      'node_modules',
      'three',
      'examples',
      'jsm',
      'loaders',
      'OBJLoader.js',
    ),
  );
});

app.get('/modules/GLTFLoader.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(
    path.join(
      __dirname,
      '..',
      '..',
      'node_modules',
      'three',
      'examples',
      'jsm',
      'loaders',
      'GLTFLoader.js',
    ),
  );
});

app.get('/utils/BufferGeometryUtils.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(
    path.join(
      __dirname,
      '..',
      '..',
      'node_modules',
      'three',
      'examples',
      'jsm',
      'utils',
      'BufferGeometryUtils.js',
    ),
  );
});

app.get('/modules/TransformControls.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(
    path.join(
      __dirname,
      '..',
      '..',
      'node_modules',
      'three',
      'examples',
      'jsm',
      'controls',
      'TransformControls.js',
    ),
  );
});

app.get('/modules/dat.gui.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(
    path.join(__dirname, '..', '..', 'node_modules', 'dat.gui', 'build', 'dat.gui.module.js'),
  );
});

app.get('/modules/jszip.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '..', '..', 'node_modules', 'jszip', 'dist', 'jszip.min.js'));
});

// Serve three.min.js for web worker
app.get('/modules/three.min.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '..', '..', 'node_modules', 'three', 'build', 'three.min.js'));
});

app.get('/modules/loglevel.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(
    path.join(__dirname, '..', '..', 'node_modules', 'loglevel', 'dist', 'loglevel.min.js'),
  );
});

// Serve cannon-es
app.get('/modules/cannon-es.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(
    path.join(__dirname, '..', '..', 'node_modules', 'cannon-es', 'dist', 'cannon-es.js'),
  );
});

// Serve three-csg-ts
app.get('/modules/three-csg-ts.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '..', '..', 'node_modules', 'three-csg-ts', 'index.js'));
});

// Serve extra three examples
app.get('/modules/TeapotGeometry.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(
    path.join(
      __dirname,
      '..',
      '..',
      'node_modules',
      'three',
      'examples',
      'jsm',
      'geometries',
      'TeapotGeometry.js',
    ),
  );
});

app.get('/modules/FontLoader.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(
    path.join(
      __dirname,
      '..',
      '..',
      'node_modules',
      'three',
      'examples',
      'jsm',
      'loaders',
      'FontLoader.js',
    ),
  );
});

app.get('/modules/TextGeometry.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(
    path.join(
      __dirname,
      '..',
      '..',
      'node_modules',
      'three',
      'examples',
      'jsm',
      'geometries',
      'TextGeometry.js',
    ),
  );
});

// Serve index.html with injected nonce
const serveIndex = (req, res) => {
  const indexHtmlPath = path.join(__dirname, '..', 'frontend', 'index.html');
  fs.readFile(indexHtmlPath, 'utf8', (err, data) => {
    if (err) {
      log.error('Failed to read index.html:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    // Inject nonces into all script and style tags
    const injectedHtml = data.replace(
      /<script /g,
      `<script nonce="${res.locals.cspNonce}" `
    ).replace(
      /<style>/g,
      `<style nonce="${res.locals.cspNonce}">`
    ).replace(
      /<link rel="stylesheet"/g,
      `<link rel="stylesheet" nonce="${res.locals.cspNonce}"`
    );
    res.send(injectedHtml);
  });
};

app.get('/', serveIndex);
app.get('/index.html', serveIndex);

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Centralized error handler
app.use((err, req, res, next) => {
  log.error(err.stack);
  res.status(500).send('Something broke!');
});

let server;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server = app.listen(port, '0.0.0.0', () => {
    log.info(`Server listening at http://localhost:${port}`);
  });

  process.on('SIGINT', () => {
    log.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
      log.info('HTTP server closed');
    });
  });
}

export { app, server };
