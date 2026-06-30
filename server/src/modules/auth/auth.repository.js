// server/src/modules/auth/auth.repository.js
const { pool } = require('../../config/db'); // <-- the fix: destructure { pool }

/* ─────────────── USERS ─────────────── */

// Login lookup — identity + role + (optional) employee context for the response envelope.
// LEFT JOIN on employees so a bootstrap Admin without an employee row can still log in.
async function findByUsername(username) {
  const [rows] = await pool.execute(
    `SELECT u.user_id, u.username, u.password_hash, u.is_active,
            u.failed_login_attempts, u.locked_until,
            r.role_id, r.role_name,
            e.employee_id, e.first_name, e.last_name
       FROM users u
       JOIN roles r          ON r.role_id = u.role_id
       LEFT JOIN employees e ON e.user_id = u.user_id
      WHERE u.username = ?
      LIMIT 1`,
    [username]
  );
  return rows[0] || null;
}

// Used by GET /me and by POST /refresh (to rebuild the JWT payload + re-check is_active).
async function findById(userId) {
  const [rows] = await pool.execute(
    `SELECT u.user_id, u.username, u.password_hash, u.is_active,
            r.role_id, r.role_name,
            e.employee_id, e.first_name, e.last_name
       FROM users u
       JOIN roles r          ON r.role_id = u.role_id
       LEFT JOIN employees e ON e.user_id = u.user_id
      WHERE u.user_id = ?
      LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

async function incrementFailedAttempts(userId) {
  await pool.execute(
    `UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE user_id = ?`,
    [userId]
  );
}

async function lockAccount(userId, lockedUntil) {
  await pool.execute(
    `UPDATE users SET locked_until = ? WHERE user_id = ?`,
    [lockedUntil, userId]
  );
}

async function resetFailedAttempts(userId) {
  await pool.execute(
    `UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE user_id = ?`,
    [userId]
  );
}

async function updateLastLogin(userId) {
  await pool.execute(`UPDATE users SET last_login = NOW() WHERE user_id = ?`, [userId]);
}

async function updatePassword(userId, passwordHash) {
  await pool.execute(
    `UPDATE users SET password_hash = ?, password_changed_at = NOW() WHERE user_id = ?`,
    [passwordHash, userId]
  );
}

/* ─────────────── REFRESH TOKENS ─────────────── */

async function insertRefreshToken({ userId, tokenHash, familyId, expiresAt, ipAddress, userAgent }) {
  await pool.execute(
    `INSERT INTO refresh_tokens
       (user_id, token_hash, family_id, expires_at, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, tokenHash, familyId, expiresAt, ipAddress ?? null, userAgent ?? null]
  );
}

async function findRefreshByHash(tokenHash) {
  const [rows] = await pool.execute(
    `SELECT token_id, user_id, token_hash, family_id, is_used, is_revoked, expires_at
       FROM refresh_tokens
      WHERE token_hash = ?
      LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
}

async function markRefreshUsed(tokenId) {
  await pool.execute(`UPDATE refresh_tokens SET is_used = 1 WHERE token_id = ?`, [tokenId]);
}

// Theft response: kill every token in the rotation family.
async function revokeFamily(familyId) {
  await pool.execute(`UPDATE refresh_tokens SET is_revoked = 1 WHERE family_id = ?`, [familyId]);
}

// Logout: revoke the single presented refresh token.
async function revokeRefreshByHash(tokenHash) {
  await pool.execute(`UPDATE refresh_tokens SET is_revoked = 1 WHERE token_hash = ?`, [tokenHash]);
}

// Force re-login everywhere (used after a password change).
async function revokeAllForUser(userId) {
  await pool.execute(
    `UPDATE refresh_tokens SET is_revoked = 1 WHERE user_id = ? AND is_revoked = 0`,
    [userId]
  );
}

/* ─────────────── AUDIT ─────────────── */

async function writeAudit({
  userId, action, entity = null, entityId = null,
  ipAddress = null, userAgent = null, details = null,
}) {
  await pool.execute(
    `INSERT INTO audit_logs
       (user_id, action, entity, entity_id, ip_address, user_agent, details)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId ?? null, action, entity, entityId, ipAddress, userAgent, details ? JSON.stringify(details) : null]
  );
}

module.exports = {
  findByUsername, findById,
  incrementFailedAttempts, lockAccount, resetFailedAttempts, updateLastLogin, updatePassword,
  insertRefreshToken, findRefreshByHash, markRefreshUsed,
  revokeFamily, revokeRefreshByHash, revokeAllForUser,
  writeAudit,
};