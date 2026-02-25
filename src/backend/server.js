import express from 'express';
import log from './logger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

const currentFilename = fileURLToPath(import.meta.url);
const currentDirname = path.dirname(currentFilename);

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
        workerSrc: ["'self'", 'blob:'],
      },
    },
  }),
);

app.use(cors());

// Serve index.html with injected nonce
const serveIndex = (req, res) => {
  const indexHtmlPath = path.join(currentDirname, '..', '..', 'dist', 'index.html');
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

app.use(express.static(path.join(currentDirname, '..', '..', 'dist')));

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
