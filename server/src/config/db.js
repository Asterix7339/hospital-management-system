// src/config/db.js
// Creates a MySQL connection pool.
// A pool maintains multiple open connections and reuses them efficiently.
// This is far better than opening/closing a new connection on every request.

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST,
  port:               parseInt(process.env.DB_PORT, 10),
  database:           process.env.DB_NAME,
  user:               process.env.DB_USER,
  password:           process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit:    parseInt(process.env.DB_POOL_SIZE || '10', 10),
  queueLimit:         0,
  timezone:           '+00:00',
});

// Test the connection immediately when this module is loaded
async function connectDB() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully to:', process.env.DB_NAME);
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = { pool, connectDB };