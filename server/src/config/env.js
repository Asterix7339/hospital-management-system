// src/config/env.js
// Validates all required environment variables on startup.
// If any are missing, the server crashes immediately with a clear error.
// This is called "fail-fast" — better to crash at startup than fail silently later.

const REQUIRED_VARS = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'JWT_ACCESS_EXPIRY',
  'JWT_REFRESH_EXPIRY',
  'CLIENT_URL',
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('Server startup aborted.');
    process.exit(1);
  }

  console.log('✅ Environment variables validated.');
}

module.exports = { validateEnv };