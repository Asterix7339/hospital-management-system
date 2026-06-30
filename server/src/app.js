// src/app.js
// Express application factory.
// Configures all middleware and mounts routes.
// Kept separate from server.js so it can be imported in tests without starting a server.

const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const routes       = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Security Headers ─────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true, // lets the httpOnly refresh cookie flow
}));

// ── Body & Cookie Parsers ────────────────────────────────
// MUST run before routes so req.body and req.cookies are populated.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Global Rate Limiter ──────────────────────────────────
// 100 requests / 15 min / IP across the whole API.
// (Login has its own stricter 10/15min limiter inside auth.routes.js.)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  standardHeaders: true,
  legacyHeaders:   false,
  message:  { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', globalLimiter);

// ── Health Checks ────────────────────────────────────────
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HMS API is running',
    version: 'v1',
    environment: process.env.NODE_ENV,
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success:     true,
    message:     'HMS API is healthy',
    version:     'v1',
    environment: process.env.NODE_ENV,
    timestamp:   new Date().toISOString(),
    database:    'hms_db',
  });
});

// ── Module Routes ────────────────────────────────────────
// Mounted AFTER parsers/limiters, BEFORE the 404 handler.
app.use('/api/v1', routes);

// ── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler (MUST be the very last middleware) ──
app.use(errorHandler);

module.exports = app;

