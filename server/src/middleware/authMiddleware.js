// server/src/middleware/authMiddleware.js
const { verifyAccessToken } = require('../config/jwt');
const { UnauthorizedError } = require('../utils/errors/AppError');

function authenticate(req, res, next) {
  const header = req.get('authorization') || '';

  if (!header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Unauthorized — token missing or invalid'));
  }

  const token = header.slice(7).trim();

  try {
    const payload = verifyAccessToken(token); // throws on bad signature OR expiry
    req.user = {
      user_id: payload.user_id,
      role_id: payload.role_id,
      role: payload.role_name,
    };
    return next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Access token expired'
      : 'Unauthorized — token missing or invalid';
    return next(new UnauthorizedError(message));
  }
}

module.exports = authenticate; // ✅ bare function — NO braces