// src/app.js
// Express application factory.
// Configures all middleware and mounts routes.
// Kept separate from server.js so it can be imported in tests without starting a server.

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');

const app = express();

// ── Security Headers ─────────────────────────────────────
// Helmet sets secure HTTP headers automatically
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────
// Only allow requests from your React frontend
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── Body Parsers ─────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Global Rate Limiter ───────────────────────────────────
// Max 100 requests per 15 minutes per IP (for general routes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', globalLimiter);

// ── Stricter Rate Limiter for Auth ────────────────────────
// Max 20 login attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message:  { success: false, message: 'Too many login attempts. Please try again later.' },
});
app.use('/api/v1/auth', authLimiter);

// ── Health Check ──────────────────────────────────────────
// Simple endpoint to verify the API is running
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HMS API is running',
    version: 'v1',
    environment: process.env.NODE_ENV,
  });
});

// ── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ──────────────────────────────────
// Must have 4 parameters — Express identifies error handlers by (err, req, res, next)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;