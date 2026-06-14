// server.js
// Application entry point.
// Loads environment variables, validates them, connects to DB, then starts the server.

require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const { validateEnv } = require('./src/config/env');
const { connectDB }   = require('./src/config/db');
const app             = require('./src/app');

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Step 1: Validate all required environment variables
  validateEnv();

  // Step 2: Verify database connection
  await connectDB();

  // Step 3: Start the HTTP server
  app.listen(PORT, () => {
    console.log(`🚀 HMS API running on http://localhost:${PORT}/api/v1`);
    console.log(`📦 Environment: ${process.env.NODE_ENV}`);
  });
}

startServer();