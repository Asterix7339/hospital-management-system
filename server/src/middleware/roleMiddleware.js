// server/src/middleware/roleMiddleware.js
const { ForbiddenError, UnauthorizedError } = require('../utils/errors/AppError');

/**
 * @param  {...string} allowedRoles  e.g. authorize('Admin', 'Receptionist')
 * @returns Express middleware that allows the request only if req.user.role is in the list.
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Unauthorized — authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Forbidden — insufficient role permissions'));
    }
    return next();
  };
}

module.exports = authorize;