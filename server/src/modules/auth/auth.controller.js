// server/src/modules/auth/auth.controller.js
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const authService = require('./auth.service');

const REFRESH_COOKIE = 'refreshToken';

function ctx(req) {
  return { ipAddress: req.ip, userAgent: req.get('user-agent') || null };
}

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
    maxAge: (parseInt(process.env.JWT_REFRESH_EXPIRY, 10) || 7) * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
}

// POST /auth/login
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const { refreshToken, ...result } = await authService.login({ username, password }, ctx(req));
  setRefreshCookie(res, refreshToken);
  return sendSuccess(res, 200, 'Login successful', result);
});

// POST /auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  const { refreshToken, ...result } = await authService.refresh(token, ctx(req));
  setRefreshCookie(res, refreshToken);
  return sendSuccess(res, 200, 'Token refreshed', result);
});

// POST /auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  await authService.logout(token, req.user?.user_id, ctx(req));
  clearRefreshCookie(res);
  return sendSuccess(res, 200, 'Logout successful');
});

// GET /auth/me
const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.user_id);
  return sendSuccess(res, 200, 'Profile retrieved', { user });
});

// PATCH /auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.user_id, { currentPassword, newPassword }, ctx(req));
  clearRefreshCookie(res);
  return sendSuccess(res, 200, 'Password changed successfully — please log in again');
});

module.exports = { login, refresh, logout, me, changePassword }; // ✅ object — controllers export many handlers