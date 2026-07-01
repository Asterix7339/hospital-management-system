// server/scripts/seedAdmin.js
// One-off bootstrap: creates the first Admin user with a bcrypt-hashed password.
// Usage:  node scripts/seedAdmin.js
require('dotenv').config({ path: '.env.development' });
const { pool } = require('../src/config/db');
const { hashPassword } = require('../src/utils/password');

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Admin@12345'; // change after first login via /change-password

(async () => {
  try {
    // 1. Resolve the Admin role_id (seeded in your schema as role_name = 'Admin')
    const [roles] = await pool.execute(
      `SELECT role_id FROM roles WHERE role_name = 'Admin' LIMIT 1`
    );
    if (!roles.length) throw new Error("Role 'Admin' not found — is the roles table seeded?");
    const roleId = roles[0].role_id;

    // 2. Skip if this username already exists (idempotent)
    const [existing] = await pool.execute(
      `SELECT user_id FROM users WHERE username = ? LIMIT 1`,
      [ADMIN_USERNAME]
    );
    if (existing.length) {
      console.log(`ℹ️  User '${ADMIN_USERNAME}' already exists (user_id=${existing[0].user_id}). Nothing to do.`);
      return;
    }

    // 3. Hash the password and insert
    const passwordHash = await hashPassword(ADMIN_PASSWORD);
    const [result] = await pool.execute(
      `INSERT INTO users (role_id, username, password_hash, is_active, password_changed_at, created_at)
       VALUES (?, ?, ?, 1, NOW(), NOW())`,
      [roleId, ADMIN_USERNAME, passwordHash]
    );

    console.log('✅ Admin user created.');
    console.log(`   user_id : ${result.insertId}`);
    console.log(`   username: ${ADMIN_USERNAME}`);
    console.log(`   password: ${ADMIN_PASSWORD}   (change it after first login)`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();