// server/src/modules/auth/auth.service.js
const authRepository = require('./auth.repository');
const { comparePassword, hashPassword } = require('../../utils/password');
const { signAccessToken } = require('../../config/jwt');
const {
  generateRefreshToken, hashToken, generateFamilyId, refreshExpiryDate,
} = require('../../utils/tokens');
const {
  UnauthorizedError, NotFoundError, LockedError,
} = require('../../utils/errors/AppError');

const MAX_ATTEMPTS = parseInt(process.env.LOGIN_MAX_ATTEMPTS, 10) || 5;
const LOCK_MINUTES = parseInt(process.env.ACCOUNT_LOCK_MINUTES, 10) || 15;

/* ─────────────── helpers ─────────────── */

// Convert "1h" / "15m" / "3600" into seconds for the response's expiresIn field.
function accessExpiresInSeconds() {
  const raw = String(process.env.JWT_ACCESS_EXPIRY || '1h');
  const m = raw.match(/^(\d+)([smhd])?$/);
  if (!m) return 3600;
  const mult = { s: 1, m: 60, h: 3600, d: 86400 }[m[2] || 's'];
  return parseInt(m[1], 10) * mult;
}

// Shape the user object exactly as the API spec's response envelope expects.
function buildUser(row) {
  const user = { user_id: row.user_id, username: row.username, role: row.role_name };
  if (row.employee_id) {
    user.employee = {
      employee_id: row.employee_id,
      first_name: row.first_name,
      last_name: row.last_name,
    };
  }
  return user;
}

// Mint an access token + a fresh refresh token, and persist the refresh hash.
async function issueSession(userRow, familyId, context) {
  const payload = {
    user_id: userRow.user_id,
    role_id: userRow.role_id,
    role_name: userRow.role_name,
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = generateRefreshToken();

  await authRepository.insertRefreshToken({
    userId: userRow.user_id,
    tokenHash: hashToken(refreshToken), // store the HASH, never the raw token
    familyId,
    expiresAt: refreshExpiryDate(),
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  });

  return { accessToken, refreshToken };
}

// On a wrong password: count the failure, and lock the account at the threshold.
async function handleFailedLogin(user, context) {
  await authRepository.incrementFailedAttempts(user.user_id);
  const attempts = user.failed_login_attempts + 1; // value AFTER this failure

  if (attempts >= MAX_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
    await authRepository.lockAccount(user.user_id, lockedUntil);
    await authRepository.writeAudit({
      userId: user.user_id, action: 'ACCOUNT_LOCKED', details: { attempts }, ...context,
    });
  }

  await authRepository.writeAudit({
    userId: user.user_id, action: 'LOGIN_FAIL', details: { attempts }, ...context,
  });
}

/* ─────────────── AUTH-01  login ─────────────── */

async function login({ username, password }, context = {}) {
  const user = await authRepository.findByUsername(username);

  // Unknown username — audit with null user, return the SAME generic error.
  if (!user) {
    await authRepository.writeAudit({
      userId: null, action: 'LOGIN_FAIL', details: { username }, ...context,
    });
    throw new UnauthorizedError('Invalid credentials');
  }

  // Gate 1: is the account currently locked? Checked BEFORE the password.
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    throw new LockedError('Account locked due to repeated failed logins. Please try again later.');
  }

  // Gate 2: password.
  const ok = await comparePassword(password, user.password_hash);
  if (!ok) {
    await handleFailedLogin(user, context);
    throw new UnauthorizedError('Invalid credentials');
  }

  // Gate 3: active check — only after identity is proven, so we leak nothing to attackers.
  if (!user.is_active) {
    throw new UnauthorizedError('Account is inactive — contact your administrator');
  }

  // Success: clear failure state, stamp last_login, open a brand-new token family.
  await authRepository.resetFailedAttempts(user.user_id);
  await authRepository.updateLastLogin(user.user_id);

  const familyId = generateFamilyId();
  const tokens = await issueSession(user, familyId, context);
  await authRepository.writeAudit({ userId: user.user_id, action: 'LOGIN_SUCCESS', ...context });

  return { ...tokens, expiresIn: accessExpiresInSeconds(), user: buildUser(user) };
}

/* ─────────────── AUTH-02  refresh (rotation + reuse detection) ─────────────── */

async function refresh(refreshToken, context = {}) {
  if (!refreshToken) throw new UnauthorizedError('Session invalid');

  const tokenHash = hashToken(refreshToken);
  const row = await authRepository.findRefreshByHash(tokenHash);
  if (!row) throw new UnauthorizedError('Session invalid');

  // THEFT TRAP: a token that was already rotated (used) or revoked is being replayed.
  // Burn the entire family — both the attacker's and the real user's sessions die.
  if (row.is_used || row.is_revoked) {
    await authRepository.revokeFamily(row.family_id);
    await authRepository.writeAudit({
      userId: row.user_id, action: 'TOKEN_REUSE_DETECTED',
      details: { family_id: row.family_id }, ...context,
    });
    throw new UnauthorizedError('Session invalid — please log in again');
  }

  if (new Date(row.expires_at) < new Date()) {
    throw new UnauthorizedError('Session expired — please log in again');
  }

  const user = await authRepository.findById(row.user_id);
  if (!user || !user.is_active) {
    await authRepository.revokeFamily(row.family_id);
    throw new UnauthorizedError('Session invalid — please log in again');
  }

  // ROTATE: retire the presented token, issue a new one in the SAME family.
  await authRepository.markRefreshUsed(row.token_id);
  const tokens = await issueSession(user, row.family_id, context);
  await authRepository.writeAudit({ userId: user.user_id, action: 'TOKEN_REFRESH', ...context });

  return { ...tokens, expiresIn: accessExpiresInSeconds(), user: buildUser(user) };
}

/* ─────────────── AUTH-03  logout ─────────────── */

async function logout(refreshToken, userId, context = {}) {
  if (refreshToken) {
    await authRepository.revokeRefreshByHash(hashToken(refreshToken));
  }
  await authRepository.writeAudit({ userId: userId ?? null, action: 'LOGOUT', ...context });
}

/* ─────────────── AUTH-04  me ─────────────── */

async function getProfile(userId) {
  const user = await authRepository.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  return buildUser(user); // password_hash is never returned
}

/* ─────────────── AUTH-05  change-password ─────────────── */

async function changePassword(userId, { currentPassword, newPassword }, context = {}) {
  const user = await authRepository.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  const ok = await comparePassword(currentPassword, user.password_hash);
  if (!ok) throw new UnauthorizedError('Current password is incorrect');

  const newHash = await hashPassword(newPassword);
  await authRepository.updatePassword(user.user_id, newHash);

  // Security: a password change kills every existing session, everywhere.
  await authRepository.revokeAllForUser(user.user_id);
  await authRepository.writeAudit({ userId: user.user_id, action: 'PASSWORD_CHANGE', ...context });
}

module.exports = { login, refresh, logout, getProfile, changePassword };