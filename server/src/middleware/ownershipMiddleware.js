// server/src/middleware/ownershipMiddleware.js
const { ForbiddenError } = require('../utils/errors/AppError');

/**
 * Verifies the authenticated user owns the targeted resource.
 * Admins bypass the check. `loadOwnerId(req)` returns the resource's owner user_id.
 *
 * @param {(req) => Promise<number|null>} loadOwnerId
 */
function requireOwnership(loadOwnerId) {
  return async (req, res, next) => {
    try {
      if (req.user?.role === 'Admin') return next(); // Admins see everything
      const ownerId = await loadOwnerId(req);
      if (ownerId == null || ownerId !== req.user.user_id) {
        return next(new ForbiddenError('Forbidden — you do not own this resource'));
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = requireOwnership;