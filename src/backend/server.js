import express from 'express';
import log from './logger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import next from 'next';

const currentFilename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const currentDirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(currentFilename);

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

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

// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "'unsafe-eval'", (req, res) => `'nonce-${res.locals.cspNonce}'`], // added unsafe-eval for Next dev
//         styleSrc: ["'self'", "'unsafe-inline'", (req, res) => `'nonce-${res.locals.cspNonce}'`], // added unsafe-inline for Next dev
//         imgSrc: ["'self'", 'data:', 'blob:'],
//         connectSrc: ["'self'", 'ws:', 'wss:'], // Allow websockets for Next HMR
//         fontSrc: ["'self'", 'data:'],
//         objectSrc: ["'none'"],
//         mediaSrc: ["'self'"],
//         frameSrc: ["'none'"],
//       },
//     },
//   }),
// );

app.use(cors());

// Serve bundled/vendor assets (AUDIT-SEC-003)
app.use('/modules', express.static(path.join(currentDirname, '..', 'frontend', 'vendor')));
app.use('/utils', express.static(path.join(currentDirname, '..', 'frontend', 'vendor')));

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Let Next.js handle all other requests
app.all('*', (req, res) => {
  return handle(req, res);
});

// Centralized error handler
app.use((err, req, res, _next) => {
  log.error(err.stack);
  res.status(500).send('Something broke!');
});

let server;

if (process.argv[1] === currentFilename) {
  nextApp.prepare().then(() => {
    server = app.listen(port, '0.0.0.0', () => {
      log.info(`Server listening at http://localhost:${port}`);
    });

    process.on('SIGINT', () => {
      log.info('SIGINT signal received: closing HTTP server');
      server.close(() => {
        log.info('HTTP server closed');
        process.exit(0);
      });
    });
  }).catch((err) => {
    log.error('Failed to start Next.js', err);
    process.exit(1);
  });
}

export { app, server, nextApp };
