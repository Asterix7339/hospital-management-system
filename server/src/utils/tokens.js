// server/src/utils/tokens.js
const crypto = require('crypto');

/** Opaque refresh token sent to the client (raw value never stored). */
function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex'); // 96 hex chars
}

/** SHA-256 hex digest (64 chars) — this is what lands in refresh_tokens.token_hash. */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Rotation family identifier (UUID v4) — refresh_tokens.family_id CHAR(36). */
function generateFamilyId() {
  return crypto.randomUUID();
}

/** Absolute expiry for a new refresh token (now + N days). */
function refreshExpiryDate() {
  const days = parseInt(process.env.JWT_REFRESH_EXPIRY, 10) || 7;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

module.exports = { generateRefreshToken, hashToken, generateFamilyId, refreshExpiryDate };