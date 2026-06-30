// server/src/routes/index.js
// Central route hub. Every module router mounts here under /api/v1.

const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');

const router = express.Router();

// Module routers
router.use('/auth', authRoutes); // => /api/v1/auth/*

module.exports = router;