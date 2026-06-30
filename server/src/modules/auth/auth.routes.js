// server/src/modules/auth/auth.routes.js
const express = require('express');
const rateLimit = require('express-rate-limit');

const authController = require('./auth.controller');
const { loginRules, changePasswordRules } = require('./auth.validator');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/authMiddleware'); // built in Phase E

const router = express.Router();

// Per-IP brute-force wall in front of login (per-account lockout lives in the service).
const loginLimiter = rateLimit({
  windowMs: (parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MIN, 10) || 15) * 60 * 1000,
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX, 10) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts — please try again later' },
});

// AUTH-01  Public
router.post('/login', loginLimiter, loginRules, validate, authController.login);

// AUTH-02  Public (auth proven via the refresh cookie itself)
router.post('/refresh', authController.refresh);

// AUTH-03  Authenticated
router.post('/logout', authenticate, authController.logout);

// AUTH-04  Authenticated
router.get('/me', authenticate, authController.me);

// AUTH-05  Authenticated
router.patch('/change-password', authenticate, changePasswordRules, validate, authController.changePassword);

module.exports = router;